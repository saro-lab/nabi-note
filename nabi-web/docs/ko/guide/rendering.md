---
title: SSR·viewer·diff
description: 편집기를 싣지 않고 게시하고, hydrate·읽기 도구·변경 비교를 연결합니다.
---

<script setup>
import FlowChain from '../../.vitepress/ui/FlowChain.vue'
const renderFlow = [
  { label: '저장 JSON', note: 'DB의 원본', kind: 'input' },
  { label: 'SSR registry', note: '같은 wing 순서', kind: 'core' },
  { label: '게시 HTML', note: 'JS 없이도 읽기 가능', kind: 'output' },
  { label: '선택적 viewer', note: '정렬·코드 칠하기만 추가', kind: 'output' },
]
</script>

# SSR·viewer·diff

편집기 전체를 게시 페이지에 싣지 않아도 됩니다. `nabi-note/ssr`은 DOM 없이 저장 JSON을 HTML로 만들고, `nabi-note/viewer`는 읽기 화면에 필요한 표 정렬·코드 칠하기만 더합니다.

<FlowChain :steps="renderFlow" caption="게시 화면은 편집 surface가 없어도 `.nabi-content`와 CSS만으로 읽을 수 있습니다." />

## 서버 렌더링

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)
if (html === null) throw new Error('invalid stored document')
```

서버와 브라우저 hydration은 **같은 wing 선언 순서와 HTML에 영향을 주는 옵션**을 사용해야 합니다. server output의 직접 자식 `data-key`가 현재 문서와 맞으면 DOM을 채택하고, 다르면 안전하게 새 editor HTML로 다시 그립니다.

## hydrate

```ts
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

`hydrate`는 임의의 기존 DOM을 보존하는 기능이 아닙니다. 같은 NABI 문서의 초기 paint를 빠르게 하는 최적화입니다.

## viewer와 diff

```ts
import { attachViewer } from 'nabi-note/viewer'
import { diffDocs } from 'nabi-note/diff'

const detachViewer = attachViewer(article, { locale: 'ko', tables: 'marked' })
const model = diffDocs(beforeJson, afterJson, registry)
```

viewer는 `data-nabi-sortable` 표만 기본으로 활성화합니다. diff는 JSON 비교에는 DOM이 필요 없지만 HTML 문자열 비교에는 `DOMParser`가 필요합니다. 둘 다 `unmount()`/detach를 호출해 화면 수명과 맞추세요.
