const pageHost = document.querySelector('#pageHost');
const todayPage = document.querySelector('#todayPage');
const searchInputs = document.querySelectorAll('.search input');

const pageTemplates = {
  library: `
    <header class="sub-header"><div><p class="eyebrow">KNOWLEDGE NETWORK</p><h1>知识库</h1><p>拖动知识模块，自由整理你的知识联系</p></div><div class="library-tools"><div class="view-switch"><button class="active" data-library-view="board">主题板</button><button data-library-view="hierarchy">笔记</button><button data-library-view="graph">图谱</button></div><div class="filters"><div class="filter-control"><button data-filter-toggle="theme">全部主题⌄</button><div class="filter-menu" data-filter-menu="theme"><button data-value="all">全部主题</button><button data-value="orange">AI 产品设计</button><button data-value="blue">知识管理</button></div></div><div class="filter-control"><button data-filter-toggle="time">全部时间⌄</button><div class="filter-menu" data-filter-menu="time"><button data-value="all">全部时间</button><button data-value="7">最近 7 天</button><button data-value="30">最近 30 天</button></div></div></div></div></header>
    <section class="library-view" id="boardView">
      <div class="board-note">拖动卡片调整顺序 · 点击卡片查看详情 · 删除不会影响原始来源</div>
      <section class="cluster orange-cluster"><div class="cluster-title"><span>AI 产品设计</span><small>4 条知识</small></div><div class="draggable-board">
        <article class="knowledge-module featured" draggable="true" data-id="k1"><button class="module-delete" aria-label="删除">×</button><span>核心知识</span><h3>AI 自动化程度越高，越需要保留用户的关键决策权。</h3><small>网页 · 8月18日</small></article>
        <article class="knowledge-module" draggable="true" data-id="k2"><button class="module-delete" aria-label="删除">×</button><span>关联知识</span><h3>用户信任来自可理解、可控制和可撤销</h3><small>文章 · 8月12日</small></article>
        <article class="knowledge-module" draggable="true" data-id="k3"><button class="module-delete" aria-label="删除">×</button><span>方法</span><h3>设计 AI 失败后的恢复路径</h3><small>截图 · 8月10日</small></article>
        <article class="knowledge-module" draggable="true" data-id="k4"><button class="module-delete" aria-label="删除">×</button><span>边界</span><h3>不可逆操作应当由人作出最终决定</h3><small>文字 · 8月8日</small></article>
      </div></section>
      <section class="cluster blue-cluster"><div class="cluster-title"><span>知识管理</span><small>3 条知识</small></div><div class="draggable-board"><article class="knowledge-module featured" draggable="true"><button class="module-delete">×</button><span>核心知识</span><h3>收藏的价值，在于它能否被下一次思考重新调用。</h3><small>网页 · 8月18日</small></article><article class="knowledge-module" draggable="true"><button class="module-delete">×</button><span>关联知识</span><h3>主题关系比时间顺序更接近思考方式</h3><small>截图 · 8月7日</small></article></div></section>
    </section>
    <section class="library-view markdown-view" id="hierarchyView" hidden>
      <div class="board-note">以 Markdown 层级阅读和整理知识，结构可直接导出</div>
      <article class="markdown-document"><header><span>AI 产品设计</span><button>复制 Markdown</button></header><h1>用户控制与确认</h1><p>AI 自动化程度越高，越需要保留用户的关键决策权。</p><h2>核心问题</h2><ol><li><strong>什么操作可以由 AI 自动完成？</strong><ul><li>重复、低风险且可撤销的操作</li><li>结果透明、用户可以快速检查的操作</li><li>不影响资产、公开信息或他人权益的操作</li></ul></li><li><strong>什么操作需要人工确认？</strong><ul><li>不可逆或恢复成本很高的操作</li><li>会影响资产、公开表达或他人的操作</li><li>模型缺少关键上下文时的判断</li></ul></li></ol><h2>判断框架</h2><ul><li><strong>可撤销性</strong><ul><li>结果能否完整恢复</li><li>恢复是否需要额外成本</li></ul></li><li><strong>影响范围</strong><ul><li>仅影响当前用户</li><li>是否会触达外部系统或其他人</li></ul></li><li><strong>用户认知</strong><ul><li>系统是否解释了即将发生的动作</li><li>用户能否在关键节点接管</li></ul></li></ul><blockquote>用户信任不是来自 AI 从不犯错，而是来自错误发生后仍有清晰、低成本的恢复路径。</blockquote><h2>原始来源</h2><p><a href="https://sspai.com/">《AI Agent 的产品边界》↗</a></p></article>
    </section>    <section class="library-view graph-view" id="graphView" hidden><div class="graph-toolbar"><span>拖动节点 · 使用滚轮缩放 · 点击查看详情</span></div><div class="graph-canvas" id="graphCanvas"><svg aria-hidden="true"></svg><button class="graph-node hub" data-node="hub" style="left:50%;top:47%">知识库<small>7 条知识</small></button><button class="graph-node orange-node" data-node="ai" data-connect="hub" style="left:21%;top:25%">AI 产品设计</button><button class="graph-node blue-node" data-node="km" data-connect="hub" style="left:80%;top:25%">知识管理</button><button class="graph-node mint-node" data-node="control" data-connect="hub" style="left:25%;top:75%">用户控制权</button><button class="graph-node peach-node" data-node="reuse" data-connect="hub" style="left:78%;top:74%">可复用表达</button><button class="graph-node leaf" data-node="recovery" data-connect="ai" style="left:10%;top:56%">恢复路径</button></div></section>`,  uncollected: `
    <header class="sub-header"><div><p class="eyebrow">ARCHIVE</p><h1>未收录</h1><p>已阅但没有进入知识库的完整知识会保存在这里。</p></div></header>
    <section class="uncollected-full-list"></section>`,  sources: `
    <header class="sub-header"><div><p class="eyebrow">SOURCES</p><h1>来源记录</h1><p>查看捕捉来源与处理状态</p></div><div class="filters source-filters"><div class="filter-control"><button data-source-filter-toggle="type">全部类型⌄</button><div class="filter-menu" data-source-filter-menu="type"><button data-value="all">全部类型</button><button data-value="link">链接</button><button data-value="text">文字</button><button data-value="image">截图</button></div></div><div class="filter-control"><button data-source-filter-toggle="status">全部状态⌄</button><div class="filter-menu" data-source-filter-menu="status"><button data-value="all">全部状态</button><button data-value="complete">已完成</button><button data-value="working">解析中</button><button data-value="pending">待补充</button><button data-value="failed">解析失败</button></div></div></div></header>
    <section class="source-table"><div class="source-head"><span>来源</span><span>捕捉时间</span><span>状态</span><span>知识</span></div>
      <button class="source-row" data-source-type="link" data-source-status="complete"><i class="source-icon link-icon">↗</i><span><strong>AI Agent 的产品边界</strong><small>少数派 · 网页链接</small></span><time>今天 16:42</time><em class="ok">● 已完成</em><b>2 条</b></button>
      <button class="source-row" data-source-type="text" data-source-status="complete"><i class="source-icon text-icon">文</i><span><strong>用户访谈摘录：智能与控制感</strong><small>微信 · 选中文字</small></span><time>今天 14:18</time><em class="ok">● 已完成</em><b>1 条</b></button>
      <button class="source-row" data-source-type="image" data-source-status="working"><i class="source-icon shot-icon">▧</i><span><strong>小红书截图 2026-08-18</strong><small>小红书 · 截图</small></span><time>今天 10:05</time><em class="working">● 解析中</em><b>—</b></button>
      <button class="source-row" data-source-type="link" data-source-status="pending"><i class="source-icon link-icon">↗</i><span><strong>需要登录后访问的行业报告</strong><small>网页链接 · 仅保存来源</small></span><time>昨天 21:30</time><em class="warn">● 待补充</em><b>0 条</b></button><button class="source-row" data-source-type="link" data-source-status="failed"><i class="source-icon link-icon">↗</i><span><strong>无法解析的外部文章</strong><small>网页链接 · 可重新解析</small></span><time>8月16日 18:22</time><em class="failed">● 解析失败</em><b>0 条</b></button>
    </section>`,
  settings: `
    <header class="sub-header"><div><p class="eyebrow">PREFERENCES</p><h1>设置</h1><p>管理知识生成、提醒和本地数据</p></div></header>
    <section class="settings-group"><h2>今日知识</h2><label><span><strong>生成时间</strong><small>每天在你方便阅读的时间整理知识</small></span><input type="time" value="22:00"></label><label><span><strong>阅读提醒</strong><small>知识单准备好后发送通知</small></span><input class="switch" type="checkbox" checked></label></section>
    <section class="settings-group api-settings"><h2>AI 后端</h2><label><span><strong>服务地址</strong><small>必须使用你部署的 HTTPS 地址</small></span><input id="apiBaseInput" type="url" placeholder="https://api.example.com"></label><div class="api-actions"><button id="saveApiBase">保存地址</button><button id="testApiBase">测试连接</button><span id="apiStatus">未配置</span></div></section><section class="settings-group"><h2>数据与隐私</h2><button class="setting-row"><span><strong>数据与隐私说明</strong><small>了解 PinMind 如何处理分享内容</small></span><b>›</b></button><button class="setting-row"><span><strong>演示数据重置</strong><small>恢复初始示例内容</small></span><b>›</b></button></section>
    <section class="settings-group danger-zone"><h2>危险操作</h2><button class="setting-row"><span><strong>清除本地数据</strong><small>此操作需要再次确认</small></span><b>清除</b></button></section><p class="version">PinMind Beta · v0.1.0</p>`,
  search: query => `
    <header class="sub-header"><div><p class="eyebrow">SEARCH</p><h1>“${query}”的搜索结果</h1><p>在知识库、未收录和来源记录中找到 3 条内容</p></div></header>
    <div class="search-tabs"><button class="active" data-search-scope="library">知识库</button><button data-search-scope="uncollected">未收录</button><button data-search-scope="sources">来源记录</button></div>
    <section class="result-list"><article><span>AI 产品设计</span><h2><mark>${query}</mark>程度越高，越需要保留用户的关键决策权。</h2><p>AI 适合代替用户完成重复、低风险且可撤销的操作……</p><small>来源：《AI Agent 的产品边界》</small></article><article><span>用户信任</span><h2>可理解和可撤销，决定用户是否接受<mark>${query}</mark>。</h2><p>信任不是来自系统从不犯错，而是来自错误发生后仍有恢复路径。</p><small>来源：《生成式 AI 产品的信任设计》</small></article></section>`
};

