---
title: Uandishi wa msimbo kwa mtindo wa AI
description: Huwasaidia mawakala wa programu kutumia NABI NOTE kwa usahihi kwa kuzingatia API yake ya sasa ya umma na mipaka ya nyaraka.
---

# Uandishi wa msimbo kwa mtindo wa AI

NABI NOTE hutoa [`llms.txt`](/llms.txt) kwa zana za AI na uendeshaji otomatiki. Badala ya kumwomba wakala akisie maktaba nzima, anza na faharasa hiyo na umwambie asome nyaraka zinazohitajika kwa kazi husika tu.

## Prompt ya kuanzia

Jaza framework na vipengele unavyohitaji katika mfano ufuatao.

```text
Tengeneza kihariri kwa NABI NOTE (nabi-note).
Kwanza soma https://nabi.saro.me/llms.txt, kisha soma nyaraka zinazohitajika kwa kazi hii pekee.

Mazingira: Vue 3 + TypeScript
Vipengele vinavyohitajika: uumbizaji wa msingi, jedwali, picha na upakiaji
Chanzo cha kuhifadhi: NABI TREE JSON
Uchapishaji: render JSON iliyohifadhiwa kuwa HTML kwenye seva

Tumia exports za umma na API zilizopo kweli katika types zilizosakinishwa pekee.
Baada ya utekelezaji, endesha ukaguzi wa types na build, kisha ripoti faili zilizobadilishwa na matokeo ya uthibitishaji.
```

Ikiwa wakala hawezi kufungua URL, jumuisha `llms.txt` na nyaraka husika zilizounganishwa kwenye mazungumzo.

## Mwelekeze kwenye anachohitaji tu

`llms.txt` ni faharasa fupi. Kumpa wakala kurasa zinazohusika tu kwa kawaida kuna faida zaidi kuliko kutuma nyaraka zote kwa wakati mmoja.

- kuunda kwa npm: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- usanidi wa CDN: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- kuchagua wing: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- JSON iliyohifadhiwa, HTML na matukio ya mabadiliko: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- kuingiza HTML, kubandika na mipaka ya upload: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- custom wings na rendering ya seva: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer, diff, mitindo na drop cap: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- imports na types kamili: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Jumuisha mahitaji ya bidhaa

Wakala hawezi kubaini uhifadhi, sera ya usalama au tabia ya upload kutokana na skrini ya kuhariri pekee. Eleza framework halisi, wings zilizojumuishwa na zilizoondolewa, kama JSON na HTML zinahifadhiwa, mkataba wa request na response wa endpoint ya upload, mipaka ya faili, na kama kurasa zilizochapishwa zinahitaji SSR, tabia ya viewer au diff.

Kwa jambo lolote ambalo bado halijaamuliwa, mwombe wakala aeleze chaguo na athari zake kabla ya kutekeleza uamuzi.

## Kagua matokeo

Kagua msimbo uliozalishwa kama msimbo mwingine wowote. Hasa, thibitisha kwamba:

- inapakia `nabi-note/nabi.css` kwa uhariri na maudhui yaliyochapishwa;
- inatumia `registry` ileile kwa wings zilizochaguliwa na kila mount;
- inahifadhi `getJson()`, kamwe si `getEditorHtml()`;
- haiandiki moja kwa moja kwenye `innerHTML` ya elementi ya `.nabi-content` inayohaririwa;
- ina-unmount kila mount skrini inapofungwa;
- inathibitisha aina ya MIME, ukubwa, ruhusa na eneo la kuhifadhi kwenye seva ya upload;
- inatumia mpangilio unaolingana wa wing na options zinazoathiri HTML kwenye seva na kivinjari;
- inathibitisha majina halisi ya export kwa ukaguzi wa types, majaribio na build.

Tabia ya IME na caret, pamoja na njia za kuhifadhi na kupakia, zinahitaji uthibitishaji halisi hata kama ukurasa unaonekana kufanya kazi mara moja. Jaribu composition input kwenye simu pamoja na kurejesha hati iliyohifadhiwa.

## Tanguliza toleo lililosakinishwa

Mradi unapokuwa tayari umesakinisha `nabi-note`, exports za `package.json` yake na type declarations zina umuhimu wa moja kwa moja zaidi kuliko tovuti iliyoundwa kwa toleo jingine. Mwombe wakala aangalie tofauti ya toleo kabla ya kuandika msimbo.
