---
title: लिंक
description: सुरक्षित वेब पते जोड़ें और अपलोड किए गए attachments दिखाएँ।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# लिंक

Pilih teks lalu lampirkan alamat padanya. Jika Anda memasukkan alamat tanpa memilih teks, alamat itu sendiri dimasukkan sebagai teks tautan. Mengetik alamat `http://` atau `https://` lalu menekan Space atau Enter juga mengubahnya menjadi tautan.

Tautan hanya menyimpan `http:`, `https:`, dan path situs yang sama yang diawali `.` atau `/`. Alamat yang asalnya tidak dapat dikenali jelas, seperti `javascript:` atau `//example.com`, ditolak. Tautan lampiran yang dibuat oleh upload juga menyimpan informasi file dan tidak dapat dibuat manual seperti tautan biasa.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## URL पेस्ट करना

शुरू और अंत के खाली अक्षर हटाने के बाद यदि पेस्ट की गई पूरी सामग्री एक मान्य `http://` या `https://` URL है, तो उसे तुरंत लिंक के रूप में डाला जाता है। वाक्यों के भीतर URL, कई URL वाला पाठ और सापेक्ष पथ मौजूदा पेस्ट व्यवहार के अनुसार संसाधित होते हैं। कोड ब्लॉक और लिंक wing के बिना वाले संपादक में सामग्री पाठ बनी रहती है। मूल फ़ॉर्मैट बनाए रखने के लिए संपादक से कॉपी किए गए मान्य आंतरिक क्लिपबोर्ड डेटा को प्राथमिकता मिलती है।

लिंक का दिखने वाला पाठ तय करने के लिए `mountSurface()` में `onPasteUrl` कॉलबैक का उपयोग करें।

| आर्ग्युमेंट | मान |
| --- | --- |
| `url` | शुरू और अंत के खाली अक्षर हटाने के बाद पूरा URL |
| `isSameOrigin` | क्या URL का प्रोटोकॉल, होस्ट और पोर्ट संपादक वाले दस्तावेज़ के ओरिजिन से मेल खाते हैं |
| `path` | `/` से शुरू होने वाला पथ, क्वेरी और फ़्रैगमेंट सहित। उदाहरण: `/posts/1?a=2#top` |

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

लौटाई गई स्ट्रिंग में खाली अक्षरों के अलावा कोई अक्षर हो, तो वह दिखने वाला पाठ बन जाती है। कॉलबैक न होने पर, खाली या स्ट्रिंग के अलावा किसी दूसरे प्रकार का मान लौटाने पर, या विफल होने पर पेस्ट किया गया URL ही दिखने वाला पाठ रहता है। लौटाई गई स्ट्रिंग को कभी HTML नहीं माना जाता और वह लिंक का पता नहीं बदलती।

कॉलबैक `async` फ़ंक्शन और Promise भी स्वीकार करता है। जवाब की प्रतीक्षा के दौरान URL लिंक तुरंत डाल दिया जाता है; बाद में मान्य परिणाम आने पर केवल उसी लिंक का दिखने वाला पाठ बदलता है। इस बीच लिंक संपादित या हटा दिया गया हो, नया दस्तावेज़ लोड हुआ हो, या surface अनमाउंट किया गया हो, तो देर से आए परिणाम को अनदेखा किया जाता है।

## CSS स्टाइल

Beri gaya tautan biasa dengan `.nabi-content a`, dan tautan lampiran secara terpisah dengan `.nabi-content a[data-nabi-file]`.

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

Bagian `::before` dan `::after` pada tautan lampiran dipakai untuk menampilkan ikon dan ekstensi file, jadi biasanya sebaiknya jangan mengganti atau menghapus `content`-nya.
