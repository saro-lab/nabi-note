---
title: 번호 목록
---

# 번호 목록

## 설명

`orderedListWing`(식별자 `ol`, 단축키 `N`)은 순서 있는 번호 목록(`<ol>`)을 처리합니다. 목록 항목(`<li>`)은 `parts` 속성으로 내장되어 있어 별도로 등록할 필요가 없습니다.

```ts
parts: { oli: { holds: 'blocks' } }
```

버튼을 클릭하면 커서가 위치한 블록(또는 선택된 여러 블록)이 번호 목록으로 전환되며, 다시 클릭하면 일반 문단으로 복원됩니다. 다른 목록 버튼을 누르면 해당 목록 유형으로 즉시 변경됩니다.

문단 맨 앞에서 `1. `(숫자, 마침표, 공백)을 입력해도 번호 목록으로 자동 변환됩니다. 시작 숫자는 자유롭게 입력할 수 있으며 최대 9자리까지 인식합니다.

### 단축키 및 편집 동작

- <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>으로 들여쓰기/내어쓰기, 빈 항목에서 <kbd>Enter</kbd> 입력 시 목록 종료, 항목 맨 앞에서 <kbd>Backspace</kbd> 입력 시 이전 항목과 병합되는 동작은 [글머리 목록](./bullet-list)과 동일합니다.
- 각 항목의 번호는 HTML `<ol>` 태그가 브라우저에서 동적으로 렌더링하므로, 중간에 항목을 삽입하거나 삭제해도 번호가 자동으로 재계산됩니다.
- 중첩 목록 구조는 래퍼 문단(`<div data-nabi-p>`)을 통해 안전하게 중첩 렌더링됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
