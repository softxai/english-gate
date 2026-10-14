/* English Gate · 听力闯关（按 PET 听力 Part 1–4）
 *
 * 流程：怪兽放出一段"录音"（浏览器按角色朗读文本）→ 玩家边听边作答 → 提交
 *        答对的题：玩家施法，每题打掉怪兽一格血；答错的题：怪兽反击，每题掉一次血。
 *        Part 1 / Part 2 一段录音一道题，答错了怪兽留下、换一段再来；
 *        Part 3 / Part 4 一段录音六道题，放完就结束，没听出来的部分让怪兽溜走。
 *        每段录音和真实考试一样播两遍；练习关可以听完第一遍就提交（"一遍听懂"法术更强），
 *        答完有讲解卡（对错、依据句、中文解析、全文、可重听）；模考关必须听完两遍，全部结束后出成绩单。
 * 战斗本身（血量、施法、怪兽攻击）由 battle.js 负责，这里只管"出题、播放、作答、判分、界面"。
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, FX = EG.FX, S = EG.Stage, V = EG.Voice, $ = U.$, $$ = U.$$, esc = U.esc;
  const LS = (EG.Listen = { active: false, state: 'idle', tk: 0 });
  const B = () => EG.Battle, D = () => EG.ListenData, store = () => EG.Store.data;
  const ABC = ['A', 'B', 'C'], WHO = { M: 'Man', F: 'Woman', N: '' };
  const PASS_MARK = 0.72; // 模考及格线：25 题里对 18 题（剑桥官方练习题换算表里 18/25 约为 B1 的 140 分）

  const PART_INFO = {
    1: { t: 'Part 1 · 看图选择', n: '真实考试 7 题', d: '听七段很短的录音（一个人说话或两个人对话），每段一个问题，从三张图里选出正确的一张。三张图里的东西录音里通常都会提到，要听清哪一个才是答案。', tips: ['先看问题和三张图，想想会听到哪些词', '别听到一个词就选——注意 but、so、in the end 后面的话', '数字和时间最容易混：fourteen / forty，quarter past / quarter to'] },
    2: { t: 'Part 2 · 短对话选择', n: '真实考试 6 题', d: '听六段短对话，每段一个三选一的问题，考的是大意：说话人的看法、感受、原因，或者两个人都同意什么。', tips: ['看清问的是谁：the girl 还是 the boy', '问"两人都同意什么"时，要等两个人都表态', '答案常常换了一种说法，不会和选项一字不差'] },
    3: { t: 'Part 3 · 笔记填空', n: '真实考试 6 空', d: '听一段独白（通知、广播、介绍），在笔记里填六个空。每个空写一两个英文单词，或者一个数字、日期、时间。', tips: ['先读笔记，猜每个空要填什么：数字？地点？东西？', '答案按顺序出现，写的是录音里的原词', '拼写要对；人名会一个字母一个字母地拼出来'] },
    4: { t: 'Part 4 · 访谈选择', n: '真实考试 6 题', d: '听一段较长的访谈，回答六个三选一的问题。问题按访谈的顺序出现，考细节，也考受访者的看法和感受。', tips: ['主持人每问一个问题，就对应下一道题', '三个选项通常都会被提到，注意哪个被否定了', '第一遍先选，第二遍核对拿不准的题'] },
    mock: { t: '完整模考', n: '25 题 · 约 25 分钟', d: '按真实考试的顺序和题量：Part 1 七题 → Part 2 六题 → Part 3 六空 → Part 4 六题。每段录音播两遍，没有字幕和讲解，全部结束后出成绩单。', tips: ['和真的考试一样，中间不能跳过', '对 18 题以上算通过'] },
  };

  /* ---------- 填空判分：不分大小写，忽略标点、冠词和单位 ---------- */
  const DROP = new Set(['pounds', 'pound', 'am', 'a.m.', 'a.m', 'pm', 'p.m.', 'p.m', 'oclock', "o'clock", '£', '$']);
  LS.normGap = (t) => String(t || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[£$€]/g, ' ').trim().split(/\s+/).filter((w) => w && !DROP.has(w)).join(' ').replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9]+/g, '');
  LS.gapOk = (input, gap) => { const n = LS.normGap(input); return !!n && [gap.a].concat(gap.ok || []).some((x) => LS.normGap(x) === n); };

  /* ---------- 选题、组卷 ---------- */
  const seenN = (id) => (store().listen.seen[id] || 0);
  const least = (pool, n) => U.shuffle(pool.slice()).sort((a, b) => seenN(a.id) - seenN(b.id)).slice(0, n === undefined ? pool.length : n);
  const lines = (script, spk) => script.map((x) => (Array.isArray(x) ? { who: x[0], text: x[1] } : { who: spk, text: x }));
  const mc = (o, pic) => ({ kind: pic ? 'pic' : 'mc', q: o.q, opts: o.opts, ans: o.ans, ev: o.ev, zh: o.zh, order: [0, 1, 2], sel: null });
  const tP1 = (it) => ({ part: 1, id: it.id, label: 'PART 1 · 听录音，选出正确的图片', rubric: [{ who: 'N', text: it.q }], chunks: lines(it.script), items: [mc(it, true)], wait: 10 });
  const tP2 = (it) => ({ part: 2, id: it.id, label: 'PART 2 · 听对话，选出正确答案', ctx: it.ctx, rubric: [{ who: 'N', text: it.ctx }], chunks: lines(it.script), items: [mc(it)], wait: 10 });
  const tP3 = (r) => ({ part: 3, id: r.id, label: 'PART 3 · 听独白，填写笔记', title: r.title, ctx: r.intro, notes: r.notes, rubric: [{ who: 'N', text: r.intro }, { who: 'N', text: 'For each question, write the correct answer in the gap. Write one or two words, or a number, or a date, or a time.' }], chunks: lines(r.script, r.speaker), items: r.gaps.map((g, i) => ({ kind: 'gap', q: r.notes[i].replace(/\{\d\}/, '____'), gap: g, ev: g.ev, sel: '' })), wait: 25 });
  const tP4 = (r) => ({ part: 4, id: r.id, label: 'PART 4 · 听访谈，选出正确答案', ctx: r.intro, rubric: [{ who: 'N', text: r.intro }], chunks: lines(r.script), items: r.qs.map((q) => mc(q)), wait: 20 });

  /** 进入一关：排好这一关要放的录音，返回实际使用的关卡数据（模考关按题数设置 Boss 的血量） */
  LS.begin = (scene, li) => {
    const lv = scene.levels[li], part = lv.sp.part, d = D();
    let turns;
    if (part === 1) turns = least(d.p1).map(tP1);
    else if (part === 2) turns = least(d.p2).map(tP2);
    else if (part === 3) turns = least(d.p3).map(tP3);
    else if (part === 4) turns = least(d.p4).map(tP4);
    else turns = least(d.p1, 7).map(tP1).concat(least(d.p2, 6).map(tP2), least(d.p3, 1).map(tP3), least(d.p4, 1).map(tP4));
    const mock = part === 'mock', total = turns.reduce((a, t) => a + t.items.length, 0);
    if (mock) { let n = 0; turns.forEach((t) => { const a = n + 1; n += t.items.length; t.first = a; t.label = t.label.split(' · ')[0] + ' · 第 ' + (t.items.length > 1 ? a + '–' + n : n) + ' / ' + total + ' 题'; }); }
    Object.assign(LS, { active: true, mock, scene, li, part, turns, total, ti: -1, cur: null, log: [], recs: [], state: 'idle', pending: null, gateReady: false, continued: false, finale: false, subOn: false, subUsed: 0, right: 0, wrong: 0, firstPass: 0, noVoice: false, userPaused: false });
    V.ttsReady().then((ok) => { LS.noVoice = !ok; if (!ok && LS.active) EG.UI.toast('这个浏览器没有英文朗读声音，录音改为逐句显示文字'); });
    if (!mock) return lv;
    // 模考：Boss 的血量比题数多 1，打到最后一题之前不会倒下；结局由总成绩决定
    return Object.assign({}, lv, { mons: [Object.assign({}, lv.mons[0], { hp: total + 1 })] });
  };
  LS.stop = () => { LS.active = false; LS.tk++; V.stopScript(); LS.pending = null; const c = $('#sp-card'); if (c) c.classList.remove('on'); const b = $('#sp-board'); if (b) b.innerHTML = ''; setState('idle'); };

  /* ---------- 界面 ---------- */
  const rate = () => (store().settings.listenRate === 'slow' ? 0.78 : 0.94);
  function setState(s) { LS.state = s; const el = $('#listen'); if (el) el.dataset.state = s; setStatus(); }
  function setStatus(extra) {
    const el = $('#ls-status'); if (!el) return;
    const t = LS.cur, s = LS.state;
    let tx = '';
    if (s === 'intro') tx = '先看题目，录音马上开始…';
    else if (s === 'playing') tx = LS.userPaused ? '已暂停，按空格继续' : '正在播放第 ' + (t ? t.pass : 1) + ' 遍（共 2 遍）' + (LS.mock ? '' : '——听出来了可以直接提交');
    else if (s === 'between') tx = LS.mock ? '马上播放第 2 遍…' : '马上播放第 2 遍——已经有把握的话按 Enter 提交';
    else if (s === 'answer') tx = '录音放完了，检查一下答案，按 Enter 提交';
    else if (s === 'done') tx = LS.mock ? '已记录' : '看看讲解，然后按 Enter 继续';
    el.textContent = extra || tx;
    const ico = $('#ls-ico'); if (ico) ico.textContent = (s === 'playing' || s === 'intro') && !LS.userPaused ? '⏸' : '▶';
    const dots = $('#ls-dots'); if (dots && t) dots.innerHTML = [1, 2].map((i) => '<i class="' + (t.pass > i || (t.pass === i && s !== 'playing') ? 'done' : t.pass === i ? 'cur' : '') + '"></i>').join('') + '<span>第 ' + Math.max(1, Math.min(2, t.pass || 1)) + ' 遍 / 共 2 遍</span>';
    const sb = $('#ls-subbtn'); if (sb) { sb.style.display = LS.mock ? 'none' : ''; sb.classList.toggle('on', !!LS.subOn); }
    const ag = $('#ls-again'); if (ag) ag.disabled = !(s === 'between' || s === 'done');
    const sm = $('#ls-submit'); if (sm) { sm.disabled = !(s === 'playing' || s === 'between' || s === 'answer') || (LS.mock && s !== 'answer'); sm.style.display = s === 'done' ? 'none' : ''; }
  }
  function setSub(text, who) {
    const el = $('#ls-sub'); if (!el) return;
    el.innerHTML = text ? (WHO[who] ? '<b>' + WHO[who] + '</b> ' : '') + esc(text) : '';
  }
  LS.layout = () => {
    const scr = $('#scr-battle'); if (!scr) return;
    const shortScr = S.H <= 520, panel = $('#panel'), ph = panel ? panel.offsetHeight : 0;
    scr.style.setProperty('--sp-top', (shortScr ? 6 : Math.round(S.top + 4)) + 'px');
    scr.style.setProperty('--sp-h', Math.max(150, shortScr ? S.H - ph - 14 : Math.round(S.gy - S.top - 6)) + 'px');
  };

  function clock(t) {
    const p = t.split(':'), h = +p[0], m = +p[1], ma = (m * 6 - 90) * Math.PI / 180, ha = ((h % 12) * 30 + m * 0.5 - 90) * Math.PI / 180;
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r1 = i % 3 ? 40 : 36; ticks += '<line x1="' + (50 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (50 + Math.sin(a) * r1).toFixed(1) + '" x2="' + (50 + Math.cos(a) * 44).toFixed(1) + '" y2="' + (50 + Math.sin(a) * 44).toFixed(1) + '" stroke="#2b2b33" stroke-width="' + (i % 3 ? 2 : 4) + '"/>'; }
    return '<svg class="clk" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fdf6e3" stroke="#2b2b33" stroke-width="5"/>' + ticks +
      '<line x1="50" y1="50" x2="' + (50 + Math.cos(ha) * 24).toFixed(1) + '" y2="' + (50 + Math.sin(ha) * 24).toFixed(1) + '" stroke="#2b2b33" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="50" y1="50" x2="' + (50 + Math.cos(ma) * 36).toFixed(1) + '" y2="' + (50 + Math.sin(ma) * 36).toFixed(1) + '" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="#2b2b33"/></svg><b class="dig">' + esc(t) + '</b>';
  }
  const picHtml = (p) => (p.c ? clock(p.c) : p.t ? '<span class="e sm">' + p.e + '</span><b class="big">' + esc(p.t) + '</b>' : '<span class="e">' + p.e + '</span>');
  const optLabel = (it, o) => (o === null || o === undefined || o === '' ? '（没有作答）' : it.kind === 'pic' ? it.opts[o].l : it.opts[o]);

  function showBoard(t) {
    const bd = $('#sp-board');
    let h = '';
    const optBtns = (it, i, pic) => it.order.map((o, k) => '<button class="' + (pic ? 'lsb-pic' : 'lsb-opt') + '" data-ls="opt" data-i="' + i + '" data-o="' + o + '"><kbd>' + ABC[k] + '</kbd>' + (pic ? '<span class="pic">' + picHtml(it.opts[o]) + '</span>' : '<span>' + esc(it.opts[o]) + '</span>') + '</button>').join('');
    if (t.part === 1) h = '<div class="lsb p1"><div class="lsb-q">' + (LS.mock ? '<em>' + t.first + '</em>' : '') + esc(t.items[0].q) + '</div><div class="lsb-pics">' + optBtns(t.items[0], 0, true) + '</div></div>';
    else if (t.part === 2) h = '<div class="lsb p2"><div class="lsb-ctx">' + esc(t.ctx) + '</div><div class="lsb-q">' + (LS.mock ? '<em>' + t.first + '</em>' : '') + esc(t.items[0].q) + '</div><div class="lsb-opts">' + optBtns(t.items[0], 0, false) + '</div></div>';
    else if (t.part === 3) {
      h = '<div class="lsb p3"><div class="lsb-ctx">' + esc(t.ctx) + '</div><div class="lsb-note"><div class="lsb-title">📝 ' + esc(t.title) + '</div>' +
        t.notes.map((ln, i) => '<div class="ln"><em>' + ((t.first || 1) + i) + '</em><span>' + esc(ln).replace(/\{(\d)\}/, (m, g) => '<input type="text" data-g="' + g + '" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="24">') + '</span></div>').join('') +
        '</div><div class="lsb-rule">每个空写一两个英文单词，或者一个数字、日期、时间。按 Tab / Enter 跳到下一个空。</div></div>';
    } else {
      h = '<div class="lsb p4"><div class="lsb-ctx">' + esc(t.ctx) + '</div><div class="lsb-grid">' +
        t.items.map((it, i) => '<div class="lq"><div class="lq-q"><em>' + ((t.first || 1) + i) + '</em>' + esc(it.q) + '</div><div class="lq-opts">' + optBtns(it, i, false) + '</div></div>').join('') + '</div></div>';
    }
    bd.innerHTML = h; bd.className = 'sp-board on ls';
  }
  /** 提交后在题板上标出对错 */
  function markBoard(t) {
    t.items.forEach((it, i) => {
      if (it.kind === 'gap') {
        const el = $('#sp-board input[data-g="' + i + '"]'); if (!el) return;
        el.disabled = true; el.classList.add(it.ok ? 'ok' : 'no');
        if (!it.ok && !LS.mock) el.insertAdjacentHTML('afterend', '<b class="fix">' + esc(it.gap.a) + '</b>');
      } else {
        $$('#sp-board [data-ls="opt"][data-i="' + i + '"]').forEach((el) => {
          const o = +el.dataset.o; el.disabled = true;
          if (!LS.mock && o === it.ans) el.classList.add('ok');
          else if (!LS.mock && o === it.sel) el.classList.add('no');
        });
      }
    });
  }

  /* ---------- 一段录音 ---------- */
  /** battle.js 在怪兽"吟唱"时调用：放下一段录音 */
  LS.ask = () => {
    const b = B(); if (!LS.active || b.over || !b.mon) return;
    LS.ti++;
    const t = (LS.cur = LS.turns[LS.ti % LS.turns.length]), tk = ++LS.tk;
    t.items.forEach((it) => { it.sel = it.kind === 'gap' ? '' : null; it.ok = undefined; if (it.order) it.order = U.shuffle([0, 1, 2]); });
    t.pass = 0; t.submitted = false; t.usedSub = false; LS.userPaused = false;
    b.q = { task: true, listen: true, tMax: t.wait, t: t.wait, started: false, done: false, frozen: 0, ult: false };
    b.word = null; b.mon.castT = 1;
    $('#sp-card').classList.remove('on');
    $('#prompt').textContent = t.label; $('#prompt').className = 'prompt';
    showBoard(t); setSub('');
    setState('intro');
    EG.Audio.play('word');
    FX.after(0.6, () => {
      if (tk !== LS.tk || !LS.active) return;
      V.playScript(t.rubric, { rate: rate(), onChunk: (i, c) => setSub(c.text, 'N'), onEnd: () => { if (tk === LS.tk) FX.after(0.7, () => startPass(tk)); } });
    });
  };
  function startPass(tk) {
    const b = B(), t = LS.cur; if (tk !== LS.tk || !LS.active || !t || t.submitted || b.over) return;
    t.pass++; LS.userPaused = false;
    if (b.mon) b.mon.castT = 0.6;
    setState('playing'); setSub('');
    V.playScript(t.chunks, {
      rate: rate(),
      onChunk: (i, c) => { if (LS.subOn || LS.noVoice) { setSub(c.text, c.who); if (LS.subOn) t.usedSub = true; } else setSub(''); },
      onEnd: () => { if (tk === LS.tk) passDone(tk); },
    });
  }
  function passDone(tk) {
    const b = B(), t = LS.cur; if (tk !== LS.tk || !t || t.submitted) return;
    if (b.mon) b.mon.castT = 0.3;
    setSub('');
    if (t.pass < 2) { setState('between'); FX.after(LS.mock ? 2 : 3.2, () => { if (tk === LS.tk && LS.state === 'between') startPass(tk); }); }
    else { setState('answer'); if (b.q) { b.q.t = b.q.tMax; b.q.started = true; } } // 两遍放完，开始倒计时
  }
  /** 提交。auto：时间到了自动提交（不管答没答完） */
  LS.submit = (auto) => {
    const b = B(), t = LS.cur, q = b.q;
    if (!LS.active || !t || t.submitted || !q || b.over) return;
    if (['playing', 'between', 'answer'].indexOf(LS.state) < 0) return;
    if (LS.mock && LS.state !== 'answer') return EG.UI.toast('模考里要把两遍都听完才能提交');
    $$('#sp-board input[data-g]').forEach((el) => { t.items[+el.dataset.g].sel = el.value.trim(); });
    const blank = t.items.filter((it) => it.sel === null || it.sel === '').length;
    if (!auto && blank && LS.state !== 'answer') return EG.UI.toast(t.items.length > 1 ? '还有 ' + blank + ' 题没答，听完再提交' : '先选一个答案');
    const early = t.pass <= 1 && LS.state !== 'answer'; // 只听了一遍就提交
    t.submitted = true; LS.tk++; V.stopScript(); q.started = false; setSub('');
    let hits = 0, misses = 0;
    t.items.forEach((it) => { it.ok = it.kind === 'gap' ? LS.gapOk(it.sel, it.gap) : it.sel === it.ans; if (it.ok) hits++; else misses++; });
    const grade = misses ? (hits ? 1 : 0) : early && !t.usedSub ? 3 : 2;
    LS.right += hits; LS.wrong += misses; if (grade === 3) LS.firstPass += hits; if (t.usedSub) LS.subUsed++;
    const sn = store().listen.seen; sn[t.id] = (sn[t.id] || 0) + 1; EG.Store.save();
    // 记下这一次作答（题目对象在重复出现时会被重置，所以这里存一份快照）
    LS.recs.push({ part: t.part, label: t.label, title: t.title || t.ctx || t.items[0].q, chunks: t.chunks, hits, n: t.items.length, items: t.items.map((it) => ({ q: it.q, ok: it.ok, ev: it.ev, zh: it.zh, mine: it.kind === 'gap' ? it.sel || '（没有作答）' : optLabel(it, it.sel), right: it.kind === 'gap' ? it.gap.a : optLabel(it, it.ans) })) });
    markBoard(t);
    setState('done');
    if (LS.mock) { if (LS.ti >= LS.turns.length - 1) LS.finale = true; EG.UI.toast(t.items.length > 1 ? '已记录 ' + t.items.length + ' 题' : '已记录，下一题'); }
    else feedbackCard(LS.recs[LS.recs.length - 1], grade, t.usedSub);
    LS.continued = false; LS.gateReady = false;
    b.listenResult({ hits, misses, grade, keep: LS.mock || t.items.length === 1, mock: LS.mock });
  };
  LS.timeUp = () => LS.submit(true);

  /* ---------- 讲解卡 ---------- */
  function transcript(rec) {
    const evs = rec.items.map((it, i) => ({ k: esc(it.ev || ''), n: rec.items.length > 1 ? i + 1 : 0, ok: it.ok }));
    let out = '';
    rec.chunks.forEach((c, i) => {
      let h = esc(c.text);
      evs.forEach((e) => { if (!e.k) return; const at = h.indexOf(e.k); if (at >= 0) h = h.slice(0, at) + '<mark class="' + (e.ok ? 'ok' : 'no') + '">' + (e.n ? '<sup>' + e.n + '</sup>' : '') + e.k + '</mark>' + h.slice(at + e.k.length); });
      const turn = i === 0 || rec.chunks[i - 1].who !== c.who;
      out += (turn ? (i ? '</p>' : '') + '<p>' + (WHO[c.who] ? '<b>' + WHO[c.who] + '</b> ' : '') : ' ') + h;
    });
    return out + '</p>';
  }
  const itemRows = (rec, withZh) => rec.items.map((it, i) => '<div class="lr ' + (it.ok ? 'ok' : 'no') + '"><span class="mk">' + (it.ok ? '✓' : '✗') + '</span><div class="grow"><div class="lr-q">' + (rec.items.length > 1 ? '<em>' + (i + 1) + '</em>' : '') + esc(it.q) + '</div><div class="lr-a">' + (it.ok ? '<b>' + esc(it.right) + '</b>' : '<s>' + esc(it.mine) + '</s> → <b>' + esc(it.right) + '</b>') + '</div>' + (withZh && it.zh ? '<div class="lr-zh">' + esc(it.zh) + '</div>' : '') + '</div></div>').join('');
  function feedbackCard(rec, grade, usedSub) {
    const el = $('#sp-card'), all = rec.hits === rec.n;
    const title = all ? (grade >= 3 ? '一遍听懂！' : '全对！') : rec.hits ? '答对 ' + rec.hits + ' 题' : rec.n > 1 ? '这段没听出来' : '答错了';
    el.innerHTML = '<div class="spc lsc ' + (all ? 'ok' : 'no') + '">' +
      '<div class="spc-head"><div class="spc-score"><b>' + rec.hits + '</b><span>/ ' + rec.n + '</span></div><div class="spc-gr"><div class="spc-grade">' + title + '</div><div class="spc-sub">' + (usedSub ? '这一段开了字幕' : all && grade < 3 ? '听完第一遍就提交，法术更强' : rec.n === 1 && !all ? '换一段录音再来' : '') + '</div></div></div>' +
      '<div class="spc-body">' + itemRows(rec, true) +
      '<div class="spc-sample"><span>录音文本（标出来的是答案依据） <button class="btn small" data-ls="again">🔁 再听一遍</button></span><div class="lsc-tr">' + transcript(rec) + '</div></div>' +
      '</div><div class="spc-foot"><span class="spc-note"></span><button class="btn primary" data-ls="cont">继续 ▶ <kbd>Enter</kbd></button></div></div>';
    el.classList.add('on'); $('#sp-board').classList.add('under');
  }

  /* ---------- 和战斗的衔接：讲解看完再进行下一步 ---------- */
  LS.gate = (delay, fn) => { LS.pending = fn; LS.gateReady = false; FX.after(delay, () => { LS.gateReady = true; tryGo(); }); };
  function tryGo() {
    if (!LS.gateReady || !LS.pending || !LS.active) return;
    if (!LS.mock && !LS.continued) return;
    const f = LS.pending; LS.pending = null; LS.gateReady = false; LS.continued = false;
    $('#sp-card').classList.remove('on'); $('#sp-board').classList.remove('under'); V.stopScript();
    if (LS.mock && LS.finale && !B().over) { LS.finale = false; return B().finale(LS.right >= Math.ceil(LS.total * PASS_MARK)); }
    f();
  }
  LS.cont = () => { if (LS.state !== 'done') return; LS.continued = true; tryGo(); };

  /* ---------- 按钮 / 键盘 ---------- */
  function pick(i, o) {
    const t = LS.cur; if (!t || t.submitted || !t.items[i] || ['playing', 'between', 'answer', 'intro'].indexOf(LS.state) < 0) return;
    t.items[i].sel = o;
    $$('#sp-board [data-ls="opt"][data-i="' + i + '"]').forEach((el) => el.classList.toggle('sel', +el.dataset.o === o));
  }
  LS.act = (name, el) => {
    if (!LS.active) return;
    const b = B(), t = LS.cur;
    if (name === 'opt') pick(+el.dataset.i, +el.dataset.o);
    else if (name === 'key') { // 键盘 1 / 2 / 3 或 A / B / C：只在一段录音一道题时用
      if (t && t.items.length === 1 && t.items[0].order) pick(0, t.items[0].order[el]);
    } else if (name === 'play') {
      if (b.paused || (LS.state !== 'playing' && LS.state !== 'intro')) { if (LS.state === 'between') LS.act('again'); return; }
      LS.userPaused = !LS.userPaused;
      if (LS.userPaused) V.pauseScript(); else V.resumeScript();
      setStatus();
    } else if (name === 'again') {
      if (LS.state === 'between') startPass(LS.tk);
      else if (LS.state === 'done' && t) V.playScript(t.chunks, { rate: rate(), onChunk: (i, c) => setSub(c.text, c.who), onEnd: () => setSub('') }); // 答完以后重听：带字幕，随便听
    } else if (name === 'submit') LS.submit(false);
    else if (name === 'cont') LS.cont();
    else if (name === 'sub') {
      if (LS.mock) return;
      LS.subOn = !LS.subOn; if (!LS.subOn && !LS.noVoice) setSub('');
      EG.UI.toast(LS.subOn ? '字幕已打开：每句话会显示在下面' : '字幕已关闭');
      setStatus();
    }
  };
  LS.onPause = (v) => { if (!LS.active) return; if (v) V.pauseScript(); else if (!LS.userPaused) V.resumeScript(); };

  /** 每帧：播放进度条（借用倒计时条，蓝色表示正在播放） */
  LS.update = () => {
    if (!LS.active) return;
    if (LS.state === 'playing' || LS.state === 'intro') { const st = V.scriptState(); EG.UI.timer(LS.state === 'playing' && st ? st.frac : 0, true); }
    else if (LS.state === 'between') EG.UI.timer(1, true);
  };

  /* ---------- 结算 ---------- */
  LS.stars = () => {
    const n = LS.right + LS.wrong, acc = n ? LS.right / n : 0;
    return { acc, stars: (acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1) - (LS.subUsed && acc >= 0.9 ? 1 : 0) };
  };
  LS.result = (r) => {
    const b = B(), sc = b.scene, li = b.li, n = LS.right + LS.wrong, secs = Math.round((Date.now() - b.stats.t0) / 1000);
    const hasNext = r.win && li + 1 < sc.levels.length, cleared = r.win && li + 1 >= sc.levels.length;
    const best = store().listen.best, key = sc.id + '-' + li, pct = n ? Math.round((LS.right / n) * 100) : 0;
    if (r.win && (!best[key] || pct > best[key])) { best[key] = pct; EG.Store.save(); }
    let sheet = '';
    if (LS.mock) {
      const parts = [1, 2, 3, 4].map((p) => { const rs = LS.recs.filter((x) => x.part === p); return { p, hit: rs.reduce((a, x) => a + x.hits, 0), n: rs.reduce((a, x) => a + x.n, 0) }; });
      const need = Math.ceil(LS.total * PASS_MARK);
      sheet = '<div class="sheet"><div class="sh-title">听力成绩单 <small>一题一分，共 ' + LS.total + ' 分</small></div>' +
        parts.map((x) => '<div class="sh-row"><div><b>Part ' + x.p + '</b><small>' + PART_INFO[x.p].t.split(' · ')[1] + '</small></div><div class="sh-bar"><i style="width:' + (x.n ? (x.hit / x.n) * 100 : 0) + '%"></i></div><em>' + x.hit + '/' + x.n + '</em></div>').join('') +
        '<div class="sh-note">总分 <b>' + LS.right + ' / ' + LS.total + '</b>。按剑桥官方练习题的换算表，听力对 18 题约为 B1 及格线（剑桥英语量表 140 分），对 23 题约为 160 分。这里以 ' + need + ' 题为通过线。<br>题目是本游戏自编的练习题，录音是合成语音，这个成绩只能当参考。</div></div>';
    }
    const rows = LS.recs.map((rec) => '<details class="lrec' + (rec.hits === rec.n ? ' ok' : '') + '"' + (rec.hits === rec.n ? '' : ' open') + '><summary><span class="mk">' + rec.hits + '/' + rec.n + '</span><b>Part ' + rec.part + '</b> ' + esc(rec.title) + '</summary>' + itemRows(rec, true) + '<div class="lsc-tr">' + transcript(rec) + '</div></details>').join('');
    const title = r.win ? (LS.mock ? '模 考 通 过 ！' : cleared ? '场 景 通 关 ！' : '闯 关 成 功') : LS.mock ? '模 考 未 通 过' : '挑 战 失 败';
    EG.UI.modal('<h3>' + title + '</h3><div class="m-sub">' + esc(sc.name) + ' · 第 ' + (li + 1) + ' 关 ' + esc(b.level.name) + ' · ' + esc(b.level.sub || '') + '</div>' +
      (r.win ? '<div class="res-stars">' + [0, 1, 2].map((i) => '<i class="' + (i < r.stars ? 'on' : '') + '">★</i>').join('') + '</div>' : '<div class="m-sub" style="margin:0">' + (LS.mock ? '没到通过线。点开下面每段录音看讲解和文本，再考一次。' : '别灰心，点开下面每段录音看讲解，再来一次！') + '</div>') +
      '<div class="res-grid"><div><b>' + LS.right + ' / ' + n + '</b><span>答对</span></div><div><b>' + pct + '%</b><span>正确率</span></div><div><b>' + LS.firstPass + '</b><span>一遍听懂</span></div><div><b>' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</b><span>用时</span></div></div>' +
      '<div class="m-body scroll">' + sheet + '<div class="sp-log">' + (rows || '<div class="empty">这一关还没有作答</div>') + '</div></div>' +
      '<div class="m-foot"><button class="btn" data-act="quit">关卡列表</button><button class="btn' + (hasNext ? '' : ' primary') + '" data-act="retry">再来一次</button>' + (hasNext ? '<button class="btn primary" data-act="next">下一关 ▶</button>' : '') + '</div>', { locked: true, wide: true });
    if (r.win) for (let i = 0; i < r.stars; i++) setTimeout(() => EG.Audio.play('star'), 250 + i * 250);
  };

  /* ---------- 关卡说明页、试听 ---------- */
  LS.info = (lv) => {
    const p = PART_INFO[lv.sp.part];
    return '<div class="row"><span class="tag" style="background:var(--scene);color:#10131f;border:0">' + p.t + '</span><span class="tag">' + p.n + '</span></div>' +
      '<div class="sp-info"><p>' + p.d + '</p><ul>' + p.tips.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
      '<div class="sp-mode"><b>关于录音</b> 游戏里没有录音文件，录音由浏览器的朗读功能现场读出来（男声、女声分角色），每段播两遍。请把电脑的声音打开。' +
      '<br>语速可以在设置里调慢；练习关里按 <b>T</b> 可以开字幕。声音不好听的话可以换。<div style="margin-top:8px"><button class="btn small" data-act="voice-test">🔊 试听 / 更换声音</button></div></div>';
  };
  /* ---------- 试听 / 更换朗读声音 ---------- */
  const ACCENT = { GB: '英式', US: '美式', AU: '澳洲', IN: '印度', IE: '爱尔兰', ZA: '南非', NZ: '新西兰', CA: '加拿大', SG: '新加坡' };
  const ROLES = [['M', '男声', 'voiceM', 'Hello! Can you hear me clearly? I have got some news about our school trip.'], ['F', '女声', 'voiceF', 'Yes, I can. The listening test is about to begin.'], ['N', '旁白', 'voiceN', 'You will hear two people talking about their weekend.']];
  const voiceLabel = (v) => v.name + ' · ' + (ACCENT[(v.lang.split(/[-_]/)[1] || '').toUpperCase()] || v.lang) + (v.local ? '' : ' · 在线');
  function voiceRows() {
    const k = V.cast(), all = V.voices(), st = store().settings;
    return ROLES.map((r, ri) => {
      // 这个角色对口的声音排前面
      const want = r[0] === 'N' ? '' : r[0];
      const list = all.slice().sort((a, b) => (want ? (b.gender === want ? 1 : 0) - (a.gender === want ? 1 : 0) : 0));
      return '<div class="vt-row"><b>' + r[1] + '</b><select data-voice="' + r[2] + '" aria-label="' + r[1] + '">' +
        '<option value="">自动（现在是 ' + esc(k.auto[ri] ? k.names[ri] || '默认' : '—') + '）</option>' +
        list.map((v) => '<option value="' + esc(v.name) + '"' + (st[r[2]] === v.name ? ' selected' : '') + '>' + esc(voiceLabel(v)) + '</option>').join('') +
        '</select><button class="btn small" data-act="voice-try" data-role="' + r[0] + '" aria-label="试听' + r[1] + '">▶ 试听</button></div>';
    }).join('');
  }
  /** 只读某一个角色的声音 */
  LS.voiceTry = (role) => {
    const r = ROLES.find((x) => x[0] === role); if (!r) return;
    const tx = $('#vt-text');
    V.playScript([{ who: r[0], text: r[3] }], { rate: rate(), onChunk: () => { if (tx) tx.textContent = r[1] + '（' + (V.cast().names[ROLES.indexOf(r)] || '默认') + '）: ' + r[3]; }, onEnd: () => { const t2 = $('#vt-text'); if (t2) t2.textContent = '✓ ' + r[1] + '读完了。不满意就在下面换一个再听。'; } });
  };
  LS.voiceTest = () => {
    const box = EG.UI.modal('<h3>朗 读 声 音</h3><div class="m-body"><div class="mt-text" id="vt-text">正在查找英文朗读声音…</div><div id="vt-rows"></div><p class="vt-note" id="vt-note"></p></div><div class="m-foot"><button class="btn" data-act="voice-again">三个声音连着听</button><button class="btn primary" data-act="close">好的</button></div>', { onClose: () => V.stopScript() });
    const fill = () => { const rows = $('#vt-rows', box); if (rows) rows.innerHTML = voiceRows(); };
    const play = () => V.ttsReady().then((ok) => {
      const tx = $('#vt-text', box), note = $('#vt-note', box); if (!tx) return;
      if (!ok) { tx.textContent = '没有找到英文朗读声音'; note.textContent = '这个浏览器没有可用的英文语音。听力关会改成逐句显示文字（变成阅读练习）。换用 Chrome、Edge 或 Safari，或者在系统设置里添加英文语音。'; return; }
      fill();
      note.innerHTML = '声音来自浏览器和系统，每台电脑不一样。<b>Chrome</b> 里 Google 开头的是它自带的在线语音；<b>Edge</b> 里名字带 Natural 的最自然；<b>Mac</b> 可以在"系统设置 → 辅助功能 → 朗读内容 → 系统声音 → 管理声音"里下载"优化音质 / 高音质"的英语声音，下载后重开浏览器就会出现在这里。<br>听不到声音的话，检查电脑音量和浏览器标签页有没有被静音。';
      V.playScript(ROLES.slice(2).concat(ROLES.slice(0, 2)).map((r) => ({ who: r[0], text: r[3] })), { rate: rate(), onChunk: (i, c) => { tx.textContent = (WHO[c.who] ? WHO[c.who] + ': ' : '') + c.text; }, onEnd: () => { tx.textContent = '✓ 播放完了。三句话应该是三种不同的声音。'; } });
    });
    LS._voiceAgain = play; LS._voiceFill = fill; play();
  };
  // 换声音：存进设置，马上用新声音读一句
  document.addEventListener('change', (ev) => {
    const t = ev.target; if (!t || !t.dataset || !t.dataset.voice) return;
    store().settings[t.dataset.voice] = t.value; EG.Store.save();
    const r = ROLES.find((x) => x[2] === t.dataset.voice);
    if (LS._voiceFill) LS._voiceFill();
    if (r) LS.voiceTry(r[0]);
  });

  // 填空：Enter / 方向键在空之间移动，最后一个空按 Enter 提交
  document.addEventListener('keydown', (ev) => {
    const el = ev.target; if (!el || !el.dataset || el.dataset.g === undefined || !LS.active) return;
    if (ev.key === 'Enter' || ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      const all = $$('#sp-board input[data-g]'), i = all.indexOf(el), nx = all[i + (ev.key === 'ArrowUp' ? -1 : 1)];
      if (nx) nx.focus(); else if (ev.key === 'Enter') { el.blur(); LS.submit(false); }
    }
  });
})();
