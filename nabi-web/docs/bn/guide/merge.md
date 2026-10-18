---
title: মার্জ
description: সম্পাদনার শুরুর, নিজের ও এর মধ্যে সংরক্ষিত সংস্করণ মেলান, তারপর বাকি দ্বন্দ্ব সম্পাদনা করে মেটান।
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# মার্জ

আপনার সম্পাদনার সময় অন্য পরিবর্তন সংরক্ষিত হলে শুরুর সংস্করণ ধরে দুই দিক মেলান। স্বয়ংক্রিয় মেলানো যায় এমন সব পরিবর্তন শুরুতেই প্রয়োগ হয়; শুধু ওভারল্যাপ দ্বন্দ্ব থাকে। এটি `nabi-note/merge`-এর স্বতন্ত্র দৃশ্য, wing নয়।

| বাম | মাঝখান | ডান |
| --- | --- | --- |
| সম্পাদনা শুরুর সংস্করণ | স্বয়ংক্রিয় মার্জের পর নিজের বর্তমান নথি | আপনার সম্পাদনার সময় সংরক্ষিত সংস্করণ |
| শুধু পড়া | সরাসরি সম্পাদনাযোগ্য | শুধু পড়া |

মাঝখানে সাধারণ সম্পাদকের মতো লেখা, বিন্যাস, টেবিল, তালিকা ও ছবি বদলান। দেওয়া wing সুবিধা নির্ধারণ করে। দ্বন্দ্বের চিহ্ন ও মীমাংসার অবস্থা সংরক্ষিত লেখায় মেশে না।

## সম্পূর্ণ স্বয়ংক্রিয় মার্জের উদাহরণ

আপনি সভার সময় **সকাল ১১টা**, অন্যজন স্থান **তৃতীয় তলার সভাকক্ষ** করেছেন। ভিন্ন অনুচ্ছেদের পরিবর্তন বলে মাঝের ফলে দুটিই আসে।

দ্বন্দ্ব নেই, তাই সরাসরি **নিশ্চিত করুন** চাপুন বা আগে মাঝের লেখা পরিমার্জন করুন। নিচের চূড়ান্ত নথি নিশ্চিতকরণ callback-এর পাওয়া প্রকৃত ফল।

<MergeDemo />

## আংশিক স্বয়ংক্রিয় মার্জের উদাহরণ

এবার আপনি সময় **সকাল ১১টা**, অন্যজন **দুপুর ২টা** করেছেন। একই অনুচ্ছেদের আলাদা পরিবর্তনে সময় দ্বন্দ্ব থাকে। দায়িত্বে **জিমিন ও সইয়ন** এবং স্থান **তৃতীয় তলার সভাকক্ষ** করার পরিবর্তন নিজে প্রয়োগ হয়।

দ্বন্দ্ব এভাবে মেটান:

- বাম **&gt;&gt;**: শুরুর সংস্করণের সংশ্লিষ্ট বিষয়বস্তু নিন।
- ডান **&lt;&lt;**: সদ্য সংরক্ষিত সংস্করণের সংশ্লিষ্ট বিষয়বস্তু নিন।
- **বর্তমান বিষয়বস্তু দিয়ে সমাধান করুন**: মাঝের বিষয় রাখুন বা সম্পাদনা করে মীমাংসিত চিহ্ন দিন।

মাঝের সময়ের বাক্য বদলে **বর্তমান বিষয়বস্তু দিয়ে সমাধান করুন** চাপুন। সব দ্বন্দ্ব মিটলেই নিশ্চিত করা যায়।

<MergeDemo partial />

মীমাংসিত অংশ আবার সম্পাদনায় তার অবস্থা থাকে। সমাধান পূর্বাবস্থায় নিলে অবস্থাও ফেরে; পুনরায় করলে পুনরুদ্ধার হয়। শুধু লেখা মুছে বা বদলে খোলা দ্বন্দ্ব নিজে মেটে না।

## স্বয়ংক্রিয় মার্জ ও দ্বন্দ্বের নিয়ম

শুরুর নথি থেকে নিজের নথি এবং একই শুরু থেকে নতুন সংস্করণের পরিবর্তন তুলনা হয়। একদিকের ও দুই দিকের একই পরিবর্তন নিজে প্রয়োগ হয়। ভিন্ন অনুচ্ছেদ বা লাইনের পরিবর্তনও মেলে।

