---
title: Vibe coding na AI
description: Taimaka wa coding agents su karanta public API na yanzu da iyakokin takardu domin amfani da NABI NOTE daidai.
---

# Vibe coding na AI

NABI NOTE tana da [`llms.txt`](/llms.txt) don AI da kayan aikin automation. Maimakon barin agent ya yi hasashen dukan library, ka sa ya fara da wannan index kuma ya bi takardun batun da yake bukata kawai; hakan zai sa amsa da aiwatarwa su fi daidai.

## Prompt da za a yi amfani da shi kai tsaye

Cika framework da ayyukan da ake buƙata kawai a misalin da ke ƙasa.

```text
Da fatan za a aiwatar da edita da NABI NOTE (nabi-note).
Da farko karanta https://nabi.saro.me/llms.txt, sannan ka karanta takardun da ake bukata don wannan aiki kawai.

Muhalli: Vue 3 + TypeScript
Ayyukan da ake bukata: basic formatting, tables, images, upload
Asalin adanawa: NABI TREE JSON
Hanyar wallafawa: a mayar da JSON da aka adana HTML a sabar

Yi amfani da APIs da suke a public exports da installed types kawai.
Bayan aiwatarwa, gudanar da type checking da build, sannan ka bayyana fayilolin da aka canza da sakamakon tabbatarwa.
```

Idan agent ba zai iya karanta URL ba, saka abun cikin `llms.txt` da subdocuments masu dacewa da wannan aiki a cikin tattaunawar.

## Sa ya zaɓi takardun da yake bukata kawai

`llms.txt` gajeren index ne na jagora. Maimakon saka dukan takardu tun farko, ya fi kyau a ƙayyade waɗanda suka dace da aikin.

- Lokacin haɗa edita da npm, a sa ya karanta [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md).
- Don misalan CDN, a yi amfani da [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md).
- Don zaɓi da haɗa wing, a duba [`wings.md`](https://nabi.saro.me/llms/wings.md).
- Don JSON na ajiya, HTML, da sanarwar canji, a duba [`document-model.md`](https://nabi.saro.me/llms/document-model.md).
- Don shigo da HTML, paste, da iyakar upload, a duba [`io-security.md`](https://nabi.saro.me/llms/io-security.md).
- Don sabon wing, a yi amfani da [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md); don server rendering, a yi amfani da [`ssr.md`](https://nabi.saro.me/llms/ssr.md).
- Don viewer da diff, a duba [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md); don style da drop cap, a duba [`styling.md`](https://nabi.saro.me/llms/styling.md).
- Don ainihin imports da types, a duba [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md).

## Ba da requirements tare

Agent ba zai iya sanin hanyar adanawa ko manufar tsaro daga allon gyara kaɗai ba. Ka faɗa masa ainihin framework, wing da ake bukata da ayyukan da aka ware, iyakar adana JSON da HTML, tsarin request da response na upload server tare da iyakokin fayil, da ko allon wallafawa na bukatar SSR, viewer, ko diff.

Idan akwai abu da ba a yanke shawara ba tukuna, yana da kyau a umarce shi kada ya ƙirƙiro yanke hukunci ya aiwatar, sai dai ya fara bayyana zaɓuɓɓuka da tasirinsu sannan ya tambaya.

## Ma'aunin duba sakamako

Dole ne a duba code da aka samar kamar sauran code. Musamman, tabbatar da abubuwa masu zuwa kai tsaye.

- An loda `nabi-note/nabi.css` a allon gyara da kuma allon wallafawa.
- Wing da aka zaɓa da kowane mount suna amfani da `registry` iri ɗaya.
- Asalin ajiya `getJson()` ne kuma ba a adana `getEditorHtml()`.
- Ba a canza `innerHTML` na `.nabi-content` da ake gyarawa kai tsaye.
- Lokacin rufe allo, ana `unmount()` duk mounts da aka ƙirƙira.
- Upload server yana tantance MIME, girma, izini, da wurin ajiya.
- SSR da burauza suna amfani da tsari iri ɗaya na wing da options masu alaƙa da HTML.
- An tabbatar da ainihin export names ta type checking, tests, da build.

Musamman IME, caret, da tsarin ajiya ba sa da sauƙin a ɗauka lafiya saboda kawai allo ya bayyana daidai sau ɗaya. A gwada mobile composition input da adanawa da lodawa a zahiri.

## An fi ba version da aka shigar muhimmanci

Idan an riga an shigar da `nabi-note` a project, exports na `package.json` da type declarations na package ɗin da aka shigar su ne mafi kai tsaye fiye da takardun yanar gizo ga code na yanzu. Domin version na takarda da wanda aka shigar na iya bambanta, ka sa agent ya fara tabbatar da wannan bambanci.
