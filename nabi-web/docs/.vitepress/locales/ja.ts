// Translated — the demo document and the site's own labels are in Japanese, and every wing
// name is the word its toolbar button shows. A missing key is a type error: the file stays whole.
// 옮겼다 — 데모 문서도 사이트 낱말도 일본어다. 날개 이름은 하나같이 그 날개의 툴바 버튼에
// 뜨는 말 그대로다. 키가 하나라도 빠지면 타입 오류라 파일은 온전해야 한다.
export const ja = {
  label: '日本語',
  lang: 'ja',
  link: '/ja/',
  description: 'NABI NOTE — オープンソースの WYSIWYG エディタ。',

  menu_docs: 'ドキュメント',
  menu_intro: 'はじめに',
  menu_intro_index: 'NABI NOTE とは',
  menu_intro_usage: '基本的な使い方',
  menu_intro_ssr: 'SSR サポート',
  menu_intro_cdn: 'CDN で使う',
  menu_intro_vibe_coding: 'AIバイブコーディング',

  menu_wing: 'ウィング (Wing)',
  menu_wing_custom: '自分のウィングを作る',
  menu_custom_start: 'はじめかた',
  menu_custom_inline: 'インラインマーク',
  menu_custom_block: 'ブロックとブロック属性',
  menu_custom_ui: 'UI と動作',
  menu_custom_input: 'キー・自動変換・貼り付け',

  menu_style: 'スタイル',
  menu_style_custom: 'スタイルを変える',

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

  menu_etc: 'その他',
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

  demo_placeholder: 'ここに書いてみてください',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">現在AIで文書を生成・翻訳中です。</p><p data-nabi-align="c">安定したらバージョン 1.0.0 になります。</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">オープンソースの WYSIWYG エディタ</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>ナビノート</b>は、書式・配置・表・アップロードといった主要機能をすべて「ウイング」という独立モジュールとしてコアから切り離し、開発者が好きな機能を制限なく拡張できるように設計されたオープンソースの WYSIWYG エディタです。<b>フレームワーク依存ゼロ</b>を目指した純粋な Vanilla JS で書かれているので React でも Vue でもそのまま導入でき、ビルドシステムのないプロジェクト向けに <b>CDN ライブラリ</b>も用意しています。独自の JSON 形式 <b>NABI TREE</b> に対応しているため DOM のない Node.js(SSR) 環境でも HTML とテキストの変換をあらかじめ済ませられ、許可された語彙だけで文書を組み直す方式により、別途 Sanitizer を入れなくても <b>XSS スクリプトを根元で遮断</b>します。デザイン面では <b>CSS Variable</b> 方式を採り、ブランドのテーマカラーを差し替えやすく、<b>rem 単位のレイアウト</b>により端末を拡大・縮小してもモバイルで滑らかな UI を保ちます。ダーク/ライトに合わせた色・蛍光ペン・多言語書体まで揃っています。さらに<b>型を見分ける表の列ソート</b>、IndexedDB による<b>ローカル履歴</b>、<b>バイブコーディング</b>対応まで、開発者と書き手の体験を同時に満たします。</span></p><p><br/></p><h2>書体</h2><p>ゴシック体(既定)・明朝体・等幅・筆記体——書体の系統ごとに文字体系別のフォントを積んであるので、どの言語を書いてもその系統の顔つきが保たれ、その系統に手書きの顔を持たない文字体系はブラウザ既定のフォントに落ちます。<b>既定の書体はホストが決めます。</b></p><p><br/></p><p>以下は<b>多言語で</b>示した書体です。</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>文字サイズ</h2><p><span data-nabi-size="xs">とても小さく</span></p><p><span data-nabi-size="sm">小さく</span></p><p><span data-nabi-size="lg">大きく</span></p><p><span data-nabi-size="xl">とても大きく</span></p><p><br/></p><p><br/></p><h2>見出し</h2><p>空行で # を打ってスペースを入れると、その場で見出しになります。</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>太字 · 斜体 · 下線 · 打ち消し線</h2><p><b>太字</b> <i>斜体</i> <u>下線</u> <s>打ち消し線</s> の例です。</p><p><b><i><s><u>重ねて使うこともできます。</u></s></i></b></p><h3>上付き・下付き</h3><p>面積は 3.5m<sup>2</sup>、脚注はこのように<sup>1</sup> 付けます。</p><p>水は H<sub>2</sub>O です。</p><p><br/></p><p><br/></p><h2>文字色 · 蛍光ペン</h2><p>ライト / ダークどちらでも読みやすい色で構成しています。</p><p>文字色 <span data-color="green">緑</span> · <span data-color="coral">珊瑚</span> · <span data-color="violet">紫</span> · <span data-color="amber">琥珀</span> · <span data-color="blue">青</span></p><p>蛍光ペン <mark data-color="yellow">黄</mark> · <mark data-color="green">黄緑</mark> · <mark data-color="cyan">水色</mark> · <mark data-color="pink">桃</mark> · <mark data-color="purple">紫</mark> · <mark data-color="orange">橙</mark></p><p><br/></p><p><br/></p><h2>リンク</h2><p>アドレスを入れると<a href="https://nabi.saro.me/">リンク</a>になります。</p><p>アドレスは http:// と https:// のみ許可され、javascript: のようなものは使えません。</p><p>たとえば <a href="https://nabi.saro.me/">https://nabi.saro.me</a> と入力してスペースか改行を打つと、ご覧のとおり自動で変換されます。</p><h3>target</h3><p>既定では同じサイト(origin)内なら現在の窓、別のサイトなら新しい窓で開きます。この規則はエディタ宣言時に指定できます。</p><h3>添付リンク</h3><p>画像以外のファイルをアップロードすると、下のようなファイル形式のリンクになります。</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>添付ファイル</a> のように残ります。</p><p><br/></p><p><br/></p><h2>配置</h2><p>左揃え</p><p>中央揃え</p><p>右揃え</p><h3>見出しも配置を変えられます。</h3><p><br/></p><p><br/></p><h2>リスト</h2><h3>箇条書き</h3><p>空行で - を打って<b>スペース</b>を押すと、その場で箇条書きになります。</p><div data-nabi-p><ul><li><p>箇条書きの項目です</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab で字下げと字上げができます。</p></li></ul></div></li></ul></div><h3>番号付きリスト</h3><p>空行で 1. を打って<b>スペース</b>を押すと番号付きリストになります。</p><div data-nabi-p><ol><li><p>一つ目</p></li><li><p>二つ目</p></li><li><p>三つ目</p></li></ol></div><h3>チェックリスト</h3><p>空行で [ ] または [x] を打って<b>スペース</b>を押すとチェックリストになります。</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>チェック済みの項目です。</p></li><li data-nabi-checked="false"><p>まだチェックしていない項目です。</p></li></ul></div><p><br/></p><p><br/></p><h2>表</h2><p>ツールバーの表を押して作り、行と列の追加・削除・結合ができます。</p><h3>表の並べ替え</h3><p><b>プレビュー</b>を押してから、<b>在庫</b>と<b>価格</b>の見出しを順に押してみてください。</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>型番</p></th><th><p>在庫</p></th><th><p>価格</p></th><th><p>重さ</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>未定</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>価格</b>はすべて数値なので、数値として並べ替えられます。</p><p><b>在庫</b>は最後の行に文字があるため、文字として並べ替えられます。(避けたいときは最後の欄の文字を消して空にしてください。)</p><p><br/></p><p><br/></p><h2>区切り線</h2><p>--- を入力して改行すると区切り線に変わります。</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>画像</h2><p>画像のアドレスを入れるかアップロードすると画像になり、幅は 30%〜100% まで調節でき、左・中央・右に寄せられます。</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>アップロード</h2><p>画像やファイルをエディタにドラッグしてみてください。</p><p>ここで使っているアップロードはモックアップで、設定でサーバーにつなげられます。</p><p>アップロードに失敗した場合、その画像やファイルはエディタから取り除かれます。</p><p><br/></p><p><br/></p><h2>引用</h2><div data-nabi-p><blockquote><p>空行で &gt; を打って<b>スペース</b>を押すと引用箱になります。</p><p>複数行にわたって使えます。</p></blockquote></div><p><br/></p><p><br/></p><h2>コード</h2><p>空行で \`\`\` を打って<b>スペースか改行</b>を押すとコード箱になります。</p><p>\`\`\`java のように言語を書いてスペースか改行を打つと、その言語が適用されたコード箱になります。</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>折りたたみ</h2><div data-nabi-p><details open><summary>折りたたみは見出しと中身でできています。</summary><p>閉じた状態と開いた状態のどちらで保存するか指定できます。</p></details></div><p><br/></p><h2>ローカル履歴</h2><p><b>ブラウザの</b> IndexedDB を通じて、決めた間隔で履歴を残します。</p><p>保存はローカルのみで、宣言した数だけ残します。— 既定は 30 秒ごと、直近 20 セッション。</p><p><br/></p><p><br/></p><h2>ショートカット</h2><p><b>Shift を素早く二回</b>押すと、ツールバーに各機能のショートカットが出ます。</p><p><br/></p><p><br/></p><h2>自動書式</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>例</p></th><th><p>操作キー</p></th><th><p>結果</p></th></tr><tr><td><p>#</p></td><td><p>スペース</p></td><td><p>見出し</p></td></tr><tr><td><p>-</p></td><td><p>スペース</p></td><td><p>箇条書き</p></td></tr><tr><td><p>1.</p></td><td><p>スペース</p></td><td><p>番号付きリスト</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>スペース</p></td><td><p>チェックリスト</p></td></tr><tr><td><p>&gt;</p></td><td><p>スペース</p></td><td><p>引用</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>スペース · 改行</p></td><td><p>コード箱</p></td></tr><tr><td><p>---</p></td><td><p>改行</p></td><td><p>区切り線</p></td></tr><tr><td><p>https://…</p></td><td><p>スペース · 改行</p></td><td><p>リンク</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>出力関数</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>関数</p></th><th><p>結果</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>DOM のない環境に対応</h2><p>JSON から HTML に変換するとき <b>DOM は要りません</b>。</p><p>サーバー(Node.js)で保存されたナビツリーをそのまま読み、XSS を防ぎながら HTML を組み立てられます。</p><p><br/></p><h2>モバイルに優しい</h2><div data-nabi-p><ul><li><p><b>モバイル UI</b> — レスポンシブでモバイル UI に対応します。</p></li><li><p><b>モバイルキーボード補正</b> — キーボードが出たらその高さを補正します。</p></li><li><p><b>可変サイズ</b> — サイズはすべて rem 単位で作られています。</p></li><li><p><b>多言語</b> — 十四の言語を話します。</p></li></ul></div><p><br/></p><h2>カスタマイズ</h2><div data-nabi-p><ul><li><p><b>自作のウイング</b> — 必要な機能があれば自分で作って使えます。</p></li><li><p><b>自作の CSS</b> — 色・角・余白がすべて --nabi-* で定義されているので、ダークもライトも思いのままです。</p></li><li><p><b>オープンソース</b> — GitHub でオープンソースとして公開しています。</p></li></ul></div><div data-nabi-p><hr/></div><p>ドキュメントを見る → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
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
    '<p>聞き慣れない言葉や引用は <i>斜めに</i> 書きます。この文を選んで押してみてください。</p>',
  demo_html_underline:
    '<p>ここに <u>下線</u> が引かれています。その文字を選んでもう一度押すと外れます。</p>',
  demo_html_strikethrough: '<p><s>2,900円</s> 1,900円 — 消した値を残しておきたいときに使います。</p>',
  demo_html_superscript:
    '<p>面積は 3.5m<sup>2</sup> で、脚注はこのように付けます。<sup>1</sup></p>',
  demo_html_subscript: '<p>水は H<sub>2</sub>O、二酸化炭素は CO<sub>2</sub> です。</p>',
  demo_html_link:
    '<p>アドレスを入れると <a href="https://example.com">このようなリンク</a> になります。すでにあるリンクには状況行が出ません — アドレスを直すには消してから作り直します。</p>',
  demo_html_highlight:
    '<p>文字を選んでボタンを押すとキャレットのそばに見本が出ます。色は六つです — <mark data-color="yellow">黄</mark>・<mark data-color="green">黄緑</mark>・<mark data-color="cyan">水色</mark>・<mark data-color="pink">桃</mark>・<mark data-color="purple">紫</mark>・<mark data-color="orange">橙</mark>。</p><p>マークの中にキャレットを置くと、状況行に同じ見本が出て色だけ変えられます。</p>',
  demo_html_text_color:
    '<p>文字に五色を乗せます — <span data-color="green">緑</span>・<span data-color="coral">珊瑚</span>・<span data-color="violet">紫</span>・<span data-color="amber">琥珀</span>・<span data-color="blue">青</span>。</p><p><mark data-color="yellow">蛍光ペンと重ねても</mark> 別のマークなので <span data-color="blue">両方効きます。</span></p>',
  demo_html_heading:
    '<h1>見出し1</h1><h2>見出し2</h2><h3>見出し3</h3><p>本文です。空行で # と空白を打っても見出しになります。</p>',
  demo_html_bullet_list:
    '<ul><li>箇条書きです</li><li>Tab で字下げ、Shift+Tab で字上げします<ul><li>入れ子になった項目</li></ul></li></ul><p>空行で - と空白を打っても箇条書きになります。</p>',
  demo_html_ordered_list:
    '<ol><li>順序のあるリストです</li><li>項目を挟んだり消したりしても番号は振り直されます</li></ol><p>空行で 1. と空白を打っても番号付きリストになります。</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">文字の前の四角を押してチェックします</li><li data-nabi-checked="false">チェックの状態はドキュメントに保存されます</li></ul><p>空行で [ ] や [x] を打ってもチェックリストになります。</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>キー</th><th>すること</th></tr><tr><td>Tab</td><td>次のセルへ移動します</td></tr><tr><td>矢印</td><td>格子に沿って動きます</td></tr></tbody></table><p>セルの中にキャレットを置くと状況行に行・列コマンドが出ます。</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="ナビ ロゴ" data-nabi-width="50"></div><p>画像をクリックすると幅・配置の箱が出ます。</p>',
  demo_html_youtube:
    '<p>ツールバーの YouTube ボタンを押すか、動画のアドレスをそのまま貼り付けてみてください。この場所に動画が入ります。</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>コードの中にキャレットを置くと状況行に言語の入力欄が出ます。複数行を選んで Tab を押すと選んだ行がまとめて字下げされ、Shift+Tab で戻ります。</p>',
  demo_html_details:
    '<details open=""><summary>ここを押すと折りたたみます</summary><p>折りたたんだ状態はドキュメントに保存されます。書いた人が畳んだとおりに読む人にも見えます。</p></details>',
  demo_html_quote:
    '<blockquote><p>他人の言葉を入れる箱です。中では文字の書式だけが効き、画像・コード・表のボタンは出ません。</p></blockquote><p>空行で &gt; と空白を打つと、その行が引用になります。</p>',
  demo_html_divider:
    '<p>区切り線の上の段落です。</p><hr><p>区切り線の下の段落です。空行に --- だけを打って Enter を押しても線になります。</p>',
  demo_html_align:
    '<p data-nabi-align="l">左揃え</p><p data-nabi-align="c">中央揃え</p><p data-nabi-align="r">右揃え</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">とても小さく — 脚注や添え書きに使います。</p><p data-nabi-size="sm">小さく — 本文より一歩控えた言葉。</p><p>既定の大きさの段落です。ボタンを押すと五段階がその国の言葉で、自分の大きさで出ます。</p><p data-nabi-size="lg">大きく — 力を込めた文。</p><p data-nabi-size="xl">とても大きく — 表題の下のリード文。</p>',
  demo_html_typeface:
    '<p>この段落には書体が指定されていません。ページの既定であるサンセリフで表示されます。</p><p data-nabi-typeface="serif">この段落はセリフ(明朝体)です。選ぶのは系統で、実際のフォントはこのサイトがトークンに乗せた Noto Serif です。</p><p data-nabi-typeface="mono">この段落は等幅です。文字の幅が揃うので桁が数えやすくなります — 0O 1lI</p><p data-nabi-typeface="cursive">この段落は筆記体です。手書きの顔つきなので引用や添え書きに使います — Handwriting · 手書き · 手写.</p><p>書体は段落ごとに別々に掛けられます。見出しと表はサンセリフ、コードは等幅に固定です。何も掛けていない段落は <b>wing を宣言するときに決めた既定値</b>で表示されます — 決めていなければサンセリフです。</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">先頭の文字が三行分の高さで大きく表示され、文はその横に流れます。段落が短くても包む行数ぶんの場所を確保するので、文字が次のブロックにはみ出しません。</p><p>この段落には掛かっていません。</p>',
  demo_html_clear_format:
    '<p><b>太字</b>・<i>斜体</i>・<u>下線</u>・<s>取り消し線</s>が掛かった文字を選んで消しゴムを押してみてください。</p><p>文字の書式だけが消え、ブロックはそのまま残ります。</p>',
  demo_html_upload:
    '<p>ファイルをこの箱にドラッグするか貼り付けてみてください。このサイトには送る先のサーバーがないのでアップロードのふりだけをし、結果はこのページの中にだけ残ります。</p><p>アップロードが終わった添付は <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">添付ファイル</a> のように残ります。</p>',


  cdn_demo_lead: '以下のコードを {file} として保存し、ブラウザで開けばすぐに確認できます。',
  cdn_demo_download: 'demo.html をダウンロード',
  cdn_code_minheight: '編集エリアの最小高さ — 開いた直後に一行だけの箱に見えないようにします。値は自由に変更できます。',
  cdn_code_wings: 'アップロードを除くすべての翼を含みます。',
  cdn_code_faces:
    '書体はサンセリフとセリフの二つだけ残します。\nシステムごとに対応する書体が違うため、等幅・筆記体は別途 import しないとどの環境でも認識されません。\n詳しくは「書体」ドキュメントを確認してください。',
  cdn_code_change: '値が変わったときのコールバック例',
  code_copy: 'コードをコピー',
  demo_install: 'インストール',
  demo_code: 'コード',
  demo_chars: '{n} 文字',
  demo_tree: 'nabi-tree',
  demo_loading: 'エディタを読み込んでいます…',

  page_not_found: 'ページが見つかりません',
  nav_prev: '前のページ',
  nav_next: '次のページ',
}
