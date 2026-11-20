/* ============================================================
   潮汐手札 · Tidewater Notes
   单文件网页垂钓手札
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 工具 ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt = (n) => Math.round(n).toLocaleString('zh-CN');

  /* ---------------- 数据 ---------------- */
  const WATERS = [
    {
      id: 'brook', name: '溪涧', time: '晨', sub: '浅滩 · 卵石',
      price: 0,
      shallow: 1.9, maxDepth: 11,
      sky: ['#F5EBD6', '#E6D1AB'], sun: '#DFA96B', sunPos: 0.76,
      water: ['#A9C4BA', '#2F5D60'], hill: 'rgba(84,106,100,.26)',
      weed: 0.9, note: '水浅流急，小鱼成群。'
    },
    {
      id: 'lake', name: '湖库', time: '午后', sub: '中水 · 芦苇',
      price: 120,
      shallow: 2.8, maxDepth: 26,
      sky: ['#F8E8C9', '#E7C094'], sun: '#D9965A', sunPos: 0.2,
      water: ['#9CBBB0', '#234F53'], hill: 'rgba(70,92,88,.3)',
      weed: 0.6, note: '四大家鱼的地盘，深浅交界最好钓。'
    },
    {
      id: 'bay', name: '江湾', time: '黄昏', sub: '深水 · 乱石',
      price: 380,
      shallow: 3.8, maxDepth: 38,
      sky: ['#F0D2B2', '#C6785A'], sun: '#C4573A', sunPos: 0.86,
      water: ['#7F9C98', '#102C36'], hill: 'rgba(44,60,66,.4)',
      weed: 0.4, note: '大物的地盘。也藏着不该带走的东西。'
    }
  ];

  // layer: surface 上层 / mid 中下层 / bottom 底层
  const FISH = [
    /* 溪涧 */
    { id: 'makou', no: 1, name: '马口鱼', latin: 'Opsariichthys bidens', water: 'brook', layer: 'surface', minD: 0, maxD: 6, baits: ['spinner', 'dough'], w: [0.05, 0.3], value: 16, rarity: 'common', pull: 0.62, escape: 1.5, desc: '嘴大而上翘，见饵就抢的溪流小霸王。亮片一过水面就能把它逗出来。' },
    { id: 'baitiao', no: 2, name: '白条', latin: 'Hemiculter leucisculus', water: 'brook', layer: 'surface', minD: 0, maxD: 8, baits: ['dough', 'worm'], w: [0.03, 0.2], value: 11, rarity: 'common', pull: 0.45, escape: 1.7, desc: '成群抢食，钓其它鱼时最烦的常客。可它上钩的那一下，浮标动作最漂亮。' },
    { id: 'kuanqi', no: 3, name: '宽鳍鱲', latin: 'Zacco platypus', water: 'brook', layer: 'mid', minD: 1, maxD: 8, baits: ['spinner', 'dough'], w: [0.04, 0.22], value: 20, rarity: 'common', pull: 0.7, escape: 1.35, desc: '婚姻色一上来，体侧像被人抹了一道虹。水清的地方才看得到这种颜色。' },
    { id: 'pangpi', no: 4, name: '中华鳑鲏', latin: 'Rhodeus sinensis', water: 'brook', layer: 'mid', minD: 1, maxD: 6, baits: ['dough', 'worm'], w: [0.01, 0.06], value: 26, rarity: 'uncommon', pull: 0.4, escape: 1.8, desc: '巴掌大的镜片，雄鱼发色时像一枚掉进水里的铜扣。它把卵产在河蚌里。' },
    { id: 'guangchun', no: 5, name: '光唇鱼', latin: 'Acrossocheilus fasciatus', water: 'brook', layer: 'bottom', minD: 2, maxD: 12, baits: ['worm', 'corn'], w: [0.08, 0.5], value: 30, rarity: 'uncommon', pull: 0.95, escape: 1.1, desc: '溪石斑。唇厚得像被砂纸磨过，专门啃石头上的藻。中钩后往石缝里钻。' },
    { id: 'xiahua', no: 6, name: '溪吻虾虎', latin: 'Rhinogobius duospilus', water: 'brook', layer: 'bottom', minD: 1, maxD: 7, baits: ['worm'], w: [0.02, 0.11], value: 34, rarity: 'uncommon', pull: 0.5, escape: 1.6, desc: '趴在卵石上一动不动，等你把蚯蚓送到嘴边。腹鳍愈合成一个吸盘。' },

    /* 湖库 */
    { id: 'jiyu', no: 7, name: '鲫鱼', latin: 'Carassius auratus', water: 'lake', layer: 'bottom', minD: 1, maxD: 20, baits: ['worm', 'dough', 'corn'], w: [0.1, 1.0], value: 14, rarity: 'common', pull: 0.75, escape: 1.2, desc: '有水就有它。四季可钓，冬天往深水挪。浮标轻轻上顶两目，就是它。' },
    { id: 'bianyu', no: 8, name: '鳊鱼', latin: 'Parabramis pekinensis', water: 'lake', layer: 'mid', minD: 3, maxD: 18, baits: ['corn', 'dough'], w: [0.2, 1.4], value: 22, rarity: 'common', pull: 0.85, escape: 1.15, desc: '身子侧扁成菱形，吃饵文静。中钩后横着走，像在水里推一扇门。' },
    { id: 'lianyu', no: 9, name: '鲢鱼', latin: 'Hypophthalmichthys molitrix', water: 'lake', layer: 'surface', minD: 2, maxD: 16, baits: ['dough'], w: [1, 7], value: 38, rarity: 'uncommon', pull: 1.25, escape: 0.9, desc: '滤食浮游生物，得钓浮。中钩那一下像挂住了水下的马达。' },
    { id: 'liyu', no: 10, name: '鲤鱼', latin: 'Cyprinus carpio', water: 'lake', layer: 'bottom', minD: 2, maxD: 22, baits: ['corn', 'worm'], w: [0.5, 7], value: 46, rarity: 'uncommon', pull: 1.15, escape: 0.95, desc: '两对须，拱泥找食。老鲤鱼精得很，浮标要先点两下再抬——那是它在试。' },
    { id: 'caoyu', no: 11, name: '草鱼', latin: 'Ctenopharyngodon idella', water: 'lake', layer: 'mid', minD: 3, maxD: 21, baits: ['corn', 'dough'], w: [1, 10], value: 54, rarity: 'uncommon', pull: 1.3, escape: 0.9, desc: '啃草的大家伙，夏天最活跃。第一波冲刺能直接把线拉出声音。' },
    { id: 'yongyu', no: 12, name: '鳙鱼', latin: 'Hypophthalmichthys nobilis', water: 'lake', layer: 'surface', minD: 3, maxD: 19, baits: ['dough'], w: [2, 11], value: 60, rarity: 'uncommon', pull: 1.35, escape: 0.85, desc: '胖头鱼。头占了身体三分之一，滤食为生，得用雾化的饵把它留在水层里。' },
    { id: 'huangsang', no: 13, name: '黄颡鱼', latin: 'Tachysurus fulvidraco', water: 'lake', layer: 'bottom', minD: 2, maxD: 16, baits: ['worm'], w: [0.05, 0.45], value: 42, rarity: 'uncommon', pull: 0.8, escape: 1.2, desc: '黄辣丁。昼伏夜出，背鳍和胸鳍的硬刺带毒，摘钩要捏住它脖子后面。' },
    { id: 'qiaozui', no: 14, name: '翘嘴鲌', latin: 'Culter alburnus', water: 'lake', layer: 'surface', minD: 4, maxD: 26, baits: ['spinner'], w: [0.3, 3.8], value: 105, rarity: 'rare', pull: 1.55, escape: 1.1, desc: '嘴往上翘，追小鱼追到水面炸开。晨昏是它的窗口期，亮片贴着表层抽。' },
    { id: 'qingyu', no: 15, name: '青鱼', latin: 'Mylopharyngodon piceus', water: 'lake', layer: 'bottom', minD: 8, maxD: 30, baits: ['corn', 'worm'], w: [3, 26], value: 170, rarity: 'rare', pull: 1.85, escape: 0.7, desc: '螺蛳青。一辈子在啃螺蛳，把咽齿磨成了石板。深水底钓，是耐心的赌注。' },

    /* 江湾 */
    { id: 'luofei', no: 16, name: '罗非鱼', latin: 'Oreochromis niloticus', water: 'bay', layer: 'mid', minD: 2, maxD: 14, baits: ['dough', 'worm'], w: [0.2, 1.6], value: 22, rarity: 'common', pull: 0.9, escape: 1.2, desc: '外来物种，南方水域到处都是。耐高温、护崽凶。请勿放生到自然水域。' },
    { id: 'luyu', no: 17, name: '鲈鱼', latin: 'Lateolabrax maculatus', water: 'bay', layer: 'mid', minD: 3, maxD: 22, baits: ['spinner'], w: [0.4, 4.5], value: 68, rarity: 'uncommon', pull: 1.2, escape: 1.05, desc: '在乱流里伏击，侧线能感到水里的震动。亮片要在它视线里横着窜过去。' },
    { id: 'nianyu', no: 18, name: '鲶鱼', latin: 'Silurus asotus', water: 'bay', layer: 'bottom', minD: 3, maxD: 24, baits: ['worm'], w: [0.5, 6], value: 60, rarity: 'uncommon', pull: 1.25, escape: 0.9, desc: '无鳞，滑得抓不住。昼伏夜出，靠须找食。桥洞和石缝是它的门口。' },
    { id: 'heiyu', no: 19, name: '黑鱼', latin: 'Channa argus', water: 'bay', layer: 'mid', minD: 2, maxD: 13, baits: ['frog'], w: [0.8, 5.5], value: 98, rarity: 'rare', pull: 1.5, escape: 1.0, desc: '乌鳢，水草区的伏击手。有鳃上器能直接呼吸空气，离水也能撑很久。' },
    { id: 'guiyu', no: 20, name: '鳜鱼', latin: 'Siniperca chuatsi', water: 'bay', layer: 'bottom', minD: 4, maxD: 21, baits: ['worm', 'spinner'], w: [0.3, 2.8], value: 118, rarity: 'rare', pull: 1.35, escape: 1.0, desc: '终生只吃活鱼活虾。躲在乱石里，一口下去，钩已经到胃里了。' },
    { id: 'manyu', no: 21, name: '鳗鲡', latin: 'Anguilla japonica', water: 'bay', layer: 'bottom', minD: 6, maxD: 28, baits: ['worm'], w: [0.4, 2.2], value: 145, rarity: 'rare', pull: 1.4, escape: 1.15, desc: '夜里逆流而上，产卵要回到几千公里外的深海。它能缠住石头把线磨断。' },
    { id: 'ganyu', no: 22, name: '鳡鱼', latin: 'Elopichthys bambusa', water: 'bay', layer: 'surface', minD: 6, maxD: 30, baits: ['spinner'], w: [3, 20], value: 280, rarity: 'legend', pull: 1.95, escape: 1.0, desc: '水老虎。体型像一枚鱼雷，追鱼群时整片水面都在炸。江湾的传说。' },
    { id: 'zhonghuaxun', no: 23, name: '中华鲟', latin: 'Acipenser sinensis', water: 'bay', layer: 'bottom', minD: 10, maxD: 34, baits: ['worm'], w: [6, 40], value: 0, rarity: 'legend', pull: 2.0, escape: 0.55, protected: true, desc: '国家一级保护野生动物。一亿四千万年前就在长江里洄游，如今野外种群极危。钓到请立即放流。' },
    { id: 'yanzhiyu', no: 24, name: '胭脂鱼', latin: 'Myxocyprinus asiaticus', water: 'bay', layer: 'bottom', minD: 6, maxD: 26, baits: ['worm', 'corn'], w: [1, 9], value: 0, rarity: 'rare', protected: true, pull: 1.5, escape: 0.8, desc: '国家二级保护野生动物。幼鱼身上有三道黑横带，成鱼通体胭脂红。钓到请放流。' }
  ];

  const BAITS = [
    { id: 'worm', name: '蚯蚓', price: 0, desc: '通杀底层。鲫、鲤、黄颡、鲶都吃。' },
    { id: 'dough', name: '面饵', price: 0, desc: '雾化快，招小鱼也招鲢鳙。' },
    { id: 'corn', name: '玉米', price: 60, desc: '鲤、草、鳊的偏爱。挂钩牢，抗小鱼。' },
    { id: 'spinner', name: '亮片', price: 140, desc: '假饵。只骗掠食鱼：翘嘴、鲈、鳡。' },
    { id: 'frog', name: '雷蛙', price: 220, desc: '专攻草洞里的黑鱼。别的鱼不理它。' }
  ];

  const RODS = [
    { lv: 1, name: '竹制手竿', price: 0, maxPower: 0.62, bite: 0.92, desc: '溪边随手削的竹子。抛不远，但握着手熟。' },
    { lv: 2, name: '玻纤矶竿', price: 150, maxPower: 0.82, bite: 1.12, desc: '抛得更远，能摸到深水。咬钩窗口也更宽裕。' },
    { lv: 3, name: '碳素远投', price: 420, maxPower: 1.0, bite: 1.35, desc: '轻、硬、远。江湾的大物才够得着。' }
  ];

  const LINES = [
    { lv: 1, name: '尼龙 2.0 号', price: 0, max: 100, reel: 1.0, desc: '细线口好，但张力上限低，大物容易崩。' },
    { lv: 2, name: '尼龙 3.0 号', price: 200, max: 130, reel: 1.1, desc: '稳妥之选。断线概率明显下降。' },
    { lv: 3, name: '编织大力马', price: 520, max: 165, reel: 1.22, desc: '几乎拉不断的线。收线也更快。' }
  ];

  const RARITY = {
    common: { name: '常见', color: '#6C7B7D' },
    uncommon: { name: '少见', color: '#2F6F73' },
    rare: { name: '稀有', color: '#A9803A' },
    legend: { name: '传说', color: '#BE4A2F' }
  };
  const LAYER_NAME = { surface: '上层', mid: '中下层', bottom: '底层' };

  // 鱼拓用的体色与体型
  const TONE = {
    makou: '#9AA878', baitiao: '#CBCDB6', kuanqi: '#A3B08A', pangpi: '#B9A6A2',
    guangchun: '#7F8C77', xiahua: '#8A7A62', jiyu: '#A2987C', bianyu: '#B4B69C',
    lianyu: '#C2C7B9', liyu: '#AD9066', caoyu: '#8F9B79', yongyu: '#8F9187',
    huangsang: '#C0913F', qiaozui: '#C8CAB9', qingyu: '#5F6F6B', luofei: '#8C9388',
    luyu: '#A9AEA4', nianyu: '#6F6B5F', heiyu: '#505B51', guiyu: '#9D906F',
    manyu: '#7B6F5B', ganyu: '#9EAE9E', zhonghuaxun: '#7E8C8E', yanzhiyu: '#B0604A'
  };
  const SHAPE = {
    makou: 'torpedo', baitiao: 'torpedo', kuanqi: 'torpedo', pangpi: 'deep',
    guangchun: 'torpedo', xiahua: 'goby', jiyu: 'deep', bianyu: 'deep',
    lianyu: 'torpedo', liyu: 'deep', caoyu: 'torpedo', yongyu: 'torpedo',
    huangsang: 'catfish', qiaozui: 'torpedo', qingyu: 'torpedo', luofei: 'deep',
    luyu: 'perch', nianyu: 'catfish', heiyu: 'snake', guiyu: 'perch',
    manyu: 'snake', ganyu: 'torpedo', zhonghuaxun: 'sturgeon', yanzhiyu: 'deep'
  };

  /* ---------------- 存档 ---------------- */
  const SAVE_KEY = 'tidewater-notes-v1';
  const defaultSave = () => ({
    coins: 80, rep: 0, rod: 1, line: 1,
    baits: ['worm', 'dough'], waters: ['brook'],
    water: 'brook', bait: 'worm', rig: 'surface',
    dex: {}, sound: true, seenHelp: false, casts: 0, catches: 0, released: 0, finished: false
  });
  let G = defaultSave();

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        G = Object.assign(defaultSave(), s);
        if (!Array.isArray(G.baits) || !G.baits.length) G.baits = ['worm', 'dough'];
        if (!Array.isArray(G.waters) || !G.waters.length) G.waters = ['brook'];
        if (!WATERS.some((w) => w.id === G.water)) G.water = 'brook';
        if (G.baits.indexOf(G.bait) < 0) G.bait = G.baits[0];
        if (!RODS.some((r) => r.lv === G.rod)) G.rod = 1;
        if (!LINES.some((l) => l.lv === G.line)) G.line = 1;
        G.coins = Math.max(0, Number(G.coins) || 0);
        G.dex = G.dex && typeof G.dex === 'object' ? G.dex : {};
      }
    } catch (e) { /* 存档损坏则用默认值 */ }
  }
  let saveTimer = 0;
  let skipSaveOnHide = false;
  let dirty = false;
  function writeSave() {
    dirty = false;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { }
  }
  function save() {
    dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(writeSave, 120);
  }

  /* ---------------- 运行状态 ---------------- */
  const S = {
    phase: 'idle',      // idle | charging | flying | waiting | nibble | bite | fight | result
    t: 0, power: 0, powerDir: 1,
    biteAt: 0, nibbleAt: 0, nibbleEnd: 0, nibbleDone: false, biteEnd: 0,
    flight: null, sweet: false, shake: 0,
    bobber: { x: 0, y: 0, dip: 0 },
    targetX: 0, fish: null, weight: 0, fight: null,
    ripples: [], particles: []
  };

  const water = () => WATERS.find((w) => w.id === G.water) || WATERS[0];
  const rod = () => RODS.find((r) => r.lv === G.rod) || RODS[0];
  const line = () => LINES.find((l) => l.lv === G.line) || LINES[0];

  /* ---------------- 画布 ---------------- */
  const cvs = $('#scene');
  const ctx = cvs.getContext('2d');
  let W = 800, H = 450, SURF = 162, DPR = 1, SCALE = 1;
  let seabedPts = [], stones = [], weeds = [], fishShadows = [], clouds = [], rays = [], glints = [], ridge = [], motes = [];

  function resize() {
    const rect = cvs.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(320, rect.width);
    H = Math.max(220, rect.height);
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    SURF = H * 0.355;
    SCALE = clamp(H / 460, 0.6, 1.6);
    buildScenery();
  }

  const pxPerM = () => (H - SURF - 30 * SCALE) / water().maxDepth;

  function depthAt(x) {
    const w = water();
    const x0 = W * 0.06, x1 = W * 0.95;
    const t = clamp((x - x0) / (x1 - x0), 0, 1);
    // 近岸平缓，随后陡降
    return w.shallow + (w.maxDepth - w.shallow) * Math.pow(t, 1.35);
  }
  function seabedY(x) { return SURF + depthAt(x) * pxPerM(); }

  function buildScenery() {
    seabedPts = [];
    const step = Math.max(8, W / 100);
    for (let x = -10; x <= W + 10; x += step) {
      const bump = Math.sin(x * 0.017) * 4 + Math.sin(x * 0.045 + 1.7) * 2.4 + Math.sin(x * 0.11 + 0.4) * 1.1;
      seabedPts.push({ x, y: seabedY(x) + bump * SCALE });
    }
    stones = [];
    for (let i = 0; i < 30; i++) {
      const x = rnd(W * 0.05, W * 1.01);
      stones.push({ x, y: seabedY(x) + rnd(-1, 7) * SCALE, r: rnd(1.8, 6.5) * SCALE, a: rnd(0.08, 0.26) });
    }
    weeds = [];
    const n = Math.round(16 * water().weed);
    for (let i = 0; i < n; i++) {
      const x = rnd(W * 0.02, W * 0.99);
      weeds.push({ x, y: seabedY(x), h: rnd(24, 84) * SCALE, ph: rnd(0, 6.28), bend: rnd(-9, 9) });
    }
    clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({ x: rnd(0, W), y: rnd(H * 0.04, H * 0.2), s: rnd(0.55, 1.25), a: rnd(0.1, 0.22) });
    }
    rays = [];
    for (let i = 0; i < 5; i++) {
      rays.push({ x: rnd(W * 0.2, W * 0.98), w: rnd(30, 120) * SCALE, a: rnd(0.03, 0.075), ph: rnd(0, 6.28) });
    }
    glints = [];
    for (let i = 0; i < 26; i++) {
      glints.push({ x: rnd(0, W), y: SURF + rnd(2, 34) * SCALE, w: rnd(6, 26) * SCALE, ph: rnd(0, 6.28), a: rnd(0.12, 0.4) });
    }
    ridge = [];
    let ry = 0;
    for (let i = 0; i <= 14; i++) {
      ry = ry * 0.55 + rnd(-1, 1) * 0.45;
      ridge.push({ x: (i / 14) * W, h: (0.42 + ry * 0.5 + Math.abs(Math.sin(i * 1.7)) * 0.5) });
    }
    motes = [];
    for (let i = 0; i < 46; i++) {
      motes.push({
        x: rnd(0, W), d: rnd(0.05, 1), r: rnd(0.7, 2.1) * SCALE,
        ph: rnd(0, 6.28), sp: rnd(2, 9), a: rnd(0.05, 0.2)
      });
    }
    if (!fishShadows.length) seedFish();
  }

  function seedFish() {
    fishShadows = [];
    const w = water();
    for (let i = 0; i < 6; i++) {
      const layer = pick(['surface', 'mid', 'bottom', 'bottom']);
      const maxD = layer === 'surface' ? 6 : layer === 'mid' ? w.maxDepth * 0.55 : w.maxDepth;
      const d = layer === 'surface' ? rnd(0.8, 3.6) : rnd(w.shallow + 1.2, Math.max(w.shallow + 2.4, maxD));
      fishShadows.push({
        x: rnd(W * 0.2, W * 0.95), d, layer, shape: pick(['torpedo', 'deep', 'torpedo']),
        size: rnd(5, 13) * SCALE, dir: Math.random() < 0.5 ? 1 : -1,
        sp: rnd(12, 30), ph: rnd(0, 6.28), alpha: rnd(0.08, 0.2), scare: 0
      });
    }
  }

  /* ---------------- 音效 ---------------- */
  let AC = null;
  function audio() {
    if (!G.sound) return null;
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { AC = new C(); } catch (e) { return null; }
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(freq, dur, type, vol, slideTo) {
    const ac = audio(); if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ac.currentTime + dur);
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(vol == null ? 0.1 : vol, ac.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + dur + 0.02);
  }
  function noiseBurst(dur, vol, freq, q) {
    const ac = audio(); if (!ac) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq || 900; bp.Q.value = q || 1;
    const g = ac.createGain(); g.gain.value = vol || 0.14;
    src.connect(bp); bp.connect(g); g.connect(ac.destination);
    src.start();
  }
  const SFX = {
    cast() { noiseBurst(0.22, 0.09, 1800, 1.2); tone(360, 0.16, 'sine', 0.04, 180); },
    splash() { noiseBurst(0.3, 0.12, 800, 0.8); },
    bite() { tone(660, 0.1, 'triangle', 0.09); setTimeout(() => tone(880, 0.14, 'triangle', 0.08), 90); },
    nibble() { tone(300, 0.06, 'sine', 0.045); },
    hook() { tone(420, 0.12, 'sawtooth', 0.06, 620); },
    snap() { tone(220, 0.4, 'sawtooth', 0.1, 60); noiseBurst(0.2, 0.09, 400, 0.6); },
    win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.24, 'triangle', 0.07), i * 90)); },
    fail() { tone(200, 0.3, 'sine', 0.07, 120); },
    coin() { tone(880, 0.08, 'square', 0.035); setTimeout(() => tone(1320, 0.1, 'square', 0.03), 70); },
    tick() { tone(1400, 0.02, 'square', 0.01); }
  };

  /* ---------------- 粒子 / 波纹 ---------------- */
  function ripple(x, y, r0, r1, dur, alpha) {
    S.ripples.push({ x, y, r: r0, r1, t: 0, dur: dur || 0.9, a: alpha || 0.4 });
  }
  function splash(x, y, n, force) {
    for (let i = 0; i < n; i++) {
      const a = rnd(-Math.PI * 0.92, -Math.PI * 0.08);
      const sp = rnd(50, 210) * (force || 1);
      S.particles.push({
        x, y, vx: Math.cos(a) * sp * 0.55, vy: Math.sin(a) * sp,
        life: rnd(0.32, 0.8), t: 0, r: rnd(1, 2.6) * SCALE, a: rnd(0.45, 0.9)
      });
    }
  }

  /* ---------------- 鱼拓（程序化鱼类插图） ---------------- */
  const PORTRAITS = {};
  function toneColor(f) { return TONE[f.id] || '#9A9078'; }

  function portrait(fish, w, h) {
    const key = fish.id + ':' + w + 'x' + h;
    if (PORTRAITS[key]) return PORTRAITS[key];
    const c = document.createElement('canvas');
    c.width = w * 2; c.height = h * 2;
    const g = c.getContext('2d');
    g.scale(2, 2);
    drawPortrait(g, fish, w, h);
    const url = c.toDataURL('image/png');
    PORTRAITS[key] = url;
    return url;
  }

  function drawPortrait(g, fish, w, h) {
    const shape = SHAPE[fish.id] || 'torpedo';
    const tone = toneColor(fish);
    const L = w * 0.66, Hb = h * 0.29;
    g.save();
    g.translate(w * 0.5, h * 0.52);
    const ink = 'rgba(24,38,40,.62)';

    // 尾鳍
    const tailX = -L * 0.46;
    const tailSpread = shape === 'deep' ? Hb * 0.95 : Hb * 0.82;
    g.beginPath();
    g.moveTo(tailX + L * 0.05, 0);
    g.quadraticCurveTo(tailX - L * 0.03, -tailSpread * 0.35, tailX - L * 0.11, -tailSpread);
    g.quadraticCurveTo(tailX - L * 0.04, 0, tailX - L * 0.11, tailSpread);
    g.quadraticCurveTo(tailX - L * 0.03, tailSpread * 0.35, tailX + L * 0.05, 0);
    g.closePath();
    g.globalAlpha = 0.85;
    g.fillStyle = shade(tone, -34);
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = ink; g.lineWidth = 0.7; g.stroke();
    g.strokeStyle = 'rgba(30,46,48,.22)';
    g.lineWidth = 0.5;
    for (let i = -1; i <= 1; i += 2) {
      g.beginPath();
      g.moveTo(tailX + L * 0.02, 0);
      g.lineTo(tailX - L * 0.09, tailSpread * i * 0.8);
      g.stroke();
    }

    // 背鳍
    g.beginPath();
    if (shape === 'snake') {
      g.moveTo(-L * 0.32, -Hb * 0.78);
      g.quadraticCurveTo(-L * 0.02, -Hb * 1.5, L * 0.32, -Hb * 0.7);
      g.lineTo(L * 0.3, -Hb * 0.55);
      g.lineTo(-L * 0.3, -Hb * 0.6);
    } else if (shape === 'sturgeon') {
      g.moveTo(-L * 0.02, -Hb * 0.82);
      g.quadraticCurveTo(L * 0.12, -Hb * 1.5, L * 0.24, -Hb * 0.68);
      g.lineTo(L * 0.1, -Hb * 0.55);
      g.lineTo(-L * 0.06, -Hb * 0.62);
    } else if (shape === 'perch') {
      g.moveTo(-L * 0.16, -Hb * 1.0);
      g.quadraticCurveTo(-L * 0.04, -Hb * 1.85, L * 0.08, -Hb * 1.05);
      g.lineTo(L * 0.08, -Hb * 0.6);
      g.lineTo(-L * 0.16, -Hb * 0.6);
    } else if (shape === 'deep') {
      g.moveTo(-L * 0.16, -Hb * 1.05);
      g.quadraticCurveTo(-L * 0.02, -Hb * 1.95, L * 0.14, -Hb * 0.95);
      g.lineTo(L * 0.12, -Hb * 0.6);
      g.lineTo(-L * 0.16, -Hb * 0.6);
    } else if (shape === 'catfish') {
      g.moveTo(-L * 0.24, -Hb * 0.72);
      g.quadraticCurveTo(-L * 0.16, -Hb * 1.3, -L * 0.04, -Hb * 0.7);
      g.lineTo(-L * 0.06, -Hb * 0.55);
      g.lineTo(-L * 0.24, -Hb * 0.58);
    } else if (shape === 'goby') {
      g.moveTo(-L * 0.2, -Hb * 0.85);
      g.lineTo(-L * 0.1, -Hb * 1.35);
      g.lineTo(0, -Hb * 0.85);
      g.lineTo(-L * 0.1, -Hb * 0.75);
      g.moveTo(L * 0.1, -Hb * 0.8);
      g.lineTo(L * 0.18, -Hb * 1.15);
      g.lineTo(L * 0.26, -Hb * 0.75);
    } else {
      g.moveTo(-L * 0.2, -Hb * 0.92);
      g.lineTo(-L * 0.04, -Hb * 1.55);
      g.lineTo(L * 0.14, -Hb * 0.9);
      g.lineTo(L * 0.1, -Hb * 0.6);
      g.lineTo(-L * 0.2, -Hb * 0.6);
    }
    g.closePath();
    g.globalAlpha = 0.9;
    g.fillStyle = shade(tone, -30);
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = ink; g.lineWidth = 0.7; g.stroke();

    // 身体
    g.beginPath();
    if (shape === 'deep') {
      g.moveTo(-L * 0.46, 0);
      g.bezierCurveTo(-L * 0.32, -Hb * 1.5, L * 0.08, -Hb * 1.5, L * 0.36, -Hb * 0.5);
      g.quadraticCurveTo(L * 0.46, -Hb * 0.12, L * 0.46, 0);
      g.quadraticCurveTo(L * 0.42, Hb * 0.5, L * 0.22, Hb * 0.9);
      g.bezierCurveTo(-L * 0.02, Hb * 1.25, -L * 0.3, Hb * 1.0, -L * 0.46, 0);
    } else if (shape === 'catfish') {
      g.moveTo(-L * 0.46, -Hb * 0.1);
      g.bezierCurveTo(-L * 0.2, -Hb * 0.7, L * 0.0, -Hb * 0.85, L * 0.24, -Hb * 0.72);
      g.quadraticCurveTo(L * 0.44, -Hb * 0.5, L * 0.46, -Hb * 0.05);
      g.quadraticCurveTo(L * 0.4, Hb * 0.72, L * 0.1, Hb * 0.7);
      g.bezierCurveTo(-L * 0.18, Hb * 0.66, -L * 0.36, Hb * 0.3, -L * 0.46, -Hb * 0.1);
    } else if (shape === 'snake') {
      g.moveTo(-L * 0.46, -Hb * 0.22);
      g.bezierCurveTo(-L * 0.1, -Hb * 0.95, L * 0.2, -Hb * 0.8, L * 0.4, -Hb * 0.4);
      g.quadraticCurveTo(L * 0.5, -Hb * 0.1, L * 0.46, 0);
      g.quadraticCurveTo(L * 0.44, Hb * 0.36, L * 0.2, Hb * 0.55);
      g.bezierCurveTo(-L * 0.12, Hb * 0.72, -L * 0.34, Hb * 0.36, -L * 0.46, -Hb * 0.22);
    } else if (shape === 'sturgeon') {
      g.moveTo(-L * 0.46, -Hb * 0.2);
      g.bezierCurveTo(-L * 0.1, -Hb * 0.9, L * 0.24, -Hb * 0.55, L * 0.4, -Hb * 0.18);
      g.quadraticCurveTo(L * 0.5, -Hb * 0.05, L * 0.44, 0);
      g.quadraticCurveTo(L * 0.42, Hb * 0.28, L * 0.1, Hb * 0.46);
      g.bezierCurveTo(-L * 0.16, Hb * 0.62, -L * 0.38, Hb * 0.28, -L * 0.46, -Hb * 0.2);
    } else if (shape === 'perch') {
      g.moveTo(-L * 0.46, 0);
      g.bezierCurveTo(-L * 0.3, -Hb * 1.2, L * 0.02, -Hb * 1.35, L * 0.28, -Hb * 0.72);
      g.quadraticCurveTo(L * 0.46, -Hb * 0.3, L * 0.46, -Hb * 0.02);
      g.quadraticCurveTo(L * 0.4, Hb * 0.6, L * 0.1, Hb * 0.82);
      g.bezierCurveTo(-L * 0.16, Hb * 0.9, -L * 0.38, Hb * 0.5, -L * 0.46, 0);
    } else if (shape === 'goby') {
      g.moveTo(-L * 0.44, -Hb * 0.1);
      g.bezierCurveTo(-L * 0.22, -Hb * 0.9, L * 0.06, -Hb * 1.0, L * 0.3, -Hb * 0.5);
      g.quadraticCurveTo(L * 0.44, -Hb * 0.18, L * 0.44, 0);
      g.quadraticCurveTo(L * 0.38, Hb * 0.6, L * 0.06, Hb * 0.78);
      g.bezierCurveTo(-L * 0.22, Hb * 0.86, -L * 0.38, Hb * 0.4, -L * 0.44, -Hb * 0.1);
    } else {
      // torpedo
      g.moveTo(-L * 0.46, 0);
      g.bezierCurveTo(-L * 0.28, -Hb * 0.95, L * 0.12, -Hb * 0.92, L * 0.38, -Hb * 0.34);
      g.quadraticCurveTo(L * 0.48, -Hb * 0.1, L * 0.48, 0);
      g.quadraticCurveTo(L * 0.46, Hb * 0.3, L * 0.24, Hb * 0.62);
      g.bezierCurveTo(-L * 0.04, Hb * 0.95, -L * 0.32, Hb * 0.62, -L * 0.46, 0);
    }
    g.closePath();

    const bg = g.createLinearGradient(0, -Hb * 1.4, 0, Hb * 1.2);
    bg.addColorStop(0, shade(tone, -28));
    bg.addColorStop(0.42, tone);
    bg.addColorStop(1, shade(tone, 46));
    g.fillStyle = bg;
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 0.9;
    g.stroke();

    // 鳞纹
    g.save();
    g.clip();
    g.strokeStyle = 'rgba(28,44,44,.07)';
    g.lineWidth = 0.55;
    for (let x = -L * 0.6; x < L * 0.5; x += 3.6) {
      g.beginPath();
      g.moveTo(x, -Hb * 1.7);
      g.lineTo(x + Hb * 2.2, Hb * 1.7);
      g.stroke();
    }
    // 高光
    const hg = g.createLinearGradient(0, -Hb, 0, Hb * 0.4);
    hg.addColorStop(0, 'rgba(255,250,238,.34)');
    hg.addColorStop(1, 'rgba(255,250,238,0)');
    g.fillStyle = hg;
    g.fillRect(-L * 0.5, -Hb * 1.5, L, Hb * 2.2);
    // 斑点（部分鱼种）
    if (['guiyu', 'heiyu', 'luyu', 'manyu'].indexOf(fish.id) >= 0) {
      g.fillStyle = 'rgba(28,44,44,.2)';
      for (let i = 0; i < 14; i++) {
        g.beginPath();
        g.ellipse(rnd(-L * 0.35, L * 0.3), rnd(-Hb * 0.7, Hb * 0.6), 1.6, 1.1, 0, 0, 6.2832);
        g.fill();
      }
    }
    // 鳃盖
    g.strokeStyle = 'rgba(24,40,40,.35)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(L * 0.2, -Hb * 0.55);
    g.quadraticCurveTo(L * 0.12, 0, L * 0.2, Hb * 0.6);
    g.stroke();
    g.restore();

    // 胸鳍
    g.beginPath();
    g.moveTo(L * 0.16, Hb * 0.1);
    g.quadraticCurveTo(L * 0.02, Hb * 1.0, L * 0.22, Hb * 0.66);
    g.closePath();
    g.fillStyle = 'rgba(30,46,48,.24)';
    g.fill();
    g.strokeStyle = ink; g.lineWidth = 0.6; g.stroke();

    // 眼
    const ex = L * 0.3, ey = -Hb * 0.28;
    g.fillStyle = '#F7F0E1';
    g.beginPath(); g.arc(ex, ey, 2.6, 0, 6.2832); g.fill();
    g.fillStyle = '#1B2A2C';
    g.beginPath(); g.arc(ex + 0.4, ey, 1.35, 0, 6.2832); g.fill();

    // 口
    g.strokeStyle = 'rgba(24,40,40,.5)';
    g.lineWidth = 0.9;
    g.beginPath();
    if (shape === 'catfish' || shape === 'sturgeon') {
      g.moveTo(L * 0.47, -Hb * 0.02);
      g.quadraticCurveTo(L * 0.44, Hb * 0.16, L * 0.38, Hb * 0.14);
    } else {
      g.moveTo(L * 0.46, -Hb * 0.02);
      g.lineTo(L * 0.42, Hb * 0.14);
    }
    g.stroke();

    // 须（鲶、鲤、鲟）
    if (shape === 'catfish' || fish.id === 'liyu' || shape === 'sturgeon') {
      g.strokeStyle = 'rgba(30,44,44,.45)';
      g.lineWidth = 0.8;
      for (let i = 0; i < 2; i++) {
        g.beginPath();
        g.moveTo(L * 0.45, Hb * (0.1 + i * 0.1));
        g.quadraticCurveTo(L * 0.54, Hb * (0.35 + i * 0.35), L * 0.58, Hb * (0.8 + i * 0.3));
        g.stroke();
      }
    }
    // 硬棘（黄颡）
    if (fish.id === 'huangsang') {
      g.strokeStyle = 'rgba(30,44,44,.5)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(L * 0.06, -Hb * 0.85);
      g.lineTo(L * 0.16, -Hb * 1.5);
      g.stroke();
    }
    g.restore();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = clamp((n >> 16) + amt, 0, 255);
    const g = clamp(((n >> 8) & 255) + amt, 0, 255);
    const b = clamp((n & 255) + amt, 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /* ---------------- 场景绘制 ---------------- */
  function drawSky(t) {
    const w = water();
    const g = ctx.createLinearGradient(0, 0, 0, SURF + 10);
    g.addColorStop(0, w.sky[0]);
    g.addColorStop(0.72, w.sky[1]);
    g.addColorStop(1, shade(w.sky[1], 10));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, SURF + 10);

    // 日轮
    const sx = W * w.sunPos, sy = SURF * 0.4, sr = 27 * SCALE;
    const sg = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 3.4);
    sg.addColorStop(0, 'rgba(255,246,226,.85)');
    sg.addColorStop(0.35, w.sun);
    sg.addColorStop(1, 'rgba(255,238,208,0)');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(sx, sy, sr * 3.4, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = w.sun;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;

    // 云带
    clouds.forEach((c) => {
      const x = ((c.x + t * 2.4 * c.s) % (W + 220)) - 110;
      ctx.globalAlpha = c.a;
      ctx.strokeStyle = '#FFF9EC';
      ctx.lineWidth = 1.5 + c.s;
      ctx.beginPath();
      ctx.moveTo(x, c.y);
      ctx.bezierCurveTo(x + 50 * c.s, c.y - 10 * c.s, x + 104 * c.s, c.y - 2 * c.s, x + 156 * c.s, c.y + 2 * c.s);
      ctx.stroke();
      ctx.globalAlpha = c.a * 0.7;
      ctx.beginPath();
      ctx.moveTo(x + 34 * c.s, c.y + 6 * c.s);
      ctx.bezierCurveTo(x + 74 * c.s, c.y + 1 * c.s, x + 118 * c.s, c.y + 3 * c.s, x + 132 * c.s, c.y + 7 * c.s);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // 远山（平滑山脊）
    const hy = SURF - 2;
    ctx.fillStyle = w.hill;
    ctx.beginPath();
    ctx.moveTo(0, hy);
    ridge.forEach((p, i) => {
      const yy = hy - (10 + p.h * 62 * SCALE);
      if (i === 0) ctx.lineTo(p.x, yy);
      else {
        const prev = ridge[i - 1];
        const px = prev.x, py = hy - (10 + prev.h * 62 * SCALE);
        ctx.quadraticCurveTo((px + p.x) / 2, Math.min(py, yy) - 6 * SCALE, p.x, yy);
      }
    });
    ctx.lineTo(W, hy);
    ctx.closePath();
    ctx.fill();

    // 近岸树线
    ctx.fillStyle = 'rgba(58,80,74,.16)';
    for (let i = 0; i < 24; i++) {
      const x = (i / 23) * W;
      const hh = (12 + Math.sin(i * 2.3) * 6 + Math.sin(i * 0.9) * 5) * SCALE;
      ctx.beginPath();
      ctx.ellipse(x, hy - hh * 0.4, 9 * SCALE, hh * 0.6, 0, 0, 6.2832);
      ctx.fill();
    }

    // 水鸟
    ctx.strokeStyle = 'rgba(52,66,66,.4)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 13 + i * 280) % (W + 260)) - 130;
      const by = SURF * (0.24 + i * 0.14) + Math.sin(t * 1.2 + i) * 3;
      const s = 4.6 * SCALE;
      ctx.beginPath();
      ctx.moveTo(bx - s, by);
      ctx.quadraticCurveTo(bx - s * 0.45, by - s * 0.75, bx, by - s * 0.06);
      ctx.quadraticCurveTo(bx + s * 0.45, by - s * 0.75, bx + s, by);
      ctx.stroke();
    }

    // 地平线雾带
    const hz = ctx.createLinearGradient(0, SURF - 34 * SCALE, 0, SURF + 4);
    hz.addColorStop(0, 'rgba(255,248,232,0)');
    hz.addColorStop(1, 'rgba(255,248,232,.42)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, SURF - 34 * SCALE, W, 38 * SCALE);
  }

  function drawWater(t) {
    const w = water();
    const g = ctx.createLinearGradient(0, SURF, 0, H);
    g.addColorStop(0, w.water[0]);
    g.addColorStop(0.3, shade(w.water[0], -30));
    g.addColorStop(0.68, w.water[1]);
    g.addColorStop(1, shade(w.water[1], -14));
    ctx.fillStyle = g;
    ctx.fillRect(0, SURF, W, H - SURF);

    // 太阳在水面的反光柱
    const sx = W * w.sunPos;
    const sg = ctx.createLinearGradient(sx, SURF, sx, H * 0.8);
    sg.addColorStop(0, 'rgba(255,242,214,.18)');
    sg.addColorStop(1, 'rgba(255,242,214,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(sx - 40 * SCALE, SURF);
    ctx.lineTo(sx + 40 * SCALE, SURF);
    ctx.lineTo(sx + 130 * SCALE, H * 0.82);
    ctx.lineTo(sx - 130 * SCALE, H * 0.82);
    ctx.closePath();
    ctx.fill();

    // 光柱
    rays.forEach((r) => {
      const sway = Math.sin(t * 0.35 + r.ph) * 18 * SCALE;
      const rg = ctx.createLinearGradient(0, SURF, 0, H * 0.9);
      rg.addColorStop(0, 'rgba(255,248,228,' + (r.a * 1.5).toFixed(3) + ')');
      rg.addColorStop(0.55, 'rgba(255,248,228,' + (r.a * 0.5).toFixed(3) + ')');
      rg.addColorStop(1, 'rgba(255,248,228,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(r.x + sway, SURF);
      ctx.lineTo(r.x + r.w + sway, SURF);
      ctx.lineTo(r.x + r.w * 1.9 + sway * 2, H * 0.9);
      ctx.lineTo(r.x - r.w * 0.4 + sway * 2, H * 0.9);
      ctx.closePath();
      ctx.fill();
    });

    // 波纹带
    for (let i = 0; i < 7; i++) {
      const y = SURF + 14 + i * ((H - SURF) / 8.6);
      const amp = (0.9 + i * 0.3) * SCALE;
      const alpha = Math.max(0.025, 0.13 - i * 0.014);
      ctx.strokeStyle = 'rgba(236,246,236,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const yy = y + Math.sin(x * 0.015 + t * (0.55 + i * 0.1) + i * 1.3) * amp
          + Math.sin(x * 0.006 - t * 0.4) * amp * 0.7;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // 水面碎光
    glints.forEach((gl) => {
      const k = 0.55 + 0.45 * Math.sin(t * 1.8 + gl.ph);
      ctx.globalAlpha = gl.a * k;
      ctx.strokeStyle = '#FFF7E2';
      ctx.lineWidth = 1.6 * SCALE;
      ctx.beginPath();
      ctx.moveTo(gl.x, gl.y + Math.sin(t + gl.ph) * 1.2);
      ctx.lineTo(gl.x + gl.w * (0.6 + k * 0.5), gl.y + Math.sin(t + gl.ph) * 1.2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // 水面线
    ctx.strokeStyle = 'rgba(255,250,238,.5)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 10) {
      const yy = SURF + Math.sin(x * 0.019 + t * 0.85) * 1.5;
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  function drawMotes(t) {
    const pm = pxPerM();
    ctx.fillStyle = '#EAF4E2';
    motes.forEach((m) => {
      const y = SURF + 8 + ((H - SURF) * 0.9) * ((m.d * 0.6 + (t * m.sp * 0.004)) % 1);
      const x = m.x + Math.sin(t * 0.6 + m.ph) * 6;
      ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(t * 1.4 + m.ph));
      ctx.beginPath();
      ctx.arc(x, Math.min(y, seabedY(x) - 4), m.r, 0, 6.2832);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawSeabed(t) {
    if (seabedPts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(-10, H + 10);
    ctx.lineTo(seabedPts[0].x, seabedPts[0].y);
    for (let i = 1; i < seabedPts.length; i++) {
      const p = seabedPts[i], q = seabedPts[i - 1];
      ctx.quadraticCurveTo(q.x, q.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    ctx.lineTo(W + 10, H + 10);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, H - 200 * SCALE, 0, H);
    g.addColorStop(0, 'rgba(78,112,104,.42)');
    g.addColorStop(0.35, 'rgba(44,76,74,.66)');
    g.addColorStop(1, 'rgba(18,40,44,.9)');
    ctx.fillStyle = g;
    ctx.fill();

    // 岸边亮边（沉积的细砂）
    ctx.strokeStyle = 'rgba(214,212,176,.3)';
    ctx.lineWidth = 2.2 * SCALE;
    ctx.beginPath();
    seabedPts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(220,230,206,.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    seabedPts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y + 4 * SCALE) : ctx.moveTo(p.x, p.y + 4 * SCALE)));
    ctx.stroke();

    stones.forEach((s) => {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#0B1F22';
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r * 1.6, s.r, s.a * 1.6, 0, 6.2832);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    weeds.forEach((wd) => {
      const sway = Math.sin(t * 1.05 + wd.ph) * 6 * SCALE;
      ctx.strokeStyle = 'rgba(24,52,48,.45)';
      ctx.lineWidth = 1.5 * SCALE;
      ctx.beginPath();
      ctx.moveTo(wd.x, wd.y);
      ctx.bezierCurveTo(wd.x + wd.bend * 0.4, wd.y - wd.h * 0.4,
        wd.x + sway * 0.7 + wd.bend, wd.y - wd.h * 0.75,
        wd.x + sway, wd.y - wd.h);
      ctx.stroke();
    });
  }

  function drawDepthScale() {
    if (S.phase === 'fight' || S.phase === 'result') return;
    const pm = pxPerM();
    const x = W - 62 * SCALE;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#F2EAD6';
    ctx.fillStyle = '#F2EAD6';
    ctx.font = (9 * SCALE).toFixed(1) + 'px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'right';
    const marks = [5, 10, 20, 30].filter((m) => m <= water().maxDepth);
    marks.forEach((m) => {
      const y = SURF + m * pm;
      if (y > H - 6) return;
      ctx.beginPath();
      ctx.moveTo(x - 12 * SCALE, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      const label = m + 'm';
      const tw = ctx.measureText(label).width;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'rgba(10,28,30,.55)';
      ctx.fillRect(x - 20 * SCALE - tw, y - 6 * SCALE, tw + 8, 12 * SCALE);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#F2EAD6';
      ctx.fillText(label, x - 16 * SCALE, y + 3);
    });
    ctx.restore();
  }

  function drawFishShadows(t, dt) {
    if (!fishShadows.length) return;
    const pm = pxPerM();
    fishShadows.forEach((f) => {
      if (f.scare > 0) f.scare -= dt;
      const spd = f.sp * (f.scare > 0 ? 4.2 : 1) * (G.water === 'brook' ? 1.3 : 1);
      f.x += f.dir * spd * dt;
      if (f.x < W * 0.06) { f.x = W * 0.06; f.dir = 1; }
      if (f.x > W * 0.99) { f.x = W * 0.99; f.dir = -1; }
      const y = SURF + clamp(f.d, 0.4, water().maxDepth * 0.92) * pm;
      const yb = seabedY(f.x);
      const yy = Math.min(y, yb - 8 * SCALE);
      const ss = f.size;
      ctx.save();
      ctx.translate(f.x, yy + Math.sin(t * 1.6 + f.ph) * 1.1);
      ctx.scale(f.dir, 1);
      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = '#0A2226';
      ctx.beginPath();
      if (f.shape === 'deep') {
        ctx.ellipse(0, 0, ss * 0.92, ss * 0.5, 0, 0, 6.2832);
      } else {
        ctx.ellipse(0, 0, ss, ss * 0.3, 0, 0, 6.2832);
      }
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-ss * 0.8, 0);
      ctx.lineTo(-ss * 1.45, -ss * 0.36);
      ctx.lineTo(-ss * 1.45, ss * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = f.alpha * 0.55;
      ctx.fillStyle = '#7FB0A8';
      ctx.beginPath();
      ctx.ellipse(ss * 0.16, -ss * 0.1, ss * 0.5, ss * 0.08, 0, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function drawPier(t) {
    const py = SURF - 22 * SCALE;
    const pw = W * 0.108;
    ctx.save();
    ctx.fillStyle = 'rgba(28,42,42,.9)';
    ctx.beginPath();
    ctx.moveTo(0, py + 5 * SCALE);
    ctx.lineTo(pw, py + 2 * SCALE);
    ctx.lineTo(pw, py + 11 * SCALE);
    ctx.lineTo(0, py + 16 * SCALE);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(12,24,24,.45)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const x = (pw / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, py + 4 * SCALE);
      ctx.lineTo(x, py + 15 * SCALE);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(22,36,36,.85)';
    ctx.lineWidth = 2.6 * SCALE;
    for (let i = 1; i <= 3; i++) {
      const x = (pw / 3.6) * i;
      ctx.beginPath();
      ctx.moveTo(x, py + 13 * SCALE);
      ctx.lineTo(x + 1.5, SURF + 20 * SCALE);
      ctx.stroke();
    }

    // 钓者
    const ax = pw * 0.5, ay = py + 1 * SCALE;
    ctx.fillStyle = 'rgba(20,34,34,.9)';
    // 斗笠
    ctx.beginPath();
    ctx.ellipse(ax, ay - 17 * SCALE, 13 * SCALE, 4 * SCALE, 0, 0, 6.2832);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ax - 13 * SCALE, ay - 16 * SCALE);
    ctx.quadraticCurveTo(ax, ay - 33 * SCALE, ax + 13 * SCALE, ay - 16 * SCALE);
    ctx.closePath();
    ctx.fill();
    // 身体
    ctx.beginPath();
    ctx.moveTo(ax - 10 * SCALE, ay - 13 * SCALE);
    ctx.quadraticCurveTo(ax - 6 * SCALE, ay + 13 * SCALE, ax + 8 * SCALE, ay + 6 * SCALE);
    ctx.quadraticCurveTo(ax + 11 * SCALE, ay - 6 * SCALE, ax + 9 * SCALE, ay - 13 * SCALE);
    ctx.closePath();
    ctx.fill();
    // 手臂
    ctx.strokeStyle = 'rgba(20,34,34,.9)';
    ctx.lineWidth = 3 * SCALE;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax + 2 * SCALE, ay - 9 * SCALE);
    ctx.quadraticCurveTo(ax + 12 * SCALE, ay - 12 * SCALE, ax + 16 * SCALE, ay - 17 * SCALE);
    ctx.stroke();
    // 鱼护桶
    ctx.fillStyle = 'rgba(30,46,44,.72)';
    ctx.beginPath();
    ctx.ellipse(ax + 22 * SCALE, ay + 4 * SCALE, 6 * SCALE, 7.5 * SCALE, 0, 0, 6.2832);
    ctx.fill();
    ctx.restore();

    return { x: ax + 46 * SCALE, y: ay - 32 * SCALE };
  }

  function drawRodAndLine(tip, t) {
    const bx = S.bobber.x, by = S.bobber.y;
    const bend = S.phase === 'fight' && S.fight ? clamp(S.fight.tension / line().max, 0, 1.2) : 0;
    const chargeBend = S.phase === 'charging' ? S.power : 0;
    const tipY = tip.y + bend * 9 * SCALE;

    // 竿身
    ctx.strokeStyle = 'rgba(24,38,36,.92)';
    ctx.lineWidth = 2.4 * SCALE;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tip.x - 50 * SCALE, tip.y + 38 * SCALE);
    ctx.quadraticCurveTo(tip.x - 22 * SCALE, tip.y + 12 * SCALE - chargeBend * 5 * SCALE, tip.x, tipY);
    ctx.stroke();
    // 握把
    ctx.strokeStyle = 'rgba(60,44,32,.95)';
    ctx.lineWidth = 4.6 * SCALE;
    ctx.beginPath();
    ctx.moveTo(tip.x - 50 * SCALE, tip.y + 38 * SCALE);
    ctx.lineTo(tip.x - 40 * SCALE, tip.y + 30 * SCALE);
    ctx.stroke();
    ctx.lineWidth = 1;

    // 鱼线
    const hasLine = S.phase !== 'idle' && S.phase !== 'charging' && S.phase !== 'result';
    if (hasLine) {
      const sag = 14 * SCALE + (S.phase === 'waiting' || S.phase === 'nibble' ? 10 * SCALE : 0) - bend * 6 * SCALE;
      const midX = (tip.x + bx) / 2;
      const midY = (tipY + by) / 2 + sag;
      ctx.strokeStyle = 'rgba(248,242,228,.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tip.x, tipY);
      ctx.quadraticCurveTo(midX, midY, bx, by);
      ctx.stroke();
    }
  }

  function castX(power) {
    const minX = W * 0.2, maxX = W * 0.95;
    const reach = rod().maxPower;
    return lerp(minX, maxX, clamp(power, 0, 1) * reach);
  }

  function drawAim(t) {
    if (S.phase !== 'charging') return;
    const x = castX(S.power);
    const d = depthAt(x);
    const y = SURF;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#FBEFE3';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 6]);
    // 抛物线预览
    ctx.beginPath();
    ctx.moveTo(rodTip.x, rodTip.y);
    ctx.quadraticCurveTo((rodTip.x + x) / 2, Math.min(rodTip.y, y) - 70 * SCALE, x, y);
    ctx.stroke();
    ctx.setLineDash([]);
    // 落点
    const pulse = 1 + Math.sin(t * 6) * 0.06;
    ctx.beginPath();
    ctx.ellipse(x, y, 15 * SCALE * pulse, 5 * SCALE * pulse, 0, 0, 6.2832);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#FBEFE3';
    ctx.font = (10 * SCALE).toFixed(1) + 'px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('水深 ' + d.toFixed(1) + 'm', x, y + 18 * SCALE);
    ctx.restore();
  }

  function drawFightFish(t) {
    if (S.phase !== 'fight' || !S.fish) return;
    const f = S.fight;
    const ratio = clamp(S.weight / Math.max(0.05, S.fish.w[1]), 0, 1);
    const size = lerp(13, 46, Math.pow(ratio, 0.55)) * SCALE;
    const dash = f && f.dash > 0;
    const x = S.bobber.x + Math.sin((f ? f.wobble : t) * 2.1) * 6 * SCALE;
    const y = SURF + size * 0.55 + (dash ? Math.sin(t * 9) * 2 : 0);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 2.6) * 0.14 + (dash ? 0.2 : 0));
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#08201F';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.62, size * 0.24, 0, 0, 6.2832);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-size * 0.56, 0);
    ctx.lineTo(-size * 1.05, -size * 0.26);
    ctx.lineTo(-size * 1.02, size * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#9CC6BC';
    ctx.beginPath();
    ctx.ellipse(size * 0.05, -size * 0.06, size * 0.34, size * 0.06, 0, 0, 6.2832);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBobber(t) {
    if (S.phase === 'idle' || S.phase === 'result') return;
    const b = S.bobber;
    S.ripples.forEach((r) => {
      const p = r.t / r.dur;
      ctx.globalAlpha = (1 - p) * r.a;
      ctx.strokeStyle = 'rgba(250,246,232,.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, lerp(r.r, r.r1, p), lerp(r.r, r.r1, p) * 0.34, 0, 0, 6.2832);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    const y = b.y + b.dip;
    const s = 6 * SCALE;
    // 水中的倒影
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#C4472C';
    ctx.beginPath();
    ctx.ellipse(b.x, SURF + 3 * SCALE, s * 1.1, s * 0.4, 0, 0, 6.2832);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#F6EEDC';
    ctx.beginPath();
    ctx.ellipse(b.x, y + s * 0.62, s * 0.82, s * 1.0, 0, 0, 6.2832);
    ctx.fill();
    ctx.fillStyle = '#C4472C';
    ctx.beginPath();
    ctx.ellipse(b.x, y, s * 0.82, s * 0.92, 0, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,50,50,.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(b.x, y + s * 0.25, s * 0.82, s * 0.95, 0, 0, 6.2832);
    ctx.stroke();
    ctx.strokeStyle = '#C4472C';
    ctx.lineWidth = 1.3 * SCALE;
    ctx.beginPath();
    ctx.moveTo(b.x, y - s * 0.8);
    ctx.lineTo(b.x, y - s * 2.1);
    ctx.stroke();

    // 咬钩感叹号
    if (S.phase === 'bite') {
      const p = clamp((S.t - (S.biteEnd - rod().bite)) / 0.16, 0, 1);
      const sc = 0.6 + p * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.94;
      ctx.translate(b.x, y - 26 * SCALE - Math.sin(t * 12) * 2);
      ctx.scale(sc, sc);
      ctx.fillStyle = '#FBEFE3';
      ctx.strokeStyle = '#93331F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 11 * SCALE, 0, 6.2832);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#93331F';
      ctx.font = 'bold ' + (15 * SCALE).toFixed(1) + 'px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 1);
      ctx.restore();
    }
  }

  function drawParticles(dt) {
    for (let i = S.particles.length - 1; i >= 0; i--) {
      const p = S.particles[i];
      p.t += dt;
      if (p.t >= p.life) { S.particles.splice(i, 1); continue; }
      p.vy += 460 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const k = 1 - p.t / p.life;
      ctx.globalAlpha = k * p.a;
      ctx.fillStyle = '#F4EDDC';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.5 + k * 0.5), 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H * 0.55, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(10,22,24,.3)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------------- 主循环 ---------------- */
  let lastT = performance.now();
  let rodTip = { x: 120, y: 120 };
  let paused = false;

  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    if (!paused) S.t += dt;
    update(paused ? 0 : dt);

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (S.shake > 0.2) {
      ctx.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);
      S.shake = Math.max(0, S.shake - 30 * dt);
    }
    drawSky(S.t);
    drawWater(S.t);
    drawMotes(S.t);
    drawFishShadows(S.t, dt);
    drawSeabed(S.t);
    drawDepthScale();
    rodTip = drawPier(S.t);
    drawAim(S.t);
    drawRodAndLine(rodTip, S.t);
    drawFightFish(S.t);
    drawBobber(S.t);
    drawParticles(dt);
    drawVignette();
    ctx.restore();

    requestAnimationFrame(frame);
  }

  /* ---------------- 状态更新 ---------------- */
  function update(dt) {
    if (paused) return;
    for (let i = S.ripples.length - 1; i >= 0; i--) {
      const r = S.ripples[i];
      r.t += dt;
      if (r.t >= r.dur) S.ripples.splice(i, 1);
    }

    if (S.phase === 'charging') {
      S.power += S.powerDir * dt * 1.15;
      if (S.power >= 1) { S.power = 1; S.powerDir = -1; }
      if (S.power <= 0) { S.power = 0; S.powerDir = 1; }
      $('#cast-fill').style.width = (S.power * 100).toFixed(1) + '%';
      $('#cast-lbl').textContent = Math.round(S.power * 100) + '%';
      $('#cast-sweet').style.left = '78%';
    }

    if (S.phase === 'flying' && S.flight) {
      const f = S.flight;
      f.t += dt;
      const p = clamp(f.t / f.dur, 0, 1);
      S.bobber.x = lerp(f.x0, f.x1, p);
      S.bobber.y = lerp(f.y0, SURF, p) - Math.sin(p * Math.PI) * f.arc;
      if (p >= 1) {
        S.bobber.y = SURF;
        S.phase = 'waiting';
        ripple(f.x1, SURF, 5 * SCALE, 48 * SCALE, 1.1, 0.55);
        ripple(f.x1, SURF, 3 * SCALE, 28 * SCALE, 0.8, 0.4);
        splash(f.x1, SURF, 11, 1);
        SFX.splash();
        S.pendingFish = chooseFish();
        S.noBite = !S.pendingFish;
        S.biteAt = S.t + (S.noBite ? rnd(1.9, 2.7) : rnd(1.6, 4.8) * (1 - (G.rod - 1) * 0.12));
        S.nibbleAt = S.biteAt - rnd(0.55, 0.95);
        S.nibbleDone = false;
        setUI();
      }
    }

    if (S.phase === 'waiting') {
      const bob = Math.sin(S.t * 2.1) * 1.5 * SCALE + Math.sin(S.t * 3.4 + 1) * 0.7 * SCALE;
      S.bobber.y = SURF + bob;
      S.bobber.dip = bob;
      if (S.noBite) {
        if (S.t >= S.biteAt) noBiteOut();
        return;
      }
      if (!S.nibbleDone && S.t >= S.nibbleAt) {
        S.nibbleDone = true;
        S.phase = 'nibble';
        S.nibbleEnd = S.t + 0.62;
        SFX.nibble();
        ripple(S.bobber.x, SURF, 3 * SCALE, 16 * SCALE, 0.7, 0.35);
        setUI();
      }
    }

    if (S.phase === 'nibble') {
      const k = Math.abs(Math.sin((S.t - (S.nibbleEnd - 0.62)) * 26));
      S.bobber.dip = k * 4 * SCALE;
      S.bobber.y = SURF + S.bobber.dip * 0.5;
      if (S.t >= S.nibbleEnd) {
        S.phase = 'bite';
        S.biteEnd = S.t + rod().bite;
        S.bobber.dip = 0;
        S.bobber.y = SURF + 6 * SCALE;
        SFX.bite();
        splash(S.bobber.x, SURF, 13, 1.3);
        ripple(S.bobber.x, SURF, 4 * SCALE, 42 * SCALE, 0.9, 0.6);
        setUI();
      }
    }

    if (S.phase === 'bite') {
      S.bobber.dip = 6 * SCALE + Math.sin(S.t * 20) * 1.6 * SCALE;
      if (S.t > S.biteEnd) missFish('miss');
    }

    if (S.phase === 'fight') updateFight(dt);
  }

  /* ---------------- 核心动作 ---------------- */
  function startCharge() {
    if (S.phase !== 'idle') return;
    audio();
    S.phase = 'charging';
    S.power = 0;
    S.powerDir = 1;
    $('#stage').classList.add('charging');
    $('#cast-bar').classList.add('show');
    setUI();
  }

  function releaseCast() {
    if (S.phase !== 'charging') return;
    const p = S.power;
    $('#stage').classList.remove('charging');
    $('#cast-bar').classList.remove('show');

    const x = castX(p);
    const startX = rodTip.x, startY = rodTip.y;
    S.flight = {
      t: 0, dur: 0.4 + p * 0.22, x0: startX, y0: startY, x1: x,
      arc: 64 * SCALE + p * 66 * SCALE
    };
    S.targetX = x;
    S.phase = 'flying';
    S.bobber.x = startX; S.bobber.y = startY;
    S.pendingFish = null; S.noBite = false;
    S.sweet = p >= 0.78 && p <= 0.9;
    G.casts = (G.casts || 0) + 1;
    save();
    SFX.cast();
    setUI();
  }

  function chooseFish() {
    const w = water();
    const hookDepth = hookDepthFor(S.targetX);
    const b = G.bait;
    const rig = G.rig;
    const pool = FISH.filter((f) => f.water === w.id);
    const scored = [];
    const spotDepth = depthAt(S.targetX);
    let bestAffinity = 0;
    pool.forEach((f) => {
      // 上层鱼看钓点水深，底层鱼看钩所在水层
      let depthOk = true;
      if (f.layer === 'surface') depthOk = spotDepth >= f.minD && spotDepth <= f.maxD + 6;
      else if (f.layer === 'bottom') depthOk = hookDepth >= f.minD - 0.8 && hookDepth <= f.maxD + 1.5;
      const layerOk = (rig === 'surface' && f.layer === 'surface')
        || (rig === 'bottom' && f.layer === 'bottom')
        || f.layer === 'mid';
      // 亲和度只看“饵 / 水层 / 深度”是否搭得上，稀有度只影响谁先咬
      const aff = (f.baits.indexOf(b) >= 0 ? 1 : 0.05)
        * (layerOk ? 1 : 0.14)
        * (depthOk ? 1 : 0.1);
      bestAffinity = Math.max(bestAffinity, aff);
      let s = aff * (({ common: 10, uncommon: 5, rare: 1.6, legend: 0.45 })[f.rarity] || 3);
      if (f.protected) s *= 0.6;
      if (S.sweet) s *= f.rarity === 'common' ? 0.4 : 2.2;
      if (s > 0) scored.push({ f, s });
    });
    // 这套搭配在水里根本没人接：没口
    if (bestAffinity < 0.12 || !scored.length) return null;
    const total = scored.reduce((a, c) => a + c.s, 0);
    let r = Math.random() * total;
    for (const it of scored) {
      r -= it.s;
      if (r <= 0) return it.f;
    }
    return scored[0].f;
  }

  function hookDepthFor(x) {
    const d = depthAt(x);
    return G.rig === 'surface'
      ? clamp(0.8 + (G.rod - 1) * 0.35, 0.6, Math.max(0.8, d - 0.5))
      : clamp(d - 0.6, 0.8, water().maxDepth);
  }

  function hookFish() {
    if (S.phase !== 'bite') return;
    S.fish = S.pendingFish || chooseFish();
    if (!S.fish) { missFish('miss'); return; }
    S.weight = rollWeight(S.fish);
    S.phase = 'fight';
    S.fight = {
      tension: 14, progress: 16, holding: false,
      dash: 0, dashCd: rnd(0.9, 1.9), slack: 0, t: 0, wobble: 0
    };
    SFX.hook();
    splash(S.bobber.x, SURF, 18, 1.6);
    S.shake = 4;
    setUI();
  }

  function rollWeight(f) {
    const t = Math.pow(Math.random(), 1.7);
    return +(lerp(f.w[0], f.w[1], t)).toFixed(2);
  }

  function updateFight(dt) {
    const f = S.fight, fish = S.fish, ln = line();
    if (!f || !fish) return;
    f.t += dt;
    f.wobble += dt;

    f.dashCd -= dt;
    if (f.dashCd <= 0 && f.dash <= 0) {
      f.dash = rnd(0.45, 0.85);
      f.dashCd = rnd(1.5, 2.9) / (0.85 + fish.pull * 0.3);
      splash(S.bobber.x + rnd(-16, 16), SURF, 7, 1.1);
      S.shake = Math.max(S.shake, 3.4);
      SFX.tick();
    }
    if (f.dash > 0) f.dash -= dt;

    const max = ln.max;
    const safeA = max * 0.24, safeB = max * 0.78;
    const inSafe = f.tension >= safeA && f.tension <= safeB;

    if (f.holding) {
      const rise = 24 + fish.pull * 26 + (f.dash > 0 ? 42 : 0);
      f.tension += rise * dt;
      f.progress += (inSafe ? 34 : 6) * ln.reel * dt;
      f.slack = 0;
      if (Math.random() < 0.1) SFX.tick();
    } else {
      f.tension -= 46 * dt;
      f.progress -= 5.5 * fish.escape * dt;
      if (f.tension <= 2) f.slack += dt; else f.slack = 0;
    }
    f.tension = clamp(f.tension, 0, max * 1.2);
    f.progress = clamp(f.progress, 0, 100);

    // 浮标被拖动
    S.bobber.x = S.targetX + Math.sin(f.wobble * 2.4) * (f.dash > 0 ? 15 : 5) * SCALE;
    S.bobber.y = SURF + 3 * SCALE + (f.dash > 0 ? Math.sin(f.wobble * 20) * 1.5 : 0);

    $('#tension-mark').style.height = (clamp(f.tension / max, 0, 1) * 100).toFixed(1) + '%';
    const sf = $('#stamina-fill');
    sf.style.width = f.progress.toFixed(1) + '%';
    sf.style.background = inSafe ? '#E9DEC5' : '#C4472C';
    $('#stamina-cap').textContent = '鱼体力 · ' + Math.round(f.progress) + '%' + (f.dash > 0 ? ' · 冲刺' : '');
    $('#tension-cap').textContent = Math.round(f.tension / max * 100) + '%';
    $('#tension-cap').style.color = f.tension > safeB ? '#F0A08C' : (f.tension < safeA ? '#9FC3B8' : '#CFE3D6');

    if (f.tension >= max) { endFight('snap'); return; }
    if (f.progress <= 0 && f.t > 1.5) { endFight('slip'); return; }
    if (f.slack > 2.1) { endFight('slip'); return; }
    if (f.progress >= 99.5) { endFight('win'); }
  }

  function noBiteOut() {
    SFX.fail();
    toast('没口 · 这套搭配这里没有鱼接。换饵、换水层，或者抛远一点。', 'warn');
    S.phase = 'idle';
    S.pendingFish = null;
    S.noBite = false;
    S.bobber.x = 0;
    setUI();
  }

  const FAIL_TEXT = {
    snap: { t: '线断了', d: '张力冲顶，鱼线崩断。换一根更结实的线，或者学会在冲刺时松手。' },
    slip: { t: '脱钩了', d: '线松太久，鱼吐出钩子。收线要稳，但不能一直松着。' },
    early: { t: '惊鱼', d: '浮标还没沉你就提竿了。它只是试探了一下。' },
    miss: { t: '吐钩了', d: '咬钩窗口只有一秒出头。看到浮标沉下去就立刻提竿。' }
  };

  function endFight(kind) {
    if (S.phase !== 'fight') return;
    if (kind === 'win') {
      S.phase = 'result';
      SFX.win();
      $('#catch-flash').classList.remove('on');
      void $('#catch-flash').offsetWidth;
      $('#catch-flash').classList.add('on');
      splash(S.bobber.x, SURF, 24, 1.8);
      showCatch(S.fish, S.weight);
    } else {
      SFX.snap();
      if (kind === 'snap') S.shake = 10;
      toast(FAIL_TEXT[kind].t + ' — ' + FAIL_TEXT[kind].d, 'warn');
      S.phase = 'idle';
      S.fish = null; S.fight = null;
      S.bobber.x = 0; S.bobber.y = SURF;
      setUI();
    }
  }

  function missFish(kind) {
    const k = kind || 'miss';
    SFX.fail();
    toast(FAIL_TEXT[k].t + ' — ' + FAIL_TEXT[k].d, 'warn');
    S.phase = 'idle';
    S.bobber.x = 0;
    setUI();
  }

  /* ---------------- 渔获 ---------------- */
  let pendingCatch = null;

  function showCatch(fish, weight) {
    const isNew = !G.dex[fish.id];
    const value = fish.protected ? 0 : Math.max(1, Math.round(fish.value * (0.62 + (weight / fish.w[1]) * 0.8)));
    pendingCatch = { fish, weight, value, isNew };

    $('#card-kicker').textContent = (isNew ? '新种记录 · ' : '渔获 · ') + 'No.' + String(fish.no).padStart(2, '0');
    $('#card-name').textContent = fish.name;
    $('#card-latin').textContent = fish.latin;
    $('#card-weight').textContent = weight.toFixed(2) + ' kg';
    $('#card-layer').textContent = LAYER_NAME[fish.layer];
    $('#card-value').textContent = fish.protected ? '放流' : '+' + value;
    $('#card-art').src = portrait(fish, 300, 130);
    $('#card-art').alt = fish.name + ' 鱼拓';

    const r = RARITY[fish.rarity];
    const tag = $('#card-tagline');
    tag.textContent = r.name + (fish.protected ? ' · 保护物种' : '');
    tag.style.color = r.color;
    $('#card-desc').textContent = fish.desc;

    const stamp = $('#card-stamp');
    stamp.textContent = fish.protected ? '放\n流' : '入\n护';
    stamp.style.color = fish.protected ? '#2F6F73' : '#BE4A2F';
    stamp.style.borderColor = fish.protected ? '#2F6F73' : '#BE4A2F';

    const warn = $('#card-warn');
    if (fish.protected) {
      warn.hidden = false;
      warn.innerHTML = '<b>' + fish.name + '</b> 是国家保护野生动物，依法不得捕捞、买卖或带走。本作只保留「放流」一个选项，并记入护渔声望。';
    } else if (fish.id === 'luofei') {
      warn.hidden = false;
      warn.innerHTML = '罗非鱼是外来物种，<b>请勿放生到自然水域</b>。带走或无害化处理，是钓鱼人的本分。';
    } else {
      warn.hidden = true;
    }

    const actions = $('#card-actions');
    actions.innerHTML = fish.protected
      ? '<button class="btn primary release" id="card-ok">放 流 · 记入护渔</button>'
      : '<button class="btn primary" id="card-ok">收进鱼护</button>';

    $('#card-ok').addEventListener('click', closeCatch);
    $('#result-modal').classList.add('show');
    setTimeout(() => { try { $('#card-ok').focus({ preventScroll: true }); } catch (e) { } }, 60);
    S.phase = 'result';
    setUI(); // 收起角力 HUD，避免残留在结算卡背后
  }

  /* 图鉴详情：复用渔获卡，只读 */
  let detailMode = false;
  function showDetail(fish) {
    if (S.phase !== 'idle') { toast('先收竿，再翻手札。', 'warn'); return; }
    const rec = G.dex[fish.id];
    if (!rec) { toast('这种鱼还没上过你的手札。', 'warn'); return; }
    detailMode = true;
    $('#card-kicker').textContent = '手札条目 · No.' + String(fish.no).padStart(2, '0');
    $('#card-name').textContent = fish.name;
    $('#card-latin').textContent = fish.latin;
    $('#card-weight').textContent = (rec.best || 0).toFixed(2) + ' kg';
    $('#card-layer').textContent = LAYER_NAME[fish.layer];
    $('#card-value').textContent = fish.protected ? '已放流' : '×' + rec.n;
    $('#card-art').src = portrait(fish, 300, 130);
    $('#card-art').alt = fish.name + ' 鱼拓';
    const r = RARITY[fish.rarity];
    const tag = $('#card-tagline');
    tag.textContent = r.name + (fish.protected ? ' · 保护物种' : '') + ' · 已记录 ' + rec.n + ' 尾';
    tag.style.color = r.color;
    $('#card-desc').textContent = fish.desc;

    const stamp = $('#card-stamp');
    stamp.textContent = fish.protected ? '放\n流' : '已\n录';
    stamp.style.color = fish.protected ? '#2F6F73' : '#6C7B7D';
    stamp.style.borderColor = fish.protected ? '#2F6F73' : '#6C7B7D';

    const warn = $('#card-warn');
    if (fish.protected) {
      warn.hidden = false;
      warn.innerHTML = '<b>' + fish.name + '</b> 是国家保护野生动物。钓到按规矩放流，图鉴里会留下这一笔。';
    } else if (fish.id === 'luofei') {
      warn.hidden = false;
      warn.innerHTML = '罗非鱼是外来物种，<b>请勿放生到自然水域</b>。';
    } else {
      warn.hidden = true;
    }

    $('#card-actions').innerHTML = '<button class="btn primary" id="card-ok">合上手札</button>';
    $('#card-ok').addEventListener('click', closeCatch);
    $('#result-modal').classList.add('show');
    setTimeout(() => { try { $('#card-ok').focus({ preventScroll: true }); } catch (e) { } }, 60);
    S.phase = 'result';
  }

  function closeCatch() {
    if (detailMode) {
      detailMode = false;
      $('#result-modal').classList.remove('show');
      S.phase = 'idle';
      setUI();
      return;
    }
    if (!pendingCatch) return;
    const { fish, weight, value } = pendingCatch;
    const prev = G.dex[fish.id];
    G.dex[fish.id] = {
      n: (prev ? prev.n : 0) + 1,
      best: prev ? Math.max(prev.best || 0, weight) : weight
    };
    if (fish.protected) {
      G.rep += 2;
      G.released = (G.released || 0) + 1;
      toast('已放流 · 护渔声望 +2', 'good');
    } else {
      G.coins += value;
      G.catches = (G.catches || 0) + 1;
      SFX.coin();
    }
    if (Object.keys(G.dex).length >= 24 && !G.finished) {
      G.finished = true;
      setTimeout(() => toast('满卷 · 二十四尾都记进手札了', 'good'), 420);
    }
    pendingCatch = null;
    $('#result-modal').classList.remove('show');
    S.phase = 'idle';
    S.fish = null; S.fight = null;
    S.bobber.x = 0;
    save();
    renderAll();
    setUI();
  }

  /* ---------------- UI ---------------- */
  function toast(msg, kind) {
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function setUI() {
    const p = S.phase;
    const btn = $('#btn-action');
    const sub = btn.querySelector('.sub');
    const hint = $('#hint');
    const prompt = $('#prompt');

    const labels = {
      idle: ['抛 竿', '按住'], charging: ['松 手', '抛出去'], flying: ['…', ''],
      waiting: ['提 竿', '等口'], nibble: ['等 待', '别动'],
      bite: ['提 竿！', '现在'], fight: ['收 线', '按住'], result: ['收好', '']
    };
    const L = labels[p] || labels.idle;
    if (btn.childNodes[0] && btn.childNodes[0].nodeType === 3) btn.childNodes[0].nodeValue = L[0];
    else btn.insertBefore(document.createTextNode(L[0]), btn.firstChild);
    sub.textContent = L[1];
    btn.disabled = p === 'flying' || p === 'result' || p === 'nibble';

    const hints = {
      idle: '按住按钮或 <span class="kbd">空格</span> 蓄力，松手抛竿',
      charging: '松手的时机决定落点——越远水越深',
      flying: '浮标在空中……',
      waiting: '等浮标动作。轻颤是试探，<b>沉下去</b>才提竿',
      nibble: '只是试探，别动。再等一下',
      bite: '<b>现在提竿！</b>窗口只有一秒',
      fight: '按住收线，让张力停在绿区；冲刺时先松手',
      result: '查看渔获'
    };
    if (hint) hint.innerHTML = hints[p] || '';

    const prompts = {
      idle: '', charging: '松手抛竿', flying: '', waiting: '等口…',
      nibble: '试探 · 别动', bite: '浮标沉了！提竿', fight: '', result: ''
    };
    let ptext = prompts[p] || '';
    if (p === 'waiting' && S.noBite) ptext = '水下没动静…';
    prompt.textContent = ptext;
    prompt.className = 'prompt' + (ptext ? ' show' : '') + (p === 'bite' ? ' alert' : '');

    $('#fight').classList.toggle('show', p === 'fight');
    $('#cast-bar').classList.toggle('show', p === 'charging');
    if (p !== 'charging') $('#stage').classList.remove('charging');

    const w = water();
    $('#water-tag').innerHTML = '<b>' + w.name + '</b><i></i><span>' + w.time + ' · ' + w.sub + '</span>';
  }

  function renderHud() {
    $('#hud-coins').textContent = fmt(G.coins);
    $('#hud-dex').textContent = Object.keys(G.dex).length + '/24';
    $('#hud-rep').textContent = fmt(G.rep);
    $('#btn-sound').classList.toggle('off', !G.sound);
  }

  function renderChips() {
    const wc = $('#water-chips');
    wc.innerHTML = '';
    WATERS.forEach((w) => {
      const unlocked = G.waters.indexOf(w.id) >= 0;
      const b = document.createElement('button');
      b.className = 'chip' + (G.water === w.id ? ' on' : '') + (unlocked ? '' : ' locked');
      b.innerHTML = w.name + (unlocked ? '' : ' <small>' + w.price + '</small>');
      b.title = unlocked ? w.note : '解锁需要 ' + w.price + ' 潮币';
      b.addEventListener('click', () => {
        if (S.phase !== 'idle') { toast('先结束这一竿，再换水域。', 'warn'); return; }
        if (unlocked) {
          if (G.water === w.id) return;
          G.water = w.id;
          resetToIdle();
          save(); renderAll(); setUI();
        } else if (G.coins >= w.price) {
          G.coins -= w.price;
          G.waters.push(w.id);
          G.water = w.id;
          resetToIdle();
          SFX.coin();
          toast('解锁水域：' + w.name, 'good');
          save(); renderAll(); setUI();
        } else {
          toast('还差 ' + (w.price - G.coins) + ' 潮币。先去钓几条鱼。', 'warn');
        }
      });
      wc.appendChild(b);
    });

    const bc = $('#bait-chips');
    bc.innerHTML = '';
    BAITS.forEach((b) => {
      const owned = G.baits.indexOf(b.id) >= 0;
      const el = document.createElement('button');
      el.className = 'chip' + (G.bait === b.id ? ' on' : '') + (owned ? '' : ' locked');
      el.innerHTML = b.name + (owned ? '' : ' <small>' + b.price + '</small>');
      el.title = b.desc;
      el.addEventListener('click', () => {
        if (!owned) { toast('在「渔具行」买下' + b.name + '后才能用。', 'warn'); return; }
        if (S.phase !== 'idle') { toast('先结束这一竿。', 'warn'); return; }
        G.bait = b.id; save(); renderChips(); setUI();
      });
      bc.appendChild(el);
    });

    $$('#rig-chips .chip').forEach((c) => c.classList.toggle('on', c.dataset.rig === G.rig));
  }

  function renderDex() {
    const grid = $('#dex-grid');
    grid.innerHTML = '';
    FISH.forEach((f) => {
      const rec = G.dex[f.id];
      const el = document.createElement('div');
      el.className = 'dex-card' + (rec ? '' : ' unknown') + (f.protected ? ' protect' : '');
      const r = RARITY[f.rarity];
      const img = '<img class="port" src="' + portrait(f, 240, 92) + '" alt="" loading="lazy">';
      if (rec) {
        el.innerHTML = '<div class="no">No.' + String(f.no).padStart(2, '0') + ' · ' + r.name + '</div>'
          + img
          + '<div class="nm">' + f.name + '</div>'
          + '<div class="meta"><span>' + LAYER_NAME[f.layer] + '</span><span>最大 ' + (rec.best || 0).toFixed(2) + 'kg</span></div>';
        el.title = f.name + ' / ' + f.latin + '\n已记录 ' + rec.n + ' 尾，最大 ' + (rec.best || 0).toFixed(2) + ' kg\n' + f.desc;
        el.addEventListener('click', () => showDetail(f));
      } else {
        el.innerHTML = '<div class="no">No.' + String(f.no).padStart(2, '0') + '</div>'
          + img + '<div class="nm">未记录</div>';
        el.title = '尚未记录';
      }
      grid.appendChild(el);
    });
    const n = Object.keys(G.dex).length;
    $('#dex-count').textContent = n + ' / 24';
    const note = $('#dex-note');
    if (n === 0) {
      note.innerHTML = '灰格是尚未谋面的鱼。选对<b>水层</b>与<b>饵</b>，比运气更重要。';
    } else if (n >= 24) {
      note.innerHTML = '<b>满卷。</b>二十四种鱼都留有你的字迹。江湾的传说，也在此页。';
    } else {
      const missing = FISH.filter((f) => !G.dex[f.id] && f.water === G.water);
      note.innerHTML = '本水域还差 <b>' + missing.length + '</b> 种。换钓法、换饵、抛更远试试。'
        + '<br>累计抛竿 ' + (G.casts || 0) + ' 次 · 入护 ' + (G.catches || 0) + ' 尾';
    }
  }

  function renderGear() {
    const rodBox = $('#gear-rod'), lineBox = $('#gear-line'), baitBox = $('#gear-baits');
    rodBox.innerHTML = ''; lineBox.innerHTML = ''; baitBox.innerHTML = '';
    const curR = rod(), curL = line();
    rodBox.appendChild(gearRow(curR, RODS, 'rod', '抛投距离 ' + Math.round(curR.maxPower * 100) + '% · 咬钩窗口 ' + curR.bite.toFixed(2) + 's'));
    lineBox.appendChild(gearRow(curL, LINES, 'line', '张力上限 ' + curL.max + ' · 收线效率 ' + curL.reel.toFixed(2) + 'x'));

    BAITS.forEach((b) => {
      const owned = G.baits.indexOf(b.id) >= 0;
      const row = document.createElement('div');
      row.className = 'equip-row';
      row.innerHTML = '<div class="equip-info"><h3>' + b.name + ' <em>' + (owned ? '已入袋' : b.price + ' 潮币') + '</em></h3><p>' + b.desc + '</p></div>';
      const btn = document.createElement('button');
      btn.className = 'btn-buy';
      if (owned) {
        btn.textContent = G.bait === b.id ? '使用中' : '选用';
        btn.disabled = G.bait === b.id;
        btn.addEventListener('click', () => {
          if (S.phase !== 'idle') { toast('先结束这一竿。', 'warn'); return; }
          G.bait = b.id; save(); renderAll(); setUI();
        });
      } else {
        btn.textContent = b.price + ' 币';
        btn.disabled = G.coins < b.price;
        btn.addEventListener('click', () => {
          G.coins -= b.price; G.baits.push(b.id); G.bait = b.id;
          SFX.coin(); toast('买入：' + b.name, 'good');
          save(); renderAll(); setUI();
        });
      }
      row.appendChild(btn);
      baitBox.appendChild(row);
    });
  }

  function gearRow(cur, list, key, stat) {
    const row = document.createElement('div');
    row.className = 'equip-row';
    const next = list.find((l) => l.lv === cur.lv + 1);
    const pips = list.map((l) => '<i class="' + (l.lv <= cur.lv ? 'on' : '') + '"></i>').join('');
    row.innerHTML = '<div class="equip-info"><h3>' + cur.name + ' <em>Lv.' + cur.lv + '</em></h3>'
      + '<p>' + stat + '</p><div class="equip-lv">' + pips + '</div></div>';
    const btn = document.createElement('button');
    btn.className = 'btn-buy';
    if (!next) {
      btn.textContent = '已满级'; btn.classList.add('max'); btn.disabled = true;
    } else {
      btn.textContent = '升级 ' + next.price;
      btn.disabled = G.coins < next.price;
      btn.title = next.name + '：' + next.desc;
      btn.addEventListener('click', () => {
        if (S.phase !== 'idle') { toast('先结束这一竿，再换装备。', 'warn'); return; }
        G.coins -= next.price; G[key] = next.lv;
        SFX.coin(); toast('换上：' + next.name, 'good');
        save(); renderAll(); setUI();
      });
    }
    row.appendChild(btn);
    return row;
  }

  function renderStats() {
    const box = $('#stats-grid');
    if (!box) return;
    const species = Object.keys(G.dex).length;
    let best = 0, bestName = '—';
    Object.keys(G.dex).forEach((id) => {
      const rec = G.dex[id];
      if ((rec.best || 0) > best) {
        best = rec.best || 0;
        const f = FISH.find((x) => x.id === id);
        bestName = f ? f.name : '—';
      }
    });
    const cells = [
      ['抛竿', (G.casts || 0) + ' 次'],
      ['入护', (G.catches || 0) + ' 尾'],
      ['放流', (G.released || 0) + ' 尾'],
      ['记录', species + ' / 24'],
      ['护渔声望', String(G.rep || 0)]
    ];
    box.innerHTML = cells.map((c) => '<div class="stat"><b>' + c[1] + '</b><span>' + c[0] + '</span></div>').join('')
      + '<div class="stat wide"><b>' + (best ? best.toFixed(2) + ' kg' : '—') + '</b><span>最大渔获 · ' + bestName + '</span></div>';
  }

  function renderAll() {
    renderHud();
    renderStats();
    renderChips();
    renderDex();
    renderGear();
  }

  /* ---------------- 输入 ---------------- */
  function actionDown(e) {
    if (e && e.cancelable) e.preventDefault();
    if (S.phase === 'idle') { startCharge(); return; }
    if (S.phase === 'charging') return;
    if (S.phase === 'waiting') {
      if (S.noBite) {
        toast('水下没动静，收竿换个搭配。', '');
        S.phase = 'idle'; S.noBite = false; S.pendingFish = null;
        S.bobber.x = 0; setUI(); return;
      }
      missFish('early');
      return;
    }
    if (S.phase === 'nibble') { missFish('early'); return; }
    if (S.phase === 'bite') { hookFish(); return; }
    if (S.phase === 'fight' && S.fight) { S.fight.holding = true; return; }
  }

  function actionUp(e) {
    if (e && e.cancelable) e.preventDefault();
    if (S.phase === 'charging') { releaseCast(); return; }
    if (S.phase === 'fight' && S.fight) S.fight.holding = false;
  }

  function bindInput() {
    const stage = $('#stage');
    const btn = $('#btn-action');

    stage.addEventListener('pointerdown', (e) => {
      if (S.phase === 'result') return;
      try { stage.setPointerCapture(e.pointerId); } catch (err) { }
      actionDown(e);
    });
    stage.addEventListener('pointerup', actionUp);
    stage.addEventListener('pointercancel', actionUp);

    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      btn.classList.add('down');
      actionDown(e);
    });
    btn.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      btn.classList.remove('down');
      actionUp(e);
    });
    btn.addEventListener('pointerleave', () => {
      btn.classList.remove('down');
      if (S.phase === 'fight' && S.fight) S.fight.holding = false;
    });
    btn.addEventListener('click', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        if ($('#result-modal').classList.contains('show')) return;
        if ($('#help-modal').classList.contains('show')) return;
        if (e.repeat) { e.preventDefault(); return; }
        e.preventDefault();
        actionDown(e);
      }
      if (e.key === 'Escape' && $('#help-modal').classList.contains('show')) closeHelp();
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); actionUp(e); }
    });
    window.addEventListener('blur', () => {
      if (S.phase === 'fight' && S.fight) S.fight.holding = false;
      if (S.phase === 'charging') releaseCast();
    });

    $$('.tab').forEach((t) => {
      t.addEventListener('click', () => {
        $$('.tab').forEach((x) => x.classList.remove('on'));
        $$('.panel').forEach((x) => x.classList.remove('on'));
        t.classList.add('on');
        $('#panel-' + t.dataset.tab).classList.add('on');
      });
    });

    $('#rig-chips').addEventListener('click', (e) => {
      const c = e.target.closest('.chip');
      if (!c) return;
      if (S.phase !== 'idle') { toast('收完这一竿再换钓法。', 'warn'); return; }
      G.rig = c.dataset.rig;
      save(); renderChips(); setUI();
    });

    $('#btn-sound').addEventListener('click', () => {
      G.sound = !G.sound;
      if (G.sound) { audio(); SFX.coin(); }
      save(); renderHud();
    });
    let armed = false, armTimer = 0;
    $('#btn-reset').addEventListener('click', () => {
      const b = $('#btn-reset');
      if (!armed) {
        armed = true;
        b.classList.add('armed');
        b.textContent = '再点一次，清空全部渔获与记录';
        clearTimeout(armTimer);
        armTimer = setTimeout(() => { armed = false; b.classList.remove('armed'); b.textContent = '清空手札 · 重新开始'; }, 4000);
        return;
      }
      clearTimeout(armTimer);
      skipSaveOnHide = true;
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
      location.reload();
    });
    $('#btn-help').addEventListener('click', openHelp);
    $('#help-ok').addEventListener('click', closeHelp);
    $('#help-modal').addEventListener('click', (e) => {
      if (e.target === $('#help-modal')) closeHelp();
    });
  }

  function openHelp() {
    paused = true;
    if (S.phase === 'fight' && S.fight) S.fight.holding = false;
    $('#help-modal').classList.add('show');
    try { $('#help-ok').focus({ preventScroll: true }); } catch (e) { }
  }
  function closeHelp() {
    $('#help-modal').classList.remove('show');
    paused = false;
    lastT = performance.now();
  }

  function resetToIdle() {
    S.phase = 'idle';
    S.bobber.x = 0; S.bobber.y = SURF;
    S.fight = null; S.fish = null;
    $('#fight').classList.remove('show');
    $('#cast-bar').classList.remove('show');
    seedFish();
    setUI();
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    load();
    resize();
    new ResizeObserver(() => resize()).observe(cvs.parentElement);
    window.addEventListener('orientationchange', () => setTimeout(resize, 260));

    const zone = $('#tension-zone');
    zone.style.bottom = '24%';
    zone.style.height = '54%';

    bindInput();
    renderAll();
    setUI();
    requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(frame); });

    if (!G.seenHelp) {
      setTimeout(() => { openHelp(); G.seenHelp = true; save(); }, 500);
    }

    // 测试/调试钩子
    window.Tidewater = {
      get state() { return S; },
      get save() { return G; },
      fish: FISH, waters: WATERS, baits: BAITS, rods: RODS, lines: LINES,
      portrait,
      _forceBite() { if (S.phase === 'waiting') { S.biteAt = S.t; S.nibbleAt = S.t; S.nibbleDone = false; } },
      _hookNow() { S.phase = 'bite'; hookFish(); },
      _setTension(v) { if (S.fight) S.fight.tension = v; },
      _setProgress(v) { if (S.fight) S.fight.progress = v; },
      _hold(v) { if (S.fight) S.fight.holding = v; },
      _reset() { skipSaveOnHide = true; try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); },
      _addCoins(n) { G.coins += n; save(); renderAll(); },
      _castTo(p) { startCharge(); S.power = p; S.powerDir = 1; releaseCast(); },
      _sim(water, rig, bait, power, n) {
        const oW = G.water, oR = G.rig, oB = G.bait, oX = S.targetX, oS = S.sweet;
        G.water = water; G.rig = rig; G.bait = bait; S.targetX = castX(power); S.sweet = false;
        const out = {};
        for (let i = 0; i < n; i++) {
          const f = chooseFish();
          const k = f ? f.id : 'none';
          out[k] = (out[k] || 0) + 1;
        }
        G.water = oW; G.rig = oR; G.bait = oB; S.targetX = oX; S.sweet = oS;
        return out;
      },
      _unlock() { G.coins = 9999; G.baits = BAITS.map((b) => b.id); G.waters = WATERS.map((w) => w.id); save(); renderAll(); }
    };
  }

  window.addEventListener('pagehide', () => {
    clearTimeout(saveTimer);
    if (dirty && !skipSaveOnHide) writeSave();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
