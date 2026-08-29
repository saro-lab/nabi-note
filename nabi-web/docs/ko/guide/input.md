---
title: 입력과 캐럿
description: 조합 입력, 캐럿, 편집 DOM을 안정적으로 유지하는 방법입니다.
---

# 입력과 캐럿

한글, 일본어, 중국어처럼 글자가 조합되는 입력에서는 키보드가 완성 전 텍스트를 잠시 직접 관리합니다. NABI NOTE의 편집 surface는 그동안 화면 DOM과 캐럿을 건드리지 않고, 조합이 끝난 뒤 문서 모델과 화면을 맞춥니다. 그래서 편집 영역을 호스트 코드가 다시 그리거나 바꾸지 않는 것이 중요합니다.

## surface가 맡는 일

`mountSurface()`는 편집 영역에 `contenteditable`과 `.nabi-editing`을 붙이고, 입력 이벤트, 선택 위치, 붙여넣기, 조합 입력을 함께 관리합니다. 평소에는 NABI TREE가 기준이지만, 조합 중에는 브라우저의 실제 DOM을 우선합니다.

이 역할을 나누지 않으면 입력 중인 글자가 되돌아가거나, 화면의 캐럿과 실제 삽입 위치가 달라질 수 있습니다. 문서를 바꿀 때는 `setJson()`, `setHtml()`, `applyCommand()`처럼 공개 API를 사용하세요. `.nabi-content`의 `innerHTML`을 직접 바꾸거나 조합 중에 `redrawAll()`을 호출하면 안 됩니다.

```ts
const surface = mountSurface({ nabi, registry, root: content, locale: 'ko' })

// 화면을 떠날 때에만 surface가 만든 이벤트와 편집 상태를 해제합니다.
surface.unmount()
```

## 스타일을 바꿀 때

글꼴, 색, 여백은 [스타일과 로케일](/ko/guide/style)의 `--nabi-*` 토큰으로 조정하는 편이 안전합니다. 편집 중인 `[data-key]` 노드의 `display`나 `white-space`를 바꾸거나, 텍스트 안에 pseudo-element를 추가하면 DOM 좌표와 문서 선택 위치가 서로 달라질 수 있습니다.

모바일에서는 입력 글자 크기를 16px 이상으로 유지하는 것이 좋습니다. iOS Safari의 자동 확대를 피할 수 있고, 화면 확대가 캐럿 위치를 가리는 상황도 줄어듭니다.

## 드롭캡이 있는 문단

게시 화면의 드롭캡은 CSS `::first-letter`로 표시합니다. 그러나 편집 화면에서 같은 방식을 쓰면 WebKit과 Chromium이 첫 글자 주변의 캐럿 좌표를 잘못 계산할 수 있습니다. NABI NOTE는 편집 HTML에서 첫 글자 단위를 실제 `[data-nabi-dropcap-letter]` span으로 감싸 같은 모양을 냅니다.

따라서 `.nabi-editing` 안에 `::first-letter` 규칙을 추가하거나 이 span을 다른 요소로 바꾸지 마세요. 이 span은 화면 표시용이며 저장 HTML과 복사한 같은 문서의 내용에는 남지 않습니다.

## 입력 오류를 확인할 때

모바일 입력 문제는 기종만으로 구분하기 어렵습니다. OS와 브라우저, 키보드 앱, 입력 언어, 입력한 순서, 기대한 문자열과 실제 문자열을 함께 확인하세요. 화면상 캐럿 위치와 실제 글자가 들어간 위치도 기록하면 IME 문제와 선택 매핑 문제를 나누어 볼 수 있습니다.
