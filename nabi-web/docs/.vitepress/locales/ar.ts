// Translated — the labels read in Arabic now, and every wing's name is the word its own toolbar
// button shows. A missing key is still a type error, so the file stays whole.
// 옮겼다 — 이름표는 이제 아랍어로 읽히고, 날개 이름은 그 날개 툴바 버튼에 뜨는 낱말 그대로다.
// 키가 하나라도 빠지면 여전히 타입 오류라 파일은 온전해야 한다.
export const ar = {
  label: 'العربية',
  lang: 'ar',
  // Right to left — VitePress puts this on <html dir>
  // 오른쪽에서 왼쪽으로 읽는다 — VitePress 가 <html dir> 에 얹는다
  dir: 'rtl',
  link: '/ar/',
  description: 'NABI NOTE — محرّر WYSIWYG مفتوح المصدر.',

  menu_docs: 'التوثيق',
  menu_intro: 'مقدّمة',
  menu_intro_index: 'ما هو NABI NOTE؟',
  menu_intro_usage: 'الاستخدام الأساسي',
  menu_intro_ssr: 'دعم SSR',
  menu_intro_cdn: 'الاستخدام عبر CDN',
  menu_intro_vibe_coding: 'برمجة الأجواء بالذكاء الاصطناعي',

  menu_wing: 'الجناح (Wing)',
  menu_wing_custom: 'بناء جناح خاص بك',
  menu_custom_start: 'البدء',
  menu_custom_inline: 'العلامات السطرية',
  menu_custom_block: 'الكتل وخصائصها',
  menu_custom_ui: 'الواجهة والإجراءات',
  menu_custom_input: 'المفاتيح والتحويل التلقائي واللصق',

  menu_style: 'التصميم',
  menu_style_custom: 'تغيير الأنماط',

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
  search_hint: 'أدخل كلمة للبحث',
  search_move: 'تنقل',
  search_open: 'فتح',
  search_close: 'إغلاق',

  demo_placeholder: 'اكتب هنا',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">الوثائق الآن تُنشأ وتُترجم بالذكاء الاصطناعي.</p><p data-nabi-align="c">وحين يستقر، يصير الإصدار 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">محرّر WYSIWYG مفتوح المصدر</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> محرّر WYSIWYG مفتوح المصدر، فُصلت فيه كل وظيفة أساسية — التنسيق والمحاذاة والجداول والرفع وما بقي — عن النواة على هيئة وحدة مستقلة تُسمّى «جناحًا»، حتى يستطيع المطوّر أن يوسّعه بلا حدّ. وهو مكتوب بلغة Vanilla JS الصافية ويقصد <b>صفرًا من الاعتماد على أطر العمل</b>، فيدخل في React وفي Vue وفي أي شيء آخر كما هو، ومعه <b>مكتبة على CDN</b> للمشاريع التي لا نظام بناء لها. وله صيغته الخاصة بـ JSON، وهي <b>NABI TREE</b>، فيمكن تجهيز التحويل بين HTML والنص حيث لا يوجد DOM أصلًا (Node.js، SSR)؛ ولأنه يعيد تركيب المستند من مفردات مسموح بها بدل أن يرقّعه، فهو يضمن <b>قطع نصوص XSS من جذرها</b> بغير مكتبة تنقية منفصلة. أما في التصميم فقد أخذ بنظام <b>متغيّرات CSS</b>، فيسهل تبديل لون العلامة التجارية، وبـ<b>تخطيط قائم على rem</b>، فيبقى شكل الهاتف سلسًا مهما كبّرت أو صغّرت؛ والألوان الموافقة للداكن والفاتح وأقلام التظليل والخطوط متعددة اللغات كلها حاضرة. ويضاف إلى ذلك <b>فرز أعمدة الجدول مع تمييز النوع</b>، و<b>سجل محلي</b> قائم على IndexedDB، ودعم <b>البرمجة بالإحساس</b>.</span></p><p><br/></p><h2>الخط</h2><p>بلا تذييل (المبدئي)، وبتذييل، وثابت العرض، ومكتوب باليد — كل عائلة تُرصّ فيها الخطوط بحسب نظام الكتابة، فأيّ لغة كتبتَ يبقى لها وجه تلك العائلة؛ وما لا يد له في تلك العائلة من أنظمة الكتابة يعود إلى خط المتصفح المبدئي. <b>الخط المبدئي يقرّره المضيف.</b></p><p><br/></p><p>وفي ما يلي كل عائلة معروضة <b>بلغات عدة</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>حجم الخط</h2><p><span data-nabi-size="xs">صغير جدًا</span></p><p><span data-nabi-size="sm">صغير</span></p><p><span data-nabi-size="lg">كبير</span></p><p><span data-nabi-size="xl">كبير جدًا</span></p><p><br/></p><p><br/></p><h2>عنوان</h2><p>اكتب # في سطر فارغ ثم اضغط المسافة — يصير عنوانًا في الحال.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>عريض · مائل · تحته خط · مشطوب</h2><p><b>عريض</b> <i>مائل</i> <u>تحته خط</u> <s>مشطوب</s> — هذا مثال.</p><p><b><i><s><u>ويمكن جمعها بعضها فوق بعض.</u></s></i></b></p><h3>الرفع والخفض</h3><p>المساحة 3.5 م<sup>2</sup>، والحاشية تُوضع هكذا<sup>1</sup>.</p><p>الماء هو H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>لون النص · التظليل</h2><p>اختيرت الألوان لتبقى مريحة للقراءة في الفاتح والداكن معًا.</p><p>لون النص <span data-color="green">أخضر</span> · <span data-color="coral">مرجاني</span> · <span data-color="violet">بنفسجي</span> · <span data-color="amber">كهرماني</span> · <span data-color="blue">أزرق</span></p><p>التظليل <mark data-color="yellow">أصفر</mark> · <mark data-color="green">أخضر</mark> · <mark data-color="cyan">سماوي</mark> · <mark data-color="pink">وردي</mark> · <mark data-color="purple">أرجواني</mark> · <mark data-color="orange">برتقالي</mark></p><p><br/></p><p><br/></p><h2>رابط</h2><p>ضع عنوانًا فيصير <a href="https://nabi.saro.me/">رابطًا</a>.</p><p>لا يُقبل إلا http:// و https://؛ وما كان مثل javascript: فلا يمرّ.</p><p>اكتب مثلًا <a href="https://nabi.saro.me/">https://nabi.saro.me</a> ثم اضغط المسافة أو الإدخال — فيتحوّل من تلقاء نفسه، كما ترى هنا.</p><h3>target</h3><p>مبدئيًا يُفتح رابط الأصل نفسه في هذه النافذة، وأي موقع آخر في نافذة جديدة؛ وتُضبط هذه القاعدة عند تعريف المحرّر.</p><h3>رابط المرفق</h3><p>إن رفعتَ غير صورة بقي رابط على هيئة ملف كالذي في الأسفل.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>مرفق</a> هكذا يبقى.</p><p><br/></p><p><br/></p><h2>المحاذاة</h2><p>إلى اليسار</p><p>إلى الوسط</p><p>إلى اليمين</p><h3>والعناوين أيضًا تُحاذى.</h3><p><br/></p><p><br/></p><h2>القوائم</h2><h3>قائمة نقطية</h3><p>اكتب - في سطر فارغ ثم اضغط <b>المسافة</b> — تصير قائمة نقطية في الحال.</p><div data-nabi-p><ul><li><p>هذا بند</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab للإزاحة إلى الداخل والخارج.</p></li></ul></div></li></ul></div><h3>قائمة مرقّمة</h3><p>اكتب 1. في سطر فارغ ثم اضغط <b>المسافة</b> — تصير قائمة مرقّمة.</p><div data-nabi-p><ol><li><p>الأول</p></li><li><p>الثاني</p></li><li><p>الثالث</p></li></ol></div><h3>قائمة مهام</h3><p>اكتب [ ] أو [x] في سطر فارغ ثم اضغط <b>المسافة</b> — تصير قائمة مهام.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>هذه المهمة منجزة.</p></li><li data-nabi-checked="false"><p>وهذه لم تُنجز بعد.</p></li></ul></div><p><br/></p><p><br/></p><h2>جدول</h2><p>أنشئه من زر الجدول في شريط الأدوات؛ ويمكن إضافة الصفوف والأعمدة وحذفها ودمجها.</p><h3>فرز الأعمدة</h3><p>اضغط <b>معاينة</b>، ثم انقر ترويسة <b>المخزون</b> و<b>السعر</b> واحدة بعد الأخرى.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>الطراز</p></th><th><p>المخزون</p></th><th><p>السعر</p></th><th><p>الوزن</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>لم يُحدَّد</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>السعر</b> كله أرقام، فيُفرز فرز الأرقام.</p><p><b>المخزون</b> يُفرز فرز النصوص لأن في الخانة الأخيرة حروفًا. (وإن أردت تفادي ذلك فأفرغ تلك الخانة.)</p><p><br/></p><p><br/></p><h2>فاصل</h2><p>اكتب --- ثم اضغط الإدخال — يصير خطًا فاصلًا.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>صورة</h2><p>ضع عنوان صورة أو ارفع واحدة؛ والعرض يُضبط من 30% إلى 100%، وتقف يمينًا أو وسطًا أو يسارًا.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>الرفع</h2><p>جرّب أن تسحب صورة أو ملفًا إلى المحرّر.</p><p>الرفع في هذا العرض تمثيلي؛ وبإعداد واحد يتصل بخادمك.</p><p>وإن أخفق الرفع أُخرجت تلك الصورة أو ذلك الملف من المحرّر.</p><p><br/></p><p><br/></p><h2>اقتباس</h2><div data-nabi-p><blockquote><p>اكتب &gt; في سطر فارغ ثم اضغط <b>المسافة</b> — يصير صندوق اقتباس.</p><p>ويمكن أن يمتدّ على أسطر عدة.</p></blockquote></div><p><br/></p><p><br/></p><h2>شيفرة</h2><p>اكتب \`\`\` في سطر فارغ ثم اضغط <b>المسافة أو الإدخال</b> — يصير صندوق شيفرة.</p><p>واكتب اللغة معها، مثل \`\`\`java، ثم المسافة أو الإدخال — فيأخذ الصندوق تلك اللغة.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>طيّ</h2><div data-nabi-p><details open><summary>الطيّ يتكوّن من عنوان ومحتوى.</summary><p>ولك أن تحدّد أيُحفظ مطويًّا أم مفتوحًا.</p></details></div><p><br/></p><h2>سجل محلي</h2><p>يُحفظ السجل على المدة التي تحدّدها عبر IndexedDB <b>في المتصفح</b>.</p><p>ويبقى في الجهاز وحده، ويحتفظ بالعدد الذي تعلنه. — مبدئيًا كل 30 ثانية، وآخر 20 جلسة.</p><p><br/></p><p><br/></p><h2>الاختصارات</h2><p>اضغط <b>Shift مرتين سريعًا</b> فيُظهر شريط الأدوات اختصار كل وظيفة.</p><p><br/></p><p><br/></p><h2>التنسيق التلقائي</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>مثال</p></th><th><p>المفتاح</p></th><th><p>النتيجة</p></th></tr><tr><td><p>#</p></td><td><p>مسافة</p></td><td><p>عنوان</p></td></tr><tr><td><p>-</p></td><td><p>مسافة</p></td><td><p>قائمة نقطية</p></td></tr><tr><td><p>1.</p></td><td><p>مسافة</p></td><td><p>قائمة مرقّمة</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>مسافة</p></td><td><p>قائمة مهام</p></td></tr><tr><td><p>&gt;</p></td><td><p>مسافة</p></td><td><p>اقتباس</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>مسافة · إدخال</p></td><td><p>صندوق شيفرة</p></td></tr><tr><td><p>---</p></td><td><p>إدخال</p></td><td><p>فاصل</p></td></tr><tr><td><p>https://…</p></td><td><p>مسافة · إدخال</p></td><td><p>رابط</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>دوال الإخراج</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>الدالة</p></th><th><p>النتيجة</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>يعمل بغير DOM</h2><p>تحويل JSON إلى HTML <b>لا يحتاج DOM</b>.</p><p>فيستطيع الخادم (Node.js) أن يقرأ شجرة نابي المحفوظة كما هي ويبني HTML وهو يصدّ XSS.</p><p><br/></p><h2>ودود للهاتف</h2><div data-nabi-p><ul><li><p><b>واجهة الهاتف</b> — تخطيط متجاوب يحمل واجهة الهاتف.</p></li><li><p><b>تعويض لوحة المفاتيح</b> — إذا ظهرت لوحة المفاتيح عُوّض ارتفاعها.</p></li><li><p><b>أحجام مرنة</b> — كل الأحجام مكتوبة بوحدة rem.</p></li><li><p><b>متعدد اللغات</b> — يتكلّم أربع عشرة لغة.</p></li></ul></div><p><br/></p><h2>التخصيص</h2><div data-nabi-p><ul><li><p><b>جناح من صنعك</b> — إن نقصتك وظيفة فاصنعها بنفسك وسجّلها.</p></li><li><p><b>CSS من صنعك</b> — الألوان والزوايا والفراغات كلها معرّفة بـ --nabi-*، فالداكن والفاتح إليك.</p></li><li><p><b>مفتوح المصدر</b> — متاح مفتوح المصدر على GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>اطّلع على التوثيق → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
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
    '<p>اختر نصًّا واضغط الزر: ستة ألوان — <mark data-color="yellow">أصفر</mark>، <mark data-color="green">أخضر</mark>، <mark data-color="cyan">سماوي</mark> — تفتح بجانب المؤشر.</p><p>ضع المؤشر داخل علامة فتظهر الألوان نفسها في الشريط السياقي لتغييرها.</p>',
  demo_html_text_color:
    '<p>لوِّن النص <span data-color="green">أخضر</span>، <span data-color="coral">مرجاني</span> أو <span data-color="violet">بنفسجي</span> — خمسة ألوان في المجموع.</p><p><mark data-color="yellow">تراكب التظليل</mark> لا بأس به: فهما علامتان مختلفتان، لذا <span data-color="blue">يطبَّقان معًا.</span></p>',
  demo_html_heading:
    '<h1>عنوان 1</h1><h2>عنوان 2</h2><h3>عنوان 3</h3><p>نص المتن. كتابة # ومسافة في سطر فارغ تصنع عنوانًا أيضًا.</p>',
  demo_html_bullet_list:
    '<ul><li>قائمة نقطية</li><li>Tab يزيد المسافة، Shift+Tab ينقصها<ul><li>عنصر متداخل</li></ul></li></ul><p>كتابة - ومسافة في سطر فارغ تصنع واحدة أيضًا.</p>',
  demo_html_ordered_list:
    '<ol><li>قائمة مرقَّمة</li><li>إدراج عنصر أو حذفه يعيد ترقيم البقية</li></ol><p>كتابة 1. ومسافة في سطر فارغ تصنع واحدة أيضًا.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">اضغط المربع أمام النص</li><li data-nabi-checked="false">حالة التحديد تُحفظ مع المستند</li></ul><p>كتابة [ ] أو [x] في سطر فارغ تصنع واحدة أيضًا.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>المفتاح</th><th>ماذا يفعل</th></tr><tr><td>Tab</td><td>الخلية التالية</td></tr><tr><td>الأسهم</td><td>تحرّك حسب الشبكة</td></tr></tbody></table><p>ضع المؤشر في خلية فيمتلئ الشريط السياقي بأوامر الصف والعمود.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="شعار NABI NOTE" data-nabi-width="50"></div><p>اضغط الصورة ليظهر صندوق العرض والمحاذاة.</p>',
  demo_html_youtube:
    '<p>استعمل زر يوتيوب في شريط الأدوات، أو ألصق عنوان فيديو مباشرة — يظهر التضمين هنا.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>ضع المؤشر داخل الكود فيظهر حقل اللغة في الشريط السياقي.</p>',
  demo_html_details:
    '<details open=""><summary>اضغط هنا للطي</summary><p>حالة الطي تُحفظ مع المستند — يراها القارئ كما تركها الكاتب.</p></details>',
  demo_html_quote:
    '<blockquote><p>صندوق لكلام ليس كلامك. بداخله لا تعمل إلا علامات الحروف — لا تظهر أزرار الصورة والكود والجدول.</p></blockquote><p>اكتب &gt; ومسافة في سطر فارغ فيصير السطر اقتباسًا.</p>',
  demo_html_divider:
    '<p>فقرة فوق الخط الفاصل.</p><hr><p>وأخرى تحته. كتابة --- وحدها في سطر ثم الضغط على Enter تصنع خطًّا أيضًا.</p>',
  demo_html_align:
    '<p data-nabi-align="l">محاذاة يسار</p><p data-nabi-align="c">محاذاة وسط</p><p data-nabi-align="r">محاذاة يمين</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">صغير جدًّا — للحواشي والملاحظات الجانبية.</p><p data-nabi-size="sm">صغير — خطوة خلف المتن.</p><p>فقرة بالحجم الافتراضي. اضغط الزر فتظهر خمس درجات، <b>كل واحدة بلغتك، بحجمها الخاص</b>.</p><p data-nabi-size="lg">كبير — جملة لها وزن.</p><p data-nabi-size="xl">كبير جدًّا — المقدمة تحت العنوان.</p>',
  demo_html_typeface:
    '<p>هذه الفقرة بلا خط مُعلَّق — تظهر بخط الصفحة الافتراضي، بلا تذييل.</p><p data-nabi-typeface="serif">هذه بخط مذيَّل. أنت تختار الفصيلة، والخط الفعلي هو ما وضعه هذا الموقع على الرمز، وهنا Noto Serif.</p><p data-nabi-typeface="mono">هذه بخط ثابت العرض. كل حرف يأخذ العرض نفسه فتصطف الأعمدة — 0O 1lI</p><p data-nabi-typeface="cursive">هذه بخط اليد — Handwriting · 手書き · 手写.</p><p>يُضبَط الخط <b>لكل فقرة على حدة</b>، ويتعايش بسعادة مع علامات كالغامق.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">يمتد الحرف الأول على ثلاثة أسطر ويلتف النص حوله. الفقرات القصيرة تحجز مكانًا لتلك الأسطر أيضًا، فلا تُدفَع الكتلة التالية إلى الأعلى.</p><p>هذه الفقرة بلا هذا التأثير.</p>',
  demo_html_clear_format:
    '<p>اختر نصًّا <b>غامقًا</b>، <i>مائلًا</i>، <u>تحته خط</u> أو <s>مشطوبًا</s> واضغط الممحاة.</p><p>يُزال تنسيق الحروف فقط — تبقى الكتل كما هي تمامًا.</p>',
  demo_html_upload:
    '<p>أفلت ملفًّا في هذا الصندوق، أو ألصقه. لا خادم لهذا الموقع يُرفَع إليه، فهو يتظاهر فقط — تبقى النتيجة داخل هذه الصفحة ولا مكان آخر.</p><p>المرفق المكتمل يبدو هكذا <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>.</p>',


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
  demo_chars: '{n} حرفًا',
  demo_tree: 'nabi-tree',
  demo_loading: 'جارٍ تحميل المحرّر…',

  page_not_found: 'الصفحة غير موجودة',
  nav_prev: 'المستند السابق',
  nav_next: 'المستند التالي',
}
