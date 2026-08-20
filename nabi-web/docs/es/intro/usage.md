---
title: Uso básico
description: Se instala desde npm, se levanta un objeto nabi y el documento se mueve por cuatro entradas y tres salidas.
---

# Uso básico

Esta es la vía para instalar desde npm. La vía de un solo `<script>` está en
[{{ t('menu_intro_cdn') }}](./cdn).

```sh
npm i nabi-note
```

---

## Se van uniendo las piezas

El host construye el lugar y va pegando los `mount` uno por uno. Abajo está la
configuración mínima, y los ejemplos que aparecen en cada documento de wing son todos
este mismo esqueleto con uno o dos wings añadidos.

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// la lista de wings arma juntos el conocimiento de tipo, los comandos y el ensamblador — eso es `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'es' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'es' })
mountSticky({ root: app, surface })

// cada vez que cambia el valor — aquí se cuelga el propio código
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

El host construye el lugar y **el núcleo sabe cómo se ve ese lugar** — el `mount` pega
por sí mismo `.nabi-toolbar-row`, `.nabi-context` y `.nabi-editing` en su propio
recipiente, y también levanta solo su caja de herramientas. Eso significa que el host no
tiene que diseñar la disposición, y por eso el marcado de arriba solo lleva tres clases.

- **`class="nabi"`** — dentro de esta clase viven los tokens de color y la hoja de
  estilos. También es la caja que la pantalla completa fija entera, así que la barra de
  herramientas y el área de edición deben estar **juntas** dentro de ella.
- **`class="nabi-toolbar"`** — junta en un solo bloque la fila de herramientas y la
  contextual para que queden **pegadas arriba (sticky)**. Si se pegan por separado, al
  aparecer la barra contextual el texto se corre y la pantalla tiembla.
- **`class="nabi-content" contenteditable`** — es el área de edición misma.

Si el sitio tiene una barra fija arriba, bájelo esa misma cantidad con
`--nabi-sticky-top`, y si conecta `mountSticky()`, el núcleo mide cuánto empujó el
teclado móvil a la pantalla y lo compensa.

**La hoja de estilos la conecta el host.** Con un bundler basta con
`import 'nabi-note/nabi.css'`, y si solo quiere incluir la de los wings registrados,
llame a `injectSheets(document, collectSheets(registry))`. **Si la página se dibuja de
antemano en el servidor, use la vía del archivo** — la inyección solo se conecta después
de que llega el JavaScript del editor, así que mientras tanto el documento se dibuja una
vez sin estilos.

**Ese mismo idioma también decide la dirección del texto.** Si se da árabe (`ar`) o urdu
(`ur`), la raíz de ese `mount` recibe `dir="rtl"` y el texto queda de derecha a
izquierda — esto ocurre aunque la página no diga nada con `<html dir>`. **Si no se da
`locale`, no se toca nada:** no se sobrescribe la dirección que el host ya controla por
su cuenta. Qué idioma va en qué dirección lo responde `localeDirection(code)`.

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // el área de edición queda en RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // la barra de herramientas también se refleja
```

El idioma que se muestra se fija por `mount` con `locale` — el texto del documento no
cambia, solo cambian los nombres de la barra de herramientas y la contextual. **El host
solo necesita declarar el idioma una vez** — si lo pone en un solo objeto (`shared`) como
en el ejemplo de arriba y se lo pasa a los `mount`, la barra de herramientas, al
levantarse, también conecta su `locale` al núcleo (`nabi.$bindLocale`), así que lo que
dice el núcleo (los toast, etc.) también sale en el mismo idioma. Un lugar que usa el
editor sin barra de herramientas lo da con el `locale` de la opción de `createNabiWith`.
Para dibujar un selector, use `LOCALES` (la lista de códigos) que exporta el paquete.

| Ensamblaje | Obligatorio | Qué hace |
|---|---|---|
| `createNabiWith(wings, options?)` | Sí | Devuelve `{ nabi, registry }`. No necesita DOM. También acepta el arreglo de wings o el constructor de selección (`wings()`, vea [{{ t('menu_intro_cdn') }}](./cdn#elegir-wings)) |
| `mountSurface({ nabi, registry, root })` | Sí | Ajusta cursor, IME y entrada al árbol de nabi. También conecta el `attach` de los wings registrados |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | No | La barra de herramientas principal. Sin ella se puede editar igual con `applyCommand()` |
| `mountContextToolbar({ nabi, registry, root, surface? })` | No | Barra contextual según el lugar del cursor (fila/columna de tabla, lenguaje de código, dirección/nombre de enlace, etc.) |
| `mountHints({ toolbar, context?, root, surface? })` | No | La insignia de atajos que aparece al pulsar Shift dos veces seguidas |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | No | Los botones de vista previa y pantalla completa. `root` es la caja `.nabi` que fija la pantalla completa, y `onBody` es el gancho para conectar el runtime del lado de lectura al cuerpo de la vista previa (ver abajo) |
| `mountSticky({ root, surface })` | No | Compensa la barra pegada por lo que el teclado móvil empujó la pantalla |
| `mountPickedMark({ nabi, surface })` | No | La marca al seleccionar una imagen o un video (el navegador no la dibuja solo) |
| `mountFile({ nabi, store, name? })` | Al usar save·open | Guardar y abrir como archivo `.nabi` |
| `mountLocalHistory({ nabi, storage })` | Al usar localHistory | Registro en el navegador a intervalos fijos. Se levanta también cuando `storage` es `null` (un lugar bloqueado como `file://`) — así puede avisar por toast por qué el botón no funciona |
| `mountUpload({ … })` + `mountUploadView({ … })` | Al usar upload | El progreso de subida por arrastre, pegado o selección de archivo, y su indicador |

