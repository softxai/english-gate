/* English Gate · 启动与主循环 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, S = EG.Stage, FX = EG.FX, TAU = Math.PI * 2;
  let last = 0, time = 0;

  /* 标题界面的小剧场：主角和一只随机怪兽在场景里待机 */
  const show = { mon: null, t: 0, a: { t: 0, cast: 0, atk: 0, hurt: 0, seed: 2 }, heroA: { t: 0, cast: 0, atk: 0, hurt: 0, win: false, gem: '#7cc7ff' }, ms: null, hs: null };
  function pickShow() {
    const sc = EG.sceneById(EG.Store.data.lastScene), all = [];
    sc.levels.forEach((l) => l.mons.forEach((m) => all.push(m)));
    show.mon = U.pick(all); show.t = 0; show.a.atk = 0; show.a.seed = Math.random() * 10; show.fired = false;
  }
  function drawMenu(c, dt) {
    S.drawBg(c, time);
    if (EG.UI.cur !== 'title') return;
    if (!show.ms) { show.ms = new EG.Sprite(600, 520, 300, 430); show.hs = new EG.Sprite(320, 320, 140, 285); pickShow(); }
    show.t += dt;
    if (show.t > 7.5) pickShow();
    const m = show.mon, a = show.a, fade = U.clamp(Math.min(show.t / 0.6, (7.5 - show.t) / 0.6), 0, 1);
    a.t += dt; show.heroA.t += dt;
    a.cast = show.t > 2.6 && show.t < 4.6 ? U.clamp(Math.min((show.t - 2.6) * 2, (4.6 - show.t) * 3), 0, 1) : 0;
    if (show.t > 4.6 && !show.fired) { show.fired = true; a.atk = 0.001; }
    if (a.atk > 0) { a.atk += dt / 0.55; if (a.atk >= 1) a.atk = 0; }
    const s = S.s * 0.92, gy = S.gy, size = Math.min(m.size, 1.2);
    const hx = Math.max(72 * s, S.W * 0.14), mx = Math.min(S.W - 120 * s, S.W * 0.86), k = s * size;
    const L = a.atk > 0 ? Math.sin(Math.PI * a.atk) : 0, fly = EG.Creatures.isFly(m);
    c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.ellipse(hx, gy + 5 * s, 50 * s, 10 * s, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(0,0,0,' + 0.32 * fade + ')'; c.beginPath(); c.ellipse(mx - L * 40 * s, gy + 5 * s, (fly ? 56 : 88) * k, (fly ? 9 : 13) * k, 0, 0, TAU); c.fill();
    show.hs.render(s, (cc) => EG.Hero.draw(cc, show.heroA));
    show.hs.blit(c, hx, gy, s, 1);
    show.ms.render(k, (cc) => EG.Creatures.draw(cc, m, a));
    show.ms.blit(c, mx - L * 40 * s, gy, k, fade);
  }

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000) || 0);
    last = now; time += dt;
    const c = S.c, B = EG.Battle;
    c.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#05060f'; c.fillRect(0, 0, S.W, S.H);
    try {
      if (B.active) {
        if (!B.paused) { FX.update(dt); B.update(dt); }
        B.draw(c);
      } else drawMenu(c, dt);
    } catch (e) {
      if (!frame.err) { frame.err = true; console.error('[English Gate] 渲染出错：', e); }
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    EG.Store.load();
    EG.Banks.loadCustom();
    S.init();
    EG.UI.init();
    EG.UI.show('title');
    const unlock = () => { EG.Audio.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('pagehide', EG.Store.flush);
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { if (EG.Battle.word) EG.Battle.word.widths = null; });
    requestAnimationFrame((t) => { last = t; frame(t); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
