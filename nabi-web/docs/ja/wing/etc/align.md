---
title: 配置
---

# 配置

## 説明

`alignWing`(id `align`)は、段落やブロック要素の文字配置(左・中央・右)を扱う**段落属性**の翼です。

- ブロックノードに `data-nabi-align` 属性を付けます(`<p data-nabi-align="center">`)。
- **段落だけでなく見出し(`h1`〜`h6`)にも適用されます**(`<h2 data-nabi-align="c">`)。
- 配置の値は一度に一つだけ適用されます。すでに適用されている配置ボタンをもう一度クリックすると、配置属性が外れて既定の配置に戻ります。
- 段落の途中で Enter キーを押して段落を分割すると、分割された両方の段落が同じ配置属性を保持します。
- **画像・表・YouTube などのブロックオブジェクトの配置もこの翼が担当します。** ブロックオブジェクトはそれを包むラッパー段落(`<div data-nabi-p>`)の中に位置するため、ツールバーの配置ボタンでブロックオブジェクトの左/右/中央の配置を制御します。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
