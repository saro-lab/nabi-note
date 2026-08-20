// Translated — the labels read in Urdu now, and every wing's name is the word its own toolbar
// button shows. A missing key is still a type error, so the file stays whole.
// 옮겼다 — 이름표는 이제 우르두어로 읽히고, 날개 이름은 그 날개 툴바 버튼에 뜨는 낱말 그대로다.
// 키가 하나라도 빠지면 여전히 타입 오류라 파일은 온전해야 한다.
export const ur = {
  label: 'اردو',
  lang: 'ur',
  // Right to left — VitePress puts this on <html dir>
  // 오른쪽에서 왼쪽으로 읽는다 — VitePress 가 <html dir> 에 얹는다
  dir: 'rtl',
  link: '/ur/',
  description: 'NABI NOTE — ایک اوپن سورس WYSIWYG ایڈیٹر۔',

  menu_docs: 'دستاویزات',
  menu_intro: 'تعارف',
  menu_intro_index: 'NABI NOTE کیا ہے؟',
  menu_intro_usage: 'بنیادی استعمال',
  menu_intro_ssr: 'SSR سپورٹ',
  menu_intro_cdn: 'CDN سے استعمال',
  menu_intro_vibe_coding: 'AI وائب کوڈنگ',

  menu_wing: 'پَر (Wing)',
  menu_wing_custom: 'اپنا پَر بنائیں',
  menu_custom_start: 'آغاز',
  menu_custom_inline: 'اِن لائن نشان',
  menu_custom_block: 'بلاک اور اس کی خصوصیات',
  menu_custom_ui: 'انٹرفیس اور اعمال',
  menu_custom_input: 'کلیدیں، خودکار تبدیلی، چسپاں کرنا',

  menu_style: 'سجاوٹ',
  menu_style_custom: 'انداز بدلنا',

  menu_projects: 'منصوبے',

  menu_inline: 'اِن لائن',
  menu_inline_bold: 'جلی',
  menu_inline_italic: 'ترچھا',
  menu_inline_underline: 'خط کشیدہ',
  menu_inline_strikethrough: 'خط زدہ',
  menu_inline_superscript: 'بالائی',
  menu_inline_subscript: 'زیریں',
  menu_inline_link: 'لنک',
  menu_inline_highlight: 'نمایاں',
  menu_inline_text_color: 'متن کا رنگ',

  menu_block: 'بلاک',
  menu_block_heading: 'سرخی',
  menu_block_bullet_list: 'بلٹ فہرست',
  menu_block_ordered_list: 'نمبر شدہ فہرست',
  menu_block_task_list: 'چیک لسٹ',
  menu_block_table: 'جدول',
  menu_block_image: 'تصویر',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'کوڈ',
  menu_block_details: 'تفصیل',
  menu_block_quote: 'اقتباس',
  menu_block_divider: 'خط فاصل',

  menu_etc: 'دیگر',
  menu_etc_align: 'سیدھ',
  menu_etc_dropcap: 'ڈراپ کیپ',
  menu_etc_typeface: 'فونٹ',
  menu_etc_font_size: 'حروف کا سائز',
  menu_etc_clear_format: 'فارمیٹنگ ہٹائیں',
  menu_etc_upload: 'فائل اپ لوڈ کریں',

  search: 'تلاش',
  search_no_results: 'کوئی نتیجہ نہیں',
  search_hint: 'تلاش کے لیے لفظ درج کریں',
  search_move: 'حرکت',
  search_open: 'کھولیں',
  search_close: 'بند کریں',

  demo_placeholder: 'یہاں لکھ کر دیکھیں',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">ابھی AI سے دستاویزات بنائی اور ترجمہ کی جا رہی ہیں۔</p><p data-nabi-align="c">جب یہ ٹھہر جائے گا تو نسخہ 1.0.0 ہو جائے گا۔</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">ایک آزاد مآخذ WYSIWYG مدیر</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> ایک آزاد مآخذ WYSIWYG مدیر ہے، جس میں ہر بڑا کام — سجاوٹ، ہمواری، جدول، چڑھاؤ اور باقی سب — «پَر» نامی الگ ماڈیول کی صورت میں مرکز سے جدا رکھا گیا ہے، تاکہ بنانے والا اسے بغیر کسی حد کے بڑھا سکے۔ یہ خالص Vanilla JS میں لکھا گیا ہے اور <b>فریم ورک پر صفر انحصار</b> کا ارادہ رکھتا ہے، اس لیے React میں، Vue میں یا کہیں بھی جوں کا توں بیٹھ جاتا ہے، اور جن منصوبوں میں تعمیر کا نظام نہیں اُن کے لیے ایک <b>CDN کتب خانہ</b> بھی ساتھ ہے۔ اس کی اپنی JSON صورت <b>NABI TREE</b> ہے، اس لیے HTML اور متن کے درمیان کی تبدیلی وہاں بھی پہلے سے تیار کی جا سکتی ہے جہاں DOM سرے سے نہیں (Node.js، SSR)؛ اور چونکہ یہ دستاویز کو پیوند لگانے کے بجائے اجازت یافتہ الفاظ سے نئے سرے سے جوڑتا ہے، اس لیے کسی الگ صفائی کے کتب خانے کے بغیر <b>XSS رسم الخط جڑ ہی سے رک جاتی ہے</b>۔ سجاوٹ میں <b>CSS Variable</b> کا طریقہ اپنایا گیا ہے، جس سے برانڈ کا رنگ آسانی سے بدلا جا سکتا ہے، اور <b>rem پر مبنی خاکے</b> سے بڑا چھوٹا کرنے پر بھی موبائل کی صورت ہموار رہتی ہے؛ گہرے اور روشن، دونوں سے میل کھاتے رنگ، نمایاں کرنے والے قلم اور کئی زبانوں کے حروف پہلے سے موجود ہیں۔ اس پر مزید <b>قسم پہچان کر جدول کے ستون کی ترتیب</b>، IndexedDB پر قائم <b>مقامی تاریخ</b> اور <b>وائب کوڈنگ</b> کی سہولت بھی ہے۔</span></p><p><br/></p><h2>رسم الخط</h2><p>بغیر پائے (طے شدہ)، پائے دار، یکساں چوڑائی اور ہاتھ کی لکھائی — ہر خاندان میں لکھائی کے نظام کے لحاظ سے حروف رکھے گئے ہیں، اس لیے کوئی سی بھی زبان لکھیے، اسی خاندان کا چہرہ برقرار رہتا ہے؛ جس نظامِ تحریر کے لیے اُس خاندان میں ہاتھ کی لکھائی نہیں، وہ متصفح کے طے شدہ حروف پر لوٹ آتا ہے۔ <b>طے شدہ رسم الخط میزبان طے کرتا ہے۔</b></p><p><br/></p><p>نیچے ہر خاندان <b>کئی زبانوں میں</b> دکھایا گیا ہے۔</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>حروف کا حجم</h2><p><span data-nabi-size="xs">بہت چھوٹا</span></p><p><span data-nabi-size="sm">چھوٹا</span></p><p><span data-nabi-size="lg">بڑا</span></p><p><span data-nabi-size="xl">بہت بڑا</span></p><p><br/></p><p><br/></p><h2>عنوان</h2><p>خالی سطر میں # لکھ کر خلا دبائیے — وہیں عنوان بن جاتا ہے۔</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>موٹا · ترچھا · خط کشیدہ · کٹا ہوا</h2><p><b>موٹا</b> <i>ترچھا</i> <u>خط کشیدہ</u> <s>کٹا ہوا</s> — یہ رہی مثال۔</p><p><b><i><s><u>انہیں ایک پر ایک بھی لگایا جا سکتا ہے۔</u></s></i></b></p><h3>بالائی اور زیریں عدد</h3><p>رقبہ 3.5 میٹر<sup>2</sup> ہے، اور حاشیہ یوں لگتا ہے<sup>1</sup>۔</p><p>پانی H<sub>2</sub>O ہے۔</p><p><br/></p><p><br/></p><h2>حروف کا رنگ · نمایاں قلم</h2><p>رنگ ایسے چنے گئے ہیں کہ روشن اور گہرے، دونوں میں پڑھنے میں آسان رہیں۔</p><p>حروف کا رنگ <span data-color="green">سبز</span> · <span data-color="coral">مونگا</span> · <span data-color="violet">بنفشی</span> · <span data-color="amber">کہربائی</span> · <span data-color="blue">نیلا</span></p><p>نمایاں قلم <mark data-color="yellow">زرد</mark> · <mark data-color="green">سبز</mark> · <mark data-color="cyan">آسمانی</mark> · <mark data-color="pink">گلابی</mark> · <mark data-color="purple">ارغوانی</mark> · <mark data-color="orange">نارنجی</mark></p><p><br/></p><p><br/></p><h2>کڑی</h2><p>پتہ ڈالیے اور وہ <a href="https://nabi.saro.me/">کڑی</a> بن جاتا ہے۔</p><p>پتے میں صرف http:// اور https:// چلتے ہیں؛ javascript: جیسا کچھ نہیں چلے گا۔</p><p>مثلاً <a href="https://nabi.saro.me/">https://nabi.saro.me</a> لکھ کر خلا یا اینٹر دبائیے — یہ خود ہی بدل جاتا ہے، جیسا یہاں دکھ رہا ہے۔</p><h3>target</h3><p>طے شدہ طور پر ایک ہی مآخذ کی کڑی اسی کھڑکی میں اور دوسری سائٹ نئی کھڑکی میں کھلتی ہے؛ یہ قاعدہ مدیر کے اعلان کے وقت مقرر کیا جا سکتا ہے۔</p><h3>منسلک کی کڑی</h3><p>تصویر کے سوا کچھ اور چڑھائیے تو نیچے جیسی فائل نما کڑی رہ جاتی ہے۔</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>منسلک</a> بس اتنا ہی باقی رہتا ہے۔</p><p><br/></p><p><br/></p><h2>ہمواری</h2><p>بائیں</p><p>درمیان</p><p>دائیں</p><h3>عنوان بھی ہموار کیے جا سکتے ہیں۔</h3><p><br/></p><p><br/></p><h2>فہرستیں</h2><h3>نکاتی فہرست</h3><p>خالی سطر میں - لکھ کر <b>خلا</b> دبائیے — وہیں نکاتی فہرست بن جاتی ہے۔</p><div data-nabi-p><ul><li><p>یہ ایک نکتہ ہے</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab سے اندر اور باہر کیا جاتا ہے۔</p></li></ul></div></li></ul></div><h3>عددی فہرست</h3><p>خالی سطر میں 1. لکھ کر <b>خلا</b> دبائیے — عددی فہرست بن جاتی ہے۔</p><div data-nabi-p><ol><li><p>پہلا</p></li><li><p>دوسرا</p></li><li><p>تیسرا</p></li></ol></div><h3>جانچ فہرست</h3><p>خالی سطر میں [ ] یا [x] لکھ کر <b>خلا</b> دبائیے — جانچ فہرست بن جاتی ہے۔</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>یہ کام ہو چکا ہے۔</p></li><li data-nabi-checked="false"><p>یہ ابھی باقی ہے۔</p></li></ul></div><p><br/></p><p><br/></p><h2>جدول</h2><p>اوزار پٹی کے جدول سے بنائیے؛ سطریں اور ستون بڑھائے، ہٹائے اور ملائے جا سکتے ہیں۔</p><h3>ستون کی ترتیب</h3><p><b>جھلک</b> دبائیے، پھر <b>ذخیرہ</b> اور <b>قیمت</b> کے سرے یکے بعد دیگرے دبائیے۔</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>نمونہ</p></th><th><p>ذخیرہ</p></th><th><p>قیمت</p></th><th><p>وزن</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>طے ہونا باقی</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>قیمت</b> میں سب عدد ہیں، اس لیے عدد کی طرح ترتیب پاتی ہے۔</p><p><b>ذخیرہ</b> متن کی طرح ترتیب پاتا ہے، کیونکہ آخری خانے میں حروف ہیں۔ (بچنا ہو تو وہ خانہ خالی کر دیجیے۔)</p><p><br/></p><p><br/></p><h2>جدا کرنے والی لکیر</h2><p>--- لکھ کر اینٹر دبائیے — جدا کرنے والی لکیر بن جاتی ہے۔</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>تصویر</h2><p>تصویر کا پتہ ڈالیے یا چڑھا دیجیے؛ چوڑائی 30% سے 100% تک رکھی جا سکتی ہے اور وہ دائیں، درمیان یا بائیں بیٹھتی ہے۔</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>چڑھاؤ</h2><p>کوئی تصویر یا فائل مدیر پر گھسیٹ کر دیکھیے۔</p><p>یہاں کا چڑھاؤ محض دکھاوا ہے؛ ایک ترتیب سے یہ آپ کے سرور سے جڑ جاتا ہے۔</p><p>چڑھاؤ ناکام ہو جائے تو وہ تصویر یا فائل مدیر سے نکال دی جاتی ہے۔</p><p><br/></p><p><br/></p><h2>اقتباس</h2><div data-nabi-p><blockquote><p>خالی سطر میں &gt; لکھ کر <b>خلا</b> دبائیے — اقتباس کا خانہ بن جاتا ہے۔</p><p>یہ کئی سطروں تک چل سکتا ہے۔</p></blockquote></div><p><br/></p><p><br/></p><h2>کوڈ</h2><p>خالی سطر میں \`\`\` لکھ کر <b>خلا یا اینٹر</b> دبائیے — کوڈ کا خانہ بن جاتا ہے۔</p><p>زبان بھی ساتھ لکھیے، جیسے \`\`\`java، پھر خلا یا اینٹر — خانے پر وہی زبان لگ جاتی ہے۔</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>تہہ</h2><div data-nabi-p><details open><summary>تہہ عنوان اور اندر کے مواد سے بنتی ہے۔</summary><p>آپ طے کر سکتے ہیں کہ یہ بند حالت میں محفوظ ہو یا کھلی۔</p></details></div><p><br/></p><h2>مقامی تاریخ</h2><p><b>متصفح کی</b> IndexedDB کے ذریعے مقررہ وقفے پر تاریخ رکھی جاتی ہے۔</p><p>یہ صرف اسی آلے پر رہتی ہے اور اتنی ہی رکھتی ہے جتنی اعلان کی گئی ہو۔ — طے شدہ ہر 30 سیکنڈ، پچھلی 20 نشستیں۔</p><p><br/></p><p><br/></p><h2>مختصر کلیدیں</h2><p><b>Shift دو بار تیزی سے</b> دبائیے — اوزار پٹی ہر کام کی مختصر کلید دکھا دیتی ہے۔</p><p><br/></p><p><br/></p><h2>خودکار سجاوٹ</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>مثال</p></th><th><p>کلید</p></th><th><p>نتیجہ</p></th></tr><tr><td><p>#</p></td><td><p>خلا</p></td><td><p>عنوان</p></td></tr><tr><td><p>-</p></td><td><p>خلا</p></td><td><p>نکاتی فہرست</p></td></tr><tr><td><p>1.</p></td><td><p>خلا</p></td><td><p>عددی فہرست</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>خلا</p></td><td><p>جانچ فہرست</p></td></tr><tr><td><p>&gt;</p></td><td><p>خلا</p></td><td><p>اقتباس</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>خلا · اینٹر</p></td><td><p>کوڈ کا خانہ</p></td></tr><tr><td><p>---</p></td><td><p>اینٹر</p></td><td><p>جدا کرنے والی لکیر</p></td></tr><tr><td><p>https://…</p></td><td><p>خلا · اینٹر</p></td><td><p>کڑی</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>اخراج کے فعل</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>فعل</p></th><th><p>نتیجہ</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>DOM کے بغیر بھی چلتا ہے</h2><p>JSON سے HTML بنانے کے لیے <b>DOM کی ضرورت نہیں</b>۔</p><p>سرور (Node.js) محفوظ نابی درخت کو جوں کا توں پڑھ کر، XSS روکتے ہوئے HTML جوڑ سکتا ہے۔</p><p><br/></p><h2>موبائل کا دوست</h2><div data-nabi-p><ul><li><p><b>موبائل صورت</b> — جواب دینے والا خاکہ موبائل کی صورت سنبھالتا ہے۔</p></li><li><p><b>کلید تختے کی تلافی</b> — کلید تختہ کھلے تو اس کی اونچائی کی تلافی ہو جاتی ہے۔</p></li><li><p><b>لچکدار حجم</b> — سارے حجم rem میں لکھے گئے ہیں۔</p></li><li><p><b>کئی زبانیں</b> — یہ چودہ زبانیں بولتا ہے۔</p></li></ul></div><p><br/></p><h2>اپنی مرضی کی صورت</h2><div data-nabi-p><ul><li><p><b>اپنا پَر</b> — کوئی سہولت درکار ہو تو خود بنا کر لگا لیجیے۔</p></li><li><p><b>اپنا CSS</b> — رنگ، کونے اور وقفے سب --nabi-* سے طے ہیں، گہرا ہو یا روشن — آپ کی مرضی۔</p></li><li><p><b>آزاد مآخذ</b> — GitHub پر آزاد مآخذ کے طور پر دستیاب۔</p></li></ul></div><div data-nabi-p><hr/></div><p>دستاویزات دیکھیے → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'پَر',
  demo_wings_all: 'سب چالو',
  demo_wings_none: 'سب بند',
  demo_zoom: 'بڑا/چھوٹا',
  demo_zoom_out: 'چھوٹا کریں',
  demo_zoom_in: 'بڑا کریں',
  demo_zoom_reset: 'اصل حالت',
  demo_sticky: 'ٹول بار جمائیں',
  demo_sticky_keyboard: 'موبائل کی بورڈ کی تلافی',
  demo_sticky_height: 'اونچائی',
  demo_sticky_unit: 'اونچائی کی اکائی',
  demo_typeface_base: 'طے شدہ فونٹ',
  demo_typeface_sans: 'سینس سیرف',
  demo_typeface_serif: 'سیرف',
  demo_typeface_mono: 'یکساں چوڑائی',
  demo_typeface_cursive: 'رواں خط',
  demo_html_small: '<p>یہاں لکھیں، اور اوپر دیے wings کو آن آف کریں۔</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>جملے میں <b>اہم الفاظ</b> کی طرف اشارہ کریں۔ کچھ متن منتخب کریں اور ٹول بار میں <b>B</b> دبائیں۔</p>',
  demo_html_italic:
    '<p>حوالہ جات اور اجنبی الفاظ <i>ترچھے</i> لکھے جاتے ہیں۔ یہ جملہ منتخب کر کے آزمائیں۔</p>',
  demo_html_underline:
    '<p>یہاں ایک <u>لکیر</u> کھینچی ہوئی ہے۔ وہی حروف منتخب کر کے دوبارہ دبائیں تو ہٹ جائے گی۔</p>',
  demo_html_strikethrough: '<p><s>1900 روپے</s> 990 روپے — پرانی قیمت کو نظر آتا چھوڑ دیں۔</p>',
  demo_html_superscript:
    '<p>رقبہ 3.5 میٹر<sup>2</sup> ہے، اور حاشیے یوں لگتے ہیں۔<sup>1</sup></p>',
  demo_html_subscript: '<p>پانی H<sub>2</sub>O ہے، اور کاربن ڈائی آکسائیڈ CO<sub>2</sub>۔</p>',
  demo_html_link:
    '<p>پتا درج کریں تو <a href="https://example.com">ایسا لنک</a> بن جاتا ہے۔ موجودہ لنک پر context قطار نہیں کھلتی — پتا بدلنے کے لیے اسے مٹا کر نیا بنائیں۔</p>',
  demo_html_highlight:
    '<p>کچھ متن منتخب کر کے بٹن دبائیں: چھ رنگ — <mark data-color="yellow">پیلا</mark>، <mark data-color="green">سبز</mark>، <mark data-color="cyan">آسمانی</mark> — کرسر کے پاس کھلتے ہیں۔</p><p>کرسر کو نشان کے اندر رکھیں تو یہی نمونے context قطار میں رنگ بدلنے کے لیے نظر آتے ہیں۔</p>',
  demo_html_text_color:
    '<p>متن کو <span data-color="green">سبز</span>، <span data-color="coral">مرجانی</span> یا <span data-color="violet">ارغوانی</span> رنگ دیں — کل پانچ رنگ ہیں۔</p><p><mark data-color="yellow">ہائی لائٹ کے اوپر</mark> بھی چل جاتا ہے: دونوں الگ نشان ہیں، اس لیے <span data-color="blue">دونوں لگ جاتے ہیں۔</span></p>',
  demo_html_heading:
    '<h1>عنوان 1</h1><h2>عنوان 2</h2><h3>عنوان 3</h3><p>عام متن۔ خالی سطر پر # اور خالی جگہ لکھنے سے بھی عنوان بن جاتا ہے۔</p>',
  demo_html_bullet_list:
    '<ul><li>نکاتی فہرست</li><li>Tab سے اندر، Shift+Tab سے باہر<ul><li>اندرونی نکتہ</li></ul></li></ul><p>خالی سطر پر - اور خالی جگہ لکھنے سے بھی فہرست بن جاتی ہے۔</p>',
  demo_html_ordered_list:
    '<ol><li>گنتی والی فہرست</li><li>نکتہ شامل یا حذف کریں تو نمبر خود درست ہو جاتے ہیں</li></ol><p>خالی سطر پر 1. اور خالی جگہ لکھنے سے بھی بن جاتی ہے۔</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">متن کے سامنے ڈبہ دبائیں</li><li data-nabi-checked="false">نشان کی حالت دستاویز کے ساتھ محفوظ ہوتی ہے</li></ul><p>خالی سطر پر [ ] یا [x] لکھنے سے بھی بن جاتی ہے۔</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>کلید</th><th>کیا کرتی ہے</th></tr><tr><td>Tab</td><td>اگلا خانہ</td></tr><tr><td>تیر کے نشان</td><td>گرڈ کے مطابق حرکت</td></tr></tbody></table><p>کرسر کو خانے میں رکھیں تو context قطار صف اور کالم کے احکامات سے بھر جاتی ہے۔</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="NABI NOTE کا لوگو" data-nabi-width="50"></div><p>تصویر پر کلک کریں تو چوڑائی اور ترتیب کا خانہ کھلتا ہے۔</p>',
  demo_html_youtube:
    '<p>ٹول بار میں یوٹیوب کا بٹن استعمال کریں، یا ویڈیو کا پتا سیدھا چسپاں کریں — سرایت یہیں آ جائے گی۔</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>کرسر کو کوڈ کے اندر رکھیں تو context قطار میں زبان کا خانہ نظر آتا ہے۔</p>',
  demo_html_details:
    '<details open=""><summary>لپیٹنے کے لیے یہاں دبائیں</summary><p>لپٹی ہوئی حالت دستاویز کے ساتھ محفوظ ہوتی ہے — قاری اسے ویسے ہی دیکھتا ہے جیسے لکھنے والے نے چھوڑا۔</p></details>',
  demo_html_quote:
    '<blockquote><p>یہ کسی اور کے الفاظ کے لیے خانہ ہے۔ اس کے اندر صرف حروف کی تزئین چلتی ہے — تصویر، کوڈ اور جدول کے بٹن نظر نہیں آتے۔</p></blockquote><p>خالی سطر پر &gt; اور خالی جگہ لکھیں تو وہ سطر اقتباس بن جاتی ہے۔</p>',
  demo_html_divider:
    '<p>جدا کرنے والی لکیر سے اوپر کا پیراگراف۔</p><hr><p>اور ایک نیچے۔ خالی سطر پر صرف --- لکھ کر Enter دبانے سے بھی لکیر بن جاتی ہے۔</p>',
  demo_html_align:
    '<p data-nabi-align="l">بائیں ترتیب</p><p data-nabi-align="c">درمیانی ترتیب</p><p data-nabi-align="r">دائیں ترتیب</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">بہت چھوٹا — حاشیوں اور ضمنی باتوں کے لیے۔</p><p data-nabi-size="sm">چھوٹا — عام متن سے ایک قدم پیچھے۔</p><p>معمول کے سائز کا پیراگراف۔ بٹن دبائیں تو پانچ درجے نظر آتے ہیں، <b>ہر ایک آپ کی زبان میں، اپنے سائز کے ساتھ</b>۔</p><p data-nabi-size="lg">بڑا — وزن والا جملہ۔</p><p data-nabi-size="xl">بہت بڑا — عنوان کے نیچے کا تعارفی جملہ۔</p>',
  demo_html_typeface:
    '<p>اس پیراگراف پر کوئی رسم الخط نہیں لگا — یہ صفحے کا بنیادی سینس سیرف دکھاتا ہے۔</p><p data-nabi-typeface="serif">یہ سیرف ہے۔ خاندان آپ چنتے ہیں، اصل فونٹ وہی ہے جو اس سائٹ نے ٹوکن پر رکھا ہے، یہاں Noto Serif۔</p><p data-nabi-typeface="mono">یہ یکساں چوڑائی والا ہے۔ ہر حرف ایک جیسی جگہ لیتا ہے، اس لیے کالم سیدھے رہتے ہیں — 0O 1lI</p><p data-nabi-typeface="cursive">یہ رواں خط ہے — Handwriting · 手書き · 手写۔</p><p>رسم الخط <b>ہر پیراگراف کے لیے الگ</b> رکھا جاتا ہے، اور بولڈ جیسے نشانات کے ساتھ بخوشی چلتا ہے۔</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">پہلا حرف تین سطروں پر پھیلتا ہے اور متن اس کے گرد بہتا ہے۔ چھوٹے پیراگراف بھی ان سطروں کے لیے جگہ روک لیتے ہیں، اس لیے نیچے کا بلاک کبھی اوپر نہیں چڑھتا۔</p><p>اس پیراگراف پر یہ نشان نہیں لگا۔</p>',
  demo_html_clear_format:
    '<p><b>بولڈ</b>، <i>ترچھا</i>، <u>لکیر والا</u> یا <s>کٹا ہوا</s> متن منتخب کر کے مٹانے والا بٹن دبائیں۔</p><p>صرف حروف کی تزئین ہٹتی ہے — بلاک ویسے ہی رہتے ہیں۔</p>',
  demo_html_upload:
    '<p>اس خانے میں فائل گھسیٹ کر لائیں، یا چسپاں کریں۔ اس سائٹ کے پاس اپ لوڈ کرنے کے لیے کوئی سرور نہیں، اس لیے یہ صرف ظاہر کرتا ہے — نتیجہ صرف اسی صفحے کے اندر رہتا ہے۔</p><p>مکمل ہونے والا منسلکہ یوں نظر آتا ہے <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>۔</p>',


  cdn_demo_lead: 'نیچے دیا گیا کوڈ {file} کے نام سے محفوظ کریں اور براؤزر میں کھولیں — فوراً چل کر دکھائی دے گا۔',
  cdn_demo_download: 'demo.html ڈاؤن لوڈ کریں',
  cdn_code_minheight: 'ایڈیٹر کی کم از کم اونچائی — پہلی بار کھلتے ہی ایک لکیر کے ڈبے جیسا نہ لگے۔ قدر آزادانہ بدل سکتے ہیں۔',
  cdn_code_wings: 'اپ لوڈ کے سوا سب wing شامل ہیں۔',
  cdn_code_faces:
    'فونٹ میں صرف sans اور serif رکھے گئے ہیں۔\nہر نظام مختلف فونٹ سپورٹ کرتا ہے، اس لیے mono اور cursive کو الگ import کرنا پڑتا ہے\nتاکہ ہر پلیٹ فارم پر پہچانا جا سکے۔ تفصیل "typeface" کی دستاویز میں دیکھیں۔',
  cdn_code_change: 'قدر بدلنے پر callback کی مثال',
  code_copy: 'کوڈ نقل کریں',
  demo_install: 'تنصیب',
  demo_code: 'کوڈ',
  demo_chars: '{n} حروف',
  demo_tree: 'nabi-tree',
  demo_loading: 'ایڈیٹر لوڈ ہو رہا ہے…',

  page_not_found: 'صفحہ نہیں ملا',
  nav_prev: 'پچھلی دستاویز',
  nav_next: 'اگلی دستاویز',
}
