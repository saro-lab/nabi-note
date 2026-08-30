---
title: YouTube
description: Incrusta un vídeo de YouTube en el documento y ajusta su anchura.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Pega una dirección de YouTube o usa el botón de YouTube para insertar un vídeo. El documento guarda solo el ID de 11 caracteres del vídeo y la anchura, no la URL completa, y un vídeo nuevo empieza centrado al 70% de anchura.

La anchura se elige en pasos fijos, y la alineación se guarda en el párrafo que envuelve el vídeo. En el editor, el primer clic selecciona el vídeo; una vez seleccionado, otro clic puede reproducirlo. Para cambiar la dirección, borra el vídeo e inserta uno nuevo.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## Estilos CSS

Usa `.nabi-content iframe` para cambiar el borde o las esquinas del vídeo. No cambies la anchura ni la alineación guardadas.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

El paquete usa `aspect-ratio`, anchura y márgenes de alineación para mantener el vídeo con el tamaño correcto, así que no los sobrescribas.
