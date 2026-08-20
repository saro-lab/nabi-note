---
title: 서체
---

# 서체

## 설명

`typefaceWing`(이름 `tf`)은 **인라인 값 마크**입니다. 완성된 상수라 배열에 넣기만 하면 되고,
넘길 옵션이 없습니다. 나갈 때는 `<span data-nabi-typeface="serif">` 로 그려집니다.

값은 `sans`·`serif`·`mono`·`cursive` 넷(`TYPEFACES`)입니다.

- **글꼴 이름을 하나도 안 들고 있습니다.** 고르는 것은 **갈래**이고, 실제로 어떤 글꼴이
  나오는지는 호스트가 `--nabi-font`·`--nabi-font-serif`·`--nabi-font-mono`·
  `--nabi-font-cursive` 네 토큰에 얹은 값이 정합니다.
- 갈래 넷을 **날개 하나**가 다 듭니다. 고르는 자리는 상황 줄의 칸 넷(`select`)이고, 들어가는
  길로 툴바 단추가 하나 있습니다. 단추를 누르면 `serif` 가 걸립니다.
- **아무것도 안 걸린 글은 `--nabi-typeface-base` 를 입습니다.** 이 토큰이 편집기 전체의 바탕
  서체이고, 안 건드리면 `--nabi-font` 를 따라갑니다. "기본" 을 고르는 칸은 따로 없습니다 —
  걸려 있는 갈래를 **다시 고르면 벗겨져** 그 자리로 돌아갑니다.
- 고르는 칸들은 **자기가 가리키는 얼굴로** 그려집니다. 세리프 칸은 세리프로, 고정폭 칸은
  고정폭으로 적혀 있어 이름을 몰라도 무엇을 고르는지 보입니다.
- **캐럿만 있을 때는 그 문단 전체**에 걸립니다. 글이 한 글자도 없는 문단에서는 예약으로 남아
  다음에 치는 글자가 그 서체를 입습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

호스트가 얹는 글꼴은 CSS 한 자리입니다. 갈래 하나에 글꼴을 여러 개 쌓아 두면
브라우저가 글자마다 앞에서부터 훑어 그 글자를 가진 첫 글꼴로 그리므로, 어느 언어를 써
넣어도 그 갈래의 모양이 유지됩니다.

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## 데모

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
