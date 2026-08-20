---
title: 접기
---

# 접기

## 설명

`detailsWing`(이름 `details`, 단축키 `D`)은 접기 상자(`<details>` + `<summary>`)를
소유합니다. 요약줄은 `parts` 로 함께 데려오므로 따로 등록하지 않습니다 — 배열이 아니라
레코드입니다.

```ts
parts: { summary: { holds: 'inline' } }
```

단추를 누르면 캐럿이 걸친 블록들이 새 접기 상자로 감싸이고, 빈 요약줄이 맨 앞에 섭니다.
요약줄에서 Enter 를 누르면 내용으로 내려갑니다(요약줄 자체는 안 갈라집니다).

**편집기가 저장될 모습 그대로 그립니다.** 접힌 채로 저장된 상자는 편집기에서도 접혀 있고,
삼각형을 누르면 그 자리에서 펼치고 접힙니다 — 그 누름이 곧 저장값(`o`)을 바꿉니다. 접으면서
캐럿이 안에 있었다면 캐럿은 상자 밖으로 나옵니다.

::: tip 상황 줄이 없습니다
예전에는 **펼친 채로 저장** · **접은 채로 저장** 단추 둘이 있었습니다. 화면이 늘 펼쳐
그리던 시절에는 어느 쪽으로 저장될지 말할 길이 그것뿐이었기 때문입니다. 이제 화면이 저장값
그대로 그리고 삼각형이 그것을 바꾸므로, 같은 말을 두 번 하는 자리가 되어 걷었습니다.
:::

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
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
