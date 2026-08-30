---
title: 형광펜
description: 선택한 글자 뒤에 허용한 형광펜 색을 입힙니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 형광펜

선택한 글자 뒤에 형광펜 색을 입힙니다. 저장 데이터에는 임의의 CSS 색상값 대신 허용한 색 이름만 남아, 화면 스타일과 문서 데이터를 분리할 수 있습니다.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

`values`를 생략하면 `yellow`, `green`, `cyan`, `pink`, `purple`, `orange`를 사용합니다. 목록을 좁히면 등록하지 않은 색은 불러온 문서에서도 유지되지 않습니다.

## CSS 스타일

문서에는 색 이름만 저장됩니다. 편집기와 게시 화면의 색은 CSS 변수로 바꿉니다.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

여러 색을 함께 바꾸면 문서의 색 이름은 그대로 두고 서비스 분위기만 바꿀 수 있습니다.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
