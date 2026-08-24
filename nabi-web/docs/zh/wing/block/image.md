---
title: 图片
---

# 图片

## 说明

`imageWing`（名字 `img`）拥有图片元素（`<img>`）。和 `hr`·`youtube` 一样是**没有内容
的 `place: 'void'` 物件**。点一下工具栏按钮，就会弹出图片地址输入框。

**地址是靠协议来验证的，不是靠扩展名。** 只放行 `http:`·`https:` 和相对路径——
`javascript:` 之类的恶意脚本和协议相对地址（`//example.com/a.png`）都会被过滤掉。
不带扩展名却能返回图片的动态 API 地址，也能正常支持。

光标进不到图片里面去，所以点一下图片，那张图就整个被选中，专用的上下文工具栏
跟着出现：

| 控件 | 说明 |
|---|---|
| 宽度调整 | 一根滑块，在 `30%` 到 `100%` 之间以 10% 为单位调整宽度（默认 `60%`） |
| 放大查看（灯箱） | 把图片放大到原始尺寸，用弹窗模态展示 |

图片的左/中/右对齐，是加在包着它的**包装段落（`<div data-nabi-p>`）**上的属性，
所以用主工具栏的对齐按钮就能对齐它。

新插入的图片默认是居中对齐（`data-nabi-align="c"`）。

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

存出去的是语义属性，没有内联 `style`——实际的尺寸和对齐样式由 `nabi.css` 渲染。

### 允许本地地址（`allowLocalUrls`）

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

设置 `allowLocalUrls: true` 后，`blob:`、`data:image/...` 这类本地地址也会被
放行——可以用在文件上传前先做本地预览之类的场景（默认 `false`）。

如果图片地址无效，或者 blob 地址已经过期导致加载失败，翅膀的 `attach` 钩子会
自动显示一个破损图片的占位符。不用额外配置 mount 就能用,而且这只是画面上的
UI，不会影响保存下来的数据。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

想放行 `blob:` 地址，就用工厂函数：

```ts
makeImageWing({ allowLocalUrls: true })
```

## 演示

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
