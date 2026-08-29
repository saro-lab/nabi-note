---
title: 시작하기
description: NABI NOTE를 설치하고 툴바와 JSON 입출력이 있는 첫 편집기를 만듭니다.
---

# 시작하기

NABI NOTE는 문서 상태와 편집 화면을 나누어 조립합니다. 처음에는 복잡하게 생각하지 않아도 됩니다. 사용할 날개를 고르고, 문서 상태를 만든 다음, 그 상태를 편집 영역과 툴바에 연결하면 됩니다.

## 설치하기

```bash
npm install nabi-note
```

패키지 스타일은 편집 화면뿐 아니라 저장한 HTML을 보여 주는 게시 화면에도 불러옵니다.

```ts
import 'nabi-note/nabi.css'
```

## 편집 영역 준비하기

툴바와 본문이 들어갈 자리를 만듭니다. `mountSurface()`가 본문을 편집 가능하게 바꾸므로 `contenteditable` 속성은 직접 넣지 않습니다.

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## 편집기 연결하기

`wings().allBasic()`은 별도 서버 연결 없이 바로 쓸 수 있는 공식 날개를 고릅니다. 여기서 만든 `nabi`는 문서와 명령을 관리하고, `registry`는 선택한 날개의 문서 어휘와 화면 기능을 모읍니다.

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  wings,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ko',
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ko',
  placeholder: '내용을 입력하세요',
})

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ko',
})
```

이제 본문을 입력하고 툴바의 서식 기능을 사용할 수 있습니다. 기능을 더하거나 빼고 싶다면 [날개 알아보기](/ko/guide/features)에서 선택 방법을 확인하세요.

## 문서 불러오고 저장하기

다시 편집할 문서는 NABI TREE JSON으로 보관합니다. 저장할 때 `getJson()`으로 읽고, 다시 열 때 `setJson()`으로 넣습니다.

```ts
const body = nabi.getJson()
await saveToServer(body)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) {
  showError('저장된 문서를 읽을 수 없습니다.')
}
```

게시할 HTML이 필요하면 `getHtml()`을 사용합니다. 외부 HTML을 편집기로 가져오는 경우에만 `parseHtml: parseNodes`를 조립 옵션에 추가합니다.

```ts
import { parseNodes } from 'nabi-note'

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ko',
  parseHtml: parseNodes,
})

nabi.setHtml('<p>가져온 문서</p>')
const publishedHtml = nabi.getHtml()
```

JSON과 HTML의 차이, 파일 저장, 업로드, 로컬 히스토리는 [입출력](/ko/guide/storage)에서 이어서 설명합니다.

## 화면을 닫을 때

마운트한 화면 부품은 만든 순서의 반대로 해제합니다. 페이지 이동이나 컴포넌트 해제 시점에 함께 호출하면 이벤트와 관찰자가 남지 않습니다.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```

여러 편집기를 한 페이지에 둘 때도 각 툴바의 `surface`에는 해당 편집 영역의 요소를 넘깁니다. 이렇게 해야 단축키와 포커스 복원이 다른 편집기로 넘어가지 않습니다.
