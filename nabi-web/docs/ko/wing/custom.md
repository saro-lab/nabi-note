---
title: 커스텀 날개 만들기
description: 없는 서식은 날개로 만듭니다 — 계약 하나를 채우면 코어가 나머지를 합니다.
---

# 커스텀 날개 만들기

날개(wing)는 **객체 하나**입니다. 클래스를 상속하지도, 별도의 등록 절차를 밟지도 않습니다 —
`createNabiWith` 에 넘기는 배열에 넣는 것이 곧 등록입니다.

굵게·표·업로드도 여기 적힌 칸만 채워서 만들어져 있습니다. 직접 만든 날개는 기본 날개와
**같은 조건**에서 동작합니다 — 지름길이 따로 없습니다.

---

## 가장 짧은 날개

`<kbd>` 를 아는 인라인 마크 하나입니다.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // 이 날개의 이름 — 저장값의 `w` 가 이것입니다
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // 나가는 그림
  }),
  // 들어오는 HTML 에서 `<kbd>` 의 주인이라고 손듭니다
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

이제 `<kbd>` 가 문서에 남습니다. 붙여넣기·`setHtml()`·저장·다시 불러오기를 지나도 그대로
있습니다.

```
등록했을 때   <p>눌러: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   그대로
등록 안 했을 때 <p>눌러: <kbd>Ctrl</kbd></p>              →   <p>눌러: Ctrl</p>
```

**두 칸이 다른 방향을 봅니다.** `toHtml` 은 나가는 길이고 `claim` 은 들어오는 길입니다.
`claim` 을 안 적으면 그리기는 되지만 **다시 읽어 들이지 못합니다** — 저장했다 불러오는 순간
껍데기가 벗겨집니다.

`simpleMark` 는 속성 없는 마크를 위한 지름길입니다. 값을 담는 마크는 `valueMark`, 물건은
`boxObject`, 목록 갈래는 `listFamily` 가 있고, 그 밖에는 `Wing` 객체를 손으로 씁니다.

---

## 날개는 상수입니다

**대부분의 날개는 이미 완성된 상수입니다** — `boldWing`·`headingWing` 처럼 배열에 넣기만
합니다. 옵션이 필요한 둘만 공장 함수가 따로 있습니다.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

"붙는 일"만 갈아 끼우고 싶으면 상수를 펼쳐 씁니다 — 날개를 새로 짓는 것이 아니라 한 칸만
바꾸는 것이라 이쪽이 단순합니다.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## 등록과 순서

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**배열 순서가 곧 스캔 순서입니다.** 어떤 마크업의 주인을 가릴 때(`claim`) 코어는 이 순서대로
물어보고, 처음 답한 날개가 가져갑니다. 아무도 가져가지 않으면 껍데기가 벗겨집니다.

툴바에서는 **무리(`button.group`)가 먼저**입니다. 무리의 순서는 못박혀 있고, 같은 무리 안에서만
이 배열 순서대로 섭니다.

### 등록하는 그 자리에서 죽습니다

`createNabiWith` 는 계약을 어긴 날개를 **바로 던집니다.** 늦게 터지지 않습니다.

| 걸리는 것 | 예 |
|---|---|
| 예약어를 이름으로 씀 | `w: 'p'` · `w: 'br'` |
| 같은 이름을 두 번 등록 | `boldWing` 을 두 번 |
| 노드를 세우는데 `toHtml` 이 없음 | `place: 'mark'` 인데 그리는 법이 없음 |
| 커맨드 이름이 규칙을 어김 | 동사+목적어 카멜이어야 합니다 (`insertTable`) |
| 필요한 짝이 없음 | 업로드는 `img` 나 `a` 가 함께 있어야 합니다 (`requiresAnyOf`) |

---

## 커맨드 — 순수 함수입니다

