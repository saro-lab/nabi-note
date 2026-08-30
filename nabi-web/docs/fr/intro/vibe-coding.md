---
title: Codage par ambiance IA
description: Aidez les agents de codage à utiliser NABI NOTE avec précision en les ancrant dans son API publique actuelle et ses limites de documentation.
---

# Codage par ambiance IA

NABI NOTE fournit [`llms.txt`](/llms.txt) pour les outils d'IA et d'automatisation. Au lieu de demander à un agent de deviner toute la bibliothèque, commencez par cet index et faites-le lire uniquement les documents nécessaires à la tâche.

## Prompt de départ

Remplissez le framework et les fonctionnalités dont vous avez besoin.

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

Si l'agent ne peut pas ouvrir d'URLs, incluez `llms.txt` et les documents liés pertinents dans la conversation.

## Orientez-le uniquement vers ce dont il a besoin

`llms.txt` est un index compact. Donner à un agent uniquement les pages pertinentes est généralement plus utile que de lui envoyer tous les documents en une fois.

- assemblage npm : [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- configuration CDN : [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- sélection de wing : [`wings.md`](https://nabi.saro.me/llms/wings.md)
- JSON stocké, HTML et événements de changement : [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- limites d'importation HTML, collage et upload : [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- wings personnalisés et rendu côté serveur : [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- visualiseur, diff, styles et capitales initiales : [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- importations exactes et types : [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Inclure les exigences du produit

Un agent ne peut pas déduire le stockage, la politique de sécurité ou le comportement d'upload uniquement à partir de l'écran d'édition. Indiquez le framework réel, les wings incluses et exclues, si le JSON et le HTML sont stockés, le contrat de requête et de réponse de l'endpoint d'upload, les limites de fichiers, et si les pages publiées nécessitent le rendu côté serveur (SSR), le comportement du visualiseur ou la comparaison de différences (diffing).

Pour tout ce qui n'est pas encore décidé, demandez à l'agent d'expliquer les options et leur impact avant de mettre en œuvre un choix.

## Examiner le résultat

Examinez le code généré comme n'importe quel autre code. En particulier, vérifiez qu'il :

- charge `nabi-note/nabi.css` pour le contenu édité et publié ;
- utilise le même `registry` pour les wings sélectionnés et chaque montage ;
- stocke `getJson()`, jamais `getEditorHtml()` ;
- n'écrit pas directement dans le `innerHTML` d'un élément `.nabi-content` en cours d'édition ;
- désactive tous les montages lorsque l'écran se ferme ;
- valide le type MIME, la taille, l'autorisation et l'emplacement de stockage sur le serveur d'upload ;
- utilise l'ordre des wings et les options affectant le HTML correspondants côté serveur et navigateur ;
- confirme les noms d'exportation réels via la vérification de types, les tests et une construction.

Le comportement IME et du curseur, ainsi que les chemins de sauvegarde et de chargement, nécessitent une vérification réelle même lorsque la page semble fonctionner. Testez la saisie par composition sur mobile ainsi que la restauration de documents sauvegardés.

## Privilégiez la version installée

Lorsqu'un projet a déjà `nabi-note` installé, ses exports et déclarations de types dans `package.json` sont plus directement pertinents qu'un site web construit pour une autre version. Demandez à l'agent de vérifier cette différence de version avant d'écrire du code.
