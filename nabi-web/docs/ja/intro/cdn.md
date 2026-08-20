---
title: CDN で使う
description: CDN の例
---

# CDN で使う

<CdnDemo />

---

## いま何をしたのか

読まなくても上のファイルは動きます。書き換えたいときだけ見てください。

### タグ二つがそのままインストールです

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

パッケージが書き出す **すべて**がグローバルの `NabiNote` ひとつに載ります。**シートは
自分で読み込みます** — mount は CSS を注入しないので、`<link>` を忘れるとエディタが
むき出しで表示されます。

### 骨組み

```html
<div id="app" class="nabi">                    <!-- 色・角丸・フォントが生きるルート -->
  <div id="chrome" class="nabi-toolbar">        <!-- ツールバーと状況行がひとかたまりで貼り付く -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- プレビュー・全画面(右端) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- キャレットの位置に応じて自動で埋まる -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` はどんな名前でも構いません — mount に渡すのは **要素**であって名前ではありません。
クラス四つ(`nabi`・`nabi-toolbar`・`nabi-toolbar-row`・`nabi-content`)はシートがつかむ
取っ手なのでそのままにしてください。プレビュー・全画面を使わないなら `<span id="tools">`
と `mountViewTools` の行を一緒に消せば済みます。器はどこを渡しても構いません —
`mountViewTools` が右端に浮かぶ自分の箱を自分で立てるので、ツールバーをそのまま渡しても
ボタンの行は崩れません。

### 翼を選ぶ

翼を選ぶのはビルダー一行です。上のファイルは既定の翼二十九個からアップロードを外し、
書体を二つに絞りました。

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` は公式の翼すべてから始めます。**呼ばなければ空の手です** — `use()` で足した
  ものだけが載ります。
- `use('名前', オプション?)` は一つ足すことです。すでに載っている翼に呼べばオプション
  だけを乗せます — 上の `use('tf', { values: [...] })` がその形です。踏み台にする翼が
  必要なら(アップロードは画像かリンクのどちらかがなければ成り立ちません)、黙って
  一緒に引き込みます。
- `drop('名前')` は載っているものから外すことです。他の翼が踏み台にしているものを
  外そうとすると、その場で例外を投げ、一緒に外すべきものを教えます。
- 名前は保存値に書かれる短い鍵です — `b`(太字)・`tf`(書体)・`upload` のように。
  一覧は `console.log(N.wingNames())` で見られます。
- **呼び方を間違えるとその行で例外を投げます。** 名前の誤字・知らないオプションの鍵・
  範囲外の値のすべてがそうで、投げる言葉に直す方法が入っています —
  `use('bod')` は「もしかして 'b'(太字)?」と答えます。黙って無視される場所は
  ありません。

`createNabiWith` はビルダーをそのまま受け取るので `build()` を呼ぶ必要はありません —
配列が必要な場所でだけ `build()` が配列を返します。少しだけ選んで使うときは配列が
やはり答えです。

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

自分で作った翼はオブジェクトのまま入れます — `N.wings().all().use(customWing)` の
ように。その翼の `w` は `ex` で始めてください(`exNote`)— あとから出る公式の名前と
保存値の中で重なると、すでに保存されたドキュメントが違う意味で読まれてしまうからです。
作り方は [{{ t('menu_wing_custom') }}](../wing/custom) にあります。

翼それぞれは [{{ t('menu_wing') }}](../wing/inline/bold) で見られます。

### 尋ねる・知らせる道

上のファイルは `ask` でブラウザの `alert`・`confirm` を差し込みました —「書きかけの
文章があります。それでも開きますか?」のような問いはその箱に行きます。差し込まなければ
問いの答えは「いいえ」で、答えの要らないひとことはコアが持つ toast の器がツールバーの
下に浮かべます — アップロードのエラーのような通知に別途差し込むものはありません。
詳しくは [{{ t('menu_intro_usage') }}](./usage) にあります。

### 値を取り出す

| | |
|---|---|
| `nabi.getHtml()` | 保存・公開する HTML |
| `nabi.getJson()` | ナビツリー(JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | 値を戻す |
| `nabi.onChange(fn)` | 値が変わるたびに |
| `N.renderStoredHtml(json, registry)` | 保存内容をエディタなしで HTML に(下の[読む側](#読む側)) |

---

## アドレス

版を固定したいときはアドレスに版番号を付けます。unpkg も同じファイルを返します。

**版を書かないアドレス(`/npm/nabi-note`)は使わないでください** — jsDelivr がその場所を
長くキャッシュするため、束とシートが違う版で混ざることがあります。

| | アドレス |
|---|---|
| **束(最新)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **束(固定)** | <code>{{ CDN_BUNDLE }}</code> |
| **シート(最新)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **シート(固定)** | <code>{{ CDN_SHEET }}</code> |
| **束**(unpkg) | `https://unpkg.com/nabi-note` |

