---
title: Fusion
description: Combinez la version de départ, votre version et celle enregistrée entre-temps, puis résolvez les conflits restants en les éditant.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Fusion

Si d’autres modifications ont été enregistrées pendant votre édition, combinez les deux côtés à partir de la version de départ. Tout ce qui peut être fusionné automatiquement est appliqué d’emblée ; seuls les chevauchements restent en conflit. La fusion est une vue autonome de `nabi-note/merge`, pas un wing.

| Gauche | Milieu | Droite |
| --- | --- | --- |
| Version au début de l’édition | Votre document actuel avec la fusion automatique | Version enregistrée pendant votre édition |
| Lecture seule | Modifiable directement | Lecture seule |

Au milieu, modifiez texte, mise en forme, tableaux, listes et images comme dans un éditeur normal. Les wings fournis déterminent les fonctions disponibles. Les repères de conflit et leur état de résolution ne sont pas enregistrés dans le contenu.

## Exemple entièrement fusionné automatiquement

Vous avez changé l’heure de réunion en **11 h**, et une autre personne le lieu en **salle de réunion du 3e étage**. Les modifications concernent des paragraphes distincts ; elles apparaissent toutes deux au milieu.

Sans conflit restant, vous pouvez cliquer immédiatement sur **Confirmer**, ou affiner le texte central avant de confirmer. Le document final affiché en dessous est le résultat réellement reçu par le callback de confirmation.

<MergeDemo />

## Exemple partiellement fusionné automatiquement

Cette fois, vous avez fixé l’heure à **11 h**, et l’autre personne à **14 h**. Les modifications différentes d’un même paragraphe laissent l’heure en conflit. Votre changement des responsables en **Jimin et Seoyeon** et le lieu changé en **salle de réunion du 3e étage** sont appliqués automatiquement.

Résolvez un conflit avec l’une de ces actions :

- À gauche, **&gt;&gt;** : reprendre le contenu correspondant de la version de départ.
- À droite, **&lt;&lt;** : reprendre celui de la version nouvellement enregistrée.
- **Résoudre avec le contenu actuel** : conserver ou modifier le contenu central, puis le déclarer résolu.

Modifiez la phrase de l’heure au milieu, puis cliquez sur **Résoudre avec le contenu actuel**. La confirmation exige que tous les conflits restants soient résolus.

<MergeDemo partial />

Rééditer une zone résolue conserve son état. Annuler la résolution annule aussi cet état ; rétablir le restaure. Supprimer ou éditer du texte ne résout pas automatiquement un conflit ouvert.

## Règles de fusion automatique et de conflit

Comparez les changements entre le document de départ et votre document, puis entre ce même départ et la nouvelle version. Les modifications d’un seul côté et celles identiques des deux côtés sont appliquées automatiquement, tout comme les changements de paragraphes ou lignes distincts.

Comme pour la fusion de texte de Git, les chevauchements sont évalués par paragraphes et lignes. Même des mots différents modifiés sur une même ligne restent en conflit. Des insertions différentes au même endroit ou la modification d’un contenu supprimé par l’autre côté demandent aussi une décision.

Si les deux côtés modifient différemment un bloc structuré comme un tableau, une liste ou une zone flottante, toute la structure est en conflit. Les cellules et éléments de liste ne sont pas mélangés arbitrairement : choisissez le contenu ou éditez-le au milieu. Les déplacements et modifications superposés dont la position reste incertaine ne sont pas appliqués automatiquement.

## Connecter une vue de fusion autonome

Fournissez du NABI TREE JSON enregistré ou des chaînes HTML dans `base`, `local` et `incoming`. Utilisez les mêmes wings et options que l’éditeur d’origine. `mountMerge()` crée l’éditeur central, sa barre d’outils, les deux sources, les commandes de conflit et le bouton de confirmation.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'fr',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` reçoit le JSON, le HTML de publication, la révision d’édition et `incomingVersion` du résultat actuel entièrement résolu. Renvoyer `false` ne termine pas la confirmation. Pendant l’attente de sa Promise, l’édition, la sélection de conflits et une nouvelle confirmation sont bloquées. Démonter annule le `signal` du résultat. Une composition IME coréenne doit se terminer avant de confirmer.

Connectez les actions propres au service, comme le sélecteur d’images ou les téléversements, comme pour un éditeur normal. `toolbarOptions` reçoit les panneaux et actions de l’hôte ; `surfaceOptions` reçoit les options de surface d’édition.

`incomingVersion` renvoie telle quelle la valeur fournie par le service. Celui-ci doit la comparer à la dernière version du serveur lors de l’enregistrement. Si une autre version a été enregistrée pendant la fusion, récupérez le dernier document et recommencez la fusion au lieu de l’écraser avec un résultat périmé.

Vous pouvez aussi lire l’état ou demander confirmation depuis l’extérieur de la vue.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Lisez le résultat avec `merge.nabi.getJson()` et `merge.nabi.getHtml()`. N’enregistrez ni le DOM d’édition ni `getEditorHtml()`. Pour reprendre seulement du contenu antérieur choisi entre deux versions, utilisez la fusion par clic de [Comparaison](./compare).

## Confirmer après les téléversements

Connectez le wing `upload` et `mountUpload()` pour le bouton fichier, le collage et le glisser-déposer. `sendUpload` envoie les fichiers au serveur et renvoie `{ uri }`. Voir [Téléversement de fichiers](../wing/etc/upload) pour un exemple complet de connexion et de progression.

Utilisez `merge.session.hold()` pour suspendre confirmation et sélection de conflits pendant les opérations asynchrones, comme un téléversement, pas encore reflétées dans le document. Appelez la fonction retournée à la fin, à l’annulation ou au démontage. Libérez **après l’insertion dans le document**, et non dès l’envoi au serveur, afin d’inclure le fichier dans le résultat final.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'fr',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'fr',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` est le DOM d’édition central ; `merge.surface` et `merge.toolbar` sont déjà montés. Ne recréez pas de surface ou barre d’outils à cet endroit. Démontez d’abord les montages supplémentaires de téléversement ou progression, puis appelez `merge.unmount()`.
