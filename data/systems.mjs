// 系统架构图：可点击的框 → 跳转知识点
// box.node 指向 data/universe 里的节点 id（可为空）
export default [
  {
    id: 'global',
    title: '全局数据流',
    desc: '车端采集 → 云端加工 → 训练 → OTA 下发 → 车端运行 → 影子回流',
    lanes: [
      {
        title: '车端（数据源头）',
        boxes: [
          { id: 'sensor', label: '传感器\n视频 / CAN / Lidar', node: 'collect.sensor' },
          { id: 'enc', label: '编码解码管理\n（信号采集）', node: 'stack.vehicle' },
          { id: 'trig', label: 'trigger\n触发录制', node: 'collect.trigger' },
          { id: 'shadow', label: '影子服务\n并行比对', node: 'deploy.shadow' },
          { id: 'rec', label: 'datarecord\n（本车/量产 OTA）', node: 'stack.vehicle' },
          { id: 'dds', label: 'DDS', node: 'stack.dds' },
          { id: 'mesh1', label: '车云 mesh（车端）', node: 'stack.mesh' },
        ],
      },
      {
        title: '云端（数据平台）',
        boxes: [
          { id: 'mesh2', label: '车云 mesh（云端）', node: 'stack.mesh' },
          { id: 'upload', label: '数据上传', node: 'collect.backhaul' },
          { id: 'comply', label: '数据合规切断\n脱敏 / 加密', node: 'stack.compliance' },
          { id: 'parse', label: '数据解析', node: 'stack.parse' },
          { id: 'mine', label: '数据挖掘\nUGC / 向量 / 标签', node: 'stack.mine' },
          { id: 'label', label: '人工数据标注', node: 'stack.label' },
          { id: 'prep', label: '数据加工\n抽帧 / 打分 / 批次', node: 'stack.pre' },
          { id: 'center', label: '样本中心', node: 'stack.sample' },
          { id: 'factory', label: '样本工厂', node: 'stack.sample' },
        ],
      },
      {
        title: '训练与发布',
        boxes: [
          { id: 'train', label: '模型训练系统', node: 'stack.lpai' },
          { id: 'fs', label: 'JuiceFS\n样本文件系统', node: 'train.dataloader' },
          { id: 'ota1', label: 'OTA 系统（云端）', node: 'stack.ota' },
          { id: 'ota2', label: 'OTA 系统（车端）', node: 'deploy.ota' },
          { id: 'run', label: '车端模型运行', node: 'deploy.monitor' },
        ],
      },
    ],
    links: [
      ['sensor', 'enc'], ['enc', 'trig'], ['trig', 'shadow'], ['trig', 'rec'],
      ['rec', 'dds'], ['dds', 'mesh1'], ['mesh1', 'mesh2'], ['mesh2', 'upload'],
      ['upload', 'comply'], ['comply', 'parse'], ['parse', 'mine'], ['mine', 'label'],
      ['label', 'prep'], ['prep', 'center'], ['center', 'factory'], ['factory', 'train'],
      ['train', 'fs'], ['train', 'ota1'], ['ota1', 'ota2'], ['ota2', 'run'],
      ['run', 'shadow', '回流'],
    ],
    notes: [
      '样本中心是「基础文件 → 样本」的分层：TV / PCD / GPS / autolabel / manual_label，样本只做有限组合，防止无限扩张',
      '样本粒度：2D / 3D / video / clip',
      '技术栈：gin/laravel、Kafka/Redis、Greenplum/TDSQL/ES/StarRocks/OSS/Hive、Go/PHP、docker/k8s',
    ],
  },
  {
    id: 'shadow',
    title: '影子系统',
    desc: '四层架构：前端业务 / 业务层 / 服务层 / 数据库，外加外部依赖',
    lanes: [
      {
        title: '接入',
        boxes: [
          { id: 'web', label: 'web' },
          { id: 'third', label: '第三方' },
          { id: 'gw', label: '网关对外提供服务' },
          { id: 'mq', label: '消息队列', node: 'infra.schedule' },
        ],
      },
      {
        title: '前端业务',
        boxes: [
          { id: 'm1', label: '模型管理' }, { id: 'm2', label: '发布任务管理' },
          { id: 'm3', label: '应用指标' }, { id: 'm4', label: '日志流查询' },
          { id: 'm5', label: '模型打通 CI/CD', node: 'train.iteration' },
          { id: 'm6', label: '配置推送', node: 'stack.config' },
          { id: 'm7', label: '批次管理' }, { id: 'm8', label: '系统指标' },
          { id: 'm9', label: '权限管理' }, { id: 'm10', label: 'trigger 数据闭环', node: 'collect.trigger' },
          { id: 'm11', label: '智能推送' }, { id: 'm12', label: '车辆单任务流程' },
          { id: 'm13', label: '路测报告' }, { id: 'm14', label: '告警' },
          { id: 'm15', label: '车运行时管理' },
        ],
      },
      {
        title: '业务层',
        boxes: [
          { id: 'b1', label: '模型存储' }, { id: 'b2', label: '配置存储' },
          { id: 'b3', label: '车辆推送' }, { id: 'b4', label: '车辆画像' },
          { id: 'b5', label: '数据统计' }, { id: 'b6', label: '采集策略', node: 'collect.trigger' },
          { id: 'b7', label: '日志存储' }, { id: 'b8', label: '任务流程 trace' },
        ],
      },
      {
        title: '服务层',
        boxes: [
          { id: 's1', label: 'upload 服务' }, { id: 's2', label: 'Configor 服务' },
          { id: 's3', label: 'Job 服务' }, { id: 's4', label: 'Kafka 队列服务\n事件数据（驱动）' },
          { id: 's5', label: '加密服务 KMS' }, { id: 's6', label: '大数据服务\n指标统计' },
          { id: 's7', label: 'dataRecord 服务' },
        ],
      },
      {
        title: '数据库',
        boxes: [
          { id: 'd1', label: 'MySQL' }, { id: 'd2', label: 'OSS', node: 'infra.oss' },
          { id: 'd3', label: 'YMtrx' }, { id: 'd4', label: 'ES' },
          { id: 'd5', label: 'HIVE' }, { id: 'd6', label: 'OB' },
        ],
      },
      {
        title: '外部依赖',
        boxes: [
          { id: 'e1', label: '车辆信息' },
          { id: 'e2', label: 'FSD 版本' },
        ],
      },
    ],
    links: [
      ['web', 'gw'], ['third', 'gw'], ['gw', 'mq'], ['mq', 'm2'],
      ['m2', 'b3'], ['m6', 'b2'], ['m10', 'b6'], ['b3', 's1'], ['b2', 's2'],
      ['b8', 's3'], ['b7', 's4'], ['b5', 's6'], ['s1', 'd2'], ['s2', 'd1'],
      ['s3', 'd1'], ['s6', 'd5'], ['e1', 's3'], ['e2', 's3'],
    ],
    notes: [
      '影子系统的两个阀门：智能推送（控回传量）与 trigger 数据闭环（控采集时机）',
      'upload / Configor / Job 是三条主干服务；Kafka 消费与 WS 推送是异步与实时两条腿',
      '外部依赖：车辆信息、FSD 版本等',
    ],
  },
  {
    id: 'vehicle',
    title: '车端采集链路',
    desc: '多传感器 → 编码缓存 → 触发 → 落盘/影子 → 合规 → 上传',
    lanes: [
      {
        title: '传感器',
        boxes: [
          { id: 'v1', label: '视频' }, { id: 'v2', label: 'CAN' },
          { id: 'v3', label: 'Lidar' }, { id: 'v4', label: 'VD / CLIP_VD' },
        ],
      },
      {
        title: '车端处理',
        boxes: [
          { id: 'c1', label: '编码解码管理\n（信号采集，车端）', node: 'stack.vehicle' },
          { id: 'c2', label: '编码解码系统\ntrigger', node: 'collect.trigger' },
          { id: 'c3', label: '影子服务\n（车端）', node: 'deploy.shadow' },
          { id: 'c4', label: 'datarecord\n（本车/量产 OTA）' },
        ],
      },
      {
        title: '传输与合规',
        boxes: [
          { id: 't1', label: '双信号\n（量产车）' },
          { id: 't2', label: 'DDS', node: 'stack.dds' },
          { id: 't3', label: '车云 mesh（车端）', node: 'stack.mesh' },
          { id: 't4', label: '全量数据\nground truth' },
          { id: 't5', label: '数据合规切断\n或安全', node: 'stack.compliance' },
          { id: 't6', label: '数据上传', node: 'collect.backhaul' },
        ],
      },
    ],
    links: [
      ['v1', 'c1'], ['v2', 'c1'], ['v3', 'c1'], ['v4', 'c1'],
      ['c1', 'c2'], ['c2', 'c3'], ['c2', 'c4'], ['c4', 't4'],
      ['t1', 't2'], ['t2', 't3'], ['t4', 't5'], ['t5', 't6'],
    ],
    notes: [
      '触发必须带 pre-trigger 环形缓冲：事故/接管发生时才录，前面 N 秒就丢了',
      '加密传输与存储、脱敏处理（人像/车牌）、车辆脱敏，都在「合规切断」这一环完成',
      '车端资源受限：编码、影子推理、DDS 订阅都要做算力配额，不能抢主链路',
    ],
  },
  {
    id: 'pipeline',
    title: '数据加工与训练',
    desc: '解析 → 挖掘 → 标注 → 加工 → 样本 → 训练 → 评测 → 发布',
    lanes: [
      {
        title: '加工',
        boxes: [
          { id: 'p1', label: '数据解析', node: 'stack.parse' },
          { id: 'p2', label: '数据挖掘\nUGC / 向量 / 标签', node: 'stack.mine' },
          { id: 'p3', label: '预标注 / 人工标注', node: 'stack.label' },
          { id: 'p4', label: '数据加工\n抽帧 / 模型打分', node: 'stack.pre' },
          { id: 'p5', label: '批次 / 样本集', node: 'stack.sample' },
        ],
      },
      {
        title: '训练',
        boxes: [
          { id: 'q1', label: '样本中心', node: 'stack.sample' },
          { id: 'q2', label: '模型训练', node: 'stack.lpai' },
          { id: 'q3', label: '实验 / 权重归档', node: 'train.exp' },
        ],
      },
      {
        title: '评测与发布',
        boxes: [
          { id: 'r1', label: '仿真与回归', node: 'eval.regression' },
          { id: 'r2', label: '模型仓库' },
          { id: 'r3', label: 'OTA 灰度', node: 'deploy.ota' },
          { id: 'r4', label: '车端运行', node: 'deploy.monitor' },
        ],
      },
      {
        title: '回流',
        boxes: [
          { id: 'x1', label: '接管 / 影子差异', node: 'deploy.badcase' },
          { id: 'x2', label: '工单归因', node: 'mine.failure' },
          { id: 'x3', label: '回归用例', node: 'eval.testset' },
        ],
      },
    ],
    links: [
      ['p1', 'p2'], ['p2', 'p3'], ['p3', 'p4'], ['p4', 'p5'], ['p5', 'q1'],
      ['q1', 'q2'], ['q2', 'q3'], ['q3', 'r1'], ['r1', 'r2'], ['r2', 'r3'],
      ['r3', 'r4'], ['r4', 'x1'], ['x1', 'x2'], ['x2', 'x3'], ['x3', 'p2', '重新采样'],
    ],
    notes: [
      '样本 = 基础文件（TV/PCD/GPS/autolabel/manual_label）的组合，支持有限组合防止存储与索引爆炸',
      '闭环断开最常见的三个位置：标注产能、回归门禁、OTA 排期',
      '「数据利用率」与「闭环周期」是这条链路最值得盯的两个数',
    ],
  },
];
