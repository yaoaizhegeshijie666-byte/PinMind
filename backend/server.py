import base64, ipaddress, json, os, re, socket, uuid
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from database import connect as db

MODEL=os.getenv('OPENROUTER_MODEL','openai/gpt-4.1-mini')
PORT=int(os.getenv('PORT','8787'));HOST=os.getenv('HOST','127.0.0.1')
UTC_OFFSET_HOURS=int(os.getenv('PINMIND_UTC_OFFSET','8'))
def now_local():return datetime.now(timezone(timedelta(hours=UTC_OFFSET_HOURS)))

class TextExtractor(HTMLParser):
    def __init__(self):super().__init__();self.skip=0;self.parts=[]
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
    req=Request(url,headers={'User-Agent':'PinMind/0.6 (+content extraction)'})
    with urlopen(req,timeout=15) as response:
        if int(response.headers.get('Content-Length','0') or 0)>2_000_000:raise ValueError('response_too_large')
        raw=response.read(2_000_001)
        if len(raw)>2_000_000:raise ValueError('response_too_large')
        html=raw.decode(response.headers.get_content_charset() or 'utf-8',errors='replace')
    parser=TextExtractor();parser.feed(html)
    return re.sub(r'\s+',' ',' '.join(parser.parts))[:50000]

def authorized(handler):
    expected=os.getenv('PINMIND_DEVICE_TOKEN','')
    return not expected or handler.headers.get('Authorization','')==f'Bearer {expected}'

JSON_FIELDS=('sections_json','source_ids_json','topic_names_json','tags_json','related_knowledge_ids_json','generated_knowledge_ids_json')
def row_dict(row):
    result=dict(row)
    for key in JSON_FIELDS:
        if key in result:
            value=result.pop(key) or '[]';result[key[:-5]]=json.loads(value)
    result.pop('image_data',None)
    return result

SECTION={'type':'object','additionalProperties':False,'required':['kind','title','content','items'],'properties':{
    'kind':{'type':'string','enum':['explanation','condition','mechanism','framework','evidence','example','boundary','implication']},
    'title':{'type':'string'},'content':{'type':'string'},'items':{'type':'array','items':{'type':'string'}}}}
SCHEMA={'type':'object','additionalProperties':False,'required':['knowledge_items'],'properties':{'knowledge_items':{
    'type':'array','maxItems':6,'items':{'type':'object','additionalProperties':False,
    'required':['type','headline','sections','source_ids','related_knowledge_ids','topic_names','tags','content_completeness'],
    'properties':{'type':{'type':'string','enum':['viewpoint','method','trend','concept','case']},
    'headline':{'type':'string','minLength':1},'sections':{'type':'array','minItems':1,'items':SECTION},
    'source_ids':{'type':'array','minItems':1,'items':{'type':'string'}},
    'related_knowledge_ids':{'type':'array','items':{'type':'string'}},
    'topic_names':{'type':'array','minItems':1,'items':{'type':'string'}},
    'tags':{'type':'array','items':{'type':'string'}},
    'content_completeness':{'type':'string','enum':['complete','partial']}}}}}}

def ai_generate(sources,library):
    key=os.getenv('OPENROUTER_API_KEY')
    if not key:raise RuntimeError('OPENROUTER_API_KEY_NOT_CONFIGURED')
    instructions='''你是 PinMind 知识编辑。只处理本批次“新来源”，生成通常约五条、最多六条可复用知识，不为凑数编造。直接写观点、方法、机制、证据或案例，禁止“文章主要讲了/作者介绍了”等转述开头。保留必要的前提、条件、论据、案例和边界。每条必须引用真实 SOURCE_ID；信息不足则不要生成。截图需要理解画面文字与结构。关联只能引用给定的正式知识 ID。输出中文。'''
    blocks=[]
    for source in sources:
        text=(source.get('content') or '').strip()
        blocks.append(f"SOURCE_ID: {source['id']}\nTYPE: {source['input_type']}\nTITLE: {source.get('title') or ''}\nCOMPLETENESS: {source.get('completeness') or 'complete'}\nTEXT:\n{text[:14000]}")
    related='\n'.join(f"{x['id']}: {x['headline']}" for x in library) or '无'
    content=[{'type':'text','text':instructions+'\n\n新来源：\n'+'\n\n'.join(blocks)+'\n\n可关联的正式知识：\n'+related}]
    for source in sources:
        image=source.get('image_data')
        if image:
            mime=source.get('content_mime') or 'image/jpeg'
            content.extend([{'type':'text','text':f"以下图片属于 SOURCE_ID: {source['id']}"},{'type':'image_url','image_url':{'url':f'data:{mime};base64,{image}'}}])
    payload={'model':MODEL,'messages':[{'role':'user','content':content}],
             'response_format':{'type':'json_schema','json_schema':{'name':'pinmind_digest','strict':True,'schema':SCHEMA}}}
    headers={'Authorization':f'Bearer {key}','Content-Type':'application/json','HTTP-Referer':'https://github.com/yaoaizhegeshijie666-byte/PinMind','X-Title':'PinMind'}
    req=Request('https://openrouter.ai/api/v1/chat/completions',data=json.dumps(payload).encode(),headers=headers)
    try:
        with urlopen(req,timeout=180) as response:data=json.load(response)
    except HTTPError as exc:raise RuntimeError(f'OPENROUTER_{exc.code}: '+exc.read().decode()[:500])
    choices=data.get('choices',[]);output=choices[0].get('message',{}).get('content','') if choices else ''
    if isinstance(output,list):output=''.join(part.get('text','') for part in output if isinstance(part,dict))
    if not output:raise RuntimeError('OPENROUTER_EMPTY_OUTPUT')
    return json.loads(output)

