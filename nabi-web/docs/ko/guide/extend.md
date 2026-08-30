---
title: 커스텀 날개
description: 저장 가능한 새 문서 기능을 만들 때 지켜야 할 계약과 구현 순서입니다.
---

# 커스텀 날개

커스텀 날개는 툴바 버튼 하나를 더하는 기능이 아닙니다. 문서에 저장될 구조, 명령, HTML과
Markdown 변환, 가져오기 규칙, 화면 동작을 한 선언으로 묶는 확장 단위입니다. registry는
편집기를 만들기 전에 선언을 검사하므로, 잘못된 구조가 문서에 섞이는 일을 막습니다.

## 먼저 가장 작은 factory를 찾습니다

일반적인 서식은 전체 선언을 처음부터 만들 필요가 없습니다. 값 없는 인라인 서식에는
`simpleMark()`, 제한된 값을 가진 서식에는 `valueMark()`, 자식 없는 블록에는 `boxObject()`,
목록에는 `listFamily()`를 사용합니다.

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

## 종류별로 직접 만들어 보기

아래 예시는 서로 다른 저장 구조를 보여 줍니다. 처음에는 factory 하나를 골라 등록하고,
`getJson()`과 `getHtml()` 결과를 확인하세요. 기능을 화면에서 삽입하거나 바꾸려면 그다음에
명령과 버튼을 더합니다.

### 1. 값 없는 인라인 서식: 강조 표시

글자를 감싸기만 하는 기능에는 `simpleMark()`가 맞습니다. 이 예시는 문서에 `exStrong`을
저장하고 HTML에서는 `<strong>`으로 출력합니다.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true`를 주면 서식 지우기에서 이 mark도 제거할 수 있습니다. 버튼을 넣기 전에는
`nabi.applyCommand()` 또는 다른 커스텀 명령으로 적용합니다. 게시 화면 CSS는
`.nabi-content strong`처럼 편집기와 같은 선택자를 쓰면 됩니다.

### 2. 값이 있는 인라인 서식: 상태 라벨

색, 크기, 상태처럼 허용 값 중 하나를 골라야 할 때는 `valueMark()`를 사용합니다. 값은 JSON의
`a.v`에 저장되고 목록 밖 값은 `repair()` 단계에서 제거됩니다.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

저장 예시는 `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["중요"] }`입니다.
CSS는 저장된 값 선택자로 게시 화면도 함께 바꿉니다. 값 목록을 줄이면 기존 문서의 그 밖 값도
읽을 때 사라질 수 있으므로, 이미 저장한 문서가 있다면 값을 함부로 빼지 마세요.

### 3. 자식 없는 블록: 알림 구분선

그림, 영상, 구분선처럼 자식이 없는 독립 블록은 `boxObject()`로 만듭니다. 속성이 전혀 없는
구분선은 가장 작은 예시입니다.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

주소나 폭처럼 속성이 필요한 블록이면 `attrs`에 값 검사 함수를 선언하고, 반드시 있어야 하는
값은 `requires`에 넣습니다. 검사할 수 없는 값을 기본값으로 바꾸기보다 `null`로 거절하는 편이
저장 데이터와 화면이 어긋나지 않습니다.

### 4. 여러 문단을 담는 블록: 안내 상자

본문을 담는 블록에는 직접 `container` 선언을 사용합니다. `holds: 'blocks'`는 문단, 목록,
이미지 같은 블록 자식을 받는다는 뜻입니다.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

이 선언만으로는 문단을 안내 상자 안으로 넣는 명령이 생기지 않습니다. 선택한 문단을 감싸는
순수 명령을 `commands`에 추가하고, 그 명령을 실행하는 `button`을 선언해야 편집기 UI에서
사용할 수 있습니다.

### 5. 목록과 항목을 함께 만드는 기능

목록은 부모와 항목이 항상 짝을 이루므로 `listFamily()`를 사용합니다. 아래 예시는 `<ul>`과
`<li>`를 만드는 가장 작은 사용자 목록입니다.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()`는 목록 안에 항목이 아닌 블록이 들어와도 항목으로 감싸 구조를 복구합니다.
체크 여부처럼 항목별 값을 저장하려면 `itemDecl`과 `repairItem`을 추가합니다.

### 등록 순서

