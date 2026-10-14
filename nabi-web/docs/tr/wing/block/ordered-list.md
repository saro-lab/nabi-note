---
title: Numaralı liste
description: Sıralamanın önemli olduğu öğeleri numaralı listeye dönüştürür.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Numaralı liste

Sıralamanın önemli olduğu öğeleri numaralı listeye dönüştürür. Boş bir paragrafta `1.` gibi bir sayı ve nokta yazıp Space tuşuna basarak veya seçili paragrafları araç çubuğundan dönüştürerek oluşturabilirsiniz.

Görüntülenen numaralar öğelerin konumundan hesaplanır; bu nedenle öğe eklediğinizde veya girinti verdiğinizde otomatik olarak devam eder. Girilen başlangıç numarasını saklayıp istediğiniz bir numaradan sayma özelliği sunulmaz.

Enter sonraki öğeyi oluşturur, Shift+Enter ise yalnızca mevcut öğenin içinde satır sonu ekler. Tab ve Shift+Tab girintiyi artırır ve azaltır; tablo hücrelerinde de liste girintisi hücreler arasında geçişten önce gelir.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
