---
title: 블록과 문단 속성 만들기
description: void·container·attr — 자리를 차지하는 것을 만듭니다. 물건은 늘 래퍼 문단 속에 삽니다.
---

# 블록과 문단 속성 만들기

자리를 차지하는 것은 세 갈래입니다.

| `place` | 무엇 | 예 |
|---|---|---|
| `'void'` | **속이 없는 물건**입니다. 캐럿이 안으로 못 들어갑니다 | 가로줄·그림·유튜브 |
| `'container'` | **속에 글이 있는 물건**입니다 | 인용·접기·표·목록·코드 |
| `'attr'` | 문단 자체에 붙는 값입니다. 노드를 안 세웁니다 | 제목·정렬·드롭 캡 |

---

## 물건은 래퍼 문단 속에 삽니다

문서는 **블록의 배열**이고 최상위에 설 수 있는 것은 문단(`p`)뿐입니다. 물건은 최상위에 직접
서지 않고 **자기만 담은 문단** 하나를 입고 섭니다.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

이 문단이 **래퍼 문단**이고, 화면에는 `<div data-nabi-p>` 로 그려집니다.

이렇게 하는 까닭 둘입니다. 물건 앞뒤에 캐럿이 설 자리가 늘 있고(문단 하나가 언제나 거기
있으므로), **정렬 같은 문단 속성을 물건이 그대로 받습니다** — "가운데 정렬된 그림" 은 곧
"가운데 정렬된 문단 안의 그림" 입니다.

---

