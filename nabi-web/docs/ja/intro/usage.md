---
title: 基本的な使い方
description: npm で導入して nabi オブジェクトをひとつ立て、三つの入力と三つの出力でドキュメントをやり取りします。
---

# 基本的な使い方

npm で導入して使う道です。`<script>` 一行で使う道は
[{{ t('menu_intro_cdn') }}](./cdn) にあります。

```sh
npm i nabi-note
```

---

## 部品をつなぎ合わせます

ホストが場所を作り、mount をひとつずつ付けます。以下が最小構成で、wing のドキュメント
ごとに出てくる例は、すべてこの骨組みに wing を一つ二つ足した形です。

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'ja' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'ja' })
mountSticky({ root: app, surface })

// 値が変わるたびに — ここに自分のコードを掛けます
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

場所はホストが作り、**その場所がどんな姿をしているかはコアが知っています** — mount が
自分の器に `.nabi-toolbar-row`・`.nabi-context`・`.nabi-editing` を自ら付け、道具箱も
自分で立てます。ホストがレイアウトを組む必要がないということで、だから上のマークアップ
にはクラスが三つしかありません。

- **`class="nabi"`** — 色トークンとスタイルシートはこの中でだけ生きます。全画面が丸ごと
  固定する箱でもあるので、ツールバーと編集領域が **一緒に** この中になければなりません。
- **`class="nabi-toolbar"`** — ツールバー行と状況行をひとかたまりに束ね、**上に貼り付く
  (sticky)** ようにします。二つが別々に貼り付くと、状況行が現れたときに文章が押されて
  画面が揺れます。
- **`class="nabi-content" contenteditable`** — 編集領域そのものです。

サイトに固定のヘッダがあれば `--nabi-sticky-top` でその分だけ下げ、`mountSticky()` を
付ければ、モバイルのキーボードが画面を押し上げた分をコアが測って戻します。

**スタイルシートはホストが掛けます。** バンドラを使うなら `import 'nabi-note/nabi.css'`
ひとつで済み、登録した翼のものだけを載せたいなら
`injectSheets(document, collectSheets(registry))` を呼びます。
**ドキュメントをサーバーであらかじめ描いて送るページはファイルの方を掛けてください** —
注入はエディタの JavaScript が届いたあとにしか付かず、その間にドキュメントが素の姿で
一度描かれてしまいます。

**その言葉が文章の向きも決めます。** アラビア語(`ar`)・ウルドゥー語(`ur`)を渡すと、その
mount のルートに `dir="rtl"` が付き、右から左に立ちます — ページが `<html dir>` で何も
語っていなくてもそうなります。`locale` を **渡さなければ触りません**: 向きを自分の手で
握っているホストのものを上書きしません。どの言語がどの向きかは `localeDirection(code)`
が答えます。

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // 編集領域が RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // ツールバーも鏡のように
```

表示言語は mount ごとに `locale` で決めます — ドキュメントの文章はそのままで、
ツールバー・状況行の名前だけが変わります。**ホストはロケールを一度宣言するだけで済み
ます** — 上の例のようにひとまとまり(shared)に詰めて mount に渡せば、ツールバーが立つ
ときに自分の `locale` をコアにも掛けてくれるので(`nabi.$bindLocale`)、コアが出す言葉
(toast など)も同じ言語で出ます。ツールバーなしで使う場所は `createNabiWith` オプション
の `locale` で渡します。選択肢を描くなら、パッケージが書き出す `LOCALES`(コードの一覧)
を使ってください。

| 組み立て | 必須 | すること |
|---|---|---|
| `createNabiWith(wings, options?)` | はい | `{ nabi, registry }` を返します。DOM は要りません |
| `mountSurface({ nabi, registry, root })` | はい | キャレット・IME・入力をナビツリーに合わせ直します。登録された翼の `attach` も一緒に付けます |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | いいえ | メインのツールバー。なくても `applyCommand()` で直接編集はできます |
| `mountContextToolbar({ nabi, registry, root, surface? })` | いいえ | キャレットの場所ごとの状況行(表の行・列、コードの言語、リンクのアドレス・名前など) |
| `mountHints({ toolbar, context?, root, surface? })` | いいえ | Shift の二度押しで現れるショートカットのバッジ |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | いいえ | プレビュー・全画面の二つのボタン。`root` は全画面が固定する `.nabi` の箱、`onBody` はプレビュー本文に閲覧側ランタイムを掛けるフックです(下記) |
| `mountSticky({ root, surface })` | いいえ | モバイルのキーボードが画面を押し上げた分、貼り付くツールバーを戻します |
| `mountPickedMark({ nabi, surface })` | いいえ | 画像・動画を選んだときの表示(ブラウザが描いてくれません) |
| `mountFile({ nabi, store, name? })` | save・open を使うとき | `.nabi` ファイルとして保存・展開 |
| `mountLocalHistory({ nabi, storage })` | localHistory を使うとき | 決まった間隔でブラウザに記録。`storage` が `null`(`file://` のような塞がれた場所)でも立てます — そうしてこそボタンが効かない理由を toast で伝えられます |
| `mountUpload({ … })` + `mountUploadView({ … })` | upload を使うとき | ドロップ・貼り付け・ファイル選択のアップロード進行とその表示 |

