/* =========================================================
   data.js — هنا كل بيانات الموقع
   - SITE: إعدادات عامة (اسم الموقع، الإيميل)
   - PUBLISHERS: شركات الإنتاج (تظهر في الشريط الجانبي تلقائياً)
   - GAMES: الألعاب المترجمة (كل لعبة تنعرض تلقائياً في الرئيسية وتنفتح لها صفحة)

   لإضافة ترجمة: افتح add.html في المتصفح، عبّي النموذج، وانسخ الكود الناتج هنا داخل GAMES.
   ========================================================= */

const SITE = {
  name: 'مترجم',
  email: 'your@email.com',   // ← بدّله بإيميلك (تنرسل له الطلبات والرسائل)
  perPage: 12,                // عدد الألعاب في كل صفحة من المكتبة
  logo: 'logo.png'            // ملف الشعار (أبيض على أسود أو بخلفية شفافة). لو الملف مو موجود، ينعرض الشعار المرسوم
};

/* id: بالإنجليزي بدون مسافات — color: لون شارة الشركة */
const PUBLISHERS = [
  { id: 'sony',       name: 'سوني بلايستيشن',     en: 'PlayStation Studios', color: '#2e6bd6' },
  { id: 'xbox',       name: 'إكس بوكس',           en: 'Xbox Game Studios',   color: '#17a34a' },
  { id: 'rockstar',   name: 'روكستار',            en: 'Rockstar Games',      color: '#f2a516' },
  { id: 'ea',         name: 'إلكترونك آرتس',      en: 'Electronic Arts',     color: '#e5484d' },
  { id: 'ubisoft',    name: 'يوبيسوفت',           en: 'Ubisoft',             color: '#3b82f6' },
  { id: 'activision', name: 'أكتيفجن',            en: 'Activision',          color: '#a3a3a3' },
  { id: 'blizzard',   name: 'بليزارد',            en: 'Blizzard',            color: '#22a7f0' },
  { id: 'bethesda',   name: 'بيثيسدا',            en: 'Bethesda',            color: '#c9a227' },
  { id: 'cdpr',       name: 'سي دي بروجكت رد',    en: 'CD PROJEKT RED',      color: '#e11d48' },
  { id: 'capcom',     name: 'كابكوم',             en: 'Capcom',              color: '#2563eb' },
  { id: 'squareenix', name: 'سكوير إنكس',         en: 'Square Enix',         color: '#9ca3af' },
  { id: 'bandai',     name: 'باندا نامكو',        en: 'Bandai Namco',        color: '#f97316' },
  { id: 'fromsoft',   name: 'فروم سوفتوير',       en: 'FromSoftware',        color: '#78716c' },
  { id: 'nintendo',   name: 'نينتندو',            en: 'Nintendo',            color: '#ef4444' },
  { id: 'valve',      name: 'فالف',               en: 'Valve',               color: '#f97316' },
  { id: 'epic',       name: 'إيبك قيمز',          en: 'Epic Games',          color: '#d4d4d4' },
  { id: 'konami',     name: 'كونامي',             en: 'Konami',              color: '#dc2626' },
  { id: 'sega',       name: 'سيقا',               en: 'SEGA',                color: '#1d4ed8' },
  { id: '2k',         name: 'تو كي',              en: '2K Games',            color: '#ea580c' },
  { id: 'wb',         name: 'وارنر براذرز',       en: 'WB Games',            color: '#1e40af' },
  { id: 'riot',       name: 'رايوت قيمز',         en: 'Riot Games',          color: '#dc2626' },
  { id: 'indie',      name: 'مطورين مستقلين',     en: 'Indie',               color: '#8b5cf6' }
];

