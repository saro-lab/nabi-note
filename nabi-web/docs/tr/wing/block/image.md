---
title: Görsel
description: Bir görsel URL'si ekleyin, genişliğini ve hizalamasını ayarlayın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Görsel

Bir görsel URL'si ekleyin, genişliğini ve hizalamasını ayarlayın. Varsayılan olarak adresler `http:`, `https:` veya aynı site yollarıyla sınırlıdır; yeni görsel ortada %60 genişlikle başlar.

Genişlik yalnızca sabit adımlarla saklanır; hizalama görseli saran paragrafta tutulur. `blob:` ya da `data:image/...` önizlemelerini kullanmak için hem image wing'de hem editör kurulumunda yerel URL'lere açıkça izin verin. SVG data URL'lerine izin verilmez.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Bu wing belgeye bir adres ekler; dosya yüklemez. Dosyaları sunucuya göndermek için [upload wing](/tr/wing/etc/upload) bağlayın.

## Görsel seçici bağlama

Görsel düğmesinin varsayılan URL giriş penceresini hizmetinizin görsel seçicisiyle değiştirmek için `mountToolbar()` içinde `panels.img` kullanın. Anahtarlar araç çubuğu yuvası adlarıdır; belirtilmeyen araçlar varsayılan pencerelerini kullanmaya devam eder.

`mode: 'modal'`, tüm sayfayı kaplayan yarı saydam bir arka plan üzerinde pencere açar. `mode: 'inline'`, masaüstünde araç düğmesinin yakınında, mobilde ise tam ekran açılır. Mobil görünüm, görüntü alanının genişliği ve `--nabi-mobile-breakpoint` ile belirlenir; açık bir `inline` paneli bu eşik geçildiğinde kapanır.

Her iki mod da yalnızca boş bir `root` sağlar; başlık, giriş alanı veya düğme oluşturmaz. HTML veya arayüzünüzü `render` içinde ekleyin, kapatma düğmesini `close()` işlevine, görsel seçimini ise `insertImage(url, 'pointer')` işlevine bağlayın. Mevcut işlev biçimindeki ayarlar (`img: renderer`) görüntülenme davranışını korur.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker`, hizmetinizde uyguladığınız bir işlevdir. Verilen `root` içinde arayüzünüzü eşzamanlı olarak oluşturur ve bir temizleme işlevi döndürür. Görsel listesini yükleme veya dosya yükleme gibi eşzamansız işlemlere `signal` bağlayın ve seçilen görselin URL’sini `onSelect` işlevine iletin. Bu API dosya aktarmaz; mevcut görsel URL izin kuralları geçerliliğini korur.

`insertImage(src, by?)`, dönüş değeri ve seçimi geri yükleme kuralları dahil olmak üzere `run('insertImage', { src }, by)` ile aynıdır. `by` belirtilmezse `'keyboard'` kullanılır. `render` işlevini `async` olarak tanımlamayın.

Panel kapatıldığında veya araç çubuğu kaldırıldığında `signal` iptal edilir ve temizleme işlevi çağrılır. `run()` paneli kapatır ve açılırken kaydedilen seçime komutu bir kez uygular. Panel zaten kapalıysa veya açıldıktan sonra belge içeriği değiştiyse komutu çalıştırmadan `false` döndürür.

## CSS stilleri

Görselleri `.nabi-content img` ile biçimlendirin. Saklanan genişliği ve hizalamayı bozmadan yalnızca kenarlık veya gölge gibi görsel ayrıntıları değiştirin.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, genişlik ve hizalama için varsayılan kuralları koruyun. Görsel boyutu belgede saklanır; CSS ile sabit genişliği zorlamak yazarın seçtiği genişlikle çakışabilir.
