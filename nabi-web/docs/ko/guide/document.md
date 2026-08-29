---
title: NABI TREE
description: NABI NOTE가 문서를 저장하고 검증하는 JSON 구조를 설명합니다.
---

# NABI TREE

NABI TREE는 편집 가능한 문서를 표현하는 JSON 배열입니다. 화면의 DOM을 그대로 저장하지 않고, 등록된 날개가 이해하는 작은 문서 어휘만 남깁니다. 같은 JSON으로 편집기를 다시 열거나 서버에서 게시용 HTML을 만들 수 있습니다.

```json
[
  { "w": "p", "ch": ["안녕하세요"] },
  { "w": "p", "a": { "h": 2 }, "ch": ["두 번째 제목"] }
]
```

`w`는 문서 요소의 이름이고 `ch`는 자식입니다. 빈 요소에서는 `ch`가 비어 있거나 생략될 수 있습니다. 내부에서 선택을 추적할 때 쓰는 값은 `getJson()` 결과에 포함되지 않습니다.

## 문단과 객체

본문과 제목은 모두 `p` 문단입니다. 제목, 정렬, 드롭캡은 문단의 속성으로 저장됩니다. 목록, 표, 이미지처럼 독립된 객체는 문단이 한 겹 감싸므로 객체 앞뒤에 캐럿을 놓을 수 있고, 정렬도 그 문단에 적용됩니다.

이 구조를 직접 외워서 JSON을 만들 필요는 없습니다. 편집 결과는 `getJson()`으로 읽고, 외부에서 받은 값은 `setJson()`으로 넣으면 등록된 날개가 구조와 속성을 정규화합니다.

## 날개가 문서 어휘를 정합니다

굵게 날개를 등록하면 `b` 마크를, 표 날개를 등록하면 표 구조를 읽고 쓸 수 있습니다. 등록되지 않은 이름을 임의의 HTML 요소로 내보내지는 않습니다. 서버와 브라우저에서 같은 문서를 다룬다면 HTML 출력에 영향을 주는 날개와 옵션도 같게 맞춥니다.

```ts
import { createNabiWith, wings } from 'nabi-note'

const { nabi } = createNabiWith(
  wings().allBasic().drop('youtube'),
)
```

필요한 날개를 고르는 방법은 [날개 알아보기](/ko/guide/features)에서 확인할 수 있습니다.

## 외부 데이터는 불러오는 문에서 검증합니다

JSON과 HTML은 모두 신뢰하지 않는 입력으로 다룹니다. `setJson()`은 올바른 문서만 받아들이고, 잘못된 값이면 `false`를 반환한 뒤 기존 문서를 유지합니다. HTML을 가져오려면 브라우저 파서도 연결해야 합니다.

```ts
import { createNabiWith, parseNodes, wings } from 'nabi-note'

const { nabi } = createNabiWith(wings().allBasic(), {
  parseHtml: parseNodes,
})

const loaded = nabi.setHtml('<p>가져온 내용</p>')
```

HTML 가져오기는 등록된 날개의 claim과 기본 구조 규칙을 거칩니다. 스크립트나 폼처럼 문서에 들어올 수 없는 요소는 제거되고, URL도 허용된 형식인지 확인합니다. 다만 이 경계가 게시 서비스의 권한 검사, 콘텐츠 보안 정책(CSP), 업로드 서버 검증을 대신하지는 않습니다. 커스텀 날개에서 원시 HTML을 직접 조립한다면 그 코드도 신뢰 경계 안에 들어옵니다.

입력과 출력 함수의 역할은 [입출력](/ko/guide/storage), 서버에서 HTML을 만드는 방법은 [SSR·viewer·diff](/ko/guide/rendering)에서 이어서 설명합니다.
