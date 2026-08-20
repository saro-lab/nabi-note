---
title: 인라인 마크 만들기
description: place 'mark' — 글자 위에 씌우는 서식. 나가는 길(toHtml)과 들어오는 길(claim)을 함께 적습니다.
---

# 인라인 마크 만들기

`place: 'mark'` 는 **글자 위에 씌우는 서식**입니다. 자리를 차지하지 않고, 글의 흐름을 끊지
않으며, 겹칠 수 있습니다 — 굵게·기울임·형광펜이 전부 이 갈래입니다.

---

## 다 갖춘 마크 하나

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { ko: '단축키', en: 'Key' },
      shortcut: 'K',
      action: { kind: 'mark' },        // 토글은 코어가 합니다 — 커맨드를 안 써도 됩니다
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`simpleMark` 가 채워 주는 것은 `place: 'mark'` 와 `escapeKeys: ['Escape']` 둘입니다. 나머지는
그대로 넘어갑니다.

---

## 두 방향은 따로 적습니다

| | 방향 | 없으면 |
|---|---|---|
| `toHtml` | 문서 → HTML | **등록이 죽습니다.** 노드를 세우는 날개는 그리는 법이 있어야 합니다 |
| `claim` | HTML → 문서 | 그려지긴 하지만 **다시 못 읽습니다.** 저장했다 불러오면 껍데기가 벗겨집니다 |

기본 마크 여섯(`b`·`i`·`u`·`s`·`sub`·`sup`)과 값 마크 넷(`hl`·`tc`·`fs`·`tf`)은 **코어가 이미
태그를 압니다.** 그래서 `boldWing` 에는 `toHtml` 도 `claim` 도 없습니다. 직접 만드는 이름은
코어가 모르므로 둘 다 적습니다.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| 인자 | 무엇입니까 |
|---|---|
| `node` | 지금 노드입니다. 속성은 `node.a?.['키']` 로 꺼냅니다 |
| `children()` | 속을 그린 글자입니다. **부를 때 그려지므로**, 안 부르면 속이 안 나갑니다 |
| `ctx` | 안전하게 짓는 도구입니다 |

`ctx` 가 주는 것:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | 한 덩어리를 짓습니다. 값은 알아서 이스케이프됩니다 |
| `ctx.escape(text)` | 글자만 이스케이프합니다 |
| `ctx.url(raw)` · `ctx.src(raw)` | 주소를 거릅니다. 못 믿을 주소는 **`null`** 입니다 |
| `ctx.keys` | 지금이 **편집기용** 조립인지입니다 (`getEditorHtml()`) |

::: warning 글자를 직접 이어 붙이지 마세요
`` `<kbd>${node.a?.['t']}</kbd>` `` 처럼 쓰면 문서 속 글자가 그대로 마크업이 됩니다.
언제나 `ctx.element` 나 `ctx.escape` 를 지납니다.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — 들어온 그대로의 요소입니다 |
| `inner(block)` | 속을 읽습니다. 마크라면 `false`(글자 자리), 블록이면 `true` |
| 답 | 노드 배열, 또는 **`null`**(내 것이 아님 → 다음 날개에게) |

날개 배열 순서대로 물어보고 **처음 손든 날개**가 가져갑니다.

`null` 을 답하는 두 자리가 있습니다 — 내 태그가 아닐 때, 그리고 **내 태그지만 값이 목록
밖일 때**입니다. 뒤쪽에서 `inner(false)` 를 답하면 껍데기만 벗기고 글은 살립니다.

---

## 값을 담는 마크

색·크기처럼 **정해진 목록에서 하나를 고르는** 마크는 `valueMark` 를 씁니다.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // 값이 사는 속성 칸
    values: [...LEVELS],             // 이 밖의 값은 안 받습니다
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // 목록 밖 — 글만 남깁니다
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark` 가 얹어 주는 것 둘:

- **`currentValue`** — 지금 캐럿이 앉은 자리의 값입니다. 툴바와 상황 줄이 이 답으로 어느 칸이
  눌려 있는지 칠합니다.
- **`repair`** — JSON 입구에서 값을 다시 검사합니다. 목록 밖이거나 없으면 `null` 을 답해
  **껍데기째 걷습니다.** 손으로 고친 저장값이 들어와도 여기서 걸립니다.

::: tip 값을 바꾸는 커맨드
값 마크의 "이 값으로 바꿔라" 커맨드는 아직 공개 도우미가 없습니다. 툴바 단추만으로 켜고 끄는
`action: { kind: 'mark' }` 는 그대로 쓸 수 있고, 값 고르기가 필요하면 지금은 기본 값 마크
넷(형광펜·글자색·글자 크기·서체)을 쓰거나 그 선언을 펼쳐 쓰세요.
:::

---

## `escapeKeys` — 마크 밖으로 나가기

마크 끝에 캐럿이 서 있을 때, 다음 글자가 마크 안인지 밖인지는 사람만 압니다. `escapeKeys` 가
그 문입니다.

```ts
escapeKeys: ['Escape']    // simpleMark·valueMark 의 기본값입니다
```

**캐럿은 안 움직입니다.** 이 키를 누르면 "다음에 치는 글자는 이 마크를 벗는다" 는 예약이
걸립니다. 한 글자를 치면 예약은 쓰이고 사라집니다.

```
<kbd>Ctrl</kbd>(캐럿)  →  Escape  →  타이핑 "+"  →  <kbd>Ctrl</kbd>+
```

여러 날개가 같은 키를 걸어도 됩니다 — 캐럿이 지금 실제로 그 마크 안에 있을 때만 예약이
걸리므로, 겹쳐 있는 마크 중 해당하는 것들만 함께 벗습니다. <kbd>Escape</kbd> 는 걸린 예약이
있으면 그것을 **무르는** 데도 쓰입니다.

---

## 마크는 키를 못 가집니다

`onKey` 를 적어도 **마크에게는 안 옵니다.** 캐럿의 자리는 `{ path, offset }` 이고 `path` 의
끝은 **글자를 담는 홀더**입니다 — 마크는 그 홀더 속의 인라인 노드라 길에 아예 안 나옵니다.
키의 주인을 가릴 때 코어는 이 길을 위로 걸으므로 마크를 만날 일이 없습니다.

까닭은 겹침입니다. 굵게 안의 기울임 안의 링크에서 <kbd>Enter</kbd> 를 눌렀을 때 셋 중 누가
주인인지 정할 방법이 없습니다. 마크가 키에 대해 가진 문은 `escapeKeys` 하나입니다.

---

## 다음 문서

- [블록과 문단 속성](../custom/block) — 자리를 차지하는 것
- [키·자동 변환·붙여넣기](../custom/input) — `onKey` 와 `inputRules`
- [UI 와 동작](../custom/ui) — 툴바 단추와 상황 줄

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
