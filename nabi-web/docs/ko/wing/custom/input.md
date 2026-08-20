---
title: 키·자동 변환·붙여넣기
description: onKey 로 키를 가로채고, inputRules 로 글자만으로 서식을 만들고, attach 로 화면에 손을 댑니다.
---

# 키·자동 변환·붙여넣기

날개가 사람의 손짓을 받는 문은 셋입니다 — **키**(`onKey`), **글자**(`inputRules`),
**화면**(`attach`).

---

## 키가 지나는 길

<kbd>Enter</kbd> 하나가 눌리면 이 순서로 물어봅니다. 앞에서 누가 처리하면 뒤는 안 옵니다.

```
① 툴바 단축키          아무 데서나 듣습니다 (Ctrl+B 같은 것)
② 자동 변환            inputRules — Enter·Space 만
③ 날개의 onKey         캐럿이 앉은 곳의 주인에게
④ 물건 겨누기          문단 맨 앞에서 백스페이스 → 앞의 물건을 통째로 선택
⑤ 코어 규칙            문단 나누기·지우기·캐럿 걸음
⑥ 브라우저             여기까지 아무도 안 가져갔을 때만
```

---

## `onKey` — 키 가로채기

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // 내 일이 아님 — 코어로 넘깁니다
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // 첫 칸 맨 앞 백스페이스 — 노트를 폅니다
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| 인자 | 무엇입니까 |
|---|---|
| `intent` | `{ key, dir? }` — 어떤 키인가 |
| `doc` · `sel` · `env` | 커맨드가 받는 것과 같습니다 |
| `owner` | `{ path, node }` — **내가 주인으로 뽑힌 그 노드**입니다 |

답은 커맨드와 같은 `{ doc, selection }` 또는 **`null`** 입니다. `null` 은 "안 가져간다" 라서
코어가 이어받습니다 — 조건을 못 맞췄을 때는 반드시 `null` 을 답하세요.

### 오는 키

| `intent.key` | 언제 |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **와** <kbd>Shift</kbd>+<kbd>Enter</kbd> 둘 다 |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | 지우기 둘 |
| `'arrow'` | 화살표. 방향은 `intent.dir` (`'left'`·`'right'`·`'up'`·`'down'`) |

글자 키는 안 옵니다. 글자는 브라우저가 치고 코어가 받아 적습니다.

### 주인은 하나입니다

캐럿의 길을 **위로 걸으며 처음 만나는 문단 아닌 노드**, 그 노드를 소유한 날개가 주인입니다.

```
경로 [1, 0, 0] 의 캐럿                     주인 후보
  [1, 0, 0]  →  p        문단이라 건너뜁니다
  [1, 0]     →  note     ← 주인입니다
  [1]        →  p(래퍼)  여기까지 안 옵니다
```

그래서 **가장 안쪽 그릇이 이깁니다** — 표 안의 목록에서 <kbd>Tab</kbd> 은 목록이 받습니다.
부품(`parts`)도 주인이 될 수 있고, 그때 `owner.node` 는 부품 노드이지만 `onKey` 는 그것을
선언한 날개의 것이 불립니다. 그래서 `owner.node.w` 로 무엇이 뽑혔는지 먼저 가르는 것이
관례입니다.

