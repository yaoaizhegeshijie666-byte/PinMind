const items = [
  {
    tone: 'orange', topic: 'AI 产品设计',
    headline: 'AI 自动化程度越高，越需要保留用户的关键决策权。',
    paragraphs: ['AI 适合代替用户完成重复、低风险且可撤销的操作；但涉及资产、公开表达或他人权益时，确认权必须回到用户手中。'],
    title: '判断是否需要人工确认',
    points: ['操作是否可以被完整撤销', '错误结果是否会影响资产、公开信息或他人'],
    related: '用户信任来自可理解、可控制和可撤销',
    source: '《AI Agent 的产品边界》· 少数派', url: 'https://sspai.com/'
  },
  {
    tone: 'blue', topic: '知识管理',
    headline: '收藏的价值不在于数量，而在于它是否能被下一次思考重新调用。',
    paragraphs: ['把内容存进文件夹只完成了保存。真正有效的知识系统，需要把观点转换成可以检索、关联和复用的表达。'],
    title: '从收藏到知识的三步转换',
    points: ['提炼一个可独立成立的结论', '保留结论成立的条件与来源', '连接到一个已有问题或观点'],
    source: '《打造第二大脑，不是建立第二个仓库》· 即刻', url: 'https://web.okjike.com/'
  },
  {
    tone: 'mint', topic: '用户研究',
    headline: '用户说“想要更智能”，往往是在要求减少判断成本，而不是增加 AI 功能。',
    paragraphs: ['“智能”是用户对结果的描述，不是功能方案。产品需要继续追问：哪个判断最耗时、哪些信息总被遗漏、什么结果可以安全地自动完成。'],
    title: '访谈时继续追问',
    points: ['最近一次感到麻烦是什么时候', '当时在比较哪些信息', '如果系统代替你决定，最担心什么'],
    source: '《别把用户口中的 AI 当需求》· 产品沉思录', url: 'https://www.productthinking.cc/'
  }
];

const list = document.querySelector('#knowledgeList');
PinMindState.migrate();
window.currentDigestDate=document.querySelector('.date').textContent.split(' · ')[0];
window.currentKnowledgeItems=[];window.viewingToday=true;
const safeUrl=value=>/^https?:\/\//i.test(value||'')?value:'#';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function dailyTimeReached(){const now=new Date(),time=localStorage.getItem('pinmind.dailyTime')||'22:00';return now.toTimeString().slice(0,5)>=time;}
function showDigestWaiting(){const time=localStorage.getItem('pinmind.dailyTime')||'22:00';window.currentKnowledgeItems=[];window.viewingToday=true;list.hidden=false;list.innerHTML=`<section class="empty-state"><span>◷</span><h2>今日知识将在 ${time} 生成</h2><p>你可以继续收集内容，PinMind 会在设定时间统一整理。</p></section>`;const intro=document.querySelector('.intro p');if(intro)intro.textContent=`今日知识尚未生成，将在 ${time} 为你整理。`;const button=document.querySelector('#readButton');if(button)button.hidden=true;}
window.dailyTimeReached=dailyTimeReached;window.showDigestWaiting=showDigestWaiting;function renderKnowledgeItems(knowledgeItems,digestDate=window.currentDigestDate){
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
if(dailyTimeReached())renderKnowledgeItems(items);else showDigestWaiting();
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
  if(current<time){if(window.viewingToday!==false&&typeof showDigestWaiting==='function')showDigestWaiting();return;}if(last!==today){localStorage.setItem('pinmind.lastDigest',today);window.dispatchEvent(new CustomEvent('pinmind:daily-refresh',{detail:{date:today,time}}));}
}
updateDailySchedule();setInterval(updateDailySchedule,60000);


const splashStarted=Date.now();
function dismissSplash(){const splash=document.querySelector('#appSplash');if(!splash||splash.classList.contains('hidden'))return;const delay=Math.max(0,700-(Date.now()-splashStarted));setTimeout(()=>{splash.classList.add('hidden');setTimeout(()=>splash.remove(),280);},delay);}
window.addEventListener('pinmind:digest-loaded',dismissSplash,{once:true});
window.addEventListener('load',()=>setTimeout(dismissSplash,250),{once:true});
setTimeout(dismissSplash,1800);