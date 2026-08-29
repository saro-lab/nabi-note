---
title: API 지도
description: 공개 진입점과 자주 쓰는 호출을 목적별로 찾습니다.
---

# API 지도

이 페이지는 API를 찾는 지도입니다. 타입의 전체 목록보다, 어떤 환경에서 어느 진입점을 읽어야 하는지 먼저 정리합니다.

| 목적 | import | 먼저 쓸 값 |
| --- | --- | --- |
| 편집기 조립 | `nabi-note` | `createNabiWith`, `mountSurface`, `mountToolbar`, `wings` |
| 저장/입력 | `nabi-note` | `getJson`, `setJson`, `setHtml`, `parseNodes` |
| 파일·업로드·복구 | `nabi-note` | `mountFile`, `mountUpload`, `mountLocalHistory` |
| 서버 렌더링 | `nabi-note/ssr` | `makeRegistry`, `renderStoredHtml` |
| 게시 화면 보강 | `nabi-note/viewer` | `attachViewer` |
| 변경 비교 | `nabi-note/diff` | `diffDocs`, `mountDiff`, `mountDiffWing` |
| CSS | `nabi-note/nabi.css` | 번들 CSS |

## 핵심 메서드

```ts
nabi.getJson()                         // 저장용 normalized JSON
nabi.setJson(value)                    // boolean
nabi.getHtml()                         // 게시 HTML
nabi.setHtml(html)                     // boolean, parseHtml 필요
nabi.applyCommand(name, args?, by?)    // boolean
nabi.select(selection)
nabi.undo(); nabi.redo()
nabi.onChange(listener)                // unsubscribe 함수
```

`applyCommand()`의 `by`는 `'keyboard' | 'pointer'`입니다. 선택 없는 mark는 키보드 호출에서 다음 입력에 예약될 수 있지만, 포인터 호출은 대상이 없으면 예약하지 않고 실패합니다. 커스텀 툴바에서 클릭으로 호출할 때는 `by: 'pointer'`를 명시하세요.

## factory와 registry

```ts
const selected = wings().allBasic().use('upload').build()
const { nabi, registry } = createNabiWith(selected)
```

`use()`는 이름·옵션의 오타나 잘못된 shape를 registry 경계에서 바로 거부합니다. `drop()`도 의존성을 끊으면 throw합니다. 이 실패는 부분적으로 조립된 편집기를 계속 쓰지 않기 위한 의도된 계약입니다.

더 자세한 공개 타입·모든 factory·옵션 목록은 배포물의 `public/llms/api-reference.md`에 있는 AI/자동화용 영문 API reference에서도 확인할 수 있습니다. 구현에 앞서 [커스텀 wing](/ko/guide/extend)의 저장·보안 규칙을 확인하는 편이 안전합니다.
