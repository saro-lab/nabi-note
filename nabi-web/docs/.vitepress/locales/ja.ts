// 옮겼다 — 키 하나라도 빠지면 타입 오류라 파일이 통째로 채워져 있어야 한다.
// Translated — a missing key is a type error, so the file must stay filled in whole.
export const ja = {
  menu_compare: "比較",
  menu_merge: "マージ",
  menu_inline_footnote: "脚注",
  demo_html_footnote: "<p>WYSIWYG<sup data-nabi-fn=\"WYSIWYG は「What You See Is What You Get」の略で、編集画面で見たとおりの結果を得られる方式です。\">[1]</sup></p>",
  label: '日本語',
  lang: 'ja',
  link: '/ja/',
  description: 'NABI NOTE — オープンソースの WYSIWYG エディタ。',

  menu_docs: 'ドキュメント',
  menu_start: 'ガイド',
  menu_getting_started: '基本的な使い方',
  menu_cdn: 'CDN の使い方',
  menu_features: 'wing',
  menu_style_guide: 'CSS テーマ',
  menu_style: 'スタイル',
  menu_addons: '追加機能',
  menu_icon_theme: "アイコンテーマ",
  menu_rendering: 'SSR 設定',
  menu_extend_guide: 'カスタム wing',
  menu_intro_vibe_coding: 'AIバイブコーディング',



  menu_projects: 'プロジェクト',

  menu_inline: 'インライン',
  menu_inline_bold: '太字',
  menu_inline_italic: '斜体',
  menu_inline_underline: '下線',
  menu_inline_strikethrough: '取り消し線',
  menu_inline_superscript: '上付き文字',
  menu_inline_subscript: '下付き文字',
  menu_inline_link: 'リンク',
  menu_inline_highlight: '蛍光ペン',
  menu_inline_text_color: '文字色',

  menu_block: 'ブロック',
  menu_block_heading: '見出し',
  menu_block_bullet_list: '箇条書き',
  menu_block_ordered_list: '番号付きリスト',
  menu_block_task_list: 'チェックリスト',
  menu_block_table: '表',
  menu_block_image: '画像',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'コード',
  menu_block_details: '折りたたみ',
  menu_block_quote: '引用',
  menu_block_divider: '区切り線',

  menu_etc: "ツール",
  menu_etc_align: '配置',
  menu_etc_dropcap: 'ドロップキャップ',
  menu_etc_typeface: '書体',
  menu_etc_font_size: '文字サイズ',
  menu_etc_clear_format: '書式をクリア',
  menu_etc_upload: 'ファイルをアップロード',

  search: '検索',
  search_no_results: '結果がありません',
  search_hint: '検索語を入力してください',
  search_move: '移動',
  search_open: '開く',
  search_close: '閉じる',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: "<p data-nabi-align=\"c\"></p><div data-nabi-p data-nabi-align=\"c\"><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p data-nabi-align=\"c\"><span data-nabi-size=\"xl\"><b>NABI NOTE</b></span></p><p data-nabi-align=\"c\"><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\">オープンソースの WYSIWYG</span></i></span><sup data-nabi-fn=\"WYSIWYG は「What You See Is What You Get」の略で、編集画面で見たとおりの結果を得られる方式です。\">[1]</sup><span data-nabi-size=\"lg\"><i><span data-nabi-typeface=\"cursive\"> エディタ</span></i></span></p><p></p><p data-nabi-dropcap=\"1\"><span data-nabi-typeface=\"serif\"><b>NABI NOTE</b> は、書式、配置、表、アップロードなどの機能をコアから分離し、独立モジュールである wing として構成したオープンソースの WYSIWYG エディターです。必要な wing だけを選んでエディターを組み立てられ、自分で作った wing も接続できます。純粋な JavaScript で書かれているため、React や Vue のようなフレームワークでも使えます。ビルド環境のないページでは <b>CDN ライブラリー</b> ですぐに始めることもできます。独自の文書形式である <b>NABI TREE</b> は、ブラウザー DOM のない Node.js 環境でも HTML に変換できます。入力された文書は登録された規則に従って整理され、HTML を作るときはテキストと属性をエスケープし、リンクアドレスを検査します。ただし、自作 wing とサーバーから受け取ったデータは、アプリケーションのセキュリティポリシーに合わせて別途確認する必要があります。CSS 変数と rem ベースのレイアウトでテーマとサイズを調整でき、ダークモードと複数言語に合う書体設定も提供します。表ソート、ローカル履歴、AI を活用した文書作業も、1 つの文書モデルの上で続きます。</span></p><p></p><h2>書体</h2><p>ゴシック体（既定）・明朝体・等幅・筆記体には、それぞれ言語別の代替フォントを用意しています。選んだ書体に対応するフォントがない場合は、ブラウザの既定フォントで表示されます。<b>エディターの既定の書体はホストページで設定します。</b></p><p></p><p>以下は<b>多言語で</b>示した書体です。</p><p></p><p><span data-nabi-typeface=\"sans\"><span data-nabi-size=\"lg\">산세리프 · ゴシック体 · 无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie</span></span></p><p></p><p><span data-nabi-typeface=\"serif\"><span data-nabi-size=\"lg\">세리프 · 明朝体 · 衬线 · Serif · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie</span></span></p><p></p><p><span data-nabi-typeface=\"mono\"><span data-nabi-size=\"lg\">고정폭 · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace</span></span></p><p></p><p><span data-nabi-typeface=\"cursive\"><span data-nabi-size=\"lg\">필기체 · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo</span></span></p><p></p><p></p><h2>文字サイズ</h2><p><span data-nabi-size=\"xs\">とても小さく</span></p><p><span data-nabi-size=\"sm\">小さく</span></p><p><span data-nabi-size=\"lg\">大きく</span></p><p><span data-nabi-size=\"xl\">とても大きく</span></p><p></p><p></p><h2>見出し</h2><p>空行で # を打ってスペースを入れると、その場で見出しになります。</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>太字 · 斜体 · 下線 · 打ち消し線</h2><p><b>太字</b> <i>斜体</i> <u>下線</u> <s>打ち消し線</s>を同じ文字にまとめて適用できます。</p><p><b><i><s><u>重ねて使うこともできます。</u></s></i></b></p><h3>上付き・下付き</h3><p>面積は 3.5m<sup>2</sup>、脚注はこのように<sup>1</sup> 付けます。</p><p>水は H<sub>2</sub>O です。</p><p></p><p></p><h2>文字色 · 蛍光ペン</h2><p>ライト / ダークどちらでも読みやすい色で構成しています。</p><p>文字色 <span data-color=\"green\">緑</span> · <span data-color=\"coral\">珊瑚</span> · <span data-color=\"violet\">紫</span> · <span data-color=\"amber\">琥珀</span> · <span data-color=\"blue\">青</span></p><p>蛍光ペン <mark data-color=\"yellow\">黄</mark> · <mark data-color=\"green\">黄緑</mark> · <mark data-color=\"cyan\">水色</mark> · <mark data-color=\"pink\">桃</mark> · <mark data-color=\"purple\">紫</mark> · <mark data-color=\"orange\">橙</mark></p><p></p><p></p><h2>リンク</h2><p>アドレスを入れると<a href=\"https://nabi.saro.me/\">リンク</a>になります。</p><p>http:// と https:// のアドレスに加えて、. や / で始まる同じサイト内のパスもリンクに使えます。javascript: のようなアドレスは許可されません。</p><p>たとえば <a href=\"https://nabi.saro.me/\">https://nabi.saro.me</a> と入力してスペースか改行を打つと、ご覧のとおり自動で変換されます。</p><h3>リンクの開き方</h3><p>文書にはリンク先のアドレスだけが保存され、リンクをどう開くかは文書を表示するページが決めます。</p><h3>添付リンク</h3><p>画像以外のファイルは、下のような添付リンクとして残ります。</p><p><a href=\"https://nabi.saro.me/file-link-test.txt\" data-nabi-file=\"txt\" download>添付ファイル</a>のリンクが文書に保存されます。</p><p></p><p></p><h2>配置</h2><p>左揃え</p><p data-nabi-align=\"c\">中央揃え</p><p data-nabi-align=\"r\">右揃え</p><h3>見出しには配置の変更を適用できません。</h3><p></p><p></p><h2>リスト</h2><h3>箇条書き</h3><p>空行で - を打って<b>スペース</b>を押すと、その場で箇条書きになります。</p><div data-nabi-p><ul><li><p>箇条書きの項目です</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab で字下げと字上げができます。</p></li></ul></div></li></ul></div><h3>番号付きリスト</h3><p>空行で 1. を打って<b>スペース</b>を押すと番号付きリストになります。</p><div data-nabi-p><ol><li><p>一つ目</p></li><li><p>二つ目</p></li><li><p>三つ目</p></li></ol></div><h3>チェックリスト</h3><p>空行で [ ] または [x] を打って<b>スペース</b>を押すとチェックリストになります。</p><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>チェック済みの項目です。</p></li><li data-nabi-checked=\"false\"><p>まだチェックしていない項目です。</p></li></ul></div><p></p><p></p><h2>表</h2><p>セルには複数の段落やブロックを入れ、背景色で内容を区別できます。下の表の文章と画像を直接編集してみてください。</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>資料</p></th><th data-nabi-cell-color=\"cyan\"><p>作業メモ</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">画像と説明を同じセルに入れています。</p></td><td data-nabi-cell-color=\"yellow\"><h3>段落も自由に</h3><p>Enterで段落を分け、Shift+Enterで同じ段落内に改行を入れてみてください。</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>セルの背景色を変更する</p></li><li data-nabi-checked=\"false\"><p>リスト内でTabを押して字下げする</p></li><li data-nabi-checked=\"false\"><p>複数のセルを選んで同じ色を適用する</p></li></ul></div></td><td><div data-nabi-p><details open><summary>クリックして編集のヒントを表示</summary><p>セル内にも折りたたみ・引用・コード・動画を入れられます。</p><p>セルを結合しても、それぞれの内容は順番どおりに残ります。</p></details></div></td></tr></table></div></div><p>セル内をクリックすると、背景色と行・列のツールが表示されます。複数のセルを選ぶと、色と配置をまとめて変更できます。表全体の位置は「表全体を選択」を押してから配置ツールで変えてみてください。</p><p>色や複数のブロックを含む表は、Markdownで保存するときもHTMLとして保持されます。</p><h3>セルの背景色</h3><p>対応しているセルの背景色をすべて並べました。各セルをクリックして色を変えるか、プロパティツールの「既定」を選んで背景色を消してみてください。</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-table-full><tr><td data-nabi-cell-color=\"yellow\"><p data-nabi-align=\"c\"><b>黄色</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">yellow</span></p></td><td data-nabi-cell-color=\"green\"><p data-nabi-align=\"c\"><b>黄緑</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">green</span></p></td><td data-nabi-cell-color=\"cyan\"><p data-nabi-align=\"c\"><b>水色</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">cyan</span></p></td></tr><tr><td data-nabi-cell-color=\"pink\"><p data-nabi-align=\"c\"><b>ピンク</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">pink</span></p></td><td data-nabi-cell-color=\"purple\"><p data-nabi-align=\"c\"><b>紫</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">purple</span></p></td><td data-nabi-cell-color=\"orange\"><p data-nabi-align=\"c\"><b>オレンジ</b></p><p data-nabi-align=\"c\"><span data-nabi-typeface=\"mono\">orange</span></p></td></tr></table></div></div><h3>表の並べ替え</h3><p><b>プレビュー</b>を押してから、<b>在庫</b>と<b>価格</b>の見出しを順に押してみてください。</p><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>型番</p></th><th><p>在庫</p></th><th><p>価格</p></th><th><p>重さ</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>未定</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>価格</b>列の値はすべて数値なので、数値を基準に並べ替えられます。</p><p><b>在庫</b>列には数値と文字が混在しているため、文字列を基準に並べ替えられます。</p><p></p><p></p><h2>区切り線</h2><p>--- を入力して改行すると区切り線に変わります。</p><div data-nabi-p><hr/></div><p></p><p></p><h2>画像</h2><p>幅は 30%〜100% まで調節でき、左・中央・右に寄せられます。</p><div data-nabi-p><img src=\"https://nabi.saro.me/logo/nabi-mark-demo.svg\" alt data-nabi-width=\"40\"/></div><p></p><p></p><h2>フロート領域</h2><div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>ひと目で確認</b></p><p>文章・画像・表を入れられる小さな補助領域です。</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>配置</p></td><td><p>右</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>最大幅</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>本文の横に補足説明や小さな資料を置きたいときは、フロート領域を使ってみてください。本文の幅が広ければ、この文章が領域の横に回り込みます。領域内をクリックすると、同じエディターで文章を編集し、画像や表も挿入できます。</p><p>領域内にカーソルを置くとプロパティツールが開きます。左右の配置を切り替え、最大幅を20・30・40・50%から選んで本文に合う比率を探してみてください。表や画像を貼り付けても領域内に入ります。</p><p>選択した段落を領域で囲むこともできます。幅の横の解除ボタンを押すと、中の内容は本文に残ります。プレビューでは編集用の点線が消え、本文の幅が狭い場合や印刷時は1列で表示されます。</p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src=\"https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk\" title=\"YouTube\" allowfullscreen loading=\"lazy\" data-nabi-width=\"70\"></iframe></div><p></p><p></p><h2>アップロード</h2><p>画像やファイルをエディタにドラッグしてみてください。</p><p>このデモではファイルを実際のサーバーに送信しません。アプリケーションにアップローダーを接続すると、サーバーに保存できます。</p><p>画像選択画面やアップロードを開いた後、カーソルだけを動かしても最初の位置に挿入されます。待機中に文書を編集すると挿入を中止し、お知らせを表示します。セル内で開始したアップロードの進捗表示と結果も、そのセル内に残ります。</p><p></p><p></p><h2>引用</h2><div data-nabi-p><blockquote><p>空行で &gt; を打って<b>スペース</b>を押すと引用箱になります。</p><p>複数行にわたって使えます。</p></blockquote></div><p></p><p></p><h2>コード</h2><p>空行で ``` を打って<b>スペースか改行</b>を押すとコード箱になります。</p><p>```java のように言語を書いてスペースか改行を打つと、その言語が適用されたコード箱になります。</p><div data-nabi-p><pre data-nabi-lang=\"typescript\"><code class=\"language-typescript\">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>折りたたみ</h2><div data-nabi-p><details open><summary>折りたたみは見出しと中身でできています。</summary><p>閉じた状態と開いた状態のどちらで保存するか指定できます。</p></details></div><p></p><h2></h2><h2>ツールバー</h2><p>見出し・文字の書式・配置・リスト・挿入・文書のツールをグループにまとめています。PCではツールが展開され、モバイルではクイックツールと全ツールパレットを使えます。選択した表やフロートのプロパティはツールバーの下に表示されます。</p><p></p><h2>ショートカット</h2><p><b>Shiftをすばやく2回押す</b>と、キーボードでツールを選べます。PCでは展開されたツールバー、モバイルでは全ツールパレットを操作します。Tabでグループを切り替え、方向キーでツールを選び、Enterで実行してみてください。</p><p>引用・コード・折りたたみなどのブロックの末尾でEnterをすばやく2回押すと、外へ出られます。連打間隔の既定値は180msです。</p><p></p><p></p><h2>自動書式</h2><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>例</p></th><th><p>操作キー</p></th><th><p>結果</p></th></tr><tr><td><p>#</p></td><td><p>スペース</p></td><td><p>見出し</p></td></tr><tr><td><p>-</p></td><td><p>スペース</p></td><td><p>箇条書き</p></td></tr><tr><td><p>1.</p></td><td><p>スペース</p></td><td><p>番号付きリスト</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>スペース</p></td><td><p>チェックリスト</p></td></tr><tr><td><p>&gt;</p></td><td><p>スペース</p></td><td><p>引用</p></td></tr><tr><td><p>``` · ```ts</p></td><td><p>スペース · 改行</p></td><td><p>コード箱</p></td></tr><tr><td><p>---</p></td><td><p>改行</p></td><td><p>区切り線</p></td></tr><tr><td><p>https://…</p></td><td><p>スペース · 改行</p></td><td><p>リンク</p></td></tr></table></div></div><p></p><p></p><h3>出力関数</h3><div data-nabi-p><div class=\"nabi-scroll\"><table data-nabi-sortable><tr><th><p>関数</p></th><th><p>結果</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>DOM のない環境に対応</h2><p>NABI TREE から HTML に変換するとき <b>DOM は要りません</b>。</p><p>サーバー（Node.js）でも、保存した NABI TREE を読み込み、同じ規則で HTML を作成できます。</p><p></p><h2>モバイルに優しい</h2><div data-nabi-p><ul><li><p><b>モバイル UI</b> — 画面の幅に合わせて編集ツールを配置します。</p></li><li><p><b>モバイルキーボード補正</b> — キーボードが開くと編集画面の高さを調整します。</p></li><li><p><b>柔軟なサイズ</b> — 主要なレイアウトに rem 単位を使い、拡大・縮小に対応します。</p></li><li><p><b>多言語</b> — 言語や文章の方向に合ったロケールと書体を設定できます。</p></li></ul></div><p></p><h2>カスタマイズ</h2><div data-nabi-p><ul><li><p><b>自作のwing</b> — 必要な機能があれば、自分で作って接続できます。</p></li><li><p><b>自作の CSS</b> — 主な色・角の丸み・余白を --nabi-* トークンで調整し、ライトモードとダークモードに合わせられます。</p></li><li><p><b>オープンソース</b> — GitHub でソースコードを公開し、共同で開発しています。</p></li></ul></div><div data-nabi-p><hr/></div><p>ドキュメントを見る → <a href=\"https://nabi.saro.me/\">nabi.saro.me</a></p><section data-nabi-footnotes><ol><li data-nabi-fn-n=\"1\"><span data-nabi-fn-num>[1]</span> WYSIWYG は「What You See Is What You Get」の略で、編集画面で見たとおりの結果を得られる方式です。</li></ol></section>",
  demo_wings: 'ウィング',
  demo_wings_all: 'すべてオン',
  demo_wings_none: 'すべてオフ',
  demo_zoom: '拡大・縮小',
  demo_zoom_out: '縮小',
  demo_zoom_in: '拡大',
  demo_zoom_reset: '元に戻す',
  demo_sticky: 'ツールバー固定',
  demo_sticky_keyboard: 'モバイルキーボード補正',
  demo_sticky_height: '高さ',
  demo_sticky_unit: '高さの単位',
  demo_typeface_base: '既定の書体',
  demo_typeface_sans: 'ゴシック体',
  demo_typeface_serif: '明朝体',
  demo_typeface_mono: '等幅',
  demo_typeface_cursive: '筆記体',
  demo_html_small: '<p>ここに書いてみて、上で wing を切ったり入れたりしてみてください。</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>文の中で <b>大事な言葉</b> を示します。文字を選んでツールバーの <b>B</b> を押してみてください。</p>',
  demo_html_italic:
    "<p>本のタイトルや外国語など、区別したい文字を<i>斜体</i>で表示できます。文字を選択して斜体ボタンを押してみてください。</p>",
  demo_html_underline:
    '<p>ここに <u>下線</u> が引かれています。その文字を選んでもう一度押すと外れます。</p>',
  demo_html_strikethrough: "<p><s>19,000 KRW</s> 9,900 KRW のように、以前の値を残しながら新しい値を示すときに使えます。</p>",
  demo_html_superscript:
    '<p>面積は 3.5m<sup>2</sup> で、脚注はこのように付けます。<sup>1</sup></p>',
  demo_html_subscript: "<p>水の化学式は H<sub>2</sub>O、二酸化炭素の化学式は CO<sub>2</sub> です。</p>",
  demo_html_link:
    "<p>アドレスを入力すると<a href=\"https://example.com/\">このようなリンク</a>を作れます。文書にはリンク先のアドレスだけが保存され、同じウィンドウと新しいウィンドウのどちらで開くかは表示するページが決めます。</p>",
  demo_html_highlight:
    '<p>文字を選んでボタンを押すとキャレットのそばに見本が出ます。色は六つです — <mark data-color="yellow">黄</mark>・<mark data-color="green">黄緑</mark>・<mark data-color="cyan">水色</mark>・<mark data-color="pink">桃</mark>・<mark data-color="purple">紫</mark>・<mark data-color="orange">橙</mark>。</p><p>マークの中にキャレットを置くと、状況行に同じ見本が出て色だけ変えられます。</p>',
  demo_html_text_color:
    '<p>文字に五色を乗せます — <span data-color="green">緑</span>・<span data-color="coral">珊瑚</span>・<span data-color="violet">紫</span>・<span data-color="amber">琥珀</span>・<span data-color="blue">青</span>。</p><p><mark data-color="yellow">蛍光ペンと重ねても</mark> 別のマークなので <span data-color="blue">両方効きます。</span></p>',
  demo_html_heading:
    "<h1>最も大きな見出し</h1><h2>2番目の見出し</h2><h3>3番目の見出し</h3><p>見出しの下に続く本文です。空の行に # を入力して Space を押しても見出しになります。</p>",
  demo_html_bullet_list:
    '<ul><li>箇条書きです</li><li>Tab で字下げ、Shift+Tab で字上げします<ul><li>入れ子になった項目</li></ul></li></ul><p>空行で - と空白を打っても箇条書きになります。</p>',
  demo_html_ordered_list:
    '<ol><li>順序のあるリストです</li><li>項目を挟んだり消したりしても番号は振り直されます</li></ol><p>空行で 1. と空白を打っても番号付きリストになります。</p>',
  demo_html_task_list:
    "<ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\">完了した項目です。</li><li data-nabi-checked=\"false\">項目の前のボックスを押すと完了状態を変えられます。</li></ul><p>チェック状態は文書に保存されます。空の行に [ ] または [x] を入力して Space を押してもチェックリストになります。</p>",
  demo_html_table:
    "<p>セルには複数の段落やブロックを入れ、背景色で内容を区別できます。下の表の文章と画像を直接編集してみてください。</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><th data-nabi-cell-color=\"cyan\"><p>資料</p></th><th data-nabi-cell-color=\"cyan\"><p>作業メモ</p></th></tr><tr><td><div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"30\"/></div><p data-nabi-align=\"c\">画像と説明を同じセルに入れています。</p></td><td data-nabi-cell-color=\"yellow\"><h3>段落も自由に</h3><p>Enterで段落を分け、Shift+Enterで同じ段落内に改行を入れてみてください。</p></td></tr><tr><td data-nabi-cell-color=\"green\"><div data-nabi-p><ul data-nabi-list=\"task\"><li data-nabi-checked=\"true\"><p>セルの背景色を変更する</p></li><li data-nabi-checked=\"false\"><p>リスト内でTabを押して字下げする</p></li><li data-nabi-checked=\"false\"><p>複数のセルを選んで同じ色を適用する</p></li></ul></div></td><td><div data-nabi-p><details open><summary>クリックして編集のヒントを表示</summary><p>セル内にも折りたたみ・引用・コード・動画を入れられます。</p><p>セルを結合しても、それぞれの内容は順番どおりに残ります。</p></details></div></td></tr></table></div></div><p>セル内をクリックすると、背景色と行・列のツールが表示されます。複数のセルを選ぶと、色と配置をまとめて変更できます。表全体の位置は「表全体を選択」を押してから配置ツールで変えてみてください。</p><p>通常の段落ではTabで次のセルへ移動し、リストやコード内では字下げします。内容や書式を消してもセルの背景色は残ります。</p>",
  demo_html_image:
    "<div data-nabi-p data-nabi-align=\"c\"><img src=\"/nabi-note.svg\" alt data-nabi-width=\"50\"/></div><p>画像を選択すると表示サイズを調整し、左・中央・右に揃えられます。</p>",
  demo_html_youtube:
    '<p>ツールバーの YouTube ボタンを押すか、動画のアドレスをそのまま貼り付けてみてください。この場所に動画が入ります。</p>',
  demo_html_code:
    "<div data-nabi-p><pre data-nabi-lang=\"ts\"><code class=\"language-ts\">function sum(numbers: number[]) {<br/>  return numbers.reduce((a, b) =&gt; a + b, 0)<br/>}</code></pre></div><p>コードブロック内にキャレットを置くと、コンテキストツールから言語を選べます。複数行を選択して Tab を押すとまとめて字下げし、Shift+Tab を押すと字下げを戻します。</p>",
  demo_html_details:
    "<details open><summary>タイトルを押して内容を折りたたんだり開いたりしてみてください。</summary><p>最初から開いておくか折りたたんでおくかも文書に保存されます。</p></details>",
  demo_html_quote:
    '<blockquote><p>他の文章から持ってきた一文や、強調したい内容を引用としてまとめられます。</p><p>引用の中には複数の段落とブロックを一緒に入れられます。</p></blockquote><p>空行で &gt; と空白を打つと、その行が引用になります。</p>',
  demo_html_divider:
    "<p>最初の内容を締めくくる段落です。</p><hr><p>区切り線の下で新しい内容を始められます。空の行に --- を入力して Enter を押しても区切り線ができます。</p>",
  demo_html_align:
    "<p data-nabi-align=\"l\">左揃えは通常の本文に適しています。</p><p data-nabi-align=\"c\">中央揃えは短いタイトルや案内文に使えます。</p><p data-nabi-align=\"r\">右揃えは日付や署名など、右側に置く内容に使えます。</p>",
  demo_html_font_size:
    '<p data-nabi-size="xs">とても小さく — 脚注や添え書きに使います。</p><p data-nabi-size="sm">小さく — 本文より一歩控えた言葉。</p><p>既定の大きさの段落です。サイズ選択メニューにも、それぞれの文字サイズがそのまま表示されます。</p><p data-nabi-size="lg">大きく — 強調したい文に合います。</p><p data-nabi-size="xl">とても大きく — 見出し下の導入文に合います。</p><p>文字サイズは選択した範囲に適用されます。選択した文字がなくキャレットだけの場合は、現在の段落の文字に適用されます。</p>',
  demo_html_typeface: "<p>書体を個別に指定していない段落です。ページの既定の書体で表示されます。</p><p data-nabi-typeface=\"serif\">この段落にはセリフ書体を適用しています。セリフなどの書体の種類を選ぶと、実際のフォントはサイトの CSS 設定に従います。</p><p data-nabi-typeface=\"mono\">この段落には等幅書体を適用しています。文字幅が一定なので、数字やコードの位置を揃えるのに適しています — 0O 1lI</p><p data-nabi-typeface=\"cursive\">筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체</p>",
  demo_html_dropcap:
    "<p data-nabi-dropcap=\"1\">段落の最初の文字を大きく表示し、残りの文章をその横に流します。編集画面では最初の文字を実際の要素で囲み、キャレット位置がずれないようにします。</p><p>この段落にはドロップキャップを適用していません。</p>",
  demo_html_clear_format:
    '<p><b>太字</b>・<i>斜体</i>・<u>下線</u>・<s>取り消し線</s>が掛かった文字を選んで消しゴムを押してみてください。</p><p>文字の書式だけが消え、ブロックはそのまま残ります。</p>',
  demo_html_upload:
    '<p>ファイルをこの箱にドラッグするか貼り付けてみてください。このサイトには送る先のサーバーがないのでアップロードのふりだけをし、結果はこのページの中にだけ残ります。</p><p>アップロードが終わった添付は <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">添付ファイル</a> のように残ります。</p>',


  cdn_demo_lead: '以下のコードを {file} として保存し、ブラウザで開けばすぐに確認できます。',
  cdn_demo_download: 'demo.html をダウンロード',
  cdn_code_minheight: "この例ではエディターがブラウザの高さを満たします。サイトのレイアウトに合わせて高さを調整してください。",
  cdn_code_wings: "この例で使う編集用・ファイル操作用の wing を選びます。",
  cdn_code_faces:
    "この例ではサンセリフとセリフのフォントだけを読み込みます。\n等幅や筆記体を使う場合は、対応するフォントファイルもページで読み込んでください。\n詳しくは「書体」のドキュメントを確認してください。",
  cdn_code_change: "文書が変更されたときに保存処理を予約する例です。",
  code_copy: 'コードをコピー',
  demo_install: 'インストール',
  demo_code: 'コード',
  demo_tree: 'nabi-tree',
  demo_loading: 'エディタを読み込んでいます…',

  page_not_found: 'ページが見つかりません',

  demo_html_float: "<div data-nabi-p><div data-nabi-float=\"right\" data-nabi-float-width=\"40\"><p><b>ひと目で確認</b></p><p>文章・画像・表を入れられる小さな補助領域です。</p><div data-nabi-p><div class=\"nabi-scroll\"><table><tr><td data-nabi-cell-color=\"cyan\"><p>配置</p></td><td><p>右</p></td></tr><tr><td data-nabi-cell-color=\"green\"><p>最大幅</p></td><td><p>40%</p></td></tr></table></div></div></div></div><p>本文の横に補足説明や小さな資料を置きたいときは、フロート領域を使ってみてください。本文の幅が広ければ、この文章が領域の横に回り込みます。領域内をクリックすると、同じエディターで文章を編集し、画像や表も挿入できます。</p><p>領域内にカーソルを置くとプロパティツールが開きます。左右の配置を切り替え、最大幅を20・30・40・50%から選んで本文に合う比率を探してみてください。表や画像を貼り付けても領域内に入ります。</p><p>選択した段落を領域で囲むこともできます。幅の横の解除ボタンを押すと、中の内容は本文に残ります。プレビューでは編集用の点線が消え、本文の幅が狭い場合や印刷時は1列で表示されます。</p>",
  menu_block_float: "フロート領域",
}
