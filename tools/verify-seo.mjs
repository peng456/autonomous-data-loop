// SEO 产物校验（CI 在 npm run build 之后运行）：node tools/verify-seo.mjs
// 目的：防止「主站又退回成爬虫读不到的空壳」这类回归。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://peng456.github.io/autonomous-data-loop';
const fails = [];
const ok = (n, c, x = '') => { console.log(`${c ? '✓' : '✗'} ${n}${x ? '  ' + x : ''}`); if (!c) fails.push(n); };
const read = p => readFileSync(join(ROOT, p), 'utf8');

// ── 1. 基础文件 ──
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'topics/index.html', 'topics/qa.html', 'topics/_style.css']) {
  ok(`存在 ${f}`, existsSync(join(ROOT, f)));
}
ok('robots.txt 声明 sitemap', /Sitemap:\s*https:\/\/\S+sitemap\.xml/.test(read('robots.txt')));
ok('robots.txt 放行 AI 抓取器', /User-agent:\s*GPTBot[\s\S]*Allow:\s*\//.test(read('robots.txt')));

// ── 2. sitemap ──
const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const topicPages = readdirSync(join(ROOT, 'topics')).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'qa.html');
ok('sitemap 有 URL', locs.length >= 205, `${locs.length} 条`);
ok('sitemap URL 全覆盖知识点页', topicPages.every(f => locs.includes(`${SITE}/topics/${f}`)), `${topicPages.length} 页`);
ok('sitemap 无重复', new Set(locs).size === locs.length);

// ── 3. 知识点页结构 ──
const badTitle = [], badCanon = [], badDesc = [];
for (const f of topicPages) {
  const h = read(`topics/${f}`);
  if (!/<title>[^<]{6,}<\/title>/.test(h)) badTitle.push(f);
  if (!h.includes(`<link rel="canonical" href="${SITE}/topics/${f}">`)) badCanon.push(f);
  if (!/<meta name="description" content="[^"]{20,}"/.test(h)) badDesc.push(f);
}
ok('每页有 title', badTitle.length === 0, badTitle.slice(0, 3).join(','));
ok('每页有 canonical', badCanon.length === 0, badCanon.slice(0, 3).join(','));
ok('每页有 description', badDesc.length === 0, badDesc.slice(0, 3).join(','));
ok('知识点页带 Article 结构化数据', /"@type":\s*"Article"/.test(read('topics/root.html')));
ok('面试题页带 FAQPage 结构化数据', /"@type":\s*"FAQPage"/.test(read('topics/qa.html')));

// ── 4. 正文量回归闸门 ──
const stripText = p => {
  let s = read(p);
  s = s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};
const hub = stripText('topics/index.html');
const nodeLen = stripText('topics/collect.sensor.html').length;
ok('知识点总览正文 ≥ 10k 字符', hub.length >= 10000, `${hub.length}`);
ok('单个知识点页正文 ≥ 500 字符', nodeLen >= 500, `${nodeLen}`);
const total = topicPages.reduce((a, f) => a + stripText(`topics/${f}`).length, 0);
ok('全部知识点页正文 ≥ 100k 字符', total >= 100000, `${total}`);

// ── 5. llms.txt 覆盖 ──
const llms = read('llms.txt');
const llmsBytes = Buffer.byteLength(llms, 'utf8');
ok('llms.txt ≥ 50 KB', llmsBytes >= 50000, `${(llmsBytes / 1024).toFixed(0)} KB`);
ok('llms.txt 链接了全部知识点页', topicPages.every(f => llms.includes(`${SITE}/topics/${f}`)));

// ── 6. 深链接：/?n=<id> 能直接点亮对应星 ──
const html = read('index.html').replace(/<script src="[^"]+"><\/script>/g, '');
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.github.io/?n=collect.sensor',
  beforeParse(w) {
    w.devicePixelRatio = 1;
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
      get(o, k) {
        if (k === 'measureText') return () => ({ width: 26 });
        if (k === 'createRadialGradient') return () => ({ addColorStop() {} });
        if (k in o) return o[k];
        return () => {};
      }, set(o, k, v) { o[k] = v; return true; },
    });
    w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ width: 1200, height: 800, left: 0, top: 0, right: 1200, bottom: 800, x: 0, y: 0 });
  },
});
const w = dom.window, d = w.document;
const s1 = d.createElement('script'); s1.textContent = read('data/universe.js'); d.body.appendChild(s1);
const s2 = d.createElement('script'); s2.textContent = read('assets/app.js'); d.body.appendChild(s2);
await new Promise(r => setTimeout(r, 200));
ok('深链接打开对应知识点', d.querySelector('#panel').classList.contains('open')
  && /传感器/.test(d.querySelector('#panelBody').textContent));
ok('深链接隐藏新手引导', d.querySelector('#onboard').classList.contains('hide'));

console.log('\n' + (fails.length ? `FAIL ${fails.length}:\n- ` + fails.join('\n- ') : 'SEO ALL PASS'));
process.exit(fails.length ? 1 : 0);
