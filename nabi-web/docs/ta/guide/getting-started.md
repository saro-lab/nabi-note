---
title: அடிப்படைப் பயன்பாடு
description: உலாவியில் NABI NOTE திருத்தியை அமைத்து, ஆவணங்களைச் சேமித்து மீட்டெடுக்கும் அடிப்படை ஓட்டம்.
---

# அடிப்படைப் பயன்பாடு

இந்த வழிகாட்டி உலாவியில் இயங்கும் கிளையன்ட்-சைடு ரெண்டரிங் (CSR) திருத்தியை விளக்குகிறது: wing-களைத் தேர்ந்தெடுத்து, திருத்தியையும் அதன் UI-யையும் mount செய்து, பின்னர் NABI TREE JSON-ஐச் சேமித்து மீட்டெடுக்க வேண்டும்.

## நிறுவல் மற்றும் அடிப்படை HTML

```bash
npm install nabi-note
```

திருத்திக்கும் வெளியிடப்பட்ட உள்ளடக்கத்திற்கும் ஒரே stylesheet-ஐ ஏற்றுங்கள். `contenteditable`-ஐ நீங்களே சேர்க்காதீர்கள்; அதை `mountSurface()` நிர்வகிக்கிறது.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## திருத்தியை இணைத்தல்

`allBasic()` பயன்பாட்டுக்கே உரிய இணைப்பு இல்லாமல் இயங்கும் அதிகாரப்பூர்வ wing-களைத் தேர்ந்தெடுக்கிறது. பதிவேற்றம், கோப்பு சேமிப்பு அல்லது ஆவண வேறுபாடு போன்ற சேவையுடன் இணையும் wing-களை அவற்றின் தனிப்பட்ட வழிகாட்டிகளில் கூறியபடி சேர்க்கவும்.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ta',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ta',
  placeholder: 'எதையாவது எழுதுங்கள்.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ta',
})
```

`locale` கருவிப்பட்டி மற்றும் உதவி உரையைக் கட்டுப்படுத்துகிறது; ஒவ்வொரு UI mount-க்கும் அதே மதிப்பைத் தரவும். `placeholder` காலியான திருத்தியில் மட்டும் காட்டப்படும். `onError` கட்டளைகள் மற்றும் callback-களில் தனிமைப்படுத்தப்பட்ட தோல்விகளைப் பெறுகிறது. `undoLimit` என்பது செயல்தவிர்ப்பு பதிவுகளின் எண்ணிக்கை (இயல்புநிலை 200). `typingMergeMs` தொடர்ச்சியான தட்டச்சலை ஒரே செயல்தவிர்ப்பு படியாக இணைக்கும் இடைவெளி; ஒவ்வொரு உள்ளீட்டையும் தனியாக வைத்திருக்க `0` என அமைக்கவும்.

ஒவ்வொரு திருத்திக்கும் ஒன்றுடன் ஒன்று ஒட்டாத தனி உள்ளடக்க மற்றும் கருவிப்பட்டி root-கள் தேவை. பல திருத்திகள் உள்ள பக்கத்தில், கவனமும் விசைப்பலகைக் குறுக்குவழிகளும் ஒன்றோடொன்று கலக்காமல் இருக்க ஒவ்வொரு கருவிப்பட்டியின் `surface`-க்கும் அதன் சொந்த திருத்தி surface-ஐத் தரவும்.

## wing-களைத் தேர்ந்தெடுங்கள்

தேவையான வசதிகளை மட்டும் வைத்திருக்க `use()` மற்றும் `drop()`-ஐப் பயன்படுத்துங்கள். ஒவ்வொரு wing பக்கமும் அது ஏற்கும் விருப்பங்களை ஆவணப்படுத்துகிறது.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'ta' })
```

