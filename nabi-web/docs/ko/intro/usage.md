---
title: 기본 사용법
description: npm 으로 물어 nabi 객체 하나를 세우고, 넣는 넷과 꺼내는 셋으로 문서를 주고받습니다.
---

# 기본 사용법

npm 으로 물어 쓰는 길입니다. `<script>` 한 줄로 쓰는 길은
[{{ t('menu_intro_cdn') }}](./cdn) 에 있습니다.

```sh
npm i nabi-note
```

---

## 조각을 이어 붙입니다

호스트가 자리를 짓고 mount 를 하나씩 붙입니다. 아래가 최소 구성이고, wing 문서마다 나오는
예제는 전부 이 뼈대에 wing 한둘을 더 끼운 모양입니다.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'ko' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'ko' })
mountSticky({ root: app, surface })

// 값이 바뀔 때마다 — 여기에 당신의 코드를 건다
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

자리는 호스트가 짓고 **그 자리가 어떻게 생겼는지는 코어가 압니다** — mount 가 자기 그릇에
`.nabi-toolbar-row`·`.nabi-context`·`.nabi-editing` 을 스스로 붙이고, 도구 상자도 스스로
세웁니다. 호스트가 배치를 짤 일이 없다는 뜻이고, 그래서 위 마크업에 클래스가 셋뿐입니다.

- **`class="nabi"`** — 색 토큰과 시트가 이 안에서만 삽니다. 전체화면이 통째로 고정하는
  상자이기도 해서, 툴바와 편집 영역이 **함께** 이 안에 있어야 합니다.
- **`class="nabi-toolbar"`** — 툴바 줄과 상황 줄을 한 덩어리로 묶어 **위에 붙게(sticky)**
  합니다. 둘이 따로 붙으면 상황 줄이 뜰 때 글이 밀려 화면이 흔들립니다.
- **`class="nabi-content" contenteditable`** — 편집 영역 자신입니다.

사이트에 고정 머리줄이 있으면 `--nabi-sticky-top` 으로 그만큼 내리고, `mountSticky()` 를
붙이면 모바일 키보드가 화면을 밀어낸 만큼을 코어가 재서 되돌립니다.

**시트는 호스트가 겁니다.** 번들러를 쓰면 `import 'nabi-note/nabi.css'` 하나면 되고, 등록한
날개의 것만 담고 싶으면 `injectSheets(document, collectSheets(registry))` 를 부릅니다.
**문서를 서버에서 미리 그려 내려보내는 페이지는 파일 쪽으로 거세요** — 주입은 편집기
자바스크립트가 도착한 뒤에야 붙어서, 그 사이에 문서가 맨몸으로 한 번 그려집니다.

**그 말이 글의 방향도 정합니다.** 아랍어(`ar`)·우르두(`ur`)를 주면 그 mount 의 뿌리에 `dir="rtl"`
이 붙어 오른쪽에서 왼쪽으로 섭니다 — 페이지가 `<html dir>` 로 아무 말도 안 해도 그렇습니다.
`locale` 을 **안 주면 건드리지 않습니다**: 방향을 제 손으로 쥐는 호스트의 것을 덮지 않습니다.
어느 말이 어느 방향인지는 `localeDirection(code)` 이 답합니다.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // 편집 영역이 RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // 툴바도 거울처럼
```

표시 언어는 mount 마다 `locale` 로 정합니다 — 문서의 글은 그대로고 툴바·상황 줄의 이름만
바뀝니다. **호스트는 로케일을 한 번만 선언하면 됩니다** — 위 예제처럼 한 벌(shared)에 담아 mount
들에 넘기면, 툴바가 서면서 제 `locale` 을 코어에도 걸어 주어(`nabi.$bindLocale`) 코어가 내는
말(toast 등)도 같은 언어로 나옵니다. 툴바 없이 쓰는 자리는 `createNabiWith` 옵션의 `locale`
로 줍니다. 고르개를 그리려면 패키지가 내보내는 `LOCALES`(코드 목록)를 쓰세요.

### 빈 편집기의 안내글

아무것도 없는 편집기는 첫 줄에 안내글을 흐리게 세웁니다. 글자가 한 자 들어오는 순간 사라지고,
지워서 다시 비면 다시 섭니다. **아무것도 안 해도 뜹니다** — 말은 코어 사전의 것이라 그 mount 의
언어를 따라갑니다. 자리는 **글의 방향**이 정합니다(LTR 이면 왼쪽, RTL 이면 오른쪽) — 그 줄이
가운데·오른쪽 정렬이어도 안내글은 따라가지 않습니다.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: '여기에 메모를 남기세요' })
mountSurface({ nabi, registry, root: surface, placeholder: '첫 줄\n둘째 줄' })   // 여러 줄
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // 안내글 없이
```