const escapeText=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function sourcePresentation(item){
  const raw=item.input_type||'';
  const type=item.url?'link':raw==='screenshot'?'image':'text';
  const labels={link:['↗','网页链接'],image:['▧','截图'],text:['文','选中文字']};
  const status=item.status==='ready'?'complete':item.status||'pending';
  const statusLabels={complete:['ok','● 已完成'],working:['working','● 解析中'],pending:['warn','● 待补充'],failed:['failed','● 解析失败']};
  return {type,label:labels[type],status,statusLabel:statusLabels[status]||statusLabels.pending};
}
function sourceTime(value){
  const date=new Date(value);if(Number.isNaN(date.getTime()))return '时间未知';
  const now=new Date(),same=date.toDateString()===now.toDateString();
  return same?'今天 '+date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}):date.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});
}
async function loadLiveSources(){
  const table=pageHost.querySelector('.source-table');if(!table)return;
  table.querySelectorAll('.source-row,.source-state').forEach(row=>row.remove());
  table.insertAdjacentHTML('beforeend','<div class="source-state">正在同步来源记录…</div>');
  try{
    const data=await PinMindAPI.sources();const sources=data.sources||[];
    table.querySelector('.source-state')?.remove();
    if(!sources.length){table.insertAdjacentHTML('beforeend','<div class="source-state">暂无来源，从微信、小红书或浏览器分享内容到 PinMind 后会显示在这里。</div>');return;}
    sources.forEach(item=>{const view=sourcePresentation(item);table.insertAdjacentHTML('beforeend',`<button class="source-row" data-source-id="${escapeText(item.id)}" data-source-type="${view.type}" data-source-status="${view.status}"><i class="source-icon ${view.type}-icon">${view.label[0]}</i><span><strong>${escapeText(item.title||'未命名来源')}</strong><small>${escapeText(view.label[1])}</small></span><time>${sourceTime(item.captured_at)}</time><em class="${view.statusLabel[0]}">${view.statusLabel[1]}</em><b>${view.status==='complete'?'已保存':'—'}</b></button>`);});
    applySourceFilters();
  }catch(error){
    table.querySelector('.source-state')?.remove();
    table.insertAdjacentHTML('beforeend',`<div class="source-state source-error">来源同步失败：${escapeText(error.message)}<button data-retry-sources>重新加载</button></div>`);
  }
}
window.addEventListener('pinmind:sources-updated',()=>loadLiveSources());
function storedSet(key){return new Set(JSON.parse(localStorage.getItem(key)||'[]'));}
function saveSet(key,set){localStorage.setItem(key,JSON.stringify([...set]));}
function restorePageState(){const deleted=storedSet('pinmind.deleted');pageHost.querySelectorAll('.knowledge-module').forEach(card=>{const key=card.dataset.id||card.querySelector('h3')?.textContent||'';if(deleted.has('module:'+key))card.remove();});}

