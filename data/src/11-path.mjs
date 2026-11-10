export const path = [
  {
    id: 's1', title: '① 地基：先想清楚「闭环是什么」', hours: '2–3 小时',
    goal: '能在一分钟内讲清定义、环节、飞轮与三个量化指标，后面所有细节都挂在这根骨架上。',
    nodes: ['root', 'why.flywheel', 'why.longtail', 'why.paradigm', 'why.metric', 'why.maturity', 'why.cost', 'why.e2e'],
  },
  {
    id: 's2', title: '② 数据怎么来：采集、触发、回传', hours: '1 天',
    goal: '掌握「采什么、为什么采、怎么传回来、怎么合规」，能设计一套触发与配额方案。',
    nodes: ['collect.sensor', 'collect.sync', 'collect.calib', 'collect.trigger', 'collect.trig-event', 'collect.trig-shadow', 'collect.trig-random', 'collect.edge', 'collect.backhaul', 'collect.volume', 'collect.privacy', 'collect.compliance', 'stack.vehicle', 'stack.mesh', 'stack.dds'],
  },
  {
    id: 's3', title: '③ 数据怎么存怎么找：平台与检索', hours: '1 天',
    goal: '能画出「接入-存储-治理-加工-服务」五层，讲清 StarRocks/ES/HBase 的分工与千亿级检索的设计取舍。',
    nodes: ['infra.oss', 'infra.lake', 'infra.meta', 'infra.index', 'infra.version', 'infra.pipeline', 'infra.platform', 'infra.split', 'infra.leakage', 'stack.arch', 'stack.parse', 'stack.starrocks', 'stack.storage', 'stack.stack', 'ops.def', 'ops.pipeline', 'ops.registry', 'ops.idempotent'],
  },
  {
    id: 's4', title: '④ 数据怎么变成样本：挖掘、标注、配比', hours: '1–1.5 天',
    goal: '这是最容易被深挖的一块：难例怎么挖、自动标注怎么保质量、样本中心怎么设计、配比怎么定。',
    nodes: ['mine.scenario', 'mine.lib', 'mine.taxonomy', 'mine.mining', 'mine.failure', 'mine.uncertainty', 'mine.cluster', 'mine.retrieval', 'mine.autolabel', 'mine.teacher', 'mine.4d', 'mine.traj', 'mine.qa', 'mine.spec', 'mine.human', 'mine.ratio', 'mine.labelcost', 'stack.mine', 'stack.label', 'stack.sample', 'stack.pre'],
  },
  {
    id: 's5', title: '⑤ 模型与评测：训练、仿真、门禁', hours: '1–1.5 天',
    goal: '能说清训练平台的瓶颈、开环与闭环的区别、仿真置信度怎么证、回归门禁怎么设。',
    nodes: ['train.platform', 'train.dataloader', 'train.repro', 'train.bev', 'train.e2e-model', 'train.distill', 'train.ft', 'train.iteration', 'eval.offline', 'eval.openloop', 'eval.closedloop', 'eval.sim', 'eval.sil', 'eval.replay', 'eval.coverage', 'eval.sim2real', 'eval.regression', 'eval.ab', 'eval.kpi', 'eval.safety'],
  },
  {
    id: 's6', title: '⑥ 回到车上：部署、影子、回流', hours: '半天',
    goal: '这是闭环真正合上的地方，也是面试官判断「你懂不懂落地」的分水岭。',
    nodes: ['deploy.compress', 'deploy.quant', 'deploy.chip', 'deploy.ota', 'deploy.rollback', 'deploy.shadow', 'deploy.diff', 'deploy.monitor', 'deploy.badcase', 'deploy.incident', 'deploy.consistency', 'deploy.diagnose', 'stack.shadow4', 'stack.config', 'stack.signal', 'ops.infer', 'ops.coverage', 'ops.custom', 'ops.precision'],
  },
  {
    id: 's7', title: '⑦ 面试冲刺：表达、ROI、反问', hours: '2 小时',
    goal: '把知识变成可讲的叙事：四段式、三个量化数、一个失败故事、两句反问。',
    nodes: ['org.interview', 'org.star', 'org.flywheelmetric', 'org.roi', 'org.team', 'org.roadmap', 'org.pitfall', 'why.pitfall'],
  },
];
