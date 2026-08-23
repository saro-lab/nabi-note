---
title: 체크리스트 (태스크 목록)
---

# 체크리스트 (태스크 목록)

## 설명

`taskListWing`(식별자 `tl`, 단축키 `K`)은 인터랙티브 할 일 체크리스트를 처리합니다. HTML 출력 시 `data-nabi-list="task"` 및 각 항목별 `data-nabi-checked` 속성으로 체크 상태를 표현합니다.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

나비트리에서 체크 상태는 불리언 속성 `ck: 1`로 저장되며, 체크 해제 상태는 속성이 생략됩니다.

버튼을 클릭하면 현재 블록이 체크리스트 항목으로 변환됩니다. 문단 시작 위치에서 `[ ] ` 또는 `[x] `를 입력해도 체크리스트로 자동 변환되며, `[x] ` 입력 시 처음부터 체크된 상태로 생성됩니다.

체크박스 UI는 `contenteditable` 내부의 커서 간섭을 방지하기 위해 가상 요소로 구현되어 있습니다. 체크된 항목은 취소선과 흐린 텍스트 스타일이 적용됩니다.

### 체크박스 클릭 동작

체크박스 마커 영역을 클릭하면 토글 동작이 실행되며, 본문 텍스트 영역을 클릭하면 텍스트 커서가 정상 배치됩니다. 오른쪽에서 왼쪽으로 쓰는 RTL 언어 환경에서도 체크박스 위치가 자동으로 정렬됩니다. 이 동작은 날개의 `attach` 훅으로 내장되어 있습니다.

<kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> 들여쓰기, 빈 항목에서 <kbd>Enter</kbd> 시 목록 종료 동작은 [글머리 목록](./bullet-list)과 동일합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
