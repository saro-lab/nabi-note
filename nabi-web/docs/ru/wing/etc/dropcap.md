---
title: Буквица
description: Начинает абзац с крупной первой буквы.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Буквица

Увеличивает первую букву абзаца, а остальные строки обтекают её. Это форматирование всего абзаца, поэтому его нельзя применить только к части выбранного текста.

На опубликованной странице и в редакторе сохраняется одинаковый вид. Во время редактирования первая буква оборачивается в реальный элемент, чтобы каретка и позиция удаления не смещались; этот элемент не входит в сохраняемое содержимое документа.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS-стили

Опубликованная страница и редактор различаются только селектором первой буквы. На опубликованной странице используется `[data-nabi-dropcap="1"]::first-letter`, а в редакторе — реальный элемент `[data-nabi-dropcap-letter]`. При изменении видимых свойств, таких как цвет, шрифт и размер, всегда указывайте оба селектора, чтобы редактор и опубликованный вид совпадали.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Если нужно изменить размер и высоту строки, применяйте одинаковые значения к обоим селекторам.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Буквица влияет на расчёт обтекания строк вокруг первой буквы, поэтому изменение только одной стороны или чрезмерный размер могут нарушить WYSIWYG. Не добавляйте новый `::first-letter` в редакторе: оформляйте уже существующий `[data-nabi-dropcap-letter]`.
