---
title: सबस्क्रिप्ट
---

# सबस्क्रिप्ट

## विवरण

`subscriptWing` `<sub>` का स्वामी (claim) है। रासायनिक सूत्रों या नीचे लिखे जाने
वाले क्रमांकों पर इसका उपयोग होता है।

- स्वीकारा जाने वाला टैग सिर्फ़ `<sub>` है। कोई एट्रिब्यूट नहीं बचता।
- हिंट मोड का कोई शॉर्टकट नहीं है, न कोई एक्सेलरेटर। टूलबार में यह `script` समूह
  में सुपरस्क्रिप्ट के साथ खड़ा होता है (रजिस्ट्रेशन क्रम में सबस्क्रिप्ट पहले आता है)।
- टेक्स्ट चुनकर दबाने पर यह टॉगल है।
- रूप-रंग इसी wing की अपनी स्टाइलशीट से आता है, जो `Wing.styles` के ज़रिए जुड़ी है:

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**यह स्टाइलशीट सुपरस्क्रिप्ट के साथ साझा है।** दोनों wing एक ही टेक्स्ट रखते हैं, इसलिए
दोनों रजिस्टर होने पर भी दस्तावेज़ में **सिर्फ़ एक बार** चढ़ती है (`collectSheets` एक
जैसी स्टाइलशीट को छाँट देता है)। सहेजे गए मान (HTML) में सिर्फ़ `<sub>` टैग रहता है,
स्टाइल खुद उसमें नहीं जाती।

## उपयोग

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing की सूची श्रेणी-ज्ञान · कमांड · असेंबलर एक साथ बनाती है — वही `registry` है
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## डेमो

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
