---
title: Imagen
description: Inserta una URL de imagen y ajusta su anchura y alineación.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Imagen

Inserta una URL de imagen y ajusta su anchura y alineación. De forma predeterminada, las direcciones se limitan a `http:`, `https:` o rutas del mismo sitio, y una imagen nueva empieza centrada al 60% de anchura.

La anchura se guarda solo en pasos fijos, y la alineación se guarda en el párrafo que envuelve la imagen. Para usar vistas previas `blob:` o `data:image/...`, permite explícitamente las URL locales tanto en el wing de imagen como al ensamblar el editor. Las URL de datos SVG no están permitidas.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Este wing inserta una dirección en el documento; no sube archivos. Para enviar archivos a un servidor, conecta el [wing de subida](/es/wing/etc/upload).

## Estilos CSS

Da estilo a las imágenes con `.nabi-content img`. Mantén intactas la anchura y la alineación guardadas, y cambia solo detalles visuales como bordes o sombras.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Mantén las reglas predeterminadas para `max-inline-size`, `block-size`, anchura y alineación. El tamaño de la imagen se guarda en el documento, así que forzar una anchura CSS fija puede entrar en conflicto con la anchura elegida por el autor.
