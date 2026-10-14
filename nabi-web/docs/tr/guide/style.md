---
title: CSS teması
description: CSS değişkenleriyle düzenleyici ve yayın ekranının renklerini, yazı tipini, boyutlarını ve koyu modunu ayarlayın.
---

# CSS teması

NABI NOTE, düzenleyici ve yayın ekranına aynı CSS'yi uygular. Paket CSS'sini bir kez yükledikten sonra,
hizmet container'ında yalnızca gereken CSS değişkenlerini ezmek en güvenli yoldur.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

Editörün `.nabi` ve yayın görünümünün `.nabi-content` öğelerine aynı tema sınıfını atayarak aynı değişkenleri uygulayın. Hizmet CSS'sini paket CSS'sinden sonra yükleyin ve geçerli temayı `data-nabi-theme` ile belirtin.

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## Sık değiştirilen değişkenler

| Kullanım | Değişkenler |
| --- | --- |
| Metin ve arka plan | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| Çizgiler ve vurgu rengi | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| Köşeler ve gölgeler | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Varsayılan yazı tipleri | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| Düzenleme yüzeyi | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Sabit araç çubuğu ve önizleme | `--nabi-sticky-top`, `--nabi-preview-width` |
| Dokunmatik denetimler | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| Mobil moda geçiş genişliği | `--nabi-mobile-breakpoint` |

Vurgulayıcı ve metin rengi sırasıyla `--nabi-hl-<name>` ve `--nabi-tc-<name>` kullanır. Tablo hücre arka planları `--nabi-cell-<name>` ile `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` değerlerini destekler. Değişkenler kayıtlı renk adını değil, yalnızca ekranda görünen rengi değiştirir.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

Varsayılan tema hücre arka planlarını açık tonlarda gösterir. Koyu mod aynı renk adlarını korur; koyu zemin üzerinde ayırt edilmeleri için daha açık ve daha düşük doygunluklu ayrı renkler kullanır. Yarı saydam renklerden zemin göründüğünden, özelleştirirken gerçek sayfa arka planında metin kontrastını kontrol edin. Varsayılan renk değişkenlerini geçersiz kılmak için tema sınıfını herhangi bir dış üst öğeye değil, yukarıdaki gibi gerçek editör veya yayın öğesine atayın.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## Mobil mod eşiği

Varsayılan `layout: 'compact'` araç çubuğu ekran genişliği `36rem` altındayken mobil tek satıra geçer. Tam `36rem` masaüstü düzenini korur. Masaüstünde editör dar olsa bile bütün araçlar satırlara bölünür. Nesne özellik araçları da altta satırlara bölünür; iki satır da metnin üzerinde yer kaplar. Tam ekranda genişlikten bağımsız olarak bütün araçlar açılır.

Mobilde hızlı araçlar, tüm araçlar düğmesi ve bağlı önizleme/tam ekran düğmeleri ana araç çubuğunda kalır. Özellik araçları göründüğünde de birlikte kullanılabilirler. Tüm araçlar paleti masaüstüyle aynı grup sırasını ve ayraçları kullanır. `layout: 'wrap'` bütün araçları her zaman satırlara bölerek gösterir.

Mobil paneller araç çubuğu ve özellik araçlarının çevresindeki kullanılabilir alanda açılır. Tablo boyutu seçici istisnadır: yarı saydam zemin üzerinde ortada, dokunması kolay 5×5 ızgarayla açılır. Klavyenin kapanmasını beklemez; boyut seçilince bir tablo ekler ve kapanır.

Eşiği değiştirmek için `--nabi-mobile-breakpoint` değerini `:root`, bir üst öğe veya tek bir `.nabi` üzerinde ayarlayın. `rem`, `px`, `calc()` gibi negatif olmayan CSS uzunlukları kullanın. CSS değeri, kök yazı boyutu veya ekran genişliği değiştiğinde açık paneller de otomatik güncellenir. `body` altına taşınan giriş panelleri özgün editörün eşiğini korur.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

Yüzen bölgelerin tek sütuna geçme eşiği ayrıdır. Ekran değil, metin container'ı `36rem` altına indiğinde tek sütun kullanılır; yazdırmada da aynı düzen uygulanır.

## Koyu mod

Varsayılan açık moddur. Sayfanın `html` veya `body` öğesine `.dark` ekleyin veya belirli bir düzenleyici ya da
yayın ekranında `data-nabi-theme="dark"` ayarlayın; koyu mod uygulanır.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

Bir üst öğedeki `.dark` etkisinden çıkmak için `data-nabi-theme="light"` kullanın. Tema değişimini hizmetiniz
yönetir; paket `prefers-color-scheme` seçeneğini otomatik olarak izlemez.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## Yayın içeriğini de biçimlendirin

Yayın HTML'si de `.nabi-content` ve aynı CSS'yi gerektirir. JavaScript olmadan tablolar, kod blokları,
görseller, kontrol listeleri ve büyük baş harfler biçimlenir. Yalnızca tablo sıralama veya kod renklendirme
gibi davranışlar gerektiğinde `nabi-note/viewer` ekleyin.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

Gövde genişliği ve satır aralığı gibi paketin sahip olmadığı düzeni hizmet class'ında tanımlayın.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## Düzenleme yapısını değiştirmeyin

Düzenlenmekte olan `[data-key]` düğümlerinde `display` veya `white-space` değerini değiştirmeyin. Düzenlenebilir
metin içine pseudo-element eklemeyin ve nesne wrapper'larının işaretçi davranışını devre dışı bırakmayın. Bu
kurallar imleç geometrisini ve belge eşlemesini bozabilir.

Yayınlanan büyük baş harflerde `::first-letter`, düzenleme yüzeyinde ise gerçek bir
`[data-nabi-dropcap-letter]` öğesi kullanılır. `.nabi-editing` içinde başka bir `::first-letter` kuralı
eklemeyin veya bu öğeyi değiştirmeyin.
