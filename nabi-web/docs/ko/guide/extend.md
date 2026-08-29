---
title: 커스텀 wing
description: 저장 가능한 새 문서 어휘를 만들 때 지켜야 할 계약입니다.
---

# 커스텀 wing

custom wing은 단순한 툴바 버튼이 아니라 문서의 새 단어입니다. 구조, 명령, HTML/Markdown, import, 입력 규칙, UI를 선언하고 registry가 조립 전에 검증합니다. 먼저 가능한 한 작은 factory를 고르세요.

```ts
import { simpleMark, createNabiWith, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(
  wings().allBasic().use(exStrong).build(),
)
```

## 무엇을 만들려는가

| 필요 | 권장 factory/구성 |
| --- | --- |
| 값 없는 인라인 mark | `simpleMark()` |
| 제한된 값 하나를 가진 mark | `valueMark()` |
| 자식 없는 블록 객체 | `boxObject()` |
| 목록과 항목 | `listFamily()` |
| 복합 구조·입력·DOM 동작 | 완전한 `Wing` 선언 |

## 이름과 구조

custom `w`는 `ex[A-Z0-9]...` 형식이어야 합니다. 예: `exCallout`. 이 접두사는 미래의 공식 wing 이름과 저장 데이터를 충돌시키지 않는 영구적인 namespace입니다.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

컨테이너는 `holds: 'blocks' | 'inline'`과 `toHtml`이 필요합니다. `parts`를 쓰면 모든 part에 `partHtml`도 필요합니다. `requiresAnyOf`는 적어도 하나의 의존 wing이 있어야 함을 선언합니다.

## 명령과 import의 경계

명령은 순수 함수입니다. DOM을 읽거나 바꾸지 말고, 유효한 새 문서와 selection을 반환하거나 변경할 수 없으면 `null`을 반환하세요. `claim()`은 HTML을 가져올 때만 쓰며, 속성을 모두 검증하고 자기 요소가 아니면 `null`을 반환합니다. `repair()`는 JSON 입력과 명령 뒤에 모두 적용됩니다.

## 확장할 때 유의할 점

- 이름에는 `ex...` namespace를 사용합니다.
- 새 구조를 만들 때는 해당 구조의 HTML builder도 함께 제공합니다.
- 문서에 저장할 속성은 허용할 값의 범위를 검사합니다.
- 사용자 입력 명령은 입력 문서를 직접 바꾸지 않고, 유효한 selection을 반환해야 합니다.
- attach에서는 조합 중인 DOM을 직접 건드리지 않습니다.
- 잘못된 선언이 registry 생성 단계에서 거부되는지도 테스트합니다.

세부 타입과 전체 계약은 [API 지도](/ko/reference/api), 기존 예제는 [커스텀 wing 상세](/ko/wing/custom)에서 확인할 수 있습니다.
