---
title: 게시, SSR, viewer와 diff
description: 저장한 문서를 가볍게 게시하고, 필요한 읽기 기능과 변경 비교를 더합니다.
---

# 게시, SSR, viewer와 diff

편집기를 게시 페이지에 그대로 올릴 필요는 없습니다. 저장한 NABI TREE JSON을 서버에서 HTML로 만들고 CSS만 불러오면 읽기 화면이 됩니다. 표 정렬이나 코드 색칠이 필요할 때만 viewer를 더하고, 두 저장본의 차이를 보여줄 때만 diff를 불러오면 됩니다.

## 서버에서 게시 HTML 만들기

`nabi-note/ssr`은 surface와 UI를 포함하지 않는 서버용 진입점입니다. 서버와 브라우저가 같은 wing 선언 순서를 사용해야 같은 문서를 같은 HTML로 만들 수 있습니다.

```ts
import { makeRegistry, renderStoredEditorHtml, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('저장한 문서를 읽을 수 없습니다.')
```

`renderStoredHtml()`은 받은 JSON을 검증하고 정규화한 뒤 게시용 HTML을 돌려줍니다. 결과가 `null`이면 저장본이 현재 registry로 읽을 수 없는 형식입니다. 게시 화면에는 패키지 CSS와 `.nabi-content` 클래스를 함께 둡니다.

```html
<article class="nabi-content">...</article>
```

## 서버 HTML을 편집기로 이어받기

첫 화면을 서버에서 그리고 곧바로 편집할 수 있다면 `renderStoredEditorHtml()`과 `hydrate: true`를 사용합니다. 이는 임의의 HTML을 보존하는 기능이 아니라, 같은 문서에서 미리 그린 편집 HTML을 다시 쓰지 않기 위한 최적화입니다.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

서버와 브라우저는 같은 정규화 문서, 같은 순서의 wing, HTML에 영향을 주는 같은 옵션을 써야 합니다. content root의 직접 자식 `data-key`가 현재 문서와 맞지 않으면 surface가 안전하게 새 editor HTML을 그립니다. root 자체에 `contenteditable`을 미리 넣지 마세요. `mountSurface()`가 관리합니다.

## 읽기 화면에 viewer 더하기

`nabi-note/viewer`는 게시 HTML에 선택적인 읽기 기능만 붙입니다. 기본적으로 `data-nabi-sortable`이 있는 표에 정렬 버튼을 붙이고, `pre > code`의 코드 색칠을 처리합니다. 정렬이나 코드 색칠이 필요 없다면 viewer 없이 CSS만 사용해도 됩니다.

```ts
import { attachViewer } from 'nabi-note/viewer'

const detachViewer = attachViewer(article, { locale: 'ko', tables: 'marked' })

// 화면을 제거할 때
detachViewer()
```

`tables: 'all'`을 주면 root 아래의 모든 표를 대상으로 합니다. `detachViewer()`는 정렬된 행과 코드 token span 등 viewer가 만든 화면 상태를 원래대로 돌립니다.

## 두 문서를 비교하기

`nabi-note/diff`는 두 NABI TREE JSON 또는 두 HTML 문자열을 비교합니다. JSON 비교는 DOM 없이도 할 수 있지만, HTML 문자열을 비교하려면 브라우저의 `DOMParser`가 필요합니다. 어느 입력이든 읽을 수 없으면 예외 대신 `null`을 돌려줍니다.

```ts
import { diffDocs } from 'nabi-note/diff'

const model = diffDocs(beforeJson, afterJson, registry)
```

diff 화면은 삭제된 블록을 빨강, 추가된 블록을 초록으로 표시합니다. 같은 블록 안에서는 추가하거나 삭제한 글자뿐 아니라 굵게, 글자색, 링크 주소처럼 인라인 서식만 바뀐 범위도 한 단계 더 강조합니다. 반대로 블록 속성만 바뀌면 글자 범위 강조가 없을 수 있습니다.

두 패널 UI가 필요하면 `mountDiff()`를 사용합니다. 편집기의 diff wing을 연결할 때는 `mountDiffWing()`과 툴바의 `onHost`를 함께 연결합니다. 이 통합은 마지막으로 불러온 문서를 기준점으로 삼으며, 타이핑, 붙여넣기, 실행 취소/다시 실행만으로는 기준점을 옮기지 않습니다.

```ts
import { mountToolbar } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const diff = mountDiffWing({ nabi, registry, surface: content, locale: 'ko' })

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost: (wing) => {
    if (wing === 'diff') diff.open()
  },
})

// 화면을 제거할 때는 만든 순서의 반대로 해제합니다.
toolbar.unmount()
diff.unmount()
```
