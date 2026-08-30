---
title: AI 氛围编程
description: 帮助编码 agent 读取当前公开 API 和文档边界，从而准确使用 NABI NOTE。
---

# AI 氛围编程

NABI NOTE 为 AI 和自动化工具提供 [`llms.txt`](/llms.txt)。不要让 agent 猜测整个库，而是先从这个索引开始，只读取任务所需的文档。

## 起始 prompt

填入你需要的框架和功能。

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

如果 agent 无法打开 URL，请把 `llms.txt` 和相关链接文档直接放进对话中。

## 只指向需要的内容

`llms.txt` 是一个紧凑索引。通常，把相关页面交给 agent 比一次发送所有文档更有用。

- npm 组装: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN 设置: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- wing 选择: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- 保存的 JSON、HTML 和变更事件: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML 导入、粘贴和上传边界: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- 自定义 wing 和服务器渲染: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer、diff、样式和首字下沉: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- 准确的 import 和类型: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## 写明产品需求

agent 无法只看编辑画面就推断保存方式、安全策略或上传行为。请写明真实框架、包含和排除的 wing、是否保存 JSON 和 HTML、上传端点的请求与响应约定、文件限制，以及发布页面是否需要 SSR、viewer 行为或 diff。

尚未决定的事项，请先让 agent 说明各选项及其影响，再实现某个选择。

## 检查结果

像检查其他代码一样检查生成的代码。尤其要确认它：

- 为编辑和发布内容都加载 `nabi-note/nabi.css`；
- 对选中的 wing 和每个 mount 使用同一个 `registry`；
- 保存 `getJson()`，绝不保存 `getEditorHtml()`；
- 不直接写入编辑中的 `.nabi-content` 元素的 `innerHTML`；
- 画面关闭时 unmount 每个 mount；
- 在上传服务器验证 MIME 类型、大小、授权和存储位置；
- 在服务器和浏览器使用匹配的 wing 顺序，以及会影响 HTML 的选项；
- 通过类型检查、测试和构建确认实际 export 名称。

即使页面看起来成功运行过一次，也需要实际验证 IME 和光标行为，以及保存再读取的路径。移动端组合输入也要测试。

## 优先使用已安装版本

如果项目已经安装了 `nabi-note`，它的 `package.json` exports 和类型声明比另一个版本的网站更直接相关。请让 agent 在写代码前确认这个版本差异。