Git-এর টেক্সট মার্জের মতো অনুচ্ছেদ ও লাইন ধরে ওভারল্যাপ বিচার হয়। একই লাইনের ভিন্ন শব্দ বদলালেও দ্বন্দ্ব থাকে। একই স্থানে ভিন্ন সন্নিবেশ বা অন্যদিকের মোছা বিষয় সম্পাদনাতেও সিদ্ধান্ত দরকার।

টেবিল, তালিকা বা float-এর মতো কাঠামোবদ্ধ ব্লক দুইদিকে ভিন্ন বদলালে পুরো কাঠামো দ্বন্দ্ব। সেল বা তালিকার আইটেম ইচ্ছামতো মেশে না; বিষয় বাছুন বা মাঝখানে সম্পাদনা করুন। সরানো ও সম্পাদনা মিলে অবস্থান অনিশ্চিত হলেও নিজে প্রয়োগ হয় না।

## স্বতন্ত্র মার্জ দৃশ্য যুক্ত করা

`base`, `local`, `incoming`-এ সংরক্ষিত NABI TREE JSON বা HTML স্ট্রিং দিন। মূল সম্পাদকের wing ও বিকল্প ব্যবহার করুন। `mountMerge()` মাঝের সম্পাদক, টুলবার, দুই উৎস, দ্বন্দ্ব নির্বাচন ও নিশ্চিত বোতাম তৈরি করে।

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'bn',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` সম্পূর্ণ মীমাংসিত বর্তমান ফলের JSON, প্রকাশের HTML, সম্পাদনা revision ও `incomingVersion` পায়। `false` দিলে নিশ্চিতকরণ শেষ হয় না। Promise অপেক্ষমাণ থাকলে সম্পাদনা, দ্বন্দ্ব নির্বাচন ও পুনরায় নিশ্চিতকরণ বন্ধ থাকে। দৃশ্য সরালে ফলের `signal` বাতিল হয়। কোরীয় IME কম্পোজিশন শেষ হলে নিশ্চিত করা যায়।

ছবি বাছাই বা আপলোডের মতো সেবার কাজ সাধারণ সম্পাদকের মতো যুক্ত করুন। `toolbarOptions`-এ প্যানেল ও হোস্ট কাজ, `surfaceOptions`-এ সম্পাদনা পৃষ্ঠের বিকল্প দিন।

`incomingVersion` সেবার দেওয়া মান অপরিবর্তিত ফেরায়। সংরক্ষণে সেবা তা সার্ভারের সর্বশেষ সংস্করণের সঙ্গে মিলাবে। মার্জ চলাকালে আরেক সংস্করণ সংরক্ষিত হলে পুরোনো ফল চাপাবেন না; নতুন নথি এনে নতুন মার্জ শুরু করুন।

দৃশ্যের বাইরে থেকেও অবস্থা পড়া বা নিশ্চিতকরণ ডাকা যায়।

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

`merge.nabi.getJson()` ও `merge.nabi.getHtml()` দিয়ে ফল পড়ুন। সম্পাদনার DOM বা `getEditorHtml()` সংরক্ষণ করবেন না। দুই সংস্করণের শুধু নির্বাচিত পুরোনো বিষয় নিতে [তুলনা](./compare)-র ক্লিক মার্জ নিন।

## আপলোড শেষে নিশ্চিত করা

ফাইল বোতাম, পেস্ট ও টেনে ছাড়ার জন্য `upload` wing ও `mountUpload()` যুক্ত করুন। `sendUpload` ফাইল সার্ভারে পাঠিয়ে `{ uri }` ফেরায়। সম্পূর্ণ সংযোগ ও অগ্রগতির উদাহরণ [ফাইল আপলোড](../wing/etc/upload)-এ দেখুন।

নথিতে এখনও না আসা আপলোডের মতো অ্যাসিঙ্ক কাজে `merge.session.hold()` দিয়ে নিশ্চিতকরণ ও দ্বন্দ্ব নির্বাচন থামান। শেষ, বাতিল বা দৃশ্য সরানোর সময় ফেরত ফাংশন ডাকুন। **নথিতে ঢোকানোর পরে** থামানো ছাড়ুন, সার্ভারে ওঠামাত্র নয়, যাতে ফাইল চূড়ান্ত ফলে থাকে।

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'bn',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'bn',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` মাঝের সম্পাদনার DOM; `merge.surface` ও `merge.toolbar` আগেই যুক্ত। একই জায়গায় আরেক পৃষ্ঠ বা টুলবার বানাবেন না। আগে অতিরিক্ত আপলোড ও অগ্রগতির mount সরান, শেষে `merge.unmount()` ডাকুন।
