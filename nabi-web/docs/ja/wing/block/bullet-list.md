---
title: 箇条書き
---

# 箇条書き

## 説明

`bulletListWing`(識別子 `ul`、ショートカット `L`)は順序なしリスト(`<ul>`)を扱います。リスト項目(`<li>`)は `parts` 属性で内蔵されているため、`li` を別途登録する必要はありません。

```ts
parts: { li: { holds: 'blocks' } }
```

ツールバーのボタンをクリックすると、キャレットがあるブロック(または選択された複数のブロック)が箇条書きに変換され、再度クリックすると通常の段落に戻ります。他のリストボタン(番号付きリスト、タスクリストなど)を押すと、その種類にすぐ切り替わります。

段落の先頭で `- `(ハイフンとスペース)を入力してもリストに自動変換されます。キャレット直前の文字パターンを見ているだけなので、`- テキスト` の状態でスペースを入力しても正しく変換され、それまで書いていたテキストはリスト項目の内容としてそのまま残ります(ただし段落の**最初の行**でのみ動作します)。

### ショートカットと編集動作

- <kbd>Tab</kbd>: 現在の項目を直前の項目の下に1段インデントします。最初の項目には上位項目がないため何も起こりません — リスト内では <kbd>Tab</kbd> は空白文字を挿入しません。
- <kbd>Shift</kbd>+<kbd>Tab</kbd>: 現在の項目を上位レベルへアウトデントします。最上位の項目でアウトデントすると、リストから抜けて通常の段落になります。複数の項目を選択している場合は、選択された項目全体が一緒に移動します。
- **空の項目で <kbd>Enter</kbd> を入力**: アウトデントが行われます。最上位レベルの空の項目だった場合、リストはそこで終了し、下に新しい段落が生成されます。
- **項目の先頭で <kbd>Backspace</kbd> を入力**: 内容が前の項目の末尾に結合されます。結合できる前の項目がない場合はアウトデントが行われます。逆に項目の末尾で <kbd>Delete</kbd> を押すと、次の項目が現在の行に引き寄せられます。
- 項目内部(`li`)はブロックコンテナなので段落(`p`)が含まれ、太字・斜体など全てのインライン書式を自由に使えます。
- タグの非標準属性は正規化の際に除去され、リスト内に `li` 以外の要素が入ってきた場合は自動的に `li` 項目として包み込んで補正します。
- タスクチェックリストと同じ `<ul>` タグを共有しますが、`data-nabi-list="task"` 属性の有無で翼が区別されます。

## マークアップと入れ子構造

ナビツリーの入れ子構造はそのままHTMLに反映されます。リスト項目(`li`)はテキストではなくブロックを格納するため、項目内のテキストは `<p>` 段落で包まれ、入れ子になった下位リストはラッパー段落(`<div data-nabi-p>`)の内部に安全に配置されます。

```html
<li><p>上位項目</p><div data-nabi-p><ul><li><p>下位項目</p></li></ul></div></li>
```

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 登録された翼の一覧をもとに registry と nabi インスタンスを生成します。
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` は `parts` として自動登録されるため、配列に直接渡しません。

## デモ

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
