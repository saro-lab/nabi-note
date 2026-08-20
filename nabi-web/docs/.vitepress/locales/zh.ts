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
  menu_intro: '介绍',
  menu_intro_index: '什么是 NABI NOTE？',
  menu_intro_usage: '基本用法',
  menu_intro_ssr: 'SSR 支持',
  menu_intro_cdn: '用 CDN 引入',
  menu_intro_vibe_coding: 'AI 氛围编程',

  menu_wing: '翅膀 (Wing)',
  menu_wing_custom: '做你自己的翅膀',
  menu_custom_start: '开始上手',
  menu_custom_inline: '行内标记',
  menu_custom_block: '块与块属性',
  menu_custom_ui: 'UI 与动作',
  menu_custom_input: '按键 · 自动转换 · 粘贴',

  menu_style: '样式',
  menu_style_custom: '自定义样式',

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

  demo_placeholder: '在这里写点什么',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">目前正在用 AI 生成、翻译文档。</p><p data-nabi-align="c">稳定后将改为 1.0.0 版本。</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">开源的 WYSIWYG 编辑器</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> 是一款开源的 WYSIWYG 编辑器，它把格式、对齐、表格、上传等所有主要功能都做成名为「翅膀」的独立模块与内核分离，让开发者可以毫无限制地扩展自己需要的功能。它以追求<b>零框架依赖</b>的纯 Vanilla JS 编写，可以直接用在 React、Vue 或任何环境中，并为没有构建系统的项目提供 <b>CDN 库</b>。它支持自有的 JSON 规格 <b>NABI TREE</b>，因此在没有 DOM 的 Node.js(SSR) 环境中也能提前完成 HTML 与文本的转换；由于只用允许的词汇重新组装文档，无需额外的 Sanitizer 库即可保证<b>从根源上阻断 XSS 脚本</b>。设计方面采用 <b>CSS Variable</b> 体系，便于更换品牌主题色；采用 <b>rem 单位布局</b>，设备缩放时移动端界面依然顺滑；深色/浅色适配的颜色、荧光笔与多语言字体一应俱全。此外还有<b>识别类型的表格列排序</b>、基于 IndexedDB 的<b>本地历史</b>以及对<b>氛围编码</b>的支持，同时满足开发者与写作者的体验。</span></p><p><br/></p><h2>字体</h2><p>无衬线(默认)、衬线、等宽、手写——每一类都按文字体系叠放字体，所以无论写哪种语言都能保持该类的面貌；该类中没有手写字体的文字体系会回落到浏览器默认字体。<b>默认字体由宿主决定。</b></p><p><br/></p><p>下面是<b>以多种语言</b>呈现的字体。</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>字号</h2><p><span data-nabi-size="xs">很小</span></p><p><span data-nabi-size="sm">小</span></p><p><span data-nabi-size="lg">大</span></p><p><span data-nabi-size="xl">很大</span></p><p><br/></p><p><br/></p><h2>标题</h2><p>在空行输入 # 再按空格，当场变成标题。</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>加粗 · 斜体 · 下划线 · 删除线</h2><p><b>加粗</b> <i>斜体</i> <u>下划线</u> <s>删除线</s> 的示例。</p><p><b><i><s><u>也可以叠加使用。</u></s></i></b></p><h3>上标与下标</h3><p>面积是 3.5m<sup>2</sup>，脚注这样<sup>1</sup> 标注。</p><p>水是 H<sub>2</sub>O。</p><p><br/></p><p><br/></p><h2>文字颜色 · 荧光笔</h2><p>配色经过挑选，在浅色与深色模式下都清晰可读。</p><p>文字颜色 <span data-color="green">绿</span> · <span data-color="coral">珊瑚</span> · <span data-color="violet">紫</span> · <span data-color="amber">琥珀</span> · <span data-color="blue">蓝</span></p><p>荧光笔 <mark data-color="yellow">黄</mark> · <mark data-color="green">浅绿</mark> · <mark data-color="cyan">天蓝</mark> · <mark data-color="pink">粉</mark> · <mark data-color="purple">紫</mark> · <mark data-color="orange">橙</mark></p><p><br/></p><p><br/></p><h2>链接</h2><p>放入地址即成为<a href="https://nabi.saro.me/">链接</a>。</p><p>地址只允许 http:// 与 https://，不能使用 javascript: 之类。</p><p>例如输入 <a href="https://nabi.saro.me/">https://nabi.saro.me</a> 后按空格或回车，就会像这样自动转换。</p><h3>target</h3><p>默认同站(origin)内在当前窗口打开，其他站点在新窗口打开；声明编辑器时可以指定这条规则。</p><h3>附件链接</h3><p>上传非图片文件时，会变成下面这样的文件式链接。</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>附件</a> 就是它留下的样子。</p><p><br/></p><p><br/></p><h2>对齐</h2><p>左对齐</p><p>居中对齐</p><p>右对齐</p><h3>标题同样可以对齐。</h3><p><br/></p><p><br/></p><h2>列表</h2><h3>项目符号列表</h3><p>在空行输入 - 再按<b>空格</b>，当场变成项目符号列表。</p><div data-nabi-p><ul><li><p>这是一个项目</p><div data-nabi-p><ul><li><p>用 Tab / Shift+Tab 可以缩进和取消缩进。</p></li></ul></div></li></ul></div><h3>编号列表</h3><p>在空行输入 1. 再按<b>空格</b>，就得到编号列表。</p><div data-nabi-p><ol><li><p>第一</p></li><li><p>第二</p></li><li><p>第三</p></li></ol></div><h3>任务列表</h3><p>在空行输入 [ ] 或 [x] 再按<b>空格</b>，就得到任务列表。</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>这是已勾选的项目。</p></li><li data-nabi-checked="false"><p>这一项还没有勾选。</p></li></ul></div><p><br/></p><p><br/></p><h2>表格</h2><p>点击工具栏的表格来创建，可以增删行列并合并单元格。</p><h3>表格排序</h3><p>先按<b>预览</b>，再依次点击<b>库存</b>与<b>价格</b>的表头。</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>型号</p></th><th><p>库存</p></th><th><p>价格</p></th><th><p>重量</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>待定</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>价格</b>全是数字，因此按数字排序。</p><p><b>库存</b>因为最后一格里有文字，所以按文字排序。(若要避免，请清空最后一格。)</p><p><br/></p><p><br/></p><h2>分隔线</h2><p>输入 --- 后按回车即变成分隔线。</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>图片</h2><p>放入图片地址或上传即变成图片，宽度可在 30%~100% 之间调节，并能左、中、右对齐。</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>上传</h2><p>试着把图片或文件拖到编辑器上。</p><p>示例里用的上传是模拟的，通过设置即可接到你的服务器。</p><p>上传失败时，该图片或文件会从编辑器中移除。</p><p><br/></p><p><br/></p><h2>引用</h2><div data-nabi-p><blockquote><p>在空行输入 &gt; 再按<b>空格</b>，就得到引用框。</p><p>可以写成多行。</p></blockquote></div><p><br/></p><p><br/></p><h2>代码</h2><p>在空行输入 \`\`\` 再按<b>空格或回车</b>，就得到代码框。</p><p>像 \`\`\`java 这样连语言一起写，再按空格或回车，就得到应用了该语言的代码框。</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>折叠</h2><div data-nabi-p><details open><summary>折叠由标题和内容组成。</summary><p>可以指定保存为折起还是展开的状态。</p></details></div><p><br/></p><h2>本地历史</h2><p>通过<b>浏览器的</b> IndexedDB，按设定的间隔留下历史。</p><p>只保存在本地，保留声明的条数。— 默认每 30 秒保存，最近 20 个会话。</p><p><br/></p><p><br/></p><h2>快捷键</h2><p><b>快速按两次 Shift</b>，工具栏就会显示各功能的快捷键。</p><p><br/></p><p><br/></p><h2>自动格式</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>示例</p></th><th><p>操作键</p></th><th><p>结果</p></th></tr><tr><td><p>#</p></td><td><p>空格</p></td><td><p>标题</p></td></tr><tr><td><p>-</p></td><td><p>空格</p></td><td><p>项目符号列表</p></td></tr><tr><td><p>1.</p></td><td><p>空格</p></td><td><p>编号列表</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>空格</p></td><td><p>任务列表</p></td></tr><tr><td><p>&gt;</p></td><td><p>空格</p></td><td><p>引用</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>空格 · 回车</p></td><td><p>代码框</p></td></tr><tr><td><p>---</p></td><td><p>回车</p></td><td><p>分隔线</p></td></tr><tr><td><p>https://…</p></td><td><p>空格 · 回车</p></td><td><p>链接</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>输出函数</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>函数</p></th><th><p>结果</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>支持无 DOM 环境</h2><p>从 JSON 转换成 HTML 时<b>不需要 DOM</b>。</p><p>服务器(Node.js)可以原样读取保存的纳比树，一边防住 XSS 一边组装 HTML。</p><p><br/></p><h2>移动端友好</h2><div data-nabi-p><ul><li><p><b>移动端界面</b> — 以响应式布局支持移动端界面。</p></li><li><p><b>移动端键盘补正</b> — 键盘弹出时会补正它的高度。</p></li><li><p><b>弹性尺寸</b> — 所有尺寸都以 rem 为单位。</p></li><li><p><b>多语言</b> — 支持十四种语言。</p></li></ul></div><p><br/></p><h2>自定义</h2><div data-nabi-p><ul><li><p><b>自制翅膀</b> — 需要什么功能，都可以自己做出来使用。</p></li><li><p><b>自定义 CSS</b> — 颜色、圆角、间距全部以 --nabi-* 定义，深色浅色都可自行设定。</p></li><li><p><b>开源</b> — 通过 GitHub 以开源方式提供。</p></li></ul></div><div data-nabi-p><hr/></div><p>查看文档 → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
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
    '<p>选中文字按下按钮，光标旁边会弹出色板：一共六种颜色 —— <mark data-color="yellow">黄色</mark>、<mark data-color="green">绿色</mark>、<mark data-color="cyan">青色</mark>、<mark data-color="pink">粉色</mark>、<mark data-color="purple">紫色</mark>、<mark data-color="orange">橙色</mark>。</p><p>把光标放进已经上色的地方，上下文工具栏里会出现同一块色板，只用来换颜色。</p>',
  demo_html_text_color:
    '<p>给文字染上五种颜色 —— <span data-color="green">绿色</span>、<span data-color="coral">珊瑚色</span>、<span data-color="violet">紫罗兰</span>、<span data-color="amber">琥珀色</span>、<span data-color="blue">蓝色</span>。</p><p><mark data-color="yellow">和荧光笔叠在一起</mark>也没问题——它们是不同的标记，<span data-color="blue">两个都会生效。</span></p>',
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
    '<blockquote><p>装别人的话用的框。里面只有文字标记能用，图片、代码、表格的按钮不会出现。</p></blockquote><p>在空行上敲 &gt; 再加空格，那一行就会变成引用。</p>',
  demo_html_divider:
    '<p>分割线上面的段落。</p><hr><p>分割线下面的段落。在空行上只敲 --- 再按回车，也能变成分割线。</p>',
  demo_html_align:
    '<p data-nabi-align="l">左对齐</p><p data-nabi-align="c">居中对齐</p><p data-nabi-align="r">右对齐</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">特小——用在脚注、旁白。</p><p data-nabi-size="sm">小一号——比正文退一步的语气。</p><p>默认大小的段落。按下按钮，五个级别会用你的语言、各自的大小出现。</p><p data-nabi-size="lg">大一号——分量重一点的句子。</p><p data-nabi-size="xl">特大——标题下面的导语。</p>',
  demo_html_typeface:
    '<p>这个段落没有挂字体，显示的是页面默认的无衬线体。</p><p data-nabi-typeface="serif">这个段落是衬线体。挑的是种类，实际字体是这个站点绑在这个令牌上的那款——这里是 Noto Serif。</p><p data-nabi-typeface="mono">这个段落是等宽字体。每个字符宽度一样，方便对齐——0O 1lI</p><p data-nabi-typeface="cursive">这个段落是手写体。因为是手写的样子，一般用在引用或旁注上——Handwriting · 手書き · 手写。</p><p>字体是按段落分别挂的。标题和表格固定用无衬线体，代码固定用等宽字体。什么都没挂的段落，显示的是<b>声明翅膀时定好的默认值</b>——不特别指定的话就是无衬线体。</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">首字占据三行的高度，其余文字绕着它排布。就算段落很短，也照样留出那三行的位置，不会挤到下一个块上。</p><p>这段没有挂它。</p>',
  demo_html_clear_format:
    '<p>选中同时带有<b>加粗</b>、<i>斜体</i>、<u>下划线</u>、<s>删除线</s>的文字，按一下橡皮擦试试。</p><p>只会清掉文字格式，块本身原封不动。</p>',
  demo_html_upload:
    '<p>把文件拖进这个框里，或者直接粘贴一个。这个网站没有服务器可以真的上传，只是做做样子——结果只留在这个页面里，不会去别的地方。</p><p>上传完成的附件长得像 <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a> 这样。</p>',


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
  demo_chars: '{n} 字',
  demo_tree: 'nabi-tree',
  demo_loading: '正在加载编辑器…',

  page_not_found: '找不到页面',
  nav_prev: '上一页',
  nav_next: '下一页',
}
