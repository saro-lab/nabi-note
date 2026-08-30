---
title: 접기
description: 요약과 본문을 묶고 처음 펼칠 상태를 저장합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 접기

짧은 요약과 본문을 한 블록으로 묶습니다. 툴바에서 만들면 먼저 요약을 입력하고 그 아래에 내용을 이어 쓸 수 있습니다.

삼각형으로 정한 펼침 상태는 문서에 저장되어 발행 화면의 처음 상태가 됩니다. 편집 중에는 내용을 고칠 수 있도록 본문을 펼쳐 두지만, 저장되는 상태값은 그대로 유지됩니다.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS 스타일

접기 블록은 `.nabi-content details`, 제목은 `.nabi-content details > summary`로 꾸밀 수 있습니다.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` 속성은 작성자가 저장한 처음 펼침 상태입니다. CSS는 이 상태를 꾸밀 수 있지만 상태를
강제로 바꾸지는 않는 편이 좋습니다.
