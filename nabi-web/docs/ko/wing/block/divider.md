---
title: 구분선
---

# 구분선

## 설명

`dividerWing`(이름 `hr`)은 `<hr>` 하나를 소유합니다. **`place: 'void'`** — 속이 없는
물건이라 캐럿이 안으로 들어갈 자리가 없습니다. 구분선 바로 앞이나 뒤에서 Backspace·Delete 를
누르면 그 블록 하나가 통째로 사라지고, 범위를 걸어 선택해도 같은 결과입니다.

단추를 누르면 구분선이 **자기 래퍼 문단을 입고** 섭니다. 빈 문단 하나가 함께 생기지는
않습니다 — 캐럿은 그 래퍼 문단 위, 구분선 바로 뒤에 앉습니다.

서는 자리는 캐럿이 있던 문단에 글이 있느냐로 갈립니다.

| 캐럿이 있던 곳 | 결과 |
|---|---|
| 글이 있는 문단 | 그 문단 **뒤에** 선다 |
| 빈 문단 | 그 문단을 **갈아탄다** — 빈 줄이 하나 남지 않는다 |

빈 문단을 갈아탈 때 그 문단이 들고 있던 정렬은 그대로 살아남습니다.

줄 앞머리에 하이픈 셋 이상(`---`)만 있는 상태에서 Enter 를 눌러도 같은 결과입니다 — 이
자동 변환은 **Enter 가 트리거**입니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
