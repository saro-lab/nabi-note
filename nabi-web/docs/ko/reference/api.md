---
title: API 지도
description: 필요한 기능별로 공개 import와 API를 빠르게 찾습니다.
---

# API 지도

NABI NOTE의 공개 API는 환경에 따라 나뉘어 있습니다. 편집기를 만들 때는 루트 패키지, 서버에서 HTML만 만들 때는 SSR 진입점, 게시 화면의 동작과 문서 비교에는 각각 viewer와 diff 진입점을 사용합니다.

| 하려는 일 | import | 먼저 찾을 API |
| --- | --- | --- |
| 편집기 조립 | `nabi-note` | `createNabiWith`, `mountSurface`, `mountToolbar`, `wings` |
| 문서 저장과 불러오기 | `nabi-note` | `Nabi`의 `getJson`, `setJson`, `getHtml`, `setHtml`, `parseNodes` |
| 파일, 업로드, 로컬 기록 | `nabi-note` | `mountFile`, `mountUpload`, `mountLocalHistory` |
| 서버 HTML 렌더링 | `nabi-note/ssr` | `makeRegistry`, `renderStoredHtml` |
| 게시 화면 보강 | `nabi-note/viewer` | `attachViewer` |
| 변경 비교 | `nabi-note/diff` | `diffDocs`, `mountDiff`, `mountDiffWing` |
| 패키지 스타일 | `nabi-note/nabi.css` | CSS 번들 |

## editor가 제공하는 메서드

```ts
nabi.getJson()                       // 저장할 정규화 JSON
nabi.setJson(value)                  // 성공 여부
nabi.getHtml()                       // 게시용 HTML
nabi.getEditorHtml()                 // 편집·hydrate용 HTML, 저장하지 않음
nabi.setHtml(html)                   // HTML 가져오기, 성공 여부
nabi.applyCommand(name, args?, by?)  // 명령 실행, 성공 여부
nabi.select(selection)               // 유효한 선택 위치로 이동
nabi.undo()
nabi.redo()
nabi.onChange(listener)              // 해제 함수 반환
```

`setHtml()`은 `createNabiWith()`에 `parseHtml: parseNodes`를 전달한 경우에만 비어 있지 않은 HTML을 읽습니다. `getJson()`과 `getHtml()`은 저장과 게시에 쓸 수 있지만, `getEditorHtml()`은 surface와 hydrate를 위한 내부 표현이므로 저장하지 않습니다.

`applyCommand()`의 마지막 인수는 `'keyboard' | 'pointer'`입니다. 선택하지 않은 상태에서 mark 명령을 키보드 방식으로 실행하면 다음 입력을 위한 서식이 예약될 수 있습니다. 클릭으로 실행한 툴바는 `by: 'pointer'`를 전달해 대상 없는 서식이 조용히 예약되지 않도록 합니다.

## registry와 wing 선택

```ts
const selected = wings().allBasic().use('upload')
const { nabi, registry } = createNabiWith(selected)
```

`wings()`는 사용할 기능을 고르고, `createNabiWith()`는 그 선택으로 registry와 editor를 함께 만듭니다. 같은 registry를 `mountSurface()`, `mountToolbar()`, 파일이나 diff mount에 전달해야 문서 구조, 명령, HTML 변환이 일치합니다.

선택 이름이나 옵션의 모양이 잘못되면 registry 생성이 즉시 실패합니다. 의존 wing을 끊는 `drop()`도 같은 방식으로 거부됩니다. 부분적으로 조립된 편집기를 계속 실행하지 않기 위한 의도된 동작입니다.

## 더 자세한 타입을 찾는 방법

이 페이지는 자주 쓰는 API를 찾기 위한 지도입니다. `SurfaceOptions`, `ToolbarOptions`, `UploadOptions`, `Wing`, `Command`처럼 구현에 필요한 타입은 설치된 `nabi-note`의 타입 선언을 우선 확인하세요. 자동화 도구에는 배포물의 [영문 API reference](https://nabi.saro.me/llms/api-reference.md)도 제공됩니다. 커스텀 구조를 만들기 전에는 [커스텀 wing](/ko/guide/extend)의 저장과 검증 규칙을 함께 확인하는 것이 좋습니다.
