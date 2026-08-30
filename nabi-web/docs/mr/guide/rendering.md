---
title: SSR संयोजना
description: साठवलेले NABI TREE दस्तऐवज server वर सुरक्षितपणे HTML मध्ये render करा आणि ब्राउझरमध्ये संपादक hydrate करा.
---

# SSR संयोजना

server वर browser surfaces किंवा UI नव्हे, फक्त `nabi-note/ssr` import करा. ते साठवलेले NABI TREE JSON तपासते आणि त्याचे प्रकाशित HTML किंवा hydrate करता येणारे editor HTML बनवते.

## प्रकाशित HTML render करा

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('The stored document could not be read.')
```

`renderStoredHtml()` JSON input तपासते व सामान्य करते, आणि नंतर प्रकाशित HTML परत करते. `null` म्हणजे सध्याची registry ते input वाचू शकत नाही. प्रकाशित पानावर package CSS आणि `.nabi-content` जोडा.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

परस्परसंवादी table sorting किंवा code highlighting साठीच ब्राउझरमध्ये `nabi-note/viewer` मधील `attachViewer()` जोडा. साध्या प्रकाशित मजकुरासाठी फक्त CSS पुरेसे आहे.

## आधी render केलेले editor markup hydrate करा

पहिल्या paint पासून संपादक दाखवण्यासाठी server वर `renderStoredEditorHtml()` ने render करा आणि browser surface ला `hydrate: true` द्या.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

server आणि browser यांनी तोच दस्तऐवज, त्याच क्रमातील wing declarations आणि HTML वर परिणाम करणारे options वापरले पाहिजेत. server output न बदलता content root चे थेट children म्हणून घाला आणि त्या root वर `contenteditable` आधी सेट करू नका. रचना वेगळी असल्यास surface नवीन editor HTML render करते.

## toolbar सुद्धा आधी render करा

`renderToolbarHtml()` आणि `renderViewToolsHtml()` server वर toolbar controls आधी render करू शकतात. registry, locale आणि group order जुळल्यावर browser मधील mounting ते controls जोडते. toolbar root मध्ये मनमानी host DOM समर्थित नाही.

SSR दरम्यान `injectSheets()` सारख्या browser APIs वापरू नका. तयार झालेल्या `nabi-note/nabi.css` file ला link करा किंवा ती तुमच्या CSS bundle मध्ये समाविष्ट करा.
