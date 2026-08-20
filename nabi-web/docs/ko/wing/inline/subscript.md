---
title: 아랫첨자
---

# 아랫첨자

## 설명

`subscriptWing`은 `<sub>`의 소유자(claim)입니다. 화학식이나 아래로 내려 쓰는
번호에 씁니다.

- 인정하는 태그는 `<sub>` 하나입니다. 속성은 살리지 않습니다.
- 힌트 모드 단축키도 가속키도 없습니다. 툴바 무리는 `script` 로, 윗첨자와 나란히
  섭니다(등록 순서대로 윗첨자가 먼저입니다).
- 글자를 고른 채 누르면 토글입니다.
- 생김새는 이 wing 이 `Wing.styles` 로 나르는 시트가 냅니다.

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**이 시트는 윗첨자와 나눠 쓰는 한 벌입니다.** 두 wing 이 같은 글자를 들고 있어, 둘 다
등록해도 문서에는 **한 번만** 실립니다(`collectSheets` 가 같은 글의 시트를 걷어 냅니다).
저장값(HTML)에는 `<sub>` 태그만 남고 스타일 자체는 안 실립니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
