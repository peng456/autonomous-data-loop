# Autonomous Data Loop

> 智驾数据闭环宇宙 · 无限画布，连接每一个知识点。
> Infinite canvas for the autonomous-driving data loop.
> **197 个节点 · 329 条关联 · 44 道面试题 · 7 个学习阶段**

一个纯静态的知识宇宙：把「智驾数据闭环」拆成 197 颗星星，画在一张可以无限漫游的画布上。点开任意一颗，能看到它是什么、面试怎么答、最容易踩什么坑。

[![Deploy](https://github.com/peng456/autonomous-data-loop/actions/workflows/pages.yml/badge.svg)](../../actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

**在线体验**：`https://peng456.github.io/autonomous-data-loop/`

![智驾数据闭环宇宙](assets/og.png?v=2)

---

## 三个要求，三种做法

| 要求 | 实现 |
|---|---|
| **① 无限画布，展示所有知识点** | Canvas2D 无限平移/缩放（0.15×–4×），视口剔除 + 三级 LOD，屏幕空间标签防重叠，右下角星图小地图，星云按域着色 |
| **② 趣味性** | 星尘视差背景、域星云光晕、已探索节点留光环、探索进度条、等级称号（星际漫游者 → 宇宙架构师）、🎲 随机跃迁、星系点亮成就（一个域全看完 +100 XP） |
| **③ 学起来容易** | 搜索即定位、7 阶段航线、每点「标记已学」、关联星球跳转、题库遮蔽答案自测、连对计数、进度全部本地保存 |

另有 **架构视图**：全局数据流 / 影子系统 / 车端采集 / 数据加工与训练 四张图，方框可点击直接跳到对应知识点。

## 快速开始

```bash
git clone https://github.com/peng456/autonomous-data-loop
cd autonomous-data-loop
npm i

npm run build    # 内容 → data/universe.js（197 节点）
npm run serve    # http://localhost:8080
npm test         # 冒烟测试（jsdom，18 项断言）
```

> 没有构建依赖也可以：`data/universe.js` 已提交，直接双击 `index.html` 就能看（`file://` 下也能跑，因为数据是 JS 而不是 fetch JSON）。

## 部署到 GitHub Pages

### 方式 A：Actions 自动部署（推荐）

1. 推到 `main` 分支；
2. **Settings → Pages → Build and deployment → Source 选 `GitHub Actions`**；
3. 之后每次 push 自动：校验 → 测试 → 构建 → 发布。

工作流见 [`.github/workflows/pages.yml`](.github/workflows/pages.yml)，只发布 `index.html + assets/ + data/`，不会把 `node_modules` 传上去。

### 方式 B：分支直出（零配置）

**Settings → Pages → Source 选 `Deploy from a branch` → `main` / `root`** 即可。
仓库本身就是可运行站点，不需要构建。

### 自定义域名

在 `Settings → Pages → Custom domain` 填域名，仓库根目录放 `CNAME` 文件，一行即可：

```
universe.example.com
```

## 目录结构

```
.
├─ index.html              # 唯一页面（HUD / 画布 / 学习 / 自测 / 详情面板）
├─ assets/
│  ├─ style.css            # 深空主题
│  └─ app.js               # 布局 + 渲染 + 交互 + 进度系统
├─ data/
│  ├─ src/                 # ★ 内容源：一个域一个 .mjs，改这里
│  │  ├─ 00-meta.mjs       # 域定义 + 根节点
│  │  ├─ 01-why.mjs        # 范式与价值
│  │  ├─ 02-collect.mjs    # 采集与回传
│  │  ├─ 13-vehicle.mjs    # 车端基础（Ubuntu/ROS2/DDS/GPU/CPU/域控/时同步）
│  │  └─ …                 # 共 14 个源文件（域内容 + 题库 + 学习路径）
│  └─ universe.js          # 构建产物（自动生成，勿手改）
├─ tools/build-data.mjs    # 内容 → 图数据 + 校验
├─ .github/workflows/      # Pages 部署
└─ test.mjs                # jsdom 冒烟测试
```

## 加一个知识点

编辑 `data/src/` 下对应域的文件，追加一个对象：

```js
{
  id: 'collect.trig-rain',        // 全局唯一，点分命名
  t: '雨天触发',                   // 节点标题
  en: 'Rain Trigger',             // 可选英文名（搜索用）
  d: 'collect',                   // 域 key
  lv: 2,                          // 1 主干 / 2 常规 / 3 细节
  p: 'collect.trigger',           // 可选：父节点，自动生成 include 边
  def: '一句话定义，必填。',
  pts: ['关键点 1', '关键点 2'],
  q: '面试怎么答，必填。',
  pit: '常见坑，可选。',
  x: [{ to: 'collect.privacy', r: 'depend', l: '为什么相关' }],  // 可选：跨域边
}
```

然后：

```bash
npm run build   # 校验 + 重新生成 data/universe.js
npm test        # 确认没把图拆坏
```

构建期会拦截：重复 id、未知域、父节点/边目标不存在、缺 `def`/`q`、路径引用不存在的节点。

## 快捷键

| 键 | 作用 |
|---|---|
| `/` | 聚焦搜索 |
| `Enter` | 跳到第一个搜索结果 |
| `R` | 随机跃迁到一颗未探索的星 |
| `Esc` | 关闭详情 / 关闭引导 |
| 双击空白 | 回到全图 |
| 双击节点 | 聚焦放大 |

## 进度存在哪

全部在 `localStorage`，换浏览器/清缓存会丢，不涉及任何账号与上报：

- `dlu-visited` 已探索节点
- `dlu-xp` 经验值
- `dlu-graded` 已打过分的题
- `dlu-streak` 连对计数

## 路线图

- [x] v0.1 无限画布 + 搜索 + 详情 + 学习路径 + 自测 + XP
- [ ] v0.2 分享深链（`#/n/<id>`）+ 导出当前视图为图片
- [ ] v0.3 WebGL 渲染，扛 1 万节点 + 力导向分簇
- [ ] v0.4 语义检索（浏览器端 embedding）+ 自动补链建议
- [ ] v0.5 主题包机制：一份引擎装多个领域宇宙

## 许可

- 代码：MIT（见 `LICENSE`）
- 内容：CC BY-SA 4.0（署名 + 相同方式共享）

---

写给做数据闭环的人：如果这张图帮你少踩一个坑，就 fork 一份，把你们团队的知识也画成宇宙。
