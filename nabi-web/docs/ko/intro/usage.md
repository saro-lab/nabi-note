---
title: 기본 사용법
description: npm 패키지를 설치하여 에디터를 구성하고, 입력 및 출력 API로 문서를 제어하는 방법을 안내합니다.
---

# 기본 사용법

npm 패키지를 설치하여 사용하는 방법입니다. 빌드 도구 없이 `<script>` 태그로 사용하는 방법은
[{{ t('menu_intro_cdn') }}](./cdn) 문서를 참고하세요.

```sh
npm i nabi-note
```

---

## 에디터 구성 및 마운트

HTML 컨테이너 요소를 준비하고 필요한 마운트(`mount*`) 함수를 호출하여 에디터 UI를 구성합니다. 아래는 최소 구성 예시이며, 각 서식 날개(Wing) 문서에 소개되는 예제들도 이 기본 구조에 날개를 추가한 형태입니다.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록을 전달하여 커맨드와 변환 규칙이 포함된 registry와 에디터 인스턴스(nabi)를 생성합니다.
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'ko' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'ko' })
mountSticky({ root: app, surface })

// 문서 내용이 변경될 때마다 콜백 실행
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

호스트 애플리케이션은 바깥 DOM 구조만 준비하면 됩니다. 각 UI의 내부 구조는 코어가 자동으로 렌더링하며, 마운트 함수가 컨테이너 요소에 `.nabi-toolbar-row`, `.nabi-context`, `.nabi-editing` 등의 클래스를 부착합니다. 따라서 복잡한 내부 레이아웃을 직접 작성할 필요가 없습니다.

- **`class="nabi"`** — 색상 테마 토큰과 스타일이 적용되는 최상위 루트 컨테이너입니다. 전체화면 모드 시 고정되는 기준 요소이기도 하므로, 툴바와 편집 영역이 **함께** 이 안에 포함되어야 합니다.
- **`class="nabi-toolbar"`** — 메인 툴바 줄과 컨텍스트 툴바 줄을 묶어 **상단에 고정(Sticky)**되도록 합니다. 두 요소가 별도로 고정되면 컨텍스트 툴바가 나타날 때 편집 영역이 밀리는 현상이 발생할 수 있습니다.
- **`class="nabi-content" contenteditable`** — 실제 문서가 작성되는 편집 영역(Surface) 요소입니다.

페이지 상단에 고정 헤더(GNB 등)가 있다면 `--nabi-sticky-top` CSS 변수로 상단 여백을 지정하고, `mountSticky()`를 연결하면 모바일 가상 키보드 및 스크롤에 맞춰 툴바 위치가 자동으로 보정됩니다.

**스타일시트는 호스트 애플리케이션에서 직접 연결합니다.** 번들러 환경에서는 `import 'nabi-note/nabi.css'`를 사용하고, 등록된 날개의 스타일만 동적으로 주입하려면 `injectSheets(document, collectSheets(registry))`를 호출합니다.
**서버에서 문서를 미리 렌더링(SSR)하는 페이지는 CSS 파일 링크를 정적으로 포함하세요.** 스크립트를 통한 런타임 스타일 주입은 JS 로드 후에 적용되므로, 그 사이에 스타일이 없는 순수 HTML이 순간적으로 노출될 수 있습니다.

