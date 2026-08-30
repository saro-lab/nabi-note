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

Aynı token'ları düzenleyici ve yayın ekranının ortak üst öğesine koyarsanız, iki ekran aynı görünümü korur.

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

Vurgulama ve metin rengi token'ları `--nabi-hl-<name>` ve `--nabi-tc-<name>` kullanır. Örneğin
`--nabi-hl-yellow` değerini değiştirmek, belgede saklanan `yellow` vurgusunun ekran rengini yalnızca değiştirir.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

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
.dark .brand-note {
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
