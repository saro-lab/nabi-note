// 데모의 시작 문서 — **데모 페이지와 CDN 예문이 함께 쓰는 한 벌이다.**
//
// 두 곳에 따로 적어 두면 반드시 갈라진다(한쪽에만 날개가 늘거나, 한쪽 예문만 낡는다). 그래서
// 여기가 정본이고, CDN 쪽 `cdn/sample.js` 는 이 파일에서 **생성**된다
// (`scripts/build-cdn.mjs`). 손으로 베껴 쓰지 마라.
// --- 시작 문서 ---------------------------------------------------------------------------------
// **등록된 날개를 하나씩, 짧게 한 번씩** 쓴다. 길게 쓰면 예문을 읽느라 정작 무엇이 걸려 있는지가
// 안 보이고, 빠뜨리면 그 날개는 캐럿을 대 보기 전까지 있는 줄도 모른다. 그래서 규칙은 하나다
// 문서에 흔적이 남는 날개는 전부 여기 한 번씩 나오고, 그 한 번은 한 줄을 안 넘는다.
// (흔적이 안 남는 도구 넷 — 업로드·저장·열기·로컬 기록 — 은 툴바에서만 산다.)
//
// 말은 영어다. 데모의 표시 언어는 칩으로 바꿀 수 있지만 **문서 자체**는 한 벌이라, 가장 많은
// 사람이 읽는 말로 둔다. 언어 칩이 바꾸는 것은 툴바·상황 줄이지 이 글이 아니다.
export const SAMPLE: unknown[] = [
  { w: 'p', a: { h: 1 }, ch: ['NABI NOTE'] },

  // 마크 아홉을 한 줄에 — b· i· u· s· sup· sub· hl· tc· a
  {
    w: 'p',
    ch: [
      'Marks: ',
      { w: 'b', ch: ['bold'] },
      ', ',
      { w: 'i', ch: ['italic'] },
      ', ',
      { w: 'u', ch: ['underline'] },
      ', ',
      { w: 's', ch: ['strike'] },
      ', x',
      { w: 'sup', ch: ['2'] },
      ', H',
      { w: 'sub', ch: ['2'] },
      'O, ',
      { w: 'hl', a: { c: 'yellow' }, ch: ['highlight'] },
      ', ',
      { w: 'tc', a: { c: 'coral' }, ch: ['color'] },
      ', ',
      { w: 'a', a: { href: 'https://nabi.saro.me' }, ch: ['link'] },
      '.',
    ],
  },

  // 값 마크 둘 — fs· tf
  {
    w: 'p',
    ch: [
      'Size ',
      { w: 'fs', a: { v: 'xs' }, ch: ['tiny'] },
      ' and ',
      { w: 'fs', a: { v: 'lg' }, ch: ['large'] },
      '; typeface ',
      { w: 'tf', a: { v: 'serif' }, ch: ['serif'] },
      ' and ',
      { w: 'tf', a: { v: 'mono' }, ch: ['mono'] },
      '.',
    ],
  },

  // 문단 속성 — align
  { w: 'p', a: { a: 'c' }, ch: ['Centred paragraph — put the caret here and the toolbar says so.'] },

  // 문단 속성 — dc (드롭캡은 세 줄을 차지하므로 세 줄쯤 되는 글이 있어야 보인다)
  {
    w: 'p',
    a: { dc: 1 },
    ch: [
      'Drop cap. The first letter floats across three lines, so this paragraph carries enough ',
      'text to fill them — a shorter one would leave the big letter hanging past the end of the ',
      'paragraph with nothing beside it, which is not what the feature looks like in use.',
    ],
  },

  // 첨부 링크 — a 의 다른 얼굴(클립 상자). 업로드가 끝나면 이 모양으로 앉는다.
  {
    w: 'p',
    ch: [
      'An upload lands as ',
      { w: 'a', a: { href: 'https://nabi.saro.me/file-link-test.txt', file: 'txt' }, ch: ['Attachment'] },
      '.',
    ],
  },

  // 목록 셋 — ul· ol· tl
  { w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['Bullet item'] }] }] }] },
  { w: 'p', ch: [{ w: 'ol', ch: [{ w: 'oli', ch: [{ w: 'p', ch: ['Numbered item'] }] }] }] },
  {
    w: 'p',
    ch: [
      {
        w: 'tl',
        ch: [
          { w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['Checked task'] }] },
          { w: 'tli', ch: [{ w: 'p', ch: ['Open task'] }] },
        ],
      },
    ],
  },

  // 그릇 셋 — quote· details· code
  { w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['Quote — typing "> " makes one.'] }] }] },
  {
    w: 'p',
    ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['Details summary'] }, { w: 'p', ch: ['Folded away.'] }] }],
  },
  { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['const nabi = createNabiWith(defaultWings);'] }] },

  // 표 — 제목 행 하나 + 줄 둘
  {
    w: 'p',
    ch: [
      {
        w: 'table',
        ch: [
          {
            w: 'tr',
            ch: [
              { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['Name'] }] },
              { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['Count'] }] },
            ],
          },
          {
            w: 'tr',
            ch: [
              { w: 'td', ch: [{ w: 'p', ch: ['Butterfly'] }] },
              { w: 'td', ch: [{ w: 'p', ch: ['12'] }] },
            ],
          },
          {
            w: 'tr',
            ch: [
              { w: 'td', ch: [{ w: 'p', ch: ['Moth'] }] },
              { w: 'td', ch: [{ w: 'p', ch: ['3'] }] },
            ],
          },
        ],
      },
    ],
  },

  // 물건 셋 — hr· img· youtube. 넣기의 기본값 그대로다(폭 60, 래퍼문단 가운데).
  { w: 'p', ch: [{ w: 'hr', ch: [] }] },
  {
    w: 'p',
    a: { a: 'c' },
    // 주소를 절대 주소로 둔다 — 이 문서는 데모 서버와 CDN 예문 **둘 다**에서 뜬다. 상대 경로면
    // 뜨는 자리마다 다른 곳을 가리켜(한쪽에서는 404) 깨진 그림 받침이 대신 선다.
    ch: [{ w: 'img', a: { src: 'https://nabi.saro.me/logo/nabi-mark-demo.svg', alt: 'NABI NOTE', w: '60' }, ch: [] }],
  },
  { w: 'p', a: { a: 'c' }, ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '60' }, ch: [] }] },
];