**설정된 언어(Locale)는 텍스트 방향(RTL/LTR)도 함께 결정합니다.** 아랍어(`ar`)나 우르두어(`ur`)를 지정하면 마운트 루트에 `dir="rtl"` 속성이 자동으로 적용되어 우측에서 좌측으로 표시됩니다. 페이지의 `<html dir>` 속성과 무관하게 독립적으로 적용됩니다.
`locale`을 **지정하지 않으면 기본 방향을 유지합니다.** 호스트가 직접 설정한 방향을 덮어쓰지 않습니다. 언어별 텍스트 방향은 `localeDirection(code)` 함수로 확인할 수 있습니다.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // 편집 영역이 RTL로 동작
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // 툴바도 RTL에 맞춰 반전
```

표시 언어는 각 마운트 함수의 `locale` 옵션으로 설정합니다. 문서의 본문은 유지되며 툴바 및 컨텍스트 바의 버튼 이름과 툴팁이 해당 언어로 변경됩니다.
**호스트는 로케일을 한 번만 선언하여 공유하면 됩니다.** 위 예제처럼 공통 객체(`shared`)에 담아 마운트 함수들에 전달하면, 툴바가 마운트되면서 코어에도 로케일이 연결됩니다(`nabi.$bindLocale`). 따라서 코어 알림(Toast 등)도 동일한 언어로 출력됩니다. 툴바 없이 사용할 때는 `createNabiWith`의 `locale` 옵션으로 지정합니다. 언어 선택 UI를 구현할 때는 패키지에서 제공하는 `LOCALES`(지원 언어 코드 목록)를 사용할 수 있습니다.

### 플레이스홀더 (Placeholder)

내용이 비어 있는 편집기에는 첫 줄에 플레이스홀더 안내 문구가 연하게 표시됩니다. 글자를 한 글자라도 입력하면 즉시 사라지고, 내용을 모두 지우면 다시 나타납니다. **별도 설정 없이도 기본 문구가 표시됩니다.** 문구는 코어 다국어 사전을 참조하므로 마운트 시 설정된 언어를 따릅니다. 표시 위치는 **텍스트 방향**을 기준으로 정해지며, 첫 줄 문단이 가운데나 오른쪽 정렬이어도 플레이스홀더 위치는 바뀌지 않습니다.

```ts
mountSurface({ nabi, registry, root: surface, placeholder: '여기에 내용을 입력하세요' })
mountSurface({ nabi, registry, root: surface, placeholder: '첫 줄 안내\n둘째 줄 안내' })   // 여러 줄
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // 안내 문구 숨기기
```

줄바꿈(`\n`)을 포함하면 여러 줄 플레이스홀더로 표시됩니다. 플레이스홀더는 커서 위치에 영향을 주지 않도록 문서 흐름(Document Flow) 밖에 렌더링됩니다. 따라서 편집 영역 높이가 플레이스홀더보다 낮으면 텍스트가 아래로 넘칠 수 있습니다.

빈 편집 영역에는 기본적으로 `12.5rem`의 최소 높이가 설정되어 있어 일반적인 경우에는 문제없습니다. 더 큰 높이가 필요하다면 `--nabi-content-min-height` CSS 변수로 조절할 수 있습니다. 이 변수는 **편집 영역(`.nabi-editing`)에만** 적용되며, 발행/미리보기 화면에서는 실제 본문 길이에 맞춰 높이가 결정됩니다.

**플레이스홀더는 독립된 레이어로 렌더링됩니다.** 편집 영역 루트의 `::before` 가상 요소로 렌더링되므로, 첫 줄 문단이 제목, 가운데 정렬, 드롭캡이어도 **문서 서식의 영향을 받지 않고** 일관된 위치를 유지합니다.

문구는 편집 영역 루트의 `--nabi-placeholder` 변수로 전달되며, 시트에서 이를 렌더링합니다. 색상이나 스타일을 변경하려면 아래 CSS 선택자를 재정의할 수 있습니다.

```css
.nabi-content.nabi-editing:has(> :is(p, h1, h2, h3, h4, h5, h6):only-child > br:only-child)::before {
  color: #999;
}
```

색상만 변경할 때는 복잡한 선택자 대신 `--nabi-placeholder-color` CSS 변수를 재정의하는 것만으로 충분합니다.

| 마운트 함수 | 필수 여부 | 설명 |
|---|---|---|
| `createNabiWith(wings, options?)` | 필수 | `{ nabi, registry }` 객체를 생성합니다. DOM API가 필요 없으며, Wing 배열 또는 날개 빌더(`wings()`, [{{ t('menu_intro_cdn') }}](./cdn#날개-고르기) 참고)를 인자로 전달받습니다 |
| `mountSurface({ nabi, registry, root })` | 필수 | 텍스트 입력, IME 조합, 커서(캐럿) 이동 이벤트를 나비트리와 동기화하고 등록된 날개의 `attach` 훅을 실행합니다 |
| `mountToolbar({ nabi, registry, root, surface?, locale?, file? })` | 선택 | 상단 메인 툴바를 렌더링합니다. `file` 옵션에 `mountFile()`의 반환 객체를 전달하면 **저장 팝업과 <kbd>⌘</kbd><kbd>S</kbd> 단축키가 자동으로 연결**됩니다. 전달하지 않으면 `onHost('save')` 이벤트로 호스트에 전달됩니다. `surface` 옵션을 전달하면 단축키의 동작 범위가 해당 에디터 영역으로 제한됩니다 (아래 [단축키 동작 범위](#단축키-동작-범위) 참고) |
| `mountContextToolbar({ nabi, registry, root, surface? })` | 선택 | 커서 위치에 따른 동적 컨텍스트 툴바(표 행/열, 코드 언어, 링크 주소 입력 등)를 렌더링합니다 |
| `mountHints({ toolbar, context?, root, surface? })` | 선택 | Shift 키를 두 번 연속 눌렀을 때 표시되는 단축키 안내 힌트 배지 UI입니다 |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | 선택 | 미리보기 및 전체화면 버튼을 렌더링합니다. `root`는 전체화면 대상인 `.nabi` 컨테이너이며, `onBody`는 미리보기 본문에 뷰어 런타임을 바인딩하는 콜백입니다 |
| `mountSticky({ root, surface, chrome?, nabi? })` | 선택 | 모바일 키보드 표시 및 스크롤 시 툴바 위치를 고정하고 커서를 가리지 않도록 뷰포트를 보정합니다. `nabi`를 전달하면 **텍스트 입력 시 커서가 툴바 아래로 가려지지 않도록 자동 스크롤**됩니다 (아래 [모바일 키보드와 툴바 고정](#모바일-키보드와-툴바-고정) 참고) |
| `mountPickedMark({ nabi, surface })` | 선택 | 이미지나 동영상 등 블록 객체가 선택되었을 때의 시각적 하이라이트 UI를 표시합니다 |
| `mountFile({ nabi, store, registry, parse?, name? })` | 파일 기능 사용 시 | `.nabi`·`.nhtml`·`.md` **3가지 형식으로 저장**하고, 외부 `.html`을 포함한 **4가지 형식을 엽니다**. **`registry` 옵션이 필수**입니다. `parse`는 HTML 파싱 어댑터이며 브라우저 환경에서는 기본값(`parseNodes`)이 적용됩니다. 반환되는 `FileMount` 인스턴스를 통해 프로그래밍 방식으로 저장 및 열기(`file.save()`, `file.saveAs()`, `file.formats()`, `await file.open()`)를 제어할 수 있습니다 |
| `mountLocalHistory({ nabi, storage })` | 로컬 기록 사용 시 | 로컬 스토리지에 주기적으로 문서를 자동 저장하고 복원 기능을 제공합니다. `storage`가 `null`인 제한된 환경(`file://` 등)에서도 에러 없이 안전하게 안내 토스트를 표시합니다 |
| `mountUpload({ … })` + `mountUploadView({ … })` | 업로드 기능 사용 시 | 드래그 앤 드롭, 붙여넣기, 파일 선택을 통한 업로드 진행 상태 및 진행률 UI를 처리합니다 |

