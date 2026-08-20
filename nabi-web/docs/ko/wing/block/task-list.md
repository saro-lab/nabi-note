---
title: 체크리스트
---

# 체크리스트

## 설명

`taskListWing`(이름 `tl`, 단축키 `K`)은 글머리 목록과 태그(`<ul>`)를 나눠 쓰지만 별개
구현입니다 — 나갈 때 `data-nabi-list="task"` 로 체크리스트임을, 항목마다
`data-nabi-checked` 로 체크 상태를 적습니다.

항목은 `parts` 로 함께 데려옵니다 — 배열이 아니라 레코드입니다.

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

저장값에서 체크는 `ck` 이고 값은 `1` 하나뿐입니다 — 꺼진 상태는 `0` 이 아니라 **칸이 아예
없는 것**입니다. 나가는 HTML 에서는 그것이 `data-nabi-checked="true"`/`"false"` 로 풀립니다.

버튼을 누르면 캐럿이 든 블록(또는 선택에 걸친 블록들)을 체크리스트로 감쌉니다.
줄 앞머리에 `[ ] ` 또는 `[x] `(대소문자 무관)를 쳐도 같은 결과이고, 어느 쪽을 쳤는지에
따라 처음부터 체크된 항목으로 시작합니다. 빈 줄일 필요는 없고, 문단의 첫 줄에서만
걸립니다.

체크박스는 `<input>` 이 아니라 CSS로 그린 표식입니다 — `contenteditable` 안에
진짜 input을 두면 캐럿이 엉키기 때문입니다. 켜진 칸은 강조색 타일 위의 흰 ✕ 이고,
그 줄은 흐려지며 가로줄이 그어집니다.

**켜고 끄는 자리는 칸 그 자체입니다** — 항목 앞머리의 좁은 띠(글자 한 칸 남짓)를 눌러야
바뀌고, 글자 쪽을 누르면 그냥 캐럿이 갑니다. 오른쪽에서 왼쪽으로 쓰는 글에서는 그 띠가
반대쪽에 섭니다. 이 일은 날개가 `attach` 로 들고 있어서 **따로 mount 할 것이 없습니다.**

`Tab`/`Shift+Tab`으로 들여쓰기·내어쓰기 하는 것, 빈 항목에서 Enter로 목록을 끝내는 것은
[글머리 목록](./bullet-list)과 같습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
