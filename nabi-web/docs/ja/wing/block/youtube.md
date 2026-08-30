---
title: YouTube
description: YouTube 動画を文書に埋め込み、幅を調整します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

YouTube の動画 URL または動画 ID を受け取り、埋め込みブロックにします。文書には完全な URL ではなく 11 文字の動画 ID と幅だけが保存され、新しい動画は中央揃え、幅 70% から始まります。

幅は決められた段階から選び、配置は動画を包む段落に保存されます。エディターでは最初のクリックで動画を選択し、選択後にもう一度クリックすると再生できます。アドレスを変えるのではなく、動画を削除して新しく挿入します。

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS スタイル

動画は `.nabi-content iframe` で枠線や角丸を変更できます。保存された幅と配置は変更しないでください。

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

`aspect-ratio`、幅、配置用の margin は、パッケージが動画サイズを保つために使います。上書きしないでください。
