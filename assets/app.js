(function () {
  'use strict';

  const U = window.UNIVERSE;
  if (!U) {
    document.body.innerHTML = '<div style="padding:40px;color:#e7eefb;font:14px system-ui">' +
      '<h2>数据还没生成</h2><p style="color:#9aa9c6">在仓库根目录运行：<code>node tools/build-data.mjs</code></p></div>';
    return;
  }

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const NODES = U.nodes, EDGES = U.edges, QA = U.qa, PATH = U.path;
  const DOM = new Map(U.domains.map(d => [d.key, d]));
  const BYID = new Map(NODES.map(n => [n.id, n]));
  const ADJ = new Map(NODES.map(n => [n.id, []]));
  EDGES.forEach(e => { ADJ.get(e.s).push(e); ADJ.get(e.t).push(e); });
  const DOMAINS = U.domains.filter(d => d.key !== 'core');

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
  };

  // ───────── 状态 ─────────
  const P = new Map();
  const hidden = new Set();
  let selected = null, hover = null, matches = null, query = '';
  const view = { k: 1, tx: 0, ty: 0 };
  let W = 0, H = 0, DPR = 1, anim = null, currentView = 'explore';

  const visited = new Set(LS.get('dlu-visited', []));
  let xp = Number(LS.get('dlu-xp', 0)) || 0;
  let streak = Number(LS.get('dlu-streak', 0)) || 0;
  const graded = new Set(LS.get('dlu-graded', []));

  const cv = $('#cv'), ctx = cv.getContext('2d');
  const mini = $('#mini'), mctx = mini.getContext('2d');

  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000; };
  const radius = n => (n.id === 'root' ? 15 : n.lv === 1 ? 11 : n.lv === 2 ? 7.6 : 5.6) + Math.min(6, Math.sqrt(n.deg) * 0.9);
  const visible = n => !hidden.has(n.d);
  const visIds = () => NODES.filter(visible).map(n => n.id);

  // ───────── 星空背景 ─────────
  const STARS = Array.from({ length: 240 }, (_, i) => ({
    x: (hash('s' + i) / 1000), y: (hash('t' + i) / 1000),
    r: 0.4 + (hash('r' + i) / 1000) * 1.1, a: 0.18 + (hash('a' + i) / 1000) * 0.5,
  }));

  // ───────── 布局 ─────────
  const ANGLE = new Map(DOMAINS.map((d, i) => [d.key, (i / DOMAINS.length) * Math.PI * 2 - Math.PI / 2]));

  function seed() {
    NODES.forEach(n => {
      if (n.id === 'root') { P.set(n.id, { x: 0, y: 0, vx: 0, vy: 0 }); return; }
      const base = ANGLE.get(n.d) || 0;
      const j = hash(n.id) / 1000;
      const a = base + (j - 0.5) * 0.62;
      const rad = (n.lv === 1 ? 120 : n.lv === 2 ? 280 : 430) + (hash(n.id + 'x') % 90) - 45;
      P.set(n.id, { x: Math.cos(a) * rad, y: Math.sin(a) * rad, vx: 0, vy: 0 });
    });
  }

  function simulate(iter) {
    const ids = visIds(), arr = ids.map(id => P.get(id)), n = ids.length, REP = 5600;
    for (let it = 0; it < iter; it++) {
      const t = 1 - it / iter, alpha = t * t;
      for (let i = 0; i < n; i++) {
        const a = arr[i];
        for (let j = i + 1; j < n; j++) {
          const b = arr[j];
          const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.01;
          if (d2 > 250000) continue;
          const d = Math.sqrt(d2), f = REP / d2;
          a.vx -= dx / d * f; a.vy -= dy / d * f; b.vx += dx / d * f; b.vy += dy / d * f;
        }
      }
      for (const e of EDGES) {
        if (hidden.has(BYID.get(e.s).d) || hidden.has(BYID.get(e.t).d)) continue;
        const a = P.get(e.s), b = P.get(e.t);
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) + 0.01;
        const L = 74 + (BYID.get(e.t).lv === 2 ? 12 : BYID.get(e.t).lv === 3 ? 26 : 0);
        const f = (d - L) * 0.042;
        a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
      }
      for (let i = 0; i < n; i++) {
        const p = arr[i], node = BYID.get(ids[i]), ang = ANGLE.get(node.d);
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
  }

  // ───────── 视图 ─────────
  function fitView(animate) {
    const ids = visIds();
    if (!ids.length) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ids.forEach(id => {
      const p = P.get(id), r = radius(BYID.get(id));
      x0 = Math.min(x0, p.x - r); y0 = Math.min(y0, p.y - r);
      x1 = Math.max(x1, p.x + r); y1 = Math.max(y1, p.y + r);
    });
    const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
    const pad = W < 820 ? 34 : 86;
    const k = Math.max(0.18, Math.min(1.5, Math.min((W - pad * 2) / bw, (H - pad * 2) / bh)));
    const t = { k, tx: W / 2 - (x0 + x1) / 2 * k, ty: H / 2 - (y0 + y1) / 2 * k };
    animate ? tween(t) : Object.assign(view, t);
    draw();
  }

  function tween(target, dur) {
    if (anim) cancelAnimationFrame(anim);
    const from = { ...view }, t0 = performance.now();
    dur = dur || 340;
    const step = now => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      view.k = from.k + (target.k - from.k) * e;
      view.tx = from.tx + (target.tx - from.tx) * e;
      view.ty = from.ty + (target.ty - from.ty) * e;
      draw();
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function centerOn(id, zoom) {
    const p = P.get(id);
    if (!p) return;
    const mobile = window.innerWidth <= 820;
    const k = zoom || Math.max(view.k, 1.05);
    const cx = mobile ? W / 2 : (W - 408) / 2;
    const cy = mobile ? H * 0.26 : H / 2;
    tween({ k, tx: cx - p.x * k, ty: cy - p.y * k });
  }

  const toWorld = (sx, sy) => ({ x: (sx - view.tx) / view.k, y: (sy - view.ty) / view.k });

  function hitTest(w) {
    let best = null, bd = 1e9;
    for (const n of NODES) {
      if (!visible(n)) continue;
      const p = P.get(n.id), r = radius(n) + 8 / view.k;
      const d = Math.hypot(w.x - p.x, w.y - p.y);
      if (d < r && d < bd) { bd = d; best = n; }
    }
    return best;
  }

  // ───────── 绘制 ─────────
  function drawStars() {
    for (const s of STARS) {
      let x = (s.x * W + view.tx * 0.05) % W; if (x < 0) x += W;
      let y = (s.y * H + view.ty * 0.05) % H; if (y < 0) y += H;
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#cddcf7';
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const NEB = new Map();
  function nebula() {
    if (NEB.size) return NEB;
    for (const d of DOMAINS) {
      const ns = NODES.filter(n => n.d === d.key);
      if (!ns.length) continue;
      let cx = 0, cy = 0;
      ns.forEach(n => { const p = P.get(n.id); cx += p.x; cy += p.y; });
      cx /= ns.length; cy /= ns.length;
      let rr = 60;
      ns.forEach(n => { const p = P.get(n.id); rr = Math.max(rr, Math.hypot(p.x - cx, p.y - cy)); });
      NEB.set(d.key, { x: cx, y: cy, r: rr * 1.25, c: d.color });
    }
    return NEB;
  }

  function draw() {
    if (!W || !P.size) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawStars();

    ctx.save();
    ctx.translate(view.tx, view.ty);
    ctx.scale(view.k, view.k);

    // 星云
    for (const [, b] of nebula()) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c + '1f');
      g.addColorStop(0.55, b.c + '0d');
      g.addColorStop(1, b.c + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 7);
      ctx.fill();
    }

    const selSet = selected ? new Set([selected, ...ADJ.get(selected).map(e => e.s === selected ? e.t : e.s)]) : null;
    const dimAll = !!selected || !!matches;

    for (const e of EDGES) {
      const A = BYID.get(e.s), B = BYID.get(e.t);
      if (!visible(A) || !visible(B)) continue;
      const a = P.get(e.s), b = P.get(e.t);
      if (!a || !b) continue;
      const hot = selected && (e.s === selected || e.t === selected);
      ctx.strokeStyle = hot ? DOM.get(BYID.get(e.s === selected ? e.t : e.s).d).color : '#39506f';
      ctx.globalAlpha = hot ? 0.6 : dimAll ? 0.04 : 0.11;
      ctx.lineWidth = (hot ? 1.5 : 0.8) / view.k;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const labels = [];
    for (const n of NODES) {
      if (!visible(n)) continue;
      const p = P.get(n.id), r = radius(n);
      if (!p) continue;
      const dom = DOM.get(n.d);
      const isSel = n.id === selected, isHover = n.id === hover;
      const isMatch = matches && matches.has(n.id);
      const seen = visited.has(n.id);
      let alpha = 1;
      if (selSet && !selSet.has(n.id)) alpha = 0.15;
      else if (matches && !isMatch && !isSel) alpha = 0.2;

      if (seen) {
        ctx.globalAlpha = alpha * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 3.2 / view.k, 0, 7);
        ctx.strokeStyle = dom.color;
        ctx.lineWidth = 1 / view.k;
        ctx.stroke();
      }
      if (isSel || isHover || isMatch) {
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 7 / view.k, 0, 7);
        ctx.fillStyle = dom.color + '30'; ctx.fill();
      }

      ctx.globalAlpha = alpha * (n.lv === 3 ? 0.8 : 0.97);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7);
      ctx.fillStyle = n.id === 'root' ? '#e8b95c' : dom.color;
      ctx.fill();

      if (isSel) {
        ctx.globalAlpha = 1; ctx.lineWidth = 2 / view.k; ctx.strokeStyle = '#fff'; ctx.stroke();
      }
      labels.push({ n, alpha, isSel, isHover, isMatch, x: p.x * view.k + view.tx, y: p.y * view.k + view.ty, r: r * view.k });
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // 标签（屏幕空间 + 碰撞避让）
    const FONT = '-apple-system,"PingFang SC","Noto Sans SC",sans-serif';
    labels.sort((a, b) => (b.isSel ? 2 : b.isMatch ? 1 : 0) - (a.isSel ? 2 : a.isMatch ? 1 : 0) || a.n.lv - b.n.lv);
    const placed = [];
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const L of labels) {
      const n = L.n;
      const show = L.isSel || L.isHover || L.isMatch || n.lv === 1 ||
        (n.lv === 2 && view.k > 0.7) || (n.lv === 3 && view.k > 1.2);
      if (!show) continue;
      const fs = n.lv === 1 ? 12 : 10.5;
      const text = n.t.length > 10 ? n.t.slice(0, 10) + '…' : n.t;
      ctx.font = (n.lv === 1 ? '600 ' : '400 ') + fs + 'px ' + FONT;
      const w2 = ctx.measureText(text).width;
      const x = L.x, y = L.y + L.r + 5;
      const box = { x: x - w2 / 2 - 3, y: y - 2, w: w2 + 6, h: fs + 5 };
      const clash = placed.some(b => !(box.x > b.x + b.w || box.x + box.w < b.x || box.y > b.y + b.h || box.y + box.h < b.y));
      if (clash && !(L.isSel || L.isHover)) continue;
      placed.push(box);
      ctx.globalAlpha = L.alpha;
      ctx.fillStyle = 'rgba(5,7,13,.76)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(box.x, box.y, box.w, box.h, 4); else ctx.rect(box.x, box.y, box.w, box.h);
      ctx.fill();
      ctx.fillStyle = L.isSel ? '#fff' : n.lv === 1 ? '#eaf1fc' : '#a7b6d1';
      ctx.fillText(text, x, y);
    }
    ctx.globalAlpha = 1;
    drawMini();
  }

  function drawMini() {
    const w = mini.width, h = mini.height;
    mctx.clearRect(0, 0, w, h);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    visIds().forEach(id => {
      const p = P.get(id);
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    });
    const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0), pad = 12;
    const k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    const ox = (w - bw * k) / 2 - x0 * k, oy = (h - bh * k) / 2 - y0 * k;

    for (const n of NODES) {
      if (!visible(n)) continue;
      const p = P.get(n.id);
      mctx.fillStyle = DOM.get(n.d).color;
      mctx.globalAlpha = visited.has(n.id) ? 0.95 : 0.5;
      mctx.beginPath();
      mctx.arc(p.x * k + ox, p.y * k + oy, n.lv === 1 ? 2.6 : 1.5, 0, 7);
      mctx.fill();
    }
    mctx.globalAlpha = 1;

    const tl = toWorld(0, 0), br = toWorld(W, H);
    mctx.strokeStyle = 'rgba(232,185,92,.75)';
    mctx.lineWidth = 1.4;
    mctx.strokeRect(tl.x * k + ox, tl.y * k + oy, (br.x - tl.x) * k, (br.y - tl.y) * k);
  }

  // ───────── 交互 ─────────
  let dragNode = null, panStart = null, downAt = null, moved = false;
  const pointers = new Map();
  let pinch = null;

  const evPos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  cv.addEventListener('pointerdown', e => {
    try { if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId); } catch (_) {}
    const pos = evPos(e);
    pointers.set(e.pointerId, pos);
    moved = false; downAt = pos;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, tx: view.tx, ty: view.ty };
      dragNode = null; panStart = null; return;
    }
    const w = toWorld(pos.x, pos.y), hit = hitTest(w);
    if (hit) dragNode = { id: hit.id, ox: w.x - P.get(hit.id).x, oy: w.y - P.get(hit.id).y };
    else panStart = { x: pos.x, y: pos.y, tx: view.tx, ty: view.ty };
  });

  cv.addEventListener('pointermove', e => {
    const pos = evPos(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, pos);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const k = Math.max(0.15, Math.min(4, pinch.k * (d / pinch.d)));
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      view.tx = cx - (pinch.cx - pinch.tx) * (k / pinch.k);
      view.ty = cy - (pinch.cy - pinch.ty) * (k / pinch.k);
      view.k = k; draw(); return;
    }
    if (dragNode) {
      const w = toWorld(pos.x, pos.y), p = P.get(dragNode.id);
      p.x = w.x - dragNode.ox; p.y = w.y - dragNode.oy;
      moved = true; draw(); return;
    }
    if (panStart) {
      const dx = pos.x - panStart.x, dy = pos.y - panStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      view.tx = panStart.tx + dx; view.ty = panStart.ty + dy;
      draw(); return;
    }
    const w = toWorld(pos.x, pos.y), h = hitTest(w);
    const hid = h ? h.id : null;
    if (hid !== hover) { hover = hid; cv.style.cursor = hid ? 'pointer' : 'grab'; draw(); }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!moved && downAt) {
      const w = toWorld(downAt.x, downAt.y), hit = hitTest(w);
      if (hit) selectNode(hit.id, false); else clearSelection();
    }
    dragNode = null; panStart = null; downAt = null;
  }
  cv.addEventListener('pointerup', endPointer);
  cv.addEventListener('pointercancel', endPointer);

  cv.addEventListener('wheel', e => {
    e.preventDefault();
    const pos = evPos(e), k0 = view.k;
    const k = Math.max(0.15, Math.min(4, k0 * Math.exp(-e.deltaY * 0.0016)));
    view.tx = pos.x - (pos.x - view.tx) * (k / k0);
    view.ty = pos.y - (pos.y - view.ty) * (k / k0);
    view.k = k; draw();
  }, { passive: false });

  cv.addEventListener('dblclick', e => {
    const w = toWorld(...Object.values(evPos(e)).slice(0, 2));
    const hit = hitTest(w);
    if (hit) centerOn(hit.id, 1.6);
  });

  $('#mini').addEventListener('click', e => {
    const r = mini.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width * mini.width;
    const my = (e.clientY - r.top) / r.height * mini.height;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    visIds().forEach(id => { const p = P.get(id); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
    const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0), pad = 12, w = mini.width, h = mini.height;
    const k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    const ox = (w - bw * k) / 2 - x0 * k, oy = (h - bh * k) / 2 - y0 * k;
    const wx = (mx - ox) / k, wy = (my - oy) / k;
    tween({ k: view.k, tx: W / 2 - wx * view.k, ty: H / 2 - wy * view.k }, 260);
  });

  window.addEventListener('resize', () => { resize(); });

  function resize() {
    const r = cv.getBoundingClientRect();
    DPR = Math.min(2.5, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    draw();
    if (currentView === 'sys') {
      const st = (U.systems || []).find(x => x.id === sysId);
      if (st) setTimeout(() => drawLinks(st), 40);
    }
  }

  // ───────── XP / 等级 / toast ─────────
  const LEVELS = [
    [0, '星际漫游者'], [160, '星图测绘员'], [420, '航线领航员'],
    [820, '星系舰长'], [1400, '闭环指挥官'], [2200, '宇宙架构师'],
  ];

  function levelInfo() {
    let i = 0;
    for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k][0]) i = k;
    const cur = LEVELS[i][0], next = LEVELS[i + 1] ? LEVELS[i + 1][0] : cur + 800;
    return { lv: i + 1, name: LEVELS[i][1], cur, next };
  }

  function refreshHUD() {
    const L = levelInfo();
    $('#lvlNum').textContent = 'Lv.' + L.lv;
    $('#lvlName').textContent = L.name;
    $('#xp').textContent = xp + ' XP';
    $('#xpBar').style.width = Math.min(100, (xp - L.cur) / (L.next - L.cur) * 100) + '%';
    $('#expTxt').textContent = `已探索 ${visited.size}/${NODES.length}`;
    LS.set('dlu-xp', xp);
    LS.set('dlu-visited', [...visited]);
  }

  let toastTimer = null;
  function toast(text, dim) {
    const box = $('#toast');
    const el = document.createElement('div');
    el.className = 'tst' + (dim ? ' dim' : '');
    el.textContent = text;
    box.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; }, 1700);
    setTimeout(() => el.remove(), 2200);
  }

  function visit(id, silent) {
    if (visited.has(id)) return false;
    visited.add(id);
    xp += 8;
    refreshHUD();
    const dom = DOM.get(BYID.get(id).d);
    if (!silent) toast('✦ 新发现 +8 XP');
    // 星系点亮
    const dn = NODES.filter(n => n.d === BYID.get(id).d);
    if (dn.every(n => visited.has(n.id))) {
      xp += 100;
      refreshHUD();
      toast(`🌌 星系点亮：${dom.name} +100 XP`);
    }
    return true;
  }

  // ───────── 详情面板 ─────────
  function neighborList(n) {
    const m = new Map();
    for (const e of ADJ.get(n.id)) {
      const o = e.s === n.id ? e.t : e.s;
      const w = e.r === 'include' ? 3 : e.r === 'flow' ? 2 : 1;
      const prev = m.get(o);
      if (!prev || prev.w < w) m.set(o, { id: o, w });
    }
    if (n.id !== 'root') {
      const par = EDGES.find(e => e.t === n.id && e.r === 'include');
      if (par) m.set(par.s, { id: par.s, w: 4 });
    }
    return [...m.values()].sort((a, b) => b.w - a.w).slice(0, 16).map(x => BYID.get(x.id));
  }

  function renderPanel(n) {
    const dom = DOM.get(n.d);
    const links = neighborList(n).map(o => `<button class="lchip" data-goto="${esc(o.id)}">${esc(o.t)}</button>`).join('');
    const pts = (n.pts || []).map(p => `<li>${esc(p)}</li>`).join('');
    const isDone = visited.has(n.id);
    $('#panelBody').innerHTML = `
      <div class="dtag"><i style="background:${dom.color}"></i>${esc(dom.name)}${n.lv === 1 ? ' · 主干' : ''}</div>
      <div class="dhead"><h2>${esc(n.t)}</h2>${n.en ? `<div class="en">${esc(n.en)}</div>` : ''}</div>
      <div class="learnrow">
        <button class="learnbtn ${isDone ? 'on' : ''}" id="markBtn">${isDone ? '✦ 已学' : '标记已学 +8 XP'}</button>
        <em>${isDone ? '再来一遍也行' : '读完再点，星图会亮'}</em>
      </div>
      <div class="sec"><h4>是什么</h4><div class="def">${esc(n.def)}</div></div>
      ${pts ? `<div class="sec"><h4>关键点</h4><ul class="pts">${pts}</ul></div>` : ''}
      <div class="sec"><h4>面试怎么答</h4><div class="ansbox">${esc(n.q)}</div></div>
      ${n.pit ? `<div class="sec"><h4>常见坑</h4><div class="pit">${esc(n.pit)}</div></div>` : ''}
      ${links ? `<div class="sec"><h4>关联星球</h4><div class="links">${links}</div></div>` : ''}
    `;
    $('#markBtn').addEventListener('click', () => {
      if (visited.has(n.id)) { visited.delete(n.id); xp = Math.max(0, xp - 8); refreshHUD(); renderPanel(n); return; }
      visit(n.id);
      renderPanel(n);
    });
    $$('#panelBody [data-goto]').forEach(b => b.addEventListener('click', () => {
      setView('explore'); selectNode(b.dataset.goto, true);
    }));
    $('#panelBody').scrollTop = 0;
  }

  function selectNode(id, center) {
    selected = id;
    renderPanel(BYID.get(id));
    $('#panel').classList.add('open');
    if (center) centerOn(id);
    visit(id);
    draw();
  }

  function clearSelection() {
    selected = null;
    $('#panel').classList.remove('open');
    draw();
  }

  $('#close').addEventListener('click', clearSelection);

  // ───────── 域名筛选 ─────────
  const chipBox = $('#chips');
  DOMAINS.forEach(d => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.innerHTML = `<i style="background:${d.color}"></i>${d.name} <b></b>`;
    b.addEventListener('click', () => {
      if (hidden.has(d.key)) hidden.delete(d.key); else hidden.add(d.key);
      b.classList.toggle('off', hidden.has(d.key));
      relayout();
    });
    chipBox.appendChild(b);
  });

  function refreshChips() {
    $$('#chips .chip').forEach((b, i) => {
      const d = DOMAINS[i];
      const ns = NODES.filter(n => n.d === d.key);
      b.querySelector('b').textContent = ns.filter(n => visited.has(n.id)).length + '/' + ns.length;
    });
  }

  function relayout() {
    seed(); simulate(340); NEB.clear(); fitView(false);
  }

  // ───────── 搜索 ─────────
  const qEl = $('#q');
  qEl.addEventListener('input', () => {
    query = qEl.value.trim();
    if (currentView === 'quiz') { renderQuiz(); return; }
    if (!query) { matches = null; $('#qcount').textContent = ''; draw(); return; }
    const q = query.toLowerCase();
    matches = new Set();
    NODES.forEach(n => {
      const hay = (n.t + ' ' + (n.en || '') + ' ' + n.def + ' ' + (n.pts || []).join(' ') + ' ' + n.q).toLowerCase();
      if (hay.includes(q)) matches.add(n.id);
    });
    $('#qcount').textContent = matches.size ? matches.size + ' 颗' : '无';
    draw();
  });

  qEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || currentView === 'quiz' || !matches || !matches.size) return;
    let best = null, bs = -1;
    matches.forEach(id => {
      const n = BYID.get(id);
      const s = (n.t.toLowerCase().includes(query.toLowerCase()) ? 10 : 0) + n.deg;
      if (s > bs) { bs = s; best = n; }
    });
    if (best) { setView('explore'); selectNode(best.id, true); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { clearSelection(); $('#onboard').classList.add('hide'); }
    if (e.key === '/' && document.activeElement !== qEl) { e.preventDefault(); qEl.focus(); }
    if ((e.key === 'r' || e.key === 'R') && document.activeElement !== qEl) roam();
  });

  // ───────── 视图切换 ─────────
  function setView(v) {
    if (v !== currentView) {
      query = ''; matches = null;
      qEl.value = ''; $('#qcount').textContent = '';
    }
    currentView = v;
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
    $$('.view').forEach(s => s.classList.toggle('on', s.id === 'v-' + v));
    if (v === 'explore') { resize(); fitView(false); }
    if (v === 'sys') renderSystems();
    if (v === 'learn') renderLearn();
    if (v === 'quiz') renderQuiz();
  }
  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (b) setView(b.dataset.view);
  });

  // ───────── 学习路径 ─────────
  function stageStat(st) {
    const done = st.nodes.filter(id => visited.has(id)).length;
    return { done, total: st.nodes.length, all: done === st.nodes.length };
  }

  function firstUndone() {
    for (const st of PATH) {
      const un = st.nodes.find(id => !visited.has(id));
      if (un) return un;
    }
    return null;
  }

  function renderLearn() {
    const total = PATH.reduce((a, s) => a + s.nodes.length, 0);
    const done = PATH.reduce((a, s) => a + s.nodes.filter(id => visited.has(id)).length, 0);
    $('#learnBar').style.width = (done / total * 100) + '%';
    $('#learnTxt').textContent = `${done} / ${total} 已完成`;
    const next = firstUndone();
    $('#continue').disabled = !next;
    $('#continue').textContent = next ? '继续学习 →' : '全部完成 🎉';

    $('#stages').innerHTML = PATH.map((st, i) => {
      const s = stageStat(st);
      return `<div class="stage ${s.all ? 'done' : ''}">
        <div class="sh">
          <h3>${esc(st.title)}</h3>
          <span class="hrs">${esc(st.hours || '')}</span>
          <span class="cnt">${s.done}/${s.total}</span>
        </div>
        <div class="sgoal">${esc(st.goal)}</div>
        <div class="snodes">
          ${st.nodes.map(id => {
            const n = BYID.get(id);
            return `<button class="nchip ${visited.has(id) ? 'done' : ''}" data-goto="${esc(id)}">${esc(n.t)}</button>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');

    $$('#stages .nchip').forEach(b => b.addEventListener('click', () => {
      setView('explore'); selectNode(b.dataset.goto, true);
    }));
  }

  $('#continue').addEventListener('click', () => {
    const id = firstUndone();
    if (!id) return;
    setView('explore');
    selectNode(id, true);
  });

  // ───────── 自测 ─────────
  function renderQuiz() {
    const q = (query || '').toLowerCase();
    const list = QA.filter(x => !q || (x.q + x.a + x.follow + x.trap).toLowerCase().includes(q));
    $('#streak').textContent = streak;
    $('#qhint').textContent = `${list.length} / ${QA.length} 题 · 点开看答案，凭良心打分（分数只影响 XP）`;
    $('#qlist').innerHTML = list.map((x, i) => `
      <div class="qcard" data-i="${i}" data-key="${esc(x.q)}">
        <div class="qh">
          <span class="no">Q${String(QA.indexOf(x) + 1).padStart(2, '0')}</span>
          <span class="qt">${esc(x.q)}</span>
          <span class="dm">${esc((DOM.get(x.d) || {}).name || x.d)}</span>
        </div>
        <div class="qb">
          <span class="lab">答题框架</span><div class="ans">${esc(x.a)}</div>
          <span class="lab">会被追问</span><div class="fol">${esc(x.follow)}</div>
          <span class="lab">常见坑</span><div class="trp">${esc(x.trap)}</div>
          <div class="grade">
            <button class="good" data-g="1">记住了 +12</button>
            <button class="again" data-g="0">再练练</button>
          </div>
        </div>
      </div>`).join('');

    $$('#qlist .qh').forEach(h => h.addEventListener('click', () => {
      h.parentElement.classList.toggle('open');
    }));
    $$('#qlist .grade button').forEach(b => b.addEventListener('click', () => {
      const card = b.closest('.qcard');
      if (graded.has(card.dataset.key)) { toast('这题已经打过分了', true); return; }
      graded.add(card.dataset.key);
      LS.set('dlu-graded', [...graded]);
      if (b.dataset.g === '1') {
        streak += 1; xp += 12;
        toast(streak > 2 ? `🔥 连对 ${streak} 题 +12 XP` : '✓ 记住了 +12 XP');
      } else {
        streak = 0; xp += 3;
        toast('记下来，回去看看关联星球', true);
      }
      LS.set('dlu-streak', streak);
      refreshHUD();
      $('#streak').textContent = streak;
      card.classList.remove('open');
      b.closest('.grade').innerHTML = '<span style="font-size:11px;color:#5f6f8d">已记录</span>';
    }));
  }

  // ───────── 架构视图 ─────────
  let sysId = 'global';

  function renderSystems() {
    const list = U.systems || [];
    if (!list.length) return;
    const st = list.find(x => x.id === sysId) || list[0];
    sysId = st.id;

    $('#sysTabs').innerHTML = list.map(x =>
      `<button data-sys="${esc(x.id)}" class="${x.id === st.id ? 'on' : ''}">${esc(x.title)}</button>`).join('');
    $$('#sysTabs button').forEach(b => b.addEventListener('click', () => { sysId = b.dataset.sys; renderSystems(); }));

    if (st.layout === 'free') { renderFreeSystem(st); return; }

    const lanes = st.lanes.map(l => `
      <div class="lane">
        <div class="lane-t">${esc(l.title)}</div>
        <div class="lane-b">
          ${l.boxes.map(bx => `<div class="sbox${bx.node ? ' link' : ''}" data-box="${esc(bx.id)}"${bx.node ? ` data-node="${esc(bx.node)}"` : ''}>${esc(bx.label).replace(/\\n/g, '<br>')}</div>`).join('')}
        </div>
      </div>`).join('');

    $('#sysWrap').innerHTML = `
      <div class="shead"><h2>${esc(st.title)}</h2><p>${esc(st.desc || '')}</p></div>
      <div class="diagram" id="diagram">${lanes}<svg id="sysSvg"></svg></div>
      ${st.notes ? `<ul class="snotes">${st.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <p class="stip">带下划线的框可以点开对应知识点</p>
    `;

    $$('#sysWrap [data-node]').forEach(el => el.addEventListener('click', () => {
      setView('explore');
      selectNode(el.dataset.node, true);
    }));

    drawLinks(st);
    requestAnimationFrame(() => drawLinks(st));
  }


  // ───────── 架构视图 · 自由坐标布局（复原白板拓扑） ─────────
  function fAnchor(b, side) {
    if (side === 'l') return { x: b.x, y: b.y + b.h / 2 };
    if (side === 'r') return { x: b.x + b.w, y: b.y + b.h / 2 };
    if (side === 't') return { x: b.x + b.w / 2, y: b.y };
    return { x: b.x + b.w / 2, y: b.y + b.h };
  }

  // 相邻两点若 x/y 都不同，插入一个拐点，保证全图正交
  function fOrtho(points) {
    const out = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = out[out.length - 1], cur = points[i];
      if (Math.abs(prev.x - cur.x) > 0.5 && Math.abs(prev.y - cur.y) > 0.5) out.push({ x: cur.x, y: prev.y });
      out.push(cur);
    }
    return out;
  }

  function fPoly(points) {
    return fOrtho(points).map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ');
  }

  // 正交路由：给定起止框，自动选水平/垂直主干；可用 via 强制拐点
  // 从框边缘选出朝向某点的出口
  function fEdge(b, target) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const dx = target.x - cx, dy = target.y - cy;
    if (Math.abs(dx) >= Math.abs(dy)) return { x: dx > 0 ? b.x + b.w : b.x, y: cy };
    return { x: cx, y: dy > 0 ? b.y + b.h : b.y };
  }

  // 正交路由：有 via 时按「出口 → 拐点 → 入口」走；否则按起止相对位置自动选主干
  function fRoute(a, b, opt) {
    const via = (opt && opt.via) || null;
    const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };

    if (via && via.length) {
      const pts = [];
      const p0 = { x: via[0][0], y: via[0][1] };
      const pn = { x: via[via.length - 1][0], y: via[via.length - 1][1] };
      pts.push(fEdge(a, p0));
      via.forEach(([x, y]) => pts.push({ x, y }));
      pts.push(fEdge(b, pn));
      return fPoly(pts);
    }

    const dx = bc.x - ac.x, dy = bc.y - ac.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const s1 = dx > 0 ? { x: a.x + a.w, y: ac.y } : { x: a.x, y: ac.y };
      const e1 = dx > 0 ? { x: b.x, y: bc.y } : { x: b.x + b.w, y: bc.y };
      const mx = (s1.x + e1.x) / 2;
      return fPoly([s1, { x: mx, y: s1.y }, { x: mx, y: e1.y }, e1]);
    }
    const s1 = dy > 0 ? { x: ac.x, y: a.y + a.h } : { x: ac.x, y: a.y };
    const e1 = dy > 0 ? { x: bc.x, y: b.y } : { x: bc.x, y: b.y + b.h };
    const my = (s1.y + e1.y) / 2;
    return fPoly([s1, { x: s1.x, y: my }, { x: e1.x, y: my }, e1]);
  }

  function renderFreeSystem(st) {
    const W = st.canvas.w, H = st.canvas.h;
    const by = new Map(st.boxes.map(b => [b.id, b]));
    const out = [];

    out.push('<defs><marker id="farrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b8cc0"/></marker></defs>');

    (st.zones || []).forEach(z => {
      out.push(`<g class="fzone tone-${esc(z.tone || 'c')}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="10"/><text class="fzone-t" x="${z.x + 10}" y="${z.y + 15}">${esc(z.label)}</text></g>`);
    });

    (st.braces || []).forEach(b => {
      const x = b.x, y = b.y, hh = b.h;
      const d = b.side === 'r'
        ? `M${x - 8},${y} Q${x},${y} ${x},${y + 10} L${x},${y + hh - 10} Q${x},${y + hh} ${x - 8},${y + hh}`
        : `M${x + 8},${y} Q${x},${y} ${x},${y + 10} L${x},${y + hh - 10} Q${x},${y + hh} ${x + 8},${y + hh}`;
      const lx = b.side === 'r' ? x - 16 : x + 16;
      const ly = y + hh / 2;
      out.push(`<g class="fbrace"><path d="${d}"/><text transform="rotate(-90 ${lx} ${ly})" x="${lx}" y="${ly}" text-anchor="middle">${esc(b.label)}</text></g>`);
    });

    (st.annos || []).forEach(a => {
      const lines = String(a.text).split('\n');
      const tx = a.x + 8, ty = a.y + 17;
      out.push(`<g class="fanno tone-${esc(a.tone || 'b')}"><rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="6"/>` +
        lines.map((ln, i) => `<text x="${tx}" y="${ty + i * 13}">${esc(ln)}</text>`).join('') + '</g>');
    });

    (st.boxes || []).forEach(b => {
      const lines = String(b.label).split('\n');
      const lh = 12;
      const cx = b.w / 2;
      const cy = b.h / 2 - ((lines.length - 1) * lh) / 2 + 3.6;
      const rx = b.kind === 'cloud' ? b.h / 2 : b.kind === 'pill' ? 14 : 5;
      const cls = 'sbox fbox' + (b.node ? ' link' : '') + (b.kind ? ' k-' + b.kind : '') + (b.kind === 'label' ? ' k-label' : '');
      out.push(`<g class="${cls}" data-box="${esc(b.id)}"${b.node ? ` data-node="${esc(b.node)}"` : ''} transform="translate(${b.x},${b.y})">` +
        `<rect width="${b.w}" height="${b.h}" rx="${rx}"/>` +
        lines.map((ln, i) => `<text x="${cx}" y="${cy + i * lh}" text-anchor="middle">${esc(ln)}</text>`).join('') + '</g>');
    });

    (st.links || []).forEach(l => {
      const a = by.get(l[0]), b = by.get(l[1]);
      if (!a || !b) return;
      const opt = (l[3] && typeof l[3] === 'object') ? l[3] : null;
      out.push(`<path class="flink" d="${fRoute(a, b, opt)}" marker-end="url(#farrow)"/>`);
      const lbl = l[2];
      if (lbl) {
        const mx = (a.x + a.w / 2 + b.x + b.w / 2) / 2;
        const my = (a.y + a.h / 2 + b.y + b.h / 2) / 2;
        out.push(`<text class="flink-t" x="${mx}" y="${my - 4}" text-anchor="middle">${esc(lbl)}</text>`);
      }
    });

    $('#sysWrap').innerHTML = `
      <div class="shead"><h2>${esc(st.title)}</h2><p>${esc(st.desc || '')}</p></div>
      <div class="fdiagram" id="diagram"><svg id="sysSvg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${out.join('')}</svg></div>
      ${st.notes ? `<ul class="snotes">${st.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <p class="stip">带下划线的框可以点开对应知识点 · 与原架构白板同一张图（车端 → 云端 → 训练 → OTA → 回流）</p>
    `;

    $$('#sysWrap [data-node]').forEach(el => el.addEventListener('click', () => {
      setView('explore');
      selectNode(el.dataset.node, true);
    }));
  }

  function drawLinks(st) {
    const host = $('#diagram'), svg = $('#sysSvg');
    if (!host || !svg) return;
    const base = host.getBoundingClientRect();
    const W2 = host.scrollWidth, H2 = host.scrollHeight;
    svg.setAttribute('viewBox', `0 0 ${W2} ${H2}`);
    svg.setAttribute('width', W2);
    svg.setAttribute('height', H2);

    const pos = new Map();
    host.querySelectorAll('[data-box]').forEach(el => {
      const r = el.getBoundingClientRect();
      pos.set(el.dataset.box, { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height });
    });

    const out = [];
    (st.links || []).forEach(([a, b, label]) => {
      const A = pos.get(a), B = pos.get(b);
      if (!A || !B) return;
      let x1, y1, x2, y2, c1x, c1y, c2x, c2y;
      const sameRow = Math.abs((A.y + A.h / 2) - (B.y + B.h / 2)) < 26;
      if (sameRow) {
        const right = B.x > A.x;
        x1 = right ? A.x + A.w : A.x; y1 = A.y + A.h / 2;
        x2 = right ? B.x : B.x + B.w; y2 = B.y + B.h / 2;
        const mx = (x1 + x2) / 2;
        c1x = mx; c1y = y1; c2x = mx; c2y = y2;
      } else {
        const down = B.y > A.y;
        x1 = A.x + A.w / 2; y1 = down ? A.y + A.h : A.y;
        x2 = B.x + B.w / 2; y2 = down ? B.y : B.y + B.h;
        const my = (y1 + y2) / 2;
        c1x = x1; c1y = my; c2x = x2; c2y = my;
      }
      out.push(`<path d="M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}" marker-end="url(#ah)"/>`);
      if (label) out.push(`<text x="${(x1 + x2) / 2 + 5}" y="${(y1 + y2) / 2 - 5}" class="elabel">${esc(label)}</text>`);
    });

    svg.innerHTML =
      `<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6.2" refY="3.5" orient="auto">` +
      `<path d="M0,0 L7,3.5 L0,7 z" fill="#46618e"/></marker></defs>` + out.join('');
  }

  // ───────── 漫游 ─────────
  function roam() {
    setView('explore');
    const pool = NODES.filter(n => !visited.has(n.id) && visible(n));
    const pick = (pool.length ? pool : NODES)[Math.floor(Math.random() * (pool.length || NODES.length))];
    selectNode(pick.id, true);
    toast('🎲 随机跃迁', true);
  }
  $('#roam').addEventListener('click', roam);
  $('#fit').addEventListener('click', () => fitView(true));

  // ───────── 启动 ─────────
  function boot() {
    seed(); resize(); simulate(520); NEB.clear(); fitView(false);
    refreshHUD(); refreshChips();
    $('#obNodes').textContent = NODES.length;

    if (LS.get('dlu-onboard', false)) $('#onboard').classList.add('hide');
    $('#obGo').addEventListener('click', () => {
      $('#onboard').classList.add('hide');
      LS.set('dlu-onboard', true);
      const first = firstUndone();
      if (first) selectNode(first, true);
    });

    if (window.innerWidth <= 820) {
      // 移动端：首屏不全图，聚焦中心可读
      setTimeout(() => { view.k = Math.min(1.1, view.k); draw(); }, 60);
    }
  }

  boot();
  window.addEventListener('load', () => { resize(); fitView(false); });
})();