சிறிய bundle-க்கு `boldWing`, `imageWing` போன்ற தேவையான wing-களை மட்டும் array ஆக வழங்கலாம். அறியப்படாத பெயர்கள், தவறான விருப்பங்கள் மற்றும் காணாத சார்புகள் திருத்தி உருவாகும்போதே உடனடியாகத் தோல்வியடையும்.

## சேமித்தல் மற்றும் ஏற்றுதல்

ஆவணத்தை மீண்டும் திருத்த வேண்டுமென்றால் `getJson()` வெளியீட்டை NABI TREE JSON ஆகச் சேமியுங்கள். `getHtml()` வெளியிடப்பட்ட வெளியீட்டுக்கானது. திருத்திக்காக மட்டுமே உள்ள `getEditorHtml()` முடிவை ஒருபோதும் சேமிக்காதீர்கள்.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('சேமித்த ஆவணத்தைப் படிக்க முடியவில்லை.')

const publishedHtml = nabi.getHtml()
```

வெளிப்புற HTML-ஐ இறக்குமதி செய்ய `setHtml()`-ஐப் பயன்படுத்துங்கள். உலாவித் திருத்தி ஏற்கனவே அதன் HTML parser-ஐ வழங்குவதால் parser விருப்பம் தேவையில்லை. செல்லாத வெறுமையல்லாத உள்ளீட்டுக்கு `setJson()` மற்றும் `setHtml()` இரண்டும் `false`-ஐத் திருப்பி நடப்பு ஆவணத்தை மாற்றாமல் விடுகின்றன.

```ts
nabi.setHtml('<p>இறக்குமதி செய்யப்பட்ட ஆவணம்</p>')
```

JSON மற்றும் HTML இரண்டுமே நம்பமுடியாத உள்ளீடுகள். NABI NOTE அவற்றைப் பதிவுசெய்யப்பட்ட wing-கள் மற்றும் அவற்றின் அனுமதி விதிகள் வழியாகப் படிக்கிறது; ஆனால் அது பதிவேற்ற அனுமதி அல்லது உங்கள் சேவையின் பாதுகாப்புக் கொள்கையை மாற்றாது.

## பொதுவான API-கள்

| பணி | API |
| --- | --- |
| திருத்தியை உருவாக்குதல் | `createNabiWith`, `wings` |
| surface மற்றும் கருவிப்பட்டியை இணைத்தல் | `mountSurface`, `mountToolbar` |
| சேமித்தல் மற்றும் மீட்டெடுத்தல் | `getJson`, `setJson`, `getHtml`, `setHtml` |
| மாற்றங்களைக் கவனித்தல் | `nabi.onChange(listener)` |
| செயல்தவிர்த்தல் மற்றும் மீண்டும் செய்தல் | `nabi.undo()`, `nabi.redo()` |
| சேவையகத்தில் HTML உருவாக்குதல் | `nabi-note/ssr`-இலிருந்து `renderStoredHtml` |
| வெளியிடப்பட்ட பக்கச் செயல்பாட்டைச் சேர்த்தல் | `nabi-note/viewer`-இலிருந்து `attachViewer` |
| ஆவணங்களை ஒப்பிடுதல் | `nabi-note/diff`-இலிருந்து `diffDocs` |

துல்லியமான வகைகள் மற்றும் ஒவ்வொரு argument-க்கும் முதலில் நிறுவியுள்ள package declaration-களைப் பாருங்கள். தானியக்கக் கருவிகள் [ஆங்கில API reference](https://nabi.saro.me/llms/api-reference.md)-ஐயும் பயன்படுத்தலாம்.

## mount-களை அகற்றுதல்

உருவாக்கிய வரிசையின் தலைகீழ் வரிசையில் unmount செய்யுங்கள். திருத்தி root-இன் `innerHTML`-ஐ நேரடியாக மாற்றாதீர்கள்; `setJson()`, `setHtml()` அல்லது `applyCommand()` போன்ற பொது API-கள் வழியாக ஆவணங்களை மாற்றுங்கள்.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