function savedLibraryItems(){return PinMindState.library();}
function ensureThemeCluster(topic){
  const view=pageHost.querySelector('#boardView');let cluster=[...view.querySelectorAll('.cluster')].find(item=>item.querySelector('.cluster-title span')?.textContent===topic);
  if(cluster)return cluster;
  cluster=document.createElement('section');cluster.className='cluster dynamic-cluster';cluster.innerHTML='<div class="cluster-title"><span></span><small>0 条知识</small></div><div class="draggable-board"></div>';cluster.querySelector('.cluster-title span').textContent=topic;view.appendChild(cluster);return cluster;
}
function refreshThemeOptions(){
  const clusters=[...pageHost.querySelectorAll('#boardView .cluster')];
  clusters.forEach(cluster=>{const topic=cluster.querySelector('.cluster-title span')?.textContent||'未分类';cluster.dataset.theme=topic;cluster.querySelectorAll('.knowledge-module').forEach(card=>card.dataset.theme=topic);const count=cluster.querySelectorAll('.knowledge-module').length;const label=cluster.querySelector('.cluster-title small');if(label)label.textContent=`${count} 条知识`;});
  const topics=[...new Set(clusters.filter(cluster=>cluster.querySelector('.knowledge-module')).map(cluster=>cluster.dataset.theme))];
  pageHost.querySelectorAll('.graph-node:not(.hub)').forEach(node=>{const label=node.childNodes[0]?.textContent?.trim()||'';if(topics.includes(label))node.dataset.theme=label;});
  const menu=pageHost.querySelector('[data-filter-menu="theme"]');if(!menu)return;menu.innerHTML='';
  [['all','全部主题'],...topics.map(topic=>[topic,topic])].forEach(([value,label])=>{const button=document.createElement('button');button.dataset.value=value;button.textContent=label;menu.appendChild(button);});
}
function renderSavedLibraryItems(){
  if(!pageHost.querySelector('#boardView'))return;
  const note=pageHost.querySelector('.markdown-document'),canvas=pageHost.querySelector('#graphCanvas');
  savedLibraryItems().forEach((item,index)=>{
    const topic=item.topic||'未分类',cluster=ensureThemeCluster(topic),board=cluster.querySelector('.draggable-board');
    if(![...board.querySelectorAll('h3')].some(title=>title.textContent===item.headline)){const card=document.createElement('article');card.className='knowledge-module';card.draggable=true;card.dataset.saved='true';card.innerHTML='<button class="module-delete" aria-label="删除">×</button><span></span><h3></h3><small>已加入知识库</small>';card.querySelector('span').textContent=topic;card.querySelector('h3').textContent=item.headline;board.appendChild(card);}
    if(![...note.querySelectorAll('h2')].some(title=>title.textContent===item.headline)){const section=document.createElement('section');section.dataset.saved='true';section.innerHTML='<h2></h2><p></p>';section.querySelector('h2').textContent=item.headline;section.querySelector('p').textContent=item.paragraphs?.[0]||item.summary||'';note.appendChild(section);}
    if(![...canvas.querySelectorAll('.graph-node')].some(node=>node.textContent===item.headline)){const node=document.createElement('button');node.className='graph-node leaf';node.dataset.connect='hub';node.dataset.theme=topic;node.style.left=`${18+(index%4)*20}%`;node.style.top=`${84-(index%2)*12}%`;node.textContent=item.headline;canvas.appendChild(node);}
  });
  refreshThemeOptions();const hub=canvas.querySelector('.hub small');if(hub)hub.textContent=`${pageHost.querySelectorAll('.knowledge-module').length} 条知识`;updateGraphEdges();
}function renderUncollectedItems(){
  const list=pageHost.querySelector('.uncollected-full-list');if(!list)return;list.innerHTML='';
  const entries=PinMindState.uncollected();
  if(!entries.length){list.innerHTML='<article class="uncollected-card"><h2>暂无未收录知识</h2><p>已阅时未加入知识库的内容会出现在这里。</p></article>';return;}
  entries.forEach(item=>{
    const card=document.createElement('article');card.className='uncollected-card';card._knowledgeItem=item;
    card.innerHTML='<div class="uncollected-meta"><span></span><time></time></div><h2></h2><p></p><div class="row-actions"><button class="collect-small">＋ 加入知识库</button><button class="danger">删除</button></div>';
    card.querySelector('.uncollected-meta span').textContent=item.topic||'未收录';card.querySelector('time').textContent=item.digestDate||'';card.querySelector('h2').textContent=item.headline;card.querySelector(':scope>p').textContent=item.paragraphs?.[0]||item.summary||'';list.appendChild(card);
  });
}
function openPage(page, query='') {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => item.classList.toggle('active', item.dataset.page === page));
  if (page === 'today') { pageHost.hidden = true; todayPage.hidden = false; }
  else { todayPage.hidden = true; pageHost.hidden = false; pageHost.innerHTML = page === 'search' ? pageTemplates.search(query) : pageTemplates[page]; if(page==='settings'){const time=pageHost.querySelector('input[type=time]');if(time)time.value=localStorage.getItem('pinmind.dailyTime')||'22:00';const api=pageHost.querySelector('#apiBaseInput');if(api)api.value=localStorage.getItem('pinmind.apiBase')||'';} }
  pageHost.querySelectorAll('[data-filter-toggle],[data-source-filter-toggle]').forEach(button=>button.textContent=button.textContent.replace(/⌄$/,''));
  document.querySelector('main').scrollTo({top: 0, behavior: 'smooth'});
  document.querySelector('#sidebar').classList.remove('open');
  document.querySelector('#scrim').classList.remove('open');
  restorePageState();
  if(page==='library')renderSavedLibraryItems();
  if(page==='uncollected')renderUncollectedItems();
  if(page==='sources')loadLiveSources();
}

