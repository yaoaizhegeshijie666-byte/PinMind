const PINMIND_DEMO_SOURCES=[
  {id:'demo_live_commerce',owner_id:'demo',input_type:'link',title:'直播电商的产品与商业逻辑',url:'https://xhslink.cn/o/6MKS8AxFtIR',status:'generated',parse_status:'success',captured_at:new Date().toISOString(),generated_knowledge_ids:['demo_k1']},
  {id:'demo_ai_evaluation',owner_id:'demo',input_type:'link',title:'AI产品经理如何搭建评测体系',url:'https://xhslink.cn/o/3TQZ5fshMGU',status:'generated',parse_status:'success',captured_at:new Date().toISOString(),generated_knowledge_ids:['demo_k2']},
  {id:'demo_ai_social',owner_id:'demo',input_type:'link',title:'AI参与社交的边界与机会',url:'https://xhslink.cn/o/6GAOdkZTpgm',status:'generated',parse_status:'success',captured_at:new Date().toISOString(),generated_knowledge_ids:['demo_k3']}
];
const PINMIND_DEMO_KNOWLEDGE=[
  {id:'demo_k1',owner_id:'demo',type:'concept',headline:'理解直播电商，需要同时观察用户、商家、平台与基础设施',graph_label:'直播电商',topic_names:['直播电商'],tags:['电商','平台策略'],source_ids:['demo_live_commerce'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'直播电商的成立逻辑可以从 Why、三端价值、目标用户和平台差异四部分理解。',items:['为什么需要直播电商','用户、商家与平台价值','目标用户','快手、抖音与淘宝的差异']},
    {kind:'framework',level:1,title:'Why：从四个层面理解直播电商',content:'直播电商不是单一的低价销售工具，需要同时分析用户需求、商家经营、平台分发以及支付物流等基础设施。',items:[]},
    {kind:'mechanism',level:1,title:'直播电商的三端价值',content:'用户获得更直观的商品理解和决策辅助，商家获得内容化经营与转化场景，平台则延长消费链路并提升交易效率。',items:['用户端：降低理解与选择成本','商家端：将内容、互动和交易连接起来','平台端：承接流量并形成商业闭环']},
    {kind:'framework',level:1,title:'目标用户与平台判断',content:'目标用户取决于品类决策难度、内容消费习惯和价格敏感度；比较平台时应关注流量关系、内容机制和电商基础，而不是只比较成交规模。',items:['快手：更强调信任关系','抖音：更依赖内容分发效率','淘宝：更接近成熟交易场域']}
  ]},
  {id:'demo_k2',owner_id:'demo',type:'method',headline:'AI产品评测要先明确目标，再选择指标、样本与评测方式',graph_label:'AI产品评测',topic_names:['AI产品'],tags:['评测体系','产品方法'],source_ids:['demo_ai_evaluation'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'一套可用的AI评测体系由评测目标、指标体系、样本集合、执行方法和结果应用共同组成。',items:['明确评测目标','设计指标与样本','组合自动和人工评测','将结果用于迭代']},
    {kind:'framework',level:1,title:'先定义评测目标',content:'评测模型能力、产品体验和业务结果是不同问题；目标不清会导致指标很多，但无法支持产品决策。',items:['模型层：准确性、稳定性与安全性','产品层：任务完成率、可理解性与可控性','业务层：使用、留存与成本']},
    {kind:'method',level:1,title:'建立分层样本集',content:'样本既要覆盖高频主链路，也要包含边界条件和已知失败案例，并保留一组稳定样本用于版本间比较。',items:['高频真实任务','边界与风险场景','历史失败样本','固定回归集合']},
    {kind:'boundary',level:1,title:'自动评测不能完全代替人工判断',content:'格式、关键词和部分事实可自动检查，但有用性、自然度和用户信任仍需要人工评审或真实用户行为验证。',items:[]}
  ]},
  {id:'demo_k3',owner_id:'demo',type:'viewpoint',headline:'AI更适合承担社交辅助角色，而不是直接替代真实关系',graph_label:'AI社交',topic_names:['AI社交'],tags:['用户体验','产品边界'],source_ids:['demo_ai_social'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'判断AI社交机会，需要区分关系类型、介入阶段、用户预期和错误成本。',items:['适用场景','产品角色','核心风险','设计原则']},
    {kind:'framework',level:1,title:'AI适合低关系压力或明确任务场景',content:'陌生人破冰、表达建议、信息筛选和对话复盘具有清晰任务边界，AI的介入更容易被理解。',items:['破冰与话题建议','表达润色','信息过滤','沟通复盘']},
    {kind:'boundary',level:1,title:'成熟关系对真实性更敏感',content:'当交流承担情感确认和关系维护功能时，未经说明的AI代写可能降低真诚感，甚至破坏信任。',items:[]},
    {kind:'method',level:1,title:'设计重点是辅助，而不是替用户社交',content:'系统应说明AI准备做什么，允许用户修改和确认，并避免在高关系风险场景中自动发送。',items:['执行前展示结果','提供修改和撤销','高风险沟通由用户最终确认']}
  ]}
];
(function enablePinMindDemo(){
  const date=new Date(),today=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
  window.PinMindDemo={enabled:true,today,sources:PINMIND_DEMO_SOURCES,knowledge:PINMIND_DEMO_KNOWLEDGE};
  const original={today:PinMindAPI.today.bind(PinMindAPI),sources:PinMindAPI.sources.bind(PinMindAPI),history:PinMindAPI.history.bind(PinMindAPI)};
  PinMindAPI.sources=async()=>{try{const live=await original.sources();return {sources:[...PINMIND_DEMO_SOURCES,...(live.sources||[])]}}catch{return {sources:PINMIND_DEMO_SOURCES}}};
  PinMindAPI.today=async()=>{try{const live=await original.today();if(live.knowledge_items?.length)return live}catch{}return {digest_date:today,knowledge_items:PINMIND_DEMO_KNOWLEDGE}};
  PinMindAPI.history=async()=>{try{return await original.history()}catch{return {digests:[]}}};
  if(!localStorage.getItem('pinmind.demoSeeded')){const mapped=mapKnowledgeItems(PINMIND_DEMO_KNOWLEDGE.slice(0,2),PINMIND_DEMO_SOURCES).map(item=>({...item,digestDate:today}));localStorage.setItem('pinmind.libraryItems',JSON.stringify(mapped));localStorage.setItem('pinmind.collected',JSON.stringify(mapped.map(item=>item.headline)));localStorage.setItem('pinmind.demoSeeded','1');}
  document.addEventListener('DOMContentLoaded',()=>{const badge=document.createElement('div');badge.className='demo-banner';badge.innerHTML='<span><strong>Web Demo</strong> · 已准备3篇代表性知识，可直接体验完整流程</span><button>重置演示</button>';badge.querySelector('button').addEventListener('click',()=>{Object.keys(localStorage).filter(key=>key.startsWith('pinmind.')).forEach(key=>localStorage.removeItem(key));location.reload()});document.body.appendChild(badge)});
})();
