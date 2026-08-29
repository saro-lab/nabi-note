---
title: 커스텀 wing
description: 저장 가능한 새 문서 기능을 만들 때 지켜야 할 계약입니다.
---

# 커스텀 wing

커스텀 wing은 툴바 버튼 하나를 더하는 기능이 아닙니다. 문서에 저장될 새 구조와 명령, HTML 변환, 가져오기 규칙, 필요한 UI를 한 선언에 담는 확장 단위입니다. registry는 편집기를 만들기 전에 이 선언을 검사하므로, 잘못된 구조가 실행 중에 조용히 섞이지 않습니다.

## 먼저 작은 factory를 찾습니다

일반적인 서식은 완전한 wing을 처음부터 만들 필요가 없습니다. 값 없는 인라인 서식에는 `simpleMark()`, 제한된 값을 가진 서식에는 `valueMark()`, 자식이 없는 블록 객체에는 `boxObject()`, 목록과 항목의 조합에는 `listFamily()`가 맞습니다.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(
  wings().allBasic().use(exStrong),
)
```

`wings().use()`에 넘긴 custom wing은 선택한 기본 wing과 함께 registry에 등록됩니다. `.build()`를 호출해도 되지만, `createNabiWith()`는 builder를 바로 받을 수 있습니다.

## 이름과 구조를 정합니다

문서에 기록되는 custom wing 이름은 `ex[A-Z0-9]...` 형식이어야 합니다. 예를 들어 `exCallout`처럼 `ex`로 시작하는 이름을 사용합니다. 이 접두사는 앞으로 공식 wing이 추가되어도 저장한 문서의 의미가 바뀌지 않게 하는 namespace입니다.

컨테이너 wing은 어떤 자식을 담는지와 HTML을 함께 선언합니다.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`container`에는 `holds: 'blocks' | 'inline'`과 `toHtml`이 필요합니다. 내부 part를 선언했다면 각 part의 `partHtml`도 필요합니다. `requiresAnyOf`는 함께 등록되어야 하는 wing을 표현할 때 사용합니다.

## 명령과 가져오기를 분리합니다

명령은 DOM을 읽거나 바꾸지 않는 순수 함수입니다. 받은 문서와 selection을 직접 수정하지 말고, 유효한 새 문서와 그 안에 존재하는 selection을 반환하세요. 바꿀 수 없는 요청은 `null`을 반환합니다.

HTML을 가져오는 `claim()`도 보안 경계입니다. 자기 요소가 아니면 `null`을 반환하고, 속성은 모두 검사한 뒤에만 문서 노드로 바꿉니다. `repair()`는 JSON을 불러올 때와 명령 실행 뒤에 구조와 값을 다시 확인하는 자리입니다. 저장되는 값은 늘 허용 범위를 정해 두는 편이 좋습니다.

## 화면 동작은 attach에 둡니다

표의 드래그 선택처럼 순수 명령만으로 표현하기 어려운 화면 동작은 `attach(host)`에 둡니다. attach는 surface root, editor, `pathOfKey()`를 받고 해제 함수를 반환합니다. 조합 중인 텍스트 DOM을 직접 고치거나, surface가 관리하는 선택 매핑을 다시 구현하지 마세요.

툴바와 상황 도구는 wing의 `button`, `buttons`, `context` 선언으로 표현합니다. 애플리케이션에서 같은 명령 규칙을 별도로 구현하면 툴바와 저장 모델의 동작이 어긋날 수 있습니다.

## 구현을 마치기 전에

custom wing은 저장 데이터의 어휘가 되므로, JSON을 다시 불러와도 같은 구조와 HTML이 나오는지 확인하세요. 잘못된 이름, 중복 명령, 누락된 builder, 충족되지 않은 의존성을 registry가 거부하는지도 테스트하는 편이 좋습니다. 공개 타입과 factory의 전체 모양은 [API 지도](/ko/reference/api)에서 찾을 수 있습니다.