const todayDefault={
  date:document.querySelector('.date').textContent,
  headline:document.querySelector('.knowledge-card h2').textContent
};
window.addEventListener('pinmind:digest-loaded',event=>{todayDefault.date=document.querySelector('.date').textContent;todayDefault.headline=event.detail.items[0]?.headline||todayDefault.headline;});
document.querySelectorAll('.history-item').forEach(item=>item.classList.remove('current'));
const historyKnowledgeCount=document.querySelectorAll('.knowledge-card').length;
document.querySelectorAll('.history-item em').forEach(item=>item.textContent=`${historyKnowledgeCount} 条知识`);
function resetTodayView(){
  document.querySelectorAll('.history-item').forEach(item=>item.classList.remove('current'));
  document.querySelector('#todayPage h1').textContent='今日知识';
  document.querySelector('.date').textContent=todayDefault.date;
  document.querySelector('.knowledge-card h2').textContent=todayDefault.headline;
}
document.querySelectorAll('.nav-item[data-page]').forEach(item => item.addEventListener('click', () => {
  if(item.dataset.page==='today'){resetTodayView();window.loadLiveDigest?.();}
  window.applyReadState?.();
  openPage(item.dataset.page);
}));
searchInputs.forEach(input=>input.addEventListener('keydown',event=>{if(event.key==='Enter'&&input.value.trim()){input.blur();openPage('search',input.value.trim());const search=document.querySelector('#mobileSearch');search.classList.remove('open');search.setAttribute('aria-hidden','true');}}));
const mobileSearchButton=document.querySelector('#mobileSearchButton');
mobileSearchButton.addEventListener('click',()=>{
  const search=document.querySelector('#mobileSearch');
  search.classList.add('open');search.setAttribute('aria-hidden','false');
  search.querySelector('input').focus();
});
document.querySelector('#closeMobileSearch').addEventListener('click',()=>{
  const search=document.querySelector('#mobileSearch');
  search.querySelector('input').blur();
  search.classList.remove('open');search.setAttribute('aria-hidden','true');
});
const historyDigests={'8月17日':'为什么 AI 产品仍需保留人工确认','8月15日':'知识真正被使用，才完成了整理','8月12日':'好问题比更多功能更接近用户需求'};
const historyItems=day=>items.map((item,index)=>({...item,headline:index===0?historyDigests[day]:item.headline}));
function historyDate(item){return item.querySelector('time').textContent;}
document.querySelectorAll('.history-item').forEach(item=>{if(PinMindState.isRead(historyDate(item)))item.remove();});
window.addEventListener('pinmind:read-state-changed',event=>{const day=event.detail.date.split(' · ')[0];document.querySelectorAll('.history-item').forEach(item=>{if(historyDate(item)===day)item.remove();});});
document.querySelectorAll('.history-item').forEach(item=>item.addEventListener('click',()=>{
  openPage('today');document.querySelectorAll('.history-item').forEach(row=>row.classList.toggle('current',row===item));
  document.querySelector('[data-page="today"]').classList.remove('active');
  document.querySelector('#todayPage h1').textContent='历史知识';
  const day=item.querySelector('time').textContent;const weekdays={'8月17日':'星期一','8月15日':'星期六','8月12日':'星期三'};document.querySelector('.date').textContent=day+' · '+(weekdays[day]||'');
  document.querySelector('#knowledgeList').hidden=false;document.querySelector('.intro').hidden=false;document.querySelector('#emptyState').hidden=true;
  document.querySelector('#knowledgeList').classList.remove('fade');document.querySelector('.intro').classList.remove('fade');
  window.renderKnowledgeItems(historyItems(day),day);
  const read=document.querySelector('#readButton');read.disabled=false;read.classList.remove('is-read');
  window.applyReadState?.();
}));
function showDetail(type, title) {
  const detailDrawer = document.querySelector('#drawer');
  const headerLabel = type === 'source' ? '来源详情' : '知识详情';
  detailDrawer.querySelector('header p').textContent = headerLabel;
  detailDrawer.querySelector('header h2').textContent = title;
  detailDrawer.querySelector('.drawer-body').innerHTML = type === 'source' ? `
    <span class="topic-tag mint">解析完成</span><p class="drawer-lead">这是一条由用户主动分享到 PinMind 的原始来源，内容已完成解析并生成知识。</p><h3>来源信息</h3><p>类型：网页链接<br>捕捉时间：2026年8月18日 16:42<br>内容完整度：完整</p><div class="source-panel"><span>已生成 2 条知识</span><a href="#">打开原始来源 ↗</a></div>` : `
    <span class="topic-tag mint">AI 产品设计</span><p class="drawer-lead">${title}</p><h3>核心知识</h3><p>关键操作的最终决定权应当与风险相匹配。操作越难撤销、影响范围越大，越需要用户明确确认。</p><h3>适用边界</h3><p>低风险、重复且结果透明的操作可以自动完成；涉及资产、公开表达和他人权益时应保留人工确认。</p><div class="source-panel"><span>由 PinMind AI 基于原始内容整理，请结合来源判断。</span><a href="#">查看原始来源 ↗</a></div>`;
  detailDrawer.classList.add('open'); document.querySelector('#scrim').classList.add('open'); detailDrawer.setAttribute('aria-hidden','false');
}