**이미지 리사이즈, 체크박스 토글, 표 셀 드래그 선택, 코드 문법 강조 등은 별도의 mount 함수가 필요하지 않습니다.** 각 서식 날개가 `attach` 훅으로 제공하며 `mountSurface`가 초기화 시 자동으로 연결합니다. 코드 문법 강조는 외부 하이라이터를 연결할 때만 훅을 주입하면 됩니다 (`makeCodeAttach`, [{{ t('menu_block_code') }}](../wing/block/code) 참고).

### 단축키 동작 범위

<kbd>⌘</kbd><kbd>S</kbd> 같은 단축키 이벤트는 툴바에서 감지합니다. 키 이벤트의 수신 범위를 한정하려면 `mountToolbar({ surface })` 옵션을 전달합니다. **지정된 편집 영역(Surface)과 툴바 영역 내부에서 발생한 키 이벤트만** 해당 에디터의 동작으로 처리됩니다.

- **한 페이지에 여러 에디터를 배치할 때는 `surface` 옵션을 반드시 전달하세요.** 지정하지 않으면 문서 전체(Document)의 키 이벤트를 감지하여, 다른 에디터나 일반 텍스트 폼에서 입력한 단축키가 엉뚱한 에디터에서 실행될 수 있습니다.
- **날개가 등록되지 않으면 해당 단축키도 동작하지 않습니다.** 파일 저장/열기 기능 자체는 `mountFile`에 있지만, 툴바 버튼과 단축키는 `save`, `open` 날개가 제공합니다. 따라서 `wings().allBasic()`으로 구성한 에디터에서는 <kbd>⌘</kbd><kbd>S</kbd>·<kbd>⌘</kbd><kbd>O</kbd> 단축키가 비활성화됩니다. 사용하려면 `.use('save').use('open')`을 추가해야 합니다.
- **연결된 핸들러가 없으면 키 이벤트를 가로채지 않습니다.** 저장 버튼에 `file`이나 `onHost` 핸들러가 연결되지 않은 상태라면, 브라우저 기본 동작을 차단하지 않고 그대로 통과시킵니다. 처리되지 않는 단축키를 무작정 차단하여 사용자가 브라우저 오동작으로 오인하는 것을 방지합니다.