줄바꿈(`\n`)은 그대로 줄이 됩니다. 다만 안내글은 **흐름 밖**에 서므로(캐럿을 밀지 않으려고)
편집 영역이 한 줄 높이면 여러 줄짜리 안내글은 아래로 흘러넘칩니다 — 여러 줄을 쓸 거면 편집
영역에 그만큼의 최소 높이를 주세요.

말은 편집 영역 뿌리의 `--nabi-placeholder` 로 들어가고, 그리는 것은 시트입니다. 색이나 결을
바꾸려면 이 규칙을 고쳐 쓰세요.

```css
.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before {
  color: #999;
}
```

| 조립 | 필수 | 하는 일 |
|---|---|---|
| `createNabiWith(wings, options?)` | 예 | `{ nabi, registry }` 를 돌려줍니다. DOM 이 필요 없습니다. wing 배열도, 고르기 빌더(`wings()`, [{{ t('menu_intro_cdn') }}](./cdn#날개-고르기) 참고)도 그대로 받습니다 |
| `mountSurface({ nabi, registry, root })` | 예 | 캐럿·IME·입력을 나비트리에 되맞춥니다. 등록된 날개의 `attach` 도 함께 붙입니다 |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | 아니오 | 메인 툴바. 없어도 `applyCommand()` 로 직접 편집은 됩니다 |
| `mountContextToolbar({ nabi, registry, root, surface? })` | 아니오 | 캐럿 자리별 상황 줄(표 행·열, 코드 언어, 링크 주소·이름 등) |
| `mountHints({ toolbar, context?, root, surface? })` | 아니오 | Shift 두 번 연타로 뜨는 단축키 배지 |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | 아니오 | 미리보기·전체화면 두 단추. `root` 는 전체화면이 고정할 `.nabi` 상자, `onBody` 는 미리보기 본문에 보는 쪽 런타임을 거는 훅입니다(아래) |
| `mountSticky({ root, surface })` | 아니오 | 모바일 키보드가 화면을 밀어낸 만큼 붙는 툴바를 되돌립니다 |
| `mountPickedMark({ nabi, surface })` | 아니오 | 그림·영상을 골랐을 때의 표시(브라우저가 안 그려 줍니다) |
| `mountFile({ nabi, store, name? })` | save·open 쓸 때 | `.nabi` 파일로 저장·열기 |
| `mountLocalHistory({ nabi, storage })` | localHistory 쓸 때 | 정해진 간격마다 브라우저에 기록. `storage` 가 `null`(`file://` 처럼 막힌 자리)이어도 세웁니다 — 그래야 단추가 왜 안 되는지 toast 로 말합니다 |
| `mountUpload({ … })` + `mountUploadView({ … })` | upload 쓸 때 | 드롭·붙여넣기·파일 선택의 업로드 진행과 그 표시 |

**그림·체크·표 칸 드래그·코드 색칠에는 따로 mount 할 것이 없습니다** — 전부 날개가 `attach`
로 들고 있고 `mountSurface` 가 함께 붙입니다. 코드 색칠만 칠할 사람을 꽂아 주면 됩니다
(`makeCodeAttach`, [{{ t('menu_wing_code') }}](../wing/block/code) 참고).

### 미리보기에 보는 쪽 런타임을 겁니다

미리보기는 `getHtml()` 을 그대로 꽂은 정적 HTML 이라, 표 정렬·코드 색칠처럼 **읽는 쪽에서
자바스크립트가 하는 일**은 저절로 붙지 않습니다. `nabi-note/viewer` 의 `attachViewer` 가 그
전부를 한 문으로 걸고, 미리보기에서는 `onBody` 훅이 걸 자리입니다 — 위 최소 구성의
`mountViewTools` 줄을 이렇게 바꿉니다.

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'ko',
  onBody: (body) => attachViewer(body, { locale: 'ko' }),
})
```

`onBody` 는 미리보기 본문이 서면 불리고, 답으로 준 떼는 함수는 덮개가 걷힐 때 불립니다.
발행된 페이지에도 **같은 한 줄**(`attachViewer`)을 겁니다 — 미리보기는 발행된 쪽과 같아야
하므로, 그 둘에 같은 문을 거는 것이 이 훅의 요점입니다. 자세한 것은
[{{ t('menu_intro_cdn') }} ▸ 보는 쪽](./cdn#보는-쪽) 에 있습니다.

코드 색칠은 내장 토크나이저가 기본으로 답합니다(의존성 0). Shiki 같은 하이라이터를 쓰는
호스트는 `attachViewer(body, { locale, highlight })` 로 같은 훅을 넘깁니다 —
`makeCodeAttach({ highlight })` 에 넘긴 것과 한 벌이면 편집 화면과 읽는 화면의 색이 갈리지
않습니다.

wing 을 갈아 끼우려면 이 조각 전부를 걷고(`unmount()`) 새로 만듭니다 — 뺀 wing 이 쥐고
있던 마크업은 그 자리에서 평문으로 떨어집니다. 이 사이트의 데모가 실제로 그렇게
동작합니다 — wing 칩을 껐다 켜 보면 조립이 통째로 다시 만들어집니다.

색·모양을 비롯한 CSS 변수는 [{{ t('menu_style_custom') }}](../style/custom) 에 있습니다.

---

## 문서를 꺼내는 셋

```ts
nabi.getHtml()        // 저장·발행하는 HTML
nabi.getJson()        // 나비트리 (JSON)
nabi.getEditorHtml()  // 지금 편집기 화면의 HTML (data-key 가 붙어 있다)
```

**저장할 값은 앞의 둘 중 하나입니다.** `getEditorHtml()` 은 화면 전용 표식(`data-key`)이 붙어
있어 내보내는 값이 아닙니다 — 서버 렌더링(SSR)으로 편집기를 미리 그려 둘 때 쓰는 자리입니다.

나가는 JSON 은 이렇게 생겼습니다. **문서는 블록의 배열**이고, 감싸는 뿌리 노드가 없습니다.

```json
[
  {"w":"p","a":{"h":2},"ch":["제목"]},
  {"w":"p","ch":["글 ",{"w":"b","ch":["굵게"]}," 와 ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["링크"]}]},
  {"w":"p","a":{"a":"c"},"ch":["가운데"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["하나"]}]},
    {"w":"li","ch":[{"w":"p","ch":["둘"]}]}]}]}
]
```

읽는 규칙은 넷뿐입니다.

- **`w` 는 그 노드를 그리는 날개의 id 입니다.** 예약어는 `p`(문단)와 `br`(라인) 둘뿐이고,
  나머지는 전부 등록한 날개의 id 입니다 — `b`·`ul`·`li` 처럼. 제목은 별도 날개가 아니라
  **문단의 속성**입니다(`{"w":"p","a":{"h":2}}`).
- **문자열이면 글자, 객체면 날개입니다.** 갈래를 적는 칸이 따로 없습니다.
- **`a` 는 그 날개가 담은 값입니다** — 링크 주소, 형광펜 색, 제목 레벨 같은 것. 없으면 칸도
  없습니다. 정렬 값도 `a` 인데 이 칸 **안**에 들어 있어 헷갈리지 않습니다
  (`{"w":"p","a":{"a":"c"}}` — 가운데 정렬한 문단).
- **표·목록·그림처럼 문단 자리를 차지하는 것은 문단이 한 겹 감쌉니다**(위의 `ul` 을 보세요).
  그 문단이 정렬을 입고, 캐럿이 그 물건의 앞뒤에 설 자리를 만듭니다. HTML 로는
  `<div data-nabi-p>` 로 나갑니다 — `<p>` 는 문법상 표·목록을 못 품기 때문입니다.

안쪽에서 도는 트리에는 노드마다 `_id` 가 하나 더 있습니다 — **캐럿이 노드를 짚는 내부
주소**라 대부분의 편집에서 새로 매겨지고, 나갈 때 걷힙니다(위 예제 기준 470 → 323 바이트).
나간 값은 그대로 `setJson()` 에 도로 넣으면 됩니다.

---

## 문서를 넣는 넷

```ts
createNabiWith(wings, { doc })   // 이미 만들어진 나비트리로 시작
nabi.setJson(json)               // 나비트리로 통째로 갈아 끼우기
nabi.setHtml(html)               // HTML 글자열로 통째로 갈아 끼우기
nabi.applyCommand('setHeading', { value: 2 })  // 편집 커맨드 (날개가 쓰는 그 문)
```

넷 다 **성패를 `boolean` 으로 답합니다.** 던지지 않고, 실패하면 문서를 안 건드립니다.
조금 어긋난 값은 거절하는 대신 **읽으면서 바로잡습니다** — 빈 표칸, 행이 아닌 표의 자식,
넘치는 병합 같은 것이 그렇고, 위험한 주소가 걸러지는 것도 같은 걸음입니다. 거절은 아예 읽을
수 없는 모양의 몫입니다. 그리고 어떤 값이 읽는 도중 예외를 일으켜도 편집기는 멈추지 않습니다
— 거절(`false`)로 바뀌고, `console.error` 로 무엇이 거절됐는지 알립니다.

| 답이 `false` 인 자리 | |
|---|---|
| `setJson` | 나비트리 모양이 아니다 (빈 값은 빼고 — 아래) |
| `setHtml` | `parseHtml` 어댑터를 안 꽂았다(아래) 또는 편집이 잠겨 있다 (빈 값은 빼고) |
| `applyCommand` | 그런 커맨드가 없다, 또는 **아무것도 안 바뀐다** |

**빈 문서의 모양은 하나입니다 — `[{"w":"p","ch":[]}]`.** 전체선택 후 삭제처럼 글을 통째로
지운 자리에는 첫 블록의 제목·정렬이 남지 않습니다. 여러 줄 중 한 줄만 비운 것은 다릅니다 —
그 줄을 다시 쓰려는 것이라 그 문단의 속성은 그대로 남습니다.

**빈 값은 형식 오류가 아니라 빈 문서입니다.** `null`·`undefined`·빈 글자열(공백뿐인 것도)·빈
배열을 주면 거절하지 않고 **빈 화면으로 앉으며 `true`** 를 답합니다 — `setJson`·`setHtml` 둘 다
그렇고, 그래서 "비우기"는 언제나 성공합니다. 빈 값은 읽을 것이 없으므로 `setHtml` 은 그때
어댑터(아래)도 필요 없습니다. 모양이 틀린 값은 그대로 거절입니다 — 빈 것과 틀린 것은 다릅니다.

마지막 줄이 규칙 하나입니다 — **바뀌는 것이 없으면 조용합니다.** 이미 2단계 제목인 문단에
다시 `setHeading` 을 걸면 `false` 를 답하고, 되돌리기 지점도 신호도 안 남깁니다.

`applyCommand` 의 셋째 인자는 **부른 손**입니다 — `applyCommand(name, args?, by?)` 의 `by`
는 `'keyboard' | 'pointer'`(타입 `CommandHand`)이고 안 밝히면 키보드입니다. 갈리는 자리는
하나입니다: 캐럿이 접힌 자리의 마크 커맨드는 키보드면 예약이 걸리고(다음 글자부터 적용),
포인터면 예약 없이 `false` 를 답하며 "적용할 대상이 없다"는 toast 로 말합니다. 직접 UI 를
지어 커맨드를 부른다면 클릭 손잡이에서 `'pointer'` 를 밝히세요.

### `setHtml` 은 어댑터가 필요합니다

HTML 을 읽는 일은 브라우저의 `DOMParser` 가 합니다. 코어는 DOM 을 모르므로 그 어댑터를
선언할 때 꽂아 줍니다.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` 은 어댑터가 필요 없습니다 — 저장해 둔 JSON 을 **서버(Node.js)에서 그대로 넣어도**
됩니다. 조립(`getHtml`)도 DOM 을 안 쓰므로, 서버에서 JSON 을 읽어 HTML 을 만들어 내보내는
길이 그대로 열립니다.

