/* English Gate · 特效引擎：粒子、定时特效、飘字、震屏、闪屏、计时器 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, TAU = Math.PI * 2;
  const FX = (EG.FX = { ps: [], list: [], texts: [], timers: [], flashes: [], sx: 0, sy: 0, shakeA: 0, shakeT: 0, shakeD: 1 });

  /* 预渲染的柔光贴图（按颜色缓存），叠加混合画出发光效果 */
  const sprites = {};
  FX.glow = (col) => {
    let s = sprites[col];
    if (s) return s;
    s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, U.rgba(col, 1));
    gr.addColorStop(0.25, U.rgba(col, 0.7));
    gr.addColorStop(0.6, U.rgba(col, 0.18));
    gr.addColorStop(1, U.rgba(col, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    sprites[col] = s;
    return s;
  };

  FX.clear = () => {
    FX.ps.length = 0; FX.list.length = 0; FX.texts.length = 0; FX.timers.length = 0; FX.flashes.length = 0;
    FX.shakeA = 0; FX.sx = FX.sy = 0;
  };

  /**
   * 发射粒子。o: x,y,rx,ry(随机范围) ang,spread,sp[min,max] vx,vy life[min,max] size[min,max]
   * end(结束时大小比例) col(颜色或颜色数组) g(重力) drag shape add(叠加发光) a(透明度) layer
   */
  FX.emit = (n, o) => {
    if (FX.ps.length > 1500) n = Math.ceil(n / 4);
    for (let i = 0; i < n; i++) {
      const ang = (o.ang !== undefined ? o.ang : Math.random() * TAU) + (o.spread ? U.rand(-o.spread, o.spread) : 0);
      const sp = o.sp ? U.rand(o.sp[0], o.sp[1]) : 0;
      const life = o.life ? U.rand(o.life[0], o.life[1]) : 0.6;
      FX.ps.push({
        x: o.x + (o.rx ? U.rand(-o.rx, o.rx) : 0),
        y: o.y + (o.ry ? U.rand(-o.ry, o.ry) : 0),
        vx: Math.cos(ang) * sp + (o.vx || 0),
        vy: Math.sin(ang) * sp + (o.vy || 0),
        life, max: life,
        size: o.size ? U.rand(o.size[0], o.size[1]) : 4,
        end: o.end === undefined ? 0 : o.end,
        col: Array.isArray(o.col) ? o.col[Math.floor(Math.random() * o.col.length)] : o.col,
        g: o.g || 0,
        drag: o.drag === undefined ? 1 : o.drag,
        shape: o.shape || 'glow',
        rot: Math.random() * TAU,
        vr: o.vr ? U.rand(-o.vr, o.vr) : 0,
        add: o.add !== false,
        a: o.a === undefined ? 1 : o.a,
        layer: o.layer || 'mid',
      });
    }
  };

  /** 定时特效：{dur, layer, update(dt,p), draw(c,p), end()} */
  FX.add = (e) => { e.t = 0; e.layer = e.layer || 'mid'; FX.list.push(e); return e; };
  FX.after = (sec, fn) => { FX.timers.push({ t: sec, fn }); };
  /* 系统开启「减少动态效果」时，震屏和闪屏都减弱 */
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  FX.shake = (amp, dur) => { if (calm) amp *= 0.2; if (amp >= FX.shakeA * (FX.shakeT / FX.shakeD || 0)) { FX.shakeA = amp; FX.shakeT = FX.shakeD = dur || 0.3; } };
  FX.flash = (col, dur, a) => { FX.flashes.push({ col, life: dur || 0.2, max: dur || 0.2, a: (a === undefined ? 0.6 : a) * (calm ? 0.4 : 1) }); };
  FX.text = (x, y, str, o) => {
    o = o || {};
    FX.texts.push({ x, y, str, col: o.col || '#fff', size: o.size || 26, life: o.dur || 1, max: o.dur || 1, rise: o.rise === undefined ? 60 : o.rise, stroke: o.stroke || 'rgba(10,8,30,.9)' });
  };
  FX.ring = (x, y, r0, r1, col, dur, lw, layer) => {
    FX.add({
      dur: dur || 0.4, layer: layer || 'mid',
      draw(c, p) {
        const e = U.ease.outCubic(p);
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 1 - p;
        c.strokeStyle = col;
        c.lineWidth = Math.max(1, (lw || 4) * (1 - p * 0.7));
        c.beginPath(); c.arc(x, y, r0 + (r1 - r0) * e, 0, TAU); c.stroke();
        c.restore();
      },
    });
  };

  FX.update = (dt) => {
    // 计时器（回调里可能再加计时器，所以先拷贝）
    if (FX.timers.length) {
      const due = [];
      for (let i = FX.timers.length - 1; i >= 0; i--) {
        const tm = FX.timers[i];
        tm.t -= dt;
        if (tm.t <= 0) { due.push(tm); FX.timers.splice(i, 1); }
      }
      for (let i = due.length - 1; i >= 0; i--) due[i].fn();
    }
    const ps = FX.ps;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
      if (p.drag !== 1) { const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d; }
      p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    const L = FX.list;
    for (let i = L.length - 1; i >= 0; i--) {
      const e = L[i];
      e.t += dt;
      const p = Math.min(1, e.t / e.dur);
      if (e.update) e.update(dt, p);
      if (e.t >= e.dur) { L.splice(i, 1); if (e.end) e.end(); }
    }
    for (let i = FX.texts.length - 1; i >= 0; i--) { FX.texts[i].life -= dt; if (FX.texts[i].life <= 0) FX.texts.splice(i, 1); }
    for (let i = FX.flashes.length - 1; i >= 0; i--) { FX.flashes[i].life -= dt; if (FX.flashes[i].life <= 0) FX.flashes.splice(i, 1); }
    if (FX.shakeT > 0) {
      FX.shakeT -= dt;
      const k = Math.max(0, FX.shakeT / FX.shakeD) * FX.shakeA;
      FX.sx = (Math.random() * 2 - 1) * k; FX.sy = (Math.random() * 2 - 1) * k;
      if (FX.shakeT <= 0) { FX.shakeA = 0; FX.sx = FX.sy = 0; }
    }
  };

  function drawP(c, p) {
    const k = p.life / p.max;
    const sz = p.size * (p.end + (1 - p.end) * k);
    const al = p.a * Math.min(1, k * 2.5);
    if (sz <= 0.2 || al <= 0.01) return;
    c.globalAlpha = al;
    switch (p.shape) {
      case 'glow': c.drawImage(FX.glow(p.col), p.x - sz, p.y - sz, sz * 2, sz * 2); break;
      case 'dot': c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, sz, 0, TAU); c.fill(); break;
      case 'smoke': c.globalAlpha = al * 0.38; c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, sz, 0, TAU); c.fill(); break;
      case 'spark': {
        const l = Math.hypot(p.vx, p.vy) || 1;
        c.strokeStyle = p.col; c.lineWidth = Math.max(1, sz * 0.5); c.lineCap = 'round';
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - (p.vx / l) * sz * 3.5, p.y - (p.vy / l) * sz * 3.5); c.stroke();
        break;
      }
      case 'leaf':
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
        c.beginPath(); c.ellipse(0, 0, sz, sz * 0.42, 0, 0, TAU); c.fill(); c.restore(); break;
      case 'shard':
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
        c.beginPath(); c.moveTo(0, -sz); c.lineTo(sz * 0.5, sz * 0.7); c.lineTo(-sz * 0.5, sz * 0.7); c.closePath(); c.fill(); c.restore(); break;
      case 'rect':
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
        c.fillRect(-sz * 0.5, -sz * 0.5, sz, sz); c.restore(); break;
      case 'star':
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
        c.beginPath();
        for (let i = 0; i < 8; i++) { const r = i % 2 ? sz * 0.35 : sz, a = (i / 8) * TAU; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
        c.closePath(); c.fill(); c.restore(); break;
      default: c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, sz, 0, TAU); c.fill();
    }
  }

  /** 画某一层：back(角色身后) / mid(角色身前) / top(全屏层) */
  FX.draw = (c, layer) => {
    const L = FX.list;
    for (let i = 0; i < L.length; i++) {
      const e = L[i];
      if (e.layer === layer && e.draw) e.draw(c, Math.min(1, e.t / e.dur));
    }
    const ps = FX.ps;
    let add = null;
    c.save();
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (p.layer !== layer) continue;
      if (p.add !== add) { add = p.add; c.globalCompositeOperation = add ? 'lighter' : 'source-over'; }
      drawP(c, p);
    }
    c.restore();
  };

  FX.drawOverlay = (c, W, H) => {
    for (let i = 0; i < FX.flashes.length; i++) {
      const f = FX.flashes[i];
      c.globalAlpha = f.a * (f.life / f.max);
      c.fillStyle = f.col;
      c.fillRect(0, 0, W, H);
    }
    c.globalAlpha = 1;
    for (let i = 0; i < FX.texts.length; i++) {
      const t = FX.texts[i], p = 1 - t.life / t.max;
      const pop = p < 0.15 ? U.ease.outBack(p / 0.15) : 1;
      c.save();
      c.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
      c.translate(t.x, t.y - t.rise * U.ease.outCubic(p));
      c.scale(pop, pop);
      c.font = '800 ' + t.size + 'px "Fredoka","PingFang SC","Microsoft YaHei",sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineJoin = 'round'; c.lineWidth = Math.max(3, t.size * 0.22);
      c.strokeStyle = t.stroke; c.strokeText(t.str, 0, 0);
      c.fillStyle = t.col; c.fillText(t.str, 0, 0);
      c.restore();
    }
  };
})();
