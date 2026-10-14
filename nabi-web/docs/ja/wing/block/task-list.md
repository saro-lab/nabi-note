---
title: チェックリスト
description: 完了状態を文書に一緒に保存するリストです。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# チェックリスト

完了状態を持つリストです。空の段落で `[ ]` または `[x]` に続けて Space を入力するか、ツールバーから作成し、チェックボックスを押して状態を変えます。

チェック状態は項目の属性として文書に一緒に保存されます。項目を分割するとき、チェック状態は空になった前の項目ではなく、文字が残った項目に付いていくため、完了済みの項目を二つに分けても状態が入れ替わりません。

Enter で項目を分割し、Shift+Enter で項目内だけを改行できます。Tab と Shift+Tab はインデントの増減に使います。表のセル内でも同じ規則に従い、チェック状態も保存されます。

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
