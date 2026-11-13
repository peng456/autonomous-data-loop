// 静态 SEO 产物生成器
// 用法：node tools/build-seo.mjs
//
// 为什么需要它：主站是 SPA，「探索」页把文字用 ctx.fillText 画进 canvas，
// 爬虫（尤其百度 / Bing）读不到任何正文。这里把 207 个知识点渲染成真 HTML，
// 让搜索引擎有东西可索引，并补上 robots / sitemap / llms.txt / 结构化数据。
//
// 产物（均不入库，见 .gitignore，由 Pages 工作流在构建时生成）：
//   robots.txt  sitemap.xml  llms.txt
//   topics/            知识点总览 + 207 个知识点页 + qa.html（FAQPage）
//   <indexnow-key>.txt IndexNow 归属校验文件
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://peng456.github.io/autonomous-data-loop';
const SITE_NAME = '智驾数据闭环宇宙';
const TODAY = new Date().toISOString().slice(0, 10);
const INDEXNOW_KEY = '8f3c1d6a4b9e27c05a7d31f8e6b2c940';
const SITE_DESC = '把智驾数据闭环的 207 个知识点画在一张可无限漫游的画布上：车端采集、车云 mesh、解析 / 挖掘 / 标注 / 加工 / 样本中心、训练、OTA 下发与影子部署、影子回流。每个知识点给出定义、关键要点、面试怎么答与常见踩坑。';

const MODS = ['01-why', '02-collect', '03-infra', '04-mine', '05-train', '06-eval', '07-deploy', '08-org', '09-stack', '12-ops', '13-vehicle'];
const { domains, root } = await import('../data/src/00-meta.mjs');
const nodes = [root];
for (const m of MODS) nodes.push(...(await import(`../data/src/${m}.mjs`)).default);
const qa = (await import('../data/src/10-qa.mjs')).default;
const systems = (await import('../data/systems.mjs')).default;
const { path: learningPath } = await import('../data/src/11-path.mjs');

const BYID = new Map(nodes.map(n => [n.id, n]));
const DMAP = new Map([...domains, { key: 'core', name: '总纲', color: '#e8b95c', desc: '根节点：数据闭环整体' }]
  .map(d => [d.key, d]));

// ── 工具 ──
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const oneLine = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => { s = oneLine(s); return s.length <= n ? s : s.slice(0, n - 1) + '…'; };
const abs = p => `${SITE}/${String(p).replace(/^\/+/, '')}`;
const pageUrl = id => abs(`topics/${id}.html`);
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// 反向链接（父节点 + 被依赖边）
const back = new Map(nodes.map(n => [n.id, []]));
for (const n of nodes) {
  if (n.p && BYID.has(n.p)) back.get(n.p).push(n.id);
  for (const e of n.x || []) if (BYID.has(e.to)) back.get(e.to).push(n.id);
}
for (const [k, v] of back) back.set(k, [...new Set(v)].filter(id => id !== k));

