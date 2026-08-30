---
title: CSS 테마
description: CSS 변수로 편집기와 게시 화면의 색, 글꼴, 크기, 다크 모드를 설정합니다.
---

# CSS 테마

NABI NOTE는 편집기와 게시 화면에 같은 CSS를 적용합니다. 패키지 CSS를 한 번 불러온 뒤,
서비스 컨테이너에서 필요한 CSS 변수만 덮어쓰는 방식이 가장 안전합니다.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

같은 토큰을 편집기와 게시 화면의 공통 부모에 두면 두 화면이 같은 분위기를 유지합니다.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## 자주 바꾸는 변수

| 용도 | 변수 |
| --- | --- |
| 글자와 배경 | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| 선과 강조색 | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| 모서리와 그림자 | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| 기본 글꼴 | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| 편집 영역 | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| 고정 툴바와 미리보기 | `--nabi-sticky-top`, `--nabi-preview-width` |
| 터치 환경 | `--nabi-touch-font-size`, `--nabi-touch-control-size` |

형광펜과 글자색은 각각 `--nabi-hl-<name>`, `--nabi-tc-<name>`으로 바꿉니다. 예를 들어
`--nabi-hl-yellow`을 바꾸면 문서에 저장된 `yellow` 형광펜 값의 화면색만 바뀝니다.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## 다크 모드

기본은 라이트 모드입니다. 페이지의 `html` 또는 `body`에 `.dark`를 붙이거나, 특정 편집기와
게시 화면에 `data-nabi-theme="dark"`를 지정하면 다크 모드가 적용됩니다.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

상위 `.dark`의 영향을 끊고 싶으면 `data-nabi-theme="light"`를 사용합니다. 테마 전환은
서비스가 관리하며 패키지가 `prefers-color-scheme`을 자동으로 따르지는 않습니다.

```css
.dark .brand-note {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## 게시 화면에도 CSS를 적용합니다

게시 HTML에는 `.nabi-content`와 같은 CSS가 필요합니다. JavaScript 없이도 표, 코드, 이미지,
체크리스트, 드롭캡의 모양이 적용됩니다. 표 정렬이나 코드 색칠처럼 동작이 필요할 때만
`nabi-note/viewer`를 추가합니다.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

본문의 폭과 행간처럼 패키지가 소유하지 않는 레이아웃은 서비스 클래스에서 정합니다.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## 편집 화면에서 바꾸면 안 되는 것

편집 중인 `[data-key]` 노드의 `display`나 `white-space`를 바꾸지 마세요. 편집 텍스트 안에
pseudo-element를 넣거나, 이미지·첨부 같은 객체 wrapper의 포인터 동작을 막는 것도 피해야
합니다. 이런 변경은 캐럿 위치와 DOM의 문서 위치를 어긋나게 할 수 있습니다.

드롭캡은 게시 화면에서는 `::first-letter`로 보이지만 편집 화면에서는 실제
`[data-nabi-dropcap-letter]` 요소를 사용합니다. `.nabi-editing` 안에서 `::first-letter`를
추가하거나 이 요소를 바꾸지 마세요.
