const PINMIND_DEMO_SOURCES=[
  {id:'demo_live_commerce',owner_id:'demo',input_type:'link',title:'直播电商的产品与商业逻辑',url:'https://xhslink.cn/o/6MKS8AxFtIR',status:'generated',parse_status:'success',captured_at:new Date().toISOString(),generated_knowledge_ids:['demo_k1']},
  {id:'demo_ai_evaluation',owner_id:'demo',input_type:'link',title:'AI产品经理如何搭建评测体系',url:'https://xhslink.cn/o/3TQZ5fshMGU',status:'generated',parse_status:'success',captured_at:new Date().toISOString(),generated_knowledge_ids:['demo_k2']},
  {id:'demo_ai_social',owner_id:'demo',input_type:'link',title:'AI参与社交的边界与机会',url:'https://xhslink.cn/o/6GAOdkZTpgm',status:'generated',parse_status:'success',captured_at:new Date().toISOString(),generated_knowledge_ids:['demo_k3']},
  {id:'demo_growth',owner_id:'demo',input_type:'link',title:'增长产品的指标拆解方法',url:'https://example.com/growth-metrics',status:'generated',parse_status:'success',captured_at:new Date(Date.now()-86400000).toISOString(),generated_knowledge_ids:['demo_k4']},
  {id:'demo_interview',owner_id:'demo',input_type:'text',title:'产品经理需求判断笔记',url:'',status:'generated',parse_status:'success',captured_at:new Date(Date.now()-172800000).toISOString(),generated_knowledge_ids:['demo_k5']},
  {id:'demo_recommendation',owner_id:'demo',input_type:'link',title:'推荐系统如何处理探索与利用',url:'https://example.com/recommendation',status:'generated',parse_status:'success',captured_at:new Date(Date.now()-259200000).toISOString(),generated_knowledge_ids:['demo_k6']},
  {id:'demo_retention',owner_id:'demo',input_type:'image',title:'留存分析学习截图',url:'',status:'generated',parse_status:'success',captured_at:new Date(Date.now()-345600000).toISOString(),generated_knowledge_ids:['demo_k7']}
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
  ]},
  {id:'demo_k4',owner_id:'demo',type:'framework',headline:'增长指标应从业务目标逐层拆到可被产品动作影响的行为指标',graph_label:'指标拆解',topic_names:['增长产品'],tags:['指标体系','增长'],source_ids:['demo_growth'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'指标拆解的关键不是罗列数据，而是建立业务结果、用户行为与产品动作之间的因果链。',items:['确定北极星指标','拆解关键行为','定位转化瓶颈','设计验证实验']},
    {kind:'method',level:1,title:'从结果指标回推关键行为',content:'先明确业务希望获得的长期价值，再找到能够预测该价值的用户行为，最后把行为映射到具体产品触点。',items:['结果层：收入、留存或交易规模','行为层：激活、复访与关键功能使用','动作层：入口、流程和触达策略']}
  ]},
  {id:'demo_k5',owner_id:'demo',type:'method',headline:'需求优先级取决于用户价值、覆盖范围、战略匹配与实现成本',graph_label:'需求判断',topic_names:['产品方法'],tags:['需求管理','优先级'],source_ids:['demo_interview'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'判断需求时要区分用户表达的方案与背后的真实问题，再用统一维度比较不同机会。',items:['还原问题场景','验证影响范围','判断业务价值','评估成本与风险']},
    {kind:'framework',level:1,title:'先判断问题是否值得解决',content:'高频不等于高价值，低频问题也可能造成关键任务失败；应结合发生频率、影响强度和替代方案共同判断。',items:[]}
  ]},
  {id:'demo_k6',owner_id:'demo',type:'mechanism',headline:'推荐系统需要在利用已知偏好与探索潜在兴趣之间保持平衡',graph_label:'推荐探索',topic_names:['推荐系统'],tags:['算法产品','用户体验'],source_ids:['demo_recommendation'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'只利用历史偏好会让内容越来越单一，只强调探索又会降低短期点击；产品需要控制探索比例并观察长期价值。',items:['利用：提高即时相关性','探索：发现新兴趣','用长期留存校正短期点击']},
    {kind:'method',level:1,title:'探索应当有边界',content:'新用户、兴趣变化和内容冷启动需要更多探索，但应保留用户反馈入口，并避免连续出现明显不相关内容。',items:[]}
  ]},
  {id:'demo_k7',owner_id:'demo',type:'framework',headline:'留存下降要按用户分群和关键行为路径定位，而不能只看整体平均值',graph_label:'留存分析',topic_names:['增长产品'],tags:['留存','数据分析'],source_ids:['demo_retention'],content_completeness:'complete',sections:[
    {kind:'overview',level:0,title:'知识骨架',content:'整体留存可能掩盖渠道、版本和用户类型之间的差异，诊断时应先分群，再比较留存用户与流失用户的行为路径。',items:['按渠道与版本分群','比较关键行为完成率','定位流失发生节点','验证改动后的分群效果']},
    {kind:'boundary',level:1,title:'相关行为不等于留存原因',content:'高留存用户常用某功能，只能说明两者相关；还需要实验或准实验验证该功能是否真正提升留存。',items:[]}
  ]}
];
const PINMIND_DEMO_CURATED_SOURCES=[
 PINMIND_DEMO_SOURCES[0],PINMIND_DEMO_SOURCES[1],
 {...PINMIND_DEMO_SOURCES[2],id:'demo_instant_retail',title:'即时零售是什么',url:'https://www.xiaohongshu.com/discovery/item/689d5d22000000001d01cd67'},
 {...PINMIND_DEMO_SOURCES[3],id:'demo_agent',title:'一图搞懂什么是智能体 Agent',url:'https://www.xiaohongshu.com/discovery/item/6a6f4a0900000000050219dc'},
 {...PINMIND_DEMO_SOURCES[4],id:'demo_ai_office',title:'大厂押注 AI 办公，飞书和钉钉却先成了配角',url:'https://www.xiaoyuzhoufm.com/episode/6a6da28d1b5e24969ce72d4c'}
];
const curatedCard=(id,type,headline,topic,source,sections)=>({id,owner_id:'demo',type,headline,graph_label:topic,topic_names:[topic],tags:[topic],source_ids:[source],content_completeness:'complete',sections});
const PINMIND_DEMO_CURATED_KNOWLEDGE=[
 curatedCard('demo_new_k1','framework','直播电商的核心价值，是降低用户决策成本、提高商家转化并补全平台交易闭环','直播电商','demo_live_commerce',[
  {kind:'overview',level:0,title:'核心结论',content:'直播电商应从出现原因、三端价值、目标用户和平台差异四部分分析，而不是简化成低价卖货。',items:['用户端：从主动搜索转为被动种草','商家端：从流量采买转向高转化与私域沉淀','平台端：从广告变现延伸到交易闭环']},
  {kind:'mechanism',level:1,title:'用户决策的三重机制',content:'选品、讲解和优惠连续解决买什么、是否适合、现在是否下单三个问题。',items:['选品降低筛选成本','讲解降低理解成本','优惠推动即时决策']},
  {kind:'fact',level:1,title:'核心目标用户',content:'核心用户处于潜在需求、模糊需求或初步决策阶段，集中在18—45岁，女性占比更高，通常价格敏感、碎片时间多。',items:[]}
 ]),
 curatedCard('demo_new_k2','method','AI 产品评测要形成“目标—数据集—评分—归因—回归”的五步闭环','AI产品评测','demo_ai_evaluation',[
  {kind:'overview',level:0,title:'五步闭环',content:'先明确评什么与不评什么，再用稳定数据集和评分规则定位问题，最后以回归测试验证优化结果。',items:['定义目标与边界','构建评测数据集','设计维度与评分细则','执行评测并分类归因','确定优先级并回归验证']},
  {kind:'fact',level:1,title:'数据集结构',content:'数据来自真实用户 case、人工构造 case 和公开数据集；建议按核心场景60%、边缘场景30%、红队测试10%组织。',items:['自动评测跑全量，人工评测抽核心','Bad Case 用“影响面×严重程度”排序','优化后重跑完整评测集']}
 ]),
 curatedCard('demo_new_k3','concept','即时零售是线上下单、线下近场履约，并在1—2小时内送达的零售模式','即时零售','demo_instant_retail',[
  {kind:'overview',level:0,title:'定义与基础模式',content:'消费者在线上平台下单，由线下商家或前置仓快速履约，核心特征是“即需即得”。',items:['平台模式：整合第三方商家与运力','前置仓：以区域仓提升供给密度','店仓一体：门店同时承担销售与履约']},
  {kind:'case',level:1,title:'三家平台的业务侧重',content:'平台都做即时零售，但优势来源不同。',items:['美团闪购：骑手网络，高频且强时效','京东秒送：供应链与物流，侧重3C、家电和商超','淘宝闪购：一级入口连接饿了么供给与淘天品牌商家']}
 ]),
 curatedCard('demo_new_k4','concept','智能体是能够理解目标、调用工具、利用知识并自主完成任务的 AI 系统','AI智能体','demo_agent',[
  {kind:'overview',level:0,title:'五个组成部分',content:'智能体不是单独一个大模型，而是由提示词、大模型、知识库、插件和工作流共同组成。',items:['提示词：定义角色、目标与完成标准','大模型：理解问题、分析并生成决策','知识库：提供专业知识和长期记忆','插件：连接搜索、软件和 API','工作流：规定任务执行步骤与协作路径']}
 ]),
 curatedCard('demo_new_k5','viewpoint','AI 办公的主角正从协同软件转向能直接完成任务的 Agent','AI办公','demo_ai_office',[
  {kind:'viewpoint',level:0,title:'三个核心判断',content:'以下是节目嘉宾的行业判断，并非已经验证的行业定论。',items:['飞书与钉钉可能成为 AI 办公生态的基础设施或入口','旧平台受组织、权限和既有结构约束，独立产品可能迭代更快','个人生产力与企业办公边界模糊，付费主体可能包括个人和企业']},
  {kind:'mechanism',level:1,title:'竞争节奏为什么变快',content:'模型能力趋同后，差异更多来自真实任务、工具调用、数据权限与交付速度。',items:[]}
 ]),
 curatedCard('demo_new_k6','case','飞书拆分反映出旧协同平台与新 AI 产品需要不同的组织和迭代方式','AI办公','demo_ai_office',[
  {kind:'fact',level:0,title:'材料中的现状',content:'节目讨论称，飞书商业化团队并入火山引擎、部分产品团队转向豆包企业版方向，研发汇报关系也发生变化。',items:['以上为节目材料中的信息，不扩展为未经来源支持的事实']},
  {kind:'viewpoint',level:1,title:'可能的产品含义',content:'嘉宾认为，原有飞书体系内的 AI 改造受权限、数据和既有协作逻辑约束；拆分可能提供独立试错空间。',items:[]}
 ]),
 curatedCard('demo_new_k7','analysis','豆包两亿日活是强入口，但能否转化为办公价值取决于任务完成与付费闭环','AI办公','demo_ai_office',[
  {kind:'fact',level:0,title:'已知事实与问题',content:'材料给出的事实是豆包约两亿日活；高活跃意味着触达优势，但不等于办公商业化成立。',items:['C端广告与会员模式面临体验或规模约束','与飞书结合可补充企业入口与品牌信任']},
  {kind:'viewpoint',level:1,title:'判断资产还是负债的标准',content:'应分别检验用户能否进入高价值任务、任务能否稳定交付、成本是否低于付费收入，不能用产品形态未定替代回答。',items:[]}
 ]),
 curatedCard('demo_new_k8','framework','AI 办公的两条路线，分别围绕企业数据权限与个人任务交付建立优势','AI办公','demo_ai_office',[
  {kind:'framework',level:0,title:'两类产品的差异',content:'企业协同类和个人生产力类解决的问题不同，不宜只用日活或模型能力比较。',items:['飞书类：依托组织、数据和权限体系，适合企业复杂流程','Workbody类：抓取本地数据，以个人任务为入口，迭代更快']},
  {kind:'viewpoint',level:1,title:'行业趋势判断',content:'基础模型能力接近后，壁垒更可能来自场景数据、权限连接、任务交付稳定性和可持续付费模型。',items:[]}
 ])
];
(function enablePinMindDemo(){
  const date=new Date(),today=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
  const dateKey=offset=>{const value=new Date(date);value.setDate(value.getDate()-offset);return value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0')};
  const historyGroups=[[PINMIND_DEMO_CURATED_KNOWLEDGE[0],PINMIND_DEMO_CURATED_KNOWLEDGE[2],PINMIND_DEMO_CURATED_KNOWLEDGE[4]],[PINMIND_DEMO_CURATED_KNOWLEDGE[1],PINMIND_DEMO_CURATED_KNOWLEDGE[3]],[PINMIND_DEMO_CURATED_KNOWLEDGE[5],PINMIND_DEMO_CURATED_KNOWLEDGE[6],PINMIND_DEMO_CURATED_KNOWLEDGE[7]]],uncollectedItems=PINMIND_DEMO_CURATED_KNOWLEDGE.slice(6,8);
  window.PinMindDemo={enabled:true,today,sources:PINMIND_DEMO_CURATED_SOURCES,knowledge:PINMIND_DEMO_CURATED_KNOWLEDGE};
  const original={today:PinMindAPI.today.bind(PinMindAPI),sources:PinMindAPI.sources.bind(PinMindAPI),history:PinMindAPI.history.bind(PinMindAPI)};
  PinMindAPI.sources=async()=>{try{const live=await original.sources();return {sources:[...PINMIND_DEMO_CURATED_SOURCES,...(live.sources||[])]}}catch{return {sources:PINMIND_DEMO_CURATED_SOURCES}}};
  PinMindAPI.today=async()=>{try{const live=await original.today();if(live.knowledge_items?.length&&window.dailyTimeReached?.())return live}catch{}const active=window.dailyTimeReached?.()||false,current=window.PinMindSchedule?.localDateKey(new Date())||today;return {digest_date:current,knowledge_items:active?[PINMIND_DEMO_CURATED_KNOWLEDGE[3]]:[]}};
  PinMindAPI.history=async()=>{let live={digests:[]};try{live=await original.history()}catch{}return {digests:[{digest_date:dateKey(1),knowledge_items:historyGroups[0]},{digest_date:dateKey(2),knowledge_items:historyGroups[1]},{digest_date:dateKey(3),knowledge_items:historyGroups[2]},...(live.digests||[])]}};
  if(!localStorage.getItem('pinmind.demoSeededV2')){const mapped=mapKnowledgeItems(PINMIND_DEMO_CURATED_KNOWLEDGE.slice(0,2),PINMIND_DEMO_CURATED_SOURCES).map(item=>({...item,digestDate:today}));localStorage.setItem('pinmind.libraryItems',JSON.stringify(mapped));localStorage.setItem('pinmind.collected',JSON.stringify(mapped.map(item=>item.headline)));localStorage.setItem('pinmind.demoSeededV2','1');}
  if(!localStorage.getItem('pinmind.demoArchiveSeededV2')){const existing=PinMindState.uncollected(),mapped=mapKnowledgeItems(uncollectedItems,PINMIND_DEMO_CURATED_SOURCES).map((item,index)=>({...item,digestDate:dateKey(index+3)}));localStorage.setItem('pinmind.uncollected',JSON.stringify([...existing,...mapped]));localStorage.setItem('pinmind.demoArchiveSeededV2','1');}
})();
