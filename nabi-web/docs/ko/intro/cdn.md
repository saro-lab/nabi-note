---
title: CDN 사용법
description: 빌드 도구 없이 HTML 태그만으로 NABI NOTE를 사용하는 방법을 안내합니다.
---

# CDN 사용법

<CdnDemo />

---

## 기본 구성 및 동작 원리

위 데모 예제는 별도의 번들러나 빌드 도구 없이 HTML 파일 하나만으로 동작합니다.

### HTML 태그 2줄로 연동

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

패키지가 내보내는 모든 모듈은 전역 객체 `NabiNote`(또는 축약형 `N`)에 연결됩니다. **CSS 스타일시트는 반드시 직접 연결해야 합니다.** 자바스크립트 마운트 함수가 CSS를 자동으로 주입하지 않으므로, `<link>` 태그를 누락하면 스타일이 적용되지 않은 상태로 표시됩니다.

### HTML 구조

```html
<div id="app" class="nabi">                    <!-- 색상 테마, 모서리, 글꼴 기준 루트 -->
  <div id="chrome" class="nabi-toolbar">        <!-- 툴바와 컨텍스트 바를 감싸는 고정 헤더 -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- 미리보기 및 전체화면 버튼 (우측 정렬) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- 커서 위치에 따라 동적으로 나타나는 컨텍스트 바 -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

각 요소의 `id`는 자유롭게 지정할 수 있습니다. 마운트 함수에는 문자열 id가 아니라 실제 DOM 엘리먼트 객체를 전달합니다.
클래스 4가지(`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`)는 스타일시트가 참조하는 필수 클래스이므로 그대로 유지합니다. 미리보기 및 전체화면 기능이 필요 없다면 `<span id="tools">` 요소와 `mountViewTools` 호출부를 생략할 수 있습니다. `mountViewTools`는 전달받은 컨테이너 안에 전용 버튼 영역을 자동으로 구성합니다.

### 날개(Wing) 구성

날개 구성은 빌더 체이닝 방식으로 간편하게 작성할 수 있습니다. 위 예제는 호스트 연동 없이 동작하는 26개 기본 날개에서 시작하여 저장·열기 기능을 추가하고, 서체 선택지를 2가지로 설정한 예시입니다.

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()`은 공식 날개 전체를 활성화합니다. 호출하지 않으면 기본 날개가 포함되지 않으며, `use()`로 명시한 날개만 등록됩니다.
- `allBasic()`은 공식 날개 중 **호스트 애플리케이션의 추가 연동 없이 동작하는 26가지 날개**를 선택합니다. 업로드, 저장, 열기 3가지는 서버 엔드포인트나 파일 저장소처럼 호스트가 제공해야 하는 설정이 있으므로 기본 세트에서 제외됩니다. 위 예제에서 저장·열기를 `use()`로 추가 선언한 이유가 이것입니다.
- `use('이름', 옵션?)`은 특정 날개를 추가합니다. 이미 등록된 날개에 호출하면 옵션만 업데이트합니다 (예: `use('tf', { values: [...] })`). 특정 날개가 의존하는 다른 날개가 있다면(예: 업로드 날개는 이미지 또는 링크 날개가 필요함) 자동으로 함께 등록합니다.
- `drop('이름')`은 등록된 날개 목록에서 특정 날개를 제거합니다. 다른 날개가 의존하고 있는 날개를 제거하려고 하면 예외를 발생시키며 함께 제거해야 할 연관 날개를 안내합니다.
- 날개 이름은 나비트리에 저장되는 짧은 고유 키(`w`)입니다 (예: `b`(굵게), `tf`(서체), `upload` 등). 전체 목록은 `console.log(N.wingNames())`로 확인할 수 있습니다.
- **잘못된 이름이나 옵션을 전달하면 즉시 에러가 발생합니다.** 오타, 지원하지 않는 옵션 키, 유효 범위를 벗어난 값 등이 전달되면 에러 메시지를 통해 올바른 수정 방법을 안내합니다.

`createNabiWith`는 빌더 인스턴스를 직접 인자로 받을 수 있으므로 별도로 `build()`를 호출하지 않아도 됩니다. 날개를 직접 배열 형태로 전달할 수도 있습니다.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

직접 제작한 커스텀 날개는 객체 형태로 전달합니다 (`N.wings().all().use(customWing)`). 커스텀 날개의 `w` 식별자는 공식 날개 식별자와 충돌을 방지하기 위해 `ex` 접두사로 시작하는 것이 권장됩니다 (`exNote` 등). 자세한 작성 방법은 [{{ t('menu_wing_custom') }}](../wing/custom) 문서를 참고하세요.

각 날개의 상세 명세는 [{{ t('menu_wing') }}](../wing/inline/bold) 메뉴에서 확인할 수 있습니다.

### 대화 상자 및 알림 연동

위 예제는 `ask` 옵션을 통해 브라우저의 기본 `alert`와 `confirm`을 연결했습니다. 예를 들어 "작성 중인 내용이 있습니다. 계속 진행하시겠습니까?" 같은 확인 메시지를 브라우저 팝업으로 표시할 수 있습니다.

`ask`를 전달하지 않으면 확인 창의 기본 응답은 취소(`false`)로 처리되며, 단순 안내 메시지는 코어에 내장된 토스트(Toast) UI가 툴바 하단에 자동으로 표시됩니다. 자세한 내용은 [{{ t('menu_intro_usage') }}](./usage) 문서를 참고하세요.

