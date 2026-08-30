---
title: Alıntı
description: Alıntılanan metni gruplandırın veya bağlamı birden çok paragrafta ayırın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Alıntı

Alıntılanan metni gruplandırın veya bağlamı birden çok paragrafta ayırın. Boş bir paragrafta `>` yazıp ardından Boşluk tuşuna basın ya da araç çubuğundan seçili paragrafları alıntıya çevirin.

Alıntı, sıradan paragrafların yanı sıra liste ve resim gibi bloklar da içerebilir. Aynı aralığa yeniden uygulamak, alıntıyı çözüp dıştaki paragraflara döndürür.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS stilleri

Kenarlıkları ve boşlukları değiştirerek alıntıları `.nabi-content blockquote` ile biçimlendirin.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` içindeki paragraf yapısını koruyun; yalnızca dış boşluk, kenarlık ve renk gibi sunum özelliklerini değiştirin.
