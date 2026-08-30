---
title: 드롭캡
description: 문단 첫 글자를 크게 배치해 본문을 시작합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 드롭캡

문단 첫 글자를 크게 놓고 나머지 줄이 그 옆으로 흐르게 합니다. 문단 단위의 서식이므로 글자 일부만 선택해 적용하지 않습니다.

발행 화면과 편집 화면은 같은 모양을 유지합니다. 편집할 때는 첫 글자를 실제 요소로 감싸 캐럿과 삭제 위치가 어긋나지 않게 처리하며, 이 요소는 저장되는 문서 내용에는 포함되지 않습니다.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS 스타일

게시 화면과 편집 화면은 첫 글자를 가리키는 선택자만 다릅니다. 게시 화면은
`[data-nabi-dropcap="1"]::first-letter`, 편집 화면은 실제 요소인
`[data-nabi-dropcap-letter]`를 사용합니다. 색, 글꼴, 크기처럼 보이는 값을 바꿀 때는 두
선택자를 반드시 함께 적어야 편집할 때와 발행했을 때의 모양이 같습니다.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

크기와 줄 높이도 바꿔야 한다면 같은 값을 두 선택자에 함께 적용합니다.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

드롭캡은 첫 글자 주변의 줄 흐름을 계산하므로, 한쪽만 바꾸거나 값을 과하게 키우면 WYSIWYG
모양이 깨질 수 있습니다. 편집 화면에 `::first-letter`를 새로 추가하는 것은 여전히 피해야
합니다. 편집기에서는 이미 있는 `[data-nabi-dropcap-letter]`만 꾸밉니다.
