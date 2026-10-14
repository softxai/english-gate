/* English Gate · 怪兽骨架 B：蛇、虫、人形、幽灵、魔像 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2, sh = U.shade, al = U.rgba;
  const K = EG.CK, R = EG.Creatures.R;
  const { fs, lg, rg, ell, circ, poly, rr, tri, horn, limb, shine, glow, eye, eyes, teeth, star, crown, flame, leaf, tent, wing, spline, gear } = K;

  /* ================= 蛇 / 蠕虫 =================
   * f: hood rattle bone maw horns stars vine ice */
  R.serpent = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.62), t = a.t;
    const sw = Math.sin(t * 1.7 + a.seed), sw2 = Math.sin(t * 1.7 + a.seed + 1.2);
    const P = [[104, -10], [56, -18], [-2, -18], [-40, -40], [-12, -84 + sw * 3], [24, -122 + sw2 * 4], [-4, -160 + sw * 5], [-46 - a.L * 56 - a.cast * 6, -176 + a.L * 46 + sw2 * 5 - a.cast * 8]];
    const N = 44, pts = spline(P, N);
    const rad = (u) => (f.maw ? 30 : 25) * (u < 0.3 ? 0.3 + 0.7 * (u / 0.3) : 1) * (1 - Math.max(0, u - 0.85) * 0.9);
    const hp = pts[N], hpp = pts[N - 3], ha = Math.atan2(hp[1] - hpp[1], hp[0] - hpp[0]);
    if (f.hood) { const q = pts[N - 6]; C.save(); C.translate(q[0], q[1]); C.rotate(ha + Math.PI / 2); ell(0, 0, 58 + a.cast * 8, 44); fs(lg(-44, 44, sh(m, 0.1), sh(m, -0.3)), o, 4.5); ell(0, 4, 26, 20); fs(null, ac, 5); circ(0, 4, 7); C.fillStyle = ac; C.fill(); C.restore(); }
    if (f.bone) {
      for (let i = 0; i < N - 2; i += 3) { const p = pts[i], r = rad(i / N) * 0.62; if (i > 8) { const q = pts[i + 1], an = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2; limb([p[0] - Math.cos(an) * r * 1.7, p[1] - Math.sin(an) * r * 1.7, p[0] + Math.cos(an) * r * 1.7, p[1] + Math.sin(an) * r * 1.7], 4, m, o); } circ(p[0], p[1], r); fs(lg(p[1] - r, p[1] + r, sh(m, 0.2), sh(m, -0.2)), o, 3.5); }
    } else {
      C.fillStyle = o; for (let i = 0; i <= N; i++) { const p = pts[i]; circ(p[0], p[1], rad(i / N) + 4); C.fill(); }
      if (f.ice) for (let i = 8; i < N - 4; i += 4) { const p = pts[i], q = pts[i + 1], an = Math.atan2(q[1] - p[1], q[0] - p[0]) - Math.PI / 2; tri(p[0] + Math.cos(an) * rad(i / N) * 0.8, p[1] + Math.sin(an) * rad(i / N) * 0.8, an, 22, 14); fs('#e8f9ff', sh(ac, -0.4), 2); }
      for (let i = 0; i <= N; i++) { const p = pts[i], r = rad(i / N); circ(p[0], p[1], r); C.fillStyle = lg(p[1] - r, p[1] + r, sh(m, 0.25), sh(m, -0.25)); C.fill(); }
      for (let i = 3; i < N - 2; i += 3) {
        const p = pts[i], r = rad(i / N);
        if (f.maw) { const q = pts[i + 1], an = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2; C.beginPath(); C.moveTo(p[0] - Math.cos(an) * r, p[1] - Math.sin(an) * r); C.lineTo(p[0] + Math.cos(an) * r, p[1] + Math.sin(an) * r); C.strokeStyle = al(o, 0.45); C.lineWidth = 3; C.stroke(); }
        else if (f.stars) { const tw = 0.5 + 0.5 * Math.sin(t * 4 + i); star(p[0], p[1], 3 + tw * 5, 4); C.fillStyle = al('#ffffff', 0.4 + 0.6 * tw); C.fill(); }
        else { circ(p[0], p[1], r * 0.42); C.fillStyle = s; C.fill(); }
        if (f.vine && i % 6 === 0) { leaf(p[0], p[1], -1 + i, 26, 14); fs(ac, sh(ac, -0.55), 2.5); }
      }
    }
    if (f.rattle) for (let i = 0; i < 4; i++) { circ(104 + i * 11, -10 - i * 7, 9 - i * 1.2); fs(s, o, 3); }
    // 头
    C.save(); C.translate(hp[0], hp[1]); C.rotate(ha - Math.PI);
    const mo = a.L * 0.5 + a.cast * 0.18;
    if (f.maw) {
      circ(-6, 0, 36); fs(lg(-36, 36, sh(m, 0.2), sh(m, -0.3)), o, 4.5);
      ell(-20, 0, 20, 26 + mo * 10); fs('#2a0714', o, 3);
      for (let i = 0; i < 9; i++) { const an = (i / 9) * TAU + t * 0.6; tri(-20 + Math.cos(an) * 18, Math.sin(an) * (24 + mo * 10), an + Math.PI, 11, 8); C.fillStyle = '#fffdf2'; C.fill(); }
      glow(-20, 0, 30, ac, 0.3 + a.cast * 0.6);
    } else if (f.bone) {
      ell(-8, -2, 34, 26); fs(lg(-28, 24, sh(m, 0.2), sh(m, -0.2)), o, 4);
      C.save(); C.translate(8, 14); C.rotate(-mo); rr(-40, 0, 44, 13, 5); fs(m, o, 3.5); teeth(-36, 0, 0, -7, 5); C.restore();
      teeth(-36, -4, 14, 8, 5);
      ell(-12, -6, 9, 10); C.fillStyle = '#12060f'; C.fill(); glow(-13, -6, 20, ac, 0.8); circ(-13, -6, 4); C.fillStyle = ac; C.fill();
    } else {
      if (f.horns) { horn(10, -18, -0.7, 34, 14, -6); fs(s, o, 3); horn(14, -10, -0.3, 28, 12, -5); fs(s, o, 3); }
      C.save(); C.translate(12, 10); C.rotate(-mo * 1.2); C.beginPath(); C.moveTo(4, -4); C.quadraticCurveTo(-30, 2, -50, 0); C.quadraticCurveTo(-30, 16, 4, 12); C.closePath(); fs(sh(m, -0.12), o, 3.5); if (mo > 0.1) teeth(-40, -14, 2, -8, 2); C.restore();
      if (mo < 0.12) { const tf = Math.max(0, Math.sin(t * 3.2 + a.seed)); C.strokeStyle = '#e0486a'; C.lineWidth = 3; C.beginPath(); C.moveTo(-46, 6); C.lineTo(-46 - 24 * tf, 6); C.moveTo(-46 - 24 * tf, 6); C.lineTo(-46 - 34 * tf, 0); C.moveTo(-46 - 24 * tf, 6); C.lineTo(-46 - 34 * tf, 12); C.stroke(); }
      C.beginPath(); C.moveTo(22, -8); C.bezierCurveTo(18, -34, -30, -30, -54, -4); C.quadraticCurveTo(-56, 8, -44, 10); C.lineTo(14, 12); C.quadraticCurveTo(26, 6, 22, -8); C.closePath();
      fs(lg(-30, 12, sh(m, 0.28), sh(m, -0.15)), o, 4);
      if (mo > 0.1) { tri(-40, 9, Math.PI / 2, 14, 7); fs('#fffdf2', '#5a4a4a', 1.5); tri(-24, 10, Math.PI / 2, 11, 6); fs('#fffdf2', '#5a4a4a', 1.5); }
      eye(-14, -10, 9.5, { iris: f.iris || ac, slit: 1, blink: a.blink, brow: 1 });
      circ(-48, -2, 2.5); C.fillStyle = o; C.fill();
      if (a.cast > 0.3) glow(-14, -10, 34, ac, a.cast * 0.5);
    }
    C.restore();
  };

  /* ================= 虫 =================
   * f.v: spider beetle scorpion crab；f: gold glow */
  R.bug = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = f.v || 'spider', o = sh(m, -0.65), t = a.t;
    const br = Math.sin(t * 2.4 + a.seed);
    if (v === 'spider') {
      const legs = (far) => {
        for (let i = 0; i < 4; i++) {
          const ph = t * 3 + i * 1.3 + (far ? 1.5 : 0), lift = Math.max(0, Math.sin(ph)) * 6, front = i === 0;
          const x0 = -30 + i * 15, y0 = -60 + br * 2, reach = (i - 1.5) * 50 + (far ? 12 : -6);
          const kx = x0 + reach * 0.62, ky = -118 - (i % 2) * 10 - (front ? a.L * 26 + a.cast * 22 : 0);
          const fx = x0 + reach * 1.3 - (front ? a.L * 34 : 0), fy = -lift - (front ? a.L * 64 + a.cast * 34 : 0);
          const col = far ? sh(m, -0.3) : m;
          limb([x0, y0, kx, ky], far ? 7 : 9, col, o); limb([kx, ky, fx, fy], far ? 5.5 : 7, col, o);
        }
      };
      legs(1);
      ell(40, -76 + br * 2, 54, 46); fs(lg(-122, -30, sh(m, 0.22), sh(m, -0.3)), o, 4.5);
      if (f.glow) glow(40, -76, 70, ac, 0.3 + br * 0.1);
      poly([40, -100 + br * 2, 54, -78 + br * 2, 40, -56 + br * 2, 26, -78 + br * 2]); fs(ac, sh(ac, -0.5), 2.5);
      shine(20, -104, 16, 8, -0.5, 0.3);
      ell(-28, -62 + br * 2, 32, 28); fs(lg(-90, -34, sh(m, 0.28), sh(m, -0.22)), o, 4.5);
      legs(0);
      [[-46, -70, 6], [-32, -76, 5], [-52, -58, 4.5], [-38, -62, 4], [-20, -74, 3.5]].forEach((e) => eye(e[0], e[1] + br * 2, e[2], { glow: f.iris || ac }));
      const fo = a.L * 8 + a.cast * 4;
      horn(-52, -46 + br * 2, 2.0 + fo * 0.03, 22 + fo, 10, 4); fs('#fffdf2', o, 2.5); horn(-38, -42 + br * 2, 1.85 + fo * 0.03, 22 + fo, 10, 4); fs('#fffdf2', o, 2.5);
      return;
    }
    if (v === 'beetle') {
      const lg3 = (far) => { for (let i = 0; i < 3; i++) { const x = -38 + i * 34 + (far ? 10 : 0), sw = Math.sin(t * 3 + i * 2 + (far ? 1 : 0)) * 4; limb([x, -40, x - 14 + sw, -22, x - 20 + sw, -2], far ? 7 : 9, far ? sh(s, -0.3) : s, o); } };
      lg3(1);
      const hx = -72 - a.L * 12, hy = -48 + br * 1.5 + a.L * 8;
      // 大角
      C.save(); C.translate(hx - 6, hy - 14); C.rotate(-a.L * 0.5 - a.cast * 0.2);
      limb([0, 0, -26, -34, -56, -42], 13, s, o); limb([-56, -42, -76, -34], 9, s, o); limb([-56, -42, -66, -62], 9, s, o);
      C.restore();
      circ(hx, hy, 27); fs(lg(hy - 27, hy + 27, sh(s, 0.2), sh(s, -0.3)), o, 4.5);
      ell(4, -62 + br * 1.5, 74, 56); fs(f.gold ? lg(-118, -6, '#fff4b0', sh(m, -0.25)) : lg(-118, -6, sh(m, 0.3), sh(m, -0.3)), o, 4.5);
      C.beginPath(); C.moveTo(-10, -117 + br * 1.5); C.quadraticCurveTo(0, -60, -6, -8); C.strokeStyle = al(o, 0.7); C.lineWidth = 3.5; C.stroke();
      C.save(); ell(4, -62 + br * 1.5, 74, 56); C.clip(); C.fillStyle = al(ac, 0.85);
      [[-40, -84, 11], [-34, -44, 9], [34, -86, 12], [40, -44, 10], [8, -30, 7]].forEach((p) => { circ(p[0], p[1], p[2]); C.fill(); }); C.restore();
      shine(-26, -98, 26, 9, -0.35, f.gold ? 0.75 : 0.4);
      if (f.gold) glow(4, -62, 110, ac, 0.25 + br * 0.08);
      lg3(0);
      eye(hx - 8, hy - 4, 8, { iris: f.iris, blink: a.blink, brow: 1 });
      return;
    }
    if (v === 'scorpion') {
      const lg4 = (far) => { for (let i = 0; i < 4; i++) { const x = -34 + i * 26 + (far ? 8 : 0), sw = Math.sin(t * 3.4 + i * 1.6 + (far ? 1 : 0)) * 4; limb([x, -34, x - 16 + sw, -44, x - 22 + sw, -2], far ? 6 : 8, far ? sh(m, -0.3) : m, o); } };
      lg4(1);
      // 尾巴
      const cxp = 44, cyp = -94, rr2 = 58, st = a.L;
      let lx = 0, ly = 0;
      for (let i = 0; i <= 5; i++) {
        const q = i / 5, an = 1.15 - i * 0.7 + Math.sin(t * 2 + i * 0.5) * 0.05;
        const x = cxp + Math.cos(an) * rr2 - st * 70 * q * q, y = cyp + Math.sin(an) * rr2 + st * 46 * q * q - a.cast * 8 * q;
        circ(x, y, 20 - i * 2); fs(lg(y - 20, y + 20, sh(m, 0.22), sh(m, -0.28)), o, 4); lx = x; ly = y;
      }
      glow(lx - 20, ly + 6, 30, ac, 0.3 + a.cast * 0.6);
      horn(lx - 4, ly, Math.PI * 0.86, 36, 16, 10); fs(ac, sh(ac, -0.55), 3);
      ell(6, -40 + br, 66, 28); fs(lg(-68, -12, sh(m, 0.25), sh(m, -0.3)), o, 4.5);
      C.strokeStyle = al(o, 0.55); C.lineWidth = 3; [-18, 8, 34].forEach((x) => { C.beginPath(); C.moveTo(x, -66 + br); C.quadraticCurveTo(x + 8, -40, x, -14); C.stroke(); });
      lg4(0);
      // 钳子
      [[1, 0.25], [0, 0]].forEach((q) => {
        const far = q[0], yb = -44 - far * 12, cx0 = -98 - (far ? -14 : 0) - a.L * 16, cy0 = yb - 26 - a.cast * 22 - far * 10;
        const col = far ? sh(m, -0.25) : m, op = 0.25 + 0.2 * Math.abs(Math.sin(t * 3 + far)) + a.L * 0.3;
        limb([-50, yb, -78, yb + 4, cx0 + 10, cy0 + 8], 11, col, o);
        C.save(); C.translate(cx0, cy0); C.rotate(-0.4);
        C.save(); C.rotate(op); horn(0, 4, Math.PI, 38, 20, -8); fs(col, o, 3.5); C.restore();
        C.save(); C.rotate(-op); horn(0, -4, Math.PI, 42, 22, 8); fs(col, o, 3.5); C.restore();
        circ(4, 0, 15); fs(col, o, 3.5); C.restore();
      });
      eye(-52, -52 + br, 7, { glow: f.iris || ac }); eye(-38, -58 + br, 6, { glow: f.iris || ac });
      return;
    }
    // crab
    for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 3; i++) {
      const sw = Math.sin(t * 4 + i * 2 + side) * 5;
      limb([side * 50, -40, side * (84 + i * 12), -62 + i * 10 + sw * 0.4, side * (96 + i * 14) + sw, -2], 8, sh(m, -0.12), o);
    }
    [[-1, 1.15], [1, 0.9]].forEach((q) => {
      const sd = q[0], k = q[1], cx0 = sd * 92 + (sd < 0 ? -a.L * 22 : 0), cy0 = -108 - a.cast * 18 * (sd < 0 ? 1 : 0.4) + br * 3 * sd;
      const op = 0.2 + 0.25 * Math.abs(Math.sin(t * 2.6 + sd)) + (sd < 0 ? a.L * 0.3 : 0);
      limb([sd * 58, -56, sd * 96, -60, cx0, cy0 + 16], 14, m, o);
      C.save(); C.translate(cx0, cy0); C.scale(-sd * k, k); C.rotate(-0.9);
      C.save(); C.rotate(op); horn(0, 6, 0, 48, 26, 10); fs(m, o, 3.5); C.restore();
      C.save(); C.rotate(-op); horn(0, -6, 0, 54, 30, -10); fs(sh(m, 0.1), o, 3.5); C.restore();
      circ(-4, 0, 22); fs(lg(-22, 22, sh(m, 0.25), sh(m, -0.25)), o, 3.5); C.restore();
    });
    ell(0, -52 + br, 78, 42); fs(lg(-94, -10, sh(m, 0.28), sh(m, -0.3)), o, 4.5);
    C.save(); ell(0, -52 + br, 78, 42); C.clip(); C.strokeStyle = al(ac, 0.9); C.lineWidth = 4;
    [[-30, -70, 20], [24, -64, 26], [-6, -40, 16]].forEach((p) => { C.beginPath(); C.moveTo(p[0], p[1]); C.lineTo(p[0] + p[2] * 0.5, p[1] + 10); C.lineTo(p[0] + p[2], p[1] - 2); C.stroke(); }); C.restore();
    glow(0, -52, 100, ac, 0.18 + a.cast * 0.3);
    [-22, 16].forEach((x, i) => { limb([x, -86 + br, x - 2, -108 + br], 5, m, o); eye(x - 2, -114 + br, 10, { iris: f.iris, blink: a.blink, brow: i ? -1 : 1 }); });
    C.beginPath(); C.moveTo(-24, -34); C.quadraticCurveTo(-4, -26 + a.L * 6, 18, -34); C.strokeStyle = o; C.lineWidth = 3.5; C.stroke();
  };

  /* ================= 人形 =================
   * f: head(goblin skull helm hood witch mummy jackal elf demon pharaoh vampire angel bandit ghoul priestess)
   *    body(robe armor rags wrap tunic) weapon(sword staff wand dagger scythe spear bow none)
   *    cape(颜色) wings(bat/feather) halo shield small boss hunch skin */
  R.humanoid = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, o = sh(m, -0.65), t = a.t;
    const br = Math.sin(t * 2.2 + a.seed);
    const sc = f.small ? 0.78 : f.boss ? 1.14 : 1;
    C.scale(sc, sc);
    if (f.hunch) { C.translate(8, 0); C.rotate(-0.1); }
    C.rotate(-a.L * 0.06);
    const skin = f.skin || '#e8c39e', so = sh(skin, -0.6), body = f.body || 'tunic';
    const fl = Math.sin(t * 5 + a.seed) * 0.3 - a.cast * 0.4;
    if (f.wings) { wing(f.wings, 16, -124 + br, 1, f.boss ? 150 : 124, fl, f.wings === 'bat' ? sh(m, -0.1) : s, f.wings === 'bat' ? m : sh(s, 0.2), o); wing(f.wings, -16, -124 + br, -1, f.boss ? 150 : 124, fl, f.wings === 'bat' ? sh(m, -0.1) : s, f.wings === 'bat' ? m : sh(s, 0.2), o); }
    if (f.cape) {
      const cw = Math.sin(t * 2 + a.seed) * 6 + a.cast * 16;
      C.beginPath(); C.moveTo(-28, -136); C.quadraticCurveTo(-62 - cw, -70, -56 - cw * 0.5, -6); C.lineTo(-30, -16); C.lineTo(-6, -4); C.lineTo(20, -16); C.lineTo(60 + cw, -6); C.quadraticCurveTo(64 + cw, -70, 28, -136); C.closePath();
      fs(lg(-136, 0, f.cape, sh(f.cape, -0.45)), sh(f.cape, -0.7), 4);
    }
    // 后手
    const armC = body === 'armor' ? s : body === 'wrap' ? m : (body === 'robe' ? m : skin);
    limb([26, -124 + br, 44, -98, 40, -74 + br * 2], 13, sh(armC, -0.12), o);
    if (f.shield) { ell(48, -86, 24, 32); fs(lg(-118, -54, sh(ac, 0.3), sh(ac, -0.3)), sh(ac, -0.65), 4); ell(48, -86, 10, 14); fs(sh(s, 0.2), sh(s, -0.6), 3); }
    else { circ(40, -72 + br * 2, 7.5); fs(body === 'wrap' ? m : skin, so, 3); }
    // 腿
    if (body !== 'robe') {
      const lc = body === 'armor' ? sh(s, -0.1) : body === 'wrap' ? m : sh(m, -0.3);
      limb([-12, -70, -17, -36, -18, -8], 15, lc, o); limb([12, -70, 15, -36, 16, -8], 15, lc, o);
      ell(-23, -5, 15, 7.5); fs(sh(lc, -0.3), o, 3.5); ell(11, -5, 15, 7.5); fs(sh(lc, -0.3), o, 3.5);
    }
    // 躯干
    const ty = br * 1.2;
    if (body === 'robe') {
      C.beginPath(); C.moveTo(-27, -134 + ty); C.quadraticCurveTo(-44, -60, -48, -4); C.quadraticCurveTo(-24, 4, 0, -4); C.quadraticCurveTo(24, 4, 48, -4); C.quadraticCurveTo(44, -60, 27, -134 + ty); C.closePath();
      fs(lg(-134, 0, sh(m, 0.2), sh(m, -0.32)), o, 4.5);
      C.beginPath(); C.moveTo(-2, -128 + ty); C.lineTo(-2, -6); C.strokeStyle = ac; C.lineWidth = 5; C.stroke();
      rr(-30, -84 + ty, 60, 10, 4); fs(s, sh(s, -0.6), 3);
    } else {
      rr(-28, -136 + ty, 56, 72, 14); fs(lg(-136, -64, sh(m, 0.22), sh(m, -0.28)), o, 4.5);
      if (body === 'armor') {
        C.beginPath(); C.moveTo(-18, -128 + ty); C.lineTo(0, -92 + ty); C.lineTo(18, -128 + ty); C.strokeStyle = al(o, 0.6); C.lineWidth = 3; C.stroke();
        glow(0, -108 + ty, 20, ac, 0.3 + a.cast * 0.5); circ(0, -108 + ty, 5); fs(ac, sh(ac, -0.5), 2);
        circ(-32, -128 + ty, 16); fs(lg(-144, -112, sh(s, 0.3), sh(s, -0.2)), o, 4); circ(32, -128 + ty, 16); fs(lg(-144, -112, sh(s, 0.2), sh(s, -0.3)), o, 4);
        rr(-30, -76 + ty, 60, 12, 4); fs(s, o, 3.5);
        poly([-28, -66, 28, -66, 22, -42, 6, -50, -6, -50, -22, -42]); fs(sh(m, -0.15), o, 3.5);
      } else if (body === 'wrap') {
        C.save(); rr(-28, -136 + ty, 56, 72, 14); C.clip(); C.strokeStyle = sh(m, -0.3); C.lineWidth = 2.5; for (let i = 0; i < 8; i++) { C.beginPath(); C.moveTo(-30, -130 + i * 10); C.lineTo(30, -124 + i * 10 + (i % 2 ? 6 : -4)); C.stroke(); } C.restore();
        limb([-20, -70, -30, -46 + br * 3], 5, m, o);
      } else if (body === 'rags') {
        poly([-28, -70, -30, -48, -16, -58, -6, -44, 6, -58, 18, -46, 28, -70]); fs(sh(m, -0.2), o, 3.5);
      } else {
        rr(-30, -80 + ty, 60, 10, 4); fs(s, sh(s, -0.6), 3);
        poly([-28, -70, 28, -70, 30, -50, -30, -50]); fs(sh(m, -0.12), o, 3.5);
      }
    }
    if (f.tail) { const e = tent(14, -64, 0.5, 70, 6, m, o, t, 0, 0.6); tri(e[0], e[1], 0.5, 16, 16); fs(m, o, 3); }

    // ---- 头 ----
    const hx = -4, hy = -160 + ty, hr = 27, hd = f.head || 'goblin';
    const hair = f.hair || '#2a2233';
    const face = (col) => { circ(hx, hy, hr); fs(lg(hy - hr, hy + hr, sh(col, 0.18), sh(col, -0.18)), sh(col, -0.62), 4); };
    const std = (iris, angry) => { eye(hx - 15, hy - 2, 7.5, { iris, blink: a.blink, brow: angry ? 1 : 0 }); eye(hx + 8, hy - 2, 7.5, { iris, blink: a.blink, brow: angry ? -1 : 0 }); };
    const gl = (x, y, r) => { glow(x, y, r * 3, ac, 0.8 + a.cast * 0.2); circ(x, y, r); C.fillStyle = ac; C.fill(); circ(x - r * 0.25, y - r * 0.25, r * 0.4); C.fillStyle = '#fff'; C.fill(); };
    const grin = (y, w) => { const mo = a.L * 6 + a.cast * 3; C.beginPath(); C.moveTo(hx - w - 4, y); C.quadraticCurveTo(hx - 4, y + 8 + mo, hx + w - 4, y); C.quadraticCurveTo(hx - 4, y + 2, hx - w - 4, y); C.closePath(); fs('#3a0d1a', so, 2.5); };
    if (f.halo) { glow(hx, hy - 46, 46, '#fff2a8', 0.5); ell(hx, hy - 44 + br * 2, 26, 8); fs(null, '#fff2a8', 5); }
    switch (hd) {
      case 'goblin': case 'imp': {
        tri(hx + hr * 0.85, hy - 4, -0.35, 34, 20); fs(skin, so, 3.5); tri(hx - hr * 0.85, hy - 4, Math.PI + 0.35, 34, 20); fs(skin, so, 3.5);
        if (hd === 'imp') { horn(hx - 14, hy - hr * 0.8, -1.95, 26, 12, 5); fs(s, o, 3); horn(hx + 12, hy - hr * 0.8, -1.2, 26, 12, -5); fs(s, o, 3); }
        face(skin); std(f.iris || '#f7d038', 1);
        ell(hx - 20, hy + 6, 8, 6); fs(sh(skin, -0.12), so, 2.5);
        grin(hy + 14, 14); teeth(hx - 14, hx + 6, hy + 14, 5, 3);
        if (hd === 'goblin') { C.beginPath(); C.arc(hx, hy - 6, hr + 2, Math.PI * 1.08, Math.PI * 1.92); C.lineTo(hx + hr, hy - 12); C.lineTo(hx - hr, hy - 12); C.closePath(); fs(s, sh(s, -0.6), 3.5); }
        break;
      }
      case 'skull': {
        if (f.hood) { C.beginPath(); C.moveTo(hx - hr - 10, hy + 26); C.quadraticCurveTo(hx - hr - 14, hy - hr - 20, hx + 6, hy - hr - 16); C.quadraticCurveTo(hx + hr + 16, hy - hr, hx + hr + 10, hy + 26); C.closePath(); fs(lg(hy - hr - 20, hy + 26, sh(f.hood, 0.15), sh(f.hood, -0.4)), sh(f.hood, -0.7), 4); }
        rr(hx - 14, hy + 14, 26, 16, 5); fs('#e9e4d4', '#4a4338', 3);
        face('#f1ecdd');
        [[-13, 0], [9, 0]].forEach((p) => { ell(hx + p[0], hy - 2, 8, 9.5); C.fillStyle = '#12060f'; C.fill(); gl(hx + p[0] - 1, hy - 1, 3.2); });
        tri(hx - 3, hy + 9, -Math.PI / 2, 7, 7); C.fillStyle = '#12060f'; C.fill();
        C.strokeStyle = '#4a4338'; C.lineWidth = 2; for (let i = -2; i <= 2; i++) { C.beginPath(); C.moveTo(hx - 2 + i * 5, hy + 17); C.lineTo(hx - 2 + i * 5, hy + 28); C.stroke(); }
        if (f.crown) crown(hx, hy - hr + 4, 40, '#ffd24a');
        break;
      }
      case 'helm': {
        if (f.plume !== 0) { C.beginPath(); C.moveTo(hx, hy - hr); C.quadraticCurveTo(hx + 20, hy - hr - 42 + br * 3, hx + 50, hy - hr - 8 + br * 5); C.quadraticCurveTo(hx + 24, hy - hr - 12, hx + 6, hy - hr + 4); C.closePath(); fs(ac, sh(ac, -0.6), 3); }
        if (f.horns) { horn(hx - 18, hy - hr * 0.7, -2.3, 34, 14, 8); fs(sh(s, 0.2), o, 3); horn(hx + 16, hy - hr * 0.7, -0.85, 34, 14, -8); fs(sh(s, 0.2), o, 3); }
        circ(hx, hy, hr); fs(lg(hy - hr, hy + hr, sh(s, 0.35), sh(s, -0.3)), o, 4);
        rr(hx - hr + 2, hy - 8, hr * 1.5, 12, 4); C.fillStyle = '#0d0a14'; C.fill();
        gl(hx - 14, hy - 2, 3.4); gl(hx + 4, hy - 2, 3.4);
        C.beginPath(); C.moveTo(hx - 6, hy + 6); C.lineTo(hx - 6, hy + hr - 2); C.strokeStyle = al(o, 0.6); C.lineWidth = 3; C.stroke();
        shine(hx - 10, hy - hr * 0.6, 9, 4, -0.4, 0.5);
        break;
      }
      case 'hood': case 'bandit': {
        const hc = hd === 'bandit' ? s : m;
        C.beginPath(); C.moveTo(hx - hr - 6, hy + 24); C.quadraticCurveTo(hx - hr - 12, hy - hr - 8, hx + 4, hy - hr - (hd === 'bandit' ? 8 : 20)); C.quadraticCurveTo(hx + hr + 14, hy - hr, hx + hr + 6, hy + 24); C.quadraticCurveTo(hx, hy + 34, hx - hr - 6, hy + 24); C.closePath();
        fs(lg(hy - hr - 20, hy + 26, sh(hc, 0.15), sh(hc, -0.35)), sh(hc, -0.7), 4);
        ell(hx - 4, hy + 2, hr * 0.78, hr * 0.8); C.fillStyle = hd === 'bandit' ? skin : '#0b0812'; C.fill();
        if (hd === 'bandit') { std(f.iris || '#3b2a1a', 1); rr(hx - hr * 0.86, hy + 6, hr * 1.6, 20, 6); fs(sh(m, -0.1), o, 3); circ(hx + 2, hy - hr - 2, 6); fs(ac, sh(ac, -0.5), 2); }
        else { gl(hx - 14, hy, 4); gl(hx + 6, hy, 4); }
        break;
      }
      case 'witch': {
        limb([hx + 14, hy - 6, hx + 30, hy + 20, hx + 24, hy + 44], 9, hair, null); limb([hx - 20, hy - 4, hx - 30, hy + 18, hx - 24, hy + 38], 8, hair, null);
        face(skin); std(f.iris || '#b6f23a', 1);
        tri(hx - 22, hy + 4, Math.PI + 0.25, 16, 10); fs(sh(skin, -0.08), so, 2.5);
        grin(hy + 14, 12);
        ell(hx, hy - hr * 0.72, 46, 10); fs(sh(m, -0.2), o, 4);
        C.beginPath(); C.moveTo(hx - 24, hy - hr * 0.8); C.quadraticCurveTo(hx - 8, hy - hr - 40, hx + 26 + br * 4, hy - hr - 62); C.quadraticCurveTo(hx + 14, hy - hr - 30, hx + 24, hy - hr * 0.8); C.closePath(); fs(lg(hy - hr - 62, hy - hr, sh(m, 0.1), sh(m, -0.3)), o, 4);
        rr(hx - 22, hy - hr - 8, 44, 9, 3); fs(ac, sh(ac, -0.6), 2.5);
        break;
      }
      case 'mummy': {
        face(m);
        C.save(); circ(hx, hy, hr); C.clip(); C.strokeStyle = sh(m, -0.32); C.lineWidth = 2.5; for (let i = 0; i < 7; i++) { C.beginPath(); C.moveTo(hx - hr, hy - hr + i * 9); C.lineTo(hx + hr, hy - hr + i * 9 + (i % 2 ? 7 : -5)); C.stroke(); }
        poly([hx - hr, hy - 10, hx + hr, hy - 4, hx + hr, hy + 6, hx - hr, hy + 4]); C.fillStyle = '#12060f'; C.fill(); C.restore();
        gl(hx - 13, hy - 1, 4.5); gl(hx + 8, hy + 1, 3);
        limb([hx + hr - 4, hy + 8, hx + hr + 16, hy + 26 + br * 4], 5, m, o);
        break;
      }
      case 'jackal': {
        tri(hx + 10, hy - hr * 0.7, -1.35, 48, 18); fs(sh(m, -0.3), o, 3.5); tri(hx - 6, hy - hr * 0.75, -1.7, 50, 18); fs(m, o, 3.5);
        C.beginPath(); C.moveTo(hx - 10, hy - 12); C.lineTo(hx - 62 - a.L * 4, hy + 8); C.lineTo(hx - 58, hy + 18 + a.L * 5); C.lineTo(hx - 6, hy + 20); C.closePath(); fs(lg(hy - 12, hy + 20, sh(m, 0.2), sh(m, -0.2)), o, 4);
        face(m);
        circ(hx - 60, hy + 9, 4); C.fillStyle = '#0b0812'; C.fill();
        eye(hx - 12, hy - 4, 7.5, { iris: f.iris || ac, blink: a.blink, brow: 1, slit: 1 });
        C.beginPath(); C.moveTo(hx - 12, hy + 4); C.lineTo(hx - 4, hy + 16); C.strokeStyle = ac; C.lineWidth = 3; C.stroke();
        rr(hx - 26, hy + hr - 6, 52, 12, 5); fs(ac, sh(ac, -0.6), 3);
        break;
      }
      case 'elf': {
        limb([hx + 12, hy - 14, hx + 34, hy + 16, hx + 26 + br * 3, hy + 52], 13, hair, sh(hair, -0.5));
        tri(hx + hr * 0.8, hy, -0.5, 36, 14); fs(skin, so, 3); tri(hx - hr * 0.8, hy, Math.PI + 0.5, 30, 14); fs(skin, so, 3);
        face(skin);
        C.beginPath(); C.arc(hx, hy - 4, hr + 1, Math.PI * 1.02, Math.PI * 1.98); C.quadraticCurveTo(hx + 6, hy - 10, hx - 10, hy - 14); C.quadraticCurveTo(hx - 20, hy - 12, hx - hr - 1, hy - 2); C.closePath(); fs(hair, sh(hair, -0.5), 3);
        std(f.iris || '#2f9e6b', 1); C.beginPath(); C.moveTo(hx - 12, hy + 14); C.lineTo(hx, hy + 14); C.strokeStyle = so; C.lineWidth = 3; C.stroke();
        rr(hx - hr, hy - 16, hr * 2, 5, 2); fs(ac, sh(ac, -0.5), 2); circ(hx - 6, hy - 14, 4.5); fs('#7df9ff', sh(ac, -0.5), 2);
        break;
      }
      case 'demon': {
        horn(hx - 16, hy - hr * 0.8, -2.25, 52, 20, 14); fs(lg(hy - hr - 50, hy - hr, sh(s, 0.4), s), o, 3.5); horn(hx + 14, hy - hr * 0.8, -0.9, 52, 20, -14); fs(lg(hy - hr - 50, hy - hr, sh(s, 0.4), s), o, 3.5);
        tri(hx + hr * 0.85, hy - 2, -0.3, 24, 16); fs(skin, so, 3); tri(hx - hr * 0.85, hy - 2, Math.PI + 0.3, 24, 16); fs(skin, so, 3);
        face(skin);
        [[-15, 1], [8, -1]].forEach((p) => { poly([hx + p[0] - 9, hy - 6 - p[1] * 4, hx + p[0] + 9, hy - 6 + p[1] * 4, hx + p[0] + 6, hy + 4, hx + p[0] - 6, hy + 4]); C.fillStyle = '#12060f'; C.fill(); gl(hx + p[0] - 1, hy - 1, 3.2); });
        grin(hy + 13, 16); teeth(hx - 18, hx + 10, hy + 13, 7, 4);
        break;
      }
      case 'pharaoh': {
        poly([hx - hr - 12, hy - hr * 0.5, hx - hr * 0.5, hy - hr - 14, hx + hr * 0.5, hy - hr - 14, hx + hr + 12, hy - hr * 0.5, hx + hr + 18, hy + 44, hx - hr - 18, hy + 44]); fs(lg(hy - hr - 14, hy + 44, sh(ac, 0.25), sh(ac, -0.15)), sh(ac, -0.65), 4);
        C.save(); poly([hx - hr - 12, hy - hr * 0.5, hx - hr * 0.5, hy - hr - 14, hx + hr * 0.5, hy - hr - 14, hx + hr + 12, hy - hr * 0.5, hx + hr + 18, hy + 44, hx - hr - 18, hy + 44]); C.clip(); C.strokeStyle = '#1e3a8a'; C.lineWidth = 6; for (let i = 0; i < 7; i++) { C.beginPath(); C.moveTo(hx - hr - 20, hy - hr + i * 12); C.lineTo(hx + hr + 20, hy - hr + i * 12); C.stroke(); } C.restore();
        face(skin);
        [[-13, 1], [9, -1]].forEach((p) => { ell(hx + p[0], hy - 2, 8, 5); C.fillStyle = '#12060f'; C.fill(); gl(hx + p[0], hy - 2, 3); C.beginPath(); C.moveTo(hx + p[0] + p[1] * -8, hy - 2); C.lineTo(hx + p[0] + p[1] * -17, hy + 2); C.strokeStyle = '#12060f'; C.lineWidth = 2.5; C.stroke(); });
        C.beginPath(); C.moveTo(hx - 12, hy + 13); C.lineTo(hx + 4, hy + 13); C.strokeStyle = so; C.lineWidth = 3; C.stroke();
        rr(hx - 9, hy + hr - 4, 12, 26, 4); fs('#1e3a8a', sh(ac, -0.65), 2.5);
        horn(hx - 2, hy - hr - 10, -1.75, 26, 12, 8); fs('#3ddc84', '#0b4a2a', 2.5); circ(hx - 10, hy - hr - 34, 6); fs('#3ddc84', '#0b4a2a', 2.5);
        break;
      }
      case 'vampire': {
        poly([hx - hr - 16, hy + 30, hx - hr - 8, hy - hr * 0.4, hx - 4, hy + 10, hx + hr + 8, hy - hr * 0.4, hx + hr + 16, hy + 30]); fs(f.cape ? sh(f.cape, -0.1) : s, o, 4);
        tri(hx + hr * 0.85, hy - 2, -0.4, 20, 14); fs(skin, so, 3); tri(hx - hr * 0.85, hy - 2, Math.PI + 0.4, 20, 14); fs(skin, so, 3);
        face(skin);
        C.beginPath(); C.arc(hx, hy - 2, hr + 1, Math.PI * 1.0, Math.PI * 2.0); C.quadraticCurveTo(hx + 12, hy - 22, hx - 4, hy - 8); C.quadraticCurveTo(hx - 16, hy - 22, hx - hr - 1, hy - 2); C.closePath(); fs(hair, sh(hair, -0.5), 3);
        std(f.iris || '#ff2e4d', 1);
        grin(hy + 13, 13); tri(hx - 12, hy + 13, Math.PI / 2, 9, 5); C.fillStyle = '#fff'; C.fill(); tri(hx + 2, hy + 13, Math.PI / 2, 9, 5); C.fill();
        if (f.crown) crown(hx, hy - hr + 2, 38, '#ffd24a');
        break;
      }
      case 'angel': {
        limb([hx + 10, hy - 12, hx + 32, hy + 20, hx + 22 + br * 4, hy + 60], 14, hair, sh(hair, -0.4)); limb([hx - 14, hy - 12, hx - 30, hy + 16, hx - 26 + br * 3, hy + 46], 11, hair, sh(hair, -0.4));
        face('#f4f1ff');
        [[-14, 1], [8, -1]].forEach((p) => { poly([hx + p[0] - 8, hy - 3, hx + p[0] + 8, hy - 3 + p[1] * 3, hx + p[0] + 6, hy + 2, hx + p[0] - 6, hy + 2]); C.fillStyle = '#12060f'; C.fill(); gl(hx + p[0], hy - 1, 2.6); });
        C.beginPath(); C.moveTo(hx - 3, hy - hr + 4); C.lineTo(hx - 3, hy - 10); C.moveTo(hx - 3, hy + 8); C.lineTo(hx - 3, hy + hr - 4); C.strokeStyle = al(ac, 0.8); C.lineWidth = 2.5; C.stroke();
        break;
      }
      case 'ghoul': {
        face(skin);
        [[-14, 0], [8, 0]].forEach((p) => { circ(hx + p[0], hy - 3, 9); C.fillStyle = '#1a1220'; C.fill(); gl(hx + p[0] - 1, hy - 2, 3); });
        const mo = 8 + a.L * 10 + a.cast * 5 + Math.abs(br) * 2;
        ell(hx - 5, hy + 16, 12, mo); fs('#2a0714', so, 3); teeth(hx - 15, hx + 5, hy + 16 - mo * 0.7, 6, 3); teeth(hx - 15, hx + 5, hy + 16 + mo * 0.7, -6, 3);
        C.strokeStyle = al(so, 0.6); C.lineWidth = 2; C.beginPath(); C.moveTo(hx + 6, hy - hr + 4); C.lineTo(hx + 12, hy - 14); C.lineTo(hx + 4, hy - 10); C.stroke();
        break;
      }
      case 'priestess': {
        for (let i = 0; i < 5; i++) flame(hx - 24 + i * 12, hy - hr * 0.7, 16, 40 + Math.sin(t * 6 + i) * 8 - Math.abs(i - 2) * 6, t + i, i % 2 ? '#ffd166' : ac, null);
        C.beginPath(); C.moveTo(hx - hr - 6, hy + 40); C.quadraticCurveTo(hx - hr - 10, hy - hr - 6, hx, hy - hr - 4); C.quadraticCurveTo(hx + hr + 10, hy - hr - 6, hx + hr + 6, hy + 40); C.closePath(); fs(lg(hy - hr, hy + 40, sh(s, 0.2), sh(s, -0.3)), sh(s, -0.65), 4);
        face(skin); std(f.iris || ac, 1);
        C.beginPath(); C.moveTo(hx - 12, hy + 14); C.lineTo(hx, hy + 14); C.strokeStyle = so; C.lineWidth = 3; C.stroke();
        circ(hx - 3, hy - 16, 5); fs(ac, sh(ac, -0.5), 2);
        break;
      }
      default: face(skin); std(f.iris, 1); grin(hy + 14, 12);
    }
    // ---- 前手与武器 ----
    const th = 1.9 + a.cast * 1.1 + a.L * 0.7 + br * 0.03;
    const sx = -26, sy = -124 + ty;
    const ex = sx + Math.cos(th) * 24, ey = sy + Math.sin(th) * 24;
    const hxx = ex + Math.cos(th + 0.45) * 22, hyy = ey + Math.sin(th + 0.45) * 22;
    const ph = th + 1.9 - a.L * 1.4, dx = Math.cos(ph), dy = Math.sin(ph), wp = f.weapon || 'none';
    const metal = '#dfe7f2', mo2 = '#39414f';
    if (wp === 'sword' || wp === 'dagger') {
      const L = wp === 'sword' ? 82 : 40, tx = hxx + dx * L, tyy = hyy + dy * L, nx = -dy, ny = dx;
      if (f.wglow) glow((hxx + tx) / 2, (hyy + tyy) / 2, L * 0.8, ac, 0.4 + a.cast * 0.4);
      poly([hxx + nx * 5, hyy + ny * 5, tx + nx * 4 - dx * 10, tyy + ny * 4 - dy * 10, tx, tyy, tx - nx * 4 - dx * 10, tyy - ny * 4 - dy * 10, hxx - nx * 5, hyy - ny * 5]); fs(f.wglow ? lg(Math.min(hyy, tyy), Math.max(hyy, tyy) + 1, '#ffffff', ac) : metal, mo2, 2.5);
      limb([hxx + nx * 14, hyy + ny * 14, hxx - nx * 14, hyy - ny * 14], 6, '#c9a24a', '#4a3410'); limb([hxx, hyy, hxx - dx * 14, hyy - dy * 14], 5, '#6b4a2a', '#2a1a0c');
    } else if (wp === 'staff' || wp === 'scythe' || wp === 'spear' || wp === 'wand') {
      const L1 = wp === 'wand' ? 8 : 46, L2 = wp === 'wand' ? 42 : 88, tx = hxx + dx * L2, tyy = hyy + dy * L2;
      limb([hxx - dx * L1, hyy - dy * L1, tx, tyy], wp === 'wand' ? 4.5 : 6.5, '#7a5230', '#2a1a0c');
      if (wp === 'staff') { glow(tx, tyy, 34 + a.cast * 26, ac, 0.6 + a.cast * 0.4); circ(tx, tyy, 11); fs(rg(tx - 3, tyy - 3, 13, '#ffffff', ac), sh(ac, -0.55), 3); horn(tx - dx * 10 - dy * 8, tyy - dy * 10 + dx * 8, ph - 0.5, 22, 7, 6); fs('#c9a24a', '#4a3410', 2); horn(tx - dx * 10 + dy * 8, tyy - dy * 10 - dx * 8, ph + 0.5, 22, 7, -6); fs('#c9a24a', '#4a3410', 2); }
      if (wp === 'wand') { glow(tx, tyy, 26 + a.cast * 20, ac, 0.7); star(tx, tyy, 11, 5, 0.45, t); fs(ac, sh(ac, -0.5), 2); }
      if (wp === 'spear') { tri(tx, tyy, ph, 30, 16); fs(metal, mo2, 2.5); }
      if (wp === 'scythe') { C.save(); C.translate(tx, tyy); C.rotate(ph); C.beginPath(); C.moveTo(-6, 0); C.quadraticCurveTo(10, -50, -40, -74); C.quadraticCurveTo(-8, -50, -14, -4); C.closePath(); fs(lg(-74, 0, '#ffffff', metal), mo2, 2.5); C.restore(); if (f.wglow) glow(tx - 10, tyy - 20, 60, ac, 0.3 + a.cast * 0.4); }
    } else if (wp === 'bow') {
      C.beginPath(); C.arc(hxx + 30, hyy, 56, Math.PI * 0.72, Math.PI * 1.28); C.strokeStyle = '#2a1a0c'; C.lineWidth = 9; C.stroke(); C.strokeStyle = '#8a5a2b'; C.lineWidth = 5; C.stroke();
      const pull = a.cast * 20, y0 = hyy - 56 * Math.sin(0.28 * Math.PI), y1 = hyy + 56 * Math.sin(0.28 * Math.PI), bx0 = hxx + 30 - 56 * Math.cos(0.28 * Math.PI);
      C.beginPath(); C.moveTo(bx0, y0); C.lineTo(bx0 + 22 + pull, hyy); C.lineTo(bx0, y1); C.strokeStyle = '#f3efe6'; C.lineWidth = 1.8; C.stroke();
      if (a.cast > 0.1 && a.L < 0.4) { limb([bx0 + 22 + pull, hyy, hxx - 34 + pull, hyy], 3, '#c9a24a', '#2a1a0c'); tri(hxx - 34 + pull, hyy, Math.PI, 12, 9); fs(ac, sh(ac, -0.5), 1.5); }
    }
    limb([sx, sy, ex, ey], 14, armC, o); limb([ex, ey, hxx, hyy], 12, armC, o);
    circ(hxx, hyy, 8); fs(body === 'wrap' ? m : body === 'armor' ? sh(s, -0.1) : skin, body === 'armor' ? o : so, 3);
    if (wp === 'none') for (let i = -1; i <= 1; i++) { tri(hxx + Math.cos(th + 0.45 + i * 0.5) * 6, hyy + Math.sin(th + 0.45 + i * 0.5) * 6, th + 0.45 + i * 0.5, 12, 5); fs('#fffdf2', '#3a2a2a', 1.5); }
    if (f.boss) glow(0, -90, 150, ac, 0.12 + a.cast * 0.25);
  };

  /* ================= 幽灵 =================
   * f.v: wisp banshee butler candle djinn yuki wraith urn mirror */
  R.ghost = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = f.v || 'wisp', o = sh(m, -0.58), t = a.t;
    const fy = -26 + Math.sin(t * 2 + a.seed) * 8;
    const vessel = v === 'urn' || v === 'djinn';
    if (v === 'urn') { C.beginPath(); C.moveTo(-22, -52); C.quadraticCurveTo(-52, -30, -30, -2); C.lineTo(30, -2); C.quadraticCurveTo(52, -30, 22, -52); C.closePath(); fs(lg(-52, 0, sh(s, 0.25), sh(s, -0.3)), sh(s, -0.65), 4); rr(-26, -60, 52, 10, 4); fs(s, sh(s, -0.65), 3.5); C.strokeStyle = ac; C.lineWidth = 3; C.beginPath(); C.moveTo(-34, -26); C.lineTo(-18, -34); C.lineTo(0, -26); C.lineTo(18, -34); C.lineTo(34, -26); C.stroke(); }
    if (v === 'djinn') { ell(8, -10, 40, 14); fs(lg(-24, 4, sh(s, 0.3), sh(s, -0.3)), sh(s, -0.65), 4); horn(-28, -12, Math.PI + 0.3, 40, 12, 8); fs(s, sh(s, -0.65), 3); rr(-4, -4, 24, 6, 2); fs(s, sh(s, -0.65), 3); limb([46, -12, 62, -22, 50, -32], 5, s, sh(s, -0.65)); }
    if (v === 'mirror') { ell(0, -128, 78, 104); fs(lg(-232, -24, '#3a4a6a', '#141a2c'), null); ell(0, -128, 78, 104); fs(null, sh(s, -0.6), 16); fs(null, s, 9); [[0, -236], [0, -20], [-80, -128], [80, -128]].forEach((p) => { circ(p[0], p[1], 9); fs(ac, sh(s, -0.6), 3); }); shine(-34, -180, 18, 44, 0.5, 0.12); }
    C.translate(0, fy); C.rotate(-a.L * 0.15);
    const wv = (i) => Math.sin(t * 4 + i * 1.4) * 6;
    const ty = vessel ? -fy - 54 : -4;
    if (v === 'yuki' || v === 'banshee') { // 长发在身后
      const hc = v === 'yuki' ? '#1a1830' : s;
      for (let i = 0; i < 6; i++) tent(-62 + i * 25, -186, Math.PI / 2 - (i - 2.5) * 0.1, 158 - Math.abs(i - 2.5) * 10, 24, hc, sh(hc, -0.5), t, i, v === 'banshee' ? 0.5 : 0.22);
    }
    if (v === 'wraith') { for (let i = 0; i < 5; i++) tent(-40 + i * 20, -70, Math.PI / 2 + (i - 2) * 0.2, 80, 20, sh(m, -0.2), o, t, i * 1.3, 0.45); }
    glow(0, -130, 150, m, 0.22 + a.cast * 0.2);
    // 身体
    C.save(); C.globalAlpha = 0.93;
    C.beginPath(); C.moveTo(-54, -150); C.bezierCurveTo(-54, -218, 54, -218, 54, -150);
    if (vessel) { C.bezierCurveTo(62, -90, 36 + wv(0), -54, 14 + wv(1) * 0.4, ty); C.bezierCurveTo(-4 + wv(2), -50, -60, -84, -54, -150); }
    else {
      C.lineTo(56, -78);
      C.quadraticCurveTo(54 + wv(0), -44, 38 + wv(1), -14); C.quadraticCurveTo(24 + wv(2), -40, 8 + wv(3), -20);
      C.quadraticCurveTo(-8 + wv(4), -44, -24 + wv(5), -24); C.quadraticCurveTo(-38, -48, -54 + wv(6), -32);
    }
    C.closePath();
    const g = C.createLinearGradient(0, -214, 0, 0); g.addColorStop(0, sh(m, 0.35)); g.addColorStop(0.6, m); g.addColorStop(1, al(m, 0.35));
    fs(g, o, 4.5);
    C.restore();
    shine(-26, -190, 16, 8, -0.5, 0.4);
    // 手
    const up = a.cast * 34 + a.L * 20;
    const armc = v === 'wraith' ? '#efe9da' : sh(m, 0.1), armo = v === 'wraith' ? '#4a4338' : o, aw = v === 'wraith' ? 5 : 13;
    if (v === 'djinn') { limb([-50, -132, -70, -100, -22, -104], 17, m, o); limb([50, -132, 70, -100, 18, -110], 17, sh(m, -0.1), o); rr(-66, -112, 14, 9, 3); fs(ac, sh(ac, -0.6), 2); rr(52, -114, 14, 9, 3); fs(ac, sh(ac, -0.6), 2); }
    else if (v === 'banshee' || v === 'wraith' || v === 'yuki') {
      limb([-50, -124, -84, -118 - up * 0.6, -100 - a.L * 20, -140 - up], aw, armc, armo); limb([50, -124, 80, -116, 94, -136 - up * 0.5], aw, armc, armo);
      [[-100 - a.L * 20, -140 - up, Math.PI + 0.6], [94, -136 - up * 0.5, -0.6]].forEach((h) => { for (let i = -1; i <= 1; i++) limb([h[0], h[1], h[0] + Math.cos(h[2] - 0.5 + i * 0.5) * 16, h[1] + Math.sin(h[2] - 0.5 + i * 0.5) * 16], v === 'wraith' ? 3 : 4.5, armc, armo); });
    } else { ell(-58, -110 - up * 0.5, 14, 10, -0.5); fs(sh(m, 0.1), o, 3.5); ell(58, -108, 14, 10, 0.5); fs(sh(m, 0.1), o, 3.5); }
    // 脸
    const ey = -152, mo = a.L * 12 + a.cast * 7;
    if (v === 'banshee') {
      [[-24, 1], [14, -1]].forEach((p) => { poly([p[0] - 13, ey - 8 - p[1] * 5, p[0] + 13, ey - 8 + p[1] * 5, p[0] + 9, ey + 6, p[0] - 9, ey + 6]); C.fillStyle = '#12060f'; C.fill(); glow(p[0], ey, 16, ac, 0.9); circ(p[0], ey, 3.5); C.fillStyle = ac; C.fill(); });
      ell(-6, -116, 13, 16 + mo); fs('#12060f', o, 3);
    } else if (v === 'wraith') {
      C.beginPath(); C.moveTo(-62, -128); C.quadraticCurveTo(-66, -226, 4, -222); C.quadraticCurveTo(70, -220, 62, -128); C.quadraticCurveTo(40, -150, 30, -180); C.quadraticCurveTo(0, -200, -34, -180); C.quadraticCurveTo(-42, -150, -62, -128); C.closePath(); fs(lg(-224, -128, sh(s, 0.1), sh(s, -0.35)), sh(s, -0.7), 4);
      ell(-2, -160, 30, 26); C.fillStyle = '#07040c'; C.fill();
      eye(-16, -160, 6, { glow: ac }); eye(10, -160, 6, { glow: ac });
    } else if (v === 'djinn') {
      eyes(-6, ey - 4, 38, 10, { iris: f.iris || '#f7d038', blink: a.blink, angry: 1 });
      C.beginPath(); C.arc(-6, -126, 14, 0.15 * Math.PI, 0.85 * Math.PI); C.strokeStyle = o; C.lineWidth = 4; C.stroke();
      tri(-6, -106, Math.PI / 2, 20 + mo, 14); fs('#1a1830', '#0b0812', 2.5);
      C.beginPath(); C.moveTo(-56, -176); C.bezierCurveTo(-60, -236, 60, -236, 56, -176); C.quadraticCurveTo(0, -196, -56, -176); C.closePath(); fs(lg(-232, -176, sh(s, 0.3), sh(s, -0.2)), sh(s, -0.65), 4);
      glow(-4, -196, 22, ac, 0.7); ell(-4, -196, 9, 11); fs(ac, sh(ac, -0.5), 2.5);
      circ(-58, -140, 6); fs(null, '#ffd24a', 3); circ(58, -140, 6); fs(null, '#ffd24a', 3);
    } else if (v === 'yuki') {
      [[-22, 1], [12, -1]].forEach((p) => { C.beginPath(); C.arc(p[0], ey, 9, 0.05 * Math.PI, 0.95 * Math.PI); C.strokeStyle = '#1a1830'; C.lineWidth = 3.5; C.stroke(); glow(p[0], ey + 4, 14, ac, 0.6 + a.cast * 0.4); });
      ell(-5, -126, 5, 3 + mo * 0.5); fs('#b23a5a', null);
      C.beginPath(); C.moveTo(-38, -112); C.lineTo(-4, -74); C.lineTo(30, -112); C.strokeStyle = s; C.lineWidth = 7; C.stroke();
      rr(-50, -78, 100, 14, 5); C.fillStyle = al(ac, 0.9); C.fill(); C.strokeStyle = o; C.lineWidth = 3; C.stroke();
      C.beginPath(); C.arc(0, -160, 56, Math.PI * 1.02, Math.PI * 1.98); C.quadraticCurveTo(20, -176, -6, -172); C.quadraticCurveTo(-30, -176, -56, -158); C.closePath(); fs('#1a1830', '#0b0812', 3);
      for (let i = 0; i < 5; i++) { const an = t * 0.9 + (i / 5) * TAU; star(Math.cos(an) * 92, -130 + Math.sin(an) * 34, 8, 6, 0.4, t); C.fillStyle = al('#ffffff', 0.85); C.fill(); }
    } else {
      const sad = v === 'candle';
      [[-24, 1], [14, -1]].forEach((p) => { ell(p[0], ey, 11, 14 * (1 - a.blink * 0.9)); C.fillStyle = '#1a1230'; C.fill(); circ(p[0] - 3, ey - 4, 3.5); C.fillStyle = '#fff'; C.fill(); if (f.angry || v === 'urn') { C.beginPath(); C.moveTo(p[0] - p[1] * 14, ey - 22); C.lineTo(p[0] + p[1] * 12, ey - 13); C.strokeStyle = '#1a1230'; C.lineWidth = 4.5; C.stroke(); } });
      if (v === 'butler') { C.beginPath(); C.moveTo(-26, -128); C.quadraticCurveTo(-16, -138, -6, -128); C.quadraticCurveTo(4, -138, 14, -128); C.strokeStyle = '#1a1230'; C.lineWidth = 4.5; C.stroke(); }
      else { ell(-5, -124, 9, 6 + mo * (sad ? 0.6 : 1)); fs('#1a1230', null); }
      C.fillStyle = al('#ff8fa3', 0.45); ell(-38, -134, 8, 5); C.fill(); ell(28, -134, 8, 5); C.fill();
      if (a.cast > 0.2) glow(-5, -150, 70, ac, a.cast * 0.4);
    }
    if (v === 'butler') {
      circ(14, ey, 15); fs(null, '#ffd24a', 3); C.beginPath(); C.moveTo(28, ey + 4); C.quadraticCurveTo(40, -120, 34, -96); C.strokeStyle = '#ffd24a'; C.lineWidth = 2; C.stroke();
      poly([-4, -102, -26, -114, -26, -90]); fs(ac, sh(ac, -0.6), 3); poly([-4, -102, 18, -114, 18, -90]); fs(ac, sh(ac, -0.6), 3); circ(-4, -102, 5); fs(sh(ac, -0.2), sh(ac, -0.6), 2.5);
      ell(0, -206, 48, 9); fs('#1a1830', '#0b0812', 3.5); rr(-30, -256, 60, 50, 6); fs(lg(-256, -206, '#3a3558', '#1a1830'), '#0b0812', 3.5); rr(-30, -220, 60, 9, 2); fs(ac, sh(ac, -0.6), 2);
    }
    if (v === 'candle') {
      [[-40, -196, 13], [-12, -204, 16], [20, -202, 15], [42, -190, 11]].forEach((p) => { ell(p[0], p[1], p[2], p[2] * 1.2); fs('#fff6e0', '#b9a98a', 3); });
      rr(-13, -246, 26, 46, 5); fs(lg(-246, -200, '#fffaf0', '#e8d8b8'), '#b9a98a', 3.5);
      glow(0, -262, 60, ac, 0.6 + Math.sin(t * 9) * 0.1); flame(0, -246, 22, 40 + Math.sin(t * 8) * 4, t, ac, sh(ac, -0.4)); flame(0, -246, 11, 22, t + 1, '#fffbe0');
    }
    if (v === 'wisp') { for (let i = 0; i < 3; i++) { const an = t * 1.6 + (i / 3) * TAU; glow(Math.cos(an) * 84, -130 + Math.sin(an) * 30, 16, ac, 0.85); } }
    if (f.crown) crown(0, -206, 50, '#ffd24a');
  };

  /* ================= 魔像 =================
   * f.v: rock ice lava iron moss snow yeti gear sand meteor；f: spikes */
  R.golem = (C, d, a) => {
    const m = d.c[0], s = d.c[1], ac = d.c[2], f = d.f, v = f.v || 'rock', o = sh(m, -0.64), t = a.t;
    const br = Math.sin(t * 1.8 + a.seed);
    if (v === 'snow') { // 雪人
      C.rotate(Math.sin(t * 1.5) * 0.02 - a.L * 0.08);
      const up = a.cast * 30 + a.L * 20;
      limb([34, -116, 70, -128, 92, -150 + br * 4], 5, '#6b4a2a', '#2a1a0c'); limb([70, -128, 86, -116], 4, '#6b4a2a', '#2a1a0c');
      limb([-34, -116, -72, -130 - up * 0.5, -96, -154 - up], 5, '#6b4a2a', '#2a1a0c'); limb([-72, -130 - up * 0.5, -90, -120 - up * 0.5], 4, '#6b4a2a', '#2a1a0c');
      [[0, -46, 54], [0, -114, 40], [-2, -168, 30]].forEach((b) => { circ(b[0], b[1], b[2]); fs(rg(b[0] - b[2] * 0.3, b[1] - b[2] * 0.4, b[2] * 1.4, '#ffffff', m), o, 4.5); });
      [-128, -108, -88].forEach((y) => { circ(-6, y, 5); C.fillStyle = '#2a2233'; C.fill(); });
      C.beginPath(); C.moveTo(-30, -144); C.quadraticCurveTo(0, -132, 28, -146); C.lineTo(28, -136); C.quadraticCurveTo(0, -122, -30, -134); C.closePath(); fs(ac, sh(ac, -0.6), 3);
      limb([22, -138, 34, -112, 30 + Math.sin(t * 3) * 4, -92], 9, ac, sh(ac, -0.6));
      eye(-14, -174, 5, { glow: '#12060f' }); circ(-14, -174, 5); C.fillStyle = '#12060f'; C.fill(); circ(6, -174, 5); C.fill();
      C.beginPath(); C.moveTo(-22, -184); C.lineTo(-8, -180); C.moveTo(14, -184); C.lineTo(2, -180); C.strokeStyle = '#12060f'; C.lineWidth = 3.5; C.stroke();
      horn(-6, -166, Math.PI + 0.1, 30 + a.L * 6, 10, 0); fs('#ff8c2b', '#8a3c0a', 2.5);
      [-18, -10, -2, 6].forEach((x, i) => { circ(x, -152 + Math.abs(i - 1.5) * -2 + 3, 2.6); C.fillStyle = '#12060f'; C.fill(); });
      ell(-2, -192, 34, 8); fs(s, sh(s, -0.6), 3.5); rr(-22, -228, 40, 38, 5); fs(lg(-228, -190, sh(s, 0.2), sh(s, -0.2)), sh(s, -0.6), 3.5);
      return;
    }
    const yeti = v === 'yeti', ice = v === 'ice', iron = v === 'iron' || v === 'gear', lava = v === 'lava' || v === 'meteor';
    const grad = (y0, y1) => (ice ? lg(y0, y1, sh(m, 0.5), sh(m, -0.15)) : lg(y0, y1, sh(m, 0.22), sh(m, -0.32)));
    const block = (x, y, w, h, c) => {
      if (iron) rr(x, y, w, h, Math.min(w, h) * 0.22);
      else if (yeti) rr(x, y, w, h, Math.min(w, h) * 0.42);
      else { const k = c || Math.min(w, h) * 0.24; poly([x + k, y, x + w - k * 1.3, y + (ice ? -4 : 2), x + w, y + k, x + w - 2, y + h - k, x + w - k, y + h, x + k * 1.2, y + h, x, y + h - k * 1.1, x + 3, y + k]); }
      fs(grad(y, y + h), o, 4.5);
    };
    const fur = (x, y, w, n) => { for (let i = 0; i < n; i++) { tri(x + (i + 0.5) * (w / n), y, Math.PI / 2, 18, w / n + 4); fs(sh(m, -0.1), o, 3); } };
    C.translate(0, br * 1.5);
    const up = a.cast * 28 + a.L * 54;
    // 后臂
    limb([66, -138, 92, -110, 90, -62 + br * 3], 28, sh(m, -0.15), o); circ(90, -40 + br * 3, 28); fs(grad(-68, -12), o, 4.5);
    block(-52, -46, 42, 46); block(10, -46, 42, 46);
    if (f.spikes) [[-58, -150, -2.1], [-36, -160, -1.8], [58, -150, -1.0], [36, -160, -1.3]].forEach((p) => { tri(p[0], p[1], p[2], 44, 24); fs(lg(p[1] - 44, p[1], '#ffffff', s), sh(s, -0.55), 3); });
    block(-64, -156, 128, 118);
    if (yeti) fur(-60, -42, 120, 7);
    // 材质花纹
    C.save(); C.beginPath(); C.rect(-62, -154, 124, 114); C.clip();
    if (lava) { C.strokeStyle = ac; C.lineWidth = 4; C.globalAlpha = 0.75 + br * 0.2 + a.cast * 0.2; [[-50, -140, -20, -110, -34, -80], [30, -150, 14, -116, 44, -90], [-10, -70, 6, -52, -16, -44]].forEach((q) => { C.beginPath(); C.moveTo(q[0], q[1]); C.lineTo(q[2], q[3]); C.lineTo(q[4], q[5]); C.stroke(); }); C.globalAlpha = 1; }
    else if (ice) { C.strokeStyle = al('#ffffff', 0.7); C.lineWidth = 2.5; [[-50, -150, -10, -90], [-10, -90, 40, -150], [-10, -90, 6, -44], [-58, -70, -10, -90], [56, -74, -10, -90]].forEach((q) => { C.beginPath(); C.moveTo(q[0], q[1]); C.lineTo(q[2], q[3]); C.stroke(); }); }
    else if (iron) { C.strokeStyle = al(o, 0.6); C.lineWidth = 3; C.beginPath(); C.moveTo(-64, -112); C.lineTo(64, -112); C.moveTo(-64, -70); C.lineTo(64, -70); C.stroke(); C.fillStyle = sh(m, 0.35); [[-52, -144], [52, -144], [-52, -52], [52, -52], [-52, -92], [52, -92]].forEach((p) => { circ(p[0], p[1], 4); C.fill(); }); }
    else if (v === 'sand') { C.strokeStyle = al(o, 0.4); C.lineWidth = 3; [-128, -100, -72].forEach((y, i) => { C.beginPath(); C.moveTo(-64, y); C.quadraticCurveTo(0, y + (i % 2 ? 8 : -8), 64, y); C.stroke(); }); }
    else if (!yeti) { C.strokeStyle = al(o, 0.5); C.lineWidth = 3; [[-40, -150, -24, -118, -44, -96], [34, -140, 22, -104, 40, -84]].forEach((q) => { C.beginPath(); C.moveTo(q[0], q[1]); C.lineTo(q[2], q[3]); C.lineTo(q[4], q[5]); C.stroke(); }); }
    if (v === 'moss' || v === 'rock') { C.fillStyle = al(s, v === 'moss' ? 0.95 : 0.5); [[-40, -152, 24], [20, -156, 30], [56, -134, 16], [-58, -120, 14]].forEach((p) => { ell(p[0], p[1], p[2], p[2] * 0.6); C.fill(); }); }
    C.restore();
    if (v === 'moss') [[-30, -160], [34, -162]].forEach((p) => { rr(p[0] - 3, p[1] - 12, 6, 14, 2); fs('#f3efe6', '#7b7466', 2); ell(p[0], p[1] - 14, 11, 7); fs('#e0486a', '#7a1c34', 2); });
    // 胸口核心
    if (v === 'gear') { gear(-4, -98, 30, 8, t * 1.2); fs(lg(-128, -68, sh(s, 0.3), sh(s, -0.3)), sh(s, -0.65), 3); circ(-4, -98, 17); fs('#fbf6e4', sh(s, -0.65), 3); limb([-4, -98, -4 + Math.cos(t * 2) * 12, -98 + Math.sin(t * 2) * 12], 2.5, '#2a2233', null); limb([-4, -98, -4 + Math.cos(t * 0.3) * 8, -98 + Math.sin(t * 0.3) * 8], 3.5, '#2a2233', null); gear(40, -66, 14, 6, -t * 2.4); fs(s, sh(s, -0.65), 2.5); }
    else if (!yeti) { glow(-4, -98, 44 + a.cast * 30, ac, 0.45 + a.cast * 0.5 + br * 0.1); circ(-4, -98, 14); fs(rg(-8, -102, 16, '#ffffff', ac), sh(ac, -0.6), 3); C.beginPath(); C.arc(-4, -98, 22, 0, TAU); C.strokeStyle = al(ac, 0.6); C.lineWidth = 2.5; C.stroke(); }
    else { ell(-4, -92, 40, 46); C.fillStyle = al(s, 0.5); C.fill(); }
    // 头
    block(-38, -200, 66, 50);
    if (yeti) { horn(-28, -192, -2.2, 36, 15, 8); fs(ac, sh(ac, -0.6), 3); horn(24, -192, -0.95, 36, 15, -8); fs(ac, sh(ac, -0.6), 3); rr(-30, -190, 50, 32, 12); fs(lg(-190, -158, sh(s, 0.2), sh(s, -0.15)), sh(s, -0.6), 3); eyes(-8, -178, 26, 7, { iris: '#12060f', blink: a.blink, angry: 1 }); const mo = a.L * 8 + a.cast * 4; rr(-22, -168, 30, 7 + mo, 3); fs('#2a0714', sh(s, -0.6), 2); teeth(-20, 6, -168, 6, 4); fur(-36, -204, 62, 4); }
    else {
      if (v === 'meteor') for (let i = 0; i < 4; i++) flame(-28 + i * 16, -196, 20, 44 + Math.sin(t * 6 + i) * 8, t + i, i % 2 ? '#ffd166' : ac, null);
      if (iron) { rr(-32, -184, 50, 12, 3); C.fillStyle = '#0d0a14'; C.fill(); }
      [[-22, 1], [4, -1]].forEach((p) => { glow(p[0], -178, 20, ac, 0.8 + a.cast * 0.2); poly([p[0] - 8, -182 - p[1] * 3, p[0] + 8, -182 + p[1] * 3, p[0] + 6, -173, p[0] - 6, -173]); C.fillStyle = ac; C.fill(); });
      if (!iron) { C.beginPath(); C.moveTo(-26, -162); C.lineTo(-16, -158 + a.L * 4); C.lineTo(-8, -162); C.lineTo(2, -158 + a.L * 4); C.lineTo(10, -162); C.strokeStyle = o; C.lineWidth = 3.5; C.stroke(); }
      if (ice || f.spikes) { tri(-6, -200, -Math.PI / 2, 26, 16); fs(lg(-226, -200, '#ffffff', s), sh(s, -0.55), 2.5); tri(-24, -198, -1.9, 18, 12); fs(s, sh(s, -0.55), 2.5); tri(14, -198, -1.2, 18, 12); fs(s, sh(s, -0.55), 2.5); }
    }
    // 前臂（攻击时高举砸下）
    const sx = -66, sy = -138, ex = -96 - up * 0.1, ey = -106 - up * 0.9, fxx = -98 - a.L * 30, fyy = -44 - up * 1.5 + a.L * 30;
    limb([sx, sy, ex, ey], 30, m, o); limb([ex, ey, fxx, fyy + 20], 30, m, o);
    circ(fxx, fyy, 31); fs(grad(fyy - 31, fyy + 31), o, 4.5);
    if (lava) { glow(fxx, fyy, 50, ac, 0.35 + a.cast * 0.4); C.strokeStyle = ac; C.lineWidth = 3; C.beginPath(); C.moveTo(fxx - 14, fyy - 10); C.lineTo(fxx, fyy + 2); C.lineTo(fxx + 12, fyy - 6); C.stroke(); }
    if (yeti) { for (let i = -1; i <= 1; i++) { tri(fxx + i * 14 - 6, fyy + 22, Math.PI / 2 + 0.2, 14, 9); fs('#fffdf2', '#3a2a2a', 2); } }
    circ(-70, -140, 26); fs(grad(-166, -114), o, 4.5);
    if (ice) shine(-78, -150, 10, 5, -0.5, 0.6);
  };
})();
