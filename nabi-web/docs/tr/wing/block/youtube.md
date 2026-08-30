---
title: YouTube
description: Belgeye bir YouTube videosu yerleştirin ve genişliğini ayarlayın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Bir YouTube video URL'sini veya video kimliğini kabul edip yerleştirilmiş bloğa dönüştürür. Belge tam URL yerine yalnızca 11 karakterlik video kimliğini ve genişliği saklar; yeni video ortada %70 genişlikle başlar.

Genişlik sabit adımlardan seçilir; hizalama, videoyu saran paragrafta saklanır. Düzenleyicide ilk tıklama videoyu seçer; seçildikten sonra yeniden tıklamak oynatabilir. Adresi değiştirmek için videoyu silip yenisini ekleyin.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS stilleri

Videonun kenarlığını veya köşelerini değiştirmek için `.nabi-content iframe` kullanın. Saklanan genişliği ya da hizalamayı değiştirmeyin.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

Paket, videoyu doğru boyutta tutmak için `aspect-ratio`, genişlik ve hizalama kenar boşluklarını kullanır; bunların üzerine yazmayın.
