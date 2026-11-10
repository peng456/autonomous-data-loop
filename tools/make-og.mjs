// 生成社交分享卡（1200×630）：真实布局坐标 + 星云 + 文字
// 用法：node tools/make-og.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import opentype from 'opentype.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const W = 1200, H = 630;

// ── 读数据 ──
const js = readFileSync(join(ROOT, 'data', 'universe.js'), 'utf8');
const U = JSON.parse(js.match(/window\.UNIVERSE = (\{[\s\S]*\});/)[1]);
const { nodes, edges, domains } = U;
const byId = new Map(nodes.map(n => [n.id, n]));
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// ── 与 app.js 一致的布局 ──
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000; };
const DOMAINS = domains.filter(d => d.key !== 'core');
const ANGLE = new Map(DOMAINS.map((d, i) => [d.key, (i / DOMAINS.length) * Math.PI * 2 - Math.PI / 2]));
const P = new Map();
nodes.forEach(n => {
  if (n.id === 'root') return P.set(n.id, { x: 0, y: 0, vx: 0, vy: 0 });
  const base = ANGLE.get(n.d) || 0, j = hash(n.id) / 1000;
  const a = base + (j - 0.5) * 0.62;
  const rad = (n.lv === 1 ? 120 : n.lv === 2 ? 280 : 430) + (hash(n.id + 'x') % 90) - 45;
  P.set(n.id, { x: Math.cos(a) * rad, y: Math.sin(a) * rad, vx: 0, vy: 0 });
});
const arr = [...P.values()], ids = [...P.keys()], n0 = arr.length, REP = 5600;
for (let it = 0; it < 520; it++) {
  const t = 1 - it / 520, alpha = t * t;
  for (let i = 0; i < n0; i++) {
    const a = arr[i];
    for (let j = i + 1; j < n0; j++) {
      const b = arr[j];
      const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.01;
      if (d2 > 250000) continue;
      const d = Math.sqrt(d2), f = REP / d2;
      a.vx -= dx / d * f; a.vy -= dy / d * f; b.vx += dx / d * f; b.vy += dy / d * f;
    }
  }
  for (const e of edges) {
    const a = P.get(e.s), b = P.get(e.t);
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) + 0.01;
    const L = 74 + (byId.get(e.t).lv === 2 ? 12 : byId.get(e.t).lv === 3 ? 26 : 0);
    const f = (d - L) * 0.042;
    a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
  }
  for (let i = 0; i < n0; i++) {
    const p = arr[i], node = byId.get(ids[i]), ang = ANGLE.get(node.d);
    if (ang !== undefined && node.id !== 'root') {
      const R = node.lv === 1 ? 155 : node.lv === 2 ? 285 : 400;
      p.vx += (Math.cos(ang) * R - p.x) * 0.006;
      p.vy += (Math.sin(ang) * R - p.y) * 0.006;
    }
    p.vx -= p.x * 0.011; p.vy -= p.y * 0.011;
    p.vx *= 0.86; p.vy *= 0.86;
    const lim = 14 * (0.4 + alpha), m = Math.hypot(p.vx, p.vy);
    if (m > lim) { p.vx = p.vx / m * lim; p.vy = p.vy / m * lim; }
    p.x += p.vx * (0.55 + alpha * 0.6);
    p.y += p.vy * (0.55 + alpha * 0.6);
  }
}

// ── 画布 ──
const buf = new Float32Array(W * H * 3);
const plot = (x, y, r, g, b, a) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = ((y | 0) * W + (x | 0)) * 3;
  buf[o] += (r - buf[o]) * a;
  buf[o + 1] += (g - buf[o + 1]) * a;
  buf[o + 2] += (b - buf[o + 2]) * a;
};

// 底色 + 右上角辉光
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 3;
    const t = y / H;
    buf[o] = 5 + t * 3; buf[o + 1] = 7 + t * 5; buf[o + 2] = 13 + t * 11;
  }
}
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d = Math.hypot((x - 980) / 700, (y - 40) / 520);
    const g = Math.max(0, 1 - d) ** 2 * 0.55;
    const o = (y * W + x) * 3;
    buf[o] += 14 * g; buf[o + 1] += 26 * g; buf[o + 2] += 48 * g;
  }
}

// 星尘
for (let i = 0; i < 420; i++) {
  const x = (hash('sx' + i) / 1000) * W, y = (hash('sy' + i) / 1000) * H;
  const a = 0.15 + (hash('sa' + i) / 1000) * 0.5;
  plot(x, y, 205, 220, 245, a);
}

