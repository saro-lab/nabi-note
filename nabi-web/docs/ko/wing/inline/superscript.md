---
title: 위첨자 (Superscript)
---

# 위첨자 (Superscript)

## 설명

`superscriptWing`은 위첨자 서식(`<sup>`)을 처리하는 인라인 마크 날개입니다. 단위의 제곱 표기나 각주 인용 번호 등에 사용합니다.

- HTML 입력 시 `<sup>` 태그를 인식하며, 출력 시에도 `<sup>`로 렌더링됩니다.
- 툴바의 `script` 그룹에 아래첨자 버튼과 함께 배치됩니다.
- 텍스트를 선택한 상태에서 실행하면 토글 방식으로 동작합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, superscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([superscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/superscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
