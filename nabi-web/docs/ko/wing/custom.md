---
title: 커스텀 날개 만들기
description: NABI NOTE의 Wing 인터페이스 명세를 작성하여 새로운 커스텀 서식과 기능을 제작하는 방법을 안내합니다.
---

# 커스텀 날개 만들기

날개(Wing)는 **하나의 순수 자바스크립트 객체**입니다. 복잡한 클래스 상속이나 별도의 프레임워크 등록 절차 없이, `createNabiWith`에 전달하는 배열에 객체를 포함하는 것만으로 즉시 등록됩니다.

굵게, 표, 파일 업로드 등 기본 제공되는 모든 공식 날개도 동일한 `Wing` 인터페이스 규격으로 작성되어 있습니다. 직접 만든 커스텀 날개 역시 기본 날개와 **완전히 동일한 환경과 조건**에서 동작합니다.

---

## 가장 간단한 날개 예제

`<kbd>` 키보드 태그를 지원하는 인라인 마크 날개 예시입니다.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // 날개 고유 식별자 (나비트리에 저장되는 키)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // HTML 출력 함수
  }),
  // 입력된 HTML에서 <kbd> 태그를 감지하여 나비트리 노드로 변환
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

이제 에디터에서 `<kbd>` 태그가 보존되며, 클립보드 붙여넣기, `setHtml()`, 저장 및 불러오기 시에도 마크업이 유지됩니다.

```
등록 시:     <p>단축키: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   <kbd> 태그 유지
미등록 시:   <p>단축키: <kbd>Ctrl</kbd></p>              →   <p>단축키: Ctrl</p> (일반 텍스트로 변환)
```

`toHtml`은 나비트리를 HTML로 내보내는 직렬화 함수이고, `claim`은 외부 HTML을 나비트리로 읽어 들이는 역직렬화 규칙입니다. `claim`이 정의되지 않으면 HTML 출력은 가능하지만 저장 후 다시 불러올 때 태그가 평문으로 변환됩니다.

단순 마크는 `simpleMark()`, 속성 값을 가지는 마크는 `valueMark()`, 독립 블록 객체는 `boxObject()`, 목록 구조는 `listFamily()` 헬퍼를 활용하면 보일러플레이트를 줄일 수 있습니다.

---

## 날개 모듈과 팩토리 함수

**대부분의 기본 날개는 사전 정의된 불변 객체 상수**입니다 (`boldWing`, `headingWing` 등). 추가 설정 옵션이 필요한 일부 날개만 팩토리 함수 형태로 제공됩니다.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

특정 기본 날개의 동작(예: 문법 하이라이터 등)만 변경하고 싶다면 기존 날개 객체를 스프레드 연산자로 확장하여 일부 속성만 재정의할 수 있습니다.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## 등록 순서와 유효성 검증

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**배열 내 날개의 순서가 곧 HTML 스캔 우선순위입니다.** 외부 HTML을 파싱할 때(`claim`) 등록된 날개 순서대로 검사를 수행하며, 가장 먼저 소유권을 주장한 날개가 해당 태그를 처리합니다. 어느 날개도 처리하지 않은 태그는 태그가 벗겨지고 내부 텍스트만 보존됩니다.

툴바 버튼 배치는 **버튼 그룹(`button.group`) 순서가 우선**하며, 동일 그룹 내에서만 날개 등록 순서대로 배치됩니다.

### 유효성 검사 및 예외 처리 (Strict Validation)

`createNabiWith`는 명세를 위반한 날개가 등록되면 런타임 오류를 지연시키지 않고 **초기화 시점에 즉시 예외(Error)를 발생**시킵니다.

| 검증 항목 | 위반 예시 |
|---|---|
| 예약어 식별자 사용 | `w: 'p'`, `w: 'br'` |
| 식별자(w) 중복 등록 | 동일한 `boldWing`을 중복 전달 |
| 렌더링 함수 누락 | `place: 'mark'`인데 `toHtml` 정의 없음 |
| 커맨드 명명 규칙 위반 | 동사+명사 카멜케이스 규칙 위반 (예: `insertTable`) |
| 필수 의존 날개 누락 | 업로드 날개에 `requiresAnyOf`로 지정된 이미지/링크 날개 누락 |

