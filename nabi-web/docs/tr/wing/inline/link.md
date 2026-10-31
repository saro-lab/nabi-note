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

## URL yapıştırma

Başındaki ve sonundaki boşluklar çıkarıldığında yapıştırılan içeriğin tamamı geçerli bir `http://` veya `https://` URL’siyse hemen bağlantı olarak eklenir. Cümle içindeki URL’ler, birden fazla URL içeren metinler ve göreli yollar mevcut yapıştırma davranışını izler. Kod bloklarında ve bağlantı wing’i olmayan editörlerde içerik metin olarak kalır. Editörden kopyalanmış geçerli dahili pano verileri, özgün biçimlendirmeyi korumak için önceliklidir.

Bağlantının görünen metnini belirlemek için `mountSurface()` içindeki `onPasteUrl` geri çağırımını kullanın.

| Argüman | Değer |
| --- | --- |
| `url` | Başındaki ve sonundaki boşluklar çıkarılmış tam URL |
| `isSameOrigin` | URL’nin protokol, ana makine ve port bilgilerinin editörü içeren belgenin origin’iyle eşleşip eşleşmediği |
| `path` | `/` ile başlayan, sorgu ve fragment bilgisini içeren yol. Örnek: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Döndürülen dize yalnızca boşluklardan oluşmuyorsa görünen metin olarak kullanılır. Geri çağırım yoksa, boş veya dize olmayan bir değer döndürürse ya da hata verirse yapıştırılan URL görünen metin olarak kalır. Döndürülen dizeler hiçbir zaman HTML olarak yorumlanmaz ve bağlantı adresini değiştirmez.

Geri çağırım `async` işlevlerini ve Promise değerlerini de destekler. Yanıt beklenirken URL bağlantısı hemen eklenir; daha sonra gelen geçerli sonuç yalnızca o bağlantının görünen metnini değiştirir. Bağlantı düzenlenmiş veya silinmişse, yeni bir belge yüklenmişse ya da surface kaldırılmışsa geç gelen sonuç yok sayılır.

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
