---
title: పోలిక
description: రెండు పత్రాలను పక్కపక్కన పోల్చి, ఎంచుకున్న పాత విషయాన్ని ప్రస్తుత పత్రానికి వర్తింపజేయండి.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# పోలిక

భద్రపరిచిన రెండు పత్రాలను పక్కపక్కన ఉంచి మార్పులు చూడండి. ఎడిటర్ లేకుండానూ వీక్షణ తెరుచుకుంటుంది; callback జోడించి ఎంచుకున్న పాత విషయాన్ని ప్రస్తుత పత్రానికి వర్తింపజేయవచ్చు.

## ఎంచుకున్న పాత విషయాన్ని వర్తింపజేయడం

ఎడమ పాత పత్రం, కుడి ప్రస్తుత పత్రం. మార్పు పక్కన **&gt;&gt;** నొక్కితే ఆ పేరా లేదా పంక్తుల సమూహంలోని పాత విషయం వర్తిస్తుంది. అక్షరాలవారీ ఎంపిక కాదు. తొలగించిన విషయాన్ని పునరుద్ధరించవచ్చు, కొత్తగా చేర్చినదాన్ని తీసేయవచ్చు.

కింద సమావేశ సమయం లేదా తీసుకురావాల్సిన వస్తువులను మాత్రమే వెనక్కి మార్చండి. ఫలితం కోసం **callback నవీకరించిన ప్రస్తుత పత్రం** తెరవండి. **మళ్లీ ప్రారంభించు** అసలు ఉదాహరణను తెస్తుంది.

<CompareDemo />

## స్వతంత్ర పోలిక వీక్షణ

`nabi-note/diff` నుంచి దిగుమతి చేసుకోండి. `before`, `after` కు భద్రపరిచిన NABI TREE JSON లేదా HTML స్ట్రింగ్‌లు ఇవ్వండి. పట్టికలు, జాబితాలు, చిత్రాలు పూర్తిగా చదివి చూపడానికి అసలు ఎడిటర్‌లోని wings తోనే registry తయారు చేయండి.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'te',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

మొదట మార్పులు, చుట్టూ సందర్భం మాత్రమే కనిపిస్తాయి. మడత బటన్ పూర్తి పత్రాన్ని విప్పుతుంది; ముందు/తర్వాత బటన్లు మార్పులకు తీసుకెళ్తాయి. మార్పుల్లేకపోతే మొత్తం పత్రం కనిపిస్తుంది. `onMerge` లేకుంటే చదవడం మాత్రమే సాధ్యం.

## callback తో క్లిక్ విలీనాన్ని కలపడం

క్లిక్ ప్రతిపాదిత ఫలితాన్ని `onMerge` కు పంపుతుంది. callback కలిపినంత మాత్రాన స్వయంగా భద్రపరచదు. సేవ ప్రతిపాదనను అంగీకరించి `update()` పిలిస్తేనే పోలిక మారుతుంది.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'te',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` ఎంచుకున్న మార్పును మాత్రమే వర్తింపజేసిన NABI TREE JSON. `before`, `after` క్లిక్ సమయంలోని పత్రాలు; `changeId` మార్పును, `revision` పోలిక స్థితిని గుర్తిస్తాయి. ఈ `revision` ను `update()` మూడో ఆర్గ్యుమెంట్‌గా ఇవ్వండి: పోలిక మారితే `false` వస్తుంది, ప్రతిపాదన వర్తించదు.

అసమకాలిక callback కోసం వేచివుండగా మళ్లీ క్లిక్ నిరోధిస్తారు. ఇతర పత్రాలతో నవీకరించడం లేదా వీక్షణ తొలగించడం `signal` రద్దు చేస్తుంది. సర్వర్‌కు భద్రపరిచేటప్పుడు సిగ్నల్, సర్వర్ పత్ర సంస్కరణ రెండూ చూసి పాత ఫలితం కొత్తదాన్ని చెరపకుండా చూడండి.

## ఎడిటర్ నుంచి పోలిక తెరవడం

టూల్‌బార్ నుంచి తెరవడానికి `diff` wing, `mountDiffWing()` కలపండి. ఆధారం చివరిగా లోడ్ చేసిన పత్రం. సాధారణ సవరణ, రద్దుచేయడం ఆధారాన్ని మార్చవు.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'te',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge: true` తో ఎంచుకున్న పాత విషయం ఎడిటర్‌కు వర్తిస్తుంది. రద్దుచేయవచ్చు, ఆధారం నిలుస్తుంది. వీక్షణ తెరిచి ఉండగా అసలు ఎడిటర్ మారితే పోలిక మళ్లీ గణిస్తుంది. `merge` వదిలేస్తే చదవడానికి మాత్రమే ఉంటుంది.

వీక్షణ తీసేటప్పుడు `toolbar.unmount()`, `comparison.unmount()` పిలవండి. సవరణ ప్రారంభ సంస్కరణనూ తీసుకుని రెండు వైపుల మార్పులను స్వయంగా కలపడానికి [విలీనం](./merge) వాడండి.
