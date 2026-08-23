---
title: 굵게 (Bold)
---

# 굵게 (Bold)

## 설명

`boldWing`은 굵은 글씨 서식(`<b>`)을 처리하는 인라인 마크 날개입니다. 텍스트를 선택하고 툴바의 **B** 버튼을 누르거나 힌트 모드(Shift 2회 연타 후 `B`), 또는 단축키(<kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd>)를 입력하여 서식을 적용합니다.

- HTML 입력 시 `<b>`와 `<strong>`을 모두 인식하며, HTML 출력 시에는 표준 `<b>` 태그로 변환됩니다.
- 텍스트를 선택한 상태에서 실행하면 토글 방식으로 동작합니다. 선택 영역이 이미 굵게 처리되어 있다면 해제되고, 그렇지 않다면 서식이 적용됩니다.
- 텍스트 선택 없이 커서 상태에서 단축키를 누르면 다음 입력될 텍스트에 굵게 서식이 예약 적용됩니다.
- 날개가 등록되어 있지 않으면 `<b>` 태그는 자동으로 제거되고 내부 평문 텍스트만 유지됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