const CSS = `*{box-sizing:border-box}
:root{--bg:#05070d;--fg:#e7eefb;--dim:#8a9bb8;--line:#1d2739;--acc:#e8b95c;--card:#0b1220}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.75 -apple-system,"PingFang SC","Noto Sans SC","Helvetica Neue",sans-serif}
a{color:var(--acc);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:760px;margin:0 auto;padding:28px 20px 80px}
nav.top{display:flex;gap:18px;flex-wrap:wrap;font-size:14px;padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:28px}
nav.top .home{color:var(--dim)}
.crumb{font-size:13px;color:var(--dim);margin:0 0 6px}
h1{font-size:26px;line-height:1.35;margin:0 0 4px;letter-spacing:.3px}
.en{color:var(--dim);font-size:13px;margin:0 0 18px;font-style:italic}
h2{font-size:16px;margin:30px 0 10px;color:var(--acc);font-weight:600}
h3{font-size:15px;margin:22px 0 8px}
p{margin:0 0 12px}
ul{margin:0 0 12px;padding-left:22px}
li{margin:0 0 7px}
section.def p{color:#cfdaea}
.qa{border-left:2px solid var(--acc);padding:2px 0 2px 14px;background:linear-gradient(90deg,#0d1524,transparent);margin:0 0 12px}
.pit{border-left:2px solid #ff5f6d;padding:2px 0 2px 14px;margin:0 0 12px;color:#e8c5c9}
.cta{display:inline-block;margin:26px 0 0;padding:11px 18px;border:1px solid var(--acc);border-radius:8px;color:var(--acc)}
.cta:hover{background:rgba(232,185,92,.1);text-decoration:none}
.tags{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}
.tag{font-size:12px;padding:3px 10px;border-radius:999px;background:var(--card);border:1px solid var(--line);color:var(--dim)}
.grid{display:grid;gap:10px;margin:0 0 26px}
.card{border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:var(--card)}
.card b{display:block;font-size:15px;margin-bottom:3px}
.card span{color:var(--dim);font-size:13px;line-height:1.6}
.dom{margin:0 0 30px}
.dom h2{display:flex;align-items:center;gap:8px}
.dom h2 i{width:9px;height:9px;border-radius:50%;display:inline-block}
footer{margin-top:60px;padding-top:18px;border-top:1px solid var(--line);color:var(--dim);font-size:13px}
footer a{color:var(--dim);text-decoration:underline}
`;

function layout({ title, desc, canonical, jsonld, body, ogType = 'article' }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(clip(desc, 155))}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#05070d">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(clip(desc, 155))}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(abs('assets/og.png'))}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='8' fill='%23e8b95c'/></svg>">
<link rel="stylesheet" href="_style.css">
${jsonld ? ld(jsonld) : ''}
</head>
<body>
<div class="wrap">
<nav class="top"><a class="home" href="../">← 星图</a><a href="./">知识点总览</a><a href="qa.html">面试题</a></nav>
${body}
<footer>
<p>${esc(SITE_NAME)} · <a href="../">在无限画布上漫游</a> · <a href="./">207 个知识点</a> · <a href="qa.html">47 道面试题</a></p>
<p>内容 CC BY-SA 4.0 · 代码 MIT</p>
</footer>
</div>
</body>
</html>
`;
}

const webSiteLd = {
  '@context': 'https://schema.org', '@type': 'WebSite',
  name: SITE_NAME, alternateName: 'Autonomous Data Loop', url: abs(''), inLanguage: 'zh-CN',
  description: SITE_DESC,
};

// ── 输出 ──
rmSync(join(ROOT, 'topics'), { recursive: true, force: true });
mkdirSync(join(ROOT, 'topics'), { recursive: true });
writeFileSync(join(ROOT, 'topics', '_style.css'), CSS, 'utf8');

const urls = [abs(''), abs('topics/'), abs('topics/qa.html')];

// ── 单节点页 ──
for (const n of nodes) {
  const dom = DMAP.get(n.d) || DMAP.get('core');
  const rels = [...new Set([...(n.x || []).map(e => e.to), ...back.get(n.id), n.p].filter(id => id && BYID.has(id) && id !== n.id))];
  const desc = `${n.t}：${oneLine(n.def)}`;

  const body = `
<article>
  <p class="crumb"><a href="./">知识点</a> › ${esc(dom.name)}</p>
  <h1>${esc(n.t)}</h1>
  ${n.en ? `<p class="en">${esc(n.en)}</p>` : ''}
  <div class="tags"><span class="tag">${esc(dom.name)}</span><span class="tag">Lv.${esc(n.lv || 2)}</span></div>

  <section class="def"><h2>定义</h2><p>${esc(n.def)}</p></section>
  ${(n.pts || []).length ? `<section><h2>关键要点</h2><ul>${n.pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>` : ''}
  ${n.q ? `<section><h2>面试怎么答</h2><div class="qa">${esc(n.q)}</div></section>` : ''}
  ${n.pit ? `<section><h2>常见踩坑</h2><div class="pit">${esc(n.pit)}</div></section>` : ''}
  ${rels.length ? `<section><h2>相关知识</h2><ul>${rels.map(id => `<li><a href="${esc(id)}.html">${esc(BYID.get(id).t)}</a> — ${esc(clip(BYID.get(id).def, 60))}</li>`).join('')}</ul></section>` : ''}

  <a class="cta" href="../?n=${encodeURIComponent(n.id)}">在星图上打开这颗星 →</a>
