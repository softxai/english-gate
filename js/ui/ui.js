/* English Gate · 界面：标题、场景、关卡、战斗 HUD、词库、错词本、图鉴、设置、结算 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, S = EG.Stage, $ = U.$, $$ = U.$$, esc = U.esc;
  const UI = (EG.UI = { cur: 'title', backTo: 'title', scene: null, li: 0, bankSel: null });
  const B = () => EG.Battle;
  const store = () => EG.Store.data;
  const TIER_NAMES = ['', '小学低段', '小学高段', '初中', '高中', '大学 / 托福', '研究生 / GRE'];

  /* ---------- 小工具 ---------- */
  let toastTimer = null;
  UI.toast = (msg) => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
  };
  let cutinTimer = null;
  UI.cutin = (o) => {
    const el = $('#cutin');
    el.className = ''; void el.offsetWidth;
    $('.ci-t', el).textContent = o.title || ''; $('.ci-s', el).textContent = o.sub || '';
    el.style.animationDuration = (o.dur || 1.5) + 's';
    el.className = 'on ' + (o.cls || '');
    clearTimeout(cutinTimer); cutinTimer = setTimeout(() => { el.className = ''; }, (o.dur || 1.5) * 1000 + 60);
  };
  let modalClose = null;
  UI.modal = (html, opt) => {
    opt = opt || {};
    const box = $('#modal-box');
    box.className = 'modal-box' + (opt.wide ? ' wide' : '');
    box.innerHTML = html;
    $('#modal').classList.add('on');
    modalClose = opt.onClose || null;
    UI.modalLocked = !!opt.locked;
    return box;
  };
  UI.closeModal = (silent) => {
    if (!$('#modal').classList.contains('on')) return;
    $('#modal').classList.remove('on');
    $('#modal-box').innerHTML = '';
    bestStop();
    const f = modalClose; modalClose = null; UI.modalLocked = false;
    if (f && !silent) f();
  };
  const starStr = (n, max) => { let s = ''; for (let i = 0; i < (max || 3); i++) s += i < n ? '★' : '<i>★</i>'; return s; };
  const sceneStars = (sc) => { const P = store().progress[sc.id]; return P ? P.stars.reduce((a, b) => a + (b || 0), 0) : 0; };
  const levelOpen = (sc, li) => {
    if (store().settings.unlockAll || li === 0 || sc.levels[li].free) return true;
    const P = store().progress[sc.id];
    if (sc.kind) return !!P && sc.levels.every((l, i) => i >= li || !!P.stars[i]); // 口语 / 听力的模考：前面几关都通过才开放
    return !!(P && P.stars[li - 1]);
  };
  const wordScenes = () => EG.Scenes.filter((sc) => !sc.kind);
  const bankOptions = (cur) => EG.Banks.all().map((b) => '<option value="' + esc(b.id) + '"' + (b.id === cur ? ' selected' : '') + '>' + esc(b.name) + '（' + b.words.length + ' 词）</option>').join('');

  /* ---------- 怪兽缩略图 ---------- */
  const thumbA = (t) => ({ t: t === undefined ? 1.3 : t, cast: 0, atk: 0, hurt: 0, seed: 1 });
  function drawThumb(cv, def, seen, a) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.clearRect(0, 0, W, H);
    let ext = 300;
    if (def.a === 'dragon') ext = def.f.small ? 360 : 540;
    else if (def.a === 'bird' || def.f.wings) ext = 370;
    else if (def.a === 'treant' || def.a === 'eye' || def.a === 'tentacle' || def.a === 'beast') ext = 330;
    else if (def.a === 'bug') ext = 380;
    if (def.f.boss && def.a !== 'dragon') ext *= 1.16;
    const k = W / ext, fly = EG.Creatures.isFly(def);
    c.save(); c.translate(W * (def.a === 'dragon' && !def.f.small ? 0.46 : def.a === 'beast' ? 0.52 : 0.5), H * (fly ? 0.95 : 0.9)); c.scale(k, k);
    EG.Creatures.draw(c, def, a || thumbA());
    c.restore();
    if (!seen) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = '#0b0e22'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; }
  }
  UI.drawThumb = drawThumb;
  const mkCanvas = (px) => { const cv = document.createElement('canvas'); const d = Math.min(2, window.devicePixelRatio || 1); cv.width = cv.height = Math.round(px * d); return cv; };

  /* ---------- 切换界面 ---------- */
  UI.show = (name) => {
    if (name === 'back') name = UI.backTo || 'title';
    const util = ['banks', 'book', 'bestiary'];
    if (util.indexOf(name) >= 0 && util.indexOf(UI.cur) < 0) UI.backTo = UI.cur === 'battle' ? 'title' : UI.cur;
    $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + name));
    UI.cur = name;
    $('#shade').className = name === 'battle' ? '' : name === 'title' || name === 'map' || name === 'levels' ? 'veil' : 'dark';
    if (name !== 'battle') {
      EG.Audio.music('title');
      S.setBg(name === 'levels' && UI.scene ? UI.scene.id : store().lastScene || 'forest', 0);
      S.layout();
    }
    if (name === 'map') buildMap();
    else if (name === 'levels') buildLevels();
    else if (name === 'banks') buildBanks();
    else if (name === 'book') buildBook();
    else if (name === 'bestiary') buildBestiary();
  };

  /* ---------- 场景地图 ---------- */
  function buildMap() {
    const list = $('#scene-list'); list.innerHTML = '';
    EG.Scenes.forEach((sc, i) => {
      const speak = !!sc.kind, bank = speak ? null : EG.Banks.get(EG.Banks.forScene(sc));
      const el = document.createElement('button');
      el.className = 'scene-card'; el.style.setProperty('--c', sc.color);
      el.dataset.scene = sc.id;
      el.innerHTML = '<span class="sc-no">第 ' + '一二三四五六七八九'[i] + ' 幕</span><div class="sc-body">' +
        '<div class="sc-name"><span>' + sc.icon + ' ' + esc(sc.name) + '</span><small>' + esc(sc.en.toUpperCase()) + '</small></div>' +
        '<div class="sc-desc">' + esc(sc.desc) + '</div>' +
        '<div class="sc-meta">' + (speak ? '<span class="tag sc-speak">PET ' + (sc.kind === 'listen' ? '听力' : '口语') + ' · Part 1–4</span>' : '<span class="tag sc-bank">词库 ' + esc(bank.name) + '</span>') + '<span class="tag">' + sc.levels.length + ' 关 · ' + sc.levels.reduce((a, l) => a + l.mons.length, 0) + (sc.kind === 'speak' ? ' 位考官' : ' 只怪兽') + '</span><span class="sc-stars">★ ' + sceneStars(sc) + ' / ' + sc.levels.length * 3 + '</span></div></div>';
      const cv = document.createElement('canvas'); cv.width = 640; cv.height = 300;
      const g = cv.getContext('2d'); g.save(); g.scale(2, 2);
      EG.Backgrounds.drawStatic(g, sc.id, 320, 150, 122, 0);
      EG.Backgrounds.drawAnim(g, sc.id, 320, 150, 122, 3.3, 0);
      g.restore();
      // 右侧画上本场景 Boss 的身影
      const boss = sc.levels[sc.levels.length - 1].mons.slice(-1)[0], seen = !!store().bestiary[boss.id];
      const tc = mkCanvas(120); drawThumb(tc, boss, seen);
      g.globalAlpha = seen ? 1 : 0.75; g.drawImage(tc, 640 - 250, 300 - 248, 240, 240); g.globalAlpha = 1;
      el.insertBefore(cv, el.firstChild.nextSibling);
      list.appendChild(el);
    });
    const soon = document.createElement('div');
    soon.className = 'scene-card soon';
    soon.innerHTML = '<b>📜 句子翻译关卡</b><span>整句理解与翻译的新玩法<br>正在筹备中，敬请期待</span>';
    list.appendChild(soon);
  }

  /* ---------- 关卡选择 ---------- */
  function buildLevels() {
    const sc = UI.scene || (UI.scene = EG.sceneById(store().lastScene));
    document.documentElement.style.setProperty('--scene', sc.color);
    $('#lv-title').textContent = sc.icon + ' ' + sc.name;
    $('#lv-desc').textContent = sc.desc;
    const speak = !!sc.kind;
    $('#lv-bank').parentElement.style.display = speak ? 'none' : '';
    if (!speak) $('#lv-bank').innerHTML = bankOptions(EG.Banks.forScene(sc));
    const P = store().progress[sc.id] || { stars: [], best: [] };
    let firstOpen = 0;
    sc.levels.forEach((lv, li) => { if (levelOpen(sc, li)) firstOpen = li; });
    if (UI.li > firstOpen || UI.li === undefined) UI.li = firstOpen;
    const list = $('#lv-list'); list.innerHTML = '';
    sc.levels.forEach((lv, li) => {
      const open = levelOpen(sc, li), boss = lv.mons.some((m) => m.boss);
      const el = document.createElement('button');
      el.className = 'lv-card' + (open ? '' : ' locked') + (boss ? ' boss' : '') + (li === UI.li ? ' sel' : '');
      el.dataset.level = li;
      el.innerHTML = '<span class="lv-no">' + (open ? li + 1 : '🔒') + '</span><span><div class="lv-name">' + esc(lv.name) + '</div><div class="lv-sub">' + (speak ? esc(lv.sub) : lv.mons.length + ' 只怪兽' + (boss ? ' · BOSS 关' : '')) + '</div></span><span class="lv-stars">' + starStr(P.stars[li] || 0) + '</span>';
      list.appendChild(el);
    });
    buildLevelInfo();
  }
  function buildLevelInfo() {
    const sc = UI.scene, li = UI.li, lv = sc.levels[li], open = levelOpen(sc, li);
    const speak = !!sc.kind, listen = sc.kind === 'listen';
    const P = store().progress[sc.id] || { stars: [], best: [] };
    const traits = {};
    lv.mons.forEach((m) => m.tr.forEach((t) => { traits[t] = 1; }));
    const info = $('#lv-info');
    let mid;
    if (speak) {
      const bestAvg = store()[listen ? 'listen' : 'speak'].best[sc.id + '-' + li];
      mid = (listen ? EG.Listen : EG.Speak).info(lv) + (bestAvg ? '<div class="row"><span class="tag">最好成绩 ' + (listen ? '正确率 ' + bestAvg + '%' : '平均 ' + bestAvg + ' 分') + '</span></div>' : '') + '<div class="mon-row" id="lv-mons"></div>';
    } else {
      const bank = EG.Banks.get(EG.Banks.forScene(sc)), pool = EG.Quiz.pool(bank, li, sc.levels.length);
      mid = '<div class="row"><span class="tag" style="background:' + bank.color + ';color:#10131f;border:0">词库 ' + esc(bank.name) + '</span><span class="tag">本关单词范围 约 ' + pool.length + ' 个</span>' + (P.best[li] ? '<span class="tag">最高分 ' + P.best[li] + '</span>' : '') + '</div>' +
        '<div class="mon-row" id="lv-mons"></div>' +
        (Object.keys(traits).length ? '<div><div class="row" style="margin-bottom:6px">本关怪兽的特殊能力</div><div class="trait-list">' + Object.keys(traits).map((t) => '<span class="trait" title="' + esc(EG.TRAITS[t].d) + '">' + EG.TRAITS[t].n + '：' + EG.TRAITS[t].d + '</span>').join('') + '</div></div>' : '<div class="row">这一关的怪兽没有特殊能力，放心上吧。</div>');
    }
    info.innerHTML = '<div><h3>第 ' + (li + 1) + ' 关 · ' + esc(lv.name) + '</h3></div>' + mid +
      '<div class="foot"><button class="btn primary big" data-act="start"' + (open ? '' : ' disabled') + '>' + (open ? '出 发' : '尚未解锁') + '</button>' + (open ? '' : '<span class="row">' + (speak ? '先把前面四关各通过一次，再来完整模考' : '通关上一关后解锁') + '（也可以在设置里打开"解锁全部关卡"）</span>') + '</div>';
    const row = $('#lv-mons');
    lv.mons.forEach((m) => {
      const seen = !!store().bestiary[m.id];
      const chip = document.createElement('div');
      chip.className = 'mon-chip' + (m.boss ? ' boss' : m.elite ? ' elite' : '');
      const cv = mkCanvas(86); chip.appendChild(cv);
      const sp = document.createElement('span'); sp.textContent = seen ? m.n : m.boss ? '？？？ (BOSS)' : '？？？'; chip.appendChild(sp);
      row.appendChild(chip);
      drawThumb(cv, m, seen);
    });
    $$('.lv-card').forEach((el) => el.classList.toggle('sel', +el.dataset.level === li));
  }

  UI.startLevel = (sc, li) => {
    EG.Audio.unlock();
    UI.scene = sc; UI.li = li;
    store().lastScene = sc.id; EG.Store.save();
    UI.closeModal(true);
    B().start(sc, li);
  };
  UI.startPractice = () => {
    const ms = EG.Banks.mistakes();
    if (ms.length < 4) { UI.toast('错词不足 4 个，先去闯关积累一些吧'); return; }
    EG.Audio.unlock();
    const sc = EG.sceneById(store().lastScene), pool = [];
    sc.levels.forEach((l) => l.mons.forEach((m) => { if (!m.boss) pool.push(m); }));
    const mons = U.shuffle(pool).slice(0, U.clamp(ms.length, 4, 12));
    const words = ms.slice(0, 30).map((x) => x.word), bankOf = new Map();
    ms.forEach((x) => bankOf.set(x.word, x.bank));
    UI.closeModal(true);
    B().start(sc, 2, { practice: true, level: { name: '把错过的单词一个个打回去', mons }, words, bankOf, bank: ms[0].bank });
  };

  /* ---------- 战斗 HUD ---------- */
  UI.battleOpen = () => {
    const b = B();
    $('#scr-battle').classList.toggle('speak', !!b.speak); $('#scr-battle').classList.toggle('listen', !!b.listen);
    UI.show('battle');
    $('#hud-level').textContent = b.practice ? '错词试炼' : b.scene.name + ' ' + (b.li + 1) + ' · ' + b.level.name;
    $('#sp-board').className = 'sp-board'; $('#sp-board').innerHTML = ''; $('#sp-card').className = 'sp-card'; $('#sp-card').innerHTML = '';
    let m = ''; for (let i = 0; i < b.MANA_MAX; i++) m += '<i></i>'; $('#mana').innerHTML = m;
    $('#opts').innerHTML = ''; $('#opts').className = 'opts'; $('#prompt').textContent = ''; $('#prompt').className = 'prompt';
    $('#mon-name').textContent = ''; $('#mon-hp').innerHTML = ''; $('#mon-traits').innerHTML = '';
    $('#review').className = 'review'; $('#timer-fill').style.transform = 'scaleX(1)'; $('#timer').className = 'timer';
    UI.hud(); UI.combo(0); UI.dots();
    document.documentElement.style.setProperty('--panel-h', $('#panel').offsetHeight + 'px');
    if (b.task) { S.layout(); b.task.layout(); }
  };
  UI.hud = () => {
    const b = B(), h = b.hero; if (!h) return;
    const p = h.hp / h.max;
    $('#hp-fill').style.transform = 'scaleX(' + p + ')';
    $('#hp-bar').className = 'bar-hp' + (p < 0.3 ? ' low' : p < 0.6 ? ' mid' : '') + (h.poison > 0 ? ' poison' : '');
    $('#hp-text').textContent = h.hp + ' / ' + h.max + (h.poison > 0 ? ' ☠' : '');
    $$('#mana i').forEach((el, i) => el.classList.toggle('on', i < h.mana));
    $('#hud-score').textContent = b.stats.score;
    $('#ult-fill').style.transform = 'scaleX(' + h.ult / 100 + ')';
    $('#btn-ult').classList.toggle('ready', h.ult >= 100);
    $$('.skill').forEach((el) => el.classList.toggle('off', h.mana < b.SKILLS[el.dataset.skill].cost));
  };
  UI.monPanel = () => {
    const m = B().mon; if (!m) return;
    $('#mon-name').innerHTML = esc(m.def.n) + '<small>' + esc(m.def.e) + '</small>';
    let t = '';
    if (m.def.boss) t += '<span class="trait rank" title="首领：血量厚，半血和残血时会放全屏大招">BOSS</span>';
    else if (m.def.elite) t += '<span class="trait rank" title="精英：需要命中两次以上' + (m.def.ult ? '，受伤后会放全屏大招' : '') + '">精英</span>';
    m.def.tr.forEach((k) => { t += '<span class="trait" title="' + esc(EG.TRAITS[k].d) + '">' + EG.TRAITS[k].n + '</span>'; });
    $('#mon-traits').innerHTML = t;
    UI.monHp();
  };
  UI.monHp = () => {
    const m = B().mon; if (!m) return;
    let s = ''; for (let i = 0; i < m.max; i++) s += '<i' + (i < m.hp ? ' class="on"' : '') + '></i>';
    $('#mon-hp').innerHTML = s;
  };
  UI.dots = () => {
    const b = B(); if (!b.mons) return;
    $('#hud-dots').innerHTML = b.mons.map((m, i) => '<i class="' + (i < b.mi ? 'done' : i === b.mi ? 'cur' : '') + (m.boss ? ' boss' : m.elite ? ' elite' : '') + '"></i>').join('');
  };
  UI.showQuestion = (q) => {
    const p = $('#prompt'), o = $('#opts');
    p.className = 'prompt' + (q.ult ? ' danger' : q.type === 'zh2en' ? ' rev' : '');
    p.textContent = q.ult ? '⚠ 大招咏唱中 —— 答对即可打断！' : q.type === 'zh2en' ? '逆咒！选出对应的英文单词' : '选出这个单词的中文意思';
    o.className = 'opts' + (q.options.length > 4 ? ' six' : '');
    o.innerHTML = q.options.map((op, i) => '<button class="opt' + (q.type === 'zh2en' ? ' en' : '') + '" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd><span class="tx">' + (op.pos ? '<em>' + esc(op.pos) + '</em>' : '') + esc(op.text) + '</span></button>').join('');
    $('#timer-fill').style.transform = 'scaleX(1)'; $('#timer').className = 'timer';
  };
  UI.enableOptions = (v) => $('#opts').classList.toggle('ready', !!v);
  UI.markOptions = (i, correct) => {
    $('#opts').classList.remove('ready');
    $$('#opts .opt').forEach((el) => { const k = +el.dataset.i; if (k === correct) el.classList.add('ok'); else if (k === i) el.classList.add('no'); else el.classList.add('dim'); });
  };
  UI.dimOptions = (list) => $$('#opts .opt').forEach((el) => { if (list.indexOf(+el.dataset.i) >= 0) el.classList.add('dim'); });
  UI.scramble = () => {
    const o = $('#opts'), els = U.shuffle($$('.opt', o));
    els.forEach((el, n) => { el.classList.remove('swap'); o.appendChild(el); void el.offsetWidth; el.classList.add('swap'); $('kbd', el).textContent = n + 1; });
    EG.Audio.play('skill'); UI.toast('幻术！选项换位了');
  };
  UI.timer = (p, frozen) => {
    $('#timer-fill').style.transform = 'scaleX(' + U.clamp(p, 0, 1) + ')';
    const cls = 'timer' + (frozen ? ' frozen' : p < 0.25 ? ' low' : p < 0.5 ? ' mid' : '');
    const t = $('#timer'); if (t.className !== cls) t.className = cls;
  };
  UI.combo = (n) => {
    const el = $('#combo');
    if (n >= 2) { el.innerHTML = n + '<small>连击' + (n >= 4 ? ' · 暴击中' : '') + '</small>'; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
    else el.classList.remove('on');
  };
  UI.review = (w, title, good) => {
    const el = $('#review');
    el.innerHTML = '<div class="rv-t">' + esc(title) + '</div><div class="rv-w">' + esc(w.w) + '</div><div class="rv-m">' + (w.pos ? '<em>' + esc(w.pos) + '</em>' : '') + esc(w.m) + '</div>';
    el.className = 'review on' + (good ? ' good' : '');
  };
  UI.reviewHide = () => $('#review').classList.remove('on');

  /* ---------- 暂停 / 设置 ---------- */
  function settingsRows() {
    const st = store().settings;
    const sw = (k, name, desc) => '<div class="set-row"><div>' + name + (desc ? '<small>' + desc + '</small>' : '') + '</div><button class="switch' + (st[k] ? ' on' : '') + '" data-set="' + k + '" aria-label="' + name + '"></button></div>';
    return sw('sfx', '音效') + sw('music', '背景音乐') + sw('tts', '朗读', '读出英文单词，以及口语关里考官的提问') +
      sw('speakAuto', '口语：听完题目自动开始听', '关掉后要自己点麦克风（或按空格）才开始') +
      '<div class="set-row"><div>听力：录音语速<small>听不清时可以调慢</small></div><div class="seg" data-seg="listenRate">' + [['slow', '慢速'], ['normal', '正常']].map((x) => '<button data-v="' + x[0] + '"' + ((st.listenRate || 'normal') === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div></div>' +
      '<div class="set-row"><div>朗读声音<small>听力录音的男声、女声、旁白，以及口语关的考官和搭档</small></div><button class="btn small" data-act="voice-test">试听 / 更换</button></div>' +
      '<div class="set-row"><div>口语：语音识别口音<small>识别不准时可以换一种试试</small></div><div class="seg" data-seg="asrLang">' + [['en-US', '美式'], ['en-GB', '英式']].map((x) => '<button data-v="' + x[0] + '"' + ((st.asrLang || 'en-US') === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div></div>' +
      '<div class="set-row"><div>答题时间<small>影响每道题的倒计时长短</small></div><div class="seg" data-seg="speed">' + [['easy', '宽松'], ['normal', '标准'], ['hard', '紧张']].map((x) => '<button data-v="' + x[0] + '"' + (st.speed === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div></div>';
  }
  UI.pause = () => {
    const b = B(); if (!b.active || b.over || b.paused) return;
    b.pause(true);
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    UI.modal('<h3>暂 停</h3><div class="m-body">' + settingsRows() + '</div><div class="m-foot"><button class="btn" data-act="quit">退出关卡</button><button class="btn" data-act="retry">重新开始</button><button class="btn primary" data-act="resume">继续战斗</button></div>', { onClose: () => b.pause(false) });
  };
  UI.settings = () => {
    const st = store().settings;
    UI.modal('<h3>设 置</h3><div class="m-body">' + settingsRows() +
      '<div class="set-row"><div>解锁全部关卡<small>不按闯关顺序，任意关卡都能直接进入</small></div><button class="switch' + (st.unlockAll ? ' on' : '') + '" data-set="unlockAll"></button></div>' +
      '<div class="set-row" style="border:0"><div>重置进度<small>清空星级、图鉴和学习记录（保留导入的词库）</small></div><button class="btn small danger" data-act="reset">重置</button></div>' +
      '</div><div class="m-foot"><button class="btn primary" data-act="close">好的</button></div>');
  };

  /* ---------- 结算 ---------- */
  UI.result = (r) => {
    const b = B(), st = b.stats, sc = b.scene, li = b.li;
    if (b.task) { $('#sp-card').classList.remove('on'); $('#sp-board').classList.remove('on'); return b.task.result(r); }
    const secs = Math.round((Date.now() - st.t0) / 1000);
    const seen = new Map();
    st.log.forEach((x) => { const cur = seen.get(x.w); seen.set(x.w, cur === undefined ? x.ok : cur && x.ok); });
    const rows = Array.from(seen.entries()).sort((a, c) => (a[1] === c[1] ? 0 : a[1] ? 1 : -1)).map((e) => '<div class="word-row ' + (e[1] ? 'ok' : 'no') + '"><span class="mk">' + (e[1] ? '✓' : '✗') + '</span><b>' + esc(e[0].w) + '</b><span class="grow">' + (e[0].pos ? '<em>' + esc(e[0].pos) + '</em> ' : '') + esc(e[0].m) + '</span></div>').join('');
    const hasNext = !b.practice && r.win && li + 1 < sc.levels.length;
    const cleared = !b.practice && r.win && li + 1 >= sc.levels.length;
    const title = r.win ? (cleared ? '场 景 通 关 ！' : b.practice ? '试 炼 完 成' : '闯 关 成 功') : '挑 战 失 败';
    UI.modal('<h3>' + title + '</h3><div class="m-sub">' + (b.practice ? '错词试炼' : esc(sc.name) + ' · 第 ' + (li + 1) + ' 关 ' + esc(b.level.name)) + '</div>' +
      (r.win ? '<div class="res-stars">' + [0, 1, 2].map((i) => '<i class="' + (i < r.stars ? 'on' : '') + '">★</i>').join('') + '</div>' : '<div class="m-sub" style="margin:0">别灰心，下面是这一关遇到的单词，看一遍再来！</div>') +
      '<div class="res-grid"><div><b>' + st.score + '</b><span>得分</span></div><div><b>' + Math.round(r.acc * 100) + '%</b><span>正确率</span></div><div><b>' + st.maxCombo + '</b><span>最高连击</span></div><div><b>' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</b><span>用时</span></div></div>' +
      '<div class="m-body scroll"><div class="word-list">' + (rows || '<div class="empty">这一关还没有遇到单词</div>') + '</div></div>' +
      '<div class="m-foot"><button class="btn" data-act="quit">' + (b.practice ? '返回' : '关卡列表') + '</button><button class="btn' + (hasNext ? '' : ' primary') + '" data-act="retry">再来一次</button>' + (hasNext ? '<button class="btn primary" data-act="next">下一关 ▶</button>' : '') + '</div>', { locked: true });
    if (r.win) for (let i = 0; i < r.stars; i++) setTimeout(() => EG.Audio.play('star'), 250 + i * 250);
  };
  function leaveBattle(to) {
    const b = B(), practice = b.practice;
    b.quit(); UI.closeModal(true);
    UI.show(to || (practice ? 'book' : 'levels'));
  }

  /* ---------- 词库 ---------- */
  function buildBanks() {
    if (!UI.bankSel || !EG.Banks.map[UI.bankSel]) UI.bankSel = EG.Banks.order[0];
    $('#bank-assign').innerHTML = wordScenes().map((sc) => '<label>' + sc.icon + ' ' + esc(sc.name) + '<select data-assign="' + sc.id + '">' + bankOptions(EG.Banks.forScene(sc)) + '</select></label>').join('');
    $('#bank-list').innerHTML = EG.Banks.all().map((b) => {
      const used = wordScenes().filter((sc) => EG.Banks.forScene(sc) === b.id).map((sc) => sc.icon + sc.name).join('、');
      const mas = Math.round(EG.Banks.mastery(b.id) * 100);
      return '<button class="bank-card' + (b.id === UI.bankSel ? ' sel' : '') + '" data-bank="' + esc(b.id) + '" style="--c:' + b.color + '"><div class="bc-top"><span class="bc-name">' + esc(b.name) + '</span><span class="tag">' + (b.builtin ? '内置' : '自定义') + '</span><span class="bc-cnt">' + b.words.length + ' 词</span></div><div class="meter"><i style="width:' + mas + '%"></i></div><div class="bc-use">掌握 ' + mas + '% · ' + (used ? '用于 ' + used : '尚未分配给场景') + '</div></button>';
    }).join('');
    buildBankDetail('');
  }
  function buildBankDetail(filter) {
    const b = EG.Banks.get(UI.bankSel), rec = store().words[b.id] || {};
    const f = (filter || '').trim().toLowerCase();
    const list = f ? b.words.filter((w) => w.w.toLowerCase().indexOf(f) >= 0 || w.m.indexOf(f) >= 0) : b.words;
    const rows = list.slice(0, 400).map((w) => { const r = rec[w.w], bad = r && r[1] > 0 && r[2] < 2, ok = r && r[0] > 0 && !bad; return '<div class="word-row ' + (bad ? 'no' : ok ? 'ok' : '') + '"><span class="mk">' + (bad ? '✗' : ok ? '✓' : '·') + '</span><b>' + esc(w.w) + '</b><span class="grow">' + (w.pos ? '<em>' + esc(w.pos) + '</em> ' : '') + esc(w.m) + '</span></div>'; }).join('');
    const d = $('#bank-detail'), keep = $('#bank-search');
    if (keep && d.dataset.bank === b.id) { $('#bank-words').innerHTML = rows || '<div class="empty">没有匹配的单词</div>'; return; }
    d.dataset.bank = b.id;
    d.innerHTML = '<div class="detail-head"><h3>' + esc(b.name) + '</h3><span class="tag">' + esc(b.label || TIER_NAMES[b.tier] || '') + '</span><span class="tag">' + b.words.length + ' 词</span>' + (b.builtin ? '' : '<button class="btn small danger" data-act="del-bank">删除</button>') + '<input type="text" id="bank-search" placeholder="搜索单词或释义…"></div><div class="sub" style="color:var(--muted);font-size:13px">' + esc(b.desc) + '（单词按由易到难排列，越往后的关卡取越靠后的词）</div><div class="word-list scroll" id="bank-words" style="flex:1;min-height:120px">' + rows + '</div>';
  }
  const TEMPLATE = '# English Gate 词库模板\n# 每行一个单词：单词|词性|中文释义  （词性可省略；也可以用逗号或 Tab 分隔）\n# 请按由易到难排列：越靠后的关卡会抽取越靠后的单词。至少 8 个词。\napple|n.|苹果\nbanana|n.|香蕉\nrun|v.|跑\nbeautiful|adj.|美丽的\nquickly|adv.|迅速地\nbecause,因为\nlibrary\t图书馆\nimportant|adj.|重要的\n';
  UI.importBank = () => {
    const box = UI.modal('<h3>导 入 词 库</h3><div class="m-body">' +
      '<label class="field">词库名称<input type="text" id="imp-name" maxlength="30" placeholder="例如：七年级上册 Unit 1"></label>' +
      '<label class="field">难度等级<select id="imp-tier">' + TIER_NAMES.map((n, i) => (i ? '<option value="' + i + '"' + (i === 3 ? ' selected' : '') + '>' + i + ' · ' + n + '</option>' : '')).join('') + '</select><span class="hint">难度越高，答对时放出的法术越高级。</span></label>' +
      '<div class="field">词库内容<div style="display:flex;gap:10px;align-items:center"><button class="btn small" data-act="pick-file">选择文件…</button><span class="hint" id="imp-fname">支持 .txt / .csv / .json，或直接粘贴到下面</span></div>' +
      '<textarea id="imp-text" rows="8" spellcheck="false" placeholder="apple|n.|苹果&#10;banana,香蕉&#10;run&#9;跑"></textarea>' +
      '<span class="hint">每行一个词：<code>单词|词性|释义</code>，词性可省略，也可用逗号或 Tab 分隔。请按由易到难排列，至少 8 个词。</span></div>' +
      '<div class="hint" id="imp-preview" style="color:var(--gold)"></div></div>' +
      '<div class="m-foot"><button class="btn" data-act="close">取消</button><button class="btn primary" data-act="do-import">导入</button></div>', { wide: true });
    const ta = $('#imp-text', box);
    ta.addEventListener('input', importPreview);
  };
  function importPreview() {
    const r = EG.Banks.parseAny($('#imp-text').value), n = r.words.length;
    $('#imp-preview').textContent = n ? '识别到 ' + n + ' 个单词：' + r.words.slice(0, 6).map((w) => w.w + ' = ' + w.m).join('；') + (n > 6 ? ' …' : '') : '';
    if (r.name && !$('#imp-name').value) $('#imp-name').value = r.name;
    return r;
  }
  function doImport() {
    const r = importPreview();
    if (r.words.length < 8) { UI.toast('至少需要 8 个有效单词，当前只识别到 ' + r.words.length + ' 个'); return; }
    const name = ($('#imp-name').value || '').trim() || '我的词库 ' + (Object.keys(store().customBanks).length + 1);
    const b = EG.Banks.addCustom(name, r.words, +$('#imp-tier').value || 3);
    UI.bankSel = b.id;
    UI.closeModal(true);
    buildBanks();
    UI.toast('已导入「' + name + '」' + b.words.length + ' 个词 —— 在"场景词库分配"里选它就能用');
  }
  function showTemplate() {
    UI.modal('<h3>词 库 模 板</h3><div class="m-sub">照这个格式准备好词库，再用「导入词库」粘贴进来或选择文件</div><div class="m-body"><textarea id="tpl-text" rows="11" readonly spellcheck="false">' + esc(TEMPLATE) + '</textarea></div><div class="m-foot"><button class="btn" data-act="tpl-copy">复制</button><button class="btn" data-act="tpl-save">保存为文件</button><button class="btn primary" data-act="close">好的</button></div>', { wide: true });
  }
  function copyTemplate() {
    const sel = () => { const ta = $('#tpl-text'); if (ta) { ta.focus(); ta.select(); } UI.toast('已选中全部内容，按 Ctrl / ⌘ + C 复制'); };
    try { navigator.clipboard.writeText(TEMPLATE).then(() => UI.toast('已复制到剪贴板'), sel); } catch (e) { sel(); }
  }
  function saveTemplate() {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/plain;charset=utf-8' }));
      a.download = 'english-gate-wordbank-template.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) { /* 有些环境不允许网页保存文件 */ }
    UI.toast('如果没有开始下载，请改用「复制」');
  }
  /** 页面内的确认框（不用浏览器自带的 confirm，它在某些内嵌环境里不会弹出） */
  UI.confirm = (title, text, yes, onYes) => {
    UI._yes = onYes;
    UI.modal('<h3>' + esc(title) + '</h3><div class="m-body"><p style="text-align:center;line-height:1.8;color:#c6cdea">' + esc(text) + '</p></div><div class="m-foot"><button class="btn" data-act="close">取消</button><button class="btn danger" data-act="confirm-yes">' + esc(yes) + '</button></div>');
  };

  /* ---------- 错词本 ---------- */
  function buildBook() {
    const ms = EG.Banks.mistakes();
    $('#book-list').innerHTML = ms.length ? ms.map((x, i) => '<div class="word-row no"><span class="mk">✗</span><b>' + esc(x.word.w) + '</b><span class="grow">' + (x.word.pos ? '<em>' + esc(x.word.pos) + '</em> ' : '') + esc(x.word.m) + '</span><span class="tag">' + esc(x.bank.name) + '</span><span class="cnt">错 ' + x.wrong + ' 次</span><span class="acts"><button class="btn small" data-speak="' + esc(x.word.w) + '">🔊</button><button class="btn small" data-mastered="' + i + '">已掌握</button></span></div>').join('') : '<div class="empty">错词本是空的 🎉<br>闯关时答错的单词会自动记到这里，方便集中复习。</div>';
    UI._mistakes = ms;
  }

  /* ---------- 图鉴 ---------- */
  let bestRaf = 0;
  function bestStop() { if (bestRaf) { cancelAnimationFrame(bestRaf); bestRaf = 0; } }
  function buildBestiary() {
    const body = $('#best-body'); body.innerHTML = '';
    let total = 0, got = 0;
    EG.Scenes.forEach((sc) => {
      const sec = document.createElement('div'); sec.className = 'best-sec';
      let n = 0; const all = [];
      sc.levels.forEach((lv) => lv.mons.forEach((m) => { all.push(m); if (store().bestiary[m.id]) n++; }));
      total += all.length; got += n;
      sec.innerHTML = '<h4>' + sc.icon + ' ' + esc(sc.name) + '<small>' + n + ' / ' + all.length + '</small></h4>';
      const grid = document.createElement('div'); grid.className = 'best-grid';
      all.forEach((m) => {
        const seen = !!store().bestiary[m.id];
        const cell = document.createElement('button');
        cell.className = 'best-cell' + (seen ? ' seen' : '') + (m.boss ? ' boss' : ''); cell.style.setProperty('--c', sc.color);
        if (seen) cell.dataset.mon = m.id;
        const cv = mkCanvas(92); cell.appendChild(cv);
        const sp = document.createElement('span'); sp.textContent = seen ? m.n : '？？？'; cell.appendChild(sp);
        grid.appendChild(cell);
        drawThumb(cv, m, seen);
      });
      sec.appendChild(grid); body.appendChild(sec);
    });
    $('#best-sub').textContent = '已遇见 ' + got + ' / ' + total + ' 只 —— 点击已遇见的怪兽查看动态形象';
  }
  function showMonster(id) {
    const e = EG.monsterIndex[id]; if (!e) return;
    const m = e.def;
    const box = UI.modal('<h3>' + esc(m.n) + '</h3><div class="m-sub">' + esc(m.e) + ' · ' + e.scene.icon + esc(e.scene.name) + ' 第 ' + (e.li + 1) + ' 关</div><div class="m-body"><div class="best-view"><canvas id="bv-cv"></canvas><div class="bv-info">' +
      '<div><b>等阶</b>　' + (m.boss ? '首领 BOSS' : m.elite ? '精英' : '普通') + '</div>' +
      '<div><b>攻击</b>　' + esc(m.sp[1]) + '</div>' +
      (m.ult ? '<div><b>全屏大招</b>　' + esc(m.ult[1]) + '</div>' : '') +
      '<div><b>特性</b></div><div class="trait-list">' + (m.tr.length ? m.tr.map((t) => '<span class="trait">' + EG.TRAITS[t].n + '：' + EG.TRAITS[t].d + '</span>').join('') : '<span class="row" style="color:var(--muted)">无</span>') + '</div>' +
      '</div></div></div><div class="m-foot"><button class="btn" data-bv="cast">吟唱</button><button class="btn" data-bv="atk">攻击</button><button class="btn primary" data-act="close">关闭</button></div>', { wide: true });
    const cv = $('#bv-cv', box), d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.height = Math.round(320 * d);
    const a = { t: 0, cast: 0, atk: 0, hurt: 0, seed: 1 }; let castT = 0, last = performance.now();
    UI._bv = { cast() { castT = castT ? 0 : 1; }, atk() { a.atk = 0.001; } };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      a.t += dt; a.cast += (castT - a.cast) * Math.min(1, dt * 8);
      if (a.atk > 0) { a.atk += dt / 0.55; if (a.atk >= 1) a.atk = 0; }
      drawThumb(cv, m, true, a);
      bestRaf = requestAnimationFrame(loop);
    };
    bestStop(); bestRaf = requestAnimationFrame(loop);
  }

  /* ---------- 事件 ---------- */
  function onClick(ev) {
    const t = ev.target.closest('button, [data-go], [data-act]');
    if (!t) { if (ev.target.id === 'modal' && !UI.modalLocked) { EG.Audio.play('click'); UI.closeModal(); } return; }
    const d = t.dataset, b = B();
    if (d.sp) { EG.Audio.unlock(); return EG.Speak.act(d.sp); }
    if (d.ls) { EG.Audio.unlock(); return EG.Listen.act(d.ls, t); }
    if (t.classList.contains('opt')) { b.answer(+d.i); return; }
    if (d.skill) { b.useSkill(d.skill); return; }
    if (t.id === 'btn-ult') { if (!b.useUlt() && b.hero && b.hero.ult < 100) UI.toast('终极魔法能量还没攒满（' + Math.round(b.hero.ult) + '%）'); return; }
    EG.Audio.unlock(); EG.Audio.play('click');
    if (t.id === 'btn-pause') return UI.pause();
    if (d.go) return UI.show(d.go);
    if (d.scene) { UI.scene = EG.sceneById(d.scene); UI.li = undefined; store().lastScene = d.scene; EG.Store.save(); return UI.show('levels'); }
    if (d.level !== undefined) { UI.li = +d.level; return buildLevelInfo(); }
    if (d.bank) { UI.bankSel = d.bank; $$('.bank-card').forEach((el) => el.classList.toggle('sel', el.dataset.bank === d.bank)); return buildBankDetail(''); }
    if (d.mon) return showMonster(d.mon);
    if (d.bv) { if (UI._bv) UI._bv[d.bv](); return; }
    if (d.speak) return EG.Audio.speak(d.speak);
    if (d.mastered !== undefined) { const x = UI._mistakes[+d.mastered]; if (x) { EG.Banks.clearMistake(x.bank.id, x.word.w); buildBook(); } return; }
    if (d.set) { const st = store().settings; st[d.set] = !st[d.set]; t.classList.toggle('on', st[d.set]); EG.Store.save(); if (d.set === 'music') { if (b.active && !b.over) { EG.Audio.music(null); EG.Audio.music(st.music ? b.scene.id : null); } else EG.Audio.refreshMusic(); } if (d.set === 'unlockAll' && UI.cur === 'levels') buildLevels(); return; }
    if (d.v && t.parentElement.dataset.seg) { store().settings[t.parentElement.dataset.seg] = d.v; $$('button', t.parentElement).forEach((x) => x.classList.toggle('on', x === t)); EG.Store.save(); return; }
    switch (d.act) {
      case 'settings': return UI.settings();
      case 'close': return UI.closeModal();
      case 'resume': return UI.closeModal();
      case 'start': return UI.startLevel(UI.scene, UI.li);
      case 'retry': { const sc = b.scene, li = b.li, pr = b.practice; b.quit(); UI.closeModal(true); return pr ? UI.startPractice() : UI.startLevel(sc, li); }
      case 'next': { const sc = b.scene, li = b.li + 1; b.quit(); UI.closeModal(true); return UI.startLevel(sc, li); }
      case 'quit': return leaveBattle();
      case 'practice': return UI.startPractice();
      case 'mic-test': return EG.Speak.micTest();
      case 'voice-test': return EG.Listen.voiceTest();
      case 'voice-again': return EG.Listen._voiceAgain && EG.Listen._voiceAgain();
      case 'voice-try': return EG.Listen.voiceTry(d.role);
      case 'import': return UI.importBank();
      case 'template': return showTemplate();
      case 'tpl-copy': return copyTemplate();
      case 'tpl-save': return saveTemplate();
      case 'confirm-yes': { const f = UI._yes; UI._yes = null; UI.closeModal(true); if (f) f(); return; }
      case 'pick-file': return $('#file-input').click();
      case 'do-import': return doImport();
      case 'del-bank': { const bk = EG.Banks.get(UI.bankSel); if (bk && !bk.builtin) UI.confirm('删 除 词 库', '确定删除「' + bk.name + '」吗？用到它的场景会换回默认词库。', '删除', () => { EG.Banks.remove(bk.id); UI.bankSel = null; buildBanks(); UI.toast('已删除'); }); return; }
      case 'reset': UI.confirm('重 置 进 度', '星级、图鉴、错词本和学习记录都会清空，导入的词库会保留。确定吗？', '清空进度', () => { EG.Store.reset(); UI.toast('进度已重置'); UI.show('title'); }); return;
      default: break;
    }
  }
  function onChange(ev) {
    const t = ev.target;
    if (t.id === 'lv-bank') { EG.Banks.setForScene(UI.scene.id, t.value); UI.toast('「' + UI.scene.name + '」已改用词库：' + EG.Banks.get(t.value).name); buildLevelInfo(); }
    else if (t.dataset.assign) { EG.Banks.setForScene(t.dataset.assign, t.value); UI.toast('已分配：' + EG.sceneById(t.dataset.assign).name + ' ← ' + EG.Banks.get(t.value).name); buildBanks(); }
    else if (t.id === 'file-input') {
      const f = t.files && t.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { if (!$('#imp-text')) return; $('#imp-text').value = String(rd.result || ''); $('#imp-fname').textContent = f.name; if (!$('#imp-name').value) $('#imp-name').value = f.name.replace(/\.[^.]+$/, ''); importPreview(); };
      rd.readAsText(f); t.value = '';
    }
  }
  function onKey(ev) {
    if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) { if (ev.key === 'Escape') ev.target.blur(); return; }
    const b = B(), modalOn = $('#modal').classList.contains('on');
    if (ev.key === 'Escape') {
      if (modalOn) { if (!UI.modalLocked) UI.closeModal(); }
      else if (UI.cur === 'battle') UI.pause();
      else if (UI.cur !== 'title') UI.show(UI.cur === 'levels' ? 'map' : UI.cur === 'map' ? 'title' : 'back');
      return;
    }
    if (modalOn) { if (ev.key === 'Enter') { const p = $('#modal-box .btn.primary'); if (p) p.click(); } return; }
    if (UI.cur !== 'battle' || !b.active) { if (ev.key === 'Enter' && UI.cur === 'title') UI.show('map'); return; }
    if (ev.repeat) return;
    const k = ev.key.toLowerCase();
    if (b.listen) {
      const L = EG.Listen, n = '123'.indexOf(k) >= 0 ? '123'.indexOf(k) : 'abc'.indexOf(k);
      if (k.length === 1 && n >= 0) L.act('key', n);
      else if (k === ' ') { ev.preventDefault(); L.act('play'); }
      else if (k === 'enter') L.act(L.state === 'done' ? 'cont' : 'submit');
      else if (k === 'r') L.act('again');
      else if (k === 't') L.act('sub');
      return;
    }
    if (b.speak) {
      if (k === ' ') { ev.preventDefault(); EG.Speak.act('mic'); }
      else if (k === 'enter') EG.Speak.act(EG.Speak.state === 'self' ? 'self-ok' : 'cont');
      else if (k === 'h') EG.Speak.act('hint');
      else if (k === 'r') EG.Speak.act('replay');
      return;
    }
    if (k >= '1' && k <= '6') { const els = $$('#opts .opt'); const el = els[+k - 1]; if (el && !el.classList.contains('dim')) b.answer(+el.dataset.i); }
    else if (k === 'q') b.useSkill('hint');
    else if (k === 'w') b.useSkill('freeze');
    else if (k === 'e') b.useSkill('heal');
    else if (k === ' ' || k === 'r') { ev.preventDefault(); b.useUlt(); }
  }
  let searchTimer = null;
  function onInput(ev) { if (ev.target.id === 'bank-search') { clearTimeout(searchTimer); const v = ev.target.value; searchTimer = setTimeout(() => buildBankDetail(v), 120); } }

  UI.init = () => {
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', () => { if (document.hidden && UI.cur === 'battle') UI.pause(); });
    window.addEventListener('resize', () => { if (UI.cur === 'battle') { document.documentElement.style.setProperty('--panel-h', $('#panel').offsetHeight + 'px'); if (B().task) setTimeout(() => { S.layout(); B().task.layout(); }, 0); } });
    document.addEventListener('contextmenu', (e) => { if (UI.cur === 'battle') e.preventDefault(); });
  };
})();
