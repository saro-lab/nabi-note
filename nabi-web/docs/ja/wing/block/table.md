---
title: 表
---

# 表

## 説明

`tableWings`(名前 `table`、ショートカット `T`)は `table > tr > td` の構造を所有します。

行(`tr`)とセル(`td`)は別に登録しません — 表の翼が `parts` として一緒に連れてくるので、
表を外すと行・セルも一緒に外れます。

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

セルが `singleParagraph` であることが格子を守ります — セルの中で <kbd>Enter</kbd> を
押しても段落が二つに割れず、二つのセルにまたがる選択を消してもセル同士が合体しません。

ボタンを押すとトグルではなく行×列の大きさを選ぶ格子(最大 8×8)が出て、選んだ大きさの
表がキャレットの位置に入り、キャレットは最初のセルへ移ります。

キャレットが表の中にあるときだけ状況行にコマンドが出ます。

| 種類 | ボタン |
|---|---|
| 行 | 上に行を挿入 · 下に行を挿入 · 行を削除 |
| 列 | 左に列を挿入 · 右に列を挿入 · 列を削除 |
| 結合 | 結合(トグルひとつ) |
| 見出し | この行を見出しに · この列を見出しに (`<th>` に変わります) |
| 並べ替え | 並べ替えを切り替え (読む側で列を並べ替え) |
| 削除 | 表を削除 |

**結合はトグルひとつ**です — 方向ごとのボタンではありません。複数のセルを選んで押すと
ひとつに合わさり、合わさったセルにキャレットを置いてもう一度押すと解けます。

**表の箱を左・中央・右に置く欄はこの行にありません。** 表の位置は表自身ではなくそれを
包むラッパー段落が持つので、ツールバーの揃えボタンがその役目を果たします。

::: warning 並べ替えの印と結合
並べ替えは **印ひとつ**にすぎません。エディタは結合された表にもこの印を掛けたままにし、
結合したからといって掛かっていた印が剥がれることもありません。

ただし **読む側が拒みます** — `attachTableSort` は結合されたセルが見える表にはそもそも
付きません。合わさった行は束ねられていて、並べ替えが格子を壊すからです。そのため
結合された表では印があっても何も起こりません。
:::

## 幅は内容が決めます

表には幅の設定がありません。表は **内容の分だけ**広がり、場所より広くなればその場所で
**横にスクロール**します — ページが押されません。包む `<div>` もありません。保存値に
出るのは `<table>` ひとつだけで、付く属性は揃え(`data-nabi-align`)と並べ替えの印だけ
です。

## 移動と選択

`Tab`/`Shift+Tab` でセルの間を移動します(表の端ではその場に留まります)。セルは
インラインしか抱えないので、Enter はセルを割らずに **そのセルの中で改行します** —
割るには格子が抱えられないブロックを作り出さなければならないからです。方向キーは画面
ではなく格子に沿って動きます。

マウスで複数のセルにまたがってドラッグして選べます。このドラッグ選択も翼が `attach`
として持っていて **別に mount するものはありません** — `mountSurface` が一緒に付けます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
