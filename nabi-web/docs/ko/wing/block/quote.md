---
title: 인용
---

# 인용

## 설명

`quoteWing`(이름 `quote`)은 인용 상자(`<blockquote>`)를 소유합니다. `place: 'container'`
이고 `holds: 'blocks'` — 속에 블록이 삽니다. 다른 물건과 마찬가지로 인용 자신도 래퍼 문단
하나를 입고 최상위에 섭니다.

**`allows` 를 안 겁니다.** 인용 속은 최상위와 같은 규칙이라, 표나 그림도 래퍼 문단을 입고
그 안에 설 수 있습니다 — 그런 HTML 을 붙여넣거나 불러오면 그대로 살아남습니다.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["글"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

다만 **넣는 단추는 인용 속으로 안 들어갑니다.** 그림·표·구분선처럼 `insertLump` 로 서는
것들은 언제나 **최상위**에 자리를 잡으므로, 캐럿이 인용 안에 있어도 새 물건은 인용 **뒤**에
섭니다. 인용 속에 넣으려면 붙여넣기로 넣습니다.

단추를 누르면 선택이 걸친 최상위 블록 전부를 인용으로 감쌉니다. 걸린 것이 **전부 이미
인용**일 때만 풀립니다 — 섞여 있으면 통째로 한 번 더 감쌉니다.

줄 앞머리에 `>` 만 있는 상태에서 스페이스를 쳐도 그 줄이 인용이 됩니다 — 이 자동 변환은
**스페이스가 트리거**입니다(Enter 가 아닙니다). 같은 줄에 이어 쓰는 것이기 때문입니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
