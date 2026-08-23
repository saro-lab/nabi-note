---
title: 소개
description: NABI NOTE는 브라우저에서 동작하는 오픈소스 WYSIWYG 에디터입니다.
---

# NABI NOTE란?

NABI NOTE는 브라우저에서 동작하는 **오픈소스 WYSIWYG 에디터**입니다.


## 나비트리

HTML을 직접 조작할 경우 DOM이 없는 서버 사이드(Node.js 등)에서 문서를 처리하기 어려운 문제가 있습니다.
NABI NOTE는 문서를 **나비트리(Nabi Tree)**라는 순수 자바스크립트 트리 객체로 관리하며, JSON 및 HTML과의 양방향 직렬화를 지원합니다.
또한 나비트리와 HTML 간 변환 과정에서 XSS를 유발할 수 있는 악성 요소가 자동으로 제거됩니다.

> NABI NOTE가 공식 지원하는 모든 기본 날개는 XSS 방지를 지원합니다. 다만 `커스텀 날개(외부 플러그인)`를 작성하거나 도입할 때는 해당 날개의 XSS 방지 처리 여부를 확인해야 합니다.

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM 없는 SSR (서버 사이드 렌더링) 지원

데이터베이스 등에 저장해 둔 나비트리를 **서버(Node.js 등)에서 그대로 읽어** 클라이언트로 전달할 HTML을 조립할 수 있습니다.
DOM API가 필요한 작업은 외부 HTML 문자열 **입력**(`setHtml()`)과 화면에 에디터를 렌더링하는 `mount*` 함수뿐입니다.

읽기 전용으로 문서를 보여주는 화면에서는 에디터를 생성할 필요 없이 단일 렌더링 함수(`renderStoredHtml`)를 호출하면 됩니다. 저장된 나비트리 데이터와 `registry`(등록된 날개 목록)를 인자로 전달받아 안전한 HTML 문자열을 반환합니다.

**서버 환경에서는 `nabi-note/ssr` 엔트리를 사용합니다** — 렌더링에 필요한 핵심 로직만 포함된 경량 진입점이므로, 편집 영역(`surface`)이나 UI 도구(`ui`) 코드가 서버 번들에 포함되지 않습니다.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// 날개 목록은 서버 구동 시 한 번만 생성하여 여러 요청에서 재사용합니다.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['댓글 한 줄'] }]   // DB에서 읽어온 나비트리
renderStoredHtml(saved, registry)
// '<p>댓글 한 줄</p>'
```

**유효한 나비트리 형식이 아니면 `null`을 반환합니다** — 검증 규칙은 `setJson()`과 동일합니다. 검증을 통과하여 반환된 값은 에디터 인스턴스에서 호출하는 `getHtml()` 결과와 **완전히 일치합니다**. 동일한 정규화 및 조립 파이프라인을 거치므로 XSS 필터링 역시 동일하게 적용됩니다.

에디터 편집 화면을 서버에서 미리 렌더링(SSR)하려면 `renderStoredEditorHtml` 함수를 사용합니다. 각 노드에 `data-key` 속성이 추가된 HTML이 생성됩니다.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">댓글 한 줄</p>'
```

동일한 저장본 데이터는 언제나 동일한 `data-key`를 생성합니다. 따라서 서버에서 렌더링한 HTML을 내려보낸 뒤 브라우저에서 `mountSurface({ nabi, registry, root, hydrate: true })`로 하이드레이션(Hydrate)하면, 화면을 다시 그리지 않고 편집기를 이어받을 수 있습니다.

**현재 사이트의 홈 데모 역시 이 방식으로 동작합니다.** 첫 화면의 문서는 서버가 미리 렌더링한 것이며, 클라이언트에서는 편집기가 그 DOM 위에서 바로 활성화됩니다.

### 패키지 진입점

| 진입점(Entry) | 포함 내용 | 사용처 |
|---|---|---|
| `nabi-note` | 에디터 전체 기능 (문서 모델, 편집 영역, 툴바 및 UI 도구) | 문서를 **작성/편집하는** 화면 |
| `nabi-note/ssr` | 나비트리를 HTML로 렌더링하는 SSR 전용 경량 모듈 | 서버 환경 또는 읽기 전용 페이지 |
| `nabi-note/viewer` | 읽기 전용 동작 (표 열 정렬, 코드 하이라이팅 등) | 발행된 HTML을 **조회하는** 화면 |

`nabi-note/ssr`은 편집 영역(`surface`)과 화면 도구(`ui`)를 **일절 참조하지 않습니다**. 아키텍처 단위 테스트를 통해 이를 엄격히 검증하므로, 서버 번들에 DOM 의존성 코드가 섞여 들어갈 위험이 없습니다.

## 모든 서식은 날개(Wing)입니다

다른 에디터에서 "플러그인"이라 부르는 단위를 NABI NOTE에서는 **날개(Wing)**라고 부릅니다.
에디터 코어는 기본 문단(`p`), 줄바꿈(`br`), 그리고 일반 텍스트만을 직접 다루며, 제목·목록·표·굵게 등 모든 서식과 확장 기능은 독립된 날개로 제공됩니다.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>굵게</b> <i>기울임</i></p>')
bare.getHtml()
// '<p>굵게 기울임</p>'                    — 등록된 날개가 없으므로 태그가 제거되고 평문으로 변환됩니다.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>굵게</b> <i>기울임</i></p>')
bold.getHtml()
// '<p><b>굵게</b> 기울임</p>'              — boldWing만 등록되었으므로 bold만 유지되고 나머지는 일반 텍스트로 변환됩니다.
```

날개로 등록하지 않은 마크업은 **자동으로 평문(Plain Text)으로 변환됩니다.** 따라서 선언되지 않은 임의의 HTML 요소는 안전하게 제외되며, 나비노트가 공식 지원하는 모든 날개는 악성 스크립트를 철저히 필터링합니다.


## 인터페이스

에디터 문서는 `applyCommand()`를 통해서만 안전하게 변경할 수 있습니다.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // 굵게(Bold) 토글
nabi.applyCommand('setHeading', { value: 2 })   // H2 제목 설정
nabi.undo()
nabi.redo()
```
커맨드는 **성공 여부를 `boolean`으로 반환합니다.** 변경 사항이 없으면 `false`를 반환하며 히스토리를 남기거나 불필요한 연산을 수행하지 않습니다.


