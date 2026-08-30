---
title: Temel kullanım
description: Tarayıcıda NABI NOTE düzenleyicisini kurmanın, kaydetmenin ve geri yüklemenin temel akışı.
---

# Temel kullanım

Bu belge, tarayıcıda çalışan bir CSR düzenleyicisini temel alır. Kullanacağınız kanatları seçer, düzenleyiciyi
ekrana bağlar, ardından NABI TREE JSON'u kaydedip yeniden yüklersiniz.

## Kurulum ve temel HTML

```bash
npm install nabi-note
```

Düzenleyici ve yayın ekranı aynı CSS'yi yükler. Düzenleme alanına `contenteditable` özniteliğini doğrudan
eklemeyin; bunu `mountSurface()` yönetir.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Düzenleyiciyi bağlama

`allBasic()`, ayrı bir sunucu bağlantısı olmadan kullanılabilen resmi kanatları seçer. Yükleme, dosya
kaydetme/açma ve değişiklik karşılaştırma gibi hizmet tarafı bağlantısı isteyen kanatları, ilgili kanat
belgesindeki yönergelere göre ekleyin.

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  wings,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'tr',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'tr',
  placeholder: 'İçeriğinizi girin.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'tr',
})
```

`locale`, araç çubuğu ve yardım metinlerinin dilidir; tüm ekran parçalarına aynı değeri verin.
`placeholder`, boş düzenleyicide görünen metindir; boş dize olursa gizlenir. `onError`, komut veya callback
içinde yalıtılmış hataları alır. `undoLimit`, geri alma sayısıdır ve varsayılanı 200'dür. `typingMergeMs`,
ardışık yazımı tek bir geri alma işleminde birleştiren süredir; `0` olursa her karakter ayrı olur.

Her düzenleyici için çakışmayan içerik ve araç çubuğu root'ları kullanın. Birden çok düzenleyicinin bulunduğu
ekranda da kısayolların ve odağın karışmaması için araç çubuğunun `surface` alanına kendi düzenleme alanını
iletmelisiniz.

## Kanatları seçme

Yalnızca gereken özellikleri eklemek için `use()` ve `drop()` kullanın. Her kanadın kabul ettiği seçenekleri
ilgili kanat tanıtım belgesinden öğrenebilirsiniz.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'tr' })
```

Küçük bir bundle gerektiğinde `boldWing`, `imageWing` gibi yalnızca gereken kanatları dizi olarak da
iletebilirsiniz. Olmayan adlar, geçersiz seçenekler ve kopuk bağımlılıklar düzenleyici oluşturulurken hemen
hata verir.

## Kaydetme ve yükleme

Yeniden düzenlenecek belgeler için `getJson()` ile alınan NABI TREE JSON'u saklayın. `getHtml()` yayın için
çıktıdır. Düzenleme ekranına özel `getEditorHtml()` saklanmaz.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) {
  showError('Kaydedilen belge okunamadı.')
}

const publishedHtml = nabi.getHtml()
```

Harici HTML içe aktarırken `setHtml()` kullanın. Tarayıcı düzenleyicisi HTML parser'ını otomatik bağladığı için
ayrı bir parser seçeneği gerekmez. `setJson()` ve `setHtml()`, geçersiz ve boş olmayan girdilerde `false`
döndürür ve mevcut belgeyi korur.

```ts
nabi.setHtml('<p>İçe aktarılan belge</p>')
```

JSON ve HTML'nin ikisi de güvenilmeyen girdidir. Kaydedilen kanatlar ve izin kuralları üzerinden okunurlar;
ancak yükleme yetkisi denetimini veya hizmetin güvenlik politikasını onların yerine getirmezler.

## Sık kullanılan API'ler

| İş | API |
| --- | --- |
| Düzenleyiciyi kurma | `createNabiWith`, `wings` |
| Düzenleme ekranı ve araç çubuğunu bağlama | `mountSurface`, `mountToolbar` |
| Kaydetme ve geri yükleme | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Değişikliği izleme | `nabi.onChange(listener)` |
| Geri alma ve yineleme | `nabi.undo()`, `nabi.redo()` |
| Sunucu HTML'si oluşturma | `nabi-note/ssr` içindeki `renderStoredHtml` |
| Yayın ekranı özellikleri | `nabi-note/viewer` içindeki `attachViewer` |
| Belge karşılaştırma | `nabi-note/diff` içindeki `diffDocs` |

Kesin türleri ve tüm bağımsız değişkenleri önce kurulu paketin tür bildirimlerinde denetleyin. Otomasyon
araçları için [İngilizce API reference](https://nabi.saro.me/llms/api-reference.md) da sunulmaktadır.

## Ekranı kapatırken

Mount edilen parçaları oluşturulma sırasının tersine kaldırın. Düzenleme alanının `innerHTML` değerini doğrudan
değiştirmeyin; belgeyi değiştirirken `setJson()`, `setHtml()`, `applyCommand()` gibi açık API'leri kullanın.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
