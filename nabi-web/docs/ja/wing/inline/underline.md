---
title: 下線
---

# 下線

## 説明

`underlineWing` は下線書式(`<u>`)を扱うインラインマーク翼です。

- HTML入力時は `<u>` タグを認識し、HTML出力時も標準の `<u>` タグに変換されます。
- ヒントモード(Shift を2回連打してから `U`)と加速キー(`Ctrl`/`⌘`+`U`)に対応しています。
- テキストを選択した状態で実行するとトグルとして動作します。
- 下線とリンク(`<a>`)は見た目が似ることがありますが、独立した別の翼として動作し、同じテキストに下線とリンクを同時に適用できます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
