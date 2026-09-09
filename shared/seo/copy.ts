import type { SupportedLocale } from '../locales'

// Localize the product title and purpose; retain standard 2FA / TOTP terminology.
export const toolHeadings: Record<SupportedLocale, string> = {
  en: '2FA.HOT | Online two-factor code generation | Secure OTP codes | Elegant authenticator inspired by Minecraft design',
  'zh-CN':
    '2FA.HOT｜在线双重验证码生成｜安全获取OTP代码｜优雅设计身份验证器,参考 Minecraft 风格设计',
  'zh-TW':
    '2FA.HOT｜線上雙重驗證碼產生｜安全取得 OTP 代碼｜優雅設計身份驗證器，參考 Minecraft 風格設計',
  es: '2FA.HOT | Generador de códigos 2FA en línea | Códigos OTP seguros | Autenticador de diseño elegante inspirado en Minecraft',
  fr: '2FA.HOT | Générateur de codes 2FA en ligne | Codes OTP sécurisés | Authentificateur au design élégant inspiré de Minecraft',
  de: '2FA.HOT | Online-Generator für 2FA-Codes | Sichere OTP-Codes | Eleganter Authenticator im Minecraft-inspirierten Design',
  'pt-BR':
    '2FA.HOT | Gerador de códigos 2FA online | Códigos OTP seguros | Autenticador elegante inspirado em Minecraft',
  ru: '2FA.HOT | Онлайн-генератор кодов 2FA | Безопасные OTP-коды | Элегантный аутентификатор в стиле Minecraft',
  ja: '2FA.HOT｜オンライン2FAコード生成｜安全なOTPコード｜Minecraft風の優雅な認証ツール',
  ko: '2FA.HOT | 온라인 2FA 코드 생성 | 안전한 OTP 코드 | Minecraft 스타일의 우아한 인증 도구',
  ar: '2FA.HOT | مولّد رموز 2FA عبر الإنترنت | رموز OTP آمنة | أداة مصادقة أنيقة مستوحاة من Minecraft',
  hi: '2FA.HOT | ऑनलाइन 2FA कोड जनरेटर | सुरक्षित OTP कोड | Minecraft से प्रेरित सुंदर प्रमाणक',
  bn: '2FA.HOT | অনলাইন 2FA কোড জেনারেটর | নিরাপদ OTP কোড | Minecraft-অনুপ্রাণিত সুন্দর প্রমাণীকরণ টুল',
  ur: '2FA.HOT | آن لائن 2FA کوڈ جنریٹر | محفوظ OTP کوڈ | Minecraft سے متاثرہ خوبصورت تصدیقی ٹول',
  id: '2FA.HOT | Generator kode 2FA online | Kode OTP yang aman | Autentikator elegan terinspirasi Minecraft',
  ms: '2FA.HOT | Penjana kod 2FA dalam talian | Kod OTP yang selamat | Pengesah elegan berinspirasikan Minecraft',
  vi: '2FA.HOT | Trình tạo mã 2FA trực tuyến | Mã OTP an toàn | Trình xác thực thanh lịch lấy cảm hứng từ Minecraft',
  th: '2FA.HOT | เครื่องมือสร้างรหัส 2FA ออนไลน์ | รหัส OTP ที่ปลอดภัย | เครื่องมือยืนยันตัวตนดีไซน์หรูสไตล์ Minecraft',
  tr: '2FA.HOT | Çevrimiçi 2FA kod üretici | Güvenli OTP kodları | Minecraft esintili zarif doğrulayıcı',
  it: '2FA.HOT | Generatore di codici 2FA online | Codici OTP sicuri | Autenticatore elegante ispirato a Minecraft',
  nl: '2FA.HOT | Online generator voor 2FA-codes | Veilige OTP-codes | Elegante authenticator in Minecraft-stijl',
  pl: '2FA.HOT | Internetowy generator kodów 2FA | Bezpieczne kody OTP | Elegancki uwierzytelniacz inspirowany Minecraftem',
  uk: '2FA.HOT | Онлайн-генератор кодів 2FA | Безпечні OTP-коди | Елегантний автентифікатор у стилі Minecraft',
  fa: '2FA.HOT | تولیدکننده آنلاین کد 2FA | کدهای امن OTP | ابزار احراز هویت زیبا با الهام از Minecraft',
  he: '2FA.HOT | מחולל קודי 2FA מקוון | קודי OTP מאובטחים | כלי אימות אלגנטי בהשראת Minecraft',
  sw: '2FA.HOT | Kizalishaji cha misimbo ya 2FA mtandaoni | Misimbo salama ya OTP | Kithibitishaji maridadi chenye msukumo wa Minecraft',
  fil: '2FA.HOT | Online na 2FA code generator | Ligtas na OTP code | Elegant na authenticator na inspirasyon ng Minecraft',
  ta: '2FA.HOT | ஆன்லைன் 2FA குறியீடு உருவாக்கி | பாதுகாப்பான OTP குறியீடுகள் | Minecraft பாணியால் ஈர்க்கப்பட்ட நேர்த்தியான அங்கீகாரக் கருவி',
  te: '2FA.HOT | ఆన్‌లైన్ 2FA కోడ్ జనరేటర్ | సురక్షితమైన OTP కోడ్‌లు | Minecraft స్ఫూర్తితో అందమైన ప్రామాణీకరణ సాధనం',
  el: '2FA.HOT | Διαδικτυακή γεννήτρια κωδικών 2FA | Ασφαλείς κωδικοί OTP | Κομψό εργαλείο επαλήθευσης εμπνευσμένο από το Minecraft'
}

