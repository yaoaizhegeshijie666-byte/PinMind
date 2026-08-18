import json, os, sqlite3, uuid, ipaddress, socket, re
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from urllib.error import HTTPError

ROOT=Path(__file__).parent
DB_PATH=Path(os.getenv('PINMIND_DB',ROOT/'pinmind.db'))
MODEL=os.getenv('OPENAI_MODEL','gpt-5.6-terra')
PORT=int(os.getenv('PORT','8787'))
HOST=os.getenv('HOST','127.0.0.1')


class TextExtractor(HTMLParser):
    def __init__(self): super().__init__();self.skip=0;self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style','nav','footer','noscript'):self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style','nav','footer','noscript') and self.skip:self.skip-=1
    def handle_data(self,data):
        if not self.skip and data.strip():self.parts.append(data.strip())

def safe_fetch(url):
    parsed=urlparse(url)
    if parsed.scheme not in ('http','https') or not parsed.hostname:raise ValueError('invalid_url')
    for info in socket.getaddrinfo(parsed.hostname,parsed.port or (443 if parsed.scheme=='https' else 80)):
        address=ipaddress.ip_address(info[4][0])
        if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved:raise ValueError('private_address_blocked')
    req=Request(url,headers={'User-Agent':'PinMind/0.2 (+content extraction)'})
    with urlopen(req,timeout=12) as response:
        if int(response.headers.get('Content-Length','0') or 0)>2_000_000:raise ValueError('response_too_large')
        raw=response.read(2_000_001)
        if len(raw)>2_000_000:raise ValueError('response_too_large')
        charset=response.headers.get_content_charset() or 'utf-8';html=raw.decode(charset,errors='replace')
    parser=TextExtractor();parser.feed(html);return re.sub(r'\s+',' ',' '.join(parser.parts))[:50000]

def authorized(handler):
    expected=os.getenv('PINMIND_DEVICE_TOKEN','')
    return not expected or handler.headers.get('Authorization','')==f'Bearer {expected}'

def db():
    conn=sqlite3.connect(DB_PATH)
    conn.row_factory=sqlite3.Row
    conn.executescript('''
    CREATE TABLE IF NOT EXISTS sources(id TEXT PRIMARY KEY,input_type TEXT NOT NULL,title TEXT,content TEXT,url TEXT,starred INTEGER DEFAULT 0,status TEXT DEFAULT 'ready',captured_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS knowledge(id TEXT PRIMARY KEY,digest_date TEXT NOT NULL,headline TEXT NOT NULL,sections_json TEXT NOT NULL,source_ids_json TEXT NOT NULL,topic_names_json TEXT NOT NULL,tags_json TEXT NOT NULL,state TEXT DEFAULT 'candidate',created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS digests(digest_date TEXT PRIMARY KEY,status TEXT NOT NULL,created_at TEXT NOT NULL);
    ''')
    return conn

def row_dict(row):
    result=dict(row)
    for key in ('sections_json','source_ids_json','topic_names_json','tags_json'):
        if key in result:
            result[key[:-5]]=json.loads(result.pop(key))
    return result

SCHEMA={
 'type':'object','additionalProperties':False,'required':['knowledge_items'],
 'properties':{'knowledge_items':{'type':'array','maxItems':6,'items':{
  'type':'object','additionalProperties':False,
  'required':['headline','sections','source_ids','topic_names','tags'],
  'properties':{
   'headline':{'type':'string','minLength':1},
   'sections':{'type':'array','minItems':1,'items':{'type':'object','additionalProperties':False,'required':['kind','content'],'properties':{'kind':{'type':'string'},'content':{'type':'string'}}}},
   'source_ids':{'type':'array','minItems':1,'items':{'type':'string'}},
   'topic_names':{'type':'array','items':{'type':'string'}},
   'tags':{'type':'array','items':{'type':'string'}}
  }}}}
}

def generate(items):
    key=os.getenv('OPENAI_API_KEY')
    if not key: raise RuntimeError('OPENAI_API_KEY_NOT_CONFIGURED')
    source_text='\n\n'.join(f"SOURCE_ID: {x['id']}\nTITLE: {x['title']}\nCONTENT:\n{x['content'][:12000]}" for x in items)
    prompt='''你是 PinMind 知识编辑。直接表达知识，禁止使用“文章主要讲了”等转述开头。每条围绕一个核心问题，保留条件、机制、论据、案例和边界。只能引用给定 SOURCE_ID。输出中文。\n\n'''+source_text
    payload={'model':MODEL,'reasoning':{'effort':'medium'},'input':prompt,'text':{'format':{'type':'json_schema','name':'pinmind_digest','strict':True,'schema':SCHEMA}}}
    req=Request('https://api.openai.com/v1/responses',data=json.dumps(payload).encode(),headers={'Authorization':f'Bearer {key}','Content-Type':'application/json'})
    try:
        with urlopen(req,timeout=120) as response: data=json.load(response)
    except HTTPError as exc:
        raise RuntimeError(f'OPENAI_{exc.code}: '+exc.read().decode()[:500])
    texts=[]
    for output in data.get('output',[]):
        for content in output.get('content',[]):
            if content.get('type')=='output_text': texts.append(content.get('text',''))
    if not texts: raise RuntimeError('OPENAI_EMPTY_OUTPUT')
    return json.loads(''.join(texts))

