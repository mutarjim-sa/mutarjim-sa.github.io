# =========================================================
# update-games.ps1 — تحديث الألعاب في الموقع تلقائياً من مجلد games
# =========================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $rootDir) { $rootDir = Get-Location }

$gamesDir = Join-Path $rootDir "games"
$dataFile = Join-Path $rootDir "data.js"

if (-not (Test-Path $gamesDir)) {
    Write-Host "مجلد games غير موجود!" -ForegroundColor Red
    exit 1
}

# قائمة الشركات المعرّفة
$publishersMap = @{
    "rockstar"      = "rockstar"
    "rockstar games"= "rockstar"
    "روكستار"       = "rockstar"
    "sony"          = "sony"
    "playstation"   = "sony"
    "سوني"          = "sony"
    "xbox"          = "xbox"
    "إكس بوكس"      = "xbox"
    "ea"            = "ea"
    "electronic arts"= "ea"
    "إلكترونك آرتس" = "ea"
    "ubisoft"       = "ubisoft"
    "يوبيسوفت"      = "ubisoft"
    "activision"    = "activision"
    "أكتيفجن"       = "activision"
    "blizzard"      = "blizzard"
    "بليزارد"       = "blizzard"
    "bethesda"      = "bethesda"
    "بيثيسدا"       = "bethesda"
    "cdpr"          = "cdpr"
    "cd projekt red"= "cdpr"
    "capcom"        = "capcom"
    "كابكوم"        = "capcom"
    "square enix"   = "squareenix"
    "squareenix"    = "squareenix"
    "bandai"        = "bandai"
    "fromsoftware"  = "fromsoft"
    "fromsoft"      = "fromsoft"
    "nintendo"      = "nintendo"
    "نينتندو"       = "nintendo"
    "valve"         = "valve"
    "فالف"          = "valve"
    "epic"          = "epic"
    "epic games"    = "epic"
    "konami"        = "konami"
    "كونامي"        = "konami"
    "sega"          = "sega"
    "سيقا"          = "sega"
    "2k"            = "2k"
    "wb"            = "wb"
    "warner bros"   = "wb"
    "riot"          = "riot"
    "indie"         = "indie"
}

# دالة استخراج المتطلبات
function Parse-Requirements($text) {
    $req = @{
        os = "—"; cpu = "—"; ram = "—"; gpu = "—"; dx = "—"; storage = "—"
    }
    if (-not $text) { return $req }

    if ($text -match 'OS\s*:\s*"([^"]+)"') { $req.os = $matches[1] }
    if ($text -match 'CPU\s*:\s*"([^"]+)"') { $req.cpu = $matches[1] }
    if ($text -match 'RAM\s*:\s*"([^"]+)"') { $req.ram = $matches[1] }
    if ($text -match 'GPU\s*:\s*"([^"]+)"') { $req.gpu = $matches[1] }
    if ($text -match 'DX\s*:\s*"([^"]+)"') { $req.dx = $matches[1] }
    if ($text -match 'Storage\s*:\s*"([^"]+)"') { $req.storage = $matches[1] }

    return $req
}

# قراءة الألعاب الحالية لحفظ عدد التحميلات والإعجابات إن وُجدت
$existingStats = @{}
if (Test-Path $dataFile) {
    $currentContent = [System.IO.File]::ReadAllText($dataFile, [System.Text.Encoding]::UTF8)
    $pattern = "id\s*:\s*'([^']+)'[\s\S]*?downloads\s*:\s*(\d+)[\s\S]*?likes\s*:\s*(\d+)"
    $matchesObj = [regex]::Matches($currentContent, $pattern)
    foreach ($m in $matchesObj) {
        $existingStats[$m.Groups[1].Value] = @{
            downloads = [int]$m.Groups[2].Value
            likes = [int]$m.Groups[3].Value
        }
    }
}

$gamesList = [System.Collections.Generic.List[string]]::new()
$gameFolders = Get-ChildItem -Path $gamesDir -Directory | Sort-Object Name

