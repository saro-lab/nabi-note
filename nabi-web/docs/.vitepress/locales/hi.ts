// 옮겼다 — 키 하나라도 빠지면 타입 오류라 파일이 통째로 채워져 있어야 한다.
// Translated — a missing key is a type error, so the file must stay filled in whole.
export const hi = {
  label: 'हिन्दी',
  lang: 'hi',
  link: '/hi/',
  description: 'NABI NOTE — एक ओपन-सोर्स WYSIWYG संपादक।',

  menu_docs: 'दस्तावेज़',
  menu_icon_theme: "आइकन थीम",
  menu_intro_vibe_coding: 'AI वाइब कोडिंग',



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
  search_hint: 'कृपया खोज शब्द दर्ज करें',
  search_move: 'चलें',
  search_open: 'खोलें',
  search_close: 'बंद करें',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: "<p data-nabi-align=\"c\"></p><div data-nabi-p data-nabi-align=\"c\"><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><h1 data-nabi-align=\"c\">NABI NOTE</h1><p data-nabi-align=\"c\"><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\">एक मुक्त-स्रोत WYSIWYG संपादक</span></i></span></p><p></p><p data-nabi-dropcap=\"1\"><span data-nabi-typeface=\"serif\"><b>NABI NOTE</b> एक ओपन-सोर्स WYSIWYG संपादक है जिसमें स्वरूपण, संरेखण, तालिका और अपलोड जैसी सुविधाएँ कोर से अलग कर स्वतंत्र «wing» मॉड्यूलों में रखी गई हैं। ज़रूरत के wing चुनकर संपादक बनाया जा सकता है और अपने बनाए wing भी जोड़े जा सकते हैं। यह शुद्ध JavaScript में लिखा है, इसलिए React या Vue जैसे फ़्रेमवर्क में भी इस्तेमाल हो सकता है। बिना बिल्ड सेटअप वाले पन्नों पर <b>CDN पुस्तकालय</b> से तुरंत शुरू किया जा सकता है। इसका अपना दस्तावेज़ प्रारूप <b>NABI TREE</b> ब्राउज़र DOM के बिना भी Node.js परिवेश में HTML में बदला जा सकता है। इनपुट दस्तावेज़ पंजीकृत नियमों से ठीक किए जाते हैं और HTML बनाते समय टेक्स्ट व विशेषताओं को एस्केप कर लिंक पते जाँचे जाते हैं। फिर भी अपने बनाए wing और सर्वर से मिले डेटा को अनुप्रयोग की सुरक्षा नीति के अनुसार अलग से जाँचना चाहिए। CSS चर और rem-आधारित लेआउट से थीम व आकार बदले जा सकते हैं; डार्क मोड और कई भाषाओं के लिए फ़ॉन्ट सेटिंग भी उपलब्ध हैं। तालिका क्रमबद्ध करना, स्थानीय इतिहास और AI से दस्तावेज़ पर काम करना इसी दस्तावेज़ मॉडल पर चलता रहता है।</span></p><p></p><h2>लिपि</h2><p>बिना पादिका (तयशुदा), पादिका सहित, समान-चौड़ाई और हस्तलेख — हर परिवार में लिपि-प्रणाली के हिसाब से फ़ॉन्ट चुने गए हैं, इसलिए कोई भी भाषा लिखिए, उस परिवार का चेहरा बना रहता है; जिस लिपि के लिए उस परिवार में हस्तलेख नहीं है, वह ब्राउज़र के तयशुदा फ़ॉन्ट पर लौट आती है। <b>तयशुदा लिपि मेज़बान तय करता है।</b></p><p></p><p>नीचे हर परिवार <b>कई भाषाओं में</b> दिखाया गया है।</p><p></p><p><span data-nabi-typeface=\"sans\"><span data-nabi-size=\"lg\">सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie · 산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف</span></span></p><p></p><p><span data-nabi-typeface=\"serif\"><span data-nabi-size=\"lg\">सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Serif · Yenye serif · செரிஃப் · มีเชิง · Con grazie · 세리프 · 明朝体 · 衬线 · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف</span></span></p><p></p><p><span data-nabi-typeface=\"mono\"><span data-nabi-size=\"lg\">मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace · 고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض</span></span></p><p></p><p><span data-nabi-typeface=\"cursive\"><span data-nabi-size=\"lg\">हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · Cursive · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный · خط اليد</span></span></p><p></p><p></p><h2>अक्षर का आकार</h2><p><span data-nabi-size=\"xs\">बहुत छोटा</span></p><p><span data-nabi-size=\"sm\">छोटा</span></p><p><span data-nabi-size=\"lg\">बड़ा</span></p><p><span data-nabi-size=\"xl\">बहुत बड़ा</span></p><p></p><p></p><h2>शीर्षक</h2><p>खाली पंक्ति में # लिखकर स्पेस दबाइए — वहीं शीर्षक बन जाता है।</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>मोटा · तिरछा · रेखांकित · कटा हुआ</h2><p><b>मोटा</b> <i>तिरछा</i> <u>रेखांकित</u> <s>कटा हुआ</s> — यह रहा उदाहरण।</p><p><b><i><s><u>इन्हें एक के ऊपर एक भी लगाया जा सकता है।</u></s></i></b></p><h3>ऊपरी और निचला अंक</h3><p>क्षेत्रफल 3.5 मी<sup>2</sup> है, और पाद-टिप्पणी ऐसे लगती है।<sup>1</sup></p><p>पानी H<sub>2</sub>O है।</p><p></p><p></p><h2>अक्षर का रंग · हाइलाइटर</h2><p>रंग ऐसे चुने गए हैं कि उजले और गहरे, दोनों में पढ़ने में सहज रहें।</p><p>अक्षर का रंग <span data-color=\"green\">हरा</span> · <span data-color=\"coral\">मूँगा</span> · <span data-color=\"violet\">बैंगनी</span> · <span data-color=\"amber\">अंबर</span> · <span data-color=\"blue\">नीला</span></p><p>हाइलाइटर <mark data-color=\"yellow\">पीला</mark> · <mark data-color=\"green\">हरा</mark> · <mark data-color=\"cyan\">आसमानी</mark> · <mark data-color=\"pink\">गुलाबी</mark> · <mark data-color=\"purple\">जामुनी</mark> · <mark data-color=\"orange\">नारंगी</mark></p><p></p><p></p><h2>कड़ी</h2><p>पता डालिए और वह <a href=\"https://nabi.saro.me/\">कड़ी</a> बन जाता है।</p><p>पते में केवल http:// और https:// चलते हैं; javascript: जैसा कुछ नहीं चलेगा।</p><p>जैसे <a href=\"https://nabi.saro.me/\">https://nabi.saro.me</a> लिखकर स्पेस या एंटर दबाइए — यह अपने आप बदल जाता है, जैसा यहाँ दिख रहा है।</p><h3>लिंक खोलना</h3><p>तयशुदा रूप से एक ही मूल की कड़ी इसी खिड़की में और दूसरी साइट नई खिड़की में खुलती है; यह नियम संपादक घोषित करते समय तय किया जा सकता है।</p><h3>संलग्नक की कड़ी</h3><p>चित्र के अलावा कुछ चढ़ाने पर नीचे जैसी फ़ाइल-रूपी कड़ी बच रहती है।</p><p><a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>संलग्नक</a> बस इतना बचा रहता है।</p><p></p><p></p><h2>संरेखण</h2><p>बाएँ</p><p data-nabi-align=\"c\">बीच में</p><p data-nabi-align=\"r\">दाएँ</p><h3>शीर्षक भी संरेखित होते हैं।</h3><p></p><p></p><h2>सूचियाँ</h2><h3>बिंदु-सूची</h3><p>खाली पंक्ति में - लिखकर <b>स्पेस</b> दबाइए — वहीं बिंदु-सूची बन जाती है।</p><div data-nabi-p><ul><li><p>यह एक बिंदु है</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab से भीतर और बाहर किया जाता है।</p></li></ul></div></li></ul></div><h3>क्रमांकित सूची</h3><p>खाली पंक्ति में 1. लिखकर <b>स्पेस</b> दबाइए — क्रमांकित सूची बन जाती है।</p><div data-nabi-p><ol><li><p>पहला</p></li><li><p>दूसरा</p></li><li><p>तीसरा</p></li></ol></div><h3>जाँच-सूची</h3><p>खाली पंक्ति में [ ] या [x] लिखकर <b>स्पेस</b> दबाइए — जाँच-सूची बन जाती है।</p><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>यह काम हो चुका है।</p></li><li data-nabi-checked=\"false\"><p>यह अभी बाकी है।</p></li></ul></div><p></p><p></p><h2>सारणी</h2><p>सेल में कई अनुच्छेद और ब्लॉक रख सकते हैं तथा पृष्ठभूमि के रंग से सामग्री अलग पहचान सकते हैं। नीचे की तालिका के पाठ और चित्र सीधे बदलकर देखें।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>संदर्भ सामग्री</p></th><th data-nabi-cell-color=\"cyan\"><p>काम के नोट्स</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">चित्र और उसका विवरण एक ही सेल में हैं।</p></td><td data-nabi-cell-color=\"yellow\"><h3>लचीले अनुच्छेद</h3><p>नया अनुच्छेद बनाने के लिए Enter और उसी अनुच्छेद में नई पंक्ति के लिए Shift+Enter दबाएँ।</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>सेल का पृष्ठभूमि रंग बदलना</p></li><li data-nabi-checked=\"false\"><p>सूची में Tab से इंडेंट करना</p></li><li data-nabi-checked=\"false\"><p>कई सेल चुनकर एक रंग लगाना</p></li></ul></div></td><td><div data-nabi-p><details open><summary>संपादन के सुझाव देखने के लिए क्लिक करें</summary><p>सेल में संक्षिप्त करने वाले ब्लॉक, उद्धरण, कोड और वीडियो भी रख सकते हैं।</p><p>सेल मर्ज करने पर हर सेल की सामग्री क्रम में सुरक्षित रहती है।</p></details></div></td></tr></table></div></div><p>सेल में क्लिक करने पर पृष्ठभूमि रंग और पंक्ति व स्तंभ के उपकरण दिखते हैं। कई सेल चुनकर रंग और संरेखण एक साथ बदल सकते हैं। पूरी तालिका की जगह बदलने के लिए “पूरी तालिका चुनें” चुनकर संरेखण उपकरण इस्तेमाल करें।</p><p>रंग या कई ब्लॉक वाली तालिकाएँ Markdown में सहेजते समय भी HTML के रूप में सुरक्षित रहती हैं।</p><h3>सेल के पृष्ठभूमि रंग</h3><p>यहाँ सभी उपलब्ध सेल पृष्ठभूमि रंग दिखाए गए हैं। रंग बदलने के लिए सेल पर क्लिक करें या गुण उपकरणों में “डिफ़ॉल्ट” चुनकर पृष्ठभूमि हटाएँ।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"yellow\"><p data-nabi-align=\"c\"><b>पीला</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">yellow</span></p></td><td data-nabi-cell-color=\"green\"><p data-nabi-align=\"c\"><b>हरा</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">green</span></p></td><td data-nabi-cell-color=\"cyan\"><p data-nabi-align=\"c\"><b>आसमानी</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">cyan</span></p></td></tr><tr><td data-nabi-cell-color=\"pink\"><p data-nabi-align=\"c\"><b>गुलाबी</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">pink</span></p></td><td data-nabi-cell-color=\"purple\"><p data-nabi-align=\"c\"><b>बैंगनी</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">purple</span></p></td><td data-nabi-cell-color=\"orange\"><p data-nabi-align=\"c\"><b>नारंगी</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">orange</span></p></td></tr></table></div></div><h3>स्तंभ की छँटाई</h3><p><b>झलक</b> दबाइए, फिर <b>भंडार</b> और <b>दाम</b> के शीर्ष एक-एक करके दबाइए।</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>मॉडल</p></th><th><p>भंडार</p></th><th><p>दाम</p></th><th><p>वज़न</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>तय होना बाकी</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>दाम</b> में सब अंक हैं, इसलिए अंक की तरह छँटता है।</p><p><b>भंडार</b> पाठ की तरह छँटता है, क्योंकि आख़िरी खाने में अक्षर हैं।</p><p></p><p></p><h2>विभाजक रेखा</h2><p>--- लिखकर एंटर दबाइए — विभाजक रेखा बन जाती है।</p><div data-nabi-p><hr/></div><p></p><p></p><h2>चित्र</h2><p>चौड़ाई 30% से 100% तक रखी जा सकती है और वह बाएँ, बीच या दाएँ बैठता है।</p><div data-nabi-p><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p></p><p></p><h2>फ़्लोट क्षेत्र</h2><div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>एक नज़र में</b></p><p>पाठ, चित्र और तालिकाओं के लिए छोटा सहायक क्षेत्र।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>स्थिति</p></td><td><p>दायाँ</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>अधिकतम चौड़ाई</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>मुख्य पाठ के साथ अतिरिक्त विवरण या छोटी संदर्भ सामग्री रखने के लिए फ़्लोट क्षेत्र इस्तेमाल करें। चौड़े दस्तावेज़ में यह पाठ क्षेत्र के बगल में बहता है। अंदर क्लिक करके उसी संपादक में पाठ बदलें और चित्र या तालिकाएँ जोड़ें।</p><p>गुण उपकरण खोलने के लिए कर्सर क्षेत्र में रखें। बाईं या दाईं स्थिति बदलें और पाठ के अनुसार 20, 30, 40 या 50% अधिकतम चौड़ाई चुनें। चिपकाई गई तालिकाएँ और चित्र भी क्षेत्र के अंदर रहते हैं।</p><p>चुने हुए अनुच्छेदों को भी क्षेत्र में लपेट सकते हैं। चौड़ाई के पास का क्षेत्र हटाने वाला बटन सामग्री मुख्य दस्तावेज़ में रहने देता है। पूर्वावलोकन में संपादन की बिंदुदार सीमा छिप जाती है; संकरे दस्तावेज़ और प्रिंट में सामग्री एक स्तंभ में चलती है।</p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src=\"https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk\" title=\"YouTube\" allowfullscreen loading=\"lazy\" data-nabi-width=\"70\"></iframe></div><p></p><p></p><h2>अपलोड</h2><p>कोई चित्र या फ़ाइल संपादक पर खींचकर देखिए।</p><p>यह डेमो फ़ाइलें वास्तविक सर्वर पर नहीं भेजता। सर्वर पर सहेजने के लिए अपने अनुप्रयोग में अपलोडर जोड़ें।</p><p>चित्र चयनकर्ता खोलने या अपलोड शुरू करने के बाद केवल कर्सर हिलाने पर सामग्री मूल स्थान पर ही जुड़ती है। प्रतीक्षा के दौरान दस्तावेज़ बदलने पर जोड़ना रद्द होता है और सूचना दिखती है। सेल में शुरू किए गए अपलोड की प्रगति और परिणाम भी उसी सेल में रहते हैं।</p><p></p><p></p><h2>उद्धरण</h2><div data-nabi-p><blockquote><p>खाली पंक्ति में &gt; लिखकर <b>स्पेस</b> दबाइए — उद्धरण का खाना बन जाता है।</p><p>यह कई पंक्तियों तक चल सकता है।</p></blockquote></div><p></p><p></p><h2>कोड</h2><p>खाली पंक्ति में ``` लिखकर <b>स्पेस या एंटर</b> दबाइए — कोड का खाना बन जाता है।</p><p>भाषा भी साथ लिखिए, जैसे ```java, फिर स्पेस या एंटर — खाने पर वही भाषा लग जाती है।</p><div data-nabi-p><pre data-nabi-lang=\"typescript\"><code class=\"language-typescript\">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>मोड़</h2><div data-nabi-p><details open><summary>मोड़ शीर्षक और भीतरी सामग्री से बनता है।</summary><p>आप तय कर सकते हैं कि यह बंद हालत में सहेजा जाए या खुली।</p></details></div><p></p><h2></h2><h2>टूलबार</h2><p>शीर्षक, पाठ स्वरूप, संरेखण, सूची, जोड़ने और दस्तावेज़ के उपकरण समूहों में हैं। कंप्यूटर पर उपकरण खुले दिखते हैं; मोबाइल पर त्वरित उपकरण और पूरा पैलेट मिलता है। चुनी गई तालिका या फ़्लोट के गुण टूलबार के नीचे दिखते हैं।</p><p></p><h2>शॉर्टकट</h2><p><b>Shift तेज़ी से दो बार दबाएँ</b> ताकि कीबोर्ड से उपकरण चुन सकें। कंप्यूटर पर खुले टूलबार और मोबाइल पर पूरे पैलेट में जाएँ। Tab से समूह बदलें, तीर कुंजियों से उपकरण चुनें और Enter से चलाएँ।</p><p>उद्धरण, कोड या संक्षिप्त करने वाले ब्लॉक के अंत में Enter तेज़ी से दो बार दबाकर बाहर आएँ। दो बार दबाने का डिफ़ॉल्ट अंतराल 180ms है।</p><p></p><p></p><h2>स्वतः सजावट</h2><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>उदाहरण</p></th><th><p>कुंजी</p></th><th><p>परिणाम</p></th></tr><tr><td><p>#</p></td><td><p>स्पेस</p></td><td><p>शीर्षक</p></td></tr><tr><td><p>-</p></td><td><p>स्पेस</p></td><td><p>बिंदु-सूची</p></td></tr><tr><td><p>1.</p></td><td><p>स्पेस</p></td><td><p>क्रमांकित सूची</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>स्पेस</p></td><td><p>जाँच-सूची</p></td></tr><tr><td><p>&gt;</p></td><td><p>स्पेस</p></td><td><p>उद्धरण</p></td></tr><tr><td><p>``` · ```ts</p></td><td><p>स्पेस · एंटर</p></td><td><p>कोड का खाना</p></td></tr><tr><td><p>---</p></td><td><p>एंटर</p></td><td><p>विभाजक रेखा</p></td></tr><tr><td><p>https://…</p></td><td><p>स्पेस · एंटर</p></td><td><p>कड़ी</p></td></tr></table></div></div><p></p><p></p><h3>निर्गम फलन</h3><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>फलन</p></th><th><p>परिणाम</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>बिना DOM के भी चलता है</h2><p>JSON से HTML बनाने के लिए <b>DOM की ज़रूरत नहीं</b>।</p><p>सर्वर (Node.js) भी सहेजे गए NABI TREE को पढ़कर उन्हीं नियमों से HTML बना सकता है।</p><p></p><h2>मोबाइल के अनुकूल</h2><div data-nabi-p><ul><li><p><b>मोबाइल UI</b> — स्क्रीन की चौड़ाई के अनुसार संपादन टूल व्यवस्थित करता है।</p></li><li><p><b>मोबाइल कीबोर्ड समायोजन</b> — कीबोर्ड खुलने पर संपादन क्षेत्र की ऊँचाई समायोजित करता है।</p></li><li><p><b>लचीला आकार</b> — ज़ूम बढ़ाने और घटाने के अनुरूप ढलने के लिए मुख्य लेआउट में rem इकाइयों का उपयोग करता है।</p></li><li><p><b>कई भाषाएँ</b> — भाषा और पाठ की दिशा के अनुसार लोकेल और टाइपफ़ेस सेट किए जा सकते हैं।</p></li></ul></div><p></p><h2>अपने मन का रूप</h2><div data-nabi-p><ul><li><p><b>अपना wing</b> — कोई सुविधा चाहिए तो खुद बनाकर लगा लीजिए।</p></li><li><p><b>अपना CSS</b> — रंग, कोने और अंतराल सब --nabi-* से तय हैं, गहरा हो या उजला — आपकी मर्ज़ी।</p></li><li><p><b>मुक्त स्रोत</b> — GitHub पर मुक्त स्रोत के रूप में उपलब्ध।</p></li></ul></div><div data-nabi-p><hr/></div><p>दस्तावेज़ देखिए → <a href=\"https://nabi.saro.me/\">nabi.saro.me</a></p>",
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
    '<p>टेक्स्ट चुनकर हाइलाइटर बटन दबाने पर रंगों की सूची खुलती है। <mark data-color="yellow">पीला</mark>·<mark data-color="green">हरा</mark>·<mark data-color="cyan">आसमानी</mark>·<mark data-color="pink">गुलाबी</mark>·<mark data-color="purple">बैंगनी</mark>·<mark data-color="orange">नारंगी</mark> में से चुन सकते हैं।</p><p>हाइलाइट किए हुए टेक्स्ट पर कैरेट रखने पर संदर्भ टूल से रंग बदला जा सकता है।</p>',
  demo_html_text_color:
    '<p>चुने हुए टेक्स्ट पर <span data-color="green">हरा</span>·<span data-color="coral">मूँगा</span>·<span data-color="violet">बैंगनी</span>·<span data-color="amber">अंबर</span>·<span data-color="blue">नीला</span> लगाया जा सकता है।</p><p><mark data-color="yellow">हाइलाइटर और</mark> <span data-color="blue">टेक्स्ट का रंग साथ भी लगाया जा सकता है।</span></p>',
  demo_html_heading:
    '<h1>शीर्षक 1</h1><h2>शीर्षक 2</h2><h3>शीर्षक 3</h3><p>मुख्य पाठ। खाली पंक्ति में # और स्पेस टाइप करने से भी शीर्षक बनता है।</p>',
  demo_html_bullet_list:
    '<ul><li>बुलेट सूची</li><li>Tab से इंडेंट, Shift+Tab से बाहर<ul><li>नेस्टेड आइटम</li></ul></li></ul><p>खाली पंक्ति में - और स्पेस टाइप करने से भी सूची बनती है।</p>',
  demo_html_ordered_list:
    '<ol><li>क्रमांकित सूची</li><li>आइटम जोड़ने या हटाने पर संख्याएँ खुद बदल जाती हैं</li></ol><p>खाली पंक्ति में 1. और स्पेस टाइप करने से भी बनती है।</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">टेक्स्ट के आगे का बक्सा दबाएँ</li><li data-nabi-checked="false">चेक की स्थिति दस्तावेज़ के साथ सहेजी जाती है</li></ul><p>खाली पंक्ति में [ ] या [x] टाइप करने से भी बनती है।</p>',
  demo_html_table:
    "<p>सेल में कई अनुच्छेद और ब्लॉक रख सकते हैं तथा पृष्ठभूमि के रंग से सामग्री अलग पहचान सकते हैं। नीचे की तालिका के पाठ और चित्र सीधे बदलकर देखें।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>संदर्भ सामग्री</p></th><th data-nabi-cell-color=\"cyan\"><p>काम के नोट्स</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">चित्र और उसका विवरण एक ही सेल में हैं।</p></td><td data-nabi-cell-color=\"yellow\"><h3>लचीले अनुच्छेद</h3><p>नया अनुच्छेद बनाने के लिए Enter और उसी अनुच्छेद में नई पंक्ति के लिए Shift+Enter दबाएँ।</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>सेल का पृष्ठभूमि रंग बदलना</p></li><li data-nabi-checked=\"false\"><p>सूची में Tab से इंडेंट करना</p></li><li data-nabi-checked=\"false\"><p>कई सेल चुनकर एक रंग लगाना</p></li></ul></div></td><td><div data-nabi-p><details open><summary>संपादन के सुझाव देखने के लिए क्लिक करें</summary><p>सेल में संक्षिप्त करने वाले ब्लॉक, उद्धरण, कोड और वीडियो भी रख सकते हैं।</p><p>सेल मर्ज करने पर हर सेल की सामग्री क्रम में सुरक्षित रहती है।</p></details></div></td></tr></table></div></div><p>सेल में क्लिक करने पर पृष्ठभूमि रंग और पंक्ति व स्तंभ के उपकरण दिखते हैं। कई सेल चुनकर रंग और संरेखण एक साथ बदल सकते हैं। पूरी तालिका की जगह बदलने के लिए “पूरी तालिका चुनें” चुनकर संरेखण उपकरण इस्तेमाल करें।</p><p>सामान्य अनुच्छेद में Tab अगले सेल पर जाता है; सूची और कोड में इंडेंट करता है। सामग्री या स्वरूप साफ़ करने पर सेल का पृष्ठभूमि रंग बना रहता है।</p>",
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="नाबी नोट लोगो" data-nabi-width="50"></div><p>चौड़ाई और संरेखण बक्से के लिए चित्र पर क्लिक करें।</p>',
  demo_html_youtube:
    '<p>टूलबार के YouTube बटन का उपयोग करें, या सीधे वीडियो का पता चिपकाएँ — एम्बेड यहीं आ जाएगा।</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>कर्सर को कोड के भीतर रखें तो संदर्भ पट्टी में भाषा का खाना दिखता है।</p>',
  demo_html_details:
    '<details open=""><summary>यहाँ दबाकर समेटें</summary><p>समेटी हुई स्थिति दस्तावेज़ के साथ सहेजी जाती है — पाठक इसे वैसे ही देखते हैं जैसे लेखक ने छोड़ा था।</p></details>',
  demo_html_quote:
    '<blockquote><p>किसी दूसरे लेख से लिया गया वाक्य या ज़ोर देने योग्य बात उद्धरण में रखी जा सकती है।</p><p>उद्धरण में कई अनुच्छेद और ब्लॉक साथ रखे जा सकते हैं।</p></blockquote><p>खाली पंक्ति में &gt; लिखकर स्पेस दबाने पर वह पंक्ति उद्धरण में बदल जाती है।</p>',
  demo_html_divider:
    '<p>विभाजक रेखा के ऊपर का अनुच्छेद।</p><hr><p>और नीचे वाला। किसी पंक्ति में सिर्फ़ --- टाइप करके Enter दबाने से भी रेखा बनती है।</p>',
  demo_html_align:
    '<p data-nabi-align="l">बाईं ओर संरेखित</p><p data-nabi-align="c">बीच में संरेखित</p><p data-nabi-align="r">दाईं ओर संरेखित</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">बहुत छोटा — पाद-टिप्पणी या पूरक विवरण के लिए।</p><p data-nabi-size="sm">छोटा — मुख्य पाठ से एक स्तर छोटा।</p><p>सामान्य आकार का अनुच्छेद है। आकार चुनने की सूची में भी हर अक्षर आकार वैसे ही दिखता है।</p><p data-nabi-size="lg">बड़ा — ज़ोर देने वाले वाक्य के लिए।</p><p data-nabi-size="xl">बहुत बड़ा — शीर्षक के नीचे की भूमिका के लिए।</p><p>अक्षर का आकार चुने हुए दायरे पर लागू होता है। कोई टेक्स्ट चुने बिना केवल कैरेट होने पर यह मौजूदा अनुच्छेद के अक्षरों पर लागू होता है।</p>',
  demo_html_typeface:
    '<p>इस अनुच्छेद पर अलग से कोई फ़ॉन्ट नहीं चुना गया है। यह पेज के डिफ़ॉल्ट फ़ॉन्ट में दिखता है।</p><p data-nabi-typeface="serif">इस अनुच्छेद पर सेरिफ़ फ़ॉन्ट लगाया गया है। सेरिफ़ जैसा फ़ॉन्ट-परिवार चुनने पर असली फ़ॉन्ट साइट की CSS सेटिंग का अनुसरण करता है।</p><p data-nabi-typeface="mono">इस अनुच्छेद पर मोनोस्पेस फ़ॉन्ट लगाया गया है। हर अक्षर की चौड़ाई एक-सी होने से संख्या या कोड को पंक्तिबद्ध करना आसान होता है — 0O 1lI</p><p data-nabi-typeface="cursive">हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · Cursive · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный · خط اليد</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">पहला अक्षर तीन पंक्तियों तक फैलता है और पाठ उसके बगल से बहता है। छोटे अनुच्छेद में भी उतनी जगह पहले से आरक्षित रहती है, इसलिए नीचे का ब्लॉक कभी दबता नहीं।</p><p>इस अनुच्छेद पर यह लागू नहीं है।</p>',
  demo_html_clear_format:
    '<p><b>बोल्ड</b>, <i>तिरछा</i>, <u>रेखांकित</u> या <s>कटा हुआ</s> टेक्स्ट चुनकर मिटाने वाला बटन दबाएँ।</p><p>सिर्फ़ अक्षर-रूपण मिटता है — ब्लॉक जस के तस रहते हैं।</p>',
  demo_html_upload:
    "<p>फ़ाइल को संपादन क्षेत्र में खींचें या चिपकाएँ। यह डेमो वास्तविक अपलोड सर्वर से जुड़ा नहीं है, इसलिए फ़ाइलें सर्वर पर सहेजी नहीं जातीं।</p><p>अपलोड पूरा होने पर फ़ाइल दस्तावेज़ में <a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>संलग्न फ़ाइल</a> के रूप में रह सकती है।</p>",


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
  demo_tree: 'nabi-tree',
  demo_loading: 'संपादक लोड हो रहा है…',

  page_not_found: 'पेज नहीं मिला',

  demo_html_float: "<div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>एक नज़र में</b></p><p>पाठ, चित्र और तालिकाओं के लिए छोटा सहायक क्षेत्र।</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>स्थिति</p></td><td><p>दायाँ</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>अधिकतम चौड़ाई</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>मुख्य पाठ के साथ अतिरिक्त विवरण या छोटी संदर्भ सामग्री रखने के लिए फ़्लोट क्षेत्र इस्तेमाल करें। चौड़े दस्तावेज़ में यह पाठ क्षेत्र के बगल में बहता है। अंदर क्लिक करके उसी संपादक में पाठ बदलें और चित्र या तालिकाएँ जोड़ें।</p><p>गुण उपकरण खोलने के लिए कर्सर क्षेत्र में रखें। बाईं या दाईं स्थिति बदलें और पाठ के अनुसार 20, 30, 40 या 50% अधिकतम चौड़ाई चुनें। चिपकाई गई तालिकाएँ और चित्र भी क्षेत्र के अंदर रहते हैं।</p><p>चुने हुए अनुच्छेदों को भी क्षेत्र में लपेट सकते हैं। चौड़ाई के पास का क्षेत्र हटाने वाला बटन सामग्री मुख्य दस्तावेज़ में रहने देता है। पूर्वावलोकन में संपादन की बिंदुदार सीमा छिप जाती है; संकरे दस्तावेज़ और प्रिंट में सामग्री एक स्तंभ में चलती है।</p>",
  menu_block_float: "फ़्लोट क्षेत्र",
}
