const PinMindAPI={
  get clientId(){let id=localStorage.getItem('pinmind.clientId');if(!id){id='client_'+(crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));localStorage.setItem('pinmind.clientId',id)}window.PinMindNative?.setClientId?.(id);return id},
  get base(){return (localStorage.getItem('pinmind.apiBase')||'https://pinmind-api.onrender.com').replace(/\/$/,'')},
  async request(path,options={}){if(!this.base)throw new Error('BACKEND_NOT_CONFIGURED');const response=await fetch(this.base+path,{...options,headers:{'Content-Type':'application/json','X-PinMind-Client':this.clientId,...(options.headers||{})}});const data=await response.json();if(!response.ok)throw new Error(data.error||`HTTP_${response.status}`);return data},
  health(){return this.request('/health')},
  sources(){return this.request('/api/sources').then(data=>({...data,sources:(data.sources||[]).filter(item=>item.owner_id===this.clientId)}))},
  today(){return this.request('/api/digests/today').then(data=>({...data,knowledge_items:(data.knowledge_items||[]).filter(item=>item.owner_id===this.clientId)}))},
  history(){return this.request('/api/digests/history').then(data=>({...data,digests:(data.digests||[]).map(digest=>({...digest,knowledge_items:(digest.knowledge_items||[]).filter(item=>item.owner_id===this.clientId)})).filter(digest=>digest.knowledge_items.length)}))},
  capture(item){return this.request('/api/sources',{method:'POST',body:JSON.stringify(item)})},
  generate(){return this.request('/api/digests/generate',{method:'POST',body:'{}'})}
};
async function syncNativeCaptures(){
  if(!PinMindAPI.base||!window.PinMindNative?.getCaptures)return;
  let captures=[];try{captures=JSON.parse(window.PinMindNative.getCaptures()||'[]')}catch{return}
  let synced=0;for(const item of captures){try{await PinMindAPI.capture(item);synced++}catch(error){console.warn('PinMind capture sync deferred',error.message);break}}
  if(synced===captures.length&&captures.length){window.PinMindNative.clearCaptures();window.dispatchEvent(new CustomEvent('pinmind:sources-updated'));}
  return synced;
}
function mapKnowledgeItems(items,sourceList=[]){
  const sources=new Map(sourceList.map(source=>[source.id,source])),tones=['orange','blue','mint'];
  return (items||[]).map((item,index)=>{const source=sources.get(item.source_ids?.[0]),sections=item.sections||[],framework=sections.find(section=>section.items?.length)||sections.find(section=>section.title),points=sections.flatMap(section=>section.items||[]);return {id:item.id,tone:tones[index%tones.length],type:item.type,topic:item.topic_names?.[0]||'未分类',headline:item.headline,graphLabel:item.graph_label||'',sections:sections.map(section=>({kind:section.kind,level:Number.isFinite(section.level)?section.level:1,title:section.title,content:section.content,items:section.items||[]})),paragraphs:sections.map(section=>section.content).filter(Boolean),title:framework?.title||'核心内容',points:points.length?points:(item.tags||[]),tags:item.tags||[],sourceIds:item.source_ids||[],completeness:item.content_completeness||'complete',source:source?.title||'原始来源',url:source?.url||'#'};});
}
window.mapKnowledgeItems=mapKnowledgeItems;async function loadLiveDigest(){
  if(!PinMindAPI.base||!window.renderKnowledgeItems)return;
  try{
    const [data,sourceData]=await Promise.all([PinMindAPI.today(),PinMindAPI.sources().catch(()=>({sources:[]}))]);
    if(window.viewingToday===false)return;
    const now=new Date(),current=window.PinMindSchedule?.isCurrentScheduledDigest(data,now);if(!current){if(!window.dailyTimeReached?.(now))window.showDigestWaiting?.();else window.showDigestState?.('今天没有可生成的知识','本次生成时间前没有新增的有效链接、文字或截图。');return;}if(!data.knowledge_items?.length){window.showDigestState?.('今天没有可生成的知识','本次生成时间前没有新增的有效链接、文字或截图。');return;}
    const liveItems=mapKnowledgeItems(data.knowledge_items,sourceData.sources||[]);
    window.renderKnowledgeItems(liveItems,data.digest_date);
    const intro=document.querySelector('.intro p');if(intro)intro.textContent='从你今天捕捉的内容中，PinMind 整理了 '+liveItems.length+' 条值得留下的知识。';
    const date=new Date(`${data.digest_date}T00:00:00+08:00`),weekdays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    document.querySelector('.date').textContent=`${date.getMonth()+1}月${date.getDate()}日 · ${weekdays[date.getDay()]}`;
    window.applyReadState?.();
    window.dispatchEvent(new CustomEvent('pinmind:digest-loaded',{detail:{items:liveItems,date:data.digest_date}}));
  }catch(error){console.warn('PinMind digest offline',error.message);window.showDigestState?.('今日知识加载失败','请检查网络或稍后重新打开 PinMind。')}
}
window.loadLiveDigest=loadLiveDigest;
let digestRefreshActive=false;
async function refreshDailyDigest(){
  if(digestRefreshActive)return;if(!window.dailyTimeReached?.()){window.showDigestWaiting?.();return;}digestRefreshActive=true;
  window.showDigestState?.('正在整理今日知识','正在读取上次生成后新增的链接、文字和截图。');
  try{await PinMindAPI.generate()}catch(error){if(!['no_new_ready_sources','no_supported_knowledge'].includes(error.message))console.warn('PinMind generation deferred',error.message)}
  await loadLiveDigest();localStorage.setItem('pinmind.lastDigestRun',window.PinMindSchedule?.scheduleRunKey(new Date())||'');digestRefreshActive=false;
}
window.refreshDailyDigest=refreshDailyDigest;
const clipboardUrl=text=>String(text||'').match(/https?:\/\/[^\s]+/i)?.[0]?.replace(/[，。；、）】》]+$/,'')||'';
async function clipboardText(){if(window.PinMindNative?.getClipboardText)return window.PinMindNative.getClipboardText();try{return await navigator.clipboard.readText()}catch{return''}}
function showClipboardPrompt(url){
  document.querySelector('.clipboard-prompt')?.remove();const prompt=document.createElement('aside');prompt.className='clipboard-prompt';prompt.innerHTML='<strong>检测到文章链接</strong><small></small><div class="clipboard-actions"><button class="dismiss-clipboard">暂不保存</button><button class="save-clipboard">保存到 PinMind</button></div>';prompt.querySelector('small').textContent=url;document.body.appendChild(prompt);
  prompt.querySelector('.dismiss-clipboard').addEventListener('click',()=>{localStorage.setItem('pinmind.lastClipboardLink',url);prompt.remove();});
  prompt.querySelector('.save-clipboard').addEventListener('click',async event=>{const button=event.currentTarget;button.disabled=true;button.textContent='正在保存…';try{await PinMindAPI.capture({input_type:'shared_link',title:'剪贴板文章链接',content:url,url});localStorage.setItem('pinmind.lastClipboardLink',url);button.textContent='✓ 已保存';window.dispatchEvent(new CustomEvent('pinmind:sources-updated'));setTimeout(()=>prompt.remove(),700)}catch(error){button.disabled=false;button.textContent='保存失败，重试';}});
}
async function checkClipboardLink(force=false){if(!force&&!window.PinMindNative?.getClipboardText)return;const url=clipboardUrl(await clipboardText());if(!url){if(force){const button=document.querySelector('#pasteLinkButton');if(button){button.textContent='剪贴板中没有链接';setTimeout(()=>button.textContent='粘贴链接',1200)}}return;}if(!force&&localStorage.getItem('pinmind.lastClipboardLink')===url)return;showClipboardPrompt(url);}
window.checkClipboardLink=checkClipboardLink;
const MAX_SCREENSHOT_BYTES=6_000_000;
function screenshotBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');reader.onerror=()=>reject(new Error('image_read_failed'));reader.readAsDataURL(file);});}
function screenshotButtonState(text,disabled=false){const button=document.querySelector('#uploadScreenshotButton');if(!button)return;button.textContent=text;button.disabled=disabled;}
function resetScreenshotButton(delay=0){setTimeout(()=>screenshotButtonState('上传截图'),delay);}
async function uploadScreenshot(file){
  if(!file)return;
  if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){screenshotButtonState('仅支持 JPG/PNG/WebP');resetScreenshotButton(1800);return;}
  if(file.size>MAX_SCREENSHOT_BYTES){screenshotButtonState('图片需小于 6 MB');resetScreenshotButton(1800);return;}
  screenshotButtonState('正在上传…',true);
  try{
    const imageData=await screenshotBase64(file),title=(file.name||'截图来源').replace(/\.[^.]+$/,'')||'截图来源';
    if(!imageData)throw new Error('image_read_failed');
    await PinMindAPI.capture({input_type:'screenshot',title,content:'',image_data:imageData,content_mime:file.type});
    window.dispatchEvent(new CustomEvent('pinmind:sources-updated'));
    screenshotButtonState('正在识别…',true);
    try{await PinMindAPI.generate();await loadLiveDigest();screenshotButtonState('✓ 已生成',true);}
    catch(error){console.warn('PinMind screenshot saved; generation deferred',error.message);screenshotButtonState('✓ 已上传',true);}
    resetScreenshotButton(1400);
  }catch(error){console.warn('PinMind screenshot upload failed',error.message);screenshotButtonState('上传失败，请重试');resetScreenshotButton(1800);}
}
window.uploadScreenshot=uploadScreenshot;
window.addEventListener('pinmind:daily-refresh',refreshDailyDigest);
window.addEventListener('DOMContentLoaded',async()=>{await syncNativeCaptures();if(window.PinMindSchedule?.shouldRunDailyDigest())await refreshDailyDigest();else await loadLiveDigest();setTimeout(()=>checkClipboardLink(),900);document.querySelector('#pasteLinkButton')?.addEventListener('click',()=>checkClipboardLink(true));const input=document.querySelector('#screenshotInput');document.querySelector('#uploadScreenshotButton')?.addEventListener('click',()=>input?.click());input?.addEventListener('change',async()=>{const file=input.files?.[0];input.value='';await uploadScreenshot(file);});});