def validate_items(result,sources,library):
    source_ids={x['id'] for x in sources};library_ids={x['id'] for x in library};valid=[]
    for item in result.get('knowledge_items',[]):
        refs=[x for x in item.get('source_ids',[]) if x in source_ids]
        sections=[x for x in item.get('sections',[]) if (x.get('content') or x.get('items'))]
        if not item.get('headline') or not refs or not sections:continue
        item['source_ids']=refs;item['sections']=sections
        item['related_knowledge_ids']=[x for x in item.get('related_knowledge_ids',[]) if x in library_ids]
        valid.append(item)
    return valid[:6]

class Handler(BaseHTTPRequestHandler):
    def send_headers(self,status=200):
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin',os.getenv('PINMIND_CORS_ORIGIN','*'))
        self.send_header('Access-Control-Allow-Headers','Content-Type, Authorization');self.send_header('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');self.end_headers()
    def send_json(self,data,status=200):self.send_headers(status);self.wfile.write(json.dumps(data,ensure_ascii=False).encode())
    def body(self):
        length=int(self.headers.get('Content-Length','0'))
        if length>9_000_000:raise ValueError('request_too_large')
        return json.loads(self.rfile.read(length) or b'{}')
    def do_OPTIONS(self):self.send_headers(204)
    def do_GET(self):
        if self.path=='/health':return self.send_json({'ok':True,'ai_configured':bool(os.getenv('OPENROUTER_API_KEY')),'provider':'openrouter','model':MODEL})
        if not authorized(self):return self.send_json({'error':'unauthorized'},401)
        if self.path.startswith('/api/sources'):
            with db() as conn:rows=conn.execute('SELECT * FROM sources ORDER BY captured_at DESC').fetchall()
            return self.send_json({'sources':[row_dict(x) for x in rows]})
        if self.path.startswith('/api/digests/today'):
            day=now_local().date().isoformat()
            with db() as conn:rows=conn.execute('SELECT * FROM knowledge WHERE digest_date=? ORDER BY created_at',(day,)).fetchall()
            return self.send_json({'digest_date':day,'knowledge_items':[row_dict(x) for x in rows]})
        self.send_json({'error':'not_found'},404)
    def do_POST(self):
        try:
            if self.path!='/api/jobs/nightly' and not authorized(self):return self.send_json({'error':'unauthorized'},401)
            if self.path=='/api/jobs/nightly':
                secret=os.getenv('PINMIND_CRON_SECRET','')
                if not secret or self.headers.get('X-Cron-Secret','')!=secret:return self.send_json({'error':'unauthorized'},401)
                self.path='/api/digests/generate'
            if self.path=='/api/sources':return self.capture_source()
            if self.path=='/api/digests/generate':return self.generate_digest()
            self.send_json({'error':'not_found'},404)
        except ValueError as exc:self.send_json({'error':str(exc)},400)
        except RuntimeError as exc:self.send_json({'error':str(exc)},503)
        except Exception as exc:self.send_json({'error':'internal_error','detail':str(exc)},500)
    def capture_source(self):
        data=self.body();url=str(data.get('url') or '').strip() or None;content=str(data.get('content') or '').strip()
        input_type=str(data.get('input_type') or 'selected_text');image=str(data.get('image_data') or '')
        if input_type in ('shared_link','link') or url:input_type='link_with_text' if content and content!=url and len(content)>80 else 'link'
        if image:
            try:
                if len(base64.b64decode(image,validate=True))>6_000_000:raise ValueError('image_too_large')
            except Exception:raise ValueError('invalid_image_data')
            input_type='screenshot'
        if url:
            with db() as conn:existing=conn.execute('SELECT * FROM sources WHERE url=? ORDER BY captured_at DESC LIMIT 1',(url,)).fetchone()
            if existing:
                with db() as conn:conn.execute('UPDATE sources SET captured_at=?,starred=? WHERE id=?',(now_local().isoformat(),1 if data.get('starred') or existing['starred'] else 0,existing['id']))
                return self.send_json({'source':row_dict(existing),'duplicate':True})
        completeness='complete';parse_status='success';status='ready'
        if url and (not content or content==url or len(content)<500):
            try:content=safe_fetch(url)
            except Exception:content=''
        if not content and not image:
            completeness='needs_input';parse_status='failed';status='needs_input'
        elif len(content)<120 and not image:completeness='partial'
        item={'id':'src_'+uuid.uuid4().hex[:12],'input_type':input_type,'title':data.get('title') or (content[:60] if content else '截图来源'),
              'content':content,'url':url,'starred':1 if data.get('starred') else 0,'status':status,'captured_at':now_local().isoformat(),
              'content_mime':data.get('content_mime'),'image_data':image or None,'completeness':completeness,'parse_status':parse_status}
        with db() as conn:conn.execute('''INSERT INTO sources(id,input_type,title,content,url,starred,status,captured_at,content_mime,image_data,completeness,parse_status,generated_at,generated_knowledge_ids_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NULL,'[]')''',tuple(item[k] for k in ('id','input_type','title','content','url','starred','status','captured_at','content_mime','image_data','completeness','parse_status')))
        return self.send_json({'source':row_dict(item)},201)
    def generate_digest(self):
        day=now_local().date().isoformat()
        with db() as conn:
            sources=[dict(x) for x in conn.execute("SELECT * FROM sources WHERE generated_at IS NULL AND status='ready' AND parse_status='success' ORDER BY starred DESC,captured_at ASC LIMIT 12").fetchall()]
            library=[dict(x) for x in conn.execute("SELECT id,headline FROM knowledge WHERE state='collected' ORDER BY created_at DESC LIMIT 30").fetchall()]
        if not sources:return self.send_json({'error':'no_new_ready_sources'},409)
        items=validate_items(ai_generate(sources,library),sources,library)
        if not items:return self.send_json({'error':'no_supported_knowledge'},422)
        created=now_local().isoformat();knowledge_ids=[];by_source={x['id']:[] for x in sources}
        with db() as conn:
            conn.execute('DELETE FROM knowledge WHERE digest_date=? AND state IN (?,?)',(day,'candidate','selected'))
            for item in items:
                knowledge_id='kn_'+uuid.uuid4().hex[:12];knowledge_ids.append(knowledge_id)
                for source_id in item['source_ids']:by_source[source_id].append(knowledge_id)
                conn.execute('''INSERT INTO knowledge(id,digest_date,headline,sections_json,source_ids_json,topic_names_json,tags_json,state,created_at,type,related_knowledge_ids_json,content_completeness) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''',
                    (knowledge_id,day,item['headline'],json.dumps(item['sections'],ensure_ascii=False),json.dumps(item['source_ids']),json.dumps(item['topic_names'],ensure_ascii=False),json.dumps(item['tags'],ensure_ascii=False),'candidate',created,item['type'],json.dumps(item['related_knowledge_ids']),item['content_completeness']))
            for source in sources:
                conn.execute("UPDATE sources SET generated_at=?,status='generated',generated_knowledge_ids_json=?,image_data=NULL WHERE id=?",(created,json.dumps(by_source[source['id']]),source['id']))
            conn.upsert_digest(day,'ready',created,json.dumps([x['id'] for x in sources]))
        return self.send_json({'digest_date':day,'knowledge_items':items,'source_ids':[x['id'] for x in sources],'generated_count':len(items)})
    def log_message(self,fmt,*args):print(fmt%args)

if __name__=='__main__':
    db().close();print(f'PinMind backend http://{HOST}:{PORT}');ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
