---
title: Kontrol listesi
description: Tamamlanma durumunu belgeyle birlikte saklayan bir listedir.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kontrol listesi

Tamamlanma durumunu içeren bir listedir. Boş bir paragrafta `[ ]` veya `[x]` yazdıktan sonra Space tuşuna basarak ya da araç çubuğundan oluşturur, onay kutusuna basarak durumu değiştirirsiniz.

İşaretli olup olmadığı, öğe özniteliği olarak belgeyle birlikte saklanır. Bir öğeyi böldüğünüzde işaret durumu boş önceki öğeyi değil, metnin kaldığı öğeyi izler; böylece tamamlanmış bir işi ikiye bölmek durumu tersine çevirmez.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
