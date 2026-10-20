---
title: "Nota al pie"
description: "Conecta explicaciones adicionales con números en el texto y una lista al final del documento."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nota al pie

Conecta explicaciones adicionales con números en el texto y una lista al final del documento.

Introduce el contenido con el botón de nota al pie de la barra de herramientas para insertarla en el cursor. Si hay texto seleccionado, se inserta al final sin reemplazarlo. Los números no se almacenan; se asignan automáticamente según el orden del documento.

Pulsa un número del texto para editar su contenido en la fila de propiedades. Usa la herramienta de eliminación o pulsa dos veces Backspace o Delete junto a la nota para seleccionarla y después borrarla. La lista inferior es de solo lectura y desaparece cuando no hay notas.

En la vista previa y en las páginas publicadas con el viewer conectado, pasa el puntero sobre un número, haz clic o tócalo para leer el contenido. Solo se admite una línea de texto sin formato, que se muestra con una fuente sin serifa a 0,875 veces el tamaño base del cuerpo. El HTML se muestra literalmente.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
