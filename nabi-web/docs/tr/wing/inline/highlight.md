---
title: Vurgu
description: Seçili metnin arkasına izin verilen bir vurgu rengi uygulayın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Vurgu

Seçili metnin arkasına izin verilen bir vurgu rengi uygulayın. Kaydedilen veri, rastgele CSS renk değerleri yerine yalnızca izin verilen renk adlarını tutar; böylece belge verisi ve görsel stil ayrı kalır.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

`values` atlanırsa varsayılan palet `yellow`, `green`, `cyan`, `pink`, `purple` ve `orange` olur. Listeyi daraltırsanız kayıtlı olmayan renkler mevcut bir belge yüklenirken bile korunmaz.

## CSS Styles

Belge yalnızca renk adlarını saklar. Editör ve yayımlanmış görünüm renklerini CSS değişkenleriyle değiştirin.

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

Birden çok rengi birlikte değiştirmek, belgedeki renk adlarını koruyup yalnızca ürün havasını uyarlamanızı sağlar.

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
