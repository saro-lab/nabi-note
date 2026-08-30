---
title: AI వైబ్ కోడింగ్
description: కోడింగ్ ఏజెంట్లు ప్రస్తుత పబ్లిక్ API, డాక్యుమెంటేషన్ పరిమితుల ఆధారంగా NABI NOTEను కచ్చితంగా వాడేలా చేయండి.
---

# AI వైబ్ కోడింగ్

NABI NOTE AI, ఆటోమేషన్ సాధనాల కోసం [`llms.txt`](/llms.txt)ను అందిస్తుంది. ఏజెంట్‌తో మొత్తం లైబ్రరీని ఊహింపజేయకుండా, ఆ సూచికతో మొదలుపెట్టి పనికి అవసరమైన పత్రాలనే చదివించండి.

## ప్రారంభ ప్రాంప్ట్

మీకు అవసరమైన ఫ్రేమ్‌వర్క్, ఫీచర్‌లను పూరించండి.

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

ఏజెంట్ URLలను తెరవలేకపోతే, సంభాషణలో `llms.txt`, సంబంధిత లింక్ చేసిన పత్రాలను చేర్చండి.

## అవసరమైన వాటికే దారి చూపండి

`llms.txt` సంక్షిప్త సూచిక. ప్రతి పత్రాన్ని ఒకేసారి పంపడం కంటే, ఏజెంట్‌కు సంబంధిత పేజీలను మాత్రమే ఇవ్వడం సాధారణంగా ఉపయోగకరం.

- npm అసెంబ్లీ: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN అమరిక: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- వింగ్ ఎంపిక: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- నిల్వ JSON, HTML, మార్పు ఈవెంట్‌లు: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML దిగుమతి, అతికించడం, అప్‌లోడ్ పరిమితులు: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- అనుకూల వింగ్స్, సర్వర్ రెండరింగ్: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- వీయర్, తేడా, శైలులు, పెద్ద తొలి అక్షరాలు: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- ఖచ్చితమైన దిగుమతులు, రకాలు: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## ఉత్పత్తి అవసరాలను చేర్చండి

ఏజెంట్ సవరణ తెరను చూసి మాత్రమే నిల్వ, భద్రతా విధానం లేదా అప్‌లోడ్ ప్రవర్తనను ఊహించలేడు. నిజమైన ఫ్రేమ్‌వర్క్, చేర్చిన, మినహాయించిన వింగ్స్, JSON, HTML నిల్వ అవుతాయా, అప్‌లోడ్ ఎండ్‌పాయింట్ అభ్యర్థన, స్పందన ఒప్పందం, ఫైల్ పరిమితులు, ప్రచురిత పేజీలకు SSR, వీయర్ ప్రవర్తన లేదా తేడా అవసరమా స్పష్టంగా చెప్పండి.

ఇంకా నిర్ణయించని దేనికైనా, ఎంపికను అమలు చేసే ముందు వాటి ఎంపికలు, ప్రభావాన్ని వివరించమని ఏజెంట్‌ను అడగండి.

## ఫలితాన్ని సమీక్షించండి

సృష్టించిన కోడ్‌ను ఇతర కోడ్‌లాగే సమీక్షించండి. ముఖ్యంగా ఇది సరైందో చూడండి:

- సవరణ, ప్రచురిత కంటెంట్ రెండింటికీ `nabi-note/nabi.css`ను లోడ్ చేస్తుందా;
- ఎంచుకున్న వింగ్స్, ప్రతి మౌంట్‌కు ఒకే `registry`ని వాడుతుందా;
- `getJson()`ను నిల్వ చేసి, `getEditorHtml()`ను ఎప్పుడూ నిల్వ చేయదా;
- సవరణలోని `.nabi-content` ఎలిమెంట్ `innerHTML`కు నేరుగా రాయదా;
- తెర మూసినప్పుడు ప్రతి మౌంట్‌ను అన్‌మౌంట్ చేస్తుందా;
- అప్‌లోడ్ సర్వర్‌లో MIME రకం, పరిమాణం, అనుమతి, నిల్వ స్థానాన్ని ధృవీకరిస్తుందా;
- సర్వర్, బ్రౌజర్‌లో సరిపోలే వింగ్ క్రమం, HTMLను ప్రభావితం చేసే ఎంపికలు వాడుతుందా;
- టైప్ తనిఖీ, పరీక్షలు, బిల్డ్ ద్వారా నిజమైన ఎగుమతి పేర్లను నిర్ధారిస్తుందా.

పేజీ ఒక్కసారి పనిచేసినట్టు కనిపించినా IME, కర్సర్ ప్రవర్తన, భద్రపరచి-లోడ్ చేసే మార్గాలకు నిజమైన ధృవీకరణ అవసరం. మొబైల్‌లో కంపోజిషన్ ఇన్‌పుట్‌తోపాటు నిల్వ పత్ర పునరుద్ధరణను పరీక్షించండి.

## ఇన్‌స్టాల్ చేసిన వెర్షన్‌కే ప్రాధాన్యం ఇవ్వండి

ప్రాజెక్ట్‌లో ఇప్పటికే `nabi-note` ఉంటే, దాని `package.json` ఎగుమతులు, టైప్ డిక్లరేషన్‌లు వేరే విడుదల కోసం నిర్మించిన వెబ్‌సైట్ కంటే నేరుగా వర్తిస్తాయి. కోడ్ రాయడానికి ముందు ఆ వెర్షన్ తేడాను చూడమని ఏజెంట్‌ను అడగండి.
