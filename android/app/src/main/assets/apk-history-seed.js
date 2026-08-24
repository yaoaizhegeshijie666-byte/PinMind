const apkCard=(id,type,headline,topic,source,content,items=[])=>({id,owner_id:'apk-example',type,headline,graph_label:topic,topic_names:[topic],tags:[topic],source_ids:[source],content_completeness:'complete',sections:[{kind:'overview',level:0,title:'核心结论',content,items}]});
window.PinMindApkSources=[
{id:'apk_a01',title:'直播电商 vs 传统电商的差异分析',url:'https://xhslink.cn/o/6MKS8AxFtIR'},
{id:'apk_a02',title:'AI 产品经理怎么做评测',url:'https://xhslink.cn/o/3TQZ5fshMGU'},
{id:'apk_a03',title:'即时零售是什么',url:'https://www.xiaohongshu.com/discovery/item/689d5d22000000001d01cd67'},
{id:'apk_a04',title:'一图搞懂什么是智能体 Agent',url:'https://www.xiaohongshu.com/discovery/item/6a6f4a0900000000050219dc'},
{id:'apk_a05',title:'大厂押注 AI 办公，飞书和钉钉却先成了配角',url:'https://www.xiaoyuzhoufm.com/episode/6a6da28d1b5e24969ce72d4c'}
];
const apkKnowledge=[
apkCard('demo_new_k1','framework','直播电商的核心价值，是降低用户决策成本、提高商家转化并补全平台交易闭环','直播电商','apk_a01','直播电商应从出现原因、三端价值、目标用户和平台差异四部分分析，而不是简化成低价卖货。',['用户端：选品、讲解和优惠降低决策成本','商家端：获得高转化渠道、品牌曝光与私域沉淀','平台端：从广告变现延伸到交易闭环']),
apkCard('demo_new_k2','method','AI 产品评测要形成“目标—数据集—评分—归因—回归”的五步闭环','AI产品评测','apk_a02','先明确评什么与不评什么，再用稳定数据集和评分规则定位问题，最后以回归测试验证优化结果。',['核心场景60%','边缘场景30%','红队测试10%']),
apkCard('demo_new_k3','concept','即时零售是线上下单、线下近场履约，并在1—2小时内送达的零售模式','即时零售','apk_a03','即时零售通过平台模式、前置仓和店仓一体三种基础模式完成近场履约。',['美团闪购：骑手网络与强时效','京东秒送：供应链与物流确定性','淘宝闪购：连接饿了么供给与淘天品牌商家']),
apkCard('demo_new_k4','concept','智能体是能够理解目标、调用工具、利用知识并自主完成任务的 AI 系统','AI智能体','apk_a04','智能体由提示词、大模型、知识库、插件和工作流共同组成。',['提示词定义角色与目标','大模型负责理解与分析','知识库提供长期记忆','插件提供行动能力','工作流规定执行路径']),
apkCard('demo_new_k5','viewpoint','AI 办公的主角正从协同软件转向能直接完成任务的 Agent','AI办公','apk_a05','节目嘉宾认为，飞书与钉钉可能转向 AI 办公基础设施；独立产品则可能以更快速度验证任务交付。',['企业产品依赖组织数据与权限','个人产品以具体任务交付为入口','模型趋同后壁垒转向场景、权限与稳定交付']),
apkCard('demo_new_k6','analysis','飞书拆分反映旧协同平台与新 AI 产品需要不同的组织和迭代方式','AI办公','apk_a05','节目材料称飞书部分团队与汇报关系发生调整；其产品含义是为 AI 办公提供独立试错空间。'),
apkCard('demo_new_k7','analysis','豆包的高日活是入口优势，办公价值仍取决于任务完成与付费闭环','AI办公','apk_a05','高活跃不等于办公商业化成立，应检验高价值任务进入率、交付稳定性和成本收入关系。')
];
window.PinMindApkHistory=()=>{const key=offset=>{const date=new Date();date.setDate(date.getDate()-offset);return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')};return [
{digest_date:key(1),knowledge_items:apkKnowledge.slice(0,3)},
{digest_date:key(2),knowledge_items:apkKnowledge.slice(3,5)},
{digest_date:key(3),knowledge_items:apkKnowledge.slice(5,7)}
]};