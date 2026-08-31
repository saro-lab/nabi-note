// CDN 예제를 한 벌로 모았다 — 쪽에 보이는 코드와 내려받는 파일이 같은 문자열이라 둘이 안 어긋난다.
// One CDN example, shared: the code shown on the page and the downloaded file are the same string.
import { translate } from './langs.ts'
import { CDN_BUNDLE, CDN_SHEET } from './version.ts'

// 내려받는 파일 이름 — 안내 문장의 단추 글자와 한 자리에서 온다.
// The downloaded filename comes from the same place as the button label text.
export const CDN_DEMO_FILE = 'demo.html'

// 오른쪽에서 왼쪽 언어는 예제 파일도 그렇게 서야 한다 — 문서의 dir이 아니라 파일 자체의 문제다.
// RTL languages need the downloaded file itself marked rtl — it opens standalone, outside this site's dir.
const RTL: readonly string[] = ['ar', 'ur', 'fa']

// 주석은 언어마다 줄 수가 다르다(독일어 넉 줄, 한국어 석 줄) — 줄마다 `//`를 새로 단다.
// Comments span a different number of lines per language; each line gets its own `//`.
function note(lang: string, key: string): string {
  return translate(lang, key)
    .split('\n')
    .map((line) => `  // ${line}`)
    .join('\n')
}

// 시트 안 주석은 `/* */`다 — 그 자리엔 한 줄만 온다.
// Comments inside the stylesheet use `/* */`, and only one line fits there.
function cssNote(lang: string, key: string): string {
  return `    /* ${translate(lang, key).split('\n').join(' ')} */`
}

export function cdnDemoHtml(lang: string): string {
  const dir = RTL.includes(lang) ? ' dir="rtl"' : ''
  return `<!doctype html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NABI NOTE</title>
  <link rel="stylesheet" href="${CDN_SHEET}">
  <style>
    html, body { height: 100%; margin: 0; }
${cssNote(lang, 'cdn_code_minheight')}
    #app { height: 100vh; }
    #editor { flex: 1; min-height: 0; overflow-y: auto; }
  </style>
</head>
<body>

<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div class="nabi-toolbar-row">
      <span id="tools"></span>
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content"></div>
</div>

<script src="${CDN_BUNDLE}"></script>
<script>
  var N = NabiNote
  var app = document.querySelector('#app')
  var surface = document.querySelector('#editor')

${note(lang, 'cdn_code_wings')}
${note(lang, 'cdn_code_faces')}
  var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })

  var made = N.createNabiWith(wings, {
    locale: '${lang}',
    ask: {
      message: function (text) { window.alert(text) },
      confirm: function (text) { return window.confirm(text) }
    }
  })
  var nabi = made.nabi
  var registry = made.registry

  N.mountSurface({ nabi: nabi, registry: registry, root: surface, locale: '${lang}' })
  N.mountPickedMark({ nabi: nabi, surface: surface })

  var settle = N.watchSettle(document, { surface: surface })
  var shared = { nabi: nabi, registry: registry, surface: surface, settle: settle, locale: '${lang}' }

  var history = N.mountLocalHistory({ nabi: nabi, storage: N.browserHistoryStorage(window) })
  var file = N.mountFile({
    nabi: nabi, registry: registry, store: N.browserFileStore(document),
    name: function () { return 'note' }, locale: '${lang}'
  })

  var toolbar = N.mountToolbar(Object.assign({}, shared, {
    root: document.querySelector('#toolbar'),
    file: file,
    onHost: function (w) {
      if (w !== 'localHistory') return
      N.openHistoryPanel({
        history: history, surface: surface, locale: '${lang}', sessionId: history.sessionId,
        render: function (record) {
          return N.renderStoredHtml(JSON.parse(record.body), registry) || ''
        }
      })
    }
  }))
  var context = N.mountContextToolbar(Object.assign({}, shared, { root: document.querySelector('#context') }))

  N.mountHints({ toolbar: toolbar, context: context, root: document.querySelector('#chrome'), surface: surface })
  N.mountViewTools({ nabi: nabi, surface: surface, root: app, container: document.querySelector('#tools'), locale: '${lang}' })

  nabi.setHtml('')

${note(lang, 'cdn_code_change')}
  // nabi.onChange(function () { user_callback(nabi.getJson()) })
</script>

</body>
</html>`
}
