import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JSDOM } from 'jsdom';

const __dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dir, 'index.html'), 'utf8');
const dataJs = readFileSync(join(__dir, 'data', 'universe.js'), 'utf8');

const errs = [];
const fails = [];
const ok = (n, c, x = '') => { console.log(`${c ? '✓' : '✗'} ${n}${x ? '  ' + x : ''}`); if (!c) fails.push(n); };

function ctxStub() {
  const t = {};
  return new Proxy(t, {
    get(o, k) {
      if (k === 'measureText') return () => ({ width: 26 });
      if (k === 'canvas') return null;
      if (k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k in o) return o[k];
      return () => {};
    },
    set(o, k, v) { o[k] = v; return true; },
  });
}

// 用 jsdom 载入页面骨架，再手动注入数据与脚本（等价于 <script src>）
const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ''), {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.github.io/',
  beforeParse(w) {
    w.devicePixelRatio = 1;
    w.HTMLCanvasElement.prototype.getContext = () => ctxStub();
    w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ width: 1200, height: 800, left: 0, top: 0, right: 1200, bottom: 800, x: 0, y: 0 });
    w.addEventListener('error', e => errs.push(String(e.error || e.message)));
  },
});
const w = dom.window, d = w.document;

const s1 = d.createElement('script'); s1.textContent = dataJs; d.body.appendChild(s1);
const s2 = d.createElement('script');
s2.textContent = readFileSync(join(__dir, 'assets', 'app.js'), 'utf8');
d.body.appendChild(s2);

await new Promise(r => setTimeout(r, 150));

ok('脚本零报错', errs.length === 0, errs.slice(0, 2).join(' | '));
ok('数据加载', !!w.UNIVERSE && w.UNIVERSE.nodes.length === 189, `nodes=${w.UNIVERSE && w.UNIVERSE.nodes.length}`);
ok('域筛选 = 10', d.querySelectorAll('#chips .chip').length === 10);
ok('HUD 有探索计数', /已探索 0\/189/.test(d.querySelector('#expTxt').textContent), d.querySelector('#expTxt').textContent);

// 搜索 → 回车 → 打开详情 → 首读加 XP
const q = d.querySelector('#q');
q.value = '影子模式';
q.dispatchEvent(new w.Event('input', { bubbles: true }));
q.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
await new Promise(r => setTimeout(r, 80));
ok('搜索定位并打开面板', d.querySelector('#panel').classList.contains('open') && /影子/.test(d.querySelector('#panelBody').textContent));
ok('首读获得 XP', /8 XP/.test(d.querySelector('#xp').textContent), d.querySelector('#xp').textContent);
ok('探索计数 +1', /1\/189/.test(d.querySelector('#expTxt').textContent), d.querySelector('#expTxt').textContent);
ok('面板有「标记已学」', !!d.querySelector('#markBtn'));

// 学习页
d.querySelector('.tabs button[data-view="learn"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
ok('学习页 7 阶段', d.querySelectorAll('#stages .stage').length === 7);
ok('学习页节点 chip 可点', d.querySelectorAll('#stages .nchip').length > 100, `${d.querySelectorAll('#stages .nchip').length} 个`);

// 自测页
d.querySelector('.tabs button[data-view="quiz"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
ok('题库 44 题', d.querySelectorAll('#qlist .qcard').length === 44, `${d.querySelectorAll('#qlist .qcard').length}`);
d.querySelector('#qlist .qh').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
ok('题目可展开', d.querySelector('#qlist .qcard').classList.contains('open'));
const xpBefore = w.eval('document.querySelector("#xp").textContent');
d.querySelector('#qlist .grade .good').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
ok('打分加 XP', w.eval('document.querySelector("#xp").textContent') !== xpBefore, `${xpBefore} → ${w.eval('document.querySelector("#xp").textContent')}`);
ok('连对计数 +1', d.querySelector('#streak').textContent === '1');

// 漫游
d.querySelector('.tabs button[data-view="explore"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
d.querySelector('#roam').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await new Promise(r => setTimeout(r, 80));
ok('随机漫游打开面板', d.querySelector('#panel').classList.contains('open'));

ok('小地图存在', !!d.querySelector('#mini'));
ok('无异步异常', errs.length === 0, errs.slice(0, 2).join(' | '));

console.log('\n' + (fails.length ? `FAIL ${fails.length}:\n- ` + fails.join('\n- ') : 'ALL PASS'));
process.exit(fails.length ? 1 : 0);
