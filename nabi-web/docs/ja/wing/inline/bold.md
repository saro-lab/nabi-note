---
title: 太字
---

# 太字

## 説明

`boldWing` は太字書式(`<b>`)を扱うインラインマーク翼です。文字を選んでツールバーの **B** を押すか、ヒントモード(Shift の二度押しに続けて `B`)、またはショートカット(`Ctrl`/`⌘`+`B`)で適用します。

- HTML入力時は `<b>` と `<strong>` の両方を認識し、HTML出力時は常に標準の `<b>` タグに変換されます。
- 文字を選んだ状態で実行するとトグルです——すでに太字なら解除し、そうでなければ適用します。
- 選択なしでカーソルだけの状態でショートカットを押すと、次に入力する文字に太字が予約されます。
- この翼を登録していなければ `<b>` タグは自動的に取り除かれ、中の平文だけが残ります。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
