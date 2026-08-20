---
title: Vibe coding par IA
description: llms.txt
---

# Vibe coding par IA

**`llms.txt`** est une convention par laquelle un site web tend son contenu aux agents IA
(LLM). Au lieu de HTML, elle range la structure du projet et son mode d'emploi dans du markdown
que l'agent lit directement. La spécification complète est sur [llmstxt.org](https://llmstxt.org/).

Ce site a lui aussi ouvert cette porte. Pas besoin de retenir l'adresse — comme dans les
exemples ci-dessous, **il suffit de la tendre à l'agent** et il suit le reste seul.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf, entre autres, prennent en charge la norme llms.txt.

## Pour une première installation

Sur un site qui n'utilise pas encore nabi-note, dites en une fois ce que vous voulez activer,
si le site a un mode clair/sombre, et quelle est la voie de déploiement — l'agent assemble le
reste seul. **Seule la voie de déploiement change entre les trois cas ci-dessous, le reste de la
phrase reste identique.**

### npm + rendu côté serveur (SSR) — quand un serveur (Node) dessine à chaque requête

Cela couvre aussi bien un backend Node fait maison qu'un framework de SSR comme Next.js, Nuxt
ou SvelteKit — dans les deux cas, c'est Node qui dessine le document à chaque requête avant de
l'envoyer.

```
On veut installer nabi-note comme nouvel éditeur sur notre site. Le mode d'emploi est
https://nabi.saro.me/llms.txt. Le site a un mode clair/sombre, fais suivre l'éditeur.
Active toutes les wings fournies par défaut.

On fait du rendu côté serveur avec Nuxt, et on veut que le texte soit déjà visible dès
l'arrivée sur la page — dessiné à l'avance côté serveur. Installe avec npm et branche ça
en SSR + hydrate.
```

### npm + assemblage côté navigateur seul (CSR) — un bundler, mais pas de rendu serveur

```
On veut installer nabi-note comme nouvel éditeur sur notre site. Le mode d'emploi est
https://nabi.saro.me/llms.txt. Le site a un mode clair/sombre, fais suivre l'éditeur.
Active toutes les wings fournies par défaut.

C'est un frontend qu'on build avec Vite, pas besoin de rendu serveur. Installe avec npm
et assemble tout côté navigateur.
```

### CDN — une page statique sans outil de build

```
On veut installer nabi-note comme nouvel éditeur sur notre site. Le mode d'emploi est
https://nabi.saro.me/llms.txt. Le site a un mode clair/sombre, fais suivre l'éditeur.
Active toutes les wings fournies par défaut.

Cette page est du HTML statique sans outil de build. Branche ça avec une balise
`<script>`.
```

::: tip Rien à préciser pour le clair/sombre
`nabi.css` embarque déjà les valeurs claires par défaut, le mode sombre et un mode clair
explicite. Laissez les classes `dark`/`light` de la page telles qu'elles sont, et l'éditeur
suit tout seul. Pour ne changer que la couleur de la marque, faites lire `llms/styling.md` en
plus.
:::

Les trois exemples ne diffèrent que par la voie de déploiement, le reste de la phrase est
identique — l'agent va chercher respectivement `llms/ssr.md` (+ `llms/quickstart-npm.md`),
`llms/quickstart-npm.md` et `llms/quickstart-cdn.md`, et installe en suivant celui qui
correspond.

## Pour modifier, ajouter ou retirer une fonctionnalité

Sur une installation déjà en place, mieux vaut **faire enquêter puis établir un plan avant de
lancer l'implémentation** — surtout pour une fonctionnalité qui touche au backend, où il faut
d'abord savoir ce qu'il faut préparer.

### Exemple — enquête et plan d'abord

```
On veut ajouter l'upload de fichiers. Regarde https://nabi.saro.me/llms/wings.md et
https://nabi.saro.me/llms/api-reference.md, et enquête sur ce qu'il faut préparer côté
backend pour activer la wing upload (adresse qui reçoit l'upload, extensions et taille
autorisées, forme de la réponse en cas d'échec, etc.). N'implémente rien tout de suite,
montre-moi juste le plan de ce qu'il faut préparer.
```

L'agent va vérifier dans `llms/wings.md` que `upload` est une wing-outil qui prend un
`Uploader`, puis dans `llms/api-reference.md` les signatures réelles de `mountUpload`,
`Uploader` et `allowLocalUrls` — et en tirer un plan qui sépare ce qui revient au backend de ce
qui se décide côté frontend. Une fois le plan validé, on lance l'implémentation qui suit.

### Exemple plus simple — à demander directement

Une retouche étroite qui n'a pas besoin d'un plan peut être demandée directement.

```
Regarde https://nabi.saro.me/llms/styling.md et change juste la couleur d'accent et le
fond du thème sombre pour nos couleurs de marque.
```

::: tip Une wing qui viole le contrat est rejetée au moment même où on l'enregistre
Faites lire [`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) à l'agent
quand il construit une nouvelle wing. Les erreurs courantes — utiliser un mot réservé comme
nom, ou poser un noeud sans `toHtml` pour le dessiner — ne se déclarent pas plus tard : elles
sont rejetées **à l'instant même de l'enregistrement**. La section « Ça meurt exactement là où
on l'enregistre » de ce document liste ce qui est vérifié.
:::

::: tip Une fois l'installation faite, laissez une seule ligne
Une fois nabi-note en place, pas besoin de redonner l'adresse à chaque fois. Une ligne comme
celle-ci dans le fichier de règles du projet (`CLAUDE.md`, `.cursorrules`, etc.) suffit — après
ça, il suffit de dire « fais ça avec nabi-note » et l'agent retrouve l'adresse seul.

```md
Ce projet utilise `nabi-note` comme éditeur. Avant tout travail lié à ça, consultez
d'abord https://nabi.saro.me/llms.txt.
```
:::

## Documents suivants

- [{{ t('menu_intro_index') }}](../intro) — les mots qu'emploie ce document
- [{{ t('menu_wing_custom') }}](../wing/custom) — fabriquer soi-même une mise en forme absente, expliqué pour un lecteur humain

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
