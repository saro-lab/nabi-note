---
title: ஒப்பீடு
description: இரு ஆவணங்களை அருகருகே ஒப்பிட்டு, தேர்ந்த பழைய உள்ளடக்கத்தை தற்போதைய ஆவணத்தில் பயன்படுத்துங்கள்.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# ஒப்பீடு

சேமித்த இரு ஆவணங்களை அருகருகே வைத்து மாற்றங்களைப் பாருங்கள். திருத்தி இல்லாமலும் காட்சி திறக்கும்; callback இணைத்து தேர்ந்த பழைய உள்ளடக்கத்தை தற்போதைய ஆவணத்தில் பயன்படுத்தலாம்.

## தேர்ந்த பழைய உள்ளடக்கத்தைப் பயன்படுத்துதல்

தனித்த ஒப்பீட்டுக் காட்சி இயல்பாக வாசிப்புக்கு மட்டுமே இருக்கும்; **&gt;&gt;** பயன்படுத்தும் பொத்தான்களைக் காட்டாது. அவற்றைக் காட்ட `onMerge` callback-ஐ இணைக்கவும்.

இடது பழைய ஆவணம், வலது தற்போதைய ஆவணம். மாற்றத்தின் அருகிலுள்ள **&gt;&gt;** அந்தப் பத்தி அல்லது வரிக்குழுவின் பழைய உள்ளடக்கத்தைப் பயன்படுத்தும். எழுத்தெழுத்தாகத் தேர்வு இல்லை. நீக்கியதை மீட்கவும் புதிதாகச் சேர்த்ததை அகற்றவும் முடியும்.

கீழுள்ள எடுத்துக்காட்டு வாசிப்புக்கு மட்டுமே. சந்திப்பு நேரமும் கொண்டு வர வேண்டிய பொருட்களும் எப்படி மாறியுள்ளன என்பதைப் பாருங்கள். **மீண்டும் தொடங்கு** அசல் எடுத்துக்காட்டை மீட்டமைக்கும்.

<CompareDemo />

## தனித்த ஒப்பீட்டுக் காட்சி

`nabi-note/diff` இலிருந்து இறக்குமதி செய்யுங்கள். `before`, `after` இல் சேமித்த NABI TREE JSON அல்லது HTML சரங்களைத் தாருங்கள். அட்டவணை, பட்டியல், படம் உள்ளிட்டவற்றை முழுமையாகப் படித்துக் காட்ட அசல் திருத்தியின் அதே wing-களால் registry அமைக்கவும்.

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
  locale: 'ta',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

இயல்பாக மாற்றங்களும் சுற்றியுள்ள சூழலும் தெரியும். மடிப்பு பொத்தான் முழு ஆவணத்தை விரிக்கும்; முந்தைய/அடுத்த பொத்தான்கள் மாற்றங்களுக்கு நகரும். மாற்றமில்லையெனில் முழு ஆவணம் தெரியும். `onMerge` இல்லையேல் வாசிக்க மட்டும் முடியும்.

## callback மூலம் கிளிக் இணைப்பைச் சேர்த்தல்

கிளிக் முன்மொழியப்பட்ட முடிவை `onMerge` க்கு அனுப்பும். callback மட்டும் இணைப்பதால் தானாகச் சேமிக்காது. சேவை முன்மொழிவை ஏற்று `update()` அழைத்தால்தான் ஒப்பீடும் மாறும்.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ta',
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

`proposal.result` தேர்ந்த மாற்றத்தை மட்டும் பயன்படுத்திய NABI TREE JSON. `before`, `after` கிளிக் செய்தபோதைய ஆவணங்கள்; `changeId` மாற்றத்தையும் `revision` ஒப்பீட்டு நிலையையும் குறிக்கும். இந்த `revision` ஐ `update()` இன் மூன்றாம் அளபுருவாகத் தாருங்கள்: ஒப்பீடு மாறியிருந்தால் `false` திரும்பும், முன்மொழிவு பயன்படுத்தப்படாது.

ஒத்திசைவற்ற callback காத்திருக்கும்போது மீண்டும் கிளிக் தடுக்கப்படும். பிற ஆவணங்களால் புதுப்பித்தல் அல்லது காட்சியை அகற்றுதல் `signal` ஐ ரத்துசெய்யும். சேவையகத்தில் சேமிக்கும்போது சிக்னலையும் ஆவணப் பதிப்பையும் சரிபார்த்து பழைய முடிவு புதியதை மேலெழுதாமல் காக்கவும்.

## திருத்தியிலிருந்து ஒப்பீட்டைத் திறத்தல்

கருவிப்பட்டையிலிருந்து திறக்க `diff` wing மற்றும் `mountDiffWing()` இணைக்கவும். அடிப்படை கடைசியாக ஏற்றிய ஆவணம். வழக்கமான திருத்தமும் செயல்தவிர்ப்பும் அடிப்படையை மாற்றாது.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ta',
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

`merge`-இன் இயல்புநிலை `true` என்பதால் தேர்ந்தெடுத்த பழைய உள்ளடக்கத்தைத் திருத்தியில் பயன்படுத்தலாம். இந்த மாற்றத்தைச் செயல்தவிர்க்கலாம்; அடிப்படை ஆவணம் நிலைக்கும். ஒப்பீடு திறந்திருக்கும் போது அசல் திருத்தி மாறினால் ஒப்பீடு மீண்டும் கணக்கிடப்படும். வாசிப்புக்கு மட்டும் இருக்க `merge: false` அமைக்கவும்.

காட்சியை அகற்றும்போது `toolbar.unmount()`, `comparison.unmount()` அழைக்கவும். திருத்தத் தொடக்கப் பதிப்பையும் சேர்த்து இருபுற மாற்றங்களைத் தானாக இணைக்க [இணைத்தல்](./merge) பயன்படுத்துங்கள்.
