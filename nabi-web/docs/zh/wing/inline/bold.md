---
title: 加粗
---

# 加粗

## 说明

`boldWing` 是处理加粗格式(`<b>`)的行内标记翅膀。选中文字后按下工具栏的 **B**，或者用提示模式(连按两次 Shift 后按 `B`)，或者用快捷键(`Ctrl`/`⌘`+`B`)施加。

- 输入 HTML 时 `<b>` 和 `<strong>` 都能识别，输出时统一转换成标准的 `<b>` 标签。
- 选中文字后执行是切换方式——已经是加粗就取消，否则就施加。
- 没有选中文字、只有光标时按下快捷键，会把加粗预约给接下来输入的文字。
- 不注册这只翅膀，`<b>` 标签会被自动去掉，只留下里面的纯文本。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
