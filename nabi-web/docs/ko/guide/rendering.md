---
title: SSR 설정
description: 서버에서 저장한 NABI TREE를 안전하게 HTML로 만들고 편집기로 이어받습니다.
---

# SSR 설정

서버에서는 브라우저용 surface와 UI를 불러오지 않고 `nabi-note/ssr`만 사용합니다. 저장한
NABI TREE JSON을 검증한 뒤 게시 HTML 또는 hydrate 가능한 편집 HTML로 바꿀 수 있습니다.

## 게시 HTML 만들기

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('저장한 문서를 읽을 수 없습니다.')
```

`renderStoredHtml()`은 받은 JSON을 검사하고 정리한 뒤 게시용 HTML을 반환합니다. `null`이면
현재 registry가 그 입력을 읽을 수 없다는 뜻입니다. 게시 페이지에는 패키지 CSS와
`.nabi-content` 클래스를 함께 둡니다.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

표 정렬이나 코드 색칠이 필요할 때만 브라우저에서 `nabi-note/viewer`의 `attachViewer()`를
추가합니다. 단순 게시 화면에는 CSS만으로 충분합니다.

## 미리 그린 편집기 이어받기

첫 화면부터 편집기를 보여 주려면 서버에서 `renderStoredEditorHtml()`을 사용하고, 브라우저
surface에 `hydrate: true`를 줍니다.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

서버와 브라우저는 같은 문서, 같은 순서의 날개, HTML에 영향을 주는 같은 옵션을 사용해야
합니다. 서버 출력은 content root의 직접 자식으로 그대로 넣고, root에는 `contenteditable`을
미리 넣지 않습니다. 구조가 맞지 않으면 surface가 새 편집 HTML을 그립니다.

## 툴바도 미리 그릴 때

`renderToolbarHtml()`과 `renderViewToolsHtml()`은 서버에서 툴바 모양을 미리 만들 수 있습니다.
브라우저에서 같은 registry, 언어, 그룹 순서로 mount하면 기존 버튼에 동작을 연결합니다.
임의의 host DOM을 툴바 root 안에 넣는 방식은 지원하지 않습니다.

SSR에서는 `injectSheets()`처럼 `Document`가 필요한 API를 쓰지 않습니다. 빌드한
`nabi-note/nabi.css`를 링크하거나 번들에 포함하세요.
