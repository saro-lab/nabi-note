---
title: 블록과 문단 속성 만들기
description: void·container·attr — 독립된 블록 요소 및 문단 속성 날개를 작성하는 방법을 안내합니다.
---

# 블록과 문단 속성 만들기

블록 레벨 요소 및 문단 서식은 `place` 속성에 따라 세 가지로 나뉩니다.

| `place` | 분류 | 설명 | 예시 |
|---|---|---|---|
| `'void'` | **독립 블록 객체** | 내부에 텍스트 자식을 갖지 않는 요소 (커서가 객체 내부로 들어가지 않음) | 구분선, 이미지, 동영상 |
| `'container'` | **컨테이너 블록** | 내부에 다른 블록이나 인라인 텍스트를 포함하는 요소 | 인용문, 접기 블록, 표, 목록, 코드 블록 |
| `'attr'` | **문단 속성** | 문단(`p`) 자체에 부여되는 속성 (별도의 독립 노드를 생성하지 않음) | 제목 레벨, 텍스트 정렬, 드롭캡 |

---

## 독립 블록 객체는 래퍼 문단으로 감싸집니다

나비트리 문서는 **최상위 블록 노드들의 배열**이며, 최상위 레벨에 위치할 수 있는 것은 문단(`p`)뿐입니다. 따라서 독립 블록 객체는 최상위에 바로 위치하지 않고, **자신을 단독으로 감싸는 컨테이너 문단** 내부에 배치됩니다.

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

이 컨테이너 문단이 **래퍼 문단(Wrapper Paragraph)**이며, HTML 변환 시 `<div data-nabi-p>`로 출력됩니다.

이렇게 구조화하는 이유는 두 가지입니다:
1. 블록 객체의 앞뒤로 커서(캐럿)가 위치할 수 있는 안정적인 위치를 항상 확보할 수 있습니다.
2. **텍스트 정렬 등의 문단 속성을 블록 객체에도 자연스럽게 적용**할 수 있습니다 (예: 가운데 정렬된 이미지는 내부적으로 '가운데 정렬 속성을 가진 래퍼 문단 안의 이미지'로 처리됩니다).

---

## void(속이 빈) 블록 객체 만들기

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

`insertLump` 헬퍼 함수가 래퍼 문단을 자동으로 감싸서 삽입합니다.

```html
<div data-nabi-p><hr data-nabi-star/></div>
```

빈 문단에서 호출하면 **해당 빈 문단을 객체로 교체**하여 불필요한 빈 줄이 남지 않으며, 문단에 이미 적용되어 있던 정렬 속성은 그대로 유지됩니다.

`boxObject()` 헬퍼는 `place: 'void'` 설정과 **속성 유효성 검사기**를 자동으로 구성해 줍니다.

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // 허용 목록 이외의 값은 제거됨
  requires: ['c'],                                                 // 필수 속성 누락 시 노드 미생성
  toHtml: /* … */,
})
```

`attrs`에 정의되지 않은 알 수 없는 속성은 스키마 정규화 과정에서 자동으로 제거되므로 안전합니다.

---

## container(컨테이너) 블록 만들기

`place: 'container'` 날개는 자식 요소를 담는 구조이므로 **`holds` 속성을 반드시 명시**해야 합니다.

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // 내부에 문단 블록들을 포함 ('inline'이면 인라인 텍스트만)
  allows: ['p'],                    // 내부에 허용할 자식 날개 식별자 목록
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

`toggleWrap`은 선택된 블록들을 컨테이너로 감싸거나, 이미 감싸져 있다면 컨테이너를 해제하고 내부 블록들을 원래 위치로 펼치는 토글 커맨드입니다.

### `holds` 속성

| 값 | 허용 자식 형태 | 예시 |
|---|---|---|
| `'blocks'` | 문단 및 다른 블록 요소 | 인용문, 접기 블록, 표 셀 |
| `'inline'` | 일반 텍스트 및 인라인 마크 | 접기 블록 요약줄(summary), 코드 블록 |

### `allows` 속성

허용할 자식 날개의 식별자 목록을 지정합니다. 지정되지 않은 다른 요소가 붙여넣기나 외부 데이터로 유입되면, 코어가 자동으로 태그를 벗겨내고 내부 텍스트만 일반 문단으로 강등시킵니다.
생략 시 모든 날개가 허용됩니다.

---

## `parts` — 종속 하위 구조 정의

표의 행(`tr`)과 셀(`td`), 접기 블록의 요약줄(`summary`)처럼 **독립적으로 존재하지 않고 상위 컨테이너에 종속되는 구조**는 `parts`로 정의합니다.

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // 1 또는 생략 불리언 속성 (펼침 상태)
  parts: { summary: { holds: 'inline' } },            // 종속 하위 요약줄
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // 각 부품별 HTML 변환 함수 필수
  repair: repairDetails,
}
```

