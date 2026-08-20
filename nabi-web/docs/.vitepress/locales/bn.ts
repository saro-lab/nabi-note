// Translated — every value below is Bengali, and the wing names are the same words their toolbar
// buttons show, so the menu and the editor say one thing.
// 옮겼다 — 아래 값은 모두 벵골어이고, 날개 이름은 그 날개 버튼에 뜨는 낱말 그대로라
// 메뉴와 에디터가 한 말을 한다.
export const bn = {
  label: 'বাংলা',
  lang: 'bn',
  link: '/bn/',
  description: 'NABI NOTE — একটি ওপেন-সোর্স WYSIWYG সম্পাদক।',

  menu_docs: 'নথি',
  menu_intro: 'পরিচয়',
  menu_intro_index: 'NABI NOTE কী?',
  menu_intro_usage: 'প্রাথমিক ব্যবহার',
  menu_intro_ssr: 'SSR সহায়তা',
  menu_intro_cdn: 'CDN দিয়ে ব্যবহার',
  menu_intro_vibe_coding: 'AI ভাইব কোডিং',

  menu_wing: 'ডানা (Wing)',
  menu_wing_custom: 'নিজের ডানা বানানো',
  menu_custom_start: 'শুরু করা',
  menu_custom_inline: 'ইনলাইন মার্ক',
  menu_custom_block: 'ব্লক ও ব্লকের বৈশিষ্ট্য',
  menu_custom_ui: 'UI ও ক্রিয়া',
  menu_custom_input: 'কী · স্বয়ংক্রিয় বিন্যাস · পেস্ট',

  menu_style: 'সাজসজ্জা',
  menu_style_custom: 'স্টাইল বদলানো',

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

  menu_etc: 'অন্যান্য',
  menu_etc_align: 'সারিবদ্ধকরণ',
  menu_etc_dropcap: 'ড্রপ ক্যাপ',
  menu_etc_typeface: 'ফন্ট',
  menu_etc_font_size: 'অক্ষরের আকার',
  menu_etc_clear_format: 'ফরম্যাটিং মুছুন',
  menu_etc_upload: 'ফাইল আপলোড করুন',

  search: 'খুঁজুন',
  search_no_results: 'কোনো ফল নেই',
  search_hint: 'অনুসন্ধানের শব্দ লিখুন',
  search_move: 'সরান',
  search_open: 'খুলুন',
  search_close: 'বন্ধ করুন',

  demo_placeholder: 'এখানে লিখে দেখুন',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">এখন AI দিয়ে ডকুমেন্ট তৈরি ও অনুবাদ করা হচ্ছে।</p><p data-nabi-align="c">থিতু হলে সংস্করণ 1.0.0 হয়ে যাবে।</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">একটি মুক্ত-উৎস WYSIWYG সম্পাদক</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> একটি মুক্ত-উৎস WYSIWYG সম্পাদক, যেখানে প্রধান সব কাজ — সাজসজ্জা, সারিবদ্ধতা, সারণি, আপলোড আর বাকি সবকিছু — «ডানা» নামের আলাদা মডিউল হিসেবে কেন্দ্র থেকে সরিয়ে রাখা, যাতে ডেভেলপার কোনো সীমা ছাড়াই নিজের কাজ যোগ করতে পারেন। এটি খাঁটি Vanilla JS-এ লেখা এবং <b>ফ্রেমওয়ার্কে শূন্য নির্ভরতা</b> লক্ষ্য করে, তাই React-এ, Vue-তে বা যেখানেই হোক একইভাবে বসে যায়, আর বিল্ড-ব্যবস্থা নেই এমন প্রকল্পের জন্য একটি <b>CDN গ্রন্থাগার</b>ও আছে। এর নিজস্ব JSON রূপ <b>NABI TREE</b>, তাই HTML আর লেখার মধ্যেকার রূপান্তর সেখানেও আগেভাগে সেরে রাখা যায় যেখানে DOM নেই (Node.js, SSR); আর নথিকে তালি দেওয়ার বদলে অনুমোদিত শব্দভাণ্ডার থেকে নতুন করে গড়ে তোলা হয় বলে আলাদা কোনো পরিশোধন-গ্রন্থাগার ছাড়াই <b>XSS স্ক্রিপ্ট গোড়াতেই আটকে যায়</b>। নকশায় <b>CSS Variable</b> পদ্ধতি নেওয়া হয়েছে, ফলে ব্র্যান্ডের রং সহজে বদলানো যায়, আর <b>rem-ভিত্তিক বিন্যাসে</b> ছোট-বড় করলেও মোবাইলের চেহারা মসৃণ থাকে; অন্ধকার ও উজ্জ্বল দুইয়ের সঙ্গে মেলানো রং, হাইলাইটার আর বহুভাষিক হরফ আগে থেকেই আছে। এর সঙ্গে আছে <b>ধরন চিনে সারণির স্তম্ভ সাজানো</b>, IndexedDB-র উপর <b>স্থানীয় ইতিহাস</b> এবং <b>ভাইব কোডিং</b>-এর সহায়তা।</span></p><p><br/></p><h2>হরফ</h2><p>পা-হীন (স্বাভাবিক), পা-সহ, সমান-প্রস্থ আর হাতের লেখা — প্রতিটি পরিবারে লিপি অনুযায়ী হরফ সাজানো, তাই যে ভাষাই লিখুন, সেই পরিবারের চেহারা বজায় থাকে; যে লিপির জন্য সেই পরিবারে হাতের লেখা নেই, সেটি ব্রাউজারের স্বাভাবিক হরফে ফিরে যায়। <b>স্বাভাবিক হরফ ঠিক করে আশ্রয়দাতা।</b></p><p><br/></p><p>নিচে প্রতিটি পরিবার <b>নানা ভাষায়</b> দেখানো হলো।</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>লেখার মাপ</h2><p><span data-nabi-size="xs">খুব ছোট</span></p><p><span data-nabi-size="sm">ছোট</span></p><p><span data-nabi-size="lg">বড়</span></p><p><span data-nabi-size="xl">খুব বড়</span></p><p><br/></p><p><br/></p><h2>শিরোনাম</h2><p>খালি লাইনে # লিখে স্পেস চাপুন — সঙ্গে সঙ্গে শিরোনাম হয়ে যায়।</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>মোটা · হেলানো · নিম্নরেখ · কাটা</h2><p><b>মোটা</b> <i>হেলানো</i> <u>নিম্নরেখ</u> <s>কাটা</s> — এই তো উদাহরণ।</p><p><b><i><s><u>একটার উপর আরেকটাও দেওয়া যায়।</u></s></i></b></p><h3>উপরের ও নিচের অঙ্ক</h3><p>ক্ষেত্রফল ৩.৫ মি<sup>2</sup>, আর পাদটীকা এভাবে বসে<sup>1</sup>।</p><p>জল হলো H<sub>2</sub>O।</p><p><br/></p><p><br/></p><h2>লেখার রং · হাইলাইটার</h2><p>রংগুলো এমনভাবে বাছা, যাতে উজ্জ্বল আর অন্ধকার দুইয়েই পড়তে আরাম লাগে।</p><p>লেখার রং <span data-color="green">সবুজ</span> · <span data-color="coral">প্রবাল</span> · <span data-color="violet">বেগুনি</span> · <span data-color="amber">অ্যাম্বার</span> · <span data-color="blue">নীল</span></p><p>হাইলাইটার <mark data-color="yellow">হলুদ</mark> · <mark data-color="green">সবুজ</mark> · <mark data-color="cyan">আকাশি</mark> · <mark data-color="pink">গোলাপি</mark> · <mark data-color="purple">বেগুনি</mark> · <mark data-color="orange">কমলা</mark></p><p><br/></p><p><br/></p><h2>সংযোগ</h2><p>ঠিকানা বসালেই তা <a href="https://nabi.saro.me/">সংযোগ</a> হয়ে যায়।</p><p>ঠিকানায় কেবল http:// আর https:// চলে; javascript:-এর মতো কিছু চলবে না।</p><p>যেমন <a href="https://nabi.saro.me/">https://nabi.saro.me</a> লিখে স্পেস বা এন্টার চাপুন — নিজে থেকেই বদলে যায়, যেমনটা এখানে দেখা যাচ্ছে।</p><h3>target</h3><p>স্বাভাবিকভাবে একই উৎসের সংযোগ এই জানালাতেই আর অন্য সাইট নতুন জানালায় খোলে; সম্পাদক ঘোষণার সময় এই নিয়ম ঠিক করে দেওয়া যায়।</p><h3>সংযুক্তির সংযোগ</h3><p>ছবি ছাড়া অন্য কিছু তুললে নিচের মতো ফাইল-আকৃতির একটি সংযোগ থেকে যায়।</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>সংযুক্তি</a> এইটুকুই থেকে যায়।</p><p><br/></p><p><br/></p><h2>সারিবদ্ধতা</h2><p>বাঁয়ে</p><p>মাঝে</p><p>ডানে</p><h3>শিরোনামও সারিবদ্ধ করা যায়।</h3><p><br/></p><p><br/></p><h2>তালিকা</h2><h3>বিন্দু-তালিকা</h3><p>খালি লাইনে - লিখে <b>স্পেস</b> চাপুন — সঙ্গে সঙ্গে বিন্দু-তালিকা হয়ে যায়।</p><div data-nabi-p><ul><li><p>এটি একটি বিন্দু</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab দিয়ে ভিতরে আর বাইরে নেওয়া যায়।</p></li></ul></div></li></ul></div><h3>সংখ্যা-তালিকা</h3><p>খালি লাইনে 1. লিখে <b>স্পেস</b> চাপুন — সংখ্যা-তালিকা হয়ে যায়।</p><div data-nabi-p><ol><li><p>প্রথম</p></li><li><p>দ্বিতীয়</p></li><li><p>তৃতীয়</p></li></ol></div><h3>চেক-তালিকা</h3><p>খালি লাইনে [ ] বা [x] লিখে <b>স্পেস</b> চাপুন — চেক-তালিকা হয়ে যায়।</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>এই কাজটি হয়ে গেছে।</p></li><li data-nabi-checked="false"><p>এটি এখনো বাকি।</p></li></ul></div><p><br/></p><p><br/></p><h2>সারণি</h2><p>টুলবারের সারণি থেকে বানান; সারি আর স্তম্ভ যোগ, বাদ ও জোড়া দেওয়া যায়।</p><h3>স্তম্ভ সাজানো</h3><p><b>ঝলক</b> চাপুন, তারপর <b>মজুত</b> আর <b>দাম</b>-এর শিরোনামে একে একে ক্লিক করুন।</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>মডেল</p></th><th><p>মজুত</p></th><th><p>দাম</p></th><th><p>ওজন</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>ঠিক হয়নি</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>দাম</b>-এ সবই সংখ্যা, তাই সংখ্যা হিসেবে সাজে।</p><p><b>মজুত</b> লেখা হিসেবে সাজে, কারণ শেষ ঘরে অক্ষর আছে। (এড়াতে চাইলে ঘরটি খালি করে দিন।)</p><p><br/></p><p><br/></p><h2>বিভাজক রেখা</h2><p>--- লিখে এন্টার চাপুন — বিভাজক রেখা হয়ে যায়।</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>ছবি</h2><p>ছবির ঠিকানা বসান বা তুলে দিন; প্রস্থ ৩০% থেকে ১০০% পর্যন্ত বদলানো যায় আর সেটি বাঁয়ে, মাঝে বা ডানে বসে।</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>আপলোড</h2><p>কোনো ছবি বা ফাইল সম্পাদকের উপর টেনে আনুন।</p><p>এখানকার আপলোড কেবল নকল; একটি সেটিংয়েই তা আপনার সার্ভারে জুড়ে যায়।</p><p>আপলোড বিফল হলে সেই ছবি বা ফাইল সম্পাদক থেকে সরিয়ে দেওয়া হয়।</p><p><br/></p><p><br/></p><h2>উদ্ধৃতি</h2><div data-nabi-p><blockquote><p>খালি লাইনে &gt; লিখে <b>স্পেস</b> চাপুন — উদ্ধৃতির বাক্স হয়ে যায়।</p><p>এটি কয়েক লাইন জুড়েও চলতে পারে।</p></blockquote></div><p><br/></p><p><br/></p><h2>কোড</h2><p>খালি লাইনে \`\`\` লিখে <b>স্পেস বা এন্টার</b> চাপুন — কোডের বাক্স হয়ে যায়।</p><p>ভাষাটাও সঙ্গে লিখুন, যেমন \`\`\`java, তারপর স্পেস বা এন্টার — বাক্সে সেই ভাষা বসে যায়।</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>ভাঁজ</h2><div data-nabi-p><details open><summary>ভাঁজ তৈরি হয় শিরোনাম আর ভিতরের লেখা দিয়ে।</summary><p>এটি বন্ধ অবস্থায় সংরক্ষিত হবে না খোলা অবস্থায়, তা আপনি ঠিক করতে পারেন।</p></details></div><p><br/></p><h2>স্থানীয় ইতিহাস</h2><p><b>ব্রাউজারের</b> IndexedDB-র মাধ্যমে ঠিক করে দেওয়া বিরতিতে ইতিহাস রাখা হয়।</p><p>তা কেবল এই যন্ত্রেই থাকে আর যতগুলো ঘোষণা করা, ততগুলোই রাখে। — স্বাভাবিকভাবে প্রতি ৩০ সেকেন্ডে, শেষ ২০টি অধিবেশন।</p><p><br/></p><p><br/></p><h2>শর্টকাট</h2><p><b>Shift দুবার দ্রুত</b> চাপুন — টুলবার প্রতিটি কাজের শর্টকাট দেখিয়ে দেয়।</p><p><br/></p><p><br/></p><h2>স্বয়ংক্রিয় সাজ</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>উদাহরণ</p></th><th><p>কী</p></th><th><p>ফল</p></th></tr><tr><td><p>#</p></td><td><p>স্পেস</p></td><td><p>শিরোনাম</p></td></tr><tr><td><p>-</p></td><td><p>স্পেস</p></td><td><p>বিন্দু-তালিকা</p></td></tr><tr><td><p>1.</p></td><td><p>স্পেস</p></td><td><p>সংখ্যা-তালিকা</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>স্পেস</p></td><td><p>চেক-তালিকা</p></td></tr><tr><td><p>&gt;</p></td><td><p>স্পেস</p></td><td><p>উদ্ধৃতি</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>স্পেস · এন্টার</p></td><td><p>কোডের বাক্স</p></td></tr><tr><td><p>---</p></td><td><p>এন্টার</p></td><td><p>বিভাজক রেখা</p></td></tr><tr><td><p>https://…</p></td><td><p>স্পেস · এন্টার</p></td><td><p>সংযোগ</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>নির্গম ফাংশন</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>ফাংশন</p></th><th><p>ফল</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>DOM ছাড়াও চলে</h2><p>JSON থেকে HTML বানাতে <b>DOM লাগে না</b>।</p><p>সার্ভার (Node.js) সংরক্ষিত নাবি-গাছ যেমন আছে তেমনই পড়ে, XSS ঠেকিয়ে HTML গড়ে তুলতে পারে।</p><p><br/></p><h2>মোবাইলের বন্ধু</h2><div data-nabi-p><ul><li><p><b>মোবাইল চেহারা</b> — সাড়া-দেওয়া বিন্যাস মোবাইলের চেহারা সামলায়।</p></li><li><p><b>কীবোর্ডের সংশোধন</b> — কীবোর্ড উঠলে তার উচ্চতা মিলিয়ে নেওয়া হয়।</p></li><li><p><b>নমনীয় মাপ</b> — সব মাপ rem-এ লেখা।</p></li><li><p><b>বহুভাষিক</b> — এটি চোদ্দোটি ভাষায় কথা বলে।</p></li></ul></div><p><br/></p><h2>নিজের মতো করে</h2><div data-nabi-p><ul><li><p><b>নিজের ডানা</b> — কোনো কাজ দরকার হলে নিজে বানিয়ে জুড়ে দিন।</p></li><li><p><b>নিজের CSS</b> — রং, কোণ আর ফাঁক সবই --nabi-* দিয়ে ঠিক করা, অন্ধকার হোক বা উজ্জ্বল — আপনার ইচ্ছা।</p></li><li><p><b>মুক্ত উৎস</b> — GitHub-এ মুক্ত উৎস হিসেবে দেওয়া।</p></li></ul></div><div data-nabi-p><hr/></div><p>নথিপত্র দেখুন → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
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
    '<p>অচেনা শব্দ বা উদ্ধৃতি <i>হেলানো</i> করে লেখা হয়। এই বাক্যটি বেছে চেপে দেখুন।</p>',
  demo_html_underline:
    '<p>এখানে একটি <u>নিম্নরেখ</u> আছে। অক্ষরগুলো বেছে আবার চাপলে উঠে যায়।</p>',
  demo_html_strikethrough: '<p><s>৳১৯০০</s> ৳৯৯০ — পুরনো দামটাও দেখা থাক এভাবে।</p>',
  demo_html_superscript:
    '<p>ক্ষেত্রফল ৩.৫ মি<sup>2</sup>, আর পাদটীকা এভাবে বসে।<sup>1</sup></p>',
  demo_html_subscript: '<p>জল হলো H<sub>2</sub>O, আর গ্যাসের বুদবুদ CO<sub>2</sub>।</p>',
  demo_html_link:
    '<p>ঠিকানা বসালেই <a href="https://example.com">এমন একটি সংযোগ</a> হয়ে যায়। আগে থেকে থাকা সংযোগে প্রসঙ্গ সারি ওঠে না — ঠিকানা বদলাতে হলে মুছে নতুন করে বানাতে হয়।</p>',
  demo_html_highlight:
    '<p>লেখা নির্বাচন করে বোতাম চাপুন — ক্যারেটের পাশে ছয়টি রং ফুটে ওঠে: <mark data-color="yellow">হলুদ</mark>·<mark data-color="green">সবুজ</mark>·<mark data-color="cyan">আকাশি</mark>·<mark data-color="pink">গোলাপি</mark>·<mark data-color="purple">বেগুনি</mark>·<mark data-color="orange">কমলা</mark>।</p><p>ক্যারেট কোনো মার্কের ভিতরে রাখলে প্রসঙ্গ সারিতেও একই নমুনা ফুটে ওঠে, রং বদলাতে।</p>',
  demo_html_text_color:
    '<p>লেখায় পাঁচটি রং বসানো যায় — <span data-color="green">সবুজ</span>·<span data-color="coral">প্রবাল</span>·<span data-color="violet">বেগুনি</span>·<span data-color="amber">অ্যাম্বার</span>·<span data-color="blue">নীল</span>।</p><p><mark data-color="yellow">হাইলাইটের সঙ্গে মিলিয়ে দিলেও</mark> আলাদা মার্ক বলে <span data-color="blue">দুটোই একসঙ্গে বসে।</span></p>',
  demo_html_heading:
    '<h1>শিরোনাম ১</h1><h2>শিরোনাম ২</h2><h3>শিরোনাম ৩</h3><p>মূল লেখা। খালি লাইনে # আর স্পেস চাপলেও শিরোনাম হয়ে যায়।</p>',
  demo_html_bullet_list:
    '<ul><li>এটি একটি বিন্দু-তালিকা</li><li>Tab দিয়ে ভিতরে, Shift+Tab দিয়ে বাইরে<ul><li>ভিতরের একটি ঘর</li></ul></li></ul><p>খালি লাইনে - আর স্পেস চাপলেও তালিকা হয়ে যায়।</p>',
  demo_html_ordered_list:
    '<ol><li>এটি একটি সংখ্যা-তালিকা</li><li>ঘর বসালে বা মুছলে সংখ্যা নিজে থেকেই সাজে</li></ol><p>খালি লাইনে 1. আর স্পেস চাপলেও তালিকা হয়ে যায়।</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">লেখার সামনের বাক্সে চাপুন — টিক পড়ে যায়</li><li data-nabi-checked="false">টিকের অবস্থা নথির সঙ্গেই সংরক্ষিত থাকে</li></ul><p>খালি লাইনে [ ] বা [x] লিখলেও তালিকা হয়ে যায়।</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>কী</th><th>কী করে</th></tr><tr><td>Tab</td><td>পরের ঘরে যায়</td></tr><tr><td>তীর চিহ্ন</td><td>ছক ধরে সরে</td></tr></tbody></table><p>ক্যারেট কোনো ঘরে রাখলে প্রসঙ্গ সারিতে সারি ও স্তম্ভের কমান্ড ফুটে ওঠে।</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="নাবি নোট লোগো" data-nabi-width="50"></div><p>ছবিতে ক্লিক করলে প্রস্থ আর সারিবদ্ধতার বাক্স খোলে।</p>',
  demo_html_youtube:
    '<p>টুলবারের YouTube বোতাম চাপুন, বা ভিডিওর ঠিকানা সরাসরি বসিয়ে দিন — এই জায়গাতেই ভিডিওটি বসে যাবে।</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>কোডের ভিতরে ক্যারেট রাখলে প্রসঙ্গ সারিতে ভাষার বাক্স ফুটে ওঠে।</p>',
  demo_html_details:
    '<details open=""><summary>এখানে চাপলে ভাঁজ হয়</summary><p>ভাঁজের অবস্থা নথির সঙ্গেই সংরক্ষিত থাকে — লেখক যেমন রেখে গেছেন, পাঠক তেমনই দেখেন।</p></details>',
  demo_html_quote:
    '<blockquote><p>অন্যের কথা রাখার বাক্স। এর ভিতরে কেবল লেখার সাজ চলে — ছবি, কোড আর সারণির বোতাম ফোটে না।</p></blockquote><p>খালি লাইনে &gt; আর স্পেস চাপলে সেই লাইন উদ্ধৃতি হয়ে যায়।</p>',
  demo_html_divider:
    '<p>বিভাজক রেখার উপরের অনুচ্ছেদ।</p><hr><p>নিচেরটি। খালি লাইনে শুধু --- লিখে Enter চাপলেও রেখা বসে।</p>',
  demo_html_align:
    '<p data-nabi-align="l">বাঁয়ে সারিবদ্ধ</p><p data-nabi-align="c">মাঝে সারিবদ্ধ</p><p data-nabi-align="r">ডানে সারিবদ্ধ</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">খুব ছোট — পাদটীকা আর ফাঁকা কথার জন্য।</p><p data-nabi-size="sm">ছোট — মূল লেখার থেকে এক ধাপ পিছনে।</p><p>ডিফল্ট মাপের অনুচ্ছেদ। বোতাম চাপলে পাঁচটি ধাপ <b>নিজের ভাষায়, নিজের মাপে</b> ফুটে ওঠে।</p><p data-nabi-size="lg">বড় — জোর দেওয়া বাক্যের জন্য।</p><p data-nabi-size="xl">খুব বড় — শিরোনামের নিচের ভূমিকা-বাক্যের জন্য।</p>',
  demo_html_typeface:
    '<p>এই অনুচ্ছেদে কোনো হরফ বসানো নেই — পাতার ডিফল্ট পা-হীন হরফে দেখা যাচ্ছে।</p><p data-nabi-typeface="serif">এটি পা-সহ হরফ। পরিবার আপনি বাছেন, আসল হরফ ঠিক করে দেয় এই সাইট — এখানে Noto Serif।</p><p data-nabi-typeface="mono">এটি সমান-প্রস্থ হরফ। প্রতিটি অক্ষর একই চওড়া বলে স্তম্ভ সোজা মেলে — 0O 1lI</p><p data-nabi-typeface="cursive">এটি হাতের লেখার ধাঁচ — হস্তলিপি · 手書き · 手写.</p><p>হরফ বসে <b>প্রতিটি অনুচ্ছেদে আলাদাভাবে</b>, আর মোটার মতো মার্কের পাশে দিব্যি বসে যায়।</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">প্রথম অক্ষরটি তিন লাইন জুড়ে বসে আর লেখা তার পাশ দিয়ে বয়ে যায়। ছোট অনুচ্ছেদেও ওই তিন লাইনের জায়গা আগে থেকেই রাখা থাকে, তাই নিচের অংশে হুড়োহুড়ি করে ঢুকে পড়ে না।</p><p>এই অনুচ্ছেদে সেটি নেই।</p>',
  demo_html_clear_format:
    '<p><b>মোটা</b>·<i>হেলানো</i>·<u>নিম্নরেখ</u>·<s>কাটা</s> — এমন লেখা বেছে মোছার বোতাম চাপুন।</p><p>কেবল লেখার সাজ মোছে — ব্লক ঠিক আগের মতোই থাকে।</p>',
  demo_html_upload:
    '<p>এই বাক্সে ফাইল টেনে আনুন, বা পেস্ট করুন। এই সাইটে আপলোডের কোনো সার্ভার নেই বলে শুধু ভান করে — ফল থাকে কেবল এই পাতাতেই।</p><p>আপলোড শেষ হলে সংযুক্তি দেখা যায় এভাবে — <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">সংযুক্ত ফাইল</a>।</p>',


  cdn_demo_lead: 'নিচের কোডটি {file} নামে সংরক্ষণ করে ব্রাউজারে খুললেই সঙ্গে সঙ্গে দেখা যায়।',
  cdn_demo_download: 'demo.html ডাউনলোড করুন',
  cdn_code_minheight: 'সম্পাদকের ন্যূনতম উচ্চতা — প্রথম খোলার সময় এক লাইনের বাক্সের মতো না দেখাতে। মান যেমন খুশি বদলান।',
  cdn_code_wings: 'আপলোড বাদে বাকি সব wing অন্তর্ভুক্ত।',
  cdn_code_faces:
    'ফন্ট থেকে কেবল sans আর serif দুটোই রাখা হলো।\nপ্ল্যাটফর্মভেদে সমর্থিত ফন্ট আলাদা বলে মনো, হাতের লেখার মতো ফন্ট আলাদা করে import\nনা করলে সব প্ল্যাটফর্মে চেনা যাবে না। বিস্তারিত "টাইপফেস" নথিতে দেখুন।',
  cdn_code_change: 'মান বদলানোর সময় কলব্যাকের উদাহরণ',
  code_copy: 'কোড কপি করুন',
  demo_install: 'ইনস্টল',
  demo_code: 'কোড',
  demo_chars: '{n} অক্ষর',
  demo_tree: 'nabi-tree',
  demo_loading: 'সম্পাদক লোড হচ্ছে…',

  page_not_found: 'পাতা পাওয়া যায়নি',
  nav_prev: 'আগের নথি',
  nav_next: 'পরের নথি',
}
