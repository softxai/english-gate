/* English Gate · 全屏大招。Ult.play(id, o, hit, done)
 * o: { W, H, gy, hero:{x,y}, mon:{x,y}, k, col:[c1,c2] }；hit 在命中瞬间调用，done 在演出结束时调用。
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, FX = EG.FX, TAU = Math.PI * 2, al = U.rgba;
  const Ult = (EG.Ult = {});
  const fade = (p, a, b) => (p < a ? p / a : p > b ? Math.max(0, (1 - p) / (1 - b)) : 1);
  const tint = (c, o, col, a) => { c.fillStyle = al(col, a); c.fillRect(0, 0, o.W, o.H); };

  const D = {};

  /* 森林 Boss：森罗万象 —— 藤蔓从四面八方绞向主角 */
  D.verdant = { dur: 2.5, hitAt: 1.5, sfx: 'quake', run(o, c1) {
    const vines = [];
    for (let i = 0; i < 12; i++) {
      const side = i % 4, sx = side === 0 ? -20 : side === 1 ? o.W + 20 : U.rand(0, o.W), sy = side === 2 ? -20 : side === 3 ? o.H + 20 : U.rand(0, o.H);
      const tx = o.hero.x + U.rand(-30, 30) * o.k, ty = o.hero.y - U.rand(20, 130) * o.k;
      const c1x = U.lerp(sx, tx, 0.33) + U.rand(-160, 160), c1y = U.lerp(sy, ty, 0.33) + U.rand(-140, 140), c2x = U.lerp(sx, tx, 0.66) + U.rand(-120, 120), c2y = U.lerp(sy, ty, 0.66) + U.rand(-120, 120);
      const pts = [];
      for (let j = 0; j <= 40; j++) { const p = j / 40, q = 1 - p; pts.push([q * q * q * sx + 3 * q * q * p * c1x + 3 * q * p * p * c2x + p * p * p * tx, q * q * q * sy + 3 * q * q * p * c1y + 3 * q * p * p * c2y + p * p * p * ty]); }
      vines.push({ pts, w: U.rand(8, 16) * o.k, d: i * 0.03 });
    }
    FX.add({ dur: this.dur, layer: 'top',
      update(dt, p) { if (p < 0.8) FX.emit(4, { x: o.W + 20, y: U.rand(0, o.H), ang: Math.PI, spread: 0.3, sp: [500, 1100], life: [0.8, 1.6], size: [6, 14], col: ['#4ade80', '#a3e635', '#166534', '#facc15'], shape: 'leaf', add: false, vr: 8, layer: 'top' }); },
      draw(c, p) {
        tint(c, o, '#0b3d1e', 0.5 * fade(p, 0.15, 0.8));
        const grow = U.clamp(p / 0.55, 0, 1), out = fade(p, 0.01, 0.82);
        c.save(); c.globalAlpha = out; c.lineCap = 'round'; c.lineJoin = 'round';
        vines.forEach((v, i) => {
          const g = U.clamp((grow - v.d) / (1 - v.d), 0, 1), n = Math.floor(U.ease.outCubic(g) * 40);
          if (n < 2) return;
          [[v.w + 7, '#062611'], [v.w, '#1f7a3a'], [v.w * 0.35, '#6fdc7f']].forEach((s) => { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); for (let j = 0; j <= n; j++) (j ? c.lineTo(v.pts[j][0], v.pts[j][1]) : c.moveTo(v.pts[j][0], v.pts[j][1])); c.stroke(); });
          for (let j = 4; j < n; j += 5) { const q = v.pts[j], an = j * 1.7 + i; c.fillStyle = j % 2 ? '#3fae56' : '#a3e635'; c.beginPath(); c.ellipse(q[0] + Math.cos(an) * v.w, q[1] + Math.sin(an) * v.w, v.w * 1.1, v.w * 0.5, an, 0, TAU); c.fill(); c.fillStyle = '#e8ffe0'; c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + Math.cos(an + 2) * v.w * 1.5, q[1] + Math.sin(an + 2) * v.w * 1.5); c.lineTo(q[0] + Math.cos(an + 2.6) * v.w * 0.6, q[1] + Math.sin(an + 2.6) * v.w * 0.6); c.closePath(); c.fill(); }
        });
        c.restore();
      } });
    FX.shake(6, 1.4);
  }, hit(o) { FX.flash('#a3e635', 0.3, 0.5); FX.shake(18, 0.5); FX.emit(60, { x: o.hero.x, y: o.hero.y - 80 * o.k, sp: [100, 600], life: [0.4, 1], size: [6, 16], col: ['#4ade80', '#a3e635', '#ffffff'], shape: 'leaf', add: false, vr: 10, layer: 'top' }); } };

  /* 沙漠 Boss：灭世沙暴 */
  D.sandstorm = { dur: 2.5, hitAt: 1.35, sfx: 'wind', run(o) {
    const tw = [0, 1, 2].map((i) => ({ off: i * 0.33, sp: 0.8 + i * 0.25, h: o.gy * (0.8 + i * 0.1) }));
    FX.add({ dur: this.dur, layer: 'top',
      update(dt, p) { if (p < 0.85) FX.emit(14, { x: o.W + 30, y: U.rand(-20, o.H), ang: Math.PI, spread: 0.12, sp: [900, 1900], life: [0.5, 1.2], size: [2, 6], col: ['#f5d08a', '#d9a05b', '#fff1c9'], shape: 'rect', add: false, layer: 'top' }); },
      draw(c, p) {
        const a = fade(p, 0.15, 0.8);
        tint(c, o, '#c98a3c', 0.62 * a);
        c.save(); c.lineCap = 'round';
        for (let i = 0; i < 44; i++) { const sp = 1400 + (i % 7) * 320, x = o.W + 300 - ((p * this.dur * sp + i * 197) % (o.W + 600)), y = (i * 61.8) % o.H, l = 120 + (i % 5) * 70; c.strokeStyle = al(i % 3 ? '#ffe9b8' : '#8a5a2b', (0.2 + (i % 4) * 0.1) * a); c.lineWidth = 2 + (i % 3) * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y - 6); c.stroke(); }
        tw.forEach((t, i) => {
          const q = (p * t.sp + t.off) % 1, x = o.W * (1.15 - q * 1.3), tt = p * 40 + i * 2;
          c.globalAlpha = a * 0.85;
          for (let j = 0; j < 16; j++) { const yy = o.gy - j * (t.h / 16), rx = (20 + j * 11) * o.k, off = Math.sin(tt + j * 0.7) * 16 * o.k; c.strokeStyle = j % 2 ? '#f5d08a' : '#a8733a'; c.lineWidth = 9 * o.k; c.beginPath(); c.ellipse(x + off, yy, rx, rx * 0.28, 0, tt + j, tt + j + 4.6); c.stroke(); }
        });
        c.restore();
      } });
    FX.shake(9, 1.9);
  }, hit(o) { FX.flash('#ffe9b8', 0.3, 0.55); FX.shake(20, 0.6); FX.emit(50, { x: o.hero.x, y: o.hero.y - 70 * o.k, sp: [200, 700], life: [0.4, 0.9], size: [4, 10], col: ['#f5d08a', '#d9a05b'], shape: 'rect', add: false, layer: 'top' }); } };

  /* 雪域 Boss：绝对零度 —— 冰晶从屏幕边缘蔓延，随后碎裂 */
  D.absolutezero = { dur: 2.5, hitAt: 1.45, sfx: 'freeze', run(o) {
    const segs = [];
    const grow = (x, y, ang, len, depth, t0) => {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      segs.push([x, y, x2, y2, depth, t0]);
      if (depth < 4) { const n = depth < 2 ? 3 : 2; for (let i = 0; i < n; i++) grow(U.lerp(x, x2, 0.4 + i * 0.25), U.lerp(y, y2, 0.4 + i * 0.25), ang + (i % 2 ? 1 : -1) * U.rand(0.5, 1), len * U.rand(0.45, 0.65), depth + 1, t0 + 0.12); }
    };
    const R = Math.max(o.W, o.H);
    for (let i = 0; i < 16; i++) { const e = i % 4, x = e === 0 ? 0 : e === 1 ? o.W : U.rand(0, o.W), y = e === 2 ? 0 : e === 3 ? o.H : U.rand(0, o.H); grow(x, y, Math.atan2(o.H / 2 - y, o.W / 2 - x) + U.rand(-0.5, 0.5), R * U.rand(0.16, 0.3), 0, U.rand(0, 0.15)); }
    FX.add({ dur: this.dur, layer: 'top',
      update(dt, p) { if (p < 0.6) FX.emit(6, { x: U.rand(0, o.W), y: -10, ang: Math.PI * 0.62, spread: 0.2, sp: [300, 700], life: [0.8, 1.6], size: [2, 5], col: '#ffffff', shape: 'dot', add: false, layer: 'top' }); },
      draw(c, p) {
        const a = fade(p, 0.12, 0.62);
        tint(c, o, '#7fd4ff', 0.42 * a);
        const g = c.createRadialGradient(o.W / 2, o.H / 2, Math.min(o.W, o.H) * 0.2, o.W / 2, o.H / 2, R * 0.75); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(235,250,255,' + 0.75 * a + ')');
        c.fillStyle = g; c.fillRect(0, 0, o.W, o.H);
        if (p < 0.62) {
          c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
          const tt = p / 0.5;
          segs.forEach((s) => { const q = U.clamp((tt - s[5]) / 0.35, 0, 1); if (q <= 0) return; c.strokeStyle = al('#e8fbff', 0.9); c.lineWidth = Math.max(1, (7 - s[4] * 1.5) * o.k); c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(U.lerp(s[0], s[2], q), U.lerp(s[1], s[3], q)); c.stroke(); });
          // 巨型雪花
          const hx = o.hero.x, hy = o.hero.y - 80 * o.k, r = U.ease.outCubic(U.clamp(p / 0.5, 0, 1)) * 150 * o.k;
          c.translate(hx, hy); c.rotate(p * 2); c.strokeStyle = '#ffffff'; c.lineWidth = 5 * o.k;
          for (let i = 0; i < 6; i++) { c.rotate(TAU / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(r, 0); c.moveTo(r * 0.5, 0); c.lineTo(r * 0.72, r * 0.2); c.moveTo(r * 0.5, 0); c.lineTo(r * 0.72, -r * 0.2); c.moveTo(r * 0.78, 0); c.lineTo(r * 0.94, r * 0.14); c.moveTo(r * 0.78, 0); c.lineTo(r * 0.94, -r * 0.14); c.stroke(); }
          c.restore();
        }
      } });
  }, hit(o) { FX.flash('#ffffff', 0.5, 0.85); FX.shake(22, 0.6); for (let i = 0; i < 6; i++) FX.emit(22, { x: U.rand(0, o.W), y: U.rand(0, o.H * 0.8), sp: [100, 600], life: [0.6, 1.3], size: [8, 22], col: ['#e8fbff', '#9adfff', '#ffffff'], shape: 'shard', add: false, g: 900, vr: 8, layer: 'top' }); } };

  /* 城堡 Boss：血月降临 */
  D.bloodmoon = { dur: 2.7, hitAt: 1.62, sfx: 'dark', run(o) {
    const bats = []; for (let i = 0; i < 30; i++) bats.push({ a: U.rand(-0.5, 0.5) + Math.PI, sp: U.rand(0.7, 1.5), y: U.rand(-0.2, 0.25), d: U.rand(0, 0.35), s: U.rand(0.6, 1.4) });
    const mx = o.W * 0.5, my = o.H * 0.3, mr = Math.min(o.W, o.H) * 0.2;
    FX.add({ dur: this.dur, layer: 'top', draw(c, p) {
      const a = fade(p, 0.15, 0.82);
      const g = c.createLinearGradient(0, 0, 0, o.H); g.addColorStop(0, al('#1a0005', 0.88 * a)); g.addColorStop(1, al('#7a0014', 0.7 * a));
      c.fillStyle = g; c.fillRect(0, 0, o.W, o.H);
      const rise = U.ease.outCubic(U.clamp(p / 0.4, 0, 1)), y = my + (1 - rise) * o.H * 0.4;
      c.save(); c.globalAlpha = a;
      c.globalCompositeOperation = 'lighter'; c.drawImage(FX.glow('#ff2244'), mx - mr * 3, y - mr * 3, mr * 6, mr * 6); c.globalCompositeOperation = 'source-over';
      const mg = c.createRadialGradient(mx - mr * 0.3, y - mr * 0.3, 0, mx, y, mr); mg.addColorStop(0, '#ffd5d5'); mg.addColorStop(0.5, '#ff4a5e'); mg.addColorStop(1, '#8a0018');
      c.fillStyle = mg; c.beginPath(); c.arc(mx, y, mr, 0, TAU); c.fill();
      c.fillStyle = 'rgba(120,0,20,.35)'; [[-0.3, -0.2, 0.2], [0.3, 0.1, 0.26], [-0.1, 0.4, 0.14], [0.4, -0.4, 0.1]].forEach((cr) => { c.beginPath(); c.arc(mx + cr[0] * mr, y + cr[1] * mr, cr[2] * mr, 0, TAU); c.fill(); });
      c.fillStyle = '#0a0006';
      bats.forEach((b) => {
        const q = U.clamp((p - b.d) / 0.6, 0, 1); if (q <= 0 || q >= 1) return;
        const bx = mx + Math.cos(b.a) * q * o.W * b.sp + (1 - q) * 20, by = y + b.y * o.H + Math.sin(q * 9 + b.d * 20) * 30, s = 16 * b.s * o.k * (0.5 + q), fl = Math.sin(p * 60 + b.d * 30) * 0.6;
        c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx - s, by - s * (1 + fl), bx - s * 2.2, by - s * 0.2 * fl); c.quadraticCurveTo(bx - s * 1.4, by + s * 0.2, bx - s * 0.9, by + s * 0.5); c.quadraticCurveTo(bx - s * 0.4, by + s * 0.1, bx, by + s * 0.6); c.quadraticCurveTo(bx + s * 0.4, by + s * 0.1, bx + s * 0.9, by + s * 0.5); c.quadraticCurveTo(bx + s * 1.4, by + s * 0.2, bx + s * 2.2, by - s * 0.2 * fl); c.quadraticCurveTo(bx + s, by - s * (1 + fl), bx, by); c.fill();
      });
      c.restore();
      // 血色斩击
      for (let i = 0; i < 3; i++) {
        const q = (p * this.dur - (1.45 + i * 0.09)) / 0.4; if (q < 0 || q > 1) continue;
        const e = U.ease.outCubic(Math.min(1, q * 2.5)), f2 = 1 - Math.max(0, q - 0.3) / 0.7, L = Math.hypot(o.W, o.H) * 1.1, ang = 2.3 + i * 0.28;
        c.save(); c.translate(o.hero.x + (i - 1) * 40 * o.k, o.hero.y - 80 * o.k); c.rotate(ang); c.globalCompositeOperation = 'lighter'; c.globalAlpha = f2;
        [[34 * o.k, '#ff1a3c'], [12 * o.k, '#ffffff']].forEach((s) => { c.fillStyle = s[1]; c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(-L / 2 + L * e * 0.5, -s[0], -L / 2 + L * e, 0); c.quadraticCurveTo(-L / 2 + L * e * 0.5, s[0] * 0.3, -L / 2, 0); c.fill(); });
        c.restore();
      }
    } });
  }, hit(o) { FX.flash('#ff1a3c', 0.35, 0.6); FX.shake(20, 0.6); FX.emit(50, { x: o.hero.x, y: o.hero.y - 80 * o.k, sp: [200, 800], life: [0.3, 0.8], size: [4, 10], col: ['#ff1a3c', '#ffffff', '#7a0014'], shape: 'spark', layer: 'top' }); } };

  /* 火山 Boss：陨星天降 */
  D.meteorfall = { dur: 2.8, hitAt: 1.9, sfx: 'fire', run(o) {
    FX.add({ dur: this.dur, layer: 'top',
      update(dt, p) { if (p < 0.8) FX.emit(3, { x: U.rand(0, o.W), y: o.H + 10, ang: -Math.PI / 2, spread: 0.4, sp: [80, 260], life: [1, 2], size: [4, 10], col: ['#ff9a3d', '#ffe08a', '#ff4d2e'], layer: 'top' }); },
      draw(c, p) { const g = c.createLinearGradient(0, 0, 0, o.H); const a = fade(p, 0.12, 0.8); g.addColorStop(0, al('#2a0500', 0.75 * a)); g.addColorStop(1, al('#b83210', 0.4 * a)); c.fillStyle = g; c.fillRect(0, 0, o.W, o.H); } });
    const drop = (tx, ty, k, big) => {
      const from = { x: tx + o.H * 0.75, y: -80 }, col = ['#ff6b35', '#ffd166'];
      let x = from.x, y = from.y;
      FX.add({ dur: big ? 0.6 : 0.5, layer: 'top',
        update(dt, p) { const e = p * p; x = U.lerp(from.x, tx, e); y = U.lerp(from.y, ty, e); FX.emit(big ? 6 : 3, { x, y, rx: 12 * k, ry: 12 * k, sp: [10, 70], life: [0.3, 0.8], size: [10 * k, 24 * k], col: ['#ff6b35', '#ffd166', '#ff3b1f'], layer: 'top' }); FX.emit(1, { x, y, life: [0.5, 1], size: [12 * k, 20 * k], end: 2.4, col: '#2a2020', shape: 'smoke', add: false, layer: 'top' }); },
        draw(c) { c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(FX.glow('#ff6b35'), x - 70 * k, y - 70 * k, 140 * k, 140 * k); c.restore(); c.fillStyle = '#3b2420'; c.beginPath(); c.arc(x, y, 22 * k, 0, TAU); c.fill(); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(x - 5 * k, y + 5 * k, 14 * k, 0, TAU); c.fill(); },
        end() {
          FX.emit(big ? 60 : 24, { x: tx, y: ty, sp: [80 * k, 520 * k], life: [0.3, 0.9], size: [6 * k, 18 * k], col, drag: 0.9, layer: 'top' });
          FX.emit(10, { x: tx, y: ty, sp: [20, 100], life: [0.6, 1.2], size: [18 * k, 34 * k], end: 2.2, col: '#3a2a2a', shape: 'smoke', add: false, vy: -50, layer: 'top' });
          FX.ring(tx, ty, 20 * k, (big ? 320 : 150) * k, '#ffd166', 0.5, 9 * k, 'top');
          FX.shake(big ? 24 : 10, big ? 0.6 : 0.3); FX.flash('#ff8a3d', 0.18, big ? 0.6 : 0.18); EG.Audio.play('quake');
        } });
    };
    for (let i = 0; i < 11; i++) FX.after(0.3 + i * 0.13, () => drop(U.rand(0.05, 0.95) * o.W, o.gy + U.rand(-10, 30), o.k * U.rand(0.8, 1.3), false));
    FX.after(this.hitAt - 0.6, () => drop(o.hero.x, o.hero.y - 40 * o.k, o.k * 2.2, true));
  }, hit() {} };

  /* 虚空 Boss：黑洞坍缩 */
  D.blackhole = { dur: 2.9, hitAt: 1.85, sfx: 'ult', run(o) {
    const cx = o.W / 2, cy = o.H * 0.42, R = Math.min(o.W, o.H) * 0.17, far = Math.hypot(o.W, o.H) * 0.6;
    FX.add({ dur: this.dur, layer: 'top',
      update(dt, p) {
        if (p < 0.6) for (let i = 0; i < 5; i++) { const a = U.rand(0, TAU); FX.emit(1, { x: cx + Math.cos(a) * far, y: cy + Math.sin(a) * far, ang: a + Math.PI * 0.9, sp: [far / 0.8, far / 0.5], life: [0.5, 0.8], size: [3, 9], col: ['#c084fc', '#22d3ee', '#ffffff', '#ff4fd8'], layer: 'top' }); }
      },
      draw(c, p) {
        const tt = p * this.dur, a = fade(p, 0.12, 0.85);
        tint(c, o, '#030108', 0.86 * a);
        const imp = U.clamp((tt - 1.6) / 0.25, 0, 1);
        const r = U.ease.outCubic(U.clamp(tt / 1.2, 0, 1)) * R * (1 - imp);
        if (tt < 1.85) {
          c.save(); c.translate(cx, cy); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
          for (let i = 0; i < 46; i++) { const an = (i / 46) * TAU + i * 0.37, q = (tt * 1.3 + i * 0.137) % 1, r1 = far * (1 - q), r0 = r1 + 70 + q * 120; c.strokeStyle = al(i % 3 ? '#c084fc' : '#7df9ff', 0.2 + q * 0.6); c.lineWidth = 1.5 + q * 2.5; c.beginPath(); c.moveTo(Math.cos(an + q) * r0, Math.sin(an + q) * r0); c.lineTo(Math.cos(an + q * 1.3) * r1, Math.sin(an + q * 1.3) * r1); c.stroke(); }
          c.drawImage(FX.glow('#c084fc'), -r * 3.4, -r * 3.4, r * 6.8, r * 6.8);
          for (let i = 0; i < 5; i++) { c.save(); c.rotate(tt * (2 + i * 0.6) + i); c.strokeStyle = al(['#ffffff', '#c084fc', '#22d3ee', '#ff4fd8', '#ffd166'][i], 0.85); c.lineWidth = (7 - i) * o.k; c.beginPath(); c.ellipse(0, 0, r * (1.25 + i * 0.26), r * (0.42 + i * 0.1), 0, 0, TAU * 0.72); c.stroke(); c.restore(); }
          c.globalCompositeOperation = 'source-over';
          c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
          c.strokeStyle = '#fff'; c.lineWidth = 3 * o.k; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
          c.restore();
        } else {
          const q = U.clamp((tt - 1.85) / 0.7, 0, 1), rr = U.ease.outCubic(q) * far * 1.4;
          c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1 - q;
          [['#ffffff', 26], ['#c084fc', 60], ['#22d3ee', 14]].forEach((s, i) => { c.strokeStyle = s[0]; c.lineWidth = s[1] * o.k * (1 - q * 0.6); c.beginPath(); c.arc(cx, cy, Math.max(1, rr - i * 40 * o.k), 0, TAU); c.stroke(); });
          c.restore();
        }
      } });
    FX.shake(8, 1.7);
  }, hit(o) { FX.flash('#ffffff', 0.6, 0.95); FX.shake(26, 0.7); FX.emit(90, { x: o.W / 2, y: o.H * 0.42, sp: [200, 1300], life: [0.5, 1.2], size: [5, 16], col: ['#c084fc', '#22d3ee', '#ffffff', '#ff4fd8'], drag: 0.95, layer: 'top' }); } };

  /* 精英怪通用全屏技：雷暴天幕 */
  D.thunderstorm = { dur: 1.9, hitAt: 1.15, sfx: 'thunder', run(o) {
    const col = o.col[0], B = EG.Spells._bolt;
    FX.add({ dur: this.dur, layer: 'top', draw(c, p) { tint(c, o, '#0a1024', 0.62 * fade(p, 0.15, 0.75)); } });
    const strike = (x, y, w) => { let pts = B.path(x + U.rand(-80, 80), -20, x, y, 10, 30 * o.k); FX.add({ dur: 0.3, layer: 'top', draw(c, p) { B.draw(c, pts, col, w, 1 - p); } }); FX.flash('#ffffff', 0.1, 0.25); FX.emit(14, { x, y, sp: [80, 400], life: [0.2, 0.5], size: [4, 10], col: [col, '#ffffff'], shape: 'spark', layer: 'top' }); EG.Audio.play('thunder'); };
    for (let i = 0; i < 6; i++) FX.after(0.25 + i * 0.13, () => strike(U.rand(0.05, 0.95) * o.W, o.gy, 5 * o.k));
    FX.after(this.hitAt, () => strike(o.hero.x, o.hero.y - 40 * o.k, 10 * o.k));
  }, hit(o) { FX.flash(o.col[0], 0.3, 0.5); FX.shake(18, 0.5); } };

  /* 精英怪通用全屏技：暗影帷幕 */
  D.shadowveil = { dur: 2.1, hitAt: 1.3, sfx: 'dark', run(o) {
    const col = o.col[0], eyes = [];
    for (let i = 0; i < 14; i++) eyes.push({ x: U.rand(0.05, 0.95) * o.W, y: U.rand(0.08, 0.8) * o.H, s: U.rand(14, 34) * o.k, d: U.rand(0, 0.35) });
    FX.add({ dur: this.dur, layer: 'top', draw(c, p) {
      const a = fade(p, 0.12, 0.8);
      tint(c, o, '#04020a', 0.88 * a);
      c.save(); c.globalCompositeOperation = 'lighter';
      eyes.forEach((e) => { const q = U.clamp((p - e.d) / 0.15, 0, 1) * a; if (q <= 0) return; const op = q * (0.8 + 0.2 * Math.sin(p * 30 + e.x)); c.globalAlpha = a; c.drawImage(FX.glow(col), e.x - e.s * 2.4, e.y - e.s * 1.6, e.s * 4.8, e.s * 3.2); [-1, 1].forEach((sd) => { c.fillStyle = col; c.beginPath(); c.ellipse(e.x + sd * e.s * 0.9, e.y, e.s * 0.7, e.s * 0.34 * op, sd * -0.25, 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.ellipse(e.x + sd * e.s * 0.9, e.y, e.s * 0.12, e.s * 0.3 * op, 0, 0, TAU); c.fill(); }); });
      c.restore();
      for (let i = 0; i < 4; i++) {
        const q = (p * this.dur - (1.18 + i * 0.05)) / 0.4; if (q < 0 || q > 1) continue;
        const e = U.ease.outCubic(Math.min(1, q * 2.5)), f2 = 1 - Math.max(0, q - 0.3) / 0.7, L = Math.hypot(o.W, o.H);
        c.save(); c.translate(o.hero.x + (i - 1.5) * 46 * o.k, o.hero.y - 80 * o.k); c.rotate(1.15); c.globalCompositeOperation = 'lighter'; c.globalAlpha = f2;
        [[22 * o.k, col], [8 * o.k, '#ffffff']].forEach((s) => { c.fillStyle = s[1]; c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(-L / 2 + L * e * 0.5, -s[0], -L / 2 + L * e, 0); c.quadraticCurveTo(-L / 2 + L * e * 0.5, s[0] * 0.3, -L / 2, 0); c.fill(); });
        c.restore();
      }
    } });
  }, hit(o) { FX.flash(o.col[0], 0.3, 0.45); FX.shake(18, 0.5); EG.Audio.play('slash'); } };

  /* 精英怪通用全屏技：地裂 */
  D.quake = { dur: 1.9, hitAt: 1.05, sfx: 'quake', run(o) {
    const col = o.col[0], pts = [];
    let x = o.mon.x; while (x > -40) { pts.push([x, o.gy + U.rand(4, 30)]); x -= U.rand(30, 70); }
    FX.add({ dur: this.dur, layer: 'top', draw(c, p) {
      tint(c, o, '#1a0d05', 0.4 * fade(p, 0.15, 0.75));
      const n = Math.floor(U.clamp(p / 0.5, 0, 1) * pts.length), a = fade(p, 0.05, 0.75);
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineJoin = 'round'; c.globalAlpha = a;
      [[16 * o.k, al(col, 0.3)], [7 * o.k, col], [2.5 * o.k, '#ffffff']].forEach((s) => { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); for (let i = 0; i < n; i++) (i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1])); c.stroke(); });
      c.restore();
    } });
    pts.forEach((q, i) => FX.after((i / pts.length) * 0.95, () => {
      FX.emit(9, { x: q[0], y: q[1], ang: -Math.PI / 2, spread: 0.6, sp: [200, 800], life: [0.5, 1.1], size: [6, 18], col: ['#6b5b4b', '#3a2c22', col], shape: 'rect', add: false, g: 1400, vr: 10, layer: 'top' });
      FX.emit(3, { x: q[0], y: q[1], ang: -Math.PI / 2, spread: 0.3, sp: [100, 400], life: [0.3, 0.6], size: [10, 22], col: [col, '#ffffff'], layer: 'top' });
    }));
    FX.shake(14, 1.5);
  }, hit(o) { FX.flash(o.col[0], 0.25, 0.4); FX.shake(22, 0.5); } };

  /* 玩家终极魔法：星界爆裂 */
  D.starburst = { dur: 2.0, hitAt: 1.0, sfx: 'ult', run(o) {
    const f = o.from, t = o.mon, k = o.k;
    const stars = []; for (let i = 0; i < 40; i++) stars.push([U.rand(0, o.W), U.rand(0, o.H), U.rand(0, TAU)]);
    FX.add({ dur: this.dur, layer: 'top',
      update(dt, p) {
        const tt = p * this.dur;
        if (tt < 0.8) for (let i = 0; i < 4; i++) { const a = U.rand(0, TAU), r = U.rand(200, 520) * k; FX.emit(1, { x: f.x + Math.cos(a) * r, y: f.y + Math.sin(a) * r, ang: a + Math.PI, sp: [r / 0.4, r / 0.3], life: [0.3, 0.4], size: [4, 10], col: ['#7cc7ff', '#c084fc', '#ffffff', '#ffe066'], shape: 'star', layer: 'top' }); }
        else if (tt < 1.4) { const q = Math.random(); FX.emit(6, { x: U.lerp(f.x, o.W + 60, q), y: U.lerp(f.y, t.y - 90 * k, Math.min(1, q * 1.2)) + U.rand(-50, 50) * k, sp: [60, 400], life: [0.3, 0.7], size: [4, 12], col: ['#7cc7ff', '#c084fc', '#ffffff', '#ffe066'], shape: 'star', layer: 'top' }); }
      },
      draw(c, p) {
        const tt = p * this.dur;
        tint(c, o, '#050a24', 0.8 * fade(p, 0.1, 0.8));
        c.save(); c.globalCompositeOperation = 'lighter';
        const sa = fade(p, 0.1, 0.8);
        stars.forEach((s, i) => { const tw = 0.4 + 0.6 * Math.abs(Math.sin(tt * 5 + s[2])); c.globalAlpha = sa * tw; c.drawImage(FX.glow(i % 2 ? '#ffffff' : '#7cc7ff'), s[0] - 10, s[1] - 10, 20, 20); if (i % 5 === 0 && i + 1 < stars.length) { c.strokeStyle = al('#7cc7ff', 0.35 * sa); c.lineWidth = 1.2; c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(stars[i + 1][0], stars[i + 1][1]); c.stroke(); } });
        c.globalAlpha = 1;
        if (tt < 0.85) { const r = (20 + tt * 90) * k; c.drawImage(FX.glow('#ffffff'), f.x - r, f.y - r, r * 2, r * 2); c.drawImage(FX.glow('#7cc7ff'), f.x - r * 2, f.y - r * 2, r * 4, r * 4); }
        if (tt >= 0.8 && tt < 1.6) {
          const q = (tt - 0.8) / 0.8, w = (q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85) * 90 * k, ang = Math.atan2(t.y - 90 * k - f.y, t.x - f.x), L = Math.hypot(o.W, o.H) * 1.2;
          c.translate(f.x, f.y); c.rotate(ang);
          [[w * 2.2, 'rgba(192,132,252,.35)'], [w * 1.5, 'rgba(124,199,255,.6)'], [w, 'rgba(255,255,255,.9)'], [w * 0.45, '#ffffff']].forEach((s) => { c.fillStyle = s[1]; c.beginPath(); c.moveTo(0, 0); c.lineTo(40 * k, -s[0] / 2); c.lineTo(L, -s[0] / 2 * (1 + Math.sin(tt * 40) * 0.08)); c.lineTo(L, s[0] / 2); c.lineTo(40 * k, s[0] / 2); c.closePath(); c.fill(); });
        }
        c.restore();
      } });
    FX.after(0.8, () => { FX.flash('#ffffff', 0.25, 0.7); FX.shake(16, 0.8); EG.Audio.play('beam'); });
  }, hit(o) { FX.ring(o.mon.x, o.mon.y - 90 * o.k, 30, 420 * o.k, '#ffffff', 0.6, 14, 'top'); FX.emit(70, { x: o.mon.x, y: o.mon.y - 90 * o.k, sp: [200, 900], life: [0.4, 1.1], size: [6, 18], col: ['#7cc7ff', '#c084fc', '#ffffff', '#ffe066'], shape: 'star', drag: 0.94, layer: 'top' }); } };

  Ult.defs = D;
  Ult.play = (id, o, hit, done) => {
    const d = D[id] || D.thunderstorm;
    o.col = o.col || ['#ffe66d', '#ffffff'];
    EG.Audio.play(d.sfx);
    d.run(o);
    FX.after(d.hitAt, () => { d.hit(o); if (hit) hit(); });
    FX.after(d.dur, () => { if (done) done(); });
    return d.dur;
  };
})();
