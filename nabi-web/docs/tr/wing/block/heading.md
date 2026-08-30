---
title: Başlık
description: Bir paragrafı başlığa dönüştürün ve düzeyini seçin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Başlık

Bir paragrafı başlığa dönüştürür ve düzeyini belirler. Araç çubuğunda başlığı etkinleştirip H1 ile H6 arasından seçim yapabilir veya boş bir paragrafta `#` ile `######` arasındaki işaretlerin ardından Space tuşuna basabilirsiniz.

Başlık ayrı bir blok türü değildir; paragrafta saklanan bir özniteliktir. Başlığı tekrar seçmek onu normal paragrafa döndürür; böylece gövde yapısını koruyarak yalnızca düzeyi değiştirebilirsiniz.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
