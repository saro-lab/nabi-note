---
title: 인용
description: 인용문이나 별도 맥락을 여러 문단으로 묶습니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 인용

인용문이나 별도 맥락을 여러 문단으로 묶습니다. 빈 문단에서 `>` 뒤에 Space를 입력하거나, 선택한 문단을 툴바에서 인용으로 전환합니다.

인용 안에는 일반 문단뿐 아니라 목록과 이미지 같은 블록도 넣을 수 있습니다. 같은 범위를 다시 전환하면 바깥 문단으로 풀립니다.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS 스타일

인용은 `.nabi-content blockquote`로 테두리와 여백을 바꿀 수 있습니다.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` 안의 문단 구조는 그대로 두고, 바깥 여백·테두리·색처럼 표현만 바꾸세요.
