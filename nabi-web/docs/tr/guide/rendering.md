---
title: SSR kurulumu
description: Saklanan NABI TREE belgelerini sunucuda güvenle HTML'ye dönüştürün ve tarayıcıda düzenleyiciyi hydrate edin.
---

# SSR kurulumu

Sunucuda tarayıcı surface'lerini veya UI'ı değil, yalnızca `nabi-note/ssr` içe aktarın. Bu paket saklanan
NABI TREE JSON'unu denetler ve yayın HTML'sine ya da hydrate edilebilir düzenleyici HTML'sine dönüştürür.

## Yayın HTML'si oluşturma

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('Kaydedilen belge okunamadı.')
```

`renderStoredHtml()`, JSON girdisini denetler ve normalleştirir, ardından yayın HTML'sini döndürür. `null`,
geçerli registry'nin bu girdiyi okuyamadığı anlamına gelir. Yayın sayfasına paket CSS'sini ve `.nabi-content`
class'ını ekleyin.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Tablo sıralama veya kod renklendirme gerektiğinde yalnızca tarayıcıda `nabi-note/viewer` içinden
`attachViewer()` ekleyin. Basit yayın ekranı için CSS yeterlidir.

## Önceden oluşturulmuş düzenleyici işaretlemesini hydrate etme

İlk çizimden itibaren düzenleyiciyi göstermek için sunucuda `renderStoredEditorHtml()` kullanın ve tarayıcı
surface'ine `hydrate: true` verin.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Sunucu ve tarayıcı aynı belgeyi, aynı sıradaki kanat bildirimlerini ve HTML'yi etkileyen aynı seçenekleri
kullanmalıdır. Sunucu çıktısını içerik root'unun doğrudan çocukları olarak değiştirmeden yerleştirin; bu root'a
önceden `contenteditable` koymayın. Yapı uyuşmazsa surface yeni düzenleyici HTML'sini çizer.

## Araç çubuğunu da önceden oluşturma

`renderToolbarHtml()` ve `renderViewToolsHtml()`, araç çubuğu denetimlerini sunucuda önceden oluşturabilir.
Tarayıcıda registry, dil ve grup sırası eşleşirse mount işlemi mevcut denetimlere davranış bağlar. Araç çubuğu
root'u içinde keyfi host DOM kullanımı desteklenmez.

SSR sırasında `injectSheets()` gibi `Document` gerektiren tarayıcı API'lerini kullanmayın. Oluşturulmuş
`nabi-note/nabi.css` dosyasını bağlayın veya CSS bundle'ınıza ekleyin.
