---
title: 취소선
---

# 취소선

## 설명

`strikeWing`은 취소선 서식(`<s>`)을 처리하는 인라인 마크 날개입니다.

- HTML 입력 시 `<s>`, `<strike>`, `<del>`을 모두 인식하며, HTML 출력 시에는 표준 `<s>` 태그로 변환됩니다.
- 힌트 모드 단축키는 `S`입니다.
- 텍스트를 선택한 상태에서 실행하면 토글 방식으로 동작합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
