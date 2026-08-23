---
title: 키·자동 변환·붙여넣기
description: onKey로 키보드 입력을 제어하고, inputRules로 텍스트 단축 서식을 처리하며, attach로 DOM 동작을 구현하는 방법을 안내합니다.
---

# 키·자동 변환·붙여넣기

날개가 사용자의 입력 및 상호작용을 처리하는 통로는 3가지입니다: **키보드 이벤트**(`onKey`), **타이핑 단축 규칙**(`inputRules`), **DOM 렌더링 훅**(`attach`).

---

## 키보드 이벤트 처리 우선순위

<kbd>Enter</kbd> 등의 키가 입력되면 아래 순서대로 핸들러가 호출되며, 앞 단계에서 이벤트를 소비(처리)하면 이후 단계는 실행되지 않습니다.

```
① 툴바 단축키   어디서나 우선 동작 (Ctrl+B 등)
② 입력 규칙 (inputRules)   Enter / Space 입력 시 패턴 검사
③ 날개의 onKey 핸들러     커서가 위치한 블록 소유 날개에 전달
④ 블록 객체 선택          문단 맨 앞에서 백스페이스 → 앞의 블록 객체를 선택
⑤ 에디터 코어 기본 규칙   문단 분할, 삭제, 커서 이동
⑥ 브라우저 기본 동작      위 모든 단계에서 처리되지 않은 경우
```

---

## `onKey` — 키보드 이벤트 가로채기

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // 처리 대상 키가 아니면 코어로 위임
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // 첫 칸 맨 앞에서 백스페이스 입력 시 노트 해제
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

| 매개변수 | 설명 |
|---|---|
| `intent` | 키 입력 정보 (`{ key, dir? }`) |
| `doc` · `sel` · `env` | 커맨드 함수에 전달되는 문서 배열, 선택 영역, 환경 객체와 동일 |
| `owner` | 현재 키보드 소유권을 가진 대상 노드 정보 (`{ path, node }`) |

핸들러는 변경된 `{ doc, selection }` 객체 또는 **`null`**을 반환합니다. `null`을 반환하면 이벤트를 소비하지 않고 코어 기본 동작으로 위임합니다.

### 수신 가능한 키 목록 (`intent.key`)

| `intent.key` | 발생 키 |
|---|---|
| `'enter'` | <kbd>Enter</kbd> 및 <kbd>Shift</kbd>+<kbd>Enter</kbd> |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> 및 <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | <kbd>Backspace</kbd> 및 <kbd>Delete</kbd> |
| `'arrow'` | 방향키 (방향은 `intent.dir`: `'left'`, `'right'`, `'up'`, `'down'`) |

일반 문자 타이핑 이벤트는 `onKey`로 전달되지 않으며, 브라우저의 입력 파이프라인을 거쳐 코어가 처리합니다.

### 키보드 소유권 결정 규칙

커서 위치의 경로(`path`)를 **상위로 탐색하면서 처음 만나는 비문단(Non-paragraph) 블록 노드**를 소유한 날개가 이벤트 수신자로 결정됩니다.

```
경로 [1, 0, 0]의 커서                     소유권 후보
  [1, 0, 0]  →  p (문단)     문단은 건너뜀
  [1, 0]     →  note (노트)  ← 소유권 획득 (onKey 호출)
  [1]        →  p (래퍼)     상위까지 도달하지 않음
```

따라서 **가장 안쪽에 위치한 중첩 컨테이너가 우선권**을 갖습니다 (예: 표 셀 내부의 목록에서는 목록 날개가 Tab 키를 수신).
종속 부품(`parts`)의 경우 `owner.node`는 부품 노드가 전달되지만, `onKey` 핸들러는 해당 부품을 정의한 상위 날개의 핸들러가 호출됩니다.

---

## `inputRules` — 텍스트 타이핑 자동 변환

`# `를 입력하면 제목으로 변환되고 `> `를 입력하면 인용문으로 변환되는 기능입니다.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| 필드 | 설명 |
|---|---|
| `trigger` | 트리거 키 (`'space'` 또는 `'enter'`) |
| `pattern` | 정규식 패턴 (매칭된 결과가 `run` 함수로 전달됨) |
| `run` | 실행할 커맨드 반환 함수 (`{ name, args? }`) |
| `scope` | 매칭 범위 (`'block'` 기본값, 또는 `'word'`) |

### `'block'` 범위 (문단 시작 패턴)

커서 앞쪽의 **문단 시작 문자열**을 검사합니다. 패턴이 일치하면 해당 접두사 텍스트를 자동으로 삭제하고 커맨드를 실행합니다.
문단의 **첫 번째 줄에서만** 동작하므로, <kbd>Shift</kbd>+<kbd>Enter</kbd>로 줄바꿈된 본문 중간에서 의도치 않게 서식이 실행되는 것을 방지합니다.

### `'word'` 범위 (단어 패턴)

커서 바로 앞의 **단어 하나**를 검사합니다. 패턴이 일치하면 해당 단어를 대상으로 마크 서식을 적용합니다. 텍스트 자체는 삭제되지 않습니다.

---

## `attach` — DOM 동작 연결

표 셀 드래그 선택, 코드 문법 강조, 접기 블록 클릭 등 **에디터 DOM 요소를 직접 제어하거나 브라우저 이벤트를 수신**해야 할 때 사용합니다.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // 클린업 함수 반환
}
```

`host` 컨텍스트 객체:
- `host.root`: 에디터 편집 영역(Surface)의 루트 DOM 요소
- `host.nabi`: 에디터 인스턴스 (문서 수정은 커맨드로 실행)
- `host.pathOfKey(id)`: DOM의 `data-key` 속성 값을 나비트리 문서 경로(`path`)로 변환

`mountSurface`가 마운트될 때 등록된 모든 날개의 `attach` 훅을 실행하며, 언마운트 시 반환된 클린업 함수를 자동으로 호출합니다.

::: tip data-key로 노드 위치 찾기
편집기 화면의 DOM 노드에는 고유한 `data-key` 속성이 부여됩니다. 이벤트가 발생한 요소에서 가장 가까운 `[data-key]`를 찾아 `host.pathOfKey()`에 전달하면 나비트리 내의 정확한 노드 경로를 얻을 수 있습니다.
:::

---

## 붙여넣기 및 HTML 파싱 파이프라인

붙여넣기, `setHtml()`, 초기 HTML 로드는 모두 공통된 파싱 및 정규화 파이프라인을 거칩니다.

```
붙여넣기 ─→ IO 필터 ─→ 형식 선택 팝업(후보 2개 이상 시) ─┐
setHtml  ────────────────────────────────────────────────┼→ HTML 파싱 → 날개의 claim → 코어 기본 태그 매핑 → repair → cocoon → 나비트리
초기 HTML ───────────────────────────────────────────────┘
```

- **`setHtml()`과 초기 HTML 로드는 선택 팝업을 거치지 않고** 즉시 파싱 파이프라인으로 직행합니다.
- 클립보드 붙여넣기 시 후보가 2개 이상일 때만 형식 선택 팝업이 표시되며, 사용자가 형식을 선택한 후에 실제 파싱(`claim`)이 수행됩니다.
- 날개의 `claim`이 정의되어 있지 않은 외부 태그는 안전하게 태그가 제거되고 내부 텍스트만 보존됩니다.

---

## 다음 문서

- [UI와 상호작용](../custom/ui) — 툴바 단추와 컨텍스트 바
- [IO 필터 확장](../custom#io-필터-끼우기) — 붙여넣기·저장·열기 확장점
- [인라인 마크](../custom/inline) · [블록과 문단 속성](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
