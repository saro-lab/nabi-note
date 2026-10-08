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

## Conectar un selector de imágenes

Use `panels.img` en `mountToolbar()` para sustituir el campo de URL predeterminado del botón de imagen por el selector de imágenes de su servicio. Las claves son nombres de slots de la barra de herramientas; las herramientas omitidas conservan sus cuadros predeterminados.

`mode: 'modal'` abre una ventana sobre un fondo translúcido que cubre toda la página. `mode: 'inline'` la abre cerca del botón de la herramienta en escritorio y a pantalla completa en móvil. El ancho de la ventana y `--nabi-mobile-breakpoint` determinan la vista móvil; si se cruza ese umbral mientras un panel `inline` está abierto, el panel se cierra.

Ambos modos proporcionan solo un `root` vacío, sin título, campos ni botones. Añada su HTML o interfaz en `render`, conecte el botón de cierre a `close()` y la selección de imágenes a `insertImage(url, 'pointer')`. Las entradas existentes en forma de función (`img: renderer`) conservan su comportamiento de visualización.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` es una función que debe implementar en su servicio. Crea la interfaz de forma síncrona dentro del `root` recibido y devuelve una función de limpieza. Conecte `signal` a tareas asíncronas como cargar una lista de imágenes o subir archivos, y pase la URL de la imagen elegida a `onSelect`. Esta API no transfiere archivos; siguen vigentes las reglas existentes para las URL de imágenes.

`insertImage(src, by?)` equivale a `run('insertImage', { src }, by)`, incluidos el valor de retorno y las reglas para restaurar la selección. Si se omite `by`, se usa `'keyboard'`. No defina `render` como una función `async`.

Cerrar el panel o desmontar la barra de herramientas cancela `signal` y llama a la función de limpieza. `run()` cierra el panel y aplica un comando una sola vez a la selección capturada al abrirlo. Si el panel ya está cerrado o el contenido del documento ha cambiado desde su apertura, devuelve `false` sin ejecutar el comando.

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
