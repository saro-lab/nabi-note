---
title: Vibe coding con IA
description: Una guía para adoptar y desarrollar con NABI NOTE junto a un asistente de codificación con IA, usando llms.txt.
---

# Vibe coding con IA

**`llms.txt`** es un estándar diseñado para que los sitios web entreguen de forma eficiente
la estructura y el uso de un proyecto a los agentes de IA (LLM). En vez de marcado HTML,
ofrece la especificación y la API del proyecto en markdown limpio, fácil de leer para una IA.
El estándar completo está en [llmstxt.org](https://llmstxt.org/).

El sitio oficial de NABI NOTE también soporta `llms.txt` por completo. No hace falta copiar
la documentación a mano — **basta con pasarle al agente la URL de abajo** y explora la
documentación por su cuenta para ponerse a trabajar.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf y otras herramientas modernas de codificación con
IA soportan el estándar llms.txt.

## Al adoptarlo por primera vez

Al traer NABI NOTE a un proyecto por primera vez, basta con indicar las funciones que
querés, si hay soporte de modo claro/oscuro y el entorno de despliegue (SSR/CSR/CDN), y el
agente de IA escribe el código óptimo.

### npm + renderizado en servidor (SSR) — Next.js, Nuxt, SvelteKit y similares

```
Queremos traer nabi-note a nuestro sitio como el nuevo editor. Usa
https://nabi.saro.me/llms.txt como manual. Nuestro sitio tiene modo
claro/oscuro, así que el tema del editor tiene que seguirlo. Activa todos los
wings que vienen por defecto.

Nuestro servicio hace renderizado en el servidor con Nuxt. Queremos que la
página no parpadee en la primera visita, renderizada de antemano en el
servidor. Instálalo como paquete npm y conéctalo con SSR + hydrate.
```

### npm + solo cliente (CSR) — entornos Vite, CRA, SPA

```
Queremos traer nabi-note a nuestro sitio como el nuevo editor. Usa
https://nabi.saro.me/llms.txt como manual. Nuestro sitio tiene modo
claro/oscuro, así que el tema del editor tiene que seguirlo. Activa todos los
wings que vienen por defecto.

Es un frontend SPA basado en Vite y no necesitamos renderizado en el
servidor. Instálalo como paquete npm y ensámblalo solo en el cliente del
navegador.
```

### CDN — entornos HTML estático

```
Queremos traer nabi-note a nuestro sitio como el nuevo editor. Usa
https://nabi.saro.me/llms.txt como manual. Nuestro sitio tiene modo
claro/oscuro, así que el tema del editor tiene que seguirlo. Activa todos los
wings que vienen por defecto.

Esta página es HTML estático sin herramientas de compilación. Conéctalo con
etiquetas `<script>` y `<link>`.
```

::: tip El tema (claro/oscuro) se adapta automáticamente
`nabi.css` ya trae integrados los valores claros por defecto, la clase `.dark` y una clase
`.light` explícita. El tema del editor cambia automáticamente junto con el toggle
`class="dark"` del elemento raíz de la página. Para personalizar los colores de marca, hacé
que el agente lea también `llms/styling.md`.
:::

## Al agregar o personalizar una función

Al agregar o modificar una función en un editor que ya está integrado, es más seguro **pedir
primero investigación y un plan de implementación** antes de pasar directo al código —
sobre todo para cualquier cosa que involucre una API de backend (como la subida de
archivos), donde los requisitos hay que dejarlos claros de antemano.

### Ejemplo de prompt — investigación y plan primero

```
Quiero integrar la subida de archivos. Leé https://nabi.saro.me/llms/wings.md
y https://nabi.saro.me/llms/api-reference.md, e investigá primero cómo
deberían quedar la especificación de la API de backend (endpoint,
extensiones/límites de tamaño permitidos, formato de la respuesta JSON, etc.)
y el código de integración del frontend para habilitar el wing de subida. No
escribas código todavía — solo mostrame los requisitos a preparar y un plan
de implementación.
```

### Ejemplo de prompt — un cambio de estilo simple

```
Leé https://nabi.saro.me/llms/styling.md y redefiní el color de acento del
editor y el color de fondo del tema oscuro como variables CSS, según nuestros
colores de marca.
```

::: tip Un wing que rompe el contrato lanza una excepción justo al registrarse
Cuando hagas que un agente escriba un wing personalizado nuevo, hacé que lea también
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md). Errores comunes — un
choque con una palabra reservada, un método obligatorio faltante — no se descubren tarde en
tiempo de ejecución; **se detectan de inmediato como excepción en el momento del registro.**
:::

::: tip Dejá una línea en el archivo de reglas del proyecto
Agregá la siguiente frase al documento de guía del proyecto (`CLAUDE.md`, `.cursorrules`,
`AGENT.md`, etc.), y de ahí en adelante con solo pedir "agregale ~ función al editor" la IA
va a consultar `llms.txt` por su cuenta.

```md
Este proyecto usa `nabi-note` como editor WYSIWYG. Antes de trabajar en algo
relacionado, revisá primero el documento https://nabi.saro.me/llms.txt.
```
:::

## Próximos documentos

- [{{ t('menu_intro_index') }}](../intro) — introducción y arquitectura de NABI NOTE
- [{{ t('menu_wing_custom') }}](../wing/custom) — guía para construir wings personalizados

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