/* =========================================================
   الألعاب المترجمة (أمثلة — بدّلها بترجماتك)
   الحقول:
     id        معرّف بالإنجليزي (يصير رابط الصفحة: game.html?id=...)
     title     اسم اللعبة
     publisher id الشركة من القائمة فوق
     genre     النوع
     version   إصدار الترجمة
     date     تاريخ آخر تحديث للترجمة (YYYY-MM-DD)
     downloads, likes
     progress  نسبة اكتمال الترجمة (0 - 100)
     emoji, c1, c2   (من التصميم القديم، ما عاد تُستخدم — تقدر تتركها أو تحذفها)
     cover     رابط صورة الغلاف (اختياري، طولية 3:4) مثل 'images/game.jpg'
               بدونها ينرسم غلاف تلقائي باسم اللعبة
     desc      وصف قصير للبطاقة
     about     فقرات الوصف الكامل
     features  وش تشمل الترجمة
     video     رابط يوتيوب (اختياري)
     images    روابط صور الترجمة داخل اللعبة (اختياري)
     files     ملفات التحميل: { name, version, size, url, note, main }
     req       متطلبات تشغيل اللعبة: { min: {...}, rec: {...} }
     changelog سجل التحديثات: { version, date, notes: [] }
     tags      وسوم
   ========================================================= */
