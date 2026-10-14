/* English Gate · 主角：小魔法师（面朝右） */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2, sh = U.shade, al = U.rgba;
  const H = (EG.Hero = { tip: { x: 60, y: -170 } });

  /**
   * a: { t, cast 0..1(举杖蓄力), atk 0..1(挥杖), hurt 0..1, win bool, gem 法杖宝石颜色 }
   * 原点在脚底中心。绘制后 H.tip 为法杖顶端（本地坐标），供法术起点使用。
   */
  H.draw = (C, a) => {
    const t = a.t, br = Math.sin(t * 2.4), o = '#1a1438';
    const L = a.atk > 0 ? Math.sin(Math.PI * Math.min(1, a.atk)) : 0;
    const gem = a.gem || '#7cc7ff';
    const fs = (fill, line, lw) => { if (fill) { C.fillStyle = fill; C.fill(); } if (line) { C.strokeStyle = line; C.lineWidth = lw || 4; C.stroke(); } };
    const lg = (y0, y1, c0, c1) => { const g = C.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
    const limb = (p, w, col, line) => { C.beginPath(); C.moveTo(p[0], p[1]); if (p.length === 4) C.lineTo(p[2], p[3]); else C.quadraticCurveTo(p[2], p[3], p[4], p[5]); C.lineCap = 'round'; C.strokeStyle = line; C.lineWidth = w + 6; C.stroke(); C.strokeStyle = col; C.lineWidth = w; C.stroke(); };
    C.save();
    C.lineJoin = 'round'; C.lineCap = 'round';
    if (a.win) C.translate(0, -Math.abs(Math.sin(t * 6)) * 20);
    C.rotate(-a.hurt * 0.18 + L * 0.06);
    const by = br * 1.6;
    // 披风
    const cw = Math.sin(t * 2.1) * 6 + L * 14 + a.cast * 8;
    C.beginPath(); C.moveTo(-14, -118 + by); C.quadraticCurveTo(-56 - cw, -72, -52 - cw, -8); C.lineTo(-30, -18); C.lineTo(-14, -6); C.lineTo(4, -112 + by); C.closePath();
    fs(lg(-118, -6, '#c0355b', '#6d1836'), o, 4);
    // 靴子
    C.beginPath(); C.ellipse(-12, -5, 14, 7, 0, 0, TAU); fs('#4a2c1a', o, 3.5);
    C.beginPath(); C.ellipse(18, -5, 15, 7, 0, 0, TAU); fs('#5a3620', o, 3.5);
    // 后手
    limb([-16, -108 + by, -30, -86, -26, -66 + by], 11, '#3d55c9', o);
    C.beginPath(); C.arc(-26, -64 + by, 7, 0, TAU); fs('#ffd9b3', '#8a5a3a', 3);
    // 长袍
    C.beginPath(); C.moveTo(-22, -120 + by); C.quadraticCurveTo(-38, -60, -40, -6); C.quadraticCurveTo(-18, 2, 2, -6); C.quadraticCurveTo(22, 2, 42, -6); C.quadraticCurveTo(38, -60, 22, -120 + by); C.closePath();
    fs(lg(-120, 0, '#6f8cff', '#2b3aa0'), o, 4.5);
    C.beginPath(); C.moveTo(-40, -14); C.quadraticCurveTo(0, -4, 42, -14); C.strokeStyle = '#ffd24a'; C.lineWidth = 5; C.stroke();
    C.beginPath(); C.moveTo(2, -112 + by); C.lineTo(2, -14); C.strokeStyle = al('#ffd24a', 0.9); C.lineWidth = 4; C.stroke();
    C.beginPath(); C.rect(-27, -78 + by, 54, 9); fs('#8a5a2b', o, 3);
    C.beginPath(); C.rect(-4, -80 + by, 12, 13); fs('#ffd24a', '#7a5a10', 2.5);
    // 头
    const hx = 4, hy = -140 + by;
    C.beginPath(); C.arc(hx, hy, 24, 0, TAU); fs(lg(hy - 24, hy + 24, '#ffe6cc', '#f2c49c'), '#8a5a3a', 3.5);
    // 头发
    C.beginPath(); C.arc(hx, hy - 2, 25, Math.PI * 0.95, Math.PI * 1.9); C.quadraticCurveTo(hx + 4, hy - 8, hx - 12, hy - 4); C.quadraticCurveTo(hx - 20, hy + 6, hx - 24, hy + 12); C.closePath(); fs('#6b3f1d', '#3a2110', 3);
    // 脸
    if (a.hurt > 0.3) {
      C.strokeStyle = '#3a2110'; C.lineWidth = 3;
      C.beginPath(); C.moveTo(hx + 2, hy - 6); C.lineTo(hx + 9, hy - 1); C.lineTo(hx + 2, hy + 3); C.moveTo(hx + 20, hy - 6); C.lineTo(hx + 14, hy - 1); C.lineTo(hx + 20, hy + 3); C.stroke();
      C.beginPath(); C.ellipse(hx + 11, hy + 12, 5, 6, 0, 0, TAU); fs('#7a2a2a');
    } else if (a.win) {
      C.strokeStyle = '#3a2110'; C.lineWidth = 3;
      C.beginPath(); C.arc(hx + 5, hy - 1, 5, Math.PI * 1.1, Math.PI * 1.9); C.stroke(); C.beginPath(); C.arc(hx + 18, hy - 1, 5, Math.PI * 1.1, Math.PI * 1.9); C.stroke();
      C.beginPath(); C.arc(hx + 11, hy + 8, 7, 0, Math.PI); fs('#7a2a2a', '#3a2110', 2.5);
    } else {
      const bl = ((t * 0.8) % 3.6) < 0.12 ? 0.15 : 1, det = a.cast > 0.4 || L > 0.1;
      C.fillStyle = '#2a1a3a';
      C.beginPath(); C.ellipse(hx + 5, hy - 1, 3.6, 5.2 * bl, 0, 0, TAU); C.fill(); C.beginPath(); C.ellipse(hx + 17, hy - 1, 3.6, 5.2 * bl, 0, 0, TAU); C.fill();
      C.fillStyle = '#fff'; C.beginPath(); C.arc(hx + 6, hy - 3, 1.4, 0, TAU); C.fill(); C.beginPath(); C.arc(hx + 18, hy - 3, 1.4, 0, TAU); C.fill();
      if (det) { C.strokeStyle = '#3a2110'; C.lineWidth = 2.8; C.beginPath(); C.moveTo(hx - 1, hy - 11); C.lineTo(hx + 9, hy - 8); C.moveTo(hx + 23, hy - 11); C.lineTo(hx + 14, hy - 8); C.stroke(); C.beginPath(); C.ellipse(hx + 11, hy + 11, 4, 3 + L * 3, 0, 0, TAU); fs('#7a2a2a'); }
      else { C.beginPath(); C.arc(hx + 11, hy + 7, 5, 0.15 * Math.PI, 0.85 * Math.PI); C.strokeStyle = '#8a5a3a'; C.lineWidth = 2.5; C.stroke(); }
      C.fillStyle = al('#ff8fa3', 0.5); C.beginPath(); C.ellipse(hx - 2, hy + 8, 5, 3, 0, 0, TAU); C.fill(); C.beginPath(); C.ellipse(hx + 21, hy + 8, 4, 3, 0, 0, TAU); C.fill();
    }
    // 帽子
    C.beginPath(); C.ellipse(hx - 2, hy - 17, 44, 10, -0.08, 0, TAU); fs(lg(hy - 27, hy - 7, '#5a6fe0', '#2b3aa0'), o, 4);
    const tipx = hx - 34 - L * 6 + Math.sin(t * 2) * 3, tipy = hy - 82 - a.cast * 4;
    C.beginPath(); C.moveTo(hx - 28, hy - 20); C.quadraticCurveTo(hx - 18, hy - 60, tipx, tipy); C.quadraticCurveTo(hx + 2, hy - 62, hx + 24, hy - 22); C.quadraticCurveTo(hx - 2, hy - 12, hx - 28, hy - 20); C.closePath();
    fs(lg(hy - 82, hy - 18, '#7f97ff', '#3345b8'), o, 4);
    C.beginPath(); C.moveTo(hx - 26, hy - 24); C.quadraticCurveTo(hx - 2, hy - 15, hx + 23, hy - 26); C.strokeStyle = '#ffd24a'; C.lineWidth = 6; C.stroke();
    C.save(); C.translate(hx - 4, hy - 42); C.rotate(Math.sin(t * 1.5) * 0.2); C.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.6 : 8.5, an = (i / 10) * TAU - Math.PI / 2; i ? C.lineTo(Math.cos(an) * r, Math.sin(an) * r) : C.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
    C.closePath(); fs('#ffe066', '#7a5a10', 2); C.restore();
    // 法杖与前手
    const raise = a.cast * 26 + L * 8, thrust = L * 30;
    const handx = 32 + thrust, handy = -92 - raise + by;
    const ang = 0.16 + L * 0.75 - a.cast * 0.12;
    const dx = Math.sin(ang), dy = -Math.cos(ang);
    const bx = handx - dx * 82, byy = handy - dy * 82, tx = handx + dx * 78, ty = handy + dy * 78;
    limb([bx, byy, tx, ty], 6.5, '#8a5a2b', '#2a1a0c');
    // 杖头
    C.save(); C.translate(tx, ty); C.rotate(ang);
    C.beginPath(); C.moveTo(-3, 4); C.quadraticCurveTo(-18, -8, -8, -24); C.strokeStyle = '#2a1a0c'; C.lineWidth = 8; C.stroke(); C.strokeStyle = '#ffd24a'; C.lineWidth = 4; C.stroke();
    C.beginPath(); C.moveTo(3, 4); C.quadraticCurveTo(18, -8, 8, -24); C.strokeStyle = '#2a1a0c'; C.lineWidth = 8; C.stroke(); C.strokeStyle = '#ffd24a'; C.lineWidth = 4; C.stroke();
    C.restore();
    const gx = tx + dx * 14, gy = ty + dy * 14, gr = 30 + a.cast * 30 + L * 20 + Math.sin(t * 3) * 3;
    C.save(); C.globalCompositeOperation = 'lighter'; C.globalAlpha = 0.6 + a.cast * 0.4; C.drawImage(EG.FX.glow(gem), gx - gr, gy - gr, gr * 2, gr * 2); C.restore();
    C.beginPath(); C.arc(gx, gy, 10, 0, TAU);
    const gg = C.createRadialGradient(gx - 3, gy - 3, 0, gx, gy, 12); gg.addColorStop(0, '#ffffff'); gg.addColorStop(1, gem);
    fs(gg, sh(gem, -0.6), 3);
    H.tip.x = gx; H.tip.y = gy;
    limb([20, -112 + by, 34 + thrust * 0.5, -108 - raise * 0.5 + by, handx, handy], 11, '#5873f0', o);
    C.beginPath(); C.arc(handx, handy, 7.5, 0, TAU); fs('#ffd9b3', '#8a5a3a', 3);
    C.restore();
  };
})();
