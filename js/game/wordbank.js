/* English Gate · 词库管理与出题
 *
 * 词库文本格式（每行一个词，# 开头为注释）：
 *     word|词性|中文释义        例：apple|n.|苹果
 * 也支持：  word,释义   /   word<Tab>释义   /   word|释义
 * JSON 格式： [{ "word": "apple", "pos": "n.", "meaning": "苹果" }, ...]
 *           或 { "name": "我的词库", "words": [ ... ] }
 * 词库里的单词请按"由易到难"排列，关卡会按顺序由浅入深取词。
 */
(function () {
  'use strict';
  const EG = window.EG, U = EG.U;
  const B = (EG.Banks = { map: {}, order: [] });

  const POS_RE = /^(?:[a-z]{1,6}\.)(?:\s*[\/&,]?\s*[a-z]{1,6}\.)*$/i;

  function finalize(list) {
    const seen = new Set(), out = [];
    list.forEach((x) => {
      if (!x) return;
      const w = String(x.w || '').trim(), m = String(x.m || '').trim();
      if (!w || !m || !/[a-zA-Z]/.test(w)) return;
      const key = w; // 区分大小写：IT / it、May / may、Miss / miss 是不同的词条
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ w, pos: String(x.pos || '').trim(), m, i: out.length });
    });
    return out;
  }

  /** 解析文本词库 */
  B.parse = (text) => {
    const rows = [];
    String(text || '').split(/\r?\n/).forEach((line, idx) => {
      line = line.trim();
      if (!line || line[0] === '#') return;
      let parts;
      if (line.indexOf('|') >= 0) parts = line.split('|');
      else if (line.indexOf('\t') >= 0) parts = line.split('\t');
      else { const k = line.search(/[,，]/); if (k < 0) return; parts = [line.slice(0, k), line.slice(k + 1)]; }
      parts = parts.map((s) => s.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) return;
      const w = parts[0];
      if (idx === 0 && /^(word|english|单词|英文)$/i.test(w)) return; // 表头
      let pos = '', m;
      if (parts.length >= 3 && POS_RE.test(parts[1])) { pos = parts[1]; m = parts.slice(2).join('；'); }
      else {
        m = parts.slice(1).join('；');
        const mm = m.match(/^((?:[a-z]{1,6}\.\s*)+)(.+)$/i);
        if (mm) { pos = mm[1].trim(); m = mm[2].trim(); }
      }
      rows.push({ w, pos, m });
    });
    return finalize(rows);
  };

  /** 解析 JSON 词库，返回 {name, words} */
  B.parseJSON = (data) => {
    let name = '', arr = data;
    if (data && !Array.isArray(data)) { name = data.name || data.title || ''; arr = data.words || data.list || data.data || []; }
    if (!Array.isArray(arr)) arr = [];
    const rows = arr.map((x) => {
      if (Array.isArray(x)) return x.length > 2 ? { w: x[0], pos: x[1], m: x[2] } : { w: x[0], m: x[1] };
      if (x && typeof x === 'object') return { w: x.word || x.w || x.en || x.english, pos: x.pos || x.p || '', m: x.meaning || x.m || x.zh || x.cn || x.chinese || x.translation || x.trans };
      return null;
    });
    return { name, words: finalize(rows) };
  };

  /** 自动识别文件内容 */
  B.parseAny = (text) => {
    const t = String(text || '').trim();
    if (t[0] === '[' || t[0] === '{') { try { return B.parseJSON(JSON.parse(t)); } catch (e) { /* 当作文本继续 */ } }
    return { name: '', words: B.parse(t) };
  };

  B.register = (def) => {
    const bank = { id: def.id, name: def.name, sub: def.sub || '', tier: def.tier || 1, label: def.label || '', desc: def.desc || '', builtin: def.builtin !== false, color: def.color || '#7cc7ff' };
    bank.words = def.words ? finalize(def.words) : B.parse(def.raw || '');
    if (!B.map[bank.id]) B.order.push(bank.id);
    B.map[bank.id] = bank;
    return bank;
  };
  B.get = (id) => B.map[id] || B.map[B.order[0]];
  B.all = () => B.order.map((id) => B.map[id]);

  /** 读取存档里的自定义词库 */
  B.loadCustom = () => {
    const cb = EG.Store.data.customBanks || {};
    Object.keys(cb).forEach((id) => { const d = cb[id]; if (d && d.words && d.words.length >= 8) B.register({ id, name: d.name, sub: '自定义', tier: d.tier || 3, desc: '导入的词库', builtin: false, color: '#f472b6', words: d.words }); });
  };
  B.addCustom = (name, words, tier) => {
    const id = 'U' + Date.now().toString(36);
    const clean = words.map((x) => ({ w: x.w, pos: x.pos, m: x.m }));
    EG.Store.data.customBanks[id] = { name, words: clean, tier: tier || 3 };
    EG.Store.save();
    return B.register({ id, name, sub: '自定义', tier: tier || 3, desc: '导入的词库', builtin: false, color: '#f472b6', words: clean });
  };
  B.remove = (id) => {
    const b = B.map[id];
    if (!b || b.builtin) return false;
    delete B.map[id];
    B.order = B.order.filter((x) => x !== id);
    delete EG.Store.data.customBanks[id];
    delete EG.Store.data.words[id];
    Object.keys(EG.Store.data.sceneBank).forEach((sid) => { if (EG.Store.data.sceneBank[sid] === id) delete EG.Store.data.sceneBank[sid]; });
    EG.Store.save();
    return true;
  };

  /** 场景当前使用的词库 id（用户指定的优先，否则用场景默认） */
  B.forScene = (scene) => {
    const id = EG.Store.data.sceneBank[scene.id];
    return id && B.map[id] ? id : scene.bank;
  };
  B.setForScene = (sceneId, bankId) => { EG.Store.data.sceneBank[sceneId] = bankId; EG.Store.save(); };

  /* ---------- 学习记录 ---------- */
  B.record = (bankId, word, ok) => {
    const all = EG.Store.data.words;
    const rec = (all[bankId] = all[bankId] || {});
    const r = (rec[word.w] = rec[word.w] || [0, 0, 0]);
    if (ok) { r[0]++; r[2]++; } else { r[1]++; r[2] = 0; }
    EG.Store.save();
  };
  /** 掌握度：答对过且当前没在错词本里的词占比 */
  B.mastery = (bankId) => {
    const b = B.map[bankId]; if (!b || !b.words.length) return 0;
    const rec = EG.Store.data.words[bankId] || {};
    let n = 0;
    b.words.forEach((w) => { const r = rec[w.w]; if (r && r[0] > 0 && !(r[1] > 0 && r[2] < 2)) n++; });
    return n / b.words.length;
  };
  /** 错词本：答错过、且之后还没连续答对 2 次的词 */
  B.mistakes = () => {
    const out = [];
    B.all().forEach((b) => {
      const rec = EG.Store.data.words[b.id] || {};
      b.words.forEach((w) => { const r = rec[w.w]; if (r && r[1] > 0 && r[2] < 2) out.push({ bank: b, word: w, wrong: r[1], right: r[0] }); });
    });
    out.sort((a, c) => c.wrong - a.wrong);
    return out;
  };
  B.clearMistake = (bankId, w) => { const rec = EG.Store.data.words[bankId]; if (rec && rec[w]) { rec[w][2] = 2; EG.Store.save(); } };

  /* ---------- 出题 ---------- */
  const Q = (EG.Quiz = {});

  /** 第 li 关（共 n 关）在词库里取词的范围：越往后越靠近词库末尾（越难） */
  Q.pool = (bank, li, n) => {
    const W = bank.words, N = W.length;
    if (N <= 40) return W.slice();
    const pad = Math.ceil(N * 0.05);
    const a = Math.max(0, Math.floor((N * li) / n) - pad), b = Math.min(N, Math.ceil((N * (li + 1)) / n) + pad);
    return W.slice(a, b);
  };

  // 一个词的义项列表（按 ；，、 切开）。结果缓存在 WeakMap 里，几千词的大词库出题也不卡。
  const senseCache = new WeakMap();
  const senses = (x) => {
    let s = senseCache.get(x);
    if (!s) { s = x.m.replace(/（[^）]*）|\([^)]*\)/g, '').split(/[；;，,、]/).map((t) => t.trim()).filter(Boolean); senseCache.set(x, s); }
    return s;
  };

  /**
   * 生成一道选择题。
   * o.type: 'en2zh'（看英文选中文，默认）| 'zh2en'（看中文选英文）；o.n: 选项数
   * 以后要加"句子翻译"等题型，在这里扩展 type 即可，战斗逻辑只依赖返回的 {prompt, options}。
   */
  Q.make = (word, bank, o) => {
    o = o || {};
    const n = (o.n || 4) - 1, type = o.type || 'en2zh';
    const key = word.w.toLowerCase();
    // 释义里只要有一个义项相同（如"有害的；敌对的"与"有害的；恶性的"），就不拿来当干扰项，避免出现两个都对的选项
    // 比较前去掉括号里的注释，"铁路（美）"和"铁路"算同一个义项
    const mine = new Set(senses(word));
    const clash = (x) => x.m === word.m || senses(x).some((t) => mine.has(t));
    let cands = bank.words.filter((x) => x.w.toLowerCase() !== key && !clash(x));
    if (cands.length < n) EG.Banks.all().forEach((b) => { if (b !== bank && cands.length < n + 6) b.words.forEach((x) => { if (x.w.toLowerCase() !== key && !clash(x) && cands.length < 40) cands.push(x); }); });
    // 干扰项优先同词性；同词性的不够，就退一步用"词性有交集"的（如 n./v. 与 n.），再不够才用全部
    const posSet = (p) => p.split(/[\/&,\s]+/).filter(Boolean);
    const same = word.pos ? cands.filter((x) => x.pos === word.pos) : [];
    let from = same;
    if (same.length < n + 2) {
      const mp = new Set(posSet(word.pos || ''));
      const near = mp.size ? cands.filter((x) => x.pos && posSet(x.pos).some((t) => mp.has(t))) : [];
      from = near.length >= n + 2 ? near : cands;
    }
    // 优先选难度相近（在词库里位置接近）的干扰项
    const idx = word.i === undefined ? 0 : word.i;
    const rank = (list) => list.map((x) => ({ x, d: Math.abs((x.i === undefined ? idx : x.i) - idx) + Math.random() * 40 })).sort((p, q) => p.d - q.d);
    const picks = [], used = new Set(mine);
    const take = (list) => {
      const scored = rank(list);
      for (let i = 0; i < scored.length && picks.length < n; i++) {
        const x = scored[i].x, ss = senses(x);
        if (picks.indexOf(x) >= 0 || ss.some((t) => used.has(t))) continue; // 干扰项之间也不重复义项
        ss.forEach((t) => used.add(t)); picks.push(x);
      }
    };
    take(from);
    if (picks.length < n && from !== cands) take(cands); // 同词性的词太少（如情态动词）时用其他词补足
    const all = [word].concat(picks), showPos = type !== 'zh2en' && all.every((x) => x.pos);
    const opts = U.shuffle(all).map((x) => ({
      text: type === 'zh2en' ? x.w : x.m,
      pos: showPos ? x.pos : '',
      ok: x === word,
    }));
    return { type, word, prompt: type === 'zh2en' ? word.m : word.w, options: opts };
  };
})();
