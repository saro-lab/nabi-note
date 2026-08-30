---
title: Ayırıcı çizgi
description: Belge akışını ayıran yatay bir çizgi ekler.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ayırıcı çizgi

Belgenin akışını ayıran yatay bir çizgidir. Boş bir paragrafa üç veya daha fazla tire yazıp Enter tuşuna basarak ya da araç çubuğundan ekleyebilirsiniz.

Ayırıcı çizgi metin içermeyen bağımsız bir bloktur; başlık veya renk gibi biçimler taşımaz. Yalnızca önceki ve sonraki paragrafları ayırmak için kullanın.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