</article>`;

  writeFileSync(join(ROOT, 'topics', `${n.id}.html`), layout({
    title: `${n.t} · ${SITE_NAME}`,
    desc,
    canonical: pageUrl(n.id),
    jsonld: {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: n.t, description: clip(desc, 155), inLanguage: 'zh-CN',
      url: pageUrl(n.id), mainEntityOfPage: pageUrl(n.id), dateModified: TODAY,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: abs('') },
      author: { '@type': 'Person', name: 'peng456' },
      about: { '@type': 'Thing', name: dom.name },
    },
    body,
  }), 'utf8');

  urls.push(pageUrl(n.id));
}

// ── 知识点总览 ──
const byDomain = domains.map(d => ({ ...d, list: nodes.filter(n => n.d === d.key) }))
  .concat([{ key: 'core', name: '总纲', color: '#e8b95c', desc: '根节点', list: nodes.filter(n => n.d === 'core') }])
  .filter(g => g.list.length);

const hubBody = `
<article>
  <p class="crumb">知识点总览</p>
  <h1>智驾数据闭环 · 207 个知识点</h1>
  <p>${esc(SITE_DESC)}</p>
  <p>按 11 个领域分组，共 ${nodes.length} 个知识点、${qa.length} 道面试题、${systems.length} 张架构图。</p>
  ${byDomain.map(g => `
  <section class="dom">
    <h2><i style="background:${esc(g.color)}"></i>${esc(g.name)}</h2>
    <p style="color:var(--dim);font-size:14px">${esc(g.desc || '')}</p>
    <ul>${g.list.map(n => `<li><a href="${esc(n.id)}.html">${esc(n.t)}</a> — ${esc(clip(n.def, 80))}</li>`).join('')}</ul>
  </section>`).join('')}

  <section class="dom">
    <h2>面试题 · ${qa.length} 道</h2>
    <p style="color:var(--dim);font-size:14px">每题含参考答案、追问方向与常见踩坑。</p>
    <ul>${qa.map((q, i) => `<li><a href="qa.html#q${i + 1}">${esc(q.q)}</a></li>`).join('')}</ul>
  </section>

  <section class="dom">
    <h2>架构图 · ${systems.length} 张</h2>
    <p style="color:var(--dim);font-size:14px">在星图的「架构」页可交互查看，含全局数据流。</p>
    <ul>${systems.map(s => `<li><b>${esc(s.title)}</b> — ${esc(clip(s.desc, 90))}</li>`).join('')}</ul>
  </section>

  <a class="cta" href="../">进入无限画布 →</a>
</article>`;

writeFileSync(join(ROOT, 'topics', 'index.html'), layout({
  title: `智驾数据闭环 · 207 个知识点总览 · ${SITE_NAME}`,
  desc: SITE_DESC,
  canonical: abs('topics/'),
  jsonld: [
    webSiteLd,
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: '智驾数据闭环 · 207 个知识点', url: abs('topics/'), inLanguage: 'zh-CN',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: nodes.length,
        itemListElement: nodes.map((n, i) => ({
          '@type': 'ListItem', position: i + 1, name: n.t, url: pageUrl(n.id),
        })),
      },
    },
  ],
  body: hubBody,
}), 'utf8');

// ── 面试题（FAQPage，可出富结果） ──
const qaBody = `
<article>
  <p class="crumb"><a href="./">知识点</a> › 面试题</p>
  <h1>智驾数据闭环 · ${qa.length} 道面试题</h1>
  <p>每题给出参考答案、追问方向与常见踩坑。按领域分组。</p>
  ${domains.filter(d => qa.some(q => q.d === d.key)).map(d => `
  <section class="dom">
    <h2><i style="background:${esc(d.color)}"></i>${esc(d.name)}</h2>
    ${qa.map((q, i) => ({ q, i })).filter(({ q }) => q.d === d.key).map(({ q, i }) => `
    <h3 id="q${i + 1}">${esc(q.q)}</h3>
    <div class="qa">${esc(q.a)}</div>
    ${q.follow ? `<p><b>追问：</b>${esc(q.follow)}</p>` : ''}
    ${q.trap ? `<div class="pit"><b>踩坑：</b>${esc(q.trap)}</div>` : ''}`).join('')}
  </section>`).join('')}
  <a class="cta" href="./">按知识点看 →</a>
