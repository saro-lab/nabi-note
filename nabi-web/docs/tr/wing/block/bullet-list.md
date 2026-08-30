---
title: Madde işaretli liste
description: Birden çok öğeyi sırasız olarak listeler.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Madde işaretli liste

Birden çok öğeyi sırasız olarak listeleyen bir listedir. Boş bir paragrafta `-` yazdıktan sonra Space tuşuna basarak veya araç çubuğundan dönüştürerek oluşturabilirsiniz. Seçili paragrafları da tek seferde listeye dönüştürebilirsiniz.

Liste içinde Tab ile bir düzey girinti ekler, Shift+Tab ile girintiyi kaldırırsınız. Enter yeni bir öğe oluşturur; boş bir öğede tekrar Enter tuşuna basmak listeyi bitirir.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
