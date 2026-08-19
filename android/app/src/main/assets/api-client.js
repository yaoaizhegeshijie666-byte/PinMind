const PinMindAPI={
  get base(){return (localStorage.getItem('pinmind.apiBase')||'https://pinmind-api.onrender.com').replace(/\/$/,'')},
  async request(path,options={}){if(!this.base)throw new Error('BACKEND_NOT_CONFIGURED');const response=await fetch(this.base+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});const data=await response.json();if(!response.ok)throw new Error(data.error||`HTTP_${response.status}`);return data},
  health(){return this.request('/health')},
  sources(){return this.request('/api/sources')},
  today(){return this.request('/api/digests/today')},
  capture(item){return this.request('/api/sources',{method:'POST',body:JSON.stringify(item)})},
  generate(){return this.request('/api/digests/generate',{method:'POST',body:'{}'})}
};
async function syncNativeCaptures(){
  if(!PinMindAPI.base||!window.PinMindNative?.getCaptures)return;
  let captures=[];try{captures=JSON.parse(window.PinMindNative.getCaptures()||'[]')}catch{return}
  let synced=0;for(const item of captures){try{await PinMindAPI.capture(item);synced++}catch(error){console.warn('PinMind capture sync deferred',error.message);break}}
  if(synced===captures.length&&captures.length){window.PinMindNative.clearCaptures();window.dispatchEvent(new CustomEvent('pinmind:sources-updated'));}
}
async function loadLiveDigest(){
  if(!PinMindAPI.base||!window.renderKnowledgeItems)return;
  try{
    const [data,sourceData]=await Promise.all([PinMindAPI.today(),PinMindAPI.sources().catch(()=>({sources:[]}))]);
    if(!data.knowledge_items?.length)return;
    const sources=new Map((sourceData.sources||[]).map(source=>[source.id,source]));
    const tones=['orange','blue','mint'];
    const liveItems=data.knowledge_items.map((item,index)=>{
      const source=sources.get(item.source_ids?.[0]);
      return {tone:tones[index%tones.length],topic:item.topic_names?.[0]||'今日知识',headline:item.headline,paragraphs:(item.sections||[]).map(section=>section.content).filter(Boolean),title:'核心内容',points:item.tags||[],source:source?.title||'PinMind AI 整理',url:source?.url||'#'};
    });
    window.renderKnowledgeItems(liveItems,data.digest_date);
    const intro=document.querySelector('.intro p');if(intro)intro.textContent='从你今天捕捉的内容中，PinMind 整理了 '+liveItems.length+' 条值得留下的知识。';
    const date=new Date(`${data.digest_date}T00:00:00+08:00`),weekdays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    document.querySelector('.date').textContent=`${date.getMonth()+1}月${date.getDate()}日 · ${weekdays[date.getDay()]}`;
    window.applyReadState?.();
    window.dispatchEvent(new CustomEvent('pinmind:digest-loaded',{detail:{items:liveItems,date:data.digest_date}}));
  }catch(error){console.warn('PinMind digest offline',error.message)}
}
window.loadLiveDigest=loadLiveDigest;
const clipboardUrl=text=>String(text||'').match(/https?:\/\/[^\s]+/i)?.[0]?.replace(/[，。；、）】》]+$/,'')||'';
async function clipboardText(){if(window.PinMindNative?.getClipboardText)return window.PinMindNative.getClipboardText();try{return await navigator.clipboard.readText()}catch{return''}}
function showClipboardPrompt(url){
  document.querySelector('.clipboard-prompt')?.remove();const prompt=document.createElement('aside');prompt.className='clipboard-prompt';prompt.innerHTML='<strong>检测到文章链接</strong><small></small><div class="clipboard-actions"><button class="dismiss-clipboard">暂不保存</button><button class="save-clipboard">保存到 PinMind</button></div>';prompt.querySelector('small').textContent=url;document.body.appendChild(prompt);
  prompt.querySelector('.dismiss-clipboard').addEventListener('click',()=>{localStorage.setItem('pinmind.lastClipboardLink',url);prompt.remove();});
  prompt.querySelector('.save-clipboard').addEventListener('click',async event=>{const button=event.currentTarget;button.disabled=true;button.textContent='正在保存…';try{await PinMindAPI.capture({input_type:'shared_link',title:'剪贴板文章链接',content:url,url});localStorage.setItem('pinmind.lastClipboardLink',url);button.textContent='✓ 已保存';window.dispatchEvent(new CustomEvent('pinmind:sources-updated'));setTimeout(()=>prompt.remove(),700)}catch(error){button.disabled=false;button.textContent='保存失败，重试';}});
}
async function checkClipboardLink(force=false){if(!force&&!window.PinMindNative?.getClipboardText)return;const url=clipboardUrl(await clipboardText());if(!url){if(force){const button=document.querySelector('#pasteLinkButton');if(button){button.textContent='剪贴板中没有链接';setTimeout(()=>button.textContent='粘贴链接',1200)}}return;}if(!force&&localStorage.getItem('pinmind.lastClipboardLink')===url)return;showClipboardPrompt(url);}
window.checkClipboardLink=checkClipboardLink;
window.addEventListener('DOMContentLoaded',()=>{syncNativeCaptures();loadLiveDigest();setTimeout(()=>checkClipboardLink(),900);document.querySelector('#pasteLinkButton')?.addEventListener('click',()=>checkClipboardLink(true));});
