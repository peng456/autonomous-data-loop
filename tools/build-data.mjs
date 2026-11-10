// 内容 → 单文件数据（无构建依赖，Node 直接跑）
// 用法：node tools/build-data.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const { domains, root } = await import('../data/src/00-meta.mjs');
const mods = ['01-why', '02-collect', '03-infra', '04-mine', '05-train', '06-eval', '07-deploy', '08-org', '09-stack', '12-ops', '13-vehicle'];
const nodes = [root];
for (const m of mods) {
  const list = (await import(`../data/src/${m}.mjs`)).default;
  nodes.push(...list);
}
const qa = (await import('../data/src/10-qa.mjs')).default;
const { path } = await import('../data/src/11-path.mjs');

const byId = new Map(nodes.map(n => [n.id, n]));
const errs = [];
const seen = new Set();
const dk = new Set([...domains.map(d => d.key), 'core']);
for (const n of nodes) {
  if (seen.has(n.id)) errs.push(`重复 id: ${n.id}`);
  seen.add(n.id);
  if (!dk.has(n.d)) errs.push(`未知域 ${n.d} @ ${n.id}`);
  if (n.p && !byId.has(n.p)) errs.push(`父节点不存在 ${n.p} @ ${n.id}`);
  if (!n.def || !n.q) errs.push(`节点缺字段 ${n.id}`);
  for (const e of n.x || []) {
    if (!byId.has(e.to)) errs.push(`边目标不存在 ${e.to} @ ${n.id}`);
  }
}
for (const q of qa) if (!dk.has(q.d)) errs.push(`QA 域错误 ${q.d}`);
for (const st of path) for (const id of st.nodes) if (!byId.has(id)) errs.push(`路径节点不存在 ${id}`);

const edges = [];
const push = (s, t, r, l) => {
  if (!s || !byId.has(s) || !byId.has(t) || s === t) return;
  edges.push({ s, t, r, ...(l ? { l } : {}) });
};
for (const n of nodes) {
  if (n.p) push(n.p, n.id, 'include');
  for (const e of n.x || []) push(n.id, e.to, e.r, e.l);
}
const eSeen = new Set();
const edgesU = edges.filter(e => {
  const k = `${e.s}|${e.t}|${e.r}`;
  if (eSeen.has(k)) return false;
  eSeen.add(k); return true;
});

const deg = new Map(nodes.map(n => [n.id, 0]));
for (const e of edgesU) {
  deg.set(e.s, (deg.get(e.s) || 0) + 1);
  deg.set(e.t, (deg.get(e.t) || 0) + 1);
}

if (errs.length) {
  console.error('✗ 校验失败\n' + errs.join('\n'));
  process.exit(1);
}

const payload = {
  meta: {
    title: '智驾数据闭环宇宙',
    subtitle: '无限画布 · 连接每一个知识点',
    version: '0.1.0',
    updated: new Date().toISOString().slice(0, 10),
  },
  domains: [...domains, { key: 'core', name: '总纲', color: '#e8b95c', desc: '根节点' }],
  nodes: nodes.map(n => ({
    id: n.id, t: n.t, en: n.en || '', d: n.d, lv: n.lv || 2,
    def: n.def, pts: n.pts || [], q: n.q, pit: n.pit || '', deg: deg.get(n.id) || 0,
  })),
  edges: edgesU,
  qa,
  path,
};

const json = JSON.stringify(payload);
const out = `/* 自动生成，请勿手改。改内容请编辑 data/src/*.mjs 后运行 node tools/build-data.mjs */\nwindow.UNIVERSE = ${json};\n`;
writeFileSync(join(ROOT, 'data', 'universe.js'), out, 'utf8');

const chars = payload.nodes.reduce((a, n) => a + n.def.length + n.pts.join('').length + n.q.length + n.pit.length, 0)
  + payload.qa.reduce((a, q) => a + q.a.length + q.follow.length + q.trap.length, 0);
console.log(`✓ ${nodes.length} 节点 / ${edgesU.length} 关联 / ${qa.length} 面试题 / ${path.length} 阶段 / 约 ${(chars / 1000).toFixed(1)}k 字`);
console.log(`→ data/universe.js (${(out.length / 1024).toFixed(0)} KB)`);
