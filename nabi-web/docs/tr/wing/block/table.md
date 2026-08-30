---
title: Tablo
description: Satır ve sütun oluşturun, hücreleri düzenleyin ve sütun sıralamayı destekleyin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tablo

Tablo oluşturmak için araç çubuğundan satır ve sütun seçin. Hücre içinde içerik, birden çok paragraf yerine satır sonlarıyla sürer; Tab ve Shift+Tab sonraki veya önceki hücreye gider.

Satır ya da sütun ekleme ve silme, hücre birleştirme ve başlık hücrelerini değiştirme seçili hücrelerin çevresinde çalışır. Tabloyu sıralanabilir olarak kaydettikten sonra yayımlanmış görünümde sütun sıralaması kullanmak için `nabi-note/viewer` içinden `attachViewer()` bağlayın. Birleştirilmiş hücreli tablolar sıralanmaz.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS stilleri

Tabloyu `.nabi-content table`, hücreleri `.nabi-content :is(th, td)` ile biçimlendirin. Hücre yapısını veya viewer'ın eklediği sıralama düğmesini değiştirmeyin.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

Viewer bağlıysa `.nabi-sort` düğmesini koruyun. Hücre `position` değerini veya sağ iç boşluğu zorla değiştirirseniz düğmenin üzerine binebilir.
