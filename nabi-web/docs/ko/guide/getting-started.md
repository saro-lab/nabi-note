---
title: 빠른 시작
description: NABI NOTE를 설치하고, 저장 가능한 첫 편집기를 만듭니다.
---

<script setup>
import FlowChain from '../../.vitepress/ui/FlowChain.vue'
const startFlow = [
  { label: 'wing 선택', note: '문서에서 쓸 기능을 고릅니다.', kind: 'input' },
  { label: 'NABI 조립', note: '문서 모델과 레지스트리를 만듭니다.', kind: 'core' },
  { label: 'surface 연결', note: '편집할 DOM 루트를 연결합니다.', kind: 'output' },
  { label: 'JSON 저장', note: 'getJson() 결과를 저장합니다.', kind: 'output' },
]
</script>

# 빠른 시작

NABI NOTE는 프레임워크에 묶이지 않는 WYSIWYG 에디터입니다. 문서는 **NABI TREE JSON**으로 저장하고, 편집 화면과 게시 화면은 그 데이터에서 다시 만듭니다. 먼저 가장 작은 편집기를 만든 뒤 필요한 wing을 추가하세요.

<FlowChain :steps="startFlow" caption="에디터는 DOM을 저장하지 않습니다. JSON이 원본이고 HTML은 산출물입니다." />

## 설치

```bash
npm install nabi-note
```

```ts
import 'nabi-note/nabi.css'
import { createNabiWith, mountSurface, parseNodes, wings } from 'nabi-note'

const selected = wings().allBasic().build()
const { nabi, registry } = createNabiWith(selected, { parseHtml: parseNodes })

const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('.nabi-content')!,
  placeholder: '내용을 입력하세요',
})

window.addEventListener('beforeunload', () => surface.unmount())
```

```html
<div class="nabi">
  <div class="nabi-content"></div>
</div>
```

## 가장 먼저 정할 것

| 필요한 일 | 선택 | 이유 |
| --- | --- | --- |
| 일반 편집기 | `allBasic()` | 별도의 호스트 연결 없이 동작하는 기본 wing을 사용합니다. |
| 파일 열기/저장 | `all()` 또는 `save`, `open` 추가 | 파일 mount도 함께 연결해야 합니다. |
| 업로드 | `upload` 추가 | 업로더 함수와 이미지·링크 wing이 필요합니다. |
| 아주 작은 번들 | 직접 wing 배열 | 이름 기반 카탈로그를 가져오지 않아 번들 범위를 줄일 수 있습니다. |

```ts
// 업로드를 포함하되, 실제 업로더 연결은 다음 단계에서 합니다.
const selected = wings().allBasic().use('upload').build()
```

## 저장의 기준

```ts
const savedJson = nabi.getJson() // 데이터베이스에 저장할 값
const publishedHtml = nabi.getHtml() // 게시용 산출물
const editorHtml = nabi.getEditorHtml() // hydrate 전용, 저장 금지
```

`getJson()`만 원본으로 저장하세요. `getEditorHtml()`에는 캐럿과 편집을 위한 내부 표식이 포함될 수 있어 장기 저장 형식이 아닙니다.

## 다음 순서

- 실제 툴바와 저장 mount까지 연결하려면 [에디터 조립](/ko/guide/assemble)으로 갑니다.
- 데이터 구조와 HTML 입력의 보안 경계는 [NABI TREE와 데이터](/ko/guide/document)에서 확인합니다.
- 빌드 도구가 없다면 [CDN·빌드 없는 시작](/ko/guide/cdn)을 사용합니다.
