---
title: 下付き文字
---

# 下付き文字

## 説明

`subscriptWing` は下付き書式(`<sub>`)を扱うインラインマーク翼です。化学式や注釈番号などを表記するときに使います。

- HTML入力時に `<sub>` タグを認識し、出力時も `<sub>` としてレンダリングされます。
- ツールバーの `script` グループに、上付き文字と並んで置かれます。
- テキストを選んだ状態で押すとトグルで動きます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
