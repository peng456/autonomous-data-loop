// 组装发布目录 _site/
//
// 为什么要有这一步：index.html 是手写的源文件，里面的 canonical / og:url /
// og:image / JSON-LD 都是绝对 URL。换托管时这些必须跟着换，但不能去改源文件。
// 所以：源文件永远写默认基址，组装时按实际基址重写进 _site/。
//
// 用法：node tools/build-site.mjs      （SITE_BASE 环境变量可选）
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, DEFAULT_SITE, SITE_OVERRIDDEN } from './site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_site');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 1. 静态目录
for (const dir of ['assets', 'data', 'topics']) {
  const src = join(ROOT, dir);
  if (!existsSync(src)) {
    console.error(`✗ 缺少 ${dir}/ —— 先跑 npm run build`);
    process.exit(1);
  }
  cpSync(src, join(OUT, dir), { recursive: true });
}

// 2. 根目录产物（含 IndexNow 校验文件）
const rootFiles = new Set(['robots.txt', 'sitemap.xml', 'llms.txt']);
for (const f of readdirSync(ROOT)) if (f.endsWith('.txt')) rootFiles.add(f);
for (const f of rootFiles) {
  if (!existsSync(join(ROOT, f))) {
    console.error(`✗ 缺少 ${f} —— 先跑 npm run build`);
    process.exit(1);
  }
  copyFileSync(join(ROOT, f), join(OUT, f));
}

// 3. index.html：把默认基址替换成实际基址
let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
if (SITE_OVERRIDDEN) {
  const n = html.split(DEFAULT_SITE).length - 1;
  html = html.split(DEFAULT_SITE).join(SITE);
  console.log(`  index.html 重写 ${n} 处绝对 URL → ${SITE}`);
}
writeFileSync(join(OUT, 'index.html'), html, 'utf8');

const total = readdirSync(OUT, { recursive: true }).length;
console.log(`✓ _site/ 组装完成 · ${total} 项 · 基址 ${SITE}`);
