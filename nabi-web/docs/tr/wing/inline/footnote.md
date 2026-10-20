---
title: "Dipnot"
description: "Ek açıklamaları metindeki numaralar ve belgenin sonundaki listeyle ilişkilendirin."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Dipnot

Ek açıklamaları metindeki numaralar ve belgenin sonundaki listeyle ilişkilendirin.

Araç çubuğundaki dipnot düğmesiyle içerik girerek imleç konumuna dipnot ekleyin. Metin seçiliyse seçilen metin değiştirilmeden seçimin sonuna eklenir. Numaralar saklanmaz; belge sırasına göre otomatik atanır.

İçeriği özellik satırında düzenlemek için metindeki numaraya tıklayın. Silme aracını kullanın veya dipnotun yanında Backspace ya da Delete tuşuna iki kez basarak önce seçin, sonra silin. Alttaki liste salt okunurdur ve dipnot kalmadığında kaybolur.

Önizlemede ve viewer bağlanmış yayımlanmış sayfalarda numaranın üzerine gelerek, tıklayarak veya dokunarak içeriği okuyabilirsiniz. Yalnızca tek satırlık düz metin kabul edilir; gövdenin temel yazı boyutunun 0,875 katı büyüklükte sans serif yazıyla gösterilir. HTML olduğu gibi metin olarak gösterilir.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
