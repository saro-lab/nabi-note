---
title: இணைப்பு
description: பாதுகாப்பான வலை முகவரிகளை இணைத்து பதிவேற்ற இணைப்புகளைக் காட்டவும்.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# இணைப்பு

எழுத்தைத் தேர்ந்தெடுத்து அதற்கு முகவரியை இணைக்கவும். எழுத்தைத் தேர்ந்தெடுக்காமல் முகவரியை உள்ளிட்டால் முகவரியே இணைப்பு உரையாகச் சேரும்; `http://` அல்லது `https://` முகவரியை உள்ளிட்டு Space அல்லது Enter அழுத்தினாலும் இணைப்பாக மாறும்.

இணைப்பில் `http:`, `https:`, மேலும் `.` அல்லது `/` இல் தொடங்கும் அதே தளப் பாதைகள் மட்டுமே சேமிக்கப்படும். `javascript:` அல்லது `//example.com` போல தோற்றம் தெளிவாக அறிய முடியாத முகவரிகள் மறுக்கப்படும். பதிவேற்றம் உருவாக்கிய இணைப்பு கோப்புத் தகவலையும் சேமிப்பதால், சாதாரண இணைப்புபோல் நேரடியாக உருவாக்க முடியாது.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS பாணிகள்

சாதாரண இணைப்பை `.nabi-content a` மூலமும், இணைப்பு கோப்பை `.nabi-content a[data-nabi-file]` மூலமும் தனித்தனியாக வடிவமைக்கலாம்.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

இணைப்பு கோப்பின் `::before`, `::after` கோப்பு சின்னம் மற்றும் நீட்டிப்பைக் காட்டப் பயன்படுவதால், அவற்றின் `content` ஐ மாற்றாமலோ நீக்காமலோ இருப்பது நல்லது.