---

## 알림은 toast 로 나옵니다

업로드 오류, 로컬기록의 안내, "적용할 대상이 없다" 같은 한 마디는 전부 **toast 한 길**로
나옵니다. 기본 그릇은 코어가 들고 있어서 아무것도 안 꽂아도 됩니다 — 툴바가 서면 툴바
아래쯤의 고정 자리에 뜹니다(상황 줄이 떴다 사라져도 그 자리는 안 움직입니다).

- 눈금은 셋입니다 — `'info' | 'warn' | 'error'`. 성공·실패의 결과가 아니라 **읽는 사람이
  얼마나 긴장해야 하는가**의 눈금입니다.
- 기본 1초 뒤 걷히고(남은 0.5초부터 옅어집니다), 클릭해도 닫힙니다. 동시에 서는 것은 기본
  3개까지 — 넘치면 남은 시간이 가장 적은 것부터 걷힙니다.
- 메시지는 `\n` 을 품을 수 있고, 라이트·다크 어느 쪽에서도 그려집니다.

결을 바꾸는 옵션 둘과 표시를 통째로 갈아타는 옵션 하나가 `createNabiWith` 에 있습니다.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // 살아 있는 시간 — 기본 1000ms. 부르는 쪽이 건마다 얹을 수도 있습니다
  toastMax: 5,     // 동시에 서는 상한 — 기본 3
  // 제 알림 시스템이 있는 페이지는 표시만 갈아탑니다 — 코어 기본 그릇은 한 번도 안 그려집니다
  // toast: (level, message, ms) => user_callback(level, message),
})
```

날개가 말하는 문도 이 하나입니다 — `nabi.$toast(level, message, ms?)`. 시간이 말과 함께
실리므로, 긴 안내 한 번을 위해 전체 기본을 늘릴 필요가 없습니다.

---

## 편집기가 사람에게 묻는 길

파일을 열 때 "쓰던 글이 있습니다. 그래도 여시겠습니까?" 같은 물음이 필요합니다. 그 상자를
**선언할 때 한 번** 꽂습니다.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | 모양 |
|---|---|
| `message` | `(text: string) => void` — 말 하나, 답을 안 받습니다 |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — 동기든 비동기든 받습니다 |

**코어는 브라우저의 것을 자동으로 쓰지 않습니다.** 제 대화상자를 가진 페이지에 회색 상자가
끼어들면 안 되고, 플러그인(인텔리제이·VS Code)에는 `window.confirm` 이 아예 없기 때문입니다.
위 세 줄은 호스트가 짓습니다.

**끼운 칸만 이깁니다** — `message` 만, `confirm` 만 끼워도 됩니다. 안 끼운 `message` 는 위의
core toast(info) 로 나오고, 안 끼운 `confirm` 의 답은 "아니오" 입니다.

::: warning confirm 을 안 주면 답은 "아니오" 입니다
아무도 답하지 않은 물음은 "예" 가 아닙니다 — 취소·Escape·창 닫기가 뜻하는 것과 같습니다.
이 답이 걸리는 자리가 "쓰던 글을 버리고 열까?" 라서, 물을 사람이 없다고 버리는 쪽으로 가면
안 됩니다. 서버(Node)에서도 이 값으로 조용히 지나갑니다.
:::

**편집기 하나의 것입니다** — 전역이 아니라서 한 페이지의 편집기 둘이 서로 다르게 물을 수
있습니다. 날개도 같은 것을 받습니다(`nabi.$ask`) —
[{{ t('menu_wing_custom') }} ▸ UI 와 동작](../wing/custom/ui) 에 그 이야기가 있습니다.

---

## 이 편집기의 이름과 "바뀌었나"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <유닉스시각>-<nonce>, 인스턴스마다 하나
nabi.isChanged() // 마지막 기준선 뒤로 문서가 움직였나
```

