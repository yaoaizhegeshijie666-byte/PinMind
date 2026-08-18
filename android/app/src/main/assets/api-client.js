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
  if(!PinMindAPI.base)return;try{const data=await PinMindAPI.today();if(!data.knowledge_items?.length)return;const cards=document.querySelectorAll('.knowledge-card');data.knowledge_items.slice(0,cards.length).forEach((item,index)=>{cards[index].querySelector('h2').textContent=item.headline;const paragraph=cards[index].querySelector(':scope > p');if(paragraph)paragraph.textContent=item.sections?.[0]?.content||'';});}catch(error){console.warn('PinMind digest offline',error.message)}
}
window.addEventListener('DOMContentLoaded',()=>{syncNativeCaptures();loadLiveDigest()});
