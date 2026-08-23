---
title: 정렬
---

# 정렬

## 설명

`alignWing`(식별자 `align`)은 문단 및 블록 요소의 텍스트 정렬(왼쪽, 가운데, 오른쪽)을 처리하는 문단 속성 날개입니다.

- 블록 노드에 `data-nabi-align` 속성을 부여합니다 (`<p data-nabi-align="center">`).
- **문단뿐만 아니라 제목(`h1`~`h6`)에도 적용**됩니다 (`<h2 data-nabi-align="c">`).
- 정렬 값은 한 번에 하나만 적용됩니다. 이미 적용된 정렬 버튼을 다시 클릭하면 정렬 속성이 해제되어 기본 정렬로 복원됩니다.
- 문단 중간에서 Enter 키를 눌러 문단을 분할하면 분할된 두 문단 모두 동일한 정렬 속성을 유지합니다.
- **이미지, 표, 유튜브 등 블록 객체의 정렬도 이 날개가 담당**합니다. 블록 객체는 자신을 감싸는 래퍼 문단(`<div data-nabi-p>`) 내부에 위치하므로, 툴바의 정렬 버튼을 통해 블록 객체의 좌/우/가운데 배치를 제어합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
