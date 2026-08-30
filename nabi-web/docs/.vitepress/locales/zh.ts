// Translated — the demo document and the site's own labels are in Chinese, and every wing
// name is the word its toolbar button shows. A missing key is a type error: the file stays whole.
// 옮겼다 — 데모 문서도 사이트 낱말도 중국어다. 날개 이름은 하나같이 그 날개의 툴바 버튼에
// 뜨는 말 그대로다. 키가 하나라도 빠지면 타입 오류라 파일은 온전해야 한다.
export const zh = {
  label: '中文',
  lang: 'zh',
  link: '/zh/',
  description: 'NABI NOTE — 开源的 WYSIWYG 编辑器。',

  menu_docs: '文档',
  menu_start: '指南',
  menu_getting_started: '基本用法',
  menu_cdn: 'CDN 的使用方法',
  menu_features: 'wing',
  menu_style_guide: 'CSS 主题',
  menu_rendering: 'SSR 设置',
  menu_extend_guide: '自定义 wing',
  menu_intro_vibe_coding: 'AI 氛围编程',



  menu_projects: '项目',

  menu_inline: '行内',
  menu_inline_bold: '加粗',
  menu_inline_italic: '斜体',
  menu_inline_underline: '下划线',
  menu_inline_strikethrough: '删除线',
  menu_inline_superscript: '上标',
  menu_inline_subscript: '下标',
  menu_inline_link: '链接',
  menu_inline_highlight: '荧光笔',
  menu_inline_text_color: '文字颜色',

  menu_block: '块',
  menu_block_heading: '标题',
  menu_block_bullet_list: '项目符号列表',
  menu_block_ordered_list: '编号列表',
  menu_block_task_list: '任务列表',
  menu_block_table: '表格',
  menu_block_image: '图片',
  menu_block_youtube: 'YouTube',
  menu_block_code: '代码',
  menu_block_details: '折叠块',
  menu_block_quote: '引用',
  menu_block_divider: '分隔线',

  menu_etc: '其他',
  menu_etc_align: '对齐',
  menu_etc_dropcap: '首字下沉',
  menu_etc_typeface: '字体',
  menu_etc_font_size: '文字大小',
  menu_etc_clear_format: '清除格式',
  menu_etc_upload: '上传文件',

  search: '搜索',
  search_no_results: '没有结果',
  search_hint: '请输入搜索词',
  search_move: '移动',
  search_open: '打开',
  search_close: '关闭',

  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c"></p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">开源 WYSIWYG 编辑器</span></i></span></p><p></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> 是一款开源 WYSIWYG 编辑器，它把格式、对齐、表格、上传等功能从核心中分离出来，作为名为 wing 的独立模块组成。你可以只选择需要的 wing 来组装编辑器，也可以连接自己制作的 wing。它用纯 JavaScript 编写，因此可以在 React 或 Vue 等框架中使用。没有构建环境的页面也可以通过 <b>CDN 库</b> 立即开始。它自己的文档格式 <b>NABI TREE</b> 即使在没有浏览器 DOM 的 Node.js 环境中也能转换为 HTML。输入的文档会按照已注册规则整理；生成 HTML 时会转义文本和属性，并检查链接地址。不过，自定义 wing 和从服务器接收的数据仍然需要按照应用的安全策略另行检查。CSS 变量和基于 rem 的布局可以调整主题和大小，也提供适合深色模式和多语言的字体设置。表格排序、本地历史以及 AI 辅助的文档工作，也都延续在同一个文档模型之上。</span></p><p></p><h2>字体</h2><p>无衬线（默认）、衬线、等宽、手写体都准备了按语言回退的字体。若没有适合所选字体类别的字体，就会显示浏览器默认字体。<b>编辑器的默认字体由宿主页面决定。</b></p><p></p><p>下面可以查看各种字体在<b>多种语言</b>中如何显示。</p><p></p><p><span data-nabi-typeface="sans"><span data-nabi-size="lg">无衬线 · Serifenlos · Sans empattement · Sin serifa · Sem serifa · Без засечек · بلا زخارف · सैन्स सेरिफ़ · স্যান্স সেরিফ · سانس سیرف · Tanpa serif · بدون سریف · सॅन्स सेरिफ · Không chân · శాన్స్ సెరిఫ్ · Mara seref · Sans serif · Bila serif · சான்ஸ் செரிஃப் · ไร้เชิง · Senza grazie · 산세리프 · ゴシック体</span></span></p><p></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">衬线 · Serif · Avec empattement · Con serifa · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif · سریف · सेरिफ · Có chân · సెరిఫ్ · Mai seref · Yenye serif · செரிஃப் · มีเชิง · Con grazie · 세리프 · 明朝体</span></span></p><p></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap · تک‌فاصله · Đơn cách · మోనోస్పేస్ · Tazara ɗaya · Eş aralıklı · Nafasi moja · ஒற்றையகலம் · ความกว้างคงที่ · Monospaziato · Monospace · 고정폭 · 等幅</span></span></p><p></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체 · 筆記体</span></span></p><p></p><p></p><h2>文字大小</h2><p><span data-nabi-size="xs">非常小</span></p><p><span data-nabi-size="sm">小</span></p><p><span data-nabi-size="lg">大</span></p><p><span data-nabi-size="xl">非常大</span></p><p></p><p></p><h2>标题</h2><p>在空行输入 # 并按 Space，就会变成标题。</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p></p><p></p><h2>加粗 · 斜体 · 下划线 · 删除线</h2><p><b>加粗</b> <i>斜体</i> <u>下划线</u> <s>删除线</s> 可以一起应用在同一段文字上。</p><p><b><i><s><u>也可以叠加使用。</u></s></i></b></p><h3>上下标</h3><p>面积是 3.5m<sup>2</sup>，脚注可以这样添加。<sup>1</sup></p><p>水是 H<sub>2</sub>O。</p><p></p><p></p><h2>文字颜色 · 荧光笔</h2><p>颜色经过配置，在浅色模式和深色模式下都易读。</p><p>文字颜色 <span data-color="green">绿色</span> · <span data-color="coral">珊瑚色</span> · <span data-color="violet">紫色</span> · <span data-color="amber">琥珀色</span> · <span data-color="blue">蓝色</span></p><p>荧光笔 <mark data-color="yellow">黄色</mark> · <mark data-color="green">浅绿</mark> · <mark data-color="cyan">天蓝</mark> · <mark data-color="pink">粉色</mark> · <mark data-color="purple">紫色</mark> · <mark data-color="orange">橙色</mark></p><p></p><p></p><h2>链接</h2><p>输入地址后会变成<a href="https://nabi.saro.me/">链接</a>。</p><p>除了 http:// 或 https:// 地址，也可以使用以 . 或 / 开头的同站路径。javascript: 这样的地址不允许使用。</p><p>例如输入 <a href="https://nabi.saro.me/">https://nabi.saro.me</a> 后按 Space 或 Enter，就会自动变成链接。</p><h3>链接打开方式</h3><p>文档只保存链接地址，链接如何打开由显示文档的页面决定。</p><h3>附件链接</h3><p>图片以外的文件会以下面的附件链接形式保留下来。</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>附件文件</a> 链接会保存到文档中。</p><p></p><p></p><h2>对齐</h2><p>左对齐</p><p>居中对齐</p><p>右对齐</p><h3>标题的对齐方式也可以改变。</h3><p></p><p></p><h2>列表</h2><h3>项目符号列表</h3><p>在空行输入 - 并按 <b>Space</b>，就会变成项目符号列表。</p><div data-nabi-p><ul><li><p>这是项目符号列表。</p><div data-nabi-p><ul><li><p>可以用 Tab / Shift+Tab 缩进和取消缩进。</p></li></ul></div></li></ul></div><h3>编号列表</h3><p>在空行输入 1. 并按 <b>Space</b>，就会变成编号列表。</p><div data-nabi-p><ol><li><p>第一</p></li><li><p>第二</p></li><li><p>第三</p></li></ol></div><h3>任务列表</h3><p>在空行输入 [ ] 或 [x] 并按 <b>Space</b>，就会变成任务列表。</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>已勾选的项目。</p></li><li data-nabi-checked="false"><p>尚未勾选的项目。</p></li></ul></div><p></p><p></p><h2>表格</h2><p>点击工具栏中的表格创建后，可以添加或删除行列，并合并需要的单元格。</p><h3>表格排序</h3><p>点击 <b>预览</b>，再依次点击 <b>库存</b> 和 <b>价格</b> 表头。</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>型号</p></th><th><p>库存</p></th><th><p>价格</p></th><th><p>重量</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>待定</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>价格</b>列全部是数字，因此按数字排序。</p><p><b>库存</b>列混有数字和文字，因此按字符串排序。</p><p></p><p></p><h2>分隔线</h2><p>输入 --- 后按 Enter，会变成分隔线。</p><div data-nabi-p><hr/></div><p></p><p></p><h2>图片</h2><p>图片大小可从 30% 调整到 100%，也可以左对齐、居中或右对齐。</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p></p><p></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p></p><p></p><h2>上传</h2><p>试着把图片或文件拖到编辑器里。</p><p>这个 demo 不会真的把文件发送到服务器。连接上传器后，可以保存到服务器。</p><p>上传失败的项目不会添加到文档中。</p><p></p><p></p><h2>引用</h2><div data-nabi-p><blockquote><p>在空行输入 &gt; 并按 <b>Space</b>，就会变成引用。</p><p>可以使用多行。</p></blockquote></div><p></p><p></p><h2>代码</h2><p>在空行输入 \`\`\` 并按 <b>Space 或 Enter</b>，就会变成代码框。</p><p>像 \`\`\`java 这样输入语言名称并按 Space 或 Enter，就会变成指定了该语言的代码框。</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p></p><p></p><h2>折叠</h2><div data-nabi-p><details open><summary>折叠块由标题和内容组成。</summary><p>可以按需要保存为折起或展开状态。</p></details></div><p></p><h2></h2><h2>快捷键</h2><p><b>快速按两次 Shift</b>，工具栏会显示各功能的快捷键。</p><p></p><p></p><h2>自动格式</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>示例</p></th><th><p>操作键</p></th><th><p>说明</p></th></tr><tr><td><p>#</p></td><td><p>空格</p></td><td><p>标题</p></td></tr><tr><td><p>-</p></td><td><p>空格</p></td><td><p>项目符号列表</p></td></tr><tr><td><p>1.</p></td><td><p>空格</p></td><td><p>编号列表</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>空格</p></td><td><p>任务列表</p></td></tr><tr><td><p>&gt;</p></td><td><p>空格</p></td><td><p>引用</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>空格 · Enter</p></td><td><p>代码框</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>分隔线</p></td></tr><tr><td><p>https://…</p></td><td><p>空格 · Enter</p></td><td><p>链接</p></td></tr></table></div></div><p></p><p></p><h3>输出函数</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>函数</p></th><th><p>结果</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p></p><p></p><h2>支持无 DOM 环境</h2><p>将 NABI TREE 转换为 HTML 时，<b>不需要 DOM</b>。</p><p>服务器（Node.js）也可以读取保存的 NABI TREE，并按照同一规则生成 HTML。</p><p></p><h2>移动环境</h2><div data-nabi-p><ul><li><p><b>移动 UI</b> — 按屏幕宽度布置编辑工具。</p></li><li><p><b>移动键盘修正</b> — 键盘打开时调整编辑画面的高度。</p></li><li><p><b>可变大小</b> — 所有大小都以 rem 单位编写。</p></li><li><p><b>多语言</b> — 支持多种语言。</p></li></ul></div><p></p><h2>自定义</h2><div data-nabi-p><ul><li><p><b>自定义 wing</b> — 需要的功能可以自己制作并使用。</p></li><li><p><b>自定义 CSS</b> — 颜色、圆角、间距都定义为 --nabi-*，深色和浅色都可以自行设置。</p></li><li><p><b>开源</b> — 在 GitHub 上以开源形式提供。</p></li></ul></div><div data-nabi-p><hr/></div><p>查看文档 → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: '翅膀',
  demo_wings_all: '全部开启',
  demo_wings_none: '全部关闭',
  demo_zoom: '缩放',
  demo_zoom_out: '缩小',
  demo_zoom_in: '放大',
  demo_zoom_reset: '还原',
  demo_sticky: '固定工具栏',
  demo_sticky_keyboard: '移动端键盘补偿',
  demo_sticky_height: '高度',
  demo_sticky_unit: '高度单位',
  demo_typeface_base: '默认字体',
  demo_typeface_sans: '无衬线',
  demo_typeface_serif: '衬线',
  demo_typeface_mono: '等宽',
  demo_typeface_cursive: '手写体',
  demo_html_small: '<p>在这里试着写点什么，再把上面的翅膀开关开开看。</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>用<b>加粗</b>标出重要的词。选中一段文字，按工具栏里的 <b>B</b> 试试看。</p>',
  demo_html_italic:
    '<p>生僻词或者引用一般用<i>斜体</i>。选中这句话试试看。</p>',
  demo_html_underline:
    '<p>这里有一条<u>下划线</u>。选中这几个字再按一次就能去掉。</p>',
  demo_html_strikethrough: '<p><s>¥129</s> ¥89 —— 用来留住划掉之前的价格。</p>',
  demo_html_superscript:
    '<p>面积是 3.5m<sup>2</sup>，脚注就像这样标注。<sup>1</sup></p>',
  demo_html_subscript: '<p>水是 H<sub>2</sub>O，汽水里的气是 CO<sub>2</sub>。</p>',
  demo_html_link:
    '<p>填一个地址就变成<a href="https://example.com">这样的链接</a>。已有的链接不会弹出上下文工具栏——要改地址得先删掉再重新做一个。</p>',
  demo_html_highlight:
    `<p>选中文字并按荧光笔按钮，会打开调色板。可以选择 <mark data-color="yellow">黄色</mark> · <mark data-color="green">绿色</mark> · <mark data-color="cyan">青色</mark> · <mark data-color="pink">粉色</mark> · <mark data-color="purple">紫色</mark> · <mark data-color="orange">橙色</mark>。</p><p>把光标放在已高亮文字中，可以从上下文工具改变颜色。</p>`,
  demo_html_text_color:
    `<p>给选中文字应用 <span data-color="green">绿色</span> · <span data-color="coral">珊瑚色</span> · <span data-color="violet">紫色</span> · <span data-color="amber">琥珀色</span> · <span data-color="blue">蓝色</span>。</p><p><mark data-color="yellow">荧光笔</mark> 和 <span data-color="blue">文字颜色可以一起应用。</span></p>`,
  demo_html_heading:
    '<h1>标题一</h1><h2>标题二</h2><h3>标题三</h3><p>这是正文。在空行上敲 # 再加空格，也能变成标题。</p>',
  demo_html_bullet_list:
    '<ul><li>一个无序列表</li><li>Tab 缩进，Shift+Tab 取消缩进<ul><li>一个嵌套项</li></ul></li></ul><p>在空行上敲 - 再加空格，也能变成列表。</p>',
  demo_html_ordered_list:
    '<ol><li>一个有序列表</li><li>插入或删除一项，编号会自动重排</li></ol><p>在空行上敲 1. 再加空格，也能变成编号列表。</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">点文字前面的方框可以打勾</li><li data-nabi-checked="false">打勾的状态会存进文档里</li></ul><p>在空行上敲 [ ] 或 [x]，也能变成任务列表。</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>按键</th><th>做什么</th></tr><tr><td>Tab</td><td>跳到下一格</td></tr><tr><td>方向键</td><td>按格子移动</td></tr></tbody></table><p>把光标放进某一格，上下文工具栏会填满行、列相关的命令。</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="NABI NOTE 标志" data-nabi-width="50"></div><p>点一下图片，会弹出宽度、对齐的设置框。</p>',
  demo_html_youtube:
    '<p>用工具栏上的 YouTube 按钮，或者直接粘贴一个视频地址——嵌入的视频就会出现在这里。</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>把光标放进代码里，上下文工具栏会出现语言输入框。选中多行按 Tab，选中的行会一起缩进，Shift+Tab 则退回去。</p>',
  demo_html_details:
    '<details open=""><summary>点这里折叠</summary><p>折叠的状态会存进文档——读者看到的就是作者折起来的样子。</p></details>',
  demo_html_quote:
    `<blockquote><p>可以把其他文章中的一句话，或想单独区分的内容，整理成引用。</p><p>引用中可以一起包含多个段落和块。</p></blockquote><p>在空行输入 &gt; 和一个空格，就会把那一行变成引用。</p>`,
  demo_html_divider:
    '<p>分割线上面的段落。</p><hr><p>分割线下面的段落。在空行上只敲 --- 再按回车，也能变成分割线。</p>',
  demo_html_align:
    '<p data-nabi-align="l">左对齐</p><p data-nabi-align="c">居中对齐</p><p data-nabi-align="r">右对齐</p>',
  demo_html_font_size:
    `<p data-nabi-size="xs">非常小 — 适合脚注或补充说明。</p><p data-nabi-size="sm">小 — 比正文小一级。</p><p>默认大小的段落。大小菜单中也会按实际显示大小展示每个文字大小。</p><p data-nabi-size="lg">大 — 适合需要强调的句子。</p><p data-nabi-size="xl">非常大 — 适合标题下的导入句。</p><p>文字大小会应用到选中的范围。如果只有光标，则应用到当前段落的文字。</p>`,
  demo_html_typeface: "<p>这个段落没有指定字体。它会使用页面默认字体显示。</p><p data-nabi-typeface=\"serif\">这个段落使用衬线字体。选择 serif 这样的字体类别时，实际字体会跟随站点 CSS。</p><p data-nabi-typeface=\"mono\">这个段落使用等宽字体。固定字符宽度便于对齐数字或代码 — 0O 1lI</p><p data-nabi-typeface=\"cursive\">手写体 · Schreibschrift · Cursive · Cursiva · Рукописный · خط اليد · हस्तलिपि · হস্তলিপি · رواں خط · Tulisan tangan · دست‌نویس · हस्ताक्षर · Chữ viết tay · చేతిరాత · Rubutun hannu · El yazısı · Mwandiko · கையெழுத்து · ลายมือ · Corsivo · 필기체 · 筆記体</p>",
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">首字占据三行的高度，其余文字绕着它排布。就算段落很短，也照样留出那三行的位置，不会挤到下一个块上。</p><p>这段没有挂它。</p>',
  demo_html_clear_format:
    '<p>选中同时带有<b>加粗</b>、<i>斜体</i>、<u>下划线</u>、<s>删除线</s>的文字，按一下橡皮擦试试。</p><p>只会清掉文字格式，块本身原封不动。</p>',
  demo_html_upload:
    `<p>把文件拖进编辑区域，或粘贴一个文件。这个 demo 没有连接真实上传服务器，所以文件不会存到服务器。</p><p>上传结束后，文件可以作为 <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">附件</a> 留在文档中。</p>`,


  cdn_demo_lead: '把下面的代码存成 {file}，用浏览器打开就能立刻看到效果。',
  cdn_demo_download: '下载 demo.html',
  cdn_code_minheight: '编辑区最小高度 —— 避免刚打开时看起来像只有一行的小方框。数值可以随意改。',
  cdn_code_wings: '除了上传以外的全部翅膀。',
  cdn_code_faces:
    '字体只留无衬线和衬线两种。\n各系统支持的字体不一样，等宽体、手写体要单独 import 才能在所有平台上认出来。\n详情见"字体"文档。',
  cdn_code_change: '值变化时的回调例子',
  code_copy: '复制代码',
  demo_install: '安装',
  demo_code: '代码',
  demo_tree: 'nabi-tree',
  demo_loading: '正在加载编辑器…',

  page_not_found: '找不到页面',
}
