---
title: Encabezado
description: Convierte un párrafo en encabezado y elige su nivel.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Encabezado

Convierte un párrafo en encabezado y elige su nivel. Activa el encabezado en la barra y elige de H1 a H6, o escribe de `#` a `######` seguido de Space en un párrafo vacío.

El encabezado es un atributo guardado en el párrafo, no un tipo de bloque independiente. Al volver a pulsar el encabezado, regresas a un párrafo normal, por lo que puedes cambiar el nivel sin alterar la estructura del contenido.

En las celdas normales puedes convertir los párrafos internos en encabezados. No se aplican encabezados a las celdas de cabecera y, al convertir una celda en cabecera, se elimina cualquier formato de encabezado existente. Si seleccionas varios párrafos, la barra muestra un único valor activo solo cuando todos tienen el mismo nivel de encabezado.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
