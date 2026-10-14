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
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

संपादकाच्या `.nabi` आणि प्रकाशित दृश्याच्या `.nabi-content` ला एकच थीम वर्ग द्या, म्हणजे दोन्हीकडे समान variables लागू होतील. सेवेचे CSS पॅकेज CSS नंतर लोड करा आणि चालू थीम `data-nabi-theme` ने ठरवा.

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

हायलाइट आणि मजकूर रंग अनुक्रमे `--nabi-hl-<name>` आणि `--nabi-tc-<name>` वापरतात. पेशींच्या पार्श्वभूमीसाठी `--nabi-cell-<name>` मध्ये `yellow`, `green`, `cyan`, `pink`, `purple`, `orange` चालतात. variables फक्त दिसणारा रंग बदलतात, जतन केलेले नाव नाही.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

पूर्वनिर्धारित थीम पेशींची पार्श्वभूमी फिकट रंगात दाखवते. गडद मोडमध्ये नावे कायम ठेवून वेगळे, अधिक उजळ व कमी संपृक्त रंग वापरले जातात, जेणेकरून गडद पार्श्वभूमीवर फरक दिसेल. या अर्धपारदर्शक रंगांतून मागचा भाग दिसतो; रंग बदलल्यास प्रत्यक्ष पृष्ठाच्या पार्श्वभूमीवर मजकुराचा कॉन्ट्रास्ट तपासा. पूर्वनिर्धारित रंग variables बदलण्यासाठी थीम वर्ग वरच्या उदाहरणाप्रमाणे प्रत्यक्ष संपादक किंवा प्रकाशित सामग्रीच्या घटकावर द्या, कोणत्याही बाहेरील पालकावर नाही.

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## मोबाइल मोडची मर्यादा

पूर्वनिर्धारित `layout: 'compact'` टूलबार पडदा `36rem` पेक्षा अरुंद झाल्यावर मोबाइलच्या एका ओळीत बदलतो. नेमके `36rem` असल्यास डेस्कटॉप मांडणी राहते. डेस्कटॉपवर संपादक अरुंद असला तरी सर्व साधने पुढच्या ओळींत जातात. वस्तूंची गुणधर्म साधनेही खाली ओळींत जातात; दोन्ही ओळी मजकुरावर जागा घेतात. पूर्ण पडद्यावर रुंदी काहीही असली तरी सर्व साधने उघडतात.

मोबाइलवर झटपट साधने, सर्व साधनांचे बटण आणि जोडलेली पूर्वावलोकन/पूर्ण पडदा बटणे मुख्य टूलबारमध्ये राहतात. गुणधर्म साधने दिसत असतानाही ती वापरता येतात. सर्व साधनांच्या पॅलेटमध्ये डेस्कटॉपसारखाच गटक्रम व विभाजक असतात. `layout: 'wrap'` नेहमी सर्व साधने ओळींत गुंडाळून दाखवते.

मोबाइल पॅनेल टूलबार व गुणधर्म साधनांभोवती उपलब्ध जागेत उघडतात. तक्त्याच्या आकाराचा निवडक अपवाद आहे: तो अर्धपारदर्शक पार्श्वभूमीवर मध्यभागी, स्पर्शास सोपी 5×5 जाळी दाखवतो. कीबोर्ड बंद होण्याची वाट पाहत नाही; आकार निवडल्यावर एक तक्ता घालून बंद होतो.

मर्यादा बदलण्यासाठी `--nabi-mobile-breakpoint` हे `:root`, एखादा पूर्वज किंवा स्वतंत्र `.nabi` वर द्या. `rem`, `px`, `calc()` सारखी शून्य किंवा धन CSS लांबी वापरा. CSS मूल्य, मूळ फॉन्ट आकार किंवा पडद्याची रुंदी बदलल्यास उघडी पॅनेलही आपोआप बदलतात. `body` खाली हलवलेली इनपुट पॅनेल मूळ संपादकाची मर्यादा पाळतात.

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

फ्लोट क्षेत्रांची एका स्तंभात बदलण्याची मर्यादा वेगळी आहे. पडद्याची नव्हे, मजकूर कंटेनरची रुंदी `36rem` पेक्षा कमी असल्यास एक स्तंभ दिसतो; छपाईतही हीच मांडणी असते.

## Dark mode

Light mode मूलभूत आहे. `html` किंवा `body` ला `.dark` जोडा, किंवा एखाद्या संपादकावर अथवा प्रकाशित body वर `data-nabi-theme="dark"` सेट करा.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

पूर्वजाच्या `.dark` मधून बाहेर पडण्यासाठी `data-nabi-theme="light"` वापरा. theme switching तुमचा अनुप्रयोग नियंत्रित करतो; package आपोआप `prefers-color-scheme` अनुसरत नाही.

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

## प्रकाशित मजकुरालाही style करा

प्रकाशित HTML ला देखील `.nabi-content` आणि तोच CSS लागतो. Tables, code blocks, images, checklists आणि drop caps JavaScript शिवाय render होतात. table sorting किंवा code highlighting सारख्या वर्तनासाठीच `nabi-note/viewer` जोडा.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
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