**Arrastrar una celda de tabla, alternar una casilla, colorear código o seleccionar una
imagen no necesitan un `mount` aparte** — todos los trae el wing con `attach`, y
`mountSurface` los conecta junto con el resto. Para el coloreado de código solo hace
falta enchufar quién colorea
(`makeCodeAttach`, vea [{{ t('menu_wing_code') }}](../wing/block/code)).

### Se conecta el runtime del lado de lectura a la vista previa

La vista previa es HTML estático que solo conecta `getHtml()` tal cual, así que lo que
hace **JavaScript del lado de lectura** — como ordenar tablas o colorear código — no se
conecta solo. `attachViewer` de `nabi-note/viewer` conecta todo eso con una sola llamada,
y en la vista previa el gancho `onBody` es el lugar donde se conecta — así se cambia la
línea de `mountViewTools` de la configuración mínima de arriba.

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'es',
  onBody: (body) => attachViewer(body, { locale: 'es' }),
})
```

`onBody` se llama cuando se levanta el cuerpo de la vista previa, y la función que se
devuelve como respuesta se llama cuando se retira la superposición. A la página
publicada se le conecta **la misma línea** (`attachViewer`) — como la vista previa debe
verse igual que la página publicada, conectar la misma puerta en ambas es el punto de
este gancho. Los detalles están en
[{{ t('menu_intro_cdn') }} ▸ Lado de solo lectura](./cdn#lado-de-solo-lectura).

El coloreado de código responde por defecto con el tokenizador integrado (cero
dependencias). Un host que use un resaltador como Shiki pasa el mismo gancho con
`attachViewer(body, { locale, highlight })` — si es el mismo que se pasó a
`makeCodeAttach({ highlight })`, los colores de la pantalla de edición y de la pantalla
de lectura no se distinguen.

Para cambiar los wings hay que retirar toda esta pieza (`unmount()`) y volver a
construirla — el marcado que sostenía el wing quitado cae ahí mismo a texto plano. La
demo de este sitio funciona exactamente así — al apagar y encender un chip de wing, el
ensamblaje entero se vuelve a crear.

Las variables CSS de color y aspecto están en
[{{ t('menu_style_custom') }}](../style/custom).

---

## Las tres formas de sacar el documento

```ts
nabi.getHtml()        // el HTML que se guarda o se publica
nabi.getJson()        // el árbol de nabi (JSON)
nabi.getEditorHtml()  // el HTML de la pantalla del editor tal como está ahora (lleva data-key)
```

**El valor que se guarda es uno de los dos primeros.** `getEditorHtml()` lleva una marca
exclusiva de pantalla (`data-key`) y no es el valor que se exporta — es el lugar que se
usa cuando el renderizado en el servidor (SSR) dibuja el editor de antemano.

El JSON que sale tiene esta forma. **El documento es un arreglo de bloques**, sin un
nodo raíz que los envuelva.

```json
[
  {"w":"p","a":{"h":2},"ch":["Título"]},
  {"w":"p","ch":["Texto ",{"w":"b","ch":["negrita"]}," y ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["enlace"]}]},
  {"w":"p","a":{"a":"c"},"ch":["centrado"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["uno"]}]},
    {"w":"li","ch":[{"w":"p","ch":["dos"]}]}]}]}
]
```

Solo hay cuatro reglas de lectura.

- **`w` es el id del wing que dibuja ese nodo.** Las únicas palabras reservadas son
  `p` (párrafo) y `br` (línea) — el resto son ids de los wings registrados, como `b`,
  `ul`, `li`. El encabezado no es un wing aparte, sino **un atributo del párrafo**
  (`{"w":"p","a":{"h":2}}`).
- **Si es una cadena, es texto; si es un objeto, es un wing.** No hay una casilla aparte
  para marcar el tipo.
- **`a` es el valor que lleva ese wing** — la dirección de un enlace, el color de un
  resaltado, el nivel de un encabezado. Si no hay valor, tampoco hay casilla. El valor
  de alineación también usa `a`, pero va **dentro** de esa casilla, así que no se
  confunde (`{"w":"p","a":{"a":"c"}}` — un párrafo alineado al centro).
- **Lo que ocupa el lugar de un párrafo, como una tabla, una lista o una imagen, va
  envuelto en una capa de párrafo** (vea el `ul` de arriba). Ese párrafo lleva la
  alineación, y crea el lugar donde el cursor se puede parar antes y después del objeto.
  En HTML sale como `<div data-nabi-p>` — porque `<p>` no puede, por gramática, contener
  una tabla o una lista.

En el árbol que corre por dentro, cada nodo lleva además un `_id` — **la dirección
interna con la que el cursor señala el nodo**, que se vuelve a asignar en la mayoría de
las ediciones y se retira al salir (con el ejemplo de arriba, de 470 a 323 bytes). El
valor que sale se puede volver a meter tal cual con `setJson()`.

---

## Las cuatro formas de meter el documento

```ts
createNabiWith(wings, { doc })   // arranca con un árbol de nabi ya construido
nabi.setJson(json)               // reemplaza todo con un árbol de nabi
nabi.setHtml(html)               // reemplaza todo con una cadena HTML
nabi.applyCommand('setHeading', { value: 2 })  // comando de edición (la misma puerta que usan los wings)
```

Las cuatro **responden éxito o fracaso como `boolean`.** No lanzan excepción, y si
fallan no tocan el documento.

| Cuándo la respuesta es `false` | |
|---|---|
| `setJson` | no tiene la forma de un árbol de nabi |
| `setHtml` | no se conectó el adaptador `parseHtml` (ver abajo), o la edición está bloqueada |
| `applyCommand` | ese comando no existe, o **no cambia nada** |

La última línea es una sola regla — **si no cambia nada, queda en silencio.** Si a un
párrafo que ya es encabezado de nivel 2 se le vuelve a aplicar `setHeading`, responde
`false` y no deja ni punto de deshacer ni señal.

El tercer argumento de `applyCommand` es **la mano que lo llamó** — en
`applyCommand(name, args?, by?)`, `by` es `'keyboard' | 'pointer'` (el tipo
`CommandHand`) y si no se indica, es teclado. Hay un solo lugar donde esto cambia el
resultado: un comando de marca con el cursor colapsado, si viene del teclado, queda
reservado (se aplica desde el próximo carácter); si viene de un puntero, no se reserva y
responde `false` avisando por toast que "no hay nada que aplicar". Si construye su
propia UI y llama a los comandos desde ahí, indique `'pointer'` en el manejador de clic.

### `setHtml` necesita un adaptador

Leer HTML lo hace el `DOMParser` del navegador. Como el núcleo no conoce el DOM, ese
adaptador se conecta al declarar la instancia.

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` no necesita adaptador — el JSON ya guardado se puede **meter tal cual desde el
servidor (Node.js).** El ensamblaje (`getHtml`) tampoco usa DOM, así que queda abierta la
vía de leer el JSON en el servidor y generar el HTML de salida ahí mismo.