문서를 바꾸는 모든 길이 커맨드 하나를 지납니다. 커맨드는 **DOM 도 화면도 모릅니다.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // 밖에서 온 값이라 검사합니다 — 안 맞으면 아무 일도 안 합니다
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { ko: '도장', en: 'Stamp' },
    action: { kind: 'command', command: 'insertStamp', args: { text: '확인' } },
  },
}
```

| 인자 | 무엇입니까 |
|---|---|
| `doc` | 지금 문서(블록의 배열)입니다. **바꾸지 말고 새것을 답합니다** |
| `sel` | 지금 선택입니다 |
| `args` | 단추나 상황 줄이 넘긴 값입니다. **밖에서 온 값이라 검사해야 합니다** |
| `env` | 갈래 지식입니다 — 무엇이 무엇을 품는가, 무엇이 물건인가 |

답은 `{ doc, selection }` 또는 **`null`** 입니다. **바뀌는 것이 없으면 `null` 을 답하세요** —
그러면 `applyCommand` 가 `false` 를 답하고 되돌리기 지점이 안 쌓입니다. 답한 문서는 `cocoon`
이 한 번 더 다듬으므로, 어떤 커맨드도 규칙을 깬 문서를 남길 수 없습니다.

부르는 쪽은 언제나 이름입니다.

```ts
nabi.applyCommand('insertStamp', { text: '확인' })   // boolean
```

---

## 채울 수 있는 칸 전부

`Wing` 은 서른한 칸이고 **필수는 둘**(`w`·`place`)입니다.

### 무엇인가

| 칸 | 뜻 |
|---|---|
| `w` | 이 날개의 이름입니다. 저장값의 `w` 가 됩니다. 예약어(`p`·`br`)는 못 씁니다 |
| `place` | `'mark'` 글자 위 · `'void'` 속 없는 물건 · `'container'` 속에 글이 있는 물건 · `'attr'` 문단 속성 · `'tool'` 문서에 흔적 없는 도구 |
| `basic` | **배선 없이 그대로 도는가.** 안 적으면 `false` 입니다 — 모르는 것은 안 듭니다. `wings().allBasic()` 이 이 표시를 든 것만 모으고, **커스텀도 같은 잣대**입니다. 다만 `allBasic()` 은 공식 차례표를 훑는 문이라 `.use(객체)` 로 직접 넣는 날개는 이 값과 상관없이 그대로 실립니다 |
| `holds` | 속을 어떻게 품는가 — `'blocks'` 또는 `'inline'` |
| `singleParagraph` | 속이 문단 **하나**로 고정됩니다 (표의 칸) |
| `boolAttrs` | 값이 `1` 뿐인 불리언 속성 이름들입니다 |
| `allows` | 이 안에 들어올 수 있는 날개 이름들입니다. 안 적으면 전부 |
| `noAlign` | **물건 전용**입니다. 달면 이 물건을 입은 **래퍼 문단이 정렬을 안 받습니다** — 툴바에서 정렬 단추가 숨고, 커맨드가 무변화로 거절하고, 옛 저장본에 이미 박힌 값은 고치를 지나며 걷힙니다. 코드 상자가 첫 사용자입니다: `pre` 가 `text-align` 을 물려받아 상자가 옮겨 가는 대신 **코드 줄이 밀리기** 때문입니다. 마크·도구·문단 속성에 달면 **등록이 죽습니다** |
| `requiresAnyOf` | 이 중 하나는 함께 등록돼야 합니다 |
| `parts` | 함께 데려오는 버튼 없는 구조입니다 — 표의 행·칸, 접기의 요약줄 |

### 값

| 칸 | 뜻 |
|---|---|
| `attrKey` · `attrValues` | 문단 속성이 쓰는 칸 이름과 받을 수 있는 값 목록입니다 |
| `currentValue` | 지금 눌려 있나 — 툴바·상황 줄이 이 답으로 칸을 칠합니다 |

### 오가는 길

| 칸 | 뜻 |
|---|---|
| `toHtml` · `partHtml` | 나가는 그림입니다 |
| `toMd` | 마크다운으로 나가는 그림입니다. **선택입니다 — 안 달면 그 노드는 `toHtml` 로 떨어집니다**(밑줄·유튜브·접기처럼 마크다운에 자리가 없는 것들이 그 자리이고, 이것이 "HTML 이 섞인 md" 의 정체입니다) |
| `partMd` | 그 날개의 부품(`parts`)들의 마크다운 몫입니다 |
| `ioFilter` | 이 날개가 **제 형식의 붙여넣기·저장·열기를 함께 데려옵니다**(`.nabi` 파일이 그 자리입니다). 필터는 날개가 아니라 날개에 딸린 지식이라, 호스트가 `ioFilters` 로 끼운 것이 이보다 앞에 섭니다 — 아래 [IO 필터 끼우기](#io-필터-끼우기) 참고 |
| `claim` | 들어오는 HTML 에서 이 태그의 주인을 가립니다 |
| `repair` · `partRepair` | JSON 입구에서 이 노드를 다듬습니다. `null` 을 답하면 껍데기째 걷힙니다 |

### 손과 키

| 칸 | 뜻 |
|---|---|
| `commands` | 이 날개가 얹는 커맨드들입니다 |
| `onKey` | 캐럿이 이 날개의 노드 안일 때 키를 먼저 가로챕니다 |
| `escapeKeys` | 다음에 치는 글자가 이 마크를 벗게 하는 키입니다 |
| `doubleKeys` | `{ 키 이름: 커맨드 이름 }` — 그 키를 **350ms 안에 두 번** 두드리면 그 커맨드가 돕니다. 낱말은 `escapeKeys` 와 닮았지만 뜻이 다릅니다: 그쪽은 "마크를 벗고 이어 쓴다" 이고 이쪽은 "한 몸짓으로 커맨드 하나" 입니다. 우선순위가 **가장 낮아** 그 키의 다른 일이 전부 지나간 뒤에 받습니다. 등록할 때 **키 겹침과 커맨드 실재를 검사**하므로, 둘이 같은 키를 주장하거나 없는 커맨드를 가리키면 등록이 죽습니다 |
| `inputRules` | 글자만으로 일어나는 자동 변환입니다 |
| `attach` | 화면에 손을 대야 할 때입니다 — 표의 칸 드래그, 코드 색칠이 이것입니다 |

### 생김새

| 칸 | 뜻 |
|---|---|
| `button` · `buttons` | 툴바 단추 하나 또는 여럿입니다 |
| `context` | 상황 줄 선언입니다 |
| `styles` | 이 날개가 나르는 CSS 입니다 |

---

## IO 필터 끼우기

**IO 필터는 날개가 아닙니다.** 문서가 드나드는 문 — 붙여넣기·저장·열기 — 에만 서서 형식 하나를
맡고, 문서에는 제 노드를 안 세웁니다. 계약은 `IoFilter` 한 벌입니다.

| 칸 | 뜻 |
|---|---|
| `id` · `label` | 필터의 이름과 판에 뜨는 이름입니다. `id` 가 겹치면 **등록하는 그 자리에서 죽습니다** |
| `paste` | 클립보드(`PasteData`)를 보고 후보를 냅니다. 제 것이 아니면 `null` 이고, `build()` 는 사람이 그 칸을 고른 뒤에야 팹니다 |
| `save` | `{ extension, write, lossy?, mime? }` — `write` 가 받는 `DocSource` 에서 `json()` · `html()` · `md()` 중 필요한 것을 씁니다. `lossy` 가 저장 판의 "(손실저장)" 입니다 |
| `read` | 이름과 글자열을 받아 나비트리로 읽습니다. **제 것이 아니면 `null`** 로 다음 필터에 넘깁니다 |

**문 셋은 전부 선택입니다** — 붙여넣기만 아는 필터도, 읽기만 하는 필터도 됩니다. 끼우는 자리는
`mountSurface`·`mountFile` 의 `ioFilters`, `createNabiWith(wings, { ioFilters })`, 그리고 위
표의 `ioFilter` 이며 **앞에 선 것이 이깁니다** — mount → 호스트 → 날개 → 내장(`nabi` · `html` ·
`html-open` · `markdown`). 열기 목록은 `readExtensions(filters)` 가 답하는데 **저장 칸이 없는
필터는 못 셉니다**(내장의 `.html` 이 그 자리라 기본 저장소는 손으로 더해 넷을 듭니다).

마크다운만은 필터 혼자 못 만듭니다 — 어떤 노드를 어떤 글자로 적을지는 위 `toMd`·`partMd` 를 든
**그 날개**가 압니다. 안 달면 그 노드는 `toHtml` 로 떨어져 md 안에 HTML 로 섞이고, md 파서도
**등록된 날개가 받아 줄 문법만** 세웁니다.

---

## `w` — 이름 짓기

`w` 는 **저장값에 노드마다 되풀이되는 글자**입니다. 짧을수록 좋습니다 — 기본 날개가 `b`·`hl`·
`tf` 처럼 짧은 것이 그 까닭입니다. 다만 남의 이름과 겹치면 등록이 죽으므로, 직접 만드는 것은
조금 길더라도 겹치지 않을 이름을 쓰세요.

HTML 태그 이름과 같을 필요는 없습니다 — 나가는 태그는 `toHtml` 이 정합니다.

::: warning 이름을 나중에 바꾸면
저장값의 `w` 가 곧 그 이름이라, 이름을 바꾸면 **이미 저장된 문서를 못 읽어 들입니다.**
바꿔야 한다면 옛 이름을 `claim` 으로 함께 받아 주는 이사 기간을 두세요.
:::

---

## 다음 문서

- [인라인 마크](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [블록과 문단 속성](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [키·자동 변환·붙여넣기](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI 와 동작](./custom/ui) — `button` · `context` · `styles`, 그리고 사람에게 묻기

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