**画像・チェック・表のセルのドラッグ・コードの色付けには別途 mount するものがありません**
— すべて翼が `attach` として持っていて、`mountSurface` が一緒に付けます。コードの色付け
だけ、色を付ける係を差し込めば済みます(`makeCodeAttach`、
[{{ t('menu_wing_code') }}](../wing/block/code) 参照)。

### プレビューに閲覧側ランタイムを掛けます

プレビューは `getHtml()` をそのまま差し込んだ静的な HTML なので、表の並べ替え・コードの
色付けのように **読む側で JavaScript が行うこと** は自動では付きません。`nabi-note/viewer`
の `attachViewer` がそれを一つの扉でまとめて掛け、プレビューでは `onBody` フックがその
場所です — 上の最小構成の `mountViewTools` の行をこう変えます。

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'ja',
  onBody: (body) => attachViewer(body, { locale: 'ja' }),
})
```

`onBody` はプレビューの本文が立つと呼ばれ、答えとして返した外す関数は蓋が閉じるときに
呼ばれます。公開したページにも **同じ一行**(`attachViewer`)を掛けます — プレビューは
公開された側と同じでなければならないので、その二つに同じ扉を掛けることがこのフックの
要点です。詳しくは [{{ t('menu_intro_cdn') }} ▸ 読む側](./cdn#読む側) にあります。

コードの色付けは内蔵のトークナイザーが既定で応じます(依存関係ゼロ)。Shiki のような
ハイライタを使うホストは `attachViewer(body, { locale, highlight })` で同じフックに
渡します — `makeCodeAttach({ highlight })` に渡したものと揃えれば、編集画面と読む画面の
色がずれません。

wing を差し替えるには、この部品すべてを畳んで(`unmount()`)新しく作ります — 外した wing
が握っていたマークアップは、その場で平文に落ちます。このサイトのデモが実際にそう動作
します — wing のチップを切ったり入れたりすると、組み立てが丸ごと作り直されます。

色・形をはじめとする CSS 変数は [{{ t('menu_style_custom') }}](../style/custom) にあります。

---

## ドキュメントを取り出す三つ

```ts
nabi.getHtml()        // 保存・公開する HTML
nabi.getJson()        // ナビツリー (JSON)
nabi.getEditorHtml()  // いまのエディタ画面の HTML (data-key が付いています)
```

**保存する値は前の二つのどちらかです。** `getEditorHtml()` は画面専用の目印(`data-key`)
が付いているため書き出す値ではありません — サーバレンダリング(SSR)でエディタを
あらかじめ描いておくときに使う場所です。

出ていく JSON はこんな姿をしています。**ドキュメントはブロックの配列**で、くるむ
ルートノードはありません。

```json
[
  {"w":"p","a":{"h":2},"ch":["見出し"]},
  {"w":"p","ch":["文章 ",{"w":"b","ch":["太字"]}," と ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["リンク"]}]},
  {"w":"p","a":{"a":"c"},"ch":["中央"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["ひとつ"]}]},
    {"w":"li","ch":[{"w":"p","ch":["ふたつ"]}]}]}]}
]
```

読む規則は四つだけです。

- **`w` はそのノードを描く翼の id です。** 予約語は `p`(段落)と `br`(改行)の二つだけで、
  残りはすべて登録した翼の id です — `b`・`ul`・`li` のように。見出しは別の翼ではなく
  **段落の属性**です(`{"w":"p","a":{"h":2}}`)。
- **文字列なら文字、オブジェクトなら翼です。** 種類を書く欄が別にあるわけではありません。
- **`a` はその翼が抱えた値です** — リンクのアドレス、蛍光ペンの色、見出しのレベルの
  ようなもの。なければ欄もありません。揃えの値も `a` ですが、それはこの欄の **中** に
  入っているので紛れません(`{"w":"p","a":{"a":"c"}}` — 中央揃えした段落)。
- **表・リスト・画像のように段落の場所を占めるものは、段落が一枚くるみます**(上の `ul`
  を見てください)。その段落が揃えをまとい、キャレットがその物の前後に立つ場所を作ります。
  HTML では `<div data-nabi-p>` として出ていきます — `<p>` は文法上、表やリストを
  持てないからです。

内部で動くツリーにはノードごとに `_id` がもうひとつ付いています — **キャレットがノードを
指す内部アドレス**で、ほとんどの編集で振り直され、出ていくときに取り除かれます(上の例で
470 → 323 バイト)。出ていった値はそのまま `setJson()` に戻して入れれば済みます。

---

## ドキュメントを入れる四つ

```ts
createNabiWith(wings, { doc })   // すでに作られたナビツリーで始める
nabi.setJson(json)               // ナビツリーで丸ごと差し替える
nabi.setHtml(html)               // HTML 文字列で丸ごと差し替える
nabi.applyCommand('setHeading', { value: 2 })  // 編集コマンド (翼が使うあの扉)
```

四つとも **成否を `boolean` で答えます。** 例外は投げず、失敗すればドキュメントに手を
付けません。

| 答えが `false` になる場所 | |
|---|---|
| `setJson` | ナビツリーの形式でない |
| `setHtml` | `parseHtml` アダプタを差していない(下記)、または編集がロックされている |
| `applyCommand` | そのコマンドがない、または **何も変わらない** |

最後の行が規則ひとつです — **変わるものがなければ静かです。** すでに見出しレベル2の
段落にもう一度 `setHeading` を掛けると `false` を答え、元に戻す地点も信号も残しません。

### `setHtml` はアダプタが必要です

HTML を読む仕事はブラウザの `DOMParser` が行います。コアは DOM を知らないので、その
アダプタを宣言時に差し込みます。

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` はアダプタが要りません — 保存しておいた JSON を **サーバ(Node.js)でそのまま
入れても**構いません。組み立て(`getHtml`)も DOM を使わないので、サーバで JSON を読んで
HTML を作って書き出す道がそのまま開いています。