---

## Las notificaciones salen por toast

Los errores de subida, los avisos del registro local, un mensaje como "no hay nada que
aplicar" — todo eso sale por **una sola vía: el toast.** El núcleo ya trae el recipiente
por defecto, así que no hace falta conectar nada — cuando se levanta la barra de
herramientas, aparece en un lugar fijo justo debajo de ella (ese lugar no se mueve aunque
la barra contextual aparezca y desaparezca).

- Hay tres niveles — `'info' | 'warn' | 'error'`. No es el resultado de éxito o fracaso,
  sino el nivel de **cuánta atención necesita quien lee**.
- Por defecto se retira después de 1 segundo (empieza a desvanecerse en los últimos 0.5),
  y también se cierra al hacer clic. Como máximo hay 3 a la vez por defecto — si se
  llena, se retira primero el que le queda menos tiempo.
- El mensaje puede llevar `\n`, y se dibuja igual en modo claro y oscuro.

Hay dos opciones que cambian el ritmo y una que reemplaza por completo la presentación,
todas en `createNabiWith`.

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // cuánto dura — por defecto 1000ms. quien lo llama también puede fijarlo por aviso
  toastMax: 5,     // el máximo a la vez — por defecto 3
  // una página con su propio sistema de notificaciones solo reemplaza la presentación — el recipiente por defecto del núcleo nunca se dibuja
  // toast: (level, message, ms) => user_callback(level, message),
})
```

Los wings también hablan por esta misma puerta — `nabi.$toast(level, message, ms?)`.
Como el tiempo va junto con el mensaje, no hace falta alargar el valor por defecto entero
por un solo aviso largo.

---

## La vía por la que el editor le pregunta a la persona

Al abrir un archivo hace falta una pregunta como "hay texto sin guardar, ¿de todos modos
quiere abrirlo?". Esa caja se conecta **una sola vez, al declarar la instancia**.

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | Forma |
|---|---|
| `message` | `(text: string) => void` — un solo mensaje, no espera respuesta |
| `confirm` | `(text: string) => boolean \| Promise<boolean>` — acepta tanto síncrono como asíncrono |

**El núcleo no usa por su cuenta los diálogos del navegador.** Es porque en una página
con sus propios diálogos no debería colarse una caja gris ajena, y porque en un plugin
(IntelliJ, VS Code) `window.confirm` directamente no existe. Las tres líneas de arriba
las construye el host.

**Solo gana la casilla que se conecta** — se puede conectar solo `message`, o solo
`confirm`. Un `message` no conectado sale como el toast (info) del núcleo de arriba, y
la respuesta de un `confirm` no conectado es "no".

::: warning Si no se da, la respuesta es "no"
Una pregunta que nadie respondió no cuenta como "sí" — significa lo mismo que cancelar,
pulsar Escape o cerrar la ventana. Como este es el lugar donde se decide "¿descarto el
texto sin guardar y abro de todos modos?", no puede inclinarse hacia descartar solo
porque no haya quien responda. En el servidor (Node) también se pasa en silencio con
este valor.
:::

**Es propio de cada editor** — no es global, así que dos editores en la misma página
pueden preguntar de forma distinta. Los wings reciben lo mismo (`nabi.$ask`) — de eso se
habla en
[{{ t('menu_wing_custom') }} ▸ UI y comportamiento](../wing/custom/ui).

---

## El nombre de este editor y "¿cambió?"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' — <hora unix>-<nonce>, uno por cada instancia
nabi.isChanged() // si el documento se movió desde la última línea base
```