마크는 주인이 될 수 없습니다 — [까닭은 인라인 문서에](./inline#마크는-키를-못-가집니다).

---

## `inputRules` — 글자만으로 만들기

`# ` 를 치면 제목이 되고 `> ` 를 치면 인용이 되는 것이 이것입니다.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| 칸 | |
|---|---|
| `trigger` | `'space'` 또는 `'enter'` — 이 키를 친 **순간**에 잽니다 |
| `pattern` | 정규식입니다. `run` 은 그 매치를 받습니다 |
| `run` | `{ name, args? }` — 돌릴 커맨드입니다 |
| `scope` | `'block'`(기본) 또는 `'word'` |

### `'block'` — 줄 앞머리를 갈아치웁니다

캐럿 앞의 **줄 앞머리**를 봅니다. 맞으면 그 앞머리(와 방아쇠 글자)를 지우고 커맨드를 돌립니다.

```
"> " 를 침   →   "&gt;" 가 지워지고 toggleQuote 가 돕니다
```

문단의 **첫 줄에서만** 걸립니다. <kbd>Shift</kbd>+<kbd>Enter</kbd> 로 줄을 내린 다음 줄에서는
안 걸립니다 — 이미 쓰고 있는 글 한가운데서 서식이 튀어나오는 자리를 막습니다.

### `'word'` — 낱말 하나에 씌웁니다

캐럿 앞의 **낱말 하나**를 봅니다. 맞으면 그 낱말을 선택해 커맨드를 돌리고 캐럿을 제자리에
돌려놓습니다. 글은 안 지워집니다 — 마크를 씌우는 규칙이 이쪽입니다.

그 낱말이 **이미 이 날개의 마크를 입고 있으면 건너뜁니다.** 같은 자리에서 두 번 걸리지
않습니다.

### 공통 규칙

- 캐럿이 **접혀 있을 때만** 돕니다. 범위를 잡고 스페이스를 쳐도 안 걸립니다.
- 평범한 문단에서만 돕니다 — 물건을 담은 래퍼 문단에서는 안 걸립니다.
- 날개 배열 순서대로 재고, **처음 성공한 규칙**이 이깁니다.
- 커맨드가 `null` 을 답하면(= 할 일 없음) **되돌리고 다음 규칙으로 넘어갑니다.** 자동 변환이
  실패한 자국이 문서에 안 남습니다.

---

## `attach` — 화면에 손대기

문서를 고치는 것이 아니라 **화면에서 일어나는 일**을 들어야 할 때가 있습니다 — 표의 칸을
드래그로 고르기, 코드에 색칠하기, 접기의 삼각형 누르기.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // 해제 함수를 답합니다
}
```

`host` 가 주는 것 셋입니다.

| | |
|---|---|
| `host.root` | 편집 표면의 요소입니다 |
| `host.nabi` | 편집기입니다. 문서를 고칠 일은 **커맨드로** 합니다 |
| `host.pathOfKey(id)` | 화면의 `data-key` 를 문서의 길로 옮깁니다 |

`mountSurface` 가 등록된 날개 전부의 `attach` 를 함께 붙이고, 내릴 때 답한 해제 함수들을
부릅니다. **DOM 을 아는 코드가 사는 유일한 사택**입니다 — 커맨드·`toHtml`·`repair` 안에서
`document` 를 만지면 안 됩니다.

::: tip `data-key` 로 문서를 찾습니다
편집기용 조립(`getEditorHtml()`)은 노드마다 `data-key` 를 답니다. 눌린 요소에서 가장 가까운
`[data-key]` 를 찾아 `host.pathOfKey()` 에 넘기면 문서 속 자리가 나옵니다.
:::

---

## 붙여넣기와 초기 HTML

붙여넣기·`setHtml()`·저장값 불러오기는 **전부 같은 문**을 지납니다. 날개가 여기서 할 일은
`claim` 하나입니다 — [인라인 문서의 `claim`](./inline#claim) 에 적혀 있습니다.

```
붙여넣기 ─┐
setHtml  ─┼→ 파싱 → 날개의 claim → 코어의 기본 태그 대응 → repair → cocoon → 문서
초기 HTML ─┘
```

`claim` 이 없으면 **그 태그는 껍데기가 벗겨지고 속의 글만 남습니다.** 남의 편집기에서 복사한
낯선 마크업이 문서에 그대로 박히지 않는 것이 이 규칙 덕입니다.

JSON 으로 들어오는 길(`setJson()`)은 태그가 아니라 노드라서 `claim` 이 아니라 `repair` 가
문지기입니다.

---

## 다음 문서

- [UI 와 동작](../custom/ui) — 툴바 단추와 상황 줄
- [인라인 마크](../custom/inline) · [블록과 문단 속성](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
