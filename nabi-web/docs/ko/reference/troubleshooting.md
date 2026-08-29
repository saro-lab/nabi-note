---
title: 문제 해결
description: 증상에서 원인 범위를 좁히고, 먼저 확인할 계약을 찾습니다.
---

# 문제 해결

아래 순서로 좁히면 대개 호스트 통합 문제와 문서 모델 문제를 빠르게 구분할 수 있습니다.

| 증상 | 먼저 확인 | 해결 방향 |
| --- | --- | --- |
| 입력 글자가 섞이거나 캐럿이 튐 | IME 조합 중 DOM 변경 여부 | `innerHTML` 교체·강제 redraw·편집 pseudo-element 제거 |
| 드롭캡 근처 커서가 이상함 | 편집 화면에 `::first-letter` 추가했는지 | 패키지의 display-only span 방식만 사용 |
| HTML 불러오기가 실패 | `parseHtml: parseNodes`, 잠금 상태 | parser 연결, `false`일 때 기존 문서 유지 |
| 저장 뒤 화면이 달라짐 | JSON이 아닌 editor HTML 저장 여부 | `getJson()`만 저장하고 다시 `setJson()` |
| SSR hydrate가 전체 다시 그림 | wing 순서·옵션·직접 자식 DOM | 서버/브라우저 registry를 동일하게 |
| 업로드 결과가 사라짐 | `upload`와 `img`/`a`, 서버 응답 URI | 의존 wing과 mount, 실패 응답 처리 |
| diff 기준이 기대와 다름 | 마지막 loaded 문서 | 저장 시점 JSON을 별도 비교 |

## 재현할 때 함께 기록할 정보

- 패키지 버전과 브라우저, OS, 로케일을 기록합니다.
- 선택한 wing 목록과 `createNabiWith()` 옵션을 기록합니다.
- 입력 전 JSON과 입력 순서, 실제 결과 JSON을 함께 남깁니다.
- 모바일에서는 키보드 앱과 조합 언어도 기록합니다.
- 커스텀 CSS, attach와 `onChange` 콜백을 잠시 끈 결과도 비교합니다.

## 안전한 진단 코드

```ts
console.log({
  json: nabi.getJson(),
  selection: nabi.getSelection(),
  changed: nabi.isChanged(),
  wings: registry.wings.map((wing) => wing.w),
})
```

로그를 위해 편집 surface의 DOM을 바꾸지 마세요. 문제를 확인하려면 JSON과 selection을 읽고, DOM은 관찰만 하세요.
