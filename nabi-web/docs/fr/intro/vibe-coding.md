---
title: Vibe coding par IA
description: Explique comment adopter et développer NABI NOTE avec un assistant de code IA, à l'aide de llms.txt.
---

# Vibe coding par IA

**`llms.txt`** est une convention standard conçue pour qu'un site transmette efficacement à un agent IA (LLM) la structure et l'usage d'un projet.
Au lieu d'un balisage HTML, elle fournit la spécification et l'API du projet dans un document markdown propre, facile à analyser pour une IA. La spécification complète est sur [llmstxt.org](https://llmstxt.org/).

Le site officiel de NABI NOTE prend lui aussi entièrement en charge `llms.txt`. Pas besoin de copier la documentation à la main — **donnez simplement l'URL suivante à l'agent IA**, et il explore la documentation lui-même pour accomplir la tâche.

```
https://nabi.saro.me/llms.txt
```

Les outils de code IA actuels — Cursor, Claude Code, OpenAI Codex, Windsurf, etc. — prennent en charge la norme `llms.txt`.

## Lors d'une première installation

Pour intégrer NABI NOTE à un projet pour la première fois, il suffit de préciser les fonctionnalités souhaitées, si le mode clair/sombre doit être pris en charge, et l'environnement de déploiement (SSR/CSR/CDN) — l'agent IA écrit le code optimal à partir de ça.

### npm + rendu côté serveur (SSR) — Next.js, Nuxt, SvelteKit, etc.

```
On veut intégrer nabi-note comme nouvel éditeur sur notre site. Le mode
d'emploi est sur https://nabi.saro.me/llms.txt. Le site a un mode
clair/sombre, fais correspondre le thème de l'éditeur. Active toutes les
wings fournies par défaut.

Notre service fait du rendu côté serveur avec Nuxt. Pour éviter tout
scintillement à la première visite, installe le paquet npm et branche-le en
SSR + hydrate pour qu'il soit prérendu côté serveur.
```

### npm + client uniquement (CSR) — Vite, CRA, environnements SPA

```
On veut intégrer nabi-note comme nouvel éditeur sur notre site. Le mode
d'emploi est sur https://nabi.saro.me/llms.txt. Le site a un mode
clair/sombre, fais correspondre le thème de l'éditeur. Active toutes les
wings fournies par défaut.

C'est un environnement frontend SPA basé sur Vite, pas besoin de rendu côté
serveur. Installe-le comme paquet npm et assemble-le uniquement côté
navigateur.
```

### CDN — environnement HTML statique

```
On veut intégrer nabi-note comme nouvel éditeur sur notre site. Le mode
d'emploi est sur https://nabi.saro.me/llms.txt. Le site a un mode
clair/sombre, fais correspondre le thème de l'éditeur. Active toutes les
wings fournies par défaut.

Cette page est du HTML statique sans outil de build. Branche-le avec des
balises <script> et <link>.
```

::: tip Le thème (clair/sombre) s'adapte automatiquement
`nabi.css` embarque déjà la valeur claire par défaut, la classe `.dark` et une classe `.light` explicite. Dès que la `class="dark"` change sur l'élément racine de la page, le thème de l'éditeur bascule automatiquement avec elle. Pour une personnalisation aux couleurs de votre marque, faites aussi lire `llms/styling.md` à l'agent.
:::

## Pour ajouter ou personnaliser une fonctionnalité

Sur un éditeur déjà intégré, pour ajouter ou modifier une fonctionnalité, il est plus sûr de **demander d'abord une recherche et un plan de mise en œuvre**. C'est particulièrement vrai pour tout ce qui touche à une API backend (upload de fichiers, etc.), où les exigences doivent être clarifiées d'abord.

### Exemple de prompt — recherche et plan

```
Je veux intégrer l'upload de fichiers. Regarde
https://nabi.saro.me/llms/wings.md et
https://nabi.saro.me/llms/api-reference.md, et enquête d'abord sur la forme
que doivent prendre la spécification de l'API backend (endpoint, extensions
et taille autorisées, format de réponse JSON, etc.) et le code d'intégration
frontend nécessaires pour activer la wing upload.
N'écris pas encore de code — montre-moi d'abord les exigences à préparer et
un plan de mise en œuvre.
```

### Exemple de prompt — changement de style simple

```
Regarde https://nabi.saro.me/llms/styling.md et redéfinis la couleur
d'accent de l'éditeur et la couleur de fond du thème sombre en variables CSS,
pour correspondre à nos couleurs de marque.
```

::: tip Une wing qui viole la spécification lève une exception dès son enregistrement
Quand vous faites écrire une nouvelle wing personnalisée, faites aussi lire [`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) à l'agent. Les erreurs courantes — conflit avec un mot réservé, méthode obligatoire manquante — ne sont pas découvertes tardivement à l'exécution : elles sont **détectées immédiatement, sous forme d'exception, au moment de l'enregistrement initial**.
:::

::: tip Notez-le dans le fichier de règles du projet
En ajoutant cette phrase à votre document de règles de projet (`CLAUDE.md`, `.cursorrules`, `AGENT.md`, etc.), il suffira ensuite de demander « ajoute la fonctionnalité ~ à l'éditeur » pour que l'IA consulte `llms.txt` d'elle-même.

```md
Ce projet utilise `nabi-note` comme éditeur WYSIWYG. Pour toute tâche liée,
consultez d'abord https://nabi.saro.me/llms.txt.
```
:::

## Documents suivants

- [{{ t('menu_intro_index') }}](../intro) — présentation et architecture de NABI NOTE
- [{{ t('menu_wing_custom') }}](../wing/custom) — guide de création de wings personnalisées

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
