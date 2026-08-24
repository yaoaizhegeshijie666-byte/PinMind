const list = document.querySelector('#knowledgeList');
PinMindState.migrate();
window.currentDigestDate=document.querySelector('.date').textContent.split(' · ')[0];
window.currentKnowledgeItems=[];window.viewingToday=true;
const safeUrl=value=>/^https?:\/\//i.test(value||'')?value:'#';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function localDateKey(value=new Date()){return value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0')}
function scheduledAt(value=new Date()){const time=localStorage.getItem('pinmind.dailyTime')||'22:00',[hour,minute]=time.split(':').map(Number),scheduled=new Date(value);scheduled.setHours(hour||0,minute||0,0,0);return scheduled}
function dailyTimeReached(value=new Date()){return value.getTime()>=scheduledAt(value).getTime()}
function scheduleRunKey(value=new Date()){return localDateKey(value)+'|'+(localStorage.getItem('pinmind.dailyTime')||'22:00')}
function isCurrentScheduledDigest(data,value=new Date()){if(!data||data.digest_date!==localDateKey(value)||!dailyTimeReached(value))return false;const times=(data.knowledge_items||[]).map(item=>Date.parse(item.created_at||'')).filter(Number.isFinite);return times.length>0&&Math.max(...times)>=scheduledAt(value).getTime()}
function shouldRunDailyDigest(value=new Date()){return dailyTimeReached(value)&&localStorage.getItem('pinmind.lastDigestRun')!==scheduleRunKey(value)}
window.PinMindSchedule={localDateKey,scheduledAt,scheduleRunKey,isCurrentScheduledDigest,shouldRunDailyDigest};
function showDigestState(title,message){window.currentKnowledgeItems=[];window.viewingToday=true;list.hidden=false;list.innerHTML=`<section class="empty-state"><span>◷</span><h2>${escapeHtml(title)}</h2>${message?`<p>${escapeHtml(message)}</p>`:''}</section>`;const intro=document.querySelector('.intro p');if(intro)intro.textContent=message||'';const button=document.querySelector('#readButton');if(button)button.hidden=true;}
function showDigestWaiting(){const time=localStorage.getItem('pinmind.dailyTime')||'22:00',reached=dailyTimeReached(),date=document.querySelector('.date');if(date)date.textContent=reached?'正在生成':'等待生成';if(reached)showDigestState('正在整理今日知识','只会整理上次生成后新保存的链接、文字和截图。');else{showDigestState(`今日知识将在 ${time} 生成`,'');const intro=document.querySelector('.intro p');if(intro)intro.textContent=`你可以继续收集内容，PinMind 会在 ${time} 统一整理。`;}}
window.dailyTimeReached=dailyTimeReached;window.showDigestWaiting=showDigestWaiting;window.showDigestState=showDigestState;function renderKnowledgeItems(knowledgeItems,digestDate=window.currentDigestDate){
  window.currentDigestDate=digestDate;window.currentKnowledgeItems=knowledgeItems;const readButton=document.querySelector('#readButton');if(readButton)readButton.hidden=false;
  list.innerHTML='';
  knowledgeItems.forEach((item,index)=>{
    const article=document.createElement('article'),selected=PinMindState.isCollected(item);
    article.className=`knowledge-card ${item.tone||['orange','blue','mint'][index%3]}`;
    article.dataset.knowledgeKey=item.headline;
    const points=(item.points?.length?item.points:item.tags||[]).map(point=>`<li>${escapeHtml(point)}</li>`).join('');
    const sections=item.sections?.length?item.sections:[{title:item.title||'核心内容',content:(item.paragraphs||[]).join(' '),items:item.points||item.tags||[]}];
    const overview=sections.find(section=>section.kind==='overview'||section.level===0),outline=sections.filter(section=>section!==overview);
    const overviewHtml=overview?`<div class="note-overview"><strong>${escapeHtml(overview.content||overview.title)}</strong>${overview.items?.length?`<ul>${overview.items.map(point=>`<li>${escapeHtml(point)}</li>`).join('')}</ul>`:''}</div>`:'';
    const sectionHtml=`<div class="knowledge-outline">${outline.map(section=>{const level=Math.max(1,Math.min(3,Number(section.level)||1));return `<details class="outline-level-${level}"><summary><span>${escapeHtml(section.title||'知识要点')}</span></summary><div>${section.content?`<p>${escapeHtml(section.content)}</p>`:''}${section.items?.length?`<ul>${section.items.map(point=>`<li>${escapeHtml(point)}</li>`).join('')}</ul>`:''}</div></details>`}).join('')}</div>`;
    article.innerHTML=`<div class="card-index"><span>${String(index+1).padStart(2,'0')}</span><i></i><em>${escapeHtml(item.topic||'今日知识')}</em></div><h2>${escapeHtml(item.headline)}</h2>${overviewHtml}${sectionHtml}<footer><a class="source-direct" href="${escapeHtml(safeUrl(item.url))}">来源：${escapeHtml(item.source||'PinMind AI 整理')} ↗</a><button class="toggle${selected?' selected':''}"><span>${selected?'✓':'＋'}</span> ${selected?'已收录':'加入知识库'}</button></footer>`;
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
  const read=PinMindState.isRead(window.currentDigestDate,window.currentKnowledgeItems),button=document.querySelector('#readButton');button.classList.toggle('is-read',read);button.disabled=read;
  if(read&&window.viewingToday!==false){list.hidden=true;document.querySelector('.intro').hidden=true;document.querySelector('#emptyState').hidden=false;}
  else{list.hidden=false;document.querySelector('.intro').hidden=window.viewingToday===false;document.querySelector('#emptyState').hidden=true;list.classList.remove('fade');document.querySelector('.intro').classList.remove('fade');}
}
window.applyReadState=applyReadState;
applyReadState();


const DAILY_TIME_KEY='pinmind.dailyTime';
let scheduleObservedDate=localDateKey();
function updateDailySchedule(){
  const time=localStorage.getItem(DAILY_TIME_KEY)||'22:00',now=new Date(),date=localDateKey(now);
  if(date!==scheduleObservedDate){scheduleObservedDate=date;window.loadHistory?.();window.loadLiveDigest?.();}
  if(!dailyTimeReached(now)){if(window.viewingToday!==false&&typeof showDigestWaiting==='function')showDigestWaiting();return;}if(shouldRunDailyDigest(now)){window.dispatchEvent(new CustomEvent('pinmind:daily-refresh',{detail:{date:localDateKey(now),time}}));}
}
updateDailySchedule();setInterval(updateDailySchedule,60000);


const splashStarted=Date.now();
function dismissSplash(){const splash=document.querySelector('#appSplash');if(!splash||splash.classList.contains('hidden'))return;const delay=Math.max(0,700-(Date.now()-splashStarted));setTimeout(()=>{splash.classList.add('hidden');setTimeout(()=>splash.remove(),280);},delay);}
window.addEventListener('pinmind:digest-loaded',dismissSplash,{once:true});
window.addEventListener('load',()=>setTimeout(dismissSplash,250),{once:true});
setTimeout(dismissSplash,1800);