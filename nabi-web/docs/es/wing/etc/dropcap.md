---
title: Letra capitular
description: Inicia el texto del cuerpo con una primera letra grande.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Letra capitular

Coloca la primera letra de un párrafo en un tamaño mayor y deja que las líneas siguientes fluyan a su lado. Es formato de nivel de párrafo, así que no se aplica solo a una parte de una palabra seleccionada.

La vista publicada y la vista de edición conservan la misma forma. Mientras se edita, la primera letra se envuelve en un elemento real para que no se desplacen las posiciones del cursor y de borrado; ese elemento no se incluye en el contenido guardado del documento.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Estilos CSS

La vista publicada y la vista de edición usan selectores distintos para la primera letra. La vista publicada usa `[data-nabi-dropcap="1"]::first-letter`, mientras que la vista de edición usa el elemento real `[data-nabi-dropcap-letter]`. Cuando cambies valores visibles como color, fuente o tamaño, escribe ambos selectores juntos para que la edición y la salida publicada se vean igual.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Si cambias tamaño y altura de línea, aplica los mismos valores a ambos selectores.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Las letras capitulares calculan el flujo de líneas alrededor de la primera letra, así que cambiar solo un lado o usar valores demasiado grandes puede romper la forma WYSIWYG. Aun así, evita añadir una regla `::first-letter` nueva al editor. En el editor, da estilo solo al `[data-nabi-dropcap-letter]` existente.
