---
title: "आइकन थीम"
description: "CSS वेरिएबल से विंग, पूर्वावलोकन, पूर्ण स्क्रीन, पैनल, तुलना और तालिका क्रम के आइकन बदलें। SVG, WebP और PNG साथ इस्तेमाल कर सकते हैं; जिन आइकन को निर्दिष्ट नहीं किया गया है वे डिफ़ॉल्ट फ़ाइलें इस्तेमाल करते हैं।"
---

# आइकन थीम

CSS वेरिएबल से विंग, पूर्वावलोकन, पूर्ण स्क्रीन, पैनल, तुलना और तालिका क्रम के आइकन बदलें। SVG, WebP और PNG साथ इस्तेमाल कर सकते हैं; जिन आइकन को निर्दिष्ट नहीं किया गया है वे डिफ़ॉल्ट फ़ाइलें इस्तेमाल करते हैं।

## फ़ाइल चुनें

CSS लोड करें और एडिटर या साझा पैरेंट पर थीम क्लास लगाएँ। चित्रों के मूल रंग, पारदर्शिता और अनुपात बने रहते हैं।

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

`/icons/...` जैसे रूट से शुरू होने वाले पथ या पूरे HTTPS URL इस्तेमाल करें। सापेक्ष पथ थीम फ़ाइल के पास से हल हों, इसकी गारंटी नहीं है। CSS स्वयं होस्ट करने पर उसी संस्करण का `dist/icons/` भी `nabi.css` के पास कॉपी करें। चित्र लोड न होने पर आइकन खाली रहता है, लेकिन बटन का नाम, टूलटिप और काम उपलब्ध रहते हैं।

## अन्य आइकन खोजें

आइकन तत्व के `data-nabi-icon` मान से पहले `--nabi-icon-` जोड़ने पर CSS वेरिएबल मिलता है। उदाहरण के लिए `diff-close` का वेरिएबल `--nabi-icon-diff-close` है। संदर्भ, मेनू, सेव, इतिहास और अन्य कुंजियों के नियम तथा विशेष वर्णों की एन्कोडिंग के लिए <a href="/llms/icons.md" target="_blank" rel="noopener">आइकन अनुबंध</a> देखें।

## डार्क मोड और पैनल

थीम क्लास या CSS वेरिएबल बदलने से दोबारा mount किए बिना आइकन बदल जाते हैं। डिफ़ॉल्ट आइकन हल्की/गहरी थीम का पालन करते हैं। कस्टम फ़ाइलें `currentColor` नहीं अपनातीं; ज़रूरत हो तो ऊपर की तरह गहरी थीम की फ़ाइल दें। `body` के नीचे खुले पैनल भी मूल एडिटर की आइकन थीम और क्लास/स्टाइल बदलावों का पालन करते हैं। वेरिएबल एडिटर या साझा पैरेंट पर रखें, केवल टूलबार के अंदर नहीं।

## डिफ़ॉल्ट बटन दिखाएँ

`showPreview` और `showFullscreen` दोनों का डिफ़ॉल्ट `true` है। `false` करने पर संबंधित बटन, उसका फ़ोकस लक्ष्य और इवेंट हट जाते हैं। दोनों `false` हों तो खाली टूल क्षेत्र भी नहीं बनता।

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR और mount को समान दृश्यता विकल्प दें। कॉन्फ़िगरेशन बदलने के लिए `tools.unmount()` बुलाएँ और नए विकल्पों से mount करें। दोनों बटन न चाहिए हों तो टूल mount और SSR मार्कअप को पूरी तरह छोड़ने का पुराना तरीका भी उपलब्ध है। `openPreview()` और `setFullscreen()` को सीधे बुलाना जारी रख सकते हैं।