툴바 단추 없이 프로그래밍 방식으로 저장/열기를 호출할 때는 `mountFile`이 반환하는 핸들러(`file.save()`, `file.open()`)를 직접 실행할 수 있습니다.

### 모바일 키보드와 툴바 고정

`mountSticky`는 모바일 환경에서 가상 키보드가 열리고 닫힐 때 커서(캐럿)가 **툴바 아래와 키보드 사이**에 항상 노출되도록 뷰포트를 보정합니다. 동작 규칙은 다음과 같습니다.

- **에디터에 포커스가 있을 때만 동작합니다.** 포커스가 없을 때는 뷰포트를 이동시키지 않으므로, 외부 스크립트가 `setHtml()` 등으로 값을 업데이트하는 동안 화면이 튀는 현상을 방지합니다.
- **사용자가 터치 스크롤 중일 때는 뷰포트를 강제로 이동하지 않습니다.** 스크롤 동작 후 250ms 동안 위치 조정을 일시 대기하여 터치 조작 시 화면 떨림을 방지합니다.
- **가상 키보드 수준의 높이 변화에만 반응합니다.** 브라우저 주소창 축소/확대와 같은 수십 픽셀 수준의 미세 변화에는 반응하지 않고, `max(120px, 화면 높이의 15%)` 이상의 큰 변화에만 동작합니다.

텍스트 입력 시에는 화면이 급격하게 튀지 않도록 **가려진 영역만큼만 최소한으로** 스크롤을 보정합니다. 반면 키보드가 처음 올라오는 순간에는 **툴바가 화면 최상단에 안정적으로 밀착되도록** 위치를 정렬합니다.

`--nabi-bar-height` CSS 변수는 이 위치 계산에 사용됩니다. `mountSticky`가 툴바의 **실제 측정 높이**를 `.nabi` 루트 요소에 기록하고, 내부 시트의 `.nabi-content > *` 요소가 이 값을 `scroll-margin-block-start`에 반영합니다. 호스트가 직접 수정할 필요는 없으며, 툴바 높이에 맞춰 커서가 툴바 밑으로 가려지지 않도록 보장하는 내부 변수입니다.

::: warning 뷰포트 메타 태그로 확대를 강제 차단하지 마세요
iOS 사파리는 폰트 크기가 16px 미만인 입력 요소에 포커스될 때 페이지 전체를 강제로 확대합니다. NABI NOTE는 이를 방지하기 위해 `--nabi-touch-font-size`(기본값 `16px`)를 통해 **모바일 입력 폰트 크기를 16px 이상으로 유지**합니다.
`user-scalable=no`나 `maximum-scale=1` 같은 메타 태그로 확대 자체를 차단하는 방식은 접근성(사용자의 확대 권리)을 저해하므로 권장하지 않습니다. 호스트 페이지에 해당 메타 태그를 적용하면 코어의 폰트 보정 메커니즘이 불필요해집니다.
:::

### 미리보기에 뷰어 런타임 연결하기

