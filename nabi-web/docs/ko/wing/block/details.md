---
title: 접기
description: 요약과 본문을 묶고 처음 펼칠 상태를 저장합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 접기

짧은 요약과 본문을 한 블록으로 묶습니다. 툴바에서 만들면 먼저 요약을 입력하고 그 아래에 내용을 이어 쓸 수 있습니다.

삼각형으로 정한 펼침 상태는 문서에 저장되어 발행 화면의 처음 상태가 됩니다. 편집 중에도
삼각형을 눌러 열고 닫을 수 있습니다.

표 셀이나 다른 블록 안에서도 해당 접기 블록만 열고 닫습니다. 닫히는 본문 안에 커서나 선택이
있으면 밖으로 옮기고, 다른 위치에 있던 선택은 유지합니다.

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
