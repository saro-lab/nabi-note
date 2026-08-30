---
title: அட்டவணை
description: வரிசை, நெடுவரிசைகளை உருவாக்கி, கலத் திருத்தத்தையும் நெடுவரிசை வரிசைப்படுத்தலையும் ஆதரிக்கவும்.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# அட்டவணை

கருவிப்பட்டையில் வரிசைகளையும் நெடுவரிசைகளையும் தேர்ந்து அட்டவணையை உருவாக்கவும். கலத்தில் பல பத்திகளுக்குப் பதில் வரி முறிவால் உள்ளடக்கத்தைத் தொடரவும்; Tab மற்றும் Shift+Tab மூலம் அடுத்த அல்லது முந்தைய கலத்திற்குச் செல்லலாம்.

வரிசை, நெடுவரிசை சேர்த்தல் அல்லது நீக்குதல், கலங்களை இணைத்தல், தலைப்புக் கலமாக மாற்றுதல் ஆகியவை தேர்ந்தெடுத்த கலத்தை அடிப்படையாகக் கொண்டவை. அட்டவணையை வரிசைப்படுத்தக்கூடியதாகச் சேமித்த பின் வெளியீட்டுப் பக்கத்தில் நெடுவரிசை வரிசைப்படுத்தலைப் பயன்படுத்த `nabi-note/viewer` இன் `attachViewer()` ஐ இணைக்க வேண்டும். இணைக்கப்பட்ட கலங்கள் உள்ள அட்டவணைகள் நெடுவரிசை வரிசைப்படுத்தலுக்கு உட்படாது.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS பாணிகள்

அட்டவணையை `.nabi-content table`, கலங்களை `.nabi-content :is(th, td)` மூலம் வடிவமைக்கவும். கல அமைப்பையோ viewer சேர்க்கும் வரிசைப்படுத்தல் பொத்தான்களையோ மாற்றாதீர்கள்.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

viewer ஐ இணைத்திருந்தால் `.nabi-sort` பொத்தானை வைத்திருக்கவும். கலத்தின் `position` அல்லது வலப்புற padding-ஐ வலுக்கட்டாயமாக மாற்றினால் வரிசைப்படுத்தல் பொத்தானுடன் மோதலாம்.
