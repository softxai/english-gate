/* English Gate · 六大场景背景。静态部分画一次后缓存，动态部分（萤火、飘雪、火星…）每帧绘制。 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2, al = U.rgba;
  const BG = (EG.Backgrounds = {});

  const vgrad = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s) => g.addColorStop(s[0], s[1])); return g; };
  const glow = (c, x, y, r, col, a) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.drawImage(EG.FX.glow(col), x - r, y - r, r * 2, r * 2); c.restore(); };
  /** 连绵的山/丘：baseY 为底线，amp 起伏 */
  const ridge = (c, W, H, baseY, amp, n, rnd, col, jag) => {
    c.beginPath(); c.moveTo(-20, H + 20); c.lineTo(-20, baseY);
    const step = (W + 40) / n;
    for (let i = 0; i <= n; i++) {
      const x = -20 + i * step, y = baseY - rnd() * amp;
      if (jag) c.lineTo(x, y); else c.quadraticCurveTo(x - step / 2, baseY - rnd() * amp, x, y);
    }
    c.lineTo(W + 20, H + 20); c.closePath(); c.fillStyle = col; c.fill();
  };

  /* 每一关的氛围叠色：越往后越浓 */
  const MOOD = {
    forest: [null, 'rgba(255,220,120,.08)', 'rgba(10,40,30,.22)', 'rgba(40,70,90,.34)', 'rgba(60,20,90,.3)'],
    desert: [null, 'rgba(255,255,220,.08)', 'rgba(160,60,20,.16)', 'rgba(60,30,60,.34)', 'rgba(30,10,50,.48)'],
    snow: [null, 'rgba(160,220,255,.08)', 'rgba(60,80,120,.22)', 'rgba(40,160,200,.16)', 'rgba(20,20,70,.36)'],
    castle: [null, 'rgba(60,40,10,.14)', 'rgba(30,60,90,.2)', 'rgba(10,40,20,.3)', 'rgba(90,0,20,.26)'],
    volcano: [null, 'rgba(90,70,0,.12)', 'rgba(140,30,0,.16)', 'rgba(20,10,10,.32)', 'rgba(120,0,0,.24)'],
    void: [null, 'rgba(0,60,120,.12)', 'rgba(90,0,90,.16)', 'rgba(0,90,90,.14)', 'rgba(0,0,0,.32)'],
  };

  const S = {}, A = {};

  /* ---------- 森林 ---------- */
  S.forest = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#0d2f45'], [0.55, '#1f6b62'], [1, '#8fd18a']]); c.fillRect(0, 0, W, H);
    glow(c, W * 0.72, gy * 0.3, Math.max(W, H) * 0.35, '#f7f3b0', 0.5);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { const x = W * (0.3 + i * 0.12), w = 30 + rnd() * 60; c.beginPath(); c.moveTo(x, -10); c.lineTo(x + w, -10); c.lineTo(x + w - gy * 0.5, gy); c.lineTo(x - gy * 0.5 - w, gy); c.closePath(); c.fillStyle = 'rgba(255,250,190,.045)'; c.fill(); }
    c.restore();
    const trees = (n, col, hMin, hMax, wk, baseY) => {
      for (let i = 0; i < n; i++) {
        const x = (i + rnd()) * (W / n), h = hMin + rnd() * (hMax - hMin), w = h * wk;
        c.fillStyle = col;
        c.fillRect(x - w * 0.06, baseY - h * 0.5, w * 0.12, h * 0.5 + 10);
        if (rnd() < 0.5) { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - w * (0.5 - k * 0.1), baseY - h * (0.25 + k * 0.22)); c.lineTo(x, baseY - h * (0.62 + k * 0.19)); c.lineTo(x + w * (0.5 - k * 0.1), baseY - h * (0.25 + k * 0.22)); c.closePath(); c.fill(); } }
        else { c.beginPath(); c.arc(x, baseY - h * 0.68, w * 0.42, 0, TAU); c.arc(x - w * 0.3, baseY - h * 0.52, w * 0.32, 0, TAU); c.arc(x + w * 0.3, baseY - h * 0.52, w * 0.32, 0, TAU); c.fill(); }
      }
    };
    trees(16, '#2a7a68', gy * 0.4, gy * 0.6, 0.5, gy);
    c.fillStyle = 'rgba(160,230,190,.12)'; c.fillRect(0, gy * 0.5, W, gy * 0.5);
    trees(10, '#17574a', gy * 0.55, gy * 0.82, 0.55, gy);
    trees(Math.max(3, Math.round(W / 420)), '#0e3d33', gy * 0.62, gy * 0.95, 0.5, gy + 6);
    c.fillStyle = vgrad(c, gy - 12, H, [[0, '#4f9a4a'], [0.12, '#2f6f3a'], [1, '#12301e']]);
    c.beginPath(); c.moveTo(0, gy - 6); for (let x = 0; x <= W; x += 40) c.lineTo(x, gy - 6 - rnd() * 8); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.strokeStyle = '#6fbf5a'; c.lineWidth = 2;
    for (let i = 0; i < W / 14; i++) { const x = rnd() * W, y = gy - 4 + rnd() * 10; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3 + rnd() * 6, y - 8 - rnd() * 8); c.stroke(); }
    for (let i = 0; i < W / 90; i++) { const x = rnd() * W, y = gy + 8 + rnd() * 20, r = 4 + rnd() * 5; c.fillStyle = '#f3efe6'; c.fillRect(x - 1.5, y - r, 3, r + 2); c.fillStyle = rnd() < 0.5 ? '#ff6b6b' : '#ffd166'; c.beginPath(); c.arc(x, y - r, r, Math.PI, TAU); c.fill(); }
    // 前景遮边的大树
    [[-10, 1], [W + 10, -1]].forEach((p) => { c.fillStyle = '#081f1a'; c.beginPath(); c.moveTo(p[0] - p[1] * 40, H); c.lineTo(p[0] - p[1] * 30, 0); c.lineTo(p[0] + p[1] * W * 0.06, 0); c.quadraticCurveTo(p[0] + p[1] * W * 0.02, gy * 0.6, p[0] + p[1] * W * 0.08, H); c.closePath(); c.fill(); c.beginPath(); c.arc(p[0] + p[1] * W * 0.05, 10, W * 0.13, 0, TAU); c.arc(p[0] + p[1] * W * 0.16, -10, W * 0.09, 0, TAU); c.fill(); });
  };
  A.forest = (c, W, H, gy, t) => {
    for (let i = 0; i < 26; i++) {
      const x = ((i * 137.5) % W + Math.sin(t * 0.5 + i * 1.7) * 40 + W) % W, y = gy * (0.25 + ((i * 0.618) % 0.7)) + Math.cos(t * 0.7 + i) * 24;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + i * 2.1));
      glow(c, x, y, 12 + (i % 3) * 5, i % 4 ? '#d8ff7a' : '#9affd0', a);
    }
  };

  /* ---------- 沙漠 ---------- */
  S.desert = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#e8743b'], [0.5, '#f6b05c'], [1, '#ffe6a8']]); c.fillRect(0, 0, W, H);
    const sx = W * 0.3, sy = gy * 0.36, sr = Math.min(W, H) * 0.11;
    glow(c, sx, sy, sr * 5, '#fff3b0', 0.8);
    c.fillStyle = '#fffbe0'; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
    ridge(c, W, H, gy * 0.82, gy * 0.12, 6, rnd, '#e6a65a');
    // 金字塔
    [[0.56, 0.42, 0.26], [0.74, 0.3, 0.19], [0.88, 0.22, 0.14]].forEach((p) => { const bx = W * p[0], h = gy * p[1], w = Math.max(W, 700) * p[2] * 0.6, by = gy * 0.84; c.fillStyle = '#d99a52'; c.beginPath(); c.moveTo(bx - w, by); c.lineTo(bx, by - h); c.lineTo(bx + w, by); c.closePath(); c.fill(); c.fillStyle = '#b97a3c'; c.beginPath(); c.moveTo(bx, by - h); c.lineTo(bx + w, by); c.lineTo(bx + w * 0.25, by); c.closePath(); c.fill(); });
    ridge(c, W, H, gy * 0.93, gy * 0.1, 5, rnd, '#d68f47');
    c.fillStyle = vgrad(c, gy - 14, H, [[0, '#e9a85a'], [0.15, '#c98040'], [1, '#7a4720']]);
    c.beginPath(); c.moveTo(0, gy - 4); for (let x = 0; x <= W; x += 60) c.quadraticCurveTo(x - 30, gy - 12 + rnd() * 8, x, gy - 4 - rnd() * 5); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,70,30,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const y = gy + 10 + i * ((H - gy) / 9); c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, y + Math.sin(x * 0.02 + i) * 4); c.stroke(); }
    for (let i = 0; i < Math.max(3, W / 300); i++) { const x = rnd() * W, y = gy - 2, h = 34 + rnd() * 30; c.strokeStyle = '#3f7d4a'; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(x, y - h * 0.4); c.lineTo(x + 16, y - h * 0.4); c.lineTo(x + 16, y - h * 0.75); c.moveTo(x, y - h * 0.55); c.lineTo(x - 14, y - h * 0.55); c.lineTo(x - 14, y - h * 0.85); c.stroke(); }
  };
  A.desert = (c, W, H, gy, t) => {
    c.save(); c.strokeStyle = 'rgba(255,240,200,.35)'; c.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) { const sp = 90 + (i % 5) * 50, x = (W + 200) - ((t * sp + i * 173) % (W + 300)), y = gy * (0.5 + ((i * 0.37) % 0.5)) + Math.sin(t + i) * 6, l = 30 + (i % 4) * 22; c.globalAlpha = 0.3 + (i % 3) * 0.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y - 3); c.stroke(); }
    c.restore();
    glow(c, W * 0.3, gy * 0.36, Math.min(W, H) * (0.3 + Math.sin(t * 0.8) * 0.02), '#fff3b0', 0.25);
  };

  /* ---------- 雪域 ---------- */
  S.snow = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#071433'], [0.5, '#1c4878'], [1, '#86bfe0']]); c.fillRect(0, 0, W, H);
    c.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { c.globalAlpha = 0.3 + rnd() * 0.7; c.fillRect(rnd() * W, rnd() * gy * 0.6, 1.6, 1.6); } c.globalAlpha = 1;
    const peaks = (n, col, snow, hMin, hMax, baseY) => {
      for (let i = 0; i < n; i++) {
        const x = (i + 0.2 + rnd() * 0.6) * (W / n), h = hMin + rnd() * (hMax - hMin), w = h * (0.8 + rnd() * 0.5);
        c.fillStyle = col; c.beginPath(); c.moveTo(x - w, baseY); c.lineTo(x, baseY - h); c.lineTo(x + w, baseY); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,10,40,.22)'; c.beginPath(); c.moveTo(x, baseY - h); c.lineTo(x + w, baseY); c.lineTo(x + w * 0.2, baseY); c.closePath(); c.fill();
        c.fillStyle = snow; c.beginPath(); c.moveTo(x, baseY - h); c.lineTo(x - w * 0.3, baseY - h * 0.7); c.lineTo(x - w * 0.14, baseY - h * 0.76); c.lineTo(x - w * 0.04, baseY - h * 0.64); c.lineTo(x + w * 0.1, baseY - h * 0.75); c.lineTo(x + w * 0.2, baseY - h * 0.66); c.lineTo(x + w * 0.3, baseY - h * 0.7); c.closePath(); c.fill();
      }
    };
    peaks(5, '#5d86b3', '#eef7ff', gy * 0.45, gy * 0.7, gy);
    peaks(4, '#3a628f', '#dcecfb', gy * 0.3, gy * 0.5, gy);
    for (let i = 0; i < W / 70; i++) { const x = rnd() * W, h = 50 + rnd() * 60, y = gy + 4; c.fillStyle = '#16304d'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - h * (0.3 - k * 0.07), y - h * (0.2 + k * 0.24)); c.lineTo(x, y - h * (0.6 + k * 0.2)); c.lineTo(x + h * (0.3 - k * 0.07), y - h * (0.2 + k * 0.24)); c.closePath(); c.fill(); } c.fillRect(x - 3, y - h * 0.2, 6, h * 0.2); c.fillStyle = 'rgba(240,250,255,.8)'; c.beginPath(); c.moveTo(x - h * 0.1, y - h * 0.84); c.lineTo(x, y - h); c.lineTo(x + h * 0.1, y - h * 0.84); c.closePath(); c.fill(); }
    c.fillStyle = vgrad(c, gy - 14, H, [[0, '#ffffff'], [0.2, '#d5e9fa'], [1, '#7ea6cf']]);
    c.beginPath(); c.moveTo(0, gy - 4); for (let x = 0; x <= W; x += 80) c.quadraticCurveTo(x - 40, gy - 16 + rnd() * 8, x, gy - 4 - rnd() * 4); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    for (let i = 0; i < W / 160; i++) { const x = rnd() * W, y = gy + 6 + rnd() * 16, h = 14 + rnd() * 22; c.fillStyle = 'rgba(160,220,255,.85)'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x, y - h); c.lineTo(x + 6, y); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x, y - h); c.lineTo(x - 1, y); c.closePath(); c.fill(); }
  };
  A.snow = (c, W, H, gy, t) => {
    c.save(); c.globalCompositeOperation = 'lighter';
    [['#3dffb0', 0.16, 0], ['#5ad1ff', 0.22, 1.7], ['#c084fc', 0.12, 3.1]].forEach((b, k) => {
      c.beginPath();
      for (let x = 0; x <= W; x += 24) { const y = gy * (0.14 + k * 0.05) + Math.sin(x * 0.006 + t * 0.4 + b[2]) * gy * 0.06 + Math.sin(x * 0.013 - t * 0.3) * gy * 0.03; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      for (let x = W; x >= 0; x -= 24) { const y = gy * (0.32 + k * 0.05) + Math.sin(x * 0.005 + t * 0.35 + b[2]) * gy * 0.07; c.lineTo(x, y); }
      c.closePath();
      const g = c.createLinearGradient(0, gy * 0.1, 0, gy * 0.4); g.addColorStop(0, al(b[0], 0)); g.addColorStop(0.4, al(b[0], b[1] + Math.sin(t * 0.6 + k) * 0.05)); g.addColorStop(1, al(b[0], 0));
      c.fillStyle = g; c.fill();
    });
    c.restore();
    c.fillStyle = '#fff';
    for (let i = 0; i < 80; i++) { const sp = 30 + (i % 5) * 16, y = (t * sp + i * 97) % (H + 20) - 10, x = ((i * 211.3) % (W + 80)) - 40 + Math.sin(t * 0.8 + i) * 22 - (y * 0.12); c.globalAlpha = 0.35 + (i % 4) * 0.16; c.beginPath(); c.arc(x, y, 1.2 + (i % 3) * 0.9, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
  };

  /* ---------- 城堡 ---------- */
  S.castle = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#120e1f'], [1, '#2a2142']]); c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 2;
    const bh = 34, bw = 76;
    for (let r = 0; r * bh < gy; r++) { c.beginPath(); c.moveTo(0, r * bh); c.lineTo(W, r * bh); c.stroke(); for (let x = (r % 2) * (bw / 2); x < W; x += bw) { c.beginPath(); c.moveTo(x, r * bh); c.lineTo(x, r * bh + bh); c.stroke(); } }
    const n = Math.max(2, Math.round(W / 420));
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (W / n), w = Math.min(90, W / n * 0.3), top = gy * 0.14, bot = gy * 0.72;
      c.save();
      c.beginPath(); c.moveTo(x - w, bot); c.lineTo(x - w, top + w); c.quadraticCurveTo(x - w, top - w * 0.3, x, top - w * 0.6); c.quadraticCurveTo(x + w, top - w * 0.3, x + w, top + w); c.lineTo(x + w, bot); c.closePath();
      c.fillStyle = vgrad(c, top - w, bot, [[0, '#1c2a66'], [0.6, '#3d4fa8'], [1, '#6c7fd8']]); c.fill(); c.clip();
      c.fillStyle = '#fff'; for (let k = 0; k < 14; k++) { c.globalAlpha = 0.4 + rnd() * 0.6; c.fillRect(x - w + rnd() * w * 2, top - w + rnd() * (bot - top), 1.6, 1.6); } c.globalAlpha = 1;
      if (i === Math.floor(n / 2)) { glow(c, x + w * 0.2, top + w * 0.9, w * 2.2, '#dfe7ff', 0.7); c.fillStyle = '#f4f6ff'; c.beginPath(); c.arc(x + w * 0.2, top + w * 0.9, w * 0.42, 0, TAU); c.fill(); c.fillStyle = 'rgba(160,170,210,.5)'; c.beginPath(); c.arc(x + w * 0.08, top + w * 0.8, w * 0.1, 0, TAU); c.arc(x + w * 0.34, top + w * 1.02, w * 0.07, 0, TAU); c.fill(); }
      c.restore();
      c.strokeStyle = '#0c0916'; c.lineWidth = 7;
      c.beginPath(); c.moveTo(x - w, bot); c.lineTo(x - w, top + w); c.quadraticCurveTo(x - w, top - w * 0.3, x, top - w * 0.6); c.quadraticCurveTo(x + w, top - w * 0.3, x + w, top + w); c.lineTo(x + w, bot); c.closePath(); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(x, top - w * 0.6); c.lineTo(x, bot); c.moveTo(x - w, (top + bot) / 2); c.lineTo(x + w, (top + bot) / 2); c.stroke();
      // 月光
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(120,140,255,.05)'; c.beginPath(); c.moveTo(x - w, top); c.lineTo(x + w, top); c.lineTo(x + w - gy * 0.35, H); c.lineTo(x - w - gy * 0.6, H); c.closePath(); c.fill(); c.restore();
    }
    // 立柱与旗帜
    const cols = n + 1;
    for (let i = 0; i < cols; i++) {
      const x = i * (W / n), pw = Math.min(46, W * 0.05);
      c.fillStyle = vgrad(c, 0, gy, [[0, '#231b38'], [1, '#3a2f58']]); c.fillRect(x - pw / 2, 0, pw, gy + 6);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + pw * 0.15, 0, pw * 0.35, gy + 6);
      c.fillStyle = '#463a68'; c.fillRect(x - pw * 0.75, gy * 0.74, pw * 1.5, 12); c.fillRect(x - pw * 0.75, gy - 10, pw * 1.5, 16);
      if (i > 0 && i < cols - 1) { c.fillStyle = '#7a1730'; c.beginPath(); c.moveTo(x - pw * 0.4, gy * 0.12); c.lineTo(x + pw * 0.4, gy * 0.12); c.lineTo(x + pw * 0.4, gy * 0.5); c.lineTo(x, gy * 0.44); c.lineTo(x - pw * 0.4, gy * 0.5); c.closePath(); c.fill(); c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(x, gy * 0.28, pw * 0.16, 0, TAU); c.fill(); }
    }
    c.fillStyle = vgrad(c, gy - 6, H, [[0, '#3a3052'], [1, '#17111f']]); c.fillRect(0, gy - 6, W, H - gy + 6);
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const y = gy + i * i * ((H - gy) / 25) + 4; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(W / 2 + i * 70, gy - 4); c.lineTo(W / 2 + i * 190, H); c.stroke(); }
    c.fillStyle = 'rgba(140,20,45,.5)'; c.beginPath(); c.moveTo(W * 0.1, gy + 4); c.lineTo(W * 0.9, gy + 4); c.lineTo(W * 1.05, H); c.lineTo(-W * 0.05, H); c.closePath(); c.fill();
  };
  A.castle = (c, W, H, gy, t) => {
    const n = Math.max(2, Math.round(W / 420));
    for (let i = 0; i <= n; i++) {
      const x = i * (W / n), y = gy * 0.62, fl = Math.sin(t * 9 + i * 2.3) * 0.12 + Math.sin(t * 13 + i) * 0.08;
      glow(c, x, y - 14, 120 * (1 + fl), '#ff9a3d', 0.4 + fl * 0.5);
      c.fillStyle = '#2a1a0c'; c.fillRect(x - 5, y, 10, 18);
      c.fillStyle = '#ff8a3d'; c.beginPath(); c.moveTo(x - 8, y); c.quadraticCurveTo(x - 10 + Math.sin(t * 11 + i) * 3, y - 16, x + Math.sin(t * 8 + i) * 4, y - 30 - fl * 30); c.quadraticCurveTo(x + 10, y - 14, x + 8, y); c.closePath(); c.fill();
      c.fillStyle = '#ffe08a'; c.beginPath(); c.moveTo(x - 4, y); c.quadraticCurveTo(x, y - 12, x + Math.sin(t * 8 + i) * 2, y - 17); c.quadraticCurveTo(x + 4, y - 8, x + 4, y); c.closePath(); c.fill();
    }
    c.fillStyle = '#cfd6ff';
    for (let i = 0; i < 30; i++) { const x = ((i * 157.3) % W) + Math.sin(t * 0.3 + i) * 20, y = ((i * 89.7 + t * (6 + i % 4 * 3)) % gy); c.globalAlpha = 0.12 + 0.2 * Math.abs(Math.sin(t + i)); c.fillRect(x, y, 2, 2); }
    c.globalAlpha = 1;
  };

  /* ---------- 火山 ---------- */
  S.volcano = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#140707'], [0.5, '#4a1410'], [1, '#c0401a']]); c.fillRect(0, 0, W, H);
    const vx = W * 0.6, vw = Math.max(W * 0.42, 320), vh = gy * 0.62, vb = gy * 0.92;
    glow(c, vx, vb - vh, vw * 0.9, '#ff7a2e', 0.75);
    // 烟柱
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(40,24,24,' + (0.5 - i * 0.04) + ')'; c.beginPath(); c.arc(vx + i * vw * 0.07 + rnd() * 20, vb - vh - i * gy * 0.07, 30 + i * 16, 0, TAU); c.fill(); }
    ridge(c, W, H, gy * 0.86, gy * 0.2, 9, rnd, '#3a1512', true);
    c.fillStyle = '#231010'; c.beginPath(); c.moveTo(vx - vw, vb); c.lineTo(vx - vw * 0.16, vb - vh); c.lineTo(vx - vw * 0.06, vb - vh + 12); c.lineTo(vx + vw * 0.05, vb - vh + 4); c.lineTo(vx + vw * 0.16, vb - vh); c.lineTo(vx + vw, vb); c.closePath(); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[-0.08, -0.5, 0.1], [0.04, 0.3, 0.14], [0.1, 0.62, 0.08], [-0.02, -0.12, 0.2]].forEach((l) => {
      [[14, 'rgba(255,90,20,.25)'], [6, 'rgba(255,150,40,.8)'], [2.5, '#fff2a8']].forEach((s) => { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); c.moveTo(vx + vw * l[0], vb - vh + 8); c.quadraticCurveTo(vx + vw * (l[0] + l[1]) * 0.4, vb - vh * 0.6, vx + vw * l[1], vb - vh * l[2]); c.stroke(); });
    });
    c.restore();
    ridge(c, W, H, gy * 0.98, gy * 0.16, 12, rnd, '#1a0c0c', true);
    c.fillStyle = vgrad(c, gy - 10, H, [[0, '#3a1c18'], [0.2, '#231210'], [1, '#0f0707']]);
    c.beginPath(); c.moveTo(0, gy - 4); for (let x = 0; x <= W; x += 50) c.lineTo(x, gy - 4 - rnd() * 7); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
  };
  const cracks = [];
  A.volcano = (c, W, H, gy, t) => {
    if (cracks.W !== W || cracks.gy !== gy) {
      cracks.length = 0; cracks.W = W; cracks.gy = gy;
      const rnd = U.rng(77);
      for (let i = 0; i < Math.max(6, W / 150); i++) { const pts = []; let x = rnd() * W, y = gy + 6 + rnd() * 10; for (let k = 0; k < 5; k++) { pts.push([x, y]); x += (rnd() - 0.5) * 90; y += 8 + rnd() * 22; } cracks.push(pts); }
    }
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round';
    const a = 0.55 + 0.3 * Math.sin(t * 1.6);
    cracks.forEach((pts, i) => {
      [[9, al('#ff5a14', 0.18 * a)], [3.5, al('#ff9628', 0.8 * a)], [1.5, al('#fff2a8', a)]].forEach((s) => { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); pts.forEach((p, k) => (k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); });
    });
    c.restore();
    glow(c, W * 0.6, gy * 0.35, Math.max(W * 0.3, 240) * (1 + Math.sin(t * 2) * 0.05), '#ff7a2e', 0.25 + Math.sin(t * 2.3) * 0.08);
    for (let i = 0; i < 46; i++) { const sp = 26 + (i % 6) * 14, y = H - ((t * sp + i * 71) % (H + 20)), x = ((i * 193.7) % W) + Math.sin(t * 0.9 + i * 1.3) * 26; glow(c, x, y, 5 + (i % 3) * 3, i % 3 ? '#ff9a3d' : '#ffe08a', 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))); }
  };

  /* ---------- 虚空 ---------- */
  S.void = (c, W, H, gy, rnd) => {
    const g = c.createRadialGradient(W * 0.5, gy * 0.5, 0, W * 0.5, gy * 0.5, Math.max(W, H) * 0.8); g.addColorStop(0, '#2a1160'); g.addColorStop(0.5, '#120634'); g.addColorStop(1, '#03010b');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    [['#ff4fd8', 0.2, 0.3, 0.42], ['#22d3ee', 0.75, 0.22, 0.4], ['#7c3aed', 0.5, 0.6, 0.5], ['#ff9a3d', 0.9, 0.7, 0.24]].forEach((nb) => glow(c, W * nb[1], gy * nb[2], Math.max(W, H) * nb[3], nb[0], 0.28));
    c.fillStyle = '#fff'; for (let i = 0; i < 220; i++) { c.globalAlpha = 0.25 + rnd() * 0.75; const r = rnd() < 0.08 ? 2.4 : 1.3; c.fillRect(rnd() * W, rnd() * H, r, r); } c.globalAlpha = 1;
    // 带环行星
    const px = W * 0.2, py = gy * 0.3, pr = Math.min(W, H) * 0.12;
    c.save(); c.translate(px, py); c.rotate(-0.4);
    c.strokeStyle = 'rgba(200,170,255,.5)'; c.lineWidth = pr * 0.14; c.beginPath(); c.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, Math.PI, TAU); c.stroke();
    const pg = c.createRadialGradient(-pr * 0.3, -pr * 0.3, 0, 0, 0, pr); pg.addColorStop(0, '#ffb3f0'); pg.addColorStop(0.6, '#7c3aed'); pg.addColorStop(1, '#22104a');
    c.fillStyle = pg; c.beginPath(); c.arc(0, 0, pr, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(230,210,255,.8)'; c.beginPath(); c.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, 0, Math.PI); c.stroke();
    c.restore();
    // 浮空石岛
    [[0.86, 0.34, 0.9], [0.62, 0.2, 0.55], [0.38, 0.52, 0.45]].forEach((is) => { const x = W * is[0], y = gy * is[1], w = 70 * is[2] + W * 0.02; c.fillStyle = '#1b0f3a'; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x + w, y); c.lineTo(x + w * 0.4, y + w * 0.5); c.lineTo(x, y + w * 1.1); c.lineTo(x - w * 0.5, y + w * 0.45); c.closePath(); c.fill(); c.fillStyle = '#3b2a7a'; c.fillRect(x - w, y - 4, w * 2, 6); c.fillStyle = '#7df9ff'; c.beginPath(); c.moveTo(x - 6, y - 4); c.lineTo(x, y - 26 * is[2] - 8); c.lineTo(x + 6, y - 4); c.closePath(); c.fill(); });
    // 水晶平台
    c.fillStyle = vgrad(c, gy - 8, H, [[0, '#3b2a8a'], [0.12, '#22145a'], [1, '#07031a']]);
    c.beginPath(); c.moveTo(0, gy - 4); for (let x = 0; x <= W; x += 70) c.lineTo(x, gy - 4 - rnd() * 6); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(125,249,255,.16)'; c.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const y = gy + 4 + i * i * ((H - gy) / 25); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(W / 2 + i * 70, gy); c.lineTo(W / 2 + i * 210, H); c.stroke(); }
    c.restore();
  };
  A.void = (c, W, H, gy, t) => {
    for (let i = 0; i < 26; i++) { const x = (i * 211.7) % W, y = (i * 127.3) % gy; glow(c, x, y, 5 + (i % 3) * 3, i % 2 ? '#ffffff' : '#c084fc', 0.2 + 0.8 * Math.abs(Math.sin(t * 1.3 + i * 1.9))); }
    const q = (t * 0.22) % 1;
    if (q < 0.25) { const p = q / 0.25, x = W * (0.9 - p * 0.7), y = gy * (0.05 + p * 0.4); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x, y, x + 120, y - 68); g.addColorStop(0, 'rgba(255,255,255,' + (1 - p) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.strokeStyle = g; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 120, y - 68); c.stroke(); c.restore(); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = al('#7df9ff', 0.35 + 0.25 * Math.sin(t * 2)); c.lineWidth = 3; c.beginPath(); c.moveTo(0, gy - 3); c.lineTo(W, gy - 3); c.stroke(); c.restore();
    for (let i = 0; i < 12; i++) { const x = ((i * 173) % W), y = gy * (0.2 + ((i * 0.31) % 0.6)) + Math.sin(t * 0.8 + i) * 12, r = 5 + (i % 3) * 3; c.save(); c.translate(x, y); c.rotate(t * 0.4 + i); c.fillStyle = al(i % 2 ? '#7df9ff' : '#c084fc', 0.55); c.beginPath(); c.moveTo(0, -r * 1.6); c.lineTo(r, 0); c.lineTo(0, r * 1.6); c.lineTo(-r, 0); c.closePath(); c.fill(); c.restore(); }
  };

  /* ---------- 回声殿堂（口语场景）：黄昏的学院大厅，拱窗、石柱、红幕布、木地板 ---------- */
  MOOD.echo = [null, 'rgba(255,200,120,.06)', 'rgba(60,120,200,.10)', 'rgba(160,60,160,.12)', 'rgba(20,0,40,.3)'];
  S.echo = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#1b1036'], [0.55, '#3a1d5c'], [1, '#6b3a66']]); c.fillRect(0, 0, W, H);
    // 拱窗
    const n = Math.max(3, Math.min(7, Math.round(W / 230))), gap = W / n, ww = gap * 0.46, wh = gy * 0.62, wy = gy * 0.16;
    for (let i = 0; i < n; i++) {
      const x = gap * (i + 0.5);
      const g = c.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#ffb86b'); g.addColorStop(0.5, '#ff7eb6'); g.addColorStop(1, '#7a5fd0');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - ww / 2, wy + wh); c.lineTo(x - ww / 2, wy + ww / 2); c.arc(x, wy + ww / 2, ww / 2, Math.PI, TAU); c.lineTo(x + ww / 2, wy + wh); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,20,70,.75)'; c.lineWidth = Math.max(3, ww * 0.05); c.stroke();
      c.lineWidth = Math.max(2, ww * 0.03); c.beginPath(); c.moveTo(x, wy); c.lineTo(x, wy + wh); c.moveTo(x - ww / 2, wy + wh * 0.42); c.lineTo(x + ww / 2, wy + wh * 0.42); c.stroke();
      glow(c, x, wy + wh * 0.4, ww * 1.5, '#ffb86b', 0.28);
    }
    // 石柱
    for (let i = 0; i <= n; i++) {
      const x = gap * i, cw = Math.max(18, gap * 0.16);
      const g = c.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0); g.addColorStop(0, '#2a1a4a'); g.addColorStop(0.45, '#6b5a9a'); g.addColorStop(1, '#21143c');
      c.fillStyle = g; c.fillRect(x - cw / 2, 0, cw, gy);
      c.fillStyle = '#7d6bb0'; c.fillRect(x - cw * 0.75, gy * 0.1, cw * 1.5, gy * 0.035); c.fillRect(x - cw * 0.7, gy - gy * 0.05, cw * 1.4, gy * 0.05);
    }
    c.fillStyle = 'rgba(20,10,40,.55)'; c.fillRect(0, 0, W, gy * 0.1);
    // 两侧幕布
    [[0, 1], [W, -1]].forEach((p) => {
      const cw = Math.min(W * 0.13, 170);
      for (let k = 0; k < 6; k++) { const x0 = p[0] + p[1] * (cw * k / 6), x1 = p[0] + p[1] * (cw * (k + 1) / 6); c.fillStyle = k % 2 ? '#7a1230' : '#a3193f'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x1, 0); c.lineTo(x1 - p[1] * cw * 0.05, gy + 10); c.lineTo(x0 - p[1] * cw * 0.04, gy + 10); c.closePath(); c.fill(); }
      c.fillStyle = '#ffd166'; c.fillRect(Math.min(p[0], p[0] + p[1] * cw), gy * 0.56, cw, 7);
    });
    c.fillStyle = '#5a0f28'; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, gy * 0.07); for (let x = W; x >= 0; x -= W / 14) c.quadraticCurveTo(x - W / 28, gy * 0.13, x - W / 14, gy * 0.07); c.closePath(); c.fill();
    // 木地板
    c.fillStyle = vgrad(c, gy - 8, H, [[0, '#8a5a3a'], [0.15, '#5a3422'], [1, '#1f0f0a']]); c.fillRect(0, gy - 6, W, H - gy + 6);
    c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1.5; for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(W / 2 + i * 90, gy - 6); c.lineTo(W / 2 + i * 240, H); c.stroke(); }
    c.fillStyle = 'rgba(255,220,160,.5)'; c.fillRect(0, gy - 7, W, 2);
    // 舞台聚光
    [[0.19, '#ffe9b0'], [0.75, '#ffb3d1']].forEach((p) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.16; c.fillStyle = p[1]; c.beginPath(); c.moveTo(W * p[0] - 20, 0); c.lineTo(W * p[0] + 20, 0); c.lineTo(W * p[0] + 150, gy + 8); c.lineTo(W * p[0] - 150, gy + 8); c.closePath(); c.fill(); c.globalAlpha = 0.22; c.beginPath(); c.ellipse(W * p[0], gy + 8, 150, 20, 0, 0, TAU); c.fill(); c.restore(); });
  };
  A.echo = (c, W, H, gy, t) => {
    // 一圈圈扩散的声波
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const p = ((t * 0.18 + i / 4) % 1), r = p * Math.max(W, gy) * 0.55; c.strokeStyle = al(i % 2 ? '#ff8fb1' : '#ffd166', (1 - p) * 0.22); c.lineWidth = 3; c.beginPath(); c.ellipse(W * 0.47, gy * 0.42, r, r * 0.6, 0, 0, TAU); c.stroke(); }
    c.restore();
    // 飘起来的字母
    const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ?!';
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 20px "Fredoka","Trebuchet MS",sans-serif';
    for (let i = 0; i < 16; i++) { const sp = 12 + (i % 5) * 6, y = gy - ((t * sp + i * 67) % (gy * 0.95)), x = ((i * 211.3) % W) + Math.sin(t * 0.6 + i * 1.9) * 24; c.globalAlpha = 0.1 + 0.22 * Math.abs(Math.sin(t * 0.9 + i)); c.fillStyle = i % 3 ? '#ffe9b0' : '#ffb3d1'; c.fillText(L[(i * 7) % L.length], x, y); }
    c.restore();
  };

  /* ---------- 潮音海湾（听力场景）：月夜的海湾，灯塔、礁石、潮水、沙滩 ---------- */
  MOOD.cove = [null, 'rgba(120,200,255,.05)', 'rgba(255,200,120,.06)', 'rgba(60,40,120,.14)', 'rgba(0,10,40,.34)'];
  S.cove = (c, W, H, gy, rnd) => {
    c.fillStyle = vgrad(c, 0, gy, [[0, '#06142b'], [0.5, '#0f3558'], [0.8, '#1f6b82'], [1, '#2f8f96']]); c.fillRect(0, 0, W, H);
    c.fillStyle = '#fff'; for (let i = 0; i < 150; i++) { c.globalAlpha = 0.2 + rnd() * 0.7; const r = rnd() < 0.1 ? 2.2 : 1.2; c.fillRect(rnd() * W, rnd() * gy * 0.55, r, r); } c.globalAlpha = 1;
    // 月亮和海面上的月光
    const mx = W * 0.3, my = gy * 0.24, mr = Math.min(W, H) * 0.075;
    glow(c, mx, my, mr * 5, '#cfe9ff', 0.55);
    c.fillStyle = '#f4f8ff'; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill();
    c.fillStyle = 'rgba(180,200,230,.5)'; [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.1, 0.35, 0.12]].forEach((k) => { c.beginPath(); c.arc(mx + k[0] * mr, my + k[1] * mr, k[2] * mr, 0, TAU); c.fill(); });
    const hz = gy * 0.62; // 海平线
    ridge(c, W, H, hz + 4, gy * 0.07, 7, rnd, '#0b2a44');
    // 海
    c.fillStyle = vgrad(c, hz, gy, [[0, '#145a7a'], [0.5, '#0f4563'], [1, '#0b3350']]); c.fillRect(0, hz, W, gy - hz + 4);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const y = hz + 6 + i * i * ((gy - hz) / 80), w = (10 + i * 9) * (0.6 + rnd() * 0.8); c.fillStyle = 'rgba(210,235,255,' + (0.3 - i * 0.02) + ')'; c.fillRect(mx - w / 2 + (rnd() - 0.5) * 16, y, w, 2 + i * 0.3); }
    c.strokeStyle = 'rgba(190,230,255,.16)'; c.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) { const x = rnd() * W, y = hz + 8 + rnd() * (gy - hz - 14), w = 18 + rnd() * 44; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 3, x + w, y); c.stroke(); }
    c.restore();
    // 右边的悬崖和灯塔
    const cx = W * 0.86, cw = Math.max(150, W * 0.2), top = gy * 0.5;
    c.fillStyle = '#0a1f33'; c.beginPath(); c.moveTo(cx - cw * 0.62, gy + 6); c.quadraticCurveTo(cx - cw * 0.5, top + 20, cx - cw * 0.22, top); c.lineTo(cx + cw * 0.3, top - 6); c.quadraticCurveTo(cx + cw * 0.5, top + 30, W + 20, top + 10); c.lineTo(W + 20, gy + 6); c.closePath(); c.fill();
    const lh = gy * 0.3, lw = Math.max(16, lh * 0.2), lx = cx, ly = top;
    c.fillStyle = '#eef3f8'; c.beginPath(); c.moveTo(lx - lw * 0.6, ly); c.lineTo(lx - lw * 0.42, ly - lh); c.lineTo(lx + lw * 0.42, ly - lh); c.lineTo(lx + lw * 0.6, ly); c.closePath(); c.fill();
    c.fillStyle = '#d6485a'; [0.2, 0.55].forEach((k) => { const y0 = ly - lh * k, y1 = y0 - lh * 0.16, a = 0.6 - 0.18 * k, b2 = 0.6 - 0.18 * (k + 0.16); c.beginPath(); c.moveTo(lx - lw * a, y0); c.lineTo(lx - lw * b2, y1); c.lineTo(lx + lw * b2, y1); c.lineTo(lx + lw * a, y0); c.closePath(); c.fill(); });
    c.fillStyle = '#1b2a3d'; c.fillRect(lx - lw * 0.62, ly - lh - lw * 0.18, lw * 1.24, lw * 0.18);
    c.fillStyle = '#ffe9a8'; c.fillRect(lx - lw * 0.36, ly - lh - lw * 0.86, lw * 0.72, lw * 0.7);
    c.fillStyle = '#1b2a3d'; c.beginPath(); c.moveTo(lx - lw * 0.56, ly - lh - lw * 0.86); c.lineTo(lx, ly - lh - lw * 1.5); c.lineTo(lx + lw * 0.56, ly - lh - lw * 0.86); c.closePath(); c.fill();
    // 沙滩
    c.fillStyle = vgrad(c, gy - 10, H, [[0, '#5f7f8a'], [0.1, '#4a6470'], [1, '#16252f']]);
    c.beginPath(); c.moveTo(0, gy - 4); for (let x = 0; x <= W; x += 60) c.lineTo(x, gy - 4 - rnd() * 6); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.fillStyle = 'rgba(200,235,245,.35)'; c.fillRect(0, gy - 7, W, 2);
    for (let i = 0; i < W / 70; i++) { const x = rnd() * W, y = gy + 10 + rnd() * 26, r = 4 + rnd() * 4; c.fillStyle = rnd() < 0.5 ? '#f0c9c0' : '#e8dcc0'; c.beginPath(); c.ellipse(x, y, r, r * 0.6, rnd(), 0, TAU); c.fill(); }
    // 前景礁石
    [[-20, 1], [W + 20, -1]].forEach((p) => { c.fillStyle = '#081622'; c.beginPath(); c.moveTo(p[0], H); c.lineTo(p[0], gy * 0.72); c.quadraticCurveTo(p[0] + p[1] * W * 0.07, gy * 0.74, p[0] + p[1] * W * 0.1, gy * 0.92); c.quadraticCurveTo(p[0] + p[1] * W * 0.13, gy + 10, p[0] + p[1] * W * 0.16, H); c.closePath(); c.fill(); });
  };
  A.cove = (c, W, H, gy, t) => {
    // 灯塔的光束来回扫
    const cx = W * 0.86, top = gy * 0.5, lh = gy * 0.3, lw = Math.max(16, lh * 0.2), ox = cx, oy = top - lh - lw * 0.5;
    const ang = Math.PI + Math.sin(t * 0.5) * 0.5, len = Math.max(W, H);
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(ox, oy, ox + Math.cos(ang) * len, oy + Math.sin(ang) * len); g.addColorStop(0, 'rgba(255,240,180,.38)'); g.addColorStop(0.6, 'rgba(255,240,180,.06)'); g.addColorStop(1, 'rgba(255,240,180,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(ang - 0.09) * len, oy + Math.sin(ang - 0.09) * len); c.lineTo(ox + Math.cos(ang + 0.09) * len, oy + Math.sin(ang + 0.09) * len); c.closePath(); c.fill();
    c.restore();
    glow(c, ox, oy, lw * 2.6, '#ffe9a8', 0.75 + 0.2 * Math.sin(t * 3));
    for (let i = 0; i < 18; i++) { const x = (i * 197.3) % W, y = (i * 83.7) % (gy * 0.5); glow(c, x, y, 4 + (i % 3) * 2, '#ffffff', 0.15 + 0.6 * Math.abs(Math.sin(t * 1.1 + i * 1.7))); }
    // 海面的波光和一圈圈声波
    const hz = gy * 0.62;
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(200,240,255,.22)'; c.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) { const y = hz + 10 + ((i * 37) % Math.max(20, gy - hz - 20)), x = ((i * 233 + t * (14 + (i % 4) * 6)) % (W + 80)) - 40, w = 24 + (i % 5) * 10; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 3 - Math.sin(t * 2 + i) * 1.5, x + w, y); c.stroke(); }
    for (let i = 0; i < 3; i++) { const p = ((t * 0.16 + i / 3) % 1), r = p * W * 0.4; c.strokeStyle = al('#3ad6c0', (1 - p) * 0.2); c.lineWidth = 2.5; c.beginPath(); c.ellipse(W * 0.47, gy * 0.8, r, r * 0.16, 0, 0, TAU); c.stroke(); }
    c.restore();
  };

  /** 注册一个新场景的背景：静态层、动态层、每关的氛围叠色 */
  BG.register = (id, stat, anim, mood) => { S[id] = stat; A[id] = anim; if (mood) MOOD[id] = mood; };
  BG.tools = { vgrad, glow, ridge };

  BG.drawStatic = (c, id, W, H, gy, li) => {
    const rnd = U.rng(U.hash(id) + 7);
    (S[id] || S.forest)(c, W, H, gy, rnd);
    const mood = (MOOD[id] || [])[li || 0];
    if (mood) { c.fillStyle = mood; c.fillRect(0, 0, W, H); }
    // 压暗四角，突出中间的战斗
    const vg = c.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.5)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  };
  BG.drawAnim = (c, id, W, H, gy, t) => { (A[id] || A.forest)(c, W, H, gy, t); };
})();
