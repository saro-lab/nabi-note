---
title: 정렬
---

# 정렬

## 설명

`alignWing`(id `align`) **하나**가 왼쪽·가운데·오른쪽 셋을 다 들고 있습니다. 툴바에는
상수입니다 — 하나로 묶는 `align()` 팩토리가 아니라, 값마다 버튼이 따로 있습니다.
블록에 `data-nabi-align` 속성을 답니다.

- 태그는 그대로 두고 속성만 붙는 **블록 속성**입니다. `<p data-nabi-align="center">`
  처럼 문단 자체는 바뀌지 않습니다.
- **문단과 제목에 걸립니다.** `<h2 data-nabi-align="c">` 도 됩니다 — 제목도
  여느 글줄이기 때문입니다. 문단 속성 넷 중 정렬만 그렇고, 글자 크기·서체·드롭 캡은
  여전히 문단 전용입니다.
- 값은 한 번에 하나뿐입니다 — 왼쪽 정렬을 걸고 가운데 정렬을 누르면 왼쪽이 떨어지고
  가운데가 붙습니다. 걸린 값을 다시 누르면 속성이 통째로 떨어집니다(기본 정렬로
  되돌아감).
- **Enter 는 정렬을 양쪽에 그대로 물려줍니다.** 문단을 가르면 두 문단 다 같은 정렬을
  입고 나옵니다 — 제목(`h`)이 빈 쪽에서 떨어지고 드롭 캡(`dc`)이 한쪽만 따라가는 것과
  달리, 정렬에는 그런 예외가 없습니다.
- 셋은 한 날개의 **단추 셋**입니다(`buttons`) — 따로 끄고 켤 수 없고, `alignWing` 하나만
  wings 배열에 넣습니다.
- **표·이미지·유튜브의 자리도 이 날개가 답니다.** 물건은 자기를 담은 래퍼 문단 속에 살고,
  그 문단이 정렬을 드는 것이라 "가운데 정렬된 그림" 은 곧 "가운데 정렬된 문단 안의 그림"
  입니다. 그래서 그림·표의 상황 줄에는 정렬 칸이 아예 없고, 정렬만은 물건 위에 캐럿이
  있어도 툴바에서 안 숨습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
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
