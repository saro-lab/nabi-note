---
title: 취소선
---

# 취소선

## 설명

`strikeWing`은 `<s>`의 소유자(claim)입니다. 지웠지만 남겨 두고 싶은 값에
씁니다.

- 들어올 때는 `<s>`·`<strike>`·`<del>` 셋을 모두 인정하고, 나갈 때는 언제나
  `<s>`입니다. 속성은 하나도 살리지 않습니다 — `<del datetime="…">`의 시각도
  남지 않습니다.
- 힌트 모드 단축키는 `S` 입니다. **가속키는 없습니다** — 같은 `emphasis` 무리의
  굵게·기울임·밑줄과 달리 `Ctrl`/`⌘` 조합이 안 걸려 있습니다.
- 글자를 고른 채 누르면 토글입니다.
- 등록하지 않으면 `<s>`는 껍데기가 벗겨져 평문으로 떨어집니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
