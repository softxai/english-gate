/* English Gate · 语音：麦克风、语音识别、录音回放、考官朗读
 *
 * 语音识别用浏览器自带的 Web Speech API（Chrome / Edge / Safari 有，Firefox 没有）。
 *   · Chrome 的识别要把声音发到 Google 的服务器，所以需要联网并且能访问 Google；
 *   · 出错（没权限、没网络、不支持）时由上层退回"录音 + 自评"或"打字作答"。
 * 录音用 MediaRecorder，只保存在内存里供回放，不上传、不落盘。
 */
(function () {
  'use strict';
  const EG = window.EG;
  const V = (EG.Voice = {});
  const now = () => (window.performance && performance.now ? performance.now() : Date.now()) / 1000;
  const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
  const md = () => navigator.mediaDevices;

  V.support = () => ({
    asr: !!SR(),
    mic: !!(md() && md().getUserMedia),
    rec: !!(md() && md().getUserMedia && window.MediaRecorder),
    tts: !!window.speechSynthesis,
    file: location.protocol === 'file:',
  });

  /* ---------- 麦克风（整关只申请一次，用来录音和显示音量） ---------- */
  let stream = null, streamP = null, analyser = null, buf = null, srcNode = null;
  V.micError = null;
  V.openMic = () => {
    if (stream) return Promise.resolve(stream);
    if (streamP) return streamP;
    if (!V.support().mic) { V.micError = 'unsupported'; return Promise.reject(new Error('unsupported')); }
    streamP = md().getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then((s) => {
      stream = s; streamP = null; V.micError = null;
      try {
        const ctx = EG.Audio.context && EG.Audio.context();
        if (ctx) { srcNode = ctx.createMediaStreamSource(s); analyser = ctx.createAnalyser(); analyser.fftSize = 1024; buf = new Float32Array(analyser.fftSize); srcNode.connect(analyser); }
      } catch (e) { analyser = null; }
      return s;
    }, (e) => { streamP = null; V.micError = (e && e.name) || 'error'; throw e; });
    return streamP;
  };
  V.closeMic = () => {
    V.cancel();
    try { if (srcNode) srcNode.disconnect(); } catch (e) { /* ignore */ }
    if (stream) stream.getTracks().forEach((t) => { try { t.stop(); } catch (e) { /* ignore */ } });
    stream = null; analyser = null; srcNode = null;
  };
  V.hasMic = () => !!stream;
  /** 当前音量 0–1；拿不到时返回 -1 */
  V.level = () => {
    if (!analyser) return -1;
    try {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0; for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      return Math.min(1, Math.sqrt(sum / buf.length) * 6);
    } catch (e) { return -1; }
  };

  /* ---------- 一次"听"：识别 + 录音 ---------- */
  let sess = null, urls = [];
  const FATAL = { 'not-allowed': 1, 'service-not-allowed': 1, network: 1, 'audio-capture': 1, 'language-not-supported': 1 };

  function startRecognition(s) {
    let r;
    try { r = new (SR())(); } catch (e) { s.fatal = 'unsupported'; return finish(s); }
    s.rec = r; s.recAlive = true;
    r.lang = s.opt.lang || 'en-US'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onstart = () => { if (!s.heardStart) { s.heardStart = true; if (s.opt.onStart) s.opt.onStart(); } };
    r.onresult = (e) => {
      if (s.ended) return;
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i], alt = res[0]; if (!alt) continue;
        if (res.isFinal) {
          const t = String(alt.transcript || '').trim();
          if (t) { s.final += (s.final ? ' ' : '') + t; if (alt.confidence > 0) s.confs.push([alt.confidence, t.split(/\s+/).length]); }
        } else interim += alt.transcript;
      }
      s.interim = interim.trim();
      const t = now(); s.lastResult = t; if (s.firstResult === null) s.firstResult = t;
      if (s.opt.onText) s.opt.onText(s.final, s.interim);
    };
    r.onerror = (e) => { const code = (e && e.error) || 'error'; s.err = code; if (FATAL[code]) s.fatal = code; };
    r.onend = () => {
      s.recAlive = false;
      if (s.ended) return;
      if (s.stopping || s.fatal) return finish(s);
      // 引擎自己停了（比如一段时间没声音）：只要这一题还没结束就接着听
      if (s.restarts++ < 8) { try { startRecognition(s); return; } catch (e) { /* fallthrough */ } }
      finish(s);
    };
    try { r.start(); } catch (e) { s.fatal = s.fatal || 'start-failed'; finish(s); }
  }

  function startRecorder(s) {
    if (!stream || !window.MediaRecorder) return;
    try {
      const mr = new MediaRecorder(stream);
      s.mr = mr; s.chunks = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) s.chunks.push(e.data); };
      mr.onstop = () => { s.mrDone = true; if (s.wantFinish) finish(s); };
      mr.start();
    } catch (e) { s.mr = null; }
  }

  function finish(s) {
    if (s.ended) return;
    s.wantFinish = true;
    // 录音机要等它把最后一段数据交出来（onstop）再收尾，最多等半秒
    if (s.mr && !s.mrDone) {
      if (s.mr.state !== 'inactive') { try { s.mr.stop(); } catch (e) { s.mrDone = true; } }
      if (!s.mrDone) { if (!s.mrWait) s.mrWait = setTimeout(() => { s.mrDone = true; finish(s); }, 500); return; }
    }
    s.ended = true; clearTimeout(s.killT); clearTimeout(s.mrWait);
    if (sess === s) sess = null;
    let text = s.final;
    if (s.interim && text.toLowerCase().indexOf(s.interim.toLowerCase()) < 0) text += (text ? ' ' : '') + s.interim; // 没来得及定稿的最后几个词
    let conf = null;
    if (s.confs.length) { let a = 0, b = 0; s.confs.forEach((c) => { a += c[0] * c[1]; b += c[1]; }); conf = a / b; }
    let audioUrl = null;
    if (s.chunks && s.chunks.length) { try { audioUrl = URL.createObjectURL(new Blob(s.chunks, { type: s.chunks[0].type || 'audio/webm' })); urls.push(audioUrl); while (urls.length > 40) URL.revokeObjectURL(urls.shift()); } catch (e) { /* ignore */ } }
    const tEnd = now();
    const first = s.firstVoice !== null ? s.firstVoice : s.firstResult;
    const res = {
      text: text.trim(), conf, audioUrl, mode: s.opt.mode,
      dur: s.voiced > 0.3 ? s.voiced : first !== null ? Math.max(0, (s.lastResult || tEnd) - first) : 0,
      latency: first !== null ? Math.max(0, first - s.t0) : null,
      elapsed: tEnd - s.t0, error: s.err || null, fatal: s.fatal || null,
    };
    if (s.opt.onEnd) s.opt.onEnd(res);
  }

  /**
   * 开始听。opt: { mode: 'asr' | 'rec', lang, onStart(), onText(final, interim), onEnd(result) }
   * result: { text, conf, audioUrl, dur 说话秒数, latency 开口前秒数, elapsed, error, fatal }
   */
  V.listen = (opt) => {
    V.cancel();
    const s = (sess = { opt, t0: now(), final: '', interim: '', confs: [], firstResult: null, lastResult: null, firstVoice: null, lastVoice: null, voiced: 0, restarts: 0, ended: false, stopping: false });
    startRecorder(s);
    if (opt.mode === 'asr') startRecognition(s);
    else if (opt.onStart) opt.onStart();
    return s;
  };
  /** 说完了：等识别引擎把最后一句定稿再回调 onEnd */
  V.stop = () => {
    const s = sess; if (!s || s.stopping) return;
    s.stopping = true;
    if (s.rec && s.recAlive) { try { s.rec.stop(); } catch (e) { s.recAlive = false; } } else s.recAlive = false;
    if (s.mr && s.mr.state !== 'inactive') { try { s.mr.stop(); } catch (e) { s.mrDone = true; } } else s.mrDone = true;
    if (!s.recAlive) finish(s);
    s.killT = setTimeout(() => finish(s), 1800); // 引擎迟迟不结束时兜底
  };
  /** 放弃这一次，不回调 */
  V.cancel = () => {
    const s = sess; if (!s) return;
    s.ended = true; sess = null; clearTimeout(s.killT); clearTimeout(s.mrWait);
    try { if (s.rec) s.rec.abort(); } catch (e) { /* ignore */ }
    try { if (s.mr && s.mr.state !== 'inactive') s.mr.stop(); } catch (e) { /* ignore */ }
  };
  V.listening = () => !!sess && !sess.stopping;

  /**
   * 每帧调用：根据音量（或识别结果的时间）估计"说了多久、停了多久"。
   * 返回 { level, voiced 累计说话秒数, silent 已经安静的秒数, heard 是否已经听到声音 }
   */
  V.poll = (dt) => {
    const s = sess; if (!s) return { level: -1, voiced: 0, silent: 0, heard: false };
    const lv = V.level(), t = now();
    if (lv >= 0) {
      if (lv > 0.09) { s.voiced += dt; s.lastVoice = t; if (s.firstVoice === null) s.firstVoice = t; }
    }
    const lastAny = Math.max(s.lastVoice || 0, s.lastResult || 0);
    const heard = s.firstVoice !== null || s.firstResult !== null;
    return { level: lv, voiced: s.voiced, silent: heard ? t - lastAny : t - s.t0, heard, text: s.final + (s.interim ? ' ' + s.interim : '') };
  };

  /* ---------- 朗读（考官 / 搭档） ---------- */
  let sayTimer = null, sayTok = 0, sayStop = null;
  /** 读一句话，读完（或被打断、或没有朗读功能时按阅读时间估算）后调用 done。who：'pa' 搭档（女声），其它是考官（男声） */
  V.say = (text, who, done) => {
    const tok = ++sayTok;
    clearTimeout(sayTimer); if (sayStop) { sayStop(); sayStop = null; }
    const words = String(text).split(/\s+/).length, est = 0.7 + words * 0.36;
    let called = false;
    const fin = () => { if (called || tok !== sayTok) return; called = true; clearTimeout(sayTimer); if (done) done(); };
    const tts = EG.Store.data.settings.tts && window.speechSynthesis;
    if (!tts) { sayTimer = setTimeout(fin, Math.min(est, 6) * 1000 * (EG.Store.data.settings.tts ? 1 : 0.75)); return; }
    try {
      window.speechSynthesis.cancel();
      sayStop = utter(text, who === 'pa' ? 'F' : 'M', 0.92, fin);
    } catch (e) { sayTimer = setTimeout(fin, est * 1000); }
  };
  V.hush = () => { sayTok++; clearTimeout(sayTimer); if (sayStop) { sayStop(); sayStop = null; } try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
  const estSec = (text, rate) => 0.45 + (String(text).split(/\s+/).length * 0.37) / (rate || 1);
  /* ---------- 选声音：男声 M、女声 F、旁白 N ---------- */
  const MALE = /daniel|arthur|oliver|george|ryan|alex|thomas|\btom\b|gordon|aaron|rishi|evan|nathan|\blee\b|jamie|malcolm|david|mark|guy|james|richard|sean|christopher|eric|roger|steffan|andrew|brian|william|liam|connor|mitchell|prabhat|luke|duncan|google uk english male|\bmale\b/i;
  const FEMALE = /samantha|karen|moira|tessa|serena|kate|martha|victoria|fiona|susan|allison|ava|zoe|nicky|stephanie|catherine|matilda|isha|veena|sangeeta|hazel|zira|linda|heera|aria|jenny|michelle|\bana\b|emma|sonia|libby|maisie|natasha|clara|emily|neerja|molly|leah|google uk english female|google us english|female/i;
  // 系统里自带的"特效音"和老式机械音（macOS 的 Fred、Zarvox、Eddy、Rocko……），自动选声时不用，列表里也不显示
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|kathy|organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|\bfred\b|\beddy\b|\bflo\b|grandma|grandpa|\breed\b|rocko|\bsandy\b|shelley/i;
  const ROLE_KEY = { M: 'voiceM', F: 'voiceF', N: 'voiceN' };
  const bad = {}; // 这次打开页面期间读不出来的声音（多半是联网的声音连不上）
  let cast = null;
  const genderOf = (v) => (FEMALE.test(v.name) ? 'F' : MALE.test(v.name) ? 'M' : '');
  /** 声音的大致质量：神经网络语音 > 系统的高音质版本 > Chrome 自带的 Google 语音 > 系统默认语音；英式略优先（PET 以英式口音为主） */
  const quality = (v) => (/natural|neural/i.test(v.name) ? 5 : /premium|enhanced|siri|优化|高音质/i.test(v.name) ? 4 : /^google/i.test(v.name) ? 3 : 2) + (/GB/i.test(v.lang) ? 0.5 : /US/i.test(v.lang) ? 0.25 : 0);
  function enVoices() {
    let vs = [];
    try { vs = (window.speechSynthesis && window.speechSynthesis.getVoices()) || []; } catch (e) { vs = []; }
    const en = vs.filter((v) => /^en[-_]/i.test(v.lang) && !bad[v.name]);
    const nice = en.filter((v) => !NOVELTY.test(v.name));
    return (nice.length ? nice : en).slice().sort((a, b) => quality(b) - quality(a));
  }
  /** 可以选的英文声音（质量高的在前）：[{ name, lang, local, gender 'M'|'F'|'' }] */
  V.voices = () => enVoices().map((v) => ({ name: v.name, lang: v.lang, local: !!v.localService, gender: genderOf(v) }));
  /** 给男声 M、女声 F、旁白 N 各挑一个声音：设置里指定了就用指定的，否则自动挑质量最好的；只有一个声音时靠音调区分 */
  V.cast = () => {
    const en = enVoices(), st = EG.Store.data.settings;
    const key = en.length + '|' + Object.keys(bad).length + '|' + [st.voiceM, st.voiceF, st.voiceN].join('|');
    if (cast && cast.key === key) return cast;
    const chosen = (r) => (st[ROLE_KEY[r]] ? en.find((v) => v.name === st[ROLE_KEY[r]]) || null : null);
    const cm = chosen('M'), cf = chosen('F'), cn = chosen('N');
    const m = cm || en.find((v) => genderOf(v) === 'M' && v !== cf) || null;
    const f = cf || en.find((v) => genderOf(v) === 'F' && v !== m) || en.find((v) => v !== m && genderOf(v) !== 'M') || null;
    const n = cn || en.find((v) => v !== m && v !== f) || f || m || null;
    const M = m || f || n, F = f || m || n;
    cast = {
      key, n: en.length, ok: en.length > 0,
      M: { voice: M, pitch: m ? 1 : 0.72 }, F: { voice: F, pitch: f && f !== M ? 1 : 1.3 }, N: { voice: n, pitch: n && n !== M && n !== F ? 1 : 1.05 },
      names: [M && M.name, F && F.name, n && n.name],
      auto: [!cm, !cf, !cn],
    };
    return cast;
  };
  /**
   * 用某个角色的声音读一段文字，读完调用 done。返回一个"取消"函数。
   * 联网的声音（Chrome 的 Google 语音、Edge 的在线语音）一次读太长会被掐断，所以按句子拆开依次读；
   * 读不出来（连不上语音服务）时，这次打开页面期间不再用那个声音，换一个把这一句重读。
   */
  function pieces(text) {
    const out = [];
    String(text).split(/(?<=[.!?])\s+/).forEach((sen) => {
      if (sen.length <= 150) return out.push(sen);
      let cur = '';
      sen.split(/(?<=[,;:])\s+/).forEach((part) => { if (cur && (cur + ' ' + part).length > 150) { out.push(cur); cur = part; } else cur = cur ? cur + ' ' + part : part; });
      if (cur) out.push(cur);
    });
    return out.filter(Boolean);
  }
  function utter(text, role, rate, done) {
    const synth = window.speechSynthesis;
    let dead = false, j = 0, tries = 0, endT = null, startT = null, keep = null;
    const clear = () => { clearTimeout(endT); clearTimeout(startT); };
    const step = () => {
      if (dead) return;
      const k = V.cast(), r = k[role] || k.N, v = r.voice, remote = !!v && !v.localService;
      const parts = remote ? pieces(text) : [String(text)];
      if (j >= parts.length) { dead = true; if (done) done(); return; }
      const t = parts[j];
      let started = false, settled = false;
      const ok = () => { if (dead || settled) return; settled = true; clear(); j++; step(); };
      const fail = () => {
        if (dead || settled) return; settled = true; clear();
        try { synth.cancel(); } catch (e) { /* ignore */ }
        if (v && tries < 3) {
          tries++; bad[v.name] = 1; cast = null;
          // 联网的声音连不上时，同一家的其它在线声音也一样连不上，一起跳过，免得每个角色都白等一次
          if (remote) { const vendor = v.name.split(' ')[0]; try { synth.getVoices().forEach((x) => { if (!x.localService && x.name.split(' ')[0] === vendor) bad[x.name] = 1; }); } catch (e) { /* ignore */ } }
          if (EG.UI && EG.UI.toast) EG.UI.toast('"' + v.name + '" 读不出来' + (remote ? '（连不上在线语音服务）' : '') + '，已换成别的声音');
          setTimeout(step, 150);
        } else { j++; step(); }
      };
      const u = new SpeechSynthesisUtterance(t);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      u.rate = rate; u.pitch = r.pitch;
      u.onstart = () => { started = true; clearTimeout(startT); };
      u.onend = ok;
      u.onerror = (ev) => { const e = ev && ev.error; if (e === 'interrupted' || e === 'canceled') return; if (e === 'network' || e === 'synthesis-failed' || e === 'synthesis-unavailable' || e === 'voice-unavailable' || e === 'language-unavailable') fail(); else ok(); };
      try { synth.resume(); } catch (e) { /* 有的浏览器会卡在暂停状态 */ }
      synth.speak(u);
      keep = u; // 留一个引用，免得有的浏览器把还没读完的句子回收掉
      if (remote) startT = setTimeout(() => { if (!started) fail(); }, 6000); // 联网的声音迟迟不出声：当作连不上
      endT = setTimeout(ok, (estSec(t, rate) * 1.8 + 3) * 1000); // 读完不触发 onend 时兜底
    };
    step();
    return () => { dead = true; clear(); keep = null; };
  }
  /** 有没有可用的英文朗读声音。声音列表是异步加载的，最多等一会儿 */
  V.ttsReady = () => new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve(false);
    if (enVoices().length) return resolve(true);
    let done = false;
    const fin = () => { if (done) return; done = true; resolve(enVoices().length > 0); };
    try { window.speechSynthesis.addEventListener('voiceschanged', fin, { once: true }); } catch (e) { /* ignore */ }
    setTimeout(fin, 1500);
  });

  let pl = null;
  function playChunk() {
    const p = pl; if (!p || p.paused) return;
    if (p.i >= p.chunks.length) { pl = null; if (p.opt.onEnd) p.opt.onEnd(); return; }
    const c = p.chunks[p.i], tok = ++p.tok, rate = p.opt.rate || 0.95;
    p.t0 = now(); p.est = estSec(c.text, rate);
    if (p.opt.onChunk) p.opt.onChunk(p.i, c);
    let called = false;
    const next = () => {
      if (called || pl !== p || tok !== p.tok) return;
      called = true; clearTimeout(p.timer);
      const nx = p.chunks[p.i + 1];
      p.i++;
      p.timer = setTimeout(() => { if (pl === p && tok === p.tok) playChunk(); }, nx && nx.who !== c.who ? 420 : 140);
    };
    const k = V.cast();
    if (!k.ok) { p.timer = setTimeout(next, p.est * 1000); return; } // 没有英文朗读声音：按阅读时间往下走（上层会显示文字）
    try { p.cancel = utter(c.text, c.who, rate, next); } catch (e) { p.timer = setTimeout(next, p.est * 1000); }
  }
  /**
   * 播放一段文本。chunks: [{ who: 'M' | 'F' | 'N', text }]；
   * opt: { rate, onChunk(i, chunk), onEnd() }。同一时间只播一段，新的会顶掉旧的。
   */
  V.playScript = (chunks, opt) => {
    V.stopScript();
    V.hush();
    const p = (pl = { chunks, opt: opt || {}, i: 0, tok: 0, paused: false, timer: null, t0: now(), est: 1 });
    p.timer = setTimeout(() => { if (pl === p && !p.paused) playChunk(); }, 90); // 刚 cancel 完马上 speak，有的浏览器会把这一句吞掉
  };
  /** 暂停：停在当前这一句；继续时从这一句的开头重读（比浏览器自带的暂停可靠） */
  V.pauseScript = () => { const p = pl; if (!p || p.paused) return; p.paused = true; p.tok++; clearTimeout(p.timer); if (p.cancel) { p.cancel(); p.cancel = null; } try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
  V.resumeScript = () => { const p = pl; if (!p || !p.paused) return; p.paused = false; p.timer = setTimeout(() => { if (pl === p && !p.paused) playChunk(); }, 90); };
  V.stopScript = () => { const p = pl; pl = null; if (!p) return; p.tok++; clearTimeout(p.timer); if (p.cancel) { p.cancel(); p.cancel = null; } try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
  /** 播放进度：{ i 第几句, n 共几句, frac 0–1, playing, paused }；没有在播时返回 null */
  V.scriptState = () => {
    const p = pl; if (!p) return null;
    const inChunk = p.paused ? 0 : Math.min(1, (now() - p.t0) / Math.max(0.3, p.est));
    return { i: p.i, n: p.chunks.length, frac: Math.min(1, (p.i + inChunk) / Math.max(1, p.chunks.length)), playing: !p.paused, paused: p.paused };
  };

  try { if (window.speechSynthesis) { window.speechSynthesis.getVoices(); window.speechSynthesis.addEventListener('voiceschanged', () => { cast = null; }); } } catch (e) { /* 预热语音列表 */ }
})();
