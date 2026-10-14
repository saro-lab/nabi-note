---
title: Özel kanatlar
description: Kaydedilebilir yeni belge özelliği oluşturmak için sözleşme ve uygulama sırası.
---

# Özel kanatlar

Özel kanat, belgeye kaydedilen yapı, komutlar, HTML ve Markdown dönüşümü, içe aktarma kuralları ve ekran
davranışını tek bildirimde birleştiren uzantıdır. Registry, düzenleyici oluşmadan bildirimi denetler ve
geçersiz yapıların belgelere girmesini önler.

## En küçük factory ile başlayın

Değersiz satır içi biçim için `simpleMark()`, sınırlı değer kümesi için `valueMark()`, çocuksuz blok için
`boxObject()`, liste için `listFamily()` kullanın.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(
  wings().allBasic().use(exStrong),
)
```

## Kanat türleri

Önce bir factory kaydedip `getJson()` ve `getHtml()` sonuçlarını inceleyin; sonra komutlar ve düğmeler ekleyin.

### 1. Değersiz satır içi mark: vurgu

Yalnızca metni saran özelliklerde `simpleMark()` kullanın. Bu örnek `exStrong` saklar ve `<strong>` üretir.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true`, Biçimi temizle işleminin bu mark'ı da kaldırmasını sağlar. Düğme eklemeden önce
`nabi.applyCommand()` ya da özel bir komutla uygulayın.

### 2. Değerli satır içi mark: durum etiketi

Renk, boyut veya durum gibi izinli kümeden seçilen değerler için `valueMark()` kullanın. Değer `a.v` içinde
saklanır, listedeki olmayan değerler `repair()` sırasında kaldırılır.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Örnek kayıt `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Önemli"] }` olur. Mevcut belgeler varsa
değer listesini gelişigüzel daraltmayın; okunurken eski değerler kaybolabilir.

### 3. Çocuksuz blok: ayırıcı

Resim, video veya ayırıcı gibi çocuksuz bağımsız bloklar `boxObject()` ile oluşturulur.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

URL veya genişlik gibi değerleri `attrs` içinde denetleyin ve zorunluları `requires` içine koyun. Denetlenemeyen
değeri varsayılanla değiştirmek yerine `null` ile reddedin.

### 4. Çok paragraflı blok: bilgi kutusu

İçerik tutan blok için `container` bildirin. `holds: 'blocks'`, paragraf, liste ve resim gibi blok çocuklarını
kabul eder.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  isolating: true,
  scopedCommands: ['insertImage', 'insertTable', 'toggleBulletList', 'toggleQuote'],
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Bu bildirim seçili paragrafları saran komutu tek başına oluşturmaz. `commands` içine saf komut ve onu çağıran
bir `button` ekleyin.

`isolating: true`, birden fazla paragrafa izin verirken silmenin bilgi kutusunun sınırını aşıp komşu içerikle birleşmesini önler. `scopedCommands` içindeki komutlar kutunun iç belgesi üzerinde çalışır; resim ve tablo ekleme ile liste ve alıntı dönüşümleri kutunun içinde kalır.

### 5. Liste ve öğe çifti

Liste ve öğe her zaman eşleştiği için `listFamily()` kullanın.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()`, öğe olmayan blokları öğeyle sararak yapıyı onarır. Öğeye özgü değerler için `itemDecl` ve
`repairItem` ekleyin.

### Kaydetme sırası

Sunucuda ve tarayıcıda aynı bildirimleri aynı sırayla kullanın.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'tr' })
```

## Adı ve belge yapısını tanımlayın

Belgeye yazılan adlar `ex[A-Z0-9]...` biçiminde olmalıdır. `exCallout` gibi `ex` öneki, gelecekte resmi bir
kanadın kaydedilmiş içeriğin anlamını değiştirmesini önler.