`sessionId` 는 한 번 만들어지고 안 바뀝니다. 시각은 이 편집기가 언제 섰는지를 말하고 그 자체로
정렬되며, nonce 는 같은 밀리초에 선 편집기 둘을 가릅니다. 초안·로그·자동저장 키에 붙이는
이름표입니다.

`isChanged()` 의 **기준선을 새로 긋는 것은 셋**입니다 — 문서를 통째로 넣는 일
(`createNabiWith({ doc })`·`setJson()`·`setHtml()`)과, 저장했다고 알리는 일입니다.

```ts
nabi.$markSaved(savedDoc)   // 저장이 성사된 뒤 — 그때 저장한 그 문서를 넘긴다
```

**저장하던 그 순간의 트리를 넘깁니다**(지금 트리가 아닙니다). 저장이 오래 걸리는 동안 친
글자는 여전히 "바뀐 것" 으로 남아야 하기 때문입니다. 저장 날개(`save`)는 파일이 실제로 쓰인
뒤에 이것을 부르므로, `.nabi` 로 저장하면 `isChanged()` 가 `false` 가 됩니다.

**되돌려서 처음 자리로 오면 다시 `false`** 입니다 — 나비트리는 불변이고 편집마다 통째로
갈리므로, 같은 문서인지를 훑거나 해시하지 않고 그 자리에서 압니다.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## 다음 문서

- [{{ t('menu_intro_ssr') }}](./ssr) — 저장본을 서버에서 미리 그리고 `hydrate` 로 이어받기
- [{{ t('menu_intro_cdn') }}](./cdn) — 빌드 도구 없이 `<script>` 하나로
- [{{ t('menu_wing_custom') }}](../wing/custom) — 없는 서식을 직접 만들기

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
