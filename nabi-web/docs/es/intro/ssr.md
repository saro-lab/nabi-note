---
title: Soporte de SSR
description: Dibuje el valor guardado en el servidor de antemano, y reciba el editor y la barra de herramientas con `hydrate`.
---

# Soporte de SSR

## Solo dibujar el valor guardado — sin levantar el editor

Un lugar que solo **muestra** el documento, como una lista de comentarios, no necesita un
editor. Lo único que hace falta para dibujar el documento es la lista de wings
registrados (`registry`), así que existe una puerta aparte que solo recibe eso.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// una vez, cuando arranca el servidor — todos los valores guardados comparten esta misma lista
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['una línea de comentario'] }]   // árbol de nabi leído de la base de datos

renderStoredHtml(saved, registry)        // '<p>una línea de comentario</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">una línea de comentario</p>'
```

**`nabi-note/ssr` es el punto de entrada que solo trae lo necesario para dibujar.** No
carga ni un solo archivo de la superficie de edición (`surface`) ni de las herramientas
de pantalla (`ui`) — una red lo garantiza — así que no se mezcla código con DOM en el
paquete de servidor. La misma puerta también está en `nabi-note`, así que una página que
ya carga el editor puede seguir usando esa.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | El HTML que se guarda o se publica — el mismo valor que `getHtml()` |
| `renderStoredEditorHtml(json, registry, options?)` | HTML del editor — el mismo valor que `getEditorHtml()` (lleva `data-key`) |

- **Ninguna de las dos usa DOM** — corren igual en el servidor.
- **Si no es un árbol de nabi, es `null`** — la regla de rechazo es la misma que en
  `setJson()` (el documento entero debe ser un arreglo). No lanzan excepción.
- **No difieren ni un carácter del valor que produce el editor.** Como pasan por los
  mismos pasos (normalización → ensamblaje), el filtrado de XSS ocurre en el mismo
  lugar — el lado que solo muestra no queda menos protegido.
- `options` es solo `{ allowLocalUrls }` — el mismo sentido que esa opción en
  `createNabiWith`.

**El mismo valor guardado siempre obtiene la misma `data-key`.** Así, si el servidor
dibuja de antemano el editor con `renderStoredEditorHtml` y lo recibe en el navegador con
`hydrate`, la pantalla no se vuelve a dibujar.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

Si no coinciden, se dibuja de nuevo en el acto, así que solo hace falta que el servidor y
el cliente compartan la misma lista de wings.

::: tip La demo de inicio de este sitio es ese mismo ejemplo
El documento de la demo de inicio se dibuja de antemano **en el momento de compilar, con
`renderStoredEditorHtml`**, y queda incrustado en la página; el editor despierta encima
con `hydrate`. Por eso el texto ya se puede leer antes de que llegue el código del
editor — no hay un tramo donde el lugar esté vacío y de pronto se llene.
:::

---

## También se puede dibujar de antemano la barra de herramientas

La fila de botones **no mira el documento.** Solo depende de la lista de wings
registrados, los textos y el orden de los grupos, así que lo que produce es una
**constante** — se llama una vez cuando arranca el servidor y ese texto se reutiliza. No
hace falta volver a llamarla en cada petición.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'es' })
// '<div class="nabi-group" data-group="font">…</div>'
```

Si este texto se envía tal cual dentro del recipiente de la barra, en el navegador
`mountToolbar` lo dibuja con **la misma función.** Si ya hay una fila igual en pie, **no
la vuelve a dibujar, solo conecta el cableado.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning Ponga `class="nabi-toolbar-row"` en el recipiente también
Al enviar la fila dibujada de antemano, esta clase debe estar **desde el primer dibujo.**
Si no está, el núcleo la agrega por su cuenta al montar, y entonces los márgenes
laterales se agregan en ese momento y **la fila de botones se corre de golpe.** Si el
host ya la escribió de antemano, el núcleo no la toca (solo retira la que él mismo puso).

```html
<div class="nabi-toolbar-row">fila dibujada de antemano</div>
```
:::

- **No se rompe si no coincide** — si la fila que está en pie es distinta de la lista de
  wings actual, se dibuja de nuevo en el acto. Lo único que se pierde es el valor
  prerrenderizado, y la pantalla siempre queda correcta.
- **La fila prerrenderizada empieza en un estado "nada presionado, nada oculto".** Lo
  presionado (`aria-pressed`) y lo oculto los decide el cursor, y el servidor no lo sabe.
  Si la configuración esconde botones según el cursor, algunos pueden desaparecer justo
  después del montaje y la fila se puede volver a acomodar.
- **Úselo solo donde se levanta el editor.** Una página de solo lectura no tiene barra de
  herramientas, así que no hay razón para recibir este texto.

**Los dos botones de vista previa y pantalla completa siguen la misma vía.** Como no son
wings sino piezas de la superposición, no entran en el texto de la barra de arriba — se
dibujan aparte y se colocan en el recipiente donde se para `mountViewTools`.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'es' })
// '<span class="nabi-tools">…</span>'
```

::: tip La demo de inicio de este sitio es ese mismo ejemplo
La barra de herramientas de la demo de inicio se dibuja de antemano **en el momento de
compilar, con `renderToolbarHtml` y `renderViewToolsHtml`**, y queda incrustada;
`mountToolbar` y `mountViewTools` reconocen esa fila y solo conectan el cableado. Por eso
no hay un tramo donde los treinta y cinco iconos aparezcan tarde.
:::

---

## Próximos documentos

- [{{ t('menu_intro_usage') }}](./usage) — la vía de npm, ensamblaje y entradas/salidas
- [{{ t('menu_intro_cdn') }}](./cdn) — con un solo `<script>`, sin herramientas de compilación

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
