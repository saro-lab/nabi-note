---
title: Ayrıntılar
description: Bir özeti ve gövdeyi gruplandırın, başlangıçta açık olup olmadığını saklayın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ayrıntılar

Kısa bir özeti ve gövdeyi tek blokta gruplandırın. Araç çubuğundan oluşturduğunuzda önce özeti girer, sonra altındaki içeriği yazmayı sürdürürsünüz.

Üçgenle belirlenen açık durum belgede saklanır ve yayımlanmış görünümün başlangıç durumu olur. Düzenlerken gövde değiştirilebilmesi için açık tutulur, ancak saklanan durum değeri korunur.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS stilleri

Ayrıntı bloğunu `.nabi-content details`, başlığını da `.nabi-content details > summary` ile biçimlendirin.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` niteliği, yazarın sakladığı başlangıçtaki açık durumdur. CSS bu durumu biçimlendirebilir; fakat durumun kendisini zorlamamak daha iyidir.
