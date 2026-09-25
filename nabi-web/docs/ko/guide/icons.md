---
title: "아이콘 테마"
description: "CSS 변수로 날개 버튼과 미리보기·전체화면·패널·비교·표 정렬 아이콘을 바꿉니다. SVG·WebP·PNG를 섞어 사용할 수 있으며, 지정하지 않은 아이콘은 기본 파일을 사용합니다."
---

# 아이콘 테마

CSS 변수로 날개 버튼과 미리보기·전체화면·패널·비교·표 정렬 아이콘을 바꿉니다. SVG·WebP·PNG를 섞어 사용할 수 있으며, 지정하지 않은 아이콘은 기본 파일을 사용합니다.

## 파일 지정

CSS를 불러오고 편집기 또는 공통 부모에 테마 클래스를 붙입니다. 이미지는 원래 색과 투명도, 비율을 유지합니다.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

경로는 `/icons/...`처럼 루트부터 쓰거나 완전한 HTTPS 주소를 사용하세요. 상대 경로는 테마 파일 옆을 기준으로 한다고 보장되지 않습니다. CSS를 직접 호스팅하면 같은 버전의 `dist/icons/`도 `nabi.css` 옆에 복사합니다. 파일을 불러오지 못하면 그림은 비지만 버튼의 이름·툴팁·동작은 유지됩니다.

## 다른 아이콘 찾기

아이콘 요소의 `data-nabi-icon` 값 앞에 `--nabi-icon-`을 붙이면 해당 CSS 변수가 됩니다. 예를 들어 `diff-close`는 `--nabi-icon-diff-close`입니다. 컨텍스트·메뉴·저장·히스토리 등의 전체 키 규칙과 특수문자 처리 방법은 <a href="/llms/icons.md" target="_blank" rel="noopener">아이콘 계약</a>을 참고하세요.

## 다크 모드와 패널

테마 클래스나 CSS 변수를 바꾸면 다시 mount하지 않아도 아이콘이 바뀝니다. 기본 아이콘은 밝은/어두운 테마를 따릅니다. 사용자 파일은 `currentColor`를 상속하지 않으므로 필요하면 위 예제처럼 어두운 테마용 파일을 지정하세요. `body` 아래에 열리는 패널도 원래 편집기의 아이콘 테마와 클래스·스타일 변경을 따릅니다. 변수는 툴바 내부에만 두지 말고 편집기나 공통 부모에 두세요.

## 기본 버튼 표시

`showPreview`와 `showFullscreen`은 각각 기본값이 `true`입니다. `false`로 지정한 버튼은 포커스 대상과 이벤트까지 제거합니다. 둘 다 `false`면 빈 도구 영역도 만들지 않습니다.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR과 mount에는 같은 표시 옵션을 전달합니다. 표시 구성을 바꿀 때는 `tools.unmount()` 후 새 옵션으로 mount합니다. 두 버튼이 모두 필요 없으면 처음부터 도구 mount와 SSR 마크업을 생략하는 기존 방식도 가능합니다. `openPreview()`·`setFullscreen()`을 직접 호출하는 기능은 유지됩니다.
