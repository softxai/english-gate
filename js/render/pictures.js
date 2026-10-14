/* English Gate · 口语 Part 2「看图说话」用的插画
 *
 * 真实考试用的是日常生活的彩色照片；这里没有图片素材，全部用画布程序绘制。
 * 每幅图的逻辑尺寸是 600×400：EG.Pictures.draw(ctx, id, 宽, 高)。
 * 画面里有什么，要和 js/data/speaking.js 里对应题目的关键词保持一致。
 */
(function () {
  'use strict';
  const EG = window.EG, TAU = Math.PI * 2, D2R = Math.PI / 180;
  const P = (EG.Pictures = {});

  /* ---------- 基本图形 ---------- */
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const RR = (c, x, y, w, h, r, col) => {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
    if (col) { c.fillStyle = col; c.fill(); }
  };
  const C = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const E = (c, x, y, rx, ry, col, rot) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); c.fill(); };
  const L = (c, pts, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); };
  const G = (c, pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fill(); };
  const grad = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s) => g.addColorStop(s[0], s[1])); return g; };
  const shadow = (c, x, y, rx, ry) => E(c, x, y, rx, ry || rx * 0.22, 'rgba(0,0,0,.16)');

  /**
   * 画一个人。
   * x, y：站姿是脚底中点；坐姿（legs: 'sit' / 'ground'）是坐面上臀部的位置；half:1 时只画上半身，y 是腰。
   * k：缩放，成人 k=1 时约 132 高。
   * o：{ kid, skin, hair, style: short|long|pony|bun|bald|cap, capCol, top, bot, dress, apron, shoe,
   *      face: 1 右 / -1 左 / 0 正面 / 2 背面, la/ra: [上臂角, 前臂角]（度，0 朝下，正数朝外/朝前）,
   *      legs: stand|walk|sit|ground|kneel, lean（度）, mouth: smile|o|flat, glasses, lh/rh: 手里拿的东西 (c, x, y) }
   */
  function person(c, x, y, k, o) {
    o = o || {};
    const skin = o.skin || '#f2c9a0', hair = o.hair || '#3b2a20', top = o.top || '#4a90d9', bot = o.bot || '#34495e', shoe = o.shoe || '#2b2b33';
    const f = o.face === undefined ? 1 : o.face, back = f === 2, fx = back ? 0 : f;
    const kid = !!o.kid, legL = kid ? 38 : 56, torso = kid ? 34 : 46, hr = 13.5, arm = kid ? 15 : 21, shW = kid ? 12.5 : 16, limb = kid ? 8.5 : 10;
    const legs = o.half ? 'none' : o.legs || 'stand';
    c.save(); c.translate(x, y); c.scale(k, k); c.lineCap = 'round'; c.lineJoin = 'round';
    const hipY = legs === 'stand' || legs === 'walk' ? -legL : legs === 'kneel' ? -legL * 0.45 : 0;
    const lean = (o.lean || 0) * D2R, sn = Math.sin(lean), cs = Math.cos(lean);
    const up = (d) => [sn * d, hipY - cs * d]; // 沿躯干方向向上 d
    const sh = up(torso), hd = up(torso + hr + 2);
    const sdx = fx === 0 ? shW : shW * 0.45; // 肩的左右偏移（侧面时两肩靠拢）
    const armPts = (side, ang) => {
      const a = ang || [8, 4];
      const dir = fx === 0 ? side : fx; // 正面：左右臂各自朝外；侧面：两臂都朝面对的方向
      const a1 = lean + a[0] * D2R * dir, a2 = lean + (a[0] + a[1]) * D2R * dir;
      const s0 = [sh[0] + side * sdx * cs, sh[1] + 5 + side * sdx * sn];
      const el = [s0[0] + Math.sin(a1) * arm, s0[1] + Math.cos(a1) * arm];
      const ha = [el[0] + Math.sin(a2) * arm, el[1] + Math.cos(a2) * arm];
      return [s0, el, ha];
    };
    const drawArm = (side, ang, holdFn) => {
      const p = armPts(side, ang);
      L(c, [p[0], p[1]], o.sleeve === 0 ? skin : top, limb);
      L(c, [p[1], p[2]], o.sleeve === 2 ? top : skin, limb - 1.5);
      C(c, p[2][0], p[2][1], limb * 0.56, skin);
      if (holdFn) holdFn(c, p[2][0], p[2][1]);
    };
    const farSide = fx === 0 ? -1 : -fx;
    // 长发（在身体后面）
    if (o.style === 'long' && !back) RR(c, hd[0] - hr - 1.5 - fx * 2, hd[1] - 4, hr * 2 + 3, hr * 2 + 12, 9, hair);
    // 后侧手臂
    if (!back) drawArm(farSide, farSide === -1 ? o.la : o.ra, farSide === -1 ? o.lh : o.rh);
    // 腿
    const thigh = legL * 0.5, shin = legL * 0.5;
    if (legs === 'stand') {
      [-1, 1].forEach((s) => { L(c, [[s * 6, hipY + 2], [s * 7, -4]], bot, limb + 2.5); E(c, s * 7 + fx * 3, -2, 8, 4.2, shoe); });
    } else if (legs === 'walk') {
      [[-1, -10], [1, 12]].forEach((s) => { L(c, [[s[0] * 3, hipY + 2], [s[1] * (fx || 1), -4]], bot, limb + 2.5); E(c, s[1] * (fx || 1) + (fx || 1) * 3, -2, 8, 4.2, shoe); });
    } else if (legs === 'sit') {
      const dx = fx === 0 ? 0 : fx;
      [-1, 1].forEach((s) => {
        const kx = dx ? dx * thigh : s * 9, ky = dx ? 0 : thigh * 0.55;
        L(c, [[s * (dx ? 2 : 6), 0], [kx + s * (dx ? 2 : 0), ky], [kx + s * (dx ? 2 : 0), ky + shin]], bot, limb + 2.5);
        E(c, kx + s * (dx ? 2 : 0) + dx * 4, ky + shin + 2, 8, 4.2, shoe);
      });
    } else if (legs === 'ground') {
      [-1, 1].forEach((s) => { L(c, [[s * 5, -3], [s * 24, 2], [s * 4, 7]], bot, limb + 2.5); E(c, s * 3, 8, 7, 4, shoe); });
    } else if (legs === 'kneel') {
      const dx = fx || 1;
      [-1, 1].forEach((s) => { L(c, [[s * 3, hipY + 2], [dx * 6 + s * 3, -5], [-dx * 20 + s * 3, -4]], bot, limb + 2.5); E(c, -dx * 24, -3, 7, 4, shoe); });
    }
    // 躯干
    const wTop = fx === 0 || back ? shW + 4 : shW * 0.8 + 3, wBot = fx === 0 || back ? shW + 1 : shW * 0.75 + 2;
    const tl = [sh[0] - wTop * cs, sh[1] - wTop * sn + 2], tr = [sh[0] + wTop * cs, sh[1] + wTop * sn + 2];
    const bl = [-wBot, hipY + 3], br = [wBot, hipY + 3];
    c.fillStyle = o.dress || top; c.beginPath(); c.moveTo(tl[0], tl[1] + 5); c.quadraticCurveTo(tl[0], tl[1] - 3, tl[0] + 6, tl[1] - 3); c.lineTo(tr[0] - 6, tr[1] - 3); c.quadraticCurveTo(tr[0], tr[1] - 3, tr[0], tr[1] + 5); c.lineTo(br[0], br[1]); c.lineTo(bl[0], bl[1]); c.closePath(); c.fill();
    if (o.dress && legs !== 'none') G(c, [[bl[0], bl[1] - 6], [br[0], br[1] - 6], [br[0] + 9, hipY + legL * 0.42], [bl[0] - 9, hipY + legL * 0.42]], o.dress);
    if (o.apron && !back) { RR(c, sh[0] - wBot * 0.72, sh[1] + 9, wBot * 1.44, torso - 6, 4, o.apron); L(c, [[sh[0] - 5, sh[1] + 9], [sh[0] - 6, sh[1] - 1]], o.apron, 2.2); L(c, [[sh[0] + 5, sh[1] + 9], [sh[0] + 6, sh[1] - 1]], o.apron, 2.2); }
    // 脖子和头
    L(c, [[sh[0], sh[1]], [hd[0], hd[1] + hr - 3]], skin, 7);
    if (back) {
      C(c, hd[0], hd[1], hr, skin); C(c, hd[0], hd[1] - 1.5, hr + 0.6, hair);
      if (o.style === 'long') RR(c, hd[0] - hr - 1, hd[1] - 2, hr * 2 + 2, hr * 2 + 10, 9, hair);
      if (o.style === 'pony') E(c, hd[0], hd[1] + hr + 5, 5, 11, hair);
      if (o.style === 'bald') C(c, hd[0], hd[1] + 2, hr - 1.5, skin);
    } else {
      if (o.style !== 'bald') C(c, hd[0] - fx * 2.6, hd[1] - 2.8, hr + 1.2, hair);
      if (o.style === 'pony') E(c, hd[0] - (fx || 1) * (hr + 5), hd[1] + 3, 5, 10, hair, (fx || 1) * 0.5);
      if (o.style === 'bun') C(c, hd[0] - fx * 3, hd[1] - hr - 4, 6.5, hair);
      C(c, hd[0] + fx * 1.2, hd[1] + 1.4, hr - 0.6, skin);
      if (o.style === 'bald') { C(c, hd[0], hd[1], hr, skin); c.strokeStyle = hair; c.lineWidth = 3; c.beginPath(); c.arc(hd[0], hd[1], hr - 1, Math.PI * 0.95, Math.PI * 1.25); c.stroke(); c.beginPath(); c.arc(hd[0], hd[1], hr - 1, -Math.PI * 0.25, Math.PI * 0.05); c.stroke(); }
      if (o.style === 'cap') { c.fillStyle = o.capCol || '#e5484d'; c.beginPath(); c.arc(hd[0], hd[1] - 1, hr + 1, Math.PI, TAU); c.fill(); RR(c, hd[0] + (fx || 1) * 2 - (fx < 0 ? 14 : 0), hd[1] - 4, 14, 4.5, 2, o.capCol || '#e5484d'); }
      if (o.hat) { G(c, [[hd[0] - 9, hd[1] - hr + 3], [hd[0] + 9, hd[1] - hr + 3], [hd[0] + 1, hd[1] - hr - 22]], o.hat); C(c, hd[0] + 1, hd[1] - hr - 22, 3.2, '#fff7d6'); }
      // 脸
      const ex = hd[0] + fx * 4, ey = hd[1] + 0.5;
      C(c, ex - 4.2, ey, 1.7, '#2b2b33'); C(c, ex + 4.2, ey, 1.7, '#2b2b33');
      if (o.glasses) { c.strokeStyle = '#2b2b33'; c.lineWidth = 1.3; c.beginPath(); c.arc(ex - 4.2, ey, 3.6, 0, TAU); c.stroke(); c.beginPath(); c.arc(ex + 4.2, ey, 3.6, 0, TAU); c.stroke(); }
      C(c, ex - 7, ey + 4.5, 2.6, 'rgba(240,120,120,.28)'); C(c, ex + 7, ey + 4.5, 2.6, 'rgba(240,120,120,.28)');
      if (o.mouth === 'o') C(c, ex, ey + 6.2, 2.3, '#9b3b3b');
      else if (o.mouth === 'flat') L(c, [[ex - 3, ey + 6], [ex + 3, ey + 6]], '#9b3b3b', 1.5);
      else { c.strokeStyle = '#9b3b3b'; c.lineWidth = 1.6; c.beginPath(); c.arc(ex, ey + 3.4, 4.2, Math.PI * 0.18, Math.PI * 0.82); c.stroke(); }
      if (o.beard) { c.fillStyle = o.beard; c.beginPath(); c.arc(ex, ey + 4, 8.5, Math.PI * 0.05, Math.PI * 0.95); c.fill(); C(c, ex, ey + 5.6, 2.2, '#9b3b3b'); }
    }
    // 前侧手臂
    if (back) { drawArm(-1, o.la, o.lh); drawArm(1, o.ra, o.rh); }
    else drawArm(-farSide, -farSide === -1 ? o.la : o.ra, -farSide === -1 ? o.lh : o.rh);
    c.restore();
  }
  P.person = person;

  /* ---------- 常用小道具 ---------- */
  const tree = (c, x, y, s, col) => { R(c, x - 5 * s, y - 46 * s, 10 * s, 48 * s, '#7a5230'); C(c, x, y - 70 * s, 30 * s, col); C(c, x - 22 * s, y - 52 * s, 22 * s, col); C(c, x + 22 * s, y - 52 * s, 22 * s, col); C(c, x - 8 * s, y - 80 * s, 10 * s, 'rgba(255,255,255,.14)'); };
  const cloud = (c, x, y, s) => { C(c, x, y, 16 * s, '#fff'); C(c, x + 18 * s, y - 6 * s, 20 * s, '#fff'); C(c, x + 40 * s, y, 15 * s, '#fff'); RR(c, x - 6 * s, y - 2 * s, 54 * s, 16 * s, 8 * s, '#fff'); };
  const windowBox = (c, x, y, w, h, sky) => { RR(c, x - 5, y - 5, w + 10, h + 10, 4, '#ffffff'); R(c, x, y, w, h, sky); R(c, x + w / 2 - 2, y, 4, h, '#ffffff'); R(c, x, y + h / 2 - 2, w, 4, '#ffffff'); };
  const balloon = (c, x, y, col, len) => { L(c, [[x, y + 20], [x + 3, y + 20 + len * 0.5], [x - 2, y + 20 + len]], 'rgba(60,60,80,.55)', 1.2); E(c, x, y, 15, 19, col); G(c, [[x - 4, y + 22], [x + 4, y + 22], [x, y + 17]], col); E(c, x - 5, y - 7, 3.5, 6, 'rgba(255,255,255,.4)', 0.4); };
  const steam = (c, x, y) => { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.lineCap = 'round'; [-10, 0, 10].forEach((d, i) => { c.beginPath(); c.moveTo(x + d, y); c.bezierCurveTo(x + d - 6, y - 10, x + d + 7, y - 18, x + d - 2 + i, y - 30); c.stroke(); }); };
  const plate = (c, x, y, r) => { E(c, x, y, r, r * 0.34, '#f4f6f8'); E(c, x, y - 1, r * 0.68, r * 0.2, '#e3e8ee'); };
  const umbrella = (c, x, y, r, col, col2) => {
    L(c, [[x, y], [x, y + r * 1.25]], '#4a4a55', 2.5);
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r, Math.PI, TAU); c.closePath(); c.fill();
    if (col2) { c.fillStyle = col2; c.beginPath(); c.moveTo(x, y - r); c.arc(x, y, r, -Math.PI * 0.68, -Math.PI * 0.32); c.closePath(); c.fill(); }
    for (let i = 0; i < 4; i++) C(c, x - r + r * 0.25 + i * r * 0.5, y, r * 0.25, 'rgba(0,0,0,.001)');
  };

  /* ---------- 八幅图 ---------- */
  const PIC = {};

  /* 1. 一家人在厨房做饭 */
  PIC.kitchen = (c) => {
    R(c, 0, 0, 600, 400, '#f7e9c9');
    R(c, 0, 150, 600, 70, '#e7f1f0'); c.strokeStyle = 'rgba(120,150,160,.28)'; c.lineWidth = 1; for (let x = 0; x <= 600; x += 30) { c.beginPath(); c.moveTo(x, 150); c.lineTo(x, 220); c.stroke(); } [173, 196].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(600, y); c.stroke(); });
    windowBox(c, 46, 34, 150, 100, grad(c, 0, 34, 0, 134, [[0, '#8fd0f5'], [1, '#d9f2ff']])); cloud(c, 70, 70, 0.6); C(c, 168, 58, 13, '#ffe27a');
    RR(c, 96, 118, 34, 20, 4, '#c96f4a'); E(c, 104, 108, 8, 14, '#4caf50', -0.5); E(c, 122, 106, 8, 15, '#5fbf5a', 0.5); E(c, 113, 100, 7, 15, '#3f9a48');
    C(c, 262, 70, 22, '#ffffff'); C(c, 262, 70, 19, '#fdf6e3'); L(c, [[262, 70], [262, 56]], '#2b2b33', 2.5); L(c, [[262, 70], [273, 74]], '#2b2b33', 2.5); C(c, 262, 70, 2, '#e5484d');
    RR(c, 318, 26, 196, 96, 5, '#b77a48'); [320, 386, 452].forEach((x) => { RR(c, x + 3, 31, 58, 86, 3, '#c98c58'); C(c, x + 54, 76, 3, '#f5e6c8'); });
    RR(c, 528, 78, 72, 232, 6, '#e3e9ee'); R(c, 528, 168, 72, 3, '#b9c4cc'); RR(c, 536, 104, 5, 46, 2, '#9aa7b0'); RR(c, 536, 186, 5, 60, 2, '#9aa7b0');
    R(c, 0, 200, 528, 14, '#d8c3a0'); R(c, 0, 214, 528, 60, '#9a6a42'); [20, 150, 280, 410].forEach((x) => { RR(c, x, 222, 110, 44, 3, '#a97850'); C(c, x + 96, 244, 3, '#f5e6c8'); });
    // 三个人站在料理台后面
    person(c, 118, 310, 1.55, { half: 1, face: 1, hair: '#5a3a26', style: 'bun', top: '#e86a8a', apron: '#fff6e8', la: [30, -60], ra: [52, -62], rh: (cc, x, y) => { L(cc, [[x, y - 4], [x + 6, y + 24]], '#b98a5a', 2.4); } });
    person(c, 330, 310, 1.6, { half: 1, face: 0, hair: '#2b2b33', style: 'short', glasses: 1, top: '#3f7fc4', la: [16, -62], ra: [16, -66], rh: (cc, x, y) => { G(cc, [[x - 2, y - 2], [x + 16, y + 6], [x + 16, y + 9], [x - 2, y + 4]], '#dfe6ea'); RR(cc, x - 8, y - 3, 8, 6, 2, '#2b2b33'); } });
    person(c, 486, 312, 1.5, { half: 1, kid: 1, face: 0, hair: '#3b2a20', style: 'pony', top: '#f5c542', la: [14, -70], ra: [14, -70] });
    // 料理台
    R(c, 0, 286, 600, 16, '#f1e2c4'); R(c, 0, 302, 600, 98, '#7fb7b0'); R(c, 0, 302, 600, 6, 'rgba(0,0,0,.12)'); [60, 220, 380, 540].forEach((x) => R(c, x, 314, 3, 86, 'rgba(0,0,0,.1)'));
    // 锅和炉子
    RR(c, 150, 278, 100, 12, 3, '#3a3a44'); RR(c, 166, 248, 68, 34, 6, '#9aa5b1'); R(c, 162, 248, 76, 7, '#b9c3cd'); RR(c, 146, 256, 20, 7, 3, '#5a5a66'); RR(c, 234, 256, 20, 7, 3, '#5a5a66'); steam(c, 204, 240);
    // 砧板和蔬菜
    RR(c, 268, 277, 128, 13, 3, '#e3b77a'); C(c, 290, 270, 10, '#e5484d'); R(c, 288, 258, 4, 4, '#3f9a48'); C(c, 312, 272, 8.5, '#f0554f');
    G(c, [[330, 274], [372, 268], [372, 278]], '#f08a2e'); E(c, 378, 273, 8, 5, '#4caf50', -0.3);
    for (let i = 0; i < 5; i++) E(c, 344 + i * 7, 283, 4, 2, '#f6a04a');
    // 女孩端着一碗沙拉，桌上还有盘子
    E(c, 486, 280, 32, 9, '#ffffff'); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(486, 280, 32, 0, Math.PI); c.fill();
    E(c, 486, 278, 27, 6.5, '#6cc04a'); C(c, 474, 276, 5, '#e5484d'); C(c, 496, 277, 4.5, '#ffd166'); C(c, 485, 274, 4, '#f0554f'); E(c, 504, 274, 6, 3, '#3f9a48');
    plate(c, 46, 298, 28); plate(c, 46, 293, 28);
    RR(c, 556, 262, 22, 28, 4, '#f6f1e6'); R(c, 562, 248, 3, 18, '#b98a5a'); R(c, 568, 244, 3, 22, '#c9a06a'); R(c, 573, 250, 3, 16, '#b98a5a');
  };

  /* 2. 朋友们在公园野餐 */
  PIC.picnic = (c) => {
    R(c, 0, 0, 600, 240, grad(c, 0, 0, 0, 240, [[0, '#7cc4f2'], [1, '#d6f0ff']]));
    C(c, 520, 62, 30, '#ffe27a'); C(c, 520, 62, 44, 'rgba(255,226,122,.25)'); cloud(c, 70, 60, 1); cloud(c, 300, 44, 0.8);
    c.fillStyle = '#9ed27f'; c.beginPath(); c.moveTo(0, 220); c.quadraticCurveTo(150, 150, 320, 205); c.quadraticCurveTo(470, 160, 600, 200); c.lineTo(600, 260); c.lineTo(0, 260); c.fill();
    tree(c, 60, 238, 1.5, '#3f9a48'); tree(c, 548, 232, 1.25, '#4caf50'); tree(c, 430, 214, 0.75, '#5fbf5a');
    R(c, 0, 228, 600, 172, grad(c, 0, 228, 0, 400, [[0, '#7fc46a'], [1, '#4f9a4a']]));
    E(c, 236, 232, 86, 15, '#8fd6f2'); E(c, 236, 230, 70, 9, '#b9e9fb');
    // 风筝
    G(c, [[372, 78], [392, 102], [372, 132], [352, 102]], '#e5484d'); G(c, [[372, 78], [392, 102], [372, 102]], '#ffd166'); L(c, [[372, 132], [380, 150], [370, 166], [380, 182]], 'rgba(60,60,80,.6)', 1.3);
    // 靠在树上的自行车
    c.strokeStyle = '#2b2b33'; c.lineWidth = 3; [[96, 250], [146, 250]].forEach((p) => { c.beginPath(); c.arc(p[0], p[1], 18, 0, TAU); c.stroke(); }); L(c, [[96, 250], [116, 224], [140, 224], [146, 250]], '#e5484d', 3.2); L(c, [[116, 224], [124, 250], [140, 224]], '#e5484d', 3.2); L(c, [[110, 218], [122, 218]], '#2b2b33', 4); L(c, [[140, 224], [142, 212], [150, 210]], '#2b2b33', 3);
    // 野餐垫
    G(c, [[110, 306], [540, 296], [590, 380], [70, 392]], '#e5484d');
    c.save(); c.beginPath(); c.moveTo(110, 306); c.lineTo(540, 296); c.lineTo(590, 380); c.lineTo(70, 392); c.closePath(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 6; for (let i = 0; i < 17; i++) { c.beginPath(); c.moveTo(60 + i * 36, 290); c.lineTo(20 + i * 40, 396); c.stroke(); } for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(60, 314 + i * 20); c.lineTo(600, 304 + i * 20); c.stroke(); } c.restore();
    // 四个朋友坐在垫子上
    person(c, 172, 336, 1.3, { legs: 'ground', face: 1, hair: '#2b2b33', style: 'short', top: '#3f7fc4', bot: '#5a6b7a', la: [50, -40], ra: [30, -70], lean: 3 });
    // 吉他（横抱在身前）
    c.save(); c.translate(196, 312); c.rotate(1.25); E(c, 0, 10, 19, 23, '#c98c58'); E(c, 0, -10, 14, 16, '#c98c58'); C(c, 0, 3, 6.5, '#5a3a26'); R(c, -3.5, -70, 7, 56, '#7a5230'); RR(c, -6, -82, 12, 14, 2, '#5a3a26'); c.restore();
    person(c, 300, 326, 1.3, { legs: 'ground', face: 0, hair: '#8a5a2b', style: 'long', top: '#f5c542', bot: '#4a6fa5', la: [30, -100], ra: [44, -120], rh: (cc, x, y) => { G(cc, [[x - 9, y - 2], [x + 9, y - 2], [x, y - 14]], '#f6e2b0'); R(cc, x - 9, y - 4, 18, 3, '#6cc04a'); } });
    person(c, 414, 332, 1.3, { legs: 'ground', face: -1, hair: '#3b2a20', style: 'pony', top: '#ff8fb1', bot: '#3b4a6b', la: [36, -70], ra: [34, -78], rh: (cc, x, y) => { RR(cc, x - 6, y - 16, 12, 20, 3, '#ffb347'); R(cc, x - 5, y - 20, 10, 5, '#ffffff'); } });
    person(c, 516, 322, 1.3, { legs: 'ground', face: -1, hair: '#2b2b33', style: 'cap', capCol: '#3f9a48', top: '#ffffff', bot: '#5a6b7a', la: [20, 6], ra: [60, -130], lean: -3 });
    // 篮子、水果、饮料
    RR(c, 330, 350, 54, 30, 6, '#b98a5a'); c.strokeStyle = '#8a5a2b'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(334 + i * 12, 352); c.lineTo(334 + i * 12, 378); c.stroke(); } c.beginPath(); c.arc(357, 350, 22, Math.PI, TAU); c.lineWidth = 4; c.stroke();
    C(c, 250, 368, 9, '#e5484d'); C(c, 266, 372, 9, '#f08a2e'); E(c, 232, 376, 13, 5, '#ffd84a', -0.3); plate(c, 440, 372, 22); G(c, [[430, 368], [450, 368], [440, 356]], '#f6e2b0'); R(c, 430, 366, 20, 3, '#e5484d');
    RR(c, 484, 352, 11, 24, 3, '#7fd0e8'); R(c, 486, 346, 7, 7, '#ffffff');
    // 小狗
    E(c, 50, 352, 26, 15, '#c9a06a'); C(c, 76, 338, 12, '#c9a06a'); E(c, 85, 331, 5, 9, '#8a5a2b', 0.5); C(c, 80, 336, 1.8, '#2b2b33'); C(c, 87, 341, 2.4, '#2b2b33'); L(c, [[26, 346], [16, 332]], '#c9a06a', 5); L(c, [[38, 362], [36, 374]], '#c9a06a', 6); L(c, [[64, 362], [66, 374]], '#c9a06a', 6);
  };

  /* 3. 课堂上 */
  PIC.classroom = (c) => {
    R(c, 0, 0, 600, 400, '#f3ead2'); R(c, 0, 250, 600, 150, '#c9a06a'); c.strokeStyle = 'rgba(90,60,30,.18)'; c.lineWidth = 1.5; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(i * 100 - 40, 250); c.lineTo(i * 130 - 130, 400); c.stroke(); }
    R(c, 0, 244, 600, 8, '#a97850');
    // 白板
    RR(c, 120, 40, 290, 150, 5, '#8a6a4a'); R(c, 128, 48, 274, 134, '#ffffff'); R(c, 128, 182, 274, 6, '#b9c4cc');
    c.fillStyle = '#2f6fb0'; c.font = '700 24px "Trebuchet MS",sans-serif'; c.textAlign = 'left'; c.fillText('My weekend', 146, 82);
    L(c, [[146, 90], [286, 90]], '#e5484d', 2.5);
    c.fillStyle = '#2b2b33'; c.font = '600 15px "Trebuchet MS",sans-serif'; c.fillText('1. play football', 150, 116); c.fillText('2. visit my grandma', 150, 140); c.fillText('3. watch a film', 150, 164);
    R(c, 330, 184, 26, 5, '#e5484d'); R(c, 362, 184, 26, 5, '#2f6fb0');
    // 窗户、地图、时钟、书架
    windowBox(c, 474, 44, 96, 118, grad(c, 0, 44, 0, 162, [[0, '#8fd0f5'], [1, '#d9f2ff']])); C(c, 500, 150, 26, '#5fbf5a'); C(c, 546, 156, 22, '#4caf50');
    RR(c, 18, 60, 84, 62, 3, '#ffffff'); R(c, 22, 64, 76, 54, '#8fd0f5'); E(c, 44, 86, 13, 10, '#6cc04a', 0.3); E(c, 74, 92, 14, 12, '#6cc04a', -0.4); E(c, 62, 76, 8, 5, '#6cc04a');
    C(c, 440, 62, 17, '#ffffff'); C(c, 440, 62, 14.5, '#fdf6e3'); L(c, [[440, 62], [440, 52]], '#2b2b33', 2.2); L(c, [[440, 62], [447, 62]], '#2b2b33', 2.2);
    RR(c, 16, 150, 70, 96, 3, '#a97850'); [0, 1, 2].forEach((r) => { R(c, 20, 156 + r * 30, 62, 22, '#7a5230'); ['#e5484d', '#3f7fc4', '#f5c542', '#4caf50', '#8e4ec6', '#f08a2e'].forEach((col, i) => R(c, 23 + i * 9.5 + r * 2, 159 + r * 30, 7.5, 19, col)); });
    // 老师站在白板旁，手指着黑板
    shadow(c, 452, 262, 30);
    person(c, 452, 260, 1.12, { face: -1, hair: '#5a3a26', style: 'bun', glasses: 1, top: '#3f9a8a', bot: '#3b4a6b', dress: 0, la: [14, 8], ra: [104, 12], rh: (cc, x, y) => L(cc, [[x, y], [x - 34, y - 16]], '#7a5230', 2.6) });
    // 三张课桌和学生的背影
    const desk = (x, y) => { G(c, [[x - 58, y], [x + 58, y], [x + 68, y + 20], [x - 68, y + 20]], '#e3c08c'); R(c, x - 68, y + 20, 136, 7, '#b98a5a'); R(c, x - 60, y + 27, 6, 60, '#8a6a4a'); R(c, x + 54, y + 27, 6, 60, '#8a6a4a'); };
    desk(120, 306); desk(300, 306); desk(480, 306);
    RR(c, 84, 300, 40, 9, 2, '#ffffff'); RR(c, 280, 298, 44, 12, 2, '#3f7fc4'); RR(c, 452, 300, 38, 9, 2, '#ffffff'); L(c, [[130, 302], [150, 296]], '#f5c542', 3);
    person(c, 120, 400, 1.2, { half: 1, face: 2, hair: '#2b2b33', style: 'short', top: '#e5484d', la: [12, 6], ra: [-158, -12] });
    person(c, 300, 400, 1.2, { half: 1, face: 2, hair: '#8a5a2b', style: 'long', top: '#f5c542', la: [20, -40], ra: [20, -40] });
    person(c, 480, 400, 1.2, { half: 1, face: 2, hair: '#3b2a20', style: 'pony', top: '#7a5fd0', la: [14, 4], ra: [26, -50] });
  };

  /* 4. 水果蔬菜市场 */
  PIC.market = (c) => {
    R(c, 0, 0, 600, 250, grad(c, 0, 0, 0, 250, [[0, '#8fd0f5'], [1, '#e6f6ff']])); cloud(c, 40, 50, 0.9);
    // 远处的房子
    [[0, 110, 120, '#e9c9a0'], [120, 80, 110, '#d9a77a'], [230, 120, 90, '#f0d9b5'], [470, 96, 130, '#e3b98c']].forEach((b) => { R(c, b[0], b[1], b[2], 250 - b[1], b[3]); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(c, b[0] + 14 + i * (b[2] - 28) / 3, b[1] + 16 + j * 38, 16, 22, 'rgba(90,120,150,.5)'); G(c, [[b[0] - 4, b[1]], [b[0] + b[2] + 4, b[1]], [b[0] + b[2] / 2, b[1] - 22]], '#b55a3a'); });
    R(c, 0, 250, 600, 150, '#d9cdb8'); c.strokeStyle = 'rgba(120,100,80,.2)'; c.lineWidth = 1.5; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(i * 80 - 20, 250); c.lineTo(i * 100 - 100, 400); c.stroke(); } [290, 340].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(600, y); c.stroke(); });
    // 摊位：柱子、条纹遮阳篷
    R(c, 232, 96, 8, 200, '#8a6a4a'); R(c, 560, 96, 8, 200, '#8a6a4a');
    for (let i = 0; i < 9; i++) G(c, [[214 + i * 42, 62], [256 + i * 42, 62], [262 + i * 42, 118], [220 + i * 42, 118]], i % 2 ? '#ffffff' : '#e5484d');
    for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e5484d'; c.beginPath(); c.arc(241 + i * 42, 118, 21, 0, Math.PI); c.fill(); }
    // 卖水果的大叔在摊位后面
    person(c, 430, 262, 1.16, { half: 1, face: -1, hair: '#6b6b76', style: 'short', beard: '#6b6b76', top: '#4caf50', apron: '#f6f1e6', la: [70, -60], ra: [20, -60], lh: (cc, x, y) => { RR(cc, x - 13, y - 2, 24, 26, 5, '#f6e2b0'); C(cc, x - 4, y + 2, 6, '#e5484d'); C(cc, x + 5, y + 4, 6, '#f08a2e'); } });
    // 台面和几箱水果蔬菜
    R(c, 226, 250, 350, 12, '#b98a5a'); R(c, 232, 262, 338, 78, '#8a6a4a'); R(c, 232, 262, 338, 6, 'rgba(0,0,0,.14)');
    const crate = (x, y, w, fill, n, r) => { G(c, [[x, y], [x + w, y], [x + w + 6, y + 34], [x - 6, y + 34]], '#d9b98a'); R(c, x - 6, y + 30, w + 12, 5, '#b98a5a'); for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) C(c, x + r + 2 + i * ((w - 2 * r - 4) / Math.max(1, n - 1)) + (j ? r * 0.6 : 0), y + 4 - j * r * 1.1, r, fill[(i + j) % fill.length]); };
    crate(242, 222, 70, ['#e5484d', '#f0554f'], 5, 8); crate(326, 222, 70, ['#f08a2e', '#f6a04a'], 5, 8); crate(492, 222, 70, ['#6cc04a', '#8fd06a'], 4, 10);
    // 香蕉
    c.strokeStyle = '#ffd84a'; c.lineWidth = 7; c.lineCap = 'round'; [0, 1, 2].forEach((i) => { c.beginPath(); c.arc(430 + i * 9, 218, 22, Math.PI * 0.15, Math.PI * 0.8); c.stroke(); });
    // 西瓜和价格牌
    E(c, 278, 300, 30, 24, '#2f8f4a'); c.strokeStyle = '#1f6b36'; c.lineWidth = 3; [-14, 0, 14].forEach((d) => { c.beginPath(); c.ellipse(278 + d, 300, 6, 23, 0, 0, TAU); c.stroke(); });
    RR(c, 326, 280, 62, 42, 4, '#fff8e1'); c.fillStyle = '#2b2b33'; c.font = '700 13px "Trebuchet MS",sans-serif'; c.textAlign = 'center'; c.fillText('FRESH', 357, 297); c.fillText('FRUIT', 357, 314);
    // 秤
    RR(c, 520, 196, 36, 8, 3, '#9aa5b1'); R(c, 535, 204, 6, 40, '#6b7682'); C(c, 538, 220, 12, '#f4f6f8'); L(c, [[538, 220], [545, 213]], '#e5484d', 2);
    // 左边：妈妈提着篮子在买东西，小男孩指着西瓜
    shadow(c, 150, 372, 34); shadow(c, 72, 376, 24);
    person(c, 150, 370, 1.2, { face: 1, hair: '#8a5a2b', style: 'long', top: '#7a5fd0', bot: '#3b4a6b', la: [20, 0], ra: [70, -40], lh: (cc, x, y) => { RR(cc, x - 20, y + 4, 38, 24, 5, '#c9a06a'); cc.strokeStyle = '#8a5a2b'; cc.lineWidth = 3; cc.beginPath(); cc.arc(x - 1, y + 6, 15, Math.PI, TAU); cc.stroke(); E(cc, x - 8, y + 4, 8, 5, '#6cc04a'); C(cc, x + 6, y + 3, 5.5, '#e5484d'); }, rh: (cc, x, y) => { RR(cc, x - 2, y - 7, 14, 9, 2, '#8fd06a'); } });
    person(c, 72, 374, 1.05, { kid: 1, face: 1, hair: '#2b2b33', style: 'short', top: '#f08a2e', bot: '#3f7fc4', la: [10, 4], ra: [78, 4], mouth: 'o' });
  };

  /* 5. 一家人在海边 */
  PIC.beach = (c) => {
    R(c, 0, 0, 600, 170, grad(c, 0, 0, 0, 170, [[0, '#6fbdf0'], [1, '#cfeeff']]));
    C(c, 90, 62, 30, '#ffe27a'); C(c, 90, 62, 46, 'rgba(255,226,122,.25)'); cloud(c, 300, 52, 1); cloud(c, 470, 86, 0.7);
    R(c, 0, 160, 600, 90, grad(c, 0, 160, 0, 250, [[0, '#2f8fd0'], [1, '#6fd0e6']]));
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2.5; [[40, 190], [220, 204], [380, 186], [500, 214], [120, 226]].forEach((p) => { c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + 16, p[1] - 7, p[0] + 32, p[1]); c.quadraticCurveTo(p[0] + 48, p[1] + 7, p[0] + 64, p[1]); c.stroke(); });
    // 帆船、海鸥
    G(c, [[430, 162], [492, 162], [482, 176], [440, 176]], '#e5484d'); R(c, 459, 112, 3, 52, '#5a3a26'); G(c, [[463, 114], [463, 158], [494, 158]], '#ffffff'); G(c, [[457, 122], [457, 158], [434, 158]], '#fdf0c8');
    c.strokeStyle = '#4a4a55'; c.lineWidth = 2; [[220, 80], [250, 64], [556, 50]].forEach((p) => { c.beginPath(); c.moveTo(p[0] - 9, p[1]); c.quadraticCurveTo(p[0] - 4, p[1] - 8, p[0], p[1]); c.quadraticCurveTo(p[0] + 4, p[1] - 8, p[0] + 9, p[1]); c.stroke(); });
    c.fillStyle = '#f4dfa6'; c.beginPath(); c.moveTo(0, 252); c.quadraticCurveTo(160, 232, 320, 246); c.quadraticCurveTo(470, 258, 600, 240); c.lineTo(600, 400); c.lineTo(0, 400); c.fill();
    R(c, 0, 300, 600, 100, 'rgba(230,190,120,.18)');
    // 遮阳伞下，爸爸坐在躺椅上看书
    L(c, [[486, 190], [486, 366]], '#8a6a4a', 5);
    c.fillStyle = '#e5484d'; c.beginPath(); c.arc(486, 200, 96, Math.PI, TAU); c.closePath(); c.fill();
    c.fillStyle = '#ffffff'; [[-0.82, -0.62], [-0.38, -0.12]].forEach((a) => { c.beginPath(); c.moveTo(486, 200); c.arc(486, 200, 96, Math.PI * a[0], Math.PI * a[1]); c.closePath(); c.fill(); });
    E(c, 492, 370, 86, 12, 'rgba(0,0,0,.13)');
    L(c, [[520, 364], [556, 296]], '#3f7fc4', 9); L(c, [[452, 340], [528, 340]], '#3f7fc4', 9); L(c, [[458, 344], [450, 368]], '#8a6a4a', 5); L(c, [[520, 344], [530, 368]], '#8a6a4a', 5);
    person(c, 520, 332, 1.02, { legs: 'sit', face: -1, lean: 16, hair: '#2b2b33', style: 'short', glasses: 1, top: '#ffffff', bot: '#f08a2e', shoe: '#f2c9a0', la: [50, -100], ra: [44, -92], lh: (cc, x, y) => { G(cc, [[x - 20, y - 16], [x - 2, y - 12], [x - 2, y + 10], [x - 20, y + 6]], '#4caf50'); G(cc, [[x + 16, y - 16], [x - 2, y - 12], [x - 2, y + 10], [x + 16, y + 6]], '#3f9a48'); } });
    // 妈妈站着拍照
    shadow(c, 92, 368, 32);
    person(c, 92, 366, 1.14, { face: 1, hair: '#5a3a26', style: 'pony', top: '#ff8fb1', bot: '#ffffff', dress: '#ff8fb1', shoe: '#f2c9a0', la: [80, -90], ra: [76, -84], rh: (cc, x, y) => { RR(cc, x - 4, y - 12, 26, 18, 3, '#2b2b33'); C(cc, x + 14, y - 3, 6, '#6b7682'); C(cc, x + 14, y - 3, 3, '#b9e9fb'); R(cc, x, y - 15, 8, 4, '#2b2b33'); } });
    // 两个孩子在堆沙堡
    E(c, 290, 366, 84, 12, 'rgba(0,0,0,.12)');
    G(c, [[246, 362], [334, 362], [326, 318], [254, 318]], '#e6c57a'); R(c, 252, 300, 16, 22, '#e6c57a'); R(c, 282, 290, 18, 32, '#e6c57a'); R(c, 312, 300, 16, 22, '#e6c57a');
    [252, 262, 282, 294, 312, 322].forEach((x, i) => R(c, x, (i === 2 || i === 3 ? 284 : 294), 6, 7, '#e6c57a')); G(c, [[283, 362], [299, 362], [299, 344], [283, 344]], '#b98a4a'); c.fillStyle = '#b98a4a'; c.beginPath(); c.arc(291, 344, 8, Math.PI, TAU); c.fill();
    L(c, [[291, 290], [291, 268]], '#8a6a4a', 2); G(c, [[291, 268], [308, 274], [291, 280]], '#e5484d');
    person(c, 208, 366, 1.0, { kid: 1, legs: 'kneel', face: 1, hair: '#8a5a2b', style: 'pony', top: '#f5c542', bot: '#3f9a8a', shoe: '#f2c9a0', la: [60, -30], ra: [70, -50] });
    person(c, 374, 366, 1.0, { kid: 1, legs: 'kneel', face: -1, hair: '#2b2b33', style: 'cap', capCol: '#3f7fc4', top: '#6cc04a', bot: '#e5484d', shoe: '#f2c9a0', la: [64, -40], ra: [54, -20], lh: (cc, x, y) => { L(cc, [[x, y], [x - 12, y + 20]], '#e5484d', 3); G(cc, [[x - 18, y + 18], [x - 6, y + 18], [x - 8, y + 32], [x - 16, y + 32]], '#e5484d'); } });
    G(c, [[400, 372], [424, 372], [420, 392], [404, 392]], '#3f7fc4'); c.strokeStyle = '#2f5f9a'; c.lineWidth = 2.5; c.beginPath(); c.arc(412, 372, 12, Math.PI, TAU); c.stroke();
    // 沙滩球、贝壳
    C(c, 170, 300, 17, '#ffffff'); c.fillStyle = '#e5484d'; c.beginPath(); c.moveTo(170, 300); c.arc(170, 300, 17, -0.3, 0.9); c.closePath(); c.fill(); c.fillStyle = '#3f7fc4'; c.beginPath(); c.moveTo(170, 300); c.arc(170, 300, 17, 1.8, 3.0); c.closePath(); c.fill(); c.fillStyle = '#f5c542'; c.beginPath(); c.moveTo(170, 300); c.arc(170, 300, 17, 3.9, 5.1); c.closePath(); c.fill();
    [[40, 388], [560, 386], [330, 392]].forEach((p) => E(c, p[0], p[1], 6, 4, '#f6b0b0'));
  };

  /* 6. 下雨天在公交车站等车 */
  PIC.busstop = (c) => {
    R(c, 0, 0, 600, 400, grad(c, 0, 0, 0, 280, [[0, '#7f8fa3'], [1, '#b6c2cf']]));
    [[0, 70, 110, '#8a93a3'], [108, 40, 96, '#727c8e'], [330, 60, 120, '#7d8798'], [448, 28, 152, '#8f98a8']].forEach((b) => { R(c, b[0], b[1], b[2], 280 - b[1], b[3]); for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) R(c, b[0] + 10 + i * ((b[2] - 20) / 4), b[1] + 14 + j * 40, 13, 22, (i + j * 3 + b[0]) % 3 === 0 ? '#ffe9a8' : 'rgba(40,50,70,.45)'); });
    R(c, 0, 276, 600, 14, '#9aa3ae'); R(c, 0, 290, 600, 110, '#5a6270');
    c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 6; i++) R(c, 30 + i * 110, 356, 56, 6, 'rgba(255,255,255,.6)');
    // 公交车从左边开过来
    RR(c, -90, 150, 300, 150, 16, '#e5484d'); R(c, -90, 262, 300, 16, '#b8323a'); RR(c, -78, 168, 268, 64, 8, '#cfe8f5');
    [-20, 46, 112].forEach((x) => R(c, x, 168, 5, 64, '#e5484d')); RR(c, 150, 168, 44, 64, 6, '#b9dcee');
    RR(c, 60, 136, 96, 20, 4, '#2b2b33'); c.fillStyle = '#ffd84a'; c.font = '700 14px "Trebuchet MS",sans-serif'; c.textAlign = 'center'; c.fillText('24 CITY', 108, 151);
    C(c, -10, 300, 24, '#2b2b33'); C(c, -10, 300, 10, '#9aa3ae'); C(c, 150, 300, 24, '#2b2b33'); C(c, 150, 300, 10, '#9aa3ae'); C(c, 202, 262, 7, '#ffe9a8');
    [10, 80].forEach((x) => { C(c, x, 196, 9, '#f2c9a0'); C(c, x, 192, 9.5, '#3b2a20'); C(c, x, 198, 8, '#f2c9a0'); RR(c, x - 11, 206, 22, 24, 6, x === 10 ? '#3f7fc4' : '#f5c542'); });
    // 站牌和候车亭
    R(c, 560, 110, 6, 180, '#4a4a55'); RR(c, 536, 92, 54, 40, 6, '#2f6fb0'); c.fillStyle = '#ffffff'; c.font = '700 13px "Trebuchet MS",sans-serif'; c.fillText('BUS', 563, 110); c.fillText('STOP', 563, 125);
    R(c, 262, 128, 6, 162, '#4a4a55'); R(c, 508, 128, 6, 162, '#4a4a55'); RR(c, 248, 116, 280, 16, 4, '#3b4a5a'); R(c, 268, 132, 240, 120, 'rgba(200,225,240,.22)'); R(c, 300, 262, 180, 8, '#8a6a4a'); R(c, 310, 270, 6, 20, '#4a4a55'); R(c, 464, 270, 6, 20, '#4a4a55');
    // 三个人在等车
    E(c, 300, 372, 150, 9, 'rgba(0,0,0,.2)');
    person(c, 300, 368, 1.18, { face: -1, hair: '#5a3a26', style: 'long', top: '#f5c542', bot: '#2b2b33', sleeve: 2, la: [16, 2], ra: [20, -150], rh: (cc, x, y) => { L(cc, [[x, y + 6], [x, y - 44]], '#4a4a55', 2.6); cc.fillStyle = '#e5484d'; cc.beginPath(); cc.arc(x, y - 44, 46, Math.PI, TAU); cc.closePath(); cc.fill(); cc.fillStyle = '#c93a44'; cc.beginPath(); cc.moveTo(x, y - 90); cc.arc(x, y - 44, 46, -Math.PI * 0.66, -Math.PI * 0.34); cc.closePath(); cc.fill(); }, lh: (cc, x, y) => { RR(cc, x - 13, y, 26, 20, 3, '#5a3a26'); cc.strokeStyle = '#5a3a26'; cc.lineWidth = 2.5; cc.beginPath(); cc.arc(x, y + 1, 7, Math.PI, TAU); cc.stroke(); } });
    RR(c, 364, 298, 56, 46, 10, '#f08a2e'); // 背在身后的书包
    person(c, 392, 370, 1.04, { kid: 1, face: 0, hair: '#2b2b33', style: 'short', top: '#3f9a8a', bot: '#3b4a6b', sleeve: 2, la: [14, -40], ra: [20, -110], rh: (cc, x, y) => { RR(cc, x - 6, y - 14, 12, 19, 2.5, '#2b2b33'); R(cc, x - 4.5, y - 12, 9, 13, '#9fe0ff'); } });
    c.strokeStyle = '#e5484d'; c.lineWidth = 3.5; c.beginPath(); c.arc(392, 279, 16, Math.PI * 1.02, Math.PI * 1.98); c.stroke(); RR(c, 372, 275, 7, 13, 3, '#e5484d'); RR(c, 405, 275, 7, 13, 3, '#e5484d');
    person(c, 476, 368, 1.12, { face: -1, hair: '#b9b9c2', style: 'bald', top: '#6b7682', bot: '#4a4a55', sleeve: 2, la: [18, 0], ra: [20, -150], rh: (cc, x, y) => { L(cc, [[x, y + 6], [x, y - 42]], '#4a4a55', 2.6); cc.fillStyle = '#2f6fb0'; cc.beginPath(); cc.arc(x, y - 42, 44, Math.PI, TAU); cc.closePath(); cc.fill(); } });
    // 雨和水坑
    E(c, 220, 384, 46, 7, 'rgba(180,210,235,.45)'); E(c, 540, 376, 34, 5, 'rgba(180,210,235,.45)');
    c.strokeStyle = 'rgba(225,240,255,.55)'; c.lineWidth = 1.6; for (let i = 0; i < 90; i++) { const x = (i * 97) % 640 - 20, y = (i * 53) % 400; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 16); c.stroke(); }
  };

  /* 7. 生日派对 */
  PIC.birthday = (c) => {
    R(c, 0, 0, 600, 400, '#ffe9c4'); R(c, 0, 0, 600, 210, grad(c, 0, 0, 0, 210, [[0, '#ffd6a8'], [1, '#ffeccf']]));
    // 横幅
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(60, 34); c.quadraticCurveTo(300, 74, 540, 34); c.stroke();
    'HAPPY BIRTHDAY'.split('').forEach((ch, i) => { if (ch === ' ') return; const t = i / 13, x = 78 + t * 444, y = 38 + Math.sin(t * Math.PI) * 20; G(c, [[x - 15, y], [x + 15, y], [x, y + 34]], ['#e5484d', '#3f7fc4', '#f5c542', '#4caf50', '#8e4ec6'][i % 5]); c.fillStyle = '#ffffff'; c.font = '700 14px "Trebuchet MS",sans-serif'; c.textAlign = 'center'; c.fillText(ch, x, y + 17); });
    balloon(c, 40, 96, '#e5484d', 90); balloon(c, 76, 126, '#f5c542', 70); balloon(c, 566, 104, '#3f7fc4', 90); balloon(c, 530, 136, '#4caf50', 70); balloon(c, 300, 120, '#ff8fb1', 40);
    
    // 桌子后面的四个孩子
    person(c, 96, 306, 1.5, { half: 1, kid: 1, face: 1, hair: '#2b2b33', style: 'short', hat: '#3f7fc4', top: '#4caf50', la: [96, -150], ra: [92, -146] });
    person(c, 196, 308, 1.5, { half: 1, kid: 1, face: 1, hair: '#8a5a2b', style: 'pony', hat: '#f5c542', top: '#ff8fb1', la: [30, -60], ra: [36, -76] });
    person(c, 392, 308, 1.56, { half: 1, kid: 1, face: -1, lean: -10, hair: '#3b2a20', style: 'long', hat: '#e5484d', top: '#8e4ec6', la: [20, -50], ra: [24, -56], mouth: 'o' });
    person(c, 478, 306, 1.5, { half: 1, kid: 1, face: -1, hair: '#5a3a26', style: 'short', hat: '#4caf50', top: '#3f7fc4', la: [96, -150], ra: [92, -146] });
    // 桌子
    R(c, 40, 286, 470, 16, '#ffffff'); R(c, 40, 302, 470, 98, '#ff8fb1'); for (let i = 0; i < 12; i++) C(c, 60 + i * 40, 302, 14, '#ffffff'); for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) C(c, 80 + i * 56 + j * 28, 340 + j * 34, 5, 'rgba(255,255,255,.55)');
    // 蛋糕和蜡烛
    E(c, 290, 290, 62, 7, '#e3e8ee'); RR(c, 240, 254, 100, 36, 6, '#ffffff'); RR(c, 252, 228, 76, 30, 6, '#ffd6e4'); c.fillStyle = '#ff8fb1'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(248 + i * 17, 256, 8.5, 0, Math.PI); c.fill(); }
    [266, 280, 294, 308].forEach((x, i) => { R(c, x, 212, 4, 17, ['#3f7fc4', '#f5c542', '#4caf50', '#e5484d'][i]); E(c, x + 2, 207, 3.2, 5.5, '#ffb347'); E(c, x + 2, 208, 1.6, 3, '#fff3b0'); });
    for (let i = 0; i < 5; i++) C(c, 260 + i * 15, 234, 4, '#e5484d');
    // 饮料、礼物
    [[52, '#f08a2e'], [140, '#e5484d'], [350, '#f5c542'], [436, '#8e4ec6']].forEach((d) => { RR(c, d[0], 262, 16, 26, 3, d[1]); R(c, d[0] + 2, 258, 12, 5, '#ffffff'); L(c, [[d[0] + 10, 258], [d[0] + 15, 244]], '#ffffff', 2); });
    plate(c, 196, 292, 22); C(c, 190, 287, 6, '#c98c58'); C(c, 202, 288, 6, '#c98c58');
    RR(c, 520, 330, 64, 56, 4, '#3f7fc4'); R(c, 548, 330, 8, 56, '#f5c542'); R(c, 520, 352, 64, 8, '#f5c542'); C(c, 546, 326, 7, '#f5c542'); C(c, 558, 326, 7, '#f5c542');
    RR(c, 536, 296, 44, 36, 4, '#e5484d'); R(c, 555, 296, 6, 36, '#ffffff'); C(c, 553, 293, 5, '#ffffff'); C(c, 563, 293, 5, '#ffffff');
    // 妈妈在右边举着手机拍照
    person(c, 558, 300, 1.5, { half: 1, face: -1, hair: '#5a3a26', style: 'bun', top: '#3f9a8a', la: [70, -80], ra: [66, -74], lh: (cc, x, y) => { RR(cc, x - 14, y - 14, 13, 22, 2.5, '#2b2b33'); R(cc, x - 12.5, y - 12, 10, 16, '#9fe0ff'); } });
  };

  /* 8. 女孩在卧室写作业 */
  PIC.bedroom = (c) => {
    R(c, 0, 0, 600, 400, '#dfe9f5'); R(c, 0, 290, 600, 110, '#c9a06a'); c.strokeStyle = 'rgba(90,60,30,.16)'; c.lineWidth = 1.5; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(i * 90 - 30, 290); c.lineTo(i * 110 - 110, 400); c.stroke(); } R(c, 0, 284, 600, 8, '#b9c7d9');
    E(c, 380, 378, 170, 18, '#f08a8a'); E(c, 380, 378, 144, 12, '#f6b0a8');
    // 窗外是傍晚
    windowBox(c, 384, 44, 150, 112, grad(c, 0, 44, 0, 156, [[0, '#3b4a8a'], [0.6, '#c96f8a'], [1, '#ffb347']])); C(c, 500, 74, 12, '#fff3b0'); [[410, 66], [446, 58], [470, 92]].forEach((p) => C(c, p[0], p[1], 1.8, '#ffffff'));
    G(c, [[372, 34], [406, 34], [396, 166], [372, 166]], '#7a8fd0'); G(c, [[546, 34], [512, 34], [522, 166], [546, 166]], '#7a8fd0'); R(c, 366, 30, 186, 7, '#5a3a26');
    // 海报、书架、时钟
    RR(c, 232, 52, 66, 86, 3, '#2b2b33'); C(c, 265, 86, 20, '#ffd84a'); c.fillStyle = '#ffffff'; c.font = '700 12px "Trebuchet MS",sans-serif'; c.textAlign = 'center'; c.fillText('MUSIC', 265, 126);
    RR(c, 156, 70, 58, 44, 3, '#ffffff'); G(c, [[160, 110], [178, 84], [190, 100], [200, 90], [210, 110]], '#6cc04a'); C(c, 200, 80, 5, '#ffd84a');
    C(c, 330, 60, 16, '#ffffff'); C(c, 330, 60, 13.5, '#fdf6e3'); L(c, [[330, 60], [330, 51]], '#2b2b33', 2); L(c, [[330, 60], [337, 66]], '#2b2b33', 2);
    RR(c, 560, 150, 40, 140, 3, '#a97850'); [0, 1, 2, 3].forEach((r) => { R(c, 563, 156 + r * 33, 37, 25, '#7a5230'); ['#e5484d', '#3f7fc4', '#f5c542', '#4caf50'].forEach((col, i) => R(c, 565 + i * 8.5, 159 + r * 33, 7, 22, [col, '#8e4ec6', '#f08a2e', '#3f9a8a'][(i + r) % 4])); });
    // 床和睡着的猫
    RR(c, -10, 212, 216, 30, 8, '#8a6a4a'); R(c, 0, 236, 206, 62, '#ffffff'); RR(c, 0, 228, 206, 34, 8, '#8fb8e8'); RR(c, 10, 206, 70, 34, 12, '#ffffff'); R(c, 0, 296, 10, 30, '#8a6a4a'); R(c, 196, 296, 10, 30, '#8a6a4a'); R(c, -10, 180, 16, 120, '#8a6a4a');
    for (let i = 0; i < 6; i++) C(c, 30 + i * 32, 252, 5, 'rgba(255,255,255,.5)');
    E(c, 142, 222, 30, 14, '#f08a2e'); C(c, 168, 214, 11, '#f08a2e'); G(c, [[160, 207], [164, 196], [170, 206]], '#f08a2e'); G(c, [[170, 206], [177, 197], [179, 209]], '#f08a2e'); c.strokeStyle = '#7a3a12'; c.lineWidth = 1.5; c.beginPath(); c.arc(164, 215, 2.6, 0.1, Math.PI - 0.1); c.stroke(); c.beginPath(); c.arc(173, 215, 2.6, 0.1, Math.PI - 0.1); c.stroke(); c.strokeStyle = '#f08a2e'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(118, 214, 14, Math.PI * 0.3, Math.PI * 1.3); c.stroke();
    // 吉他靠在墙边
    c.save(); c.translate(540, 262); c.rotate(0.12); E(c, 0, 14, 17, 21, '#c98c58'); E(c, 0, -6, 13, 15, '#c98c58'); C(c, 0, 6, 6, '#5a3a26'); R(c, -3.5, -66, 7, 58, '#7a5230'); RR(c, -6, -76, 12, 13, 2, '#5a3a26'); c.restore();
    // 书桌
    R(c, 296, 298, 236, 11, '#a97850'); R(c, 304, 309, 10, 64, '#8a6a4a'); R(c, 514, 309, 10, 64, '#8a6a4a'); RR(c, 442, 309, 72, 48, 3, '#b98a5a'); C(c, 478, 333, 4, '#f5e6c8');
    // 台灯
    RR(c, 494, 290, 30, 8, 3, '#3b4a6b'); L(c, [[508, 290], [504, 252], [484, 240]], '#3b4a6b', 4); G(c, [[464, 234], [492, 228], [498, 250], [462, 254]], '#f5c542'); c.fillStyle = 'rgba(255,240,170,.3)'; c.beginPath(); c.moveTo(466, 252); c.lineTo(496, 250); c.lineTo(530, 298); c.lineTo(420, 298); c.closePath(); c.fill();
    // 笔记本电脑、书
    G(c, [[410, 296], [466, 296], [460, 254], [404, 254]], '#3b4a5a'); G(c, [[414, 292], [462, 292], [457, 258], [408, 258]], '#9fe0ff'); R(c, 398, 294, 76, 5, '#6b7682');
    R(c, 300, 291, 44, 7, '#e5484d'); R(c, 303, 284, 40, 7, '#3f7fc4'); R(c, 301, 277, 38, 7, '#f5c542');
    // 椅子和坐着写作业的女孩
    R(c, 326, 326, 56, 8, '#6b7682'); R(c, 328, 262, 7, 66, '#6b7682'); R(c, 332, 334, 6, 40, '#4a4a55'); R(c, 372, 334, 6, 40, '#4a4a55');
    person(c, 354, 326, 1.02, { legs: 'sit', face: 1, lean: 6, hair: '#3b2a20', style: 'pony', top: '#ff8fb1', bot: '#3f7fc4', la: [62, -34], ra: [56, -26], rh: (cc, x, y) => L(cc, [[x, y], [x + 5, y - 13]], '#f5c542', 2.8) });
    RR(c, 380, 293, 24, 4, 1.5, '#ffffff');
    // 地上的书包
    RR(c, 236, 326, 44, 50, 10, '#4caf50'); RR(c, 244, 346, 28, 20, 5, '#3f9a48'); c.strokeStyle = '#3f9a48'; c.lineWidth = 4; c.beginPath(); c.arc(258, 328, 12, Math.PI, TAU); c.stroke();
  };

  P.ids = Object.keys(PIC);
  /** 把一幅图画进 ctx 的 (0,0)-(W,H) 区域 */
  P.draw = (c, id, W, H) => {
    const fn = PIC[id] || PIC.kitchen;
    c.save();
    c.beginPath(); c.rect(0, 0, W, H); c.clip();
    c.scale(W / 600, H / 400);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.textBaseline = 'alphabetic';
    fn(c);
    c.restore();
  };
})();
