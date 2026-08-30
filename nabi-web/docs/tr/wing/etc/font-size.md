---
title: Yazı Boyutu
description: Metin boyutunu izin verilen adımlar içinde değiştirin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Yazı Boyutu

Seçili metni bir boyut adımına değiştirin. Bir aralık seçiliyse adım o aralığa uygulanır; yalnızca imleç varsa geçerli paragraftaki metnin boyutunu değiştirir. Saklanan veri `px` gibi keyfî değerleri değil, yalnızca izin verilen adımları tutar.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values` verilmezse `xs`, `sm`, `lg` ve `xl` adımları kullanılır. Listeyi daraltırsanız eski belgelerde zaten bulunan diğer adımlar yüklenirken kaldırılır.

## CSS stilleri

Boyutları `.nabi-content [data-nabi-size="xs"]` gibi saklanan adım seçicileriyle değiştirebilirsiniz. Belgede olmayan keyfî adımlar uydurmayın; CSS'yi yalnızca kayıtlı `values` içinde ayarlayın.

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

Adımlar arasındaki boyut farkını tutarlı bırakmak, belge yayımlandığında yazarın düzenleyicide seçtiği anlamı korur.