foreach ($folder in $gameFolders) {
    $vFile = Join-Path $folder.FullName "Version.txt"
    if (-not (Test-Path $vFile)) {
        continue
    }

    $rawText = [System.IO.File]::ReadAllText($vFile, [System.Text.Encoding]::UTF8)

    # 1. اسم اللعبة
    $title = $folder.Name
    if ($rawText -match 'Game-Name\s*:\s*"([^"]+)"') {
        $title = $matches[1].Trim()
    }

    # 2. المعرف
    $id = ($folder.Name.ToLower() -replace '[^a-z0-9]+', '-').Trim('-')

    # 3. الشركة
    $pubId = "indie"
    if ($rawText -match 'Company\s*:\s*"([^"]+)"') {
        $rawComp = $matches[1].Trim().ToLower()
        if ($publishersMap.ContainsKey($rawComp)) {
            $pubId = $publishersMap[$rawComp]
        } else {
            foreach ($key in $publishersMap.Keys) {
                if ($rawComp -like "*$key*") {
                    $pubId = $publishersMap[$key]
                    break
                }
            }
        }
    }

    # 4. الإصدار
    $version = "1.0"
    if ($rawText -match 'Version\s*:\s*"([^"]+)"') {
        $version = ($matches[1].Trim() -replace '^[Vv]', '')
    }

    # 5. تاريخ الإصدار
    $release = (Get-Date).ToString("yyyy-MM-dd")
    if ($rawText -match 'Release\s*:\s*"([^"]+)"') {
        $release = $matches[1].Trim().Replace('/', '-')
    }

    # 6. نسبة الإنجاز
    $progress = 100
    if ($rawText -match 'Prossing\s*:\s*"([^"]+)"') {
        $progress = [int]($matches[1].Trim())
    }

    # 7. الوسوم
    $tags = @()
    if ($rawText -match 'Tags\s*:\s*\{([^}]+)\}') {
        $tags = $matches[1].Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    }

    # 8. التصنيف (Genre)
    $genre = "عالم مفتوح"
    if ($tags -contains "رعب") { $genre = "رعب" }
    elseif ($tags -contains "سباق") { $genre = "سباق" }
    elseif ($tags -contains "أكشن") { $genre = "أكشن" }
    elseif ($tags -contains "مغامرات") { $genre = "مغامرات" }
    elseif ($tags -contains "تقمص أدوار") { $genre = "تقمص أدوار" }
    elseif ($tags -contains "استراتيجية") { $genre = "استراتيجية" }
    elseif ($tags -contains "بقاء") { $genre = "بقاء" }
    elseif ($tags -contains "ألغاز") { $genre = "ألغاز" }
    elseif ($tags -contains "رياضة") { $genre = "رياضة" }

    # 9. الوصف
    $aboutText = ""
    if ($rawText -match 'About-Translation\s*:\s*"([^"]+)"') {
        $aboutText = $matches[1].Trim()
    }
    $desc = if ($aboutText.Length -gt 130) { $aboutText.Substring(0, 127) + "..." } else { $aboutText }

    # 10. المميزات (Incloud)
    $features = @()
    if ($rawText -match 'Incloud\s*:\s*\{([^}]+)\}') {
        $features = $matches[1].Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    }

    # 11. المتطلبات
    $reqMin = @{ os = "—"; cpu = "—"; ram = "—"; gpu = "—"; dx = "—"; storage = "—" }
    $reqRec = @{ os = "—"; cpu = "—"; ram = "—"; gpu = "—"; dx = "—"; storage = "—" }
    if ($rawText -match 'Requirements-Min\s*:\s*\{([^}]+)\}') {
        $reqMin = Parse-Requirements $matches[1]
    }
    if ($rawText -match 'Requirements-Rec\s*:\s*\{([^}]+)\}') {
        $reqRec = Parse-Requirements $matches[1]
    }

    # 12. ملف الغلاف
    $coverFile = Get-ChildItem -Path $folder.FullName -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp)$' } | Select-Object -First 1
    $coverRel = ""
    if ($coverFile) {
        $coverRel = "games/$($folder.Name)/$($coverFile.Name)"
    }

    # 13. ملف التحميل
    $zipFile = Get-ChildItem -Path $folder.FullName -File | Where-Object { $_.Extension -match '\.(zip|rar|7z)$' } | Select-Object -First 1
    $fileUrl = ""
    $fileSize = ""
    if ($zipFile) {
        $fileUrl = "games/$($folder.Name)/$($zipFile.Name)"
        $bytes = $zipFile.Length
        if ($bytes -ge 1048576) {
            $fileSize = "$([math]::Round($bytes / 1048576, 1)) MB"
        } else {
            $fileSize = "$([math]::Round($bytes / 1024)) KB"
        }
    }

    # التحميلات والإعجابات
    $dlCount = 0
    $likeCount = 0
    if ($existingStats.ContainsKey($id)) {
        $dlCount = $existingStats[$id].downloads
        $likeCount = $existingStats[$id].likes
    }

    # بناء كود اللعبة
    $cleanTitle = $title.Replace("'", "\'")
    $cleanDesc = $desc.Replace("'", "\'")
    $cleanAbout = $aboutText.Replace("'", "\'")
    $tagsJs = ($tags | ForEach-Object { "'$($_ -replace "'", "\'")'" }) -join ", "
    $featuresJs = ($features | ForEach-Object { "      '$($_ -replace "'", "\'")'" }) -join ",`n"

    $gameJs = @"
  {
    id: '$id',
    title: '$cleanTitle',
    publisher: '$pubId',
    genre: '$genre',
    version: '$version',
    date: '$release',
    downloads: $dlCount,
    likes: $likeCount,
    progress: $progress,
    cover: '$coverRel',
    desc: '$cleanDesc',
    about: [
      '$cleanAbout'
    ],
    features: [
$featuresJs
    ],
    video: '',
    images: [],
    files: [
      {
        name: 'ملف الترجمة العربية',
        version: '$version',
        size: '$fileSize',
        url: '$fileUrl',
        note: 'متوافق مع نسخة الكمبيوتر (PC). فك الضغط وانقل الملفات إلى مجلد اللعبة.',
        main: true
      }
    ],
    req: {
      min: { os: '$($reqMin.os)', cpu: '$($reqMin.cpu)', ram: '$($reqMin.ram)', gpu: '$($reqMin.gpu)', dx: '$($reqMin.dx)', storage: '$($reqMin.storage)' },
      rec: { os: '$($reqRec.os)', cpu: '$($reqRec.cpu)', ram: '$($reqRec.ram)', gpu: '$($reqRec.gpu)', dx: '$($reqRec.dx)', storage: '$($reqRec.storage)' }
    },
    changelog: [
      {
        version: '$version',
        date: '$release',
        notes: ['الإصدار الأولي للترجمة بنسبة اكتمال $progress%']
      }
    ],
    tags: [$tagsJs]
  }
"@

    $gamesList.Add($gameJs.TrimEnd())
}

# قراءة الجزء العلوي من data.js (SITE و PUBLISHERS)
$headerPart = @"
/* =========================================================
   data.js — هنا كل بيانات الموقع
   - يتم تحديثه تلقائياً بواسطة سكربت update-games.ps1
   ========================================================= */

const SITE = {
  name: 'مترجم',
  email: 'your@email.com',
  perPage: 12,
  logo: '',
  githubRepo: '' // مسار مستودعك في قيت هب مثل: 'username/mutarjim-sa' (اختياري، يكتشفه الموقع تلقائياً إذا رُفع على github.io)
};

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
"@

$footerPart = @"

];
"@

$allGamesJs = $gamesList -join ",`n"
$finalJs = $headerPart + "`n" + $allGamesJs + $footerPart

[System.IO.File]::WriteAllText($dataFile, $finalJs, [System.Text.Encoding]::UTF8)

Write-Host "تم تحديث data.js بنجاح! عدد الألعاب المكتشفة: $($gamesList.Count)" -ForegroundColor Green
