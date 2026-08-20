---
title: UI 와 동작
description: 툴바 단추(button)·상황 줄(context)·시트(styles) — 날개가 사람 앞에 서는 세 자리입니다.
---

# UI 와 동작

날개가 사람 앞에 서는 자리는 셋입니다.

| 칸 | 어디에 |
|---|---|
| `button` · `buttons` | 위쪽 **툴바** — 언제나 보이는 자리 |
| `context` | **상황 줄** — 지금 캐럿이 닿은 것에만 뜨는 자리 |
| `styles` | 이 날개가 나르는 **CSS** |

---

## 툴바 단추

```ts
button: {
  group: 'emphasis',                   // 어느 무리에 서는가 — 필수입니다
  svg: '<path d="…"/>',                // 16×16 좌표의 속입니다. 없으면 글자로 섭니다
  label: { ko: '굵게', en: 'Bold' },
  shortcut: 'B',                       // 힌트 모드에서 이 글자
  accelerator: 'mod+b',                // Ctrl/⌘ 조합
  action: { kind: 'mark' },
}
```

단추가 여럿이면 `buttons` 에 배열로 적습니다 — 정렬 날개 하나가 왼쪽·가운데·오른쪽 셋을
세우는 식입니다. 그때는 `name` 으로 서로를 가르고 `value` 로 각자가 나타내는 값을 적습니다.

### `group` — 순서는 무리가 정합니다

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**이 순서는 못박혀 있습니다.** 날개를 배열 어디에 넣든 단추는 자기 무리 자리에 섭니다. 같은
무리 안에서만 등록 순서대로 늘어섭니다. 목록에 없는 이름을 쓰면 맨 뒤에 새 무리가 섭니다.

무리가 통째로 빌 때(속의 단추가 다 숨었을 때) 그 무리는 화면에서 사라집니다 — 빈 구분선이
남지 않습니다.

### `action` — 누르면 무슨 일이 나는가

| `kind` | 하는 일 | 함께 적는 것 |
|---|---|---|
| `'mark'` | 코어의 마크 토글로 갑니다. **커맨드를 안 써도 됩니다** | — |
| `'command'` | 커맨드 하나를 돌립니다 | `command` · `args?` |
| `'menu'` | 값 목록을 판으로 폅니다 | `command` · `argKey` · `values` |
| `'grid'` | 행×열 격자를 폅니다 (표 넣기) | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | 입력 칸을 띄우고 받은 값을 커맨드에 넘깁니다 | `command` · `fields` |
| `'file'` | 파일 고르기 창을 엽니다 | `accept?` · `multiple?` |
| `'host'` | 호스트에게 넘깁니다 (`mountToolbar` 의 `onHost`) | — |

`action` 을 안 적으면 그 단추는 눌러도 아무 일도 안 합니다.

### `shortcut` 과 `accelerator`

| | 모양 | 규칙 |
|---|---|---|
| `shortcut` | `'B'` | 라틴 **대문자·숫자 한 글자**입니다 |
| `accelerator` | `'mod+b'` | `mod+` 뒤에 **소문자 한 글자**입니다 |

둘 다 **날개 사이에서 겹치면 등록하는 자리에서 죽습니다.** 나중에 조용히 한쪽이 안 먹는 일이
없습니다.

`accelerated` 를 따로 적으면 가속키로 눌렀을 때만 다른 동작이 갑니다 — 단추를 누르면 판이
열리지만 <kbd>Ctrl</kbd>+키로는 기본값이 바로 걸리는 식입니다.

---

## 눌린 것으로 보이는 법

단추가 "지금 켜져 있다" 고 칠해지는 근거는 하나뿐입니다.

| `place` | 무엇을 보고 | 
|---|---|
| `'mark'` | 캐럿 자리에 그 마크가 있는가 |
| `'attr'` | 캐럿이 선 문단의 `currentValue` |
| `'container'`·`'void'` | 캐럿이 그 물건 안이나 위에 있는가 |
| `'tool'` | **언제나 꺼짐**입니다 |

