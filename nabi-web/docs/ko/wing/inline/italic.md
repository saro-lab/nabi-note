---
title: 기울임 (Italic)
---

# 기울임 (Italic)

## 설명

`italicWing`은 이탤릭체 서식(`<i>`)을 처리하는 인라인 마크 날개입니다. 강조나 외래어 등 텍스트의 어조를 구별할 때 사용합니다.

- HTML 입력 시 `<i>`와 `<em>`을 모두 인식하며, HTML 출력 시에는 표준 `<i>` 태그로 변환됩니다.
- 힌트 모드(Shift 2회 연타 후 `I`) 및 단축키(<kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>I</kbd>)를 지원합니다.
- 텍스트를 선택한 상태에서 실행하면 토글 방식으로 동작합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
