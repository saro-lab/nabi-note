---
title: 밑줄 (Underline)
---

# 밑줄 (Underline)

## 설명

`underlineWing`은 밑줄 서식(`<u>`)을 처리하는 인라인 마크 날개입니다.

- HTML 입력 시 `<u>` 태그를 인식하며, HTML 출력 시에도 표준 `<u>` 태그로 변환됩니다.
- 힌트 모드(Shift 2회 연타 후 `U`) 및 단축키(<kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>U</kbd>)를 지원합니다.
- 텍스트를 선택한 상태에서 실행하면 토글 방식으로 동작합니다.
- 밑줄과 링크(`<a>`)는 시각적으로 유사할 수 있으나 독립된 별개의 날개로 동작하며, 동일한 텍스트에 밑줄과 링크가 동시에 적용될 수 있습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