미리보기 화면은 `getHtml()`로 추출한 정적 HTML을 렌더링하므로, 표 정렬이나 코드 문법 강조처럼 **클라이언트 자바스크립트로 동작하는 뷰어 기능**이 자동으로 활성화되지 않습니다.
`nabi-note/viewer`의 `attachViewer` 함수를 `mountViewTools`의 `onBody` 콜백에 전달하면 미리보기 본문에 동일한 뷰어 동작을 적용할 수 있습니다.

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'ko',
  onBody: (body) => attachViewer(body, { locale: 'ko' }),
})
```

`onBody` 콜백은 미리보기 본문 DOM이 생성될 때 실행되며, 반환된 정리(cleanup) 함수는 미리보기 창이 닫힐 때 자동으로 호출됩니다.
실제 서비스에서 발행된 페이지에도 **동일한 함수**(`attachViewer`)를 연결합니다. 미리보기와 실제 배포 페이지의 렌더링 결과를 완벽히 일치시키기 위함입니다. 자세한 내용은 [{{ t('menu_intro_cdn') }} ▸ 읽기 전용 뷰어](./cdn#읽기-전용-뷰어-viewer) 문서를 참고하세요.

코드 문법 강조의 경우 내장 경량 토크나이저가 기본 제공됩니다(외부 의존성 없음). Shiki 등 외부 하이라이터를 사용하는 경우 `attachViewer(body, { locale, highlight })`로 동일한 하이라이터 함수를 전달하면 편집 화면과 뷰어 화면의 하이라이팅 스타일을 일치시킬 수 있습니다.

등록된 날개를 변경하려면 기존 인스턴스 및 UI를 해제(`unmount()`)하고 새로 초기화합니다. 제거된 날개가 담당하던 마크업은 즉시 안전한 평문으로 변환됩니다. 현재 사이트의 데모 페이지 역시 이 방식으로 동작하여, 날개 토글 시 에디터 인스턴스가 동적으로 재구성됩니다.

색상 및 테마 관련 CSS 변수 설정은 [{{ t('menu_style_custom') }}](../style/custom) 문서를 참고하세요.

---

## 문서를 내보내는 3가지 함수

```ts
nabi.getHtml()        // 저장 및 배포용 HTML 문자열 반환
nabi.getJson()        // 나비트리 (JSON) 데이터 반환
nabi.getEditorHtml()  // 현재 편집기 DOM 상태의 HTML 반환 (data-key 속성 포함)
```

**데이터베이스 등에 저장할 때는 `getHtml()` 또는 `getJson()`을 사용합니다.** `getEditorHtml()`은 편집기 내부 상태 추적용 속성(`data-key`)이 포함되어 있으므로 일반 저장용이 아니며, 서버 사이드 렌더링(SSR)으로 편집기 초기 화면을 렌더링할 때 사용됩니다.

내보내진 JSON(나비트리)의 구조는 다음과 같습니다. **문서는 블록 객체들의 배열**로 구성되며, 불필요한 루트 래퍼 노드가 없습니다.

```json
[
  {"w":"p","a":{"h":2},"ch":["제목"]},
  {"w":"p","ch":["글 ",{"w":"b","ch":["굵게"]}," 와 ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["링크"]}]},
  {"w":"p","a":{"a":"c"},"ch":["가운데"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["하나"]}]},
    {"w":"li","ch":[{"w":"p","ch":["둘"]}]}]}]}
]
```

나비트리의 데이터 구조 규칙:

- **`w`는 해당 노드를 담당하는 날개의 식별자(id)입니다.** 예약어는 `p`(문단)와 `br`(줄바꿈) 둘뿐이며, 나머지는 모두 등록된 날개의 id(`b`, `ul`, `li` 등)입니다. 제목은 별도 노드가 아니라 **문단의 속성**으로 표현됩니다(`{"w":"p","a":{"h":2}}`).
- **배열 내 요소가 문자열이면 텍스트 노드, 객체면 날개 노드입니다.** 노드 타입을 구분하기 위한 별도의 필드가 필요하지 않습니다.
- **`a`는 해당 날개가 저장하는 속성(Attributes) 객체입니다.** 링크 URL, 형광펜 색상, 제목 레벨 등이 저장되며, 속성이 없으면 필드 자체가 생략됩니다. 문단 정렬 속성 역시 `a` 객체 내부에 저장됩니다 (`{"w":"p","a":{"a":"c"}}` — 가운데 정렬 문단).
- **표, 목록, 이미지 등 독립 블록 객체는 문단 노드가 한 겹 감쌉니다** (위 예시의 `ul` 참고). 이 컨테이너 문단이 정렬 속성을 가질 수 있으며, 객체 앞뒤로 커서가 위치할 수 있는 공간을 제공합니다. HTML 변환 시에는 `<div data-nabi-p>`로 출력됩니다 (`<p>` 태그는 HTML 표준상 내부에 표나 목록을 포함할 수 없기 때문입니다).

에디터 내부에서 실행 중인 트리에는 노드마다 커서 위치 추적용 내부 식별자(`_id`)가 포함되지만, `getJson()`으로 내보낼 때는 자동으로 제거되어 데이터 크기가 최적화됩니다 (위 예시 기준 약 30% 용량 감소). 추출된 JSON은 `setJson()`을 통해 그대로 다시 로드할 수 있습니다.

---

## 문서를 입력하는 4가지 방법

```ts
createNabiWith(wings, { doc })   // 기존 나비트리 데이터로 초기화
nabi.setJson(json)               // 나비트리(JSON) 데이터로 문서 전체 교체
nabi.setHtml(html)               // HTML 문자열로 문서 전체 교체
nabi.applyCommand('setHeading', { value: 2 })  // 편집 커맨드 실행
```

위 4가지 메서드는 모두 **실행 성공 여부를 `boolean`으로 반환합니다.** 에러를 던지지 않으며, 실패 시 기존 문서를 손상시키지 않고 유지합니다.
경미하게 어긋난 마크업은 거절하는 대신 **파싱 과정에서 안전하게 보정**합니다. 비어 있는 표 셀, 부적절한 표 자식 요소, 범위를 벗어난 병합 구조 등이 자동으로 정규화되며, XSS 공격 위험이 있는 악성 스크립트와 URL도 이 과정에서 필터링됩니다. 완전히 파싱할 수 없는 비정상 데이터의 경우에만 작업을 거절(`false`)하고 `console.error`로 에러 원인을 기록하여 에디터가 예기치 않게 중단되는 것을 방지합니다.

| `false`를 반환하는 경우 | 설명 |
|---|---|
| `setJson` | 유효한 나비트리 구조가 아닌 경우 (빈 값 제외) |
| `setHtml` | `parseHtml` 어댑터가 설정되지 않았거나 편집이 잠겨 있는 경우 (빈 값 제외) |
| `applyCommand` | 존재하지 않는 커맨드이거나, **문서에 아무런 변경이 발생하지 않는 경우** |

**빈 문서의 표준 구조는 `[{"w":"p","ch":[]}]`입니다.** 전체 선택 후 삭제 등으로 본문을 완전히 비웠을 때는 첫 블록의 제목이나 정렬 속성이 초기화됩니다. 반면 여러 줄 중 특정 줄만 비웠을 때는 해당 줄을 이어서 작성할 수 있도록 문단 속성이 유지됩니다.

**빈 값(`null`, `undefined`, 빈 문자열, 공백 문자열, 빈 배열)은 에러가 아니라 빈 문서로 정상 처리됩니다.** `setJson`과 `setHtml` 모두 `true`를 반환하며 문서를 안전하게 비웁니다. 빈 값 처리 시에는 파싱할 내용이 없으므로 `setHtml`에 파서 어댑터가 등록되어 있지 않아도 정상 동작합니다.

**문서에 변경이 없는 커맨드 호출은 상태를 변경하지 않습니다.** 이미 H2 제목인 문단에 다시 `setHeading(2)`를 호출하면 `false`를 반환하며 불필요한 실행 취소(Undo) 히스토리를 남기지 않습니다.

`applyCommand(name, args?, by?)`의 3번째 인자인 `by`는 **커맨드 호출 주체**를 지정합니다 (`'keyboard' | 'pointer'`, 기본값 `'keyboard'`). 커서 선택 영역이 없을 때 인라인 마크 커맨드를 실행하면, 키보드 호출에서는 다음 입력될 텍스트에 적용되도록 스타일이 예약됩니다. 포인터(마우스 클릭) 호출에서는 예약하지 않고 `false`를 반환하며 "적용할 대상이 없습니다"라는 안내 토스트를 표시합니다. 커스텀 UI에서 마우스 클릭으로 커맨드를 호출할 때는 `'pointer'`를 명시하는 것이 좋습니다.

### `setHtml` 사용 시 파서 어댑터 설정

외부 HTML 문자열을 파싱하려면 브라우저의 `DOMParser`를 활용해야 합니다. 에디터 코어 자체는 DOM에 의존하지 않으므로, HTML 입력을 사용할 때는 초기화 시 `parseNodes` 어댑터를 전달합니다.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson`은 DOM 파서가 필요하지 않으므로 **서버 환경(Node.js 등)에서도 완벽하게 동작합니다.** `getHtml()` 역시 순수 자바스크립트로 HTML을 조립하므로, 서버에서 나비트리 JSON을 읽어 완성된 HTML 문자열을 렌더링하는 파이프라인을 간편하게 구축할 수 있습니다.