const GAMES = [
  {
    id: 'desert-shadows',
    title: 'ظلال الصحراء',
    publisher: 'sony',
    genre: 'أكشن',
    version: '1.4', date: '2026-11-02', downloads: 9820, likes: 840, progress: 100,
    emoji: '⚔️', c1: '#e0782f', c2: '#2a0e05',
    desc: 'ترجمة عربية كاملة للقوائم والحوارات والترجمة النصية.',
    about: [
      'ترجمة عربية كاملة للعبة، تشمل القوائم والحوارات والمهام والترجمة النصية للمشاهد السينمائية.',
      'الترجمة متوافقة مع آخر إصدار من اللعبة، وتمت مراجعتها لغوياً عشان تكون طبيعية وواضحة.'
    ],
    features: ['ترجمة القوائم والواجهة', 'ترجمة كل الحوارات', 'ترجمة نصية للمشاهد', 'خط عربي واضح ومتصل'],
    video: '',
    images: [],
    files: [
      { name: 'ملف الترجمة العربية', version: '1.4', size: '123 MB', url: '', note: 'متوافق مع إصدار اللعبة 1.4.2.', main: true },
      { name: 'خط عربي بديل', version: '1.0', size: '8 MB', url: '', note: 'لو الخط الأساسي ما عجبك.' }
    ],
    req: {
      min: { os: 'Windows 10 64-bit', cpu: 'Intel i5-6600', ram: '8 GB', gpu: 'GTX 1050 Ti', dx: '11', storage: '12 GB' },
      rec: { os: 'Windows 11 64-bit', cpu: 'Intel i7-9700', ram: '16 GB', gpu: 'RTX 2060', dx: '12', storage: '12 GB SSD' }
    },
    changelog: [
      { version: '1.4', date: '2026-11-02', notes: ['دعم إصدار اللعبة 1.4.2', 'تصحيح أخطاء إملائية'] },
      { version: '1.0', date: '2026-07-01', notes: ['الإصدار الأول للترجمة'] }
    ],
    tags: ['ترجمة كاملة', 'قصة', 'لاعب واحد']
  },
  {
    id: 'neon-race',
    title: 'سباق النيون',
    publisher: 'ea',
    genre: 'سباق',
    version: '2.0', date: '2026-11-12', downloads: 7410, likes: 610, progress: 100,
    emoji: '🏎️', c1: '#1fb6d1', c2: '#140f3d',
    desc: 'تعريب القوائم وقصة الطور الفردي.',
    about: ['تعريب كامل للقوائم وإعدادات السيارات وقصة الطور الفردي.'],
    features: ['ترجمة القوائم', 'ترجمة القصة', 'ترجمة أسماء القطع'],
    files: [{ name: 'ملف الترجمة العربية', version: '2.0', size: '31 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'سيارات']
  },
  {
    id: 'stone-kingdom',
    title: 'مملكة الحجر',
    publisher: 'ubisoft',
    genre: 'استراتيجية',
    version: '0.8', date: '2026-10-20', downloads: 5130, likes: 520, progress: 75,
    emoji: '🏰', c1: '#7fae3a', c2: '#0b2214',
    desc: 'ترجمة جزئية: القوائم والشرح التعليمي، والحملة قيد الترجمة.',
    about: ['الترجمة حالياً تشمل القوائم والشرح التعليمي وأول حملتين. باقي الحملات قيد الترجمة.'],
    features: ['ترجمة القوائم', 'ترجمة الشرح التعليمي', 'حملتين من أصل أربع'],
    files: [{ name: 'ملف الترجمة (تجريبي)', version: '0.8', size: '20 MB', url: '', main: true }],
    tags: ['قيد الترجمة', 'استراتيجية']
  },
  {
    id: 'basement-horror',
    title: 'رعب القبو',
    publisher: 'capcom',
    genre: 'رعب',
    version: '1.1', date: '2026-10-31', downloads: 4380, likes: 390, progress: 100,
    emoji: '👻', c1: '#6b5a7a', c2: '#060509',
    desc: 'ترجمة كاملة للملاحظات والألغاز والحوارات.',
    about: ['ترجمة كاملة لكل الملاحظات والوثائق داخل اللعبة، مع ترجمة الألغاز بطريقة تحافظ على فكرتها.'],
    features: ['ترجمة الوثائق والملاحظات', 'ترجمة الألغاز', 'ترجمة نصية للحوارات'],
    files: [{ name: 'ملف الترجمة العربية', version: '1.1', size: '12 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'رعب']
  },
  {
    id: 'future-football',
    title: 'كرة المستقبل',
    publisher: 'konami',
    genre: 'رياضة',
    version: '26.1', date: '2026-09-15', downloads: 6650, likes: 430, progress: 100,
    emoji: '⚽', c1: '#2fa866', c2: '#0a1840',
    desc: 'تعريب القوائم وأسماء الفرق والبطولات.',
    about: ['تعريب كامل للقوائم وأسماء الفرق والدوريات والبطولات، مع خط عربي مخصص.'],
    features: ['ترجمة القوائم', 'أسماء الفرق بالعربي', 'خط مخصص'],
    files: [{ name: 'ملف الترجمة العربية', version: '26.1', size: '64 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'رياضة']
  },
  {
    id: 'survival-island',
    title: 'جزيرة البقاء',
    publisher: 'indie',
    genre: 'بقاء',
    version: '0.9', date: '2026-11-08', downloads: 11240, likes: 1120, progress: 90,
    emoji: '🏝️', c1: '#d4a24c', c2: '#0b2e35',
    desc: 'ترجمة القوائم ووصف الأدوات ونظام الصناعة.',
    about: ['ترجمة لواجهة اللعبة ووصف كل الأدوات والوصفات في نظام الصناعة. باقي بعض النصوص الجانبية.'],
    features: ['ترجمة الواجهة', 'ترجمة الصناعة', 'ترجمة المهام'],
    files: [{ name: 'ملف الترجمة العربية', version: '0.9', size: '9 MB', url: '', main: true }],
    tags: ['قيد الترجمة', 'بقاء']
  },
  {
    id: 'dark-knight',
    title: 'فارس الظلام',
    publisher: 'fromsoft',
    genre: 'تقمص أدوار',
    version: '1.0', date: '2026-08-28', downloads: 2970, likes: 260, progress: 100,
    emoji: '🗡️', c1: '#b23a48', c2: '#14060a',
    desc: 'ترجمة كاملة لوصف الأدوات والقصة المخفية.',
    about: ['ترجمة كاملة لكل وصف الأدوات والأسلحة والحوارات، وهي المصدر الأساسي لقصة اللعبة.'],
    features: ['ترجمة وصف الأدوات', 'ترجمة الحوارات', 'مصطلحات موحدة'],
    files: [{ name: 'ملف الترجمة العربية', version: '1.0', size: '41 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'تقمص أدوار']
  },
  {
    id: 'light-maze',
    title: 'متاهة الضوء',
    publisher: 'indie',
    genre: 'ألغاز',
    version: '1.0', date: '2026-11-14', downloads: 1890, likes: 210, progress: 100,
    emoji: '🧩', c1: '#8b7cf6', c2: '#120d2e',
    desc: 'ترجمة القوائم وتلميحات الألغاز.',
    about: ['ترجمة خفيفة للقوائم والتلميحات داخل المراحل.'],
    features: ['ترجمة القوائم', 'ترجمة التلميحات'],
    files: [{ name: 'ملف الترجمة العربية', version: '1.0', size: '2 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'ألغاز']
  },
  {
    id: 'city-streets',
    title: 'شوارع المدينة',
    publisher: 'rockstar',
    genre: 'عالم مفتوح',
    version: '0.6', date: '2026-07-19', downloads: 15430, likes: 1580, progress: 60,
    emoji: '🌆', c1: '#f2a516', c2: '#2b1a05',
    desc: 'مشروع ترجمة كبير: القصة الرئيسية قيد الترجمة.',
    about: ['أكبر مشاريعنا: ترجمة القصة الرئيسية والمهام الجانبية. الإصدار الحالي يغطي أول 60% من القصة.'],
    features: ['ترجمة القوائم', 'ترجمة 60% من القصة', 'ترجمة الرسائل داخل اللعبة'],
    files: [{ name: 'ملف الترجمة (تجريبي)', version: '0.6', size: '256 MB', url: '', main: true }],
    req: {
      min: { os: 'Windows 10', cpu: 'Intel i5-8400', ram: '12 GB', gpu: 'GTX 1060 6GB', dx: '12', storage: '72 GB' },
      rec: { os: 'Windows 11', cpu: 'Intel i7-10700', ram: '16 GB', gpu: 'RTX 3060', dx: '12', storage: '72 GB SSD' }
    },
    tags: ['قيد الترجمة', 'عالم مفتوح']
  },
  {
    id: 'star-frontier',
    title: 'حدود النجوم',
    publisher: 'bethesda',
    genre: 'تقمص أدوار',
    version: '0.4', date: '2026-06-30', downloads: 6120, likes: 590, progress: 40,
    emoji: '🚀', c1: '#5b8def', c2: '#050b1f',
    desc: 'ترجمة القوائم والقصة الرئيسية — قيد العمل.',
    about: ['اللعبة فيها نصوص ضخمة، وحالياً مترجم القوائم وجزء من القصة الرئيسية.'],
    features: ['ترجمة القوائم', 'ترجمة جزء من القصة'],
    files: [{ name: 'ملف الترجمة (تجريبي)', version: '0.4', size: '184 MB', url: '', main: true }],
    tags: ['قيد الترجمة', 'فضاء']
  },
  {
    id: 'cyber-hunter',
    title: 'صياد السايبر',
    publisher: 'cdpr',
    genre: 'تقمص أدوار',
    version: '1.2', date: '2026-10-05', downloads: 8870, likes: 970, progress: 100,
    emoji: '🤖', c1: '#e11d48', c2: '#1a0510',
    desc: 'ترجمة كاملة لكل النصوص مع خط عربي مخصص.',
    about: ['ترجمة كاملة للقصة والمهام والرسائل والوصف، مع خط عربي مصمم يناسب طابع اللعبة.'],
    features: ['ترجمة كاملة', 'خط مخصص', 'مراجعة لغوية'],
    files: [{ name: 'ملف الترجمة العربية', version: '1.2', size: '307 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'مستقبلي']
  },
  {
    id: 'speed-legends',
    title: 'أساطير السرعة',
    publisher: 'xbox',
    genre: 'سباق',
    version: '1.0', date: '2026-09-02', downloads: 7030, likes: 680, progress: 100,
    emoji: '🏁', c1: '#17a34a', c2: '#04160a',
    desc: 'تعريب القوائم والفعاليات.',
    about: ['تعريب كامل للقوائم ووصف الفعاليات والمواسم.'],
    features: ['ترجمة القوائم', 'ترجمة الفعاليات'],
    files: [{ name: 'ملف الترجمة العربية', version: '1.0', size: '18 MB', url: '', main: true }],
    tags: ['ترجمة كاملة', 'سيارات']
  }
];
