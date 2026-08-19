const list = document.querySelector('#knowledgeList');
PinMindState.migrate();
window.currentDigestDate=document.querySelector('.date').textContent.split(' · ')[0];
window.currentKnowledgeItems=[];window.viewingToday=true;
const safeUrl=value=>/^https?:\/\//i.test(value||'')?value:'#';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function dailyTimeReached(){const now=new Date(),time=localStorage.getItem('pinmind.dailyTime')||'22:00';return now.toTimeString().slice(0,5)>=time;}
function showDigestState(title,message){window.currentKnowledgeItems=[];window.viewingToday=true;list.hidden=false;list.innerHTML=`<section class="empty-state"><span>◷</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p></section>`;const intro=document.querySelector('.intro p');if(intro)intro.textContent=message;const button=document.querySelector('#readButton');if(button)button.hidden=true;}
function showDigestWaiting(){const time=localStorage.getItem('pinmind.dailyTime')||'22:00';if(dailyTimeReached())showDigestState('正在整理今日知识','只会整理上次生成后新保存的链接、文字和截图。');else showDigestState(`今日知识将在 ${time} 生成`,`你可以继续收集内容，PinMind 会在 ${time} 统一整理。`);}
window.dailyTimeReached=dailyTimeReached;window.showDigestWaiting=showDigestWaiting;window.showDigestState=showDigestState;function renderKnowledgeItems(knowledgeItems,digestDate=window.currentDigestDate){
  window.currentDigestDate=digestDate;window.currentKnowledgeItems=knowledgeItems;const readButton=document.querySelector('#readButton');if(readButton)readButton.hidden=false;
  list.innerHTML='';
  knowledgeItems.forEach((item,index)=>{
    const article=document.createElement('article'),selected=PinMindState.isCollected(item);
    article.className=`knowledge-card ${item.tone||['orange','blue','mint'][index%3]}`;
    article.dataset.knowledgeKey=item.headline;
    const points=(item.points?.length?item.points:item.tags||[]).map(point=>`<li>${escapeHtml(point)}</li>`).join('');
    article.innerHTML=`<div class="card-index"><span>${String(index+1).padStart(2,'0')}</span><i></i><em>${escapeHtml(item.topic||'今日知识')}</em></div><h2>${escapeHtml(item.headline)}</h2>${(item.paragraphs||[]).map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}<div class="framework"><h3>${escapeHtml(item.title||'核心内容')}</h3><ol>${points}</ol></div><footer><a class="source-direct" href="${escapeHtml(safeUrl(item.url))}">来源：${escapeHtml(item.source||'PinMind AI 整理')} ↗</a><button class="toggle${selected?' selected':''}"><span>${selected?'✓':'＋'}</span> ${selected?'已收录':'加入知识库'}</button></footer>`;
    article.querySelector('.toggle').addEventListener('click',event=>{const button=event.currentTarget,on=PinMindState.toggleCollected(item,window.currentDigestDate);button.classList.toggle('selected',on);button.innerHTML=on?'<span>✓</span> 已收录':'<span>＋</span> 加入知识库';});
    list.appendChild(article);
  });
}
list.addEventListener('click',event=>{const link=event.target.closest('.source-direct');if(!link)return;event.preventDefault();const url=link.getAttribute('href');if(!url||url==='#')return;window.PinMindNative?.openUrl?.(url);if(!window.PinMindNative)window.open(url,'_blank');});window.renderKnowledgeItems=renderKnowledgeItems;
showDigestWaiting();
const drawer = document.querySelector('#drawer');
const scrim = document.querySelector('#scrim');
const setDrawer = open => {
  drawer.classList.toggle('open', open); scrim.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
};
document.querySelectorAll('.related').forEach(button => button.addEventListener('click', () => setDrawer(true)));
document.querySelector('#closeDrawer').addEventListener('click', () => setDrawer(false));
scrim.addEventListener('click', () => { setDrawer(false); document.querySelector('#sidebar').classList.remove('open'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') setDrawer(false); if (event.key === '/' && event.target.tagName !== 'INPUT') { event.preventDefault(); document.querySelector('.search input').focus(); } });
document.querySelector('#menuButton').addEventListener('click', () => { document.querySelector('#sidebar').classList.add('open'); scrim.classList.add('open'); });
document.querySelector('#readButton').addEventListener('click', () => {
  const readButton = document.querySelector('#readButton');
  readButton.classList.add('is-read');
  readButton.disabled = true;
  list.classList.add('fade'); document.querySelector('.intro').classList.add('fade');
  PinMindState.markRead(window.currentDigestDate,window.currentKnowledgeItems);
  setTimeout(() => { list.hidden = true; document.querySelector('.intro').hidden = true; document.querySelector('#emptyState').hidden = false; }, 180);
});

function applyReadState(){
  const read=PinMindState.isRead(window.currentDigestDate),button=document.querySelector('#readButton');button.classList.toggle('is-read',read);button.disabled=read;
  if(read){list.hidden=true;document.querySelector('.intro').hidden=true;document.querySelector('#emptyState').hidden=false;}
  else{list.hidden=false;document.querySelector('.intro').hidden=false;document.querySelector('#emptyState').hidden=true;list.classList.remove('fade');document.querySelector('.intro').classList.remove('fade');}
}
window.applyReadState=applyReadState;
applyReadState();


const DAILY_TIME_KEY='pinmind.dailyTime';
function updateDailySchedule(){
  const time=localStorage.getItem(DAILY_TIME_KEY)||'22:00';const now=new Date();const today=now.toISOString().slice(0,10);const last=localStorage.getItem('pinmind.lastDigest');const current=now.toTimeString().slice(0,5);
  if(current<time){if(window.viewingToday!==false&&typeof showDigestWaiting==='function')showDigestWaiting();return;}if(last!==today){window.dispatchEvent(new CustomEvent('pinmind:daily-refresh',{detail:{date:today,time}}));}
}
updateDailySchedule();setInterval(updateDailySchedule,60000);


const splashStarted=Date.now();
function dismissSplash(){const splash=document.querySelector('#appSplash');if(!splash||splash.classList.contains('hidden'))return;const delay=Math.max(0,700-(Date.now()-splashStarted));setTimeout(()=>{splash.classList.add('hidden');setTimeout(()=>splash.remove(),280);},delay);}
window.addEventListener('pinmind:digest-loaded',dismissSplash,{once:true});
window.addEventListener('load',()=>setTimeout(dismissSplash,250),{once:true});
setTimeout(dismissSplash,1800);