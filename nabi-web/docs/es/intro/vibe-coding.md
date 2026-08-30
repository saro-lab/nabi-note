---
title: AI vibe coding
description: Ayuda a los agentes de código a usar NABI NOTE con precisión, apoyándolos en la API pública actual y los límites de la documentación.
---

# AI vibe coding

NABI NOTE ofrece [`llms.txt`](/llms.txt) para herramientas de IA y automatización. En lugar de pedirle a un agente que adivine toda la biblioteca, empieza por ese índice y haz que lea solo los documentos necesarios para la tarea.

## Prompt inicial

Completa el framework y las funciones que necesitas.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

Si el agente no puede abrir URL, incluye `llms.txt` y los documentos enlazados relevantes en la conversación.

## Apúntalo solo a lo que necesita

`llms.txt` es un índice compacto. Normalmente es más útil darle al agente solo las páginas relevantes que enviarle toda la documentación de una vez.

- Ensamblaje con npm: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- Configuración con CDN: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- Selección de wings: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- JSON guardado, HTML y eventos de cambio: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- Importación de HTML, pegado y límites de subida: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- Wings personalizados y renderizado en servidor: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- Viewer, diff, estilos y drop caps: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- Imports y tipos exactos: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Incluye los requisitos del producto

Un agente no puede inferir el almacenamiento, la política de seguridad ni el comportamiento de subida solo mirando la pantalla de edición. Indica el framework real, los wings incluidos y excluidos, si se guarda JSON y HTML, el contrato de petición y respuesta del endpoint de subida, los límites de archivo, y si las páginas publicadas necesitan SSR, comportamiento de viewer o diffing.

Para cualquier punto aún no decidido, pide al agente que explique las opciones y su impacto antes de implementar una elección.

## Revisa el resultado

Revisa el código generado como revisarías cualquier otro código. En especial, comprueba que:

- carga `nabi-note/nabi.css` tanto para edición como para contenido publicado;
- usa el mismo `registry` para los wings seleccionados y para todos los montajes;
- guarda `getJson()`, nunca `getEditorHtml()`;
- no escribe directamente en el `innerHTML` de un elemento `.nabi-content` de edición;
- desmonta todos los montajes cuando se cierra la pantalla;
- valida MIME, tamaño, autorización y ubicación de almacenamiento en el servidor de subida;
- usa el mismo orden de wings y las mismas opciones que afectan al HTML en servidor y navegador;
- confirma los nombres reales de exports mediante type checking, pruebas y build.

El comportamiento de IME y cursor, y los caminos de guardar y cargar, necesitan verificación real incluso si la página parece funcionar una vez. Prueba la entrada por composición en móvil y también la restauración de documentos guardados.

## Prefiere la versión instalada

Cuando un proyecto ya tiene `nabi-note` instalado, sus exports de `package.json` y sus declaraciones de tipos son más relevantes que un sitio web construido para otra versión. Pide al agente que compruebe esa diferencia de versión antes de escribir código.
