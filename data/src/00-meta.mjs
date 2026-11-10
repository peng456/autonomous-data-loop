// 领域定义 + 根节点
export const domains = [
  { key: 'why',     name: '范式与价值',   color: '#7c9cff', desc: '为什么需要闭环：长尾、飞轮、数据驱动范式' },
  { key: 'collect', name: '采集与回传',   color: '#3fd6a4', desc: '传感器、触发策略、车端筛选、回传与合规' },
  { key: 'infra',   name: '数据基础设施', color: '#9b8cff', desc: '存储、元数据、检索、版本、治理' },
  { key: 'mine',    name: '场景挖掘与标注', color: '#ff9f5a', desc: '场景库、标签、难例、自动标注、质量' },
  { key: 'train',   name: '模型训练',     color: '#ff6b8b', desc: '训练平台、数据配比、BEV/端到端/世界模型' },
  { key: 'eval',    name: '仿真与评测',   color: '#56c8e8', desc: '离线指标、仿真、回归、A/B、安全' },
  { key: 'deploy',  name: '部署与回流',   color: '#c0e05a', desc: '压缩部署、OTA、影子模式、Bad Case' },
  { key: 'org',     name: '组织与工具链', color: '#b0a8c0', desc: '分工、指标、ROI、路线图、面试表达' },
  { key: 'stack',   name: '系统架构',     color: '#d4b0ff', desc: '车端链路、mesh、解析、StarRocks、样本中心、影子四层' },
  { key: 'ops',     name: '算子',         color: '#ff5f6d', desc: '数据加工算子、推理算子、覆盖率、精度对齐' },
];

export const root = {
  id: 'root',
  t: '数据闭环',
  en: 'Data Closed Loop / Data Engine',
  d: 'core',
  lv: 1,
  def: '把「真实世界产生的数据」持续转化为「车端模型能力」的工程体系：车端采集 → 回传 → 存储治理 → 场景挖掘与标注 → 训练 → 仿真评测 → 部署上车 → 再产生数据，形成自我强化的飞轮。本质是用数据规模与数据质量换长尾场景的覆盖速度。',
  pts: [
    '闭环的判据不是「有链路」，而是「单位时间能处理多少有效长尾、多久回到车上」',
    '两个关键比率：数据利用率（采回的数据有多少进了训练）与闭环周期（从发现问题到新模型上车）',
    '它同时是技术体系（工具链）和组织体系（谁为数据质量负责）',
  ],
  q: '一句话定义 + 三个环节 + 一个量化指标（闭环周期或数据利用率），比背八个步骤更像真的做过。',
  pit: '把「数据闭环」说成「数据标注流水线」是常见降级回答，闭环的重点在「反馈」与「自动化」。',
};
