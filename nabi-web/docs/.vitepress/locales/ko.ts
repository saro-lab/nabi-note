export const ko = {
  label: '한국어',
  lang: 'ko',
  link: '/ko/',
  description: 'NABI NOTE — 오픈소스 WYSIWYG 에디터.',

  menu_docs: '문서',
  menu_start: '처음 사용하기',
  menu_getting_started: '시작하기',
  menu_assemble: '에디터 조립',
  menu_cdn: 'CDN 이용하기',
  menu_concepts: '기본 개념',
  menu_document: 'NABI TREE',
  menu_input: '입력과 캐럿',
  menu_storage: '입출력',
  menu_features: '날개',
  menu_feature_catalog: '날개 알아보기',
  menu_style_guide: '스타일과 로케일',
  menu_rendering: '게시와 변경 비교',
  menu_extend: '확장',
  menu_extend_guide: '커스텀 wing',
  menu_reference: '참조',
  menu_api: 'API 지도',
  menu_troubleshooting: '문제 해결',
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

  menu_etc: '도구',
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
  demo_html: `<p data-nabi-align="c">현재 AI로 문서를 생성·번역 중입니다.</p><p data-nabi-align="c">안정화되면 1.0.0 버전으로 변경합니다.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">오픈소스 WYSIWYG 에디터</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>나비 노트</b>는 서식, 정렬, 표, 업로드 같은 기능을 코어와 분리된 독립 모듈, 곧 ‘날개’로 구성한 오픈소스 WYSIWYG 에디터입니다. 필요한 날개만 골라 편집기를 만들고, 필요하면 직접 만든 날개도 연결할 수 있습니다. 순수 JavaScript로 작성되어 React나 Vue 같은 프레임워크와 함께 쓸 수 있으며, 빌드 환경이 없는 페이지에서는 <b>CDN 라이브러리</b>를 이용할 수도 있습니다. 자체 문서 형식인 <b>NABI TREE</b>는 브라우저 DOM 없이도 Node.js 환경에서 HTML로 변환할 수 있습니다. 입력 문서는 등록한 규칙에 맞춰 정리하고, HTML을 만들 때는 텍스트와 속성을 이스케이프하며 링크 주소를 검사합니다. 다만 커스텀 날개와 서버에서 받는 데이터는 애플리케이션의 보안 정책 안에서 함께 검토해야 합니다. CSS 변수와 rem 기반 레이아웃으로 테마와 크기를 조절할 수 있고, 다크 모드와 여러 언어에 맞는 서체 설정도 제공합니다. 표 정렬, 로컬 히스토리, AI와 함께하는 문서 작업까지 필요한 기능을 한 문서 모델로 이어 갈 수 있습니다.</span></p><p><br/></p><h2>서체</h2><p>산세리프(기본)·세리프·고정폭·필기체 갈래마다 언어별 대체 글꼴을 마련해 두었습니다. 해당 갈래에 맞는 글꼴이 없으면 브라우저 기본 글꼴로 표시됩니다. <b>기본 서체는 호스트가 정합니다.</b></p><p><br/></p><p>아래는 <b>여러 언어로</b> 표현한 서체입니다.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>글자 크기</h2><p><span data-nabi-size="xs">아주 작게</span></p><p><span data-nabi-size="sm">작게</span></p><p><span data-nabi-size="lg">크게</span></p><p><span data-nabi-size="xl">아주 크게</span></p><p><br/></p><p><br/></p><h2>제목</h2><p>빈 줄에서 #을 입력한 뒤 스페이스를 누르면 제목으로 바뀝니다.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>굵게 · 기울임 · 밑줄 · 취소선</h2><p><b>굵게</b> <i>기울임</i> <u>밑줄</u> <s>취소선</s>을 함께 적용할 수 있습니다.</p><p><b><i><s><u>겹쳐서도 사용할 수 있습니다.</u></s></i></b></p><h3>첨자</h3><p>넓이는 3.5m<sup>2</sup>이고, 각주는 이렇게 답니다.<sup>1</sup></p><p>물은 H<sub>2</sub>O입니다.</p><p><br/></p><p><br/></p><h2>글자색 · 형광펜</h2><p>라이트·다크 모드에서 모두 잘 보이는 색으로 구성되어 있습니다.</p><p>글자색은 <span data-color="green">초록</span> · <span data-color="coral">코랄</span> · <span data-color="violet">보라</span> · <span data-color="amber">호박</span> · <span data-color="blue">파랑</span></p><p>형광펜 <mark data-color="yellow">노랑</mark> · <mark data-color="green">연두</mark> · <mark data-color="cyan">하늘</mark> · <mark data-color="pink">분홍</mark> · <mark data-color="purple">보라</mark> · <mark data-color="orange">주황</mark></p><p><br/></p><p><br/></p><h2>링크</h2><p>주소를 넣으면 <a href="https://nabi.saro.me/">링크</a>가 됩니다.</p><p>링크에는 http://·https:// 주소와 . 또는 /로 시작하는 같은 사이트 경로를 쓸 수 있으며, javascript: 같은 주소는 사용할 수 없습니다.</p><p>예를 들어 <a href="https://nabi.saro.me/">https://nabi.saro.me</a>를 입력한 뒤 스페이스나 Enter를 누르면 자동으로 링크로 전환됩니다.</p><h3>링크를 사용할 때</h3><p>문서에는 링크 주소만 저장합니다. 링크를 여는 방식은 이 문서를 표시하는 페이지에서 정합니다.</p><h3>첨부 링크</h3><p>이미지가 아닌 파일은 아래처럼 첨부 링크로 남습니다.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>첨부 파일</a>처럼 남습니다.</p><p><br/></p><p><br/></p><h2>정렬</h2><p>왼쪽 정렬</p><p>가운데 정렬</p><p>오른쪽 정렬</p><h3>제목도 정렬할 수 있습니다.</h3><p><br/></p><p><br/></p><h2>목록</h2><h3>글머리 목록</h3><p>빈 줄에서 -를 입력한 뒤 <b>스페이스</b>를 누르면 글머리 목록이 됩니다.</p><div data-nabi-p><ul><li><p>글머리 목록입니다.</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab으로 들여쓰기와 내어쓰기를 할 수 있습니다.</p></li></ul></div></li></ul></div><h3>번호 목록</h3><p>빈 줄에서 1.을 입력한 뒤 <b>스페이스</b>를 누르면 번호 목록이 됩니다.</p><div data-nabi-p><ol><li><p>첫째</p></li><li><p>둘째</p></li><li><p>셋째</p></li></ol></div><h3>체크리스트</h3><p>빈 줄에서 [ ] 또는 [x]를 입력한 뒤 <b>스페이스</b>를 누르면 체크리스트가 됩니다.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>체크된 항목입니다.</p></li><li data-nabi-checked="false"><p>아직 체크되지 않은 항목입니다.</p></li></ul></div><p><br/></p><p><br/></p><h2>표</h2><p>툴바에서 표를 만들고 행과 열을 추가·삭제하거나 셀을 병합할 수 있습니다.</p><h3>표 정렬</h3><p><b>미리보기</b>를 누르고 <b>재고</b>와 <b>가격</b> 머리글 칸을 차례로 눌러 보세요.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>모델</p></th><th><p>재고</p></th><th><p>가격</p></th><th><p>무게</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>미정</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p><b>가격</b>은 모두 숫자이기 때문에 숫자 기준으로 정렬됩니다.</p><p><b>재고</b> 열에는 글자가 섞여 있어 글자 기준으로 정렬됩니다.</p><p><br/></p><p><br/></p><h2>구분선</h2><p>---를 입력한 뒤 Enter를 누르면 구분선으로 변합니다.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>이미지</h2><p>30%에서 100%까지 크기를 조절하고 왼쪽·가운데·오른쪽으로 정렬할 수 있습니다.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>유튜브</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>업로드</h2><p>이미지나 파일을 편집기로 끌어다 놓아 보세요.</p><p>이 데모의 업로드는 실제 서버로 전송하지 않습니다. 애플리케이션에서 업로더를 연결하면 서버에 저장할 수 있습니다.</p><p>업로드에 실패한 항목은 문서에 추가되지 않습니다.</p><p><br/></p><p><br/></p><h2>인용</h2><div data-nabi-p><blockquote><p>빈 줄에서 &gt;를 입력한 뒤 <b>스페이스</b>를 누르면 인용문이 됩니다.</p><p>여러 줄을 사용할 수 있습니다.</p></blockquote></div><p><br/></p><p><br/></p><h2>코드</h2><p>빈 줄에서 \`\`\`를 입력한 뒤 <b>스페이스나 Enter</b>를 누르면 코드 상자가 됩니다.</p><p>\`\`\`java처럼 언어를 적은 뒤 스페이스나 Enter를 누르면 해당 언어의 코드 상자가 됩니다.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>접기</h2><div data-nabi-p><details open><summary>접기에는 제목과 내용이 있습니다.</summary><p>접힌 상태와 펼친 상태를 정해 둘 수 있습니다.</p></details></div><p><br/></p><h2><br/></h2><h2>단축키</h2><p><b>Shift를 빠르게 두 번</b> 누르면 툴바에 기능별 단축키가 표시됩니다.</p><p><br/></p><p><br/></p><h2>자동 서식</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>예시</p></th><th><p>액션 키</p></th><th><p>설명</p></th></tr><tr><td><p>#</p></td><td><p>공백</p></td><td><p>제목</p></td></tr><tr><td><p>-</p></td><td><p>공백</p></td><td><p>글머리 목록</p></td></tr><tr><td><p>1.</p></td><td><p>공백</p></td><td><p>번호 목록</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>공백</p></td><td><p>체크리스트</p></td></tr><tr><td><p>&gt;</p></td><td><p>공백</p></td><td><p>인용</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>공백 · 엔터</p></td><td><p>코드 상자</p></td></tr><tr><td><p>---</p></td><td><p>엔터</p></td><td><p>구분선</p></td></tr><tr><td><p>https://…</p></td><td><p>공백 · 엔터</p></td><td><p>링크</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>출력 함수</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>함수</p></th><th><p>결과</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>DOM 없는 환경 지원</h2><p>NABI TREE를 사용하면 HTML로 변환할 때 <b>DOM이 필요하지 않습니다</b>.</p><p>서버(Node.js)에서도 저장한 NABI TREE를 읽어 같은 HTML 생성 규칙으로 문서를 만들 수 있습니다.</p><p><br/></p><h2>모바일 친화적</h2><div data-nabi-p><ul><li><p><b>모바일 UI</b> — 화면 폭에 맞춰 편집 도구를 배치합니다.</p></li><li><p><b>모바일 키보드 보정</b> — 키보드가 나타날 때 편집 화면의 높이를 조절합니다.</p></li><li><p><b>유연한 크기</b> — 주요 레이아웃은 rem 단위를 사용해 확대·축소에 맞춥니다.</p></li><li><p><b>다국어</b> — 언어와 방향에 맞는 로케일과 서체를 설정할 수 있습니다.</p></li></ul></div><p><br/></p><h2>커스텀</h2><div data-nabi-p><ul><li><p><b>사용자 날개</b> — 필요한 기능이 있다면 직접 만들어 사용할 수 있습니다.</p></li><li><p><b>사용자 CSS</b> — 주요 색·모서리·간격을 --nabi-* 토큰으로 조절해 다크·라이트 모드 등에 맞게 사용자 정의할 수 있습니다.</p></li><li><p><b>오픈소스</b> — GitHub에서 오픈소스로 개발합니다.</p></li></ul></div><div data-nabi-p><hr/></div><p>문서 보기 → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
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
  demo_html_small: '<p>여기에 글을 써 보고, 위의 날개를 하나씩 켜거나 꺼 보세요.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>문장에서 <b>중요한 낱말</b>을 굵게 강조할 수 있습니다. 강조할 글자를 선택한 뒤 툴바의 <b>B</b> 버튼을 눌러 보세요.</p>',
  demo_html_italic:
    '<p>책 제목이나 외국어처럼 구분하고 싶은 글자를 <i>기울여</i> 표시할 수 있습니다. 원하는 글자를 선택한 뒤 기울임 버튼을 눌러 보세요.</p>',
  demo_html_underline:
    '<p>글자 아래에 <u>밑줄</u>을 표시할 수 있습니다. 밑줄이 적용된 글자를 선택하고 버튼을 다시 누르면 해제됩니다.</p>',
  demo_html_strikethrough:
    '<p><s>19,000원</s> 9,900원처럼 이전 값을 남겨 두고 새로운 값을 보여 줄 때 사용할 수 있습니다.</p>',
  demo_html_superscript:
    '<p>넓이는 3.5 m<sup>2</sup>이고, 각주 표시는 문장 뒤에 붙일 수 있습니다.<sup>1</sup></p>',
  demo_html_subscript: '<p>물의 화학식은 H<sub>2</sub>O이고, 이산화탄소의 화학식은 CO<sub>2</sub>입니다.</p>',
  demo_html_link:
    '<p>주소를 입력하면 <a href="https://example.com">이런 링크</a>를 만들 수 있습니다. 문서에는 링크 주소만 저장되며, 같은 창이나 새 창 중 어디에서 열지는 문서를 표시하는 페이지가 정합니다.</p>',
  // Color counts are fixed in code — six highlights (HIGHLIGHT_COLORS), five text colors (TEXT_COLORS)
  // 색 개수는 코드가 정한다 — 형광펜 여섯(HIGHLIGHT_COLORS) · 글자색 다섯(TEXT_COLORS)
  demo_html_highlight:
    '<p>글자를 선택하고 형광펜 버튼을 누르면 색상표가 열립니다. <mark data-color="yellow">노랑</mark>·<mark data-color="green">연두</mark>·<mark data-color="cyan">하늘</mark>·<mark data-color="pink">분홍</mark>·<mark data-color="purple">보라</mark>·<mark data-color="orange">주황</mark> 중에서 고를 수 있습니다.</p><p>형광펜이 적용된 글자에 캐럿을 두면 상황 도구에서 다른 색으로 바꿀 수 있습니다.</p>',
  demo_html_text_color:
    '<p>선택한 글자에 <span data-color="green">초록</span>·<span data-color="coral">코랄</span>·<span data-color="violet">보라</span>·<span data-color="amber">호박</span>·<span data-color="blue">파랑</span>을 적용할 수 있습니다.</p><p><mark data-color="yellow">형광펜과</mark> <span data-color="blue">글자색을 함께 적용할 수도 있습니다.</span></p>',
  demo_html_heading:
    '<h1>가장 큰 제목</h1><h2>두 번째 제목</h2><h3>세 번째 제목</h3><p>제목 아래에 이어지는 본문입니다. 빈 줄에 #을 입력하고 스페이스를 눌러도 제목으로 바뀝니다.</p>',
  demo_html_bullet_list:
    '<ul><li>글머리 목록의 첫 번째 항목입니다.</li><li>Tab으로 들여쓰고 Shift+Tab으로 내어쓸 수 있습니다.<ul><li>한 단계 들여쓴 항목입니다.</li></ul></li></ul><p>빈 줄에 -를 입력하고 스페이스를 눌러도 글머리 목록으로 바뀝니다.</p>',
  demo_html_ordered_list:
    '<ol><li>첫 번째 순서입니다.</li><li>항목을 추가하거나 지우면 번호가 자동으로 다시 매겨집니다.</li></ol><p>빈 줄에 1.을 입력하고 스페이스를 눌러도 번호 목록으로 바뀝니다.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">완료한 항목입니다.</li><li data-nabi-checked="false">항목 앞의 상자를 눌러 완료 상태를 바꿀 수 있습니다.</li></ul><p>체크 상태는 문서에 저장됩니다. 빈 줄에 [ ] 또는 [x]를 입력하고 스페이스를 눌러도 체크리스트로 바뀝니다.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>키</th><th>동작</th></tr><tr><td>Tab</td><td>다음 셀로 이동합니다.</td></tr><tr><td>방향키</td><td>표 안에서 셀을 이동합니다.</td></tr></tbody></table><p>셀 안에 캐럿을 두면 상황 도구에서 행과 열을 추가하거나 삭제하고 셀을 병합할 수 있습니다.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="나비 로고" data-nabi-width="50"></div><p>이미지를 선택하면 표시 크기를 조절하고 왼쪽·가운데·오른쪽으로 정렬할 수 있습니다.</p>',
  demo_html_youtube:
    '<p>툴바의 유튜브 버튼을 누르거나 영상 주소를 붙여 넣어 보세요. 이 위치에 영상이 삽입됩니다.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>코드 블록 안에 캐럿을 두면 상황 도구에서 언어를 선택할 수 있습니다. 여러 줄을 선택하고 Tab을 누르면 함께 들여쓰며, Shift+Tab을 누르면 내어씁니다.</p>',
  demo_html_details:
    '<details open=""><summary>제목을 눌러 내용을 접거나 펼쳐 보세요.</summary><p>처음부터 펼쳐 둘지 접어 둘지도 문서에 저장됩니다.</p></details>',
  demo_html_quote:
    '<blockquote><p>다른 글에서 가져온 문장이나 강조할 내용을 인용문으로 묶을 수 있습니다.</p><p>인용문 안에는 여러 문단과 블록을 함께 넣을 수 있습니다.</p></blockquote><p>빈 줄에 &gt;를 입력하고 스페이스를 누르면 해당 줄이 인용문으로 바뀝니다.</p>',
  demo_html_divider:
    '<p>첫 번째 내용을 마무리하는 문단입니다.</p><hr><p>구분선 아래에서 새로운 내용을 시작할 수 있습니다. 빈 줄에 ---를 입력하고 Enter를 눌러도 구분선이 만들어집니다.</p>',
  demo_html_align:
    '<p data-nabi-align="l">왼쪽 정렬은 일반적인 본문에 어울립니다.</p><p data-nabi-align="c">가운데 정렬은 짧은 제목이나 안내문에 사용할 수 있습니다.</p><p data-nabi-align="r">오른쪽 정렬은 날짜나 서명처럼 오른쪽에 둘 내용에 사용할 수 있습니다.</p>',
  // No bold on the typeface and font-size pages — their neighbours are in the etc branch
  // 서체·글자 크기 페이지에는 굵게가 안 켜진다 — 이 둘의 이웃은 기타 갈래이기 때문이다
  demo_html_font_size:
    '<p data-nabi-size="xs">아주 작게 — 각주나 보충 설명에 어울립니다.</p><p data-nabi-size="sm">작게 — 본문보다 한 단계 작은 글자입니다.</p><p>기본 크기의 문단입니다. 크기 선택 메뉴에도 각 글자 크기가 그대로 표시됩니다.</p><p data-nabi-size="lg">크게 — 강조할 문장에 어울립니다.</p><p data-nabi-size="xl">아주 크게 — 제목 아래의 도입 문장에 어울립니다.</p><p>글자 크기는 선택한 범위에 적용됩니다. 선택한 글자 없이 캐럿만 있으면 현재 문단의 글자에 적용됩니다.</p>',
  demo_html_typeface:
    '<p>서체를 따로 지정하지 않은 문단입니다. 페이지의 기본 서체로 표시됩니다.</p><p data-nabi-typeface="serif">이 문단에는 세리프 서체를 적용했습니다. 세리프 같은 서체 종류를 선택하면 실제 글꼴은 사이트의 CSS 설정을 따릅니다.</p><p data-nabi-typeface="mono">이 문단에는 고정폭 서체를 적용했습니다. 글자 너비가 일정해 숫자나 코드의 자리를 맞추기 좋습니다 — 0O 1lI</p><p data-nabi-typeface="cursive">이 문단에는 필기체를 적용했습니다. 짧은 인용문이나 덧붙이는 말에 사용할 수 있습니다 — Handwriting · 手書き · 手写.</p><p>서체는 선택한 범위에 적용됩니다. 선택한 글자 없이 캐럿만 있으면 현재 문단의 글자에 적용됩니다. 코드 블록은 고정폭으로 표시됩니다.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">문단의 첫 글자를 크게 표시하고 나머지 글은 그 옆으로 흐르게 합니다. 편집 화면에서는 첫 글자를 실제 요소로 감싸 캐럿 위치가 어긋나지 않도록 합니다.</p><p>이 문단에는 드롭캡을 적용하지 않았습니다.</p>',
  demo_html_clear_format:
    '<p><b>굵게</b>·<i>기울임</i>·<u>밑줄</u>·<s>취소선</s>이 적용된 글자를 선택한 뒤 서식 지우기 버튼을 눌러 보세요.</p><p>선택한 글자의 인라인 서식은 지워지지만 문단과 블록 구조는 그대로 남습니다.</p>',
  demo_html_upload:
    '<p>파일을 편집 영역으로 끌어다 놓거나 붙여 넣어 보세요. 이 데모는 실제 업로드 서버에 연결되어 있지 않아 파일이 서버에 저장되지는 않습니다.</p><p>업로드가 끝난 파일은 <a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt">첨부 파일</a>처럼 문서에 남길 수 있습니다.</p>',


  cdn_demo_lead: '아래 코드를 {file}로 저장한 뒤 브라우저에서 열면 바로 확인할 수 있습니다.',
  cdn_demo_download: 'demo.html 파일 내려받기',
  cdn_code_minheight: '이 예제에서는 편집기가 브라우저 높이를 채웁니다. 사이트 레이아웃에 맞게 높이를 조정하세요.',
  cdn_code_wings: '이 예제에서 사용할 편집·파일 날개를 선택합니다.',
  cdn_code_faces:
    '이 예제에서는 산세리프와 세리프 글꼴만 불러옵니다.\n고정폭이나 필기체를 사용하려면 해당 글꼴 파일도 페이지에서 함께 불러오세요.\n자세한 방법은 "서체" 문서에서 확인할 수 있습니다.',
  cdn_code_change: '문서가 바뀔 때 저장 작업을 예약하는 예제입니다.',
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