function showCaptureSheet() {
  const sheet = document.createElement('div');
  sheet.className = 'capture-sheet';
  sheet.innerHTML = `<div class="sheet-handle"></div><div class="capture-success">✓</div><h2>已保存至 PinMind</h2><p>今晚将为你整理</p><button class="star-button">☆ 标为星标</button><small>分享面板将在保存后自动关闭</small>`;
  document.body.appendChild(sheet); document.querySelector('#scrim').classList.add('open');
  sheet.querySelector('.star-button').addEventListener('click', event => { const on = event.currentTarget.classList.toggle('selected'); event.currentTarget.textContent = on ? '★ 已标为星标' : '☆ 标为星标'; });
  setTimeout(() => sheet.classList.add('open'), 20);
  const close = () => { sheet.classList.remove('open'); document.querySelector('#scrim').classList.remove('open'); setTimeout(() => sheet.remove(), 250); };
  document.querySelector('#scrim').addEventListener('click', close, {once:true});
}

pageHost.addEventListener('click', event => {
  const node = event.target.closest('.node'); if (node) { showDetail('knowledge', node.childNodes[0].textContent.trim()); return; }
  const source = event.target.closest('.source-row'); if (source) { showDetail('source', source.querySelector('strong').textContent); return; }
  const collect=event.target.closest('.collect-small');if(collect){const card=collect.closest('.uncollected-card'),item=card._knowledgeItem,on=PinMindState.toggleCollected(item,item.digestDate);if(on){card.remove();if(!pageHost.querySelector('.uncollected-card'))renderUncollectedItems();}return;}
  if (event.target.closest('#captureButton')) showCaptureSheet();
});