---

## 커맨드 (Command) — 순수 함수

문서를 변경하는 모든 작업은 커맨드 함수를 통해 실행됩니다. 커맨드는 **DOM API나 화면 렌더링에 의존하지 않는 순수 함수**로 동작합니다.

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // 외부 인자 타입 검증
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

| 매개변수 | 설명 |
|---|---|
| `doc` | 현재 나비트리 문서 배열 (불변 객체로 취급하며 직접 수정하지 않고 새 문서를 반환) |
| `sel` | 현재 커서 및 선택 영역 상태 (`{ anchor, focus }`) |
| `args` | 툴바 버튼이나 UI에서 전달된 인자 객체 |
| `env` | 스키마 지식 및 환경 컨텍스트 |

커맨드는 변경된 `{ doc, selection }` 객체 또는 **`null`**을 반환합니다. **문서에 변경이 없으면 반드시 `null`을 반환해야 합니다.** `null`을 반환하면 `applyCommand`는 `false`를 반환하며 불필요한 Undo 히스토리를 생성하지 않습니다. 반환된 문서는 `cocoon`(정규화) 엔진을 거치므로 스키마 무결성이 보장됩니다.

호스트에서는 커맨드 이름으로 호출합니다.

```ts
nabi.applyCommand('insertStamp', { text: '확인' })   // boolean 반환
```

---

## Wing 인터페이스 상세 명세

`Wing` 인터페이스는 총 31개 속성으로 구성되며 **필수 속성은 2개(`w`, `place`)**입니다.

### 1. 기본 식별 및 구조

| 속성 | 설명 |
|---|---|
| `w` | 날개 고유 식별자 (필수, 예약어 `p`·`br` 제외) |
| `place` | 날개 유형 (필수: `'mark'` 인라인 서식, `'void'` 속이 빈 블록, `'container'` 컨테이너 블록, `'attr'` 문단 속성, `'tool'` 문서에 저장되지 않는 도구) |
| `basic` | 백엔드/호스트 추가 연동 없이 기본 동작하는 날개인지 여부 (`boolean`, 기본값 `false`). `wings().allBasic()` 호출 시 필터링 기준이 됩니다 |
| `holds` | 컨테이너 내부 허용 자식 유형 (`'blocks'` 또는 `'inline'`) |
| `singleParagraph` | 내부가 단일 문단으로 고정되는지 여부 (표 셀 등) |
| `boolAttrs` | 값이 `1`로만 표현되는 불리언 속성 이름 목록 |
| `allows` | 컨테이너 내부에 허용할 자식 날개 이름 목록 (미지정 시 전체 허용) |
| `noAlign` | 래퍼 문단의 텍스트 정렬 적용을 차단할지 여부 (`boolean`, 블록 객체 전용). 코드 블록 등 `pre` 태그 정렬 깨짐 방지에 사용됩니다 |
| `requiresAnyOf` | 함께 등록되어야 하는 의존 날개 목록 (이 중 하나 이상 등록 필수) |
| `parts` | 날개 내부에 종속된 하위 구성 요소 정의 (표의 행/열, 접기 블록의 summary 등) |

### 2. 속성 및 상태 관리

| 속성 | 설명 |
|---|---|
| `attrKey` · `attrValues` | 문단 속성 날개가 사용하는 속성 키 및 허용 값 목록 |
| `currentValue` | 현재 커서 위치의 속성 값을 반환하는 함수 (툴바 버튼 활성 상태 표시용) |

### 3. 직렬화 및 입출력

