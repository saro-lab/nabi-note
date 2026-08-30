---
title: तपशील
description: सारांश आणि body एकत्र करा व ते उघडे सुरू होते का ते साठवा.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# तपशील

लहान सारांश आणि body एका block मध्ये एकत्र करा. toolbar मधून तयार केल्यावर प्रथम सारांश भरा आणि त्याखाली content लिहा.

त्रिकोणाने सेट केलेली open state document मध्ये साठवली जाते आणि प्रकाशित दृश्यात प्रारंभिक state होते. editing करताना body बदलता यावा म्हणून तो उघडाच ठेवला जातो, पण साठवलेले state value जपले जाते.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS शैली

details block ला `.nabi-content details` ने, आणि title ला `.nabi-content details > summary` ने style करा.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` attribute म्हणजे लेखकाने साठवलेली प्रारंभिक open state. CSS या state ला style करू शकते, पण state स्वतः सक्तीने बदलू नये.
