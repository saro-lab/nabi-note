---
title: Bağlantı
description: Güvenli web adreslerini bağlayın ve yüklenen ekleri gösterin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Bağlantı

Metni seçip ona bir adres ekleyin. Metin seçmeden adres girerseniz adresin kendisi bağlantı metni olarak eklenir. Bir `http://` veya `https://` adresi yazıp ardından Space ya da Enter’a basmak da onu bağlantıya dönüştürür.

Bağlantılar yalnızca `http:`, `https:` ve `.` veya `/` ile başlayan aynı site yollarını saklar. Kökeni açıkça belirlenemeyen `javascript:` veya `//example.com` gibi adresler reddedilir. Upload ile oluşturulan ek bağlantıları dosya bilgisini de saklar ve normal bağlantılar gibi elle oluşturulamaz.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS Styles

Normal bağlantıları `.nabi-content a` ile, ek bağlantılarını ise ayrıca `.nabi-content a[data-nabi-file]` ile stillendirin.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Ek bağlantılarının `::before` ve `::after` parçaları dosya ikonunu ve uzantısını göstermek için kullanılır; bu yüzden genellikle bunların `content` değerini değiştirmemek veya kaldırmamak en iyisidir.
