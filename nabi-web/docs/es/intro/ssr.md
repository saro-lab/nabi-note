---
title: Soporte de SSR
description: Renderice de antemano en el servidor los documentos guardados, y reciba el editor y la barra de herramientas al instante con hydrate en el navegador.
---

# Soporte de SSR (renderizado en el servidor)

## Renderizar documentos guardados (pantallas de solo lectura)

Una pantalla que solo **muestra** un documento —una lista de comentarios o la vista de una publicación— no necesita crear una instancia del editor. Para renderizar un documento a HTML solo se necesita la lista de wings registrados (`registry`), así que existe una función de renderizado exclusiva para el servidor.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// Se crea una sola vez al arrancar el servidor y se reutiliza en varias solicitudes.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['una línea de comentario'] }]   // árbol de nabi leído de la base de datos

renderStoredHtml(saved, registry)        // '<p>una línea de comentario</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">una línea de comentario</p>'
```

**`nabi-note/ssr` es un punto de entrada ligero que solo contiene la lógica de renderizado principal.** No hace referencia a la superficie de edición (`surface`) ni a las herramientas de pantalla (`ui`), y pruebas unitarias a nivel de arquitectura garantizan que ningún código de DOM se filtre en el paquete del servidor. Si el entorno ya carga el paquete completo del editor, las mismas funciones también están disponibles desde el paquete `nabi-note`.

| Función | Descripción |
|---|---|
| `renderStoredHtml(json, registry, options?)` | HTML para guardar o publicar — el mismo valor que `getHtml()` del editor |
| `renderStoredEditorHtml(json, registry, options?)` | HTML para inicializar el editor — el mismo valor que `getEditorHtml()` (incluye `data-key`) |

- **No usa ninguna API de DOM.** Se ejecuta directamente en entornos de servidor como Node.js.
- **Devuelve `null` si no es un árbol de nabi válido.** Las reglas de validación son las mismas que las de `setJson()`. Nunca lanza una excepción: ante datos inválidos devuelve `null` y registra la causa con `console.error`.
- **Coincide exactamente con el resultado de una instancia del editor.** Como ambos pasan por el mismo proceso de normalización y ensamblaje, el filtrado de XSS se aplica de la misma manera.
- El parámetro `options` admite `{ allowLocalUrls?: boolean }`, con el mismo papel que esa misma opción en `createNabiWith`.

**Los mismos datos de árbol de nabi siempre producen el mismo `data-key`.** Por eso se puede prerrenderizar en el servidor el HTML inicial del editor con `renderStoredEditorHtml`, enviarlo al cliente y montarlo con la opción `hydrate: true`: el editor se activa al instante, sin volver a renderizar ni parpadear.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Aunque los resultados del renderizado del servidor y del cliente lleguen a diferir, el cliente vuelve a renderizar automáticamente de forma normal, así que solo hace falta mantener la misma lista de wings (`registry`) entre servidor y cliente.

::: tip La propia demo de inicio de este sitio funciona con hydratación SSR
El documento de la demo de inicio se **prerrenderiza en tiempo de compilación con `renderStoredEditorHtml`** y queda incrustado en el HTML; una vez que se carga el script del cliente, `hydrate` activa el editor sobre ese contenido. Por eso el texto del cuerpo ya es visible antes de que cargue el JS, sin que se produzca un desplazamiento de diseño (CLS).
:::

---

## Prerrenderizar la barra de herramientas

La estructura de botones de la barra de herramientas **no depende del contenido del documento.** Se genera únicamente a partir de la lista de wings registrados, el idioma de visualización (locale) y el orden de los grupos, por lo que el resultado es determinista. Puede renderizarse una sola vez al arrancar el servidor, guardarse en caché y reutilizarse en varias solicitudes.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'es' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Al incluir esta cadena de HTML dentro del contenedor de la barra de herramientas y enviarla al cliente, `mountToolbar` en el navegador reconoce el marcado existente y **solo conecta los listeners de eventos, sin volver a dibujarlo.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Escriba usted mismo `class="nabi-toolbar-row"` en el elemento contenedor
Al enviar una fila de la barra de herramientas prerrenderizada, el elemento de la fila debe llevar `class="nabi-toolbar-row"` **desde el primer dibujo.** Si falta, el núcleo la agrega automáticamente al montar, y el relleno que la acompaña se aplica justo en ese momento, provocando que **la fila de botones se desplace de golpe.**
:::

- **Es seguro incluso si la estructura no coincide.** Si el HTML entregado difiere de la lista de wings actual, el cliente lo vuelve a renderizar de inmediato en el mismo lugar, y la pantalla nunca queda rota.
- **Una fila prerrenderizada se renderiza en su estado por defecto** (nada presionado, nada oculto). El estado de presionado (`aria-pressed`) y la visibilidad según el contexto dependen de la posición del cursor, así que se sincronizan automáticamente en cuanto el cliente monta el componente.
- **Úsela solo en pantallas que incluyan un editor.** Una página de solo lectura no necesita barra de herramientas.

**Los botones de vista previa y pantalla completa se pueden prerrenderizar del mismo modo.** Como son componentes de herramientas de vista y no wings, se renderizan por separado con `renderViewToolsHtml`.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'es' })
// '<span class="nabi-tools">…</span>'
```

::: tip La barra de herramientas de la demo de inicio también está prerrenderizada
La barra de herramientas de la demo de inicio se **prerrenderiza en tiempo de compilación con `renderToolbarHtml` y `renderViewToolsHtml`** y queda incrustada en la página; `mountToolbar` y `mountViewTools` reconocen esa fila y solo conectan los eventos. Por eso nunca se ven decenas de iconos de la barra apareciendo tarde.
:::

---

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./usage) — instalación por npm y guía completa de uso del editor
- [{{ t('menu_intro_cdn') }}](./cdn) — usando una sola etiqueta `<script>`, sin herramientas de compilación

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