규칙:
- `parts`는 컨테이너(`place: 'container'`) 날개에서만 사용할 수 있습니다.
- 선언된 모든 부품은 `partHtml`에 대응하는 렌더링 함수가 정의되어 있어야 합니다.
- 부품 이름은 다른 날개나 부품 식별자와 중복될 수 없습니다.
- 부품의 정규화 로직은 `partRepair`에 작성합니다.

### `singleParagraph`

내부 구조를 **단일 문단으로 강제 고정**합니다. 표의 셀(`td`)이 대표적입니다. 셀 내부에서 Enter 키를 눌러도 문단이 둘로 쪼개지지 않으며, 셀 간 드래그 선택 후 삭제해도 격자 구조가 깨지지 않고 유지됩니다.

### `boolAttrs`

값이 `1` 하나뿐인 불리언 속성 목록을 정의합니다 (예: 접기의 `o`(열림), 체크리스트의 `ck`(완료), 문단의 `dc`(드롭캡)). `false` 상태는 `0`이 아니라 속성 자체가 생략된 형태로 표현됩니다.

---

## `repair` — JSON 로드 시 무결성 검증

`repair` 함수는 외부 JSON 데이터를 파싱하여 나비트리로 변환하기 직전에 노드의 유효성을 검증하고 보정합니다.

```ts
repair: (node) => {
  if (!isValid(node)) return null    // null 반환 시 해당 노드는 안전하게 제거됨
  return sanitizedNode                // 보정된 새 노드 반환 (변경 없으면 원본 반환)
}
```

수작업으로 편집된 JSON이나 구 버전 데이터가 유입되었을 때, 날개 스스로 데이터 무결성을 보장할 수 있는 핵심 지점입니다.

---

## `requiresAnyOf` — 의존 날개 검증

```ts
requiresAnyOf: ['img', 'a']
```

지정된 날개 중 하나 이상이 함께 등록되어 있지 않으면 초기화 시점에 예외가 발생합니다. 업로드 날개처럼 업로드 완료 후 이미지나 링크 노드를 생성해야 하는 경우에 사용됩니다.

---

## 문단 속성 (`place: 'attr'`)

문단 속성은 별도의 노드를 생성하지 않고 문단(`p`)의 속성 객체(`a`)에 키-값을 부여합니다.

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["가운데 정렬된 제목 2"] }
```

::: warning 문단 속성 키는 3가지로 고정되어 있습니다
코어가 지원하는 문단 속성 키(`attrKey`)는 **`h`(제목 레벨), `a`(텍스트 정렬), `dc`(드롭캡)** 3가지입니다.
현재 버전에서는 새로운 문단 속성 키를 임의로 확장할 수 없으며, 기존 공식 날개(`headingWing`, `alignWing`, `dropCapWing`)가 이미 이를 담당하고 있습니다. 문단 단위의 추가 기능이 필요하다면 컨테이너(`place: 'container'`) 형태로 감싸는 방식을 사용하세요.
:::

---

## 제공되는 문서 편집 도우미 함수

커맨드 작성 시 활용할 수 있는 내장 도우미 함수들입니다.

| 도우미 함수 | 설명 |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | 독립 블록 객체를 래퍼 문단과 함께 문서에 삽입 |
| `removeLump(doc, topIndex, env)` | 지정 인덱스의 최상위 래퍼 문단 노드를 삭제 |
| `toggleWrap(doc, sel, containerW, env)` | 선택 영역의 블록들을 컨테이너로 감싸거나 해제 |
| `topNodeAt(doc, path)` | 주어진 커서 경로가 속한 최상위 블록 노드 반환 |

모든 도우미 함수는 `{ doc, caret }` 형태를 반환하므로 커맨드 반환 규격으로 변환하여 반환합니다.

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

---

## 다음 문서

- [키·자동 변환·붙여넣기](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI와 상호작용](../custom/ui) — 툴바 버튼과 컨텍스트 바 구성

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
