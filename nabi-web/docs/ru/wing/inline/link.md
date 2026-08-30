---
title: Ссылка
description: Подключайте безопасные веб-адреса и показывайте загруженные вложения.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ссылка

Выделите текст и привяжите к нему адрес. Если ввести адрес без выделения текста, сам адрес вставляется как текст ссылки. Ввод адреса `http://` или `https://` с последующим нажатием Space или Enter тоже превращает его в ссылку.

Ссылки хранят только `http:`, `https:` и пути того же сайта, начинающиеся с `.` или `/`. Адреса, происхождение которых нельзя ясно определить, например `javascript:` или `//example.com`, отклоняются. Ссылки-вложения, созданные загрузками, также хранят сведения о файле и не могут быть созданы вручную как обычные ссылки.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS-стили

Стилизуйте обычные ссылки через `.nabi-content a`, а ссылки-вложения отдельно через `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Части `::before` и `::after` у ссылок-вложений используются для показа иконки файла и расширения, поэтому обычно лучше не заменять и не удалять их `content`.
