import base64, ipaddress, json, mimetypes, os, re, socket, uuid
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from database import connect as db

MODEL=os.getenv('OPENROUTER_MODEL','openai/gpt-4.1-mini')
WEB_ROOT=Path(os.getenv('PINMIND_WEB_ROOT',Path(__file__).resolve().parent.parent)).resolve()
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

def fetch_text(url,user_agent):
    req=Request(url,headers={'User-Agent':user_agent,'Accept':'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9'})
    with urlopen(req,timeout=25) as response:
        if int(response.headers.get('Content-Length','0') or 0)>2_000_000:raise ValueError('response_too_large')
        raw=response.read(2_000_001)
        if len(raw)>2_000_000:raise ValueError('response_too_large')
        content=raw.decode(response.headers.get_content_charset() or 'utf-8',errors='replace')
    parser=TextExtractor();parser.feed(content)
    return re.sub(r'\s+',' ',' '.join(parser.parts))[:50000]

def safe_fetch(url):
    parsed=urlparse(url)
    if parsed.scheme not in ('http','https') or not parsed.hostname:raise ValueError('invalid_url')
    for info in socket.getaddrinfo(parsed.hostname,parsed.port or (443 if parsed.scheme=='https' else 80)):
        address=ipaddress.ip_address(info[4][0])
        if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved:raise ValueError('private_address_blocked')
    blocked=('环境异常','需要验证','去验证','requiring CAPTCHA','Weixin Official Accounts Platform')
    browser='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36'
    try:direct=fetch_text(url,browser)
    except Exception:direct=''
    if len(direct)>=300 and not any(word in direct for word in blocked):return direct
    reader='https://r.jina.ai/http://'+parsed.netloc+parsed.path+('?' + parsed.query if parsed.query else '')
    try:fallback=fetch_text(reader,'PinMind/0.6.4')
    except Exception:fallback=''
    if len(fallback)>=300 and not any(word in fallback for word in blocked):return fallback
    return ''

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

SECTION={'type':'object','additionalProperties':False,'required':['kind','level','title','content','items'],'properties':{
    'kind':{'type':'string','enum':['overview','explanation','condition','mechanism','framework','evidence','example','boundary','implication']},
    'level':{'type':'integer','minimum':0,'maximum':3},'title':{'type':'string'},
    'content':{'type':'string'},'items':{'type':'array','items':{'type':'string'}}}}
SCHEMA={'type':'object','additionalProperties':False,'required':['knowledge_items'],'properties':{'knowledge_items':{
    'type':'array','maxItems':32,'items':{'type':'object','additionalProperties':False,
    'required':['type','headline','graph_label','sections','source_ids','related_knowledge_ids','topic_names','tags','content_completeness'],
    'properties':{'type':{'type':'string','enum':['viewpoint','method','trend','concept','case']},
    'headline':{'type':'string','minLength':1},'graph_label':{'type':'string','minLength':2,'maxLength':10},'sections':{'type':'array','minItems':2,'maxItems':24,'items':SECTION},
    'source_ids':{'type':'array','minItems':1,'items':{'type':'string'}},
    'related_knowledge_ids':{'type':'array','items':{'type':'string'}},
    'topic_names':{'type':'array','minItems':1,'items':{'type':'string'}},
    'tags':{'type':'array','items':{'type':'string'}},
    'content_completeness':{'type':'string','enum':['complete','partial']}}}}}}

OUTLINE_SECTION={'type':'object','additionalProperties':False,'required':['level','title','central_idea'],'properties':{
    'level':{'type':'integer','minimum':1,'maximum':3},'title':{'type':'string'},'central_idea':{'type':'string'}}}
OUTLINE_SCHEMA={'type':'object','additionalProperties':False,'required':['documents'],'properties':{'documents':{
    'type':'array','maxItems':20,'items':{'type':'object','additionalProperties':False,
    'required':['source_id','document_title','overview','outline','content_completeness'],'properties':{
    'source_id':{'type':'string'},'document_title':{'type':'string'},'overview':{'type':'string'},
    'outline':{'type':'array','minItems':1,'maxItems':24,'items':OUTLINE_SECTION},
    'content_completeness':{'type':'string','enum':['complete','partial']}}}}}}

