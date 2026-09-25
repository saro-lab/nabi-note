---
title: "आयकॉन थीम"
description: "CSS व्हेरिएबलने विंग, पूर्वावलोकन, पूर्ण स्क्रीन, पॅनेल, तुलना आणि तक्ता क्रमवारीचे आयकॉन बदला. SVG, WebP आणि PNG एकत्र वापरता येतात; न दिलेल्या आयकॉनसाठी मूळ फाइल वापरली जाते."
---

# आयकॉन थीम

CSS व्हेरिएबलने विंग, पूर्वावलोकन, पूर्ण स्क्रीन, पॅनेल, तुलना आणि तक्ता क्रमवारीचे आयकॉन बदला. SVG, WebP आणि PNG एकत्र वापरता येतात; न दिलेल्या आयकॉनसाठी मूळ फाइल वापरली जाते.

## फाइल निवडा

CSS लोड करा आणि संपादकावर किंवा सामायिक पालक घटकावर थीम क्लास लावा. प्रतिमांचे मूळ रंग, पारदर्शकता आणि प्रमाण कायम राहते.

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

`/icons/...` सारखे मुळापासून सुरू होणारे पथ किंवा पूर्ण HTTPS URL वापरा. सापेक्ष पथ थीम फाइलच्या शेजारून ठरतील याची खात्री नाही. CSS स्वतः होस्ट करताना त्याच आवृत्तीचे `dist/icons/` देखील `nabi.css` शेजारी कॉपी करा. प्रतिमा लोड न झाल्यास आयकॉन रिकामा राहतो, पण बटणाचे नाव, टूलटिप आणि कृती उपलब्ध राहतात.

## इतर आयकॉन शोधा

आयकॉन घटकाच्या `data-nabi-icon` मूल्यापुढे `--nabi-icon-` लावल्यास CSS व्हेरिएबल मिळतो. उदा. `diff-close` साठी `--nabi-icon-diff-close` आहे. संदर्भ, मेनू, सेव्ह, इतिहास व इतर कींचे नियम आणि विशेष अक्षरांचे एन्कोडिंग <a href="/llms/icons.md" target="_blank" rel="noopener">आयकॉन करारात</a> पहा.

## डार्क मोड आणि पॅनेल

थीम क्लास किंवा CSS व्हेरिएबल बदलल्यावर पुन्हा mount न करता आयकॉन बदलतात. मूळ आयकॉन उजळ/गडद थीम पाळतात. स्वतःच्या फाइलना `currentColor` वारशाने मिळत नाही; गरजेनुसार वरीलप्रमाणे गडद आवृत्ती द्या. `body` खाली उघडलेली पॅनेलही मूळ संपादकाची आयकॉन थीम व क्लास/स्टाइल बदल पाळतात. व्हेरिएबल संपादकावर किंवा सामायिक पालकावर ठेवा, फक्त टूलबारच्या आत नाही.

## मूळ बटणे दाखवा

`showPreview` आणि `showFullscreen` दोन्हींचे मूळ मूल्य `true` आहे. `false` केल्यास ते बटण, त्याचे फोकस लक्ष्य आणि इव्हेंट काढले जातात. दोन्ही `false` असतील तर रिकामा टूल विभागही तयार होत नाही.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR आणि mount ला समान प्रदर्शन पर्याय द्या. रचना बदलताना `tools.unmount()` नंतर नवीन पर्यायांसह mount करा. दोन्ही बटणे नको असतील तर टूल mount आणि SSR मार्कअप पूर्णपणे वगळण्याची जुनी पद्धतही चालते. `openPreview()` आणि `setFullscreen()` थेट कॉल करता येतात.
