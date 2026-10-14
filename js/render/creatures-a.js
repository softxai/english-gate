/* English Gate · 怪兽骨架 A：史莱姆、蘑菇、植物、树人、走兽、飞禽 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2, sh = U.shade, al = U.rgba;
  const K = EG.CK, R = EG.Creatures.R;
  const { fs, lg, rg, ell, circ, poly, rr, tri, horn, limb, shine, glow, eye, eyes, teeth, star, crown, flame, leaf, tent, wing } = K;

  /* ================= 史莱姆 =================
   * f: eyes(1/2/3) spikes horns crown core stars fang drip angry iris */
  R.slime = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.6), t = a.t;
    const br = Math.sin(t * 2.8 + a.seed);
    const sq = 1 + br * 0.045 + a.cast * 0.05 * Math.sin(t * 22) - a.L * 0.12;
    const w = 92 * (1 + (1 - sq) * 0.9), h = 128 * sq;
    if (f.spikes) for (let i = 0; i < 7; i++) {
      const ang = -Math.PI * (0.12 + i * 0.127);
      tri(Math.cos(ang) * w * 0.84, -h * 0.5 + Math.sin(ang) * h * 0.5, ang, 30 + (i % 2) * 12, 26);
      fs(lg(-h - 30, -h * 0.4, sh(s, 0.3), s), o, 3.5);
    }
    if (f.horns) { horn(-w * 0.5, -h * 0.84, -2.1, 48, 24, 8); fs(s, o, 3.5); horn(w * 0.5, -h * 0.84, -1.05, 48, 24, -8); fs(s, o, 3.5); }
    C.beginPath();
    C.moveTo(-w, -6);
    C.bezierCurveTo(-w * 1.12, -h * 0.72, -w * 0.56, -h, 0, -h);
    C.bezierCurveTo(w * 0.56, -h, w * 1.12, -h * 0.72, w, -6);
    C.quadraticCurveTo(w * 0.9, 8, w * 0.5, 6); C.quadraticCurveTo(0, 12, -w * 0.5, 6); C.quadraticCurveTo(-w * 0.9, 8, -w, -6);
    C.closePath();
    fs(lg(-h, 0, sh(m, 0.3), sh(m, -0.3)), o, 4.5);
    ell(4, -h * 0.34, w * 0.62, h * 0.3); C.fillStyle = al(sh(m, 0.45), 0.28); C.fill();
    if (f.core) { glow(10, -h * 0.3, 46, ac, 0.5 + br * 0.2); circ(10, -h * 0.3, 16 + br * 2); fs(rg(6, -h * 0.3 - 4, 20, '#ffffff', ac), al(o, 0.5), 2); }
    if (f.stars) for (let i = 0; i < 8; i++) {
      const x = Math.sin(i * 2.4 + 1) * w * 0.6, y = -h * (0.16 + 0.09 * i), tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7);
      star(x, y, 4 + tw * 5, 4); C.fillStyle = al('#ffffff', 0.35 + 0.65 * tw); C.fill();
    }
    if (f.drip) [[-w * 0.92, -18], [w * 0.86, -26], [w * 0.3, 4]].forEach((p, i) => { ell(p[0], p[1] + Math.abs(Math.sin(t * 1.5 + i)) * 8, 7, 10); fs(sh(m, -0.1), o, 3); });
    shine(-w * 0.48, -h * 0.74, w * 0.2, h * 0.09, -0.6, 0.45);
    circ(-w * 0.7, -h * 0.52, 5); C.fillStyle = al('#ffffff', 0.4); C.fill();
    const ey = -h * 0.5, n = f.eyes || 2, eo = { iris: f.iris, blink: a.blink, angry: f.angry };
    if (n === 1) eye(-16, ey, 27, eo);
    else { eyes(-18, ey, 56, 17, eo); if (n === 3) eye(-18, ey - 36, 13, eo); }
    const mo = a.L * 0.9 + a.cast * 0.35;
    if (f.fang) {
      C.beginPath(); C.moveTo(-54, -h * 0.27); C.quadraticCurveTo(-18, -h * 0.27 + 24 + mo * 22, 18, -h * 0.27); C.quadraticCurveTo(-18, -h * 0.27 + 6, -54, -h * 0.27); C.closePath();
      fs('#3a0d1a', o, 3); teeth(-44, 8, -h * 0.27 + 3, 9, 4);
    } else {
      C.beginPath(); C.arc(-18, -h * 0.31, 16, 0.15 * Math.PI, 0.85 * Math.PI); C.strokeStyle = o; C.lineWidth = 4; C.stroke();
      if (mo > 0.2) { ell(-18, -h * 0.25, 10, 9 * mo); C.fillStyle = '#3a0d1a'; C.fill(); }
    }
    if (f.crown) crown(0, -h + 5, 52, '#ffd24a');
  };

  /* ================= 蘑菇 =================
   * f: spots(0 关) cone flat icicles glow angry */
  R.mushroom = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.62), so = sh(s, -0.6), t = a.t;
    const br = Math.sin(t * 2.4 + a.seed);
    C.rotate(Math.sin(t * 1.6 + a.seed) * 0.035 - a.L * 0.16);
    ell(-26, -6, 20, 10); fs(sh(s, -0.25), so, 3.5); ell(26, -6, 20, 10); fs(sh(s, -0.25), so, 3.5);
    limb([38, -62, 62, -50, 68, -66 + br * 4], 10, s, so);
    C.beginPath(); C.moveTo(-40, -8); C.bezierCurveTo(-54, -50, -40, -92, -32, -114); C.lineTo(32, -114); C.bezierCurveTo(40, -92, 54, -50, 40, -8); C.quadraticCurveTo(0, 6, -40, -8); C.closePath();
    fs(lg(-114, 0, sh(s, 0.25), sh(s, -0.18)), so, 4);
    limb([-38, -62, -64, -52 - a.cast * 26 - a.L * 20, -72, -72 - a.cast * 36 - a.L * 10], 10, s, so);
    eyes(-6, -68, 34, 11, { blink: a.blink, angry: f.angry, iris: f.iris });
    if (a.L > 0.3 || a.cast > 0.5) { ell(-6, -44, 9, 6 + a.L * 5); fs('#3a0d1a', so, 2.5); }
    else { C.beginPath(); C.arc(-6, -50, 9, 0.2 * Math.PI, 0.8 * Math.PI); C.strokeStyle = so; C.lineWidth = 3.5; C.stroke(); }
    C.fillStyle = al('#ff7a8a', 0.5); ell(-34, -52, 7, 4); C.fill(); ell(22, -52, 7, 4); C.fill();
    ell(0, -112, 40, 9); fs(sh(s, -0.12), so, 3);
    const cy = -108 - br * 2, cw = f.flat ? 122 : 102, ch = f.cone ? 150 : 86;
    const cap = () => {
      C.beginPath(); C.moveTo(-cw, cy);
      if (f.cone) { const tx = -14 + Math.sin(t * 1.3) * 8; C.bezierCurveTo(-cw * 0.7, cy - ch * 0.35, -cw * 0.2, cy - ch * 0.6, tx, cy - ch); C.bezierCurveTo(cw * 0.15, cy - ch * 0.55, cw * 0.7, cy - ch * 0.3, cw, cy); }
      else C.bezierCurveTo(-cw * 1.02, cy - ch * 1.3, cw * 1.02, cy - ch * 1.3, cw, cy);
      C.quadraticCurveTo(0, cy + 26, -cw, cy); C.closePath();
    };
    if (f.glow) glow(0, cy - ch * 0.4, cw * 1.6, ac, 0.3 + 0.15 * br);
    cap(); fs(lg(cy - ch, cy + 10, sh(m, 0.28), sh(m, -0.25)));
    if (f.spots !== 0) {
      C.save(); cap(); C.clip(); C.fillStyle = ac;
      [[-58, -30, 17], [-8, -58, 21], [48, -34, 15], [14, -14, 11], [-84, -6, 10], [78, -4, 9]].forEach((p) => { ell(p[0], cy + p[1] * (ch / 86), p[2], p[2] * 0.8); C.fill(); });
      C.restore();
    }
    cap(); fs(null, o, 4.5);
    shine(-cw * 0.45, cy - ch * (f.cone ? 0.3 : 0.62), cw * 0.2, ch * 0.08, -0.5, 0.4);
    if (f.icicles) for (let i = 0; i < 6; i++) {
      const x = -cw * 0.8 + i * cw * 0.32, y = cy + 13 * (1 - (x / cw) * (x / cw));
      tri(x, y, Math.PI / 2, 18 + (i % 3) * 9, 13); fs('#e8f9ff', '#7cc0e0', 2);
    }
  };

  /* ================= 植物 =================
   * f.v: flower / cactus / maneater；f.giant(仙人掌) */
  R.plant = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.62), so = sh(s, -0.6), t = a.t;
    const br = Math.sin(t * 2.2 + a.seed), v = f.v || 'flower';
    if (v === 'cactus') {
      C.rotate(Math.sin(t * 1.4) * 0.02 - a.L * 0.1);
      const big = f.giant ? 1 : 0;
      limb([30, -70, 76, -70, 76, -116 - br * 3], 26, m, o);
      limb([-30, -92, -78, -92, -78, -150 - a.cast * 14 - a.L * 10], 26, m, o);
      if (big) { limb([30, -124, 62, -124, 62, -160], 18, m, o); circ(62, -166, 9); fs(ac, sh(ac, -0.5), 2); }
      rr(-40, -172, 80, 174, 38); fs(lg(-172, 0, sh(m, 0.25), sh(m, -0.25)), o, 4.5);
      C.strokeStyle = al(sh(m, -0.45), 0.6); C.lineWidth = 3;
      [-18, 0, 18].forEach((x) => { C.beginPath(); C.moveTo(x, -160); C.lineTo(x, -8); C.stroke(); });
      C.strokeStyle = '#fff8dc'; C.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const y = -152 + i * 17; [[-40, -1], [40, 1], [-90, -1], [88, 1]].forEach((p, j) => { if (j > 1 && (i < 2 || i > 4)) return; const yy = j > 1 ? y + 10 : y; C.beginPath(); C.moveTo(p[0], yy); C.lineTo(p[0] + p[1] * 9, yy - 4); C.stroke(); }); }
      eyes(-6, -112, 32, 11, { blink: a.blink, angry: 1, iris: f.iris });
      C.beginPath(); C.moveTo(-26, -84); [-18, -10, -2, 6, 14].forEach((x, i) => C.lineTo(x, -84 + (i % 2 ? 0 : 8 + a.L * 6))); C.strokeStyle = o; C.lineWidth = 3.5; C.stroke();
      for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU + t * 0.5; ell(Math.cos(an) * 12, -178 + Math.sin(an) * 7, 10, 7, an); fs(ac, sh(ac, -0.5), 2); }
      circ(0, -178, 6); fs('#ffe066', sh(ac, -0.5), 2);
      return;
    }
    if (v === 'maneater') {
      leaf(0, -4, Math.PI + 0.45, 78, 34); fs(sh(s, -0.1), so, 3.5);
      leaf(0, -4, -0.45, 78, 34); fs(sh(s, -0.1), so, 3.5);
      tent(-10, -10, -2.4, 96, 9, s, so, t, 0, 0.6); tent(14, -10, -0.7, 86, 9, s, so, t, 2, 0.6);
      const hx = -22 - a.L * 44 + Math.sin(t * 1.5) * 6, hy = -128 + br * 4 + a.L * 22;
      limb([0, -6, 40, -72, hx + 26, hy + 26], 20, s, so);
      const open = 0.22 + 0.16 * Math.abs(Math.sin(t * 2)) + a.L * 0.5 + a.cast * 0.3;
      C.save(); C.translate(hx, hy); C.rotate(-0.2);
      ell(4, 0, 50, 26 + open * 30); C.fillStyle = '#3a0d1a'; C.fill();
      ell(10, 6 + open * 10, 24, 10 + open * 8); C.fillStyle = '#e0486a'; C.fill();
      C.save(); C.translate(58, 0); C.rotate(-open * 0.55); C.translate(-58, 0);
      C.beginPath(); C.arc(0, 0, 58, 0, Math.PI); C.closePath(); fs(lg(0, 58, sh(m, -0.05), sh(m, -0.38)), o, 4.5); teeth(-50, 44, 0, -15, 7);
      C.restore();
      C.save(); C.translate(58, 0); C.rotate(open * 0.55); C.translate(-58, 0);
      C.beginPath(); C.arc(0, 0, 58, Math.PI, TAU); C.closePath(); fs(lg(-58, 0, sh(m, 0.28), m), o, 4.5);
      C.save(); C.beginPath(); C.arc(0, 0, 58, Math.PI, TAU); C.closePath(); C.clip(); C.fillStyle = ac;
      [[-30, -30, 10], [6, -42, 12], [34, -22, 8], [-8, -14, 6]].forEach((p) => { circ(p[0], p[1], p[2]); C.fill(); }); C.restore();
      teeth(-50, 44, 0, 15, 7);
      shine(-22, -40, 14, 6, -0.4, 0.35);
      C.restore();
      C.restore();
      return;
    }
    // flower
    const hx = -8 + Math.sin(t * 1.5 + a.seed) * 6 - a.L * 38, hy = -132 + br * 3 + a.L * 16;
    limb([0, -4, 18, -62, hx, hy + 30], 11, s, so);
    leaf(6, -40, -0.4 + br * 0.05, 56, 24); fs(s, so, 3);
    leaf(8, -60, Math.PI + 0.5 - br * 0.05, 52, 22); fs(s, so, 3);
    ell(0, -4, 22, 8); fs(sh(s, -0.25), so, 3);
    const n = f.petals || 8;
    for (let i = 0; i < n; i++) { const an = (i / n) * TAU + t * 0.3; ell(hx + Math.cos(an) * 44, hy + Math.sin(an) * 44, 27, 15, an); fs(i % 2 ? m : sh(m, 0.2), o, 3.5); }
    circ(hx, hy, 34); fs(rg(hx - 8, hy - 8, 42, sh(ac, 0.3), sh(ac, -0.2)), sh(ac, -0.6), 4);
    eyes(hx - 6, hy - 6, 26, 9, { blink: a.blink, angry: f.angry, iris: f.iris });
    if (a.L > 0.3 || a.cast > 0.5) { ell(hx - 6, hy + 14, 7, 5 + a.L * 4); fs('#3a0d1a', sh(ac, -0.6), 2); }
    else { C.beginPath(); C.arc(hx - 6, hy + 8, 8, 0.2 * Math.PI, 0.8 * Math.PI); C.strokeStyle = sh(ac, -0.6); C.lineWidth = 3; C.stroke(); }
  };

  /* ================= 树人 =================
   * f: boss fruit */
  R.treant = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.6), lo = sh(s, -0.6), t = a.t;
    const br = Math.sin(t * 1.8 + a.seed);
    C.rotate(Math.sin(t * 1.2) * 0.02 - a.L * 0.08);
    [[-74, 6], [-40, 10], [40, 10], [76, 6]].forEach((p) => limb([p[0] * 0.4, -26, p[0] * 0.8, -14, p[0], p[1] - 6], 16, sh(m, -0.12), o));
    const ball = (x, y, r) => { const xx = x + Math.sin(t * 1.3 + x) * 3, yy = y + br * 2; circ(xx, yy, r); fs(rg(xx - r * 0.3, yy - r * 0.4, r * 1.3, sh(s, 0.3), sh(s, -0.25)), lo, 4); };
    if (f.boss) {
      [[-34, -246, -1.9, 70], [30, -250, -1.2, 76], [-4, -262, -1.57, 60]].forEach((h) => { limb([h[0], h[1] + 40, h[0] + Math.cos(h[2]) * h[3], h[1] + 40 + Math.sin(h[2]) * h[3]], 9, sh(m, -0.1), o); });
      ball(-110, -152, 38); ball(112, -150, 38); ball(0, -238, 52);
    }
    ball(-66, -170, 48); ball(66, -168, 48); ball(0, -200, 60);
    const up = a.cast * 40 + a.L * 30;
    limb([36, -112, 82, -122, 106, -98 + br * 5], 18, m, o);
    [[124, -84], [128, -102], [118, -116]].forEach((p) => limb([106, -98 + br * 5, p[0], p[1] + br * 5], 6, m, o));
    limb([-36, -112, -86, -128 - up * 0.5, -110, -106 - up], 18, m, o);
    [[-130, -92], [-134, -112], [-122, -126]].forEach((p) => limb([-110, -106 - up, p[0], p[1] - up], 6, m, o));
    C.beginPath(); C.moveTo(-52, 0); C.bezierCurveTo(-40, -50, -46, -110, -38, -152); C.lineTo(38, -152); C.bezierCurveTo(46, -110, 40, -50, 52, 0); C.quadraticCurveTo(0, 10, -52, 0); C.closePath();
    fs(lg(-152, 0, sh(m, 0.18), sh(m, -0.3)), o, 4.5);
    C.strokeStyle = al(o, 0.45); C.lineWidth = 3;
    [[-30, -30, -26, -52], [26, -24, 30, -48], [-6, -20, -2, -36], [30, -90, 34, -130]].forEach((b) => { C.beginPath(); C.moveTo(b[0], b[1]); C.quadraticCurveTo(b[0] - 5, (b[1] + b[3]) / 2, b[2], b[3]); C.stroke(); });
    if (f.boss) { // 发光符文
      C.save(); C.globalAlpha = 0.5 + a.cast * 0.5 + br * 0.15; C.strokeStyle = ac; C.lineWidth = 3.5;
      C.beginPath(); C.moveTo(-8, -40); C.lineTo(6, -30); C.lineTo(-6, -20); C.moveTo(22, -58); C.lineTo(30, -50); C.moveTo(-30, -62); C.lineTo(-22, -70); C.lineTo(-30, -78); C.stroke(); C.restore();
      glow(0, -36, 60, ac, 0.25 + a.cast * 0.4);
    }
    [[-22, 1], [16, -1]].forEach((e) => {
      poly([e[0] - 13, -122 - e[1] * 5, e[0] + 13, -122 + e[1] * 5, e[0] + 10, -104, e[0] - 10, -104]); fs('#160c08', o, 3);
      glow(e[0] - 2, -112, 22, ac, 0.7 + a.cast * 0.3); circ(e[0] - 2, -112, 4.5 + a.cast * 2); C.fillStyle = ac; C.fill();
    });
    const mo = a.L * 12 + a.cast * 6;
    poly([-30, -80, -18, -72, -8, -80, 2, -72, 12, -80, 24, -72, 20, -58 + mo, -4, -52 + mo, -26, -58 + mo]); fs('#160c08', o, 3);
    ball(-30, -160, 40); ball(32, -158, 40);
    if (f.fruit || f.boss) [[-70, -180], [20, -222], [74, -160], [-22, -150]].forEach((p, i) => { const x = p[0] + Math.sin(t * 1.3 + p[0]) * 3; if (f.boss) glow(x, p[1], 20, ac, 0.6); circ(x, p[1] + br * 2, 8); fs(f.boss ? ac : '#ff5d5d', f.boss ? sh(ac, -0.5) : '#8a1c1c', 2.5); });
  };

  /* ================= 走兽（四足，侧面） =================
   * f.v: wolf boar hedgehog stag lizard hare rat tiger sphinx hound mammoth
   * f: horn(独角) crystal heads2 */
  const BV = {
    wolf: { leg: 48, by: -84, ear: 'point', sn: 32, tail: 'bushy', fang: 1, hr: 32 },
    boar: { leg: 34, by: -70, ear: 'small', sn: 28, tail: 'curl', tusk: 1, bristle: 1, hr: 40, rx: 76, ry: 46 },
    hedgehog: { leg: 18, by: -52, ear: 'small', sn: 26, tail: 'none', quill: 1, hr: 28, rx: 66, ry: 42 },
    stag: { leg: 70, by: -108, ear: 'leaf', sn: 26, tail: 'puff', antler: 1, hr: 26, rx: 60, ry: 34, neck: 34 },
    lizard: { leg: 22, by: -46, ear: 'none', sn: 38, tail: 'thick', crest: 1, hr: 26, rx: 70, ry: 30 },
    hare: { leg: 28, by: -62, ear: 'long', sn: 14, tail: 'puff', hr: 32, rx: 54, ry: 42 },
    rat: { leg: 22, by: -54, ear: 'round', sn: 32, tail: 'thin', buck: 1, hr: 28, rx: 62, ry: 38 },
    tiger: { leg: 44, by: -82, ear: 'round', sn: 22, tail: 'long', saber: 1, stripe: 1, hr: 38, rx: 76, ry: 42 },
    sphinx: { leg: 42, by: -80, ear: 'none', sn: 8, tail: 'tuft', nemes: 1, hr: 34, rx: 74, ry: 40, neck: 12 },
    hound: { leg: 48, by: -84, ear: 'point', sn: 32, tail: 'flame', fang: 1, hr: 32, flame: 1 },
    mammoth: { leg: 52, by: -106, ear: 'flap', sn: 0, tail: 'curl', trunk: 1, tusk: 2, hr: 46, rx: 86, ry: 58, fur: 1 },
  };
  R.beast = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = BV[f.v] || BV.wolf, o = sh(m, -0.62), t = a.t;
    const br = Math.sin(t * 2.6 + a.seed);
    const rx = v.rx || 70, ry = v.ry || 40, by = v.by + br * 1.5, bx = 14, hr = v.hr;
    C.translate(60, 0); C.rotate(-a.L * 0.14); C.translate(-60, 0);
    const hx = bx - rx - hr * 0.42, hy = by - ry * 0.35 - (v.neck || 0) - a.cast * 4;
    const tx = bx + rx - 8, ty = by - ry * 0.3;
    // 尾巴
    switch (v.tail) {
      case 'bushy': limb([tx, ty, tx + 42, ty - 26 + br * 6, tx + 50, ty - 66 + br * 10], 22, m, o); circ(tx + 50, ty - 66 + br * 10, 9); C.fillStyle = sh(m, 0.45); C.fill(); break;
      case 'curl': limb([tx, ty, tx + 26, ty - 10, tx + 18, ty - 28 + br * 3], 7, m, o); break;
      case 'thick': tent(tx - 14, ty + 12, 0.12, 120, 34, m, o, t, 0, 0.22); break;
      case 'thin': tent(tx, ty + 6, 0.25, 104, 7, ac, o, t, 0, 0.5); break;
      case 'long': limb([tx, ty, tx + 64, ty + 16, tx + 52 + br * 6, ty - 58], 12, m, o); break;
      case 'tuft': limb([tx, ty, tx + 60, ty + 10, tx + 54 + br * 5, ty - 52], 9, m, o); circ(tx + 54 + br * 5, ty - 56, 12); fs(s, o, 3); break;
      case 'puff': circ(tx + 8, ty, 15); fs(sh(m, 0.4), o, 3.5); break;
      case 'flame': limb([tx, ty, tx + 40, ty - 10, tx + 48, ty - 40], 12, m, o); flame(tx + 50, ty - 34, 34, 60, t, ac, sh(ac, -0.4)); flame(tx + 50, ty - 34, 18, 36, t + 1, '#fff2a8'); break;
      default: break;
    }
    const leg = (x, ph, far, front) => {
      const sw = Math.sin(t * 2.6 + ph) * 3, lift = front ? a.L * 26 : 0, fx = x + sw * 0.5 - (front ? a.L * 30 : 0);
      const col = far ? sh(m, -0.25) : m, top = by + ry * 0.45;
      limb([x, top, x - 4 + sw - (front ? a.L * 18 : 0), (top - lift) * 0.5, fx, -lift - 5], far ? 14 : 16, col, o);
      ell(fx - 4, -lift - 3, far ? 10 : 12, 6); fs(far ? sh(m, -0.38) : sh(m, -0.15), o, 3);
    };
    leg(bx - rx * 0.55, 0, 1, 1); leg(bx + rx * 0.6, 2, 1, 0);
    if (v.quill) for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 9; i++) {
      const an = -Math.PI * (0.05 + i * 0.105) + (r2 ? 0.05 : 0), k = r2 ? 0.7 : 0.95;
      tri(bx + Math.cos(an) * rx * k, by + Math.sin(an) * ry * k, an - 0.25, 34 - r2 * 6, 20); fs(lg(by - ry - 34, by, sh(s, 0.4), s), sh(s, -0.6), 3);
    }
    if (v.bristle) for (let i = 0; i < 7; i++) { const x = bx - rx * 0.7 + i * rx * 0.24; tri(x, by - ry * Math.sqrt(Math.max(0.05, 1 - Math.pow((x - bx) / rx, 2))) + 4, -Math.PI / 2 + 0.25, 20, 16); fs(s, o, 3); }
    if (v.crest) { C.beginPath(); C.moveTo(bx - rx * 0.8, by - ry * 0.5); for (let i = 0; i < 6; i++) { const x = bx - rx * 0.8 + (i + 0.5) * rx * 0.3; C.lineTo(x, by - ry - 22 - (i % 2) * 6); C.lineTo(x + rx * 0.15, by - ry * 0.7); } C.closePath(); fs(ac, sh(ac, -0.55), 3); }
    if (v.flame) for (let i = 0; i < 5; i++) { const x = bx - rx * 0.7 + i * rx * 0.36; flame(x, by - ry * 0.75, 30, 54 + Math.sin(t * 7 + i) * 8, t + i, i % 2 ? ac : '#ffd166', null); }
    ell(bx, by, rx, ry); fs(lg(by - ry, by + ry, sh(m, 0.25), sh(m, -0.28)), o, 4.5);
    ell(bx, by + ry * 0.45, rx * 0.7, ry * 0.4); C.fillStyle = al(s, 0.5); C.fill();
    if (v.stripe) { C.save(); ell(bx, by, rx, ry); C.clip(); C.strokeStyle = sh(m, -0.7); C.lineWidth = 7; for (let i = 0; i < 6; i++) { const x = bx - rx * 0.6 + i * rx * 0.28; C.beginPath(); C.moveTo(x, by - ry); C.quadraticCurveTo(x + 10, by - ry * 0.4, x + 2, by); C.stroke(); } C.restore(); }
    if (v.fur) for (let i = 0; i < 9; i++) { const x = bx - rx * 0.8 + i * rx * 0.2; tri(x, by + ry * 0.55, Math.PI / 2, 26, 22); fs(sh(m, -0.12), o, 3); }
    if (f.crystal) [[-14, -0.2], [14, 0], [42, 0.25]].forEach((p, i) => { const x = bx + p[0], y = by - ry * 0.9; glow(x, y - 16, 34, ac, 0.5); tri(x, y, -Math.PI / 2 + p[1], 34 + (i % 2) * 12, 18); fs(lg(y - 44, y, '#ffffff', ac), sh(ac, -0.5), 2.5); });
    leg(bx - rx * 0.35, 1, 0, 1); leg(bx + rx * 0.78, 3, 0, 0);
    if (v.neck) limb([bx - rx * 0.7, by - ry * 0.3, hx + 12, hy + 18], 28, m, o);
    const head = (x, y, k, dark) => {
      const mc = dark ? sh(m, -0.18) : m, r = hr * k, sn = v.sn * k;
      if (v.nemes) { poly([x - r * 1.15, y - r * 0.95, x + r * 1.0, y - r * 1.05, x + r * 1.5, y + r * 1.45, x - r * 1.3, y + r * 1.3]); fs(ac, sh(ac, -0.6), 3.5); C.strokeStyle = '#1e3a8a'; C.lineWidth = 5; for (let i = 0; i < 4; i++) { C.beginPath(); C.moveTo(x + r * 0.5 + i * 2, y - r * 0.7 + i * r * 0.55); C.lineTo(x + r * 1.3 + i * 2, y - r * 0.5 + i * r * 0.55); C.stroke(); } }
      // 耳朵
      if (v.ear === 'point') { tri(x + r * 0.5, y - r * 0.7, -1.2, r * 1.15, r * 0.75); fs(sh(mc, -0.2), o, 3.5); tri(x - r * 0.15, y - r * 0.8, -1.75, r * 1.2, r * 0.75); fs(mc, o, 3.5); }
      else if (v.ear === 'small') { tri(x + r * 0.3, y - r * 0.8, -1.3, r * 0.6, r * 0.5); fs(mc, o, 3.5); }
      else if (v.ear === 'leaf') { ell(x + r * 0.9, y - r * 0.6, r * 0.7, r * 0.3, -0.5); fs(mc, o, 3.5); }
      else if (v.ear === 'long') { ell(x + r * 0.5, y - r - 34, 10, 40, 0.28 + br * 0.03); fs(sh(mc, -0.15), o, 3.5); ell(x - r * 0.1, y - r - 36, 11, 42, -0.08 + br * 0.03); fs(mc, o, 3.5); ell(x - r * 0.1, y - r - 34, 5, 30, -0.08); C.fillStyle = al('#ffb3c7', 0.8); C.fill(); }
      else if (v.ear === 'round') { circ(x + r * 0.55, y - r * 0.75, r * 0.4); fs(sh(mc, -0.15), o, 3.5); circ(x - r * 0.15, y - r * 0.85, r * 0.42); fs(mc, o, 3.5); circ(x - r * 0.15, y - r * 0.85, r * 0.2); C.fillStyle = al(ac, 0.7); C.fill(); }
      if (v.antler) [[0.2, -1.25, 1], [-0.25, -1.9, 0]].forEach((h) => {
        const bx0 = x + r * h[0], by0 = y - r * 0.8, col = h[2] ? sh(ac, -0.15) : ac;
        const tx0 = bx0 + Math.cos(h[1]) * 66, ty0 = by0 + Math.sin(h[1]) * 66;
        if (f.crystal) glow(tx0, ty0, 44, ac, 0.45);
        limb([bx0, by0, tx0, ty0], 7, col, o);
        [0.4, 0.7].forEach((q, j) => { const px = U.lerp(bx0, tx0, q), py = U.lerp(by0, ty0, q), an = h[1] + (j ? -0.9 : 0.9); limb([px, py, px + Math.cos(an) * 26, py + Math.sin(an) * 26], 5, col, o); });
      });
      // 头
      circ(x, y, r); fs(lg(y - r, y + r, sh(mc, 0.25), sh(mc, -0.25)), o, 4.5);
      if (v.ear === 'flap') { ell(x + r * 0.6, y + r * 0.1, r * 0.6, r * 0.9, 0.2); fs(sh(mc, -0.12), o, 4); }
      if (sn > 0) {
        const sx = x - r * 0.7 - sn * 0.35, sy = y + r * 0.28;
        if (v.fang || v.saber) { const jo = a.L * 12 + a.cast * 5; ell(sx + 6, sy + r * 0.34 + jo, sn * 0.62, r * 0.22); fs(sh(mc, -0.2), o, 3.5); }
        ell(sx, sy, sn * 0.78, r * 0.48); fs(lg(sy - r * 0.5, sy + r * 0.5, sh(mc, 0.28), sh(mc, -0.12)), o, 4);
        circ(sx - sn * 0.62, sy - r * 0.12, Math.max(4, r * 0.15)); C.fillStyle = '#1d1420'; C.fill();
        if (v.fang) teeth(sx - sn * 0.5, sx + sn * 0.3, sy + r * 0.3, 9, 3);
        if (v.saber) { tri(sx - sn * 0.3, sy + r * 0.3, Math.PI / 2 + 0.1, 30, 10); fs('#fffdf2', '#5a4a4a', 2); tri(sx + sn * 0.25, sy + r * 0.3, Math.PI / 2 + 0.1, 24, 9); fs('#fffdf2', '#5a4a4a', 2); }
        if (v.buck) { rr(sx - sn * 0.55, sy + r * 0.3, 12, 13, 2); fs('#fffdf2', '#5a4a4a', 2); }
        if (v.tusk === 1) { horn(sx - 2, sy + r * 0.3, -2.0, 30, 12, 8); fs('#fffdf2', '#5a4a4a', 2.5); }
        if (v.ear === 'none' && !v.nemes) { C.beginPath(); C.moveTo(sx - sn * 0.7, sy + r * 0.1); const tf = Math.max(0, Math.sin(t * 3 + a.seed)); C.lineTo(sx - sn * 0.7 - 20 * tf, sy + r * 0.16); C.strokeStyle = '#e0486a'; C.lineWidth = 3; C.stroke(); }
      }
      if (v.nemes) { // 人面
        C.beginPath(); C.arc(x - r * 0.25, y + r * 0.42, r * 0.28, 0.1 * Math.PI, 0.9 * Math.PI); C.strokeStyle = o; C.lineWidth = 3; C.stroke();
        eye(x - r * 0.55, y - r * 0.1, r * 0.2, { blink: a.blink, iris: f.iris, brow: 1 }); eye(x + r * 0.15, y - r * 0.1, r * 0.2, { blink: a.blink, iris: f.iris, brow: -1 });
        rr(x - r * 0.42, y + r * 0.9, r * 0.35, r * 0.6, 4); fs(ac, sh(ac, -0.6), 2.5);
      } else {
        eye(x - r * 0.28, y - r * 0.18, r * 0.27, { blink: a.blink, iris: f.iris || ac, brow: 1, slit: v.saber || v.crest });
        if (a.cast > 0.3) glow(x - r * 0.28, y - r * 0.18, r * 1.1, ac, a.cast * 0.5);
      }
      if (v.trunk) { tent(x - r * 0.8, y + r * 0.1, Math.PI * 0.62 - a.L * 0.8 - a.cast * 0.5, 104, 24, mc, o, t, 0, 0.3); horn(x - r * 0.5, y + r * 0.55, 2.5, 76, 16, -26); fs('#fffdf2', '#5a4a4a', 3); horn(x - r * 0.1, y + r * 0.6, 2.4, 70, 15, -24); fs('#f1ead2', '#5a4a4a', 3); circ(x - r * 0.3, y - r * 0.5, r * 0.5); C.fillStyle = al(sh(mc, -0.2), 0.5); C.fill(); }
      if (f.horn) { glow(x - r * 0.9, y - r * 1.2, 30, ac, 0.4); horn(x - r * 0.45, y - r * 0.75, -2.15, 48, 15, 4); fs(lg(y - r - 40, y - r, '#ffffff', ac), sh(ac, -0.5), 2.5); }
    };
    if (f.heads2) head(hx + 18, hy - 34, 0.9, 1);
    head(hx, hy, 1, 0);
  };

  /* ================= 飞禽 =================
   * f.v: bat owl hawk vulture phoenix gargoyle */
  const BD = {
    bat: { bw: 34, bh: 40, head: 26, wing: 'bat', len: 122, flap: 11, ears: 1, fang: 1 },
    owl: { bw: 52, bh: 62, head: 46, wing: 'feather', len: 108, flap: 6, tuft: 1, owl: 1 },
    hawk: { bw: 40, bh: 54, head: 26, wing: 'feather', len: 142, flap: 6.5, beak: 1, crest: 1, tailfan: 1 },
    vulture: { bw: 44, bh: 56, head: 21, wing: 'feather', len: 138, flap: 4.5, beak: 1, neck: 1, ruff: 1 },
    phoenix: { bw: 40, bh: 54, head: 24, wing: 'feather', len: 152, flap: 6, beak: 1, flame: 1 },
    gargoyle: { bw: 44, bh: 58, head: 28, wing: 'bat', len: 134, flap: 5, horns: 1, arms: 1, fang: 1, tailpt: 1 },
  };
  R.bird = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = BD[f.v] || BD.bat, o = sh(m, -0.62), t = a.t;
    const fl = Math.sin(t * v.flap + a.seed), bw = v.bw, bh = v.bh, cy = -104;
    C.translate(0, -34 + Math.sin(t * v.flap * 0.5 + a.seed) * 7);
    C.rotate(-a.L * 0.2);
    if (v.flame) {
      glow(0, cy, 190, ac, 0.3);
      for (let i = 0; i < 3; i++) { tent((i - 1) * 16, cy + bh * 0.8, Math.PI / 2 + (i - 1) * 0.3, 120, 16, i === 1 ? '#ffd166' : ac, sh(ac, -0.45), t, i * 2, 0.45); }
    } else if (v.tailfan) {
      for (let i = -2; i <= 2; i++) { ell(i * 9, cy + bh + 16, 9, 30, -i * 0.22); fs(i % 2 ? s : sh(s, -0.15), o, 3); }
    } else if (v.tailpt) {
      const e = tent(8, cy + bh * 0.8, Math.PI / 2 - 0.3, 96, 10, m, o, t, 0, 0.5); tri(e[0], e[1], Math.PI / 2 - 0.3, 20, 22); fs(s, o, 3);
    } else { tri(0, cy + bh * 0.85, Math.PI / 2, 26, 26); fs(sh(m, -0.15), o, 3.5); }
    const wr = fl * 0.45 - a.cast * 0.35 + a.L * 0.3;
    const wc = v.flame ? ac : s;
    wing(v.wing, 28, cy - bh * 0.45, 1, v.len, wr, wc, m, o);
    wing(v.wing, -28, cy - bh * 0.45, -1, v.len, wr, wc, m, o);
    // 爪
    [-14, 14].forEach((x) => { for (let i = -1; i <= 1; i++) limb([x, cy + bh - 4, x + i * 7 - a.L * 10, cy + bh + 14 + a.L * 8], 4, '#f2c14e', '#5a3b12'); });
    ell(0, cy, bw, bh); fs(lg(cy - bh, cy + bh, sh(m, 0.25), sh(m, -0.28)), o, 4.5);
    ell(0, cy + bh * 0.2, bw * 0.62, bh * 0.64); C.fillStyle = al(s, v.flame ? 0.35 : 0.6); C.fill();
    if (v.owl) { C.strokeStyle = al(o, 0.5); C.lineWidth = 3; for (let r2 = 0; r2 < 3; r2++) for (let i = -1; i <= 1; i++) { C.beginPath(); C.arc(i * 18 + (r2 % 2 ? 9 : 0), cy + 8 + r2 * 16, 8, 0.1 * Math.PI, 0.9 * Math.PI); C.stroke(); } }
    if (v.arms) { limb([-bw * 0.8, cy - 12, -bw - 22, cy + 8 - a.cast * 30, -bw - 14 - a.L * 20, cy + 30 - a.cast * 50], 12, m, o); limb([bw * 0.8, cy - 12, bw + 20, cy + 8, bw + 12, cy + 30], 12, sh(m, -0.15), o); }
    let hx = v.owl ? 0 : -8, hy = cy - bh * (v.owl ? 0.72 : 1) - v.head * 0.42;
    if (v.neck) {
      hx = -40 - a.L * 20; hy = cy - bh - 34 + a.L * 20;
      limb([-6, cy - bh * 0.7, -6, cy - bh - 30, hx + 8, hy + 10], 15, ac, sh(ac, -0.6));
      for (let i = 0; i < 6; i++) { circ(-26 + i * 10, cy - bh * 0.78 + Math.abs(i - 2.5) * 3, 11); fs('#f3efe6', '#7b7466', 2.5); }
    }
    const hr = v.head, hc = v.neck ? ac : m, ho = v.neck ? sh(ac, -0.6) : o;
    if (v.ears) { tri(hx - hr * 0.55, hy - hr * 0.6, -1.9, hr * 1.25, hr * 0.8); fs(m, o, 3.5); tri(hx + hr * 0.55, hy - hr * 0.6, -1.25, hr * 1.25, hr * 0.8); fs(m, o, 3.5); }
    if (v.tuft) { tri(hx - hr * 0.6, hy - hr * 0.7, -2.0, hr * 0.7, hr * 0.5); fs(sh(m, -0.15), o, 3.5); tri(hx + hr * 0.6, hy - hr * 0.7, -1.15, hr * 0.7, hr * 0.5); fs(sh(m, -0.15), o, 3.5); }
    if (v.horns) { horn(hx - hr * 0.5, hy - hr * 0.6, -2.2, 38, 16, 8); fs(s, o, 3); horn(hx + hr * 0.5, hy - hr * 0.6, -0.95, 38, 16, -8); fs(s, o, 3); }
    if (v.crest) for (let i = 0; i < 3; i++) { ell(hx + hr * 0.5 + i * 8, hy - hr * 0.8 - i * 3, 18, 6, -0.5 - i * 0.2); fs(ac, sh(ac, -0.55), 2.5); }
    if (v.flame) for (let i = 0; i < 3; i++) flame(hx + (i - 1) * 12 + 6, hy - hr * 0.6, 18, 46 + Math.sin(t * 6 + i) * 6, t + i, i === 1 ? '#fff2a8' : ac, null);
    circ(hx, hy, hr); fs(lg(hy - hr, hy + hr, sh(hc, 0.25), sh(hc, -0.25)), ho, 4.5);
    if (v.owl) {
      [-20, 20].forEach((x, i) => { circ(hx + x, hy - 2, 21); fs(sh(s, 0.2), o, 3); eye(hx + x, hy - 2, 14, { iris: f.iris || ac, blink: a.blink, brow: i ? -1 : 1 }); });
      tri(hx, hy + 10, Math.PI / 2, 18, 14); fs('#f2a13a', '#6b3d0c', 2.5);
    } else {
      const er = hr * 0.3;
      eye(hx - hr * 0.42, hy - hr * 0.1, er, { iris: f.iris || ac, blink: a.blink, brow: 1, slit: v.fang });
      eye(hx + hr * 0.36, hy - hr * 0.1, er, { iris: f.iris || ac, blink: a.blink, brow: -1, slit: v.fang });
      if (v.beak) {
        const bo = a.L * 9 + a.cast * 5;
        C.beginPath(); C.moveTo(hx - hr * 0.6, hy + hr * 0.38); C.lineTo(hx - hr * 1.5, hy + hr * 0.6 + bo); C.lineTo(hx - hr * 0.3, hy + hr * 0.62); C.closePath(); fs('#d98a1f', '#6b3d0c', 2.5);
        C.beginPath(); C.moveTo(hx - hr * 0.75, hy + hr * 0.05); C.quadraticCurveTo(hx - hr * 1.7, hy + hr * 0.15, hx - hr * 1.75, hy + hr * 0.75); C.quadraticCurveTo(hx - hr * 1.2, hy + hr * 0.5, hx - hr * 0.2, hy + hr * 0.5); C.closePath(); fs('#f2b33a', '#6b3d0c', 2.5);
      } else if (v.fang) {
        const mo = 5 + a.L * 8 + a.cast * 4;
        ell(hx - hr * 0.1, hy + hr * 0.5, hr * 0.42, mo); fs('#3a0d1a', o, 2.5);
        teeth(hx - hr * 0.42, hx + hr * 0.22, hy + hr * 0.5 - mo * 0.6, 9, 2);
        circ(hx - hr * 0.1, hy + hr * 0.18, 3.5); C.fillStyle = o; C.fill();
      }
    }
    if (a.cast > 0.3) glow(hx - hr * 0.2, hy, hr * 1.6, ac, a.cast * 0.35);
  };
})();
