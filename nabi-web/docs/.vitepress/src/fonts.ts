// 서체 wing 이 고르는 것은 갈래(sans·serif·mono·cursive)뿐이고, 그 갈래에 어떤 글꼴을 물릴지는
// 호스트가 정한다 — 코어는 `--nabi-font*` 토큰만 읽는다(typeface.css). 이 사이트가 고른 답이
// 여기 있다: 갈래마다 구글 웹폰트를 한 줄로 쌓아, 어느 언어를 써 넣어도 그 갈래의 모양이
// 유지되게 한다. 토큰 자체는 theme/style.css 가 세운다.
// The typeface wing picks a GENUS (sans/serif/mono/cursive); which fonts fill it is the host's
// call — the core only reads the `--nabi-font*` tokens. This is this site's answer.
//
// 값이 비싸다 — 한중일 글꼴은 유니코드 조각으로 쪼개져 오기 때문에 @font-face 규칙만
// 1000줄이 넘고, CSS 만으로 gzip 245KB 다(2026-08-13 실측). 그래서 이 시트는 head 에 두지 않고
// **편집기 데모가 실제로 뜰 때** 한 번 붙인다 — 데모가 없는 문서 페이지는 한 바이트도 안 낸다.
// It is expensive: CJK families arrive sliced by unicode-range, so the CSS alone is ~245KB gzipped
// (measured 2026-08-13). Hence it is attached when the editor demo mounts, not in <head>.
const EDITOR_FONTS = [
  // cursive — 갈래 중 유일하게 Noto 가 답을 주지 않는다. 언어마다 손글씨 얼굴이 따로다
  'Caveat:wght@400..700', // 라틴
  'Gaegu', // 한국어 — 주인이 고른 얼굴 (2026-08-14). 나눔손글씨 펜보다 획이 굵어 작게 써도 버틴다
  'Yomogi', // 일본어
  'Zhi+Mang+Xing', // 중국어
  'Kalam:wght@400;700', // 데바나가리
  'Noto+Nastaliq+Urdu:wght@400..700', // 우르두 — 나스탈리크 자체가 흘림이다

  // sans — 라틴·그리스·키릴은 head 의 Noto Sans 가 이미 덮는다(config.mts)
  'Noto+Sans+KR:wght@400..700',
  'Noto+Sans+JP:wght@400..700',
  'Noto+Sans+SC:wght@400..700',
  'Noto+Sans+Arabic:wght@400..700',
  'Noto+Sans+Hebrew:wght@400..700',
  'Noto+Sans+Devanagari:wght@400..700',
  'Noto+Sans+Bengali:wght@400..700',
  'Noto+Sans+Thai:wght@400..700',

  // serif
  'Noto+Serif+KR:wght@400..700',
  'Noto+Serif+JP:wght@400..700',
  'Noto+Serif+SC:wght@400..700',
  'Noto+Naskh+Arabic:wght@400..700', // 아랍 문자의 세리프 격이 나스흐다
  'Noto+Serif+Hebrew:wght@400..700',
  'Noto+Serif+Devanagari:wght@400..700',
  'Noto+Serif+Bengali:wght@400..700',
  'Noto+Serif+Thai:wght@400..700',
]

// `display=swap` — 글꼴을 기다리는 동안 시스템 글꼴로 먼저 그린다. 안 그러면 데모 첫 화면이
// 몇 백 킬로바이트를 기다리며 빈 채로 서 있다
export const EDITOR_FONT_HREF = `https://fonts.googleapis.com/css2?${EDITOR_FONTS.map(
  (family) => `family=${family}`,
).join('&')}&display=swap`

const LINK_ID = 'nabi-editor-fonts'

// 여러 데모가 한 페이지에 있어도 한 번만 붙는다 — id 로 확인한다
// Idempotent: several demos on one page still attach it once
export function loadEditorFonts(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(LINK_ID)) return

  const link = document.createElement('link')
  link.id = LINK_ID
  link.rel = 'stylesheet'
  link.href = EDITOR_FONT_HREF
  document.head.append(link)
}
