/* =========================================================
   app.js — منطق موقع مترجم (ما تحتاج تعدّل هنا عادةً)
   البيانات كلها في data.js
   الصفحات: index / browse / game / add / about
   ========================================================= */

/* ---------- أدوات عامة ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const PAGE = document.body.dataset.page;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hash = s => [...String(s)].reduce((h, c) => Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0, 2166136261);

const pubById = Object.fromEntries(PUBLISHERS.map(p => [p.id, p]));
const getPub = id => pubById[id] || { id, name: id || 'غير معروف', en: '' };

const fmt = n => {
  n = +n || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};
const fmtDate = d => {
  if (!d) return '—';
  const date = new Date(d + 'T00:00:00');
  return isNaN(date) ? d : date.toLocaleDateString('ar-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' });
};
const progressOf = g => Math.max(0, Math.min(100, g.progress ?? 100));
const isDone = g => progressOf(g) === 100;
const gameUrl = g => 'game.html?id=' + encodeURIComponent(g.id);
const browseUrl = (k, v) => 'browse.html' + (k ? `?${k}=${encodeURIComponent(v)}` : '');

/* ---------- أيقونات بكسل (# = بكسل مليان) ---------- */
const PX = {
  search: ['..####....', '.#....#...', '#......#..', '#......#..', '#......#..', '#......#..', '.#....#...', '..####.#..', '.......##.', '........##'],
  heart: ['.##...##.', '####.####', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'],
  heartO: ['.##...##.', '#..#.#..#', '#...#...#', '#.......#', '.#.....#.', '..#...#..', '...#.#...', '....#....'],
  sun: ['.....#.....', '.#...#...#.', '..#.....#..', '....###....', '...#####...', '##.#####.##', '...#####...', '....###....', '..#.....#..', '.#...#...#.', '.....#.....'],
  moon: ['....###...', '..##......', '.##.......', '.#........', '##........', '##........', '##.......#', '.##.....##', '..#######.', '....###...'],
  menu: ['##########', '..........', '..........', '##########', '..........', '..........', '##########'],
  close: ['##....##', '###..###', '.######.', '..####..', '..####..', '.######.', '###..###', '##....##'],
  arrowL: ['...#.....', '..##.....', '.##......', '#########', '.##......', '..##.....', '...#.....'],
  chevL: ['...##', '..##.', '.##..', '##...', '.##..', '..##.', '...##'],
  chevD: ['#.....#', '##...##', '.##.##.', '..###..', '...#...'],
  download: ['....##....', '....##....', '....##....', '.#..##..#.', '.##.##.##.', '..######..', '...####...', '....##....', '..........', '##########'],
  share: ['.......##.', '......####', '.....#.##.', '...##.....', '.##.......', '####......', '.##.......', '...##.....', '.....#.##.', '......####', '.......##.'],
  play: ['#......', '###....', '#####..', '#######', '#####..', '###....', '#......'],
  check: ['.........#', '........##', '.......##.', '#.....##..', '##...##...', '.##.##....', '..###.....', '...#......'],
  file: ['#####...', '#...##..', '#...#.#.', '#...####', '#......#', '#......#', '#......#', '#......#', '#......#', '########'],
  flag: ['#.......', '########', '#######.', '######..', '#######.', '########', '#.......', '#.......', '#.......', '#.......'],
  mail: ['###########', '##.......##', '#.#.....#.#', '#..#...#..#', '#...#.#...#', '#....#....#', '#.........#', '###########'],
  cursor: ['...#.........', '..##.........', '.###.........', '####.###.##.#', '.###.........', '..##.........', '...#.........']
};
const flip = rows => rows.map(r => [...r].reverse().join(''));
PX.arrowR = flip(PX.arrowL);
PX.chevR = flip(PX.chevL);

const _pxPath = {};
function icon(n, cls = '') {
  const rows = PX[n];
  if (!rows) return '';
  if (!_pxPath[n]) {
    let d = '';
    rows.forEach((r, y) => r.replace(/#+/g, (m, x) => { d += `M${x} ${y}h${m.length}v1h-${m.length}z`; return m; }));
    _pxPath[n] = d;
  }
  const w = rows[0].length, h = rows.length;
  return `<svg class="px ${cls}" viewBox="0 0 ${w} ${h}" width="${w * 2}" height="${h * 2}" aria-hidden="true"><path d="${_pxPath[n]}"/></svg>`;
}
/* الأيقونات داخل HTML الثابت: <span data-icon="search"></span> */
function paintIcons(root = document) {
  $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon); el.removeAttribute('data-icon'); });
}

/* ---------- الشعار (مرسوم SVG بنفس شكل الشعار الأصلي) ---------- */
let logoN = 0;
function logoSVG(cls = '') {
  const id = 'lgc' + (++logoN);
  return `
  <svg class="logo-svg ${cls}" viewBox="215 190 1572 615" fill="currentColor" role="img" aria-label="${esc(SITE.name)}">
    <clipPath id="${id}"><rect width="2000" height="797"/></clipPath>
    <path class="lg-l" d="M290 328h152v34H290zM480 328h35v34h-35zM263 352h34v74h-34zM230 426h33v326h-33zM263 752h70v35h-70z"/>
    <path class="lg-r" d="M1560 753h152v34h-152zM1487 753h35v34h-35zM1705 689h34v74h-34zM1739 363h33v326h-33zM1669 328h70v35h-70z"/>
    <g class="lg-word">
      <text x="1001" y="655" text-anchor="middle" direction="rtl" font-family="Readex Pro, sans-serif" font-weight="700" font-size="430" clip-path="url(#${id})">مٮرحم</text>
      <rect x="1210" y="337" width="60" height="56" rx="12"/><rect x="1290" y="337" width="56" height="56" rx="12"/><rect x="830" y="693" width="60" height="57" rx="12"/>
    </g>
    <path class="lg-arrow" d="M1465 362L1490 278L1552 338zM1508 296L1540 264L1553 277L1521 309zM1527 226h20v20h-20zM1555 201h11v11h-11zM1567 227h11v11h-11zM1574 255h17v17h-17zM1555 273h17v17h-17z"/>
  </svg>`;
}
const logoLink = (cls = '') => `<a href="index.html" class="logo ${cls}" aria-label="${esc(SITE.name)} — الرئيسية">${logoSVG()}</a>`;

/* لو فيه ملف شعار (SITE.logo) يستبدل الشعار المرسوم — يقصّ الفراغ حوله ويلوّنه حسب الوضع */
function initLogoImage() {
  if (!SITE.logo) return;
  const apply = (url, ratio, raw) => {
    document.documentElement.style.setProperty('--logo-img', `url("${url}")`);
    $$('.logo-svg').forEach(svg => {
      const s = document.createElement('span');
      s.className = 'logo-img' + (raw ? ' raw' : '');
      s.style.aspectRatio = ratio;
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', SITE.name);
      svg.replaceWith(s);
    });
  };
  const key = 'mutarjim-logo:' + SITE.logo;
  try {
    const c = JSON.parse(sessionStorage.getItem(key));
    if (c) return apply(c.url, c.ratio);
  } catch {}
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth, h = img.naturalHeight;
    try {
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, w, h), px = d.data;
      const clear = px[3] < 16;                               // خلفية شفافة؟
      const light = !clear && (px[0] + px[1] + px[2]) / 3 > 128; // خلفية فاتحة؟
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
        const lum = px[i] * .299 + px[i + 1] * .587 + px[i + 2] * .114;
        const a = clear ? px[i + 3] : light ? 255 - lum : lum;
        px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = a;
        if (a > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      if (x1 < 0) return;
      ctx.putImageData(d, 0, 0);
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
      const out = document.createElement('canvas');
      out.width = cw; out.height = ch;
      out.getContext('2d').drawImage(cv, x0, y0, cw, ch, 0, 0, cw, ch);
      const url = out.toDataURL('image/png');
      try { sessionStorage.setItem(key, JSON.stringify({ url, ratio: cw / ch })); } catch {}
      apply(url, cw / ch);
    } catch {
      apply(SITE.logo, w / h, true); // لو المتصفح منع القراءة (فتح الملف مباشرة) نستخدمه زي ما هو
    }
  };
  img.src = SITE.logo;
}

