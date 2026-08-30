---
title: Biçimlendirmeyi Temizle
description: Seçimdeki metin ve paragraf biçimlendirmesini kaldırın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Biçimlendirmeyi Temizle

Seçili aralıktaki metin biçimlendirmesini bir kerede kaldırın. Kalın, renk ve yazı tipi gibi kayıtlı varsayılan işaretler ile başlık, hizalama ve büyük başlangıç harfi gibi paragraf nitelikleri buna dahildir. Esc tuşuna hızlıca iki kez basmak aynı işlemi yapar.

Liste, tablo, alıntı veya görsel gibi belge yapılarını düz metne dönüştürmez. Görsel ve videoların dış hizalaması ile yüklemelerin oluşturduğu ek bağlantıları olduğu gibi kalır.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Temizlemek istediğiniz biçimlendirme wing'leri de seçilmiş olmalıdır; aksi halde onların biçimlendirmesi kaldırılamaz.
