// Translated — every value below is Hindi, and the wing names are the same words their toolbar
// buttons show, so the menu and the editor say one thing.
// 옮겼다 — 아래 값은 모두 힌디어이고, 날개 이름은 그 날개 버튼에 뜨는 낱말 그대로라
// 메뉴와 에디터가 한 말을 한다.
export const hi = {
  label: 'हिन्दी',
  lang: 'hi',
  link: '/hi/',
  description: 'NABI NOTE — एक ओपन-सोर्स WYSIWYG संपादक।',

  menu_docs: 'दस्तावेज़',
  menu_intro: 'परिचय',
  menu_intro_index: 'NABI NOTE क्या है?',
  menu_intro_usage: 'बुनियादी इस्तेमाल',
  menu_intro_ssr: 'SSR समर्थन',
  menu_intro_cdn: 'CDN से इस्तेमाल',
  menu_intro_vibe_coding: 'AI वाइब कोडिंग',

  menu_wing: 'पंख (Wing)',
  menu_wing_custom: 'अपना पंख बनाना',
  menu_custom_start: 'शुरुआत',
  menu_custom_inline: 'इनलाइन मार्क',
  menu_custom_block: 'ब्लॉक और ब्लॉक विशेषताएँ',
  menu_custom_ui: 'UI और क्रियाएँ',
  menu_custom_input: 'कुंजी · स्वतः स्वरूपण · पेस्ट',

  menu_style: 'सजावट',
  menu_style_custom: 'स्टाइल बदलना',

  menu_projects: 'परियोजनाएँ',

  menu_inline: 'इनलाइन',
  menu_inline_bold: 'बोल्ड',
  menu_inline_italic: 'इटैलिक',
  menu_inline_underline: 'रेखांकित',
  menu_inline_strikethrough: 'स्ट्राइकथ्रू',
  menu_inline_superscript: 'सुपरस्क्रिप्ट',
  menu_inline_subscript: 'सबस्क्रिप्ट',
  menu_inline_link: 'लिंक',
  menu_inline_highlight: 'हाइलाइट',
  menu_inline_text_color: 'टेक्स्ट का रंग',

  menu_block: 'ब्लॉक',
  menu_block_heading: 'शीर्षक',
  menu_block_bullet_list: 'बुलेट सूची',
  menu_block_ordered_list: 'क्रमांकित सूची',
  menu_block_task_list: 'चेकलिस्ट',
  menu_block_table: 'तालिका',
  menu_block_image: 'छवि',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'कोड',
  menu_block_details: 'विवरण',
  menu_block_quote: 'उद्धरण',
  menu_block_divider: 'विभाजक',

  menu_etc: 'अन्य',
  menu_etc_align: 'संरेखण',
  menu_etc_dropcap: 'ड्रॉप कैप',
  menu_etc_typeface: 'फ़ॉन्ट',
  menu_etc_font_size: 'टेक्स्ट का आकार',
  menu_etc_clear_format: 'फ़ॉर्मैटिंग हटाएँ',
  menu_etc_upload: 'फ़ाइल अपलोड करें',

  search: 'खोजें',
  search_no_results: 'कोई परिणाम नहीं',
  search_hint: 'खोज शब्द दर्ज करें',
  search_move: 'चलें',
  search_open: 'खोलें',
  search_close: 'बंद करें',

  demo_placeholder: 'यहाँ लिखकर देखिए',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">अभी AI से दस्तावेज़ बनाए और अनुवाद किए जा रहे हैं।</p><p data-nabi-align="c">जब यह ठहर जाएगा, तो संस्करण 1.0.0 हो जाएगा।</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">एक मुक्त-स्रोत WYSIWYG संपादक</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> एक मुक्त-स्रोत WYSIWYG संपादक है, जिसमें हर बड़ी सुविधा — सजावट, संरेखण, सारणी, अपलोड और बाकी सब — «पंख» नाम के अलग मॉड्यूल के रूप में केंद्र से हटाकर रखी गई है, ताकि विकासकर्ता उसे बिना किसी सीमा के बढ़ा सके। यह शुद्ध Vanilla JS में लिखा है और <b>फ़्रेमवर्क पर शून्य निर्भरता</b> का लक्ष्य रखता है, इसलिए यह React में, Vue में या कहीं भी वैसे ही बैठ जाता है, और बिना बिल्ड-तंत्र वाली परियोजनाओं के लिए एक <b>CDN पुस्तकालय</b> भी साथ आता है। इसका अपना JSON रूप <b>NABI TREE</b> है, इसलिए HTML और पाठ के बीच का रूपांतरण वहाँ भी पहले से तैयार किया जा सकता है जहाँ DOM है ही नहीं (Node.js, SSR); और चूँकि यह दस्तावेज़ को पैबंद लगाने के बजाय अनुमत शब्दावली से नए सिरे से जोड़ता है, इसलिए बिना किसी अलग सफ़ाई-पुस्तकालय के <b>XSS स्क्रिप्ट जड़ से रुक जाती है</b>। सजावट में <b>CSS Variable</b> की पद्धति अपनाई गई है, जिससे ब्रांड का रंग आसानी से बदला जा सकता है, और <b>rem आधारित मांडणी</b> से बड़ा-छोटा करने पर भी मोबाइल का रूप चिकना बना रहता है; गहरे और उजले, दोनों से मेल खाते रंग, हाइलाइटर और बहुभाषी लिपियाँ पहले से मौजूद हैं। इसके ऊपर <b>प्रकार पहचानकर सारणी के स्तंभ की छँटाई</b>, IndexedDB पर टिका <b>स्थानीय इतिहास</b> और <b>वाइब कोडिंग</b> का साथ भी है।</span></p><p><br/></p><h2>लिपि</h2><p>बिना पादिका (तयशुदा), पादिका सहित, समान-चौड़ाई और हस्तलेख — हर परिवार में लिपि-प्रणाली के हिसाब से फ़ॉन्ट चुने गए हैं, इसलिए कोई भी भाषा लिखिए, उस परिवार का चेहरा बना रहता है; जिस लिपि के लिए उस परिवार में हस्तलेख नहीं है, वह ब्राउज़र के तयशुदा फ़ॉन्ट पर लौट आती है। <b>तयशुदा लिपि मेज़बान तय करता है।</b></p><p><br/></p><p>नीचे हर परिवार <b>कई भाषाओं में</b> दिखाया गया है।</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>अक्षर का आकार</h2><p><span data-nabi-size="xs">बहुत छोटा</span></p><p><span data-nabi-size="sm">छोटा</span></p><p><span data-nabi-size="lg">बड़ा</span></p><p><span data-nabi-size="xl">बहुत बड़ा</span></p><p><br/></p><p><br/></p><h2>शीर्षक</h2><p>खाली पंक्ति में # लिखकर स्पेस दबाइए — वहीं शीर्षक बन जाता है।</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>मोटा · तिरछा · रेखांकित · कटा हुआ</h2><p><b>मोटा</b> <i>तिरछा</i> <u>रेखांकित</u> <s>कटा हुआ</s> — यह रहा उदाहरण।</p><p><b><i><s><u>इन्हें एक के ऊपर एक भी लगाया जा सकता है।</u></s></i></b></p><h3>ऊपरी और निचला अंक</h3><p>क्षेत्रफल 3.5 मी<sup>2</sup> है, और पाद-टिप्पणी ऐसे लगती है<sup>1</sup>।</p><p>पानी H<sub>2</sub>O है।</p><p><br/></p><p><br/></p><h2>अक्षर का रंग · हाइलाइटर</h2><p>रंग ऐसे चुने गए हैं कि उजले और गहरे, दोनों में पढ़ने में सहज रहें।</p><p>अक्षर का रंग <span data-color="green">हरा</span> · <span data-color="coral">मूँगा</span> · <span data-color="violet">बैंगनी</span> · <span data-color="amber">अंबर</span> · <span data-color="blue">नीला</span></p><p>हाइलाइटर <mark data-color="yellow">पीला</mark> · <mark data-color="green">हरा</mark> · <mark data-color="cyan">आसमानी</mark> · <mark data-color="pink">गुलाबी</mark> · <mark data-color="purple">जामुनी</mark> · <mark data-color="orange">नारंगी</mark></p><p><br/></p><p><br/></p><h2>कड़ी</h2><p>पता डालिए और वह <a href="https://nabi.saro.me/">कड़ी</a> बन जाता है।</p><p>पते में केवल http:// और https:// चलते हैं; javascript: जैसा कुछ नहीं चलेगा।</p><p>जैसे <a href="https://nabi.saro.me/">https://nabi.saro.me</a> लिखकर स्पेस या एंटर दबाइए — यह अपने आप बदल जाता है, जैसा यहाँ दिख रहा है।</p><h3>target</h3><p>तयशुदा रूप से एक ही मूल की कड़ी इसी खिड़की में और दूसरी साइट नई खिड़की में खुलती है; यह नियम संपादक घोषित करते समय तय किया जा सकता है।</p><h3>संलग्नक की कड़ी</h3><p>चित्र के अलावा कुछ चढ़ाने पर नीचे जैसी फ़ाइल-रूपी कड़ी बच रहती है।</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>संलग्नक</a> बस इतना बचा रहता है।</p><p><br/></p><p><br/></p><h2>संरेखण</h2><p>बाएँ</p><p>बीच में</p><p>दाएँ</p><h3>शीर्षक भी संरेखित होते हैं।</h3><p><br/></p><p><br/></p><h2>सूचियाँ</h2><h3>बिंदु-सूची</h3><p>खाली पंक्ति में - लिखकर <b>स्पेस</b> दबाइए — वहीं बिंदु-सूची बन जाती है।</p><div data-nabi-p><ul><li><p>यह एक बिंदु है</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab से भीतर और बाहर किया जाता है।</p></li></ul></div></li></ul></div><h3>क्रमांकित सूची</h3><p>खाली पंक्ति में 1. लिखकर <b>स्पेस</b> दबाइए — क्रमांकित सूची बन जाती है।</p><div data-nabi-p><ol><li><p>पहला</p></li><li><p>दूसरा</p></li><li><p>तीसरा</p></li></ol></div><h3>जाँच-सूची</h3><p>खाली पंक्ति में [ ] या [x] लिखकर <b>स्पेस</b> दबाइए — जाँच-सूची बन जाती है।</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>यह काम हो चुका है।</p></li><li data-nabi-checked="false"><p>यह अभी बाकी है।</p></li></ul></div><p><br/></p><p><br/></p><h2>सारणी</h2><p>औज़ार-पट्टी की सारणी से बनाइए; पंक्तियाँ और स्तंभ जोड़े, हटाए और जोड़कर मिलाए जा सकते हैं।</p><h3>स्तंभ की छँटाई</h3><p><b>झलक</b> दबाइए, फिर <b>भंडार</b> और <b>दाम</b> के शीर्ष एक-एक करके दबाइए।</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>मॉडल</p></th><th><p>भंडार</p></th><th><p>दाम</p></th><th><p>वज़न</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>तय होना बाकी</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>दाम</b> में सब अंक हैं, इसलिए अंक की तरह छँटता है।</p><p><b>भंडार</b> पाठ की तरह छँटता है, क्योंकि आख़िरी खाने में अक्षर हैं। (बचना हो तो वह खाना खाली कर दीजिए।)</p><p><br/></p><p><br/></p><h2>विभाजक रेखा</h2><p>--- लिखकर एंटर दबाइए — विभाजक रेखा बन जाती है।</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>चित्र</h2><p>चित्र का पता डालिए या चढ़ाइए; चौड़ाई 30% से 100% तक रखी जा सकती है और वह बाएँ, बीच या दाएँ बैठता है।</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>अपलोड</h2><p>कोई चित्र या फ़ाइल संपादक पर खींचकर देखिए।</p><p>यहाँ का अपलोड बस दिखावा है; एक सेटिंग से यह आपके सर्वर से जुड़ जाता है।</p><p>अपलोड बिगड़ जाए तो वह चित्र या फ़ाइल संपादक से हटा दी जाती है।</p><p><br/></p><p><br/></p><h2>उद्धरण</h2><div data-nabi-p><blockquote><p>खाली पंक्ति में &gt; लिखकर <b>स्पेस</b> दबाइए — उद्धरण का खाना बन जाता है।</p><p>यह कई पंक्तियों तक चल सकता है।</p></blockquote></div><p><br/></p><p><br/></p><h2>कोड</h2><p>खाली पंक्ति में \`\`\` लिखकर <b>स्पेस या एंटर</b> दबाइए — कोड का खाना बन जाता है।</p><p>भाषा भी साथ लिखिए, जैसे \`\`\`java, फिर स्पेस या एंटर — खाने पर वही भाषा लग जाती है।</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>मोड़</h2><div data-nabi-p><details open><summary>मोड़ शीर्षक और भीतरी सामग्री से बनता है।</summary><p>आप तय कर सकते हैं कि यह बंद हालत में सहेजा जाए या खुली।</p></details></div><p><br/></p><h2>स्थानीय इतिहास</h2><p><b>ब्राउज़र की</b> IndexedDB के ज़रिए तय अंतराल पर इतिहास रखा जाता है।</p><p>यह केवल इसी उपकरण पर रहता है और उतने ही रखता है जितने घोषित किए गए हों। — तयशुदा हर 30 सेकंड, पिछले 20 सत्र।</p><p><br/></p><p><br/></p><h2>शॉर्टकट</h2><p><b>Shift दो बार तेज़ी से</b> दबाइए — औज़ार-पट्टी हर सुविधा का शॉर्टकट दिखा देती है।</p><p><br/></p><p><br/></p><h2>स्वतः सजावट</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>उदाहरण</p></th><th><p>कुंजी</p></th><th><p>परिणाम</p></th></tr><tr><td><p>#</p></td><td><p>स्पेस</p></td><td><p>शीर्षक</p></td></tr><tr><td><p>-</p></td><td><p>स्पेस</p></td><td><p>बिंदु-सूची</p></td></tr><tr><td><p>1.</p></td><td><p>स्पेस</p></td><td><p>क्रमांकित सूची</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>स्पेस</p></td><td><p>जाँच-सूची</p></td></tr><tr><td><p>&gt;</p></td><td><p>स्पेस</p></td><td><p>उद्धरण</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>स्पेस · एंटर</p></td><td><p>कोड का खाना</p></td></tr><tr><td><p>---</p></td><td><p>एंटर</p></td><td><p>विभाजक रेखा</p></td></tr><tr><td><p>https://…</p></td><td><p>स्पेस · एंटर</p></td><td><p>कड़ी</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>निर्गम फलन</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>फलन</p></th><th><p>परिणाम</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>बिना DOM के भी चलता है</h2><p>JSON से HTML बनाने के लिए <b>DOM की ज़रूरत नहीं</b>।</p><p>सर्वर (Node.js) सहेजे हुए नाबी-वृक्ष को ज्यों का त्यों पढ़कर, XSS रोकते हुए HTML जोड़ सकता है।</p><p><br/></p><h2>मोबाइल के अनुकूल</h2><div data-nabi-p><ul><li><p><b>मोबाइल रूप</b> — अनुक्रियाशील मांडणी मोबाइल का रूप सँभालती है।</p></li><li><p><b>कीबोर्ड की भरपाई</b> — कीबोर्ड खुलने पर उसकी ऊँचाई की भरपाई हो जाती है।</p></li><li><p><b>लचीले आकार</b> — सारे आकार rem में लिखे गए हैं।</p></li><li><p><b>बहुभाषी</b> — यह चौदह भाषाएँ बोलता है।</p></li></ul></div><p><br/></p><h2>अपने मन का रूप</h2><div data-nabi-p><ul><li><p><b>अपना पंख</b> — कोई सुविधा चाहिए तो खुद बनाकर लगा लीजिए।</p></li><li><p><b>अपना CSS</b> — रंग, कोने और अंतराल सब --nabi-* से तय हैं, गहरा हो या उजला — आपकी मर्ज़ी।</p></li><li><p><b>मुक्त स्रोत</b> — GitHub पर मुक्त स्रोत के रूप में उपलब्ध।</p></li></ul></div><div data-nabi-p><hr/></div><p>दस्तावेज़ देखिए → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'पंख',
  demo_wings_all: 'सब चालू',
  demo_wings_none: 'सब बंद',
  demo_zoom: 'ज़ूम',
  demo_zoom_out: 'छोटा करें',
  demo_zoom_in: 'बड़ा करें',
  demo_zoom_reset: 'वापस',
  demo_sticky: 'टूलबार स्थिर',
  demo_sticky_keyboard: 'मोबाइल कीबोर्ड की भरपाई',
  demo_sticky_height: 'ऊँचाई',
  demo_sticky_unit: 'ऊँचाई की इकाई',
  demo_typeface_base: 'डिफ़ॉल्ट फ़ॉन्ट',
  demo_typeface_sans: 'सैन्स सेरिफ़',
  demo_typeface_serif: 'सेरिफ़',
  demo_typeface_mono: 'मोनोस्पेस',
  demo_typeface_cursive: 'हस्तलेख',
  demo_html_small: '<p>यहाँ लिखें, और ऊपर दिए wing को चालू-बंद करके देखें।</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>वाक्य में <b>ज़रूरी शब्दों</b> की ओर इशारा करें। कुछ टेक्स्ट चुनकर टूलबार में <b>B</b> दबाएँ।</p>',
  demo_html_italic:
    '<p>उद्धरण और अनजान शब्द <i>तिरछे</i> लिखे जाते हैं। यह वाक्य चुनकर आज़माएँ।</p>',
  demo_html_underline:
    '<p>यहाँ एक <u>रेखांकन</u> लगा है। उन अक्षरों को चुनकर फिर दबाने पर यह हट जाता है।</p>',
  demo_html_strikethrough: '<p><s>₹1,900</s> ₹990 — पुराना मूल्य दिखाए रखने के लिए।</p>',
  demo_html_superscript:
    '<p>क्षेत्रफल 3.5 मी<sup>2</sup> है, और टिप्पणी ऐसे जुड़ती है।<sup>1</sup></p>',
  demo_html_subscript: '<p>पानी H<sub>2</sub>O है, और झाग CO<sub>2</sub> का बनता है।</p>',
  demo_html_link:
    '<p>पता डालें तो <a href="https://example.com">ऐसा लिंक</a> बनता है। मौजूदा लिंक पर संदर्भ पट्टी नहीं खुलती — पता बदलने के लिए उसे मिटाकर नया बनाएँ।</p>',
  demo_html_highlight:
    '<p>कुछ टेक्स्ट चुनकर बटन दबाएँ: छह रंग — <mark data-color="yellow">पीला</mark>, <mark data-color="green">हरा</mark>, <mark data-color="cyan">आसमानी</mark> — कर्सर के पास खुल जाते हैं।</p><p>कर्सर को किसी मार्क के भीतर रखें तो वही रंग-पट्टी संदर्भ पट्टी में दिखती है, रंग बदलने के लिए।</p>',
  demo_html_text_color:
    '<p>टेक्स्ट को <span data-color="green">हरा</span>, <span data-color="coral">मूँगा</span> या <span data-color="violet">बैंगनी</span> रंग दें — कुल पाँच रंग हैं।</p><p><mark data-color="yellow">हाइलाइट के ऊपर</mark> भी चल जाता है: दोनों अलग-अलग मार्क हैं, इसलिए <span data-color="blue">दोनों लागू होते हैं।</span></p>',
  demo_html_heading:
    '<h1>शीर्षक 1</h1><h2>शीर्षक 2</h2><h3>शीर्षक 3</h3><p>मुख्य पाठ। खाली पंक्ति में # और स्पेस टाइप करने से भी शीर्षक बनता है।</p>',
  demo_html_bullet_list:
    '<ul><li>बुलेट सूची</li><li>Tab से इंडेंट, Shift+Tab से बाहर<ul><li>नेस्टेड आइटम</li></ul></li></ul><p>खाली पंक्ति में - और स्पेस टाइप करने से भी सूची बनती है।</p>',
  demo_html_ordered_list:
    '<ol><li>क्रमांकित सूची</li><li>आइटम जोड़ने या हटाने पर संख्याएँ खुद बदल जाती हैं</li></ol><p>खाली पंक्ति में 1. और स्पेस टाइप करने से भी बनती है।</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">टेक्स्ट के आगे का बक्सा दबाएँ</li><li data-nabi-checked="false">चेक की स्थिति दस्तावेज़ के साथ सहेजी जाती है</li></ul><p>खाली पंक्ति में [ ] या [x] टाइप करने से भी बनती है।</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>कुंजी</th><th>काम</th></tr><tr><td>Tab</td><td>अगला सेल</td></tr><tr><td>तीर कुंजियाँ</td><td>ग्रिड के अनुसार चलें</td></tr></tbody></table><p>कर्सर को सेल में रखें तो संदर्भ पट्टी में पंक्ति-स्तंभ आदेश दिखते हैं।</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="नाबी नोट लोगो" data-nabi-width="50"></div><p>चौड़ाई और संरेखण बक्से के लिए चित्र पर क्लिक करें।</p>',
  demo_html_youtube:
    '<p>टूलबार के YouTube बटन का उपयोग करें, या सीधे वीडियो का पता चिपकाएँ — एम्बेड यहीं आ जाएगा।</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>कर्सर को कोड के भीतर रखें तो संदर्भ पट्टी में भाषा का खाना दिखता है।</p>',
  demo_html_details:
    '<details open=""><summary>यहाँ दबाकर समेटें</summary><p>समेटी हुई स्थिति दस्तावेज़ के साथ सहेजी जाती है — पाठक इसे वैसे ही देखते हैं जैसे लेखक ने छोड़ा था।</p></details>',
  demo_html_quote:
    '<blockquote><p>दूसरे के शब्दों के लिए बक्सा। इसके भीतर सिर्फ़ अक्षर-रूप लागू होते हैं — चित्र, कोड और तालिका के बटन नहीं दिखते।</p></blockquote><p>खाली पंक्ति में &gt; और स्पेस टाइप करने से वह पंक्ति उद्धरण बन जाती है।</p>',
  demo_html_divider:
    '<p>विभाजक रेखा के ऊपर का अनुच्छेद।</p><hr><p>और नीचे वाला। किसी पंक्ति में सिर्फ़ --- टाइप करके Enter दबाने से भी रेखा बनती है।</p>',
  demo_html_align:
    '<p data-nabi-align="l">बाईं ओर संरेखित</p><p data-nabi-align="c">बीच में संरेखित</p><p data-nabi-align="r">दाईं ओर संरेखित</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">बहुत छोटा — टिप्पणी और उपवाक्य के लिए।</p><p data-nabi-size="sm">छोटा — मुख्य पाठ से एक कदम पीछे।</p><p>सामान्य आकार का अनुच्छेद। बटन दबाने पर पाँच स्तर दिखते हैं, <b>हर एक आपकी भाषा में, अपने आकार में</b>।</p><p data-nabi-size="lg">बड़ा — ज़ोर वाला वाक्य।</p><p data-nabi-size="xl">बहुत बड़ा — शीर्षक के नीचे की लीड।</p>',
  demo_html_typeface:
    '<p>इस अनुच्छेद पर कोई फ़ॉन्ट-शैली नहीं लगी — यह पेज का डिफ़ॉल्ट सैन्स सेरिफ़ दिखाता है।</p><p data-nabi-typeface="serif">यह सेरिफ़ है। परिवार आप चुनते हैं; असली फ़ॉन्ट वही है जो इस साइट ने टोकन पर लगाया है, यहाँ Noto Serif।</p><p data-nabi-typeface="mono">यह मोनोस्पेस है। हर अक्षर की चौड़ाई बराबर होती है, जिससे कॉलम पंक्तिबद्ध होते हैं — 0O 1lI</p><p data-nabi-typeface="cursive">यह हस्तलेख है — हस्तलेख · 手書き · 手写।</p><p>फ़ॉन्ट-शैली <b>हर अनुच्छेद पर अलग से</b> लगती है, और बोल्ड जैसे मार्क के साथ भी ठीक चलती है।</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">पहला अक्षर तीन पंक्तियों तक फैलता है और पाठ उसके बगल से बहता है। छोटे अनुच्छेद में भी उतनी जगह पहले से आरक्षित रहती है, इसलिए नीचे का ब्लॉक कभी दबता नहीं।</p><p>इस अनुच्छेद पर यह लागू नहीं है।</p>',
  demo_html_clear_format:
    '<p><b>बोल्ड</b>, <i>तिरछा</i>, <u>रेखांकित</u> या <s>कटा हुआ</s> टेक्स्ट चुनकर मिटाने वाला बटन दबाएँ।</p><p>सिर्फ़ अक्षर-रूपण मिटता है — ब्लॉक जस के तस रहते हैं।</p>',
  demo_html_upload:
    '<p>इस बक्से में फ़ाइल खींचकर छोड़ें, या चिपकाएँ। इस साइट के पास अपलोड करने के लिए कोई सर्वर नहीं, इसलिए यह सिर्फ़ दिखावा करता है — नतीजा सिर्फ़ इसी पेज में रहता है।</p><p>पूरा हो चुका अटैचमेंट <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a> जैसा दिखता है।</p>',


  cdn_demo_lead: 'नीचे दिए कोड को {file} के नाम से सहेजें और ब्राउज़र में खोलें — तुरंत काम करता दिखेगा।',
  cdn_demo_download: 'demo.html डाउनलोड करें',
  cdn_code_minheight: 'एडिटर की न्यूनतम ऊँचाई — पहली बार खुलने पर एक-लाइन के बक्से जैसा दिखने से रोकती है। मान बदल सकते हैं।',
  cdn_code_wings: 'upload को छोड़कर बाक़ी सभी wing।',
  cdn_code_faces:
    'टाइपफ़ेस में से सिर्फ़ sans और serif रखे गए हैं।\nहर सिस्टम अलग-अलग टाइपफ़ेस सपोर्ट करता है, इसलिए mono और cursive को हर प्लेटफ़ॉर्म पर\nपहचाने जाने के लिए अलग से वेब-फ़ॉन्ट के रूप में import करना पड़ता है। विवरण "टाइपफ़ेस" पेज पर देखें।',
  cdn_code_change: 'मान बदलने पर चलने वाला उदाहरण-कॉलबैक',
  code_copy: 'कोड कॉपी करें',
  demo_install: 'इंस्टॉल',
  demo_code: 'कोड',
  demo_chars: '{n} अक्षर',
  demo_tree: 'nabi-tree',
  demo_loading: 'संपादक लोड हो रहा है…',

  page_not_found: 'पेज नहीं मिला',
  nav_prev: 'पिछला दस्तावेज़',
  nav_next: 'अगला दस्तावेज़',
}
