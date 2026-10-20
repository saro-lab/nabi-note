---
title: Karşılaştırma
description: İki belgeyi yan yana karşılaştırın ve seçilen eski içeriği güncel belgeye uygulayın.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Karşılaştırma

Değişiklikleri görmek için kaydedilmiş iki belgeyi yan yana açın. Görünüm editör olmadan çalışır; bir geri çağırım bağlayarak seçilen eski içeriği güncel belgeye uygulayabilirsiniz.

## Seçilen eski içeriği uygulama

Bağımsız karşılaştırmalar varsayılan olarak salt okunurdur ve **&gt;&gt;** uygulama düğmelerini göstermez. Bu düğmeleri göstermek için bir `onMerge` geri çağrısı bağlayın.

Solda eski, sağda güncel belge bulunur. Değişikliğin yanındaki **&gt;&gt;**, ilgili paragraf veya satır grubunun eski içeriğini uygular. Karakter karakter seçim yapılmaz. Silinmiş içeriği geri getirmek veya yeni eklenen içeriği kaldırmak da mümkündür.

Aşağıdaki örnek salt okunurdur. Toplantı saatinin ve getirilecek eşyaların nasıl değiştiğine bakın. **Baştan başla**, özgün örneği geri yükler.

<CompareDemo />

## Bağımsız karşılaştırma görünümü

`nabi-note/diff` içinden alın. `before` ve `after` için kaydedilmiş NABI TREE JSON veya HTML dizeleri verin. Tablo, liste, resim ve diğer içeriği eksiksiz okuyup göstermek için registry'yi belgeyi oluşturan editörle aynı wing'lerle kurun.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'tr',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Varsayılan olarak yalnız değişiklikler ve çevresindeki bağlam gösterilir. Katlama düğmesi tüm belgeyi açar; önceki/sonraki düğmeleri değişiklikler arasında dolaşır. Değişiklik yoksa tüm belge gösterilir. `onMerge` verilmezse görünüm salt okunurdur.

## Tıklamayla birleştirmeyi geri çağırıma bağlama

Tıklama, `onMerge` işlevine sonuç önerisi iletir. Geri çağırımı bağlamak otomatik kayıt yapmaz. Hizmet öneriyi kabul edip `update()` çağırınca karşılaştırma da değişir.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'tr',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result`, yalnız seçilen değişikliği içeren NABI TREE JSON'dur. `before` ve `after` tıklama anındaki belgelerdir; `changeId` değişikliği, `revision` karşılaştırma durumunu tanımlar. Bu `revision` değerini `update()` için üçüncü argüman olarak verin: karşılaştırma değişmişse `false` döner ve öneriyi uygulamaz.

Asenkron geri çağırım beklenirken yinelenen tıklamalar engellenir. Başka belgelerle güncelleme veya görünümü kaldırma `signal` değerini iptal eder. Sunucuya kaydederken eski sonuçla yeni belgeyi ezmemek için hem sinyali hem sunucu belge sürümünü denetleyin.

## Editörden karşılaştırma açma

Araç çubuğundan açmak için `diff` wing'ini ve `mountDiffWing()` işlevini bağlayın. Temel, son yüklenen belgedir. Normal düzenleme ve geri alma temeli değiştirmez.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'tr',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge` varsayılan olarak `true` olduğundan, seçilen eski içerik editöre uygulanabilir. İşlem geri alınabilir ve temel korunur. Görünüm açıkken asıl editör değişirse karşılaştırma yeniden hesaplanır. Salt okunur karşılaştırma için `merge: false` belirtin.

Görünümü kaldırırken `toolbar.unmount()` ve `comparison.unmount()` çağırın. Düzenleme başlangıcındaki sürümü de dahil edip iki tarafın değişikliklerini otomatik birleştirmek için [Birleştirme](./merge) kullanın.
