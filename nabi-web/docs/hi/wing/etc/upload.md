---
title: फ़ाइल अपलोड
---

# फ़ाइल अपलोड

## विवरण

अपलोड तीन टुकड़ों में बँटा है — सिर्फ़ wing रजिस्टर करने से कुछ नहीं होता।

1. **`uploadWing`** — टूलबार पर फ़ाइल-चुनने वाला बटन जोड़ता है। यह wing खुद न तो
   `img` बनाता है न `a` — अपलोड की गई फ़ाइल image या link wing के ज़रिए दस्तावेज़
   में उतरती है, इसलिए **`imageWing` या `linkWing` साथ में रजिस्टर करना ज़रूरी है**
   ताकि नतीजा दस्तावेज़ में बचे। दोनों में से कोई न हो तो **रजिस्टर करते ही वहीं
   अपवाद (exception) आता है** (देर से नहीं फूटता)।
2. **`mountUpload({ … })`** — असल में फ़ाइलें लेकर `uploader` चलाने वाला हिस्सा।
   ड्रॉप, पेस्ट, फ़ाइल-चयन सब यहीं आकर मिलते हैं। **इस mount के बिना बटन तो रहेगा
   पर कुछ नहीं होगा।**
3. **`mountUploadView({ … })`** — प्रगति के लिए स्क्रीन पर जगह-धारक (placeholder)
   खड़ा करने वाला हिस्सा। इसके बिना भी अपलोड होता है, पर अपलोड होते समय स्क्रीन पर
   कुछ नहीं दिखता।

`uploader` का रूप `(task) => Promise<{ uri } | null>` है — **पता (URI) मिले तो
सफलता, `null` मिले तो विफलता**, और जगह-धारक हट जाता है। `task.onProgress(0–100)`
से प्रगति बताई जाती है, और `task.signal` रुकने पर काम थम जाता है।

सीमाएँ तीन हैं — `extensions`·`maxFileSize`·`maxTotalSize` — और तीनों वैकल्पिक हैं
(0 या न देने पर कोई सीमा नहीं)। छाँटी गई फ़ाइलें `onReject` से आती हैं।

## अपलोड के बाद क्या बचता है

छवियाँ `imageWing` के ब्लॉक के रूप में, बाक़ी फ़ाइलें `linkWing` के अटैचमेंट लिंक
के रूप में दर्ज होती हैं।

- **अटैचमेंट का नाम फ़ाइल का नाम नहीं, बल्कि i18n लेबल है** — हिन्दी में
  "अटैचमेंट"। फ़ाइल का नाम अक्सर दस्तावेज़ में रखने के लिए लंबा होता है, और सबसे
  बड़ी बात यह बदला जा सकना चाहिए। नाम बदलने के लिए कर्सर उस लिंक पर रखें और
  [कॉन्टेक्स्ट पंक्ति के नाम वाले कक्ष](../inline/link) में बदलें।
- **एक्सटेंशन निशान के रूप में बचा रहता है** — `data-nabi-file="pdf"`। यह मान असली
  फ़ाइल-नाम से निकाला जाता है, और शीट इसे बैज के रूप में खींचती है। नाम बदलने पर भी
  यह निशान साथ रहता है।
- जिस पते को link wing स्वीकार नहीं करता (जैसे `allowLocalUrls` चालू किए बिना आया
  `blob:` पता), वह सादे फ़ाइल-नाम में बदल दिया जाता है — व्हाइटलिस्ट कभी दरकिनार
  नहीं होती।

## अपलोड के दौरान क्या दिखता है

अपलोड होते समय उस जगह एक अस्थायी बॉक्स खड़ा रहता है — यह सिर्फ़ एडिटर के DOM में
होता है, nabi tree में नहीं, इसलिए संचित मान में इसका एक अक्षर भी नहीं जाता।

- **छवियों** के लिए चुनी गई फ़ाइल से बना पूर्वावलोकन तुरंत दिखता है, और उसके ऊपर एक
  ग्रिड बिछ जाता है। प्रगति के साथ-साथ खाने एक-एक करके हटते हैं और तस्वीर साफ़ होती
  जाती है। खाने हटने का क्रम हर फ़ाइल में अलग-अलग फेरबदल किया जाता है, ताकि एक साथ
  कई फ़ाइलें चढ़ाने पर एक ही नमूना न दोहराए।
- **जो फ़ाइल छवि नहीं है** उसे ग्रिड के बिना 📎 और "अटैचमेंट" लेबल वाला बॉक्स
  मिलता है, और एक्सटेंशन बड़े अक्षरों के बैज (`PDF` आदि) के रूप में साथ दिखता है।
  जिस छवि का पूर्वावलोकन नहीं बन पाता वह भी यहीं आती है।
- प्रगति बॉक्स पर `data-nabi-per` से चढ़ती है और शीट इसे खींचती है। अपलोड के दौरान
  हर बॉक्स पर रद्द (×) बटन खड़ा रहता है, और बैच चलने के दौरान संपादन बंद रहता है।

## उपयोग का उदाहरण

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// अपलोड का नतीजा बचाने के लिए image और link wing चाहिए — न हों तो यहीं अपवाद आता है
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// प्रगति के जगह-धारक खड़े करने वाला हिस्सा — पहले बनाकर नीचे जोड़ते हैं
const view = mountUploadView({ nabi, surface, locale: 'hi' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'hi',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // यहाँ सर्वर पर असल में अपलोड करने वाला कोड डालें। पता मिले तो सफलता, null मिले तो विफलता
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // टूलबार के फ़ाइल-चयन बटन से चुनी गई फ़ाइलें यहीं बहकर आती हैं
  onFiles: (files) => upload.take(files),
})
```

## डेमो

इस साइट पर अपलोड करने के लिए कोई सर्वर नहीं है, इसलिए यह `URL.createObjectURL()`
से बना `blob:` पता लौटाकर सिर्फ़ नाटक करता है। नतीजा सिर्फ़ इसी पेज के भीतर बचता है।

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
