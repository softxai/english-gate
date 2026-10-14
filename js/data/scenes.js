/* English Gate · 场景、关卡与怪兽数据
 *
 * 结构：场景 → 关卡(每场景 5 关) → 怪兽。六个单词场景每关 4/5/6/7/8 只（共 180 只），
 *       外加口语场景「回声殿堂」（17 只）和听力场景「潮音海湾」（18 只）。全游戏 215 只怪兽互不重复。
 * 怪兽定义 M(中文名, 英文名, 骨架, [主色, 辅色, 点缀色], 外形特征, [攻击法术, 法术名, 色1, 色2], 额外属性)
 *   骨架 a：slime mushroom plant treant beast bird serpent bug humanoid ghost golem eye elemental object skull tentacle dragon
 *   额外属性：tr 特性数组 / elite 精英(2 血) / boss / size 体型 / ult [全屏大招id, 大招名]
 *   特性 tr：haste 疾速 · armor 护甲 · fade 隐匿 · scramble 幻术 · reverse 逆咒 · multi 多重 · drain 吸血 · venom 剧毒 · rage 狂暴
 */
(function () {
  'use strict';
  const EG = window.EG;
  const M = (n, e, a, c, f, sp, x) => Object.assign({ n, e, a, c, f: f || {}, sp }, x || {});

  const SCENES = [
    /* ============================ 精灵森林 · G5 ============================ */
    {
      id: 'forest', name: '精灵森林', en: 'Whispering Forest', icon: '🌲', bank: 'G5', tier: 1, color: '#58d68d', accent: '#f7dc6f',
      desc: '阳光斑驳的林间小径，最适合初次冒险的小魔法师。',
      levels: [
        { name: '林间小径', mons: [
          M('苔藓史莱姆', 'Moss Slime', 'slime', ['#6fcf5f', '#3e9a48', '#d9f99d'], { eyes: 2 }, ['orb', '黏液弹', '#8bdc65', '#eaffd0']),
          M('草丛野兔', 'Meadow Hare', 'beast', ['#b98a5a', '#f1dcc0', '#ff8fa3'], { v: 'hare' }, ['darts', '橡果弹', '#b98a5a', '#fff3d6']),
          M('红伞菇仔', 'Shroomling', 'mushroom', ['#e5484d', '#f6ead0', '#fff7e6'], {}, ['cloud', '孢子云', '#f6c177', '#fff2c2']),
          M('萤火精灵', 'Firefly Wisp', 'ghost', ['#f7e06a', '#fff6b0', '#9affd0'], { v: 'wisp' }, ['orb', '萤光弹', '#faff8a', '#ffffff']),
        ] },
        { name: '蘑菇幽谷', mons: [
          M('荆棘刺猬', 'Thorn Hedgehog', 'beast', ['#b0825a', '#7a5a3a', '#ffd166'], { v: 'hedgehog' }, ['darts', '飞刺', '#c9a06a', '#fff3d6']),
          M('啄木鸟', 'Woodpecker', 'bird', ['#2f2f3a', '#f3efe6', '#e5484d'], { v: 'hawk' }, ['darts', '啄击', '#e8d5b0', '#ffffff']),
          M('毒蝇伞', 'Toxic Amanita', 'mushroom', ['#8e4ec6', '#d8c8f0', '#d4ff5e'], { cone: 1, angry: 1, glow: 1 }, ['cloud', '毒雾', '#a855f7', '#d4ff5e'], { tr: ['haste'] }),
          M('林地蝙蝠', 'Wood Bat', 'bird', ['#6b5a8a', '#8f7fb5', '#ffd166'], { v: 'bat' }, ['wave', '超声波', '#c4b5fd', '#ffffff']),
          M('花妖', 'Blossom Fairy', 'plant', ['#ff8fc7', '#4caf50', '#ffe066'], { v: 'flower' }, ['swarm', '花瓣风暴', '#ff8fc7', '#ffe4f1']),
        ] },
        { name: '古树密林', mons: [
          M('灰影狼', 'Shadow Wolf', 'beast', ['#7b8794', '#cfd8dc', '#7df9ff'], { v: 'wolf' }, ['slash', '撕咬', '#cfd8dc', '#ffffff'], { tr: ['haste'] }),
          M('哥布林斥候', 'Goblin Scout', 'humanoid', ['#6b4a2a', '#8a6a3a', '#e5484d'], { head: 'goblin', body: 'tunic', weapon: 'spear', skin: '#8bc34a' }, ['darts', '投矛', '#c9a06a', '#ffffff']),
          M('藤蔓蛇', 'Vine Serpent', 'serpent', ['#3fa34d', '#9be564', '#ffe066'], { vine: 1 }, ['spikes', '藤鞭', '#3fa34d', '#c8ff9a']),
          M('巨角甲虫', 'Horned Beetle', 'bug', ['#2f7d6d', '#3b2f2f', '#9be564'], { v: 'beetle' }, ['boulder', '冲撞', '#5a4632', '#9be564']),
          M('猫头鹰贤者', 'Owl Sage', 'bird', ['#8d6e4f', '#e8d5b0', '#ffb703'], { v: 'owl' }, ['wave', '风刃', '#b8f2e6', '#ffffff']),
          M('小树人', 'Sapling Treant', 'treant', ['#8a5a2b', '#57a639', '#ffe066'], { fruit: 1 }, ['rain', '落叶飞刀', '#7ccf4a', '#e8ffb0'], { elite: 1, ult: ['quake', '大地震颤'] }),
        ] },
        { name: '迷雾沼泽', mons: [
          M('沼泽软泥', 'Bog Ooze', 'slime', ['#5b6b3a', '#8a9a4a', '#c6f04a'], { eyes: 3, drip: 1, fang: 1 }, ['orb', '腐蚀泥弹', '#9aa83a', '#e2ff7a'], { tr: ['venom'] }),
          M('沼泽鳄蜥', 'Swamp Croc', 'beast', ['#4a6b3a', '#b9c97a', '#ffb703'], { v: 'lizard' }, ['slash', '死亡翻滚', '#9aa83a', '#ffffff'], { tr: ['venom'] }),
          M('剧毒蜘蛛', 'Venom Spider', 'bug', ['#3a2f4a', '#5a4a6a', '#b6ff3a'], { v: 'spider', glow: 1 }, ['darts', '毒牙', '#b6ff3a', '#f2ffd0'], { tr: ['venom'] }),
          M('鬼火', 'Will-o-Wisp', 'elemental', ['#3ad6c0', '#1b8f8a', '#d6fff6'], { v: 'flame' }, ['fireball', '磷火', '#3ad6c0', '#d6fff6'], { tr: ['fade'] }),
          M('泥沼巨蟒', 'Marsh Python', 'serpent', ['#7a6a3a', '#c9b458', '#ff8a3d'], {}, ['breath', '毒息', '#9aa83a', '#e2ff7a'], { elite: 1 }),
          M('食人花', 'Man-eater', 'plant', ['#c2255c', '#2f9e44', '#ffe066'], { v: 'maneater' }, ['slash', '噬咬', '#ff4d8d', '#ffffff'], { tr: ['drain'] }),
          M('沼泽巫婆', 'Swamp Hag', 'humanoid', ['#3b3a52', '#5a4a7a', '#b6ff3a'], { head: 'witch', body: 'robe', weapon: 'staff', skin: '#9ccc65', hair: '#d9d9d9' }, ['curse', '沼泽诅咒', '#b6ff3a', '#e9ffb0'], { elite: 1, tr: ['scramble'], ult: ['shadowveil', '巫毒之夜'] }),
        ] },
        { name: '精灵王庭', mons: [
          M('独角野猪', 'Horned Boar', 'beast', ['#7a4a3a', '#c9a58a', '#ffe066'], { v: 'boar', horn: 1 }, ['boulder', '蛮牛冲撞', '#7a5a3a', '#ffe066'], { tr: ['rage'] }),
          M('翡翠幼龙', 'Emerald Whelp', 'dragon', ['#2f9e6b', '#d9f99d', '#ffe066'], { small: 1 }, ['breath', '翡翠吐息', '#4ade80', '#eaffd0'], { tr: ['venom'] }),
          M('精灵弓手', 'Elf Archer', 'humanoid', ['#2f7d4f', '#c9a24a', '#ffe066'], { head: 'elf', body: 'tunic', weapon: 'bow', hair: '#f2d16b', cape: '#1f5e3a' }, ['rain', '箭雨', '#c9ff8a', '#ffffff'], { tr: ['haste'] }),
          M('水晶鹿', 'Crystal Stag', 'beast', ['#e8f0ff', '#b9c7ff', '#7df9ff'], { v: 'stag', crystal: 1 }, ['pillar', '月华', '#b9e6ff', '#ffffff'], { tr: ['reverse'] }),
          M('森林之眼', 'Forest Watcher', 'eye', ['#2f7d4f', '#57a639', '#ffd166'], { tent: 5, vines: 1 }, ['beam', '凝视', '#ffd166', '#ffffff'], { tr: ['fade'] }),
          M('石苔魔像', 'Moss Golem', 'golem', ['#7d8a7a', '#57a639', '#9affd0'], { v: 'moss' }, ['boulder', '巨石投掷', '#7d8a7a', '#57a639'], { elite: 1, tr: ['armor'] }),
          M('幽林女妖', 'Forest Banshee', 'ghost', ['#b8f2e6', '#e9fff9', '#7df9ff'], { v: 'banshee' }, ['wave', '女妖尖啸', '#b8f2e6', '#ffffff'], { elite: 1, tr: ['multi'], ult: ['thunderstorm', '哀嚎风暴'] }),
          M('远古树王·厄德拉', 'Elder Treant King', 'treant', ['#6b4423', '#2f9e44', '#ffe066'], { boss: 1 }, ['spikes', '根须穿刺', '#6b4423', '#a3e635'], { boss: 1, size: 1.36, tr: ['rage'], ult: ['verdant', '森罗万象'] }),
        ] },
      ],
    },

    /* ============================ 烈日沙漠 · G6 ============================ */
    {
      id: 'desert', name: '烈日沙漠', en: 'Scorching Desert', icon: '🏜️', bank: 'G6', tier: 2, color: '#f5b041', accent: '#e67e22',
      desc: '烈日与黄沙之下，埋藏着法老不朽的秘密。',
      levels: [
        { name: '黄沙古道', mons: [
          M('沙丘史莱姆', 'Sand Slime', 'slime', ['#e6b566', '#c98a3c', '#fff1c9'], { eyes: 1 }, ['orb', '沙弹', '#e6b566', '#fff1c9']),
          M('沙鼠', 'Sand Rat', 'beast', ['#d2a56d', '#f6e3c0', '#ff8fa3'], { v: 'rat' }, ['darts', '沙砾', '#e6c88a', '#fff1c9']),
          M('仙人掌球', 'Cactus Kid', 'plant', ['#4caf50', '#2e7d32', '#ff6fae'], { v: 'cactus' }, ['darts', '仙人掌刺', '#9be564', '#fffbe0']),
          M('沙漠蜥蜴', 'Sand Lizard', 'beast', ['#c9a25a', '#f1dca7', '#ff8a3d'], { v: 'lizard' }, ['breath', '沙尘吐息', '#e6c88a', '#fff1c9']),
        ] },
        { name: '绿洲集市', mons: [
          M('圣甲虫', 'Scarab', 'bug', ['#1f6f8b', '#2a2a3a', '#ffd166'], { v: 'beetle' }, ['boulder', '滚石', '#8a6a4a', '#ffd166']),
          M('沙漠玫瑰', 'Desert Rose', 'plant', ['#e5484d', '#3f7d4a', '#ffd166'], { v: 'flower', angry: 1, petals: 10 }, ['swarm', '飞花', '#e5484d', '#ffe4e4']),
          M('秃鹫', 'Vulture', 'bird', ['#4a3f35', '#8a7a66', '#e57373'], { v: 'vulture' }, ['slash', '俯冲啄击', '#e6c88a', '#ffffff']),
          M('响尾蛇', 'Rattlesnake', 'serpent', ['#c9a25a', '#7a5a2b', '#ffe066'], { rattle: 1 }, ['darts', '毒牙', '#b6ff3a', '#f2ffd0'], { tr: ['haste'] }),
          M('沙漠盗贼', 'Desert Bandit', 'humanoid', ['#8a5a2b', '#e8dcc0', '#e5484d'], { head: 'bandit', body: 'tunic', weapon: 'dagger' }, ['slash', '弯刀连斩', '#e8dcc0', '#ffffff']),
        ] },
        { name: '风蚀峡谷', mons: [
          M('沙尘精灵', 'Dust Devil', 'elemental', ['#e6c88a', '#c9a25a', '#fff1c9'], { v: 'tornado' }, ['tornado', '沙卷风', '#e6c88a', '#fff1c9']),
          M('沙蛛', 'Sand Spider', 'bug', ['#c9a25a', '#8a6a3a', '#e5484d'], { v: 'spider' }, ['cloud', '流沙网', '#e6c88a', '#fff1c9']),
          M('毒蝎', 'Scorpion', 'bug', ['#a0522d', '#5a2d0c', '#b6ff3a'], { v: 'scorpion' }, ['darts', '蝎尾针', '#b6ff3a', '#f2ffd0'], { tr: ['venom'] }),
          M('胡狼', 'Jackal', 'beast', ['#c98a3c', '#f1dca7', '#ffd166'], { v: 'wolf' }, ['slash', '撕咬', '#f1dca7', '#ffffff'], { tr: ['haste'] }),
          M('巨型仙人掌', 'Giant Cactus', 'plant', ['#2e8b57', '#1f5e3a', '#ffd166'], { v: 'cactus', giant: 1 }, ['rain', '针雨', '#9be564', '#fffbe0'], { size: 1.12 }),
          M('沙岩魔像', 'Sandstone Golem', 'golem', ['#d9a05b', '#a8733a', '#7df9ff'], { v: 'sand' }, ['boulder', '岩石重击', '#d9a05b', '#a8733a'], { elite: 1, ult: ['quake', '流沙陷落'] }),
        ] },
        { name: '失落神庙', mons: [
          M('木乃伊', 'Mummy', 'humanoid', ['#e6d9b8', '#b9a98a', '#7dffb0'], { head: 'mummy', body: 'wrap', weapon: 'none' }, ['curse', '裹尸布诅咒', '#7dffb0', '#eafff2'], { tr: ['drain'] }),
          M('石棺怪', 'Sarcophagus Mimic', 'object', ['#c9a24a', '#1e3a8a', '#22d3ee'], { v: 'chest' }, ['slash', '千年之噬', '#f5c542', '#ffffff'], { tr: ['drain'] }),
          M('阿努比斯卫士', 'Anubis Guard', 'humanoid', ['#2a2a3a', '#c9a24a', '#ffd166'], { head: 'jackal', body: 'armor', weapon: 'spear' }, ['darts', '审判之矛', '#ffd166', '#ffffff'], { elite: 1 }),
          M('诅咒之眼', 'Cursed Eye', 'eye', ['#b8860b', '#8a5a2b', '#22d3ee'], { flames: 1 }, ['beam', '荷鲁斯射线', '#22d3ee', '#ffffff'], { tr: ['fade'] }),
          M('眼镜王蛇', 'King Cobra', 'serpent', ['#3a3a2a', '#c9a24a', '#ffd166'], { hood: 1 }, ['breath', '毒液喷射', '#b6ff3a', '#f2ffd0'], { tr: ['venom'] }),
          M('陶罐幽魂', 'Urn Ghost', 'ghost', ['#9ad1d4', '#c98a3c', '#22d3ee'], { v: 'urn' }, ['orb', '怨灵弹', '#9ad1d4', '#ffffff'], { tr: ['scramble'] }),
          M('黄金圣甲虫', 'Golden Scarab', 'bug', ['#f5c542', '#8a5a2b', '#22d3ee'], { v: 'beetle', gold: 1 }, ['pillar', '太阳圣光', '#ffe08a', '#ffffff'], { elite: 1, tr: ['armor'], ult: ['thunderstorm', '烈日天罚'] }),
        ] },
        { name: '法老陵墓', mons: [
          M('灯神', 'Djinn', 'ghost', ['#5b7cfa', '#c9a24a', '#ff4fd8'], { v: 'djinn' }, ['vortex', '许愿漩涡', '#5b7cfa', '#ff4fd8'], { tr: ['reverse'] }),
          M('黄金面具', 'Golden Mask', 'object', ['#f5c542', '#1e3a8a', '#22d3ee'], { v: 'mask' }, ['beam', '法老之瞳', '#22d3ee', '#ffffff'], { tr: ['fade'] }),
          M('帝王巨蝎', 'Emperor Scorpion', 'bug', ['#3a1f4a', '#1a0f2a', '#ff4d4d'], { v: 'scorpion' }, ['spikes', '地刺', '#5a2d6a', '#ff4d4d'], { tr: ['rage'], size: 1.15 }),
          M('斯芬克斯', 'Sphinx', 'beast', ['#d9a05b', '#f1dca7', '#f5c542'], { v: 'sphinx' }, ['curse', '谜语诅咒', '#f5c542', '#fff7d6'], { elite: 1, tr: ['multi'] }),
          M('烈日鹰', 'Sun Hawk', 'bird', ['#c96f1e', '#ffd166', '#ff4d2e'], { v: 'hawk' }, ['fireball', '日炎', '#ff8a3d', '#ffe08a'], { tr: ['haste'] }),
          M('骷髅祭司', 'Skeleton Priest', 'humanoid', ['#5a2d82', '#c9a24a', '#7dffb0'], { head: 'skull', body: 'robe', weapon: 'staff', hood: '#5a2d82' }, ['curse', '亡者之咒', '#7dffb0', '#eafff2'], { tr: ['drain'] }),
          M('沙虫幼体', 'Sandworm Larva', 'serpent', ['#c98a6a', '#a0603a', '#ff8a3d'], { maw: 1 }, ['spikes', '沙底突袭', '#c98a6a', '#fff1c9'], { elite: 1, ult: ['quake', '吞沙'] }),
          M('不朽法老·拉美斯', 'Pharaoh Ramess', 'humanoid', ['#f1e5c0', '#1e3a8a', '#f5c542'], { head: 'pharaoh', body: 'robe', weapon: 'staff', boss: 1, cape: '#1e3a8a', skin: '#d9b08c' }, ['pillar', '太阳神罚', '#ffe08a', '#ffffff'], { boss: 1, size: 1.26, tr: ['drain'], ult: ['sandstorm', '灭世沙暴'] }),
        ] },
      ],
    },

    /* ============================ 冰封雪域 · 初中 ============================ */
    {
      id: 'snow', name: '冰封雪域', en: 'Frozen Tundra', icon: '❄️', bank: 'JH', tier: 3, color: '#7fdbff', accent: '#dff6ff',
      desc: '极光照耀的万年冰原，寒风中沉睡着古老的冰龙。',
      levels: [
        { name: '雪松林地', mons: [
          M('雪球史莱姆', 'Snow Slime', 'slime', ['#dff3ff', '#a9d6f5', '#7df9ff'], { eyes: 2, core: 1 }, ['orb', '雪球', '#dff3ff', '#ffffff']),
          M('雪花精灵', 'Snowflake Sprite', 'elemental', ['#e8f6ff', '#bfe9ff', '#7df9ff'], { v: 'star', iris: '#3a6ea5' }, ['orb', '雪花弹', '#dff3ff', '#ffffff']),
          M('雪兔', 'Snow Hare', 'beast', ['#f4f8ff', '#ffffff', '#ff8fa3'], { v: 'hare' }, ['darts', '冰凌', '#bfe9ff', '#ffffff']),
          M('冰晶精灵', 'Ice Sprite', 'elemental', ['#8fdcff', '#c9f0ff', '#ffffff'], { v: 'crystal' }, ['darts', '冰晶', '#8fdcff', '#ffffff']),
        ] },
        { name: '冰封湖面', mons: [
          M('雪鸮', 'Snowy Owl', 'bird', ['#eef4ff', '#cfd8e6', '#ffd166'], { v: 'owl' }, ['wave', '寒风', '#cfeaff', '#ffffff']),
          M('冰湖蟹', 'Ice Crab', 'bug', ['#7cc6e8', '#3a8fc9', '#ffffff'], { v: 'crab' }, ['slash', '冰钳', '#bfe9ff', '#ffffff']),
          M('霜甲虫', 'Frost Beetle', 'bug', ['#5fa8d3', '#1b4965', '#caf0f8'], { v: 'beetle' }, ['boulder', '冰球', '#bfe9ff', '#ffffff']),
          M('冰蛇', 'Ice Serpent', 'serpent', ['#7cc6e8', '#caf0f8', '#ffffff'], { ice: 1 }, ['breath', '寒息', '#bfe9ff', '#ffffff'], { tr: ['haste'] }),
          M('捣蛋雪人', 'Naughty Snowman', 'golem', ['#cfe8ff', '#3a3558', '#e5484d'], { v: 'snow' }, ['boulder', '雪球轰炸', '#eef7ff', '#bfe9ff']),
        ] },
        { name: '暴风山口', mons: [
          M('霜狼', 'Frost Wolf', 'beast', ['#cfe6f5', '#ffffff', '#7df9ff'], { v: 'wolf', crystal: 1 }, ['slash', '霜牙', '#bfe9ff', '#ffffff'], { tr: ['haste'] }),
          M('雪原野猪', 'Snow Boar', 'beast', ['#dfe7f2', '#ffffff', '#7df9ff'], { v: 'boar' }, ['boulder', '冰原冲撞', '#dfe7f2', '#bfe9ff']),
          M('雪怪幼崽', 'Yeti Cub', 'golem', ['#eef4ff', '#8fb4d9', '#3a5a8a'], { v: 'yeti' }, ['boulder', '雪块', '#eef7ff', '#bfe9ff'], { size: 0.8 }),
          M('寒冰幽魂', 'Frost Wraith', 'ghost', ['#9fd8ff', '#3a5a8a', '#7df9ff'], { v: 'wraith' }, ['curse', '冰封诅咒', '#7df9ff', '#ffffff'], { tr: ['fade'] }),
          M('冰锥菇', 'Icicle Shroom', 'mushroom', ['#6fb7e6', '#e8f6ff', '#ffffff'], { icicles: 1, flat: 1 }, ['rain', '冰锥雨', '#bfe9ff', '#ffffff']),
          M('风雪鹰', 'Blizzard Hawk', 'bird', ['#6f8fb5', '#e8f6ff', '#7df9ff'], { v: 'hawk' }, ['tornado', '暴风雪', '#cfeaff', '#ffffff'], { elite: 1, ult: ['thunderstorm', '极地雷暴'] }),
        ] },
        { name: '水晶冰窟', mons: [
          M('水晶蜘蛛', 'Crystal Spider', 'bug', ['#7fb8e6', '#b9e2ff', '#ff7de9'], { v: 'spider', glow: 1 }, ['darts', '冰丝', '#ff7de9', '#ffffff'], { tr: ['scramble'] }),
          M('冰棘蝎', 'Frost Scorpion', 'bug', ['#5fa8d3', '#1b4965', '#7df9ff'], { v: 'scorpion' }, ['darts', '冰毒针', '#7df9ff', '#ffffff'], { tr: ['venom'] }),
          M('冰晶魔像', 'Ice Golem', 'golem', ['#8fd3ff', '#d6f3ff', '#ffffff'], { v: 'ice', spikes: 1 }, ['spikes', '冰刺', '#bfe9ff', '#ffffff'], { elite: 1, tr: ['armor'] }),
          M('极光水母', 'Aurora Jelly', 'tentacle', ['#7dffcf', '#c084fc', '#7df9ff'], { v: 'jelly' }, ['bolt', '极光电击', '#7dffcf', '#ffffff'], { tr: ['fade'] }),
          M('冰霜之眼', 'Frost Eye', 'eye', ['#5a8fc9', '#b9e2ff', '#7df9ff'], { tent: 4, mini: 2 }, ['beam', '冻结射线', '#7df9ff', '#ffffff']),
          M('猛犸', 'Mammoth', 'beast', ['#8a6a4f', '#c9a58a', '#e8f6ff'], { v: 'mammoth' }, ['boulder', '巨象践踏', '#8a6a4f', '#e8f6ff'], { tr: ['rage'], size: 1.12 }),
          M('冰巫', 'Ice Witch', 'humanoid', ['#3a6ea5', '#c9e8ff', '#7df9ff'], { head: 'witch', body: 'robe', weapon: 'wand', skin: '#cfe8ff', hair: '#ffffff' }, ['rain', '冰雹术', '#bfe9ff', '#ffffff'], { elite: 1, tr: ['drain'], ult: ['shadowveil', '永夜极寒'] }),
        ] },
        { name: '永冻王座', mons: [
          M('雪原巨怪', 'Yeti', 'golem', ['#f4f8ff', '#8fb4d9', '#ffd166'], { v: 'yeti' }, ['boulder', '雪崩', '#eef7ff', '#bfe9ff'], { tr: ['rage'], size: 1.14 }),
          M('冰翼石像鬼', 'Ice Gargoyle', 'bird', ['#8fd3ff', '#d6f3ff', '#7df9ff'], { v: 'gargoyle' }, ['rain', '冰锥坠落', '#bfe9ff', '#ffffff'], { tr: ['fade'] }),
          M('冰牙剑齿虎', 'Sabertooth', 'beast', ['#b9d6ee', '#ffffff', '#7df9ff'], { v: 'tiger' }, ['slash', '剑齿撕裂', '#bfe9ff', '#ffffff'], { tr: ['haste'] }),
          M('霜骨骑士', 'Frostbone Knight', 'humanoid', ['#4a6a8a', '#9fc4e0', '#7df9ff'], { head: 'skull', body: 'armor', weapon: 'sword', shield: 1, wglow: 1 }, ['slash', '霜之哀伤', '#7df9ff', '#ffffff'], { elite: 1, tr: ['armor'] }),
          M('暴雪元素', 'Blizzard Elemental', 'elemental', ['#cfe8ff', '#9fd8ff', '#7df9ff'], { v: 'blizzard' }, ['tornado', '冰风暴', '#cfeaff', '#ffffff'], { tr: ['multi'] }),
          M('冰川巨蟒', 'Glacier Wyrm', 'serpent', ['#3a8fc9', '#b9e2ff', '#ffffff'], { ice: 1, horns: 1 }, ['breath', '冰川吐息', '#bfe9ff', '#ffffff'], { tr: ['venom'] }),
          M('雪女', 'Yuki-onna', 'ghost', ['#eaf6ff', '#c9e2ff', '#7df9ff'], { v: 'yuki' }, ['cloud', '冰雪之吻', '#dff3ff', '#ffffff'], { elite: 1, tr: ['reverse'], ult: ['thunderstorm', '千里冰封'] }),
          M('冰霜巨龙·尼弗海姆', 'Frost Dragon Niflheim', 'dragon', ['#5fa8d3', '#e8f6ff', '#7df9ff'], { boss: 1, frost: 1 }, ['breath', '极寒吐息', '#bfe9ff', '#ffffff'], { boss: 1, size: 1.26, tr: ['rage'], ult: ['absolutezero', '绝对零度'] }),
        ] },
      ],
    },

    /* ============================ 幽影古堡 · 高中 ============================ */
    {
      id: 'castle', name: '幽影古堡', en: 'Shadow Castle', icon: '🏰', bank: 'SH', tier: 4, color: '#a78bfa', accent: '#ef4444',
      desc: '月光下的古堡深处，亡灵与血族在长廊中游荡。',
      levels: [
        { name: '城堡外庭', mons: [
          M('骷髅兵', 'Skeleton Soldier', 'humanoid', ['#8a8272', '#c9c2b0', '#ff5d5d'], { head: 'skull', body: 'rags', weapon: 'sword' }, ['slash', '锈剑劈砍', '#d9d2c0', '#ffffff']),
          M('墓园乌鸦', 'Graveyard Crow', 'bird', ['#23202e', '#3a3550', '#ff2e4d'], { v: 'hawk' }, ['darts', '黑羽', '#3a3550', '#c9c2ff']),
          M('吸血蝙蝠', 'Vampire Bat', 'bird', ['#3a2a4a', '#7a1f3a', '#ff2e4d'], { v: 'bat' }, ['swarm', '蝠群', '#3a2a4a', '#ff2e4d']),
          M('墓地鬼火', 'Grave Wisp', 'elemental', ['#7b6cff', '#3a2f8a', '#e0d9ff'], { v: 'flame' }, ['fireball', '幽冥火', '#7b6cff', '#e0d9ff']),
        ] },
        { name: '幽暗长廊', mons: [
          M('游荡盔甲', 'Haunted Armor', 'humanoid', ['#5a6272', '#9aa4b5', '#7dffb0'], { head: 'helm', body: 'armor', weapon: 'spear' }, ['darts', '幽魂之枪', '#7dffb0', '#ffffff']),
          M('墓穴菇', 'Crypt Shroom', 'mushroom', ['#8a8fa8', '#d9d9e6', '#7dffb0'], { flat: 1, glow: 1 }, ['cloud', '腐朽孢子', '#7dffb0', '#eafff2']),
          M('瘟疫巨鼠', 'Plague Rat', 'beast', ['#6b5a5a', '#b59a9a', '#ff8fa3'], { v: 'rat' }, ['cloud', '瘟疫', '#8fae3a', '#d4ff5e'], { tr: ['haste'] }),
          M('烛台幽灵', 'Candle Ghost', 'ghost', ['#f3efe6', '#ffffff', '#ff9a3d'], { v: 'candle' }, ['fireball', '烛火', '#ff9a3d', '#fff2a8']),
          M('石像鬼', 'Gargoyle', 'bird', ['#6b7280', '#9ca3af', '#ff5d5d'], { v: 'gargoyle' }, ['boulder', '碎石', '#6b7280', '#9ca3af']),
        ] },
        { name: '禁忌书库', mons: [
          M('魔典', 'Grimoire', 'object', ['#6b1f3a', '#c9a24a', '#c084fc'], { v: 'book' }, ['orb', '奥术飞弹', '#c084fc', '#f5e1ff'], { tr: ['scramble'] }),
          M('书库猫头鹰', 'Library Owl', 'bird', ['#4a3a6a', '#c9b8e6', '#ffd166'], { v: 'owl' }, ['wave', '噤声', '#c9b8e6', '#ffffff']),
          M('女巫学徒', 'Witch Apprentice', 'humanoid', ['#4a2d82', '#c9a24a', '#ff7de9'], { head: 'witch', body: 'robe', weapon: 'wand', small: 1, skin: '#f2c9a0', hair: '#e5484d' }, ['orb', '魔法飞弹', '#ff7de9', '#ffffff']),
          M('幽灵管家', 'Ghost Butler', 'ghost', ['#cfd6ff', '#ffffff', '#e5484d'], { v: 'butler' }, ['darts', '银餐刀', '#dfe7f2', '#ffffff'], { tr: ['haste'] }),
          M('墨水软泥', 'Ink Ooze', 'slime', ['#2a2a4a', '#4a4a7a', '#7df9ff'], { eyes: 1, drip: 1, horns: 1, iris: '#7df9ff' }, ['cloud', '墨雾', '#2a2a4a', '#7df9ff'], { tr: ['venom'] }),
          M('禁咒之眼', 'Arcane Eye', 'eye', ['#5a2d82', '#8a4fc9', '#ff7de9'], { wings: 1 }, ['beam', '禁咒射线', '#ff7de9', '#ffffff'], { elite: 1, ult: ['thunderstorm', '奥术雷暴'] }),
        ] },
        { name: '地下墓穴', mons: [
          M('宝箱怪', 'Mimic', 'object', ['#8a5a2b', '#c9a24a', '#ff5d5d'], { v: 'chest' }, ['slash', '贪婪啃咬', '#ffd166', '#ffffff'], { tr: ['drain'] }),
          M('骷髅弓手', 'Skeleton Archer', 'humanoid', ['#5a5a6a', '#8a8272', '#7dffb0'], { head: 'skull', body: 'rags', weapon: 'bow' }, ['rain', '骨箭雨', '#e9e4d4', '#ffffff']),
          M('食尸鬼', 'Ghoul', 'humanoid', ['#5a5a4a', '#8a8a6a', '#b6ff3a'], { head: 'ghoul', body: 'rags', weapon: 'none', hunch: 1, skin: '#9aa88a' }, ['slash', '腐爪', '#b6ff3a', '#f2ffd0'], { tr: ['venom'] }),
          M('骨蛇', 'Bone Serpent', 'serpent', ['#e9e4d4', '#c9c2b0', '#7dffb0'], { bone: 1 }, ['darts', '骨刺', '#e9e4d4', '#ffffff'], { tr: ['fade'] }),
          M('墓穴蜘蛛', 'Crypt Spider', 'bug', ['#4a1f2a', '#7a2f3a', '#ff2e4d'], { v: 'spider' }, ['swarm', '小蜘蛛群', '#4a1f2a', '#ff2e4d'], { tr: ['scramble'] }),
          M('飘浮头骨', 'Floating Skull', 'skull', ['#e9e4d4', '#3ad6c0', '#7dffb0'], {}, ['fireball', '灵魂之火', '#3ad6c0', '#d6fff6'], { tr: ['haste'] }),
          M('墓穴死神', 'Crypt Reaper', 'humanoid', ['#1f1a2e', '#3a2f5a', '#7dffb0'], { head: 'hood', body: 'robe', weapon: 'scythe', wglow: 1 }, ['curse', '收割', '#7dffb0', '#eafff2'], { elite: 1, tr: ['armor'], ult: ['shadowveil', '死亡降临'] }),
        ] },
        { name: '王座大厅', mons: [
          M('黑骑士', 'Black Knight', 'humanoid', ['#2a2a3a', '#4a4a5a', '#ff2e4d'], { head: 'helm', body: 'armor', weapon: 'sword', horns: 1, cape: '#5a0f1f', shield: 1 }, ['slash', '黑暗斩', '#ff2e4d', '#ffffff'], { elite: 1, tr: ['armor'] }),
          M('诅咒水晶球', 'Cursed Orb', 'object', ['#3a2a6a', '#c9a24a', '#ff7de9'], { v: 'orb' }, ['curse', '厄运预言', '#ff7de9', '#ffe4fb'], { tr: ['reverse'] }),
          M('地狱犬', 'Hellhound', 'beast', ['#3a1f1f', '#7a2f1f', '#ff6b35'], { v: 'hound', heads2: 1 }, ['breath', '地狱火', '#ff6b35', '#ffd166'], { tr: ['rage'] }),
          M('死灵法师', 'Necromancer', 'humanoid', ['#2a1f4a', '#7dffb0', '#7dffb0'], { head: 'skull', body: 'robe', weapon: 'staff', hood: '#1f1a2e', cape: '#2a1f4a' }, ['curse', '亡灵召唤', '#7dffb0', '#eafff2'], { tr: ['drain'] }),
          M('血眼魔', 'Blood Eye', 'eye', ['#7a0f1f', '#c2255c', '#ff2e4d'], { tent: 6, mini: 3 }, ['beam', '血光', '#ff2e4d', '#ffffff'], { tr: ['multi'] }),
          M('钢铁魔像', 'Iron Golem', 'golem', ['#6b7280', '#9ca3af', '#ff9a3d'], { v: 'iron' }, ['boulder', '铁拳', '#6b7280', '#9ca3af'], { elite: 1, tr: ['armor'], ult: ['quake', '铁壁崩山'] }),
          M('暗影刺客', 'Shadow Assassin', 'humanoid', ['#2a2a3a', '#5a5a7a', '#c084fc'], { head: 'hood', body: 'tunic', weapon: 'dagger', cape: '#1a1a2a' }, ['slash', '背刺', '#c084fc', '#ffffff'], { tr: ['haste', 'fade'] }),
          M('血族伯爵·德古恩', 'Count Dragoon', 'humanoid', ['#2a1a2e', '#7a0f1f', '#ff2e4d'], { head: 'vampire', body: 'robe', weapon: 'none', boss: 1, cape: '#7a0f1f', wings: 'bat', crown: 1, skin: '#e6e0f0' }, ['swarm', '血蝠风暴', '#3a0a1a', '#ff2e4d'], { boss: 1, size: 1.22, tr: ['drain'], ult: ['bloodmoon', '血月降临'] }),
        ] },
      ],
    },

    /* ============================ 灭世火山 · IBT ============================ */
    {
      id: 'volcano', name: '灭世火山', en: 'Doom Volcano', icon: '🌋', bank: 'IBT', tier: 5, color: '#ff6b35', accent: '#ffd166',
      desc: '岩浆奔涌的活火山，只有真正的学者才能全身而退。',
      levels: [
        { name: '焦土荒原', mons: [
          M('熔岩史莱姆', 'Magma Slime', 'slime', ['#ff6b35', '#a3200d', '#ffd166'], { eyes: 2, core: 1, fang: 1, angry: 1 }, ['fireball', '熔岩弹', '#ff6b35', '#ffd166']),
          M('炭火刺猬', 'Ember Hedgehog', 'beast', ['#3a3030', '#ff8a3d', '#ffd166'], { v: 'hedgehog' }, ['darts', '火刺', '#ff8a3d', '#ffe08a']),
          M('火花小鬼', 'Ember Imp', 'humanoid', ['#a3200d', '#3a1f1f', '#ffd166'], { head: 'imp', body: 'rags', weapon: 'none', small: 1, skin: '#ff7a59', tail: 1 }, ['orb', '火花', '#ff9a3d', '#fff2a8']),
          M('灰烬蝠', 'Ash Bat', 'bird', ['#4a4040', '#8a5a4a', '#ff9a3d'], { v: 'bat' }, ['wave', '热浪', '#ff9a3d', '#fff2a8']),
        ] },
        { name: '硫磺矿洞', mons: [
          M('黑曜石甲虫', 'Obsidian Beetle', 'bug', ['#2a2433', '#15111c', '#ff6b35'], { v: 'beetle' }, ['boulder', '黑曜石弹', '#2a2433', '#ff6b35'], { fire: 1 }),
          M('烈焰花', 'Fire Blossom', 'plant', ['#ff6b35', '#5a3a2a', '#ffd166'], { v: 'flower', angry: 1 }, ['fireball', '花火', '#ff6b35', '#ffd166']),
          M('火蜥蜴', 'Salamander', 'beast', ['#e5484d', '#ffb199', '#ffd166'], { v: 'lizard' }, ['breath', '烈焰吐息', '#ff6b35', '#ffd166'], { tr: ['haste'] }),
          M('硫磺菇', 'Sulfur Shroom', 'mushroom', ['#e8c11c', '#f6ead0', '#ff6b35'], { flat: 1, glow: 1, angry: 1 }, ['cloud', '硫磺烟', '#e8c11c', '#fff2a8']),
          M('煤精', 'Coal Sprite', 'elemental', ['#3a3030', '#1f1a1a', '#ff8a3d'], { v: 'rock' }, ['boulder', '燃煤', '#3a3030', '#ff8a3d'], { fire: 1 }),
        ] },
        { name: '熔岩之河', mons: [
          M('熔岩巨蟒', 'Lava Serpent', 'serpent', ['#a3200d', '#ff9a3d', '#ffd166'], { horns: 1 }, ['breath', '岩浆喷吐', '#ff6b35', '#ffd166'], { tr: ['venom'] }),
          M('岩浆水母', 'Magma Jelly', 'tentacle', ['#ff8a3d', '#ffd166', '#ff4d2e'], { v: 'jelly', angry: 1 }, ['bolt', '灼流', '#ff8a3d', '#ffe08a']),
          M('火焰元素', 'Flame Elemental', 'elemental', ['#ff7a1a', '#a3200d', '#ffe066'], { v: 'flame' }, ['fireball', '爆炎', '#ff7a1a', '#ffe066']),
          M('岩浆蟹', 'Magma Crab', 'bug', ['#c2410c', '#7a1f0a', '#ffd166'], { v: 'crab' }, ['slash', '熔钳', '#ff9a3d', '#ffffff']),
          M('炎狼', 'Fire Wolf', 'beast', ['#8a2a0f', '#ffb199', '#ff9a3d'], { v: 'hound' }, ['slash', '炎牙', '#ff9a3d', '#ffffff'], { tr: ['haste'] }),
          M('灰烬萨满', 'Ash Shaman', 'humanoid', ['#5a4040', '#c2410c', '#ff9a3d'], { head: 'goblin', body: 'tunic', weapon: 'staff', skin: '#9a9a9a' }, ['meteor', '流星火', '#ff6b35', '#ffd166'], { elite: 1, ult: ['quake', '熔岩喷涌'] }),
        ] },
        { name: '火山锻炉', mons: [
          M('锻炉魔像', 'Forge Golem', 'golem', ['#3a2a2a', '#1f1a1a', '#ff8a3d'], { v: 'lava' }, ['boulder', '熔铁重拳', '#3a2a2a', '#ff8a3d'], { elite: 1, tr: ['armor'], fire: 1 }),
          M('火蛛', 'Fire Spider', 'bug', ['#2a1a1a', '#5a2a1a', '#ff6b35'], { v: 'spider', glow: 1 }, ['swarm', '火蛛群', '#ff6b35', '#ffd166'], { tr: ['scramble'] }),
          M('炎魔之眼', 'Eye of Flame', 'eye', ['#7a1f0a', '#c2410c', '#ffd166'], { flames: 1, tent: 3 }, ['beam', '灼热射线', '#ff9a3d', '#ffffff'], { tr: ['fade'] }),
          M('火焰女祭司', 'Flame Priestess', 'humanoid', ['#a3200d', '#ffd166', '#ff9a3d'], { head: 'priestess', body: 'robe', weapon: 'wand', skin: '#f2c9a0' }, ['pillar', '炎柱', '#ff9a3d', '#fff2a8'], { tr: ['scramble'] }),
          M('熔火蝎', 'Molten Scorpion', 'bug', ['#ff6b35', '#7a1f0a', '#ffe066'], { v: 'scorpion' }, ['spikes', '熔岩地刺', '#ff6b35', '#ffe066'], { tr: ['venom'] }),
          M('燃烧头骨', 'Blazing Skull', 'skull', ['#3a2c2c', '#ff6b35', '#ffe066'], { horns: 1 }, ['fireball', '颅骨烈焰', '#ff6b35', '#ffe066'], { tr: ['haste'] }),
          M('熔核', 'Molten Core', 'object', ['#3a2a2a', '#8a5a2b', '#ff8a3d'], { v: 'orb' }, ['beam', '核心射线', '#ff8a3d', '#ffffff'], { elite: 1, tr: ['drain'], ult: ['thunderstorm', '熔火风暴'] }),
        ] },
        { name: '灭世火口', mons: [
          M('凤凰', 'Phoenix', 'bird', ['#ff6b35', '#ffd166', '#ff9a3d'], { v: 'phoenix' }, ['fireball', '涅槃之火', '#ff6b35', '#ffd166'], { tr: ['drain'] }),
          M('熔岩巨虫', 'Magma Worm', 'serpent', ['#7a1f0a', '#ff6b35', '#ffd166'], { maw: 1 }, ['spikes', '熔岩喷发', '#ff6b35', '#ffd166'], { tr: ['venom'] }),
          M('炎魔卫士', 'Balrog Guard', 'humanoid', ['#3a1f1f', '#7a1f0a', '#ff8a3d'], { head: 'demon', body: 'armor', weapon: 'sword', wglow: 1, skin: '#c2410c', wings: 'bat' }, ['slash', '炎魔之剑', '#ff8a3d', '#ffffff'], { elite: 1, tr: ['rage'] }),
          M('熔岩巨人', 'Lava Titan', 'golem', ['#5a2a1a', '#ff9a3d', '#ffd166'], { v: 'lava', spikes: 1 }, ['boulder', '山崩', '#5a2a1a', '#ff9a3d'], { tr: ['armor'], size: 1.18, fire: 1 }),
          M('焦木树人', 'Charred Treant', 'treant', ['#2a1f1a', '#c2410c', '#ffd166'], {}, ['rain', '火雨', '#ff6b35', '#ffd166'], { tr: ['multi'] }),
          M('火龙幼崽', 'Drake Whelp', 'dragon', ['#c2410c', '#ffd166', '#ff9a3d'], { small: 1 }, ['breath', '幼龙吐息', '#ff6b35', '#ffd166'], { tr: ['haste'] }),
          M('灾厄星', 'Calamity Star', 'elemental', ['#ff9a3d', '#a3200d', '#ffe066'], { v: 'star', iris: '#5a1408' }, ['meteor', '灾星坠落', '#ff6b35', '#ffd166'], { elite: 1, tr: ['reverse'], ult: ['shadowveil', '灰烬蔽日'] }),
          M('灭世炎龙·伊格尼斯', 'Inferno Dragon Ignis', 'dragon', ['#a3200d', '#ffb347', '#ffd166'], { boss: 1 }, ['breath', '灭世龙息', '#ff6b35', '#ffd166'], { boss: 1, size: 1.26, tr: ['rage'], ult: ['meteorfall', '陨星天降'] }),
        ] },
      ],
    },

    /* ============================ 虚空星界 · GRE ============================ */
    {
      id: 'void', name: '虚空星界', en: 'Astral Void', icon: '🌌', bank: 'GRE', tier: 6, color: '#c084fc', accent: '#22d3ee',
      desc: '现实的尽头、星辰破碎之处——终极的词汇试炼。',
      levels: [
        { name: '星尘回廊', mons: [
          M('星尘史莱姆', 'Stardust Slime', 'slime', ['#5b3fd9', '#2a1a6a', '#7df9ff'], { eyes: 2, stars: 1 }, ['orb', '星尘弹', '#7c6cff', '#e0d9ff']),
          M('虚空蝠', 'Void Bat', 'bird', ['#3a1f6a', '#7c3aed', '#22d3ee'], { v: 'bat' }, ['wave', '虚空回响', '#7c3aed', '#22d3ee']),
          M('虚空水母', 'Void Jelly', 'tentacle', ['#c084fc', '#ff4fd8', '#7df9ff'], { v: 'jelly', angry: 1 }, ['bolt', '虚空电流', '#c084fc', '#ffffff']),
          M('星辉精灵', 'Starlight Sprite', 'elemental', ['#ffe066', '#ffb703', '#ffffff'], { v: 'star' }, ['darts', '星屑', '#ffe066', '#ffffff']),
        ] },
        { name: '破碎浮岛', mons: [
          M('棱镜晶体', 'Prism Shard', 'object', ['#b9e2ff', '#ff7de9', '#7dffb0'], { v: 'crystal' }, ['beam', '折射光', '#ff7de9', '#ffffff']),
          M('星界蘑菇', 'Astral Shroom', 'mushroom', ['#3a2f8a', '#c9c2ff', '#7df9ff'], { cone: 1, glow: 1 }, ['cloud', '星孢', '#7c6cff', '#7df9ff']),
          M('虚空蠕虫', 'Void Worm', 'serpent', ['#3a1f6a', '#7c3aed', '#22d3ee'], { maw: 1 }, ['vortex', '吞噬', '#7c3aed', '#22d3ee'], { tr: ['haste'] }),
          M('影翼', 'Shadow Wing', 'bird', ['#2a1a4a', '#c084fc', '#7df9ff'], { v: 'phoenix' }, ['wave', '暗影之翼', '#c084fc', '#ffffff']),
          M('陨石魔像', 'Meteor Golem', 'golem', ['#3a2f4a', '#1f1a2a', '#ff7de9'], { v: 'meteor' }, ['meteor', '陨石', '#ff7de9', '#ffe4fb']),
        ] },
        { name: '镜像迷宫', mons: [
          M('镜像幽灵', 'Mirror Phantom', 'ghost', ['#b9c7ff', '#c9a24a', '#7df9ff'], { v: 'mirror' }, ['orb', '镜像弹', '#b9c7ff', '#ffffff'], { tr: ['scramble'] }),
          M('虚空蝎', 'Void Scorpion', 'bug', ['#2a1a6a', '#12082e', '#ff4fd8'], { v: 'scorpion' }, ['darts', '虚空毒刺', '#ff4fd8', '#ffffff'], { tr: ['venom'] }),
          M('千眼', 'Thousand Eyes', 'eye', ['#3a1f6a', '#7c3aed', '#ff4fd8'], { mini: 5, tent: 3 }, ['beam', '千重视线', '#ff4fd8', '#ffffff'], { tr: ['multi'] }),
          M('符文面具', 'Rune Mask', 'object', ['#1f2a5a', '#22d3ee', '#ff4fd8'], { v: 'mask' }, ['curse', '符文禁制', '#22d3ee', '#e0fbff'], { tr: ['fade'] }),
          M('星界猎虎', 'Astral Stalker', 'beast', ['#2a1a6a', '#7df9ff', '#ff4fd8'], { v: 'tiger' }, ['slash', '相位撕裂', '#7df9ff', '#ffffff'], { tr: ['haste'] }),
          M('虚空术士', 'Void Warlock', 'humanoid', ['#2a1a6a', '#7c3aed', '#22d3ee'], { head: 'hood', body: 'robe', weapon: 'staff', cape: '#1a0f3a' }, ['vortex', '虚空裂隙', '#7c3aed', '#22d3ee'], { elite: 1, tr: ['reverse'], ult: ['shadowveil', '虚无凝视'] }),
        ] },
        { name: '时间裂隙', mons: [
          M('时钟魔偶', 'Clockwork Golem', 'golem', ['#b8860b', '#c9a24a', '#7df9ff'], { v: 'gear' }, ['darts', '齿轮飞刃', '#c9a24a', '#ffffff'], { elite: 1, tr: ['armor'] }),
          M('噬梦花', 'Dream Eater', 'plant', ['#7c3aed', '#2a1a6a', '#22d3ee'], { v: 'maneater' }, ['slash', '噬梦', '#c084fc', '#ffffff'], { tr: ['reverse'] }),
          M('熵之软泥', 'Entropy Ooze', 'slime', ['#2a2233', '#ff4fd8', '#22d3ee'], { eyes: 3, spikes: 1, core: 1, fang: 1, iris: '#ff4fd8' }, ['cloud', '熵增', '#ff4fd8', '#22d3ee'], { tr: ['drain'] }),
          M('触手魔', 'Tentacle Horror', 'tentacle', ['#5a1f6a', '#8a2fa0', '#b6ff3a'], { v: 'horror' }, ['slash', '触手鞭笞', '#b6ff3a', '#ffffff'], { tr: ['venom'] }),
          M('裂隙蟹', 'Rift Crab', 'bug', ['#22a7c9', '#1f2a5a', '#ff4fd8'], { v: 'crab' }, ['bolt', '裂隙电弧', '#22d3ee', '#ffffff'], { tr: ['scramble'] }),
          M('星座之蛇', 'Constellation Serpent', 'serpent', ['#1f1a5a', '#7c3aed', '#ffe066'], { stars: 1, hood: 1 }, ['rain', '流星雨', '#ffe066', '#ffffff'], { tr: ['fade'] }),
          M('虚无头骨', 'Null Skull', 'skull', ['#c9c2ff', '#7c3aed', '#22d3ee'], { crown: 1 }, ['fireball', '虚无之火', '#7c3aed', '#22d3ee'], { elite: 1, tr: ['multi'], ult: ['thunderstorm', '时间风暴'] }),
        ] },
        { name: '万象终焉', mons: [
          M('虚空骑士', 'Void Knight', 'humanoid', ['#1f1a3a', '#3a2f6a', '#c084fc'], { head: 'helm', body: 'armor', weapon: 'scythe', wglow: 1, cape: '#2a1a6a', horns: 1 }, ['slash', '虚空斩', '#c084fc', '#ffffff'], { elite: 1, tr: ['armor'] }),
          M('虚空巨像', 'Void Colossus', 'golem', ['#3a2f8a', '#c084fc', '#7df9ff'], { v: 'ice', spikes: 1 }, ['spikes', '晶刺', '#c084fc', '#7df9ff'], { tr: ['armor'], size: 1.15 }),
          M('星界幼龙', 'Astral Drake', 'dragon', ['#3a2f8a', '#c084fc', '#7df9ff'], { small: 1 }, ['breath', '星辉吐息', '#c084fc', '#7df9ff'], { tr: ['haste'] }),
          M('混沌元素', 'Chaos Elemental', 'elemental', ['#ff4fd8', '#7c3aed', '#22d3ee'], { v: 'chaos' }, ['vortex', '混沌漩涡', '#ff4fd8', '#22d3ee'], { tr: ['scramble', 'multi'] }),
          M('噬星者', 'Star Eater', 'tentacle', ['#2a1a6a', '#7c3aed', '#ff4fd8'], { v: 'eater' }, ['vortex', '噬星', '#7c3aed', '#ff4fd8'], { tr: ['drain'], size: 1.14 }),
          M('命运织者', 'Fate Weaver', 'bug', ['#e8e4ff', '#c9c2ff', '#ffd166'], { v: 'spider', glow: 1 }, ['curse', '命运丝线', '#ffd166', '#ffffff'], { tr: ['reverse'] }),
          M('终焉天使', 'Angel of the End', 'humanoid', ['#f5f3ff', '#c9c2ff', '#ffd166'], { head: 'angel', body: 'robe', weapon: 'spear', wings: 'feather', halo: 1, hair: '#f5f3ff' }, ['pillar', '终焉审判', '#ffd166', '#ffffff'], { elite: 1, tr: ['rage'], ult: ['quake', '天崩'] }),
          M('虚空之主·阿扎索斯', 'Void Overlord Azathos', 'eye', ['#2a1a6a', '#7c3aed', '#ff4fd8'], { boss: 1, tent: 7, mini: 4, crown: 1 }, ['beam', '湮灭射线', '#ff4fd8', '#ffffff'], { boss: 1, size: 1.26, tr: ['multi', 'rage'], ult: ['blackhole', '黑洞坍缩'] }),
        ] },
      ],
    },
    /* ============================ 回声殿堂 · PET 口语 ============================
     * kind: 'speak' 的场景不用词库：怪兽（考官）提问，玩家开口回答，按回答质量决定施法还是挨打。
     * 关卡的 sp.part 对应 PET 口语的 Part 1–4；'mock' 是把四个部分连起来的完整模考。
     * free: 1 表示不用通关上一关就能进入（四个部分可以单独练）。 */
    {
      id: 'echo', kind: 'speak', name: '回声殿堂', en: 'Hall of Echoes', icon: '🎙️', tier: 3, color: '#ff8fb1', accent: '#ffd166',
      desc: 'PET 口语考场：这里的怪兽不看选择题，只有开口说英语才能施法。',
      levels: [
        { name: '初次见面', sub: 'Part 1 · 问答', sp: { part: 1 }, free: 1, mons: [
          M('回声史莱姆', 'Echo Slime', 'slime', ['#ff9ec4', '#d6588f', '#fff0f7'], { eyes: 2, stars: 1 }, ['wave', '回声波', '#ff9ec4', '#ffffff']),
          M('学舌鹦鹉', 'Parrot Mimic', 'bird', ['#3fbf6a', '#ffd166', '#e5484d'], { v: 'hawk' }, ['darts', '连珠问', '#ffd166', '#ffffff']),
          M('迎宾管家', 'Greeter Butler', 'ghost', ['#d9e2f5', '#8fa3c9', '#ffd166'], { v: 'butler' }, ['orb', '问候弹', '#c7d6ff', '#ffffff']),
          M('问号蘑菇', 'Question Shroom', 'mushroom', ['#7a5fd0', '#efe6ff', '#ffd166'], { flat: 1, glow: 1 }, ['cloud', '疑问孢子', '#b39dff', '#fff2c2']),
          M('好奇小鬼', 'Curious Imp', 'humanoid', ['#3a2a5a', '#5a4a8a', '#7df9ff'], { head: 'imp', body: 'rags', weapon: 'none', small: 1, skin: '#7fd6c0', tail: 1 }, ['orb', '好奇心', '#7df9ff', '#ffffff']),
          M('书虫', 'Bookworm', 'serpent', ['#6cc04a', '#f6e2b0', '#e5484d'], {}, ['spikes', '翻页', '#c9e88a', '#ffffff']),
        ] },
        { name: '画中世界', sub: 'Part 2 · 看图说话', sp: { part: 2 }, free: 1, mons: [
          M('画框魔镜', 'Portrait Mirror', 'ghost', ['#c9a24a', '#8fd0f5', '#ffffff'], { v: 'mirror' }, ['beam', '镜中光', '#8fd0f5', '#ffffff']),
          M('调色精灵', 'Palette Sprite', 'elemental', ['#ff8fb1', '#ffd166', '#7df9ff'], { v: 'crystal' }, ['rain', '颜料雨', '#ff8fb1', '#7df9ff']),
          M('画廊之眼', 'Gallery Eye', 'eye', ['#3f7fc4', '#f5c542', '#ffffff'], { wings: 1 }, ['beam', '凝视', '#f5c542', '#ffffff']),
        ] },
        { name: '双人议事', sub: 'Part 3 · 合作讨论', sp: { part: 3 }, free: 1, mons: [
          M('双头议员', 'Twin Debater', 'beast', ['#8a5a8a', '#e6c9e6', '#ffd166'], { v: 'hound', heads2: 1 }, ['slash', '左右夹击', '#e6c9e6', '#ffffff'], { elite: 1, hp: 4 }),
          M('议事长老', 'Council Elder', 'humanoid', ['#3b2a6a', '#c9a24a', '#ffd166'], { head: 'hood', body: 'robe', weapon: 'staff', cape: '#2a1a4a' }, ['curse', '反驳', '#c084fc', '#ffe4fb'], { elite: 1, hp: 4 }),
        ] },
        { name: '畅所欲言', sub: 'Part 4 · 延伸讨论', sp: { part: 4 }, free: 1, mons: [
          M('辩论面具', 'Debate Mask', 'object', ['#f5f3ff', '#3b2a6a', '#ff8fb1'], { v: 'mask' }, ['beam', '质问', '#ff8fb1', '#ffffff']),
          M('雄辩猫头鹰', 'Eloquent Owl', 'bird', ['#6b5a8a', '#efe6ff', '#ffd166'], { v: 'owl' }, ['wave', '滔滔不绝', '#c4b5fd', '#ffffff']),
          M('思辨水晶', 'Thinking Orb', 'object', ['#2a3a7a', '#c9a24a', '#7df9ff'], { v: 'orb' }, ['orb', '追问', '#7df9ff', '#ffffff']),
          M('哲人齿轮', 'Clockwork Thinker', 'golem', ['#b98a5a', '#5a4a3a', '#ffd166'], { v: 'gear' }, ['boulder', '逻辑重锤', '#c9a06a', '#ffd166']),
          M('演说精灵', 'Orator Elf', 'humanoid', ['#f5f3ff', '#ff8fb1', '#ffd166'], { head: 'priestess', body: 'robe', weapon: 'wand', skin: '#f2c9a0' }, ['pillar', '金句', '#ffd166', '#ffffff']),
        ] },
        { name: '终极模考', sub: '完整口语考试 · Part 1–4', sp: { part: 'mock' }, mons: [
          M('主考官·赛琳', 'Chief Examiner Selene', 'humanoid', ['#f5f3ff', '#c9a24a', '#ff8fb1'], { head: 'angel', body: 'robe', weapon: 'staff', wings: 'feather', halo: 1, hair: '#f5f3ff', boss: 1 }, ['pillar', '评分之光', '#ffd166', '#ffffff'], { boss: 1, size: 1.3, ult: ['thunderstorm', '最终裁决'] }),
        ] },
      ],
    },
    /* ============================ 潮音海湾 · PET 听力 ============================
     * kind: 'listen' 的场景也不用词库：怪兽放出一段"录音"，玩家听完作答。
     * 关卡的 sp.part 对应 PET 听力的 Part 1–4；'mock' 是 25 题的完整模考。
     * Part 3 / Part 4 一段录音有 6 道题，所以那两关的怪兽各有 6 格血。 */
    {
      id: 'cove', kind: 'listen', name: '潮音海湾', en: 'Tidesong Cove', icon: '🎧', tier: 3, color: '#3ad6c0', accent: '#ffd166',
      desc: 'PET 听力考场：海湾里的怪兽把秘密藏在声音里，听懂了才能施法。',
      levels: [
        { name: '浅滩回声', sub: 'Part 1 · 看图选择', sp: { part: 1 }, free: 1, mons: [
          M('海螺史莱姆', 'Conch Slime', 'slime', ['#5fd6c8', '#2a8f8a', '#eafffb'], { eyes: 1 }, ['orb', '水泡弹', '#7df9ff', '#ffffff']),
          M('回音水母', 'Echo Jelly', 'tentacle', ['#b39dff', '#7a5fd0', '#ffd6f5'], { v: 'jelly' }, ['wave', '回音波', '#c4b5fd', '#ffffff']),
          M('潮汐蟹', 'Tide Crab', 'bug', ['#e5694a', '#f6c9a0', '#ffe066'], { v: 'crab' }, ['slash', '钳击', '#ff9a7a', '#ffffff']),
          M('信使海鸥', 'Gull Courier', 'bird', ['#f1f4f8', '#8fa3b5', '#ffb703'], { v: 'hawk' }, ['darts', '羽箭', '#dfe9f5', '#ffffff']),
          M('珊瑚菇', 'Coral Shroom', 'mushroom', ['#ff7a8a', '#ffe1d6', '#7df9ff'], { cone: 1, glow: 1 }, ['cloud', '珊瑚雾', '#ff9aa8', '#fff2c2']),
          M('雾笛幽灵', 'Foghorn Wraith', 'ghost', ['#9fb8c9', '#dfeaf2', '#7df9ff'], { v: 'wraith' }, ['wave', '雾笛', '#b9dcee', '#ffffff']),
          M('小水龙卷', 'Waterspout', 'elemental', ['#4aa8e0', '#b9e9fb', '#ffffff'], { v: 'tornado' }, ['tornado', '水龙卷', '#7fd0f2', '#ffffff']),
        ] },
        { name: '礁石私语', sub: 'Part 2 · 短对话选择', sp: { part: 2 }, free: 1, mons: [
          M('窃听蝠', 'Eavesdrop Bat', 'bird', ['#3b4a6b', '#6b7fa5', '#7df9ff'], { v: 'bat' }, ['wave', '超声波', '#9fb8ff', '#ffffff']),
          M('私语海蛇', 'Whisper Eel', 'serpent', ['#2f8f8a', '#9be5d0', '#ffd166'], { rattle: 1 }, ['spikes', '缠绕', '#5fd6c8', '#eafffb']),
          M('八卦章鱼', 'Gossip Octopus', 'tentacle', ['#e86a8a', '#ffc2d1', '#ffe066'], { v: 'eater' }, ['curse', '墨汁咒', '#7a5fd0', '#ffe4fb']),
          M('贝壳魔像', 'Shell Golem', 'golem', ['#e6d3b0', '#b99a6a', '#7df9ff'], { v: 'sand' }, ['boulder', '贝壳投掷', '#e6d3b0', '#ffffff']),
          M('漂流宝箱', 'Driftwood Chest', 'object', ['#7a5a3a', '#3ad6c0', '#ffe066'], { v: 'chest' }, ['slash', '海盗之咬', '#ffd166', '#ffffff']),
          M('海妖学徒', 'Siren Apprentice', 'humanoid', ['#2a6f8a', '#3ad6c0', '#ffd166'], { head: 'witch', body: 'robe', weapon: 'wand', small: 1, skin: '#cfe8ff', hair: '#3ad6c0' }, ['orb', '摄魂歌', '#3ad6c0', '#ffffff']),
        ] },
        { name: '灯塔广播', sub: 'Part 3 · 笔记填空', sp: { part: 3 }, free: 1, mons: [
          M('灯塔之眼', 'Lighthouse Eye', 'eye', ['#f5c542', '#3b4a6b', '#fff3b0'], { flames: 1 }, ['beam', '探照光', '#fff3b0', '#ffffff'], { elite: 1, hp: 6 }),
          M('广播铁卫', 'Broadcast Sentinel', 'golem', ['#6b7a8a', '#3b4a5a', '#3ad6c0'], { v: 'iron' }, ['bolt', '电波', '#7df9ff', '#ffffff'], { elite: 1, hp: 6 }),
        ] },
        { name: '深海访谈', sub: 'Part 4 · 访谈选择', sp: { part: 4 }, free: 1, mons: [
          M('访谈女妖', 'Interview Banshee', 'ghost', ['#b8f2e6', '#e9fff9', '#ff8fb1'], { v: 'banshee' }, ['wave', '连环提问', '#b8f2e6', '#ffffff'], { elite: 1, hp: 6 }),
          M('电台海龙', 'Radio Sea Dragon', 'dragon', ['#2f7fa5', '#b9e9fb', '#ffd166'], { small: 1 }, ['breath', '潮汐吐息', '#7fd0f2', '#eafffb'], { elite: 1, hp: 6 }),
        ] },
        { name: '终极模考', sub: '完整听力考试 · 25 题', sp: { part: 'mock' }, mons: [
          M('深渊聆听者·克拉肯', 'Kraken the Listener', 'tentacle', ['#2a3a7a', '#7a5fd0', '#3ad6c0'], { v: 'horror' }, ['vortex', '深海漩涡', '#3ad6c0', '#c4b5fd'], { boss: 1, size: 1.3, ult: ['blackhole', '万籁俱寂'] }),
        ] },
      ],
    },
  ];

  // 给每只怪兽编号，并建立索引
  const index = {};
  SCENES.forEach((sc) => sc.levels.forEach((lv, li) => lv.mons.forEach((m, mi) => {
    m.id = sc.id + '-' + (li + 1) + '-' + (mi + 1);
    m.tr = m.tr || [];
    m.size = m.size || (m.elite ? 1.1 : 1);
    index[m.id] = { def: m, scene: sc, li };
  })));

  EG.Scenes = SCENES;
  EG.sceneById = (id) => SCENES.find((s) => s.id === id) || SCENES[0];
  EG.monsterIndex = index;

  /** 特性说明（界面与战斗共用） */
  EG.TRAITS = {
    haste: { n: '疾速', d: '吟唱更快，答题时间缩短' },
    armor: { n: '护甲', d: '多一层生命，需要多命中一次' },
    fade: { n: '隐匿', d: '单词出现后很快隐去' },
    scramble: { n: '幻术', d: '选项会在中途换位' },
    reverse: { n: '逆咒', d: '给出中文，选择对应的英文' },
    multi: { n: '多重', d: '六个选项' },
    drain: { n: '吸血', d: '你答错时它会回血' },
    venom: { n: '剧毒', d: '命中后让你持续掉血' },
    rage: { n: '狂暴', d: '攻击伤害更高' },
  };
})();