---

## 通知は toast で出ます

アップロードのエラー、ローカル履歴の案内、「適用する対象がない」のようなひとことは、
すべて **toast ひとつの道**で出ます。既定の器はコアが持っているので、何も差し込まなくて
済みます — ツールバーが立てば、ツールバーの下あたりの固定位置に現れます(状況行が
現れたり消えたりしてもその場所は動きません)。

- 目盛りは三つです — `'info' | 'warn' | 'error'`。成功・失敗の結果ではなく **読む人が
  どれだけ緊張すべきか**の目盛りです。
- 既定では1秒後に片付き(残り0.5秒から薄くなります)、クリックしても閉じます。同時に
  立つのは既定3個まで — あふれると残り時間が最も少ないものから片付きます。
- メッセージは `\n` を含められ、ライト・ダークどちらでも描かれます。

出方を変える二つのオプションと、表示を丸ごと差し替える一つのオプションが
`createNabiWith` にあります。

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // 生きている時間 — 既定 1000ms。呼ぶ側が一件ごとに乗せることもできます
  toastMax: 5,     // 同時に立つ上限 — 既定 3
  // 自前の通知システムがあるページは表示だけ差し替えます — コアの既定の器は一度も描かれません
  // toast: (level, message, ms) => user_callback(level, message),
})
```

翼が語る扉もこのひとつです — `nabi.$toast(level, message, ms?)`。時間が言葉と一緒に
乗るので、長い案内一回のために既定全体を伸ばす必要はありません。

---

## エディタが人に尋ねる道

ファイルを開くとき「書きかけの文章があります。それでも開きますか?」のような問いが
必要です。その箱を **宣言するときに一度** 差し込みます。

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | 形 |
|---|---|
| `message` | `(text: string) => void` — 言葉ひとつ、答えは受け取りません |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — 同期でも非同期でも受け取ります |

**コアはブラウザのものを自動では使いません。** 自前のダイアログを持つページに灰色の箱が
割り込んではいけませんし、プラグイン(IntelliJ・VS Code)には `window.confirm` が
そもそも存在しないからです。上の三行はホストが作ります。

::: warning 渡さなければ答えは「いいえ」です
誰も答えなかった問いは「はい」ではありません — キャンセル・Escape・ウィンドウを閉じる
ことが意味するのと同じです。この答えが関わる場所が「書きかけの文章を捨てて開くか?」
なので、尋ねる相手がいないからといって捨てる側に倒れてはいけません。サーバ(Node)でも
この値で静かに通り過ぎます。
:::

**エディタひとつのものです** — グローバルではないので、ひとつのページのエディタ二つが
互いに違うやり方で尋ねられます。翼も同じものを受け取ります(`nabi.$ask`) —
[{{ t('menu_wing_custom') }} ▸ UI と動作](../wing/custom/ui) にその話があります。

---

## このエディタの名前と「変わったか」

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <UNIX時刻>-<nonce>、インスタンスごとにひとつ
nabi.isChanged() // 最後の基準線からドキュメントが動いたか
```

