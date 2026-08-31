// 서체 wing은 갈래(sans/serif/mono/cursive)만 고르고 실제 글꼴은 호스트 몫이다 — 언어마다 한 벌씩 쌓았다.
// The typeface wing only picks a genus; filling it is the host's call — one font stack per language here.
// CJK 글꼴은 유니코드 조각으로 쪼개져 CSS만 gzip 245KB라, head가 아니라 데모가 뜰 때 붙인다.
// CJK fonts arrive unicode-range-sliced at ~245KB gzipped, so this loads on demo mount, not in <head>.
const EDITOR_FONTS = [
  // cursive — 갈래 중 유일하게 Noto가 답을 안 준다, 언어마다 손글씨 얼굴이 다르다.
  // Cursive is the one genus Noto doesn't cover, so each language gets its own handwriting face.
  'Caveat:wght@400..700', // 라틴
  'Nanum+Pen+Script', // 한국어
  'Yomogi', // 일본어
  'Zhi+Mang+Xing', // 중국어
  'Kalam:wght@400;700', // 데바나가리
  'Noto+Nastaliq+Urdu:wght@400..700', // 우르두 — 나스탈리크 자체가 흘림이다

  // sans — 라틴/그리스/키릴은 head의 Noto Sans가 이미 덮는다(config.mts)
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

// `display=swap` — 글꼴을 기다리는 동안 시스템 글꼴로 먼저 그려, 데모 첫 화면이 안 비게 한다.
// `display=swap` paints system fonts while waiting, so the demo's first paint isn't left blank.
export const EDITOR_FONT_HREF = `https://fonts.googleapis.com/css2?${EDITOR_FONTS.map(
  (family) => `family=${family}`,
).join('&')}&display=swap`

const LINK_ID = 'nabi-editor-fonts'

// 여러 데모가 한 페이지에 있어도 한 번만 붙는다 — id로 확인한다.
// Idempotent: several demos on one page still attach it once.
export function loadEditorFonts(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(LINK_ID)) return

  const link = document.createElement('link')
  link.id = LINK_ID
  link.rel = 'stylesheet'
  link.href = EDITOR_FONT_HREF
  document.head.append(link)
}
