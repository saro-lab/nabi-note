---
title: Enlace
description: Conecta direcciones web seguras y muestra adjuntos subidos.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Enlace

Selecciona texto y asígnale una dirección. Si introduces una dirección sin seleccionar texto, la propia dirección se inserta como texto del enlace. Escribir una dirección `http://` o `https://` y después pulsar Espacio o Enter también la convierte en enlace.

Los enlaces solo guardan `http:`, `https:` y rutas del mismo sitio que empiezan por `.` o `/`. Se rechazan direcciones cuyo origen no pueda identificarse claramente, como `javascript:` o `//example.com`. Los enlaces de adjuntos creados por subidas también guardan información de archivo y no pueden crearse manualmente como enlaces normales.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Pegar URL

Si todo el contenido pegado, sin los espacios en blanco que lo rodean, es una URL `http://` o `https://` válida, se inserta inmediatamente como enlace. Las URL dentro de frases, el texto con varias URL y las rutas relativas siguen el comportamiento de pegado existente. En los bloques de código y los editores sin el wing de enlaces, el contenido se mantiene como texto. Los datos internos válidos del portapapeles copiados desde el editor tienen prioridad para conservar su formato original.

Use el callback `onPasteUrl` de `mountSurface()` para elegir el texto visible del enlace.

| Argumento | Valor |
| --- | --- |
| `url` | La URL completa sin los espacios en blanco que la rodean |
| `isSameOrigin` | Si el protocolo, el host y el puerto de la URL coinciden con el origen del documento que contiene el editor |
| `path` | La ruta que empieza por `/`, incluida la consulta y el fragmento. Ejemplo: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Si se devuelve una cadena que no contiene únicamente espacios en blanco, se usa como texto visible. Si no hay callback, devuelve un valor vacío o que no es una cadena, o falla, la URL pegada permanece como texto visible. Las cadenas devueltas nunca se interpretan como HTML ni cambian la dirección del enlace.

El callback también admite funciones `async` y promesas. El enlace con la URL se inserta inmediatamente mientras se espera la respuesta; un resultado válido posterior solo cambia el texto visible de ese enlace. El resultado tardío se ignora si el enlace se ha editado o eliminado, se ha cargado un documento nuevo o se ha desmontado la superficie.

## Estilos CSS

Da estilo a los enlaces normales con `.nabi-content a`, y a los enlaces de adjunto por separado con `.nabi-content a[data-nabi-file]`.

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

Las partes `::before` y `::after` de los enlaces de adjunto se usan para mostrar el icono de archivo y la extensión, así que normalmente conviene no reemplazar ni quitar su `content`.
