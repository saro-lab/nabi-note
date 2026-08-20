---
title: Vibe coding con IA
description: llms.txt
---

# Vibe coding con IA

**`llms.txt`** es un estándar que usan los sitios web para entregarle su contenido a los
agentes de IA (LLM). En vez de HTML, deja la estructura y el modo de uso de un proyecto en
markdown, que un agente puede leer directamente. El estándar completo está en
[llmstxt.org](https://llmstxt.org/).

Este sitio también tiene esa puerta abierta. No hay que memorizar la dirección — como en el
ejemplo de abajo, **le pasa la dirección al agente** y el resto lo sigue solo.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf y otros soportan el estándar llms.txt.

## Al traerlo por primera vez

Al traer nabi-note a un sitio que todavía no lo usa, le dice al agente de una vez qué quiere
encender, si hay modo claro/oscuro y de qué manera lo va a distribuir — el resto lo ensambla
solo. **Solo cambia la última frase entre los tres casos de abajo** — el resto se puede dejar
igual.

### npm + renderizado en servidor (SSR) — se dibuja en el servidor (Node) en cada petición

Esto cubre tanto un backend en Node hecho a mano como un framework de SSR como Next.js, Nuxt o
SvelteKit — en los dos casos el documento se dibuja sobre Node y se envía en cada petición.

```
Queremos traer nabi-note como nuestro nuevo editor. Usa https://nabi.saro.me/llms.txt
como manual. Nuestro sitio tiene modo claro/oscuro, así que el editor tiene que
seguirlo. Enciende todos los wings que vienen por defecto.

Renderizamos en el servidor con Nuxt, y queremos que el texto ya esté visible en
el momento en que alguien entra a la página. Instálalo con npm y conéctalo con
SSR más hydrate.
```

### npm + ensamblado solo en el navegador (CSR) — hay bundler, pero no hace falta renderizar en servidor

```
Queremos traer nabi-note como nuestro nuevo editor. Usa https://nabi.saro.me/llms.txt
como manual. Nuestro sitio tiene modo claro/oscuro, así que el editor tiene que
seguirlo. Enciende todos los wings que vienen por defecto.

Es un frontend armado con Vite y no necesitamos renderizado en servidor.
Instálalo con npm y ensámblalo solo en el navegador.
```

### CDN — una página estática sin herramientas de compilación

```
Queremos traer nabi-note como nuestro nuevo editor. Usa https://nabi.saro.me/llms.txt
como manual. Nuestro sitio tiene modo claro/oscuro, así que el editor tiene que
seguirlo. Enciende todos los wings que vienen por defecto.

Esta página es HTML estático, sin herramientas de compilación. Conéctalo con una
etiqueta <script>.
```

::: tip El modo claro y oscuro no necesita ninguna instrucción aparte
`nabi.css` ya trae los valores claros por defecto, la anulación `.dark` y una anulación
explícita `.light`. Deja la clase `dark`/`light` de la página como está y el editor la sigue
solo. Para cambiar el color de marca, haga que el agente lea también `llms/styling.md`.
:::

Los tres mensajes solo se diferencian en esa última frase — el agente busca y lee
`llms/ssr.md` (más `llms/quickstart-npm.md`), `llms/quickstart-npm.md` y
`llms/quickstart-cdn.md` respectivamente, y lo conecta de esa manera.

## Cambiar, añadir o quitar una función

Una vez que nabi-note ya está puesto, es más seguro pedir un cambio o algo nuevo como
**investigación y un plan primero, antes que ir directo a la implementación** — sobre todo
cuando la función llega hasta el backend, donde hay que saber qué preparar antes de escribir
código.

### Ejemplo — investigación y plan primero

```
Quiero añadir subida de archivos. Lee https://nabi.saro.me/llms/wings.md y
https://nabi.saro.me/llms/api-reference.md, y averigua qué necesita nuestro
backend para soportar el wing de subida (una dirección que reciba archivos,
extensiones y límites de tamaño permitidos, cómo debería verse una respuesta de
error). No lo implementes todavía — solo muéstrame un plan de qué hay que
preparar.
```

El agente va a encontrar en `llms/wings.md` que `upload` es un wing de herramienta que recibe
un `Uploader`, va a confirmar las firmas reales de `mountUpload`, `Uploader` y
`allowLocalUrls` en `llms/api-reference.md`, y va a armar un plan que separa lo que tiene que
exponer el backend de lo que decide el frontend por su cuenta. Una vez que revise y apruebe el
plan, le pide que lo implemente.

### Un ejemplo más simple — se puede pedir directamente

Un cambio acotado que no necesita plan se puede pedir de una vez.

```
Lee https://nabi.saro.me/llms/styling.md y cambia solo el color de acento y el
fondo del tema oscuro a los colores de nuestra marca.
```

::: tip Un wing que rompe el contrato se rechaza en el momento de registrarlo
Cuando haga que un agente construya un wing nuevo, que lea también
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md). Errores comunes — usar una
palabra reservada como nombre, o un wing que produce un nodo sin `toHtml` — no fallan más
adelante, **se rechazan en el instante en que se registra el wing.** La sección "Un contrato
roto se rechaza al registrar, no después" de ese documento junta lo que hace caer el registro.
:::

::: tip Una vez que está puesto, deje una sola línea
Después de la primera integración, no hace falta repetir la dirección cada vez. Agregue una
línea así al archivo de reglas de su proyecto (`CLAUDE.md`, `.cursorrules`, etc.) y con un
pedido tan corto como "hace X con nabi-note" el agente encuentra la dirección solo.

```md
Este proyecto usa `nabi-note` como su editor. Revisa
https://nabi.saro.me/llms.txt antes de trabajar en algo relacionado.
```
:::

## Próximos documentos

- [{{ t('menu_intro_index') }}](../intro) — el vocabulario que usa este documento
- [{{ t('menu_wing_custom') }}](../wing/custom) — construir a mano un formato que no existe, como
  documento legible por personas

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
