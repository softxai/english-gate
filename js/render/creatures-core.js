/* English Gate · 怪兽绘制核心：通用画笔工具。
 * 坐标约定：原点在怪兽脚底中心，y 向上为负；怪兽面朝左（朝向主角）。
 * 标准体型约 200x200 单位，由调用方按屏幕缩放。
 * 动画参数 a: {t 时间, cast 吟唱强度0..1, atk 攻击进度0..1, L 攻击前冲0..1, hurt, blink, seed}
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2, sh = U.shade, al = U.rgba;
  let C = null;
  const K = (EG.CK = {});

  K.fs = (fill, line, lw) => {
    if (fill) { C.fillStyle = fill; C.fill(); }
    if (line) { C.strokeStyle = line; C.lineWidth = lw || 4; C.stroke(); }
  };
  K.lg = (y0, y1, c0, c1) => { const g = C.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
  K.body = (m, y0, y1) => K.lg(y0, y1, sh(m, 0.25), sh(m, -0.28));
  K.rg = (x, y, r, c0, c1) => { const g = C.createRadialGradient(x, y, 0, x, y, Math.max(1, r)); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
  K.ell = (x, y, rx, ry, rot) => { C.beginPath(); C.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); };
  K.circ = (x, y, r) => { C.beginPath(); C.arc(x, y, Math.abs(r), 0, TAU); };
  K.poly = (p) => { C.beginPath(); C.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) C.lineTo(p[i], p[i + 1]); C.closePath(); };
  K.rr = (x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    C.beginPath();
    C.moveTo(x + r, y); C.lineTo(x + w - r, y); C.quadraticCurveTo(x + w, y, x + w, y + r);
    C.lineTo(x + w, y + h - r); C.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    C.lineTo(x + r, y + h); C.quadraticCurveTo(x, y + h, x, y + h - r);
    C.lineTo(x, y + r); C.quadraticCurveTo(x, y, x + r, y); C.closePath();
  };
  /** 尖刺：底边中心 (x,y)，朝 ang 方向，长 len，底宽 w */
  K.tri = (x, y, ang, len, w) => {
    const bx = Math.cos(ang + Math.PI / 2) * w / 2, by = Math.sin(ang + Math.PI / 2) * w / 2;
    C.beginPath(); C.moveTo(x + bx, y + by); C.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); C.lineTo(x - bx, y - by); C.closePath();
  };
  /** 弯角 */
  K.horn = (x, y, ang, len, w, curve) => {
    const tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len;
    const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
    const cx = (x + tx) / 2 + nx * curve, cy = (y + ty) / 2 + ny * curve;
    C.beginPath();
    C.moveTo(x + nx * w / 2, y + ny * w / 2);
    C.quadraticCurveTo(cx + nx * w * 0.3, cy + ny * w * 0.3, tx, ty);
    C.quadraticCurveTo(cx - nx * w * 0.3, cy - ny * w * 0.3, x - nx * w / 2, y - ny * w / 2);
    C.closePath();
  };
  /** 带描边的粗线肢体：p 为 2/3/4 个点（直线/二次/三次曲线） */
  K.limb = (p, w, col, line) => {
    C.beginPath(); C.moveTo(p[0], p[1]);
    if (p.length === 4) C.lineTo(p[2], p[3]);
    else if (p.length === 6) C.quadraticCurveTo(p[2], p[3], p[4], p[5]);
    else C.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
    C.lineCap = 'round';
    if (line) { C.strokeStyle = line; C.lineWidth = w + 7; C.stroke(); }
    C.strokeStyle = col; C.lineWidth = w; C.stroke();
  };
  K.shine = (x, y, rx, ry, rot, a) => { K.ell(x, y, rx, ry, rot); C.fillStyle = al('#ffffff', a === undefined ? 0.4 : a); C.fill(); };
  K.glow = (x, y, r, col, a) => {
    if (a <= 0) return;
    C.save(); C.globalCompositeOperation = 'lighter'; C.globalAlpha = Math.min(1, a);
    C.drawImage(EG.FX.glow(col), x - r, y - r, r * 2, r * 2); C.restore();
  };
  /**
   * 眼睛。o: iris 颜色, blink 0..1, brow(1=左眼怒眉,-1=右眼怒眉), slit 竖瞳, glow 发光眼(颜色), line 描边色
   */
  K.eye = (x, y, r, o) => {
    o = o || {};
    const bl = o.blink || 0;
    if (o.glow) {
      K.glow(x, y, r * 2.6, o.glow, 0.8);
      K.ell(x, y, r, r * (1 - bl * 0.9)); C.fillStyle = o.glow; C.fill();
      K.ell(x - r * 0.2, y - r * 0.2, r * 0.42, r * 0.42 * (1 - bl)); C.fillStyle = '#fff'; C.fill();
    } else {
      K.ell(x, y, r, r * (1 - bl * 0.92)); K.fs('#fff', o.line || '#1d1730', Math.max(2, r * 0.22));
      if (bl < 0.6) {
        const px = x - r * 0.26, py = y + r * 0.06;
        if (o.slit) K.ell(px, py, r * 0.24, r * 0.72); else K.circ(px, py, r * 0.56);
        C.fillStyle = o.iris || '#1b1b2f'; C.fill();
        K.circ(px - r * 0.16, py - r * 0.22, r * 0.2); C.fillStyle = '#fff'; C.fill();
      }
    }
    if (o.brow) {
      const b = o.brow;
      C.beginPath(); C.moveTo(x - b * r * 1.2, y - r * 1.6); C.lineTo(x + b * r * 1.05, y - r * 0.72);
      C.strokeStyle = o.line || '#1d1730'; C.lineWidth = Math.max(3, r * 0.42); C.lineCap = 'round'; C.stroke();
    }
  };
  /** 一对眼睛，以 (x,y) 为中心，间距 gap */
  K.eyes = (x, y, gap, r, o) => {
    o = o || {};
    K.eye(x - gap / 2, y, r, Object.assign({}, o, { brow: o.angry ? 1 : 0 }));
    K.eye(x + gap / 2, y, r, Object.assign({}, o, { brow: o.angry ? -1 : 0 }));
  };
  /** 一排牙：从 y 伸到 y+h（h 为负则朝上） */
  K.teeth = (x0, x1, y, h, n, col) => {
    const w = (x1 - x0) / n;
    C.beginPath();
    for (let i = 0; i < n; i++) { C.moveTo(x0 + i * w, y); C.lineTo(x0 + (i + 0.5) * w, y + h); C.lineTo(x0 + (i + 1) * w, y); }
    C.closePath(); C.fillStyle = col || '#fffdf2'; C.fill();
    C.strokeStyle = 'rgba(40,20,30,.55)'; C.lineWidth = 1.5; C.stroke();
  };
  K.star = (x, y, r, n, inner, rot) => {
    C.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r * (inner || 0.42) : r, a = (i / (n * 2)) * TAU - Math.PI / 2 + (rot || 0);
      i ? C.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : C.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    C.closePath();
  };
  K.crown = (x, y, w, col) => {
    const h = w * 0.55, o = sh(col, -0.55);
    C.beginPath();
    C.moveTo(x - w / 2, y); C.lineTo(x - w / 2, y - h * 0.9); C.lineTo(x - w / 4, y - h * 0.45);
    C.lineTo(x, y - h * 1.15); C.lineTo(x + w / 4, y - h * 0.45); C.lineTo(x + w / 2, y - h * 0.9); C.lineTo(x + w / 2, y); C.closePath();
    K.fs(K.lg(y - h, y, sh(col, 0.35), sh(col, -0.15)), o, 3);
    [[-w / 2, -h * 0.9, '#ff5d73'], [0, -h * 1.15, '#5ad1ff'], [w / 2, -h * 0.9, '#ff5d73']].forEach((g) => { K.circ(x + g[0], y + g[1], w * 0.07); K.fs(g[2], o, 2); });
  };
  /** 火焰形：底部中心 (x,y)，宽 w 高 h */
  K.flame = (x, y, w, h, t, col, line) => {
    const a = Math.sin(t * 9) * w * 0.14, b = Math.sin(t * 13 + 1) * w * 0.1;
    C.beginPath();
    C.moveTo(x - w / 2, y);
    C.bezierCurveTo(x - w * 0.8, y - h * 0.42, x - w * 0.12 + a, y - h * 0.62, x + b, y - h);
    C.bezierCurveTo(x + w * 0.22 + a, y - h * 0.6, x + w * 0.8, y - h * 0.4, x + w / 2, y);
    C.quadraticCurveTo(x, y + h * 0.14, x - w / 2, y);
    C.closePath();
    K.fs(col, line, 3);
  };
  /** 叶片：从 (x,y) 朝 ang 伸出 */
  K.leaf = (x, y, ang, len, w) => {
    const tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len;
    const nx = Math.cos(ang + Math.PI / 2) * w / 2, ny = Math.sin(ang + Math.PI / 2) * w / 2;
    const mx = (x + tx) / 2, my = (y + ty) / 2;
    C.beginPath(); C.moveTo(x, y); C.quadraticCurveTo(mx + nx * 1.6, my + ny * 1.6, tx, ty); C.quadraticCurveTo(mx - nx * 1.6, my - ny * 1.6, x, y); C.closePath();
  };
  /** 摆动的触手/尾巴（由粗到细），返回末端坐标 */
  K.tent = (x, y, ang, len, w, col, line, t, ph, amp, n) => {
    n = n || 8;
    const pts = [];
    let px = x, py = y;
    for (let i = 0; i <= n; i++) {
      pts.push([px, py]);
      const a = ang + Math.sin(t * 2.2 + (ph || 0) + i * 0.6) * (amp === undefined ? 0.5 : amp) * (i / n + 0.25);
      px += (Math.cos(a) * len) / n; py += (Math.sin(a) * len) / n;
    }
    C.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      if (pass === 0 && !line) continue;
      for (let i = 0; i < n; i++) {
        C.beginPath(); C.moveTo(pts[i][0], pts[i][1]); C.lineTo(pts[i + 1][0], pts[i + 1][1]);
        C.lineWidth = w * (1 - (i / n) * 0.8) + (pass ? 0 : 6);
        C.strokeStyle = pass ? col : line; C.stroke();
      }
    }
    K._pts = pts;
    return pts[n];
  };
  /** 翅膀：type 'bat' 膜翼 / 'feather' 羽翼；dir=1 右翼, -1 左翼；rot 扇动角 */
  K.wing = (type, x, y, dir, len, rot, c1, c2, line) => {
    C.save(); C.translate(x, y); C.scale(dir, 1); C.rotate(-0.35 + rot);
    if (type === 'bat') {
      C.beginPath(); C.moveTo(0, 0);
      C.quadraticCurveTo(len * 0.45, -len * 0.5, len, -len * 0.28);
      C.quadraticCurveTo(len * 0.86, -len * 0.02, len * 0.74, len * 0.2);
      C.quadraticCurveTo(len * 0.64, len * 0.02, len * 0.5, len * 0.3);
      C.quadraticCurveTo(len * 0.42, len * 0.1, len * 0.26, len * 0.34);
      C.quadraticCurveTo(len * 0.18, len * 0.16, 0, len * 0.26);
      C.closePath();
      K.fs(K.lg(-len * 0.5, len * 0.34, sh(c1, 0.12), sh(c1, -0.35)), line, 4);
      C.strokeStyle = al(line, 0.7); C.lineWidth = 3;
      [[0.74, 0.2], [0.5, 0.3], [0.26, 0.34]].forEach((p) => { C.beginPath(); C.moveTo(len * 0.34, -len * 0.3); C.lineTo(len * p[0], len * p[1]); C.stroke(); });
      C.beginPath(); C.moveTo(0, 0); C.quadraticCurveTo(len * 0.45, -len * 0.5, len, -len * 0.28);
      C.strokeStyle = line; C.lineWidth = 9; C.stroke(); C.strokeStyle = c2; C.lineWidth = 5; C.stroke();
    } else {
      const n = 7;
      for (let i = n - 1; i >= 0; i--) {
        const an = -0.5 + i * 0.2, l = len * (1 - i * 0.07);
        C.save(); C.rotate(an);
        C.beginPath(); C.ellipse(l * 0.55, 0, l * 0.5, len * 0.1, 0, 0, TAU);
        K.fs(i % 2 ? c1 : sh(c1, -0.14), line, 3);
        C.restore();
      }
      C.beginPath(); C.ellipse(len * 0.3, -len * 0.02, len * 0.34, len * 0.17, -0.1, 0, TAU);
      K.fs(c2, line, 3.5);
    }
    C.restore();
  };
  /** Catmull-Rom 样条采样，返回 n+1 个点 */
  K.spline = (P, n) => {
    const out = [], segs = P.length - 1;
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * segs, k = Math.min(segs - 1, Math.floor(u)), t = u - k;
      const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(P.length - 1, k + 2)];
      const t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
    return out;
  };
  /** 齿轮 */
  K.gear = (x, y, r, n, rot) => {
    C.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a0 = (i / (n * 2)) * TAU + rot, a1 = ((i + 1) / (n * 2)) * TAU + rot, rr = i % 2 ? r : r * 0.78;
      C.lineTo(x + Math.cos(a0) * rr, y + Math.sin(a0) * rr); C.lineTo(x + Math.cos(a1) * rr, y + Math.sin(a1) * rr);
    }
    C.closePath();
  };

  /* ---------- 入口 ---------- */
  const Cr = (EG.Creatures = { R: {} });
  const FLY = { bird: 1, ghost: 1, eye: 1, skull: 1, tentacle: 1, elemental: 1 };
  Cr.isFly = (d) => !!(FLY[d.a] || (d.a === 'object' && d.f.v !== 'chest') || (d.a === 'dragon' && d.f.small));
  Cr.draw = (ctx, d, a) => {
    C = ctx;
    C.save();
    C.lineJoin = 'round'; C.lineCap = 'round';
    a.L = a.atk > 0 ? Math.sin(Math.PI * Math.min(1, a.atk)) : 0;
    const bt = (a.t * 0.9 + (a.seed || 0) * 3.1) % 4.2;
    a.blink = bt < 0.15 ? Math.sin((bt / 0.15) * Math.PI) : 0;
    a.cast = a.cast || 0; a.hurt = a.hurt || 0;
    (Cr.R[d.a] || Cr.R.slime)(C, d, a);
    C.restore();
  };
})();