/* ---------- الثيم ---------- */
const Theme = {
  get() { return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'; },
  set(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('mutarjim-theme', t); } catch {}
    dispatchEvent(new Event('themechange'));
  }
};

/* ---------- المفضلة (تنحفظ في متصفح الزائر + عداد سحابي مجاني بدون داتابيس) ---------- */
const Likes = {
  key: 'mutarjim-likes',
  globalKey: 'mutarjim-global-likes',
  all() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  has(id) { return this.all().includes(id); },
  getGlobalMap() { try { return JSON.parse(localStorage.getItem(this.globalKey)) || {}; } catch { return {}; } },
  getGlobal(id) { return this.getGlobalMap()[id] || 0; },
  setGlobal(id, count) {
    const map = this.getGlobalMap();
    map[id] = Math.max(map[id] || 0, count);
    try { localStorage.setItem(this.globalKey, JSON.stringify(map)); } catch {}
  },
  async fetchGlobal(id, onUpdate) {
    try {
      const res = await fetch(`https://api.counterapi.dev/v1/mutarjim-sa/${id}-likes`);
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.count === 'number') {
        this.setGlobal(id, data.count);
        if (onUpdate) onUpdate();
      }
    } catch (e) {}
  },
  toggle(id) {
    const list = this.all();
    const i = list.indexOf(id);
    const adding = i === -1;
    adding ? list.push(id) : list.splice(i, 1);
    try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {}
    paintFavCount();

    // عداد عام بدون قاعدة بيانات عبر CounterAPI
    try {
      fetch(`https://api.counterapi.dev/v1/mutarjim-sa/${id}-likes/${adding ? 'up' : 'down'}`, { keepalive: true })
        .then(r => r.json())
        .then(data => { if (data && typeof data.count === 'number') this.setGlobal(id, data.count); })
        .catch(() => {});
    } catch (e) {}

    return adding;
  },
  add(id) {
    const list = this.all();
    if (!list.includes(id)) {
      list.push(id);
      try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {}
      paintFavCount();
      try {
        fetch(`https://api.counterapi.dev/v1/mutarjim-sa/${id}-likes/up`, { keepalive: true })
          .then(r => r.json())
          .then(data => { if (data && typeof data.count === 'number') this.setGlobal(id, data.count); })
          .catch(() => {});
      } catch (e) {}
      return true;
    }
    return false;
  }
};
const likeCount = g => (g.likes || 0) + Likes.getGlobal(g.id) + (Likes.has(g.id) && Likes.getGlobal(g.id) === 0 ? 1 : 0);

/* ---------- التحميلات (عداد عام سحابي مجاني بدون داتابيس + كاش محلي) ---------- */
const Downloads = {
  key: 'mutarjim-downloads',
  globalKey: 'mutarjim-global-dl',
  all() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; } },
  getGlobalMap() { try { return JSON.parse(localStorage.getItem(this.globalKey)) || {}; } catch { return {}; } },
  get(id) {
    const globalMap = this.getGlobalMap();
    const local = this.all()[id] || 0;
    const global = globalMap[id] || 0;
    return Math.max(local, global);
  },
  setGlobal(id, count) {
    const globalMap = this.getGlobalMap();
    globalMap[id] = Math.max(globalMap[id] || 0, count);
    try { localStorage.setItem(this.globalKey, JSON.stringify(globalMap)); } catch {}
  },
  async fetchGlobal(id, onUpdate) {
    try {
      const res = await fetch(`https://api.counterapi.dev/v1/mutarjim-sa/${id}-dl`);
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.count === 'number') {
        this.setGlobal(id, data.count);
        if (onUpdate) onUpdate();
      }
    } catch (e) {}
  },
  add(id) {
    // زيادة فورية محلياً للمتصفح
    const map = this.all();
    map[id] = (map[id] || 0) + 1;
    try { localStorage.setItem(this.key, JSON.stringify(map)); } catch {}

    // زيادة العداد العام السحابي لجميع الزوار فوراً
    try {
      fetch(`https://api.counterapi.dev/v1/mutarjim-sa/${id}-dl/up`, { keepalive: true })
        .then(r => r.json())
        .then(data => {
          if (data && typeof data.count === 'number') {
            this.setGlobal(id, data.count);
          }
        })
        .catch(() => {});
    } catch (e) {}

    return this.get(id);
  }
};
const downloadCount = g => (g.downloads || 0) + Downloads.get(g.id);
function paintFavCount() {
  const el = $('#fav-count');
  if (!el) return;
  const n = Likes.all().filter(id => GAMES.some(g => g.id === id)).length;
  el.textContent = n || '';
  el.hidden = !n;
}

/* ---------- تنبيه صغير ---------- */
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

function youtubeId(url) {
  if (!url) return '';
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : '';
}

function matches(g, q) {
  if (!q) return true;
  const p = getPub(g.publisher);
  return [g.title, g.genre, g.desc, p.name, p.en, ...(g.tags || [])].join(' ').toLowerCase().includes(q);
}

/* =========================================================
   قطع HTML مشتركة
   ========================================================= */

/* الغلاف: صورة لو موجودة، وإلا غلاف تلقائي (اسم اللعبة بين قوسين مثل الشعار) */
function coverHTML(g, cls = 'cover') {
  if (g.cover) return `<div class="${cls}"><img src="${esc(g.cover)}" alt="${esc(g.title)}" loading="lazy"></div>`;
  if (cls.includes('mini')) return `<div class="${cls}" aria-hidden="true">${esc([...g.title][0] || '؟')}</div>`;
  const p = getPub(g.publisher);
  const n = GAMES.indexOf(g);
  return `
    <div class="${cls} ph" data-v="${hash(g.id) % 2}">
      <span class="ph-top"><b>${esc(p.en || p.name)}</b><b>${n >= 0 ? '#' + pad(n + 1) : 'NEW'}</b></span>
      <span class="ph-title brk lock">${esc(g.title)}</span>
      <span class="ph-dither" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    </div>`;
}

const tagHTML = g => isDone(g)
  ? `<span class="tag tag-done">مكتملة</span>`
  : `<span class="tag tag-wip"><i></i>قيد الترجمة</span>`;

const segHTML = (g, cls = '') => {
  const p = progressOf(g);
  return `<div class="seg-row"><span class="seg ${cls}" style="--p:${Math.round(p / 5) * 5}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة الترجمة"></span><b>${p}%</b></div>`;
};

function cardHTML(g) {
  const p = getPub(g.publisher);
  return `
  <article class="card">
    <a href="${gameUrl(g)}" class="card-art brk" aria-label="${esc(g.title)}">
      ${coverHTML(g)}
      ${tagHTML(g)}
    </a>
    <div class="card-body">
      <h3><a href="${gameUrl(g)}">${esc(g.title)}</a></h3>
      <p class="card-meta"><a href="${browseUrl('pub', p.id)}">${esc(p.name)}</a><span>${esc(g.genre)}</span></p>
      ${segHTML(g)}
    </div>
  </article>`;
}

