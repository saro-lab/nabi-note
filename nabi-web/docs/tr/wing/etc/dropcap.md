---
title: Büyük Başlangıç Harfi
description: Gövde metnini büyük bir ilk harfle başlatın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Büyük Başlangıç Harfi

Bir paragrafın ilk harfini daha büyük boyutta yerleştirip sonraki satırların onun yanında akmasını sağlayın. Bu paragraf düzeyinde biçimlendirmedir; seçili bir sözcüğün yalnızca bir bölümüne uygulanmaz.

Yayımlanmış ve düzenleme görünümü aynı şekli korur. Düzenlerken imleç ve silme konumlarının kaymaması için ilk harf gerçek bir öğeyle sarılır; bu öğe kaydedilen belge içeriğine dahil edilmez.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS stilleri

Yayımlanmış ve düzenleme görünümü ilk harf için farklı seçiciler kullanır. Yayımlanmış görünüm `[data-nabi-dropcap="1"]::first-letter`, düzenleme görünümü ise gerçek `[data-nabi-dropcap-letter]` öğesini kullanır. Renk, yazı tipi veya boyut gibi görünür değerleri değiştirirken, düzenleme ve yayımlanmış çıktı aynı görünsün diye iki seçiciyi birlikte yazın.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Boyutu ve satır yüksekliğini değiştirirseniz aynı değerleri iki seçiciye de uygulayın.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Büyük başlangıç harfleri ilk harfin çevresindeki satır akışını hesaplar; yalnızca bir tarafı değiştirmek veya değerleri çok büyütmek WYSIWYG şeklini bozabilir. Yine de düzenleyiciye yeni bir `::first-letter` kuralı eklemeyin. Düzenleyicide yalnızca mevcut `[data-nabi-dropcap-letter]` öğesini biçimlendirin.
