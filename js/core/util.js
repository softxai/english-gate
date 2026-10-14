/* English Gate · 基础工具 & 存档 */
(function () {
  'use strict';
  const EG = (window.EG = window.EG || {});
  const U = (EG.U = {});

  U.TAU = Math.PI * 2;
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => (b === undefined ? Math.random() * (a === undefined ? 1 : a) : a + Math.random() * (b - a));
  U.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  /** 可复现的伪随机数（背景等需要每次画出同样结果的地方用） */
  U.rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  U.ease = {
    lin: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outBack: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };

  /* ---------- 颜色 ---------- */
  const rgbCache = new Map();
  U.hex2rgb = (h) => {
    let r = rgbCache.get(h);
    if (r) return r;
    let s = String(h).replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16) || 0;
    r = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(h, r);
    return r;
  };
  const shadeCache = new Map();
  /** amt>0 变亮（混白），amt<0 变暗（混黑）。只用常量调用，结果会缓存。 */
  U.shade = (h, amt) => {
    const key = h + '|' + amt;
    let v = shadeCache.get(key);
    if (v) return v;
    const c = U.hex2rgb(h);
    const t = amt < 0 ? 0 : 255;
    const p = Math.min(1, Math.abs(amt));
    v = '#' + c.map((x) => Math.round(x + (t - x) * p).toString(16).padStart(2, '0')).join('');
    if (shadeCache.size > 4000) shadeCache.clear();
    shadeCache.set(key, v);
    return v;
  };
  U.rgba = (h, a) => { const c = U.hex2rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a < 0 ? 0 : a > 1 ? 1 : a) + ')'; };
  U.mix = (h1, h2, t) => {
    const a = U.hex2rgb(h1), b = U.hex2rgb(h2);
    return '#' + [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0')).join('');
  };

  U.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- 存档（localStorage，失败时退回内存） ---------- */
  const KEY = 'english-gate-save-v1';
  const defaults = () => ({
    v: 1,
    settings: { sfx: true, music: true, tts: true, speed: 'normal', asrLang: 'en-US', speakAuto: true, listenRate: 'normal', voiceM: '', voiceF: '', voiceN: '' },
    progress: {},     // sceneId -> { stars:[..], best:[..] }
    words: {},        // bankId -> { word: [对次数, 错次数, 连对次数] }
    bestiary: {},     // monsterId -> 1
    sceneBank: {},    // sceneId -> bankId（用户为场景指定的词库）
    customBanks: {},  // bankId -> { name, words:[{w,pos,m}] }
    speak: { seen: {}, best: {} }, // 口语：题目出现次数、各关最好成绩
    listen: { seen: {}, best: {} }, // 听力：录音出现次数、各关最好正确率
    lastScene: 'forest',
  });
  const Store = (EG.Store = { data: defaults() });
  Store.load = () => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        const base = defaults();
        Store.data = Object.assign(base, d);
        Store.data.settings = Object.assign(defaults().settings, d.settings || {});
        Store.data.speak = Object.assign(defaults().speak, d.speak || {});
        Store.data.listen = Object.assign(defaults().listen, d.listen || {});
      }
    } catch (e) { /* 无痕模式等：只用内存存档 */ }
  };
  let saveTimer = null;
  Store.save = () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try { window.localStorage.setItem(KEY, JSON.stringify(Store.data)); } catch (e) { /* ignore */ }
    }, 150);
  };
  /** 立即写盘（关闭页面前调用） */
  Store.flush = () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    try { window.localStorage.setItem(KEY, JSON.stringify(Store.data)); } catch (e) { /* ignore */ }
  };
  Store.reset = () => {
    const keep = { customBanks: Store.data.customBanks, settings: Store.data.settings, sceneBank: Store.data.sceneBank };
    Store.data = Object.assign(defaults(), keep);
    Store.save();
  };
})();
