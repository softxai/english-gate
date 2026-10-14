/* English Gate · 战斗逻辑
 *
 * 流程：怪兽登场 → 吟唱（单词随魔法飞出）→ 玩家选择释义
 *        答对：玩家施法（法术随单词难度/连击升级）→ 怪兽受伤/死亡
 *        答错/超时：怪兽攻击（精英与 Boss 的大招回合会放全屏大招）→ 玩家掉血
 * 所有时序都走 FX.after，暂停时整体冻结。
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U, FX = EG.FX, S = EG.Stage, TAU = Math.PI * 2, al = U.rgba;
  const B = (EG.Battle = { active: false, paused: false, over: false, time: 0 });

  /** 玩家法术：单词越难（词库等级 + 单词长度）用到越靠后的法术 */
  const PSPELLS = [
    { n: '魔法飞弹', t: 'orb', c: ['#7cc7ff', '#e0f4ff'], k: 0.85 },
    { n: '火球术', t: 'fireball', c: ['#ff8a3d', '#ffe08a'], k: 1 },
    { n: '冰霜之枪', t: 'darts', c: ['#8fe3ff', '#ffffff'], k: 1.15 },
    { n: '雷霆一击', t: 'bolt', c: ['#ffe66d', '#ffffff'], k: 1.2 },
    { n: '风暴之刃', t: 'wave', c: ['#7dffb0', '#eafff2'], k: 1.25 },
    { n: '圣光裁决', t: 'pillar', c: ['#fff1a8', '#ffffff'], k: 1.3 },
    { n: '陨星坠落', t: 'meteor', c: ['#ff6b35', '#ffd166'], k: 1.35 },
    { n: '奥术洪流', t: 'beam', c: ['#c084fc', '#f5e1ff'], k: 1.6 },
  ];
  const SKILLS = { hint: { cost: 2, n: '洞察' }, freeze: { cost: 2, n: '时停' }, heal: { cost: 3, n: '治愈' } };
  const MANA_MAX = 6;
  B.PSPELLS = PSPELLS; B.SKILLS = SKILLS; B.MANA_MAX = MANA_MAX;

  let monSprite = null, heroSprite = null;
  const fsz = (n) => Math.round(n * U.clamp(S.s * 1.05, 0.7, 1.2));

  /* ---------- 位置 ---------- */
  B.staff = () => ({ x: S.hero.x + EG.Hero.tip.x * S.s, y: S.hero.y + EG.Hero.tip.y * S.s });
  B.heroCenter = () => ({ x: S.hero.x + 6 * S.s, y: S.hero.y - 80 * S.s });
  B.monCenter = () => { const m = B.mon, k = S.s * m.size; return { x: m.x, y: S.mon.y - (m.fly ? 132 : 96) * k }; };
  B.monMouth = () => { const m = B.mon, k = S.s * m.size; return { x: m.x - 50 * k, y: S.mon.y - (m.fly ? 134 : 106) * k }; };
  const ultCtx = () => ({ W: S.W, H: S.H, gy: S.gy, hero: { x: S.hero.x, y: S.hero.y }, mon: { x: B.mon ? B.mon.x : S.mon.x, y: S.mon.y }, k: S.s });

  /* ---------- 开始 ---------- */
  B.start = (scene, li, opt) => {
    opt = opt || {};
    FX.clear();
    if (!monSprite) { monSprite = new EG.Sprite(600, 520, 300, 430); heroSprite = new EG.Sprite(320, 320, 140, 285); }
    B.active = true; B.paused = false; B.over = false; B.time = 0;
    B.scene = scene; B.li = li; B.practice = !!opt.practice;
    B.level = opt.level || scene.levels[li];
    // 口语场景（kind: 'speak'）和听力场景（kind: 'listen'）不出单词选择题：
    // 由 EG.Speak / EG.Listen 出题和评分（B.task 指向当前用的那个模块），这里只负责血量和施法
    B.speak = scene.kind === 'speak' && !B.practice;
    B.listen = scene.kind === 'listen' && !B.practice;
    B.task = B.speak ? EG.Speak : B.listen ? EG.Listen : null;
    B.noGate = false;
    B.bankOf = opt.bankOf || null; B.requeue = [];
    if (B.task) { B.level = B.task.begin(scene, li); B.bank = null; B.pool = []; B.deck = []; }
    else {
      B.bank = opt.bank || EG.Banks.get(scene.kind ? 'G5' : EG.Banks.forScene(scene));
      B.pool = opt.words || EG.Quiz.pool(B.bank, li, scene.levels.length);
      B.deck = buildDeck();
    }
    B.mons = B.level.mons; B.mi = -1; B.mon = null;
    B.hero = { hp: 100, max: 100, mana: 2, ult: 0, poison: 0, castT: 0, flash: 0, dead: 0, a: { t: 0, cast: 0, atk: 0, hurt: 0, win: false, gem: '#7cc7ff' } };
    B.stats = { correct: 0, wrong: 0, combo: 0, maxCombo: 0, score: 0, perfect: 0, t0: Date.now(), log: [] };
    B.q = null; B.word = null;
    S.setBg(scene.id, li);
    EG.UI.battleOpen();
    S.layout();
    EG.Audio.music(B.task ? null : scene.id); // 口语关、听力关不放背景音乐：一个怕录进麦克风，一个怕盖住录音
    EG.UI.cutin({ title: B.practice ? '错词试炼' : scene.name + ' · 第 ' + (li + 1) + ' 关', sub: B.level.name + (B.task && B.level.sub ? ' · ' + B.level.sub : ''), cls: 'level', dur: 1.5 });
    FX.after(1.5, B.spawnNext);
  };

  /* 洗牌后把"答得最少的词"放到牌堆顶（pop 从末尾取）：没见过的词先出，
     这样像 PET 这种三千多词的大词库，多打几次就能把每个词都轮到，而不是总在随机重复。 */
  function buildDeck() {
    const rec = EG.Store.data.words || {};
    const seen = (w) => { const r = (rec[bankFor(w).id] || {})[w.w]; return r ? r[0] + r[1] : 0; };
    return U.shuffle(B.pool).sort((a, b) => seen(b) - seen(a));
  }
  function nextWord() {
    for (let i = 0; i < B.requeue.length; i++) B.requeue[i].n--;
    const ri = B.requeue.findIndex((r) => r.n <= 0);
    if (ri >= 0) return B.requeue.splice(ri, 1)[0].w;
    if (!B.deck.length) {
      if (B.requeue.length) return B.requeue.shift().w;
      B.deck = buildDeck();
    }
    return B.deck.pop();
  }
  const bankFor = (w) => (B.bankOf && B.bankOf.get(w)) || B.bank;

  /* ---------- 怪兽登场 ---------- */
  B.spawnNext = () => {
    if (B.over || !B.active) return;
    B.mi++;
    EG.UI.dots();
    if (B.mi >= B.mons.length) return B.win();
    const def = B.mons[B.mi], sc = B.scene, li = B.li, boss = !!def.boss, elite = !!def.elite;
    let hp = def.hp || (boss ? 5 + Math.floor(sc.tier / 2) : elite ? 2 : 1);
    if (def.tr.indexOf('armor') >= 0) hp++;
    let dmg = (7 + li * 1.2 + sc.tier * 0.4) * (boss ? 1.5 : elite ? 1.25 : 1) * (def.tr.indexOf('rage') >= 0 ? 1.25 : 1);
    if (B.practice) { hp = 1; dmg = 8; }
    const size = def.size * (S.portrait ? (boss ? 0.8 : 0.92) : 1);
    B.mon = {
      def, hp, max: hp, dmg: Math.round(dmg), size, x: S.mon.x - (boss && !S.portrait ? 20 * S.s : 0), fly: EG.Creatures.isFly(def),
      a: { t: 0, cast: 0, atk: 0, hurt: 0, seed: Math.random() * 10 }, castT: 0, enter: 0, dying: -1, flash: 0, ultStage: 0, landed: false,
    };
    if (!B.practice) { EG.Store.data.bestiary[def.id] = 1; EG.Store.save(); }
    EG.UI.monPanel();
    if (boss) {
      EG.Audio.play('boss'); FX.shake(10, 1.2); FX.flash('#000000', 0.6, 0.5);
      EG.UI.cutin({ title: def.n, sub: 'BOSS · ' + def.e, cls: 'boss', dur: 1.8 });
      FX.after(2.0, B.beginCast);
    } else {
      EG.Audio.play('appear');
      FX.after(0.8, B.beginCast);
    }
  };

  /* ---------- 怪兽吟唱 ---------- */
  B.beginCast = () => {
    if (B.over || !B.active || !B.mon || B.mon.hp <= 0) return;
    const h = B.hero, m = B.mon;
    if (h.poison > 0) { h.poison--; damageHero(4, true); if (h.hp <= 0) return; }
    let ult = false;
    if (m.def.ult && !B.practice && !B.task) {
      if (m.def.boss) {
        if (m.ultStage === 0 && m.hp <= Math.ceil(m.max / 2)) { ult = true; m.ultStage = 1; }
        else if (m.ultStage === 1 && m.hp <= 1) { ult = true; m.ultStage = 2; }
      } else if (m.ultStage === 0 && m.hp < m.max) { ult = true; m.ultStage = 1; }
    }
    if (ult) {
      m.castT = 1;
      EG.Audio.play('warn'); FX.shake(6, 0.9);
      EG.UI.cutin({ title: m.def.ult[1], sub: '⚠ ' + m.def.n + ' 正在咏唱大招 —— 答对即可打断！', cls: 'danger', dur: 1.6 });
      FX.after(1.6, () => ask(true));
    } else ask(false);
  };

  function ask(isUlt) {
    if (B.over || !B.active || !B.mon) return;
    if (B.task) return B.task.ask();
    const m = B.mon, tr = m.def.tr, word = nextWord(), bank = bankFor(word);
    const reverse = tr.indexOf('reverse') >= 0, multi = tr.indexOf('multi') >= 0;
    const q = EG.Quiz.make(word, bank, { type: reverse ? 'zh2en' : 'en2zh', n: multi ? 6 : 4 });
    let T = { easy: 24, normal: 17, hard: 12 }[EG.Store.data.settings.speed] || 17;
    T -= B.li * 1.1;
    if (m.def.elite) T -= 1; if (m.def.boss) T -= 1;
    if (tr.indexOf('haste') >= 0) T *= 0.72;
    if (isUlt) T *= 0.78;
    if (multi) T += 2.5; if (reverse) T += 1.5;
    if (B.practice) T = Math.max(T, 14);
    T = Math.max(5.5, T);
    Object.assign(q, { tMax: T, t: T, started: false, done: false, frozen: 0, ult: isUlt, bank, scr: false, tick: 99, hinted: false });
    B.q = q; m.castT = 1;
    B.word = { text: q.prompt, chars: Array.from(q.prompt), zh: q.type === 'zh2en', col: m.def.sp[2], ult: isUlt, t: 0, t2: 0, state: 'in', fade: 1, widths: null };
    EG.UI.showQuestion(q);
    EG.Audio.play('word');
    FX.after(0.62, () => {
      if (B.q !== q || q.done) return;
      q.started = true;
      EG.UI.enableOptions(true);
      if (q.type === 'en2zh') EG.Audio.speak(word.w);
    });
  }

  /* ---------- 作答 ---------- */
  B.answer = (i) => {
    const q = B.q;
    if (!q || q.task || q.done || !q.started || B.paused || B.over) return;
    q.done = true;
    const ok = i >= 0 && q.options[i] && q.options[i].ok;
    B.mon.castT = 0;
    EG.UI.markOptions(i, q.options.findIndex((o) => o.ok));
    EG.Banks.record(q.bank.id, q.word, ok);
    B.stats.log.push({ w: q.word, ok });
    if (ok) onCorrect(q); else onWrong(q, i < 0);
  };

  function spellFor(q) {
    const len = q.word.w.replace(/[^a-z]/gi, '').length;
    const lenS = len <= 4 ? 0 : len <= 6 ? 1 : len <= 9 ? 2 : 3;
    return PSPELLS[U.clamp(Math.round(((q.bank.tier || 3) - 1) * 0.9 + lenS), 0, PSPELLS.length - 1)];
  }

  function onCorrect(q) {
    const st = B.stats, h = B.hero, s = S.s;
    st.correct++; st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo);
    const fast = q.t / q.tMax > 0.62;
    if (fast) st.perfect++;
    st.score += Math.round(100 * B.scene.tier * (1 + (q.t / q.tMax) * 0.5) * (1 + Math.min(10, st.combo) * 0.1));
    h.mana = Math.min(MANA_MAX, h.mana + 1);
    h.ult = Math.min(100, h.ult + (fast ? 22 : 15) + Math.min(8, st.combo));
    EG.Audio.play(fast ? 'perfect' : 'correct');
    if (st.combo >= 2) EG.Audio.play('combo', st.combo);
    // 单词化作光点被法杖吸收
    if (B.word) {
      B.word.state = 'ok'; B.word.t2 = 0; B.word.fade = 1;
      const tip = B.staff();
      for (let i = 0; i < 18; i++) { const x = S.word.x + U.rand(-80, 80) * s, y = S.word.y + U.rand(-16, 16) * s, d = U.rand(0.28, 0.42); FX.emit(1, { x, y, vx: (tip.x - x) / d, vy: (tip.y - y) / d, life: [d, d], size: [5 * s, 11 * s], col: [B.word.col, '#ffffff'], end: 0.6 }); }
    }
    FX.text(S.word.x, S.word.y - 64 * s, fast ? '完美！' : '正确！', { col: fast ? '#ffe066' : '#7dffb0', size: fsz(30) });
    EG.UI.hud(); EG.UI.combo(st.combo);
    const spell = spellFor(q), crit = st.combo >= 4, dmg = 1 + (crit ? 1 : 0) + (q.ult ? 1 : 0);
    if (q.ult) EG.UI.cutin({ title: '打断成功！', sub: '反击 · ' + spell.n, cls: 'good', dur: 0.9 });
    heroCast(spell, crit, dmg);
  }

  /** 主角举杖施法 → 法术飞向怪兽 → 结算伤害 */
  function heroCast(spell, crit, dmg, then) {
    const h = B.hero, s = S.s;
    h.castT = 1; h.a.gem = spell.c[0];
    FX.after(0.3, () => {
      if (B.over || !B.mon) return;
      h.a.atk = 0.001; h.castT = 0;
      FX.after(0.16, () => {
        if (B.over || !B.mon) return;
        const from = B.staff(), to = B.monCenter();
        FX.text(from.x + 40 * s, from.y - 34 * s, spell.n + (crit ? ' · 暴击' : ''), { col: spell.c[0], size: fsz(20), dur: 0.9, rise: 34 });
        EG.Spells.cast(spell.t, from, to, spell.c, { k: s * spell.k * (crit ? 1.25 : 1), gy: S.gy }, () => damageMon(dmg, crit, 0.75, then));
      });
    });
  }
  /** 下一步（下一题 / 下一只怪兽）：口语关、听力关要等玩家看完反馈再继续 */
  const go = (delay, fn) => (B.task && !B.noGate ? B.task.gate(delay, fn) : FX.after(delay, fn));

  /** then：打完以后由调用方决定接下来做什么（听力关一段录音可能既有答对的也有答错的） */
  function damageMon(d, crit, delay, then) {
    const m = B.mon;
    if (!m || m.hp <= 0 || !B.active) return;
    m.hp = Math.max(0, m.hp - d); m.a.hurt = 1; m.flash = 1;
    EG.Audio.play('hit'); FX.shake(crit ? 10 : 6, 0.25);
    const c = B.monCenter();
    FX.text(c.x, c.y - 70 * S.s * m.size, (crit ? '暴击 ' : '') + '-' + d, { col: crit ? '#ffe066' : '#ffffff', size: fsz(crit ? 40 : 32) });
    EG.UI.monHp();
    if (then) return FX.after(delay, then);
    if (m.hp <= 0) kill(delay);
    else go(delay, B.beginCast);
  }

  function kill(delay) {
    const m = B.mon, c = B.monCenter(), k = S.s * m.size, boss = !!m.def.boss;
    m.dying = 0; m.castT = 0;
    EG.Audio.play('death');
    B.stats.score += (boss ? 2000 : m.def.elite ? 500 : 200) * B.scene.tier;
    FX.emit(boss ? 80 : 34, { x: c.x, y: c.y, rx: 50 * k, ry: 60 * k, sp: [60, 420 * S.s], life: [0.5, 1.2], size: [6 * k, 16 * k], col: m.def.c, drag: 0.93 });
    FX.ring(c.x, c.y, 20 * k, 200 * k, m.def.c[2], 0.5, 8 * k);
    if (boss) {
      FX.flash('#ffffff', 0.6, 0.85); FX.shake(22, 1.1);
      for (let i = 1; i <= 5; i++) FX.after(i * 0.16, () => { EG.Spells._explode({ x: c.x + U.rand(-90, 90) * k, y: c.y + U.rand(-90, 70) * k }, [m.def.c[2], '#ffffff'], S.s * 1.3); EG.Audio.play('fire'); });
    }
    EG.UI.hud();
    go(Math.max(delay, boss ? 1.7 : 0.95), B.spawnNext);
  }

  function onWrong(q, timeout) {
    const st = B.stats, h = B.hero, m = B.mon, s = S.s;
    st.wrong++; st.combo = 0;
    EG.UI.combo(0);
    EG.Audio.play('wrong');
    if (B.word) { B.word.state = 'bad'; B.word.t2 = 0; B.word.fade = 1; }
    B.requeue.push({ w: q.word, n: 3 });
    EG.UI.review(q.word, timeout ? '时间到！' : '答错了', false);
    if (m.def.tr.indexOf('drain') >= 0 && m.hp < m.max) {
      m.hp++; EG.UI.monHp();
      const c = B.monCenter(); FX.text(c.x, c.y - 70 * s * m.size, '吸血 +1', { col: '#ff7a9a', size: fsz(24) });
    }
    monAttack(q.ult);
  }

  /** 怪兽攻击（isUlt：全屏大招；dmg：指定伤害，不给就用怪兽自己的攻击力），打完进入下一题或判负；给了 then 就交给调用方 */
  function monAttack(isUlt, dmg, then) {
    const h = B.hero, m = B.mon, s = S.s;
    const next = () => {
      EG.UI.reviewHide();
      if (B.over || !B.active) return;
      if (h.hp <= 0) B.lose(); else B.beginCast();
    };
    FX.after(0.35, () => {
      if (B.over || !B.active) return;
      m.a.atk = 0.001;
      const pal = [m.def.sp[2], m.def.sp[3]];
      if (isUlt) {
        EG.UI.cutin({ title: m.def.ult[1], sub: m.def.n + ' · 大招', cls: 'danger', dur: 1.1 });
        const o = ultCtx(); o.col = pal;
        EG.Ult.play(m.def.ult[0], o, () => damageHero(dmg === undefined ? Math.round(m.dmg * 1.5) : dmg), () => (h.hp <= 0 ? next() : go(0, next)));
      } else {
        const c = B.monCenter();
        FX.text(c.x, c.y - 90 * s * m.size, m.def.sp[1], { col: pal[0], size: fsz(22), dur: 1, rise: 30 });
        FX.after(0.2, () => {
          if (B.over || !B.active) return;
          EG.Spells.cast(m.def.sp[0], B.monMouth(), B.heroCenter(), pal, { k: s * (m.def.boss ? 1.3 : m.def.elite ? 1.12 : 1), gy: S.gy, fire: m.def.fire }, () => {
            damageHero(dmg === undefined ? m.dmg : dmg);
            if (m.def.tr.indexOf('venom') >= 0 && h.hp > 0) { h.poison = 3; const hc = B.heroCenter(); FX.text(hc.x, hc.y - 110 * s, '中毒', { col: '#b6ff3a', size: fsz(22) }); }
            if (h.hp <= 0) FX.after(1.25, next); else if (then) FX.after(0.9, then); else go(1.25, next);
          });
        });
      }
    });
  }

  /* ---------- 口语关：EG.Speak 评完分后调用 ---------- */
  /** r: { pass 是否过关, total 0–100, grade 0–3, mock 是否模考 } */
  B.speakResult = (r) => {
    const q = B.q, st = B.stats, h = B.hero, m = B.mon, s = S.s;
    if (!q || !q.task || q.judged || B.over || !m) return;
    q.judged = true; q.done = true; m.castT = 0;
    if (r.pass) {
      st.correct++; st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo);
      if (r.grade >= 3) st.perfect++;
      st.score += Math.round(r.total * 5 * B.scene.tier * (1 + Math.min(10, st.combo) * 0.1));
      h.mana = Math.min(MANA_MAX, h.mana + 1);
      EG.Audio.play(r.grade >= 3 ? 'perfect' : 'correct');
      if (st.combo >= 2) EG.Audio.play('combo', st.combo);
      FX.text(S.word.x, S.word.y - 64 * s, ['', '过关！', '很好！', '完美！'][r.grade] + ' ' + r.total, { col: r.grade >= 3 ? '#ffe066' : '#7dffb0', size: fsz(30) });
      EG.UI.hud(); EG.UI.combo(st.combo);
      // 说得越好，法术越强
      heroCast(PSPELLS[r.grade >= 3 ? 7 : r.grade === 2 ? 4 : 1], r.grade >= 3, 1);
    } else {
      st.wrong++; st.combo = 0;
      EG.UI.combo(0); EG.Audio.play('wrong');
      // 模考里答得不好也要把试考完：考官的反击只是象征性的，不会把人打倒
      monAttack(false, r.mock ? Math.max(0, Math.min(6, h.hp - 1)) : undefined);
    }
  };
  /* ---------- 听力关：EG.Listen 判完一段录音后调用 ---------- */
  /** r: { hits 答对几题, misses 答错几题, grade 0–3, keep 答错后怪兽是否留下换一段录音, mock 是否模考 } */
  B.listenResult = (r) => {
    const q = B.q, st = B.stats, h = B.hero, m = B.mon, s = S.s;
    if (!q || !q.task || q.judged || B.over || !m) return;
    q.judged = true; q.done = true; m.castT = 0;
    st.correct += r.hits; st.wrong += r.misses;
    st.combo = r.misses ? 0 : st.combo + r.hits; st.maxCombo = Math.max(st.maxCombo, st.combo);
    if (r.hits && !r.misses && r.grade >= 3) st.perfect++;
    st.score += Math.round(r.hits * 120 * B.scene.tier * (r.grade >= 3 ? 1.5 : 1) * (1 + Math.min(10, st.combo) * 0.1));
    if (r.hits) h.mana = Math.min(MANA_MAX, h.mana + 1);
    EG.UI.hud(); EG.UI.combo(st.combo);
    // 这段录音结束后：怪兽没血了就倒下；还有血——单题录音换一段再来（keep），多题录音的怪兽带着没被听出来的部分退场
    const finish = () => {
      if (B.over || !B.mon) return;
      if (m.hp <= 0) return kill(0.2);
      if (r.keep) return go(0.3, B.beginCast);
      flee();
    };
    const attack = () => {
      if (B.over || !B.mon) return;
      if (!r.misses) return finish();
      EG.Audio.play('wrong');
      // 每错一题掉 15 点血：一关里错到第 7 题就失败（正确率大约要过半）；模考里只是象征性的，保证能把试考完
      monAttack(false, r.mock ? Math.max(0, Math.min(3 * r.misses, h.hp - 1)) : 15 * r.misses, finish);
    };
    if (r.hits) {
      EG.Audio.play(r.grade >= 3 ? 'perfect' : 'correct');
      FX.text(S.word.x, S.word.y - 64 * s, r.misses ? '答对 ' + r.hits + ' 题' : r.grade >= 3 ? '一遍听懂！' : '全对！', { col: r.grade >= 3 ? '#ffe066' : '#7dffb0', size: fsz(30) });
      const ratio = r.hits / (r.hits + r.misses);
      heroCast(PSPELLS[r.grade >= 3 ? 7 : ratio >= 1 ? 5 : ratio >= 0.6 ? 3 : 1], r.grade >= 3, r.hits, attack);
    } else attack();
  };
  /** 多题录音答错了一部分：怪兽不死，但这段录音已经放完，它退场，换下一只 */
  function flee() {
    const m = B.mon, c = B.monCenter();
    m.dying = 0; m.castT = 0;
    FX.text(c.x, c.y - 90 * S.s * m.size, '带着没被听出来的部分溜走了', { col: '#c6cdea', size: fsz(20), dur: 1.4, rise: 30 });
    go(0.9, B.spawnNext);
  }

  /** 模考的结局：通过 → 终极魔法击败考官；没通过 → 考官的"最终裁决" */
  B.finale = (pass) => {
    const h = B.hero, m = B.mon;
    if (B.over || !m) return;
    B.q = null;
    if (pass) {
      EG.UI.cutin({ title: '考 试 通 过', sub: '星界爆裂 · 终极魔法', cls: 'ult', dur: 1.2 });
      h.castT = 1; h.a.gem = '#ffe066';
      FX.after(0.7, () => {
        if (B.over || !B.mon) return;
        h.a.atk = 0.001; h.castT = 0;
        const o = ultCtx(); o.from = B.staff();
        EG.Ult.play('starburst', o, () => { B.noGate = true; damageMon(m.hp, true, 1.3); });
      });
    } else {
      EG.Audio.play('warn'); m.castT = 1;
      EG.UI.cutin({ title: m.def.ult[1], sub: '这次还没通过 —— 看看成绩单，再来一次', cls: 'danger', dur: 1.5 });
      FX.after(1.5, () => {
        if (B.over || !B.mon) return;
        m.castT = 0; m.a.atk = 0.001;
        const o = ultCtx(); o.col = [m.def.sp[2], m.def.sp[3]];
        EG.Ult.play(m.def.ult[0], o, () => damageHero(h.hp), () => B.lose());
      });
    }
  };

  function damageHero(d, poison) {
    const h = B.hero;
    if (B.over || !B.active) return;
    h.hp = Math.max(0, h.hp - d); h.a.hurt = 1; h.flash = 1;
    EG.Audio.play('hurt');
    if (!poison) { FX.shake(12, 0.35); FX.flash('#ff2e4d', 0.25, 0.28); }
    const c = B.heroCenter();
    FX.text(c.x, c.y - 76 * S.s, '-' + d, { col: poison ? '#b6ff3a' : '#ff5470', size: fsz(34) });
    FX.emit(12, { x: c.x, y: c.y, sp: [60, 260], life: [0.3, 0.6], size: [4, 9], col: poison ? '#b6ff3a' : '#ff5470' });
    EG.UI.hud();
    if (h.hp <= 0 && poison) B.lose();
  }

  /* ---------- 技能 ---------- */
  B.useSkill = (id) => {
    const q = B.q, h = B.hero, sk = SKILLS[id];
    if (!sk || B.over || B.paused || !B.active || B.task) return false;
    if (h.mana < sk.cost) { EG.UI.toast('魔力不足（需要 ' + sk.cost + ' 点）'); return false; }
    if (id === 'heal') {
      if (h.hp >= h.max && !h.poison) { EG.UI.toast('生命已满'); return false; }
      h.hp = Math.min(h.max, h.hp + 30); h.poison = 0;
      EG.Audio.play('heal');
      const c = B.heroCenter();
      FX.text(c.x, c.y - 76 * S.s, '+30', { col: '#7dffb0', size: fsz(32) });
      FX.emit(26, { x: c.x, y: S.hero.y, rx: 40 * S.s, ang: -Math.PI / 2, spread: 0.3, sp: [60, 220], life: [0.5, 1], size: [5, 12], col: ['#7dffb0', '#ffffff'], shape: 'star' });
    } else {
      if (!q || !q.started || q.done) return false;
      if (id === 'hint') {
        if (q.hinted) { EG.UI.toast('这一题已经用过洞察'); return false; }
        q.hinted = true;
        const wrong = U.shuffle(q.options.map((o, i) => (o.ok ? -1 : i)).filter((i) => i >= 0));
        EG.UI.dimOptions(wrong.slice(0, Math.ceil(wrong.length * 0.6)));
        EG.Audio.play('skill');
      } else if (id === 'freeze') {
        q.frozen = 6; EG.Audio.play('freeze'); FX.flash('#7df9ff', 0.35, 0.25);
      }
    }
    h.mana -= sk.cost;
    EG.UI.hud();
    return true;
  };

  /** 终极魔法：能量满时可用，直接重创怪兽（并揭示答案，这个词稍后会再出现） */
  B.useUlt = () => {
    const q = B.q, h = B.hero, m = B.mon;
    if (B.over || B.paused || !B.active || B.task || h.ult < 100 || !q || !q.started || q.done || !m) return false;
    q.done = true; h.ult = 0; m.castT = 0;
    EG.UI.markOptions(-2, q.options.findIndex((o) => o.ok));
    B.requeue.push({ w: q.word, n: 4 });
    EG.UI.review(q.word, '终极魔法 · 记住这个词', true);
    if (B.word) { B.word.state = 'ok'; B.word.t2 = 0; }
    EG.UI.cutin({ title: '星界爆裂', sub: '终 极 魔 法', cls: 'ult', dur: 1.0 });
    h.castT = 1; h.a.gem = '#ffe066';
    EG.UI.hud();
    FX.after(0.5, () => {
      if (B.over || !B.mon) return;
      h.a.atk = 0.001; h.castT = 0;
      const o = ultCtx(); o.from = B.staff();
      EG.Ult.play('starburst', o, () => damageMon(3, true, 1.3), () => EG.UI.reviewHide());
    });
    return true;
  };

  /* ---------- 结束 ---------- */
  B.win = () => {
    if (B.over) return;
    B.over = true; B.q = null;
    const st = B.stats, h = B.hero, total = st.correct + st.wrong;
    const acc = total ? st.correct / total : 1;
    const stars = B.task ? B.task.stars().stars : 1 + (acc >= 0.75 ? 1 : 0) + (acc >= 0.9 && h.hp >= 50 ? 1 : 0);
    st.score += h.hp * 10 * B.scene.tier;
    h.a.win = true;
    EG.Audio.music(null); EG.Audio.play('win');
    let unlocked = false;
    if (!B.practice) {
      const P = (EG.Store.data.progress[B.scene.id] = EG.Store.data.progress[B.scene.id] || { stars: [], best: [] });
      unlocked = !P.stars[B.li];
      P.stars[B.li] = Math.max(P.stars[B.li] || 0, stars);
      P.best[B.li] = Math.max(P.best[B.li] || 0, st.score);
      EG.Store.data.lastScene = B.scene.id;
      EG.Store.save();
    }
    for (let i = 0; i < 6; i++) FX.after(i * 0.2, () => FX.emit(26, { x: U.rand(0.15, 0.85) * S.W, y: U.rand(0.15, 0.5) * S.H, sp: [80, 420], life: [0.6, 1.3], size: [5, 13], col: ['#ffe066', '#7dffb0', '#7cc7ff', '#ff8fc7', '#ffffff'], shape: 'star', g: 240, drag: 0.95 }));
    FX.after(1.5, () => EG.UI.result({ win: true, stars, acc, unlocked }));
  };
  B.lose = () => {
    if (B.over) return;
    B.over = true; B.q = null;
    B.hero.dead = 0.001;
    if (B.mon) B.mon.castT = 0;
    EG.UI.reviewHide();
    EG.Audio.music(null); EG.Audio.play('lose');
    const st = B.stats, total = st.correct + st.wrong;
    FX.after(1.6, () => EG.UI.result({ win: false, stars: 0, acc: total ? st.correct / total : 0 }));
  };
  B.pause = (v) => { if (!B.active || B.over) return; B.paused = v; if (B.task) B.task.onPause(v); };
  B.quit = () => { if (B.task) B.task.stop(); B.active = false; B.over = true; B.q = null; B.word = null; B.mon = null; FX.clear(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } };

  /* ---------- 每帧更新 ---------- */
  B.update = (dt) => {
    B.time += dt;
    const h = B.hero, m = B.mon, s = S.s;
    h.a.t += dt;
    h.a.cast += (h.castT - h.a.cast) * Math.min(1, dt * 10);
    if (h.a.atk > 0) { h.a.atk += dt / 0.45; if (h.a.atk >= 1) h.a.atk = 0; }
    h.a.hurt = Math.max(0, h.a.hurt - dt / 0.4);
    h.flash = Math.max(0, h.flash - dt / 0.25);
    if (h.dead > 0) h.dead = Math.min(1, h.dead + dt / 0.8);
    if (h.a.cast > 0.4 && Math.random() < 0.6) { const tip = B.staff(); FX.emit(1, { x: tip.x, y: tip.y, sp: [20, 90], life: [0.2, 0.5], size: [3 * s, 8 * s], col: [h.a.gem, '#ffffff'] }); }
    if (m) {
      m.a.t += dt;
      m.a.cast += (m.castT - m.a.cast) * Math.min(1, dt * 8);
      if (m.a.atk > 0) { m.a.atk += dt / 0.55; if (m.a.atk >= 1) m.a.atk = 0; }
      m.a.hurt = Math.max(0, m.a.hurt - dt / 0.35);
      m.flash = Math.max(0, m.flash - dt / 0.22);
      if (m.enter < 1) {
        m.enter = Math.min(1, m.enter + dt / 0.6);
        if (m.enter >= 1 && !m.landed) { m.landed = true; if (!m.fly) { FX.emit(14, { x: m.x, y: S.gy, rx: 60 * s * m.size, ang: -Math.PI / 2, spread: 1.2, sp: [30, 140], life: [0.4, 0.8], size: [10 * s, 20 * s], end: 1.8, col: '#c9bfae', shape: 'smoke', add: false }); FX.shake(m.def.boss ? 12 : 4, 0.25); } }
      }
      const k = s * m.size;
      if (m.dying >= 0) {
        m.dying = Math.min(1, m.dying + dt / 0.75);
        if (m.dying < 0.9) FX.emit(3, { x: m.x, y: S.mon.y - 100 * k, rx: 70 * k, ry: 90 * k, vy: -120 * s, sp: [0, 60], life: [0.4, 0.9], size: [5 * k, 12 * k], col: m.def.c });
      } else if (m.a.cast > 0.3 && Math.random() < 0.7) {
        FX.emit(1, { x: m.x, y: S.gy, rx: 90 * k, vy: -U.rand(60, 200) * s, life: [0.5, 1], size: [3 * s, 8 * s], col: [m.def.sp[2], m.def.sp[3] || '#ffffff'], layer: 'back' });
      }
    }
    const q = B.q;
    if (B.task) B.task.update(dt);
    if (q && q.started && !q.done) {
      if (q.frozen > 0) q.frozen -= dt; else q.t -= dt;
      EG.UI.timer(q.t / q.tMax, q.frozen > 0);
      if (!q.task && q.t < 3.4 && Math.ceil(q.t) !== q.tick) { q.tick = Math.ceil(q.t); EG.Audio.play('tick'); }
      if (m && !q.scr && m.def.tr.indexOf('scramble') >= 0 && q.t < q.tMax * 0.6) { q.scr = true; EG.UI.scramble(); }
      if (m && B.word && m.def.tr.indexOf('fade') >= 0 && q.tMax - q.t > 2.2) B.word.fade = Math.max(0, B.word.fade - dt * 1.6);
      if (q.t <= 0) { if (q.task) B.task.timeUp(); else B.answer(-1); }
    }
    const w = B.word;
    if (w) {
      w.t += dt;
      if (w.state === 'in' && w.t > 0.75) w.state = 'hold';
      if (w.state === 'in' && m) { const o = B.monMouth(), e = Math.min(1, w.t / 0.5); FX.emit(1, { x: U.lerp(o.x, S.word.x, e) + U.rand(-30, 30) * s, y: U.lerp(o.y, S.word.y, e) + U.rand(-14, 14) * s, sp: [0, 40], life: [0.25, 0.5], size: [3 * s, 9 * s], col: [w.col, '#ffffff'] }); }
      if (w.state === 'ok' || w.state === 'bad') { w.t2 += dt; if (w.t2 > 0.7) B.word = null; }
    }
  };

  /* ---------- 绘制 ---------- */
  function magicCircle(c, x, y, r, col, a, t) {
    c.save(); c.translate(x, y); c.scale(1, 0.28); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a);
    c.drawImage(FX.glow(col), -r * 1.4, -r * 1.4, r * 2.8, r * 2.8);
    c.rotate(t * 1.2); c.strokeStyle = col; c.lineWidth = 3;
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, r * 0.8, 0, TAU); c.stroke();
    for (let j = 0; j < 2; j++) { c.beginPath(); for (let i = 0; i <= 3; i++) { const an = (i / 3) * TAU + j * Math.PI; i ? c.lineTo(Math.cos(an) * r * 0.8, Math.sin(an) * r * 0.8) : c.moveTo(Math.cos(an) * r * 0.8, Math.sin(an) * r * 0.8); } c.stroke(); }
    c.restore();
  }

  function drawHero(c) {
    const h = B.hero, s = S.s, L = h.a.atk > 0 ? Math.sin(Math.PI * h.a.atk) : 0;
    const x = S.hero.x - h.a.hurt * 16 * s + L * 10 * s;
    let y = S.hero.y, rot = 0, alpha = 1;
    if (h.dead > 0) { const e = U.ease.outCubic(h.dead); rot = -e * 1.45; y -= Math.sin(h.dead * Math.PI) * 20 * s; alpha = 1 - h.dead * 0.25; }
    c.fillStyle = 'rgba(0,0,0,.34)'; c.beginPath(); c.ellipse(S.hero.x, S.gy + 5 * s, 50 * s, 10 * s, 0, 0, TAU); c.fill();
    heroSprite.render(s, (cc) => EG.Hero.draw(cc, h.a), h.flash * 0.75, '#ff6b81');
    heroSprite.blit(c, x, y, s, alpha, undefined, undefined, rot);
  }

  function drawMon(c) {
    const m = B.mon; if (!m) return;
    const s = S.s, k = s * m.size, L = m.a.atk > 0 ? Math.sin(Math.PI * Math.min(1, m.a.atk)) : 0;
    const e = U.ease.outCubic(m.enter);
    const x = m.x + (1 - e) * Math.min(S.W * 0.4, 420 * s) - L * 48 * s + m.a.hurt * 16 * s;
    let y = S.mon.y - (m.fly ? (1 - e) * 110 * s : 0), alpha = Math.min(1, m.enter * 1.8), sx = 1, sy = 1;
    if (m.enter > 0.82 && m.enter < 1 && !m.fly) { const ld = Math.sin(((m.enter - 0.82) / 0.18) * Math.PI); sy = 1 - ld * 0.07; sx = 1 + ld * 0.05; }
    if (m.dying >= 0) { alpha *= 1 - m.dying; sx *= 1 + m.dying * 0.28; sy *= 1 + m.dying * 0.28; y -= m.dying * 36 * s; }
    c.fillStyle = 'rgba(0,0,0,' + 0.34 * alpha + ')'; c.beginPath(); c.ellipse(x, S.gy + 5 * s, (m.fly ? 56 : 88) * k, (m.fly ? 9 : 13) * k, 0, 0, TAU); c.fill();
    monSprite.render(k, (cc) => EG.Creatures.draw(cc, m.def, m.a), Math.max(m.flash, m.dying >= 0 ? 0.55 : 0), '#ffffff');
    monSprite.blit(c, x, y, k, alpha, sx, sy);
  }

  function drawWord(c) {
    const w = B.word; if (!w) return;
    const s = S.s, q = B.q, n = w.chars.length;
    const font = (sz) => (w.zh ? '800 ' : '700 ') + sz + 'px ' + (w.zh ? '"ZCOOL XiaoWei","PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif' : '"Fredoka","Trebuchet MS","Segoe UI","Helvetica Neue",sans-serif');
    if (!w.widths || w.W !== S.W || w.H !== S.H) {
      let size = Math.round((w.zh ? 42 : 54) * U.clamp(s * 1.05, 0.62, 1.2));
      const maxW = S.W * (S.portrait ? 0.84 : 0.46);
      c.font = font(size);
      let total = 0; w.chars.forEach((ch) => { total += c.measureText(ch).width + size * 0.03; });
      if (total > maxW) { size = Math.max(16, Math.floor((size * maxW) / total)); c.font = font(size); }
      w.size = size; w.widths = w.chars.map((ch) => c.measureText(ch).width + size * 0.03);
      w.total = w.widths.reduce((a, b) => a + b, 0); w.W = S.W; w.H = S.H;
    }
    const cx = S.word.x, cy = S.word.y, rx = Math.max(w.total / 2 + 44 * s, 104 * s), ry = Math.max(44 * s, w.size * 0.92);
    const out = w.state === 'ok' || w.state === 'bad' ? Math.max(0, 1 - w.t2 / 0.5) : 1;
    const a = Math.min(1, w.t / 0.3) * out;
    const col = w.state === 'bad' ? '#ff2e4d' : w.col;
    // 底衬
    c.save(); c.translate(cx, cy); c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx * 1.25); g.addColorStop(0, 'rgba(8,6,26,' + 0.8 * a + ')'); g.addColorStop(0.7, 'rgba(8,6,26,' + 0.55 * a + ')'); g.addColorStop(1, 'rgba(8,6,26,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx * 1.25, 0, TAU); c.fill(); c.restore();
    // 符文环
    c.save(); c.translate(cx, cy); c.globalCompositeOperation = 'lighter';
    c.strokeStyle = al(col, 0.5 * a); c.lineWidth = 2 * s; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.stroke();
    c.setLineDash([10 * s, 13 * s]); c.lineDashOffset = -B.time * 34; c.strokeStyle = al(col, 0.85 * a); c.lineWidth = 3.5 * s;
    c.beginPath(); c.ellipse(0, 0, rx + 8 * s, ry + 8 * s, 0, 0, TAU); c.stroke(); c.setLineDash([]);
    for (let i = 0; i < 6; i++) { const an = B.time * 0.9 + (i / 6) * TAU, x = Math.cos(an) * (rx + 8 * s), y = Math.sin(an) * (ry + 8 * s); c.globalAlpha = a; c.drawImage(FX.glow(col), x - 12 * s, y - 12 * s, 24 * s, 24 * s); }
    c.globalAlpha = 1;
    if (q && q.started && !q.done) {
      const p = U.clamp(q.t / q.tMax, 0, 1), tc = q.frozen > 0 ? '#7df9ff' : p > 0.5 ? '#7dffb0' : p > 0.25 ? '#ffd166' : '#ff5470';
      c.strokeStyle = al(tc, 0.25); c.lineWidth = 6 * s; c.beginPath(); c.ellipse(0, 0, rx + 20 * s, ry + 20 * s, 0, 0, TAU); c.stroke();
      c.strokeStyle = tc; c.lineCap = 'round'; c.beginPath(); c.ellipse(0, 0, rx + 20 * s, ry + 20 * s, 0, -Math.PI / 2, -Math.PI / 2 + TAU * p); c.stroke();
    }
    if (w.ult) { c.strokeStyle = al('#ff2e4d', (0.5 + 0.5 * Math.sin(B.time * 12)) * a); c.lineWidth = 3 * s; c.beginPath(); c.ellipse(0, 0, rx + 32 * s, ry + 32 * s, 0, 0, TAU); c.stroke(); }
    c.restore();
    // 字母
    const origin = B.mon ? B.monMouth() : { x: cx, y: cy };
    const step = Math.min(0.045, 0.42 / n), low = q && q.started && !q.done && q.frozen <= 0 && q.t / q.tMax < 0.25;
    let x = cx - w.total / 2;
    c.font = font(w.size); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      const wd = w.widths[i], tx = x + wd / 2; x += wd;
      const p = U.clamp((w.t - i * step) / 0.42, 0, 1), e = U.ease.outCubic(p);
      let px = U.lerp(origin.x, tx, e), py = U.lerp(origin.y, cy, e) - Math.sin(Math.PI * e) * 46 * s;
      let sc = 0.3 + 0.7 * U.ease.outBack(p), alpha = p * w.fade, fill = '#ffffff', gc = w.col;
      if (w.state === 'hold') py += Math.sin(B.time * 2.6 + i * 0.6) * 2.5 * s;
      if (w.state === 'ok') { sc *= 1 + w.t2 * 1.4; alpha *= Math.max(0, 1 - w.t2 / 0.3); fill = '#eafff2'; }
      if (w.state === 'bad') { px += (Math.random() - 0.5) * 6 * s * Math.max(0, 1 - w.t2 * 2); py += w.t2 * w.t2 * 240 * s + Math.sin(i * 1.7) * w.t2 * 30 * s; alpha *= Math.max(0, 1 - w.t2 / 0.6); fill = '#ffb3bf'; gc = '#ff2e4d'; }
      if (low) { px += (Math.random() - 0.5) * 3; py += (Math.random() - 0.5) * 3; gc = '#ff5470'; }
      if (alpha <= 0.01) continue;
      c.save(); c.translate(px, py); c.scale(sc, sc); c.globalAlpha = Math.min(1, alpha);
      c.shadowColor = gc; c.shadowBlur = 16 * s;
      c.lineWidth = Math.max(3, w.size * 0.14); c.strokeStyle = 'rgba(12,8,34,.96)'; c.strokeText(w.chars[i], 0, 0);
      c.shadowBlur = 0; c.fillStyle = fill; c.fillText(w.chars[i], 0, 0);
      c.restore();
    }
    if (w.fade < 0.5 && w.state === 'hold') { c.save(); c.globalAlpha = (0.5 - w.fade) * 1.6; c.font = '700 ' + fsz(18) + 'px "PingFang SC","Microsoft YaHei",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = al(w.col, 1); c.fillText('· 隐 匿 ·', cx, cy); c.restore(); }
  }

  B.draw = (c) => {
    const s = S.s, h = B.hero, m = B.mon;
    c.save(); c.translate(FX.sx, FX.sy);
    S.drawBg(c, B.time);
    FX.draw(c, 'back');
    if (m && m.a.cast > 0.03 && m.dying < 0) magicCircle(c, m.x, S.gy + 5 * s, 112 * s * m.size, m.def.sp[2], m.a.cast, B.time);
    if (h.a.cast > 0.03) magicCircle(c, S.hero.x, S.gy + 5 * s, 74 * s, h.a.gem, h.a.cast, -B.time);
    drawHero(c); drawMon(c);
    FX.draw(c, 'mid');
    drawWord(c);
    c.restore();
    FX.draw(c, 'top');
    if (!B.over && h.hp / h.max < 0.3) {
      const g = c.createRadialGradient(S.W / 2, S.H / 2, Math.min(S.W, S.H) * 0.35, S.W / 2, S.H / 2, Math.max(S.W, S.H) * 0.75);
      g.addColorStop(0, 'rgba(255,0,40,0)'); g.addColorStop(1, 'rgba(255,0,40,' + (0.22 + 0.12 * Math.sin(B.time * 5)) + ')');
      c.fillStyle = g; c.fillRect(0, 0, S.W, S.H);
    }
    if (B.q && B.q.frozen > 0) {
      const g = c.createRadialGradient(S.W / 2, S.H / 2, Math.min(S.W, S.H) * 0.4, S.W / 2, S.H / 2, Math.max(S.W, S.H) * 0.75);
      g.addColorStop(0, 'rgba(125,249,255,0)'); g.addColorStop(1, 'rgba(125,249,255,.26)');
      c.fillStyle = g; c.fillRect(0, 0, S.W, S.H);
    }
    FX.drawOverlay(c, S.W, S.H);
  };
})();