// ── 布局映射到右侧区域 ──
let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
arr.forEach(p => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
const bw = x1 - x0, bh = y1 - y0;
const box = { x: 470, y: 58, w: W - 470 - 46, h: H - 58 * 2 };
const s = Math.min(box.w / bw, box.h / bh);
const mx = box.x + (box.w - bw * s) / 2, my = box.y + (box.h - bh * s) / 2;
const TX = p => (p.x - x0) * s + mx;
const TY = p => (p.y - y0) * s + my;

// 星云（按域质心 + 半径）
for (const d of DOMAINS) {
  const ns = nodes.filter(n => n.d === d.key);
  if (!ns.length) continue;
  let cx = 0, cy = 0;
  ns.forEach(n => { const p = P.get(n.id); cx += p.x; cy += p.y; });
  cx /= ns.length; cy /= ns.length;
  let rr = 0;
  ns.forEach(n => { const p = P.get(n.id); rr = Math.max(rr, Math.hypot(p.x - cx, p.y - cy)); });
  const sx = TX({ x: cx, y: cy }), sy = TY({ x: cx, y: cy }), R = rr * s * 1.35;
  const [cr, cg, cb] = hex(d.color);
  const r0 = Math.ceil(sx - R), r1 = Math.floor(sx + R), k0 = Math.ceil(sy - R), k1 = Math.floor(sy + R);
  for (let y = k0; y <= k1; y++) {
    for (let x = r0; x <= r1; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const dd = Math.hypot(x - sx, y - sy) / R;
      if (dd >= 1) continue;
      const g = (1 - dd) ** 2.2 * 0.16;
      const o = (y * W + x) * 3;
      buf[o] += cr * g; buf[o + 1] += cg * g; buf[o + 2] += cb * g;
    }
  }
}

// 边
const line = (xa, ya, xb, yb, r, g, b, a) => {
  const steps = Math.ceil(Math.hypot(xb - xa, yb - ya));
  for (let i = 0; i <= steps; i++) {
    const t = i / (steps || 1);
    plot(xa + (xb - xa) * t, ya + (yb - ya) * t, r, g, b, a);
  }
};
for (const e of edges) {
  const a = P.get(e.s), b = P.get(e.t);
  line(TX(a), TY(a), TX(b), TY(b), 70, 95, 135, 0.22);
}
// 节点
for (const n of nodes) {
  const p = P.get(n.id);
  const [r, g, b] = n.id === 'root' ? [232, 185, 92] : hex((domains.find(d => d.key === n.d) || {}).color || '#8899aa');
  const rad = (n.id === 'root' ? 7.5 : n.lv === 1 ? 5.6 : n.lv === 2 ? 3.9 : 2.8) * 1.25;
  for (let dy = -rad; dy <= rad; dy++) {
    for (let dx = -rad; dx <= rad; dx++) {
      if (dx * dx + dy * dy > rad * rad) continue;
      plot(TX(p) + dx, TY(p) + dy, r, g, b, 0.95);
    }
  }
}
// 根节点光晕
{
  const p = P.get('root');
  for (let i = 0; i < 60; i++) {
    const rr = 9 + i * 1.1;
    for (let t = 0; t < 64; t++) {
      const a = t / 64 * Math.PI * 2;
      plot(TX(p) + Math.cos(a) * rr, TY(p) + Math.sin(a) * rr, 232, 185, 92, 0.05 * (1 - i / 60));
    }
  }
}

// ── 左侧压暗，保证文字可读 ──
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const a = Math.max(0, 1 - x / 620) ** 1.4 * 0.94;
    const o = (y * W + x) * 3;
    buf[o] *= 1 - a; buf[o + 1] *= 1 - a; buf[o + 2] *= 1 - a;
  }
}

// ── 文字渲染（opentype 轮廓 → 扫描线填充 → 2x 超采样）──
const fontBuf = readFileSync('/system/fonts/HarmonyOS_Sans_SC.ttf');
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));

