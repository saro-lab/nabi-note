---
title: 서식 지우기
---

# 서식 지우기

## 설명

`clearFormatWing` 은 **완성된 상수**입니다. 배열에 넣기만 하면 됩니다 — 넘길 옵션이 없습니다.

`place: 'tool'` 이라 문서에 자기 노드를 세우지 않습니다. 커맨드 하나(`clearFormat`)와 툴바
단추 하나가 전부입니다.

- **걷는 목록이 코어에 못박혀 있습니다.** 인라인 마크 열하나(`b`·`i`·`u`·`s`·`sub`·`sup`·
  `hl`·`tc`·`fs`·`tf`·`a`)와 문단 속성 셋(`h` 제목 · `a` 정렬 · `dc` 드롭 캡)입니다.
  호스트가 목록을 관리할 일이 없고, 직접 만든 날개의 마크는 **여기서 안 걷힙니다.**
- **범위를 잡고 누르면** 그 구간의 마크와, 걸친 문단들의 속성을 한 번에 벗깁니다.
- **캐럿만 있으면 한 켜씩** 벗깁니다 — 캐럿이 든 자리에서 **가장 안쪽 마크**부터, 그 마크가
  이어지는 구간만큼. 벗길 마크가 없으면 그때 문단 속성을 걷습니다.
- **첨부 링크는 안 벗깁니다** — `file` 속성을 단 링크(`a`)는 어디서든 불가침입니다. 껍데기를
  벗기면 첨부가 죽은 평문이 되기 때문입니다.
- **물건을 담은 문단의 정렬은 남습니다.** 그림·표를 담은 래퍼 문단에서 정렬(`a`)만은 안
  걷힙니다 — 서식을 지우려다 그림이 왼쪽으로 튀는 자리를 막습니다.
- 벗길 것이 없으면 커맨드가 `null` 을 답합니다. 되돌리기 지점이 안 쌓입니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
