---
title: Yazı Tipi
description: Seçili metne veya paragrafa bir yazı tipi ailesi uygulayın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Yazı Tipi

Seçili metne bir yazı tipi ailesi uygulayın. Bir aralık seçiliyse yalnızca o aralık değişir; yalnızca imleç varsa geçerli paragraftaki metne uygulanır. Gerçek yazı tipi dosyaları ve `font-family` değerleri hizmetin CSS'sinde tanımlanır.

Varsayılan aileler `sans`, `serif`, `mono` ve `cursive`tir. Özellikle Türkçe ya da başka çok dilli içerik kullanan hizmetlerde her ailenin hangi yazı tiplerini kullanacağını açıkça belirlemek daha iyidir.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values` verilmezse tüm varsayılan aileler kullanılır. Belgelerde yalnızca `values` içinde yer alan değerlere izin verilir.

## CSS stilleri

Belge yalnızca aile adını saklar; yazı tipi dosyalarını CSS seçer. Değişkenleri hem düzenleyici hem yayımlanmış görünüm için aynı kapsayıcıda değiştirin.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Web yazı tipleri kullanıyorsanız önce bu dosyaları yükleyin. `cursive` birçok dil için genellikle yeterli kapsama sahip değildir; bu yüzden hizmetinizde kullanacağınız gerçek yazı tipini seçtikten sonra sunmak daha iyidir.
