---
title: 제목
---

# 제목

## 설명

`headingWing`(id `h`) **하나**가 여섯 단계를 다 들고 있습니다. 제목은 별도 노드가 아니라
**문단의 속성**입니다 — 저장값은 `{"w":"p","a":{"h":2}}` 이고, 나갈 때 `<h2>` 가 됩니다.

문단이 그대로 제목이 되므로 정렬·드롭캡 같은 다른 문단 속성과 함께 걸립니다
(`<h2 data-nabi-align="c">`).

## 툴바는 하나, 단계는 상황 줄에서

**툴바 버튼은 `H` 하나뿐입니다.** 문단에서 누르면 제목 1이 되고, 캐럿이 제목 안에 있으면
상황 줄에 `제목`·`H1`~`H6` 칸이 뜹니다 — 지금 몇 단계인지가 눌린 칸으로 보이고, 다른 칸을
누르면 그 단계로 옮겨 갑니다. `제목` 칸을 누르면 문단으로 돌아옵니다.

빈 줄에서 `#`을 단계 수만큼(2단계라면 `##`) 치고 스페이스를 누르면 자동으로 그 단계의 제목이
됩니다 — 친 `#`과 스페이스 자체는 지워집니다.

## 사용 예시

단계 고르개는 `mountContextToolbar` 가 그립니다.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

커맨드로 직접 걸 수도 있습니다.

```ts
nabi.applyCommand('setHeading', { value: 2 })  // 2단계 제목으로
nabi.applyCommand('setHeading', { value: 2 })  // 같은 단계를 다시 — 문단으로 돌아온다
```

여러 문단을 잡고 걸면 **걸린 문단 전부**에 걸립니다. 표·목록처럼 문단 자리를 차지하는 물건은
건너뜁니다 — 제목은 글 문단의 속성이기 때문입니다.

## 데모

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
