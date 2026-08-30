---
title: AI vibe coding
description: coding agents ना NABI NOTE चे सध्याचे public API आणि दस्तऐवजांच्या मर्यादांवर आधार देऊन ते अचूकपणे वापरायला मदत करा.
---

# AI vibe coding

NABI NOTE AI आणि automation tools साठी [`llms.txt`](/llms.txt) देते. agent ला पूर्ण library अंदाजाने वापरायला न सांगता, त्या index ने सुरुवात करा आणि कामासाठी आवश्यक दस्तऐवजच वाचायला सांगा.

## सुरुवातीचा prompt

तुम्हाला आवश्यक framework आणि features भरा.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

agent URLs उघडू शकत नसेल, तर conversation मध्ये `llms.txt` आणि संबंधित linked documents समाविष्ट करा.

## त्याला आवश्यक तेवढ्याकडेच वळवा

`llms.txt` हा संक्षिप्त index आहे. प्रत्येक document एकाच वेळी पाठवण्यापेक्षा agent ला फक्त संबंधित पाने देणे सहसा अधिक उपयुक्त ठरते.

- npm assembly: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN setup: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- wing निवड: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- साठवलेले JSON, HTML आणि change events: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML import, paste आणि upload मर्यादा: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- सानुकूल wings आणि server rendering: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer, diff, styles आणि drop caps: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- अचूक imports आणि types: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## product requirements समाविष्ट करा

agent केवळ editing screen वरून storage, security policy किंवा upload behavior ठरवू शकत नाही. खरे framework, समाविष्ट व वगळलेले wings, JSON आणि HTML साठवले जातात का, upload endpoint चा request व response contract, file limits आणि प्रकाशित पानांना SSR, viewer behavior किंवा diffing आवश्यक आहे का ते सांगा.

अजून न ठरलेल्या कोणत्याही गोष्टीसाठी, पर्याय निवडण्यापूर्वी agent ला पर्याय आणि त्यांचा परिणाम समजावून सांगायला सांगा.

## परिणामाचे पुनरावलोकन करा

तयार केलेल्या code चे इतर code प्रमाणे पुनरावलोकन करा. विशेषतः, पुढील बाबी तपासा:

- editing आणि प्रकाशित मजकुरासाठी `nabi-note/nabi.css` लोड करते;
- निवडलेल्या wings आणि प्रत्येक mount साठी तीच `registry` वापरते;
- `getJson()` साठवते, `getEditorHtml()` कधीही नाही;
- editing `.nabi-content` element च्या `innerHTML` मध्ये थेट लिहित नाही;
- screen बंद होताना प्रत्येक mount unmount करते;
- upload server वर MIME type, size, authorization आणि storage location तपासते;
- server व browser वर जुळणारा wing order आणि HTML वर परिणाम करणारे options वापरते;
- type checking, tests आणि build मधून प्रत्यक्ष export names निश्चित करते.

पान एकदा कार्यरत दिसले तरी IME व caret behavior, आणि save-and-load paths यांची प्रत्यक्ष पडताळणी लागते. mobile वर composition input तसेच saved-document restoration तपासा.

## स्थापित आवृत्तीला प्राधान्य द्या

project मध्ये `nabi-note` आधीच स्थापित असेल तेव्हा, दुसऱ्या release साठी तयार केलेल्या website पेक्षा त्याचे `package.json` exports आणि type declarations अधिक थेट संबंधित असतात. code लिहिण्यापूर्वी agent ला तो version difference तपासायला सांगा.
