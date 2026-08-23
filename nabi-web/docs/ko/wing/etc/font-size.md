---
title: 글자 크기
---

# 글자 크기

## 설명

`fontSizeWing`(식별자 `fs`)은 텍스트 글자 크기(`<span data-nabi-size="lg">`)를 조절하는 값 기반 인라인 마크 날개입니다.

지원하는 크기 단계는 `xs`, `sm`, `lg`, `xl` 4단계이며, 기본 크기는 속성이 없는 일반 텍스트 상태입니다.

- 메인 툴바 버튼을 클릭하면 기본적으로 **`lg`(크게)** 크기가 적용됩니다.
- 커서가 글자 크기 마크 내부에 위치하면 동적 컨텍스트 툴바에 슬라이더(`range`)가 표시되며, '기본', '아주 작게', '작게', '크게', '아주 크게' 단계를 손쉽게 선택할 수 있습니다. 슬라이더를 '기본'으로 이동하면 마크 서식이 해제됩니다.
- 텍스트 선택 영역 없이 커서 상태에서 크기를 선택할 경우, 해당 문단 전체를 대상으로 크기 서식이 적용됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