let draggedModule = null;
pageHost.addEventListener('dragstart', event => { const card=event.target.closest('.knowledge-module'); if(card){draggedModule=card; card.classList.add('dragging');} });
pageHost.addEventListener('dragend', () => { if(draggedModule) draggedModule.classList.remove('dragging'); draggedModule=null; });
pageHost.addEventListener('dragover', event => { const board=event.target.closest('.draggable-board'); if(!board||!draggedModule)return; event.preventDefault(); const target=event.target.closest('.knowledge-module'); if(target&&target!==draggedModule) board.insertBefore(draggedModule,target); else if(!target) board.appendChild(draggedModule); });
pageHost.addEventListener('click', event => {
  const remove=event.target.closest('.module-delete');
  if(remove){event.preventDefault();event.stopPropagation();const card=remove.closest('.knowledge-module'),title=card.querySelector('h3')?.textContent||'',key=card.dataset.id||title,set=storedSet('pinmind.deleted');set.add('module:'+key);saveSet('pinmind.deleted',set);if(card.dataset.saved){const item=PinMindState.library().find(entry=>entry.headline===title);if(item&&PinMindState.isCollected(item))PinMindState.toggleCollected(item,item.digestDate);pageHost.querySelectorAll('[data-saved]').forEach(view=>{if(view!==card&&view.textContent.includes(title))view.remove();});}card.classList.add('removing');setTimeout(()=>card.remove(),160);return;}
  const view=event.target.closest('[data-library-view]');
  if(view?.dataset.libraryView==='graph'){
    const graphCount=pageHost.querySelectorAll('.knowledge-module').length;
    pageHost.querySelector('.graph-node.hub small').textContent=`${graphCount} 条知识`;
    pageHost.querySelector('.graph-toolbar span').textContent='拖动节点 · 使用滚轮缩放 · 双击查看详情';
  }
  if(view){document.querySelectorAll('[data-library-view]').forEach(button=>button.classList.toggle('active',button===view));['board','hierarchy','graph'].forEach(name=>{const el=document.querySelector('#'+name+'View');if(el)el.hidden=view.dataset.libraryView!==name;});if(view.dataset.libraryView==='graph')requestAnimationFrame(updateGraphEdges);return;}
  const module=event.target.closest('.knowledge-module');if(module)showDetail('knowledge',module.querySelector('h3').textContent);
},true);
pageHost.addEventListener('pointerdown', event => {
  const node=event.target.closest('.graph-node');if(!node)return;node.setPointerCapture(event.pointerId);const canvas=node.parentElement;const rect=canvas.getBoundingClientRect();
  const move=e=>{node.style.left=(Math.max(4,Math.min(96,(e.clientX-rect.left)/rect.width*100)))+'%';node.style.top=(Math.max(5,Math.min(95,(e.clientY-rect.top)/rect.height*100)))+'%';updateGraphEdges();};
  node.addEventListener('pointermove',move);node.addEventListener('pointerup',()=>node.removeEventListener('pointermove',move),{once:true});
});



