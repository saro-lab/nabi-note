---
title: Kayan bölge
description: Metin, görsel ve tabloları ana metnin yanına yerleştirin; sonraki paragraflar yanlarından aksın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kayan bölge

Kısa bir açıklama, görsel veya küçük tabloyu sola ya da sağa yerleştirip ana metnin yanında akmasını sağlayın. Alanın içeriğini aynı düzenleyicide doğrudan değiştirebilirsiniz. Kesik çizgili kenarlık yalnızca düzenleme sırasında görünür; önizlemede ve yayımlanan görünümde yalnızca içerik ve yerleşim kalır.

Aşağıdaki örnekte imleci alanın içine yerleştirin ve özellik araçlarıyla tarafını ve en fazla genişliğini değiştirin. Önizlemede, kesik çizgili kenarlık olmadan metnin nasıl aktığını görebilirsiniz.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Kayan bölgeler temel kanatlara dahildir. Yalnızca gereken kanatları birleştiriyorsanız `wings().use('float')` kullanın veya `floatWing` öğesini doğrudan kaydedin. Alanın içinde kullanılacak görsel, tablo, liste ve diğer içeriklerin kanatlarını da kaydedin.

## Oluşturma ve yerleştirme

İmleci ana metne yerleştirip **Kayan bölge** düğmesine basarak boş bir alan oluşturun. Varsayılan taraf sağ, en fazla genişlik %40’tır. Önce birden fazla paragraf seçip düğmeye basarsanız seçimin dokunduğu tüm paragraflar bütünüyle tek bir alana sarılır. Mevcut bir kayan bölgeyi tekrar saramaz veya içine başka bir kayan bölge oluşturamazsınız.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

İmleç alanın içindeyken özellik araçlarından sol veya sağ tarafı ve en fazla genişliği değiştirin. 20%, 30%, 40% veya 50% arasından seçim yapabilirsiniz. Değer tüm ekranın değil, ana metnin genişliğine göredir; içerik kısaysa alanın gerçek genişliği daha dar olabilir.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Metin, görsel ve tablo yapıştırma, blok dönüştürme ve yükleme alanın içinde kalır. İçteki tabloyu silmek yalnızca o tabloyu kaldırır. Seçim alanın hem içini hem dışını kapsadığında iç blokları ekleyemez veya dönüştüremezsiniz.

Genişlik değerinin yanındaki **Kayan bölgeyi kaldır** düğmesi içeriği silmeden ana metne geri taşır. Oluşturma, yerleşim değişiklikleri ve sarmayı kaldırma işlemleri geri alma ve yinelemeyi destekler.

```ts
nabi.applyCommand('unwrapFloat')
```

## Metnin alanın çevresinde akışı

Sonraki paragraflar alanın yanında akar; alan bittiğinde ana metnin tam genişliğine döner. Sonraki başlık, tablo, kod bloğu, ayırıcı veya yeni kayan bölge önceki alanın altında başlar.

Ana metnin genişliği `36rem` değerinin altındaysa alan ve metin tek sütun olarak yerleştirilir. Yazdırmada da tek sütun kullanılır; kaydedilen taraf ve en fazla genişlik korunur. Belge karşılaştırma görünümü her alanın tarafını ve en fazla genişliğini korur, ancak değişiklikleri okumayı kolaylaştırmak için sonraki bloğu altında ayrı gösterir.

## Kaydetme ve yükleme

JSON, `float` düğümünün `a.side` ve `a.w` değerlerini iç bloklarıyla birlikte kaydeder. HTML’de, normal bir nesne paragrafının içindeki `div` üzerinde `data-nabi-float` ve `data-nabi-float-width` öznitelikleri kullanılır.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Ana metnin yanına yerleştirilecek açıklama.</p>
  </div>
</div>
<p>Bu paragraf alanın yanında devam eder.</p>
```

Markdown dışa aktarımı alanı HTML olarak korur. Rastgele CSS `float` stilleri içe aktarılmadığı için kaydetme ve geri yüklemede NABI NOTE tarafından oluşturulmuş JSON veya HTML kullanın. Taraf ve genişliği korumak için düzenleyici, SSR, önizleme ve yayımlanan görünümde aynı kanatları ve CSS’i bağlayın.

## CSS stilleri

Alanın renklerini ve boşluklarını `[data-nabi-float]` seçicisiyle biçimlendirebilirsiniz. Dış paragraf yerleşimi ve en fazla genişliği yönettiği için `float`, `display` veya genişliği doğrudan geçersiz kılmayın.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
