---
title: ドロップキャップ
---

# ドロップキャップ

## 説明

`dropCapWing` は段落の先頭文字を大きな装飾文字として表示する段落属性の翼です(`data-nabi-dropcap="1"`)。

- オン/オフの単一トグルとして動作します。
- 先頭文字の大きさはコアのスタイルシートにある `::first-letter` 規則で固定されます(`font-size: 5.9em; line-height: .83`)。
- Enter で段落を分割しても、先頭文字の属性は複製されず、元の先頭文字にのみ残ります。

大きさを変えたい場合は、以下のCSS規則を上書きします。

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
