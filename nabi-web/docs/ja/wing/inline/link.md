---
title: リンク
---

# リンク

## 説明

`linkWing`(id `a`)は、ハイパーリンク(`<a href>`)を扱うインラインマーク翼です。

ツールバーのボタンを押すと、リンクの URL を入力するポップアップが表示されます。`http:`・`https:` で始まる安全な URL だけを入力できます。`javascript:` のような悪意のあるスクリプト URL は、XSS セキュリティポリシーによって自動的にフィルタリングされます。

リンク入力ポップアップでは、**リンク URL** と **表示テキスト** を一緒に入力できます。テキスト欄を空にすると、URL 自体が表示テキストとして使われます。

## 状況行でリンクを直す

キャレットが既存のリンクの中に立つと、動的な状況行にインラインのテキスト入力欄が表示され、すぐに修正できます:

| 入力欄 | 説明 |
|---|---|
| リンクアドレス(`href`) | リンク先の URL だけを変更します(表示テキストはそのまま) |
| 表示名 | 本文に表示されるテキストだけを変更します(URL はそのまま) |

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
