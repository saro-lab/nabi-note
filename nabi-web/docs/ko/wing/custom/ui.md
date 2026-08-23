---
title: UI와 상호작용
description: 툴바 버튼(button), 컨텍스트 툴바(context), 스타일시트(styles), 사용자 대화 상자(ask) 연동 방법을 안내합니다.
---

# UI와 상호작용

날개가 사용자 인터페이스(UI)를 제공하는 영역은 3가지입니다: **메인 툴바**(`button`/`buttons`), **컨텍스트 툴바**(`context`), **날개 전용 CSS**(`styles`).

---

## 툴바 버튼 (`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // 소속 버튼 그룹 (필수)
  svg: '<path d="…"/>',                // 16×16 viewBox 내부 SVG path 문자열
  label: { ko: '굵게', en: 'Bold' },
  shortcut: 'B',                       // Shift 2회 연타 힌트 모드에서 표시될 단축키 문자
  accelerator: 'mod+b',                // 키보드 단축키 (Ctrl/⌘ 조합)
  action: { kind: 'mark' },            // 인라인 마크 토글 액션
}
```

하나의 날개가 여러 개의 버튼을 제공할 때는 `buttons` 배열로 정의합니다 (예: 텍스트 정렬 날개가 왼쪽/가운데/오른쪽 버튼 3개를 제공하는 경우). 각 버튼은 `name`으로 구분하며 `value`에 해당 버튼이 나타내는 값을 지정합니다.

### 버튼 그룹 (`group`) 순서

툴바 버튼 그룹의 렌더링 순서는 다음과 같이 고정되어 있습니다:

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

날개를 배열 어디에 선언하든 버튼은 소속된 그룹 위치에 자동으로 배치되며, 동일 그룹 내에서만 날개 등록 순서대로 정렬됩니다. 목록에 없는 새로운 그룹명을 지정하면 툴바 맨 끝에 새 그룹이 추가됩니다.

특정 그룹에 속한 버튼이 현재 상태에서 모두 숨겨지면, 해당 그룹과 구분선도 자동으로 숨김 처리됩니다.

### 버튼 액션 (`action`) 유형

| `kind` | 동작 설명 | 추가 속성 |
|---|---|---|
| `'mark'` | 인라인 마크 토글 (코어 기본 로직으로 동작) | — |
| `'command'` | 지정된 커맨드 실행 | `command`, `args?` |
| `'menu'` | 드롭다운 값 선택 메뉴 표시 | `command`, `argKey`, `values` |
| `'grid'` | 표 삽입용 행×열 격자 피커 표시 | `command`, `rowsKey`, `colsKey`, `max?` |
| `'prompt'` | 입력 팝업을 띄우고 입력값을 커맨드로 전달 | `command`, `fields` |
| `'file'` | 파일 선택 대화 상자 열기 | `accept?`, `multiple?` |
| `'host'` | 호스트 콜백(`mountToolbar`의 `onHost`)으로 전달 | — |

`action`을 정의하지 않은 버튼은 클릭해도 아무런 동작을 수행하지 않습니다.

### 단축키 (`shortcut`과 `accelerator`)

| 항목 | 형식 | 규칙 |
|---|---|---|
| `shortcut` | `'B'` | 라틴 **대문자 또는 숫자 1자리** |
| `accelerator` | `'mod+b'` | `mod+` 접두사 뒤에 **소문자 1자리** |

서로 다른 날개가 동일한 단축키를 중복 선언하면 초기화 시점에 즉시 예외가 발생합니다.

`accelerated` 옵션을 지정하면 단축키로 실행했을 때만 다른 액션을 수행하도록 분기할 수 있습니다 (예: 버튼 클릭 시에는 옵션 모달이 뜨고, 단축키 입력 시에는 기본값이 바로 적용되는 방식).

::: warning 단축키는 지정된 에디터 영역 내부에서만 동작합니다
단축키 이벤트는 `mountToolbar({ surface })`에 전달된 편집 영역 내부에서 발생한 키 입력만 감지합니다. 한 페이지에 여러 에디터가 존재할 때는 `surface` 옵션을 반드시 지정해야 키 이벤트 간섭을 방지할 수 있습니다.
:::

---

## 버튼 활성화 (Pressed) 상태 표시 규칙

툴바 버튼이 "현재 활성화됨(Pressed)"으로 표시되는 기준은 날개 유형(`place`)에 따라 결정됩니다:

| `place` | 활성화 판별 기준 |
|---|---|
| `'mark'` | 현재 커서 위치에 해당 인라인 마크가 적용되어 있는지 여부 |
| `'attr'` | 현재 문단 노드의 `currentValue` 반환값과 버튼의 `value` 일치 여부 |
| `'container'` · `'void'` | 현재 커서가 해당 블록 객체 내부 또는 위에 위치하는지 여부 |
| `'tool'` | 항상 비활성 상태 유지 |

여러 값을 가지는 날개(제목, 정렬 등)는 `currentValue` 함수가 반환한 문자열과 일치하는 `value`를 가진 버튼만 활성화 상태로 칠해집니다.

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## 버튼 자동 숨김 규칙

에디터 코어는 서식을 적용할 수 없는 상황에서 관련 툴바 버튼을 자동으로 비활성화하거나 숨깁니다:
- **코드 블록 내부처럼 서식이 제한된 영역**에서는 인라인 마크 및 다른 블록 생성 버튼이 자동으로 숨겨집니다.
- 블록 객체(이미지, 표 등)의 래퍼 문단에서는 제목 등의 문단 속성이 숨겨집니다 (단, 텍스트 정렬(`a`)은 객체 정렬을 위해 예외적으로 유지됩니다).
- 상위 컨테이너의 `allows` 허용 목록에 포함되지 않은 날개의 버튼은 자동으로 숨겨집니다.

---

## 동적 컨텍스트 툴바 (`context`)

현재 커서가 위치한 요소에 특화된 설정 도구를 제공하는 보조 툴바입니다 (예: 이미지 클릭 시 크기 조절 슬라이더, 링크 클릭 시 URL 입력 폼, 표 내부 커서 위치 시 행/열 추가 버튼).

```ts
context: {
  title: { ko: '노트', en: 'Note' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { ko: '유형', en: 'Tone' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // 현재 값을 읽어올 노드 속성 키
      values: [
        { value: 'info', label: { ko: '안내' } },
        { value: 'warn', label: { ko: '주의' } },
      ],
    },
  ],
}
```

### 컨텍스트 툴바 컨트롤 종류 (`ContextControl`)

| `kind` | 컨트롤 형태 | 주요 속성 |
|---|---|---|
| `'button'` | 단순 버튼 클릭 | `command`, `args?` |
| `'toggle'` | 토글 스위치 (ON/OFF) | `command`, `token` |
| `'select'` | 드롭다운 선택 메뉴 | `command`, `argKey`, `values`, `attr?` |
| `'range'` | 슬라이더 바 (너비 조절 등) | `command`, `argKey`, `values`, `rest?`, `readout?` |
| `'text'` | 텍스트 입력 필드 (링크 URL 등) | `command`, `argKey`, `initial?`, `placeholder?`, `validate?` |
| `'prompt'` | 복합 폼 입력 팝업 | `command`, `fields` |
| `'lightbox'` | 이미지 확대 팝업 | `src`, `alt?` |

모든 컨트롤은 공통으로 `name`(필수), `label?`, `svg?`, `tip?`, `visible?` 속성을 지원합니다. `visible(node)` 함수를 통해 특정 조건(예: 셀 병합이 되어 있을 때만 '병합 해제' 버튼 표시)에 따라 컨트롤의 표시 여부를 동적으로 제어할 수 있습니다.

---

## 날개 전용 스타일 (`styles`)

날개가 필요한 CSS 스타일을 자체적으로 내장할 수 있습니다.

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

`collectSheets(registry)`와 `injectSheets(document, sheets)`를 통해 등록된 날개들의 스타일만 문서에 동적으로 주입할 수 있으며, 동일한 스타일 문자열은 중복 주입되지 않습니다.

---

## 사용자 대화 상자 연동 (`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`: 단순 알림 표시 (`(text: string) => void`)
- `confirm`: 확인/취소 선택 창 (`(text: string) => boolean | Promise<boolean>`)
- `choose`: 다중 옵션 선택 창 (`(question: string, options: ChooseOption[]) => number | Promise<number>`)

`ChooseOption` 구조는 `{ label: string, icon?: string }`이며, 반환값은 선택된 옵션의 0 기반 인덱스(취소 시 `-1`)입니다.

::: warning ask 핸들러 미지정 시 기본 동작
`ask` 핸들러를 전달하지 않으면 `confirm`의 기본 반환값은 안전을 위해 `false`(취소)로 처리됩니다.
`choose`의 경우 핸들러가 없으면 기본적으로 첫 번째 후보(인덱스 `0`)가 선택됩니다. 붙여넣기 형식 선택 등의 UI는 `mountToolbar`가 마운트될 때 코어에 내장된 전용 UI가 자동으로 바인딩되므로 일반적인 환경에서는 `choose`를 직접 구현할 필요가 없습니다.
:::

---

## 다음 문서

- [인라인 마크 만들기](../custom/inline) · [블록과 문단 속성 만들기](../custom/block) · [키·자동 변환·붙여넣기](../custom/input)
- [스타일 커스텀](../../style/custom) — CSS 변수 및 테마 가이드

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