---

## 클립보드 붙여넣기와 파일 저장·열기

**클립보드 붙여넣기는 다양한 형식을 감지합니다.** `HTML`, `MARKDOWN`, `TEXT`, 그리고 NABI 전용 형식(`NABI`)을 지원합니다. 클립보드에 인식 가능한 형식이 둘 이상 존재하면 선택 팝업이 표시되어 원하는 형식을 선택할 수 있으며, 형식이 하나뿐이면 팝업 없이 즉시 붙여넣어집니다. 텍스트 없이 파일만 포함된 붙여넣기는 [{{ t('menu_etc_upload') }}](../wing/etc/upload) 파이프라인으로 연결됩니다.

**저장 형식은 3가지를 지원합니다.**
- `.nabi`: 나비트리 원본 데이터 (완전한 무손실 저장)
- `.nhtml`: 단독 실행 및 열람이 가능한 독립형 HTML 파일
- `.md`: 마크다운 파일 (마크다운 표준에 없는 서식은 HTML 태그로 포함되어 저장됩니다)

**열기 형식은 위 3가지에 일반 `.html`을 포함한 4가지를 지원합니다.** 파일 열기/저장 기능을 활성화하려면 `mountFile()`을 연결해야 하며, 새로운 파일 형식을 추가하는 방법은 [{{ t('menu_wing_custom') }}](../wing/custom#io-필터-끼우기) 문서를 참고하세요.

---

## 토스트 (Toast) 알림

업로드 진행 상태, 로컬 저장 복원 안내, 오류 메시지 등은 **통합 토스트(Toast) 시스템**을 통해 출력됩니다. 기본 UI 컨테이너가 코어에 내장되어 있어 별도 설정 없이도 툴바 하단에 고정된 위치로 깔끔하게 표시됩니다.

- 3단계 심각도를 지원합니다: `'info' | 'warn' | 'error'`.
- 기본적으로 1초 동안 표시된 후 부드럽게 사라지며(마지막 0.5초 페이드아웃), 클릭하면 즉시 닫힙니다. 동시에 최대 3개까지 표시되며, 초과 시 가장 오래된 알림부터 순차적으로 닫힙니다.
- 메시지에 줄바꿈(`\n`)을 포함할 수 있으며, 라이트 및 다크 테마에 자동으로 맞춰 렌더링됩니다.

토스트 동작 옵션을 변경하거나 호스트의 자체 알림 컴포넌트로 대체하려면 `createNabiWith` 옵션에서 설정할 수 있습니다.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // 표시 시간 (기본값: 1000ms)
  toastMax: 5,     // 동시 표시 최대 개수 (기본값: 3)
  // 커스텀 알림 UI를 사용할 경우 콜백 연결 (코어 기본 토스트 UI는 렌더링되지 않음)
  // toast: (level, message, ms) => myCustomToast(level, message),
})
```

커스텀 날개에서도 `nabi.$toast(level, message, ms?)` 메서드를 통해 동일한 토스트 알림을 호출할 수 있습니다.

---

## 사용자 대화 상자 연동 (`ask`)

파일 열기 전 "작성 중인 내용이 있습니다. 계속 진행하시겠습니까?"와 같은 확인 창이 필요할 때 호스트의 대화 상자 함수를 연결합니다.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| 인터페이스 | 시그니처 | 설명 |
|---|---|---|
| `message` | `(text: string) => void` | 단순 알림 대화 상자 (확인 버튼만 제공) |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` | 확인/취소 선택 대화 상자 (동기 및 비동기 Promise 모두 지원) |
| `choose` | `(question: string, options: ChooseOption[]) => number \| Promise<number>` | 다중 선택 대화 상자. 선택된 항목의 인덱스를 반환하며, `-1`은 취소를 의미합니다. `ChooseOption`은 `{ label, icon? }` 구조입니다 |

