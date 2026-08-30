---
title: CDN 的使用方法
description: 不使用构建工具，连接浏览器版 NABI NOTE 的示例。
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# CDN 的使用方法

在不方便安装包的静态页面中，可以从 CDN 载入浏览器构建和 CSS。下面的 demo 会在站点构建时读取包版本，并通过全局 `NabiNote` 对象创建编辑器。

<CdnDemo />

## NABI NOTE 注意事项

- 部署代码中，请把 CSS 和浏览器 JavaScript 固定到同一个版本。像 `latest` 这样不写版本的 URL，可能会在新版本发布时改变行为。
- 浏览器 bundle 通过 `window.NabiNote` 暴露 root API。`nabi-note/ssr`、`nabi-note/viewer`、`nabi-note/diff` 不会作为单独的全局 bundle 提供。
- 本 demo 的文件保存和本地历史都在用户浏览器中运行。若要服务器保存或账号同步，请把 `getJson()` 输出发送到你的应用 API。
- 上传需要 `upload` wing、真实上传函数，以及必要的图片或链接 wing。上传服务器负责文件验证。
- 浏览器构建会在内部连接 HTML parser。`setHtml()`、打开 HTML 文件和粘贴 HTML 都不需要 parser 选项或私有 API。

CDN 载入只改变库的载入方式。存储格式和输入验证与 npm 包相同，也请参阅[基本用法](/zh/guide/getting-started)。