여러 날개를 함께 쓸 때는 한 번에 등록합니다. 서버 렌더링도 같은 순서와 선언을 사용해야
같은 JSON에서 같은 HTML이 나옵니다.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ko' })
```

## 이름과 저장 구조를 정합니다

문서에 기록되는 이름은 `ex[A-Z0-9]...` 형식이어야 합니다. `exCallout`처럼 `ex`로 시작하면
나중에 공식 날개가 추가되어도 저장한 문서의 뜻이 바뀌지 않습니다.

`place`는 저장 구조를 결정합니다. 문장 안을 감싸는 서식은 `mark`, 자식 없는 독립 블록은
`void`, 자식을 담는 블록은 `container`입니다. 문단 속성은 `attr`, 문서를 만들지 않는 화면
도구는 `tool`입니다. `container`에는 `holds: 'blocks' | 'inline'`과 `toHtml()`이 필요합니다.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, `parts`는 저장 구조의 제약을 선언하는 옵션입니다.
`parts`를 쓰면 각 part에 맞는 `partHtml`도 반드시 선언합니다. 값 선택형 날개에는
`attrKey`와 `attrValues`를 사용해 허용 범위를 좁힙니다.

## 선언 옵션 전체

필요한 것만 선언하면 됩니다. factory를 쓸 때는 factory가 정한 값을 다시 적지 않습니다.

| 구분 | 옵션 | 용도 |
| --- | --- | --- |
| 기본 | `w`, `place`, `basic`, `styles` | 이름, 구조 종류, 기본 날개 포함 여부, 기본 CSS |
| 구조 | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | 자식 종류, Enter 동작, 허용 속성, boolean 속성 |
| 구조 | `parts`, `allows`, `noAlign`, `requiresAnyOf` | 내부 part, 허용 자식, 정렬 금지, 의존 날개 |
| 값 선택 | `attrKey`, `attrValues`, `currentValue` | 저장할 값의 키·목록과 현재 선택값 판정 |
| 명령·입력 | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | 명령, 키 처리, Escape·연속 키·자동 변환 |
| 화면 연결 | `attach` | surface에 필요한 DOM 동작과 해제 처리 |
| 변환 | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML·Markdown 출력 |
| 가져오기·복구 | `claim`, `ioFilter`, `repair`, `partRepair` | HTML 가져오기, 파일 처리, JSON 검증·복구 |
| UI | `button`, `buttons`, `context` | 툴바와 상황 도구 선언 |
| 서식 지우기 | `clearable` | 서식 지우기 대상 여부 |

`w`와 `place`는 항상 필요합니다. `mark`, `void`, `container`처럼 문서 노드를 만드는 날개는
`toHtml()`도 필요합니다. `container`에는 `holds`가, `parts`에는 같은 이름의 `partHtml`이
필요합니다. `attr`과 `tool`은 문서 노드를 만들지 않으므로 이 규칙이 다릅니다.

## HTML, Markdown, JSON을 함께 지킵니다

`toHtml()`은 저장 노드를 화면 HTML로 바꾸고 `toMd()`는 Markdown 내보내기를 담당합니다.
Markdown 변환을 선언하지 않으면 생성한 HTML이 남아 정보가 사라지지 않습니다. HTML을 다시
읽어야 하면 `claim()`에서 자기 요소와 속성만 검사해 노드로 바꿉니다.

`repair()`는 JSON을 불러올 때와 명령 실행 뒤에 다시 실행됩니다. 허용하지 않는 속성값은 고쳐
반환하고, 살릴 수 없는 노드는 `null`을 반환하세요. HTML은 `ctx.element()`, `ctx.escape()`,
`ctx.url()` 같은 context 함수를 사용해 조립합니다. 문자열을 이어 붙여 태그·속성·URL 검증을
우회하면 안 됩니다.

## 명령과 화면 동작을 나눕니다

명령은 문서와 선택 위치를 받아 새 문서와 그 안에 있는 선택 위치를 반환하는 순수 함수입니다.
DOM을 읽거나 바꾸지 않으며, 바꿀 수 없는 요청에는 `null`을 반환합니다. 명령 이름은
`insertNote`처럼 동사로 시작하는 lower camel case를 사용합니다.

표의 드래그 선택처럼 명령으로 표현하기 어려운 화면 동작은 `attach(host)`에 둡니다. event
listener나 속성을 바꾼 직후 `host.onDispose()`로 원복 함수를 등록해야 이후 설정이 실패해도
정리됩니다. 조합 중인 텍스트 DOM이나 surface의 선택 매핑을 직접 바꾸지 마세요.

툴바와 상황 도구는 `button`, `buttons`, `context` 선언으로 만듭니다. 같은 명령 규칙을
애플리케이션 UI에서 별도로 구현하면 툴바와 문서 모델이 어긋날 수 있습니다.

## CSS 스타일

날개의 `styles`에는 필요한 기본 CSS를 선언할 수 있습니다. 등록된 날개의 CSS는
`nabi-note/nabi.css`에 포함됩니다. 선택한 registry만 런타임에 조립하는 경우에는 브라우저에서
`collectSheets()`와 `injectSheets()`를 사용할 수 있지만 SSR에서는 CSS 파일을 링크합니다.

게시 화면도 편집기와 같은 클래스와 data 속성으로 CSS를 적용합니다. 편집기에서 쓸 선택자와
게시 화면에서 쓸 선택자를 구분하고, `[data-key]` 편집 노드의 구조나 `display`,
`white-space`를 바꾸지 마세요. CSS는 모양만 바꾸고 문서 구조와 캐럿 매핑에는 손대지 않아야
합니다.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

`toHtml()`이 만든 class나 data 속성만 겨냥하면 같은 JSON을 편집기와 게시 화면에서 안전하게
다르게 꾸밀 수 있습니다. 서비스 전용 변경은 `.article-body .ex-callout`처럼 더 좁은 선택자로
분리하세요.

## 확인할 것

저장한 JSON을 다시 불러도 같은 구조와 HTML이 나오는지 확인하세요. 잘못된 이름, 중복 명령,
누락된 builder, 충족되지 않은 의존성을 registry가 거부하는지도 테스트합니다. HTML 가져오기와
`repair()`의 잘못된 입력, 명령의 선택 위치, SSR 출력, CSS가 적용된 게시 화면까지 확인하면
안전합니다.

전체 타입과 factory 인수는 설치한 패키지의 타입 선언과
[영문 API reference](https://nabi.saro.me/llms/api-reference.md)에서 확인할 수 있습니다.
