---
title: AI वाइब कोडिंग
description: coding agents को मौजूदा public API और दस्तावेज़ सीमाएँ पढ़कर NABI NOTE का सही उपयोग करने में मदद करता है।
---

# AI वाइब कोडिंग

NABI NOTE में AI और automation tools के लिए [`llms.txt`](/llms.txt) है। agent से पूरी library का अनुमान लगवाने के बजाय पहले यह index पढ़वाएँ और फिर केवल आवश्यक विषय दस्तावेज़ों तक भेजें; उत्तर और implementation दोनों अधिक सटीक होंगे।

## तुरंत उपयोग करने योग्य prompt

नीचे के उदाहरण में केवल अपना framework और आवश्यक features भरें।

```text
NABI NOTE (nabi-note) से editor बनाएँ।
पहले https://nabi.saro.me/llms.txt पढ़ें और फिर केवल इस काम के लिए आवश्यक दस्तावेज़ पढ़ें।

वातावरण: Vue 3 + TypeScript
आवश्यक features: basic formatting, table, image, upload
सहेजा जाने वाला मूल: NABI TREE JSON
प्रकाशन: सहेजे JSON को server पर HTML में render करना

केवल public exports और installed types में वास्तव में मौजूद API उपयोग करें।
implementation के बाद type check और build चलाएँ, और बदली files व verification result बताएँ।
```

यदि agent URL नहीं पढ़ सकता, तो `llms.txt` और इस काम से संबंधित subdocuments की सामग्री conversation में दें।

## केवल आवश्यक दस्तावेज़ चुनवाएँ

`llms.txt` छोटा guide index है। शुरू से सारे दस्तावेज़ देने के बजाय काम से मेल खाने वाले दस्तावेज़ चुनना बेहतर है।

- npm से editor assemble करने के लिए [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md) पढ़वाएँ।
- CDN example के लिए [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md) उपयोग करें।
- wing selection और composition के लिए [`wings.md`](https://nabi.saro.me/llms/wings.md) देखें।
- saved JSON, HTML और change events के लिए [`document-model.md`](https://nabi.saro.me/llms/document-model.md) देखें।
- HTML import, paste और upload boundaries के लिए [`io-security.md`](https://nabi.saro.me/llms/io-security.md) देखें।
- नई wing के लिए [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), server rendering के लिए [`ssr.md`](https://nabi.saro.me/llms/ssr.md) उपयोग करें।
- viewer और diff के लिए [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), styling और drop cap के लिए [`styling.md`](https://nabi.saro.me/llms/styling.md) देखें।
- सही import और types [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md) में ढूँढें।

## आवश्यकताएँ साथ दें

agent केवल editing screen देखकर storage method या security policy नहीं जान सकता। वास्तविक framework, आवश्यक और बाहर रखी wings, JSON और HTML storage scope, upload server request/response format व file limits, और published screen को SSR, viewer या diff चाहिए या नहीं—सब साथ बताएँ।

कोई निर्णय बाकी हो तो agent से मनमाना implementation न करवाएँ; पहले विकल्प और उनके प्रभाव समझाकर प्रश्न पूछने को कहें।

## परिणाम जाँचने के मानदंड

generated code को सामान्य code की तरह review करें। विशेष रूप से जाँचें:

- editing और published screen दोनों में `nabi-note/nabi.css` लोड है
- selected wings और सभी mounts समान `registry` उपयोग करते हैं
- saved source `getJson()` है और `getEditorHtml()` सहेजा नहीं जाता
- editing `.nabi-content` का `innerHTML` सीधे नहीं बदला जाता
- screen बंद करते समय हर mount का `unmount()` होता है
- upload server MIME, size, permission और storage location जाँचता है
- SSR और browser समान wing order व HTML options उपयोग करते हैं
- type check, tests और build से वास्तविक export names जाँचे गए हैं

विशेष रूप से IME, caret और saved format को केवल एक बार screen सही दिखने से सुरक्षित नहीं मान सकते। mobile composition input और save/reload वास्तव में जाँचें।

## installed version को प्राथमिकता दें

project में `nabi-note` पहले से installed हो तो installed package के `package.json` exports और type declarations वर्तमान code के लिए web docs से अधिक सीधा आधार हैं। docs और installed version अलग हो सकते हैं, इसलिए agent से पहले यह अंतर जाँचने को कहें।
