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
const collectedKeys=new Set(JSON.parse(localStorage.getItem('pinmind.collected')||'[]'));
const saveCollected=()=>localStorage.setItem('pinmind.collected',JSON.stringify([...collectedKeys]));
const libraryItems=()=>JSON.parse(localStorage.getItem('pinmind.libraryItems')||'[]');
function saveLibraryItem(item,selected){const saved=libraryItems().filter(entry=>entry.headline!==item.headline);if(selected)saved.push(item);localStorage.setItem('pinmind.libraryItems',JSON.stringify(saved));window.dispatchEvent(new CustomEvent('pinmind:library-updated'));}
window.saveLibraryItem=saveLibraryItem;
items.forEach((item, index) => {
  const article = document.createElement('article');
  article.className = `knowledge-card ${item.tone}`;
  article.dataset.knowledgeKey=item.headline;
  article.innerHTML = `
    <div class="card-index"><span>${String(index + 1).padStart(2, '0')}</span><i></i><em>${item.topic}</em></div>
    <h2>${item.headline}</h2>
    ${item.paragraphs.map(p => `<p>${p}</p>`).join('')}
    <div class="framework"><h3>${item.title}</h3><ol>${item.points.map(p => `<li>${p}</li>`).join('')}</ol></div>
    ${item.related ? `<button class="related"><span>↗</span><span><small>关联知识</small>${item.related}</span></button>` : ''}
    <footer><a class="source-direct" href="${item.url}">来源：${item.source} ↗</a><button class="toggle"><span>＋</span> 加入知识库</button></footer>`;
  list.appendChild(article);
});

document.querySelectorAll('.toggle').forEach(button => {const key=button.closest('.knowledge-card').dataset.knowledgeKey;if(collectedKeys.has(key)){button.classList.add('selected');button.innerHTML='<span>✓</span> 已收录';}button.addEventListener('click', () => {
  const selected = button.classList.toggle('selected');
  if(selected)collectedKeys.add(key);else collectedKeys.delete(key);saveCollected();saveLibraryItem(items.find(entry=>entry.headline===key),selected);
  button.innerHTML = selected ? '<span>✓</span> 已收录' : '<span>＋</span> 加入知识库';
});});

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
  const readDate=document.querySelector('.date').textContent;localStorage.setItem('pinmind.read.'+readDate,'1');localStorage.setItem('pinmind.read.'+readDate.split(' · ')[0],'1');
  window.dispatchEvent(new CustomEvent('pinmind:read-state-changed',{detail:{date:document.querySelector('.date').textContent}}));
  setTimeout(() => { list.hidden = true; document.querySelector('.intro').hidden = true; document.querySelector('#emptyState').hidden = false; }, 180);
});

function applyReadState(){
  const read=localStorage.getItem('pinmind.read.'+document.querySelector('.date').textContent)==='1',button=document.querySelector('#readButton');button.classList.toggle('is-read',read);button.disabled=read;
  if(read){list.hidden=true;document.querySelector('.intro').hidden=true;document.querySelector('#emptyState').hidden=false;}
  else{list.hidden=false;document.querySelector('.intro').hidden=false;document.querySelector('#emptyState').hidden=true;list.classList.remove('fade');document.querySelector('.intro').classList.remove('fade');}
}
window.applyReadState=applyReadState;
applyReadState();


const DAILY_TIME_KEY='pinmind.dailyTime';
function updateDailySchedule(){
  const time=localStorage.getItem(DAILY_TIME_KEY)||'22:00';const now=new Date();const today=now.toISOString().slice(0,10);const last=localStorage.getItem('pinmind.lastDigest');const current=now.toTimeString().slice(0,5);
  if(current>=time&&last!==today){localStorage.setItem('pinmind.lastDigest',today);window.dispatchEvent(new CustomEvent('pinmind:daily-refresh',{detail:{date:today,time}}));}
}
updateDailySchedule();setInterval(updateDailySchedule,60000);

