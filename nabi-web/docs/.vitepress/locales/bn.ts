// 옮겼다 — 키 하나라도 빠지면 타입 오류라 파일이 통째로 채워져 있어야 한다.
// Translated — a missing key is a type error, so the file must stay filled in whole.
export const bn = {
  title: "NABI NOTE - Nabi Note, একটি ওপেন-সোর্স WYSIWYG সম্পাদক",
  menu_getting_started: "প্রাথমিক ব্যবহার",
  menu_cdn: "CDN ব্যবহার",
  menu_style_guide: "CSS থিম",
  menu_rendering: "SSR সেটআপ",
  menu_compare: "তুলনা",
  menu_merge: "মার্জ",
  menu_extend_guide: "কাস্টম উইং",
  menu_start: "নির্দেশিকা",
  menu_features: "ডানা",
  menu_inline_footnote: "পাদটীকা",
  demo_html_footnote: "<p>WYSIWYG<sup data-nabi-fn=\"WYSIWYG হলো ‘What You See Is What You Get’-এর সংক্ষিপ্ত রূপ: সম্পাদনার সময় যেমন দেখা যায়, ফলও তেমন হয়।\">[1]</sup></p>",
  label: 'বাংলা',
  lang: 'bn',
  link: '/bn/',
  description: 'NABI NOTE — একটি ওপেন-সোর্স WYSIWYG সম্পাদক।',

  menu_docs: 'নথি',
  menu_style: 'শৈলী',
  menu_addons: 'অতিরিক্ত সুবিধা',
  menu_icon_theme: "আইকন থিম",
  menu_intro_vibe_coding: 'AI ভাইব কোডিং',



  menu_projects: 'প্রকল্প',

  menu_inline: 'ইনলাইন',
  menu_inline_bold: 'গাঢ়',
  menu_inline_italic: 'তির্যক',
  menu_inline_underline: 'আন্ডারলাইন',
  menu_inline_strikethrough: 'স্ট্রাইকথ্রু',
  menu_inline_superscript: 'সুপারস্ক্রিপ্ট',
  menu_inline_subscript: 'সাবস্ক্রিপ্ট',
  menu_inline_link: 'লিঙ্ক',
  menu_inline_highlight: 'হাইলাইট',
  menu_inline_text_color: 'লেখার রং',

  menu_block: 'ব্লক',
  menu_block_heading: 'শিরোনাম',
  menu_block_bullet_list: 'বুলেট তালিকা',
  menu_block_ordered_list: 'সংখ্যাযুক্ত তালিকা',
  menu_block_task_list: 'চেকলিস্ট',
  menu_block_table: 'টেবিল',
  menu_block_image: 'ছবি',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'কোড',
  menu_block_details: 'বিস্তারিত',
  menu_block_quote: 'উদ্ধৃতি',
  menu_block_divider: 'বিভাজক',

  menu_etc: "সরঞ্জাম",
  menu_etc_align: 'সারিবদ্ধকরণ',
  menu_etc_dropcap: 'ড্রপ ক্যাপ',
  menu_etc_typeface: 'ফন্ট',
  menu_etc_font_size: 'অক্ষরের আকার',
  menu_etc_clear_format: 'ফরম্যাটিং মুছুন',
  menu_etc_upload: 'ফাইল আপলোড করুন',

  search: 'খুঁজুন',
  search_no_results: 'কোনো ফল নেই',
  search_hint: 'অনুগ্রহ করে অনুসন্ধানের শব্দ লিখুন',
  search_move: 'সরান',
  search_open: 'খুলুন',
  search_close: 'বন্ধ করুন',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: "<p data-nabi-align=\"c\"></p><div data-nabi-p data-nabi-align=\"c\"><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p data-nabi-align=\"c\"><span data-nabi-size=\"xl\"><b>NABI NOTE</b></span></p><p data-nabi-align=\"c\"><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\">একটি মুক্ত-উৎস WYSIWYG</span></i></span><sup data-nabi-fn=\"WYSIWYG হলো ‘What You See Is What You Get’-এর সংক্ষিপ্ত রূপ: সম্পাদনার সময় যেমন দেখা যায়, ফলও তেমন হয়।\">[1]</sup><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\"> সম্পাদক</span></i></span></p><p></p><p data-nabi-dropcap=\"1\"><span data-nabi-typeface=\"serif\"><b>NABI NOTE</b> একটি মুক্ত-উৎস WYSIWYG সম্পাদক, যেখানে বিন্যাস, সারিবদ্ধতা, সারণি ও আপলোডের মতো সুবিধাগুলো মূল অংশ থেকে আলাদা করে «wing» নামের স্বাধীন মডিউলে রাখা হয়েছে। প্রয়োজনীয় উইং বেছে সম্পাদক তৈরি করতে পারেন এবং নিজের তৈরি উইংও যুক্ত করতে পারেন। এটি বিশুদ্ধ JavaScript-এ লেখা, তাই React বা Vue-এর মতো ফ্রেমওয়ার্কেও ব্যবহার করা যায়। বিল্ডের ব্যবস্থা নেই এমন পৃষ্ঠায় <b>CDN লাইব্রেরি</b> দিয়ে সরাসরি শুরু করা যায়। এর নিজস্ব নথির বিন্যাস <b>NABI TREE</b> ব্রাউজারের DOM ছাড়াও Node.js-এ HTML-এ রূপান্তর করা যায়। ইনপুট নথি নিবন্ধিত নিয়ম অনুযায়ী স্বাভাবিক করা হয়; HTML তৈরির সময় লেখা ও বৈশিষ্ট্যের বিশেষ অক্ষর এস্কেপ করা হয় এবং লিঙ্কের ঠিকানা পরীক্ষা করা হয়। তবে নিজের তৈরি উইং ও সার্ভার থেকে পাওয়া তথ্য অ্যাপ্লিকেশনের নিরাপত্তানীতি অনুযায়ী আলাদা করে পর্যালোচনা করতে হবে। CSS ভেরিয়েবল ও rem-ভিত্তিক বিন্যাস দিয়ে থিম ও আকার বদলানো যায়; ডার্ক মোড ও বিভিন্ন ভাষার জন্য টাইপফেসের সেটিংও রয়েছে। সারণি সাজানো, স্থানীয় ইতিহাস এবং AI-এর সাহায্যে নথির কাজও একই নথি মডেলের ওপর চলে।</span></p><p></p><h2>হরফ</h2><p>স্যান্স সেরিফ (ডিফল্ট), সেরিফ, মনোস্পেস ও হস্তলিপির জন্য ভাষা অনুযায়ী বিকল্প ফন্ট রয়েছে। বেছে নেওয়া ধরনের উপযুক্ত ফন্ট না থাকলে ব্রাউজারের ডিফল্ট ফন্ট দেখানো হয়। <b>সম্পাদকের ডিফল্ট ফন্ট হোস্ট পৃষ্ঠা নির্ধারণ করে।</b></p><p></p><p>নিচে প্রতিটি পরিবার <b>নানা ভাষায়</b> দেখানো হলো।</p><p></p><p><span data-nabi-typeface=\"sans\"><span data-nabi-size=\"lg\">산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie</span></span></p><p></p><p><span data-nabi-typeface=\"serif\"><span data-nabi-size=\"lg\">세리프 · 明朝体 · 衬线 · Serif · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie</span></span></p><p></p><p><span data-nabi-typeface=\"mono\"><span data-nabi-size=\"lg\">고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace</span></span></p><p></p><p><span data-nabi-typeface=\"cursive\"><span data-nabi-size=\"lg\">필기체 · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</span></span></p><p></p><p></p><h2>লেখার মাপ</h2><p><span data-nabi-size=\"xs\">খুব ছোট</span></p><p><span data-nabi-size=\"sm\">ছোট</span></p><p><span data-nabi-size=\"lg\">বড়</span></p><p><span data-nabi-size=\"xl\">খুব বড়</span></p><p></p><p></p><h2>শিরোনাম</h2><p>খালি লাইনে # লিখে স্পেস চাপুন — সঙ্গে সঙ্গে শিরোনাম হয়ে যায়।</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>মোটা · হেলানো · নিম্নরেখ · কাটা</h2><p><b>মোটা</b> <i>হেলানো</i> <u>নিম্নরেখ</u> <s>কাটা</s> একই অক্ষরে একসঙ্গে প্রয়োগ করা যায়।</p><p><b><i><s><u>একটার উপর আরেকটাও দেওয়া যায়।</u></s></i></b></p><h3>উপরের ও নিচের অঙ্ক</h3><p>ক্ষেত্রফল ৩.৫ মি<sup>2</sup>, আর পাদটীকা এভাবে বসে।<sup>1</sup></p><p>জল হলো H<sub>2</sub>O।</p><p></p><p></p><h2>লেখার রং · হাইলাইটার</h2><p>রংগুলো এমনভাবে বাছা, যাতে উজ্জ্বল আর অন্ধকার দুইয়েই পড়তে আরাম লাগে।</p><p>লেখার রং <span data-color=\"green\">সবুজ</span> · <span data-color=\"coral\">প্রবাল</span> · <span data-color=\"violet\">বেগুনি</span> · <span data-color=\"amber\">অ্যাম্বার</span> · <span data-color=\"blue\">নীল</span></p><p>হাইলাইটার <mark data-color=\"yellow\">হলুদ</mark> · <mark data-color=\"green\">সবুজ</mark> · <mark data-color=\"cyan\">আকাশি</mark> · <mark data-color=\"pink\">গোলাপি</mark> · <mark data-color=\"purple\">বেগুনি</mark> · <mark data-color=\"orange\">কমলা</mark></p><p></p><p></p><h2>সংযোগ</h2><p>ঠিকানা বসালেই তা <a href=\"https://nabi.saro.me/\">সংযোগ</a> হয়ে যায়।</p><p>http:// ও https:// ঠিকানার পাশাপাশি . বা / দিয়ে শুরু হওয়া একই সাইটের পথও ব্যবহার করা যায়। javascript:-এর মতো ঠিকানা অনুমোদিত নয়।</p><p>যেমন <a href=\"https://nabi.saro.me/\">https://nabi.saro.me</a> লিখে স্পেস বা এন্টার চাপুন — নিজে থেকেই বদলে যায়, যেমনটা এখানে দেখা যাচ্ছে।</p><h3>লিঙ্ক খোলা</h3><p>নথিতে শুধু লিঙ্কের ঠিকানা সংরক্ষিত হয়; লিঙ্ক কীভাবে খুলবে, তা নথি দেখানো পৃষ্ঠা নির্ধারণ করে।</p><h3>সংযুক্তির সংযোগ</h3><p>ছবি ছাড়া অন্য ফাইলগুলো নিচের মতো সংযুক্তির লিংক হিসেবে থাকে।</p><p><a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>সংযুক্তি</a>-এর লিংক নথিতে সংরক্ষিত হয়।</p><p></p><p></p><h2>সারিবদ্ধতা</h2><p>বাঁয়ে</p><p data-nabi-align=\"c\">মাঝে</p><p data-nabi-align=\"r\">ডানে</p><h3>শিরোনামে সারিবদ্ধকরণ প্রয়োগ করা যায় না।</h3><p></p><p></p><h2>তালিকা</h2><h3>বিন্দু-তালিকা</h3><p>খালি লাইনে - লিখে <b>স্পেস</b> চাপুন — সঙ্গে সঙ্গে বিন্দু-তালিকা হয়ে যায়।</p><div data-nabi-p><ul><li><p>এটি একটি বিন্দু</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab দিয়ে ভিতরে আর বাইরে নেওয়া যায়।</p></li></ul></div></li></ul></div><h3>সংখ্যা-তালিকা</h3><p>খালি লাইনে 1. লিখে <b>স্পেস</b> চাপুন — সংখ্যা-তালিকা হয়ে যায়।</p><div data-nabi-p><ol><li><p>প্রথম</p></li><li><p>দ্বিতীয়</p></li><li><p>তৃতীয়</p></li></ol></div><h3>চেক-তালিকা</h3><p>খালি লাইনে [ ] বা [x] লিখে <b>স্পেস</b> চাপুন — চেক-তালিকা হয়ে যায়।</p><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>এই কাজটি হয়ে গেছে।</p></li><li data-nabi-checked=\"false\"><p>এটি এখনো বাকি।</p></li></ul></div><p></p><p></p><h2>সারণি</h2><p>ঘরে একাধিক অনুচ্ছেদ ও ব্লক রাখা যায়, আর পটভূমির রঙ দিয়ে বিষয়বস্তু আলাদা করা যায়। নিচের সারণির লেখা ও ছবি সরাসরি সম্পাদনা করে দেখুন।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>উপকরণ</p></th><th data-nabi-cell-color=\"cyan\"><p>কাজের নোট</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">একই ঘরে ছবি ও তার বিবরণ রয়েছে।</p></td><td data-nabi-cell-color=\"yellow\"><h3>স্বাধীনভাবে অনুচ্ছেদ সাজান</h3><p>নতুন অনুচ্ছেদের জন্য Enter, আর একই অনুচ্ছেদে নতুন লাইনের জন্য Shift+Enter চাপুন।</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>ঘরের পটভূমির রঙ বদলানো</p></li><li data-nabi-checked=\"false\"><p>তালিকায় Tab দিয়ে ইন্ডেন্ট করা</p></li><li data-nabi-checked=\"false\"><p>একাধিক ঘর বেছে একই রঙ প্রয়োগ করা</p></li></ul></div></td><td><div data-nabi-p><details open><summary>সম্পাদনার পরামর্শ দেখতে ক্লিক করুন</summary><p>ঘরের মধ্যে ভাঁজযোগ্য ব্লক, উদ্ধৃতি, কোড ও ভিডিওও রাখা যায়।</p><p>ঘর একত্র করলে প্রতিটি ঘরের বিষয়বস্তু ক্রমানুসারে থাকে।</p></details></div></td></tr></table></div></div><p>ঘরের ভিতরে ক্লিক করলে পটভূমির রঙ এবং সারি ও কলামের সরঞ্জাম দেখা যায়। একাধিক ঘর বেছে রঙ ও সারিবিন্যাস একসঙ্গে বদলাতে পারেন। পুরো সারণির অবস্থান বদলাতে “পুরো সারণি নির্বাচন করুন” বেছে সারিবিন্যাসের সরঞ্জাম ব্যবহার করুন।</p><p>রঙ বা একাধিক ব্লকসহ সারণি Markdown-এ সংরক্ষণ করলেও HTML হিসেবে রাখা হয়।</p><h3>ঘরের পটভূমির রঙ</h3><p>সমর্থিত সব পটভূমির রঙ এখানে রয়েছে। রঙ বদলাতে ঘরে ক্লিক করুন, অথবা বৈশিষ্ট্যের সরঞ্জামে “ডিফল্ট” বেছে পটভূমি মুছুন।</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-table-full><tr><td data-nabi-cell-color=\"yellow\"><p data-nabi-align=\"c\"><b>হলুদ</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">yellow</span></p></td><td data-nabi-cell-color=\"green\"><p data-nabi-align=\"c\"><b>সবুজ</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">green</span></p></td><td data-nabi-cell-color=\"cyan\"><p data-nabi-align=\"c\"><b>আকাশি</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">cyan</span></p></td></tr><tr><td data-nabi-cell-color=\"pink\"><p data-nabi-align=\"c\"><b>গোলাপি</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">pink</span></p></td><td data-nabi-cell-color=\"purple\"><p data-nabi-align=\"c\"><b>বেগুনি</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">purple</span></p></td><td data-nabi-cell-color=\"orange\"><p data-nabi-align=\"c\"><b>কমলা</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">orange</span></p></td></tr></table></div></div><h3>স্তম্ভ সাজানো</h3><p><b>ঝলক</b> চাপুন, তারপর <b>মজুত</b> আর <b>দাম</b>-এর শিরোনামে একে একে ক্লিক করুন।</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>মডেল</p></th><th><p>মজুত</p></th><th><p>দাম</p></th><th><p>ওজন</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>ঠিক হয়নি</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>দাম</b> কলামের সব মান সংখ্যা, তাই এটি সংখ্যার মান অনুযায়ী সাজানো হয়।</p><p><b>মজুত</b> কলামে সংখ্যা ও লেখা দুটোই আছে, তাই এটি পাঠ্য স্ট্রিং অনুযায়ী সাজানো হয়।</p><p></p><p></p><h2>বিভাজক রেখা</h2><p>--- লিখে এন্টার চাপুন — বিভাজক রেখা হয়ে যায়।</p><div data-nabi-p><hr/></div><p></p><p></p><h2>ছবি</h2><p>প্রস্থ ৩০% থেকে ১০০% পর্যন্ত বদলানো যায় আর সেটি বাঁয়ে, মাঝে বা ডানে বসে।</p><div data-nabi-p><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p></p><p></p><h2>ভাসমান অঞ্চল</h2><div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>এক নজরে</b></p><p>লেখা, ছবি ও সারণির জন্য ছোট সহায়ক অঞ্চল।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>অবস্থান</p></td><td><p>ডান</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>সর্বোচ্চ প্রস্থ</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>মূল লেখার পাশে বাড়তি ব্যাখ্যা বা ছোট উপকরণ রাখতে ভাসমান অঞ্চল ব্যবহার করুন। চওড়া নথিতে এই লেখা অঞ্চলের পাশ দিয়ে প্রবাহিত হয়। ভিতরে ক্লিক করে একই সম্পাদকে লেখা বদলান এবং ছবি বা সারণি যোগ করুন।</p><p>বৈশিষ্ট্যের সরঞ্জাম খুলতে অঞ্চলে কার্সর রাখুন। বাম বা ডান অবস্থান বদলান এবং লেখার সঙ্গে মানানসই সর্বোচ্চ প্রস্থ 20, 30, 40 বা 50% বেছে নিন। পেস্ট করা সারণি ও ছবিও অঞ্চলের মধ্যে থাকে।</p><p>নির্বাচিত অনুচ্ছেদগুলোকেও একটি অঞ্চলে মুড়ে রাখতে পারেন। প্রস্থের পাশের অঞ্চল খোলার বোতাম বিষয়বস্তু মূল নথিতে রেখে দেয়। পূর্বরূপে সম্পাদনার বিন্দুযুক্ত রেখা লুকানো থাকে; সরু নথি বা মুদ্রণে সবকিছু এক কলামে চলে।</p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src=\"https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk\" title=\"YouTube\" allowfullscreen loading=\"lazy\" data-nabi-width=\"70\"></iframe></div><p></p><p></p><h2>আপলোড</h2><p>কোনো ছবি বা ফাইল সম্পাদকের উপর টেনে আনুন।</p><p>এই ডেমো প্রকৃত সার্ভারে ফাইল পাঠায় না। সার্ভারে সংরক্ষণ করতে আপনার অ্যাপ্লিকেশনে আপলোডার যুক্ত করুন।</p><p>ছবি বাছাইয়ের জানালা খোলা বা আপলোড শুরু করার পর শুধু কার্সর সরালে আগের অবস্থানেই সংযোজন হয়। অপেক্ষার সময় নথি সম্পাদনা করলে সংযোজন বাতিল হয় এবং বার্তা দেখায়। ঘরে শুরু করা আপলোডের অগ্রগতি ও ফলাফলও সেই ঘরে থাকে।</p><p></p><p></p><h2>উদ্ধৃতি</h2><div data-nabi-p><blockquote><p>খালি লাইনে &gt; লিখে <b>স্পেস</b> চাপুন — উদ্ধৃতির বাক্স হয়ে যায়।</p><p>এটি কয়েক লাইন জুড়েও চলতে পারে।</p></blockquote></div><p></p><p></p><h2>কোড</h2><p>খালি লাইনে ``` লিখে <b>স্পেস বা এন্টার</b> চাপুন — কোডের বাক্স হয়ে যায়।</p><p>ভাষাটাও সঙ্গে লিখুন, যেমন ```java, তারপর স্পেস বা এন্টার — বাক্সে সেই ভাষা বসে যায়।</p><div data-nabi-p><pre data-nabi-lang=\"typescript\"><code class=\"language-typescript\">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>ভাঁজ</h2><div data-nabi-p><details open><summary>ভাঁজ তৈরি হয় শিরোনাম আর ভিতরের লেখা দিয়ে।</summary><p>এটি বন্ধ অবস্থায় সংরক্ষিত হবে না খোলা অবস্থায়, তা আপনি ঠিক করতে পারেন।</p></details></div><p></p><h2></h2><h2>টুলবার</h2><p>শিরোনাম, লেখার বিন্যাস, সারিবিন্যাস, তালিকা, সন্নিবেশ ও নথির সরঞ্জাম দলবদ্ধ করা হয়েছে। কম্পিউটারে সরঞ্জামগুলো খোলা থাকে; মোবাইলে দ্রুত সরঞ্জাম ও পূর্ণ প্যালেট পাওয়া যায়। নির্বাচিত সারণি বা ভাসমান অঞ্চলের বৈশিষ্ট্য নিচে দেখা যায়।</p><p></p><h2>শর্টকাট</h2><p><b>দ্রুত দুবার Shift চাপুন</b> এবং কীবোর্ড দিয়ে সরঞ্জাম বেছে নিন। কম্পিউটারে খোলা টুলবারে আর মোবাইলে পূর্ণ প্যালেটে ঘুরুন। Tab দিয়ে দল বদলান, তীরচিহ্নের কী দিয়ে সরঞ্জাম বাছুন এবং Enter দিয়ে চালান।</p><p>উদ্ধৃতি, কোড বা ভাঁজযোগ্য ব্লকের শেষে দ্রুত দুবার Enter চাপলে বাইরে আসা যায়। দুবার চাপার ডিফল্ট ব্যবধান 180ms।</p><p></p><p></p><h2>স্বয়ংক্রিয় সাজ</h2><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>উদাহরণ</p></th><th><p>কী</p></th><th><p>ফল</p></th></tr><tr><td><p>#</p></td><td><p>স্পেস</p></td><td><p>শিরোনাম</p></td></tr><tr><td><p>-</p></td><td><p>স্পেস</p></td><td><p>বিন্দু-তালিকা</p></td></tr><tr><td><p>1.</p></td><td><p>স্পেস</p></td><td><p>সংখ্যা-তালিকা</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>স্পেস</p></td><td><p>চেক-তালিকা</p></td></tr><tr><td><p>&gt;</p></td><td><p>স্পেস</p></td><td><p>উদ্ধৃতি</p></td></tr><tr><td><p>``` · ```ts</p></td><td><p>স্পেস · এন্টার</p></td><td><p>কোডের বাক্স</p></td></tr><tr><td><p>---</p></td><td><p>এন্টার</p></td><td><p>বিভাজক রেখা</p></td></tr><tr><td><p>https://…</p></td><td><p>স্পেস · এন্টার</p></td><td><p>সংযোগ</p></td></tr></table></div></div><p></p><p></p><h3>নির্গম ফাংশন</h3><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>ফাংশন</p></th><th><p>ফল</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>DOM ছাড়াও চলে</h2><p>NABI TREE থেকে HTML বানাতে <b>DOM লাগে না</b>।</p><p>সার্ভারেও (Node.js) সংরক্ষিত NABI TREE পড়ে একই নিয়মে HTML তৈরি করা যায়।</p><p></p><h2>মোবাইলের বন্ধু</h2><div data-nabi-p><ul><li><p><b>মোবাইল UI</b> — স্ক্রিনের প্রস্থ অনুযায়ী সম্পাদনার টুল সাজায়।</p></li><li><p><b>মোবাইল কীবোর্ড সমন্বয়</b> — কীবোর্ড খুললে সম্পাদনার অংশের উচ্চতা সমন্বয় করে।</p></li><li><p><b>নমনীয় আকার</b> — বড় ও ছোট করে দেখার সঙ্গে মানিয়ে নিতে মূল লেআউটে rem একক ব্যবহার করে।</p></li><li><p><b>একাধিক ভাষা</b> — ভাষা এবং লেখার দিক অনুযায়ী লোকেল ও টাইপফেস সেট করা যায়।</p></li></ul></div><p></p><h2>নিজের মতো করে</h2><div data-nabi-p><ul><li><p><b>নিজের wing</b> — কোনো সুবিধা দরকার হলে নিজে তৈরি করে যুক্ত করতে পারেন।</p></li><li><p><b>নিজের CSS</b> — প্রধান রঙ, কোণ ও ফাঁক --nabi-* টোকেন দিয়ে হালকা ও গাঢ় মোডের উপযোগী করতে পারেন।</p></li><li><p><b>মুক্ত উৎস</b> — GitHub-এ সোর্স কোড প্রকাশ করে একসঙ্গে উন্নয়ন করা হয়।</p></li></ul></div><div data-nabi-p><hr/></div><p>নথিপত্র দেখুন → <a href=\"https://nabi.saro.me/\">nabi.saro.me</a></p><section data-nabi-footnotes><ol><li data-nabi-fn-n=\"1\"><span data-nabi-fn-num>[1]</span> WYSIWYG হলো ‘What You See Is What You Get’-এর সংক্ষিপ্ত রূপ: সম্পাদনার সময় যেমন দেখা যায়, ফলও তেমন হয়।</li></ol></section>",
  demo_wings: 'ডানা',
  demo_wings_all: 'সব চালু',
  demo_wings_none: 'সব বন্ধ',
  demo_zoom: 'জুম',
  demo_zoom_out: 'ছোট করুন',
  demo_zoom_in: 'বড় করুন',
  demo_zoom_reset: 'আগের মতো',
  demo_sticky: 'টুলবার আটকানো',
  demo_sticky_keyboard: 'মোবাইল কীবোর্ড ইনসেট',
  demo_sticky_height: 'উচ্চতা',
  demo_sticky_unit: 'উচ্চতার একক',
  demo_typeface_base: 'ডিফল্ট ফন্ট',
  demo_typeface_sans: 'সান্স সেরিফ',
  demo_typeface_serif: 'সেরিফ',
  demo_typeface_mono: 'মনোস্পেস',
  demo_typeface_cursive: 'হস্তলিপি',
  demo_html_small: '<p>এখানে লিখুন, আর উপরের wing চালু-বন্ধ করে দেখুন।</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>বাক্যে <b>গুরুত্বপূর্ণ শব্দ</b> চিহ্নিত করুন। লেখা নির্বাচন করে টুলবারের <b>B</b> চাপুন।</p>',
  demo_html_italic:
    "<p>বইয়ের নাম বা বিদেশি শব্দের মতো আলাদা করে দেখাতে চাওয়া লেখাকে <i>তির্যক</i> করতে পারেন। লেখা নির্বাচন করে তির্যক করার বোতাম চাপুন।</p>",
  demo_html_underline:
    '<p>এখানে একটি <u>নিম্নরেখ</u> আছে। অক্ষরগুলো বেছে আবার চাপলে উঠে যায়।</p>',
  demo_html_strikethrough: "<p><s>19,000 KRW</s> 9,900 KRW-এর মতো পুরোনো মান রেখে নতুন মান দেখাতে ব্যবহার করতে পারেন।</p>",
  demo_html_superscript:
    '<p>ক্ষেত্রফল ৩.৫ মি<sup>2</sup>, আর পাদটীকা এভাবে বসে।<sup>1</sup></p>',
  demo_html_subscript: "<p>পানির রাসায়নিক সংকেত H<sub>2</sub>O এবং কার্বন ডাইঅক্সাইডের CO<sub>2</sub>।</p>",
  demo_html_link:
    "<p>ঠিকানা লিখে <a href=\"https://example.com/\">এমন একটি লিঙ্ক</a> বানাতে পারেন। নথিতে শুধু লিঙ্কের ঠিকানা সংরক্ষিত হয়; একই উইন্ডোতে নাকি নতুন উইন্ডোতে খুলবে, তা নথি দেখানো পৃষ্ঠা ঠিক করে।</p>",
  demo_html_highlight:
    '<p>লেখা নির্বাচন করে বোতাম চাপুন — ক্যারেটের পাশে ছয়টি রং ফুটে ওঠে: <mark data-color="yellow">হলুদ</mark>·<mark data-color="green">সবুজ</mark>·<mark data-color="cyan">আকাশি</mark>·<mark data-color="pink">গোলাপি</mark>·<mark data-color="purple">বেগুনি</mark>·<mark data-color="orange">কমলা</mark>।</p><p>ক্যারেট কোনো মার্কের ভিতরে রাখলে প্রসঙ্গ সারিতেও একই নমুনা ফুটে ওঠে, রং বদলাতে।</p>',
  demo_html_text_color:
    '<p>লেখায় পাঁচটি রং বসানো যায় — <span data-color="green">সবুজ</span>·<span data-color="coral">প্রবাল</span>·<span data-color="violet">বেগুনি</span>·<span data-color="amber">অ্যাম্বার</span>·<span data-color="blue">নীল</span>।</p><p><mark data-color="yellow">হাইলাইটের সঙ্গে মিলিয়ে দিলেও</mark> আলাদা মার্ক বলে <span data-color="blue">দুটোই একসঙ্গে বসে।</span></p>',
  demo_html_heading:
    "<h1>সবচেয়ে বড় শিরোনাম</h1><h2>দ্বিতীয় শিরোনাম</h2><h3>তৃতীয় শিরোনাম</h3><p>এটি শিরোনামের নিচের মূল লেখা। ফাঁকা লাইনে # লিখে Space চাপলেও শিরোনাম তৈরি হয়।</p>",
  demo_html_bullet_list:
    '<ul><li>এটি একটি বিন্দু-তালিকা</li><li>Tab দিয়ে ভিতরে, Shift+Tab দিয়ে বাইরে<ul><li>ভিতরের একটি ঘর</li></ul></li></ul><p>খালি লাইনে - আর স্পেস চাপলেও তালিকা হয়ে যায়।</p>',
  demo_html_ordered_list:
    '<ol><li>এটি একটি সংখ্যা-তালিকা</li><li>ঘর বসালে বা মুছলে সংখ্যা নিজে থেকেই সাজে</li></ol><p>খালি লাইনে 1. আর স্পেস চাপলেও তালিকা হয়ে যায়।</p>',
  demo_html_task_list:
    "<ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\">এই কাজটি সম্পন্ন হয়েছে।</li><li data-nabi-checked=\"false\">কাজের আগে থাকা বাক্সে চাপ দিয়ে সম্পন্ন হওয়ার অবস্থা বদলাতে পারেন।</li></ul><p>চেকের অবস্থা নথিতে সংরক্ষিত হয়। ফাঁকা লাইনে [ ] বা [x] লিখে Space চাপলেও কাজের তালিকা তৈরি হয়।</p>",
  demo_html_table:
    "<p>ঘরে একাধিক অনুচ্ছেদ ও ব্লক রাখা যায়, আর পটভূমির রঙ দিয়ে বিষয়বস্তু আলাদা করা যায়। নিচের সারণির লেখা ও ছবি সরাসরি সম্পাদনা করে দেখুন।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>উপকরণ</p></th><th data-nabi-cell-color=\"cyan\"><p>কাজের নোট</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">একই ঘরে ছবি ও তার বিবরণ রয়েছে।</p></td><td data-nabi-cell-color=\"yellow\"><h3>স্বাধীনভাবে অনুচ্ছেদ সাজান</h3><p>নতুন অনুচ্ছেদের জন্য Enter, আর একই অনুচ্ছেদে নতুন লাইনের জন্য Shift+Enter চাপুন।</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>ঘরের পটভূমির রঙ বদলানো</p></li><li data-nabi-checked=\"false\"><p>তালিকায় Tab দিয়ে ইন্ডেন্ট করা</p></li><li data-nabi-checked=\"false\"><p>একাধিক ঘর বেছে একই রঙ প্রয়োগ করা</p></li></ul></div></td><td><div data-nabi-p><details open><summary>সম্পাদনার পরামর্শ দেখতে ক্লিক করুন</summary><p>ঘরের মধ্যে ভাঁজযোগ্য ব্লক, উদ্ধৃতি, কোড ও ভিডিওও রাখা যায়।</p><p>ঘর একত্র করলে প্রতিটি ঘরের বিষয়বস্তু ক্রমানুসারে থাকে।</p></details></div></td></tr></table></div></div><p>ঘরের ভিতরে ক্লিক করলে পটভূমির রঙ এবং সারি ও কলামের সরঞ্জাম দেখা যায়। একাধিক ঘর বেছে রঙ ও সারিবিন্যাস একসঙ্গে বদলাতে পারেন। পুরো সারণির অবস্থান বদলাতে “পুরো সারণি নির্বাচন করুন” বেছে সারিবিন্যাসের সরঞ্জাম ব্যবহার করুন।</p><p>সাধারণ অনুচ্ছেদে Tab পরের ঘরে যায়; তালিকা ও কোডে ইন্ডেন্ট করে। বিষয়বস্তু বা বিন্যাস মুছলেও ঘরের পটভূমি থাকে।</p>",
  demo_html_image:
    "<div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"50\"/></div><p>ছবি নির্বাচন করে তার প্রদর্শিত আকার বদলাতে এবং বামে, মাঝখানে বা ডানে সাজাতে পারেন।</p>",
  demo_html_youtube:
    '<p>টুলবারের YouTube বোতাম চাপুন, বা ভিডিওর ঠিকানা সরাসরি বসিয়ে দিন — এই জায়গাতেই ভিডিওটি বসে যাবে।</p>',
  demo_html_code:
    "<div data-nabi-p><pre data-nabi-lang=\"ts\"><code class=\"language-ts\">function sum(numbers: number[]) {<br/>  return numbers.reduce((a, b) =&gt; a + b, 0)<br/>}</code></pre></div><p>কোড ব্লকে কার্সর রাখলে প্রসঙ্গভিত্তিক সরঞ্জাম থেকে ভাষা বেছে নিতে পারেন। কয়েকটি লাইন নির্বাচন করে Tab চাপলে একসঙ্গে ইন্ডেন্ট বাড়ে, Shift+Tab চাপলে কমে।</p>",
  demo_html_details:
    "<details open><summary>বিষয়বস্তু গুটিয়ে রাখতে বা খুলতে শিরোনামে চাপুন।</summary><p>শুরুতে বিষয়বস্তু খোলা থাকবে নাকি গোটানো থাকবে, তাও নথিতে সংরক্ষিত হয়।</p></details>",
  demo_html_quote:
    '<blockquote><p>অন্যের লেখা থেকে একটি বাক্য, বা আলাদা করে দেখাতে চাওয়া বিষয়, উদ্ধৃতি হিসেবে একসঙ্গে রাখা যায়।</p><p>উদ্ধৃতির মধ্যে একাধিক অনুচ্ছেদ ও ব্লক থাকতে পারে।</p></blockquote><p>খালি লাইনে &gt; আর স্পেস চাপলে সেই লাইন উদ্ধৃতি হয়ে যায়।</p>',
  demo_html_divider:
    "<p>প্রথম অংশ শেষ করার অনুচ্ছেদ।</p><hr><p>বিভাজকের নিচে নতুন বিষয়বস্তু শুরু করতে পারেন। ফাঁকা লাইনে --- লিখে Enter চাপলেও বিভাজক তৈরি হয়।</p>",
  demo_html_align:
    "<p data-nabi-align=\"l\">বাম সারিবিন্যাস সাধারণ মূল লেখার জন্য উপযুক্ত।</p><p data-nabi-align=\"c\">কেন্দ্র সারিবিন্যাস ছোট শিরোনাম বা বিজ্ঞপ্তিতে ব্যবহার করা যায়।</p><p data-nabi-align=\"r\">ডান সারিবিন্যাস তারিখ বা স্বাক্ষরের মতো ডান দিকে রাখার বিষয়বস্তুতে ব্যবহার করা যায়।</p>",
  demo_html_font_size:
    '<p data-nabi-size="xs">খুব ছোট — পাদটীকা আর সহায়ক নোটের জন্য।</p><p data-nabi-size="sm">ছোট — মূল লেখার থেকে এক ধাপ ছোট।</p><p>ডিফল্ট মাপের অনুচ্ছেদ। মাপের মেনুতেও প্রতিটি লেখার মাপ যেমন দেখা যাবে তেমনই দেখায়।</p><p data-nabi-size="lg">বড় — জোর দেওয়া বাক্যের জন্য।</p><p data-nabi-size="xl">খুব বড় — শিরোনামের নিচের ভূমিকা-বাক্যের জন্য।</p><p>অক্ষরের মাপ নির্বাচিত অংশে বসে। শুধু ক্যারেট থাকলে, তা বর্তমান অনুচ্ছেদের লেখায় বসে।</p>',
  demo_html_typeface:
    "<p>এই অনুচ্ছেদের জন্য আলাদা টাইপফেস নির্ধারণ করা হয়নি। এটি পৃষ্ঠার ডিফল্ট টাইপফেসে দেখা যায়।</p><p data-nabi-typeface=\"serif\">এই অনুচ্ছেদে সেরিফ টাইপফেস প্রয়োগ করা হয়েছে। serif-এর মতো পরিবার বেছে নিলে আসল ফন্ট সাইটের CSS সেটিং অনুসরণ করে।</p><p data-nabi-typeface=\"mono\">এই অনুচ্ছেদে মনোস্পেস টাইপফেস প্রয়োগ করা হয়েছে। অক্ষরের প্রস্থ সমান বলে সংখ্যা বা কোড সারিবদ্ধ রাখা সহজ — 0O 1lI</p><p data-nabi-typeface=\"cursive\">হস্তলিপি · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षর · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</p>",
  demo_html_dropcap:
    "<p data-nabi-dropcap=\"1\">অনুচ্ছেদের প্রথম অক্ষর বড় করে দেখায় এবং বাকি লেখা তার পাশে প্রবাহিত হয়। সম্পাদনার সময় প্রথম অক্ষর একটি বাস্তব উপাদানে মোড়ানো থাকে, যাতে কার্সরের অবস্থান সঠিক থাকে।</p><p>এই অনুচ্ছেদে ড্রপ ক্যাপ প্রয়োগ করা হয়নি।</p>",
  demo_html_clear_format:
    '<p><b>মোটা</b>·<i>হেলানো</i>·<u>নিম্নরেখ</u>·<s>কাটা</s> — এমন লেখা বেছে মোছার বোতাম চাপুন।</p><p>কেবল লেখার সাজ মোছে — ব্লক ঠিক আগের মতোই থাকে।</p>',
  demo_html_upload:
    '<p>এই বাক্সে ফাইল টেনে আনুন, বা পেস্ট করুন। এই সাইটে আপলোডের কোনো সার্ভার নেই বলে শুধু ভান করে — ফল থাকে কেবল এই পাতাতেই।</p><p>আপলোড শেষ হলে সংযুক্তি দেখা যায় এভাবে — <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">সংযুক্ত ফাইল</a>।</p>',


  cdn_demo_lead: 'নিচের কোডটি {file} নামে সংরক্ষণ করে ব্রাউজারে খুললেই সঙ্গে সঙ্গে দেখা যায়।',
  cdn_demo_download: 'demo.html ডাউনলোড করুন',
  cdn_code_minheight: "এই উদাহরণে সম্পাদক ব্রাউজারের পুরো উচ্চতা জুড়ে থাকে। আপনার সাইটের বিন্যাস অনুযায়ী উচ্চতা ঠিক করুন।",
  cdn_code_wings: "এই উদাহরণে ব্যবহারের জন্য সম্পাদনা ও ফাইলের উইং বেছে নিন।",
  cdn_code_faces:
    "এই উদাহরণে শুধু স্যান্স সেরিফ ও সেরিফ ফন্ট লোড করা হয়।\nমনোস্পেস বা হস্তলিপি ব্যবহার করতে সংশ্লিষ্ট ফন্ট ফাইলও পৃষ্ঠায় লোড করুন।\nবিস্তারিত জানতে “টাইপফেস” নথি দেখুন।",
  cdn_code_change: "এই উদাহরণে নথি বদলালে সংরক্ষণের কাজ নির্ধারণ করা হয়।",
  code_copy: 'কোড কপি করুন',
  demo_install: 'ইনস্টল',
  demo_code: 'কোড',
  demo_tree: 'nabi-tree',
  demo_loading: 'সম্পাদক লোড হচ্ছে…',

  page_not_found: 'পাতা পাওয়া যায়নি',

  demo_html_float: "<div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>এক নজরে</b></p><p>লেখা, ছবি ও সারণির জন্য ছোট সহায়ক অঞ্চল।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>অবস্থান</p></td><td><p>ডান</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>সর্বোচ্চ প্রস্থ</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>মূল লেখার পাশে বাড়তি ব্যাখ্যা বা ছোট উপকরণ রাখতে ভাসমান অঞ্চল ব্যবহার করুন। চওড়া নথিতে এই লেখা অঞ্চলের পাশ দিয়ে প্রবাহিত হয়। ভিতরে ক্লিক করে একই সম্পাদকে লেখা বদলান এবং ছবি বা সারণি যোগ করুন।</p><p>বৈশিষ্ট্যের সরঞ্জাম খুলতে অঞ্চলে কার্সর রাখুন। বাম বা ডান অবস্থান বদলান এবং লেখার সঙ্গে মানানসই সর্বোচ্চ প্রস্থ 20, 30, 40 বা 50% বেছে নিন। পেস্ট করা সারণি ও ছবিও অঞ্চলের মধ্যে থাকে।</p><p>নির্বাচিত অনুচ্ছেদগুলোকেও একটি অঞ্চলে মুড়ে রাখতে পারেন। প্রস্থের পাশের অঞ্চল খোলার বোতাম বিষয়বস্তু মূল নথিতে রেখে দেয়। পূর্বরূপে সম্পাদনার বিন্দুযুক্ত রেখা লুকানো থাকে; সরু নথি বা মুদ্রণে সবকিছু এক কলামে চলে।</p>",
  menu_block_float: "ভাসমান অঞ্চল",
}
