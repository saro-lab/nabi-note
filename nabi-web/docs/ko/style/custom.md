---
title: 스타일 커스텀
description: CSS 변수를 활용하여 NABI NOTE의 색상, 폰트, 여백 등 스타일을 커스텀하는 방법을 안내합니다.
---

# 스타일 커스텀

스타일시트는 **호스트 애플리케이션에서 직접 로드**합니다. 번들러 환경에서는 `import 'nabi-note/nabi.css'`, CDN 환경에서는 `<link>` 태그를 사용합니다. 이후 필요한 CSS 변수만 재정의하면 전체 에디터 테마가 일관되게 변경됩니다.

NABI NOTE의 모든 UI 컴포넌트는 **하드코딩된 색상 리터럴 없이 `--nabi-*` CSS 변수로만 스타일링**되어 있어, 변수 재정의만으로 손쉽게 브랜딩을 맞출 수 있습니다.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

클래스 선택자를 세 번 중첩한 이유는 [CSS 특이도 가이드](#css-특이도specificity-가이드) 절을 참고하세요.

::: tip 저장된 HTML에는 인라인 스타일이 포함되지 않습니다
에디터가 출력하는 HTML(`getHtml()`)에는 **인라인 `style` 속성이 포함되지 않습니다.** HTML 마크업은 의미 구조와 속성(`data-nabi-align="center"` 등)만 나타내며, 시각적 표현은 스타일시트가 담당합니다. 따라서 저장된 HTML을 외부 페이지에서 렌더링할 때도 **`nabi.css`가 적용된 `.nabi-content` 컨테이너 내부**에 배치해야 편집기 화면과 동일한 모양으로 표시됩니다.

자세한 내용은 [저장된 HTML을 외부에서 렌더링할 때](#저장된-html을-외부에서-렌더링할-때) 절을 참고하세요.
:::

::: tip 라이트 및 다크 테마가 기본 내장되어 있습니다
기본 테마를 위해 호스트가 추가 변수를 정의할 필요는 없습니다. 코어 스타일시트에 라이트 기본값, `.dark` 테마, 명시적 `.light` 테마가 모두 포함되어 있습니다.
:::

## 색상 및 테마 토큰

| 토큰 | 설명 | 기본값 (라이트) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | 기본 배경색 · 마우스 호버/연한 배경색 | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | 기본 텍스트 · 흐린 보조 텍스트 · 강조색 위 텍스트 | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | 테두리/구분선 · 메인 강조색(포커스/활성화) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | 위험/경고색 · 위험색 위 텍스트 | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | 드롭다운 그림자 · 모달/미리보기 딤 배경 | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | 모서리 라운딩 (기본 · 작게 · 최소) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | 레이어 팝업/모달 모서리 라운딩 | `.25rem` |
| `--nabi-z-sticky` | 상단 고정 헤더의 z-index | `20` |
| `--nabi-grid-cell` | 표 삽입 피커 등의 격자 셀 크기 | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | 형광펜 6가지 색상 | 반투명 색상 |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | 글자색 5가지 색상 | 선명한 색상 |

위 표의 변수들은 코어 스타일시트(`nabi.css`)가 **직접 선언**하는 토큰입니다. 선언 대상은 `.nabi`뿐만 아니라 독립 렌더링을 위해 `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` 3가지 선택자에 바인딩되어 있습니다.

## 참조 전용 토큰 (:root 정의 가능)

아래 변수들은 코어 스타일시트가 **직접 선언하지 않고 `var(--변수, 대체값)` 형태로 참조만** 하는 토큰입니다. 호스트에서 정의하지 않으면 지정된 기본 대체값이 적용됩니다. 코어 레벨에서 선언되어 있지 않으므로 **`:root`에 선언하여 전역으로 적용**할 수 있습니다.

| 토큰 | 설명 | 기본 대체값 |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | 에디터 및 서체 날개의 각 폰트 패밀리 | 시스템 폰트 |
| `--nabi-cursive-adjust` | 필기체 폰트의 `font-size-adjust` 비율 | `0.4` |
| `--nabi-sticky-top` | 상단 고정 툴바의 상단 여백 (GNB 헤더 높이만큼 설정) | `0px` |
| `--nabi-preview-width` | 미리보기 모달 카드의 기본 너비 | `720px` |
| `--nabi-placeholder` | 빈 에디터에 표시될 플레이스홀더 텍스트 | 없음 |
| `--nabi-placeholder-color` | 플레이스홀더 텍스트 색상 (지정하지 않으면 테마별 대체 색상 적용) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | 빈 에디터 편집 영역의 최소 높이 (편집 영역 `.nabi-editing`에만 적용) | `12.5rem` |
| `--nabi-touch-font-size` | 터치 디바이스(`pointer: coarse` 또는 너비 40rem 이하)에서 폼 입력 요소(`.nabi-input`)의 폰트 크기 (iOS 사파리 자동 확대 방지) | `16px` |

`--nabi-typeface-base`는 참조 전용이 아니라 **코어가 직접 선언**하는 토큰입니다(기본적으로 `--nabi-font` 참조). 기본 폰트를 변경할 때는 `--nabi-font`를 재정의하세요.

`--nabi-keyboard-top`과 `--nabi-keyboard-bottom`은 **`mountSticky()`가 모바일 키보드 높이를 측정하여 동적으로 기록**하는 내부 변수입니다.

`--nabi-bar-height` 역시 **`mountSticky()`가 실제 툴바 높이를 측정하여 기록**하는 내부 변수입니다. `.nabi-content > *` 요소가 스크롤 시 툴바 아래로 가려지지 않도록 `scroll-margin-block-start`에 이 값을 사용합니다.

## 변수가 없는 고정 스타일 재정의

아래 3가지 속성은 CSS 변수 대신 고정된 CSS 규칙으로 정의되어 있으므로, 변경하려면 해당 클래스 선택자를 직접 재정의합니다.

**글자 크기 4단계** (부모 크기 기준 `em` 단위):

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**드롭캡 첫 글자 크기**:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**코드 블록 토큰 색상**:

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## 단위 규격

버튼 크기, 여백, 툴바 높이 등 대부분의 UI 치수는 `rem` 단위로 정의되어 있어 **루트(`html`) 폰트 크기 설정에 비례하여 크기가 조절**됩니다. 사용자가 브라우저나 OS의 기본 글꼴 크기를 확대하면 에디터 UI도 자연스럽게 함께 확대됩니다.

---

## CSS 특이도(Specificity) 가이드

코어에 선언된 테마 색상 변수를 재정의할 때는 스타일 우선순위를 확실하게 높이기 위해 **클래스 3개를 중첩**하는 방식을 권장합니다.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- 라이트 기본 규칙 `:is(.nabi, …)`의 특이도는 **(0, 1, 0)**입니다.
- 다크 모드 규칙 `:where(html, body).dark :is(.nabi, …)`의 특이도는 **(0, 2, 0)**입니다.
- 따라서 `.nabi.nabi.nabi`처럼 클래스를 3개 중첩하면 **(0, 3, 0)**의 특이도를 확보하여 CSS 로드 순서에 구애받지 않고 항상 안정적으로 재정의할 수 있습니다.

미리보기 모달은 `body` 직속 자식 요소로 마운트되므로 `.nabi-scrim.nabi-scrim.nabi-scrim` 선택자도 함께 지정해야 동일한 테마 색상이 적용됩니다.
폰트 토큰처럼 코어가 선언하지 않는 참조 전용 토큰은 `:root`에 한 번만 선언해도 정상 적용됩니다.

---

## 라이트 / 다크 테마

`html` 또는 `body` 요소에 `dark` 클래스가 있으면 다크 테마, `light` 클래스가 있으면 라이트 테마가 적용됩니다. 클래스가 없으면 기본 라이트 테마로 동작하며, 두 클래스가 모두 존재할 경우 명시적인 `light` 클래스가 우선합니다.

```html
<html class="dark"><!-- 또는 <body class="dark"> --></html>
```

테마 전환은 클래스 토글만으로 즉각 반응하며 별도의 자바스크립트 API 호출이 필요하지 않습니다. 커스텀 스타일을 작성할 때도 `--nabi-*` 변수를 활용하면 테마 전환 시 색상이 자동으로 연동됩니다.

---

## 스타일시트 로드 방식

**1. CSS 파일 전체 임포트** (가장 권장되는 일반적인 방식)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. 등록된 날개의 스타일만 동적 주입**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// drop() 호출 시 주입된 스타일이 DOM에서 정리됩니다.
```

동일한 스타일시트 내용은 중복 주입되지 않고 단일 태그로 관리됩니다.
서버 사이드 렌더링(SSR) 환경에서는 클라이언트 JS 실행 전 스타일 깜빡임(FOUC)을 방지하기 위해 정적 CSS 파일 로드 방식을 사용하는 것이 좋습니다.

---

## 커스텀 가능한 CSS 클래스 및 UI 요소

| 선택자 | 설명 | 생성 주체 |
|---|---|---|
| `.nabi` | 에디터 전체(툴바 + 편집 영역)를 감싸는 최상위 컨테이너 | 호스트 |
| `.nabi-content[contenteditable]` | 실제 본문 편집 영역 | 호스트 |
| `.nabi-toolbar` | 툴바와 컨텍스트 바를 감싸는 고정 헤더 컨테이너 | 호스트 |
| `.nabi-toolbar-row` | 메인 툴바 버튼 줄 | `mountToolbar()` |
| `.nabi-context` | 동적 컨텍스트 툴바 컨테이너 | `mountContextToolbar()` |
| `.nabi-tools` | 미리보기 및 전체화면 버튼 래퍼 | `mountViewTools()` |
| `.nabi-hints [data-hint]` | Shift 키 연타 시 표시되는 단축키 안내 배지 | `mountHints()` |
| `[data-nabi-tip]` | 버튼 툴팁 (CSS `::after`로 렌더링) | 코어 컴포넌트 |
| `.nabi-content.nabi-dropping` | 파일 드래그 중인 편집 영역 | `mountUpload()` |

### 모달 및 팝업 요소

| 선택자 | 설명 | 생성 함수 |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | 문서 미리보기 모달 | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | 이미지 라이트박스 팝업 | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | 붙여넣기 형식 선택 팝업 | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | 파일 저장 팝업 (파일명 입력 및 형식 선택) | `openSavePanel()` |
| `.nabi.is-fullscreen` | 에디터 전체화면 모드 활성화 클래스 | `setFullscreen()` |

---

## 저장된 HTML을 외부에서 렌더링할 때

`getHtml()`로 추출한 HTML 문자열은 인라인 `style` 없이 시맨틱 마크업과 `data-nabi-*` 속성으로만 구성됩니다.
외부 페이지에서 에디터 화면과 동일한 스타일로 렌더링하려면 본문을 `.nabi-content` 클래스로 감싸고 `nabi.css`를 로드합니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- nabi.getHtml()로 저장된 HTML 본문 -->
</div>
```

`.nabi`로 감싸지 않아도 `.nabi-content` 자체에 테마 및 폰트 토큰이 적용되므로, 에디터에서 보던 스타일을 그대로 재현할 수 있습니다.

### 읽기 전용 표 정렬 기능 활성화

발행된 HTML 페이지에서 표 열 정렬 기능을 활성화하려면 `attachTableSort` 함수를 연결합니다.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'ko' })
```

`data-nabi-sortable` 속성이 포함된 표를 감지하여 열 제목에 정렬 버튼을 추가합니다. 반환된 `detach()` 함수를 호출하면 추가된 DOM 버튼이 제거되고 원래 행 순서로 복원됩니다.

::: warning 편집 중인 DOM에는 attachTableSort를 적용하지 마세요
`attachTableSort()`는 DOM 구조를 직접 조작하므로, 편집 중인 에디터 영역에 적용하면 정렬 버튼 UI가 문서 본문에 영구 저장될 수 있습니다. 반드시 읽기 전용 뷰어 화면에만 사용하세요.
:::

---

## 다음 문서

- [{{ t('menu_wing_custom') }}](../wing/custom) — 새로운 커스텀 서식 날개 직접 만들기
- [{{ t('menu_intro_index') }}](../intro) — NABI NOTE 소개 및 아키텍처

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