function featureHTML(g) {
  const p = getPub(g.publisher);
  return `
  <article class="feature reveal">
    <a href="${gameUrl(g)}" class="feature-art brk" aria-label="${esc(g.title)}">${coverHTML(g)}</a>
    <div class="feature-body">
      <span class="kicker">آخر تحديث · ${fmtDate(g.date)}</span>
      <h3><a href="${gameUrl(g)}">${esc(g.title)}</a></h3>
      <p>${esc(g.desc)}</p>
      <dl class="meta-list">
        <div><dt>الشركة</dt><dd><a href="${browseUrl('pub', p.id)}">${esc(p.name)}</a></dd></div>
        <div><dt>النوع</dt><dd>${esc(g.genre)}</dd></div>
        <div><dt>الإصدار</dt><dd class="pix">v${esc(g.version)}</dd></div>
        <div><dt>الحالة</dt><dd>${isDone(g) ? 'مكتملة' : 'قيد الترجمة'}</dd></div>
      </dl>
      ${segHTML(g)}
      <div class="feature-actions">
        <a href="${gameUrl(g)}" class="btn btn-solid btn-lg">صفحة الترجمة ${icon('arrowL')}</a>
      </div>
    </div>
  </article>`;
}

function sectionHead(no, title, sub = '', more = '', moreLabel = '') {
  return `
  <header class="sec-head reveal">
    <div class="sec-title"><span class="sec-no pix">${pad(no)}</span><h2>${title}</h2></div>
    ${sub ? `<p>${sub}</p>` : ''}
    ${more ? `<a href="${more}" class="more">${moreLabel}${icon('arrowL')}</a>` : ''}
  </header>`;
}

/* ظهور العناصر مع التمرير + عدّاد الأرقام */
function bindReveal(root = document) {
  const items = $$('.reveal:not(.in), [data-count]', root);
  if (!('IntersectionObserver' in window) || REDUCE) {
    items.forEach(el => { el.classList.add('in'); if (el.dataset.count) el.textContent = fmt(+el.dataset.count); });
    return;
  }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('in');
    if (el.dataset.count) countUp(el);
    io.unobserve(el);
  }), { threshold: .12 });
  items.forEach(el => io.observe(el));
}
function countUp(el) {
  const target = +el.dataset.count;
  const steps = 12;
  let i = 0;
  const t = setInterval(() => {
    i++;
    el.textContent = fmt(Math.round(target * i / steps));
    if (i >= steps) clearInterval(t);
  }, 60);
}

/* نص يتكتب حرف حرف مثل حوارات الألعاب */
function typeDialog(el) {
  if (!el) return;
  const box = el.closest('.dialog');
  const full = el.textContent.trim();
  el.setAttribute('aria-label', full);
  if (REDUCE || !('IntersectionObserver' in window)) { box?.classList.add('done'); return; }
  el.style.minHeight = el.offsetHeight + 'px';
  el.textContent = '';
  let skip = false;
  box?.addEventListener('click', () => { skip = true; });
  const io = new IntersectionObserver(async ([en]) => {
    if (!en.isIntersecting) return;
    io.disconnect();
    for (let i = 1; i <= full.length && !skip; i++) { el.textContent = full.slice(0, i); await sleep(20); }
    el.textContent = full;
    box?.classList.add('done');
  }, { threshold: .4 });
  io.observe(el);
}

/* =========================================================
   الهيدر والفوتر (مشتركة لكل الصفحات)
   ========================================================= */
function renderChrome() {
  const status = params.get('status');
  const liked = params.get('liked');
  const NAV = [
    ['index.html', 'الرئيسية', PAGE === 'index'],
    ['browse.html', 'المكتبة', PAGE === 'browse' && status !== 'wip' && !liked],
    ['browse.html?status=wip', 'ورشة الترجمة', PAGE === 'browse' && status === 'wip'],
    ['live.html', 'المترجم المباشر', PAGE === 'live'],
    ['about.html', 'عن المشروع', PAGE === 'about']
  ];

  $('#site-header').outerHTML = `
  <header class="topbar" id="topbar">
    <div class="container topbar-inner">
      ${logoLink()}
      <nav class="nav" id="nav" aria-label="القائمة الرئيسية">
        ${NAV.map(([href, label, on], i) => `<a href="${href}" class="${on ? 'active' : ''}"${on ? ' aria-current="page"' : ''}><span class="cur">${icon('cursor')}</span><span class="nav-no">${pad(i + 1)}</span>${label}</a>`).join('')}
        <a href="about.html#contact" class="nav-mobile"><span class="nav-no">${pad(NAV.length + 1)}</span>تطوّع معنا</a>
      </nav>
      <div class="top-actions">
        <button class="search-trigger" data-open-search aria-label="بحث">${icon('search')}<span>ابحث عن لعبة</span><kbd>/</kbd></button>
        <a href="browse.html?liked=1" class="icon-btn ${PAGE === 'browse' && liked ? 'active' : ''}" title="مفضلتي" aria-label="مفضلتي">${icon('heart')}<b class="fav-count" id="fav-count" hidden></b></a>
        <button class="icon-btn" id="theme-btn" title="الوضع الليلي / النهاري" aria-label="تبديل الوضع الليلي والنهاري">${icon('sun', 'i-sun')}${icon('moon', 'i-moon')}</button>
        <button class="icon-btn menu-btn" id="menu-btn" aria-label="القائمة" aria-expanded="false">${icon('menu')}</button>
      </div>
    </div>
  </header>

  <div class="palette" id="palette" hidden>
    <div class="palette-box brk lock" role="dialog" aria-modal="true" aria-label="بحث">
      <form action="browse.html" class="palette-field">
        ${icon('search')}
        <input type="search" name="q" id="palette-q" placeholder="اكتب اسم اللعبة أو الشركة" autocomplete="off">
        <kbd>Esc</kbd>
      </form>
      <div class="suggest" id="palette-suggest"></div>
      <div class="palette-hint" id="palette-hint">
        <span>الأكثر طلباً:</span>
        ${[...GAMES].sort((a, b) => downloadCount(b) - downloadCount(a)).slice(0, 4).map(g => `<a href="${gameUrl(g)}">${esc(g.title)}</a>`).join('')}
      </div>
    </div>
  </div>`;

  const pubsWithGames = PUBLISHERS.filter(p => GAMES.some(g => g.publisher === p.id)).slice(0, 5);
  $('#site-footer').outerHTML = `
  <footer class="footer inv">
    <div class="dither-edge" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="container footer-main">
      <div class="footer-brand">
        ${logoLink()}
        <p>مشروع تطوعي غير ربحي يترجم الألعاب إلى العربية. كل الترجمات مجانية، وبدون إعلانات.</p>
      </div>
      <div class="footer-cols">
        <div>
          <h5>المكتبة</h5>
          <a href="browse.html">كل الترجمات</a>
          <a href="browse.html?status=done">ترجمات مكتملة</a>
          <a href="browse.html?status=wip">ورشة الترجمة</a>
          <a href="browse.html?liked=1">مفضلتي</a>
          <a href="live.html">المترجم المباشر</a>
        </div>
        <div>
          <h5>شركات</h5>
          ${pubsWithGames.map(p => `<a href="${browseUrl('pub', p.id)}">${esc(p.name)}</a>`).join('')}
        </div>
        <div>
          <h5>المشروع</h5>
          <a href="about.html">عن المشروع</a>
          <a href="about.html#contact">اطلب ترجمة / تطوّع</a>
          <a href="about.html#legal">الخصوصية والشروط</a>
        </div>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(SITE.name)}</span>
      <span>نوفّر ملفات الترجمة فقط، مو الألعاب نفسها.</span>
      <span>صُنع للاعبين العرب ${icon('heart')}</span>
    </div>
  </footer>`;

  /* قائمة الجوال */
  const menuBtn = $('#menu-btn');
  menuBtn.addEventListener('click', () => {
    const open = $('#nav').classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.innerHTML = icon(open ? 'close' : 'menu');
    document.body.classList.toggle('menu-open', open);
  });

  $('#theme-btn').addEventListener('click', () => Theme.set(Theme.get() === 'dark' ? 'light' : 'dark'));

  /* لوحة البحث */
  const pal = $('#palette');
  const q = $('#palette-q');
  const openPal = () => { pal.hidden = false; q.value = ''; renderSuggest('', $('#palette-suggest')); $('#palette-hint').hidden = false; setTimeout(() => q.focus(), 20); };
  const closePal = () => { pal.hidden = true; };
  document.addEventListener('click', e => { if (e.target.closest('[data-open-search]')) { e.preventDefault(); openPal(); } });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  q.addEventListener('input', () => { renderSuggest(q.value, $('#palette-suggest')); $('#palette-hint').hidden = !!q.value.trim(); });
  document.addEventListener('keydown', e => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (e.key === 'Escape' && !pal.hidden) closePal();
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openPal(); }
  });

  paintFavCount();
}

