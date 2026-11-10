// 系统架构图：可点击的框 → 跳转知识点
// box.node 指向 data/universe 里的节点 id（可为空）
export default [
  {
    id: 'global',
    title: '全局数据流',
    desc: '车端采集 → 车云 mesh → 云端加工（解析/挖掘/标注/加工/样本中心）→ 训练 → OTA 下发 → 车端运行 → 影子回流',
    // layout:'free' —— 自由坐标布局（复原白板原图：分区 + 括号分组 + 正交箭头）
    layout: 'free',
    canvas: { w: 1620, h: 1010 },
    zones: [
      { label: '车端（数据源头）', x: 26, y: 120, w: 300, h: 500, tone: 'v' },
      { label: '云端（数据平台）', x: 350, y: 120, w: 470, h: 600, tone: 'c' },
      { label: '训练与发布', x: 1040, y: 120, w: 540, h: 380, tone: 't' },
      { label: '技术栈（线上服务）', x: 40, y: 740, w: 430, h: 220, tone: 's' },
    ],
    braces: [
      { label: '数据采集系统（车端）', x: 16, y: 180, h: 380, side: 'l' },
      { label: '真值车 / 众包车（量产车）', x: 252, y: 420, h: 130, side: 'l' },
      { label: '算法部署', x: 1590, y: 300, h: 180, side: 'r' },
    ],
    boxes: [
      { id: 'core',   label: '核心：data-driven', x: 300, y: 64, w: 190, h: 30, kind: 'cloud' },

      // ── 车端 ──
      { id: 'sensor',  label: '传感器\n视频 / CAN / Lidar', x: 45, y: 150, w: 200, h: 50, node: 'collect.sensor' },
      { id: 'enc',     label: '编码解码管理\n（信号采集）', x: 45, y: 218, w: 200, h: 44, node: 'stack.vehicle' },
      { id: 'trig',    label: '编码硬规则 trigger', x: 45, y: 280, w: 200, h: 30, node: 'collect.trigger' },
      { id: 'dds',     label: 'DDS', x: 45, y: 326, w: 200, h: 28, node: 'stack.dds' },
      { id: 'mesh1',   label: '车云通信 mesh（车端）', x: 45, y: 372, w: 200, h: 28, node: 'stack.mesh' },
      { id: 'shadowV', label: '影子服务（车端）\n本身跟随 OTA', x: 45, y: 424, w: 200, h: 48, node: 'deploy.shadow' },
      { id: 'rec',     label: 'datarecord\n（本身跟随 OTA）', x: 45, y: 492, w: 200, h: 44, node: 'stack.vehicle' },
      { id: 'queue',   label: '队列', x: 258, y: 372, w: 52, h: 28, kind: 'pill' },

      // ── 云端 ──
      { id: 'shadowCloud', label: '影子服务（云端）', x: 370, y: 150, w: 220, h: 30, node: 'deploy.shadow' },
      { id: 'shadowModel', label: '影子模型', x: 370, y: 196, w: 220, h: 30, node: 'deploy.diff' },
      { id: 'mesh2',  label: '车云通信 mesh（云端）', x: 370, y: 244, w: 220, h: 28, node: 'stack.mesh' },
      { id: 'upload', label: '数据上报 / 回传', x: 370, y: 288, w: 220, h: 30, node: 'collect.backhaul' },
      { id: 'comply', label: '数据合规与数据安全\n加密传输 · 隐私 · 车牌脱敏', x: 370, y: 334, w: 220, h: 46, node: 'stack.compliance' },
      { id: 'parse',  label: '数据解析', x: 370, y: 396, w: 220, h: 30, node: 'stack.parse' },
      { id: 'mine',   label: '数据挖掘\nUGC / 向量 / 标签', x: 370, y: 442, w: 220, h: 46, node: 'stack.mine' },
      { id: 'label',  label: '人工数据标注', x: 370, y: 504, w: 220, h: 30, node: 'stack.label' },
      { id: 'prep',   label: '数据加工\n抽帧 / 打分 / 批次', x: 370, y: 550, w: 220, h: 46, node: 'stack.pre' },
      { id: 'center', label: '样本中心', x: 370, y: 612, w: 300, h: 32, node: 'stack.sample' },
      { id: 'factory',label: '样本工厂', x: 370, y: 662, w: 200, h: 30, node: 'stack.sample' },
      { id: 'oss',    label: '存储 OSS', x: 690, y: 612, w: 130, h: 30, node: 'stack.storage' },
      { id: 'sr',     label: 'StarRocks 检索', x: 690, y: 658, w: 130, h: 30, node: 'stack.starrocks' },

      // ── 训练与发布 ──
      { id: 'train',  label: '模型训练系统', x: 1060, y: 300, w: 220, h: 32, node: 'stack.lpai' },
      { id: 'fs',     label: '文件系统 JuiceFs', x: 1060, y: 350, w: 220, h: 30, node: 'train.dataloader' },
      { id: 'ota1',   label: 'OTA 系统（云端）', x: 1300, y: 300, w: 220, h: 32, node: 'stack.ota' },
      { id: 'ota2',   label: 'OTA 系统（车端）', x: 1300, y: 372, w: 220, h: 32, node: 'deploy.ota' },
      { id: 'run',    label: '车端模型运行', x: 1300, y: 444, w: 220, h: 32, node: 'deploy.monitor' },

      // ── 技术栈 ──
      { id: 'tl1', label: '应用框架', x: 46, y: 800, w: 74, h: 24, kind: 'label' },
      { id: 't1', label: 'gin', x: 150, y: 800, w: 70, h: 26 },
      { id: 't2', label: 'laravel', x: 230, y: 800, w: 86, h: 26 },
      { id: 'tl2', label: '队列', x: 60, y: 834, w: 60, h: 24, kind: 'label' },
      { id: 't3', label: 'kafka', x: 150, y: 834, w: 78, h: 26 },
      { id: 't4', label: 'Redis', x: 238, y: 834, w: 70, h: 26 },
      { id: 'tl3', label: '存储', x: 60, y: 868, w: 60, h: 24, kind: 'label' },
      { id: 't5', label: 'OceanBase', x: 150, y: 868, w: 88, h: 26 },
      { id: 't6', label: 'TSDB (MatrixDB)', x: 248, y: 868, w: 112, h: 26 },
      { id: 't7', label: 'ES', x: 370, y: 868, w: 44, h: 26 },
      { id: 'tl4', label: '语言', x: 60, y: 902, w: 60, h: 24, kind: 'label' },
      { id: 't8', label: 'go', x: 150, y: 902, w: 46, h: 26 },
      { id: 't9', label: 'php', x: 202, y: 902, w: 46, h: 26 },
      { id: 'tl5', label: '机器', x: 60, y: 936, w: 60, h: 24, kind: 'label' },
      { id: 't10', label: '虚拟机', x: 150, y: 936, w: 68, h: 26 },
      { id: 't11', label: 'docker', x: 224, y: 936, w: 68, h: 26 },
      { id: 't12', label: 'k8s', x: 298, y: 936, w: 52, h: 26 },
    ],
    annos: [
      { text: '样本定义：基础文件 → 样本\n基础文件：TV / PCD / GPS /\n  autolabel / manual_label\n样本只做有限组合，防无序扩张', x: 872, y: 150, w: 170, h: 84, tone: 'y' },
      { text: '基础组件：Greenplum / TDSQL / ES /\nStarRocks / OSS / Hive', x: 1000, y: 566, w: 240, h: 44, tone: 'g' },
      { text: '数据采集系统按 BPMN + 微服务思路构建：\n已有系统复用 + 新系统设计', x: 1000, y: 622, w: 240, h: 44, tone: 'b' },
    ],
    links: [
      ['sensor', 'enc'], ['enc', 'trig'], ['trig', 'dds'], ['dds', 'mesh1'],
      ['mesh1', 'mesh2', '弱网 / 断点续传', { via: [[145, 104], [328, 104], [328, 258]] }],
      ['mesh2', 'upload'], ['upload', 'comply'], ['comply', 'parse'], ['parse', 'mine'],
      ['mine', 'label'], ['label', 'prep'], ['prep', 'center'],
      ['center', 'factory'], ['center', 'oss'], ['center', 'sr'],
      ['factory', 'train', '样本 / 批次', { via: [[470, 730], [960, 730], [960, 316]] }],
      ['train', 'fs'], ['train', 'ota1', '正式自动驾驶模型'],
      ['ota1', 'ota2'], ['ota2', 'run'],
      ['run', 'shadowCloud', '影子回流', { via: [[1570, 460], [1570, 104], [480, 104]] }],
      ['shadowCloud', 'shadowModel'], ['shadowModel', 'shadowV', '影子模型下发', { via: [[356, 211], [356, 448]] }],
      ['shadowV', 'rec'],
    ],
    notes: [
      '与原图一致：车端只管「采与筛」，云端管「存与算」，两条链路在车云 mesh 处交接',
      '样本中心是「基础文件 → 样本」的分层：TV / PCD / GPS / autolabel / manual_label，样本只做有限组合，防止无限扩张',
      '模型包与整车包解耦：模型走 OTA（云端）→ OTA（车端），按批次灰度下发；影子模型与主模型并行运行做比对',
      '样本粒度：2D / 3D / video / clip；技术栈：gin/laravel、Kafka/Redis、Greenplum/TDSQL/ES/StarRocks/OSS/Hive、Go/PHP、docker/k8s',
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
