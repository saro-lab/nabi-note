---
title: बुलेट सूची
description: अनेक घटक क्रमाशिवाय मांडते.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# बुलेट सूची

अनेक घटक क्रमाशिवाय मांडणारी ही सूची आहे. रिकाम्या परिच्छेदात `-` नंतर Space दाबा किंवा साधनपट्टीतून निवडा. निवडलेले परिच्छेदही एकाच वेळी सूचीमध्ये बदलता येतात.

सूचीमध्ये Tab दाबल्यावर एक पातळी आत सरकते आणि Shift+Tab दाबल्यावर बाहेर येते. Enter दाबल्यावर पुढील घटक तयार होतो; रिकाम्या घटकावर पुन्हा Enter दाबल्यास सूची संपते.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
