// 系统架构图：可点击的框 → 跳转知识点
// box.node 指向 data/universe 里的节点 id（可为空）
export default [
  {
    id: 'global',
    title: '全局数据流',
    desc: '车端采集 → 车云 mesh → 云端加工（解析/挖掘/标注/加工/样本中心）→ 训练 →（OTA 下发 ｜ 影子部署）→ 车端运行 → 影子回流',
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
      { id: 'dds',     label: 'DDS\n车端消息总线', x: 45, y: 326, w: 200, h: 28, node: 'stack.dds' },
      { id: 'mesh1',   label: '车云通信 mesh（车端）', x: 45, y: 372, w: 200, h: 28, node: 'stack.mesh' },
      { id: 'shadowV', label: 'ShadowDaemon\n影子车端服务', x: 45, y: 424, w: 200, h: 48, node: 'stack.shadowd' },
      { id: 'rec',     label: 'data-record\n录制采集中间件', x: 45, y: 492, w: 200, h: 44, node: 'stack.datarecord' },
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
      ['mesh1', 'mesh2', '弱网 / 断点续传', { via: [[145, 412], [316, 412], [316, 258]] }],
      ['mesh2', 'upload'], ['upload', 'comply'], ['comply', 'parse'], ['parse', 'mine'],
      ['mine', 'label'], ['label', 'prep'], ['prep', 'center'],
      ['center', 'factory'], ['center', 'oss'], ['center', 'sr'],
      ['factory', 'train', '样本 / 批次', { via: [[470, 730], [960, 730], [960, 316]] }],
      ['train', 'fs'], ['train', 'ota1', 'OTA 下发'],
      // 训练向下是两个分支：正式模型走 OTA 灰度下发；新模型走影子部署（并行比对、不接管控制）
      ['train', 'shadowCloud', '影子部署', { via: [[1170, 104], [480, 104]] }],
      ['ota1', 'ota2'], ['ota2', 'run'],
      ['run', 'upload', '影子回流'],
      ['shadowCloud', 'shadowModel'], ['shadowModel', 'shadowV', '影子模型下发', { via: [[356, 211], [356, 448]] }],
      ['shadowV', 'rec'],
    ],
    notes: [
      '与原图一致：车端只管「采与筛」，云端管「存与算」，两条链路在车云 mesh 处交接',
      '样本中心是「基础文件 → 样本」的分层：TV / PCD / GPS / autolabel / manual_label，样本只做有限组合，防止无限扩张',
      '训练出来是两个下发分支：正式模型走 OTA（云端 → 车端，按批次灰度）；新模型走影子部署（影子服务 → 影子模型 → ShadowDaemon），与主模型并行推理、不接管控制，差异数据再回流',
      '模型包与整车包解耦：模型包单独走 OTA，不跟整车包绑定发版',
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
          { id: 'c3', label: 'ShadowDaemon\n影子车端服务', node: 'stack.shadowd' },
          { id: 'c4', label: 'data-record\n录制采集中间件', node: 'stack.datarecord' },
        ],
      },
      {
        title: '传输与合规',
        boxes: [
          { id: 't1', label: '双信号\n（量产车）' },
          { id: 't2', label: 'DDS\n车端消息总线', node: 'stack.dds' },
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
  {
    id: 'parse',
    title: '数据解析系统',
    desc: '原始包 → 优先级队列 → 解码/对齐/脱敏/质检 → 元数据与片段入库',
    lanes: [
      {
        title: '接入',
        boxes: [
          { id: 'i1', label: '原始包\nbag / mcap / 压缩包' },
          { id: 'i2', label: '对象存储落地', node: 'infra.oss' },
          { id: 'i3', label: '优先级队列\n事故 > 影子 > 定向 > 常规', node: 'stack.parse' },
          { id: 'i4', label: '配额与限流' },
        ],
      },
      {
        title: '解析流水线',
        boxes: [
          { id: 'p1', label: '解包 / 校验', node: 'ops.decode' },
          { id: 'p2', label: '解码\nGPU 硬解 H.265 / 点云' },
          { id: 'p3', label: '时间对齐与标定', node: 'ops.align' },
          { id: 'p4', label: '脱敏\n人像 / 车牌', node: 'ops.redact' },
          { id: 'p5', label: '质检\n清晰度 / 曝光 / 丢帧', node: 'ops.quality' },
          { id: 'p6', label: '关键帧抽取', node: 'stack.pre' },
        ],
      },
      {
        title: '产出',
        boxes: [
          { id: 'o1', label: '元数据 → StarRocks', node: 'stack.starrocks' },
          { id: 'o2', label: '片段 → OSS', node: 'infra.oss' },
          { id: 'o3', label: '缩略图 / 预览' },
          { id: 'o4', label: '事件 → Kafka\n触发挖掘与标注' },
        ],
      },
      {
        title: '可靠性',
        boxes: [
          { id: 'r1', label: '消费延迟 p95/p99', node: 'infra.observability' },
          { id: 'r2', label: '死信队列与重放' },
          { id: 'r3', label: '幂等（内容寻址）', node: 'ops.idempotent' },
          { id: 'r4', label: '积压告警与扩容' },
        ],
      },
    ],
    links: [
      ['i1', 'i2'], ['i2', 'i3'], ['i3', 'i4'], ['i3', 'p1'], ['p1', 'p2'],
      ['p2', 'p3'], ['p3', 'p4'], ['p4', 'p5'], ['p5', 'p6'], ['p6', 'o1'],
      ['p6', 'o2'], ['p6', 'o3'], ['o1', 'o4'], ['p5', 'r2'], ['r3', 'p1'],
    ],
    notes: [
      '核心指标是「消费延迟」与「积压量」，不是吞吐峰值——事故片段排在常规数据后面就等于没有闭环',
      '防「大包饿死小包」：按大小分片 + 权重轮询；失败重试必须幂等',
      '解码是算力大头，GPU 硬解与 CPU 软解差一个数量级',
    ],
  },
  {
    id: 'vconfig',
    title: '车端配置系统（4000+ 信号）',
    desc: '信号字典 → 采集策略 → 配置下发与生效校验 → 解析入库 → 诊断/告警/看板',
    lanes: [
      {
        title: '信号源',
        boxes: [
          { id: 'g1', label: 'CAN 总线' },
          { id: 'g2', label: '以太网' },
          { id: 'g3', label: '诊断信号' },
          { id: 'g4', label: '域控 / 传感器状态' },
        ],
      },
      {
        title: '车端采集',
        boxes: [
          { id: 'c1', label: '信号字典\n4000+ 路定义', node: 'stack.signal' },
          { id: 'c2', label: '采集策略\n频率 / 降采样 / 触发' },
          { id: 'c3', label: '环形缓冲\n保留触发前 N 秒' },
          { id: 'c4', label: '本地缓存\n断网续传' },
        ],
      },
      {
        title: '配置下发',
        boxes: [
          { id: 'w1', label: 'Config 服务', node: 'stack.config' },
          { id: 'w2', label: '版本管理' },
          { id: 'w3', label: '灰度批次\n1% → 全量' },
          { id: 'w4', label: '生效校验\n期望 vs 实际' },
          { id: 'w5', label: '一键回滚' },
        ],
      },
      {
        title: '云端处理',
        boxes: [
          { id: 's1', label: '信号解析入库\n时序库', node: 'infra.meta' },
          { id: 's2', label: '告警规则' },
          { id: 's3', label: '诊断 / 健康度' },
          { id: 's4', label: '看板与统计', node: 'infra.analytics' },
          { id: 's5', label: '影子对比输入', node: 'deploy.diff' },
        ],
      },
    ],
    links: [
      ['g1', 'c1'], ['g2', 'c1'], ['g3', 'c1'], ['g4', 'c1'],
      ['c1', 'c2'], ['c2', 'c3'], ['c3', 'c4'], ['c4', 's1'],
      ['w1', 'w2'], ['w2', 'w3'], ['w3', 'w4'], ['w4', 'c2'], ['w4', 'w5'],
      ['s1', 's2'], ['s1', 's3'], ['s2', 's4'], ['s1', 's5'],
    ],
    notes: [
      '4000+ 信号的真正难点不是采集，而是「信号字典」：名称、单位、频率、取值范围、含义，没有字典就没人看得懂',
      '配置错一次能影响整个车队 → 必须灰度 + 生效对账 + 一键回滚',
      '信号要与视频/点云按时间戳对齐，否则做不了因果分析（接管前 10 秒的踏板曲线）',
    ],
  },
  {
    id: 'mesh',
    title: '车云通信 Li-Mesh',
    desc: '车端 DDS / 业务 ↔ 长连接与消息队列 ↔ 云端 configor / job 服务',
    lanes: [
      {
        title: '车端',
        boxes: [
          { id: 'v1', label: '业务模块' },
          { id: 'v2', label: 'DDS\n车端内部总线', node: 'stack.dds' },
          { id: 'v3', label: 'mesh client', node: 'stack.mesh' },
          { id: 'v4', label: '本地队列\n断网缓存', node: 'collect.resume' },
        ],
      },
      {
        title: '通道',
        boxes: [
          { id: 't1', label: '长连接\n即时通信（即时指令）' },
          { id: 't2', label: '消息队列\n上下行消息' },
          { id: 't3', label: '文件通道\n大批量数据' },
          { id: 't4', label: '心跳 / 重连\n多路复用' },
        ],
      },
      {
        title: '云端',
        boxes: [
          { id: 's1', label: 'mesh server', node: 'stack.mesh' },
          { id: 's2', label: 'Configor 服务\n配置下发', node: 'stack.config' },
          { id: 's3', label: 'Job 服务\n任务编排', node: 'stack.arch' },
          { id: 's4', label: '消息路由' },
          { id: 's5', label: '上行落 Kafka', node: 'infra.pipeline' },
        ],
      },
      {
        title: '保障',
        boxes: [
          { id: 'q1', label: '幂等投递' },
          { id: 'q2', label: '优先级与限流' },
          { id: 'q3', label: '加密\nTLS / KMS', node: 'stack.compliance' },
          { id: 'q4', label: '审计与链路追踪', node: 'infra.observability' },
        ],
      },
    ],
    links: [
      ['v1', 'v2'], ['v2', 'v3'], ['v3', 'v4'], ['v4', 't1'], ['v4', 't2'],
      ['v4', 't3'], ['t1', 's1'], ['t2', 's1'], ['t3', 's1'], ['t4', 's1'],
      ['s1', 's2'], ['s1', 's3'], ['s2', 's4'], ['s3', 's4'], ['s4', 's5'],
      ['s1', 'q1'], ['s1', 'q2'], ['s1', 'q3'], ['s1', 'q4'],
    ],
    notes: [
      '本质是「消息总线 + 服务发现 + 可靠投递」，不是简单的 HTTP 接口',
      '弱网是常态：断线重连、离线队列、幂等去重、优先级、重试退避必须齐备',
      '配置与任务要版本化 + 幂等 + 可回滚——一次误下发能搞停整个车队',
    ],
  },
  {
    id: 'mining',
    title: '数据挖掘系统',
    desc: '三路召回（结构化 / 向量 / UGC）→ 去重聚类 → 价值排序 → 场景库 / 待标注池 / 评测集',
    lanes: [
      {
        title: '数据底座',
        boxes: [
          { id: 'b1', label: '元数据\nStarRocks', node: 'stack.starrocks' },
          { id: 'b2', label: '片段文件\nOSS', node: 'infra.oss' },
          { id: 'b3', label: '向量索引', node: 'infra.index' },
          { id: 'b4', label: '标签体系', node: 'mine.taxonomy' },
        ],
      },
      {
        title: '三路召回',
        boxes: [
          { id: 'q1', label: 'UGC 检索\n安全员 / 运营上报', node: 'stack.mine' },
          { id: 'q2', label: '向量检索\n以图搜图 / 相似场景', node: 'mine.retrieval' },
          { id: 'q3', label: '标签组合检索\n结构化筛选', node: 'mine.taxonomy' },
          { id: 'q4', label: '模型打分\n难例 / 不确定度', node: 'mine.uncertainty' },
        ],
      },
      {
        title: '结果处理',
        boxes: [
          { id: 'r1', label: '相似度去重', node: 'mine.cluster' },
          { id: 'r2', label: '聚类取代表', node: 'mine.cluster' },
          { id: 'r3', label: '人工快筛\n缩略图秒判', node: 'mine.human' },
          { id: 'r4', label: '价值排序\n影响面 × 严重度', node: 'mine.mining' },
        ],
      },
      {
        title: '产出',
        boxes: [
          { id: 'o1', label: '场景库\n新场景入库', node: 'mine.lib' },
          { id: 'o2', label: '待标注池', node: 'stack.label' },
          { id: 'o3', label: '样本工厂', node: 'stack.sample' },
          { id: 'o4', label: '评测集补充', node: 'eval.testset' },
        ],
      },
    ],
    links: [
      ['b1', 'q3'], ['b2', 'q2'], ['b3', 'q2'], ['b4', 'q3'],
      ['q1', 'r3'], ['q2', 'r1'], ['q3', 'r1'], ['q4', 'r4'],
      ['r1', 'r2'], ['r2', 'r3'], ['r3', 'r4'], ['r4', 'o1'],
      ['r4', 'o2'], ['o2', 'o3'], ['o1', 'o3'], ['o1', 'o4'],
    ],
    notes: [
      '三路各管一件事：结构化回答「是不是」，向量回答「像不像」，UGC 回答「痛不痛」',
      '挖出来 ≠ 有用：不去重、不聚类、不排序，标注产能会被重复样本淹没',
      '闭环验证：新挖的场景要能证明「真的让指标变好」，否则只是搬运数据',
    ],
  },
  {
    id: 'labeling',
    title: '数据打标系统',
    desc: '待标注池 → 预标注模型与算子 → 后处理融合 → 人工修正/质检 → 自动标注率',
    lanes: [
      {
        title: '输入',
        boxes: [
          { id: 'i1', label: '待标注池', node: 'stack.label' },
          { id: 'i2', label: '原始片段\nOSS', node: 'infra.oss' },
          { id: 'i3', label: '标定与时间戳', node: 'collect.calib' },
        ],
      },
      {
        title: '模型库',
        boxes: [
          { id: 'm1', label: '2D 检测' },
          { id: 'm2', label: '3D 检测 / 分割', node: 'mine.autolabel' },
          { id: 'm3', label: '跟踪与时序融合\n4D 标注', node: 'mine.4d' },
          { id: 'm4', label: '占用栅格', node: 'mine.occ' },
          { id: 'm5', label: '车道线 / 可行驶区', node: 'mine.seg' },
          { id: 'm6', label: 'CLIP / 场景分类', node: 'mine.taxonomy' },
        ],
      },
      {
        title: '推理算子',
        boxes: [
          { id: 'k1', label: '预处理算子\nresize / 归一化' },
          { id: 'k2', label: 'GridSample / Scatter\nVoxelization', node: 'ops.bev' },
          { id: 'k3', label: 'NMS / 后处理', node: 'ops.nms' },
          { id: 'k4', label: '量化推理引擎\nTensorRT', node: 'ops.infer' },
          { id: 'k5', label: '算子覆盖率校验', node: 'ops.coverage' },
        ],
      },
      {
        title: '调度',
        boxes: [
          { id: 'd1', label: 'GPU 池 / 批处理', node: 'infra.compute' },
          { id: 'd2', label: '优先级队列', node: 'infra.schedule' },
          { id: 'd3', label: '模型版本管理', node: 'train.exp' },
        ],
      },
      {
        title: '产出',
        boxes: [
          { id: 'o1', label: '伪标签\n置信度过滤', node: 'mine.teacher' },
          { id: 'o2', label: '人工修正\n人在回路', node: 'mine.human' },
          { id: 'o3', label: '质检与黄金集', node: 'mine.qa' },
          { id: 'o4', label: '自动标注率', node: 'mine.autolabel' },
        ],
      },
    ],
    links: [
      ['i1', 'm1'], ['i2', 'm2'], ['i3', 'm3'],
      ['m1', 'k1'], ['m2', 'k1'], ['m3', 'k2'], ['m4', 'k2'], ['m5', 'k3'],
      ['k1', 'k4'], ['k2', 'k4'], ['k4', 'k3'], ['k5', 'k4'],
      ['d1', 'k4'], ['d2', 'd1'], ['d3', 'k4'],
      ['k3', 'o1'], ['o1', 'o2'], ['o2', 'o3'], ['o3', 'o4'],
    ],
    notes: [
      '自动标注的质量上限由「教师模型」决定：离线特权 = 更大模型 + 未来帧 + 多传感器融合',
      '推理算子是这条链的隐形成本：GridSample / Scatter / Voxelization 在部分芯片上极慢',
      '自动标注率要按「采纳率」算（被人工接受的比例），不是「产出率」',
      '教师模型的确认偏误要靠人工锚点与定期换模型来破',
    ],
  },
  {
    id: 'tagging',
    title: '标签系统',
    desc: '标签定义与版本 → 多来源打标 → 倒排索引 → 治理归一 → 检索/配比/评测消费',
    lanes: [
      {
        title: '定义',
        boxes: [
          { id: 't1', label: '标签树\n域 / 场景 / 行为 / 系统状态', node: 'mine.taxonomy' },
          { id: 't2', label: '取值域\n枚举 / 连续 / 多选' },
          { id: 't3', label: '同义词与别名' },
          { id: 't4', label: '标签版本\n与变更记录' },
        ],
      },
      {
        title: '打标来源',
        boxes: [
          { id: 's1', label: '人工打标\n运营 / 标注员' },
          { id: 's2', label: '规则打标\n信号 / 事件触发', node: 'collect.trig-event' },
          { id: 's3', label: '模型打标\n分类 / CLIP', node: 'mine.autolabel' },
          { id: 's4', label: '大模型打标\n场景描述 caption' },
        ],
      },
      {
        title: '存储与索引',
        boxes: [
          { id: 'i1', label: '标签-片段倒排', node: 'infra.index' },
          { id: 'i2', label: '标签统计\n分布 / 频次' },
          { id: 'i3', label: '来源与置信度', node: 'infra.meta' },
        ],
      },
      {
        title: '治理',
        boxes: [
          { id: 'g1', label: '冲突合并' },
          { id: 'g2', label: '同义归一' },
          { id: 'g3', label: '历史回填重打' },
          { id: 'g4', label: '质量抽检', node: 'mine.qa' },
        ],
      },
      {
        title: '消费',
        boxes: [
          { id: 'c1', label: '检索 / 圈选', node: 'stack.mine' },
          { id: 'c2', label: '配比采样', node: 'mine.ratio' },
          { id: 'c3', label: '评测分层', node: 'eval.testset' },
          { id: 'c4', label: '看板统计', node: 'infra.analytics' },
        ],
      },
    ],
    links: [
      ['t1', 't2'], ['t1', 't3'], ['t1', 't4'],
      ['s1', 'i1'], ['s2', 'i1'], ['s3', 'i1'], ['s4', 'i1'],
      ['i1', 'i2'], ['i1', 'i3'], ['g1', 'i1'], ['g2', 'i1'],
      ['t4', 'g3'], ['g3', 'i1'], ['i3', 'g4'],
      ['i1', 'c1'], ['i1', 'c2'], ['i2', 'c3'], ['i2', 'c4'],
    ],
    notes: [
      '标签要正交可组合，避免同义重复（「夜间」vs「晚上」），否则检索会漏',
      '标签来源必须可追溯：人工/规则/模型/大模型的可信度不同，配比与评测要区别对待',
      '标签体系会演进，历史数据必须能批量回填重打，否则新旧数据不可比',
    ],
  },
  {
    id: 'sim',
    title: '仿真系统',
    desc: '场景来源 → 仿真引擎 → 被测系统（SIL/HIL/VIL）→ 指标与失败分类 → 置信度对齐',
    lanes: [
      {
        title: '场景来源',
        boxes: [
          { id: 'a1', label: '真实数据回放', node: 'eval.replay' },
          { id: 'a2', label: '参数化场景', node: 'eval.simgen' },
          { id: 'a3', label: '对抗生成', node: 'eval.adversarial' },
          { id: 'a4', label: '世界模型 / 生成式', node: 'train.world' },
        ],
      },
      {
        title: '仿真引擎',
        boxes: [
          { id: 'e1', label: '场景描述' },
          { id: 'e2', label: '交通流\n背景车会反应' },
          { id: 'e3', label: '车辆动力学' },
          { id: 'e4', label: '传感器仿真\n相机 / 雷达 / 激光' },
          { id: 'e5', label: '渲染' },
        ],
      },
      {
        title: '被测系统',
        boxes: [
          { id: 'u1', label: '感知' },
          { id: 'u2', label: '预测' },
          { id: 'u3', label: '规控' },
          { id: 'u4', label: 'SIL', node: 'eval.sil' },
          { id: 'u5', label: 'HIL', node: 'eval.sil' },
          { id: 'u6', label: 'VIL' },
        ],
      },
      {
        title: '评测',
        boxes: [
          { id: 'm1', label: '指标计算\n碰撞 / 接管 / 舒适', node: 'eval.plan' },
          { id: 'm2', label: '失败分类与归因' },
          { id: 'm3', label: '覆盖率', node: 'eval.coverage' },
          { id: 'm4', label: '回归门禁', node: 'eval.regression' },
          { id: 'm5', label: '置信度对齐', node: 'eval.sim2real' },
        ],
      },
      {
        title: '运行',
        boxes: [
          { id: 'r1', label: '任务调度' },
          { id: 'r2', label: '并行仿真\n百万级场景' },
          { id: 'r3', label: '结果存储与看板' },
        ],
      },
    ],
    links: [
      ['a1', 'e1'], ['a2', 'e1'], ['a3', 'e1'], ['a4', 'e1'],
      ['e1', 'e2'], ['e2', 'e3'], ['e3', 'e4'], ['e4', 'e5'],
      ['e5', 'u1'], ['u1', 'u2'], ['u2', 'u3'],
      ['u3', 'u4'], ['u4', 'u5'], ['u5', 'u6'],
      ['u3', 'm1'], ['m1', 'm2'], ['m2', 'm3'], ['m3', 'm4'], ['m4', 'm5'],
      ['r1', 'r2'], ['r2', 'r3'],
    ],
    notes: [
      '仿真不是越真越好，而是「够用且可规模化」——渲染很真但跑得慢，不如中等保真跑百万次',
      '闭环仿真的关键是「背景车会对自车反应」，纯回放做不到',
      '仿真置信度必须用「同场景仿真 vs 实车双跑」来证明，否则只能做筛选不能做结论',
    ],
  },
  {
    id: 'vector',
    title: '向量搜索系统（Milvus）',
    desc: '特征写入 → Milvus（Proxy/Query/Index/Data + etcd/MinIO/Pulsar）→ 文搜图 / 图搜图 → 排序与确认',
    lanes: [
      {
        title: '特征',
        boxes: [
          { id: 'f1', label: '关键帧 / 缩略图', node: 'infra.oss' },
          { id: 'f2', label: '图像特征\nCLIP / SigLIP' },
          { id: 'f3', label: '文本特征\n中文 CLIP 编码' },
          { id: 'f4', label: '轨迹 / 点云特征' },
        ],
      },
      {
        title: '查询入口',
        boxes: [
          { id: 'q1', label: '文搜图\n「雨天夜里电动车逆行」', node: 'mine.retrieval' },
          { id: 'q2', label: '图搜图\n以图搜图' },
          { id: 'q3', label: '图搜场景\n多模态融合' },
          { id: 'q4', label: '标量过滤 + TopK\n时间 / 车 / 标签', node: 'mine.taxonomy' },
        ],
      },
      {
        title: 'Milvus 集群',
        boxes: [
          { id: 'm1', label: 'Proxy\n接入 / 路由', node: 'infra.milvus' },
          { id: 'm2', label: 'Query Node\n检索' },
          { id: 'm3', label: 'Index Node\n建索引' },
          { id: 'm4', label: 'Data Node\n写入落段' },
          { id: 'm5', label: 'Collection / Partition' },
        ],
      },
      {
        title: '依赖',
        boxes: [
          { id: 'd1', label: 'etcd\n元数据 / 协调' },
          { id: 'd2', label: 'MinIO / OSS\n段文件', node: 'infra.oss' },
          { id: 'd3', label: 'Pulsar / Kafka\n日志流', node: 'infra.pipeline' },
        ],
      },
      {
        title: '产出',
        boxes: [
          { id: 'o1', label: '相似度排序' },
          { id: 'o2', label: '近邻去重', node: 'mine.cluster' },
          { id: 'o3', label: '人工确认' },
          { id: 'o4', label: '场景入库', node: 'mine.lib' },
        ],
      },
    ],
    links: [
      ['f1', 'f2'], ['f2', 'm4'], ['f3', 'm1'], ['f4', 'm4'],
      ['q1', 'q4'], ['q2', 'q4'], ['q3', 'q4'], ['q4', 'm1'],
      ['m1', 'm2'], ['m1', 'm4'], ['m2', 'm5'], ['m3', 'm5'],
      ['m4', 'd2'], ['m4', 'd3'], ['m3', 'd2'], ['d1', 'm1'],
      ['m5', 'o1'], ['o1', 'o2'], ['o2', 'o3'], ['o3', 'o4'],
    ],
    notes: [
      '索引选型：HNSW 召回高但吃内存，IVF_PQ 省内存掉召回，DiskANN 适合超大规模',
      '度量必须跟模型对齐：CLIP 特征通常 COSINE / IP，用错会出现「能搜但排序全乱」',
      '文搜图的瓶颈在文本-图像对齐质量，不在 Milvus；索引只决定速度与内存',
      '段合并（compaction）与 load 策略直接影响查询延迟，别只盯建索引',
    ],
  },
  {
    id: 'warehouse',
    title: '数仓与数据湖治理',
    desc: '湖存原始与半结构化 → 仓分层（ODS/DWD/DWS/ADS）→ 治理四件套 → 消费',
    lanes: [
      {
        title: '数据湖',
        boxes: [
          { id: 'l1', label: '原始包\nbag / mcap → OSS', node: 'infra.oss' },
          { id: 'l2', label: '解析片段 + 标注', node: 'infra.dataset' },
          { id: 'l3', label: '表格式\nIceberg / Hudi', node: 'infra.lake' },
          { id: 'l4', label: '冷归档\nHive / 低频', node: 'infra.cost' },
        ],
      },
      {
        title: '数仓分层',
        boxes: [
          { id: 'w1', label: 'ODS\n解析后原始', node: 'infra.warehouse' },
          { id: 'w2', label: 'DWD\n片段 / 帧 / 事件明细' },
          { id: 'w3', label: 'DWS\n场景 / 车 / 天 汇总' },
          { id: 'w4', label: 'ADS\n看板 / 指标' },
        ],
      },
      {
        title: '治理',
        boxes: [
          { id: 'g1', label: '元数据 Catalog', node: 'infra.catalog' },
          { id: 'g2', label: '血缘', node: 'infra.lineage' },
          { id: 'g3', label: '质量规则', node: 'infra.quality' },
          { id: 'g4', label: '权限与脱敏', node: 'infra.auth' },
          { id: 'g5', label: '生命周期与成本', node: 'infra.cost' },
          { id: 'g6', label: '标准与口径', node: 'infra.governance' },
        ],
      },
      {
        title: '消费',
        boxes: [
          { id: 'c1', label: 'BI 看板', node: 'infra.analytics' },
          { id: 'c2', label: '算法取数 / 样本', node: 'stack.sample' },
          { id: 'c3', label: '资产目录\n自助找数' },
          { id: 'c4', label: '指标口径\n接管率 / MPI' },
        ],
      },
    ],
    links: [
      ['l1', 'w1'], ['l2', 'w1'], ['l3', 'w1'], ['l4', 'w1'],
      ['w1', 'w2'], ['w2', 'w3'], ['w3', 'w4'],
      ['g1', 'w2'], ['g2', 'w2'], ['g3', 'w2'], ['g6', 'w3'],
      ['g4', 'c1'], ['g5', 'l4'],
      ['w4', 'c1'], ['w4', 'c4'], ['w2', 'c2'], ['g1', 'c3'],
    ],
    notes: [
      '与互联网数仓最大的差异：事实是「视频片段」这种大对象，仓里只存 URI + 元数据，文件放湖',
      '口径不统一是治理失效的第一信号：同一个「接管率」三个团队三个数',
      '质量要前置到入库拦截；成本要下沉到团队核算，否则存储只增不减',
    ],
  },
];