`ask`에는 여러 옵션 중 하나를 선택하는 `choose` 처리 함수도 포함됩니다. 다만 **클립보드 붙여넣기 시 형식 선택 팝업은 별도 설정 없이도 기본 동작합니다.** `mountToolbar`가 마운트될 때 코어에 전용 팝업 UI가 자동으로 연결되므로, 툴바를 사용하는 페이지에서는 별도 구현 없이도 선택 팝업이 표시됩니다. 커스텀 모달 UI로 대체하고자 할 때만 `ask.choose`를 전달하세요.

### 입출력 메서드

| 메서드 | 설명 |
|---|---|
| `nabi.getHtml()` | 저장 및 배포용 HTML 반환 |
| `nabi.getJson()` | 나비트리(JSON) 데이터 반환 |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | 새 문서 데이터로 교체 |
| `nabi.onChange(fn)` | 문서 변경 이벤트 리스너 등록 |
| `N.renderStoredHtml(json, registry)` | 에디터 없이 나비트리를 HTML로 변환 (아래 [읽기 전용 뷰어](#읽기-전용-뷰어-viewer) 참고) |

---

## CDN 배포 주소

특정 버전을 고정하려면 CDN URL에 버전 번호를 명시합니다. jsDelivr와 unpkg 모두 지원합니다.

버전이 명시되지 않은 URL(`/npm/nabi-note`)은 CDN 캐시 문제로 인해 스크립트와 CSS 버전이 불일치할 수 있으므로, 버전을 명시하거나 `@latest` 태그를 사용하는 것을 권장합니다.

| 종류 | 주소 |
|---|---|
| **번들 스크립트 (최신)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **번들 스크립트 (버전 고정)** | <code>{{ CDN_BUNDLE }}</code> |
| **스타일시트 (최신)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **스타일시트 (버전 고정)** | <code>{{ CDN_SHEET }}</code> |
| **번들 스크립트 (unpkg)** | `https://unpkg.com/nabi-note` |

CDN 번들은 npm 배포 패키지 내 `dist/` 빌드 결과물과 동일합니다.

---

## 읽기 전용 뷰어 (Viewer)

저장된 HTML 문서를 **단순 조회하는 페이지**에서는 에디터 인스턴스를 생성할 필요가 없습니다. 동일한 스타일시트를 연결하고 `.nabi-content` 컨테이너 내부에 HTML을 렌더링하면 에디터에서 작성한 모습 그대로 표시됩니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- nabi.getHtml()로 저장된 HTML 문자열 -->
</div>
```

문서를 **나비트리(JSON) 형태로 저장한 경우**에는 렌더링 함수를 호출하여 순수 자바스크립트로 HTML을 렌더링할 수 있습니다. 저장된 JSON 데이터와 등록된 날개 목록(`registry`)을 인자로 전달합니다.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['댓글 한 줄'] }]   // 서버에서 불러온 나비트리
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

나비트리 형식이 아니면 `null`을 반환하며, 렌더링 결과는 에디터 인스턴스의 `getHtml()` 결과와 완전히 동일합니다. 같은 XSS 필터링 규칙이 적용되며, DOM에 의존하지 않으므로 서버(Node.js 등)에서도 동일하게 동작합니다 ([{{ t('menu_intro_ssr') }}](./ssr) 참고).

npm 패키지를 사용하는 서버 환경에서는 전역 번들 대신 경량 모듈인 **`nabi-note/ssr`**을 사용합니다. 렌더링에 필요한 로직만 포함되어 있어 편집 영역 및 UI 코드가 서버 번들에 포함되지 않습니다.

CSS 스타일시트에는 **모든 날개의 스타일이 포함되어 있습니다.**

기본적인 서식은 CSS만으로 표현되지만, **표 정렬 및 코드 문법 강조는 클라이언트 자바스크립트 동작이 필요합니다.** 열 제목 클릭 시 행 정렬, 코드 토큰화 및 색상 적용 기능이 필요하다면 경량 뷰어 런타임을 연결할 수 있습니다.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'ko' })
</script>
```

- 뷰어를 연결하지 않아도 문서는 정상적으로 표시됩니다 (표 정렬 기능과 코드 색상이 비활성화될 뿐 본문 열람에는 지장이 없습니다).
- 표 정렬 기능은 에디터에서 정렬 기능이 활성화된 표(`data-nabi-sortable` 속성 포함)에만 동작합니다.
- 코드 문법 강조는 내장 토크나이저가 기본 탑재되어 있어 외부 의존성 없이 동작합니다. Shiki 등 외부 하이라이터를 사용하려면 `{ locale: 'ko', highlight }` 옵션으로 전달할 수 있습니다.
- 전역 `NabiNote` 번들에는 뷰어 진입점이 포함되어 있지 않으며, 읽기 전용 페이지의 번들 크기를 최적화하기 위해 `nabi-note/viewer` 별도 모듈로 제공됩니다.

---

## 다음 문서

- [{{ t('menu_intro_usage') }}](./usage) — npm 패키지 설치 및 에디터 상세 사용법
- [{{ t('menu_wing_custom') }}](../wing/custom) — 새로운 커스텀 서식 날개 직접 만들기

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// 버전 번호는 패키지 버전을 동적으로 참조
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
