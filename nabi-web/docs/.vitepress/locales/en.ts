export const en = {
  label: 'English',
  lang: 'en',
  link: '/en/',
  description: 'NABI NOTE — an open-source WYSIWYG editor.',

  menu_docs: 'Docs',
  menu_intro: 'Introduction',
  menu_intro_index: 'What is NABI NOTE?',
  menu_intro_usage: 'Basic usage',
  menu_intro_ssr: 'SSR support',
  menu_intro_cdn: 'From a CDN',
  menu_intro_vibe_coding: 'AI Vibe Coding',

  menu_wing: 'Wings',
  menu_wing_custom: 'Build your own wing',
  menu_custom_start: 'Getting started',
  menu_custom_inline: 'Inline marks',
  menu_custom_block: 'Blocks and paragraph attributes',
  menu_custom_ui: 'UI and actions',
  menu_custom_input: 'Keys, rules, paste',

  menu_style: 'Styling',
  menu_style_custom: 'Custom styles',

  menu_projects: 'Projects',

  menu_inline: 'Inline',
  menu_inline_bold: 'Bold',
  menu_inline_italic: 'Italic',
  menu_inline_underline: 'Underline',
  menu_inline_strikethrough: 'Strikethrough',
  menu_inline_superscript: 'Superscript',
  menu_inline_subscript: 'Subscript',
  menu_inline_link: 'Link',
  menu_inline_highlight: 'Highlight',
  menu_inline_text_color: 'Text color',

  menu_block: 'Block',
  menu_block_heading: 'Heading',
  menu_block_bullet_list: 'Bullet list',
  menu_block_ordered_list: 'Numbered list',
  menu_block_task_list: 'Checklist',
  menu_block_table: 'Table',
  menu_block_image: 'Image',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Code',
  menu_block_details: 'Details',
  menu_block_quote: 'Quote',
  menu_block_divider: 'Divider',

  menu_etc: 'Other',
  menu_etc_align: 'Align',
  menu_etc_dropcap: 'Drop cap',
  menu_etc_typeface: 'Typeface',
  menu_etc_font_size: 'Font size',
  menu_etc_clear_format: 'Clear formatting',
  menu_etc_upload: 'Upload',

  search: 'Search',
  search_no_results: 'No results',
  search_hint: 'Enter a search term',
  search_move: 'Move',
  search_open: 'Open',
  search_close: 'Close',

  demo_placeholder: 'Write something',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">Currently generating and translating docs with AI.</p><p data-nabi-align="c">Once it settles, it becomes version 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">An open-source WYSIWYG editor</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> is an open-source WYSIWYG editor built so that every major feature — formatting, alignment, tables, uploads and the rest — lives apart from the core as an independent module called a "wing", which lets a developer extend it with custom features without limits. It is written in plain Vanilla JS aiming at <b>ZERO framework dependency</b>, so it drops into React, Vue or anything else, and a <b>CDN library</b> ships alongside it for projects with no build system. It carries its own JSON format, <b>NABI TREE</b>, so HTML-to-text conversion can be prepared ahead of time even where there is no DOM (Node.js, SSR), and because it rebuilds documents from an allowed vocabulary rather than patching them, it guarantees <b>XSS scripts are blocked at the root</b> with no separate sanitizer library. On the design side it takes a <b>CSS Variable</b> system, so a brand theme color is easy to change, and a <b>rem-based layout</b>, so zooming a device in or out keeps the mobile-friendly UI smooth; dark/light-tuned colors, highlights and multilingual typefaces are all in place. It goes further with <b>type-aware table column sorting</b>, IndexedDB-backed <b>local history</b> and support for <b>vibe coding</b> — an editor that satisfies the developer's experience and the writer's at the same time.</span></p><p><br/></p><h2>Typeface</h2><p>Sans serif (the default), serif, monospace and cursive — each family stacks fonts per script, so whatever language you write in keeps that family's shape, and a script with no handwriting face in that family falls back to the browser's own font. <b>The host decides the default typeface.</b></p><p><br/></p><p>Below is each family shown <b>in many languages</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>Text size</h2><p><span data-nabi-size="xs">Extra small</span></p><p><span data-nabi-size="sm">Small</span></p><p><span data-nabi-size="lg">Large</span></p><p><span data-nabi-size="xl">Extra large</span></p><p><br/></p><p><br/></p><h2>Heading</h2><p>On an empty line, type # and then a space to turn it into a heading right there.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>Bold · Italic · Underline · Strikethrough</h2><p><b>Bold</b> <i>italic</i> <u>underline</u> <s>strikethrough</s> — an example.</p><p><b><i><s><u>They can be stacked, too.</u></s></i></b></p><h3>Superscript and subscript</h3><p>The area is 3.5m<sup>2</sup>, and a footnote goes like this<sup>1</sup>.</p><p>Water is H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>Text color · Highlight</h2><p>The palette is picked to stay readable in both light and dark mode.</p><p>Text color <span data-color="green">Green</span> · <span data-color="coral">Coral</span> · <span data-color="violet">Violet</span> · <span data-color="amber">Amber</span> · <span data-color="blue">Blue</span></p><p>Highlight <mark data-color="yellow">Yellow</mark> · <mark data-color="green">Green</mark> · <mark data-color="cyan">Cyan</mark> · <mark data-color="pink">Pink</mark> · <mark data-color="purple">Purple</mark> · <mark data-color="orange">Orange</mark></p><p><br/></p><p><br/></p><h2>Link</h2><p>Put in an address and it becomes a <a href="https://nabi.saro.me/">link</a>.</p><p>Only http:// and https:// are allowed; things like javascript: cannot be used.</p><p>For example, type <a href="https://nabi.saro.me/">https://nabi.saro.me</a> and press space or enter — it converts on its own, as you see here.</p><h3>target</h3><p>By default a link within the same origin opens in this window and any other site opens in a new one; the rule can be set when the editor is declared.</p><h3>Attachment link</h3><p>Uploading anything other than an image leaves a file-shaped link like the one below.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Attachment</a> is how it stays.</p><p><br/></p><p><br/></p><h2>Alignment</h2><p>Aligned left</p><p>Aligned center</p><p>Aligned right</p><h3>Headings can be aligned as well.</h3><p><br/></p><p><br/></p><h2>Lists</h2><h3>Bullet list</h3><p>On an empty line, type - and press <b>space</b> — it becomes a bullet list right there.</p><div data-nabi-p><ul><li><p>This is a bullet item</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab indent and outdent.</p></li></ul></div></li></ul></div><h3>Numbered list</h3><p>On an empty line, type 1. and press <b>space</b> to get a numbered list.</p><div data-nabi-p><ol><li><p>First</p></li><li><p>Second</p></li><li><p>Third</p></li></ol></div><h3>Checklist</h3><p>On an empty line, type [ ] or [x] and press <b>space</b> to get a checklist.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>This item is checked.</p></li><li data-nabi-checked="false"><p>This one is not checked yet.</p></li></ul></div><p><br/></p><p><br/></p><h2>Table</h2><p>Click the table button in the toolbar to make one, then add, delete and merge rows and columns.</p><h3>Column sorting</h3><p>Press <b>Preview</b>, then click the <b>Stock</b> and <b>Price</b> header cells in turn.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Model</p></th><th><p>Stock</p></th><th><p>Price</p></th><th><p>Weight</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>TBD</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>Price</b> is all numbers, so it sorts numerically.</p><p><b>Stock</b> sorts as text because of the letters in the last cell. (To avoid that, clear the last cell and leave it empty.)</p><p><br/></p><p><br/></p><h2>Divider</h2><p>Type --- and press enter to turn it into a divider.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>Image</h2><p>Paste an image address or upload one and it becomes an image; the width goes from 30% to 100% and it can sit left, center or right.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>Upload</h2><p>Try dragging an image or a file onto the editor.</p><p>The upload used here is a mock-up; a setting connects it to your server.</p><p>If an upload fails, the image or file is removed from the editor.</p><p><br/></p><p><br/></p><h2>Quote</h2><div data-nabi-p><blockquote><p>On an empty line, type &gt; and press <b>space</b> to get a quote box.</p><p>It can run over several lines.</p></blockquote></div><p><br/></p><p><br/></p><h2>Code</h2><p>On an empty line, type \`\`\` and press <b>space or enter</b> to get a code box.</p><p>Write the language too, like \`\`\`java, and press space or enter to get a code box with that language applied.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>Details</h2><div data-nabi-p><details open><summary>Details is made of a summary and a body.</summary><p>You can choose whether it is saved folded or open.</p></details></div><p><br/></p><h2>Local history</h2><p>History is kept at a set interval through <b>the browser's</b> IndexedDB.</p><p>It is stored locally only, as many entries as declared. — default: every 30 seconds, the last 20 sessions.</p><p><br/></p><p><br/></p><h2>Shortcuts</h2><p>Press <b>Shift twice, quickly</b> and the toolbar shows the shortcut for each feature.</p><p><br/></p><p><br/></p><h2>Autoformat</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Example</p></th><th><p>Action key</p></th><th><p>Result</p></th></tr><tr><td><p>#</p></td><td><p>Space</p></td><td><p>Heading</p></td></tr><tr><td><p>-</p></td><td><p>Space</p></td><td><p>Bullet list</p></td></tr><tr><td><p>1.</p></td><td><p>Space</p></td><td><p>Numbered list</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Space</p></td><td><p>Checklist</p></td></tr><tr><td><p>&gt;</p></td><td><p>Space</p></td><td><p>Quote</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Space · Enter</p></td><td><p>Code box</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>Divider</p></td></tr><tr><td><p>https://…</p></td><td><p>Space · Enter</p></td><td><p>Link</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>Output functions</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Function</p></th><th><p>Result</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>Works without a DOM</h2><p>Converting to HTML from JSON <b>needs no DOM</b>.</p><p>A server (Node.js) can read the stored nabi tree as-is and assemble HTML while blocking XSS.</p><p><br/></p><h2>Mobile friendly</h2><div data-nabi-p><ul><li><p><b>Mobile UI</b> — a responsive layout carries the mobile UI.</p></li><li><p><b>Mobile keyboard inset</b> — when the keyboard opens, its height is accounted for.</p></li><li><p><b>Fluid sizing</b> — every size is written in rem.</p></li><li><p><b>Many languages</b> — it speaks fourteen.</p></li></ul></div><p><br/></p><h2>Customisation</h2><div data-nabi-p><ul><li><p><b>Your own wings</b> — if you need a feature, build it yourself and register it.</p></li><li><p><b>Your own CSS</b> — colors, corners and spacing are all defined as --nabi-*, so dark, light and anything else is yours to set.</p></li><li><p><b>Open source</b> — it is open source on GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Read the docs → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Wings',
  demo_wings_all: 'All on',
  demo_wings_none: 'All off',
  demo_zoom: 'Zoom',
  demo_zoom_out: 'Zoom out',
  demo_zoom_in: 'Zoom in',
  demo_zoom_reset: 'Reset',
  demo_sticky: 'Sticky toolbar',
  demo_sticky_keyboard: 'Mobile keyboard inset',
  demo_sticky_height: 'Offset',
  demo_sticky_unit: 'Offset unit',
  demo_typeface_base: 'Base typeface',
  demo_typeface_sans: 'Sans serif',
  demo_typeface_serif: 'Serif',
  demo_typeface_mono: 'Monospace',
  demo_typeface_cursive: 'Cursive',
  demo_html_small: '<p>Write here, and switch the wings above on and off.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Point at <b>the words that matter</b>. Select some text and hit <b>B</b> in the toolbar.</p>',
  demo_html_italic:
    '<p>Quotes and unfamiliar words go in <i>italics</i>. Select this sentence and try it.</p>',
  demo_html_underline:
    '<p>There is an <u>underline</u> here. Select those letters and press it again to take it off.</p>',
  demo_html_strikethrough: '<p><s>$19.00</s> $9.90 — keep the old value visible.</p>',
  demo_html_superscript:
    '<p>The area is 3.5m<sup>2</sup>, and footnotes hang like this.<sup>1</sup></p>',
  demo_html_subscript: '<p>Water is H<sub>2</sub>O and the fizz is CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Give it an address and you get <a href="https://example.com">a link like this</a>. An existing link raises no context row — to change the address, delete it and make a new one.</p>',
  demo_html_highlight:
    '<p>Select some text and press the button: six colours — <mark data-color="yellow">yellow</mark>, <mark data-color="green">green</mark>, <mark data-color="cyan">cyan</mark> — open beside the caret.</p><p>Put the caret inside a mark and the same swatches appear in the context row to change the color.</p>',
  demo_html_text_color:
    '<p>Paint text <span data-color="green">green</span>, <span data-color="coral">coral</span> or <span data-color="violet">violet</span> — five colours in all.</p><p><mark data-color="yellow">Overlapping a highlight</mark> is fine: they are different marks, so <span data-color="blue">both apply.</span></p>',
  demo_html_heading:
    '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><p>Body text. Typing # and a space on an empty line makes a heading too.</p>',
  demo_html_bullet_list:
    '<ul><li>A bullet list</li><li>Tab indents, Shift+Tab outdents<ul><li>A nested item</li></ul></li></ul><p>Typing - and a space on an empty line makes one too.</p>',
  demo_html_ordered_list:
    '<ol><li>A numbered list</li><li>Insert or delete an item and the numbers redo themselves</li></ol><p>Typing 1. and a space on an empty line makes one too.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Click the box in front of the text</li><li data-nabi-checked="false">The checked state is saved with the document</li></ul><p>Typing [ ] or [x] on an empty line makes one too.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Key</th><th>What it does</th></tr><tr><td>Tab</td><td>Next cell</td></tr><tr><td>Arrows</td><td>Move by grid</td></tr></tbody></table><p>Put the caret in a cell and the context row fills with row and column commands.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="NABI NOTE logo" data-nabi-width="50"></div><p>Click the image for the width and alignment box.</p>',
  demo_html_youtube:
    '<p>Use the YouTube button in the toolbar, or just paste a video address — the embed lands right here.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Put the caret inside the code and the context row shows a language field.</p>',
  demo_html_details:
    '<details open=""><summary>Click here to fold</summary><p>The folded state is saved with the document — readers see it the way the author left it.</p></details>',
  demo_html_quote:
    '<blockquote><p>A box for words that are not yours. Inside it only character marks apply — the image, code, and table buttons do not appear.</p></blockquote><p>Type &gt; and a space on an empty line and the line becomes a quote.</p>',
  demo_html_divider:
    '<p>A paragraph above the divider.</p><hr><p>And one below. Typing --- alone on a line and pressing Enter also makes a rule.</p>',
  demo_html_align:
    '<p data-nabi-align="l">Aligned left</p><p data-nabi-align="c">Aligned center</p><p data-nabi-align="r">Aligned right</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Extra small — footnotes and asides.</p><p data-nabi-size="sm">Small — a step behind the body.</p><p>A default-size paragraph. Press the button and five steps appear, <b>each in your language, at its own size</b>.</p><p data-nabi-size="lg">Large — a sentence with weight.</p><p data-nabi-size="xl">Extra large — the lede under a title.</p>',
  demo_html_typeface:
    '<p>This paragraph carries no typeface — it shows the page default, sans serif.</p><p data-nabi-typeface="serif">This one is serif. You pick the family; the actual font is whatever this site put on the token, here Noto Serif.</p><p data-nabi-typeface="mono">This one is monospace. Every character takes the same width, which makes columns line up — 0O 1lI</p><p data-nabi-typeface="cursive">This one is cursive — Handwriting · 手書き · 手写.</p><p>Typeface is set <b>per paragraph</b>, and sits happily alongside marks like bold.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">The first letter spans three lines and the text flows around it. Short paragraphs still reserve room for those lines, so the block below is never pushed into.</p><p>This paragraph does not have it.</p>',
  demo_html_clear_format:
    '<p>Select text that is <b>bold</b>, <i>italic</i>, <u>underlined</u> or <s>struck</s> and press the eraser.</p><p>Only character formatting goes — blocks stay exactly as they are.</p>',
  demo_html_upload:
    '<p>Drop a file into this box, or paste one. This site has no server to upload to, so it only pretends — the result lives inside this page and nowhere else.</p><p>A finished attachment looks like <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>.</p>',


  cdn_demo_lead: 'Save the code below as {file} and open it in a browser — you can see it working right away.',
  cdn_demo_download: 'Download demo.html',
  cdn_code_minheight: 'Minimum editor height — keeps it from looking like a single-line box on first load. Change freely.',
  cdn_code_wings: 'Every wing except upload.',
  cdn_code_faces:
    'Of the typefaces, only sans and serif are kept.\nSystems support different typefaces, so mono and cursive need a web font imported separately\nbefore every platform recognizes them. See the "Typeface" page for the details.',
  cdn_code_change: 'Example callback for when the value changes',
  code_copy: 'Copy code',
  demo_install: 'Install',
  demo_code: 'Code',
  demo_chars: '{n} characters',
  demo_tree: 'nabi-tree',
  demo_loading: 'Loading the editor…',

  page_not_found: 'Page not found',
  nav_prev: 'Previous',
  nav_next: 'Next',
}
