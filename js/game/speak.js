/* English Gate · 口语闯关（按 PET 口语 Part 1–4）
 *
 * 流程：考官（怪兽）提问 → 朗读结束后开始听 → 玩家开口回答 → 评分
 *        过关（≥50 分）：玩家施法，分数越高法术越强；不过关：怪兽攻击，同一题再来一次
 *        练习关每题答完都有反馈卡（得分、四个维度、你说的话、改进建议、范例答案）；
 *        模考关不给提示、不看反馈，全部答完后出成绩单。
 * 三种作答方式：asr 语音识别自动评分（默认）/ rec 录音后对照范例自评 / type 打字。
 * 战斗本身（血量、施法、怪兽攻击）仍由 battle.js 负责，这里只管"出题、听、评分、界面"。
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, FX = EG.FX, S = EG.Stage, V = EG.Voice, SS = EG.SpeakScore, $ = U.$, esc = U.esc;
  const SP = (EG.Speak = { active: false, mode: 'asr', state: 'idle', tk: 0, asrBroken: null });
  const B = () => EG.Battle, D = () => EG.SpeakData, store = () => EG.Store.data;

  const PART_INFO = {
    1: { t: 'Part 1 · 问答', time: '真实考试约 2 分钟', d: '考官问你关于自己的问题：名字、住在哪里、日常生活、喜好。第一个问题简短回答即可，后面的问题要说完整——加上原因或例子。', tips: ['不要只说一个词，用完整的句子回答', '加一句 because… 或 for example…', '没听清可以说：Sorry, could you say that again?'] },
    2: { t: 'Part 2 · 看图说话', time: '每张图约 1 分钟', d: '独自描述一张图片：有谁、在哪里、在做什么、穿什么、周围有什么，最后说说你的推测。', tips: ['开头：In this picture I can see…', '描述动作用现在进行时：She is cooking…', '说位置：On the left… / In the background…', '不会的词换个说法，别停下来'] },
    3: { t: 'Part 3 · 合作讨论', time: '真实考试 2–3 分钟', d: '和搭档 Mia 讨论一个情境和 6 个选项：轮流说看法、给理由、回应对方，最后一起选一个。', tips: ["先回应搭档：I agree. / I'm not sure, because…", '把话题抛回去：What do you think?', '不要一上来就做决定，最后一轮再选'] },
    4: { t: 'Part 4 · 延伸讨论', time: '真实考试约 3 分钟', d: '考官围绕 Part 3 的话题问你的喜好、经历和看法，回答要展开。', tips: ['先表态，再说原因，再举例子', '可以讲自己的经历：Last year I…'] },
    mock: { t: '完整模考', time: '约 10 分钟', d: '按真实考试的顺序走一遍：Part 1 五个问题 → Part 2 一张图 → Part 3 一次讨论 → Part 4 三个问题。没有提示，答完不看反馈，全部结束后出四项成绩单。', tips: ['像真的考试一样，一口气答完', '答得不好也不要停，继续下一题'] },
  };
  const MODE = { asr: ['🎙', '语音识别'], rec: ['⏺', '录音自评'], type: ['⌨', '打字作答'] };
  const CHECKS = {
    1: ['回答切题', '说的是完整的句子', '给了原因或例子', '说得比较流利，没有长时间停顿'],
    2: ['说了人物和地点', '说了他们在做什么', '说了至少 4 个细节（物品、衣着、天气…）', '用了位置词或推测（On the left… / I think…）', '说了 40 秒以上'],
    3: ['回应了搭档说的话', '说了自己的看法', '给了理由', '把话题抛回给了搭档'],
    4: ['回答切题', '说了自己的看法', '给了原因或例子', '说得比较流利'],
  };
  const P3_PHRASES = ['I think … because …', "I agree. / That's a good idea.", "I'm not sure, because …", 'What about …?', 'What do you think?', 'I think … would be the best.'];
  const P2_PHRASES = ['In this picture I can see …', 'There is / There are …', 'On the left / right …', 'In the background …', 'He / She is …ing', 'I think … / Maybe …'];

  /* ---------- 选题：出现次数少的优先 ---------- */
  const seenN = (id) => (store().speak.seen[id] || 0);
  const least = (pool, n) => U.shuffle(pool.slice()).sort((a, b) => seenN(a.id) - seenN(b.id)).slice(0, n);

  function turnP1(q, first) {
    const lines = []; if (first) lines.push(['ex', "Hello! I'm going to ask you some questions."]);
    lines.push(['ex', q.q]);
    return { part: 1, id: q.id, label: 'PART 1 · 回答考官的问题', lines, board: { type: 'bubble', who: 'ex', q: q.q }, zh: q.zh, frame: q.frame, words: q.words, sample: q.sample, spec: SS.spec.p1(q), max: q.ph === 1 ? 14 : 32, sil: 2.6 };
  }
  function turnP2(ph) {
    return { part: 2, id: ph.id, label: 'PART 2 · 看图说话（约 1 分钟）', lines: [['ex', "Now I'd like you to talk on your own about something. Here is a photograph. It shows " + ph.shows + '.'], ['ex', 'Please tell us what you can see in the photograph.']], board: { type: 'photo', pic: ph.pic, q: 'Please tell us what you can see in the photograph.' }, zh: '描述你在图片里看到的：' + ph.zh, frame: 'In this picture I can see … On the left … She is …ing … I think …', words: ph.words, phrases: P2_PHRASES, sample: ph.sample, spec: SS.spec.p2(ph), max: 75, sil: 4.5, groups: ph.groups };
  }
  function turnsP3(task) {
    return task.turns.map((tn, i) => {
      const lines = [];
      if (i === 0) lines.push(['ex', "Now, in this part of the test you're going to talk about something together."], ['ex', task.situation]);
      lines.push(['pa', tn.say]);
      return { part: 3, id: task.id + '#' + i, seenId: task.id, label: 'PART 3 · 和搭档讨论（第 ' + (i + 1) + ' / ' + task.turns.length + ' 轮）', lines, board: { type: 'task', task, say: tn.say, focus: tn.focus }, zh: i === 0 ? task.zh : null, frame: i === task.turns.length - 1 ? 'I think … would be the best, because … Do you agree?' : "I agree / I'm not sure, because … What about …?", phrases: P3_PHRASES, sample: tn.sample, spec: SS.spec.p3(task, i), max: 40, sil: 3 };
    });
  }
  function turnP4(q, first) {
    const lines = []; if (first) lines.push(['ex', "Now I'd like to ask you some more questions."]);
    lines.push(['ex', q.q]);
    return { part: 4, id: q.id, label: 'PART 4 · 说说你的看法', lines, board: { type: 'bubble', who: 'ex', q: q.q }, zh: q.zh, frame: q.frame, sample: q.sample, spec: SS.spec.p4(q), max: 45, sil: 3 };
  }

  /** 进入一关：排好这一关要问的题，返回实际使用的关卡数据（模考关会按题数设置 Boss 的血量） */
  SP.begin = (scene, li) => {
    const lv = scene.levels[li], part = lv.sp.part, d = D();
    let turns = [];
    SP.mock = part === 'mock';
    if (part === 1) {
      const a = least(d.part1.filter((q) => q.ph === 1), 1), b = least(d.part1.filter((q) => q.ph === 2), lv.mons.length - 1);
      turns = a.concat(b).map((q, i) => turnP1(q, i === 0));
    } else if (part === 2) turns = least(d.photos, lv.mons.length).map(turnP2);
    else if (part === 3) least(d.tasks, lv.mons.length).forEach((t) => { turns = turns.concat(turnsP3(t)); });
    else if (part === 4) { const all = []; d.tasks.forEach((t) => t.part4.forEach((q) => all.push(q))); turns = least(all, lv.mons.length).map((q, i) => turnP4(q, i === 0)); }
    else {
      const task = least(d.tasks, 1)[0];
      turns = least(d.part1.filter((q) => q.ph === 1), 2).concat(least(d.part1.filter((q) => q.ph === 2), 3)).map((q, i) => turnP1(q, i === 0));
      turns.push(turnP2(least(d.photos, 1)[0]));
      turns = turns.concat(turnsP3(task)).concat(least(task.part4, 3).map((q, i) => turnP4(q, i === 0)));
      turns.forEach((t, i) => { t.label = t.label.replace(/（.*）/, '') + ' · 第 ' + (i + 1) + ' / ' + turns.length + ' 题'; });
    }
    Object.assign(SP, { active: true, scene, li, part, turns, ti: -1, cur: null, advance: true, log: [], state: 'idle', pending: null, gateReady: false, continued: false, finale: false, hintOn: false });
    // 作答方式：能用语音识别就用，否则录音自评，再不行打字
    const sup = V.support();
    SP.mode = SP.userMode || (sup.asr && !SP.asrBroken ? 'asr' : sup.rec ? 'rec' : 'type');
    if (SP.mode !== 'type') V.openMic().then(() => { if (SP.active) setStatus(); }, () => { if (!SP.active) return; if (V.micError === 'NotAllowedError' || V.micError === 'unsupported' || V.micError === 'NotFoundError') { SP.micDenied = V.micError; if (SP.mode !== 'type') { switchMode('type', true); EG.UI.toast(V.micError === 'NotFoundError' ? '没有找到麦克风，先用打字作答' : '用不了麦克风（没有权限），先用打字作答'); } } });
    if (!SP.mock) return lv;
    // 模考：Boss 的血量比题数多 1，保证打到最后一题之前不会倒下；结局由总成绩决定
    const boss = Object.assign({}, lv.mons[0], { hp: turns.length + 1 });
    return Object.assign({}, lv, { mons: [boss] });
  };
  SP.stop = () => { SP.active = false; SP.tk++; V.hush(); V.closeMic(); SP.pending = null; hide('#sp-card'); const b = $('#sp-board'); if (b) b.innerHTML = ''; setState('idle'); };
  SP.onSpawn = () => { /* 预留：怪兽登场时的口语相关处理 */ };

  /* ---------- 界面小工具 ---------- */
  const hide = (sel) => { const el = $(sel); if (el) el.classList.remove('on'); };
  const show = (sel) => { const el = $(sel); if (el) el.classList.add('on'); };
  function setState(s) {
    SP.state = s;
    const el = $('#speak'); if (el) el.dataset.state = s;
    setStatus();
  }
  function setStatus(extra) {
    const el = $('#sp-status'); if (!el) return;
    const m = SP.mode;
    let t = '';
    if (SP.state === 'asking') t = SP.cur && SP.cur.part === 3 ? '搭档在说话，听完再回答…' : '考官在提问，听完再回答…';
    else if (SP.state === 'ready') t = m === 'type' ? '用英文打出你的回答，按 Enter 提交' : '点麦克风（或按空格）开始回答';
    else if (SP.state === 'listening') t = m === 'type' ? '用英文打出你的回答，按 Enter 提交' : m === 'rec' ? '正在录音——说完按空格或点麦克风' : '正在听——说完按空格或点麦克风，停顿几秒也会自动结束';
    else if (SP.state === 'scoring') t = '评分中…';
    else if (SP.state === 'self') t = '听一听自己的回答，对照范例给自己打分';
    else if (SP.state === 'done') t = SP.mock ? '已记录' : '看看反馈，然后按 Enter 继续';
    el.textContent = extra || t;
    const mb = $('#sp-modebtn'); if (mb) mb.innerHTML = MODE[m][0] + ' ' + MODE[m][1];
    const ico = $('#sp-ico'); if (ico) ico.textContent = SP.state === 'listening' && m !== 'type' ? '■' : m === 'type' ? '⌨' : '🎙';
    const hb = $('#sp-hintbtn'); if (hb) hb.style.display = SP.mock ? 'none' : '';
    const ta = $('#sp-type'), tx = $('#sp-text');
    if (ta && tx) { const typing = m === 'type' && (SP.state === 'ready' || SP.state === 'listening'); ta.style.display = typing ? '' : 'none'; tx.style.display = typing ? 'none' : ''; }
  }
  SP.layout = () => {
    const scr = $('#scr-battle'); if (!scr) return;
    // 屏幕很矮（手机横屏）时题板盖住顶部状态栏，尽量把高度让给图片和选项
    const shortScr = S.H <= 520, panel = $('#panel'), ph = panel ? panel.offsetHeight : 0;
    scr.style.setProperty('--sp-top', (shortScr ? 6 : Math.round(S.top + 4)) + 'px');
    scr.style.setProperty('--sp-h', Math.max(150, shortScr ? S.H - ph - 14 : Math.round(S.gy - S.top - 14)) + 'px');
    const cv = $('#spb-cv'); if (cv && SP.cur && SP.cur.board.type === 'photo') drawPhoto(cv, SP.cur.board.pic);
  };
  function drawPhoto(cv, pic) {
    const w = cv.clientWidth || 480, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round((w * 2 / 3) * dpr);
    EG.Pictures.draw(cv.getContext('2d'), pic, cv.width, cv.height);
  }

  function hintHtml(t) {
    let h = '';
    if (t.zh) h += '<div class="h-zh">' + esc(t.zh) + '</div>';
    if (t.frame) h += '<div class="h-fr"><b>句型</b>' + esc(t.frame) + '</div>';
    const chips = (t.phrases || []).concat(t.words || []);
    if (chips.length) h += '<div class="h-ws">' + chips.map((w) => '<span>' + esc(w) + '</span>').join('') + '</div>';
    return h;
  }
  function showBoard(t) {
    const bd = $('#sp-board'), b = t.board;
    let h = '';
    if (b.type === 'bubble') h = '<div class="spb bubble"><div class="spb-who">🎓 考官 <small>Examiner</small></div><div class="spb-q">' + esc(b.q) + '</div>';
    else if (b.type === 'photo') h = '<div class="spb photo"><canvas id="spb-cv"></canvas><div class="spb-q small">' + esc(b.q) + '</div>';
    else {
      h = '<div class="spb task"><div class="spb-sit">' + esc(b.task.situation) + '</div><div class="spb-opts">' +
        b.task.options.map((o, i) => '<div class="spb-opt' + (b.focus.indexOf(i) >= 0 ? ' focus' : '') + '"><span class="e">' + o.e + '</span><span class="w">' + esc(o.w) + '</span>' + (SP.mock ? '' : '<span class="z">' + esc(o.zh) + '</span>') + '</div>').join('') +
        '</div><div class="spb-say"><b>🧑‍🎓 ' + esc(D().partner) + '</b><span>' + esc(b.say) + '</span></div>';
    }
    h += '<div class="spb-hint" id="spb-hint">' + (SP.mock ? '' : hintHtml(t)) + '</div></div>';
    bd.innerHTML = h; bd.classList.add('on');
    if (b.type === 'photo') drawPhoto($('#spb-cv'), b.pic);
    const hint = $('#spb-hint'); if (hint) hint.classList.toggle('on', SP.hintOn && !SP.mock);
  }
  function chipsHtml(res) {
    const t = SP.cur; if (!t || SP.mock) return '';
    const items = [];
    (res ? res.groups : (t.spec.groups || []).map((g) => ({ n: g.n, hit: false }))).forEach((g) => items.push([g.n, g.hit]));
    (res ? res.fns : (t.spec.fn || []).map((f) => ({ label: null, name: Array.isArray(f) ? f[0] : f, hit: false }))).forEach((f) => items.push([f.label || FNL[f.name] || f.name, f.hit]));
    return items.map((x) => '<span class="' + (x[1] ? 'on' : '') + '">' + (x[1] ? '✓ ' : '') + esc(x[0]) + '</span>').join('');
  }
  const FNL = { reason: '说明原因', develop: '展开回答', opinion: '表达观点', agree: '回应搭档', decide: '做出选择', thereis: '介绍画面', continuous: '现在进行时', position: '位置 / 推测' };
  function liveUpdate(text) {
    const t = SP.cur; if (!t) return;
    const tx = $('#sp-text'); if (tx) { tx.textContent = text || ''; tx.scrollTop = tx.scrollHeight; }
    if (SP.mock) { $('#sp-power').style.transform = 'scaleX(0)'; $('#sp-chips').innerHTML = '<span class="on">' + SS.words(text).length + ' 词</span>'; return; }
    const res = SS.score(text, t.spec, {});
    $('#sp-power').style.transform = 'scaleX(' + res.total / 100 + ')';
    $('#sp-power').className = res.total >= 85 ? 'max' : res.total >= 50 ? 'ok' : '';
    $('#sp-chips').innerHTML = '<span class="cnt' + (res.words >= t.spec.target ? ' on' : '') + '">' + res.words + ' / ' + t.spec.target + ' 词</span>' + chipsHtml(res);
  }

  /* ---------- 一道题 ---------- */
  /** battle.js 在怪兽"吟唱"时调用：出下一题（上一题没过关就重问同一题） */
  SP.ask = () => {
    const b = B(); if (!SP.active || b.over || !b.mon) return;
    if (SP.advance) { SP.ti++; SP.cur = SP.turns[SP.ti % SP.turns.length]; SP.cur.tries = 0; SP.advance = false; SP.hintOn = false; }
    const t = SP.cur, tk = ++SP.tk, retry = t.tries > 0;
    b.q = { task: true, speak: true, tMax: t.max * (SP.mode === 'type' ? 2.5 : 1), t: 0, started: false, done: false, frozen: 0, ult: false };
    b.q.t = b.q.tMax; b.word = null; b.mon.castT = 1;
    hide('#sp-card');
    $('#prompt').textContent = t.label; $('#prompt').className = 'prompt';
    if (retry && t.tries >= 2) SP.hintOn = true; // 连续两次没过关：自动打开提示
    showBoard(t); liveUpdate(''); const ta = $('#sp-type'); if (ta) ta.value = '';
    EG.UI.timer(1, false);
    setState('asking');
    EG.Audio.play('word');
    const lines = retry ? [t.lines[t.lines.length - 1]] : t.lines;
    sayLines(lines, tk, () => { if (b.mon) b.mon.castT = 0.4; ready(tk); });
  };
  function sayLines(lines, tk, done) {
    let i = 0;
    const next = () => {
      if (tk !== SP.tk || !SP.active) return;
      if (i >= lines.length) return done();
      const ln = lines[i++];
      setStatus(ln[0] === 'pa' ? '搭档 ' + D().partner + ' 在说话…' : i < lines.length ? '考官：' + ln[1] : null);
      V.say(ln[1], ln[0], () => setTimeout(next, 260));
    };
    next();
  }
  function ready(tk) {
    if (tk !== SP.tk || !SP.active || B().paused) return;
    setState('ready');
    if (SP.mode === 'type') { startListen(); const ta = $('#sp-type'); if (ta) setTimeout(() => { try { ta.focus(); } catch (e) { /* ignore */ } }, 30); }
    else if (store().settings.speakAuto !== false) startListen();
  }
  function startListen() {
    const b = B(), q = b.q, tk = SP.tk; if (!q || !SP.active || SP.state === 'listening') return;
    SP.t0 = Date.now(); SP.noVoiceWarned = false;
    if (SP.mode === 'type') { q.started = true; setState('listening'); return; }
    setState('listening');
    const begin = () => {
      if (tk !== SP.tk || SP.state !== 'listening') return;
      V.listen({
        mode: SP.mode === 'asr' ? 'asr' : 'rec', lang: store().settings.asrLang || 'en-US',
        onStart: () => { if (tk === SP.tk && b.q === q) q.started = true; },
        onText: (fin, inter) => { if (tk === SP.tk) liveUpdate((fin + ' ' + inter).trim()); },
        onEnd: (r) => { if (tk === SP.tk) heard(r); },
      });
      if (SP.mode === 'rec') q.started = true;
      // 识别引擎迟迟没启动：多半是浏览器在等用户点"允许"。先提示；等太久就照常计时，免得卡在这一题
      setTimeout(() => { if (tk === SP.tk && SP.state === 'listening' && b.q === q && !q.started) setStatus('正在等麦克风… 如果浏览器弹出了权限提示，请点"允许"'); }, 2500);
      setTimeout(() => { if (tk === SP.tk && SP.state === 'listening' && b.q === q && !q.started) q.started = true; }, 20000);
    };
    // 麦克风权限还在等用户点的话，先等它（最多等一会儿），否则直接开始
    if (V.hasMic() || SP.micDenied) begin(); else V.openMic().then(begin, begin);
  }
  /** 说完了（按钮、空格、停顿、时间到） */
  SP.finish = () => {
    const q = B().q; if (SP.state !== 'listening' || !q) return;
    q.started = false;
    setState('scoring');
    if (SP.mode === 'type') return heard({ text: ($('#sp-type') || {}).value || '', typed: true, conf: null, dur: 0, latency: null, mode: 'type' });
    if (V.listening()) V.stop(); else heard({ text: ($('#sp-text') || {}).textContent || '', conf: null, dur: 0, latency: null, mode: SP.mode });
  };
  SP.timeUp = () => SP.finish();

  const ASR_ERR = { 'not-allowed': '浏览器没有给麦克风权限', 'service-not-allowed': '浏览器不允许使用语音识别', network: '连不上语音识别服务（Chrome 需要能访问 Google）', 'audio-capture': '没有找到麦克风', 'language-not-supported': '语音识别不支持这个语言', unsupported: '这个浏览器没有语音识别', 'start-failed': '语音识别启动失败' };
  function heard(r) {
    const t = SP.cur; if (!t || !SP.active) return;
    if (r.fatal && !r.text) {
      // 语音识别用不了：换一种作答方式，这一题重来，不扣血
      SP.asrBroken = r.fatal;
      const to = V.hasMic() && V.support().rec && r.fatal !== 'not-allowed' && r.fatal !== 'audio-capture' ? 'rec' : 'type';
      EG.UI.toast((ASR_ERR[r.fatal] || '语音识别出错') + '，改用' + MODE[to][1]);
      return switchMode(to, true);
    }
    if (SP.mode === 'rec') return selfCard(r);
    conclude(SS.score(r.text, t.spec, { conf: r.conf, dur: r.dur, latency: r.latency, typed: r.typed }), r);
  }
  function conclude(res, r) {
    const t = SP.cur, b = B();
    const sn = store().speak.seen, sid = t.seenId || t.id;
    if (res.pass || SP.mock) { if (!t.counted) { sn[sid] = (sn[sid] || 0) + (t.seenId && t.part === 3 ? 0.25 : 1); t.counted = true; } }
    EG.Store.save();
    SP.log.push({ part: t.part, q: t.board.q || t.board.say, text: r.text || '', res, audio: r.audioUrl || null, try: t.tries });
    SP.last = { res, r };
    liveFinal(res, r.text);
    setState('done');
    const lastTurn = SP.ti >= SP.turns.length - 1;
    if (SP.mock) { SP.advance = true; if (lastTurn) SP.finale = true; EG.UI.toast(res.pass ? '✓ 已记录，下一题' : '已记录，下一题'); }
    else { SP.advance = res.pass; if (!res.pass) t.tries++; feedbackCard(res, r, t); }
    SP.continued = false; SP.gateReady = false;
    b.speakResult({ pass: res.pass, total: res.total, grade: res.grade, mock: SP.mock });
  }
  function liveFinal(res, text) {
    const tx = $('#sp-text'); if (tx && text !== undefined) tx.textContent = text || '（没有听到内容）';
    if (SP.mock) return;
    $('#sp-power').style.transform = 'scaleX(' + res.total / 100 + ')';
    $('#sp-power').className = res.total >= 85 ? 'max' : res.total >= 50 ? 'ok' : '';
  }

  /* ---------- 反馈卡 ---------- */
  const GRADE = ['再试一次', '过关', '很好！', '完美！'];
  const bar = (name, v) => '<div class="spc-bar"><span>' + name + '</span><i><b style="width:' + Math.round((v === null || v === undefined ? 0 : v) * 100) + '%"></b></i><em>' + (v === null || v === undefined ? '—' : Math.round(v * 100)) + '</em></div>';
  function feedbackCard(res, r, t) {
    const el = $('#sp-card');
    const d = res.dims;
    el.innerHTML = '<div class="spc ' + (res.pass ? 'ok' : 'no') + '">' +
      '<div class="spc-head"><div class="spc-score"><b>' + res.total + '</b><span>分</span></div><div class="spc-gr"><div class="spc-grade">' + GRADE[res.grade] + '</div><div class="spc-stars">' + [1, 2, 3].map((i) => '<i class="' + (i <= res.grade ? 'on' : '') + '">★</i>').join('') + '</div></div>' +
      '<div class="spc-bars">' + bar('内容', d.content) + bar('连贯', d.discourse) + bar('词句', d.language) + bar('清晰', d.clarity) + '</div></div>' +
      '<div class="spc-body">' +
      (res.good.length ? '<ul class="spc-good">' + res.good.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (res.tips.length ? '<ul class="spc-tips">' + res.tips.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (res.self ? '' : '<div class="spc-you"><span>你说的' + (res.words ? '（' + res.words + ' 词' + (res.wpm && res.wpm < 260 ? '，每分钟约 ' + res.wpm + ' 词' : '') + '）' : '') + (r.audioUrl ? ' <button class="btn small" data-sp="playme">▶ 听回放</button>' : '') + '</span><p>' + (esc(r.text) || '<em>没有听到内容</em>') + '</p></div>') +
      (res.self && r.audioUrl ? '<button class="btn small" data-sp="playme">▶ 听回放</button>' : '') +
      '<div class="spc-sample"><span>范例答案 <button class="btn small" data-sp="playsample">🔊 听范例</button></span><p>' + esc(t.sample) + '</p></div>' +
      '</div><div class="spc-foot"><span class="spc-note">' + (res.pass ? '' : '同一题再说一次，可以照着范例说') + '</span><button class="btn primary" data-sp="cont">' + (res.pass ? '继续' : '再试一次') + ' ▶ <kbd>Enter</kbd></button></div></div>';
    el.classList.add('on');
  }
  /** 录音自评：回放、对照范例、勾清单 */
  function selfCard(r) {
    const t = SP.cur, el = $('#sp-card'), list = CHECKS[t.part] || CHECKS[1];
    SP.selfR = r; setState('self');
    el.innerHTML = '<div class="spc self"><div class="spc-head"><div class="spc-gr"><div class="spc-grade">听一听，给自己打分</div><div class="spc-sub">这台设备现在用不了语音识别，所以由你对照范例自评</div></div></div><div class="spc-body">' +
      (r.audioUrl ? '<audio controls src="' + r.audioUrl + '"></audio>' : '<p><em>没有录到声音</em></p>') +
      '<div class="spc-sample"><span>范例答案 <button class="btn small" data-sp="playsample">🔊 听范例</button></span><p>' + esc(t.sample) + '</p></div>' +
      '<div class="spc-checks">' + list.map((x, i) => '<label><input type="checkbox" data-ck="' + i + '"> ' + esc(x) + '</label>').join('') + '</div>' +
      '</div><div class="spc-foot"><span class="spc-note">做到一半以上算过关</span><button class="btn primary" data-sp="self-ok">提交自评 ▶</button></div></div>';
    el.classList.add('on');
  }
  function selfSubmit() {
    const t = SP.cur, r = SP.selfR || {}; if (SP.state !== 'self' || !t) return;
    const checks = U.$$('#sp-card input[type=checkbox]').map((x) => x.checked);
    const res = SS.selfScore(checks, r.dur || r.elapsed || 0, t.part === 2 ? 40 : t.spec.target * 0.45);
    res.good = checks.map((c, i) => (c ? (CHECKS[t.part] || CHECKS[1])[i] : null)).filter(Boolean).slice(0, 4);
    res.tips = checks.map((c, i) => (c ? null : '下次注意：' + (CHECKS[t.part] || CHECKS[1])[i])).filter(Boolean).slice(0, 3);
    conclude(res, r);
  }

  /* ---------- 和战斗的衔接：反馈看完再进行下一步 ---------- */
  SP.gate = (delay, fn) => {
    SP.pending = fn; SP.gateReady = false;
    FX.after(delay, () => { SP.gateReady = true; tryGo(); });
  };
  function tryGo() {
    if (!SP.gateReady || !SP.pending || !SP.active) return;
    if (!SP.mock && !SP.continued) return;
    const f = SP.pending; SP.pending = null; SP.gateReady = false; SP.continued = false;
    hide('#sp-card');
    if (SP.mock && SP.finale && !B().over) { SP.finale = false; const sh = SS.sheet(SP.log); return B().finale(sh.avg >= 55); }
    f();
  }
  SP.cont = () => { if (SP.state !== 'done') return; SP.continued = true; V.hush(); tryGo(); };

  /* ---------- 按钮 / 键盘 ---------- */
  function switchMode(to, restart) {
    SP.mode = to; SP.tk++; V.cancel(); V.hush();
    if (restart && SP.cur && SP.active && !B().over && (SP.state === 'asking' || SP.state === 'ready' || SP.state === 'listening' || SP.state === 'scoring')) {
      const q = B().q; if (q) { q.started = false; q.tMax = SP.cur.max * (to === 'type' ? 2.5 : 1); q.t = q.tMax; }
      liveUpdate(''); const ta = $('#sp-type'); if (ta) ta.value = '';
      SP.state = 'asking'; ready(SP.tk);
    } else setStatus();
  }
  SP.act = (name) => {
    if (!SP.active) return;
    const b = B();
    if (name === 'mic') {
      if (b.paused) return;
      if (SP.state === 'listening') { if (SP.mode !== 'type') SP.finish(); }
      else if (SP.state === 'ready') startListen();
      else if (SP.state === 'asking') { SP.tk++; V.hush(); if (b.mon) b.mon.castT = 0.4; ready(SP.tk); } // 不想听完题目，直接开始
      else if (SP.state === 'done') SP.cont();
    } else if (name === 'cont') SP.cont();
    else if (name === 'hint') {
      if (SP.mock) return;
      SP.hintOn = !SP.hintOn; const h = $('#spb-hint'); if (h) h.classList.toggle('on', SP.hintOn);
    } else if (name === 'replay') {
      if (!SP.cur || SP.state === 'listening' && SP.mode !== 'type') return EG.UI.toast('回答的时候不能重听，先说完');
      const ln = SP.cur.lines[SP.cur.lines.length - 1]; V.say(ln[1], ln[0]);
    } else if (name === 'mode') {
      const sup = V.support(), order = ['asr', 'rec', 'type'].filter((m) => (m === 'asr' ? sup.asr : m === 'rec' ? sup.rec && !SP.micDenied : true));
      const to = order[(order.indexOf(SP.mode) + 1) % order.length];
      SP.userMode = to; if (to === 'asr') SP.asrBroken = null;
      EG.UI.toast('作答方式：' + MODE[to][1]);
      switchMode(to, true);
    } else if (name === 'playme') { const a = SP.last && SP.last.r.audioUrl; if (a) { try { V.hush(); if (SP.audioEl) SP.audioEl.pause(); SP.audioEl = new Audio(a); SP.audioEl.play(); } catch (e) { /* ignore */ } } }
    else if (name === 'playsample') { if (SP.cur) { if (SP.audioEl) { try { SP.audioEl.pause(); } catch (e) { /* ignore */ } } V.say(SP.cur.sample, 'ex'); } }
    else if (name === 'self-ok') selfSubmit();
    else if (name === 'send') { if (SP.state === 'listening' && SP.mode === 'type') SP.finish(); }
  };
  SP.onPause = (v) => {
    if (!SP.active) return;
    if (v) { SP.pausedState = SP.state; if (SP.state === 'asking' || SP.state === 'ready' || SP.state === 'listening') { SP.tk++; V.cancel(); V.hush(); const q = B().q; if (q) q.started = false; } }
    else if (SP.pausedState === 'asking' || SP.pausedState === 'ready' || SP.pausedState === 'listening') { const q = B().q; if (q) q.t = q.tMax; liveUpdate(''); SP.state = 'asking'; ready(SP.tk); }
  };

  /** 每帧：音量指示、停顿自动结束 */
  SP.update = (dt) => {
    if (!SP.active) return;
    const ring = $('#sp-ring');
    if (SP.state !== 'listening' || SP.mode === 'type') { if (ring) ring.style.transform = 'scale(1)'; return; }
    const p = V.poll(dt), t = SP.cur;
    if (ring) ring.style.transform = 'scale(' + (1 + Math.max(0, p.level) * 0.9) + ')';
    if (!t) return;
    const words = p.text ? p.text.trim().split(/\s+/).filter(Boolean).length : 0;
    if (SP.mode === 'asr') { if (p.heard && words >= 1 && p.silent >= t.sil) return SP.finish(); }
    else if (p.level >= 0 && p.voiced >= 1.2 && p.silent >= t.sil + 0.6) return SP.finish();
    if (!p.heard && !SP.noVoiceWarned && Date.now() - SP.t0 > 9000) { SP.noVoiceWarned = true; setStatus('还没听到声音——离麦克风近一点；麦克风有问题的话点右边换成打字'); }
  };

  /* ---------- 结算 ---------- */
  SP.stars = () => {
    const done = SP.log.filter((x) => x.res.pass || SP.mock), avg = done.length ? done.reduce((a, x) => a + x.res.total, 0) / done.length : 0;
    return { avg: Math.round(avg), stars: avg >= 82 ? 3 : avg >= 66 ? 2 : 1 };
  };
  const BAND = (v) => (v === null ? '—' : v.toFixed(1));
  SP.result = (r) => {
    const b = B(), sc = b.scene, li = b.li, st = SP.stars(), secs = Math.round((Date.now() - b.stats.t0) / 1000);
    const hasNext = r.win && li + 1 < sc.levels.length, cleared = r.win && li + 1 >= sc.levels.length;
    const best = store().speak.best, key = sc.id + '-' + li;
    if (r.win && (!best[key] || st.avg > best[key])) { best[key] = st.avg; EG.Store.save(); }
    let sheet = '';
    if (SP.mock) {
      const sh = SS.sheet(SP.log);
      const row = (n, en, v, d) => '<div class="sh-row"><div><b>' + n + '</b><small>' + en + '</small></div><div class="sh-bar"><i style="width:' + (v === null ? 0 : v * 20) + '%"></i></div><em>' + BAND(v) + '</em><span>' + d + '</span></div>';
      sheet = '<div class="sheet"><div class="sh-title">口语成绩单 <small>每项 0–5 分；仅供练习参考，不等于真实考官的评分</small></div>' +
        row('语法与词汇', 'Grammar and Vocabulary', sh.gv, '用词范围、时态和句型的变化') +
        row('话语组织', 'Discourse Management', sh.dm, '回答长度、连接词、是否连贯') +
        row('发音', 'Pronunciation', sh.pr, sh.pr === null ? '没有用语音识别，无法估计' : '识别引擎听清的程度') +
        row('互动交流', 'Interactive Communication', sh.ic, '是否切题、回应搭档、主动提问') +
        row('总体印象', 'Global Achievement', sh.global, '全场平均 ' + sh.avg + ' 分') + '</div>';
    }
    const rows = SP.log.map((x) => '<div class="sp-row ' + (x.res.pass ? 'ok' : 'no') + '"><span class="mk">' + x.res.total + '</span><div class="grow"><b>Part ' + x.part + '</b> ' + esc(x.q) + '<p>' + (x.res.self ? '<em>（录音自评）</em>' : esc(x.text) || '<em>没有听到内容</em>') + '</p>' + (SP.mock && x.res.tips.length ? '<p class="tip">' + esc(x.res.tips.join('；')) + '</p>' : '') + '</div></div>').join('');
    const title = r.win ? (SP.mock ? '模 考 通 过 ！' : cleared ? '场 景 通 关 ！' : '闯 关 成 功') : SP.mock ? '模 考 未 通 过' : '挑 战 失 败';
    const pass = SP.log.filter((x) => x.res.pass).length;
    EG.UI.modal('<h3>' + title + '</h3><div class="m-sub">' + esc(sc.name) + ' · 第 ' + (li + 1) + ' 关 ' + esc(b.level.name) + ' · ' + esc(b.level.sub || '') + '</div>' +
      (r.win ? '<div class="res-stars">' + [0, 1, 2].map((i) => '<i class="' + (i < r.stars ? 'on' : '') + '">★</i>').join('') + '</div>' : '<div class="m-sub" style="margin:0">' + (SP.mock ? '平均分没到 55 分。看看每一题的建议，再考一次。' : '别灰心，看看每一题的建议，再来一次！') + '</div>') +
      '<div class="res-grid"><div><b>' + st.avg + '</b><span>平均分</span></div><div><b>' + pass + ' / ' + SP.log.length + '</b><span>过关的回答</span></div><div><b>' + b.stats.maxCombo + '</b><span>最高连击</span></div><div><b>' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</b><span>用时</span></div></div>' +
      '<div class="m-body scroll">' + sheet + '<div class="sp-log">' + (rows || '<div class="empty">这一关还没有作答</div>') + '</div></div>' +
      '<div class="m-foot"><button class="btn" data-act="quit">关卡列表</button><button class="btn' + (hasNext ? '' : ' primary') + '" data-act="retry">再来一次</button>' + (hasNext ? '<button class="btn primary" data-act="next">下一关 ▶</button>' : '') + '</div>', { locked: true, wide: true });
    if (r.win) for (let i = 0; i < r.stars; i++) setTimeout(() => EG.Audio.play('star'), 250 + i * 250);
  };

  /* ---------- 关卡说明页 ---------- */
  SP.info = (lv) => {
    const p = PART_INFO[lv.sp.part], sup = V.support();
    const mode = sup.asr && !SP.asrBroken ? '语音识别自动评分' : sup.rec ? '录音后对照范例自评（这个浏览器没有语音识别）' : '打字作答（这个浏览器用不了麦克风）';
    return '<div class="row"><span class="tag" style="background:var(--scene);color:#10131f;border:0">' + p.t + '</span><span class="tag">' + p.time + '</span></div>' +
      '<div class="sp-info"><p>' + p.d + '</p><ul>' + p.tips.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
      '<div class="sp-mode"><b>作答方式</b> ' + mode + '。战斗中可以随时点右下角切换成打字。' +
      (sup.asr ? '<br>Chrome 的语音识别需要联网并能访问 Google；第一次会询问麦克风权限。' : '') +
      (sup.file ? '<br>现在是直接打开的本地文件，浏览器可能每次都问麦克风权限；用文件夹里的 <code>start.command</code>（或 <code>node tools/serve.js</code>）启动就只问一次。' : '') +
      '<div style="margin-top:8px"><button class="btn small" data-act="mic-test">🎙 测试麦克风</button></div></div>';
  };

  /** 麦克风测试：显示音量和识别出的文字 */
  SP.micTest = () => {
    const sup = V.support();
    const box = EG.UI.modal('<h3>麦 克 风 测 试</h3><div class="m-body"><p style="text-align:center;color:#c6cdea;line-height:1.8">说一句英语试试，比如 <b>"Hello, my name is…"</b></p><div class="mt-level"><i id="mt-bar"></i></div><div class="mt-text" id="mt-text">正在打开麦克风…</div></div><div class="m-foot"><button class="btn primary" data-act="close">好的</button></div>', { onClose: () => { alive = false; V.cancel(); if (!B().active) V.closeMic(); } });
    let alive = true, last = performance.now();
    const txt = $('#mt-text', box), barEl = $('#mt-bar', box);
    const loop = (now) => { if (!alive) return; const dt = (now - last) / 1000; last = now; const p = V.poll(dt), lv = p.level >= 0 ? p.level : V.level(); if (barEl) barEl.style.transform = 'scaleX(' + Math.max(0, lv) + ')'; requestAnimationFrame(loop); };
    const go = () => {
      if (!alive) return;
      if (!sup.asr) { txt.textContent = V.hasMic() ? '麦克风可以用（看上面的音量条）。这个浏览器没有语音识别，口语关会用"录音自评"。' : '这个浏览器用不了麦克风，口语关会用打字作答。'; return; }
      txt.textContent = '正在听…';
      V.listen({ mode: 'asr', lang: store().settings.asrLang || 'en-US', onText: (f, i) => { txt.textContent = '听到了：' + (f + ' ' + i).trim(); }, onEnd: (r) => { if (!alive) return; if (r.fatal) { SP.asrBroken = r.fatal; txt.textContent = '语音识别用不了：' + (ASR_ERR[r.fatal] || r.fatal) + '。口语关会改用' + (V.hasMic() ? '录音自评' : '打字作答') + '。'; } else { SP.asrBroken = null; txt.textContent = r.text ? '听到了：' + r.text + '　✓ 语音识别正常' : '没有听到声音，检查一下系统的麦克风设置。'; } } });
      setTimeout(() => { if (alive && V.listening()) V.stop(); }, 7000);
    };
    V.openMic().then(go, () => { if (alive) { if (sup.asr) go(); else txt.textContent = '打不开麦克风（' + (V.micError || '未知原因') + '）。口语关会用打字作答。'; } });
    requestAnimationFrame(loop);
  };

  // 打字作答：文本框里按 Enter 提交，边打边更新"充能条"
  document.addEventListener('keydown', (ev) => {
    if (ev.target && ev.target.id === 'sp-type' && ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); SP.act('send'); }
  });
  document.addEventListener('input', (ev) => {
    if (ev.target && ev.target.id === 'sp-type' && SP.active && SP.state === 'listening') { const t = SP.cur, tx = ev.target.value; if (t && !SP.mock) { const res = SS.score(tx, t.spec, {}); $('#sp-power').style.transform = 'scaleX(' + res.total / 100 + ')'; $('#sp-power').className = res.total >= 85 ? 'max' : res.total >= 50 ? 'ok' : ''; $('#sp-chips').innerHTML = '<span class="cnt' + (res.words >= t.spec.target ? ' on' : '') + '">' + res.words + ' / ' + t.spec.target + ' 词</span>' + chipsHtml(res); } }
  });
})();
