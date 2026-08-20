---
title: 번호 목록
---

# 번호 목록

## 설명

`orderedListWing`(이름 `ol`, 단축키 `N`)은 `<ol>`을 소유합니다. 항목은 `parts`로 함께
데려오므로 `oli`를 따로 등록하지 않습니다 — 배열이 아니라 레코드입니다.

```ts
parts: { oli: { holds: 'blocks' } }
```

버튼을 누르면 캐럿이 든 블록(또는 선택에 걸친 블록들)을 번호 목록으로 감싸고,
다시 누르면 풀립니다. 다른 목록 단추를 누르면 그 갈래로 갈아입습니다.

줄 앞머리에 숫자와 마침표를 치고 스페이스를 눌러도(`1. `) 같은 결과입니다. **숫자는
몇이든 시작으로 인정하되 자릿수는 아홉까지**이고(`1234567890. `은 안 걸립니다),
`1.2 `처럼 마침표 뒤에 무엇이 더 붙으면 안 걸립니다. 빈 줄일 필요는 없습니다 — 재는
것은 캐럿 앞의 줄 앞머리뿐이고, 문단의 첫 줄에서만 걸립니다.

- `Tab`/`Shift+Tab`으로 들여쓰기·내어쓰기 하는 것, 빈 항목에서 Enter로 목록을 끝내는
  것, 항목 맨 앞의 Backspace가 앞 항목에 합치는 것은 모두
  [글머리 목록](./bullet-list)과 같습니다.
- 번호는 저장값에 안 들어갑니다 — `<ol>`이 그리는 것이라 항목을 끼우거나 지우면
  브라우저가 알아서 다시 매깁니다.
- 중첩도 진짜 마크업으로 저장값에 그대로 남습니다. 항목이 블록을 품으므로 글은 문단
  한 겹을 입고, 중첩된 목록은 래퍼 문단 속에 섭니다.
- `start`·`type` 같은 속성은 살아남지 않습니다. 그래서 `start="5"`로 들어온 목록도
  1부터 다시 셉니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
