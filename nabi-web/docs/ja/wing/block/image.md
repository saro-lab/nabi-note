---
title: 画像
---

# 画像

## 説明

`imageWing`(名前 `img`)は画像要素(`<img>`)を持ちます。`hr`・`youtube` と同じく
**中身のない `place: 'void'` の物体**です。ツールバーのボタンを押すと画像アドレス
の入力欄が出ます。

**アドレスは拡張子ではなくスキームで検証します。** `http:`・`https:` と相対パス
だけが通り、`javascript:` のような悪意あるスクリプトやプロトコル相対アドレス
(`//example.com/a.png`)は濾されます。拡張子なしで画像を返す動的な API アドレス
も問題なく対応します。

キャレットは画像の中に入れないので、画像をクリックするとその画像オブジェクト
が丸ごと選ばれ、専用の状況ツールバーが出ます。

| コントロール | 説明 |
|---|---|
| 幅の調整 | `30%` から `100%` まで 10% 刻みで幅を調整するスライダー(既定 `60%`) |
| 拡大表示(ライトボックス) | 画像を原寸のモーダルポップアップで拡大表示 |

画像の左・中央・右揃えは、それを包む**ラッパー段落(`<div data-nabi-p>`)**に
かかる属性なので、メインツールバーの揃えボタンで揃えられます。

新しく挿入した画像は既定で中央揃え(`data-nabi-align="c"`)になります。

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

インライン `style` を持たないセマンティック属性として保存され、実際のサイズと
揃えは `nabi.css` が描きます。

### ローカルアドレスを許可する(`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls: true` を設定すると、`blob:`・`data:image/...` 形式のローカル
アドレスも許可されます — ファイルアップロード前のローカルプレビューなどの
場面で使えます(既定は `false`)。

画像アドレスが無効だったり、blob URL の期限が切れて読み込みに失敗した場合は、
翼の `attach` フックが壊れた画像のプレースホルダーを自動で表示します。別に
マウント設定を要らずに動き、画面専用の UI なので保存データには影響しません。

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

`blob:` アドレスを許可するには、ファクトリ関数を使います:

```ts
makeImageWing({ allowLocalUrls: true })
```

## デモ

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
