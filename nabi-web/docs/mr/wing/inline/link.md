---
title: लिंक
description: सुरक्षित वेब पत्ते जोडा आणि upload केलेली attachments दाखवा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# लिंक

मजकूर निवडा आणि त्याला address जोडा. मजकूर न निवडता address घातल्यास address स्वतः link text म्हणून घातला जातो. `http://` किंवा `https://` address टाइप करून Space किंवा Enter दाबल्यास तोही link बनतो.

links फक्त `http:`, `https:` आणि `.` किंवा `/` ने सुरू होणारे त्याच site चे paths साठवतात. `javascript:` किंवा `//example.com` सारखे स्पष्ट origin नसलेले addresses नाकारले जातात. upload ने तयार झालेल्या attachment links मध्ये file informationही असते आणि त्या सामान्य link सारख्या हाताने बनवता येत नाहीत.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## URL पेस्ट करणे

सुरुवातीचे आणि शेवटचे रिकामे अक्षर काढल्यानंतर पेस्ट केलेला संपूर्ण मजकूर वैध `http://` किंवा `https://` URL असेल, तर तो लगेच लिंक म्हणून घातला जातो. वाक्यांतील URL, अनेक URL असलेला मजकूर आणि सापेक्ष पथ यांवर सध्याच्या पेस्ट पद्धतीनुसार प्रक्रिया केली जाते. कोड ब्लॉकमध्ये आणि लिंक wing नसलेल्या संपादकात तो मजकूर म्हणूनच राहतो. मूळ स्वरूप जपण्यासाठी संपादकातून कॉपी केलेल्या वैध अंतर्गत क्लिपबोर्ड डेटाला प्राधान्य दिले जाते.

लिंकचा दिसणारा मजकूर ठरवण्यासाठी `mountSurface()` मधील `onPasteUrl` कॉलबॅक वापरा.

| आर्ग्युमेंट | मूल्य |
| --- | --- |
| `url` | सुरुवातीचे आणि शेवटचे रिकामे अक्षर काढलेला संपूर्ण URL |
| `isSameOrigin` | URL चे प्रोटोकॉल, होस्ट आणि पोर्ट संपादक असलेल्या दस्तऐवजाच्या ओरिजिनशी जुळतात का |
| `path` | `/` ने सुरू होणारा पथ, क्वेरी आणि फ्रॅगमेंटसह. उदाहरण: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

परत केलेल्या स्ट्रिंगमध्ये रिकाम्या अक्षरांव्यतिरिक्त इतर अक्षरे असतील, तर ती दिसणारा मजकूर बनते. कॉलबॅक नसल्यास, रिकामे किंवा स्ट्रिंग नसलेले मूल्य परत केल्यास, किंवा त्रुटी आल्यास पेस्ट केलेला URL हाच दिसणारा मजकूर राहतो. परत केलेली स्ट्रिंग कधीही HTML म्हणून समजली जात नाही आणि ती लिंकचा पत्ता बदलत नाही.

कॉलबॅक `async` फंक्शन आणि Promise यांनाही समर्थन देतो. प्रतिसादाची वाट पाहताना URL लिंक लगेच घातली जाते; नंतर वैध परिणाम आल्यास फक्त त्या लिंकचा दिसणारा मजकूर बदलतो. दरम्यान लिंक बदलली किंवा हटवली असेल, नवीन दस्तऐवज लोड केला असेल किंवा surface अनमाउंट केले असेल, तर उशिरा आलेला परिणाम दुर्लक्षित केला जातो.

## CSS शैली

सामान्य links ला `.nabi-content a` ने आणि attachment links ला स्वतंत्रपणे `.nabi-content a[data-nabi-file]` ने style करा.

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

attachment link चे `::before` आणि `::after` icon व file extension दाखवतात, म्हणून त्यांचा `content` सहसा बदलू किंवा काढू नये.
