---
title: Utilisation du CDN
description: Chargez la version navigateur de NABI NOTE sans outil de construction.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Utilisation du CDN

Pour une page statique où l'installation d'un package est peu pratique, chargez la version navigateur et son CSS depuis un CDN. La démo ci-dessous lit la version du package pendant la construction du site et crée un éditeur via l'objet global `NabiNote`.

<CdnDemo />

## Notes pour NABI NOTE

- Dans le code déployé, figez le CSS et le JavaScript navigateur sur la même version. Une URL sans version, telle que `latest`, peut modifier le comportement lorsqu'une nouvelle version est publiée.
- Le bundle navigateur expose l'API racine via `window.NabiNote`. `nabi-note/ssr`, `nabi-note/viewer` et `nabi-note/diff` ne sont pas des bundles globaux distincts.
- La sauvegarde de fichiers et l'historique local dans cette démo s'exécutent dans le navigateur de l'utilisateur. Envoyez la sortie de `getJson()` à l'API de votre application pour un stockage serveur ou une synchronisation de compte.
- Le téléversement nécessite la wing `upload`, une vraie fonction d'upload et la wing d'image ou de lien nécessaire. Votre serveur d'upload est responsable de la validation des fichiers.
- La version navigateur intègre son analyseur HTML en interne. `setHtml()`, l'ouverture d'un fichier HTML et le collage de HTML ne nécessitent pas d'option d'analyseur ni d'API privée.

Le chargement via CDN modifie uniquement la manière dont la bibliothèque est chargée. Son format de stockage et sa validation des entrées sont identiques à ceux du package npm ; voir également [Utilisation de base](/fr/guide/getting-started).
