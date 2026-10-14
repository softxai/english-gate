/* English Gate · 法术特效库（怪兽攻击与玩家法术共用）。
 * 统一签名：Spells.cast(type, from, to, [颜色1, 颜色2], {k 缩放, gy 地面}, hit 回调)
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, FX = EG.FX, TAU = Math.PI * 2, al = U.rgba;
  const S = (EG.Spells = {});

  function burst(p, c, k, n) {
    FX.emit(n || 22, { x: p.x, y: p.y, sp: [60 * k, 340 * k], life: [0.3, 0.7], size: [5 * k, 14 * k], col: c, drag: 0.9 });
    FX.emit(10, { x: p.x, y: p.y, sp: [120 * k, 420 * k], life: [0.2, 0.45], size: [3 * k, 6 * k], col: '#ffffff', shape: 'spark', drag: 0.92 });
    FX.ring(p.x, p.y, 10 * k, 90 * k, c[0], 0.35, 5 * k);
  }
  function explode(p, c, k) {
    burst(p, c, k, 36);
    FX.emit(14, { x: p.x, y: p.y, sp: [20, 90], life: [0.5, 1], size: [14 * k, 26 * k], end: 2.2, col: '#3a2a2a', shape: 'smoke', add: false, vy: -40 });
    FX.ring(p.x, p.y, 20 * k, 150 * k, c[1] || '#ffffff', 0.4, 8 * k);
    FX.flash(c[0], 0.18, 0.22); FX.shake(8 * k, 0.3);
  }
  function converge(x, y, r, col, k, n) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, rr = r * (0.7 + Math.random() * 0.6); FX.emit(1, { x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr, ang: a + Math.PI, sp: [rr / 0.3, rr / 0.22], life: [0.2, 0.3], size: [3 * k, 7 * k], col }); }
  }
  /** 沿抛物线飞行的投射物 */
  function proj(o) {
    let lx = o.from.x, ly = o.from.y;
    FX.add({
      dur: o.dur, layer: 'mid', x: o.from.x, y: o.from.y, ang: Math.atan2(o.to.y - o.from.y, o.to.x - o.from.x),
      update(dt, p) {
        const e = (o.ease || U.ease.inQuad)(p);
        const x = U.lerp(o.from.x, o.to.x, e), y = U.lerp(o.from.y, o.to.y, e) - Math.sin(Math.PI * e) * (o.arc || 0);
        if (x !== lx || y !== ly) this.ang = Math.atan2(y - ly, x - lx);
        this.x = x; this.y = y; lx = x; ly = y;
        if (o.trail) o.trail(x, y, p);
      },
      draw(c, p) { o.draw(c, this.x, this.y, this.ang, p); },
      end() { if (o.end) o.end(); },
    });
  }
  function glowDot(c, x, y, r, col, core) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(FX.glow(col), x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8); c.restore();
    c.fillStyle = core || '#fff'; c.beginPath(); c.arc(x, y, r * 0.55, 0, TAU); c.fill();
  }
  function shardDraw(c, x, y, ang, k, col) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.globalCompositeOperation = 'lighter'; c.drawImage(FX.glow(col[0]), -30 * k, -15 * k, 60 * k, 30 * k); c.globalCompositeOperation = 'source-over';
    c.fillStyle = col[1] || '#fff'; c.beginPath(); c.moveTo(22 * k, 0); c.lineTo(-14 * k, -6 * k); c.lineTo(-8 * k, 0); c.lineTo(-14 * k, 6 * k); c.closePath(); c.fill();
    c.strokeStyle = col[0]; c.lineWidth = 1.5; c.stroke(); c.restore();
  }
  function boltPath(x0, y0, x1, y1, seg, jit) {
    const pts = [[x0, y0]];
    for (let i = 1; i < seg; i++) { const p = i / seg; pts.push([U.lerp(x0, x1, p) + U.rand(-jit, jit), U.lerp(y0, y1, p) + U.rand(-jit * 0.3, jit * 0.3)]); }
    pts.push([x1, y1]); return pts;
  }
  function drawBolt(c, pts, col, w, a) {
    if (a <= 0) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.lineJoin = 'round'; c.lineCap = 'round';
    [[w * 4, al(col, 0.25)], [w * 2, al(col, 0.7)], [w * 0.8, '#ffffff']].forEach((s) => { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); });
    c.restore();
  }
  S._bolt = { path: boltPath, draw: drawBolt };
  S._burst = burst; S._explode = explode;

  /* 能量弹 */
  S.orb = (f, t, c, o, hit) => {
    const k = o.k;
    proj({ from: f, to: t, dur: 0.45, arc: 26 * k,
      draw(cx, x, y) { glowDot(cx, x, y, 15 * k, c[0], c[1] || '#fff'); },
      trail(x, y) { FX.emit(2, { x, y, rx: 6 * k, ry: 6 * k, sp: [0, 40], life: [0.25, 0.5], size: [4 * k, 10 * k], col: c }); },
      end() { burst(t, c, k); hit(); } });
  };
  /* 火球 */
  S.fireball = (f, t, c, o, hit) => {
    const k = o.k;
    proj({ from: f, to: t, dur: 0.5, arc: 40 * k,
      draw(cx, x, y) { glowDot(cx, x, y, 22 * k, c[0], c[1]); },
      trail(x, y) { FX.emit(3, { x, y, rx: 8 * k, ry: 8 * k, sp: [10, 60], life: [0.3, 0.6], size: [8 * k, 18 * k], col: [c[0], c[1] || '#ffe08a', '#ff4d2e'], vy: -30 }); FX.emit(1, { x, y, sp: [0, 20], life: [0.5, 0.9], size: [10 * k, 16 * k], end: 2, col: '#333333', shape: 'smoke', add: false }); },
      end() { explode(t, c, k * 1.3); hit(); } });
  };
  /* 飞刺 / 冰枪 */
  S.darts = (f, t, c, o, hit) => {
    const k = o.k, n = o.n || 5;
    for (let i = 0; i < n; i++) FX.after(i * 0.07, () => {
      const off = (i - (n - 1) / 2) * 22 * k, last = i === n - 1;
      proj({ from: { x: f.x, y: f.y + off * 0.6 }, to: { x: t.x + U.rand(-12, 12) * k, y: t.y + off * 0.5 }, dur: 0.32, arc: off * 1.2,
        draw(cx, x, y, ang) { shardDraw(cx, x, y, ang, k * 1.1, c); },
        trail(x, y) { if (Math.random() < 0.5) FX.emit(1, { x, y, sp: [0, 30], life: [0.2, 0.4], size: [3 * k, 6 * k], col: c }); },
        end() { FX.emit(6, { x: t.x, y: t.y, sp: [60, 220], life: [0.2, 0.5], size: [4 * k, 8 * k], col: c, shape: 'shard', add: false, g: 300 }); if (last) { burst(t, c, k); hit(); } } });
    });
  };
  /* 光束 */
  S.beam = (f, t, c, o, hit) => {
    const k = o.k;
    FX.add({ dur: 0.28, layer: 'mid',
      update() { converge(f.x, f.y, 60 * k, c, k, 2); },
      draw(cx, p) { glowDot(cx, f.x, f.y, (6 + p * 18) * k, c[0], '#fff'); },
      end() {
        FX.add({ dur: 0.4, layer: 'mid',
          update() { const q = Math.random(); FX.emit(2, { x: U.lerp(f.x, t.x, q), y: U.lerp(f.y, t.y, q), sp: [20, 120], life: [0.2, 0.4], size: [3 * k, 8 * k], col: c }); },
          draw(cx, p) {
            const w = (1 - p) * 18 * k + 2;
            cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
            [[w * 3, al(c[0], 0.35)], [w * 1.5, al(c[0], 0.8)], [w * 0.6, '#ffffff']].forEach((s) => { cx.strokeStyle = s[1]; cx.lineWidth = s[0]; cx.beginPath(); cx.moveTo(f.x, f.y); cx.lineTo(t.x, t.y); cx.stroke(); });
            cx.restore();
            glowDot(cx, f.x, f.y, w * 1.4, c[0], '#fff'); glowDot(cx, t.x, t.y, w * 1.8, c[0], '#fff');
          } });
        FX.after(0.06, () => { burst(t, c, k * 1.2); FX.shake(6 * k, 0.25); hit(); });
      } });
  };
  /* 音波 / 风刃 */
  S.wave = (f, t, c, o, hit) => {
    const k = o.k, n = 4, ang = Math.atan2(t.y - f.y, t.x - f.x);
    for (let i = 0; i < n; i++) FX.after(i * 0.09, () => {
      proj({ from: f, to: t, dur: 0.4, ease: U.ease.lin,
        draw(cx, x, y, a2, p) {
          const r = (18 + p * 34) * k;
          cx.save(); cx.translate(x, y); cx.rotate(ang); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
          cx.strokeStyle = al(c[0], 0.9 * (1 - p * 0.4)); cx.lineWidth = 6 * k; cx.beginPath(); cx.arc(-r * 0.6, 0, r, -1, 1); cx.stroke();
          cx.strokeStyle = al(c[1] || '#ffffff', 0.8); cx.lineWidth = 2.5 * k; cx.beginPath(); cx.arc(-r * 0.6, 0, r * 0.82, -0.8, 0.8); cx.stroke();
          cx.restore();
        },
        end() { if (i === n - 1) { burst(t, c, k); hit(); } else FX.emit(4, { x: t.x, y: t.y, sp: [40, 160], life: [0.2, 0.4], size: [4 * k, 8 * k], col: c }); } });
    });
  };
  /* 毒雾 / 孢子云 */
  S.cloud = (f, t, c, o, hit) => {
    const k = o.k;
    proj({ from: f, to: t, dur: 0.7, arc: 10 * k, ease: U.ease.outQuad, draw() {},
      trail(x, y) { FX.emit(3, { x, y, rx: 22 * k, ry: 18 * k, sp: [5, 40], life: [0.5, 1], size: [14 * k, 26 * k], end: 1.8, col: c, shape: 'smoke', add: false }); FX.emit(1, { x, y, rx: 20 * k, ry: 16 * k, sp: [10, 50], life: [0.3, 0.7], size: [3 * k, 6 * k], col: c[1] || c[0] }); },
      end() { FX.emit(26, { x: t.x, y: t.y, rx: 30 * k, ry: 40 * k, sp: [10, 70], life: [0.6, 1.3], size: [16 * k, 30 * k], end: 1.7, col: c, shape: 'smoke', add: false }); hit(); } });
  };
  /* 爪击 */
  S.slash = (f, t, c, o, hit) => {
    const k = o.k;
    for (let i = 0; i < 3; i++) FX.after(0.12 + i * 0.1, () => {
      const a = -0.9 + i * 0.35 + U.rand(-0.1, 0.1), L = 130 * k, x0 = t.x + U.rand(-14, 14) * k, y0 = t.y + (i - 1) * 18 * k;
      FX.add({ dur: 0.28, layer: 'mid', draw(cx, p) {
        const e = U.ease.outCubic(Math.min(1, p * 2.2)), fade = 1 - Math.max(0, p - 0.4) / 0.6;
        cx.save(); cx.translate(x0, y0); cx.rotate(a); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = fade;
        cx.fillStyle = c[0]; cx.beginPath(); cx.moveTo(-L / 2, 0); cx.quadraticCurveTo(-L / 2 + L * e * 0.5, -18 * k, -L / 2 + L * e, 0); cx.quadraticCurveTo(-L / 2 + L * e * 0.5, -4 * k, -L / 2, 0); cx.fill();
        cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(-L / 2, 0); cx.quadraticCurveTo(-L / 2 + L * e * 0.5, -10 * k, -L / 2 + L * e, 0); cx.quadraticCurveTo(-L / 2 + L * e * 0.5, -5 * k, -L / 2, 0); cx.fill();
        cx.restore();
      } });
      FX.emit(6, { x: x0, y: y0, sp: [80, 260], life: [0.2, 0.4], size: [3 * k, 6 * k], col: [c[0], '#ffffff'], shape: 'spark' });
      if (i === 1) { hit(); FX.shake(6 * k, 0.2); }
    });
  };
  /* 落雷 */
  S.bolt = (f, t, c, o, hit) => {
    const k = o.k, top = { x: t.x + U.rand(-60, 60) * k, y: -20 };
    FX.emit(8, { x: t.x, y: t.y - 40 * k, rx: 30 * k, sp: [0, 30], life: [0.15, 0.3], size: [6 * k, 12 * k], col: c });
    FX.after(0.12, () => {
      let pts = boltPath(top.x, top.y, t.x, t.y, 9, 26 * k);
      const br = boltPath(pts[4][0], pts[4][1], pts[4][0] + U.rand(-90, 90) * k, pts[4][1] + 90 * k, 4, 14 * k);
      FX.add({ dur: 0.34, layer: 'mid',
        update() { if (Math.random() < 0.3) pts = boltPath(top.x, top.y, t.x, t.y, 9, 26 * k); },
        draw(cx, p) { drawBolt(cx, pts, c[0], 5 * k, 1 - p); drawBolt(cx, br, c[0], 2.5 * k, (1 - p) * 0.8); } });
      FX.flash(c[1] || '#ffffff', 0.15, 0.3); burst(t, c, k * 1.2, 28); FX.shake(9 * k, 0.3); hit();
    });
  };
  /* 箭雨 / 冰锥雨 */
  S.rain = (f, t, c, o, hit) => {
    const k = o.k, n = o.n || 9, dir = f.x < t.x ? -1 : 1, at = Math.floor(n * 0.6);
    for (let i = 0; i < n; i++) FX.after(i * 0.06, () => {
      const tx = t.x + U.rand(-50, 50) * k, ty = t.y + U.rand(10, 60) * k;
      proj({ from: { x: tx + U.rand(120, 220) * k * dir, y: -30 }, to: { x: tx, y: ty }, dur: 0.34,
        draw(cx, x, y, ang) { shardDraw(cx, x, y, ang, k * 1.2, c); },
        end() { FX.emit(5, { x: tx, y: ty, ang: -Math.PI / 2, spread: 1, sp: [60, 200], life: [0.2, 0.5], size: [3 * k, 7 * k], col: c, g: 500 }); if (i === at) { hit(); FX.shake(6 * k, 0.25); } } });
    });
  };
  /* 龙卷 */
  S.tornado = (f, t, c, o, hit) => {
    const k = o.k, gy = o.gy || t.y + 60 * k;
    proj({ from: { x: f.x, y: gy }, to: { x: t.x, y: gy }, dur: 0.8, ease: U.ease.lin,
      draw(cx, x, y, a2, p) {
        const tt = p * 20;
        cx.save(); cx.globalAlpha = 0.8 * Math.min(1, p * 6); cx.lineCap = 'round';
        for (let i = 0; i < 9; i++) { const yy = y - i * 20 * k, rx = (14 + i * 8) * k, off = Math.sin(tt + i * 0.9) * 8 * k; cx.strokeStyle = i % 2 ? c[0] : c[1] || '#ffffff'; cx.lineWidth = 5 * k; cx.beginPath(); cx.ellipse(x + off, yy, rx, rx * 0.3, 0, tt + i, tt + i + 4.4); cx.stroke(); }
        cx.restore();
      },
      trail(x, y) { FX.emit(2, { x, y: y - U.rand(0, 160) * k, rx: 40 * k, sp: [40, 120], life: [0.3, 0.6], size: [4 * k, 9 * k], col: c, shape: 'smoke', add: false, end: 1.5 }); },
      end() { burst({ x: t.x, y: t.y }, c, k); hit(); } });
  };
  /* 吐息 */
  S.breath = (f, t, c, o, hit) => {
    const k = o.k, ang = Math.atan2(t.y - f.y, t.x - f.x), dist = Math.hypot(t.x - f.x, t.y - f.y);
    FX.add({ dur: 0.7, layer: 'mid', update() { FX.emit(7, { x: f.x, y: f.y, ang, spread: 0.16, sp: [dist / 0.42, dist / 0.3], life: [0.3, 0.45], size: [10 * k, 22 * k], end: 1.6, col: [c[0], c[1] || '#ffffff', c[0]], drag: 0.97 }); }, draw() {} });
    FX.after(0.36, () => { hit(); FX.shake(6 * k, 0.4); FX.emit(20, { x: t.x, y: t.y, sp: [40, 200], life: [0.3, 0.7], size: [8 * k, 16 * k], col: c }); });
  };
  /* 诅咒法阵 */
  S.curse = (f, t, c, o, hit) => {
    const k = o.k, gy = o.gy || t.y + 62 * k;
    FX.add({ dur: 0.8, layer: 'back', draw(cx, p) {
      const a = p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1, r = 74 * k;
      cx.save(); cx.translate(t.x, gy); cx.scale(1, 0.32); cx.rotate(p * 3); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = a; cx.strokeStyle = c[0]; cx.lineWidth = 4 * k;
      cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.stroke(); cx.beginPath(); cx.arc(0, 0, r * 0.72, 0, TAU); cx.stroke();
      cx.beginPath(); for (let i = 0; i <= 5; i++) { const an = (i * 2 / 5) * TAU; i ? cx.lineTo(Math.cos(an) * r * 0.72, Math.sin(an) * r * 0.72) : cx.moveTo(r * 0.72, 0); } cx.stroke();
      cx.restore();
    } });
    FX.after(0.45, () => {
      FX.add({ dur: 0.42, layer: 'mid', draw(cx, p) {
        const w = (1 - p) * 70 * k, g = cx.createLinearGradient(0, gy - 280 * k, 0, gy);
        g.addColorStop(0, al(c[0], 0)); g.addColorStop(1, al(c[0], 0.85 * (1 - p)));
        cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g; cx.fillRect(t.x - w, gy - 280 * k, w * 2, 280 * k); cx.restore();
      } });
      FX.emit(24, { x: t.x, y: gy, rx: 50 * k, ang: -Math.PI / 2, spread: 0.3, sp: [100, 400], life: [0.3, 0.7], size: [5 * k, 12 * k], col: c });
      hit(); FX.shake(7 * k, 0.3);
    });
  };
  /* 虫群 / 蝙蝠群 */
  S.swarm = (f, t, c, o, hit) => {
    const k = o.k, n = o.n || 14;
    for (let i = 0; i < n; i++) {
      const c1 = { x: U.lerp(f.x, t.x, 0.3) + U.rand(-80, 80) * k, y: f.y + U.rand(-160, 120) * k }, c2 = { x: U.lerp(f.x, t.x, 0.7) + U.rand(-80, 80) * k, y: t.y + U.rand(-160, 120) * k };
      FX.after(U.rand(0, 0.25), () => {
        FX.add({ dur: U.rand(0.5, 0.8), layer: 'mid', draw(cx, p) {
          const q = 1 - p, x = q * q * q * f.x + 3 * q * q * p * c1.x + 3 * q * p * p * c2.x + p * p * p * t.x, y = q * q * q * f.y + 3 * q * q * p * c1.y + 3 * q * p * p * c2.y + p * p * p * t.y;
          const fl = Math.sin(p * 60 + i) * 4 * k;
          cx.fillStyle = al(c[1] || '#ffffff', 0.85); cx.beginPath(); cx.ellipse(x - 5 * k, y - 3 * k - fl * 0.4, 6 * k, 3 * k, -0.5, 0, TAU); cx.ellipse(x + 5 * k, y - 3 * k + fl * 0.4, 6 * k, 3 * k, 0.5, 0, TAU); cx.fill();
          cx.fillStyle = c[0]; cx.beginPath(); cx.ellipse(x, y, 6 * k, 4.5 * k, 0, 0, TAU); cx.fill();
        }, end() { FX.emit(3, { x: t.x + U.rand(-20, 20) * k, y: t.y + U.rand(-30, 30) * k, sp: [30, 120], life: [0.2, 0.4], size: [3 * k, 7 * k], col: c }); } });
      });
    }
    FX.after(0.62, () => { hit(); FX.shake(5 * k, 0.3); });
  };
  /* 地刺 */
  S.spikes = (f, t, c, o, hit) => {
    const k = o.k, n = 6, gy = o.gy || t.y + 62 * k, dir = f.x < t.x ? 1 : -1;
    for (let i = 0; i < n; i++) FX.after(i * 0.08, () => {
      const x = U.lerp(f.x + dir * 40 * k, t.x, (i + 1) / n), h = (50 + i * 14) * k;
      FX.add({ dur: 0.5, layer: 'mid', draw(cx, p) {
        const e = p < 0.25 ? U.ease.outBack(p / 0.25) : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        cx.fillStyle = c[0]; cx.strokeStyle = c[1] || '#ffffff'; cx.lineWidth = 2;
        cx.beginPath(); cx.moveTo(x - 14 * k, gy); cx.lineTo(x - 4 * k, gy - h * e); cx.lineTo(x + 14 * k, gy); cx.closePath(); cx.fill(); cx.stroke();
        cx.beginPath(); cx.moveTo(x + 4 * k, gy); cx.lineTo(x + 14 * k, gy - h * e * 0.6); cx.lineTo(x + 24 * k, gy); cx.closePath(); cx.fill(); cx.stroke();
      } });
      FX.emit(5, { x, y: gy, ang: -Math.PI / 2, spread: 0.9, sp: [60, 220], life: [0.3, 0.6], size: [3 * k, 7 * k], col: [c[0], '#6b5b4b'], shape: 'rect', add: false, g: 600 });
      if (i === n - 1) { hit(); FX.shake(8 * k, 0.3); }
    });
  };
  /* 漩涡 */
  S.vortex = (f, t, c, o, hit) => {
    const k = o.k;
    FX.add({ dur: 0.78, layer: 'mid',
      update() { const a = Math.random() * TAU, r = U.rand(60, 110) * k; FX.emit(2, { x: t.x + Math.cos(a) * r, y: t.y + Math.sin(a) * r, ang: a + Math.PI * 0.75, sp: [160 * k, 260 * k], life: [0.25, 0.4], size: [4 * k, 9 * k], col: c }); },
      draw(cx, p) {
        const r = (p < 0.8 ? U.ease.outCubic(p / 0.8) : 1 - (p - 0.8) / 0.2) * 56 * k;
        cx.save(); cx.translate(t.x, t.y); cx.rotate(p * 9);
        cx.fillStyle = '#05020a'; cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.fill();
        cx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) { cx.strokeStyle = al(i % 2 ? c[0] : c[1] || c[0], 0.8); cx.lineWidth = 4 * k; cx.beginPath(); cx.ellipse(0, 0, r * (1.2 + i * 0.22), r * (0.5 + i * 0.12), i * 1.05, 0, TAU * 0.7); cx.stroke(); }
        cx.restore();
      },
      end() { burst(t, c, k * 1.3, 30); } });
    FX.after(0.6, () => { hit(); FX.shake(8 * k, 0.3); });
  };
  /* 投石 */
  S.boulder = (f, t, c, o, hit) => {
    const k = o.k; let rot = 0;
    const to = { x: t.x, y: t.y + 20 * k };
    proj({ from: f, to, dur: 0.6, arc: 150 * k, ease: U.ease.lin,
      draw(cx, x, y) {
        rot -= 0.22;
        cx.save(); cx.translate(x, y); cx.rotate(rot);
        if (o.fire) { cx.globalCompositeOperation = 'lighter'; cx.drawImage(FX.glow(c[1] || '#ff9a3d'), -50 * k, -50 * k, 100 * k, 100 * k); cx.globalCompositeOperation = 'source-over'; }
        cx.fillStyle = c[0]; cx.strokeStyle = U.shade(c[0], -0.5); cx.lineWidth = 3;
        cx.beginPath(); for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU, r = (22 + ((i * 37) % 9)) * k; i ? cx.lineTo(Math.cos(an) * r, Math.sin(an) * r) : cx.moveTo(Math.cos(an) * r, Math.sin(an) * r); } cx.closePath(); cx.fill(); cx.stroke();
        if (c[1]) { cx.fillStyle = c[1]; cx.beginPath(); cx.arc(-6 * k, -4 * k, 6 * k, 0, TAU); cx.arc(8 * k, 6 * k, 4 * k, 0, TAU); cx.fill(); }
        cx.restore();
      },
      trail(x, y) { if (o.fire) FX.emit(2, { x, y, rx: 8 * k, sp: [10, 50], life: [0.3, 0.6], size: [8 * k, 16 * k], col: [c[1] || '#ff9a3d', '#ff4d2e'] }); },
      end() { FX.emit(14, { x: to.x, y: to.y, ang: -Math.PI / 2, spread: 1.2, sp: [80, 320], life: [0.3, 0.8], size: [4 * k, 10 * k], col: [c[0], U.shade(c[0], -0.3)], shape: 'rect', add: false, g: 700 }); FX.emit(8, { x: to.x, y: to.y, sp: [20, 80], life: [0.5, 0.9], size: [14 * k, 24 * k], end: 2, col: '#5a4a40', shape: 'smoke', add: false }); hit(); FX.shake(10 * k, 0.35); } });
  };
  /* 光柱 */
  S.pillar = (f, t, c, o, hit) => {
    const k = o.k, gy = o.gy || t.y + 62 * k;
    FX.add({ dur: 0.3, layer: 'back', draw(cx, p) { cx.save(); cx.translate(t.x, gy); cx.scale(1, 0.3); cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = al(c[0], p); cx.lineWidth = 5 * k; cx.beginPath(); cx.arc(0, 0, 80 * k * (1.4 - p * 0.4), 0, TAU); cx.stroke(); cx.restore(); } });
    FX.after(0.28, () => {
      FX.add({ dur: 0.58, layer: 'mid',
        update() { FX.emit(3, { x: t.x, y: gy - U.rand(0, 300) * k, rx: 40 * k, sp: [20, 80], ang: -Math.PI / 2, spread: 0.3, life: [0.3, 0.6], size: [5 * k, 11 * k], col: c, shape: 'star' }); },
        draw(cx, p) {
          const w = (p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85) * 74 * k;
          cx.save(); cx.globalCompositeOperation = 'lighter';
          [[w * 1.8, 0.3], [w, 0.95]].forEach((s) => { const g = cx.createLinearGradient(t.x - s[0], 0, t.x + s[0], 0); g.addColorStop(0, al(c[0], 0)); g.addColorStop(0.5, al(s[1] > 0.5 ? c[1] || '#ffffff' : c[0], s[1])); g.addColorStop(1, al(c[0], 0)); cx.fillStyle = g; cx.fillRect(t.x - s[0], -10, s[0] * 2, gy + 10); });
          cx.restore();
        } });
      FX.ring(t.x, gy, 20 * k, 170 * k, c[0], 0.5, 6 * k); FX.flash(c[0], 0.2, 0.28); burst({ x: t.x, y: t.y }, c, k, 20); hit(); FX.shake(8 * k, 0.3);
    });
  };
  /* 陨石 */
  S.meteor = (f, t, c, o, hit) => {
    const k = o.k, dir = f.x < t.x ? 1 : -1;
    proj({ from: { x: t.x - dir * 400 * k, y: -70 }, to: t, dur: 0.55,
      draw(cx, x, y) {
        cx.save(); cx.globalCompositeOperation = 'lighter'; cx.drawImage(FX.glow(c[0]), x - 64 * k, y - 64 * k, 128 * k, 128 * k); cx.restore();
        cx.fillStyle = '#3b2420'; cx.beginPath(); cx.arc(x, y, 21 * k, 0, TAU); cx.fill();
        cx.fillStyle = c[1] || '#ffd166'; cx.beginPath(); cx.arc(x + 5 * k * dir, y + 5 * k, 13 * k, 0, TAU); cx.fill();
      },
      trail(x, y) { FX.emit(4, { x, y, rx: 12 * k, ry: 12 * k, sp: [10, 60], life: [0.3, 0.7], size: [10 * k, 22 * k], col: [c[0], c[1] || '#ffd166', '#ff3b1f'] }); FX.emit(1, { x, y, life: [0.5, 1], size: [12 * k, 18 * k], end: 2.4, col: '#2a2020', shape: 'smoke', add: false }); },
      end() { explode(t, c, k * 1.6); hit(); } });
  };

  S.SFX = { orb: 'cast', fireball: 'fire', darts: 'ice', beam: 'beam', wave: 'wind', cloud: 'dark', slash: 'slash', bolt: 'thunder', rain: 'ice', tornado: 'wind', breath: 'fire', curse: 'dark', swarm: 'swarm', spikes: 'quake', vortex: 'dark', boulder: 'quake', pillar: 'holy', meteor: 'fire' };

  S.cast = (type, from, to, pal, opt, hit) => {
    const o = Object.assign({ k: 1 }, opt || {});
    let done = false;
    const once = () => { if (!done) { done = true; if (hit) hit(); } };
    (S[type] || S.orb)(from, to, pal, o, once);
    EG.Audio.play(o.sfx || S.SFX[type] || 'cast');
  };
})();