function renderSuggest(value, box) {
  const q = value.trim().toLowerCase();
  if (!q) { box.innerHTML = ''; return; }
  const list = GAMES.filter(g => matches(g, q)).slice(0, 6);
  box.innerHTML = list.length
    ? list.map(g => `
        <a href="${gameUrl(g)}" class="suggest-item">
          ${coverHTML(g, 'cover mini')}
          <span class="s-title"><b>${esc(g.title)}</b><small>${esc(getPub(g.publisher).name)} · ${esc(g.genre)}</small></span>
          ${isDone(g) ? '<span class="tag tag-done">مكتملة</span>' : `<span class="tag tag-wip"><i></i>${progressOf(g)}%</span>`}
        </a>`).join('') +
      `<a href="browse.html?q=${encodeURIComponent(value.trim())}" class="suggest-all">كل النتائج في المكتبة ${icon('arrowL')}</a>`
    : `<div class="suggest-empty"><b>ما لقينا ترجمة لـ "${esc(value.trim())}"</b><span>تبيها؟ <a href="about.html#contact">اطلبها من هنا</a></span></div>`;
}

/* =========================================================
   الرئيسية
   ========================================================= */
function initHome() {
  const done = GAMES.filter(isDone);
  const wip = GAMES.filter(g => !isDone(g));
  const byDate = [...GAMES].sort((a, b) => b.date.localeCompare(a.date));
  const pubCounts = GAMES.reduce((m, g) => (m[g.publisher] = (m[g.publisher] || 0) + 1, m), {});

  /* شاشة العنوان */
  $('#ts-logo').insertAdjacentHTML('afterbegin', logoSVG('intro'));
  initTitleMenu();
  initStars($('#stars'));
  initPress($('#ts-press'));

  /* شعار الهيدر يختفي وشاشة العنوان ظاهرة (الشعار الكبير يكفي) */
  const topbar = $('#topbar');
  const title = $('#title');
  const onScroll = () => topbar.classList.toggle('at-title', scrollY < title.offsetHeight - 160);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* الأرقام */
  $('#st-total').dataset.count = GAMES.length;
  $('#st-done').dataset.count = done.length;
  $('#st-wip').dataset.count = wip.length;
  $('#st-pubs').dataset.count = Object.keys(pubCounts).length;
  $('#st-dl').dataset.count = GAMES.reduce((s, g) => s + downloadCount(g), 0);

  // تحديث إجمالي التحميلات سحابياً بدون قاعدة بيانات
  GAMES.forEach(g => {
    Downloads.fetchGlobal(g.id, () => {
      const el = $('#st-dl');
      if (el) {
        const total = GAMES.reduce((s, x) => s + downloadCount(x), 0);
        el.textContent = fmt(total);
      }
    });
  });

  /* آخر الترجمات */
  $('#latest').innerHTML =
    sectionHead(1, 'آخر الترجمات', 'آخر الترجمات اللي انضافت أو تحدّثت.', 'browse.html', 'المكتبة كاملة') +
    (byDate[0] ? featureHTML(byDate[0]) : '') +
    (byDate.length > 1 ? `<div class="grid grid-4 reveal">${byDate.slice(1, 5).map(cardHTML).join('')}</div>` : '');

  /* ورشة الترجمة */
  const rows = [...wip].sort((a, b) => progressOf(b) - progressOf(a));
  $('#workshop').innerHTML =
    sectionHead(2, 'ورشة الترجمة', 'مشاريع شغالين عليها الحين. جرّب الإصدار التجريبي وساعدنا بملاحظاتك.', 'browse.html?status=wip', 'كل المشاريع') +
    `<div class="log reveal">
      <div class="log-head" aria-hidden="true"><span>#</span><span>اللعبة</span><span>التقدّم</span><span>آخر تحديث</span><span></span></div>
      ${rows.length ? rows.map((g, i) => `
        <a href="${gameUrl(g)}" class="log-row">
          <span class="log-no">${pad(i + 1)}</span>
          <span class="log-title"><b>${esc(g.title)}</b><small>${esc(getPub(g.publisher).name)} · ${esc(g.genre)}</small></span>
          <span class="log-seg">${segHTML(g)}</span>
          <span class="log-date">${esc(g.date)}</span>
          <span class="log-go">${icon('arrowL')}</span>
        </a>`).join('') : '<p class="log-empty">كل الترجمات مكتملة حالياً.</p>'}
    </div>`;

  /* الشركات */
  const pubs = [...PUBLISHERS].sort((a, b) => (pubCounts[b.id] || 0) - (pubCounts[a.id] || 0));
  $('#publishers').innerHTML =
    sectionHead(3, 'تصفّح حسب الشركة', 'اختر الشركة وتطلع لك كل ترجمات ألعابها.') +
    `<div class="pub-index reveal">${pubs.map(p => `<a href="${browseUrl('pub', p.id)}" class="${pubCounts[p.id] ? '' : 'zero'}">${esc(p.name)}<sup class="pix">${pubCounts[p.id] || 0}</sup></a>`).join('<span class="sep" aria-hidden="true">/</span>')}</div>`;

  typeDialog($('#manifesto .dialog-text'));
  bindReveal();
}

/* قائمة شاشة العنوان: تتحرك بالأسهم مثل قوائم الألعاب */
function initTitleMenu() {
  const items = $$('#ts-menu > *');
  let cur = 0;
  const set = i => { cur = (i + items.length) % items.length; items.forEach((el, k) => el.classList.toggle('on', k === cur)); };
  items.forEach((el, i) => {
    el.addEventListener('mouseenter', () => set(i));
    el.addEventListener('focus', () => set(i));
  });
  document.addEventListener('keydown', e => {
    if (!$('#palette').hidden || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (scrollY > innerHeight * .5) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); set(cur + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); set(cur - 1); }
    else if (e.key === 'Enter' && (document.activeElement === document.body || items.includes(document.activeElement))) { e.preventDefault(); items[cur].click(); }
  });
  set(0);
}