`sessionId` は一度作られたら変わりません。時刻はこのエディタがいつ立ったかを語り、それ
自体で並べ替えられ、nonce は同じミリ秒に立ったエディタ二つを見分けます。下書き・ログ・
自動保存のキーに付ける名札です。

`isChanged()` の **基準線を新しく引くものは三つ**です — ドキュメントを丸ごと入れる
こと(`createNabiWith({ doc })`・`setJson()`・`setHtml()`)と、保存したと知らせることです。

```ts
nabi.$markSaved(savedDoc)   // 保存が成立したあと — そのとき保存したドキュメントを渡す
```

**保存していたその瞬間のツリーを渡します**(いまのツリーではありません)。保存に時間が
かかっている間に打った文字は、それでも「変わったもの」として残らなければならないから
です。保存の翼(`save`)はファイルが実際に書かれたあとにこれを呼ぶので、`.nabi` で
保存すると `isChanged()` が `false` になります。

**元に戻して最初の場所に来れば再び `false`** です — ナビツリーは不変で、編集のたびに
丸ごと入れ替わるので、同じドキュメントかどうかを走査したりハッシュしたりせず、その場で
分かります。

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## 次のドキュメント

- [{{ t('menu_intro_ssr') }}](./ssr) — 保存したものをサーバーであらかじめ描き、`hydrate` で引き継ぐ
- [{{ t('menu_intro_cdn') }}](./cdn) — ビルドツールなしで `<script>` ひとつで
- [{{ t('menu_wing_custom') }}](../wing/custom) — ない書式を自分で作る

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