`place` kaydedilen şekli belirler: `mark` satır içini sarar, `void` çocuksuz bloktur, `container` çocuk tutar,
`attr` paragraf özniteliklerini değiştirir, `tool` belge düğümü oluşturmaz. Container için
`holds: 'blocks' | 'inline'` ve `toHtml()` gerekir.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, `parts` yapı kısıtlarını bildirir. `parts` kullanan her part
için `partHtml` gerekir. Değer seçen kanatları `attrKey` ve `attrValues` ile sınırlayın.

## Bildirim seçenekleri

Yalnızca gerekli seçenekleri bildirin. Factory kullanıyorsanız onun zaten belirlediği değerleri yeniden yazmayın.

| Alan | Seçenekler | Amaç |
| --- | --- | --- |
| Temel | `w`, `place`, `basic`, `styles` | Ad, yapı türü, temel kanat üyeliği, varsayılan CSS |
| Yapı | `holds`, `singleParagraph`, `isolating`, `attrs`, `boolAttrs` | Çocuk türü, Enter davranışı, düzenleme sınırını koruma, izinli öznitelikler, boolean öznitelikler |
| Yapı | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Part'lar, izinli çocuklar, hizalama, bağımlılıklar |
| Değerler | `attrKey`, `attrValues`, `currentValue` | Saklanan değerler ve geçerli değer |
| Komutlar ve girdi | `commands`, `scopedCommands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Komutlar, iç belgede çalışacak komutlar, tuş işleme, Escape/çift tuş, otomatik dönüştürme |
| Surface | `attach` | DOM davranışı ve temizleme |
| Dönüşüm | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML ve Markdown çıktısı |
| İçe aktarma | `claim`, `ioFilter`, `repair`, `partRepair` | HTML, dosya, JSON denetimi ve onarımı |
| UI | `button`, `buttons`, `context` | Araç çubuğu ve bağlamsal araçlar |
| Biçimi temizle | `clearable` | Kaldırma hedefi |

`w` ve `place` her zaman gerekir. Düğüm oluşturan `mark`, `void`, `container` kanatları `toHtml()` gerektirir.
Container için `holds`, her part için aynı adlı `partHtml` gerekir. `attr` ve `tool` belge düğümü oluşturmadığından bu kuralları farklıdır.

## HTML, Markdown ve JSON'u birlikte koruyun

`toHtml()` saklanan düğümü HTML'ye dönüştürür; `toMd()` Markdown dışa aktarımını yapar. Markdown dönüşümü
yoksa bilgi kaybolmasın diye üretilen HTML korunur. İçe aktarmada `claim()` yalnızca kendi öğenizi ve
doğrulanmış özniteliklerinizi tanımalıdır.

`repair()`, JSON yüklenirken ve komutlardan sonra çalışır. Geçersiz öznitelikleri düzelterek döndürün,
korunamayan düğümler için `null` döndürün. HTML'yi `ctx.element()`, `ctx.escape()` ve `ctx.url()` ile kurun. Dizeleri birleştirerek etiket, öznitelik veya URL doğrulamasını atlamayın.

## Komutları ekran davranışından ayırın

Komut, belge ve seçimin saf fonksiyonudur; yeni belgeyi ve seçimi döndürür. DOM'u okumaz veya değiştirmez,
geçerli değişiklik yapamazsa `null` döndürür. `insertNote` gibi fiille başlayan lower camel case kullanın.

Tabloda sürükleyerek seçim gibi komutla ifade edilmesi zor ekran davranışlarını `attach(host)` içine koyun. Event listener veya öznitelik değişikliğinden hemen sonra `host.onDispose()` ile geri alma işlevi kaydedin; böylece sonraki kurulum başarısız olsa da temizlik yapılır. Birleştirme sırasındaki metin DOM'unu veya surface seçim eşlemesini doğrudan değiştirmeyin.

Araç çubuğu ve bağlamsal araçlar `button`, `buttons` ve `context` bildirimleriyle oluşturulur. Aynı komut kurallarını uygulama arayüzünde ayrıca uygularsanız araç çubuğu ile belge modeli birbirinden sapabilir.

### Blok içinde komut çalıştırma

`scopedCommands`, `holds: 'blocks'` olan container'larda ve blok tutan `parts` üzerinde bildirilir. Seçimin iki ucu aynı bölgedeyse komuta o bölgenin çocuk belgesi ve göreli seçim yolları verilir; sonuç dış belgeye geri uygulanır. Bölge sınırını aşan seçimler reddedilir; bölgenin dışında komutun özgün davranışı korunur. Yüzen bölgeler ve tablo hücreleri de ekleme, dönüştürme ve yükleme kapsamını bu yöntemle korur.

```ts
const exMediaBox: Wing = {
  w: 'exMediaBox',
  place: 'container',
  holds: 'blocks',
  isolating: true,
  scopedCommands: ['insertImage', 'commitUpload', 'toggleCode'],
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-media-box' }),
}
```

Listeye yalnızca kanat komutları yazılabilir. Kayıtlı olmayan komutlar atlanır; bu nedenle resim veya yükleme kanatlarını birlikte kaydetmek zorunlu değildir. Yalnızca verilen iç belge ve göreli yollarla çalışan komutları seçin. Belgenin tamamında mutlak yol isteyen veya bütün belgeyi değiştiren komutları eklemeyin. Çekirdek komutlar da bu listede kullanılamaz.

`singleParagraph`, içeriği tek paragrafla sınırlar; `isolating` ise birden fazla paragrafı koruyarak Backspace/Delete tuşlarının düzenleme sınırını aşmasını önler. Blok tutan `parts` üzerinde de `isolating: true` bildirilebilir.

### İç içe bloklarda tuş işleme

`onKey` tarafından alınan `KeyIntent.shift`, Enter ile Shift+Enter'ı ayırır. Bağımsız bir düzenleme bölgesindeki iç kanat `null` döndürürse işleme, o bölgeye kadar üst kanatlara sırayla aktarılır. Böylece hücre içindeki liste ve kod önce girintiyi işler; işlenmeyen Tab hücreler arasında geçiş yapabilir. Aynı tuş girdisinde bir kanat iki kez çağrılmaz.

## CSS stilleri

`styles`, gerekli temel CSS'yi bildirir; kaydedilen kanatların CSS'si `nabi-note/nabi.css` içinde bulunur.
Runtime seçimi için tarayıcıda `collectSheets()` ve `injectSheets()` kullanılabilir, SSR'de CSS dosyasını
bağlayın.

Yayın görünümünde de editörle aynı sınıfları ve data özniteliklerini kullanın. Düzenleme ve yayın seçicilerini ayırın; `[data-key]` düzenleme düğümlerinin yapısını, `display` veya `white-space` değerini değiştirmeyin. CSS yalnızca görünümü değiştirmeli, belge yapısına ve imleç eşlemesine dokunmamalıdır.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Yalnızca `toHtml()` tarafından oluşturulan class veya data özniteliklerini hedefleyerek aynı JSON'u editör ve yayın görünümünde güvenle farklı biçimlendirebilirsiniz. Hizmete özgü değişiklikleri `.article-body .ex-callout` gibi daha dar seçicilerle ayırın.

## Denetim listesi

JSON yeniden yüklendiğinde aynı yapı ve HTML'nin oluştuğunu doğrulayın. Geçersiz adlar, yinelenen komutlar,
eksik builder'lar, bağımlılıklar, HTML içe aktarma, `repair()` girdileri, seçimler, SSR ve yayın CSS'sini test edin.

Türleri ve factory argümanlarını kurulu paketin tür bildirimlerinde ve
[İngilizce API reference'ta](https://nabi.saro.me/llms/api-reference.md) inceleyebilirsiniz.
