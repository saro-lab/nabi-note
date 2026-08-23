---
title: 글머리 목록
---

# 글머리 목록

## 설명

`bulletListWing`(식별자 `ul`, 단축키 `L`)은 순서 없는 목록(`<ul>`)을 처리합니다. 목록 항목(`<li>`)은 `parts` 속성으로 내장되어 있으므로 `li`를 별도로 등록할 필요가 없습니다.

```ts
parts: { li: { holds: 'blocks' } }
```

툴바 버튼을 클릭하면 커서가 위치한 블록(또는 선택된 여러 블록)이 글머리 목록으로 전환되며, 다시 클릭하면 일반 문단으로 복원됩니다. 다른 목록 버튼(번호 매기기, 체크리스트 등)을 누르면 해당 목록 유형으로 즉시 변경됩니다.

문단 맨 앞에서 `- `(하이픈과 공백)을 입력해도 목록으로 자동 변환됩니다. 커서 앞의 문자열 패턴을 검사하므로 `- 텍스트` 상태에서 공백을 입력해도 정상 변환되며, 작성 중이던 텍스트는 목록 항목 내용으로 유지됩니다 (단, 문단의 첫 번째 줄에서만 동작합니다).

### 단축키 및 편집 동작

- <kbd>Tab</kbd>: 현재 항목을 바로 위 항목의 하위 목록으로 1단계 들여씁니다. 첫 번째 항목에서는 상위 항목이 없으므로 동작하지 않으며, 목록 내부에서 Tab 키는 공백 문자를 삽입하지 않습니다.
- <kbd>Shift</kbd>+<kbd>Tab</kbd>: 현재 항목을 상위 레벨로 내어씁니다. 최상위 항목에서 내어쓰면 목록에서 빠져나와 일반 문단으로 변환됩니다. 여러 항목을 선택한 상태라면 선택된 항목 전체가 함께 이동합니다.
- **빈 항목에서 <kbd>Enter</kbd> 입력**: 내어쓰기가 수행되며, 최상위 레벨의 빈 항목이었다면 목록이 종료되고 아래에 새 문단이 생성됩니다.
- **항목 맨 앞에서 <kbd>Backspace</kbd> 입력**: 이전 항목의 끝으로 내용이 합쳐집니다. 합칠 이전 항목이 없는 경우 내어쓰기가 수행됩니다. 반대로 항목 맨 끝에서 <kbd>Delete</kbd>를 누르면 다음 항목을 현재 줄로 끌어옵니다.
- 항목 내부(`li`)는 블록 컨테이너이므로 문단(`p`)이 포함되며, 굵게·기울임 등 모든 인라인 서식을 자유롭게 사용할 수 있습니다.
- 태그의 비표준 속성은 정규화 시 제거되며, 목록 내부에 `li`가 아닌 다른 요소가 들어오면 자동으로 `li` 항목으로 감싸서 보정합니다.
- 태스크 체크리스트와 동일하게 `<ul>` 태그를 공유하지만, `data-nabi-list="task"` 속성 유무로 날개가 구분됩니다.

## 마크업 및 중첩 구조

나비트리의 중첩 구조가 HTML에 그대로 반영됩니다. 목록 항목(`li`)은 텍스트가 아닌 블록을 담으므로, 항목 내 텍스트는 `<p>` 문단으로 감싸지고 중첩된 하위 목록은 래퍼 문단(`<div data-nabi-p>`) 내부에 안전하게 배치됩니다.

```html
<li><p>상위 항목</p><div data-nabi-p><ul><li><p>하위 항목</p></li></ul></div></li>
```

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 등록된 날개 목록을 기반으로 registry와 nabi 인스턴스를 생성합니다.
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li`는 `parts`로 자동 등록되므로 배열에 직접 전달하지 않습니다.

## 데모

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