## 코드의 층 (Layer)

아래 구조는 데이터가 실행되는 순서가 아니라, `src/` 디렉터리에 구성된 **14개의 계층(Layer)**을 나타냅니다. 핵심 원칙은 **하위 계층은 상위 계층을 참조하지 않는다**는 것입니다. 따라서 하위 계층(`schema`, `doc`, `html` 등)은 DOM에 전혀 의존하지 않으며, 서버 환경(Node.js)에서도 그대로 동작합니다.

```
src/
├── style/     코어 스타일시트 — 편집 화면과 뷰어가 함께 사용하는 CSS
├── locale/    다국어 사전
├── code/      편집 화면과 뷰어가 공유하는 순수 토크나이저
├── schema/    나비트리 구조 및 cocoon(정규화) 정의
├── doc/       노드 삽입·삭제·분할·범위 연산 — DOM 없음
├── caret/     커서 위치·선택 영역·경계 처리
├── html/      나비트리 ↔ HTML 양방향 직렬화
├── io/        입출력 처리 — 붙여넣기 후보·저장·열기·마크다운
├── editor/    커맨드 인터페이스 및 에디터 인스턴스
├── wing/      날개 유효성 검사 및 등록 관리
├── wings/     공식 날개 모음 (bold · italic … table · upload)
├── surface/   캐럿·IME·입력 이벤트를 트리에 동기화
├── ui/        툴바·컨텍스트 바·팝업 등 UI 레이어
├── viewer/    읽기 전용 뷰어 동작
├── index.ts   코어 진입점 — `nabi-note`
└── ssr.ts     SSR 전용 진입점 — `nabi-note/ssr` (surface·ui를 참조하지 않음)
```

**줄 순서가 곧 계층 순서입니다** — 알파벳순이 아니라 **하위 계층부터 상위 계층 순**으로 배치되어 있습니다. `style`이 최하위 계층이고 `viewer`가 최상위 계층입니다.

이 계층 의존성 규칙은 단순한 권고가 아니라 **단위 테스트를 통해 기계적으로 검증됩니다.** 계층 규칙을 위반하는 `import`가 발생하면 빌드 및 테스트 단계에서 즉시 실패합니다.


## 용어 정리

| 용어 | 설명 |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **마크(mark)** | 인라인 텍스트 서식 (예: `<b>`, `<i>`, `<a>` 등) |
| **블록(block)** | 블록 레벨 요소 (예: 문단, 제목, 목록, 표, 이미지 등) |
| **문단 속성(paragraph attribute)** | 문단 전체에 적용되는 속성 (예: 텍스트 정렬, 드롭캡 등) |
| **래퍼 문단** | 표, 이미지 등 단독 블록 객체를 감싸는 컨테이너 문단 |
| **클레임(claim)** | 입력된 HTML 마크업이 어느 날개(Wing)의 소유인지 판별하는 규칙 |
| **부품(parts)** | 날개 내부를 구성하는 하위 요소 (예: 표의 행/열, 접기 블록의 요약줄) |
| **IO 필터(io filter)** | 클립보드 붙여넣기(입력) 및 저장/열기(출력)를 처리하는 확장 지점. 날개 규격 외부에서 동작하므로 나비트리에 별도의 노드를 생성하지 않습니다 |

### 편집 화면 관련 용어

| 용어 | 설명 |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **캐럿(caret)** | 에디터 내부의 텍스트 커서 및 선택 영역 |
| **컨텍스트 행(context row)** | 현재 캐럿이 위치한 블록/서식 상태에 맞춰 동적으로 표시되는 보조 툴바 (예: 표의 행·열 조작, 코드 언어 선택, 링크 주소 입력, 제목 레벨 선택) |

### 코어 관련 용어

| 용어 | 설명 |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **코쿤(cocoon)** | 나비트리 정규화(Normalization) 단계입니다. **모든 커맨드 실행 직후 동작하여** 스키마 규칙을 위반한 비정상적인 트리가 생성되지 않도록 보장합니다 |
| **어태치(attach)** | 날개가 DOM을 직접 제어해야 할 때 선언하는 훅입니다 (예: 표 셀 드래그 선택, 코드 문법 하이라이팅, 체크박스 토글 등). `mountSurface` 시 등록된 날개의 훅이 함께 연결됩니다 |
| **입력 규칙(input rule)** | 텍스트 입력 시 자동으로 서식이 변환되는 단축 규칙입니다 (예: `- ` 입력 시 목록 변환, `# ` 입력 시 제목 변환) |


## 다음 문서

- [{{ t('menu_intro_usage') }}](./intro/usage) — 에디터 조립·입력·출력 전체 가이드
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — 빌드 도구 없이 `<script>` 태그 하나로 사용하기
- [{{ t('menu_wing_custom') }}](./wing/custom) — 새로운 커스텀 서식 날개 직접 만들기

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: '직접입력 · 붙여넣기 · 불러오기', kind: 'in' },
  { label: 'setHtml() · setJson()', note: '함수 입력', kind: 'gate' },
];

const hubCore = { label: '나비트리', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: '편집기용 HTML', kind: 'out' },
];

</script>