def openrouter_json(key,schema,name,content):
    payload={'model':MODEL,'messages':[{'role':'user','content':content}],
             'response_format':{'type':'json_schema','json_schema':{'name':name,'strict':True,'schema':schema}}}
    headers={'Authorization':f'Bearer {key}','Content-Type':'application/json','HTTP-Referer':'https://github.com/yaoaizhegeshijie666-byte/PinMind','X-Title':'PinMind'}
    req=Request('https://openrouter.ai/api/v1/chat/completions',data=json.dumps(payload).encode(),headers=headers)
    try:
        with urlopen(req,timeout=180) as response:data=json.load(response)
    except HTTPError as exc:raise RuntimeError(f'OPENROUTER_{exc.code}: '+exc.read().decode()[:500])
    choices=data.get('choices',[]);output=choices[0].get('message',{}).get('content','') if choices else ''
    if isinstance(output,list):output=''.join(part.get('text','') for part in output if isinstance(part,dict))
    if not output:raise RuntimeError('OPENROUTER_EMPTY_OUTPUT')
    return json.loads(output)

def ai_generate(sources,library):
    key=os.getenv('OPENROUTER_API_KEY')
    if not key:raise RuntimeError('OPENROUTER_API_KEY_NOT_CONFIGURED')
    blocks=[];per_source=max(2500,min(30000,90000//max(1,len(sources))))
    for source in sources:
        body=(source.get('content') or '').strip()
        blocks.append(f"SOURCE_ID: {source['id']}\nTYPE: {source['input_type']}\nTITLE: {source.get('title') or ''}\nCOMPLETENESS: {source.get('completeness') or 'complete'}\nTEXT:\n{body[:per_source]}")
    source_text='\n\n'.join(blocks)
    outline_prompt="""你是学习笔记的结构编辑。先识别每份来源的真实知识骨架，不写摘要，不跨来源合并。
对每个 SOURCE_ID：保留有信息意义的原文主标题和副标题；原文没有标题时，根据论证关系谨慎还原层级。
overview 用一句话列出理解全文所需的主要维度，例如“从用户、商家、平台和基础设施四个层面理解”。
outline 按阅读顺序输出，level=1/2/3 对应 Markdown 的二至四级标题。每个 central_idea 必须说明本节中心思想，避免“需要重视、非常重要”等空话。
不能确认完整结构时标记 partial，不得补充原文没有的章节。输出中文并严格遵守 JSON Schema。\n\n来源：\n"""
    outline_content=[{'type':'text','text':outline_prompt+source_text}]
    for source in sources:
        image=source.get('image_data')
        if image:
            mime=source.get('content_mime') or 'image/jpeg'
            outline_content.extend([{'type':'text','text':f"以下图片属于 SOURCE_ID: {source['id']}"},{'type':'image_url','image_url':{'url':f'data:{mime};base64,{image}'}}])
    outlines=openrouter_json(key,OUTLINE_SCHEMA,'pinmind_outline',outline_content)
    outlined={x.get('source_id') for x in outlines.get('documents',[])}
    for source in sources:
        if source['id'] in outlined:continue
        body=(source.get('content') or '').strip()
        outlines.setdefault('documents',[]).append({'source_id':source['id'],'document_title':source.get('title') or '结构化知识笔记','overview':'该来源内容不完整，仅整理当前可以确认的信息。','outline':[{'level':1,'title':'可确认的核心内容','central_idea':body[:300] or '图片内容需要结合原始来源复核。'}],'content_completeness':'partial'})
    instructions="""你是制作“学霸复习笔记”的知识编辑。根据已经识别的文章骨架提炼知识，不是概括文章讲了什么。

成功标准：
- 用户先扫标题层级就能恢复全文结构，再展开标题复习重点。
- 每份有有效信息的 SOURCE_ID 至少出现在一张卡片中；低密度来源只生成一张，信息密度高且包含多个独立主题时才拆成多张。数量不得固定为三条、五条或其他目标值。
- 每张卡第一节必须是 kind=overview、level=0，title=“知识骨架”，content 给出统领全文的维度，items 按顺序列出一级主题。
- 后续 sections 严格沿用给定 OUTLINE 的顺序与层级。level=1/2/3 对应主标题、副标题和更深标题；标题优先复用原文。
- 每节 content 用一两句话写清中心思想；items 只保留帮助复习的观点、事实、数字、机制、步骤、案例、条件或反例。
- 不把局部细节提升为全文结论，不把具体内容压缩成“很重要、要重视、保证质量”等空泛表达。
- 每个事实必须来自原始来源；内容不完整时标记 partial；不得编造缺失部分。
- headline 是整张笔记的主题，不使用夸张的单一结论替代文章框架。
- graph_label 是知识图谱节点名：提炼 2—8 个汉字的领域或核心概念关键词（如“直播电商”“AI产品评测”），不得复制长标题，不写完整句子。
- 相同信息只保留一次。关联只能引用给定知识 ID。输出中文并严格遵守 JSON Schema。"""
    related='\n'.join(f"{x['id']}: {x['headline']}" for x in library) or '无'
    content=[{'type':'text','text':instructions+'\n\n文章骨架：\n'+json.dumps(outlines,ensure_ascii=False)+'\n\n原始来源：\n'+source_text+'\n\n可关联知识：\n'+related}]
    for source in sources:
        image=source.get('image_data')
        if image:
            mime=source.get('content_mime') or 'image/jpeg'
            content.extend([{'type':'text','text':f"以下图片属于 SOURCE_ID: {source['id']}"},{'type':'image_url','image_url':{'url':f'data:{mime};base64,{image}'}}])
    result=openrouter_json(key,SCHEMA,'pinmind_digest',content)
    covered={source_id for item in result.get('knowledge_items',[]) for source_id in item.get('source_ids',[])}
    for document in outlines.get('documents',[]):
        source_id=document.get('source_id')
        if not source_id or source_id in covered:continue
        outline=document.get('outline',[])
        sections=[{'kind':'overview','level':0,'title':'知识骨架','content':document.get('overview',''),'items':[x.get('title','') for x in outline if x.get('level')==1 and x.get('title')]}]
        sections.extend({'kind':'explanation','level':x.get('level',1),'title':x.get('title','知识要点'),'content':x.get('central_idea',''),'items':[]} for x in outline)
        result.setdefault('knowledge_items',[]).append({'type':'concept','headline':document.get('document_title') or '结构化知识笔记','graph_label':(document.get('document_title') or '知识笔记')[:8],'sections':sections,'source_ids':[source_id],'related_knowledge_ids':[],'topic_names':['未分类'],'tags':[],'content_completeness':document.get('content_completeness','partial')})
    return result

def validate_items(result,sources,library):
    source_ids={x['id'] for x in sources};library_ids={x['id'] for x in library};valid=[]
    for item in result.get('knowledge_items',[]):
        refs=[x for x in item.get('source_ids',[]) if x in source_ids]
        sections=[x for x in item.get('sections',[]) if (x.get('content') or x.get('items'))]
        if not item.get('headline') or not refs or not sections:continue
        label=(item.get('graph_label') or (item.get('topic_names') or ['知识']) [0]).strip()
        item['graph_label']=label[:10] or '知识'
        for section in sections:section['level']=max(0,min(3,int(section.get('level',1))))
        item['source_ids']=refs;item['sections']=sections
        item['related_knowledge_ids']=[x for x in item.get('related_knowledge_ids',[]) if x in library_ids]
        valid.append(item)
    covered={source_id for item in valid for source_id in item['source_ids']}
    if covered!=source_ids:raise RuntimeError('AI_SOURCE_COVERAGE_INCOMPLETE')
    return valid[:32]

class Handler(BaseHTTPRequestHandler):
    def send_headers(self,status=200):
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin',os.getenv('PINMIND_CORS_ORIGIN','*'))
        self.send_header('Access-Control-Allow-Headers','Content-Type, Authorization, X-PinMind-Client');self.send_header('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');self.end_headers()
    def send_json(self,data,status=200):self.send_headers(status);self.wfile.write(json.dumps(data,ensure_ascii=False).encode())
    def send_static(self):
        route=self.path.split('?',1)[0];relative='index.html' if route in ('/','/demo') else route.lstrip('/');target=(WEB_ROOT/relative).resolve()
        if WEB_ROOT not in target.parents or not target.is_file():return False
        content=target.read_bytes();self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(target.name)[0] or 'application/octet-stream');self.send_header('Content-Length',str(len(content)));self.send_header('Cache-Control','no-cache');self.end_headers();self.wfile.write(content);return True
    def body(self):
        length=int(self.headers.get('Content-Length','0'))
        if length>9_000_000:raise ValueError('request_too_large')
        return json.loads(self.rfile.read(length) or b'{}')
    def client_id(self):
        value=self.headers.get('X-PinMind-Client','').strip()
        return value[:96] if value else 'anonymous'
    def do_OPTIONS(self):self.send_headers(204)
    def do_GET(self):
        if self.path.split('?',1)[0] in ('/','/demo','/index.html','/styles.css','/pages.css','/api-client.js','/knowledge-state.js','/app.js','/pages.js','/demo-data.js') and self.send_static():return
        if self.path=='/health':return self.send_json({'ok':True,'ai_configured':bool(os.getenv('OPENROUTER_API_KEY')),'provider':'openrouter','model':MODEL})
        if not authorized(self):return self.send_json({'error':'unauthorized'},401)
        if self.path.startswith('/api/sources'):
            with db() as conn:rows=conn.execute('SELECT * FROM sources WHERE owner_id=? ORDER BY captured_at DESC',(self.client_id(),)).fetchall()
            return self.send_json({'sources':[row_dict(x) for x in rows]})
        if self.path.startswith('/api/digests/history'):
            day=now_local().date().isoformat()
            with db() as conn:rows=conn.execute("SELECT * FROM knowledge WHERE owner_id=? AND digest_date<? AND state IN (?,?) ORDER BY digest_date DESC,created_at",(self.client_id(),day,'candidate','selected')).fetchall()
            grouped={}
            for row in rows:grouped.setdefault(row['digest_date'],[]).append(row_dict(row))
            return self.send_json({'digests':[{'digest_date':date,'knowledge_items':items} for date,items in grouped.items()]})
        if self.path.startswith('/api/digests/today'):
            day=now_local().date().isoformat()
            with db() as conn:rows=conn.execute('SELECT * FROM knowledge WHERE owner_id=? AND digest_date=? ORDER BY created_at',(self.client_id(),day)).fetchall()
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
        existing_id=None
        if url:
            with db() as conn:existing=conn.execute('SELECT * FROM sources WHERE owner_id=? AND url=? ORDER BY captured_at DESC LIMIT 1',(self.client_id(),url)).fetchone()
            if existing and existing['parse_status']=='success' and existing['content']:
                with db() as conn:conn.execute('UPDATE sources SET captured_at=?,starred=? WHERE id=?',(now_local().isoformat(),1 if data.get('starred') or existing['starred'] else 0,existing['id']))
                return self.send_json({'source':row_dict(existing),'duplicate':True})
            if existing:existing_id=existing['id']
        completeness='complete';parse_status='success';status='ready'
        if url and (not content or content==url or len(content)<500):
            try:content=safe_fetch(url)
            except Exception:content=''
        if not content and not image:
            completeness='needs_input';parse_status='failed';status='needs_input'
        elif len(content)<120 and not image:completeness='partial'
        item={'id':existing_id or 'src_'+uuid.uuid4().hex[:12],'input_type':input_type,'title':data.get('title') or (content[:60] if content else '截图来源'),
              'content':content,'url':url,'starred':1 if data.get('starred') else 0,'status':status,'captured_at':now_local().isoformat(),
              'content_mime':data.get('content_mime'),'image_data':image or None,'completeness':completeness,'parse_status':parse_status,'owner_id':self.client_id()}
        with db() as conn:
            values=tuple(item[k] for k in ('input_type','title','content','url','starred','status','captured_at','content_mime','image_data','completeness','parse_status','owner_id'))
            if existing_id:conn.execute("UPDATE sources SET input_type=?,title=?,content=?,url=?,starred=?,status=?,captured_at=?,content_mime=?,image_data=?,completeness=?,parse_status=?,owner_id=?,generated_at=NULL,generated_knowledge_ids_json='[]' WHERE id=?",values+(existing_id,))
            else:conn.execute('''INSERT INTO sources(id,input_type,title,content,url,starred,status,captured_at,content_mime,image_data,completeness,parse_status,generated_at,generated_knowledge_ids_json,owner_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NULL,'[]',?)''',(item['id'],)+values)
        return self.send_json({'source':row_dict(item),'retried':bool(existing_id)},200 if existing_id else 201)
    def generate_digest(self):
        day=now_local().date().isoformat()
        with db() as conn:
            sources=[dict(x) for x in conn.execute("SELECT * FROM sources WHERE owner_id=? AND generated_at IS NULL AND status='ready' AND parse_status='success' ORDER BY starred DESC,captured_at ASC LIMIT 20",(self.client_id(),)).fetchall()]
            library=[dict(x) for x in conn.execute("SELECT id,headline FROM knowledge WHERE owner_id=? AND state='collected' ORDER BY created_at DESC LIMIT 30",(self.client_id(),)).fetchall()]
        if not sources:return self.send_json({'error':'no_new_ready_sources'},409)
        items=validate_items(ai_generate(sources,library),sources,library)
        if not items:return self.send_json({'error':'no_supported_knowledge'},422)
        created=now_local().isoformat();knowledge_ids=[];by_source={x['id']:[] for x in sources}
        with db() as conn:
            conn.execute('DELETE FROM knowledge WHERE owner_id=? AND digest_date=? AND state IN (?,?)',(self.client_id(),day,'candidate','selected'))
            for item in items:
                knowledge_id='kn_'+uuid.uuid4().hex[:12];knowledge_ids.append(knowledge_id)
                for source_id in item['source_ids']:by_source[source_id].append(knowledge_id)
                conn.execute('''INSERT INTO knowledge(id,digest_date,headline,graph_label,sections_json,source_ids_json,topic_names_json,tags_json,state,created_at,type,related_knowledge_ids_json,content_completeness,owner_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                    (knowledge_id,day,item['headline'],item['graph_label'],json.dumps(item['sections'],ensure_ascii=False),json.dumps(item['source_ids']),json.dumps(item['topic_names'],ensure_ascii=False),json.dumps(item['tags'],ensure_ascii=False),'candidate',created,item['type'],json.dumps(item['related_knowledge_ids']),item['content_completeness'],self.client_id()))
            for source in sources:
                conn.execute("UPDATE sources SET generated_at=?,status='generated',generated_knowledge_ids_json=?,image_data=NULL WHERE id=?",(created,json.dumps(by_source[source['id']]),source['id']))
            conn.upsert_digest(day,'ready',created,json.dumps([x['id'] for x in sources]))
        return self.send_json({'digest_date':day,'knowledge_items':items,'source_ids':[x['id'] for x in sources],'generated_count':len(items)})
    def log_message(self,fmt,*args):print(fmt%args)

if __name__=='__main__':
    db().close();print(f'PinMind backend http://{HOST}:{PORT}');ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
