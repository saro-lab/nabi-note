---
title: 표
---

# 표

## 설명

`tableWings`(이름 `table`, 단축키 `T`)는 `table > tr > td` 구조를 소유합니다.

행(`tr`)과 칸(`td`)은 따로 등록하지 않습니다 — 표 날개가 `parts` 로 함께 데려오므로, 표를
빼면 행·칸도 함께 빠집니다.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

칸이 `singleParagraph` 인 것이 격자를 지킵니다 — 칸 안에서 <kbd>Enter</kbd> 를 눌러도 문단이
둘로 안 갈리고, 두 칸에 걸친 선택을 지워도 칸이 서로 합쳐지지 않습니다.

버튼을 누르면 토글이 아니라 행×열 크기 격자(최대 8×8)가 뜨고, 고른 크기의 표가
캐럿 자리에 들어가며 캐럿은 첫 칸으로 옮겨집니다.

캐럿이 표 안에 있을 때만 상황 줄에 커맨드가 뜹니다.

| 갈래 | 칸 |
|---|---|
| 행 | 위에 행 추가 · 아래에 행 추가 · 행 삭제 |
| 열 | 왼쪽에 열 추가 · 오른쪽에 열 추가 · 열 삭제 |
| 병합 | 병합 (토글 하나) |
| 제목 | 이 행을 제목으로 · 이 열을 제목으로 (`<th>` 로 바뀝니다) |
| 줄 세우기 | 줄 세우기 켜기/끄기 (읽는 쪽에서 열을 정렬) |
| 삭제 | 표 삭제 |

**병합은 토글 하나**입니다 — 방향별 단추가 아닙니다. 칸을 여럿 골라 누르면 하나로
합쳐지고, 합쳐진 칸에 캐럿을 두고 다시 누르면 풀립니다.

**표 상자를 왼쪽·가운데·오른쪽에 두는 칸은 이 줄에 없습니다.** 표의 자리는 표가 아니라
그것을 담은 래퍼 문단이 드는 것이라, 툴바의 정렬 단추가 그 일을 합니다.

::: warning 줄 세우기 표식과 병합
줄 세우기는 **표식 하나**일 뿐입니다. 편집기는 병합된 표에도 이 표식을 걸어 주고,
병합한다고 걸려 있던 표식이 벗겨지지도 않습니다.

다만 **읽는 쪽이 거절합니다** — `attachTableSort` 는 병합된 칸이 보이는 표에는 아예 안
붙습니다. 합쳐진 행은 묶여 있어 재배열이 격자를 부수기 때문입니다. 그래서 병합된 표에서는
표식이 있어도 아무 일도 안 일어납니다.
:::

## 폭은 내용이 정합니다

표에는 폭 설정이 없습니다. 표는 **내용만큼만** 넓어지고, 자리보다 넓어지면 그
자리에서 **옆으로 스크롤**합니다 — 페이지가 밀리지 않습니다. 감싸는 `<div>` 도
없습니다. 저장값에 나가는 것은 `<table>` 하나이고, 붙는 속성은 정렬
(`data-nabi-align`)과 줄 세우기 표식뿐입니다.

## 이동과 선택

`Tab`/`Shift+Tab`으로 칸 사이를 이동합니다(표 끝에서는 그 자리에 머뭅니다). 칸은
인라인만 품으므로 Enter 는 칸을 쪼개지 않고 **그 칸 안에서 줄을 바꿉니다** —
쪼개려면 격자가 품을 수 없는 블록을 지어내야 하기 때문입니다. 방향키는 화면이
아니라 격자를 따라 움직입니다.

마우스로 여러 칸에 걸쳐 드래그해 고를 수 있습니다. 이 드래그 선택도 날개가 `attach`
로 들고 있어 **따로 mount 할 것이 없습니다** — `mountSurface` 가 함께 붙입니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