**코어는 브라우저 기본 대화 상자(`window.confirm` 등)를 임의로 호출하지 않습니다.** 자체 모달 UI를 사용하는 웹앱에 브라우저 기본 팝업이 뜨는 것을 방지하고, VS Code나 IntelliJ 플러그인처럼 `window.confirm`이 없는 환경을 지원하기 위함입니다.

**설정된 항목만 재정의됩니다.** `message`나 `confirm` 중 필요한 것만 선택적으로 전달할 수 있습니다. `message`를 설정하지 않으면 코어의 토스트(info)로 표시되고, `confirm`을 설정하지 않으면 안전을 위해 기본값으로 `false`(취소)가 반환됩니다.

**`choose`는 일반적으로 직접 구현할 필요가 없습니다.** 붙여넣기 형식 선택 등의 팝업은 `mountToolbar`가 마운트될 때 코어의 전용 UI에 자동으로 연결됩니다. 커스텀 모달 UI로 완전히 대체하고자 할 때만 `ask.choose`를 전달하세요.

::: warning confirm 핸들러가 없으면 기본값은 false(취소)입니다
사용자 확인을 받지 못한 요청은 안전을 위해 승인되지 않습니다. 작성 중인 문서를 덮어쓸 위험이 있는 작업에서 확인 절차 없이 문서가 삭제되는 상황을 막기 위한 동작입니다. 서버 환경(Node.js)에서도 에러 없이 안전하게 `false`로 처리됩니다.
:::

