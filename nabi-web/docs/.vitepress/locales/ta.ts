export const ta = {
  label: 'தமிழ்',
  lang: 'ta',
  link: '/ta/',
  description: 'NABI NOTE — திறந்த மூல WYSIWYG தொகுப்பி.',

  menu_docs: 'ஆவணங்கள்',
  menu_start: 'வழிகாட்டி',
  menu_getting_started: 'அடிப்படை பயன்பாடு',
  menu_cdn: 'CDN பயன்படுத்துதல்',
  menu_features: 'சிறகுகள்',
  menu_style_guide: 'CSS தோற்றங்கள்',
  menu_icon_theme: "ஐகான் தீம்கள்",
  menu_rendering: 'SSR அமைப்பு',
  menu_extend_guide: 'தனிப்பயன் சிறகுகள்',
  menu_intro_vibe_coding: 'AI Vibe Coding',



  menu_projects: 'திட்டங்கள்',

  menu_inline: 'வரிக்குள்',
  menu_inline_bold: 'தடிமன்',
  menu_inline_italic: 'சாய்வு',
  menu_inline_underline: 'அடிக்கோடு',
  menu_inline_strikethrough: 'கோடிட்ட நீக்கம்',
  menu_inline_superscript: 'மேல்குறி',
  menu_inline_subscript: 'கீழ்க்குறி',
  menu_inline_link: 'இணைப்பு',
  menu_inline_highlight: 'முன்னிலைப்படுத்து',
  menu_inline_text_color: 'உரை நிறம்',

  menu_block: 'தொகுதி',
  menu_block_heading: 'தலைப்பு',
  menu_block_bullet_list: 'புள்ளிப் பட்டியல்',
  menu_block_ordered_list: 'எண் பட்டியல்',
  menu_block_task_list: 'சரிபார்ப்புப் பட்டியல்',
  menu_block_table: 'அட்டவணை',
  menu_block_image: 'படம்',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'நிரல்',
  menu_block_details: 'விவரங்கள்',
  menu_block_quote: 'மேற்கோள்',
  menu_block_divider: 'பிரிப்பான்',

  menu_etc: 'மற்றவை',
  menu_etc_align: 'சீரமை',
  menu_etc_dropcap: 'பெரிய முதலெழுத்து',
  menu_etc_typeface: 'எழுத்துரு',
  menu_etc_font_size: 'எழுத்தளவு',
  menu_etc_clear_format: 'வடிவமைப்பை அழி',
  menu_etc_upload: 'கோப்பு பதிவேற்றம்',

  search: 'தேடு',
  search_no_results: 'முடிவுகள் இல்லை',
  search_hint: 'தேடல் சொல்லை உள்ளிடுக',
  search_move: 'நகர்த்து',
  search_open: 'திற',
  search_close: 'மூடு',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c"></p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">திறந்த மூல WYSIWYG தொகுப்பி</span></i></span></p><p></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> என்பது திறந்த மூல WYSIWYG தொகுப்பி. வடிவமைப்பு, சீரமைப்பு, அட்டவணை, பதிவேற்றம் உள்ளிட்ட அம்சங்கள் மையத்திலிருந்து wings எனும் தனித்தனி தொகுதிகளாகப் பிரிக்கப்பட்டுள்ளன. தேவையான wings-ஐ மட்டும் தேர்ந்து தொகுப்பியை அமைக்கலாம்; நீங்களே உருவாக்கிய wings-ஐயும் இணைக்கலாம். இது எளிய JavaScript-ல் எழுதப்பட்டதால் React அல்லது Vue போன்ற கட்டமைப்புகளிலும் பயன்படுத்தலாம். build அமைப்பு இல்லாத பக்கங்களில் <b>CDN நூலகத்துடன்</b>இதன் சொந்த ஆவண வடிவமான <b>NABI TREE</b>, உலாவி DOM இல்லாத Node.js சூழலிலும் HTML-ஆக மாற்றலாம். உள்ளீட்டு ஆவணங்கள் பதிவுசெய்யப்பட்ட விதிகளால் சரிசெய்யப்படுகின்றன; HTML உருவாகும்போது உரை, பண்புகள் escape செய்யப்படுகின்றன, இணைப்பு முகவரிகள் சரிபார்க்கப்படுகின்றன. ஆனால் தனிப்பயன் wings மற்றும் சேவையகத் தரவை பயன்பாட்டின் பாதுகாப்புக் கொள்கைப்படி தனியாக ஆய்வு செய்ய வேண்டும். CSS மாறிகள் மற்றும் rem அடிப்படையிலான அமைப்பு மூலம் நிறத்தோற்றத்தையும் அளவையும் மாற்றலாம்; இருண்ட நிலை மற்றும் பல மொழிகளுக்கான எழுத்துரு அமைப்புகளும் உள்ளன. அட்டவணை வரிசைப்படுத்தல், உள்ளூர் வரலாறு, AI உதவியுடன் ஆவணப் பணி அனைத்தும் ஒரே ஆவண மாதிரியில் தொடர்கின்றன.</span></p><p></p><h2>எழுத்துரு</h2><p>Sans serif (இயல்புநிலை), serif, monospace, cursive ஆகிய ஒவ்வொரு குடும்பமும் எழுத்துமுறைக்கு ஏற்ற எழுத்துருக்களை அடுக்குகிறது. எந்த மொழியில் எழுதினாலும் அந்தக் குடும்பத்தின் வடிவம் நிலைக்கும்; கையெழுத்து வடிவம் இல்லாத எழுத்துமுறை உலாவியின் இயல்புநிலை எழுத்துருவுக்கு மாறும். <b>இயல்புநிலை எழுத்துருவை ஹோஸ்ட் தீர்மானிக்கிறது.</b></p><p></p><p>கீழே ஒவ்வொரு குடும்பமும் காட்டப்பட்டுள்ளது <b>பல மொழிகளில்</b>.</p><p></p><p><span data-nabi-typeface="sans"><span data-nabi-size="lg">சான்ஸ் செரிஃப் · Sans serif · 산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie</span></span></p><p></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">செரிஃப் · Serif · 세리프 · 明朝体 · 衬线 · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie</span></span></p><p></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">ஒற்றையகலம் · Monospace · 고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato</span></span></p><p></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">கையெழுத்து · Cursive · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</span></span></p><p></p><p></p><h2>உரை அளவு</h2><p><span data-nabi-size="xs">மிகச் சிறியது</span></p><p><span data-nabi-size="sm">சிறியது</span></p><p><span data-nabi-size="lg">பெரியது</span></p><p><span data-nabi-size="xl">மிகப் பெரியது</span></p><p></p><p></p><h2>தலைப்பு</h2><p>காலி வரியில் # எனத் தட்டச்சிட்டு இடைவெளி அழுத்தினால் அது தலைப்பாக மாறும்.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>தடிமன் · சாய்வு · அடிக்கோடு · அடித்தல்</h2><p><b>தடிமன்</b> <i>சாய்வு</i> <u>அடிக்கோடு</u> <s>அடித்தல்</s> — ஒரு எடுத்துக்காட்டு.</p><p><b><i><s><u>இவற்றை ஒன்றன்மேல் ஒன்றாகவும் பயன்படுத்தலாம்.</u></s></i></b></p><h3>மேல்குறி மற்றும் கீழ்க்குறி</h3><p>பரப்பளவு 3.5m<sup>2</sup> அடிக்குறிப்பு இவ்வாறு சேர்க்கப்படும்.<sup>1</sup></p><p>நீர் H<sub>2</sub>O.</p><p></p><p></p><h2>உரை நிறம் · முன்னிலைப்படுத்தல்</h2><p>ஒளி மற்றும் இருண்ட நிலை இரண்டிலும் படிக்கத் தகுந்தவாறு வண்ணத் தட்டு தேர்ந்தெடுக்கப்பட்டுள்ளது.</p><p>உரை நிறம் <span data-color="green">பச்சை</span> · <span data-color="coral">பவளம்</span> · <span data-color="violet">வயலட்</span> · <span data-color="amber">அம்பர்</span> · <span data-color="blue">நீலம்</span></p><p>முன்னிலைப்படுத்தல் <mark data-color="yellow">மஞ்சள்</mark> · <mark data-color="green">பச்சை</mark> · <mark data-color="cyan">சியான்</mark> · <mark data-color="pink">இளஞ்சிவப்பு</mark> · <mark data-color="purple">ஊதா</mark> · <mark data-color="orange">ஆரஞ்சு</mark></p><p></p><p></p><h2>இணைப்பு</h2><p>முகவரியை உள்ளிடுங்கள்; அது ஒரு <a href="https://nabi.saro.me/">இணைப்பு</a>.</p><p>http://, https:// URL-களையும் . அல்லது /-இல் தொடங்கும் இதே தளப் பாதைகளையும் பயன்படுத்தலாம். javascript: போன்ற முகவரிகள் அனுமதிக்கப்படாது.</p><p>உதாரணமாக <a href="https://nabi.saro.me/">https://nabi.saro.me</a> எனத் தட்டச்சிட்டு இடைவெளி அல்லது Enter அழுத்துங்கள்; இங்கே காண்பதுபோல் தானாக மாற்றப்படும்.</p><h3>இணைப்பு திறப்பு</h3><p>ஆவணம் இணைப்பு முகவரியை மட்டுமே சேமிக்கிறது; அதை காட்டும் பக்கமே இணைப்புகள் எப்படித் திறக்கப்படும் என்பதை முடிவு செய்கிறது.</p><h3>இணைப்பு கோப்பு</h3><p>படமல்லாத எதையும் பதிவேற்றினால் கீழே உள்ளதைப் போன்ற கோப்பு வடிவ இணைப்பு உருவாகும்.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>இணைப்பு கோப்பு</a> என்ற வடிவில் இருக்கும்.</p><p></p><p></p><h2>சீரமைப்பு</h2><p>இடப்புறச் சீரமைப்பு</p><p>நடுவண் சீரமைப்பு</p><p>வலப்புறச் சீரமைப்பு</p><h3>தலைப்புகளையும் சீரமைக்கலாம்.</h3><p></p><p></p><h2>பட்டியல்கள்</h2><h3>புள்ளிப் பட்டியல்</h3><p>காலி வரியில் - எனத் தட்டச்சிட்டு <b>இடைவெளி</b> அழுத்தினால் அது புள்ளிப் பட்டியலாக மாறும்.</p><div data-nabi-p><ul><li><p>இது ஒரு புள்ளிப் பட்டியல் உருப்படி</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab உள்தள்ளவும் வெளித்தள்ளவும் பயன்படும்.</p></li></ul></div></li></ul></div><h3>எண் பட்டியல்</h3><p>காலி வரியில் 1. எனத் தட்டச்சிட்டு <b>இடைவெளி</b> அழுத்தினால் எண் பட்டியல் கிடைக்கும்.</p><div data-nabi-p><ol><li><p>முதல்</p></li><li><p>இரண்டாம்</p></li><li><p>மூன்றாம்</p></li></ol></div><h3>சரிபார்ப்புப் பட்டியல்</h3><p>காலி வரியில் [ ] அல்லது [x] எனத் தட்டச்சிட்டு <b>இடைவெளி</b> அழுத்தினால் சரிபார்ப்புப் பட்டியல் கிடைக்கும்.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>இந்த உருப்படி குறிக்கப்பட்டுள்ளது.</p></li><li data-nabi-checked="false"><p>இது இன்னும் குறிக்கப்படவில்லை.</p></li></ul></div><p></p><p></p><h2>அட்டவணை</h2><p>ஒன்றை உருவாக்க கருவிப்பட்டையில் உள்ள அட்டவணை பொத்தானை அழுத்துங்கள்; பின்னர் வரிசைகள், நெடுவரிசைகளைச் சேர்க்கவும், நீக்கவும், இணைக்கவும் முடியும்.</p><h3>நெடுவரிசை வரிசைப்படுத்தல்</h3><p><b>முன்னோட்டம்</b> முதலில் திறக்கும்; பிறகு <b>கையிருப்பு</b> மற்றும் <b>விலை</b> தலைப்பு கலங்களை மாறிமாறி அழுத்துங்கள்.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>மாதிரி</p></th><th><p>கையிருப்பு</p></th><th><p>விலை</p></th><th><p>எடை</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>TBD</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>விலை</b> அனைத்தும் எண்கள்; ஆகவே எண் அடிப்படையில் வரிசைப்படுத்தப்படும்.</p><p><b>கையிருப்பு</b> கடைசி கலத்தில் எழுத்துகள் இருப்பதால் உரையாக வரிசைப்படுத்தப்படும்.</p><p></p><p></p><h2>பிரிப்பான்</h2><p>--- எனத் தட்டச்சிட்டு Enter அழுத்தினால் அது பிரிப்பானாக மாறும்.</p><div data-nabi-p><hr/></div><p></p><p></p><h2>படம்</h2><p>அகலத்தை 30% முதல் 100% வரை அமைக்கலாம்; இடது, நடு அல்லது வலப்புறத்தில் வைக்கலாம்.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p></p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p></p><p></p><h2>பதிவேற்றம்</h2><p>படம் அல்லது கோப்பை தொகுப்பிக்குள் இழுத்து விட முயற்சிக்கவும்.</p><p>இங்கே பயன்படுத்துவது மாதிரிப் பதிவேற்றம்; ஒரு அமைப்பு அதை உங்கள் சேவையகத்துடன் இணைக்கும்.</p><p>பதிவேற்றம் தோல்வியுற்றால் படம் அல்லது கோப்பு தொகுப்பியிலிருந்து அகற்றப்படும்.</p><p></p><p></p><h2>மேற்கோள்</h2><div data-nabi-p><blockquote><p>காலி வரியில் &gt; எனத் தட்டச்சிட்டு <b>இடைவெளி</b> அழுத்தினால் மேற்கோள் பெட்டி கிடைக்கும்.</p><p>அது பல வரிகளுக்கு நீளலாம்.</p></blockquote></div><p></p><p></p><h2>நிரல்</h2><p>காலி வரியில் \`\`\` எனத் தட்டச்சிட்டு <b>இடைவெளி அல்லது Enter</b> அழுத்தினால் நிரல் பெட்டி கிடைக்கும்.</p><p>\`\`\`java போல மொழியையும் எழுதி இடைவெளி அல்லது Enter அழுத்தினால் அந்த மொழி அமைந்த நிரல் பெட்டி கிடைக்கும்.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>விவரங்கள்</h2><div data-nabi-p><details open><summary>விவரங்கள் சுருக்கமும் உட்பகுதியும் கொண்டது.</summary><p>மடக்கியோ திறந்தோ சேமிப்பதைக் தேர்ந்தெடுக்கலாம்.</p></details></div><p></p><h2></h2><h2>குறுக்குவழிகள்</h2><p><b>Shift-ஐ விரைவாக இருமுறை அழுத்துங்கள்</b> ஒவ்வோர் அம்சத்தின் குறுக்குவழியும் கருவிப்பட்டையில் தோன்றும்.</p><p></p><p></p><h2>தானியங்கு வடிவமைப்பு</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>எடுத்துக்காட்டு</p></th><th><p>செயல் விசை</p></th><th><p>முடிவு</p></th></tr><tr><td><p>#</p></td><td><p>இடைவெளி</p></td><td><p>தலைப்பு</p></td></tr><tr><td><p>-</p></td><td><p>இடைவெளி</p></td><td><p>புள்ளிப் பட்டியல்</p></td></tr><tr><td><p>1.</p></td><td><p>இடைவெளி</p></td><td><p>எண் பட்டியல்</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>இடைவெளி</p></td><td><p>சரிபார்ப்புப் பட்டியல்</p></td></tr><tr><td><p>&gt;</p></td><td><p>இடைவெளி</p></td><td><p>மேற்கோள்</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>இடைவெளி · Enter</p></td><td><p>நிரல் பெட்டி</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>பிரிப்பான்</p></td></tr><tr><td><p>https://…</p></td><td><p>இடைவெளி · Enter</p></td><td><p>Link</p></td></tr></table></div></div><p></p><p></p><h3>வெளியீட்டு செயல்பாடுகள்</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>செயல்பாடு</p></th><th><p>முடிவு</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>DOM இல்லாமலும் செயல்படும்</h2><p>JSON-இலிருந்து HTML-ஆக மாற்ற <b>DOM தேவையில்லை</b>.</p><p>சேவையகம் (Node.js) சேமித்துள்ள NABI TREE-ஐப் படித்து அதே விதிகளுடன் HTML உருவாக்க முடியும்.</p><p></p><h2>மொபைலுக்கு ஏற்றது</h2><div data-nabi-p><ul><li><p><b>மொபைல் UI</b> — பதிலளிக்கும் அமைப்பு மொபைல் UI-ஐ வழங்குகிறது.</p></li><li><p><b>மொபைல் விசைப்பலகை இடைவெளி</b> — விசைப்பலகை திறக்கும்போது அதன் உயரம் கணக்கில் கொள்ளப்படும்.</p></li><li><p><b>நெகிழ்வான அளவிடல்</b> — எல்லா அளவுகளும் rem-ல் எழுதப்பட்டுள்ளன.</p></li><li><p><b>பல மொழிகள்</b> — பல மொழிகளுக்கு ஆதரவு உள்ளது.</p></li></ul></div><p></p><h2>தனிப்பயனாக்கம்</h2><div data-nabi-p><ul><li><p><b>உங்கள் சொந்த wing</b> — தேவையான அம்சத்தை நீங்களே உருவாக்கி பதிவுசெய்யலாம்.</p></li><li><p><b>உங்கள் சொந்த CSS</b> — நிறங்கள், மூலைகள், இடைவெளிகள் அனைத்தும் --nabi-* ஆக வரையறுக்கப்பட்டுள்ளதால் தோற்றத்தை நீங்கள் அமைக்கலாம்.</p></li><li><p><b>திறந்த மூலம்</b> — இது GitHub-இல் திறந்த மூலமாக உள்ளது.</p></li></ul></div><div data-nabi-p><hr/></div><p>ஆவணங்களைப் படிக்கவும் → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'சிறகுகள்',
  demo_wings_all: 'அனைத்தும் இயக்கு',
  demo_wings_none: 'அனைத்தும் நிறுத்து',
  demo_zoom: 'பெரிதாக்கு',
  demo_zoom_out: 'சிறிதாக்கு',
  demo_zoom_in: 'பெரிதாக்கு',
  demo_zoom_reset: 'மீட்டமை',
  demo_sticky: 'நிலையான கருவிப்பட்டை',
  demo_sticky_keyboard: 'மொபைல் விசைப்பலகை இடைவெளி',
  demo_sticky_height: 'இடமாற்றம்',
  demo_sticky_unit: 'இடமாற்ற அலகு',
  demo_typeface_base: 'அடிப்படை எழுத்துரு',
  demo_typeface_sans: 'சான்ஸ் செரிஃப்',
  demo_typeface_serif: 'செரிஃப்',
  demo_typeface_mono: 'ஒற்றையகலம்',
  demo_typeface_cursive: 'கையெழுத்து',
  demo_html_small: 'இந்த அம்சத்தைப் பயன்படுத்திப் பாருங்கள்.',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>ஒரு வாக்கியத்தில் <b>முக்கியமான சொற்களை</b> தடிமனாகக் காட்டலாம். வலியுறுத்த வேண்டிய உரையைத் தேர்ந்தெடுத்து கருவிப்பட்டையில் உள்ள <b>B</b> பொத்தானை அழுத்திப் பாருங்கள்.</p>',
  demo_html_italic:
    '<p>மேற்கோள்களும் அறிமுகமில்லாத சொற்களும் <i>சாய்வெழுத்தில்</i> இடப்படும். இந்த வாக்கியத்தைத் தேர்ந்தெடுத்து முயற்சிக்கவும்.</p>',
  demo_html_underline:
    '<p>இங்கே ஒரு <u>அடிக்கோடு</u> உள்ளது. அந்த எழுத்துகளைத் தேர்ந்தெடுத்து அதை மீண்டும் அழுத்தினால் நீங்கும்.</p>',
  demo_html_strikethrough: '<p><s>$19.00</s> $9.90 — முந்தைய விலையையும் காணும் வகையில் வையுங்கள்.</p>',
  demo_html_superscript:
    '<p>பரப்பளவு 3.5m<sup>2</sup>; அடிக்குறிப்புகள் இவ்வாறு மேலெழுத்தாகத் தோன்றும்.<sup>1</sup></p>',
  demo_html_subscript: '<p>நீர் H<sub>2</sub>O; குமிழ்களுக்கு CO<sub>2</sub> காரணம்.</p>',
  demo_html_link:
    '<p>முகவரியை உள்ளிட்டால் <a href="https://example.com">இதைப் போன்ற இணைப்பு</a> உருவாகும். ஆவணம் இணைப்பு முகவரியை மட்டுமே சேமிக்கிறது; அதை காட்டும் பக்கமே அதே சாளரத்திலா புதிய சாளரத்திலா திறப்பதென முடிவு செய்கிறது.</p>',
  demo_html_highlight:
    '<p>உரையைத் தேர்ந்தெடுத்து முன்னிலைப்படுத்தல் பொத்தானை அழுத்தினால் வண்ணத் தட்டு திறக்கும். <mark data-color="yellow">மஞ்சள்</mark> · <mark data-color="green">பச்சை</mark> · <mark data-color="cyan">சியான்</mark> · <mark data-color="pink">இளஞ்சிவப்பு</mark> · <mark data-color="purple">ஊதா</mark> · <mark data-color="orange">ஆரஞ்சு</mark> ஆகியவற்றைத் தேரலாம்.</p><p>முன்னிலைப்படுத்திய உரைக்குள் கர்சரை வைத்து சூழல் கருவிகளிலிருந்து நிறத்தை மாற்றலாம்.</p>',
  demo_html_text_color:
    '<p>தேர்ந்தெடுத்த உரைக்கு <span data-color="green">பச்சை</span> · <span data-color="coral">பவளம்</span> · <span data-color="violet">வயலட்</span> · <span data-color="amber">அம்பர்</span> · <span data-color="blue">நீலம்</span> இடலாம்.</p><p><mark data-color="yellow">முன்னிலைப்படுத்தலையும்</mark> <span data-color="blue">உரை நிறத்தையும் ஒன்றாகப் பயன்படுத்தலாம்.</span></p>',
  demo_html_heading:
    '<h1>தலைப்பு 1</h1><h2>தலைப்பு 2</h2><h3>தலைப்பு 3</h3><p>பத்தி உரை. காலி வரியில் # எனத் தட்டச்சிட்டு இடைவெளி அழுத்தினாலும் தலைப்பு உருவாகும்.</p>',
  demo_html_bullet_list:
    '<ul><li>ஒரு புள்ளிப் பட்டியல்</li><li>Tab உள்தள்ளும், Shift+Tab வெளித்தள்ளும்<ul><li>ஒரு உட்பட்டியல் உருப்படி</li></ul></li></ul><p>காலியான வரியில் - எனத் தட்டச்சிட்டு இடைவெளி அழுத்தினாலும் ஒன்று உருவாகும்.</p>',
  demo_html_ordered_list:
    '<ol><li>ஒரு எண் பட்டியல்</li><li>உருப்படியைச் சேர்த்தாலோ நீக்கினாலோ எண்கள் தானாக மாறும்</li></ol><p>காலி வரியில் 1. எனத் தட்டச்சிட்டு இடைவெளி அழுத்தினாலும் அது உருவாகும்.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">உரைக்கு முன் உள்ள பெட்டியை அழுத்துங்கள்</li><li data-nabi-checked="false">குறிக்கப்பட்ட நிலை ஆவணத்துடன் சேமிக்கப்படும்</li></ul><p>காலி வரியில் [ ] அல்லது [x] எனத் தட்டச்சிட்டாலும் ஒன்று உருவாகும்.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>விசை</th><th>செயல்</th></tr><tr><td>Tab</td><td>அடுத்த கலம்</td></tr><tr><td>அம்புகள்</td><td>கட்டத்தில் நகர்தல்</td></tr></tbody></table><p>கர்சரை ஒரு கலத்தில் வைத்தால் சூழல் வரிசையில் வரிசை, நெடுவரிசை கட்டளைகள் தோன்றும்.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="NABI NOTE சின்னம்" data-nabi-width="50"></div><p>அகலம் மற்றும் சீரமைப்பு பெட்டியைப் பெற படத்தை அழுத்துங்கள்.</p>',
  demo_html_youtube:
    '<p>கருவிப்பட்டையில் YouTube பொத்தானைப் பயன்படுத்துங்கள் அல்லது காணொளி முகவரியை ஒட்டுங்கள் — உட்பொதிப்பு இங்கே தோன்றும்.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>கர்சரை நிரலுக்குள் வைத்தால் சூழல் வரிசையில் மொழிப் புலம் தோன்றும்.</p>',
  demo_html_details:
    '<details open=""><summary>மடக்க இங்கே அழுத்துங்கள்</summary><p>மடக்கிய நிலை ஆவணத்துடன் சேமிக்கப்படும் — ஆசிரியர் விட்டபடியே வாசகர்கள் காண்பார்கள்.</p></details>',
  demo_html_quote:
    '<blockquote><p>வேறொரு உரையிலுள்ள ஒரு வாக்கியத்தை, அல்லது தனியே காட்ட விரும்பும் உள்ளடக்கத்தை மேற்கோளாகக் குழுவாக்கலாம்.</p><p>ஒரு மேற்கோளில் பல பத்திகளும் தொகுதிகளும் இருக்கலாம்.</p></blockquote><p>காலியான வரியில் &gt; எனத் தட்டச்சிட்டு இடைவெளி அழுத்தினால் அந்த வரி மேற்கோளாக மாறும்.</p>',
  demo_html_divider:
    '<p>பிரிப்பானுக்கு மேலுள்ள ஒரு பத்தி.</p><hr><p>கீழும் ஒரு பத்தி. ஒரு வரியில் --- மட்டும் எழுதி Enter அழுத்தினாலும் பிரிப்பான் உருவாகும்.</p>',
  demo_html_align:
    '<p data-nabi-align="l">இடப்புறச் சீரமைப்பு</p><p data-nabi-align="c">நடுவண் சீரமைப்பு</p><p data-nabi-align="r">வலப்புறச் சீரமைப்பு</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">மிகச் சிறியது — அடிக்குறிப்புகள் அல்லது துணைக் குறிப்புகளுக்கு ஏற்றது.</p><p data-nabi-size="sm">சிறியது — பத்தி உரையைவிட ஒரு படி சிறியது.</p><p>இயல்புநிலை அளவிலுள்ள பத்தி. அளவுப் பட்டி ஒவ்வொரு உரை அளவும் தோன்றும் விதத்தில் காட்டும்.</p><p data-nabi-size="lg">பெரியது — வலியுறுத்த வேண்டிய வாக்கியத்திற்கு ஏற்றது.</p><p data-nabi-size="xl">மிகப் பெரியது — தலைப்புக்குக் கீழுள்ள அறிமுக வாக்கியத்திற்கு ஏற்றது.</p><p>எழுத்தளவு தேர்ந்தெடுத்த வரம்பில் பொருந்தும். கர்சர் மட்டும் இருந்தால் நடப்புப் பத்தியின் உரையில் பொருந்தும்.</p>',
  demo_html_typeface: "<p>இந்தப் பத்திக்கு வெளிப்படையான எழுத்துரு இல்லை. பக்கத்தின் இயல்புநிலை எழுத்துருவில் இது காட்டப்படுகிறது.</p><p data-nabi-typeface=\"serif\">இந்தப் பத்தி serif எழுத்துருவைப் பயன்படுத்துகிறது. serif போன்ற குடும்பத்தைத் தேர்ந்தெடுத்தால் உண்மையான எழுத்துருவை தள CSS தீர்மானிக்கும்.</p><p data-nabi-typeface=\"mono\">இந்தப் பத்தி monospace எழுத்துருவைப் பயன்படுத்துகிறது. எண்கள் அல்லது நிரலைச் சீரமைக்க நிலையான எழுத்து அகலம் உதவும் — 0O 1lI</p><p data-nabi-typeface=\"cursive\">கையெழுத்து · Cursive · 필기체 · 筆記体 · 手写体 · Schreibschrift · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · லายมือ · Corsivo</p>",
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">முதல் எழுத்து மூன்று வரிகளை நிறைத்து, உரை அதைச் சுற்றிப் பாயும். குறும்பத்திகளும் அந்த வரிகளுக்கான இடத்தை ஒதுக்கும்; ஆகவே கீழுள்ள தொகுதி உள்ளே தள்ளப்படாது.</p><p>இந்தப் பத்தியில் அது இல்லை.</p>',
  demo_html_clear_format:
    '<p><b>தடிமன்</b>·<i>சாய்வு</i>·<u>அடிக்கோடு</u>·<s>அடித்தல்</s> வடிவங்கள் பயன்படுத்திய உரையைத் தேர்ந்தெடுத்து வடிவமைப்பை அழி பொத்தானை அழுத்திப் பாருங்கள்.</p><p>தேர்ந்தெடுத்த உரையின் வரிக்குள் வடிவமைப்பு நீங்கும்; ஆனால் பத்தி மற்றும் தொகுதி அமைப்பு அப்படியே இருக்கும்.</p>',
  demo_html_upload:
    '<p>கோப்பைத் திருத்தும் பகுதியில் இழுத்து விடுங்கள் அல்லது ஒட்டுங்கள். இந்த மாதிரி உண்மையான பதிவேற்றச் சேவையகத்துடன் இணைக்கப்படவில்லை; எனவே கோப்புகள் சேவையகத்தில் சேமிக்கப்படாது.</p><p>பதிவேற்றம் முடிந்ததும் கோப்பு ஆவணத்தில் ஒரு <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">இணைப்பு கோப்பாக</a>.</p>',


  cdn_demo_lead: 'கீழுள்ள நிரலை {file} ஆகச் சேமித்து உலாவியில் திறக்கவும் — உடனே செயல்படுவதைப் பார்க்கலாம்.',
  cdn_demo_download: 'demo.html-ஐப் பதிவிறக்கு',
  cdn_code_minheight: 'தொகுப்பியின் குறைந்தபட்ச உயரம் — முதல் ஏற்றத்தில் ஒற்றை வரிப் பெட்டிபோல் தோன்றாமல் காக்கிறது. விருப்பப்படி மாற்றலாம்.',
  cdn_code_wings: 'பதிவேற்றத்தைத் தவிர அனைத்து சிறகுகளும்.',
  cdn_code_faces: 'எழுத்துருக்களில் சான்ஸ் மற்றும் செரிஃப் மட்டுமே சேர்க்கப்பட்டுள்ளன. மற்ற குடும்பங்களுக்கு தனியாக வலை எழுத்துருவை இறக்குமதி செய்யவும்.',
  code_copy: 'நிரலை நகலெடு',
  demo_install: 'நிறுவு',
  demo_code: 'நிரல்',
  demo_tree: 'nabi-tree',
  demo_loading: 'தொகுப்பி ஏற்றப்படுகிறது…',

  page_not_found: 'பக்கம் கிடைக்கவில்லை',
}
