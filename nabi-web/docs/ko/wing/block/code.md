---
title: 코드
---

# 코드

## 설명

`codeWing`(이름 `code`)은 코드 블록(`<pre>`)을 소유하는 **상수**입니다 — 괄호를 붙여
부르지 않습니다.

`holds: 'inline'` 인 그릇이고, 안은 `repair` 가 평문으로 눌러 둡니다 — 마크나 다른 날개가
끼어들 수 없습니다. 그런 칸이 계약에 따로 있는 것이 아니라, 날개가 자기 속을 스스로
다듬는 것입니다.

빈 줄에서 ` ``` `를 치고 스페이스나 Enter를 누르면 코드 블록이 됩니다 —
` ```ts `처럼 언어를 이어 쓰면 그 언어도 함께 잡힙니다. `Tab`/`Shift+Tab`으로 줄을
들여쓰고 내어씁니다(여러 줄을 고르면 한꺼번에). Enter는 앞 줄의 들여쓰기를
이어받습니다.

캐럿이 코드 안에 있을 때만 상황 줄이 뜹니다 — 언어를 직접 치는 입력 칸, "언어 없음",
그리고 자주 쓰는 언어 칸들입니다.

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

이 목록은 **빠른 길**일 뿐입니다 — 코어가 아는 언어의 목록이 아닙니다. 여기 없는
언어는 첫 칸에 직접 쳐 넣으면 되고, 그 값은 하이라이터에 그대로 넘어갑니다.

## 색칠은 날개에 꽂습니다

`highlight`는 **색이 아니라 종류를 돌려주는 훅**입니다 — `(소스, 언어) =>
{text, type?}[]` 모양이고, `type`은 `keyword`·`string`·`number`·`comment`·
`function`·`class`·`variable`·`operator`·`punctuation`·`tag`·`attribute`·
`literal`·`regexp`·`meta` 열넷 중 하나로 고정되어 있습니다(`CODE_TOKEN_TYPES`).

색은 코어 시트가 `[data-nabi-token="…"]` 선택자로 직접 정합니다 — **다섯만 색이 있습니다**
(`comment`·`string`·`keyword`·`number`·`literal`). 나머지 종류는 표식만 달리고 색 규칙이
없어 본문색 그대로 나옵니다. 값이 CSS 변수가 아니라 고정된 색이므로, 다른 색이나 어두운
갈래를 쓰려면 그 선택자를 직접 덮습니다.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

문법 사전 자체는 패키지에 없습니다 — Prism·highlight.js·Shiki 같은 것을 직접 물려야 합니다.

칠하는 쪽은 **날개에 꽂습니다** — 따로 mount 하지 않습니다. `makeCodeAttach` 로
`attach` 를 지어 코드 날개에 갈아 끼우면, `mountSurface` 가 그것을 붙입니다.
이 사이트의 데모가 Shiki 를 그렇게 물려 둔 예시입니다(`.vitepress/src/highlight.ts`).

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// 날개는 상수다 — 붙는 일(`attach`)만 갈아 낀다
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

`version` 을 함께 주면 **문서는 그대로인데 칠하는 쪽이 달라졌을 때** 다시 칠합니다.
문법을 비동기로 받아 오는 하이라이터(Shiki 는 언어를 처음 만나면 그렇습니다)가 그
경우입니다 — 문법이 도착해도 문서가 안 바뀌었으니 `onChange` 가 안 울리고, 이것이
없으면 아무 글자나 하나 더 쳐야 색이 들어옵니다.

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// 문법이 늦게 도착했을 때 — 수를 올리면 다시 칠한다
grammarAge += 1
```

저장값은 바깥 관례를 따릅니다 — `<pre data-nabi-lang="ts"><code class="language-ts">`
이고, 색은 `data-nabi-token` 속성으로 나갑니다(인라인 `style`이 아닙니다).

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
