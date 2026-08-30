---
title: मूलभूत वापर
description: ब्राउझरमधील NABI NOTE संपादक तयार करा, नंतर त्याचे दस्तऐवज जतन करा व पुनर्स्थापित करा.
---

# मूलभूत वापर

या मार्गदर्शकात ब्राउझरमधील client-side rendered (CSR) संपादकाचा वापर आहे: wings निवडा, संपादक व त्याचा UI mount करा, आणि नंतर NABI TREE JSON जतन व पुनर्स्थापित करा.

## स्थापित करा आणि मूलभूत markup जोडा

```bash
npm install nabi-note
```

संपादक आणि प्रकाशित मजकूर यांसाठी तोच stylesheet लोड करा. `contenteditable` स्वतः जोडू नका; तो `mountSurface()` च्या मालकीचा आहे.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## संपादक mount करा

`allBasic()` अनुप्रयोग-विशिष्ट जोडणीशिवाय चालणारे अधिकृत wings निवडते. upload, file storage किंवा document diffing सारखे सेवेशी जोडलेले wings त्यांच्या स्वतंत्र मार्गदर्शकांप्रमाणे जोडा.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'mr',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'mr',
  placeholder: 'काहीतरी लिहा.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'mr',
})
```

`locale` toolbar आणि सहाय्यक मजकूर नियंत्रित करते; प्रत्येक UI mount ला एकच मूल्य द्या. `placeholder` फक्त रिकाम्या संपादकात दिसते. `onError` ला commands आणि callbacks मधील स्वतंत्र त्रुटी मिळतात. `undoLimit` म्हणजे undo नोंदींची संख्या (मूलतः 200). `typingMergeMs` सलग टायपिंग एकाच undo टप्प्यात मिसळण्याचा कालावधी आहे; प्रत्येक घात वेगळा ठेवण्यासाठी ते `0` करा.

प्रत्येक संपादकासाठी स्वतंत्र, एकमेकांवर न चढणारे content आणि toolbar roots आवश्यक आहेत. एका पानावर अनेक संपादक असतील तर focus आणि shortcuts एकमेकांत मिसळू नयेत म्हणून `surface` द्वारे प्रत्येक toolbar ला त्याचा स्वतःचा editor surface द्या.

## wings निवडा

तुम्हाला आवश्यक असलेलीच वैशिष्ट्ये ठेवण्यासाठी `use()` आणि `drop()` वापरा. प्रत्येक wing पानात स्वीकारल्या जाणाऱ्या options ची माहिती आहे.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'mr' })
```

लहान bundle साठी `boldWing` आणि `imageWing` यांसारखे आवश्यक wingsच array म्हणून द्या. अपरिचित नावे, अवैध options आणि नसलेल्या dependencies संपादक तयार करतानाच अयशस्वी होतात.

## जतन करा आणि लोड करा

दस्तऐवज पुन्हा संपादित करायचा असेल तर `getJson()` चा output NABI TREE JSON म्हणून जतन करा. `getHtml()` प्रकाशित output साठी आहे. फक्त संपादकासाठी असलेला `getEditorHtml()` चा परिणाम कधीही साठवू नका.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('The saved document could not be read.')

const publishedHtml = nabi.getHtml()
```

बाह्य HTML आयात करण्यासाठी `setHtml()` वापरा. ब्राउझर संपादक त्याचा HTML parser आधीच पुरवतो, म्हणून parser option लागत नाही. अवैध, रिकामे नसलेल्या input साठी `setJson()` आणि `setHtml()` `false` परत करतात आणि सध्याचा दस्तऐवज बदलत नाहीत.

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON आणि HTML दोन्ही अविश्वसनीय input आहेत. NABI NOTE नोंदवलेल्या wings व त्यांच्या परवानगीच्या नियमांद्वारे ते वाचते, पण त्यामुळे upload authorization किंवा तुमच्या सेवेची security policy यांची जागा घेतली जात नाही.

## सामान्य APIs

| काम | API |
| --- | --- |
| संपादक तयार करा | `createNabiWith`, `wings` |
| surface आणि toolbar mount करा | `mountSurface`, `mountToolbar` |
| जतन व पुनर्स्थापित करा | `getJson`, `setJson`, `getHtml`, `setHtml` |
| बदल पाहा | `nabi.onChange(listener)` |
| undo आणि redo | `nabi.undo()`, `nabi.redo()` |
| server वर HTML render करा | `nabi-note/ssr` मधील `renderStoredHtml` |
| प्रकाशित पानाचे वर्तन जोडा | `nabi-note/viewer` मधील `attachViewer` |
| दस्तऐवजांची तुलना करा | `nabi-note/diff` मधील `diffDocs` |

अचूक types आणि प्रत्येक argument साठी आधी स्थापित package declarations तपासा. Automation tools [English API reference](https://nabi.saro.me/llms/api-reference.md) देखील वापरू शकतात.

## mounts काढून टाका

तयार केल्याच्या उलट क्रमाने unmount करा. editing root चे `innerHTML` थेट बदलू नका; `setJson()`, `setHtml()` किंवा `applyCommand()` यांसारख्या public APIs द्वारे दस्तऐवज बदला.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