`ask` 설정은 에디터 인스턴스별로 독립적으로 관리되므로, 한 페이지에 여러 에디터가 존재해도 각각 다른 대화 상자를 연결할 수 있습니다. 커스텀 날개에서도 `nabi.$ask`를 통해 동일한 대화 상자를 호출할 수 있습니다.

---

## 세션 식별자와 문서 변경 감지 (`isChanged`)

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <타임스탬프>-<난수>, 인스턴스 고유 식별자
nabi.isChanged() // 마지막 저장 기준점 이후 문서가 수정되었는지 여부 반환
```

`sessionId`는 에디터 인스턴스 생성 시 고유하게 발급되는 불변 식별자입니다. 생성 시각 타임스탬프와 난수(nonce)로 구성되어 자동 저장 키, 로깅, 임시 초안 관리에 유용하게 활용할 수 있습니다.

`isChanged()`의 **저장 기준선(Baseline)을 갱신하는 시점은 3가지**입니다.
- 초기 문서 로드 시 (`createNabiWith({ doc })`, `setJson()`, `setHtml()`)
- 저장 완료를 명시적으로 통보할 때 (`nabi.$markSaved(savedDoc)`)

```ts
nabi.$markSaved(savedDoc)   // 저장 완료 시 — 당시 저장했던 문서 트리 객체를 전달
```

**반드시 저장 시점의 트리 객체를 전달해야 합니다.** 비동기 저장 요청이 진행되는 동안 사용자가 추가로 입력한 내용은 "새로 변경된 상태"로 유지되어야 하기 때문입니다. 공식 저장 날개(`save`)는 파일 저장이 완료된 후 자동으로 이를 호출하므로, `.nabi` 형식으로 저장하면 `isChanged()`가 `false`로 재설정됩니다.

::: warning 저장 기준선을 갱신하는 것은 .nabi 원본 저장뿐입니다
`.nhtml`이나 `.md`로 내보낸 파일은 **변환된 사본**이므로 에디터의 저장 기준선을 이동시키지 않습니다. 따라서 사본을 내보낸 후에도 `isChanged()`는 `true`로 유지되어, 페이지를 닫을 때 작성 중인 원본이 유실되는 것을 방지합니다.
:::

**실행 취소(Undo)를 통해 저장 당시의 원래 상태로 되돌아가면 `isChanged()`는 다시 `false`가 됩니다.** 나비트리는 불변(Immutable) 구조를 유지하므로, 복잡한 문자열 해싱 연산 없이도 즉시 변경 여부를 정확하게 감지합니다.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## 다음 문서

- [{{ t('menu_intro_ssr') }}](./ssr) — 서버에서 문서를 렌더링하고 클라이언트에서 hydrate로 연결하기
- [{{ t('menu_intro_cdn') }}](./cdn) — 빌드 도구 없이 `<script>` 태그 하나로 사용하기
- [{{ t('menu_wing_custom') }}](../wing/custom) — 새로운 커스텀 서식 날개 직접 만들기

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
