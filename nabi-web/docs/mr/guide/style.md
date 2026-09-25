---
title: CSS themes
description: CSS variables ने संपादक आणि प्रकाशित मजकुरासाठी रंग, fonts, आकार आणि dark mode संयोजित करा.
---

# CSS themes

NABI NOTE संपादन आणि प्रकाशित मजकुरासाठी एकच CSS वापरते. package stylesheet एकदा लोड करा, नंतर service container वर लागणारे variablesच override करा.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

संपादक आणि त्याचे प्रकाशित दृश्य एकच दृश्यभाषा टिकवून ठेवतील म्हणून shared tokens सामान्य parent वर ठेवा.

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

## सामान्य variables

| उद्देश | Variables |
| --- | --- |
| मजकूर आणि पार्श्वभूमी | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| सीमा आणि accent | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| कोपरे आणि छाया | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| Font families | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| संपादन surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| Sticky toolbar आणि preview | `--nabi-sticky-top`, `--nabi-preview-width` |
| Touch controls | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| मोबाइल मोडमध्ये बदलण्याची रुंदी | `--nabi-mobile-breakpoint` |

Highlight आणि text-color tokens `--nabi-hl-<name>` आणि `--nabi-tc-<name>` वापरतात. उदाहरणार्थ, `--nabi-hl-yellow` बदलल्याने दस्तऐवज data न बदलता साठवलेल्या `yellow` highlights चा दिसणारा रंग बदलतो.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## मोबाइल मोडची मर्यादा

टूलबार, संदर्भ ओळ किंवा व्ह्यूपोर्टची रुंदी `36rem` पेक्षा कमी झाल्यास मोबाइल मोड सुरू होतो. नेमक्या `36rem` रुंदीवर नेहमीची मांडणी कायम राहते. मोबाइल मोडमध्ये टूलबार आणि संदर्भ ओळ आडवी स्क्रोल होतात, पॅनेल मध्यभागी दिसतात आणि तक्ता निवडण्याचे ग्रिड स्पर्शासाठी सोयीच्या 5×5 घरांचे होते.

मर्यादा बदलण्यासाठी `--nabi-mobile-breakpoint` हे `:root`, एखाद्या पूर्वज घटकावर किंवा स्वतंत्र `.nabi` वर सेट करा. `rem`, `px` किंवा `calc()` सारखी शून्य किंवा धन CSS लांबी वापरा. CSS मूल्य, रूट फॉन्टचा आकार, कंटेनरची किंवा व्ह्यूपोर्टची रुंदी बदलल्यावर उघडी पॅनेलही आपोआप अद्ययावत होतात. `body` खाली हलवलेली इनपुट पॅनेल मूळ संपादकाची मर्यादा वापरत राहतात.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

स्पर्श उपकरणांवर या मर्यादेपेक्षा जास्त रुंदी असतानाही मोठी नियंत्रणे कायम राहतात.

## Dark mode

Light mode मूलभूत आहे. `html` किंवा `body` ला `.dark` जोडा, किंवा एखाद्या संपादकावर अथवा प्रकाशित body वर `data-nabi-theme="dark"` सेट करा.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

पूर्वजाच्या `.dark` मधून बाहेर पडण्यासाठी `data-nabi-theme="light"` वापरा. theme switching तुमचा अनुप्रयोग नियंत्रित करतो; package आपोआप `prefers-color-scheme` अनुसरत नाही.

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

## प्रकाशित मजकुरालाही style करा

प्रकाशित HTML ला देखील `.nabi-content` आणि तोच CSS लागतो. Tables, code blocks, images, checklists आणि drop caps JavaScript शिवाय render होतात. table sorting किंवा code highlighting सारख्या वर्तनासाठीच `nabi-note/viewer` जोडा.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Source Serif 4", Georgia, serif;
  --nabi-bg: transparent;
}
```

package च्या मालकीचा नसलेला layout, जसे body width आणि line height, तुमच्या service class वर सेट करा.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## editing रचना बदलू नका

editing `[data-key]` nodes वरील `display` किंवा `white-space` बदलू नका, editable text मध्ये pseudo-elements जोडू नका, किंवा object wrappers चे pointer behavior निष्क्रिय करू नका. या नियमांमुळे caret geometry आणि document mapping बिघडू शकते.

प्रकाशित drop caps `::first-letter` वापरतात, तर editing surface खरा `[data-nabi-dropcap-letter]` element वापरतो. `.nabi-editing` मध्ये दुसरा `::first-letter` नियम जोडू नका किंवा तो element बदलू नका.
