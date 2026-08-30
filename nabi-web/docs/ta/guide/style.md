---
title: CSS தீம்கள்
description: CSS மாறிகள் மூலம் திருத்திகள் மற்றும் வெளியிடப்பட்ட உள்ளடக்கத்தின் நிறங்கள், எழுத்துருக்கள், அளவு மற்றும் இருண்ட பயன்முறையை அமைக்கவும்.
---

# CSS தீம்கள்

NABI NOTE திருத்தலுக்கும் வெளியிடப்பட்ட உள்ளடக்கத்திற்கும் ஒரே CSS-ஐப் பயன்படுத்துகிறது. package stylesheet-ஐ ஒருமுறை ஏற்றி, சேவை container-இல் தேவையான மாறிகளை மட்டும் override செய்வது பாதுகாப்பானது.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: "Noto Sans Tamil", system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

திருத்தியும் அதன் வெளியிடப்பட்ட காட்சியும் ஒரே தோற்றத்தைத் தக்கவைக்க, பகிரப்பட்ட token-களைப் பொதுவான parent-இல் வையுங்கள்.

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

## பொதுவான மாறிகள்

| பயன்பாடு | மாறிகள் |
| --- | --- |
| உரையும் பின்னணியும் | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| ஓரங்களும் வலியுறுத்தலும் | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| மூலைகளும் நிழல்களும் | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| எழுத்துருக் குடும்பங்கள் | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| திருத்தும் surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| நிலையான கருவிப்பட்டியும் முன்னோட்டமும் | `--nabi-sticky-top`, `--nabi-preview-width` |
| தொடுதிரை controls | `--nabi-touch-font-size`, `--nabi-touch-control-size` |

highlight மற்றும் உரை-நிற token-கள் `--nabi-hl-<name>` மற்றும் `--nabi-tc-<name>`-ஐப் பயன்படுத்துகின்றன. உதாரணமாக, `--nabi-hl-yellow`-ஐ மாற்றுவது ஆவணத் தரவை மாற்றாமல் சேமித்த `yellow` highlight-களின் காட்சி நிறத்தை மாற்றும்.

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## இருண்ட பயன்முறை

ஒளி பயன்முறையே இயல்புநிலை. `html` அல்லது `body`-இல் `.dark`-ஐச் சேர்க்கவும், அல்லது குறிப்பிட்ட திருத்தி அல்லது வெளியிடப்பட்ட body-இல் `data-nabi-theme="dark"`-ஐ அமைக்கவும்.

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

parent-இன் `.dark`-இலிருந்து விலக `data-nabi-theme="light"`-ஐப் பயன்படுத்துங்கள். தீம் மாற்றத்தை உங்கள் application நிர்வகிக்கிறது; package தானாக `prefers-color-scheme`-ஐப் பின்பற்றாது.

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

## வெளியிடப்பட்ட உள்ளடக்கத்திற்கும் style அளியுங்கள்

வெளியிடப்பட்ட HTML-க்கும் `.nabi-content` மற்றும் அதே CSS தேவை. அட்டவணைகள், code block-கள், படங்கள், checklist-கள் மற்றும் drop cap-கள் JavaScript இன்றியே render ஆகும். அட்டவணை வரிசைப்படுத்தல் அல்லது code highlighting போன்ற நடத்தைக்காக மட்டுமே `nabi-note/viewer`-ஐச் சேர்க்கவும்.

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif Tamil", serif;
  --nabi-bg: transparent;
}
```

உரை அகலம் மற்றும் வரி உயரம் போன்ற package-க்குச் சொந்தமில்லாத layout-ஐ உங்கள் சேவை class-இல் அமைக்கவும்.

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## திருத்தும் அமைப்பை மாற்றாதீர்கள்

திருத்தும் `[data-key]` node-களில் `display` அல்லது `white-space`-ஐ மாற்றாதீர்கள்; திருத்தக்கூடிய உரைக்குள் pseudo-element-களைச் சேர்க்காதீர்கள்; object wrapper-களின் pointer நடத்தையையும் முடக்காதீர்கள். இவ்விதிகள் caret geometry-யையும் ஆவண mapping-ஐயும் உடைக்கக்கூடும்.

வெளியிடப்பட்ட drop cap-கள் `::first-letter`-ஐப் பயன்படுத்துகின்றன; திருத்தும் surface உண்மையான `[data-nabi-dropcap-letter]` element-ஐப் பயன்படுத்துகிறது. `.nabi-editing`-க்குள் வேறொரு `::first-letter` விதியைச் சேர்க்கவோ அந்த element-ஐ மாற்றவோ வேண்டாம்.
