export const ko = {
  label: '한국어',
  lang: 'ko',
  link: '/ko/',
  description: 'NABI NOTE — 오픈소스 WYSIWYG 에디터.',

  menu_docs: '문서',
  menu_intro: '소개',
  menu_intro_index: 'NABI NOTE란?',
  menu_intro_usage: '기본 사용법',
  menu_intro_ssr: 'SSR 지원',
  menu_intro_cdn: 'CDN 사용법',
  menu_intro_vibe_coding: 'AI 바이브 코딩',

  menu_wing: '날개 (Wing)',
  menu_wing_custom: '커스텀 날개 만들기',
  menu_custom_start: '시작하기',
  menu_custom_inline: '인라인 마크',
  menu_custom_block: '블록과 문단 속성',
  menu_custom_ui: 'UI 와 동작',
  menu_custom_input: '키·자동 변환·붙여넣기',

  menu_style: '꾸미기',
  menu_style_custom: '스타일 바꾸기',

  menu_projects: '프로젝트',

  menu_inline: '인라인',
  menu_inline_bold: '굵게',
  menu_inline_italic: '기울임',
  menu_inline_underline: '밑줄',
  menu_inline_strikethrough: '취소선',
  menu_inline_superscript: '윗첨자',
  menu_inline_subscript: '아랫첨자',
  menu_inline_link: '링크',
  menu_inline_highlight: '형광펜',
  menu_inline_text_color: '글자색',

  menu_block: '블록',
  menu_block_heading: '제목',
  menu_block_bullet_list: '글머리 목록',
  menu_block_ordered_list: '번호 목록',
  menu_block_task_list: '체크리스트',
  menu_block_table: '표',
  menu_block_image: '이미지',
  menu_block_youtube: '유튜브',
  menu_block_code: '코드',
  menu_block_details: '접기',
  menu_block_quote: '인용',
  menu_block_divider: '구분선',

  menu_etc: '기타',
  menu_etc_align: '정렬',
  menu_etc_dropcap: '드롭 캡',
  menu_etc_typeface: '서체',
  menu_etc_font_size: '글자 크기',
  menu_etc_clear_format: '서식 지우기',
  menu_etc_upload: '파일 업로드',

  search: '검색',
  search_no_results: '결과가 없습니다',
  search_hint: '검색어를 입력해주세요',
  search_move: '이동',
  search_open: '열기',
  search_close: '닫기',

  demo_placeholder: '여기에 써 보세요',
  // Every default wing must appear exactly once — a missing one turns this document into a lie
  // 기본 날개 전부가 한 번씩 나와야 한다 — 빠진 날개가 있으면 그 자리에서 거짓말이 된다
  // The YouTube clip is a placeholder (CC-BY, Blender Foundation); swap the id in both `data-nabi-video` and `src`
  // 유튜브 영상은 자리를 채워 둔 것이다 — 영상 id 만 갈면 된다 (`data-nabi-video` 와 `src` 둘 다)
  // Keep it plain: an introduction, not an ad flyer
  // 담백한 설명으로 — 광고 전단지가 되지 않게
  demo_html: `<p data-nabi-align="c">현재 AI로 문서 생성-번역중 입니다.</p><p data-nabi-align="c">안정화 되면 1.0.0 버전으로 변경합니다.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">오픈소스 WYSIWYG 에디터</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>나비 노트</b>는 에디터의 모든 주요 기능(서식, 정렬, 표, 업로드 등)을 '날개'라는 독립 모듈로 코어와 분리하여, 개발자가 원하는 커스텀 기능을 제한 없이 확장할 수 있게 설계된 오픈소스 WYSIWYG 에디터입니다. <b>프레임워크 종속성 ZERO</b>를 지향하는 순수 Vanilla JS 기반으로 작성되어 React, Vue 등 어떤 환경에서도 유연하게 도입할 수 있으며, 빌드 시스템이 없는 프로젝트를 위한 <b>CDN 라이브러리</b>도 함께 제공합니다. 특히 자체 JSON 규격인 <b>NABI TREE</b>를 지원하여 DOM이 없는 Node.js(SSR) 환경에서도 손쉽게 HTML-Text 변환을 미리 처리할 수 있고, 허용된 어휘만 재조립하는 화이트리스트 방식을 통해 별도의 Sanitizer 라이브러리 없이도 <b>원천적인 XSS 스크립트 차단</b>을 보장합니다. 디자인 측면에서는 <b>CSS Variable</b> 시스템을 채택해 브랜드 테마 컬러 변경이 용이하고, <b>rem 단위 레이아웃</b>을 적용하여 디바이스 확대·축소 시에도 매끄러운 모바일 친화적 UI를 선사하며, 다크/라이트 모드 최적화 컬러·형광펜·다국어 서체까지 완벽히 탑재했습니다. 나아가 <b>타입 인지형 표(Table) 열 정렬</b>, IndexedDB 기반 <b>로컬 히스토리</b>, <b>바이브 코딩</b> 지원까지 개발자 및 사용자 경험을 동시에 만족시키는 완성도 높은 에디터 환경을 제공합니다.</span></p><p><br/></p><h2>서체</h2><p>산세리프(기본)·세리프·고정폭·필기체등 갈래마다 문자별로 글꼴을 쌓아 두어 어느 언어를 써 넣어도 그 갈래의 모양이 유지되고, 그 갈래에 손글씨가 없는 문자는 브라우저 기본 글꼴로 떨어집니다. <b>기본 서체는 호스트가 정합니다</b></p><p><br/></p><p>아래는 <b>다중 언어로</b> 표현한 서체입니다.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>글자 크기</h2><p><span data-nabi-size="xs">아주 작게</span></p><p><span data-nabi-size="sm">작게</span></p><p><span data-nabi-size="lg">크게</span></p><p><span data-nabi-size="xl">아주 크게</span></p><p><br/></p><p><br/></p><h2>제목 (Heading)</h2><p>빈 줄에서 #를 쓴 후 스페이스를 입력하여 바로 제목을 사용할 수 있습니다.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>굵게 · 기울임 · 밑줄 · 취소선</h2><p><b>굵게</b> <i>기울임</i> <u>밑줄</u> <s>취소선</s> 예제입니다.</p><p><b><i><s><u>겹쳐서도 사용할 수 있습니다.</u></s></i></b></p><h3>첨자</h3><p>넓이는 3.5m<sup>2</sup>, 각주는 이렇게<sup>1</sup> 답니다.</p><p>물은 H<sub>2</sub>O 입니다.</p><p><br/></p><p><br/></p><h2>글자색 · 형광펜</h2><p>라이트 / 다크모드를 지원하기위해 잘 보이는 색으로 구성되어 있습니다.</p><p>글자색 <span data-color="green">초록</span> · <span data-color="coral">코랄</span> · <span data-color="violet">보라</span> · <span data-color="amber">호박</span> · <span data-color="blue">파랑</span></p><p>형광펜 <mark data-color="yellow">노랑</mark> · <mark data-color="green">연두</mark> · <mark data-color="cyan">하늘</mark> · <mark data-color="pink">분홍</mark> · <mark data-color="purple">보라</mark> · <mark data-color="orange">주황</mark></p><p><br/></p><p><br/></p><h2>링크</h2><p>주소를 넣으면 <a href="https://nabi.saro.me/">링크</a>가 됩니다.</p><p>주소는 http:// https:// 만 허용하며 javascript: 같은것을 사용할 수 없습니다.</p><p>예를들어 <a href="https://nabi.saro.me/">https://nabi.saro.me</a> 입력 후 스페이스나 엔터를 칠 경우 보시는 것 처럼 자동 전환 됩니다.</p><h3>target</h3><p>기본값은 같은 사이트(origin)내에서는 현재창 다른 사이트는 새 창으로 열리며 편집기 선언시 이 규칙을 지정 할 수 있습니다.</p><h3>첨부링크</h3><p>이미지가 아닌 파일을 업로드 할 경우 아래와 같이 파일 형태의 링크가 됩니다.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>첨부파일</a> 처럼 남습니다.</p><p><br/></p><p><br/></p><h2>정렬</h2><p>왼쪽 정렬</p><p>가운데 정렬</p><p>오른쪽 정렬</p><h3>제목(Heading)도 정렬이 가능합니다.</h3><p><br/></p><p><br/></p><h2>목록</h2><h3>글머리 목록</h3><p>빈 줄에서 - 를 치고 <b>스페이스를 </b>누르면 그 자리에서 글머리 목록이 됩니다.</p><div data-nabi-p><ul><li><p>글머리 목록입니다</p><div data-nabi-p><ul><li><p>Tab / Shift Tab으로 들여쓰기와 내어쓰기를 할 수 있습니다.</p></li></ul></div></li></ul></div><h3>번호 목록</h3><p>빈 줄에서 1. 을 치고 <b>스페이스</b>를 누르면 번호 목록이 됩니다.</p><div data-nabi-p><ol><li><p>첫째</p></li><li><p>둘째</p></li><li><p>셋째</p></li></ol></div><h3>체크리스트</h3><p>빈 줄에서 [ ] 혹은 [x]를 치고 <b>스페이스</b>를 누르면 체크리스트가 됩니다.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>체크된 항목입니다.</p></li><li data-nabi-checked="false"><p>아직 체크되지 않은 항목입니다.</p></li></ul></div><p><br/></p><p><br/></p><h2>표</h2><p>툴바에서 표를 클릭하여 만들고 행과 열을 추가 삭제 병합 할 수 있습니다.</p><h3>표 정렬</h3><p><b>미리보기</b>를 누르고 <b>재고</b>와 <b>가격</b> 제목 칸을 차례로 눌러 보세요.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>모델</p></th><th><p>재고</p></th><th><p>가격</p></th><th><p>무게</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>미정</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>가격</b>은 모두 숫자이기 때문에 숫자 기준으로 정렬됩니다.</p><p><b>재고는 </b>마지막 칸의 글자로 인해서 글자 기준으로 정렬됩니다. (이를 피하려면 마지막 글자를 제거하고 빈칸으로 두시면됩니다.)</p><p><br/></p><p><br/></p><h2>구분선</h2><p>---를 입력 후 엔터를 누르면 구분선으로 변합니다.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>이미지</h2><p>이미지 주소를 넣거나 업로드시에 이미지로 변하며 크기는 30%~100% 까지 조절이 가능하고 왼쪽·가운데·오른쪽으로 정렬 할 수 있습니다.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>유튜브</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>업로드</h2><p>이미지나 파일을 편집기에 드레그 해보세요.</p><p>예제에 쓰인 업로드는 목업이며 설정을 통해 서버에 연결 해 줄 수 있습니다.</p><p>업로드에 실패한 경우 업로드한 이미지나 파일은 에디터에서 제거됩니다.</p><p><br/></p><p><br/></p><h2>인용</h2><div data-nabi-p><blockquote><p>빈 줄에서 &gt; 를 치고 <b>스페이스</b>를 누르면 인용 상자가 됩니다.</p><p>여러 줄 사용이 가능합니다.</p></blockquote></div><p><br/></p><p><br/></p><h2>코드</h2><p>빈 줄에서 \`\`\` 를 치고 <b>스페이스나 엔터</b>를 누르면 코드 상자가 됩니다.</p><p>\`\`\`java 처럼 언어를 쓰고 스페이스나 엔터를 치면 해당 언어가 적용된 코드 박스가 됩니다.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>접기</h2><div data-nabi-p><details open><summary>접기는 제목과 내용으로 구성됩니다.</summary><p>접혀진 상태와 펼처진 상태를 지정하여 쓸 수 있습니다.</p></details></div><p><br/></p><h2>로컬 히스토리</h2><p><b>브라우저의 </b>IndexedDB를 통해 지정된 시간마다 히스토리를 남깁니다.</p><p>로컬에만 저장되며 선언한 갯수만큼 저장합니다. - 기본값 30초 마다 저장 최근 20개의 세션.</p><p><br/></p><p><br/></p><h2>단축키</h2><p><b>Shift 를 빠르게 두 번</b> 누르면 툴바에 해당 기능에 대한 단축키가 나옵니다.</p><p><br/></p><p><br/></p><h2>자동 서식</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>예시</p></th><th><p>액션 키</p></th><th><p>설명</p></th></tr><tr><td><p>#</p></td><td><p>공백</p></td><td><p>제목</p></td></tr><tr><td><p>-</p></td><td><p>공백</p></td><td><p>글머리 목록</p></td></tr><tr><td><p>1.</p></td><td><p>공백</p></td><td><p>번호 목록</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>공백</p></td><td><p>체크리스트</p></td></tr><tr><td><p>&gt;</p></td><td><p>공백</p></td><td><p>인용</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>공백 · 엔터</p></td><td><p>코드 상자</p></td></tr><tr><td><p>---</p></td><td><p>엔터</p></td><td><p>구분선</p></td></tr><tr><td><p>https://…</p></td><td><p>공백 · 엔터</p></td><td><p>링크</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>출력 함수</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>함수</p></th><th><p>결과</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>돔리스 환경 지원</h2><p>JSON 활용시 HTML 변환 시 <b>DOM 이 필요 없습니다</b>.</p><p>서버(Node.js)에서 저장된 나비트리를 그대로 읽어 XSS를 방어하며 HTML을 조립할 수 있습니다.</p><p><br/></p><h2>모바일 친화적</h2><div data-nabi-p><ul><li><p><b>모바일 UI</b> — 반응형 웹으로 모바일 UI를 지원합니다.</p></li><li><p><b>모바일 키보드 보정</b> — 모바일에서 키보드가 나오면 그 높이를 보정합니다.</p></li><li><p><b>동적 크기</b> — 크기는 전부 rem 단위로 만들어 졌습니다.</p></li><li><p><b>다국어</b> — 다국어를 지원합니다.</p></li></ul></div><p><br/></p><h2>커스텀</h2><div data-nabi-p><ul><li><p><b>사용자 날개</b> — 필요한 기능이 있다면 직접 만들어서 사용 할 수 있습니다.</p></li><li><p><b>사용자 CSS</b> — 색·모서리·간격이 전부 --nabi-* 으로 정의되어 있어 다크, 라이트 모드등 사용자 정의가 가능합니다.</p></li><li><p><b>오픈소스</b> — GITHUB를 통해 오픈소스를 지원합니다.</p></li></ul></div><div data-nabi-p><hr/></div><p>문서 보기 → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'wing',
  demo_wings_all: '전부 켜기',
  demo_wings_none: '전부 끄기',
  demo_zoom: '확대/축소',
  demo_zoom_out: '축소',
  demo_zoom_in: '확대',
  demo_zoom_reset: '원복',
  demo_sticky: '툴바 고정',
  demo_sticky_keyboard: '모바일 키보드 보정',
  demo_sticky_height: '높이',
  demo_sticky_unit: '높이 단위',
  demo_typeface_base: '기본 서체',
  demo_typeface_sans: '산세리프',
  demo_typeface_serif: '세리프',
  demo_typeface_mono: '고정폭',
  demo_typeface_cursive: '필기체',
  demo_html_small: '<p>여기에 써 보고, 위에서 wing 을 껐다 켜 보세요.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>문장에서 <b>중요한 낱말</b>을 짚습니다. 글자를 고르고 툴바의 <b>B</b> 를 눌러 보세요.</p>',
  demo_html_italic:
    '<p>낯선 낱말이나 인용은 <i>기울여</i> 적습니다. 이 문장을 골라 눌러 보세요.</p>',
  demo_html_underline:
    '<p>여기에 <u>밑줄</u>이 걸려 있습니다. 그 글자를 골라 다시 누르면 벗겨집니다.</p>',
  demo_html_strikethrough:
    '<p><s>19,000원</s> 9,900원 — 지운 값을 남겨 둘 때 씁니다.</p>',
  demo_html_superscript:
    '<p>넓이는 3.5m<sup>2</sup> 이고, 각주는 이렇게 붙입니다.<sup>1</sup></p>',
  demo_html_subscript: '<p>물은 H<sub>2</sub>O, 이산화탄소는 CO<sub>2</sub> 입니다.</p>',
  demo_html_link:
    '<p>주소를 넣으면 <a href="https://example.com">이런 링크</a>가 됩니다. 기존 링크는 상황 줄이 뜨지 않습니다 — 주소를 고치려면 지우고 다시 만듭니다.</p>',
  // Color counts are fixed in code — six highlights (HIGHLIGHT_COLORS), five text colors (TEXT_COLORS)
  // 색 개수는 코드가 정한다 — 형광펜 여섯(HIGHLIGHT_COLORS) · 글자색 다섯(TEXT_COLORS)
  demo_html_highlight:
    '<p>글자를 고르고 버튼을 누르면 캐럿 곁에 견본판이 뜹니다. 색은 여섯입니다 — <mark data-color="yellow">노랑</mark>·<mark data-color="green">연두</mark>·<mark data-color="cyan">하늘</mark>·<mark data-color="pink">분홍</mark>·<mark data-color="purple">보라</mark>·<mark data-color="orange">주황</mark>.</p><p>자국 안에 캐럿을 두면 상황 줄에 같은 견본판이 떠서 색만 바꿀 수 있습니다.</p>',
  demo_html_text_color:
    '<p>글자에 다섯 색을 입힙니다 — <span data-color="green">초록</span>·<span data-color="coral">코랄</span>·<span data-color="violet">보라</span>·<span data-color="amber">호박</span>·<span data-color="blue">파랑</span>.</p><p><mark data-color="yellow">형광펜과 겹쳐도</mark> 서로 다른 마크라 <span data-color="blue">함께 걸립니다.</span></p>',
  demo_html_heading:
    '<h1>제목 1</h1><h2>제목 2</h2><h3>제목 3</h3><p>본문입니다. 빈 줄에서 # 과 공백을 쳐도 제목이 됩니다.</p>',
  demo_html_bullet_list:
    '<ul><li>글머리 목록입니다</li><li>Tab 으로 들여쓰고 Shift+Tab 으로 내어씁니다<ul><li>중첩된 항목</li></ul></li></ul><p>빈 줄에서 - 과 공백을 쳐도 목록이 됩니다.</p>',
  demo_html_ordered_list:
    '<ol><li>순서가 있는 목록입니다</li><li>항목을 끼우거나 지워도 번호는 다시 매겨집니다</li></ol><p>빈 줄에서 1. 과 공백을 쳐도 번호 목록이 됩니다.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">글자 앞 네모를 눌러 체크합니다</li><li data-nabi-checked="false">체크 상태는 문서에 저장됩니다</li></ul><p>빈 줄에서 [ ] 나 [x] 를 쳐도 체크리스트가 됩니다.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>키</th><th>하는 일</th></tr><tr><td>Tab</td><td>다음 칸으로 갑니다</td></tr><tr><td>화살표</td><td>격자대로 움직입니다</td></tr></tbody></table><p>칸 안에 캐럿을 두면 상황 줄에 행·열 커맨드가 뜹니다.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="나비 로고" data-nabi-width="50"></div><p>이미지를 클릭하면 폭·정렬 상자가 뜹니다.</p>',
  demo_html_youtube:
    '<p>툴바의 유튜브 버튼을 누르거나 영상 주소를 그대로 붙여넣어 보세요. 이 자리에 영상이 들어갑니다.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>코드 안에 캐럿을 두면 상황 줄에 언어 입력창이 뜹니다. 여러 줄을 고르고 Tab 을 누르면 고른 줄이 함께 들여써지고, Shift+Tab 이 되돌립니다.</p>',
  demo_html_details:
    '<details open=""><summary>여기를 눌러 접습니다</summary><p>접힌 상태는 문서에 저장됩니다. 글쓴이가 접어 둔 대로 읽는 사람이 봅니다.</p></details>',
  demo_html_quote:
    '<blockquote><p>남의 말을 담는 상자입니다. 안에서는 글자 서식만 걸리고, 이미지·코드·표 버튼은 뜨지 않습니다.</p></blockquote><p>빈 줄에서 &gt; 와 공백을 치면 그 줄이 인용이 됩니다.</p>',
  demo_html_divider:
    '<p>구분선 위 문단입니다.</p><hr><p>구분선 아래 문단입니다. 빈 줄에 --- 만 치고 Enter 를 눌러도 선이 됩니다.</p>',
  demo_html_align:
    '<p data-nabi-align="l">왼쪽 정렬</p><p data-nabi-align="c">가운데 정렬</p><p data-nabi-align="r">오른쪽 정렬</p>',
  // No bold on the typeface and font-size pages — their neighbours are in the etc branch
  // 서체·글자 크기 페이지에는 굵게가 안 켜진다 — 이 둘의 이웃은 기타 갈래이기 때문이다
  demo_html_font_size:
    '<p data-nabi-size="xs">아주 작게 — 각주나 덧말에 씁니다.</p><p data-nabi-size="sm">작게 — 본문보다 한 걸음 물러난 말.</p><p>기본 크기의 문단입니다. 버튼을 누르면 다섯 단계가 그 나라 말로, 자기 크기로 뜹니다.</p><p data-nabi-size="lg">크게 — 힘을 주는 문장.</p><p data-nabi-size="xl">아주 크게 — 표제 아래의 리드문.</p>',
  demo_html_typeface:
    '<p>이 문단에는 서체가 걸려 있지 않습니다. 페이지 기본인 산세리프로 보입니다.</p><p data-nabi-typeface="serif">이 문단은 세리프입니다. 고르는 것은 갈래이고, 실제 글꼴은 이 사이트가 토큰에 얹은 Noto Serif 입니다.</p><p data-nabi-typeface="mono">이 문단은 고정폭입니다. 글자 너비가 같아 자리를 세기 좋습니다 — 0O 1lI</p><p data-nabi-typeface="cursive">이 문단은 필기체입니다. 손으로 쓴 얼굴이라 인용이나 덧말에 씁니다 — Handwriting · 手書き · 手写.</p><p>서체는 문단마다 다르게 걸립니다. 제목과 표는 산세리프, 코드는 고정폭으로 고정입니다. 아무것도 안 건 문단은 <b>wing 을 선언할 때 정한 기본값</b>으로 보입니다 — 안 정하면 산세리프입니다.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">첫 글자가 세 줄을 감싸고 글은 그 옆으로 흐릅니다. 문단이 짧아도 감쌀 줄만큼 자리를 잡아 두므로 글자가 다음 블록으로 흘러내리지 않습니다.</p><p>이 문단에는 걸려 있지 않습니다.</p>',
  demo_html_clear_format:
    '<p><b>굵게</b>·<i>기울임</i>·<u>밑줄</u>·<s>취소선</s>이 걸린 글자를 골라 지우개를 눌러 보세요.</p><p>글자 서식만 지워지고 블록은 그대로 남습니다.</p>',
  demo_html_upload:
    '<p>파일을 이 상자에 끌어다 놓거나 붙여넣어 보세요. 이 사이트에는 올릴 서버가 없어 올리는 시늉만 하고, 결과는 이 페이지 안에서만 남습니다.</p><p>다 올라간 첨부는 <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">첨부파일</a> 처럼 남습니다.</p>',


  cdn_demo_lead: '아래 코드를 {file} 로 저장하고 브라우저로 열면 바로 확인할 수 있습니다.',
  cdn_demo_download: 'demo.html 내려받기',
  cdn_code_minheight: '편집기가 브라우저 화면 높이를 그대로 채웁니다 — 이 예제엔 편집기 말고는 아무것도 없어서입니다. 값은 자유롭게 바꾸세요.',
  cdn_code_wings: '업로드 제외 모든 윙을 포함합니다.',
  cdn_code_faces:
    '서체는 산세리프와 세리프 둘만 남깁니다.\n시스템 마다 지원하는 서체가 다르기 때문에 모노, 필기체는 별도로 import 해야 모든 플랫폼에서 인식됩니다.\n자세한건 "서체" 문서를 확인 바랍니다.',
  cdn_code_change: '값이 변경될때 콜백 예제',
  code_copy: '코드 복사',
  demo_install: '설치',
  demo_code: '코드',
  demo_chars: '{n}자',
  demo_tree: '나비트리',
  demo_loading: '에디터를 불러오는 중…',

  page_not_found: '페이지를 찾을 수 없습니다',
  nav_prev: '이전 문서',
  nav_next: '다음 문서',
}
