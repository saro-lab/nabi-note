---
title: Babban harafin farko
description: Yana sanya harafin farko na sakin layi da girma don fara rubutu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Babban harafin farko

Yana sanya harafin farko na sakin layi da girma, sauran layuka kuma su gudana kusa da shi. Tsari ne na sakin layi, saboda haka ba a amfani da shi idan an zaɓi wani ɓangaren haruffa kaɗai.

Shafin da aka wallafa da allon edita suna riƙe kamanni iri ɗaya. Lokacin gyarawa, ana nannade harafin farko da sinadari na ainihi domin wurin alama da gogewa kada su kauce; wannan sinadari ba ya cikin abun daftarin da ake adanawa.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Tsarin CSS

Shafin wallafa da allon edita sun bambanta ne kawai a zaɓaɓɓen da ke nuni da harafin farko. Shafin wallafa yana amfani da `[data-nabi-dropcap="1"]::first-letter`, allon edita kuma yana amfani da ainihin sinadarin `[data-nabi-dropcap-letter]`. Lokacin canza ƙimomin gani kamar launi, font, ko girma, dole ne ka rubuta zaɓaɓɓen biyu tare domin kamanni yayin gyarawa da wallafawa ya zama iri ɗaya.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Idan za ka canza girma da tsayin layi ma, yi amfani da ƙima iri ɗaya ga zaɓaɓɓen biyu.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Babban harafin farko yana ƙididdige gudun layi da ke kewaye da harafin, don haka canza gefe ɗaya kawai ko ƙara ƙima fiye da kima na iya lalata kamannin WYSIWYG. Har yanzu ya kamata a guji ƙara `::first-letter` sabo a allon edita. A editan, yi wa `[data-nabi-dropcap-letter]` da yake can ado kawai.
