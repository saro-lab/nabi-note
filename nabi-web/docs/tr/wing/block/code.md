---
title: Kod
description: Çok satırlı kodu, sözdizimi vurgulamada kullanılacak dil bilgisiyle birlikte saklar.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kod

Çok satırlı kodu normal metinden ayrı olarak ekleyin. Boş bir paragrafta üç ters tırnak yazıp Space veya Enter tuşuna basın ya da araç çubuğundan kod bloğuna geçin. Ters tırnaklardan sonra `ts` gibi bir dil adı eklerseniz bu ad da saklanır.

Dil adı, sözdizimi vurgulamada kullanılan bir tanımlayıcıdır; kayıtlı listenin dışındaki adlar da elle girilebilir. Kod içeriği ve girintiler korunması gerektiğinden kod bloklarında paragraf hizalaması uygulanmaz.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Kod vurgulayıcıyı bağlama

Kod bloğunu kaydettiğinizde düzenleyici varsayılan renklendirmeyi kullanır. Yayımlanan görünümde de renklendirme için `nabi-note/viewer` bağlayın. Viewer, `pre > code` öğelerini bulur ve üst öğenin `data-nabi-lang` değerini dil adı olarak okur. Bu değer yoksa `code` öğesindeki `language-...` sınıfını denetler.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'tr',
})

// Yayımlanan HTML'i değiştirdikten sonra
viewer.refresh()

// Ekranı kapatırken
viewer.unmount()
```

Ayrı bir vurgulayıcı yoksa veya vurgulayıcı ilgili dili işleyemiyorsa, bağımlılıksız yerleşik belirteçleyici kodu renklendirir. Vurgulayıcının eklediği token span'leri yalnızca ekranda bulunur; kaydedilen JSON'a veya özgün yayımlanmış HTML'e yazılmaz. `refresh()` ve `unmount()` bu span'leri kaldırır ve güncel özgün koddan yeniden bağlanır.

### NABI web sitesi Shiki'yi nasıl bağlar?

NABI web sitesi, Shiki'nin ilk ekrana veya SSR paketine girmemesi için vurgulayıcıyı dinamik olarak yükler. `nabi-web/docs/.vitepress/src/highlight.ts` içindeki `loadCodeHighlighting()`, Shiki core'u oluşturur; ardından yalnızca o dildeki koda gerçekten ihtiyaç olduğunda ilgili dil dilbilgisini getirir. Aşağıdaki örnek, yayımlanan görünümde aynı bağlantıyı kullanır.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'tr',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Ekranı kapatırken
stop?.()
viewer.unmount()
```

Bir dille ilk kez karşılaşıldığında dilbilgisi indirmesi başlar. O zamana kadar blok, yerleşik belirteçleyiciyle veya düz metin olarak gösterilir. Dilbilgisi geldiğinde `onGrammarLoaded()`, `viewer.refresh()` çağrısı yaparak bloğu yeniden renklendirir. Böylece yalnızca gereken diller indirilir ve geç gelen dilbilgisi başka bir sayfa geçişi olmadan uygulanır.

Düzenleyici tarafı da aynı `highlight` işlevini kullanır. NABI web sitesi demosu, varsayılan `codeWing` içindeki yalnızca `attach` işlevini `makeCodeAttach({ highlight, version })` ile değiştirir. `version`, her dilbilgisi geldiğinde değişir ve daha önce çizilmiş kodun yeniden renklendirilmesini sağlayan bir işaret görevi görür. Bağımsız bir hizmet önce yayımlanmış görünüm bağlantısını uygulayabilir; düzenleme sırasında da Shiki renklendirmesi gerekirse bu yaklaşımı ekleyebilir.

## CSS stilleri

Kod bloklarını `.nabi-content pre` ile, kodu ise `.nabi-content pre > code` ile biçimlendirin. `white-space` değerini değiştirmeyin; bu değer kod satır sonlarını ve düzenlemeyi etkiler. Token renklerini `[data-nabi-token]` seçicileriyle değiştirebilirsiniz.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
