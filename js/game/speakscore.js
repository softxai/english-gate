/* English Gate · 口语评分（规则评分，不联网）
 *
 * 输入是语音识别（或打字）得到的英文文本，加上这道题的评分要求 spec，输出 0–100 的分数、四个维度和中文反馈。
 * 四个维度对应 PET 口语的评分项，但只是"能从文字里量出来"的近似值：
 *   content   任务完成 —— 有没有回答到点上（关键词覆盖、是否给了原因、是否回应搭档）
 *   discourse 话语组织 —— 说得够不够长、有没有用连接词把句子连起来（对应 Discourse Management）
 *   language  语法词汇 —— 用词范围、时态和句型的多样性（对应 Grammar and Vocabulary；测不出语法对错）
 *   clarity   发音清晰 —— 语音识别引擎给的置信度（对应 Pronunciation；只是"机器听清了多少"）
 * 它不能替代真人考官，只用来给练习一个即时、稳定、可解释的反馈。
 */
(function () {
  'use strict';
  const EG = window.EG;
  const SS = (EG.SpeakScore = {});
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ---------- 文本规范化 ---------- */
  const CONTR = [
    [/\b(can)'t\b/g, 'can not'], [/\b(won)'t\b/g, 'will not'], [/\bshan't\b/g, 'shall not'], [/n't\b/g, ' not'],
    [/\b(i)'m\b/g, 'i am'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'], [/'ll\b/g, ' will'], [/\b(i|you|he|she|we|they|it|that|there)'d\b/g, '$1 would'],
    [/\b(it|he|she|that|there|what|who|where|here|how)'s\b/g, '$1 is'], [/\blet's\b/g, 'let us'], [/'s\b/g, ''],
  ];
  SS.norm = (text) => {
    let t = String(text || '').toLowerCase().replace(/[‘’ʼ`]/g, "'").replace(/o'clock/g, 'oclock');
    CONTR.forEach((r) => { t = t.replace(r[0], r[1]); });
    return t.replace(/[^a-z0-9' -]+/g, ' ').replace(/'/g, '').replace(/\s+/g, ' ').trim();
  };
  const FILLER = new Set(['um', 'uh', 'er', 'erm', 'hmm', 'mm', 'ah', 'eh', 'umm', 'uhh', 'mmm']);
  SS.words = (text) => SS.norm(text).split(' ').filter((w) => w && !FILLER.has(w));

  /* ---------- 关键词匹配：写词根即可，自动匹配常见词形 ---------- */
  const IRR = {
    child: ['children'], man: ['men'], woman: ['women'], person: ['people'], foot: ['feet'], shelf: ['shelves'], knife: ['knives'], leaf: ['leaves'],
    go: ['went', 'gone', 'goes'], eat: ['ate', 'eaten'], sit: ['sat'], buy: ['bought'], take: ['took', 'taken'], make: ['made'], hold: ['held'], give: ['gave', 'given'],
    see: ['saw', 'seen'], have: ['has', 'had'], swim: ['swam'], run: ['ran'], build: ['built'], stand: ['stood'], teach: ['taught'], sell: ['sold'], wear: ['wore', 'worn'],
    write: ['wrote', 'written'], sing: ['sang', 'sung'], drink: ['drank'], sleep: ['slept'], blow: ['blew'], come: ['came'], get: ['got'], lie: ['lying', 'lay'], think: ['thought'],
    catch: ['caught'], bring: ['brought'], pay: ['paid'], fly: ['flew'], grow: ['grew', 'grown'], ride: ['rode'], meet: ['met'], feel: ['felt'], keep: ['kept'], spend: ['spent'], choose: ['chose', 'chosen'], draw: ['drew'], know: ['knew', 'known'],
  };
  const formCache = new Map();
  function forms(k) {
    let f = formCache.get(k);
    if (f) return f;
    f = new Set([k]);
    if (k.length >= 3) {
      const last = k[k.length - 1], stem = k.slice(0, -1);
      ['s', 'es', 'ed', 'd', 'ing', 'er', 'ers', 'ly', 'r'].forEach((s) => f.add(k + s));
      if (!/[aeiouwxy]/.test(last)) [last + 'ing', last + 'ed', last + 'er'].forEach((s) => f.add(k + s));
      if (last === 'e') ['ing', 'er'].forEach((s) => f.add(stem + s));
      if (last === 'y') ['ies', 'ied', 'ier', 'ily'].forEach((s) => f.add(stem + s));
      (IRR[k] || []).forEach((x) => f.add(x));
    }
    formCache.set(k, f);
    return f;
  }
  /** ctx: { text: ' 规范化文本 ', set: Set(词) }；kw 可以是单词（词根）或短语 */
  const hasKw = (ctx, kw) => {
    kw = String(kw).toLowerCase().replace(/'/g, '');
    if (kw.indexOf(' ') >= 0 || kw.indexOf('-') >= 0) {
      if (ctx.text.indexOf(' ' + kw + ' ') >= 0) return true;
      const parts = kw.split(/[ -]/), tail = parts.pop(), head = parts.join(' ');
      for (const fm of forms(tail)) if (ctx.text.indexOf(' ' + head + ' ' + fm + ' ') >= 0) return true;
      return false;
    }
    for (const fm of forms(kw)) if (ctx.set.has(fm)) return true;
    return false;
  };
  const anyKw = (ctx, list) => (list || []).find((k) => hasKw(ctx, k));

  /* ---------- 语言功能：表达观点、同意、建议、提问、描述位置…… ---------- */
  const FN = {
    reason: ['because', 'so', 'since', 'that is why', 'the reason', 'so that'],
    example: ['for example', 'such as', 'for instance'],
    opinion: ['i think', 'i believe', 'in my opinion', 'i guess', 'i suppose', 'i feel', 'for me', 'personally', 'i would say', 'i prefer', 'i would rather', 'i like', 'i love', 'i enjoy', 'my favourite', 'i do not think', 'i do not like', 'it seems', 'i would like', 'i find'],
    agree: ['i agree', 'you are right', 'that is true', 'good idea', 'great idea', 'nice idea', 'good point', 'exactly', 'me too', 'of course', 'sure', 'yes', 'yeah', 'that sounds', 'sounds good', 'sounds fun', 'sounds great', 'definitely', 'i think so', 'ok', 'okay'],
    disagree: ['i do not agree', 'i disagree', 'not sure', 'i do not think', 'maybe not', 'not really', 'but', 'however', 'i am afraid', 'on the other hand', 'no'],
    suggest: ['how about', 'what about', 'why do not we', 'why not', 'we could', 'they could', 'he could', 'she could', 'we should', 'they should', 'he should', 'she should', 'let us', 'shall we', 'would be better', 'might be', 'it would be', 'could be'],
    ask: ['what do you think', 'do you agree', 'how about you', 'what about you', 'do not you think', 'what is your opinion', 'is that ok', 'would you', 'do you think', 'what about', 'how about', 'and you'],
    decide: ['best', 'choose', 'should', 'let us', 'go for', 'most useful', 'most fun', 'most', 'prefer', 'decide', 'pick', 'better'],
    position: ['on the left', 'on the right', 'in the middle', 'in the background', 'in the foreground', 'at the top', 'at the bottom', 'behind', 'in front of', 'next to', 'between', 'near', 'under', 'above', 'beside', 'in the centre', 'in the center', 'at the back', 'at the front'],
    thereis: ['there is', 'there are', 'i can see', 'we can see', 'you can see', 'picture shows', 'photo shows', 'in this picture', 'in the picture', 'in this photo', 'in the photo', 'it shows', 'i see'],
    guess: ['i think', 'maybe', 'perhaps', 'probably', 'it looks', 'looks like', 'look like', 'seem', 'might', 'could be', 'must be', 'i guess', 'they look', 'she looks', 'he looks', 'look happy', 'looks happy'],
  };
  const FN_NAME = {
    reason: '说明原因', develop: '展开回答', opinion: '表达观点', agree: '回应搭档', disagree: '回应搭档', suggest: '提出建议', ask: '反问搭档', decide: '做出选择',
    position: '说明位置', thereis: '介绍画面', guess: '推测感受', continuous: '现在进行时',
  };
  const FN_TIP = {
    reason: '用 because… 说出原因', develop: '加一个原因（because…）或例子（for example…）',
    opinion: '用 I think… / In my opinion… 开头说出你的看法', agree: "先回应搭档：I agree. / That's a good idea. / I'm not sure, because…", disagree: "先回应搭档：I agree. / I'm not sure, because…",
    suggest: '提个建议：What about…? / They could…', ask: '把话题抛回给搭档：What do you think? / Do you agree?', decide: '明确说出选择：I think … would be the best, because…',
    position: '说清位置：On the left… / In the middle… / In the background…', thereis: '用 In this picture I can see… / There is… 开头', guess: '加一句推测：I think… / Maybe… / They look happy.', continuous: '描述动作用现在进行时：She is cooking. / They are sitting…',
  };
  const LINKS = ['and', 'but', 'because', 'so', 'also', 'then', 'when', 'if', 'or', 'however', 'although', 'for example', 'such as', 'first', 'second', 'finally', 'as well', 'too', 'while', 'after', 'before', 'that is why', 'instead', 'especially', 'after that'];
  const NOT_ING = new Set(['thing', 'nothing', 'something', 'anything', 'everything', 'evening', 'morning', 'interesting', 'boring', 'exciting', 'king', 'ring', 'sing', 'bring', 'spring', 'during', 'wedding', 'building', 'ceiling', 'amazing', 'relaxing', 'tiring']);
  const PAST = new Set(['was', 'were', 'went', 'had', 'did', 'saw', 'ate', 'got', 'gave', 'took', 'made', 'came', 'bought', 'met', 'said', 'told', 'found', 'felt', 'thought', 'swam', 'ran', 'won', 'lost', 'left', 'knew', 'began', 'became', 'spent', 'taught', 'wrote', 'read', 'slept', 'drank', 'sat', 'stood', 'built', 'flew', 'rode']);
  const NOT_ED = new Set(['need', 'feed', 'speed', 'indeed', 'hundred', 'tired', 'excited', 'interested', 'bored', 'relaxed', 'married', 'worried', 'surprised', 'scared', 'crowded']);
  const MODAL = ['can', 'could', 'should', 'would', 'must', 'might', 'may'];
  const COMPLEX = ['because', 'when', 'if', 'although', 'while', 'which', 'who', 'that is why', 'so that', 'where', 'until', 'unless'];
  const COMPARE = ['than', 'more', 'most', 'better', 'best', 'worse', 'worst', 'as well as'];

  function fnHit(ctx, name) {
    if (name === 'continuous') return ctx.cont > 0;
    if (name === 'develop') return !!(anyKw(ctx, FN.reason) || anyKw(ctx, FN.example)) || ctx.W >= ctx.target;
    return !!anyKw(ctx, FN[name]);
  }

  /* ---------- 词汇范围：用 PET 词库的常用度排序判断"是不是基础词以外的词" ---------- */
  let rankMap = null;
  function rank(t) {
    if (!rankMap) {
      rankMap = new Map();
      const bank = EG.Banks && EG.Banks.map && EG.Banks.map.PET;
      if (bank) bank.words.forEach((w) => { const k = w.w.toLowerCase(); if (k.indexOf(' ') < 0 && !rankMap.has(k)) rankMap.set(k, w.i); });
    }
    if (!rankMap.size) return t.length >= 6 ? 900 : 100; // 没有词库时的兜底
    const cands = [t, t.replace(/(ies|ied)$/, 'y'), t.replace(/(s|d)$/, ''), t.replace(/(es|ed|er|ly)$/, ''), t.replace(/ing$/, ''), t.replace(/ing$/, 'e'), t.replace(/(.)\1(ing|ed|er)$/, '$1')];
    for (let i = 0; i < cands.length; i++) { const r = rankMap.get(cands[i]); if (r !== undefined) return r; }
    return -1; // 词库里没有：可能是专有名词、更难的词，或识别错误
  }

  /* ---------- 评分 ---------- */
  /**
   * spec: { part, target 目标词数, min 最少词数, simple 是否只要求简短回答,
   *         rel [关键词]（是否切题）, groups [{n, kw}]（要说到的内容）, need 需要覆盖几组,
   *         fn [功能名 或 [几选一]]（要用到的语言功能）, bonus [功能名], links 需要几个不同的连接词 }
   * meta: { conf 识别置信度 0–1 或 null, dur 说话秒数, latency 开口前的秒数, typed 是否打字 }
   */
  SS.score = (text, spec, meta) => {
    spec = spec || {}; meta = meta || {};
    const norm = SS.norm(text), toks = norm ? norm.split(' ') : [], words = toks.filter((w) => !FILLER.has(w));
    const W = words.length, target = spec.target || 18, min = spec.min || 5, part = spec.part || 1;
    const ctx = { text: ' ' + norm + ' ', set: new Set(words), W, target, cont: 0 };
    (ctx.text.match(/ (is|are|am|was|were) (not )?(just )?[a-z]+ing(?= )/g) || []).forEach((m) => { const v = m.trim().split(' ').pop(); if (!NOT_ING.has(v)) ctx.cont++; });

    // 内容
    const groups = (spec.groups || []).map((g) => ({ n: g.n, hit: !!anyKw(ctx, g.kw), word: anyKw(ctx, g.kw) }));
    const hitN = groups.filter((g) => g.hit).length, need = spec.need || Math.max(1, Math.ceil(groups.length * 0.65));
    let cov = groups.length ? Math.min(1, hitN / need) : null;
    // 看图说话还要看"说了多少具体的东西"：统计命中的不同关键词个数
    let detail = 0;
    if (spec.detail) {
      const seen = new Set();
      spec.groups.forEach((g) => { if (!g.generic) g.kw.forEach((k) => { if (hasKw(ctx, k)) seen.add(k); }); });
      detail = seen.size; cov = 0.55 * cov + 0.45 * Math.min(1, detail / spec.detail);
    }
    const fns = (spec.fn || []).map((f) => { const alts = Array.isArray(f) ? f : [f]; const got = alts.find((a) => fnHit(ctx, a)); return { name: got || alts[0], label: FN_NAME[got || alts[0]], hit: !!got, tip: FN_TIP[alts[0]] }; });
    const fnCov = fns.length ? fns.filter((f) => f.hit).length / fns.length : null;
    const bonus = (spec.bonus || []).filter((b) => fnHit(ctx, b));
    const onTopic = !spec.rel || !!anyKw(ctx, spec.rel);
    let content = cov !== null && fnCov !== null ? 0.6 * cov + 0.4 * fnCov : cov !== null ? cov : fnCov !== null ? 0.55 + 0.45 * fnCov : 1;
    content = Math.min(1, content + bonus.length * 0.08) * (onTopic ? 1 : 0.45);

    // 话语组织
    const links = LINKS.filter((l) => hasKw(ctx, l));
    const linkNeed = spec.links || (part === 2 ? 3 : target >= 16 ? 2 : 1);
    const lenS = Math.pow(Math.min(1, W / target), 0.85), linkS = Math.min(1, links.length / linkNeed);
    const wpm = meta.dur > 2 && W >= 8 ? (W / meta.dur) * 60 : 0;
    const flu = wpm ? (wpm < 55 ? 0.82 : wpm < 80 ? 0.92 : 1) : 1;
    let discourse = (spec.simple ? lenS : 0.65 * lenS + 0.35 * linkS) * flu;

    // 语法词汇
    const uniq = Array.from(ctx.set).filter((t) => /^[a-z]+$/.test(t) && t.length >= 3);
    const rare = uniq.filter((t) => { const r = rank(t); return r >= 600 || (r < 0 && t.length >= 5); });
    const rangeS = Math.min(1, rare.length / Math.max(2, target * 0.15));
    const cats = [];
    if (ctx.cont) cats.push('进行时');
    if (words.some((t) => PAST.has(t) || (t.length >= 5 && /ed$/.test(t) && !NOT_ED.has(t)))) cats.push('过去时');
    if (hasKw(ctx, 'will') || ctx.text.indexOf(' going to ') >= 0) cats.push('将来时');
    if (MODAL.some((m) => ctx.set.has(m))) cats.push('情态动词');
    if (COMPLEX.some((m) => hasKw(ctx, m))) cats.push('从句');
    if (COMPARE.some((m) => hasKw(ctx, m)) || / [a-z]+er than /.test(ctx.text)) cats.push('比较');
    if (/ (have|has|had) (not |never |ever |just |already )?(been|[a-z]+ed|done|seen|gone|eaten|had|made|got) /.test(ctx.text)) cats.push('完成时');
    const structS = Math.min(1, cats.length / (part === 2 ? 3 : 2));
    let language = spec.simple ? (W >= Math.min(target, 4) ? 0.8 : 0.5) : 0.5 * rangeS + 0.5 * structS;

    // 清晰度
    const clarity = typeof meta.conf === 'number' && meta.conf > 0 ? clamp((meta.conf - 0.55) / 0.37, 0, 1) : null;

    let total;
    if (spec.simple) total = 40 + 60 * Math.min(1, W / target);
    else total = 100 * (0.42 * content + 0.38 * discourse + 0.2 * language);
    if (!onTopic) total = Math.min(total, 58); // 关键词判断不一定准，所以跑题只压到"勉强过关"，不直接判不及格
    if (clarity !== null) total = total * 0.9 + clarity * 10;
    let short = false;
    if (W < min) { total = Math.min(total, W === 0 ? 0 : 20 + (W / min) * 18); short = true; }
    total = Math.round(clamp(total, 0, 100));

    // 互动（Part 3/4 用）：有没有回应、有没有把话题抛回去、开口快不快
    const lat = typeof meta.latency === 'number' ? (meta.latency <= 4 ? 1 : meta.latency <= 8 ? 0.75 : 0.5) : 1;
    const inter = clamp((fnCov !== null ? 0.55 * fnCov + 0.25 * (onTopic ? 1 : 0.3) : 0.8 * (onTopic ? 1 : 0.3)) + (bonus.length ? 0.2 : fnCov === null ? 0.2 : 0), 0, 1) * lat * (short ? 0.5 : 1);

    // 反馈
    const good = [], tips = [];
    if (W === 0) tips.push('没有听到你的回答——点一下麦克风，大声一点说');
    else if (short) tips.push('只说了 ' + W + ' 个词，太短了——至少说 ' + min + ' 个词，目标 ' + target + ' 个以上');
    else if (W >= target) good.push('说了 ' + W + ' 个词，长度达标');
    else tips.push('说了 ' + W + ' 个词，目标是 ' + target + ' 个以上——再多说一两句');
    if (!onTopic && W > 0) tips.push('好像没有回答到问题上——再读一遍题目');
    if (groups.length) {
      const hits = groups.filter((g) => g.hit).map((g) => g.n), miss = groups.filter((g) => !g.hit).map((g) => g.n);
      if (hits.length) good.push('说到了：' + hits.join('、') + (spec.detail ? '（' + detail + ' 个细节）' : ''));
      if (hitN < need && miss.length) tips.push('还可以说说：' + miss.slice(0, 3).join('、'));
    }
    fns.forEach((f) => { if (f.hit) good.push(f.label + ' ✓'); else if (W > 0) tips.push(f.tip); });
    if (bonus.length) good.push((spec.bonus.indexOf('ask') >= 0 && bonus.indexOf('ask') >= 0 ? '主动反问了搭档' : '主动提了建议') + ' ✓');
    else if ((spec.bonus || []).indexOf('ask') >= 0 && W > 0 && !short) tips.push(FN_TIP.ask);
    if (!spec.simple && W > 0) {
      if (links.length >= linkNeed) good.push('连接词：' + links.slice(0, 4).join(', '));
      else tips.push('用连接词把句子连起来：because / and / but / so' + (links.length ? '（已经用了 ' + links.join(', ') + '）' : ''));
      if (cats.length >= 2) good.push('句型有变化：' + cats.slice(0, 3).join('、'));
      if (rare.length >= 3) good.push('用到了不错的词：' + rare.slice(0, 4).join(', '));
    }
    if (wpm && wpm < 55) tips.push('语速偏慢，停顿有点多——想好再说，尽量一口气说完一句');
    if (clarity !== null && clarity < 0.45 && W > 0) tips.push('有些词识别引擎没听清——放慢一点，把每个词的结尾音发出来');

    return {
      total, pass: total >= 50, grade: total >= 85 ? 3 : total >= 68 ? 2 : total >= 50 ? 1 : 0,
      words: W, wpm: Math.round(wpm), short, onTopic, detail,
      dims: { content, discourse, language, clarity, inter },
      groups, fns, bonus, links, cats, rare: rare.slice(0, 8),
      good: good.slice(0, 4), tips: tips.slice(0, 3),
    };
  };

  /** 自评模式：把勾选的清单换算成分数。checks: [bool…]（清单项是否做到），dur 说话秒数，wantDur 目标秒数 */
  SS.selfScore = (checks, dur, wantDur) => {
    const n = checks.length || 1, done = checks.filter(Boolean).length;
    const lenS = Math.min(1, (dur || 0) / Math.max(3, wantDur || 10));
    const total = Math.round(100 * (0.7 * (done / n) + 0.3 * lenS));
    const v = done / n;
    return { total, pass: total >= 50, grade: total >= 85 ? 3 : total >= 68 ? 2 : total >= 50 ? 1 : 0, words: 0, self: true, dims: { content: v, discourse: 0.5 * v + 0.5 * lenS, language: v, clarity: null, inter: v }, good: [], tips: [], groups: [], fns: [], links: [], cats: [], rare: [] };
  };

  /**
   * 把一场模考里每一题的结果汇总成 PET 的四项 + 总体印象（0–5 分，0.5 一档）。
   * turns: [{ part, res }]
   */
  SS.sheet = (turns) => {
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    const band = (v) => (v === null ? null : Math.round(clamp(v, 0, 1) * 10) / 2);
    const ok = turns.filter((t) => t.res);
    const gv = avg(ok.map((t) => 0.6 * t.res.dims.language + 0.4 * t.res.dims.content));
    const dm = avg(ok.map((t) => t.res.dims.discourse));
    const prs = ok.map((t) => t.res.dims.clarity).filter((v) => v !== null && v !== undefined);
    const pr = prs.length ? avg(prs) : null;
    const ic = avg(ok.filter((t) => t.part !== 2).map((t) => t.res.dims.inter));
    const parts = [gv, dm, pr, ic].filter((v) => v !== null);
    const overall = avg(ok.map((t) => t.res.total / 100));
    const global = parts.length ? 0.5 * avg(parts) + 0.5 * (overall || 0) : overall;
    return { gv: band(gv), dm: band(dm), pr: band(pr), ic: band(ic), global: band(global), avg: Math.round((overall || 0) * 100) };
  };
  SS.FN_TIP = FN_TIP;

  /* ---------- 各题型的评分要求 ---------- */
  SS.spec = {
    /** Part 1：第一阶段简短回答即可；第二阶段要展开（原因或例子） */
    p1: (q) => (q.ph === 1 ? { part: 1, simple: true, target: q.target, min: q.min, rel: q.rel } : { part: 1, target: q.target, min: q.min, rel: q.rel, fn: ['develop'], links: 1 }),
    /** Part 2：约 1 分钟的独白，要覆盖人物/地点/动作/细节，并用上描述图片的句型 */
    p2: (ph) => ({ part: 2, target: 70, min: 15, groups: ph.groups, need: 4, detail: 9, fn: ['thereis', 'continuous', ['position', 'guess']], links: 3 }),
    /** Part 3：每一轮回应搭档——前几轮要表态并说原因，最后一轮要做出选择 */
    p3: (task, i) => ({
      part: 3, target: 18, min: 5, links: 1, bonus: ['ask'],
      groups: [{ n: '具体选项', kw: task.options.reduce((a, o) => a.concat(o.kw), []) }], need: 1,
      fn: i >= task.turns.length - 1 ? ['decide', 'reason'] : [i === 2 ? ['agree', 'disagree'] : ['opinion', 'agree', 'disagree'], 'reason'],
    }),
    /** Part 4：谈自己的看法和经历，要展开 */
    p4: (q) => ({ part: 4, target: q.target, min: q.min, rel: q.rel, fn: ['develop'], links: 2 }),
  };
})();
