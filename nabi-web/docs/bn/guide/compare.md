---
title: তুলনা
description: দুটি নথি পাশাপাশি তুলনা করে নির্বাচিত পুরোনো বিষয়বস্তু বর্তমান নথিতে প্রয়োগ করুন।
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# তুলনা

দুটি সংরক্ষিত নথি পাশাপাশি রেখে পরিবর্তন দেখুন। সম্পাদক ছাড়াই তুলনা খোলে; callback যুক্ত করে নির্বাচিত পুরোনো বিষয়বস্তু বর্তমান নথিতে প্রয়োগ করুন।

## নির্বাচিত পুরোনো বিষয়বস্তু প্রয়োগ

বামে পুরোনো, ডানে বর্তমান নথি। পরিবর্তনের পাশের **&gt;&gt;** চাপলে সংশ্লিষ্ট অনুচ্ছেদ বা লাইনগুচ্ছের পুরোনো বিষয়বস্তু প্রয়োগ হয়। অক্ষর ধরে নির্বাচন নয়। মুছে যাওয়া বিষয়বস্তু ফেরানো বা নতুন যোগ করা বিষয়বস্তু সরানোও যায়।

নিচে শুধু সভার সময় বা আনার জিনিস ফিরিয়ে দেখুন। **callback-এ হালনাগাদ বর্তমান নথি** খুলে ফল দেখুন। **আবার শুরু করুন** মূল উদাহরণ ফেরায়।

<CompareDemo />

## স্বতন্ত্র তুলনা দৃশ্য

`nabi-note/diff` থেকে আমদানি করুন। `before` ও `after`-এ সংরক্ষিত NABI TREE JSON বা HTML স্ট্রিং দিন। টেবিল, তালিকা, ছবি ইত্যাদি সম্পূর্ণ পড়তে ও দেখাতে মূল সম্পাদকের একই wing দিয়ে registry গড়ুন।

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
  locale: 'bn',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

সাধারণত পরিবর্তন ও আশপাশের প্রসঙ্গ দেখা যায়। ভাঁজ বোতামে সম্পূর্ণ নথি খুলুন; আগের/পরের বোতামে পরিবর্তনে যান। পরিবর্তন না থাকলে পুরো নথি দেখা যায়। `onMerge` বাদ দিলে শুধু পড়া যায়।

## callback দিয়ে ক্লিক মার্জ যুক্ত করা

ক্লিক করলে প্রস্তাবিত ফল `onMerge`-এ যায়। শুধু callback যুক্ত করলেই নথি নিজে সংরক্ষিত হয় না। সেবা প্রস্তাব গ্রহণ করে `update()` ডাকলে তুলনাও বদলায়।

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'bn',
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

`proposal.result` শুধু নির্বাচিত পরিবর্তন প্রয়োগ করা NABI TREE JSON। `before` ও `after` ক্লিকের সময়কার নথি; `changeId` পরিবর্তন এবং `revision` তুলনার অবস্থা চিহ্নিত করে। এই `revision` `update()`-এর তৃতীয় আর্গুমেন্টে দিন: তুলনা ইতিমধ্যে বদলালে `false` ফেরে, প্রস্তাব প্রয়োগ হয় না।

অ্যাসিঙ্ক callback-এর অপেক্ষায় পুনরায় ক্লিক আটকানো হয়। অন্য নথি দিয়ে হালনাগাদ বা দৃশ্য সরালে `signal` বাতিল হয়। সার্ভারে সংরক্ষণে সংকেত ও সার্ভার নথির সংস্করণ দেখুন, যাতে পুরোনো ফল নতুন নথি না মুছে দেয়।

## সম্পাদক থেকে তুলনা খোলা

টুলবার থেকে খুলতে `diff` wing ও `mountDiffWing()` যুক্ত করুন। ভিত্তি সর্বশেষ লোড করা নথি। সাধারণ সম্পাদনা বা পূর্বাবস্থা ভিত্তি বদলায় না।

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'bn',
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

`merge: true` দিলে নির্বাচিত পুরোনো বিষয়বস্তু সম্পাদকে প্রয়োগ হয়। এটি পূর্বাবস্থায় নেওয়া যায়, ভিত্তি থাকে। দৃশ্য খোলা অবস্থায় মূল সম্পাদক বদলালে তুলনা আবার গণনা হয়। `merge` বাদ দিলে শুধু পড়ার দৃশ্য থাকে।

দৃশ্য সরাতে `toolbar.unmount()` ও `comparison.unmount()` ডাকুন। সম্পাদনার শুরুর সংস্করণসহ দুই দিকের পরিবর্তন স্বয়ংক্রিয় মেলাতে [মার্জ](./merge) ব্যবহার করুন।