## 속 없는 물건 만들기

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { ko: '별표', en: 'Star' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` 가 래퍼 문단을 알아서 입힙니다.

```
<div data-nabi-p><hr data-nabi-star/></div>
```

빈 문단 위에서 부르면 **그 문단을 갈아탑니다** — 넣을 때마다 빈 줄이 하나씩 남지 않습니다.
그리고 그 문단이 이미 들고 있던 정렬은 그대로 살아남습니다.

`boxObject` 가 채워 주는 것은 `place: 'void'` 와 **속성 검사기**입니다.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // 목록 밖 값은 떨어집니다
  requires: ['c'],                                                 // 없으면 이 물건은 안 섭니다
  toHtml: /* … */,
})
```

`attrs` 에 안 적은 속성은 **모르는 칸이라 통째로 떨어집니다.** 계약 밖의 값이 저장값에 슬며시
얹히는 자리가 없습니다.

---

## 속이 있는 물건 만들기

`place: 'container'` 는 `holds` 를 반드시 함께 적습니다 — 안 적으면 등록이 죽습니다.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // 속에 문단이 산다 ('inline' 이면 글자만)
  allows: ['p'],                    // 이 안에 들어올 수 있는 것
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { ko: '노트', en: 'Note' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` 은 **토글**입니다. 선택이 걸친 최상위 블록들을 이 그릇으로 감싸고, 이미 전부
감싸여 있으면 속을 제자리에 폅니다.

```
감싸기 전  [p"첫줄", p"둘째"]
감싼 뒤    [p[ note[ p"첫줄", p"둘째" ] ]]
다시 누름  [p"첫줄", p"둘째"]
```

### `holds`

| | 속에 사는 것 | 예 |
|---|---|---|
| `'blocks'` | 문단과 다른 물건 | 인용·접기·표의 칸 |
| `'inline'` | 글자와 마크만 | 접기의 요약줄·코드 |

### `allows`

적으면 **그 밖의 것은 못 들어옵니다.** 코어가 자동으로 정리기를 하나 얹어, 붙여넣기든 저장값
이든 목록 밖의 것은 껍데기를 벗기고 속의 글만 문단으로 내려 앉힙니다.

안 적으면 전부 허용입니다. `allows` 에 모르는 이름을 적으면 **등록하는 자리에서 죽습니다.**

---

## `parts` — 단추 없는 속 구조

표의 행·칸, 접기의 요약줄처럼 **혼자서는 못 서고 툴바 단추도 없는** 구조는 부품으로
선언합니다.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // 값이 1 뿐인 속성 — 펼침 여부
  parts: { summary: { holds: 'inline' } },            // 요약줄
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // 부품마다 조립이 있어야 합니다
  repair: repairDetails,
}
```

규칙 넷입니다.

- 부품은 **컨테이너만** 가집니다. 다른 `place` 에 적으면 등록이 죽습니다.
- 부품마다 `partHtml` 이 있어야 합니다. 없으면 등록이 죽습니다.
- 부품 이름은 날개 이름·다른 부품 이름과 못 겹칩니다.
- 부품을 다듬을 일이 있으면 `partRepair` 에 부품 이름으로 적습니다.

`StructureDecl` 은 셋을 받습니다 — `holds` · `singleParagraph` · `boolAttrs`.

### `singleParagraph`

속이 **문단 하나로 고정**됩니다. 표의 칸이 이것입니다 — 칸 안에서 <kbd>Enter</kbd> 를 눌러도
문단이 둘로 안 갈리고, 두 칸에 걸친 선택을 지워도 칸이 서로 합쳐지지 않습니다. 격자를 지키는
것이 이 한 칸입니다.

### `boolAttrs`

값이 `1` 하나뿐인 속성입니다 — 접기의 `o`(펼침), 할 일 목록의 `ck`(체크), 문단의 `dc`(드롭 캡).
꺼진 상태는 `0` 이 아니라 **칸이 아예 없는 것**입니다.

---

## `repair` — 저장값 입구의 마지막 문

`repair` 는 **JSON 이 문서가 되기 직전**에 이 노드를 한 번 다듬습니다.

```ts
repair: (node) => {
  if (!올바른가(node)) return null    // null — 이 노드는 껍데기째 걷힙니다
  return 다듬은_노드                   // 그대로여도 됩니다 (같은 객체를 답하면 안 바뀝니다)
}
```

손으로 고친 저장값, 다른 판에서 온 문서, 남이 만든 JSON 이 전부 이 문을 지납니다. 여기를
통과한 것만 문서가 되므로, **날개가 자기 노드의 모양을 스스로 보증할 수 있는 유일한 자리**
입니다.

`allows` 와 `repair` 를 함께 적으면 `allows` 정리가 **먼저** 돌고 그 결과가 `repair` 로
넘어갑니다.

---

## `requiresAnyOf` — 짝이 있어야 서는 날개

```ts
requiresAnyOf: ['img', 'a']
```

이 중 하나도 함께 등록돼 있지 않으면 **등록하는 자리에서 죽습니다.** 업로드 날개가 이것을
씁니다 — 올린 것을 그림이나 링크로 세워야 하는데, 둘 다 없으면 올려 놓고 아무것도 못 합니다.

---

## 문단 속성(`place: 'attr'`)

문단 속성은 노드를 안 세웁니다. 문단의 `a` 에 값 하나를 얹을 뿐입니다.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["가운데 정렬된 제목 2"] }
```

::: warning 칸이 셋으로 못박혀 있습니다
`attrKey` 는 **`h`(제목) · `a`(정렬) · `dc`(드롭 캡)** 셋 중 하나여야 하고, 그 밖의 이름을
적으면 등록이 죽습니다. 지금 판에서 **새 문단 속성은 만들 수 없습니다** — 문단의 속성 칸은
코어가 아는 셋으로 닫혀 있습니다.

같은 까닭으로 이 셋은 이미 `headingWing`·`alignWing`·`dropCapWing` 이 차지하고 있어,
`place: 'attr'` 날개를 새로 쓸 자리가 사실상 없습니다. 문단마다 값을 얹고 싶다면 지금은
컨테이너로 감싸는 쪽을 택하세요.
:::

값을 다루는 칸 둘입니다.

| | |
|---|---|
| `attrValues` | 받을 수 있는 값 목록입니다 (제목이면 `[1,2,3,4,5,6]`) |
| `currentValue` | 이 문단이 지금 든 값입니다. 툴바·상황 줄이 이 답으로 눌린 칸을 칠합니다 |

---

## 공개된 문서 도우미

지금 판이 밖으로 내준 편집 도우미는 넷입니다.

| | 하는 일 |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | 물건 하나를 래퍼 문단째 세웁니다 |
| `removeLump(doc, topIndex, env)` | 최상위 래퍼 문단 하나를 통째로 걷습니다 |
| `toggleWrap(doc, sel, containerW, env)` | 걸친 블록들을 그릇으로 감싸거나 폅니다 |
| `topNodeAt(doc, path)` | 이 길이 속한 최상위 노드입니다 |

넷 다 `{ doc, caret }` 을 답하므로 커맨드가 답할 모양으로 한 번 옮깁니다.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip 이보다 잔 편집이 필요하면
글자 단위로 자르고 잇는 안쪽 도우미(마크 얹기·문단 속성 쓰기 따위)는 아직 공개 API 가
아닙니다. 그때까지는 `doc` 배열을 직접 새로 지어 답해도 됩니다 — 답한 문서는 `cocoon` 이 한 번
더 다듬으므로, 규칙을 깬 문서가 그대로 남는 일은 없습니다.
:::

---

## 다음 문서

- [키·자동 변환·붙여넣기](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI 와 동작](../custom/ui) — 툴바 단추와 상황 줄

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