function flatten(cmds) {
  const polys = []; let cur = null, x = 0, y = 0;
  for (const c of cmds) {
    if (c.type === 'M') { cur = [[c.x, c.y]]; polys.push(cur); x = c.x; y = c.y; }
    else if (c.type === 'L') { cur.push([c.x, c.y]); x = c.x; y = c.y; }
    else if (c.type === 'Q') {
      for (let t = 1; t <= 8; t++) {
        const u = t / 8, a = (1 - u) ** 2, b = 2 * (1 - u) * u, d = u * u;
        cur.push([a * x + b * c.x1 + d * c.x, a * y + b * c.y1 + d * c.y]);
      } x = c.x; y = c.y;
    } else if (c.type === 'C') {
      for (let t = 1; t <= 10; t++) {
        const u = t / 10, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, d = 3 * (1 - u) * u * u, e = u ** 3;
        cur.push([a * x + b * c.x1 + d * c.x2 + e * c.x, a * y + b * c.y1 + d * c.y2 + e * c.y]);
      } x = c.x; y = c.y;
    } else if (c.type === 'Z' && cur) { cur.push([cur[0][0], cur[0][1]]); }
  }
  return polys;
}

function drawText(text, px, penX, baselineY, color, weight) {
  const SS = 2;
  const path = font.getPath(text, 0, 0, px * SS);
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const c of path.commands) {
    for (const k of ['x', 'x1', 'x2']) if (c[k] != null) { minX = Math.min(minX, c[k]); maxX = Math.max(maxX, c[k]); }
    for (const k of ['y', 'y1', 'y2']) if (c[k] != null) { minY = Math.min(minY, c[k]); maxY = Math.max(maxY, c[k]); }
  }
  const w = Math.ceil(maxX - minX) + 2, h = Math.ceil(maxY - minY) + 2;
  const polys = flatten(path.commands).map(p => p.map(([x, y]) => [x - minX + 1, y - minY + 1]));
  const cov = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const sy = y + 0.5, xs = [];
    for (const poly of polys) {
      for (let i = 0; i < poly.length - 1; i++) {
        const [ax, ay] = poly[i], [bx, by] = poly[i + 1];
        if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) {
          xs.push({ x: ax + (bx - ax) * (sy - ay) / (by - ay), d: by > ay ? 1 : -1 });
        }
      }
    }
    xs.sort((a, b) => a.x - b.x);
    let wind = 0;
    for (let i = 0; i < xs.length - 1; i++) {
      wind += xs[i].d;
      if (wind !== 0) {
        const xa = Math.max(0, Math.ceil(xs[i].x - 0.5)), xb = Math.min(w - 1, Math.floor(xs[i + 1].x - 0.5));
        for (let x = xa; x <= xb; x++) cov[y * w + x] = 1;
      }
    }
  }
  // 2x 降采样 → alpha
  const w2 = Math.floor(w / 2), h2 = Math.floor(h / 2);
  const [cr, cg, cb] = color;
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      let a = 0;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) a += cov[(y * 2 + dy) * w + (x * 2 + dx)];
      a /= 4;
      if (a <= 0.01) continue;
      const X = Math.round(penX + x + minX / SS), Y = Math.round(baselineY + y + minY / SS);
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const o = (Y * W + X) * 3;
      buf[o] += (cr - buf[o]) * a;
      buf[o + 1] += (cg - buf[o + 1]) * a;
      buf[o + 2] += (cb - buf[o + 2]) * a;
    }
  }
  return (maxX - minX) / SS;
}

const GOLD = [232, 185, 92], INK = [231, 238, 251], MUT = [154, 169, 198], DIM = [110, 124, 150];

// 顶部小标签
drawText('AUTONOMOUS DATA LOOP', 15, 72, 150, GOLD);
// 主标题
drawText('数据闭环宇宙', 62, 68, 232, INK);
// 副标题
drawText('无限画布，连接每一个知识点', 24, 72, 286, MUT);
// 分隔线
for (let x = 72; x < 132; x++) line(x, 322, x, 322, 232, 185, 92, 0.85);
// 数据
drawText(`${nodes.length} 个知识点 · ${edges.length} 条关联`, 21, 72, 368, [205, 216, 235]);
drawText(`${U.qa.length} 道面试题 · ${U.path.length} 个学习阶段`, 21, 72, 402, [205, 216, 235]);
// 底部
drawText('peng456.github.io/autonomous-data-loop', 14, 72, 566, DIM);

// ── PNG 编码 ──
const rgb = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H * 3; i++) rgb[i] = Math.max(0, Math.min(255, buf[i]));
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  rgb.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
}
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = b => { let c = -1; for (const v of b) c = crcT[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(join(ROOT, 'assets', 'og.png'), png);
console.log(`✓ assets/og.png ${W}×${H} ${(png.length / 1024).toFixed(0)} KB`);
