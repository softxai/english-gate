/* English Gate · 怪兽骨架 C：魔眼、元素、器物、骷髅头、触手、巨龙 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2, sh = U.shade, al = U.rgba;
  const K = EG.CK, R = EG.Creatures.R;
  const { fs, lg, rg, ell, circ, poly, rr, tri, horn, limb, shine, glow, eye, eyes, teeth, star, crown, flame, leaf, tent, wing, spline } = K;

  /* ================= 魔眼 =================
   * f: tent(触手数) vines mini(小眼数) flames wings crown boss */
  R.eye = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.62), t = a.t;
    const R0 = f.boss ? 74 : 60, cy = -112;
    C.translate(0, -28 + Math.sin(t * 1.8 + a.seed) * 8);
    C.translate(-a.L * 10, 0);
    if (f.boss) { // 环绕符文
      glow(0, cy, 230, ac, 0.2 + a.cast * 0.25);
      for (let i = 0; i < 8; i++) { const an = t * 0.6 + (i / 8) * TAU, x = Math.cos(an) * 138, y = cy + Math.sin(an) * 50; if (Math.sin(an) < 0) { glow(x, y, 20, ac, 0.7); star(x, y, 8, 4, 0.4, an); C.fillStyle = ac; C.fill(); } }
    }
    const n = f.tent || 0;
    for (let i = 0; i < n; i++) {
      const q = i - (n - 1) / 2, an = Math.PI * 0.5 + q * (f.boss ? 0.34 : 0.42);
      tent(Math.cos(an) * R0 * 0.8, cy + Math.sin(an) * R0 * 0.8, an + q * 0.1 - a.L * 0.3, (f.boss ? 110 : 84) + (i % 2) * 26, f.boss ? 17 : 13, i % 2 ? sh(m, -0.12) : m, o, t, i * 1.3, 0.55);
      if (f.vines) K._pts.forEach((p, j) => { if (j % 3 === 1) { leaf(p[0], p[1], j + i, 20, 12); fs(s, sh(s, -0.6), 2.5); } });
    }
    if (f.wings) { const fl = Math.sin(t * 7) * 0.4; wing('bat', R0 * 0.7, cy - 20, 1, 100, fl, sh(m, -0.1), m, o); wing('bat', -R0 * 0.7, cy - 20, -1, 100, fl, sh(m, -0.1), m, o); }
    if (f.flames) for (let i = 0; i < 7; i++) { const an = -Math.PI * (0.08 + i * 0.14); C.save(); C.translate(Math.cos(an) * R0, cy + Math.sin(an) * R0); C.rotate(an + Math.PI / 2); flame(0, 6, 30, 58 + Math.sin(t * 7 + i) * 10, t + i, i % 2 ? '#ffd166' : ac, null); C.restore(); }
    const me = f.mini || 0;
    for (let i = 0; i < me; i++) {
      const q = i - (me - 1) / 2, an = -Math.PI / 2 + q * 0.5;
      const e = tent(Math.cos(an) * R0 * 0.9, cy + Math.sin(an) * R0 * 0.9, an, 50 + (i % 2) * 14, 9, m, o, t, i * 2, 0.4);
      circ(e[0], e[1], 13); fs(m, o, 3); eye(e[0], e[1], 9.5, { iris: ac, blink: a.blink });
    }
    if (f.boss) for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU + 0.2; tri(Math.cos(an) * (R0 + 6), cy + Math.sin(an) * (R0 + 6), an, 26 + (i % 2) * 10, 22); fs(s, o, 3); }
    circ(0, cy, R0 + 10); fs(lg(cy - R0, cy + R0, sh(m, 0.25), sh(m, -0.3)), o, 4.5);
    circ(-4, cy, R0 - 6); fs(rg(-14, cy - 14, R0, '#ffffff', '#f1d3d6'), sh(m, -0.7), 3);
    C.strokeStyle = al('#d0425a', 0.5); C.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const an = (i / 7) * TAU + 0.4, r1 = R0 - 8; C.beginPath(); C.moveTo(-4 + Math.cos(an) * r1, cy + Math.sin(an) * r1); C.quadraticCurveTo(-4 + Math.cos(an + 0.3) * R0 * 0.7, cy + Math.sin(an + 0.3) * R0 * 0.7, -4 + Math.cos(an + 0.1) * R0 * 0.52, cy + Math.sin(an + 0.1) * R0 * 0.52); C.stroke(); }
    const ix = -14 - a.cast * 4 + Math.sin(t * 0.8) * 3, iy = cy + 4 + Math.cos(t * 0.6) * 3, ir = R0 * 0.48;
    circ(ix, iy, ir); fs(rg(ix, iy, ir, sh(ac, 0.4), sh(ac, -0.45)), sh(ac, -0.7), 3);
    C.strokeStyle = al(sh(ac, -0.5), 0.6); C.lineWidth = 1.5; for (let i = 0; i < 14; i++) { const an = (i / 14) * TAU; C.beginPath(); C.moveTo(ix + Math.cos(an) * ir * 0.45, iy + Math.sin(an) * ir * 0.45); C.lineTo(ix + Math.cos(an) * ir * 0.92, iy + Math.sin(an) * ir * 0.92); C.stroke(); }
    ell(ix, iy, ir * (0.42 - a.cast * 0.27), ir * 0.74); C.fillStyle = '#07030d'; C.fill();
    if (a.cast > 0.05) glow(ix, iy, ir * 2.6, ac, a.cast * 0.75);
    shine(ix - ir * 0.4, iy - ir * 0.45, ir * 0.22, ir * 0.14, -0.5, 0.9);
    const lid = a.blink * 0.9 + a.hurt * 0.4, RR = R0 + 12;
    C.save(); circ(0, cy, R0 + 10); C.clip();
    C.fillStyle = lg(cy - RR, cy, sh(m, 0.15), sh(m, -0.1));
    poly([-RR, cy - RR, RR, cy - RR, RR, cy - RR + RR * (0.5 + lid * 0.55), -RR, cy - RR + RR * (0.22 + lid * 0.8)]); C.fill(); C.strokeStyle = o; C.lineWidth = 4; C.stroke();
    C.fillStyle = sh(m, -0.2);
    poly([-RR, cy + RR, RR, cy + RR, RR, cy + RR - RR * (0.2 + lid * 0.8), -RR, cy + RR - RR * (0.16 + lid * 0.8)]); C.fill(); C.stroke();
    C.restore();
    circ(0, cy, R0 + 10); fs(null, o, 4.5);
    if (f.boss) for (let i = 0; i < 8; i++) { const an = t * 0.6 + (i / 8) * TAU, x = Math.cos(an) * 138, y = cy + Math.sin(an) * 50; if (Math.sin(an) >= 0) { glow(x, y, 22, ac, 0.8); star(x, y, 9, 4, 0.4, an); C.fillStyle = '#fff'; C.fill(); } }
    if (f.crown) crown(0, cy - R0 - 4, f.boss ? 76 : 54, '#ffd24a');
  };

  /* ================= 元素 =================
   * f.v: flame crystal tornado star rock chaos blizzard */
  R.elemental = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = f.v || 'flame', o = sh(m, -0.6), t = a.t;
    const br = Math.sin(t * 2.2 + a.seed);
    if (v === 'flame') {
      C.translate(-a.L * 10, -8 + br * 3);
      glow(0, -100, 180, m, 0.45 + a.cast * 0.2);
      C.save(); C.translate(-58, -64 - a.cast * 30); C.rotate(-0.7 - a.L * 0.6); flame(0, 10, 36, 78, t + 1, m, sh(m, -0.4)); C.restore();
      C.save(); C.translate(58, -64); C.rotate(0.7); flame(0, 10, 36, 70, t + 2, m, sh(m, -0.4)); C.restore();
      flame(0, 0, 150, 214 + Math.sin(t * 5) * 10, t, sh(m, -0.12), sh(m, -0.55));
      flame(0, -4, 110, 164 + Math.sin(t * 6 + 1) * 8, t + 0.7, m, null);
      flame(0, -8, 70, 112 + Math.sin(t * 7) * 6, t + 1.3, ac, null);
      flame(0, -10, 36, 60, t + 2, '#fffbe0', null);
      [[-26, 1], [14, -1]].forEach((p) => { poly([p[0] - 14, -92 - p[1] * 6, p[0] + 13, -92 + p[1] * 6, p[0] + 9, -76, p[0] - 9, -76]); fs('#fffbe0', sh(m, -0.6), 2.5); circ(p[0] - 2, -83, 3.5); C.fillStyle = sh(m, -0.7); C.fill(); });
      const mo = 6 + a.L * 12 + a.cast * 6;
      poly([-26, -58, -16, -52, -6, -58, 4, -52, 14, -58, 8, -58 + mo, -18, -58 + mo]); fs('#fffbe0', sh(m, -0.6), 2.5);
      return;
    }
    if (v === 'crystal') {
      C.translate(-a.L * 10, -22 + br * 6);
      glow(0, -116, 170, ac, 0.3 + a.cast * 0.3);
      const shard = (i, back) => { const an = t * 1.1 + (i / 5) * TAU, z = Math.sin(an); if ((z < 0) !== back) return; const x = Math.cos(an) * 92, y = -112 + z * 28 + Math.sin(t * 2 + i) * 6, k = 0.8 + z * 0.2; poly([x, y - 26 * k, x + 10 * k, y, x, y + 22 * k, x - 10 * k, y]); fs(lg(y - 26, y + 22, '#ffffff', i % 2 ? m : s), o, 2.5); };
      for (let i = 0; i < 5; i++) shard(i, true);
      const top = [0, -206], bot = [0, -30], L1 = [-44, -158], L2 = [-44, -82], R1 = [44, -158], R2 = [44, -82];
      poly([top[0], top[1], R1[0], R1[1], R2[0], R2[1], bot[0], bot[1], L2[0], L2[1], L1[0], L1[1]]); fs(lg(-206, -30, sh(m, 0.45), sh(m, -0.2)), o, 4.5);
      poly([top[0], top[1], 0, -150, 0, -88, bot[0], bot[1], L2[0], L2[1], L1[0], L1[1]]); C.fillStyle = al('#ffffff', 0.25); C.fill();
      C.strokeStyle = al('#ffffff', 0.7); C.lineWidth = 2.5; C.beginPath(); C.moveTo(top[0], top[1]); C.lineTo(0, -150); C.lineTo(0, -88); C.lineTo(bot[0], bot[1]); C.moveTo(L1[0], L1[1]); C.lineTo(0, -150); C.lineTo(R1[0], R1[1]); C.moveTo(L2[0], L2[1]); C.lineTo(0, -88); C.lineTo(R2[0], R2[1]); C.stroke();
      glow(-6, -120, 46, ac, 0.7 + a.cast * 0.3);
      eye(-18, -124, 9, { glow: ac }); eye(10, -124, 9, { glow: ac });
      C.beginPath(); C.moveTo(-28, -140); C.lineTo(-10, -134); C.moveTo(20, -140); C.lineTo(4, -134); C.strokeStyle = sh(ac, -0.6); C.lineWidth = 3.5; C.stroke();
      for (let i = 0; i < 5; i++) shard(i, false);
      return;
    }
    if (v === 'tornado') {
      C.translate(-a.L * 14, 0);
      const lean = Math.sin(t * 1.6) * 10;
      for (let i = 0; i < 11; i++) {
        const q = i / 10, y = -8 - q * 196, rx = 18 + q * 74 + Math.sin(t * 5 + i) * 4, x = lean * q + Math.sin(t * 3 + i * 0.8) * 8 * q;
        ell(x, y, rx, rx * 0.26); fs(al(i % 2 ? m : s, 0.55), al(o, 0.5), 2.5);
        C.beginPath(); C.ellipse(x, y, rx, rx * 0.26, 0, t * 6 + i, t * 6 + i + 2.2); C.strokeStyle = al('#ffffff', 0.7); C.lineWidth = 3; C.stroke();
      }
      for (let i = 0; i < 6; i++) { const an = t * 4 + i * 1.1, q = (i * 0.17 + t * 0.2) % 1, rx = 26 + q * 80; rr(Math.cos(an) * rx - 5 + lean * q, -8 - q * 196 + Math.sin(an) * rx * 0.26 - 5, 10, 10, 2); fs(ac, sh(ac, -0.5), 2); }
      glow(lean * 0.7, -150, 60, ac, 0.3 + a.cast * 0.5);
      eye(-20 + lean * 0.7, -150, 10, { glow: ac }); eye(12 + lean * 0.7, -150, 10, { glow: ac });
      C.beginPath(); C.moveTo(-34 + lean * 0.7, -168); C.lineTo(-12 + lean * 0.7, -160); C.moveTo(26 + lean * 0.7, -168); C.lineTo(6 + lean * 0.7, -160); C.strokeStyle = o; C.lineWidth = 4; C.stroke();
      return;
    }
    if (v === 'star') {
      C.translate(-a.L * 12, -30 + br * 8);
      glow(0, -110, 190, ac, 0.35 + a.cast * 0.3);
      for (let i = 0; i < 6; i++) { const an = t * 1.3 + (i / 6) * TAU; star(Math.cos(an) * 104, -110 + Math.sin(an) * 40, 9 + Math.sin(t * 4 + i) * 3, 4, 0.35, an); C.fillStyle = al('#ffffff', 0.9); C.fill(); }
      C.save(); C.translate(0, -110); C.rotate(Math.sin(t * 0.9) * 0.15 - a.L * 0.5);
      star(0, 0, 92 + a.cast * 8, 5, 0.52, 0); fs(rg(-14, -18, 100, '#ffffff', m), o, 4.5);
      star(0, 0, 52, 5, 0.52, 0); C.fillStyle = al(ac, 0.45); C.fill();
      eyes(-6, -6, 38, 11, { iris: f.iris || '#2a1a55', blink: a.blink, angry: 1 });
      const mo = a.L * 8 + a.cast * 4;
      ell(-6, 20, 10, 5 + mo); fs('#2a0714', o, 2.5);
      C.restore();
      return;
    }
    if (v === 'rock') {
      C.translate(-a.L * 12, -26 + br * 6);
      glow(0, -106, 130, ac, 0.3 + a.cast * 0.3);
      const chunk = (x, y, r, sd) => { C.beginPath(); for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU, rr2 = r * (0.78 + 0.3 * Math.abs(Math.sin(i * 2.3 + sd))); i ? C.lineTo(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2) : C.moveTo(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2); } C.closePath(); fs(lg(y - r, y + r, sh(m, 0.25), sh(m, -0.3)), o, 4); };
      for (let i = 0; i < 4; i++) { const an = t * 1.2 + (i / 4) * TAU; if (Math.sin(an) < 0) chunk(Math.cos(an) * 90, -106 + Math.sin(an) * 30, 18, i); }
      chunk(0, -106, 62, 1);
      C.strokeStyle = ac; C.lineWidth = 4; C.globalAlpha = 0.8 + br * 0.2; [[-40, -130, -14, -112, -30, -84], [30, -140, 16, -110, 36, -86], [-6, -70, 4, -58]].forEach((q) => { C.beginPath(); C.moveTo(q[0], q[1]); for (let i = 2; i < q.length; i += 2) C.lineTo(q[i], q[i + 1]); C.stroke(); }); C.globalAlpha = 1;
      [[-22, 1], [12, -1]].forEach((p) => { glow(p[0], -118, 22, ac, 0.9); poly([p[0] - 10, -124 - p[1] * 4, p[0] + 10, -124 + p[1] * 4, p[0] + 7, -112, p[0] - 7, -112]); C.fillStyle = '#fff2a8'; C.fill(); });
      poly([-20, -94, -10, -88, 0, -94, 10, -88, 6, -82 + a.L * 8, -16, -82 + a.L * 8]); fs('#fff2a8', o, 2);
      for (let i = 0; i < 4; i++) { const an = t * 1.2 + (i / 4) * TAU; if (Math.sin(an) >= 0) chunk(Math.cos(an) * 90, -106 + Math.sin(an) * 30, 20, i); }
      return;
    }
    if (v === 'chaos') {
      C.translate(-a.L * 12, -24 + br * 6);
      glow(0, -110, 190, ac, 0.3 + a.cast * 0.3);
      [[0, 'tri'], [2.1, 'sq'], [4.2, 'circ']].forEach((q, i) => { const an = t * 1.4 + q[0], x = Math.cos(an) * 106, y = -110 + Math.sin(an) * 44; C.save(); C.translate(x, y); C.rotate(t * 2 + i); if (q[1] === 'tri') poly([0, -14, 13, 10, -13, 10]); else if (q[1] === 'sq') C.beginPath(), C.rect(-11, -11, 22, 22); else circ(0, 0, 12); fs(null, [ac, s, '#ffffff'][i], 4); C.restore(); });
      C.beginPath();
      for (let i = 0; i <= 40; i++) { const an = (i / 40) * TAU, r = 66 + Math.sin(an * 3 + t * 2.4) * 10 + Math.sin(an * 5 - t * 3.1) * 7 + Math.sin(an * 2 + t * 1.3) * 8; const x = Math.cos(an) * r, y = -110 + Math.sin(an) * r; i ? C.lineTo(x, y) : C.moveTo(x, y); }
      C.closePath();
      const g = C.createLinearGradient(-70 * Math.cos(t), -110 - 70 * Math.sin(t), 70 * Math.cos(t), -110 + 70 * Math.sin(t)); g.addColorStop(0, m); g.addColorStop(0.5, s); g.addColorStop(1, ac);
      fs(g, o, 4.5);
      [[-26, -122, 21], [18, -104, 15], [-10, -80, 11], [24, -140, 10]].forEach((e, i) => eye(e[0] + Math.sin(t * 2 + i) * 3, e[1] + Math.cos(t * 1.7 + i) * 3, e[2], { iris: [ac, m, s, ac][i], blink: ((t * 0.7 + i * 0.9) % 3) < 0.12 ? 1 : 0, slit: i % 2 }));
      return;
    }
    // blizzard
    C.translate(-a.L * 12, -30 + br * 6);
    glow(0, -116, 180, ac, 0.25 + a.cast * 0.3);
    for (let i = 0; i < 4; i++) { C.beginPath(); C.ellipse(0, -60 + i * 8, 80 - i * 14, 20 - i * 3, 0, t * 5 + i * 1.5, t * 5 + i * 1.5 + 3.6); C.strokeStyle = al('#ffffff', 0.7 - i * 0.12); C.lineWidth = 5 - i; C.stroke(); }
    C.save(); C.translate(-74, -100 - a.cast * 26); C.rotate(0.9 + a.L * 0.8); tri(0, 0, Math.PI / 2, 60, 22); fs(lg(0, 60, '#ffffff', s), sh(s, -0.55), 3); C.restore();
    C.save(); C.translate(74, -100); C.rotate(-0.9); tri(0, 0, Math.PI / 2, 54, 22); fs(lg(0, 54, '#ffffff', s), sh(s, -0.55), 3); C.restore();
    [-44, -16, 14, 42].forEach((x, i) => { tri(x, -164 + Math.abs(i - 1.5) * 8, -Math.PI / 2 + (i - 1.5) * 0.16, 44 - Math.abs(i - 1.5) * 8, 22); fs(lg(-210, -164, '#ffffff', s), sh(s, -0.55), 3); });
    [[-50, -104, 40], [50, -104, 40], [0, -84, 46], [-26, -138, 44], [28, -138, 44], [0, -116, 50]].forEach((b) => { const x = b[0] + Math.sin(t * 2 + b[0]) * 3; circ(x, b[1], b[2]); fs(rg(x - 10, b[1] - 14, b[2] * 1.3, '#ffffff', m), null); });
    C.strokeStyle = al(o, 0.5); C.lineWidth = 3; C.beginPath(); C.arc(-50, -104, 40, 0.7 * Math.PI, 1.5 * Math.PI); C.stroke(); C.beginPath(); C.arc(50, -104, 40, 1.5 * Math.PI, 0.3 * Math.PI); C.stroke(); C.beginPath(); C.arc(0, -84, 46, 0.2 * Math.PI, 0.8 * Math.PI); C.stroke();
    eye(-22, -122, 10, { glow: ac }); eye(14, -122, 10, { glow: ac });
    C.beginPath(); C.moveTo(-38, -142); C.lineTo(-12, -132); C.moveTo(30, -142); C.lineTo(6, -132); C.strokeStyle = sh(ac, -0.55); C.lineWidth = 4.5; C.stroke();
    ell(-6, -96, 9 + a.L * 4, 6 + a.L * 8 + a.cast * 5); fs(sh(ac, -0.6), null);
  };

  /* ================= 器物 =================
   * f.v: chest book mask crystal orb */
  R.object = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = f.v || 'chest', o = sh(m, -0.65), t = a.t;
    const br = Math.sin(t * 2.2 + a.seed);
    if (v === 'chest') {
      const hop = Math.max(0, Math.sin(t * 3 + a.seed)) * 5 + a.L * 14;
      C.translate(-a.L * 12, -hop);
      const open = 0.22 + 0.16 * Math.abs(Math.sin(t * 2.6)) + a.L * 0.55 + a.cast * 0.28;
      rr(-74, -74, 148, 74, 9); fs(lg(-74, 0, sh(m, 0.15), sh(m, -0.3)), o, 4.5);
      rr(-66, -68, 132, 30, 4); C.fillStyle = '#1c0710'; C.fill();
      C.save(); C.translate(-30 - a.L * 30, -62); C.rotate(-0.2 + Math.sin(t * 5) * 0.08); C.beginPath(); C.moveTo(30, 0); C.quadraticCurveTo(-10, -6, -44, 22 + a.L * 14); C.quadraticCurveTo(-52, 36, -34, 38); C.quadraticCurveTo(0, 20, 34, 16); C.closePath(); fs('#e0486a', '#7a1c34', 3); C.restore();
      teeth(-64, 64, -42, -18, 8);
      [-74, 54].forEach((x) => { rr(x, -74, 20, 74, 4); fs(lg(-74, 0, sh(s, 0.3), sh(s, -0.25)), sh(s, -0.65), 3.5); });
      C.save(); C.translate(74, -72); C.rotate(open); C.translate(-74, 0);
      C.beginPath(); C.moveTo(-76, 0); C.lineTo(-76, -30); C.quadraticCurveTo(-70, -64, 0, -64); C.quadraticCurveTo(70, -64, 76, -30); C.lineTo(76, 0); C.closePath(); fs(lg(-64, 0, sh(m, 0.3), sh(m, -0.12)), o, 4.5);
      [-76, 54].forEach((x) => { C.beginPath(); C.moveTo(x, 0); C.lineTo(x, -34); C.quadraticCurveTo(x + 4, -56, x + 22, -60); C.lineTo(x + 22, 0); C.closePath(); fs(lg(-64, 0, sh(s, 0.35), sh(s, -0.2)), sh(s, -0.65), 3.5); });
      teeth(-64, 64, 0, 18, 8);
      eye(-34, -34, 12, { iris: f.iris || ac, blink: a.blink, brow: 1, slit: 1 }); eye(8, -34, 12, { iris: f.iris || ac, blink: a.blink, brow: -1, slit: 1 });
      rr(-12, -12, 24, 22, 4); fs(sh(s, 0.2), sh(s, -0.65), 3);
      C.restore();
      if (a.cast > 0.2) glow(0, -60, 110, ac, a.cast * 0.4);
      return;
    }
    if (v === 'book') {
      C.translate(-a.L * 12, -44 + br * 8); C.rotate(Math.sin(t * 1.4) * 0.05 - a.L * 0.15);
      const fl = Math.sin(t * 5 + a.seed) * 12 + a.cast * 14;
      glow(0, -120, 170, ac, 0.25 + a.cast * 0.35);
      const e = tent(0, -80, Math.PI / 2 + 0.2, 70, 9, ac, sh(ac, -0.6), t, 0, 0.5);
      tri(e[0], e[1], Math.PI / 2, 14, 12); fs(ac, sh(ac, -0.6), 2);
      [-1, 1].forEach((sd) => {
        poly([0, -82, sd * 98, -112 - fl, sd * 98, -186 - fl, 0, -156]); fs(lg(-190, -82, sh(m, 0.2), sh(m, -0.3)), o, 4.5);
        for (let k = 0; k < 3; k++) { poly([0, -88, sd * (90 - k * 6), -116 - fl * (1 - k * 0.15) + k * 3, sd * (90 - k * 6), -182 - fl * (1 - k * 0.15) + k * 3, 0, -154]); fs(k === 2 ? '#fbf3dc' : '#e9dcba', '#8a7a55', 2); }
        C.strokeStyle = al('#6b5a3a', 0.55); C.lineWidth = 2;
        for (let k = 0; k < 4; k++) { C.beginPath(); C.moveTo(sd * 14, -146 + k * 13); C.lineTo(sd * 70, -166 - fl * 0.7 + k * 13); C.stroke(); }
        tri(sd * 92, -114 - fl, Math.PI / 2, 14, 12); fs(s, sh(s, -0.6), 2);
      });
      rr(-9, -160, 18, 80, 5); fs(lg(-160, -80, sh(m, 0.1), sh(m, -0.35)), o, 4);
      circ(0, -120, 22); fs(m, o, 4); eye(0, -120, 16, { iris: f.iris || ac, blink: a.blink, slit: 1 });
      for (let i = 0; i < 4; i++) { const q = (t * 0.4 + i * 0.25) % 1, x = -60 + i * 40 + Math.sin(t * 2 + i) * 8, y = -186 - q * 70; C.save(); C.globalAlpha = (1 - q) * 0.9; C.translate(x, y); C.rotate(i); C.strokeStyle = ac; C.lineWidth = 3; C.beginPath(); C.moveTo(-6, -8); C.lineTo(6, -8); C.lineTo(-4, 8); C.lineTo(6, 8); C.moveTo(0, -8); C.lineTo(0, 2); C.stroke(); C.restore(); }
      return;
    }
    if (v === 'mask') {
      C.translate(-a.L * 14, -30 + br * 8); C.rotate(Math.sin(t * 1.3) * 0.06);
      glow(0, -120, 180, ac, 0.25 + a.cast * 0.35);
      for (let i = 0; i < 3; i++) { const an = t * 1.5 + (i / 3) * TAU; if (Math.sin(an) < 0) { const x = Math.cos(an) * 104, y = -110 + Math.sin(an) * 36; poly([x, y - 16, x + 8, y, x, y + 16, x - 8, y]); fs(ac, sh(ac, -0.5), 2); } }
      for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.34; leaf(Math.cos(an) * 30, -186 + Math.abs(i - 2) * 6, an + Math.sin(t * 2 + i) * 0.05, 64 - Math.abs(i - 2) * 8, 26); fs(i % 2 ? s : ac, o, 3.5); }
      horn(-52, -160, Math.PI + 0.5, 46, 20, -12); fs(s, o, 3.5); horn(52, -160, -0.5, 46, 20, 12); fs(s, o, 3.5);
      C.beginPath(); C.moveTo(-54, -190); C.lineTo(54, -190); C.bezierCurveTo(66, -120, 40, -60, 0, -34); C.bezierCurveTo(-40, -60, -66, -120, -54, -190); C.closePath(); fs(lg(-190, -34, sh(m, 0.28), sh(m, -0.28)), o, 4.5);
      C.strokeStyle = s; C.lineWidth = 5; C.beginPath(); C.moveTo(0, -188); C.lineTo(0, -150); C.moveTo(-40, -112); C.lineTo(-24, -92); C.lineTo(-40, -80); C.moveTo(40, -112); C.lineTo(24, -92); C.lineTo(40, -80); C.stroke();
      [[-24, 1], [24, -1]].forEach((p) => { poly([p[0] - 18, -150 - p[1] * 8, p[0] + 18, -150 + p[1] * 8, p[0] + 12, -128, p[0] - 12, -128]); fs('#0b0812', o, 3); glow(p[0], -138, 26, ac, 0.9); ell(p[0], -138, 5 + a.cast * 3, 7 + a.cast * 3); C.fillStyle = ac; C.fill(); });
      const mo = a.L * 12 + a.cast * 6;
      rr(-26, -86, 52, 20 + mo, 6); fs('#0b0812', o, 3); teeth(-22, 22, -86, 8, 5); teeth(-22, 22, -66 + mo, -8, 5);
      shine(-30, -172, 14, 6, -0.3, 0.3);
      for (let i = 0; i < 3; i++) { const an = t * 1.5 + (i / 3) * TAU; if (Math.sin(an) >= 0) { const x = Math.cos(an) * 104, y = -110 + Math.sin(an) * 36; poly([x, y - 16, x + 8, y, x, y + 16, x - 8, y]); fs(ac, sh(ac, -0.5), 2); } }
      return;
    }
    if (v === 'crystal') { // 棱镜
      C.translate(-a.L * 14, -26 + br * 8); C.rotate(Math.sin(t * 1.1) * 0.08);
      glow(0, -116, 190, '#ffffff', 0.18 + a.cast * 0.3);
      C.save(); C.globalCompositeOperation = 'lighter';
      [[ac, -0.5], [s, -0.25], ['#fff2a8', 0]].forEach((q, i) => { const an = Math.PI + q[1] + Math.sin(t + i) * 0.1; C.beginPath(); C.moveTo(-20, -116); C.lineTo(-20 + Math.cos(an - 0.05) * 170, -116 + Math.sin(an - 0.05) * 170); C.lineTo(-20 + Math.cos(an + 0.05) * 170, -116 + Math.sin(an + 0.05) * 170); C.closePath(); C.fillStyle = al(q[0], 0.3 + a.cast * 0.35); C.fill(); });
      C.restore();
      const T = [0, -206], B = [0, -28], Lp = [-58, -118], Rp = [58, -118], Cp = [Math.sin(t * 0.8) * 16, -104];
      poly([T[0], T[1], Lp[0], Lp[1], Cp[0], Cp[1]]); fs(lg(-206, -104, '#ffffff', sh(m, 0.2)), o, 3);
      poly([T[0], T[1], Cp[0], Cp[1], Rp[0], Rp[1]]); fs(lg(-206, -104, sh(m, 0.3), sh(m, -0.1)), o, 3);
      poly([Lp[0], Lp[1], Cp[0], Cp[1], B[0], B[1]]); fs(lg(-118, -28, sh(s, 0.2), sh(s, -0.2)), o, 3);
      poly([Cp[0], Cp[1], Rp[0], Rp[1], B[0], B[1]]); fs(lg(-118, -28, sh(ac, 0.1), sh(ac, -0.35)), o, 3);
      poly([T[0], T[1], Rp[0], Rp[1], B[0], B[1], Lp[0], Lp[1]]); fs(null, o, 4.5);
      glow(Cp[0], -124, 40, '#ffffff', 0.5 + a.cast * 0.4);
      eye(Cp[0] - 2, -132, 14, { iris: f.iris || sh(ac, -0.3), blink: a.blink, slit: 1 });
      for (let i = 0; i < 4; i++) { const an = t * 1.3 + (i / 4) * TAU, x = Math.cos(an) * 96, y = -116 + Math.sin(an) * 30; star(x, y, 8, 4, 0.35, an); C.fillStyle = [ac, s, '#ffffff', m][i]; C.fill(); }
      return;
    }
    // orb 熔核
    C.translate(-a.L * 14, -30 + br * 8);
    glow(0, -112, 180, ac, 0.3 + a.cast * 0.35);
    const ring = (rot, rx, ry, back) => { C.save(); C.translate(0, -112); C.rotate(rot); C.beginPath(); C.ellipse(0, 0, rx, ry, 0, back ? Math.PI : 0, back ? TAU : Math.PI); C.strokeStyle = o; C.lineWidth = 11; C.stroke(); C.strokeStyle = lg(-ry, ry, sh(s, 0.4), sh(s, -0.2)); C.lineWidth = 6; C.stroke(); C.restore(); };
    ring(0.5 + Math.sin(t * 0.9) * 0.3, 92, 26, true); ring(-0.6 + Math.cos(t * 0.7) * 0.3, 86, 22, true);
    circ(0, -112, 58); fs(rg(-18, -132, 80, sh(m, 0.4), sh(m, -0.4)), o, 4.5);
    C.save(); circ(0, -112, 56); C.clip(); C.strokeStyle = ac; C.lineWidth = 4.5; C.globalAlpha = 0.8 + br * 0.2;
    [[-56, -130, -30, -120, -34, -96, -56, -84], [10, -170, 20, -146, 44, -138], [-10, -56, 4, -74, 30, -70, 46, -90], [-20, -168, -14, -150]].forEach((q) => { C.beginPath(); C.moveTo(q[0], q[1]); for (let i = 2; i < q.length; i += 2) C.lineTo(q[i], q[i + 1]); C.stroke(); });
    C.restore();
    glow(-6, -112, 50 + a.cast * 20, ac, 0.8); circ(-6, -112, 22); fs(rg(-10, -116, 24, '#ffffff', ac), sh(ac, -0.6), 3.5);
    ell(-8, -112, 6 - a.cast * 3, 15); C.fillStyle = '#12060f'; C.fill();
    shine(-26, -146, 14, 7, -0.6, 0.4);
    ring(0.5 + Math.sin(t * 0.9) * 0.3, 92, 26, false); ring(-0.6 + Math.cos(t * 0.7) * 0.3, 86, 22, false);
  };

  /* ================= 骷髅头 =================
   * f: horns crown */
  R.skull = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.65), t = a.t, cy = -112;
    C.translate(-a.L * 16, -32 + Math.sin(t * 2.2 + a.seed) * 7); C.rotate(Math.sin(t * 1.5) * 0.05 - a.L * 0.18);
    glow(0, cy - 20, 170, s, 0.4 + a.cast * 0.2);
    for (let i = 0; i < 5; i++) { const x = -60 + i * 30, k = Math.abs(i - 2); flame(x, cy + 6 + k * 8, 50, 118 + Math.sin(t * 6 + i) * 14 - k * 16, t + i, al(s, 0.9), null); }
    for (let i = 0; i < 3; i++) flame(-26 + i * 26, cy - 10, 30, 78 + Math.sin(t * 7 + i) * 8, t + i + 3, al(ac, 0.9), null);
    if (f.horns) { horn(-46, cy - 34, -2.3, 64, 26, 12); fs(lg(cy - 100, cy - 30, sh(m, -0.1), sh(m, -0.45)), o, 4); horn(46, cy - 34, -0.85, 64, 26, -12); fs(lg(cy - 100, cy - 30, sh(m, -0.1), sh(m, -0.45)), o, 4); }
    const jo = 6 + Math.abs(Math.sin(t * 5)) * 4 * (1 + a.cast) + a.L * 20;
    rr(-32, cy + 28 + jo, 64, 30, 11); fs(lg(cy + 28, cy + 70, m, sh(m, -0.28)), o, 4); teeth(-26, 26, cy + 28 + jo, 9, 5);
    C.beginPath(); C.moveTo(-58, cy - 6); C.bezierCurveTo(-62, cy - 80, 62, cy - 80, 58, cy - 6); C.bezierCurveTo(58, cy + 22, 42, cy + 26, 36, cy + 42); C.lineTo(-36, cy + 42); C.bezierCurveTo(-42, cy + 26, -58, cy + 22, -58, cy - 6); C.closePath();
    fs(lg(cy - 70, cy + 42, sh(m, 0.22), sh(m, -0.25)), o, 4.5);
    teeth(-30, 30, cy + 42, 11, 6);
    [[-26, 1], [20, -1]].forEach((p) => { C.beginPath(); C.ellipse(p[0], cy - 2, 18, 21, p[1] * 0.2, 0, TAU); fs('#12060f', o, 3); glow(p[0] - 3, cy, 26, ac, 0.7 + a.cast * 0.3); circ(p[0] - 3, cy, 6 + a.cast * 3); C.fillStyle = ac; C.fill(); });
    poly([-4, cy + 14, -12, cy + 30, 4, cy + 30]); C.fillStyle = '#12060f'; C.fill();
    C.strokeStyle = al(o, 0.55); C.lineWidth = 2.5; C.beginPath(); C.moveTo(14, cy - 62); C.lineTo(22, cy - 44); C.lineTo(12, cy - 36); C.lineTo(20, cy - 26); C.stroke();
    shine(-28, cy - 52, 16, 7, -0.4, 0.35);
    if (f.crown) crown(0, cy - 60, 62, '#ffd24a');
  };

  /* ================= 触手 =================
   * f.v: jelly horror eater */
  R.tentacle = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = f.v || 'jelly', o = sh(m, -0.6), t = a.t;
    const br = Math.sin(t * 2 + a.seed);
    if (v === 'jelly') {
      const pulse = Math.sin(t * 2.6 + a.seed), cy = -124;
      C.translate(-a.L * 12, -30 + br * 10);
      glow(0, cy - 20, 170, ac, 0.3 + a.cast * 0.3);
      for (let i = 0; i < 7; i++) tent(-54 + i * 18, cy + 4, Math.PI / 2 - (i - 3) * 0.1 + a.L * 0.3, 96 + (i % 3) * 16, 5, i % 2 ? s : ac, null, t, i * 1.1, 0.5, 10);
      for (let i = 0; i < 3; i++) tent(-22 + i * 22, cy + 4, Math.PI / 2 - (i - 1) * 0.12 + a.L * 0.3, 70, 13, al(ac, 0.75), null, t, i * 2 + 1, 0.7, 10);
      const w = 76 + pulse * 6, h = 86 - pulse * 5;
      C.save(); C.globalAlpha = 0.9;
      C.beginPath(); C.moveTo(-w, cy); C.bezierCurveTo(-w * 1.05, cy - h * 1.3, w * 1.05, cy - h * 1.3, w, cy);
      for (let i = 0; i < 5; i++) { const x1 = w - (i + 1) * (w * 2 / 5); C.quadraticCurveTo(x1 + w / 5, cy + 16 + pulse * 3, x1, cy); }
      C.closePath();
      fs(rg(-16, cy - h * 0.7, w * 1.4, sh(m, 0.55), al(m, 0.75)), o, 4);
      C.restore();
      [[-26, -64, 12], [14, -70, 15], [-4, -44, 9], [34, -46, 8]].forEach((p) => { glow(p[0], cy + p[1], p[2] * 2.2, ac, 0.6 + pulse * 0.2); circ(p[0], cy + p[1], p[2] * 0.6); C.fillStyle = al('#ffffff', 0.7); C.fill(); });
      shine(-36, cy - h * 0.72, 18, 8, -0.5, 0.5);
      eyes(-6, cy - 20, 44, 9, { iris: f.iris || '#2a1a55', blink: a.blink, angry: f.angry });
      return;
    }
    if (v === 'horror') {
      const cy = -122;
      C.translate(-a.L * 12, -14 + br * 5);
      for (let i = 0; i < 6; i++) { const q = i - 2.5; tent(q * 20, cy + 40, Math.PI / 2 - q * 0.36 + a.L * 0.35, 104 - Math.abs(q) * 6, 18, i % 2 ? sh(m, -0.15) : m, o, t, i * 1.4, 0.55, 10); K._pts.forEach((p, j) => { if (j > 2 && j % 2) { circ(p[0], p[1], 3.2); C.fillStyle = al(ac, 0.9); C.fill(); } }); }
      C.beginPath(); for (let i = 0; i <= 30; i++) { const an = (i / 30) * TAU, r = 68 + Math.sin(an * 4 + t * 2) * 5 + Math.sin(an * 7 - t) * 3; const x = Math.cos(an) * r, y = cy + Math.sin(an) * r * 0.92; i ? C.lineTo(x, y) : C.moveTo(x, y); } C.closePath();
      fs(lg(cy - 70, cy + 66, sh(m, 0.28), sh(m, -0.32)), o, 4.5);
      [[-44, -40, 8], [40, -44, 9], [50, -8, 6]].forEach((e) => { circ(e[0], cy + e[1], e[2] + 3); fs(sh(m, -0.2), o, 2.5); eye(e[0], cy + e[1], e[2], { iris: ac, blink: a.blink }); });
      circ(-8, cy - 14, 31); fs(sh(m, -0.25), o, 3.5);
      circ(-8, cy - 14, 26); fs(rg(-14, cy - 22, 30, '#ffffff', '#f1d3d6'), o, 2.5);
      circ(-14, cy - 12, 14); fs(rg(-14, cy - 12, 14, sh(ac, 0.4), sh(ac, -0.4)), sh(ac, -0.7), 2.5);
      ell(-14, cy - 12, 4 - a.cast * 2, 11); C.fillStyle = '#07030d'; C.fill();
      if (a.cast > 0.1) glow(-14, cy - 12, 60, ac, a.cast * 0.7);
      const mo = 8 + a.L * 14 + a.cast * 6;
      ell(-6, cy + 38, 30, mo); fs('#2a0714', o, 3.5); teeth(-32, 20, cy + 38 - mo * 0.75, 9, 6); teeth(-32, 20, cy + 38 + mo * 0.75, -9, 6);
      return;
    }
    // eater 噬星者
    const cy = -110;
    C.translate(-a.L * 12, -10 + br * 5);
    glow(0, cy - 30, 220, ac, 0.22 + a.cast * 0.3);
    for (let i = 0; i < 8; i++) { const q = i - 3.5; tent(q * 18, cy + 26, Math.PI / 2 - q * 0.3 + a.L * 0.3, 110 - Math.abs(q) * 5, 20, i % 2 ? sh(m, -0.18) : m, o, t, i * 1.2, 0.6, 11); K._pts.forEach((p, j) => { if (j > 1 && j % 2 === 0) { glow(p[0], p[1], 9, ac, 0.9); } }); }
    [-40, -14, 14, 40].forEach((x, i) => { tri(x, cy - 104 + Math.abs(i - 1.5) * 14, -Math.PI / 2 + (i - 1.5) * 0.2, 36, 20); fs(s, o, 3); });
    C.beginPath(); C.moveTo(-74, cy + 20); C.bezierCurveTo(-96, cy - 60, -60, cy - 130, 0, cy - 132); C.bezierCurveTo(60, cy - 130, 96, cy - 60, 74, cy + 20); C.quadraticCurveTo(0, cy + 50, -74, cy + 20); C.closePath();
    const g = C.createLinearGradient(0, cy - 132, 0, cy + 40); g.addColorStop(0, sh(s, 0.1)); g.addColorStop(0.55, m); g.addColorStop(1, sh(m, -0.4));
    fs(g, o, 4.5);
    for (let i = 0; i < 14; i++) { const x = Math.sin(i * 2.7 + 1) * 60, y = cy - 20 - ((i * 37) % 100), tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.9); star(x, y, 2 + tw * 4, 4); C.fillStyle = al('#ffffff', 0.3 + 0.7 * tw); C.fill(); }
    [[-44, -34, 9], [-24, -54, 12], [4, -60, 13], [30, -50, 11], [48, -28, 8]].forEach((e) => eye(e[0], cy + e[1], e[2], { glow: ac }));
    const mo = 16 + a.L * 12 + a.cast * 8;
    circ(-4, cy + 6, mo + 8); fs('#0a0414', o, 3.5);
    C.save(); C.translate(-4, cy + 6); C.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { C.rotate(t * (2 + i)); C.beginPath(); C.arc(0, 0, mo * (0.9 - i * 0.25), 0, 3.6); C.strokeStyle = al(i % 2 ? '#ffffff' : ac, 0.8); C.lineWidth = 3; C.stroke(); }
    C.restore();
    for (let i = 0; i < 10; i++) { const an = (i / 10) * TAU; tri(-4 + Math.cos(an) * (mo + 7), cy + 6 + Math.sin(an) * (mo + 7), an + Math.PI, 9, 8); C.fillStyle = '#fffdf2'; C.fill(); }
  };

  /* ================= 巨龙 =================
   * f: boss small frost */
  R.dragon = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.66), t = a.t, sm = !!f.small;
    const br = Math.sin(t * 1.8 + a.seed), fl = Math.sin(t * (sm ? 8 : 3.2) + a.seed);
    if (sm) { C.scale(0.74, 0.74); C.translate(0, -44 + fl * 6); }
    C.translate(70, 0); C.rotate(-a.L * 0.07); C.translate(-70, 0);
    const wl = sm ? 118 : 166;
    if (f.boss) glow(20, -110, 300, ac, 0.14 + a.cast * 0.2);
    // 远侧翅膀
    wing('bat', 52, -122 + br * 2, 1, wl * 0.92, -0.45 + fl * 0.32 - a.cast * 0.15, sh(s, -0.3), sh(m, -0.25), o);
    // 尾巴
    const te = tent(104, -70, 0.22, sm ? 110 : 150, 36, m, o, t * 0.6, 0, 0.32, 10);
    K._pts.forEach((p, j) => { if (j > 0 && j < 9 && j % 2) { tri(p[0], p[1] - 12 + j, -Math.PI / 2 + 0.3, 16 - j, 12); fs(s, o, 2.5); } });
    tri(te[0], te[1], 0.2, 26, 26); fs(f.frost ? '#e8f9ff' : ac, o, 3);
    // 远侧腿
    limb([70, -60, 86, -28, 76, -6], 20, sh(m, -0.25), o); limb([-14, -62, -22, -30, -30 - a.L * 20, -6 - a.L * 20], 17, sh(m, -0.25), o);
    // 身体
    ell(36, -86 + br * 2, 90, 54); fs(lg(-140, -32, sh(m, 0.25), sh(m, -0.3)), o, 4.5);
    C.save(); ell(36, -86 + br * 2, 90, 54); C.clip();
    ell(26, -44 + br * 2, 80, 30); C.fillStyle = s; C.fill();
    C.strokeStyle = al(sh(s, -0.5), 0.6); C.lineWidth = 2.5; for (let i = 0; i < 7; i++) { C.beginPath(); C.moveTo(-34 + i * 22, -70); C.quadraticCurveTo(-28 + i * 22, -50, -36 + i * 22, -26); C.stroke(); }
    if (f.boss) { glow(-20, -70, 70 + a.cast * 40, ac, 0.35 + a.cast * 0.6); }
    C.restore();
    for (let i = 0; i < 6; i++) { const x = -22 + i * 26; tri(x, -86 + br * 2 - 54 * Math.sqrt(Math.max(0.04, 1 - Math.pow((x - 36) / 90, 2))) + 5, -Math.PI / 2 + 0.3, 24 - Math.abs(i - 2) * 2, 18); fs(f.frost ? lg(-170, -130, '#ffffff', s) : s, o, 3); }
    // 近侧腿
    ell(74, -62, 34, 40); fs(lg(-102, -22, sh(m, 0.15), sh(m, -0.3)), o, 4);
    limb([80, -40, 94, -22, 80, -8], 20, m, o);
    for (let i = 0; i < 3; i++) { tri(64 + i * 11, -4, Math.PI * 0.75, 13, 8); fs('#fffdf2', '#3a2a2a', 2); }
    const fy = -a.L * 30 - a.cast * 8, fx = -a.L * 26;
    limb([-22, -66, -36, -34 + fy * 0.5, -44 + fx, -8 + fy], 19, m, o);
    for (let i = 0; i < 3; i++) { tri(-58 + i * 11 + fx, -4 + fy, Math.PI * 0.75, 13, 8); fs('#fffdf2', '#3a2a2a', 2); }
    // 脖子与头
    const hx = -116 - a.L * 40 - a.cast * 4, hy = -208 + a.L * 36 + br * 3 - a.cast * 6;
    const NP = spline([[-30, -106], [-68, -140], [-84, -182 + br * 2], [hx + 26, hy + 12]], 16);
    C.fillStyle = o; NP.forEach((p, i) => { circ(p[0], p[1], 33 - i * 0.7 + 4); C.fill(); });
    NP.forEach((p, i) => { if (i % 3 === 1 && i < 15) { const q = NP[i + 1], an = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2; tri(p[0] + Math.cos(an) * (28 - i * 0.6), p[1] + Math.sin(an) * (28 - i * 0.6), an, 20, 16); fs(f.frost ? '#e8f9ff' : s, o, 2.5); } });
    NP.forEach((p, i) => { const r = 33 - i * 0.7; circ(p[0], p[1], r); C.fillStyle = lg(p[1] - r, p[1] + r, sh(m, 0.22), sh(m, -0.25)); C.fill(); });
    NP.forEach((p, i) => { if (i % 2 === 0) { const q = NP[Math.min(16, i + 1)], an = Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI / 2; circ(p[0] + Math.cos(an) * (16 - i * 0.3), p[1] + Math.sin(an) * (16 - i * 0.3), 9); C.fillStyle = al(s, 0.9); C.fill(); } });
    C.save(); C.translate(hx, hy); C.rotate(0.12 - a.cast * 0.2 + a.L * 0.12);
    const jaw = 0.1 + a.L * 0.5 + a.cast * 0.3;
    horn(26, -18, -0.6, 62, 18, -10); fs(lg(-60, -10, '#fffdf2', s), o, 3);
    horn(34, -4, -0.25, 50, 16, -8); fs(lg(-40, 0, '#f1ead2', s), o, 3);
    if (f.boss) { horn(10, -24, -1.0, 44, 14, -8); fs(lg(-60, -20, '#fffdf2', s), o, 3); }
    tri(36, 12, 0.5, 24, 18); fs(s, o, 3);
    C.save(); C.translate(16, 10); C.rotate(-jaw); C.beginPath(); C.moveTo(4, -6); C.lineTo(-72, 2); C.quadraticCurveTo(-80, 12, -66, 16); C.lineTo(-10, 22); C.quadraticCurveTo(10, 14, 4, -6); C.closePath(); fs(lg(-6, 22, sh(m, 0.05), sh(m, -0.3)), o, 3.5); teeth(-68, -22, 2, -11, 5); C.restore();
    if (jaw > 0.2) { glow(-40, 14, 50 + a.cast * 30, ac, Math.min(1, jaw * 1.4)); }
    C.beginPath(); C.moveTo(30, -22); C.quadraticCurveTo(-10, -34, -50, -16); C.quadraticCurveTo(-74, -14, -84, 0); C.quadraticCurveTo(-86, 10, -70, 12); C.lineTo(10, 12); C.quadraticCurveTo(36, 8, 30, -22); C.closePath();
    fs(lg(-34, 12, sh(m, 0.28), sh(m, -0.18)), o, 4);
    teeth(-74, -22, 11, 10, 6);
    circ(-76, -2, 3); C.fillStyle = o; C.fill();
    poly([-28, -24, 2, -30, 6, -20]); fs(sh(m, -0.2), o, 2.5);
    eye(-8, -10, 9, { iris: f.iris || ac, slit: 1, blink: a.blink, brow: 1 });
    glow(-8, -10, 24 + a.cast * 16, ac, 0.3 + a.cast * 0.5);
    C.restore();
    // 近侧翅膀
    wing('bat', 22, -126 + br * 2, 1, wl, -0.72 + fl * 0.36 - a.cast * 0.2, s, m, o);
  };
})();