束は npm の配布物の中に一緒に載って出ていくので、**CDN が別に配布されているわけでは
ありません。**

---

## 読む側

保存された HTML を **表示するだけのページ**はエディタを立てません。同じシートを読み込み、
`.nabi-content` の中に値を入れれば、エディタで見ていたとおりに表示されます。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- getHtml() で保存しておいた値 -->
</div>
```

HTML ではなく **ナビツリー(JSON)で保存しておいた場合**は、エディタを立てずにその場で
描きます。受け取るのは保存内容と登録した翼の一覧の二つです。

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['コメント一行'] }]   // サーバーから受け取ったナビツリー
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

ナビツリーでなければ `null` を答え、通過した値はエディタが出す `getHtml()` と一文字も
違いません — XSS が濾し取られる場所も同じです。この扉は DOM を使わないのでサーバー
(Node.js)でもそのまま動き、**HTML をサーバーであらかじめ作って送る道**が同じ扉で開き
ます([{{ t('menu_intro_ssr') }}](./ssr#保存したものだけを描く場所-エディタは立てません)
参照)。

npm で導入するサーバーはグローバルの束ではなく **`nabi-note/ssr`** を使います — 描く
のに要るものだけが入った入口なので、編集面と画面の道具が載りません。

シートファイルひとつに **すべての翼の CSS が入っています** — ファイルはどの翼を登録
したのか知りようがないので、すべて載せます。

見た目はシートがすべて引き受けますが、**表の並べ替えとコードの色付けは読む側で
JavaScript がしなければならない仕事**です — 見出しを押して行を並べ替えたり、コードの
文字を切り分けて色を乗せたりすることは CSS にはできません。使いたければ、閲覧側の
ランタイムを一つの扉で掛けます。

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'ja' })
</script>
```

- 掛けなくてもドキュメントは問題なく表示されます — 並べ替えを有効にした表が動かず、
  コードが単色になるだけです。
- 表の並べ替えは、エディタで並べ替えを有効にした表(`data-nabi-sortable` の目印が
  残ります)にだけ付きます。
- コードの色付けは内蔵のトークナイザーが応じるので依存関係は要りません。Shiki の
  ようなハイライタを使うなら `{ locale: 'ja', highlight }` のようにフックで差し込みます
  — その重さは差し込んだページの負担になります。
- グローバルの `NabiNote` 束にはこの扉がありません — 読むページがエディタ全体を
  載せずに済むよう `nabi-note/viewer` が別に立っています。npm で導入するホストは
  [{{ t('menu_intro_usage') }}](./usage#プレビューに閲覧側ランタイムを掛けます) のように
  プレビューにも同じ扉を掛けます。

---

## 次のドキュメント

- [{{ t('menu_intro_usage') }}](./usage) — npm で導入する道、組み立て・入力・出力のすべて
- [{{ t('menu_wing_custom') }}](../wing/custom) — ない書式を自分で作る

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// 版番号は手で書かない — nabi-npm の package.json をそのまま読む
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
