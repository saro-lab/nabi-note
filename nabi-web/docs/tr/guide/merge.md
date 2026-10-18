---
title: Birleştirme
description: Başlangıç sürümünü, kendi sürümünüzü ve arada kaydedilen sürümü birleştirip kalan çakışmaları düzenleyerek çözün.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Birleştirme

Düzenleme sırasında başka değişiklikler kaydedildiyse iki tarafı başlangıç sürümüne göre birleştirin. Otomatik birleştirilebilen her şey hemen uygulanır; yalnız örtüşen değişiklikler çakışma kalır. Bu bir wing değil, `nabi-note/merge` içindeki bağımsız görünümdür.

| Sol | Orta | Sağ |
| --- | --- | --- |
| Düzenlemenin başladığı sürüm | Otomatik birleştirme uygulanmış güncel belgeniz | Düzenleme sırasında kaydedilen sürüm |
| Salt okunur | Doğrudan düzenlenebilir | Salt okunur |

Ortada normal editördeki gibi metin, biçim, tablo, liste ve resimleri düzenleyebilirsiniz. Özellikleri verilen wing'ler belirler. Çakışma işaretleri ve çözüm durumu kaydedilen içeriğe karışmaz.

## Tamamen otomatik birleştirme örneği

Siz toplantı saatini **11.00**, başka biri yeri **3. kat toplantı odası** yaptınız. Farklı paragraflar değiştiğinden ortadaki sonuç ikisini de içerir.

Çakışma kalmadığından hemen **Onayla** düğmesine basabilir veya önce ortadaki metni iyileştirebilirsiniz. Altta gösterilen son belge onay geri çağırımının aldığı gerçek sonuçtur.

<MergeDemo />

## Kısmen otomatik birleştirme örneği

Bu kez siz saati **11.00**, başka biri **14.00** yaptınız. Aynı paragraf farklı değiştiğinden saat çakışma kalır. Sizin sorumluları **Jimin ve Seoyeon** yapmanız ve diğer kişinin yeri **3. kat toplantı odası** yapması otomatik uygulanır.

Çakışmayı şu yollardan biriyle çözün:

- Sol **&gt;&gt;**: başlangıç sürümünün ilgili içeriğini kullanır.
- Sağ **&lt;&lt;**: yeni kaydedilen sürümün ilgili içeriğini kullanır.
- **Mevcut içerikle çöz**: ortayı koruyup veya düzenleyip çözüldü olarak işaretler.

Ortadaki saat cümlesini değiştirip **Mevcut içerikle çöz** düğmesine basın. Onay ancak bütün çakışmalar çözüldüğünde mümkündür.

<MergeDemo partial />

Çözülmüş bölgeyi yeniden düzenlemek durumunu korur. Çözümü geri almak durumu da geri alır; yinelemek geri getirir. Metni silmek veya düzenlemek tek başına açık çakışmayı çözmez.

## Otomatik birleştirme ve çakışma kuralları

Başlangıç belgesinden sizin belgenize ve aynı başlangıçtan yeni sürüme değişiklikler karşılaştırılır. Tek taraflı ve iki tarafta aynı olan değişiklikler otomatik uygulanır. Farklı paragraf veya satır değişiklikleri de birleştirilir.

Git metin birleştirmesi gibi örtüşme paragraf ve satırlarla belirlenir. Aynı satırın farklı kelimelerini değiştirmek bile çakışma kalır. Aynı konuma farklı eklemeler veya diğer tarafın sildiği içeriği düzenlemek de karar gerektirir.

Tablo, liste veya kayan alan gibi yapılı bloklar iki tarafta farklı değişirse tüm yapı çakışır. Hücreler ve liste öğeleri rastgele karıştırılmaz; içeriği seçin veya ortada düzenleyin. Konumu güvenle belirlenemeyen örtüşen taşıma ve düzenlemeler de otomatik uygulanmaz.

## Bağımsız birleştirme görünümü bağlama

`base`, `local`, `incoming` için kaydedilmiş NABI TREE JSON veya HTML dizeleri verin. Özgün editörle aynı wing ve seçenekleri kullanın. `mountMerge()` orta editörü, araç çubuğunu, iki kaynağı, çakışma araçlarını ve onay düğmesini oluşturur.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'tr',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm`, tamamen çözülmüş güncel sonucun JSON'unu, yayımlanacak HTML'ini, düzenleme revision'ını ve `incomingVersion` değerini alır. `false` döndürmek onayı tamamlamaz. Promise beklenirken düzenleme, çakışma seçimi ve tekrar onay engellenir. Görünümü kaldırmak sonucun `signal` değerini iptal eder. Korece IME birleştirmesi bitmeden onaylanamaz.

Resim seçici veya yükleme gibi hizmet işlemlerini normal editördeki gibi bağlayın. `toolbarOptions` ile panelleri ve host işlemlerini, `surfaceOptions` ile düzenleme yüzeyi seçeneklerini verin.

`incomingVersion`, hizmetin verdiği değeri değiştirmeden döndürür. Kaydederken son sunucu sürümüyle karşılaştırmak hizmetin görevidir. Birleştirme sırasında başka sürüm kaydedilirse eski sonuçla ezmek yerine son belgeyi alın ve yeni birleştirme başlatın.

Görünüm dışından da durumu okuyabilir veya onay çağırabilirsiniz.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Sonucu `merge.nabi.getJson()` ve `merge.nabi.getHtml()` ile okuyun. Düzenleme DOM'unu veya `getEditorHtml()` çıktısını kaydetmeyin. İki sürüm arasında yalnız seçilen eski içeriği uygulamak için [Karşılaştırma](./compare) içindeki tıklamayla birleştirmeyi kullanın.

## Yüklemeler bitince onaylama

Dosya düğmesi, yapıştırma ve sürükleyip bırakma için `upload` wing'ini ve `mountUpload()` işlevini bağlayın. `sendUpload` dosyaları sunucuya gönderip `{ uri }` döndürür. Tam bağlantı ve ilerleme örneği için [Dosya yükleme](../wing/etc/upload) bölümüne bakın.

Belgeye henüz yansımayan yükleme gibi asenkron işlerde `merge.session.hold()` ile onayı ve çakışma seçimini bekletin. Tamamlanma, iptal veya kaldırma sırasında dönen işlevi çağırıp bekletmeyi bırakın. Dosyanın sonuca dahil olması için sunucuya yüklenir yüklenmez değil, **belgeye eklendikten sonra** bırakın.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'tr',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'tr',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` orta düzenleme DOM'udur; `merge.surface` ve `merge.toolbar` zaten bağlıdır. Aynı yerde ikinci yüzey veya çubuk oluşturmayın. Ek yükleme ve ilerleme mount'larını önce kaldırıp son olarak `merge.unmount()` çağırın.
