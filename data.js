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
  logo: ''                    // ملف الشعار (أبيض على أسود أو بخلفية شفافة). إذا فارغ، يُعرض الشعار المرسوم تلقائياً
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
   الألعاب المترجمة
   ========================================================= */
const GAMES = [
  {
    id: 'grand-theft-auto-san-andreas',
    title: 'Grand Theft Auto: San Andreas',
    publisher: 'rockstar',
    genre: 'عالم مفتوح',
    version: '1.0',
    date: '2026-11-16',
    downloads: 0,
    likes: 0,
    progress: 85,
    cover: 'games/Grand_Theft_Auto_San_Andreas/GTA_San_Andre.jpg',
    desc: 'ترجمة كاملة لواجهة اللعبة والقوائم، وكل المهمات والحوارات، وأسماء المناطق والسيارات والأسلحة والمحلات والمهارات.',
    about: [
      'ترجمة كاملة لواجهة اللعبة والقوائم، وكل المهمات والحوارات، وأسماء المناطق والسيارات والأسلحة والمحلات والمهارات.'
    ],
    features: [
      'القوائم والإعدادات',
      'الشاشة أثناء اللعب',
      'تطور الشخصية',
      'المحلات',
      'القصة',
      'المهمات الجانبية والألعاب'
    ],
    video: '',
    images: [],
    files: [
      {
        name: 'ملف الترجمة العربية',
        version: '1.0',
        size: '352 KB',
        url: 'games/Grand_Theft_Auto_San_Andreas/Grand_Theft_Auto_San_Andreas.zip',
        note: 'متوافق مع نسخة الكمبيوتر (PC). فك الضغط وانقل الملفات إلى مجلد اللعبة.',
        main: true
      }
    ],
    req: {
      min: { os: 'Windows 7 / 8 / 10 / 11', cpu: 'Intel Pentium III 1GHz', ram: '256 MB', gpu: '64MB Video Card (GeForce 3)', dx: '9.0', storage: '4.7 GB' },
      rec: { os: 'Windows 10 / 11 64-bit', cpu: 'Intel Pentium 4 / AMD Athlon XP', ram: '384 MB', gpu: '128MB Video Card (GeForce 6)', dx: '9.0', storage: '4.7 GB' }
    },
    changelog: [
      {
        version: '1.0',
        date: '2026-11-16',
        notes: ['الإصدار الأولي للترجمة بنسبة اكتمال 85%']
      }
    ],
    tags: ['قيد الترجمة', 'روكستار', 'سلسلة قراند', 'عالم مفتوح']
  }
];
