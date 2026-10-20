---
title: Comparaison
description: Comparez deux documents côte à côte et appliquez au document actuel le contenu antérieur sélectionné.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Comparaison

Affichez deux documents enregistrés côte à côte pour examiner leurs différences. La comparaison peut s’ouvrir sans éditeur ; un callback permet d’appliquer le contenu antérieur sélectionné au document actuel.

## Appliquer le contenu antérieur sélectionné

Les comparaisons autonomes sont en lecture seule par défaut et n’affichent pas de boutons d’application **&gt;&gt;**. Connectez un callback `onMerge` pour afficher ces boutons.

L’ancien document est à gauche, l’actuel à droite. Cliquez sur **&gt;&gt;** à côté d’une modification pour reprendre l’ancien contenu du paragraphe ou groupe de lignes concerné. La sélection ne se fait pas caractère par caractère. Vous pouvez aussi restaurer du contenu supprimé ou retirer du contenu ajouté au document actuel.

L’exemple ci-dessous est en lecture seule. Observez les changements d’horaire et d’objets à apporter. **Recommencer** restaure l’exemple initial.

<CompareDemo />

## Comparaison autonome

Importez depuis `nabi-note/diff`. Fournissez du NABI TREE JSON enregistré ou des chaînes HTML dans `before` et `after`. Constituez le registry avec les mêmes wings que l’éditeur d’origine pour lire et afficher intégralement tableaux, listes, images et autres contenus.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'fr',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Par défaut, seules les modifications et leur contexte apparaissent. Le bouton de repli permet d’afficher les documents entiers ; les boutons précédent/suivant parcourent les modifications. Sans modification, tout le contenu s’affiche. Sans `onMerge`, la comparaison est en lecture seule.

## Relier la fusion par clic à un callback

Un clic transmet une proposition de résultat à `onMerge`. Relier le callback ne sauvegarde pas automatiquement le document. Le service doit accepter la proposition et appeler `update()` pour modifier aussi le résultat de comparaison.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'fr',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` est le NABI TREE JSON avec seulement la modification choisie. `before` et `after` sont les documents au moment du clic ; `changeId` identifie la modification, `revision` l’état de comparaison. Passez cette `revision` en troisième argument de `update()` : si la comparaison a déjà changé, la méthode renvoie `false` sans appliquer la proposition.

Les clics répétés sont bloqués pendant l’attente du callback asynchrone. Remplacer les documents ou démonter la comparaison annule `signal`. Pour sauvegarder sur un serveur, vérifiez ce signal et la version du document côté serveur afin de ne pas écraser un document récent avec un résultat périmé.

## Ouvrir la comparaison depuis l’éditeur

Reliez le wing `diff` et `mountDiffWing()` pour ouvrir la comparaison depuis la barre d’outils. La référence est le dernier document chargé. Les modifications ordinaires et l’annulation ne changent pas cette référence.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'fr',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge` vaut `true` par défaut : le contenu antérieur choisi peut donc être appliqué à l’éditeur. Cette opération peut être annulée et conserve la référence. Si l’éditeur d’origine change pendant l’affichage, la comparaison est recalculée. Définissez `merge: false` pour une comparaison en lecture seule.

Appelez `toolbar.unmount()` et `comparison.unmount()` en retirant la vue. Pour inclure la version du début de l’édition et combiner automatiquement les modifications des deux côtés, utilisez [Fusion](./merge).
