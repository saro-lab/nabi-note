// 옮겼다 — 키 하나라도 빠지면 타입 오류라 파일이 통째로 채워져 있어야 한다.
// Translated — a missing key is a type error, so the file must stay filled in whole.
export const ar = {
  label: 'العربية',
  lang: 'ar',
  // Right to left — VitePress puts this on <html dir>
  // 오른쪽에서 왼쪽으로 읽는다 — VitePress 가 <html dir> 에 얹는다
  dir: 'rtl',
  link: '/ar/',
  description: 'NABI NOTE — محرّر WYSIWYG مفتوح المصدر.',

  menu_docs: 'التوثيق',
  menu_icon_theme: "سمات الأيقونات",
  menu_intro_vibe_coding: 'برمجة الأجواء بالذكاء الاصطناعي',



  menu_projects: 'المشاريع',

  menu_inline: 'العناصر السطرية',
  menu_inline_bold: 'عريض',
  menu_inline_italic: 'مائل',
  menu_inline_underline: 'تسطير',
  menu_inline_strikethrough: 'يتوسطه خط',
  menu_inline_superscript: 'مرتفع',
  menu_inline_subscript: 'منخفض',
  menu_inline_link: 'رابط',
  menu_inline_highlight: 'تمييز',
  menu_inline_text_color: 'لون النص',

  menu_block: 'الكتل',
  menu_block_heading: 'عنوان',
  menu_block_bullet_list: 'قائمة نقطية',
  menu_block_ordered_list: 'قائمة مرقمة',
  menu_block_task_list: 'قائمة المهام',
  menu_block_table: 'جدول',
  menu_block_image: 'صورة',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'شيفرة',
  menu_block_details: 'كتلة قابلة للطي',
  menu_block_quote: 'اقتباس',
  menu_block_divider: 'فاصل',

  menu_etc: 'أخرى',
  menu_etc_align: 'المحاذاة',
  menu_etc_dropcap: 'حرف استهلالي',
  menu_etc_typeface: 'نوع الخط',
  menu_etc_font_size: 'حجم الخط',
  menu_etc_clear_format: 'مسح التنسيق',
  menu_etc_upload: 'رفع ملف',

  search: 'بحث',
  search_no_results: 'لا نتائج',
  search_hint: 'يرجى إدخال كلمة للبحث',
  search_move: 'تنقل',
  search_open: 'فتح',
  search_close: 'إغلاق',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: "<p data-nabi-align=\"c\"></p><div data-nabi-p data-nabi-align=\"c\"><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><h1 data-nabi-align=\"c\">NABI NOTE</h1><p data-nabi-align=\"c\"><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\">محرّر WYSIWYG مفتوح المصدر</span></i></span></p><p></p><p data-nabi-dropcap=\"1\"><span data-nabi-typeface=\"serif\"><b>NABI NOTE</b> محرر WYSIWYG مفتوح المصدر يفصل وظائف مثل التنسيق والمحاذاة والجداول والرفع عن النواة في وحدات مستقلة تُسمى wings. يمكنك اختيار الوحدات التي تحتاجها فقط لتكوين المحرر وربط وحدات تصنعها بنفسك. وهو مكتوب بلغة JavaScript الخالصة، لذلك يمكن استخدامه مع أطر مثل React وVue. ويمكن البدء مباشرةً في الصفحات التي لا تملك بيئة بناء باستخدام <b>مكتبة CDN</b>. ويمكن تحويل صيغة المستند الخاصة به، <b>NABI TREE</b>، إلى HTML حتى في Node.js دون DOM المتصفح. تُنظّم المستندات المدخلة وفق القواعد المسجلة، وعند إنشاء HTML تُهَرَّب النصوص والسمات وتُفحص عناوين الروابط. لكن يجب مراجعة الوحدات المخصصة والبيانات المستلمة من الخادم بشكل منفصل وفق سياسة أمان التطبيق. تتيح متغيرات CSS والتخطيطات المبنية على rem ضبط السمة والحجم، مع الوضع الداكن وإعدادات خطوط للغات متعددة. كما تعمل فرز الجداول والسجل المحلي والعمل على المستندات بمساعدة الذكاء الاصطناعي على نموذج المستند نفسه.</span></p><p></p><h2>الخط</h2><p>بلا تذييل (المبدئي)، وبتذييل، وثابت العرض، ومكتوب باليد — كل عائلة تُرصّ فيها الخطوط بحسب نظام الكتابة، فأيّ لغة كتبتَ يبقى لها وجه تلك العائلة؛ وما لا يد له في تلك العائلة من أنظمة الكتابة يعود إلى خط المتصفح المبدئي. <b>الخط المبدئي يقرّره المضيف.</b></p><p></p><p>وفي ما يلي كل عائلة معروضة <b>بلغات عدة</b>.</p><p></p><p><span data-nabi-typeface=\"sans\"><span data-nabi-size=\"lg\">بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie · 산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек</span></span></p><p></p><p><span data-nabi-typeface=\"serif\"><span data-nabi-size=\"lg\">بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Serif · Yenye serif · செரிஃப் · มีเชิง · Con grazie · 세리프 · 明朝体 · 衬线 · Avec empattement · Con serifa · Com serifa · С засечками</span></span></p><p></p><p><span data-nabi-typeface=\"mono\"><span data-nabi-size=\"lg\">ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace · 고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный</span></span></p><p></p><p><span data-nabi-typeface=\"cursive\"><span data-nabi-size=\"lg\">خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · Cursive · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный</span></span></p><p></p><p></p><h2>حجم الخط</h2><p><span data-nabi-size=\"xs\">صغير جدًا</span></p><p><span data-nabi-size=\"sm\">صغير</span></p><p><span data-nabi-size=\"lg\">كبير</span></p><p><span data-nabi-size=\"xl\">كبير جدًا</span></p><p></p><p></p><h2>عنوان</h2><p>اكتب # في سطر فارغ ثم اضغط المسافة — يصير عنوانًا في الحال.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>عريض · مائل · تحته خط · مشطوب</h2><p><b>عريض</b> <i>مائل</i> <u>تحته خط</u> <s>مشطوب</s> — هذا مثال.</p><p><b><i><s><u>ويمكن جمعها بعضها فوق بعض.</u></s></i></b></p><h3>الرفع والخفض</h3><p>المساحة 3.5 م<sup>2</sup>، والحاشية تُوضع هكذا<sup>1</sup>.</p><p>الماء هو H<sub>2</sub>O.</p><p></p><p></p><h2>لون النص · التظليل</h2><p>اختيرت الألوان لتبقى مريحة للقراءة في الفاتح والداكن معًا.</p><p>لون النص <span data-color=\"green\">أخضر</span> · <span data-color=\"coral\">مرجاني</span> · <span data-color=\"violet\">بنفسجي</span> · <span data-color=\"amber\">كهرماني</span> · <span data-color=\"blue\">أزرق</span></p><p>التظليل <mark data-color=\"yellow\">أصفر</mark> · <mark data-color=\"green\">أخضر</mark> · <mark data-color=\"cyan\">سماوي</mark> · <mark data-color=\"pink\">وردي</mark> · <mark data-color=\"purple\">أرجواني</mark> · <mark data-color=\"orange\">برتقالي</mark></p><p></p><p></p><h2>رابط</h2><p>ضع عنوانًا فيصير <a href=\"https://nabi.saro.me/\">رابطًا</a>.</p><p>لا يُقبل إلا http:// و https://؛ وما كان مثل javascript: فلا يمرّ.</p><p>اكتب مثلًا <a href=\"https://nabi.saro.me/\">https://nabi.saro.me</a> ثم اضغط المسافة أو الإدخال — فيتحوّل من تلقاء نفسه، كما ترى هنا.</p><h3>فتح الرابط</h3><p>مبدئيًا يُفتح رابط الأصل نفسه في هذه النافذة، وأي موقع آخر في نافذة جديدة؛ وتُضبط هذه القاعدة عند تعريف المحرّر.</p><h3>رابط المرفق</h3><p>إن رفعتَ غير صورة بقي رابط على هيئة ملف كالذي في الأسفل.</p><p><a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>مرفق</a> هكذا يبقى.</p><p></p><p></p><h2>المحاذاة</h2><p>إلى اليسار</p><p data-nabi-align=\"c\">إلى الوسط</p><p data-nabi-align=\"r\">إلى اليمين</p><h3>والعناوين أيضًا تُحاذى.</h3><p></p><p></p><h2>القوائم</h2><h3>قائمة نقطية</h3><p>اكتب - في سطر فارغ ثم اضغط <b>المسافة</b> — تصير قائمة نقطية في الحال.</p><div data-nabi-p><ul><li><p>هذا بند</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab للإزاحة إلى الداخل والخارج.</p></li></ul></div></li></ul></div><h3>قائمة مرقّمة</h3><p>اكتب 1. في سطر فارغ ثم اضغط <b>المسافة</b> — تصير قائمة مرقّمة.</p><div data-nabi-p><ol><li><p>الأول</p></li><li><p>الثاني</p></li><li><p>الثالث</p></li></ol></div><h3>قائمة مهام</h3><p>اكتب [ ] أو [x] في سطر فارغ ثم اضغط <b>المسافة</b> — تصير قائمة مهام.</p><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>هذه المهمة منجزة.</p></li><li data-nabi-checked=\"false\"><p>وهذه لم تُنجز بعد.</p></li></ul></div><p></p><p></p><h2>جدول</h2><p>يمكن أن تضم الخلايا فقرات وكتلًا متعددة، مع ألوان خلفية لتمييز المحتوى. جرّب تحرير النص والصور مباشرةً في الجدول أدناه.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>مواد مرجعية</p></th><th data-nabi-cell-color=\"cyan\"><p>ملاحظات العمل</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">صورة ووصفها في خلية واحدة.</p></td><td data-nabi-cell-color=\"yellow\"><h3>فقرات مرنة</h3><p>اضغط Enter لبدء فقرة جديدة، أو Shift+Enter لإضافة سطر جديد داخل الفقرة نفسها.</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>تغيير خلفية الخلايا</p></li><li data-nabi-checked=\"false\"><p>إزاحة القائمة باستخدام Tab</p></li><li data-nabi-checked=\"false\"><p>تحديد عدة خلايا وتطبيق اللون نفسه</p></li></ul></div></td><td><div data-nabi-p><details open><summary>انقر لعرض نصائح التحرير</summary><p>يمكن أن تحتوي الخلايا أيضًا على كتل قابلة للطي واقتباسات وشيفرة وفيديو.</p><p>عند دمج الخلايا، يُحفظ محتوى كل منها بالترتيب.</p></details></div></td></tr></table></div></div><p>انقر داخل خلية لإظهار لون خلفيتها وأدوات الصفوف والأعمدة. حدّد عدة خلايا لتغيير لونها ومحاذاتها معًا. لتغيير موضع الجدول كاملًا، اختر «تحديد الجدول» ثم استخدم أدوات المحاذاة.</p><p>تُحفظ الجداول ذات الألوان أو الكتل المتعددة بصيغة HTML حتى عند الحفظ بصيغة Markdown.</p><h3>ألوان خلفية الخلايا</h3><p>تظهر هنا جميع ألوان خلفية الخلايا المدعومة. انقر خلية لتغيير لونها، أو اختر «افتراضي» من أدوات الخصائص لإزالة خلفيتها.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"yellow\"><p data-nabi-align=\"c\"><b>أصفر</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">yellow</span></p></td><td data-nabi-cell-color=\"green\"><p data-nabi-align=\"c\"><b>أخضر</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">green</span></p></td><td data-nabi-cell-color=\"cyan\"><p data-nabi-align=\"c\"><b>سماوي</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">cyan</span></p></td></tr><tr><td data-nabi-cell-color=\"pink\"><p data-nabi-align=\"c\"><b>وردي</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">pink</span></p></td><td data-nabi-cell-color=\"purple\"><p data-nabi-align=\"c\"><b>بنفسجي</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">purple</span></p></td><td data-nabi-cell-color=\"orange\"><p data-nabi-align=\"c\"><b>برتقالي</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">orange</span></p></td></tr></table></div></div><h3>فرز الأعمدة</h3><p>اضغط <b>معاينة</b>، ثم انقر ترويسة <b>المخزون</b> و<b>السعر</b> واحدة بعد الأخرى.</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>الطراز</p></th><th><p>المخزون</p></th><th><p>السعر</p></th><th><p>الوزن</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>لم يُحدَّد</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>السعر</b> كله أرقام، فيُفرز فرز الأرقام.</p><p><b>المخزون</b> يُفرز فرز النصوص لأن في الخانة الأخيرة حروفًا.</p><p></p><p></p><h2>فاصل</h2><p>اكتب --- ثم اضغط الإدخال — يصير خطًا فاصلًا.</p><div data-nabi-p><hr/></div><p></p><p></p><h2>صورة</h2><p>العرض يُضبط من 30% إلى 100%، وتقف يمينًا أو وسطًا أو يسارًا.</p><div data-nabi-p><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p></p><p></p><h2>منطقة عائمة</h2><div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>لمحة سريعة</b></p><p>منطقة مساعدة صغيرة للنص والصور والجداول.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>الموضع</p></td><td><p>اليمين</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>العرض الأقصى</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>استخدم منطقة عائمة لوضع توضيحات أو مواد صغيرة بجوار النص الرئيسي. في المستند العريض، ينساب هذا النص بجانب المنطقة. انقر داخلها لتحرير النص وإدراج صور أو جداول في المحرر نفسه.</p><p>ضع المؤشر داخل المنطقة لفتح أدوات خصائصها. بدّل بين اليسار واليمين، واختر عرضًا أقصى قدره 20 أو 30 أو 40 أو 50% بما يناسب النص. تظل الجداول والصور الملصقة داخل المنطقة أيضًا.</p><p>يمكنك أيضًا إحاطة الفقرات المحددة بمنطقة. يترك زر فك المنطقة بجوار العرض محتواها في المستند الرئيسي. تخفي المعاينة الإطار المنقّط الخاص بالتحرير، بينما تتتابع العناصر في عمود واحد في المستندات الضيقة وعند الطباعة.</p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src=\"https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk\" title=\"YouTube\" allowfullscreen loading=\"lazy\" data-nabi-width=\"70\"></iframe></div><p></p><p></p><h2>الرفع</h2><p>جرّب أن تسحب صورة أو ملفًا إلى المحرّر.</p><p>لا يرسل هذا العرض التجريبي الملفات إلى خادم حقيقي. اربط أداة رفع بتطبيقك لتخزينها على خادم.</p><p>بعد فتح منتقي الصور أو بدء الرفع، يظل الإدراج في الموضع الأصلي إذا حرّكت المؤشر فقط. يؤدي تحرير المستند أثناء الانتظار إلى إلغاء الإدراج وإظهار إشعار. كما يبقى تقدّم الرفع ونتيجته داخل الخلية التي بدأ فيها.</p><p></p><p></p><h2>اقتباس</h2><div data-nabi-p><blockquote><p>اكتب &gt; في سطر فارغ ثم اضغط <b>المسافة</b> — يصير صندوق اقتباس.</p><p>ويمكن أن يمتدّ على أسطر عدة.</p></blockquote></div><p></p><p></p><h2>شيفرة</h2><p>اكتب ``` في سطر فارغ ثم اضغط <b>المسافة أو الإدخال</b> — يصير صندوق شيفرة.</p><p>واكتب اللغة معها، مثل ```java، ثم المسافة أو الإدخال — فيأخذ الصندوق تلك اللغة.</p><div data-nabi-p><pre data-nabi-lang=\"typescript\"><code class=\"language-typescript\">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>طيّ</h2><div data-nabi-p><details open><summary>الطيّ يتكوّن من عنوان ومحتوى.</summary><p>ولك أن تحدّد أيُحفظ مطويًّا أم مفتوحًا.</p></details></div><p></p><h2></h2><h2>شريط الأدوات</h2><p>تُجمع أدوات العناوين وتنسيق النص والمحاذاة والقوائم والإدراج والمستند في مجموعات. تظهر الأدوات موسّعة على الحاسوب، وتتوفر أدوات سريعة ولوحة كاملة على الهاتف. تظهر خصائص الجدول أو المنطقة العائمة المحددة أسفل الشريط.</p><p></p><h2>الاختصارات</h2><p><b>اضغط Shift مرتين بسرعة</b> لاختيار الأدوات بلوحة المفاتيح. تنقّل في الشريط الموسّع على الحاسوب أو اللوحة الكاملة على الهاتف. استخدم Tab لتغيير المجموعة والأسهم لاختيار الأداة وEnter لتشغيلها.</p><p>في نهاية كتلة مثل الاقتباس أو الشيفرة أو الكتلة القابلة للطي، اضغط Enter مرتين بسرعة للخروج. الفاصل الافتراضي بين الضغطتين هو 180ms.</p><p></p><p></p><h2>التنسيق التلقائي</h2><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>مثال</p></th><th><p>المفتاح</p></th><th><p>النتيجة</p></th></tr><tr><td><p>#</p></td><td><p>مسافة</p></td><td><p>عنوان</p></td></tr><tr><td><p>-</p></td><td><p>مسافة</p></td><td><p>قائمة نقطية</p></td></tr><tr><td><p>1.</p></td><td><p>مسافة</p></td><td><p>قائمة مرقّمة</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>مسافة</p></td><td><p>قائمة مهام</p></td></tr><tr><td><p>&gt;</p></td><td><p>مسافة</p></td><td><p>اقتباس</p></td></tr><tr><td><p>``` · ```ts</p></td><td><p>مسافة · إدخال</p></td><td><p>صندوق شيفرة</p></td></tr><tr><td><p>---</p></td><td><p>إدخال</p></td><td><p>فاصل</p></td></tr><tr><td><p>https://…</p></td><td><p>مسافة · إدخال</p></td><td><p>رابط</p></td></tr></table></div></div><p></p><p></p><h3>دوال الإخراج</h3><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>الدالة</p></th><th><p>النتيجة</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>يعمل بغير DOM</h2><p>تحويل JSON إلى HTML <b>لا يحتاج DOM</b>.</p><p>يمكن للخادم (Node.js) أيضًا قراءة NABI TREE المحفوظ وإنشاء HTML وفق القواعد نفسها.</p><p></p><h2>ودود للهاتف</h2><div data-nabi-p><ul><li><p><b>واجهة الهاتف</b> — ترتّب أدوات التحرير بما يناسب عرض الشاشة.</p></li><li><p><b>التكيف مع لوحة مفاتيح الهاتف</b> — يضبط ارتفاع مساحة التحرير عند فتح لوحة المفاتيح.</p></li><li><p><b>أحجام مرنة</b> — تستخدم وحدات rem في التخطيط الرئيسي للتكيف مع التكبير والتصغير.</p></li><li><p><b>تعدد اللغات</b> — يمكنك ضبط الإعدادات المحلية والخط بما يناسب اللغة واتجاه النص.</p></li></ul></div><p></p><h2>التخصيص</h2><div data-nabi-p><ul><li><p><b>wing من صنعك</b> — إن نقصتك وظيفة فاصنعها بنفسك وسجّلها.</p></li><li><p><b>CSS من صنعك</b> — الألوان والزوايا والفراغات كلها معرّفة بـ --nabi-*، فالداكن والفاتح إليك.</p></li><li><p><b>مفتوح المصدر</b> — متاح مفتوح المصدر على GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>اطّلع على التوثيق → <a href=\"https://nabi.saro.me/\">nabi.saro.me</a></p>",
  demo_wings: 'الأجنحة',
  demo_wings_all: 'تشغيل الكل',
  demo_wings_none: 'إيقاف الكل',
  demo_zoom: 'التكبير/التصغير',
  demo_zoom_out: 'تصغير',
  demo_zoom_in: 'تكبير',
  demo_zoom_reset: 'إعادة الضبط',
  demo_sticky: 'تثبيت شريط الأدوات',
  demo_sticky_keyboard: 'تعويض لوحة مفاتيح الجوّال',
  demo_sticky_height: 'الارتفاع',
  demo_sticky_unit: 'وحدة الارتفاع',
  demo_typeface_base: 'نوع الخط الافتراضي',
  demo_typeface_sans: 'غير مذيل',
  demo_typeface_serif: 'مذيل',
  demo_typeface_mono: 'ثابت العرض',
  demo_typeface_cursive: 'خط اليد',
  demo_html_small: '<p>اكتب هنا، وفعِّل الأجنحة أعلاه أو عطِّلها.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>ضع إصبعك على <b>الكلمات المهمة</b>. اختر نصًّا واضغط <b>B</b> في شريط الأدوات.</p>',
  demo_html_italic:
    '<p>الاقتباسات والكلمات غير المألوفة تُكتَب <i>مائلة</i>. اختر هذه الجملة وجرّب.</p>',
  demo_html_underline:
    '<p>هنا <u>خط تحت</u> النص. اختر تلك الحروف واضغط الزر مجددًا لإزالته.</p>',
  demo_html_strikethrough: '<p><s>19.00 ريال</s> 9.90 ريال — أبقِ القيمة القديمة ظاهرة.</p>',
  demo_html_superscript:
    '<p>المساحة 3.5م<sup>2</sup>، والحواشي تُعلَّق هكذا.<sup>1</sup></p>',
  demo_html_subscript: '<p>الماء H<sub>2</sub>O، وثاني أكسيد الكربون CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>أعطِه عنوانًا فتحصل على <a href="https://example.com">رابط كهذا</a>. الرابط الموجود لا يفتح شريطًا سياقيًّا — لتغيير العنوان احذفه واصنع رابطًا جديدًا.</p>',
  demo_html_highlight:
    "<p>حدّد النص واضغط زر التمييز لفتح لوحة الألوان. يمكنك الاختيار من: <mark data-color=\"yellow\">أصفر</mark>·<mark data-color=\"green\">أخضر</mark>·<mark data-color=\"cyan\">سماوي</mark>·<mark data-color=\"pink\">وردي</mark>·<mark data-color=\"purple\">بنفسجي</mark>·<mark data-color=\"orange\">برتقالي</mark>.</p><p>ضع المؤشر داخل النص المميّز لتغيير اللون من أدوات السياق.</p>",
  demo_html_text_color:
    "<p>يمكن تطبيق الألوان التالية على النص المحدد: <span data-color=\"green\">أخضر</span>·<span data-color=\"coral\">مرجاني</span>·<span data-color=\"violet\">بنفسجي</span>·<span data-color=\"amber\">كهرماني</span>·<span data-color=\"blue\">أزرق</span>.</p><p><mark data-color=\"yellow\">التمييز</mark> <span data-color=\"blue\">ولون النص يمكن تطبيقهما معًا.</span></p>",
  demo_html_heading:
    '<h1>عنوان 1</h1><h2>عنوان 2</h2><h3>عنوان 3</h3><p>نص المتن. كتابة # ومسافة في سطر فارغ تصنع عنوانًا أيضًا.</p>',
  demo_html_bullet_list:
    '<ul><li>قائمة نقطية</li><li>Tab يزيد المسافة، Shift+Tab ينقصها<ul><li>عنصر متداخل</li></ul></li></ul><p>كتابة - ومسافة في سطر فارغ تصنع واحدة أيضًا.</p>',
  demo_html_ordered_list:
    '<ol><li>قائمة مرقَّمة</li><li>إدراج عنصر أو حذفه يعيد ترقيم البقية</li></ol><p>كتابة 1. ومسافة في سطر فارغ تصنع واحدة أيضًا.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">اضغط المربع أمام النص</li><li data-nabi-checked="false">حالة التحديد تُحفظ مع المستند</li></ul><p>كتابة [ ] أو [x] في سطر فارغ تصنع واحدة أيضًا.</p>',
  demo_html_table:
    "<p>يمكن أن تضم الخلايا فقرات وكتلًا متعددة، مع ألوان خلفية لتمييز المحتوى. جرّب تحرير النص والصور مباشرةً في الجدول أدناه.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>مواد مرجعية</p></th><th data-nabi-cell-color=\"cyan\"><p>ملاحظات العمل</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">صورة ووصفها في خلية واحدة.</p></td><td data-nabi-cell-color=\"yellow\"><h3>فقرات مرنة</h3><p>اضغط Enter لبدء فقرة جديدة، أو Shift+Enter لإضافة سطر جديد داخل الفقرة نفسها.</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>تغيير خلفية الخلايا</p></li><li data-nabi-checked=\"false\"><p>إزاحة القائمة باستخدام Tab</p></li><li data-nabi-checked=\"false\"><p>تحديد عدة خلايا وتطبيق اللون نفسه</p></li></ul></div></td><td><div data-nabi-p><details open><summary>انقر لعرض نصائح التحرير</summary><p>يمكن أن تحتوي الخلايا أيضًا على كتل قابلة للطي واقتباسات وشيفرة وفيديو.</p><p>عند دمج الخلايا، يُحفظ محتوى كل منها بالترتيب.</p></details></div></td></tr></table></div></div><p>انقر داخل خلية لإظهار لون خلفيتها وأدوات الصفوف والأعمدة. حدّد عدة خلايا لتغيير لونها ومحاذاتها معًا. لتغيير موضع الجدول كاملًا، اختر «تحديد الجدول» ثم استخدم أدوات المحاذاة.</p><p>ينقل Tab إلى الخلية التالية في الفقرة العادية، ويضيف إزاحة في القوائم والشيفرة. يبقى لون خلفية الخلية عند مسح المحتوى أو التنسيق.</p>",
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="شعار NABI NOTE" data-nabi-width="50"></div><p>اضغط الصورة ليظهر صندوق العرض والمحاذاة.</p>',
  demo_html_youtube:
    '<p>استعمل زر يوتيوب في شريط الأدوات، أو ألصق عنوان فيديو مباشرة — يظهر التضمين هنا.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>ضع المؤشر داخل الكود فيظهر حقل اللغة في الشريط السياقي.</p>',
  demo_html_details:
    '<details open=""><summary>اضغط هنا للطي</summary><p>حالة الطي تُحفظ مع المستند — يراها القارئ كما تركها الكاتب.</p></details>',
  demo_html_quote:
    "<div data-nabi-p><blockquote><p>يمكن جمع جملة من نص آخر أو محتوى تريد إبرازه في اقتباس.</p><p>يمكن أن يضم الاقتباس عدة فقرات وكتل.</p></blockquote></div><p>اكتب &gt; ثم اضغط مسافة في سطر فارغ لتحويله إلى اقتباس.</p>",
  demo_html_divider:
    '<p>فقرة فوق الخط الفاصل.</p><hr><p>وأخرى تحته. كتابة --- وحدها في سطر ثم الضغط على Enter تصنع خطًّا أيضًا.</p>',
  demo_html_align:
    '<p data-nabi-align="l">محاذاة يسار</p><p data-nabi-align="c">محاذاة وسط</p><p data-nabi-align="r">محاذاة يمين</p>',
  demo_html_font_size:
    "<p><span data-nabi-size=\"xs\">صغير جدًا — مناسب للحواشي والتوضيحات الإضافية.</span></p><p><span data-nabi-size=\"sm\">صغير — أقل من حجم النص الأساسي بدرجة واحدة.</span></p><p>فقرة بالحجم الافتراضي. وتعرض قائمة الأحجام كل حجم كما سيظهر في النص.</p><p><span data-nabi-size=\"lg\">كبير — مناسب لجملة تريد إبرازها.</span></p><p><span data-nabi-size=\"xl\">كبير جدًا — مناسب لجملة تمهيدية أسفل عنوان.</span></p><p>يُطبّق الحجم على النطاق المحدد. إذا كان هناك مؤشر فقط، فيُطبّق على نص الفقرة الحالية.</p>",
  demo_html_typeface:
    "<p>لا يوجد خط محدد لهذه الفقرة، لذا تستخدم الخط الافتراضي للصفحة.</p><p><span data-nabi-typeface=\"serif\">تستخدم هذه الفقرة عائلة خطوط ذات زوائد. عند اختيار عائلة مثل serif، يحدّد CSS الموقع الخط الفعلي.</span></p><p><span data-nabi-typeface=\"mono\">تستخدم هذه الفقرة خطًا ثابت العرض. يساعد عرض الأحرف المتساوي على محاذاة الأرقام والشيفرة — 0O 1lI</span></p><p><span data-nabi-typeface=\"cursive\">يُضبَط الخط لكل فقرة على حدة، ويتعايش بسعادة مع علامات كالغامق.</span></p>",
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">يمتد الحرف الأول على ثلاثة أسطر ويلتف النص حوله. الفقرات القصيرة تحجز مكانًا لتلك الأسطر أيضًا، فلا تُدفَع الكتلة التالية إلى الأعلى.</p><p>هذه الفقرة بلا هذا التأثير.</p>',
  demo_html_clear_format:
    '<p>اختر نصًّا <b>غامقًا</b>، <i>مائلًا</i>، <u>تحته خط</u> أو <s>مشطوبًا</s> واضغط الممحاة.</p><p>يُزال تنسيق الحروف فقط — تبقى الكتل كما هي تمامًا.</p>',
  demo_html_upload:
    "<p>اسحب ملفًا إلى منطقة التحرير أو الصقه. هذا العرض غير متصل بخادم رفع حقيقي، لذلك لا تُحفظ الملفات على خادم.</p><p>بعد اكتمال الرفع، يمكن أن يبقى الملف في المستند على هيئة <a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>مرفق</a>.</p>",


  cdn_demo_lead: 'احفظ الشيفرة أدناه باسم {file} وافتحها في متصفح — تعمل فورًا أمام عينيك.',
  cdn_demo_download: 'تنزيل demo.html',
  cdn_code_minheight: 'أدنى ارتفاع للمحرر — يمنعه من الظهور صندوقًا بسطر واحد عند أول فتح. غيّر القيمة كما تريد.',
  cdn_code_wings: 'كل الأجنحة عدا الرفع.',
  cdn_code_faces:
    'من الخطوط يُبقى على النمطي والمذيَّل فقط.\nتدعم الأنظمة خطوطًا مختلفة، فيحتاج أحادي المسافة والمخطوطي إلى خط ويب يُستورَد\nعلى حدة قبل أن تتعرّف عليه كل منصّة. التفاصيل في صفحة "نوع الخط".',
  cdn_code_change: 'مثال على استدعاء عند تغيّر القيمة',
  code_copy: 'نسخ الشيفرة',
  demo_install: 'التثبيت',
  demo_code: 'الشيفرة',
  demo_tree: 'nabi-tree',
  demo_loading: 'جارٍ تحميل المحرّر…',

  page_not_found: 'الصفحة غير موجودة',

  demo_html_float: "<div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>لمحة سريعة</b></p><p>منطقة مساعدة صغيرة للنص والصور والجداول.</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>الموضع</p></td><td><p>اليمين</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>العرض الأقصى</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>استخدم منطقة عائمة لوضع توضيحات أو مواد صغيرة بجوار النص الرئيسي. في المستند العريض، ينساب هذا النص بجانب المنطقة. انقر داخلها لتحرير النص وإدراج صور أو جداول في المحرر نفسه.</p><p>ضع المؤشر داخل المنطقة لفتح أدوات خصائصها. بدّل بين اليسار واليمين، واختر عرضًا أقصى قدره 20 أو 30 أو 40 أو 50% بما يناسب النص. تظل الجداول والصور الملصقة داخل المنطقة أيضًا.</p><p>يمكنك أيضًا إحاطة الفقرات المحددة بمنطقة. يترك زر فك المنطقة بجوار العرض محتواها في المستند الرئيسي. تخفي المعاينة الإطار المنقّط الخاص بالتحرير، بينما تتتابع العناصر في عمود واحد في المستندات الضيقة وعند الطباعة.</p>",
  menu_block_float: "منطقة عائمة",
}