값이 여럿인 날개(정렬·제목)는 단추마다 `value` 를 적고, 날개의 `currentValue` 가 답한 값과
같은 단추만 칠해집니다.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` 는 글자를 답합니다** — 숫자 값이어도 `String()` 으로 옮겨 답합니다.
`undefined` 는 "이 노드에는 내 값이 없다" 입니다.

---

## 단추는 못 설 자리에서 저절로 숨습니다

| `place` | 숨는 때 |
|---|---|
| `'mark'` | 글자만 사는 자리(코드 상자 안 따위)에서, 그 자리의 주인일 때 |
| `'attr'` | 캐럿이 물건을 담은 래퍼 문단 위일 때. **정렬(`a`)만 예외**입니다 |
| `'void'`·`'container'` | 글자만 사는 자리이거나, 지금 그릇의 `allows` 가 나를 안 받을 때 |
| `'tool'` | 안 숨습니다 |

정렬만 예외인 까닭은 앞에서 본 그대로입니다 — 물건의 정렬은 물건이 아니라 그것을 담은 래퍼
문단이 듭니다. 그림 위에서 "가운데" 를 누를 수 있어야 합니다.

`allows` 를 적어 두면 **툴바가 알아서 따라옵니다.** 코드 상자 안에서 표 단추가 사라지는 것은
따로 적은 규칙이 아니라 `allows` 하나에서 나옵니다.

---

## 상황 줄

지금 캐럿이 닿은 것에만 뜨는 줄입니다. 그림을 누르면 크기 조절이, 링크에 캐럿을 두면 주소
칸이 뜨는 자리입니다.

```ts
context: {
  title: { ko: '노트', en: 'Note' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { ko: '결', en: 'Tone' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // 지금 값을 읽을 속성 칸
      values: [
        { value: 'info', label: { ko: '알림' } },
        { value: 'warn', label: { ko: '주의' } },
      ],
    },
  ],
}
```

### 언제 뜨는가

캐럿 자리에서 **닿는 것 전부**가 각자 자기 줄을 폅니다.

- 캐럿의 길 위에 있는 그릇들 (안쪽이 먼저, 바깥이 나중)
- 겨눠진 물건 (래퍼 문단 위에서 선택된 그림 따위)
- 캐럿 자리에 걸린 **마크들** — 툴바 단추와 달리 마크도 상황 줄을 가집니다
- 캐럿이 선 문단이 값을 든 **문단 속성** 날개

표 안의 링크에 캐럿을 두면 링크 줄과 표 줄이 함께 뜹니다.

### `ContextControl` 일곱 갈래

| `kind` | 무엇 | 함께 적는 것 |
|---|---|---|
| `'button'` | 한 번 누르면 커맨드 | `command` · `args?` |
| `'toggle'` | 켜짐/꺼짐 두 상태 | `command` · `token` |
| `'select'` | 목록에서 하나 | `command` · `argKey` · `values` · `attr?` |
| `'range'` | 눈금을 미는 것 (크기 조절) | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | 글자 한 칸 (링크 주소) | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | 여러 칸을 판으로 | `command` · `fields` |
| `'lightbox'` | 크게 보기 | `src` · `alt?` |

일곱 다 공통으로 `name`(필수) · `label?` · `svg?` · `tip?` · `visible?` 을 가집니다.

`visible: (node) => boolean` 은 **같은 날개 안에서 칸을 가리는** 문입니다 — 이미 병합된 칸에만
"병합 풀기" 를 보이는 식입니다.

`attr` 을 적으면 지금 값을 그 속성 칸에서 직접 읽어 칠합니다. `'toggle'` 은 `token` 으로
`currentValue` 가 답한 글자와 견줍니다.

---

## `styles` — 날개가 나르는 CSS

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

규칙 넷입니다.

- **`.nabi-content` 아래로 한정합니다.** 호스트 페이지의 다른 글에 번지면 안 됩니다.
- **글꼴 크기는 `rem` 이나 `em`** 으로 씁니다.
- **어두운 갈래는 `.dark` 클래스로만** 가릅니다. 미디어 쿼리로 가리면 호스트가 켠 밝은
  화면에서 편집기만 어두워집니다.
- **넓고 좁음은 컨테이너 질의**로 잽니다. 화면 너비가 아니라 편집기가 놓인 자리의 너비가
  기준입니다.

등록한 것만 담고 싶으면 직접 모아 붙입니다.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

같은 글의 시트는 **한 번만** 실립니다 — 여러 날개가 같은 CSS 를 나눠 들어도 문서에 하나만
붙습니다. 답은 떼는 함수이고, **이 부름이 새로 붙인 것만** 뗍니다.

---

## 사람에게 묻기

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` 은 `boolean` 도 `Promise<boolean>` 도 받습니다 — 브라우저의 `confirm` 을 그대로 꽂아도
되고, 직접 만든 판을 띄우고 답을 나중에 줘도 됩니다.

::: warning 안 주면 답은 언제나 "아니오" 입니다
`ask` 를 안 꽂으면 조용한 기본이 들어갑니다. `message` 는 아무 데도 안 가고 `confirm` 은
`false` 를 답합니다. **묻고 지우는 일이 조용히 안 되는 것**이 조용히 되어 버리는 것보다 낫다는
쪽입니다. 로컬 히스토리의 "정말 지울까요" 가 이 문을 지납니다.
:::

::: tip 커맨드는 못 묻습니다
커맨드는 순수 함수라 화면도 시간도 모릅니다. 물어야 하는 일은 커맨드 밖에서 묻고 **답이 나온
뒤에** 커맨드를 부릅니다. 날개 안에서 그럴 자리는 `attach` 이고, 거기서는 `host.nabi.$ask` 로
닿습니다.
:::

---

## 다음 문서

- [인라인 마크](../custom/inline) · [블록과 문단 속성](../custom/block) ·
  [키·자동 변환·붙여넣기](../custom/input)
- [테마와 CSS 변수](../../style/custom) — 시트가 기대는 변수 이름들

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