| 속성 | 설명 |
|---|---|
| `toHtml` · `partHtml` | 나비트리를 HTML로 변환하는 직렬화 함수 |
| `toMd` | 나비트리를 마크다운으로 변환하는 직렬화 함수 (선택 사항, 정의하지 않으면 `toHtml`을 대신 사용) |
| `partMd` | 하위 부품(`parts`)의 마크다운 직렬화 함수 |
| `ioFilter` | 날개 자체에서 지원하는 파일 입출력 및 클립보드 필터 |
| `claim` | 입력된 HTML 마크업의 소유권을 판별하고 나비트리로 변환하는 함수 |
| `repair` · `partRepair` | JSON 로드 시 노드 유효성을 검증하고 보정하는 함수 (`null` 반환 시 노드 제거) |

### 4. 입력 및 이벤트 제어

| 속성 | 설명 |
|---|---|
| `commands` | 날개가 제공하는 커맨드 함수 맵 |
| `onKey` | 커서가 해당 날개 내부에 위치할 때 키보드 입력을 가로채는 핸들러 |
| `escapeKeys` | 다음 텍스트 입력 시 해당 마크 서식을 벗어나도록 트리거하는 키 목록 |
| `doubleKeys` | 350ms 이내에 키를 2번 연속 입력했을 때 실행할 커맨드 매핑 (`{ 키이름: 커맨드이름 }`, 예: Esc Esc → 서식 지우기) |
| `inputRules` | 텍스트 타이핑 패턴에 따라 자동으로 실행되는 서식 변환 규칙 |
| `attach` | DOM 요소에 직접 이벤트 리스너를 바인딩하거나 제어하는 훅 (표 드래그, 코드 하이라이팅 등) |

### 5. UI 및 스타일

| 속성 | 설명 |
|---|---|
| `button` · `buttons` | 상단 툴바에 렌더링될 버튼 정의 |
| `context` | 커서 위치에 따라 나타나는 컨텍스트 툴바 정의 |
| `styles` | 해당 날개가 내장하는 CSS 스타일시트 문자열 |

---

## IO 필터 확장

**IO 필터(IoFilter)는 문서 노드를 직접 생성하지 않고, 클립보드 붙여넣기 및 파일 저장·열기 형식을 처리하는 확장 지점입니다.**

| 필드 | 설명 |
|---|---|
| `id` · `label` | 필터 고유 식별자 및 UI에 표시될 라벨 (식별자 중복 시 예외 발생) |
| `paste` | 클립보드 데이터(`PasteData`)를 분석하여 붙여넣기 후보를 반환하는 함수 |
| `save` | 저장 설정 객체 (`{ extension, write, lossy?, mime? }`) |
| `read` | 파일명과 텍스트를 전달받아 나비트리로 파싱하는 함수 (미일치 시 `null` 반환) |

IO 필터의 세 가지 메서드는 모두 선택 사항입니다. 마운트 옵션(`mountSurface`, `mountFile`), `createNabiWith({ ioFilters })`, 또는 날개 자체의 `ioFilter` 속성을 통해 등록할 수 있으며, 먼저 등록된 필터가 우선순위를 갖습니다.

---

## 식별자(`w`) 명명 규칙

`w`는 **나비트리에서 노드마다 반복되어 저장되는 식별자 문자열**입니다. 직렬화 용량을 최소화하기 위해 짧은 문자열을 사용하는 것이 좋습니다 (예: 공식 날개의 `b`, `hl`, `tf` 등).
공식 날개와의 충돌을 방지하기 위해 커스텀 날개는 `ex` 접두사(예: `exNote`, `exStamp`)를 사용하는 것을 권장합니다.

::: warning 식별자 변경 시 주의사항
저장된 데이터의 `w` 필드가 식별자와 직접 매핑되므로, 식별자를 변경하면 기존에 저장된 문서 데이터를 불러올 때 인식하지 못할 수 있습니다. 마이그레이션이 필요하다면 `claim` 함수에서 구 버전 식별자를 함께 처리하도록 작성하세요.
:::

---

## 다음 문서

- [인라인 마크 만들기](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [블록과 문단 속성 만들기](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [키·자동 변환·붙여넣기](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI와 상호작용](./custom/ui) — `button` · `context` · `styles`, 사용자 대화 상자 연동

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
