---
title: 기본 사용법
description: 브라우저에서 NABI NOTE 편집기를 조립하고 저장·복원하는 기본 흐름입니다.
---

# 기본 사용법

이 문서는 브라우저에서 동작하는 CSR 편집기를 기준으로 설명합니다. 사용할 날개를 고르고,
편집기와 화면을 연결한 뒤, NABI TREE JSON을 저장하고 다시 불러오는 흐름입니다.

## 설치와 기본 HTML

```bash
npm install nabi-note
```

편집기와 게시 화면에는 같은 CSS를 불러옵니다. 편집 영역의 `contenteditable`은 직접 넣지
않습니다. `mountSurface()`가 이를 관리합니다.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## 편집기 연결

`allBasic()`은 별도 서버 연결 없이 쓸 수 있는 공식 날개를 고릅니다. 업로드, 파일 저장·열기,
변경 비교처럼 서비스 쪽 연결이 필요한 날개는 해당 날개 문서의 안내에 따라 추가합니다.

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
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ko',
  placeholder: '내용을 입력하세요.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ko',
})
```

`locale`은 툴바와 안내 문구의 언어입니다. 모든 화면 부품에 같은 값을 전달합니다.
`placeholder`는 빈 편집기에 보일 문구이며, 빈 문자열이면 숨깁니다. `onError`는 명령이나
콜백에서 격리된 오류를 받습니다. `undoLimit`은 실행 취소 개수이고 기본값은 200입니다.
`typingMergeMs`는 연속 입력을 한 번의 실행 취소로 묶는 시간이며, `0`이면 글자마다 나눕니다.

각 편집기에는 서로 겹치지 않는 본문과 툴바 root를 사용하세요. 여러 편집기가 있는 화면에서도
툴바의 `surface`에는 자기 편집 영역을 넘겨야 단축키와 포커스가 섞이지 않습니다.

## 날개 고르기

필요한 기능만 넣고 싶으면 `use()`와 `drop()`을 사용합니다. 날개마다 받을 수 있는 옵션은
각 날개 소개 문서에서 확인합니다.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'ko' })
```

작은 번들이 필요하면 `boldWing`, `imageWing`처럼 필요한 날개만 배열로 전달할 수도 있습니다.
없는 이름, 잘못된 옵션, 끊어진 의존성은 편집기를 만들 때 바로 오류가 납니다.

## 저장과 불러오기

다시 편집할 문서는 `getJson()`으로 읽은 NABI TREE JSON을 저장합니다. `getHtml()`은 게시용
결과입니다. 편집 화면 전용인 `getEditorHtml()`은 저장하지 않습니다.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) {
  showError('저장된 문서를 읽을 수 없습니다.')
}

const publishedHtml = nabi.getHtml()
```

외부 HTML을 가져올 때는 `setHtml()`을 사용합니다. 브라우저 편집기는 HTML parser를 자동으로
연결하므로 별도 parser 옵션이 필요 없습니다. `setJson()`과 `setHtml()`은 잘못된 비어 있지
않은 입력이면 `false`를 반환하고 현재 문서를 유지합니다.

```ts
nabi.setHtml('<p>가져온 문서</p>')
```

JSON과 HTML은 모두 신뢰하지 않는 입력입니다. 등록된 날개와 허용 규칙을 거쳐 읽히지만, 업로드
권한 검사나 서비스의 보안 정책까지 대신하지는 않습니다.

## 자주 쓰는 API

| 할 일 | API |
| --- | --- |
| 편집기 조립 | `createNabiWith`, `wings` |
| 편집 화면과 툴바 연결 | `mountSurface`, `mountToolbar` |
| 저장·복원 | `getJson`, `setJson`, `getHtml`, `setHtml` |
| 변경 감지 | `nabi.onChange(listener)` |
| 실행 취소·다시 실행 | `nabi.undo()`, `nabi.redo()` |
| 서버 HTML 만들기 | `nabi-note/ssr`의 `renderStoredHtml` |
| 게시 화면 기능 | `nabi-note/viewer`의 `attachViewer` |
| 문서 비교 | `nabi-note/diff`의 `diffDocs` |

정확한 타입과 전체 인수는 설치한 패키지의 타입 선언을 먼저 확인하세요. 자동화 도구에는
[영문 API reference](https://nabi.saro.me/llms/api-reference.md)도 제공합니다.

## 화면을 닫을 때

마운트한 부품은 만든 순서의 반대로 해제합니다. 편집 영역의 `innerHTML`을 직접 바꾸지 말고,
문서를 바꿀 때는 `setJson()`, `setHtml()`, `applyCommand()` 같은 공개 API를 사용하세요.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
