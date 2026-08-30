---
title: 画像
description: 画像アドレスを入れ、幅と配置を調整します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 画像

画像アドレスを入れ、幅と配置を調整します。既定では `http:`、`https:`、または同じサイト内のパスだけを許可し、新しい画像は中央揃え、幅 60% から始まります。

幅は決められた段階の中だけで保存され、配置は画像を包む段落に保存されます。`blob:` や `data:image/...` のプレビューを使うには、画像 wing とエディターの組み立て側の両方でローカル URL を明示的に許可する必要があります。SVG の data URL は許可されません。

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

この wing は文書にアドレスを入れる機能であり、ファイル転送は行いません。ファイルをサーバーへ送るには [アップロード wing](/ja/wing/etc/upload) を接続します。

## CSS スタイル

画像は `.nabi-content img` で装飾します。保存された幅と配置はそのままにし、枠線や影のような見た目だけを変えてください。

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`、`block-size`、幅、配置に関する基本ルールは維持してください。画像サイズは文書に保存された値なので、CSS で強制的に固定すると作成者が選んだ幅と衝突します。
