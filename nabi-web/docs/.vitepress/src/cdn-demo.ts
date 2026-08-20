// CDN 예제 한 벌 — 열네 쪽이 저마다 복사해 들고 있던 파일을 여기 하나로 모았다.
//
// **쪽에 보이는 코드와 내려받는 파일이 같은 문자열이다.** 둘로 두면 한쪽이 조용히 낡는다 —
// 옛 판이 실제로 그랬다(쪽마다 사본 열넷). 주석만 로케일 사전이 들고, 코드는 이 한 벌이다.
import { translate } from './langs.ts'

// 내려받는 이름 — 안내 문장의 단추 글자이자 파일 이름이다. 한 자리에서 온다.
export const CDN_DEMO_FILE = 'demo.html'

// 오른쪽에서 왼쪽으로 읽는 쪽은 예제 파일도 그렇게 서야 한다 — 문서의 `dir` 이 아니라
// 내려받은 파일 제 몸의 문제다(그 파일은 이 사이트 밖에서 혼자 열린다).
const RTL: readonly string[] = ['ar', 'ur']

// 주석은 여러 줄일 수 있다 — 언어마다 문장이 접히는 자리가 달라서다(독일어는 넉 줄, 한국어는 석 줄).
// 줄마다 `//` 를 새로 단다.
function note(lang: string, key: string): string {
  return translate(lang, key)
    .split('\n')
    .map((line) => `  // ${line}`)
    .join('\n')
}

// 시트 안의 주석은 `/* */` 다 — 그 자리에는 한 줄만 온다.
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
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
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
<script>
  var N = NabiNote
  var app = document.querySelector('#app')
  var surface = document.querySelector('#editor')

${note(lang, 'cdn_code_wings')}
${note(lang, 'cdn_code_faces')}
  var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })

  var made = N.createNabiWith(wings, {
    parseHtml: N.parseNodes,
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
  N.mountFile({ nabi: nabi, store: N.browserFileStore(document), name: function () { return 'note' } })

  var toolbar = N.mountToolbar(Object.assign({}, shared, {
    root: document.querySelector('#toolbar'),
    onHost: function (w) {
      if (w !== 'localHistory') return
      N.openHistoryPanel({
        history: history, surface: surface, locale: '${lang}', sessionId: history.sessionId,
        render: function (record) {
          return N.renderHtml(JSON.parse(record.body), { env: nabi.$env, builders: registry.builders })
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
