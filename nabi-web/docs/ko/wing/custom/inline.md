---
title: 인라인 마크 만들기
description: place 'mark' — 텍스트 위에 적용되는 인라인 서식 날개를 작성하고 toHtml과 claim을 구성하는 방법을 안내합니다.
---

# 인라인 마크 만들기

`place: 'mark'`는 **텍스트 글자 단위에 적용되는 인라인 서식**입니다. 줄바꿈을 유발하거나 레이아웃 공간을 차지하지 않으며, 여러 서식이 자유롭게 중첩될 수 있습니다 (예: 굵게, 기울임, 형광펜, 링크 등).

---

## 기본 인라인 마크 예제

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
      action: { kind: 'mark' },        // 인라인 마크 토글은 코어가 자동 처리 (별도 커맨드 불필요)
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

`simpleMark()` 헬퍼는 `place: 'mark'`와 `escapeKeys: ['Escape']`를 기본 설정해 줍니다.

---

## 양방향 직렬화 규칙 (`toHtml`과 `claim`)

| 속성 | 변환 방향 | 미정의 시 동작 |
|---|---|---|
| `toHtml` | 나비트리 → HTML | **초기화 시 예외 발생.** 문서 노드를 생성하는 날개는 반드시 HTML 출력 함수가 필요합니다 |
| `claim` | HTML → 나비트리 | HTML 출력은 가능하지만 **다시 불러올 때 태그가 인식되지 않고 평문으로 변환**됩니다 |

공식 기본 마크(`b`, `i`, `u`, `s`, `sub`, `sup`)와 값 마크(`hl`, `tc`, `fs`, `tf`)는 코어가 내장 변환 규칙을 알고 있으므로 별도 정의가 필요 없습니다. 커스텀 날개는 두 속성을 모두 명시해야 합니다.

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

- `node`: 현재 나비트리 노드 객체 (속성은 `node.a?.['키']`로 접근)
- `children()`: 자식 노드들의 HTML 문자열 생성 함수 (반드시 호출하여 자식을 렌더링해야 함)
- `ctx`: 안전한 HTML 생성을 위한 헬퍼 컨텍스트
  - `ctx.element(tag, inner, attrs?)`: HTML 태그 문자열 생성 (속성값 자동 이스케이프)
  - `ctx.escape(text)`: 텍스트 이스케이프 함수
  - `ctx.url(raw)` / `ctx.src(raw)`: 안전한 URL 검증 (위험한 프로토콜인 경우 `null` 반환)
  - `ctx.keys`: 편집기용 렌더링(`getEditorHtml()`) 여부 (`boolean`)

::: warning 템플릿 리터럴로 직접 HTML을 결합하지 마세요
`` `<kbd>${node.a?.['t']}</kbd>` ``처럼 문자열을 직접 연결하면 XSS 취약점이 발생할 수 있습니다. 항상 `ctx.element` 또는 `ctx.escape`를 사용하세요.
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

- `el`: 파싱 대상 HTML 요소 (`{ kind, tag, attrs, children }`)
- `inner(block)`: 자식 노드 파싱 함수 (인라인 마크는 `false`, 블록 컨테이너는 `true` 전달)
- 반환값: 생성된 나비트리 노드 배열 또는 **`null`**(소유권 없음 → 다음 날개로 위임)

처리 대상 태그가 아니거나, 태그는 일치하지만 허용된 속성값이 아닐 때는 `null` 또는 `inner(false)`를 반환합니다. `inner(false)`를 반환하면 태그만 제거되고 내부 텍스트는 보존됩니다.

---

## 값을 저장하는 인라인 마크 (`valueMark`)

색상, 폰트 크기처럼 **정해진 값 목록 중 하나를 선택하여 적용하는 마크**는 `valueMark()` 헬퍼를 사용합니다.

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // 값을 저장할 속성 키
    values: [...LEVELS],             // 허용 가능한 값 목록
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // 유효하지 않은 값은 텍스트만 보존
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark()`가 자동으로 추가하는 기능:
- **`currentValue`**: 현재 커서 위치에 적용된 마크의 속성 값을 반환하여 툴바 버튼의 활성화 상태를 표시합니다.
- **`repair`**: JSON 파싱 시 속성 값이 유효 목록에 속하는지 검증하고, 유효하지 않으면 노드를 자동으로 정규화합니다.

---

## `escapeKeys` — 마크 서식 벗어나기

마크 서식의 맨 끝에 커서가 위치할 때, 이어지는 입력을 해당 마크 내부로 작성할지 서식을 벗어나서 작성할지 제어합니다.

```ts
escapeKeys: ['Escape']    // simpleMark 및 valueMark의 기본값
```

커서 위치 자체는 이동하지 않으며, 지정된 키를 누르면 "다음 입력할 문자는 현재 마크 서식을 적용하지 않는다"는 상태가 예약됩니다. 다음 글자를 입력하면 서식이 분리되고 예약 상태는 초기화됩니다.

```
<kbd>Ctrl</kbd>| (커서)  →  Escape 입력  →  "+" 타이핑  →  <kbd>Ctrl</kbd>+
```

::: tip Esc 키를 2번 연속 누르면 서식 지우기가 동작합니다
Esc 키 2회 연속 입력 시 동작하는 [서식 지우기](../etc/clear-format)(`doubleKeys`)는 `escapeKeys`와 독립적으로 동작합니다. 첫 번째 Esc로 마크 탈출 예약이 걸렸더라도, 350ms 이내에 한 번 더 Esc를 누르면 서식 지우기 커맨드가 정상 실행됩니다.
:::

---

## 인라인 마크의 키보드 이벤트 (`onKey`) 제한

인라인 마크(`place: 'mark'`)에는 **`onKey` 핸들러가 적용되지 않습니다.**
키보드 이벤트의 소유권은 커서 경로(`path`) 상의 상위 블록 컨테이너(문단, 인용문, 표 등)에 귀속되며, 텍스트 내부에 중첩된 인라인 마크는 단일 키보드 소유권을 가질 수 없기 때문입니다.

---

## 다음 문서

- [블록과 문단 속성 만들기](../custom/block) — 컨테이너 및 독립 블록 객체
- [키·자동 변환·붙여넣기](../custom/input) — `onKey`, `inputRules`, `attach`
- [UI와 상호작용](../custom/ui) — 툴바 단추 및 컨텍스트 바

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
