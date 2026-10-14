/* English Gate · 舞台（画布、布局、背景缓存）与精灵缓冲 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U;
  const S = (EG.Stage = {
    W: 0, H: 0, dpr: 1, s: 1, gy: 0,
    hero: { x: 0, y: 0 }, mon: { x: 0, y: 0 }, word: { x: 0, y: 0 },
    bgId: 'forest', bgLi: 0, cache: null, top: 0,
  });

  S.init = () => {
    S.cv = document.getElementById('stage');
    S.c = S.cv.getContext('2d');
    window.addEventListener('resize', S.resize);
    window.addEventListener('orientationchange', () => setTimeout(S.resize, 200));
    S.resize();
  };

  S.resize = () => {
    const W = Math.max(280, window.innerWidth), H = Math.max(320, window.innerHeight);
    S.dpr = Math.min(2, window.devicePixelRatio || 1);
    S.cv.width = Math.round(W * S.dpr);
    S.cv.height = Math.round(H * S.dpr);
    S.cv.style.width = W + 'px';
    S.cv.style.height = H + 'px';
    S.W = W; S.H = H;
    S.cache = null;
    S.layout();
  };

  /** 根据窗口和底部答题面板的高度，算出地面线、主角/怪兽/单词的位置和整体缩放 */
  S.layout = () => {
    const inBattle = !!(EG.Battle && EG.Battle.active);
    const panel = document.getElementById('panel');
    const ph = inBattle && panel ? panel.offsetHeight : Math.round(S.H * 0.2);
    S.portrait = S.W < S.H * 0.8;
    const top = inBattle ? (S.W <= 640 ? 122 : 76) : Math.round(S.H * 0.1);
    const sh = S.H - ph;
    const s = U.clamp(Math.min(S.W / (S.portrait ? 600 : 760), (sh - top) / 440), 0.36, 1.5);
    const gy = Math.round(sh - Math.max(16, (sh - top) * 0.09));
    if (gy !== S.gy) S.cache = null;
    S.s = s; S.gy = gy; S.top = top;
    S.hero.x = Math.max(62 * s + 6, S.W * 0.19); S.hero.y = gy;
    S.mon.x = Math.min(S.W - 118 * s, S.W * 0.75); S.mon.y = gy;
    S.word.x = S.W * (S.portrait ? 0.5 : 0.47);
    S.word.y = top + Math.max(78 * s, (gy - top) * 0.2);
    document.documentElement.style.setProperty('--word-y', Math.round(S.word.y) + 'px');
  };

  S.setBg = (id, li) => {
    li = li || 0;
    if (S.bgId !== id || S.bgLi !== li) { S.bgId = id; S.bgLi = li; S.cache = null; }
  };

  S.drawBg = (c, t) => {
    if (!S.cache) {
      const cv = document.createElement('canvas');
      cv.width = S.cv.width; cv.height = S.cv.height;
      const g = cv.getContext('2d');
      g.scale(S.dpr, S.dpr);
      EG.Backgrounds.drawStatic(g, S.bgId, S.W, S.H, S.gy, S.bgLi);
      S.cache = cv;
    }
    c.drawImage(S.cache, 0, 0, S.W, S.H);
    EG.Backgrounds.drawAnim(c, S.bgId, S.W, S.H, S.gy, t, S.bgLi);
  };

  /**
   * 精灵缓冲：角色先画到离屏画布，再整体贴到主画布。
   * 这样可以整体做受击闪白、死亡淡出、剪影等效果。
   */
  function Sprite(w, h, ox, oy) {
    this.w = w; this.h = h; this.ox = ox; this.oy = oy;
    this.cv = document.createElement('canvas');
    this.c = this.cv.getContext('2d');
  }
  Sprite.prototype.render = function (k, fn, flash, flashCol) {
    const pk = Math.min(k * S.dpr, 3.2);
    const pw = Math.max(2, Math.ceil(this.w * pk)), ph = Math.max(2, Math.ceil(this.h * pk));
    if (this.cv.width !== pw || this.cv.height !== ph) { this.cv.width = pw; this.cv.height = ph; }
    const c = this.c;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, pw, ph);
    c.setTransform(pk, 0, 0, pk, this.ox * pk, this.oy * pk);
    fn(c);
    if (flash > 0) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'source-atop';
      c.globalAlpha = Math.min(1, flash);
      c.fillStyle = flashCol || '#fff';
      c.fillRect(0, 0, pw, ph);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    return this.cv;
  };
  Sprite.prototype.blit = function (c, x, y, k, alpha, sx, sy, rot) {
    c.save();
    c.translate(x, y);
    if (rot) c.rotate(rot);
    if (sx !== undefined) c.scale(sx, sy === undefined ? sx : sy);
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    c.drawImage(this.cv, -this.ox * k, -this.oy * k, this.w * k, this.h * k);
    c.restore();
  };
  EG.Sprite = Sprite;
})();
