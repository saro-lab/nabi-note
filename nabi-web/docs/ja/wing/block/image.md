---
title: 画像
---

# 画像

## 説明

`imageWing`(名前 `img`)は画像(`<img>`)を所有します。`hr`・`youtube` のように **中身の
ない物体**です。ボタンを押すとアドレス入力パネルが出ます。

**アドレスは拡張子ではなくスキームで濾します。** `http:`・`https:` と相対パスだけが通り、
`//example.com/a.png` のようなプロトコル相対アドレスは拒みます。`.png` で終わるかは
**誰も見ません** — 拡張子なしで画像を返すアドレスがよくあるからです。

キャレットは画像の中に入れないので、画像をクリックするとその画像が丸ごと選ばれ、
状況行が出ます。

| 種類 | 欄 |
|---|---|
| 幅 | `30` から `100` まで十刻みで八つの欄(既定 `60`) — 目盛りで、いまの値が一緒に出ます |
| 表示 | 画像ひとつだけを大きく — 文書を変えません |

**状況行はこの二つだけです。** 左・中央・右の欄はここにありません — 画像の位置は画像
自身ではなく **それを抱えるラッパー段落**が持つので、ツールバーの揃えボタンがその役目を
果たします。

**新しく入れた画像は中央です** — `insertLump` がラッパー段落に揃え `c` を着せて立てる
からです。

出ていくとき、幅は画像に、揃えはそれを包む段落に付きます。

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

揃えの値は `l`・`c`・`r` です。インライン `style` は出ません — 実際の見た目は
`nabi.css` を掛けた `.nabi-content` の中でその属性を読むシートが描きます。

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls` を入れると `blob:`・`data:image/...` のアドレスも許します — サーバー
なしでファイルを先に見せるデモ・アップロードのシナリオでだけ入れます。既定は切りです。

画像が壊れたとき(アドレスが死んでいたり期限切れだったり blob が消えたとき)は
プレースホルダーが自動で出ます — 翼が `attach` としてその仕事を持っていて、
`mountSurface` が登録された翼の `attach` を一緒に付けます。**別に mount するものは
ありません。** この印は画面専用で、保存値には決して残りません。

`allowLocalUrls` は二つの場所で入れられます — エディタ全体(`createNabiWith(wings,
{ allowLocalUrls: true })`)か、画像の翼ひとつだけ(`makeImageWing({ allowLocalUrls: true })`)。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

アップロードで受け取ったファイル(`blob:` のアドレス)をそのまま開いておくには:

```ts
makeImageWing({ allowLocalUrls: true })
```

## デモ

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
