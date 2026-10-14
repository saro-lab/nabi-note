---
title: Align
description: Change horizontal alignment for paragraphs and object blocks.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Align

Align the current paragraph, or the paragraphs in the selected range, left, center, or right. Objects that live inside a paragraph, such as images, videos, and tables, are aligned through the paragraph that wraps them.

Alignment is stored as a paragraph attribute, not as text formatting. Code blocks are excluded from alignment because indentation itself is meaningful there.

Tablo hücresinde imlecin bulunduğu iç paragraf veya görsel hizalanır. Sürükleyerek birden çok hücre seçildiğinde, bu hücrelerdeki hizalanabilir tüm paragraf ve görsellere uygulanır. Seçimde farklı hizalamalar varsa hiçbir hizalama düğmesi seçili gösterilmez.

Tablonun kendisini hizalamak için bağlam araçlarındaki **Tabloyu seç** seçeneğine basın veya imleci tabloyu saran paragrafta tablonun önüne ya da arkasına koyup ana araç çubuğunun hizalama düğmelerini kullanın. Yüzen alanın sol veya sağ konumunu hizalama düğmeleri yerine o alanın bağlam araçlarından değiştirin.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Geçerli seçime komut uygularken sol için `l`, orta için `c`, sağ için `r` kullanın.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