class Handler(BaseHTTPRequestHandler):
    def send_headers(self,status=200):
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Access-Control-Allow-Origin',os.getenv('PINMIND_CORS_ORIGIN','*'));self.send_header('Access-Control-Allow-Headers','Content-Type, Authorization');self.send_header('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');self.end_headers()
    def send_json(self,data,status=200):
        self.send_headers(status);self.wfile.write(json.dumps(data,ensure_ascii=False).encode())
    def body(self):
        length=int(self.headers.get('Content-Length','0'));return json.loads(self.rfile.read(length) or b'{}')
    def do_OPTIONS(self): self.send_headers(204)
    def do_GET(self):
        if self.path=='/health': return self.send_json({'ok':True,'ai_configured':bool(os.getenv('OPENAI_API_KEY')),'model':MODEL})
        if not authorized(self): return self.send_json({'error':'unauthorized'},401)
        if self.path.startswith('/api/sources'):
            with db() as conn: rows=conn.execute('SELECT * FROM sources ORDER BY captured_at DESC').fetchall()
            return self.send_json({'sources':[row_dict(x) for x in rows]})
        if self.path.startswith('/api/digests/today'):
            day=datetime.now().date().isoformat()
            with db() as conn: rows=conn.execute('SELECT * FROM knowledge WHERE digest_date=? ORDER BY created_at',(day,)).fetchall()
            return self.send_json({'digest_date':day,'knowledge_items':[row_dict(x) for x in rows]})
        self.send_json({'error':'not_found'},404)
    def do_POST(self):
        try:
            if self.path!='/api/jobs/nightly' and not authorized(self): return self.send_json({'error':'unauthorized'},401)
            if self.path=='/api/jobs/nightly':
                secret=os.getenv('PINMIND_CRON_SECRET','')
                if not secret or self.headers.get('X-Cron-Secret','')!=secret: return self.send_json({'error':'unauthorized'},401)
                self.path='/api/digests/generate'
            if self.path=='/api/sources':
                data=self.body();content=str(data.get('content','')).strip();url=data.get('url')
                if url and (not content or len(content)<500):
                    try:
                        extracted=safe_fetch(url)
                        if extracted: content=extracted
                    except Exception as exc:
                        if not content: return self.send_json({'error':'link_fetch_failed','detail':str(exc)},422)
                if not content: return self.send_json({'error':'content_or_url_required'},400)
                item={'id':'src_'+uuid.uuid4().hex[:12],'input_type':data.get('input_type','selected_text'),'title':data.get('title') or content[:60],'content':content,'url':data.get('url'),'starred':1 if data.get('starred') else 0,'status':'ready','captured_at':datetime.now().isoformat()}
                with db() as conn: conn.execute('INSERT INTO sources VALUES(:id,:input_type,:title,:content,:url,:starred,:status,:captured_at)',item)
                return self.send_json({'source':item},201)
            if self.path=='/api/digests/generate':
                day=datetime.now().date().isoformat()
                with db() as conn: sources=[dict(x) for x in conn.execute("SELECT * FROM sources WHERE status='ready' ORDER BY starred DESC,captured_at DESC LIMIT 12").fetchall()]
                if not sources:return self.send_json({'error':'no_ready_sources'},409)
                result=generate(sources)
                with db() as conn:
                    conn.execute('DELETE FROM knowledge WHERE digest_date=?',(day,))
                    for item in result['knowledge_items']:
                        conn.execute('INSERT INTO knowledge VALUES(?,?,?,?,?,?,?,?,?)',('kn_'+uuid.uuid4().hex[:12],day,item['headline'],json.dumps(item['sections'],ensure_ascii=False),json.dumps(item['source_ids']),json.dumps(item['topic_names'],ensure_ascii=False),json.dumps(item['tags'],ensure_ascii=False),'candidate',datetime.now().isoformat()))
                    conn.execute('INSERT OR REPLACE INTO digests VALUES(?,?,?)',(day,'ready',datetime.now().isoformat()))
                return self.send_json({'digest_date':day,**result})
            self.send_json({'error':'not_found'},404)
        except RuntimeError as exc:self.send_json({'error':str(exc)},503)
        except Exception as exc:self.send_json({'error':'internal_error','detail':str(exc)},500)
    def log_message(self,fmt,*args): print(fmt%args)

if __name__=='__main__':
    db().close();print(f'PinMind backend http://{HOST}:{PORT}');ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()




