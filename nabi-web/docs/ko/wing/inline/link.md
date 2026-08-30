---
title: 링크
description: 안전한 웹 주소를 연결하고 업로드 첨부를 표시합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 링크

글자를 선택해 주소를 연결합니다. 선택 없이 주소를 입력하면 주소 자체가 링크 글자로 들어가며, `http://` 또는 `https://` 주소를 입력한 뒤 Space나 Enter를 눌러도 링크로 바뀝니다.

링크에는 `http:`, `https:`와 `.` 또는 `/`로 시작하는 같은 사이트 경로만 저장됩니다. `javascript:`나 `//example.com`처럼 출처를 분명히 할 수 없는 주소는 거절됩니다. 업로드가 만든 첨부 링크는 파일 정보까지 함께 저장되며, 일반 링크처럼 직접 만들 수는 없습니다.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS 스타일

일반 링크는 `.nabi-content a`, 첨부 링크는 `.nabi-content a[data-nabi-file]`로 따로 꾸밀 수 있습니다.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

첨부 링크의 `::before`, `::after`는 파일 아이콘과 확장자를 표시하는 데 쓰이므로 `content`를
바꾸거나 지우지 않는 편이 좋습니다.
