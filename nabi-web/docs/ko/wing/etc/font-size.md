---
title: 글자 크기
description: 허용한 단계 안에서 글자 크기를 바꿉니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글자 크기

선택한 글자의 크기 단계를 바꿉니다. 범위를 선택하면 그 범위에 적용하고, 캐럿만 있으면 현재 문단의 글자 크기를 바꿉니다. 저장 데이터에는 `px` 같은 임의 값이 아니라 허용한 단계만 남습니다.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values`를 생략하면 `xs`, `sm`, `lg`, `xl` 단계를 사용합니다. 목록을 좁히면 이전 문서에 들어 있던 다른 단계도 불러올 때 제거됩니다.

## CSS 스타일

크기는 `.nabi-content [data-nabi-size="xs"]`처럼 저장된 단계 선택자로 바꿀 수 있습니다. 문서에 없는 임의의 단계는 만들지 말고, 등록한 `values` 안에서만 CSS를 조정하세요.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

단계 사이의 크기 차이를 일정하게 두면 작성자가 편집기에서 고른 의미가 게시 화면에서도 유지됩니다.