</article>`;

writeFileSync(join(ROOT, 'topics', 'qa.html'), layout({
  title: `智驾数据闭环面试题 ${qa.length} 道（含参考答案） · ${SITE_NAME}`,
  desc: `智驾数据闭环高频面试题 ${qa.length} 道，覆盖范式与价值、采集回传、数据基础设施、挖掘标注、训练、仿真评测、部署回流、组织工具链、系统架构、车端基础、算子。每题含参考答案、追问方向与常见踩坑。`,
  canonical: abs('topics/qa.html'),
  jsonld: {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: qa.map(q => ({
      '@type': 'Question', name: oneLine(q.q),
      acceptedAnswer: { '@type': 'Answer', text: oneLine(q.a) },
    })),
  },
  body: qaBody,
}), 'utf8');

// ── robots.txt ──
writeFileSync(join(ROOT, 'robots.txt'), `# ${SITE_NAME} · Autonomous Data Loop
# 这个站的目标就是被找到，因此全站放行（含 AI 抓取器）。
User-agent: *
Allow: /

# AI / LLM 抓取器：显式放行
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bytespider
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: cohere-ai
Allow: /

Sitemap: ${abs('sitemap.xml')}
`, 'utf8');

// ── sitemap.xml ──
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)].map(u => `  <url><loc>${esc(u)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

// ── llms.txt ──
const llms = `# ${SITE_NAME} · Autonomous Data Loop

> ${SITE_DESC}

本站是一张可无限漫游的知识星图，同时为每个知识点提供纯 HTML 版本（下面是全量索引）。
技术栈：纯静态（无后端），原生 canvas + ES 模块。内容 207 个知识点 / ${qa.length} 道面试题 / ${systems.length} 张架构图。

- 在线星图：${abs('')}
- 知识点总览（全量正文入口）：${abs('topics/')}
- 面试题：${abs('topics/qa.html')}

## 领域划分

${byDomain.map(g => `### ${g.name}\n\n${g.desc || ''}\n\n${g.list.map(n => `- [${n.t}](${pageUrl(n.id)}): ${oneLine(n.def)}`).join('\n')}`).join('\n\n')}

## 架构图

${systems.map(s => `- **${s.title}**：${oneLine(s.desc)}`).join('\n')}

## 学习路径（${learningPath.length} 个阶段）

${learningPath.map(s => `- **${s.title}**（${s.hours}）：${oneLine(s.goal)}`).join('\n')}

## 面试题

${qa.map(q => `- ${oneLine(q.q)}\n  - 答：${oneLine(q.a)}`).join('\n')}
`;
writeFileSync(join(ROOT, 'llms.txt'), llms, 'utf8');

// ── IndexNow 归属校验文件 ──
writeFileSync(join(ROOT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY, 'utf8');

const kb = s => (Buffer.byteLength(s, 'utf8') / 1024).toFixed(0) + ' KB';
console.log(`✓ SEO 产物已生成`);
console.log(`  topics/  ${nodes.length} 个知识点页 + 总览 + 面试题页`);
console.log(`  sitemap.xml  ${new Set(urls).size} 条 URL`);
console.log(`  robots.txt  ${kb(readFileSync(join(ROOT, 'robots.txt'), 'utf8'))}`);
console.log(`  llms.txt    ${kb(llms)}`);
console.log(`  ${INDEXNOW_KEY}.txt  (IndexNow)`);