/* نجوم بكسل تتحرك ببطء في الخلفية */
function initStars(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  let W = 0, H = 0, stars = [], raf = 0, last = 0;
  const make = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round(W * H / 7000) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() < .12 ? 4 : 2, v: .3 + Math.random() * .9, a: .2 + Math.random() * .7
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getComputedStyle(canvas).color;
    for (const s of stars) { ctx.globalAlpha = s.a; ctx.fillRect(Math.round(s.x / 2) * 2, Math.round(s.y / 2) * 2, s.s, s.s); }
    ctx.globalAlpha = 1;
  };
  make(); draw();
  addEventListener('resize', () => { make(); draw(); });
  addEventListener('themechange', draw);
  if (REDUCE) return;
  const tick = t => {
    if (t - last > 120) { /* حركة متقطعة مقصودة (إحساس ألعاب قديمة) */
      last = t;
      for (const s of stars) {
        s.x -= s.v * 2;
        if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H; }
        if (Math.random() < .01) s.a = .2 + Math.random() * .7;
      }
      draw();
    }
    raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([en]) => {
    cancelAnimationFrame(raf);
    if (en.isIntersecting) raf = requestAnimationFrame(tick);
  }).observe(canvas);
}

/* "PRESS START" يتحول للعربي — فكرة الموقع في سطر */
async function initPress(el) {
  if (!el) return;
  const P = [['PRESS START', 'اضغط ابدأ'], ['NEW GAME', 'لعبة جديدة'], ['CONTINUE?', 'تبي تكمّل؟'], ['GAME SAVED', 'تم حفظ اللعبة'], ['LOADING...', 'جارِ التحميل...']];
  const G = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';
  for (let i = 0; ; i++) {
    const [en, ar] = P[i % P.length];
    el.className = 'ts-press en'; el.dir = 'ltr'; el.textContent = en;
    await sleep(2400);
    el.className = 'ts-press ar'; el.dir = 'rtl';
    if (!REDUCE) for (let s = 1; s <= 10; s++) {
      const k = Math.floor(ar.length * s / 10);
      el.textContent = [...ar].map((c, j) => j < k || c === ' ' ? c : G[Math.random() * G.length | 0]).join('');
      await sleep(50);
    }
    el.textContent = ar;
    await sleep(2600);
  }
}

/* =========================================================
   المكتبة
   ========================================================= */
function initBrowse() {
  const state = {
    q: params.get('q') || '',
    pub: params.get('pub') || 'all',
    genre: params.get('genre') || 'all',
    status: params.get('status') || 'all',
    sort: params.get('sort') || 'date',
    page: Math.max(1, +params.get('page') || 1),
    liked: params.get('liked') === '1'
  };

  const countBy = key => GAMES.reduce((m, g) => (m[g[key]] = (m[g[key]] || 0) + 1, m), {});
  const pubCounts = countBy('publisher');
  const pubsSorted = [...PUBLISHERS].sort((a, b) => (pubCounts[b.id] || 0) - (pubCounts[a.id] || 0) || a.name.localeCompare(b.name, 'ar'));

  /* قائمة الشركات */
  $('#pub-list').innerHTML =
    `<li><button data-pub="all"><span>كل الشركات</span><em>${GAMES.length}</em></button></li>` +
    pubsSorted.map(p => `
      <li data-name="${esc(p.name + ' ' + p.en).toLowerCase()}">
        <button data-pub="${esc(p.id)}" class="${pubCounts[p.id] ? '' : 'empty'}">
          <span>${esc(p.name)}<small>${esc(p.en)}</small></span><em>${pubCounts[p.id] || 0}</em>
        </button>
      </li>`).join('');
  const dd = $('#pub-dd');
  const ddPanel = $('.dd-panel', dd);
  const openDD = open => {
    ddPanel.hidden = !open;
    dd.classList.toggle('open', open);
    $('#pub-btn').setAttribute('aria-expanded', open);
    if (open) setTimeout(() => $('#pub-filter').focus(), 20);
  };
  $('#pub-btn').addEventListener('click', () => openDD(ddPanel.hidden));
  document.addEventListener('click', e => { if (!e.target.closest('#pub-dd')) openDD(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openDD(false); });
  $('#pub-filter').addEventListener('input', e => {
    const v = e.target.value.trim().toLowerCase();
    $$('#pub-list li[data-name]').forEach(li => { li.hidden = v && !li.dataset.name.includes(v); });
  });
  $('#pub-list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.pub = b.dataset.pub; state.page = 1; openDD(false); apply();
  });

  /* الأنواع */
  const genreCounts = countBy('genre');
  $('#genre-list').innerHTML =
    `<button class="chip" data-genre="all">كل الأنواع</button>` +
    Object.keys(genreCounts).sort((a, b) => a.localeCompare(b, 'ar')).map(g => `<button class="chip" data-genre="${esc(g)}">${esc(g)}<em>${genreCounts[g]}</em></button>`).join('');
  $('#genre-list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.genre = b.dataset.genre; state.page = 1; apply();
  });

  const search = $('#browse-q');
  search.value = state.q;
  search.addEventListener('input', () => { state.q = search.value; state.page = 1; apply(); });
  $('#status-tabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.status = b.dataset.status; state.page = 1; apply();
  });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; state.page = 1; apply(); });

  $('#pagination').addEventListener('click', e => {
    const b = e.target.closest('button[data-page]'); if (!b || b.disabled) return;
    state.page = +b.dataset.page; apply(true);
  });
  $('#active-filters').addEventListener('click', e => {
    const b = e.target.closest('button[data-clear]'); if (!b) return;
    const k = b.dataset.clear;
    if (k === 'all') Object.assign(state, { q: '', pub: 'all', genre: 'all', status: 'all', liked: false });
    else if (k === 'liked') state.liked = false;
    else state[k] = k === 'q' ? '' : 'all';
    if (k === 'q' || k === 'all') search.value = '';
    state.page = 1; apply();
  });

  function apply(scroll) {
    const q = state.q.trim().toLowerCase();
    const likedList = Likes.all();
    const base = GAMES.filter(g =>
      matches(g, q)
      && (state.pub === 'all' || g.publisher === state.pub)
      && (state.genre === 'all' || g.genre === state.genre)
      && (!state.liked || likedList.includes(g.id)));

    $('#n-all').textContent = base.length;
    $('#n-done').textContent = base.filter(isDone).length;
    $('#n-wip').textContent = base.filter(g => !isDone(g)).length;

    const list = base.filter(g => state.status === 'done' ? isDone(g) : state.status === 'wip' ? !isDone(g) : true);
    list.sort((a, b) => {
      if (state.sort === 'name') return a.title.localeCompare(b.title, 'ar');
      if (state.sort === 'progress') return progressOf(b) - progressOf(a) || b.date.localeCompare(a.date);
      return b.date.localeCompare(a.date);
    });

    const per = SITE.perPage || 12;
    const pages = Math.max(1, Math.ceil(list.length / per));
    if (state.page > pages) state.page = pages;
    $('#grid').innerHTML = list.slice((state.page - 1) * per, state.page * per).map(cardHTML).join('');
    $('#noResults').hidden = list.length > 0;
    renderPagination(pages);

    const p = state.pub !== 'all' ? getPub(state.pub) : null;
    let title = 'المكتبة';
    if (state.liked) title = 'مفضلتي';
    else if (p) title = p.name;
    else if (state.status === 'wip') title = 'ورشة الترجمة';
    else if (state.status === 'done') title = 'ترجمات مكتملة';
    else if (state.genre !== 'all') title = 'ألعاب ' + state.genre;
    $('#page-title').textContent = title;
    $('#page-count').textContent = `[${pad(list.length)}]`;
    $('#page-sub').textContent = state.liked ? 'الترجمات اللي حفظتها في مفضلتك. محفوظة في متصفحك أنت بس.'
      : p ? `كل ترجمات ألعاب ${p.en || p.name}.`
      : state.status === 'wip' ? 'مشاريع شغالين عليها الحين. تقدر تجرّب الإصدارات التجريبية.'
      : 'كل ترجمات الألعاب في مكان واحد. ابحث، فلتر، واختر لعبتك.';
    document.title = title + ' | ' + SITE.name;

    $('#pub-label').textContent = p ? p.name : 'كل الشركات';
    $('#pub-btn').classList.toggle('is-set', !!p);
    $$('#pub-list button').forEach(b => b.classList.toggle('active', b.dataset.pub === state.pub));
    $$('#genre-list button').forEach(b => b.classList.toggle('active', b.dataset.genre === state.genre));
    $$('#status-tabs button').forEach(b => { const on = b.dataset.status === state.status; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    $('#sort').value = state.sort;

    const chips = [];
    if (state.q.trim()) chips.push(['q', '“' + state.q.trim() + '”']);
    if (p) chips.push(['pub', p.name]);
    if (state.genre !== 'all') chips.push(['genre', state.genre]);
    if (state.liked) chips.push(['liked', 'مفضلتي']);
    $('#active-filters').innerHTML = chips.length
      ? chips.map(([k, t]) => `<button data-clear="${k}" aria-label="إزالة ${esc(t)}">${esc(t)} ${icon('close')}</button>`).join('') + `<button data-clear="all" class="clear-all">مسح الكل</button>`
      : '';

    const u = new URLSearchParams();
    if (state.q.trim()) u.set('q', state.q.trim());
    if (state.pub !== 'all') u.set('pub', state.pub);
    if (state.genre !== 'all') u.set('genre', state.genre);
    if (state.status !== 'all') u.set('status', state.status);
    if (state.sort !== 'date') u.set('sort', state.sort);
    if (state.page > 1) u.set('page', state.page);
    if (state.liked) u.set('liked', '1');
    history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));

    if (scroll) $('#lib-top').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPagination(pages) {
    const cur = state.page;
    const el = $('#pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }
    const nums = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - cur) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    el.innerHTML =
      `<button data-page="${cur - 1}" ${cur === 1 ? 'disabled' : ''} aria-label="السابق">${icon('chevR')}</button>` +
      nums.map(n => n === '…' ? '<span>…</span>' : `<button data-page="${n}" class="${n === cur ? 'active' : ''}">${pad(n)}</button>`).join('') +
      `<button data-page="${cur + 1}" ${cur === pages ? 'disabled' : ''} aria-label="التالي">${icon('chevL')}</button>`;
  }

  apply();
}