`sessionId` se crea una vez y no cambia. La hora dice cuándo se levantó este editor y
por sí sola ya queda ordenada, y el nonce distingue a dos editores levantados en el
mismo milisegundo. Es la etiqueta que se pega a claves de borrador, de registro o de
autoguardado.

Hay **tres cosas que vuelven a trazar la línea base** de `isChanged()`: meter el
documento entero (`createNabiWith({ doc })`, `setJson()`, `setHtml()`), y avisar que se
guardó.

```ts
nabi.$markSaved(savedDoc)   // después de que el guardado se completó — se pasa el documento que se guardó en ese momento
```

**Se pasa el árbol tal como estaba en el momento de guardar** (no el árbol actual). Es
porque, mientras el guardado tarda, lo que se escribió mientras tanto debe seguir
contando como "cambiado". El wing de guardado (`save`) llama a esto después de que el
archivo ya se escribió de verdad, así que al guardar como `.nabi`, `isChanged()` pasa a
`false`.

**Si se deshace hasta volver al punto de partida, vuelve a ser `false`** — como el árbol
de nabi es inmutable y en cada edición se reemplaza entero, se sabe en el acto si es el
mismo documento, sin recorrerlo ni calcular un hash.

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## Próximos documentos

- [{{ t('menu_intro_ssr') }}](./ssr) — dibujar el valor guardado en el servidor de antemano y recibirlo con `hydrate`
- [{{ t('menu_intro_cdn') }}](./cdn) — con un solo `<script>`, sin herramientas de compilación
- [{{ t('menu_wing_custom') }}](../wing/custom) — crear a mano un formato que no existe

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
