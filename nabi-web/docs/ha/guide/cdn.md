---
title: Amfani da CDN
description: Misalin haɗa NABI NOTE don mai bincike ba tare da kayan aikin build ba.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Amfani da CDN

A shafi na tsaye inda shigar da kunshi yake da wahala, za ka iya loda browser bundle da CSS na NABI NOTE daga CDN. Misalin da ke ƙasa yana karanta sigar kunshin kai tsaye a lokacin build don ƙirƙirar adireshi, sannan ya haɗa editan da global object `NabiNote`.

<CdnDemo />

## Abubuwan da za a duba a NABI NOTE

- A cikin lambar turawa, yi amfani da sigar tsayayyiya iri ɗaya don CSS da JavaScript na mai bincike. Adireshin da ba shi da sigar kamar `latest` na iya canza aiki ranar da sabuwar siga ta fito.
- Browser bundle yana ba da tushen API a matsayin `window.NabiNote`. Babu bundle na duniya dabam ga `nabi-note/ssr`, `nabi-note/viewer`, da `nabi-note/diff`.
- Ajiye fayil da tarihin gida a misalin suna aiki a cikin mai binciken mai amfani. Idan ana buƙatar ajiyar uwar garke ko daidaita asusu, aika sakamakon `getJson()` zuwa API na aikace-aikacenku.
- Lokacin ƙara upload, kada a haɗa wing `upload` kaɗai; haɗa ainihin aikin aikawa da wings na hoto ko mahaɗi da ake buƙata. Uwar garken upload ce ke da alhakin tantance fayil.
- Browser bundle yana haɗa HTML parser a ciki. Saboda haka `setHtml()`, buɗe fayil ɗin HTML, da manna HTML ba sa buƙatar zaɓin parser daban ko API na sirri.

CDN ya bambanta ne kawai wajen yadda ake lodawa. Tsarin ajiya da tantance shigarwa iri ɗaya ne da na shigar npm, saboda haka duba kuma [amfani na asali](/ha/guide/getting-started).