export const toolDescriptions: Record<SupportedLocale, string> = {
  en: '2FA.HOT is an elegant Minecraft-inspired online 2FA/TOTP authenticator and OTP code generator. Paste a Base32 secret or otpauth:// URI to generate codes locally in your browser. Import QR codes, migrate Google Authenticator accounts, process batches, use optional encrypted local history and share fragment links that keep secrets out of page requests.',
  'zh-CN':
    '2FA.HOT 是一款参考 Minecraft 风格设计的在线 2FA/TOTP 身份验证器和 OTP 验证码生成器。无需注册，粘贴 Base32 密钥或 otpauth:// 配置即可在浏览器本地生成双重验证码；支持批量取码、QR 二维码导入、Google Authenticator 迁移、可选加密本地历史，以及减少密钥随页面请求传输的片段直链。',
  'zh-TW':
    '2FA.HOT 是一款參考 Minecraft 風格設計的線上 2FA/TOTP 身份驗證器和 OTP 驗證碼產生器。無需註冊，貼上 Base32 密鑰或 otpauth:// 設定即可在瀏覽器本地產生雙重驗證碼；支援批次取碼、QR 碼匯入、Google Authenticator 遷移、可選加密本地紀錄，以及減少密鑰隨頁面請求傳送的片段直鏈。',
  es: 'Generador de códigos 2FA en línea con estilo Minecraft. Admite TOTP, generación por lotes e importación QR. Funciona en el navegador, sin registro y con historial local cifrado opcional.',
  fr: 'Générateur de codes 2FA en ligne au style Minecraft. Codes TOTP, génération par lots et import QR. Calcul dans le navigateur, sans inscription, avec historique local chiffré en option.',
  de: 'Online-Generator für 2FA-Codes im Minecraft-Stil. TOTP-Codes, mehrere Codes gleichzeitig und QR-Import. Berechnung im Browser, ohne Registrierung, mit optional verschlüsseltem lokalem Verlauf.',
  'pt-BR':
    'Gerador de códigos 2FA online com estilo Minecraft. Suporta TOTP, geração em lote e importação QR. Funciona no navegador, sem cadastro, com histórico local criptografado opcional.',
  ru: 'Онлайн-генератор кодов 2FA в стиле Minecraft. Поддержка TOTP, пакетной генерации и импорта QR. Вычисления в браузере, без регистрации, с локальной зашифрованной историей по желанию.',
  ja: 'Minecraft スタイルのオンライン 2FA 認証コード生成ツール。TOTP ワンタイムパスワード、一括生成、QR コードの読み込みに対応。ブラウザ内で計算、登録不要。暗号化したローカル履歴を任意で保存できます。',
  ko: 'Minecraft 스타일의 온라인 2FA 인증 코드 생성기. TOTP 일회용 코드, 일괄 생성, QR 가져오기를 지원합니다. 브라우저에서 계산하며 가입이 필요 없고, 암호화된 로컬 기록을 선택적으로 저장할 수 있습니다.',
  ar: 'مولّد رموز 2FA عبر الإنترنت بطابع Minecraft. يدعم رموز TOTP والتوليد الجماعي واستيراد QR. يعمل داخل المتصفح دون تسجيل، مع سجل محلي مشفّر اختياري.',
  hi: 'Minecraft शैली का ऑनलाइन 2FA कोड जनरेटर। TOTP कोड, एक साथ कई कोड बनाना और QR आयात समर्थित। ब्राउज़र में गणना, बिना पंजीकरण, वैकल्पिक एन्क्रिप्टेड स्थानीय इतिहास के साथ।',
  bn: 'Minecraft শৈলীর অনলাইন 2FA কোড জেনারেটর। TOTP কোড, একসঙ্গে একাধিক কোড তৈরি ও QR আমদানি সমর্থিত। ব্রাউজারেই গণনা, নিবন্ধন ছাড়াই, ঐচ্ছিক এনক্রিপ্ট করা স্থানীয় ইতিহাসসহ।',
  ur: 'Minecraft انداز کا آن لائن 2FA کوڈ جنریٹر۔ TOTP کوڈ، بیک وقت کئی کوڈ بنانا اور QR درآمد کی سہولت۔ حساب براؤزر میں، بغیر رجسٹریشن، اختیاری مقامی خفیہ کردہ تاریخ کے ساتھ۔',
  id: 'Generator kode 2FA online bergaya Minecraft. Mendukung TOTP, pembuatan kode massal dan impor QR. Perhitungan di browser, tanpa pendaftaran, dengan riwayat lokal terenkripsi opsional.',
  ms: 'Penjana kod 2FA dalam talian bergaya Minecraft. Menyokong TOTP, penjanaan kod berkelompok dan import QR. Pengiraan dalam pelayar, tanpa pendaftaran, dengan sejarah tempatan disulitkan secara pilihan.',
  vi: 'Trình tạo mã 2FA trực tuyến phong cách Minecraft. Hỗ trợ mã TOTP, tạo mã hàng loạt và nhập QR. Tính toán trong trình duyệt, không cần đăng ký, với tùy chọn lưu lịch sử cục bộ được mã hóa.',
  th: 'เครื่องมือสร้างรหัส 2FA ออนไลน์สไตล์ Minecraft รองรับรหัส TOTP การสร้างหลายรหัสและนำเข้า QR คำนวณในเบราว์เซอร์ ไม่ต้องสมัครสมาชิก และเลือกเก็บประวัติแบบเข้ารหัสในเครื่องได้',
  tr: 'Minecraft tarzında çevrimiçi 2FA kod üretici. TOTP, toplu kod üretimi ve QR içe aktarma desteği. Tarayıcıda hesaplama, kayıt gerektirmez, isteğe bağlı şifreli yerel geçmiş.',
  it: 'Generatore di codici 2FA online in stile Minecraft. Supporta TOTP, generazione in blocco e importazione QR. Calcolo nel browser, senza registrazione, con cronologia locale cifrata facoltativa.',
  nl: 'Online generator voor 2FA-codes in Minecraft-stijl. TOTP, meerdere codes tegelijk en QR-import. Berekening in je browser, zonder registratie, met optionele versleutelde lokale geschiedenis.',
  pl: 'Generator kodów 2FA online w stylu Minecraft. Obsługuje TOTP, generowanie wielu kodów naraz i import QR. Obliczenia w przeglądarce, bez rejestracji, z opcjonalną szyfrowaną historią lokalną.',
  uk: 'Онлайн-генератор кодів 2FA у стилі Minecraft. Підтримка TOTP, пакетної генерації та імпорту QR. Обчислення в браузері, без реєстрації, з локальною зашифрованою історією за бажанням.',
  fa: 'تولیدکننده آنلاین کدهای 2FA با سبک Minecraft. پشتیبانی از TOTP، تولید گروهی کد و واردکردن QR. محاسبه در مرورگر، بدون ثبت‌نام، با تاریخچه محلی رمزگذاری‌شده اختیاری.',
  he: 'מחולל קודי 2FA מקוון בסגנון Minecraft. תומך ב-TOTP, יצירת קודים באצווה וייבוא QR. חישוב בדפדפן, ללא הרשמה, עם היסטוריה מקומית מוצפנת לבחירה.',
  sw: 'Kizalishaji cha misimbo ya 2FA mtandaoni kwa mtindo wa Minecraft. Kinasaidia TOTP, kutengeneza misimbo kwa makundi na kuingiza QR. Hukokotoa ndani ya kivinjari, bila kujisajili, na historia ya ndani iliyosimbwa kwa hiari.',
  fil: 'Online na generator ng 2FA code na may estilong Minecraft. May TOTP, maramihang pagbuo ng code at QR import. Kinakalkula sa browser, walang pagpaparehistro, at may opsyonal na naka-encrypt na lokal na history.',
  ta: 'Minecraft பாணியிலான இணையவழி 2FA குறியீடு உருவாக்கி. TOTP குறியீடுகள், தொகுப்பாக உருவாக்குதல் மற்றும் QR இறக்குமதி ஆதரவு. உலாவியிலேயே கணக்கீடு, பதிவு தேவையில்லை; விருப்ப உள்ளூர் மறைகுறியாக்க வரலாறு.',
  te: 'Minecraft శైలిలో ఆన్‌లైన్ 2FA కోడ్ జనరేటర్. TOTP కోడ్‌లు, ఒకేసారి పలు కోడ్‌ల తయారీ, QR దిగుమతికి మద్దతు. బ్రౌజర్‌లోనే గణన, నమోదు అవసరం లేదు; ఐచ్ఛిక ఎన్‌క్రిప్టెడ్ స్థానిక చరిత్ర.',
  el: 'Διαδικτυακή γεννήτρια κωδικών 2FA σε στυλ Minecraft. Υποστηρίζει TOTP, μαζική δημιουργία κωδικών και εισαγωγή QR. Υπολογισμός στον browser, χωρίς εγγραφή, με προαιρετικό κρυπτογραφημένο τοπικό ιστορικό.'
}