function updateGraphEdges(){
  const canvas=document.querySelector('#graphCanvas');if(!canvas||canvas.hidden)return;
  const svg=canvas.querySelector('svg');const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.innerHTML='';
  canvas.querySelectorAll('[data-connect]').forEach(node=>{const parent=canvas.querySelector(`[data-node="${node.dataset.connect}"]`);if(!parent||node.hidden||parent.hidden)return;const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',parent.offsetLeft);line.setAttribute('y1',parent.offsetTop);line.setAttribute('x2',node.offsetLeft);line.setAttribute('y2',node.offsetTop);svg.appendChild(line);});
}

pageHost.addEventListener('click',event=>{
  const toggle=event.target.closest('[data-filter-toggle]');
  if(toggle){event.stopPropagation();const menu=pageHost.querySelector(`[data-filter-menu="${toggle.dataset.filterToggle}"]`);pageHost.querySelectorAll('.filter-menu').forEach(item=>{if(item!==menu)item.classList.remove('open')});menu.classList.toggle('open');return;}
  const option=event.target.closest('[data-filter-menu] [data-value]');
  if(option){event.stopPropagation();const menu=option.closest('.filter-menu');const type=menu.dataset.filterMenu;const trigger=pageHost.querySelector(`[data-filter-toggle="${type}"]`);trigger.textContent=option.textContent;menu.classList.remove('open');
    if(type==='theme'){pageHost.querySelectorAll('.cluster').forEach(cluster=>cluster.hidden=option.dataset.value!=='all'&&cluster.dataset.theme!==option.dataset.value);pageHost.querySelectorAll('.graph-node:not(.hub)').forEach(node=>node.hidden=option.dataset.value!=='all'&&node.dataset.theme!==option.dataset.value);updateGraphEdges();}
    if(type==='time'){pageHost.querySelectorAll('.knowledge-module').forEach(card=>card.hidden=option.dataset.value==='7'&&(/8月(7|8|10)日/.test(card.textContent)));}
    return;
  }
  const hierarchyItem=event.target.closest('.hierarchy-list button');if(hierarchyItem)showDetail('knowledge',hierarchyItem.querySelector('strong').textContent);
},true);

document.addEventListener('click',event=>{if(!event.target.closest('.filter-control'))document.querySelectorAll('.filter-menu').forEach(menu=>menu.classList.remove('open'));});
window.addEventListener('resize',updateGraphEdges);

pageHost.addEventListener('change',event=>{if(event.target.matches('input[type=time]')){localStorage.setItem('pinmind.dailyTime',event.target.value);if(typeof updateDailySchedule==='function')updateDailySchedule();}});


function applySourceFilters(){const type=pageHost.dataset.sourceType||'all',status=pageHost.dataset.sourceStatus||'all';pageHost.querySelectorAll('.source-row').forEach(row=>{const hidden=(type!=='all'&&row.dataset.sourceType!==type)||(status!=='all'&&row.dataset.sourceStatus!==status);row.hidden=hidden;row.style.display=hidden?'none':'';});}
pageHost.addEventListener('click',event=>{
  const toggle=event.target.closest('[data-source-filter-toggle]');if(toggle){event.stopPropagation();const menu=pageHost.querySelector(`[data-source-filter-menu="${toggle.dataset.sourceFilterToggle}"]`);pageHost.querySelectorAll('.filter-menu').forEach(item=>{if(item!==menu)item.classList.remove('open')});menu.classList.toggle('open');return;}
  const option=event.target.closest('[data-source-filter-menu] [data-value]');if(option){event.stopPropagation();const menu=option.closest('[data-source-filter-menu]'),kind=menu.dataset.sourceFilterMenu;pageHost.dataset[kind==='type'?'sourceType':'sourceStatus']=option.dataset.value;pageHost.querySelector(`[data-source-filter-toggle="${kind}"]`).textContent=option.textContent;menu.classList.remove('open');applySourceFilters();return;}
  if(event.target.closest('[data-retry-sources]')){loadLiveSources();return;}
  const danger=event.target.closest('.uncollected-card .danger');if(danger){event.stopPropagation();showDeleteConfirm(danger.closest('.uncollected-card'));}
},true);
function showDeleteConfirm(card){const dialog=document.createElement('div');dialog.className='confirm-dialog';dialog.innerHTML='<h2>删除这条未收录知识？</h2><p>删除后将无法恢复，但不会删除原始来源记录。</p><div><button class="cancel-delete">取消</button><button class="confirm-delete">确认删除</button></div>';document.body.appendChild(dialog);document.querySelector('#scrim').classList.add('open');requestAnimationFrame(()=>dialog.classList.add('open'));const close=()=>{dialog.classList.remove('open');document.querySelector('#scrim').classList.remove('open');setTimeout(()=>dialog.remove(),180)};dialog.querySelector('.cancel-delete').addEventListener('click',close);dialog.querySelector('.confirm-delete').addEventListener('click',()=>{const set=storedSet('pinmind.deleted');set.add(card.querySelector('h2')?.textContent||'');saveSet('pinmind.deleted',set);if(card._knowledgeItem)PinMindState.deleteUncollected(card._knowledgeItem);card.remove();close()});}
pageHost.addEventListener('wheel',event=>{const canvas=event.target.closest('#graphCanvas');if(!canvas)return;event.preventDefault();const factor=event.deltaY<0?1.1:.9;let zoom=parseFloat(canvas.dataset.zoom||'1');const next=Math.max(.65,Math.min(1.65,zoom*factor));const applied=next/zoom;canvas.dataset.zoom=String(next);canvas.querySelectorAll('.graph-node').forEach(node=>{const left=parseFloat(node.style.left),top=parseFloat(node.style.top);node.style.left=(50+(left-50)*applied)+'%';node.style.top=(50+(top-50)*applied)+'%';});updateGraphEdges();},{passive:false});


const searchScopeResults={
  library:`<article><span>AI 产品设计</span><h2><mark>AI</mark> 自动化程度越高，越需要保留用户的关键决策权。</h2><p>AI 适合代替用户完成重复、低风险且可撤销的操作……</p><small>来源：《AI Agent 的产品边界》</small></article><article><span>用户信任</span><h2>可理解和可撤销，决定用户是否接受自动化。</h2><p>错误发生后仍需要清晰、低成本的恢复路径。</p><small>来源：《生成式 AI 产品的信任设计》</small></article>`,
  uncollected:`<article><span>未收录 · AI 产品</span><h2>模型能力不是产品价值，稳定解决问题才是。</h2><p>模型升级只有转化为更低的失败率、更少的等待和更清晰的结果，才构成产品价值。</p><small>来自 8月16日知识单</small></article>`,
  sources:`<article><span>来源记录 · 网页链接</span><h2>AI Agent 的产品边界</h2><p>少数派 · 今天 16:42 · 解析完成</p><small>已生成 2 条知识</small></article><article><span>来源记录 · 文字</span><h2>用户访谈摘录：智能与控制感</h2><p>微信 · 今天 14:18 · 解析完成</p><small>已生成 1 条知识</small></article>`
};
pageHost.addEventListener('dblclick',event=>{
  const tab=event.target.closest('[data-search-scope]');if(tab){pageHost.querySelectorAll('[data-search-scope]').forEach(item=>item.classList.toggle('active',item===tab));const list=pageHost.querySelector('.result-list');if(list)list.innerHTML=searchScopeResults[tab.dataset.searchScope];return;}
  const graphNode=event.target.closest('.graph-node');if(graphNode){const title=graphNode.childNodes[0].textContent.trim();showGraphDetail(title);}
});
function showGraphDetail(title){
  const details={
    '知识库':['知识正在按主题形成连接。','当前包含 AI 产品设计、知识管理与用户研究等主题。点击具体节点可以继续查看完整知识。'],
    'AI 产品设计':['AI 自动化程度越高，越需要保留用户的关键决策权。','涉及资产、公开表达或他人权益时，最终确认权必须回到用户手中。'],
    '知识管理':['收藏只有被重新调用时，才真正成为知识。','有效的知识系统需要把信息转化为可检索、有关联、可复用的表达。'],
    '用户控制权':['用户信任来自可理解、可控制和可撤销。','系统应解释即将发生的动作，并为错误结果提供清晰的恢复路径。'],
    '可复用表达':['知识应当能够脱离原文独立成立。','保留结论、条件、论据和来源，才能在下一次思考中重新使用。'],
    '恢复路径':['自动化必须设计失败后的恢复方式。','恢复成本越高，越需要在动作发生前请求人工确认。']
  };const content=details[title]||[title,'该节点的知识内容正在整理。'];
  const drawer=document.querySelector('#drawer');drawer.querySelector('header p').textContent='知识详情';drawer.querySelector('header h2').textContent=content[0];drawer.querySelector('.drawer-body').innerHTML=`<span class="topic-tag mint">${title}</span><p class="drawer-lead">${content[1]}</p><h3>关联说明</h3><p>该知识与当前图谱中的相邻节点存在主题或论据关联。</p><div class="source-panel"><span>由 PinMind AI 基于原始内容整理，请结合来源判断。</span><a href="https://sspai.com/">查看原始来源 ↗</a></div>`;drawer.classList.add('open');document.querySelector('#scrim').classList.add('open');drawer.setAttribute('aria-hidden','false');
}
pageHost.addEventListener('click',async event=>{
  if(event.target.closest('#saveApiBase')){const input=pageHost.querySelector('#apiBaseInput'),status=pageHost.querySelector('#apiStatus');const value=input.value.trim().replace(/\/$/,'');if(value&&!/^https:\/\//.test(value)&&!/^http:\/\/(127\.0\.0\.1|10\.0\.2\.2)/.test(value)){status.textContent='正式环境必须使用 HTTPS';status.className='error';return;}localStorage.setItem('pinmind.apiBase',value);window.PinMindNative?.setApiBase?.(value);status.textContent=value?'已保存':'未配置';status.className='ok';}
  if(event.target.closest('#testApiBase')){const status=pageHost.querySelector('#apiStatus');status.textContent='连接中…';try{const health=await PinMindAPI.health();status.textContent=health.ai_configured?'连接成功 · AI 已配置':'连接成功 · 尚未配置 API Key';status.className=health.ai_configured?'ok':'warn';}catch(error){status.textContent='连接失败：'+error.message;status.className='error';}}
});