/* =========================================================
   صفحة اللعبة
   ========================================================= */
function initGame() {
  const g = GAMES.find(x => x.id === params.get('id'));
  const root = $('#game-root');

  if (!g) {
    document.title = 'غير موجودة | ' + SITE.name;
    root.innerHTML = `
      <div class="container empty">
        <div class="empty-glyph">404</div>
        <h1>ما لقينا هالصفحة</h1>
        <p>يمكن الرابط غلط، أو الترجمة انحذفت.</p>
        <a href="browse.html" class="btn btn-solid">تصفّح المكتبة</a>
      </div>`;
    return;
  }

  const p = getPub(g.publisher);
  const files = g.files || [];
  const mainFile = files.find(f => f.main) || files[0];
  const ytId = youtubeId(g.video);
  const images = g.images || [];
  const req = g.req;
  const changelog = g.changelog || [];
  const prog = progressOf(g);
  document.title = 'ترجمة ' + g.title + ' | ' + SITE.name;
  $('meta[name="description"]').setAttribute('content', g.desc || '');

  const reqRows = [['os', 'النظام'], ['cpu', 'المعالج'], ['ram', 'الرام'], ['gpu', 'كرت الشاشة'], ['dx', 'DirectX'], ['storage', 'المساحة']];

  const sections = [
    ['about', 'عن الترجمة'],
    ['install', 'طريقة التثبيت'],
    ytId && ['video', 'العرض'],
    images.length && ['images', 'الصور'],
    ['files', 'التحميل'],
    req && ['req', 'المتطلبات'],
    changelog.length && ['changelog', 'سجل التحديثات']
  ].filter(Boolean);
  const no = id => pad(sections.findIndex(s => s[0] === id) + 1);

  const similar = GAMES
    .filter(x => x.id !== g.id)
    .map(x => ({ x, score: (x.publisher === g.publisher ? 2 : 0) + (x.genre === g.genre ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || downloadCount(b.x) - downloadCount(a.x))
    .slice(0, 4).map(o => o.x);

  const fileHTML = f => `
    <div class="file">
      ${icon('file')}
      <div>
        <b>${esc(f.name)} ${f.main ? '<span class="tag tag-done">الملف الرئيسي</span>' : ''}</b>
        <span class="file-meta">${[f.version && 'الإصدار ' + esc(f.version), f.size && `<bdi>${esc(f.size)}</bdi>`].filter(Boolean).join(' · ')}</span>
        ${f.note ? `<p>${esc(f.note)}</p>` : ''}
      </div>
      ${dlButton(f, f.main ? 'btn-solid' : 'btn-line', icon('download') + 'تحميل')}
    </div>`;

  const sec = (id, title, body) => `
    <section class="g-sec reveal" id="sec-${id}">
      <h2><span class="pix">${no(id)}</span>${title}</h2>
      ${body}
    </section>`;

  root.innerHTML = `
  <section class="g-head">
    <div class="container g-grid">
      <div class="g-art brk lock">${coverHTML(g)}</div>

      <div class="g-info">
        <nav class="crumbs" aria-label="مسار الصفحة">
          <a href="index.html">الرئيسية</a>${icon('chevL')}
          <a href="browse.html">المكتبة</a>${icon('chevL')}
          <a href="${browseUrl('pub', p.id)}">${esc(p.name)}</a>
        </nav>
        <span class="kicker">${esc(p.name)} · ${esc(g.genre)}</span>
        <h1>${esc(g.title)}</h1>
        <p class="g-desc">${esc(g.desc)}</p>

        <div class="g-status">
          <div class="g-status-top"><span>${isDone(g) ? 'الترجمة مكتملة' : 'قيد الترجمة'}</span><b class="pix">${prog}%</b></div>
          <span class="seg xl" style="--p:${Math.round(prog / 5) * 5}" role="progressbar" aria-valuenow="${prog}" aria-valuemin="0" aria-valuemax="100" aria-label="نسبة الترجمة"></span>
          ${g.features && g.features.length ? `<ul class="g-feat">${g.features.slice(0, 4).map(f => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul>` : ''}
        </div>

        <dl class="g-meta">
          <div><dt>إصدار الترجمة</dt><dd>v${esc(g.version)}</dd></div>
          <div><dt>آخر تحديث</dt><dd>${esc(g.date)}</dd></div>
          <div><dt>التحميلات</dt><dd id="dl-count">${fmt(downloadCount(g))}</dd></div>
          <div><dt>الإعجابات</dt><dd id="like-count">${likeCount(g).toLocaleString('en')}</dd></div>
        </dl>

        <div class="g-actions">
          ${mainFile ? dlButton(mainFile, 'btn-solid btn-lg', `${icon('download')}تحميل الترجمة${mainFile.size ? `<small>${esc(mainFile.size)}</small>` : ''}`) : ''}
          <button class="btn btn-line btn-lg" id="like-btn"></button>
          <button class="btn btn-line btn-lg btn-icon" id="share-btn" title="نسخ الرابط" aria-label="نسخ الرابط">${icon('share')}</button>
        </div>

        ${(g.tags || []).length ? `<div class="g-tags">${g.tags.slice(0, 5).map(t => `<a href="browse.html?q=${encodeURIComponent(t)}" class="chip">#${esc(t)}</a>`).join('')}</div>` : ''}
      </div>
    </div>
  </section>

  <div class="container g-body">
    <aside class="g-toc">
      <nav id="toc" aria-label="محتويات الصفحة">
        ${sections.map(([id, label]) => `<a href="#sec-${id}" data-sec="${id}"><span>${no(id)}</span>${label}</a>`).join('')}
      </nav>
      <a href="about.html?report=${encodeURIComponent(g.id)}#contact" class="toc-report">${icon('flag')}إبلاغ عن مشكلة</a>
    </aside>

    <div class="g-content">
      ${sec('about', 'عن الترجمة', `
        ${(g.about || [g.desc]).map(t => `<p>${esc(t)}</p>`).join('')}
        ${g.features && g.features.length ? `<h3>وش تشمل الترجمة</h3><ul class="checks">${g.features.map(f => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul>` : ''}`)}

      ${sec('install', 'طريقة التثبيت', `
        <ol class="steps">
          <li><b>جهّز اللعبة</b><span>تأكد إن اللعبة مثبتة ونسختك أصلية ومحدّثة.</span></li>
          <li><b>حمّل الترجمة</b><span>من قسم <a href="#sec-files">التحميل</a> تحت.</span></li>
          <li><b>انسخ الملفات</b><span>فك الضغط وانسخها داخل مجلد اللعبة. خذ نسخة احتياطية قبل.</span></li>
          <li><b>العب بالعربي</b><span>شغّل اللعبة واختر اللغة من الإعدادات إذا لزم.</span></li>
        </ol>
        <div class="notice"><div><b>نوفّر ملفات الترجمة فقط.</b><span>اللعبة نفسها لازم تشتريها من متجرها الرسمي.</span></div></div>`)}

      ${ytId ? sec('video', 'العرض', `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${ytId}" title="${esc(g.title)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`) : ''}

      ${images.length ? sec('images', 'صور الترجمة داخل اللعبة', `<div class="gallery">${images.map((src, i) => `<button class="shot" data-i="${i}" aria-label="عرض الصورة ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>`) : ''}

      ${sec('files', 'التحميل', files.length ? `<div class="files">${files.map(fileHTML).join('')}</div>` : '<p class="muted">ما فيه ملفات مضافة بعد.</p>')}

      ${req ? sec('req', 'متطلبات تشغيل اللعبة', `
        <div class="table-wrap"><table class="req">
          <thead><tr><th></th><th>الحد الأدنى</th><th>المُوصى به</th></tr></thead>
          <tbody>${reqRows.map(([k, l]) => `<tr><th>${l}</th><td>${esc(req.min?.[k] || '—')}</td><td>${esc(req.rec?.[k] || '—')}</td></tr>`).join('')}</tbody>
        </table></div>`) : ''}

      ${changelog.length ? sec('changelog', 'سجل التحديثات', `
        <div class="changelog">${changelog.map(c => `<div class="ver"><div class="ver-head"><b>v${esc(c.version)}</b><span>${fmtDate(c.date)}</span></div><ul>${(c.notes || []).map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>`).join('')}</div>`) : ''}
    </div>
  </div>

  ${similar.length ? `
  <section class="section container">
    ${sectionHead(sections.length + 1, 'قد يعجبك أيضاً', 'ترجمات قريبة من هذي اللعبة.', 'browse.html', 'المكتبة كاملة')}
    <div class="grid grid-4 reveal">${similar.map(cardHTML).join('')}</div>
  </section>` : ''}`;

  /* تمييز القسم الحالي في الفهرس */
  if ('IntersectionObserver' in window) {
    const links = Object.fromEntries($$('#toc a').map(a => [a.dataset.sec, a]));
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('#toc a').forEach(a => a.classList.remove('active'));
      const a = links[en.target.id.replace('sec-', '')];
      if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    }), { rootMargin: '-30% 0px -60% 0px' });
    $$('.g-sec').forEach(s => io.observe(s));
  }

  const likeBtn = $('#like-btn');
  const paintLike = () => {
    const on = Likes.has(g.id);
    likeBtn.innerHTML = icon(on ? 'heart' : 'heartO') + (on ? 'في مفضلتك' : 'أعجبني');
    likeBtn.classList.toggle('is-liked', on);
    likeBtn.setAttribute('aria-pressed', on);
    $('#like-count').textContent = likeCount(g).toLocaleString('en');
  };

  root.addEventListener('click', e => {
    const emptyA = e.target.closest('a.dl[data-empty]');
    if (emptyA) {
      e.preventDefault();
      toast('رابط ملف الترجمة لسا ما انضاف. أضفه في data.js');
      return;
    }
    const dlA = e.target.closest('a.dl');
    if (dlA) {
      Downloads.add(g.id);
      const dlEl = $('#dl-count');
      if (dlEl) dlEl.textContent = fmt(downloadCount(g));

      if (!Likes.has(g.id)) {
        Likes.add(g.id);
        paintLike();
      }
      toast('بدأ التحميل، وتمت إضافة الترجمة للمفضلة ❤️');
    }
  });

  likeBtn.addEventListener('click', () => {
    toast(Likes.toggle(g.id) ? 'انضافت لمفضلتك' : 'انشالت من مفضلتك');
    paintLike();
  });
  paintLike();

  // جلب العداد السحابي العام المشترك لجميع الزوار في الخلفية
  Downloads.fetchGlobal(g.id, () => {
    const dlEl = $('#dl-count');
    if (dlEl) dlEl.textContent = fmt(downloadCount(g));
  });
  Likes.fetchGlobal(g.id, paintLike);

  $('#share-btn').addEventListener('click', async () => {
    const url = location.href.split('#')[0];
    try { await navigator.clipboard.writeText(url); toast('تم نسخ رابط الترجمة'); }
    catch { prompt('انسخ الرابط:', url); }
  });

  if (images.length) initLightbox(images);
  bindReveal(root);
}

function dlButton(f, cls, label) {
  const has = f.url && f.url !== '#';
  return has
    ? `<a href="${esc(f.url)}" class="btn ${cls} dl" target="_blank" rel="noopener" download>${label}</a>`
    : `<a href="#" class="btn ${cls} dl" data-empty title="ما فيه رابط بعد">${label}</a>`;
}

function initLightbox(images) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.innerHTML = `<button class="lb-close" aria-label="إغلاق">${icon('close')}</button><button class="lb-prev" aria-label="السابق">${icon('chevR')}</button><img alt=""><button class="lb-next" aria-label="التالي">${icon('chevL')}</button>`;
  document.body.appendChild(box);
  let i = 0;
  const img = $('img', box);
  const show = n => { i = (n + images.length) % images.length; img.src = images[i]; box.hidden = false; document.body.style.overflow = 'hidden'; };
  const hide = () => { box.hidden = true; document.body.style.overflow = ''; };
  $$('.shot').forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
  $('.lb-close', box).onclick = hide;
  $('.lb-prev', box).onclick = () => show(i - 1);
  $('.lb-next', box).onclick = () => show(i + 1);
  box.addEventListener('click', e => { if (e.target === box) hide(); });
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowRight') show(i - 1);
    if (e.key === 'ArrowLeft') show(i + 1);
  });
}


/* =========================================================
   عن المشروع / التواصل
   ========================================================= */
function initAbout() {
  const form = $('#contact-form');
  const type = $('#c-type');
  const report = params.get('report');
  const game = report && GAMES.find(g => g.id === report);
  if (game) {
    type.value = 'مشكلة في ترجمة';
    $('#c-game').value = game.title;
    $('#c-msg').value = `فيه مشكلة في ترجمة "${game.title}": `;
  }
  $('#site-email').innerHTML = icon('mail') + esc(SITE.email);
  $('#site-email').href = 'mailto:' + SITE.email;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#c-name').value.trim();
    const subject = `[${SITE.name}] ${type.value}${$('#c-game').value.trim() ? ' — ' + $('#c-game').value.trim() : ''}`;
    const body = `الاسم: ${name}\nالنوع: ${type.value}\nاللعبة: ${$('#c-game').value.trim() || '—'}\n\n${$('#c-msg').value.trim()}`;
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('بيفتح برنامج الإيميل عندك لإرسال الرسالة');
  });

  $('#ab-games').dataset.count = GAMES.length;
  $('#ab-pubs').dataset.count = new Set(GAMES.map(g => g.publisher)).size;
  $('#ab-dl').dataset.count = GAMES.reduce((s, g) => s + downloadCount(g), 0);
  typeDialog($('#about-dialog .dialog-text'));
  bindReveal();
}

/* ---------- المزامنة التلقائية مع GitHub للألعاب الجديدة ---------- */
function parseGameFromVersion(rawText, folderName, filesInFolder = []) {
  const get = (re, d = '') => (rawText.match(re)?.[1] || d).trim();
  const getList = re => (rawText.match(re)?.[1] || '').split(',').map(s => s.trim()).filter(Boolean);

  const title = get(/Game-Name\s*:\s*"([^"]+)"/, folderName);
  const company = get(/Company\s*:\s*"([^"]+)"/, 'Rockstar Games');
  const version = get(/Version\s*:\s*"([^"]+)"/, '1.0').replace(/^[Vv]/, '');
  const date = get(/Release\s*:\s*"([^"]+)"/, new Date().toISOString().slice(0, 10)).replace(/\//g, '-');
  const progress = parseInt(get(/Prossing\s*:\s*"([^"]+)"/, '100'), 10) || 100;
  const tags = getList(/Tags\s*:\s*\{([^}]+)\}/);
  const aboutText = get(/About-Translation\s*:\s*"([^"]+)"/, '');
  const desc = aboutText.length > 130 ? aboutText.slice(0, 127) + '...' : aboutText;
  const features = getList(/Incloud\s*:\s*\{([^}]+)\}/);

  const compLow = company.toLowerCase();
  const pub = PUBLISHERS.find(p => p.id === compLow || p.name === company || p.en.toLowerCase() === compLow || compLow.includes(p.id))?.id || 'indie';

  const parseReq = raw => {
    if (!raw) return { os: '—', cpu: '—', ram: '—', gpu: '—', dx: '—', storage: '—' };
    const field = key => raw.match(new RegExp(`${key}\\s*:\\s*"([^"]+)"`))?.[1] || '—';
    return { os: field('OS'), cpu: field('CPU'), ram: field('RAM'), gpu: field('GPU'), dx: field('DX'), storage: field('Storage') };
  };
  const minRaw = rawText.match(/Requirements-Min\s*:\s*\{([^}]+)\}/)?.[1];
  const recRaw = rawText.match(/Requirements-Rec\s*:\s*\{([^}]+)\}/)?.[1];

  let genre = 'عالم مفتوح';
  for (const g of ['رعب', 'سباق', 'أكشن', 'مغامرات', 'تقمص أدوار', 'استراتيجية', 'بقاء', 'ألغاز', 'رياضة']) {
    if (tags.includes(g)) { genre = g; break; }
  }

  const id = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // البحث عن ملف الغلاف وملف التحميل
  const coverObj = filesInFolder.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name));
  const coverUrl = coverObj ? `games/${folderName}/${coverObj.name}` : `games/${folderName}/${folderName}.jpg`;

  const zipObj = filesInFolder.find(f => /\.(zip|rar|7z)$/i.test(f.name));
  const zipUrl = zipObj ? `games/${folderName}/${zipObj.name}` : `games/${folderName}/${folderName}.zip`;
  let zipSize = '';
  if (zipObj && zipObj.size) {
    zipSize = zipObj.size >= 1048576 ? (zipObj.size / 1048576).toFixed(1) + ' MB' : Math.round(zipObj.size / 1024) + ' KB';
  }

  return {
    id,
    title,
    publisher: pub,
    genre,
    version,
    date,
    downloads: 0,
    likes: 0,
    progress,
    cover: coverUrl,
    desc,
    about: [aboutText],
    features,
    video: '',
    images: [],
    files: [
      {
        name: 'ملف الترجمة العربية',
        version,
        size: zipSize,
        url: zipUrl,
        note: 'متوافق مع نسخة الكمبيوتر (PC).',
        main: true
      }
    ],
    req: { min: parseReq(minRaw), rec: parseReq(recRaw) },
    changelog: [{ version, date, notes: [`الإصدار الأولي للترجمة بنسبة اكتمال ${progress}%`] }],
    tags
  };
}

