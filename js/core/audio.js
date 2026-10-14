/* English Gate · 音效（WebAudio 实时合成，无需音频文件）、背景音乐、单词朗读 */
(function () {
  'use strict';
  const EG = window.EG;
  const A = (EG.Audio = { ctx: null });
  let sfxBus, musBus, noiseBuf;

  function ac() {
    if (A.ctx === null) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { A.ctx = false; return null; }
      try { A.ctx = new AC(); } catch (e) { A.ctx = false; return null; }
      const master = A.ctx.createGain();
      master.gain.value = 0.9;
      master.connect(A.ctx.destination);
      sfxBus = A.ctx.createGain(); sfxBus.connect(master);
      musBus = A.ctx.createGain(); musBus.gain.value = 0.42; musBus.connect(master);
      const len = A.ctx.sampleRate;
      noiseBuf = A.ctx.createBuffer(1, len, len);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (!A.ctx) return null;
    if (A.ctx.state === 'suspended') A.ctx.resume().catch(() => {});
    return A.ctx;
  }

  function tone(f, dur, o) {
    o = o || {};
    const c = A.ctx, t0 = c.currentTime + (o.at || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    const v = o.vol || 0.15;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.atk || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  function noise(dur, o) {
    o = o || {};
    const c = A.ctx, t0 = c.currentTime + (o.at || 0);
    const src = c.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const flt = c.createBiquadFilter();
    flt.type = o.ft || 'lowpass';
    flt.frequency.setValueAtTime(o.f || 1200, t0);
    if (o.to) flt.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    flt.Q.value = o.q || 1;
    const g = c.createGain(), v = o.vol || 0.2;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.atk || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(flt); flt.connect(g); g.connect(sfxBus);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }
  const arp = (notes, step, dur, o) => notes.forEach((f, i) => tone(f, dur, Object.assign({}, o, { at: i * step })));

  const SFX = {
    click() { tone(720, 0.07, { type: 'triangle', to: 980, vol: 0.1 }); },
    appear() { noise(0.5, { f: 300, to: 1800, vol: 0.14, ft: 'bandpass', q: 2 }); tone(110, 0.4, { type: 'sawtooth', to: 70, vol: 0.08 }); },
    boss() { tone(80, 1.2, { type: 'sawtooth', to: 50, vol: 0.2 }); tone(160, 1.2, { type: 'square', to: 100, vol: 0.06 }); noise(1.1, { f: 200, to: 60, vol: 0.2 }); },
    word() { arp([660, 880, 1320], 0.06, 0.25, { type: 'sine', vol: 0.09 }); noise(0.3, { f: 5000, ft: 'highpass', vol: 0.03 }); },
    correct() { arp([523, 659, 784, 1047], 0.055, 0.22, { type: 'triangle', vol: 0.14 }); },
    perfect() { arp([659, 784, 988, 1319, 1568], 0.05, 0.25, { type: 'triangle', vol: 0.14 }); },
    wrong() { tone(220, 0.28, { type: 'sawtooth', to: 110, vol: 0.13 }); tone(233, 0.28, { type: 'square', to: 104, vol: 0.06 }); },
    cast() { noise(0.3, { f: 600, to: 4000, ft: 'bandpass', q: 3, vol: 0.12 }); tone(440, 0.25, { to: 1200, vol: 0.08 }); },
    fire() { noise(0.55, { f: 900, to: 120, vol: 0.3 }); tone(160, 0.4, { type: 'sawtooth', to: 50, vol: 0.14 }); },
    ice() { arp([1800, 2400, 3100, 2100], 0.04, 0.22, { type: 'sine', vol: 0.07 }); noise(0.25, { f: 6000, ft: 'highpass', vol: 0.08 }); },
    thunder() { noise(0.12, { f: 8000, ft: 'highpass', vol: 0.3 }); noise(0.9, { f: 500, to: 60, vol: 0.34, at: 0.03 }); tone(90, 0.6, { type: 'sawtooth', to: 40, vol: 0.14 }); },
    wind() { noise(0.6, { f: 400, to: 2600, ft: 'bandpass', q: 1.5, vol: 0.18 }); },
    holy() { [523, 659, 784, 1047].forEach((f) => tone(f, 0.8, { vol: 0.07, atk: 0.08 })); noise(0.5, { f: 7000, ft: 'highpass', vol: 0.04 }); },
    dark() { tone(180, 0.6, { type: 'sawtooth', to: 45, vol: 0.14 }); tone(187, 0.6, { type: 'sawtooth', to: 48, vol: 0.1 }); noise(0.5, { f: 300, vol: 0.1 }); },
    beam() { tone(300, 0.5, { type: 'sawtooth', to: 1400, vol: 0.1 }); tone(600, 0.5, { type: 'square', to: 2800, vol: 0.04 }); noise(0.5, { f: 3000, ft: 'bandpass', vol: 0.1 }); },
    slash() { noise(0.14, { f: 3000, to: 9000, ft: 'bandpass', q: 2, vol: 0.2 }); noise(0.14, { f: 3000, to: 9000, ft: 'bandpass', q: 2, vol: 0.2, at: 0.11 }); },
    quake() { noise(0.7, { f: 160, to: 50, vol: 0.4 }); tone(60, 0.6, { type: 'triangle', to: 35, vol: 0.25 }); },
    swarm() { for (let i = 0; i < 6; i++) tone(400 + Math.random() * 500, 0.12, { type: 'square', vol: 0.03, at: i * 0.07 }); },
    hit() { noise(0.16, { f: 1400, to: 200, vol: 0.28 }); tone(140, 0.16, { type: 'square', to: 60, vol: 0.12 }); },
    hurt() { noise(0.25, { f: 700, to: 150, vol: 0.3 }); tone(200, 0.3, { type: 'sawtooth', to: 80, vol: 0.14 }); },
    death() { tone(500, 0.5, { type: 'sawtooth', to: 60, vol: 0.12 }); noise(0.6, { f: 2000, to: 100, vol: 0.2 }); arp([880, 660, 440, 330], 0.06, 0.2, { vol: 0.05 }); },
    warn() { [0, 0.32, 0.64].forEach((at) => { tone(880, 0.14, { type: 'square', vol: 0.09, at }); tone(660, 0.14, { type: 'square', vol: 0.09, at: at + 0.15 }); }); },
    ult() { tone(70, 1.6, { type: 'sawtooth', to: 600, vol: 0.14 }); noise(1.6, { f: 200, to: 5000, ft: 'bandpass', q: 1, vol: 0.2 }); noise(0.9, { f: 600, to: 40, vol: 0.4, at: 1.5 }); tone(60, 0.9, { type: 'triangle', to: 30, vol: 0.3, at: 1.5 }); },
    heal() { arp([523, 659, 784, 1047, 1319], 0.07, 0.3, { vol: 0.09 }); },
    skill() { arp([880, 1175, 1568], 0.05, 0.2, { type: 'triangle', vol: 0.1 }); },
    freeze() { arp([2093, 1568, 1175, 880], 0.06, 0.3, { vol: 0.08 }); noise(0.4, { f: 7000, ft: 'highpass', vol: 0.06 }); },
    tick() { tone(1000, 0.04, { type: 'square', vol: 0.05 }); },
    star() { arp([1047, 1319, 1568], 0.05, 0.3, { type: 'triangle', vol: 0.12 }); },
    win() { arp([523, 523, 523, 698, 880, 784, 1047], 0.13, 0.34, { type: 'triangle', vol: 0.15 }); arp([262, 349, 440, 523], 0.26, 0.5, { type: 'sine', vol: 0.1 }); },
    lose() { arp([440, 415, 370, 311, 262], 0.2, 0.5, { type: 'triangle', vol: 0.13 }); },
    combo(n) { const f = 600 * Math.pow(1.06, Math.min(16, n || 1)); tone(f, 0.12, { type: 'triangle', vol: 0.1 }); tone(f * 1.5, 0.14, { type: 'triangle', vol: 0.07, at: 0.05 }); },
  };

  const settings = () => EG.Store.data.settings;

  A.play = (name, arg) => {
    try {
      if (!settings().sfx) return;
      if (!ac()) return;
      if (SFX[name]) SFX[name](arg);
    } catch (e) { /* 音频失败不影响游戏 */ }
  };
  /** 浏览器要求用户先点一下才能出声：第一次交互时调用，顺便把等待中的背景音乐放起来 */
  A.unlock = () => {
    try { ac(); if (musWant && !musTimer) { const w = musWant; musId = null; A.music(w); } } catch (e) { /* ignore */ }
  };

  /* ---------- 背景音乐：按场景音阶即兴生成 ---------- */
  const MUSIC = {
    title: { root: 57, scale: [0, 2, 4, 7, 9], bpm: 84, wave: 'triangle' },
    forest: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 96, wave: 'triangle' },
    desert: { root: 57, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 92, wave: 'sawtooth' },
    snow: { root: 62, scale: [0, 2, 3, 7, 9], bpm: 76, wave: 'sine' },
    castle: { root: 55, scale: [0, 2, 3, 5, 7, 8, 11], bpm: 88, wave: 'square' },
    volcano: { root: 52, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 112, wave: 'sawtooth' },
    void: { root: 54, scale: [0, 2, 4, 6, 8, 10], bpm: 70, wave: 'sine' },
  };
  let musTimer = null, musId = null, musWant = null, step = 0, walk = 0;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function musTick(cfg) {
    const sc = cfg.scale, n = sc.length;
    const deg = (d) => cfg.root + sc[((d % n) + n) % n] + 12 * Math.floor(d / n);
    const beat = 60 / cfg.bpm / 2;
    if (step % 16 === 0) {
      const base = [0, 3, 4, 2][Math.floor(step / 16) % 4];
      [base, base + 2, base + 4].forEach((d) => tone(mtof(deg(d) - 12), beat * 15, { type: 'sine', vol: 0.045, atk: 0.6, bus: musBus }));
      tone(mtof(deg(base) - 24), beat * 7, { type: 'triangle', vol: 0.09, atk: 0.05, bus: musBus });
    }
    if (step % 8 === 4) tone(mtof(deg([0, 3, 4, 2][Math.floor(step / 16) % 4]) - 24), beat * 3, { type: 'triangle', vol: 0.06, bus: musBus });
    if (Math.random() < (step % 2 === 0 ? 0.75 : 0.3)) {
      walk += U_pick([-2, -1, -1, 1, 1, 2]);
      if (walk < -2) walk = 1; if (walk > 9) walk = 6;
      tone(mtof(deg(walk) + 12), beat * 1.8, { type: cfg.wave, vol: cfg.wave === 'sine' ? 0.06 : 0.028, atk: 0.01, bus: musBus });
    }
    step++;
  }
  const U_pick = (a) => a[Math.floor(Math.random() * a.length)];
  A.music = (id) => {
    musWant = id;
    if (id === musId && musTimer) return;
    if (musTimer) { clearInterval(musTimer); musTimer = null; }
    musId = id;
    if (!id || !settings().music) return;
    if (!A.ctx) return; // 还没解锁音频，等 unlock() 时再启动
    const cfg = MUSIC[id] || MUSIC.title;
    step = 0; walk = 2;
    musTimer = setInterval(() => {
      try { if (A.ctx && A.ctx.state === 'running' && !document.hidden) musTick(cfg); } catch (e) { /* ignore */ }
    }, (60 / cfg.bpm / 2) * 1000);
  };
  A.refreshMusic = () => { const id = musWant; musId = null; A.music(id); };

  /** 给麦克风音量分析用 */
  A.context = () => { try { return ac(); } catch (e) { return null; } };

  /* ---------- 朗读 ---------- */
  A.speak = (text) => {
    try {
      if (!settings().tts || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  };
})();
