---
title: 접기 (Details)
---

# 접기 (Details)

## 설명

`detailsWing`(식별자 `details`, 단축키 `D`)은 아코디언 접기 블록(`<details>` + `<summary>`)을 처리합니다. 요약줄(`<summary>`)은 `parts` 속성으로 내장되어 있어 별도로 등록할 필요가 없습니다.

```ts
parts: { summary: { holds: 'inline' } }
```

툴바 버튼을 클릭하면 커서가 위치한 블록들이 접기 블록으로 감싸이며 상단에 빈 요약줄이 생성됩니다. 요약줄에서 Enter 키를 누르면 본문 내용 영역으로 이동합니다 (요약줄 내부에서는 줄바꿈으로 분할되지 않습니다).

**에디터 편집 화면에서도 실제 저장 상태 그대로 렌더링됩니다.** 접힌 상태(`open` 미설정)로 저장된 블록은 에디터에서도 접힌 채로 로드되며, 좌측 화살표 아이콘을 클릭하여 언제든 펼치거나 접을 수 있습니다 (화살표 클릭 시 나비트리의 `o` 속성이 즉시 변경됩니다). 블록을 접을 때 커서가 본문 내부에 있었다면 커서는 블록 외부로 안전하게 이동합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