async function syncGamesFromGitHub(onNewGamesFound) {
  let owner = '', repo = '';
  if (SITE.githubRepo && SITE.githubRepo.includes('/')) {
    [owner, repo] = SITE.githubRepo.trim().split('/');
  } else if (location.hostname.endsWith('.github.io')) {
    owner = location.hostname.split('.')[0];
    const segs = location.pathname.split('/').filter(Boolean);
    if (segs.length) repo = segs[0];
  }
  if (!owner || !repo) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/games`);
    if (!res.ok) return;
    const contents = await res.json();
    if (!Array.isArray(contents)) return;

    const dirs = contents.filter(item => item.type === 'dir');
    let hasNew = false;

    for (const dir of dirs) {
      const folderId = dir.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (GAMES.some(g => g.id === folderId)) continue;

      try {
        const [vRes, fRes] = await Promise.all([
          fetch(`games/${dir.name}/Version.txt`),
          fetch(`https://api.github.com/repos/${owner}/${repo}/contents/games/${dir.name}`)
        ]);
        if (!vRes.ok) continue;
        const vText = await vRes.text();
        const fList = fRes.ok ? await fRes.json() : [];
        const newGame = parseGameFromVersion(vText, dir.name, Array.isArray(fList) ? fList : []);
        if (newGame) {
          GAMES.push(newGame);
          hasNew = true;
        }
      } catch (err) {}
    }

    if (hasNew && typeof onNewGamesFound === 'function') {
      onNewGamesFound();
    }
  } catch (e) {}
}

/* ---------- تشغيل ---------- */
renderChrome();
paintIcons();
const initPage = () => ({ index: initHome, browse: initBrowse, game: initGame, about: initAbout })[PAGE]?.();
initPage();
initLogoImage();
syncGamesFromGitHub(initPage);
