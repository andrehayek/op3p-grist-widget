# Installer et exécuter OP3p de A à Z

Ce guide couvre la création du dépôt GitHub, le déploiement sur GitHub Pages, la connexion à Grist DINUM et les premiers tests.

## 0. Prérequis et prudence

- Un compte GitHub ayant le droit de créer un dépôt et d'activer GitHub Pages.
- Un document Grist DINUM de **test**, vierge ou sans tables portant le préfixe `OP3p_`.
- Des droits de propriétaire/édition suffisants pour créer des tables dans ce document.
- L'accord du CIEDS/DSI/SSI pour utiliser un **widget externe** avec **accès complet au document**, même si GitHub Pages ne stocke pas les données.
- Aucune donnée classifiée, RH sensible, confidentielle ou autre donnée non autorisée dans le prototype public.

Le navigateur doit permettre le chargement de `docs.getgrist.com/grist-plugin-api.js` par le widget, et l'hébergement statique doit être en HTTPS. La politique de sécurité de Grist DINUM peut interdire un domaine externe : demander un hébergement validé si nécessaire.

## 1. Créer le dépôt GitHub

1. Décompresser `OP3p_Widget_Grist_Prototype_V0_1.zip`.
2. Sur GitHub, ouvrir **New repository** (ou `+` > `New repository`).
3. Définir `Repository name = op3p-grist-widget`. La visibilité (public/privé) doit être conforme à la politique informatique ; pour GitHub Pages, vérifier les conditions de visibilité liées au compte.
4. **Ne pas initialiser** le dépôt avec un README ou une licence supplémentaire : les fichiers sont déjà fournis.
5. Cliquer sur `Create repository`.

### Solution conseillée : import avec Git

Ouvrir un terminal dans le dossier décompressé contenant `index.html` :

```bash
git init
git add .
git commit -m "Initial prototype OP3p v0.1.0"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/op3p-grist-widget.git
git push -u origin main
```

Remplacer `VOTRE-COMPTE` par ton identifiant GitHub. Si l'authentification échoue, utiliser les méthodes d'authentification GitHub recommandées (connexion via navigateur/Git Credential Manager ou SSH) ; ne pas publier de jeton dans le dépôt.

### Alternative par l'interface web GitHub

Dans le dépôt vide, `Add file` > `Upload files`, glisser-déposer **le contenu du dossier décompressé**, en conservant `src/`, `tests/`, `docs/` et `.github/workflows/`. Vérifier la conservation des chemins et des fichiers cachés. Selon le navigateur, le glisser-déposer des dossiers peut être plus pratique que la sélection de fichiers.

Le dépôt doit contenir `index.html` **à la racine**, et `src/app.js` dans le sous-dossier `src`.

## 2. Activer GitHub Pages

1. Ouvrir `Settings` > `Pages`.
2. Sous `Build and deployment`, choisir `Deploy from a branch`.
3. Sélectionner `main` puis `/ (root)` et enregistrer.
4. Une fois le site publié, ouvrir :

   `https://VOTRE-COMPTE.github.io/op3p-grist-widget/`

5. Ouvrir l'URL de démonstration :

   `https://VOTRE-COMPTE.github.io/op3p-grist-widget/?demo=1`

Cette démonstration doit montrer 4 **projets fictifs**, des personnes `@example.test`, un portefeuille, des jalons, un Kanban et un Gantt. Rien de ce mode n'est écrit dans Grist.

Si Pages n'est pas disponible, utiliser un hébergement HTTPS statique approuvé par la DSI. Le widget ne nécessite pas d'exécution Node côté serveur.

## 3. Créer le document Grist de test

1. Ouvrir https://grist.numerique.gouv.fr/ avec ton compte.
2. Créer un document **vide**, nommé par exemple `OP3p_DEV`.
3. Ne pas importer les gabarits Excel précédents dans ce document : la nouvelle V0.1 crée elle-même ses tables, avec des noms propres à son code.
4. Créer une page dédiée ou ajouter un widget à une page existante.
5. Cliquer sur `Ajouter` / `Add New` > `Ajouter un widget à la page` / `Add Widget to Page`.
6. Sélectionner `Personnalisé` / `Custom`.
7. Choisir une table de référence si l'interface l'exige (un document vide peut proposer `New Table`). Ce choix n'empêche pas le widget de créer ses propres tables.
8. Ouvrir les options de la section, dans `URL personnalisée` coller :

   `https://VOTRE-COMPTE.github.io/op3p-grist-widget/`

9. Configurer `Accès au document` : **Accès complet au document** (`Full document access`). Ce niveau doit être autorisé par l'administration ; il donne au code du widget la capacité de lire et modifier les données que l'utilisateur peut lui-même modifier.
10. Confirmer l'autorisation, si Grist l'affiche. Le widget affiche la page `Initialiser le référentiel OP3p`.

**Aucun jeton API ni mot de passe ne doit être placé dans le code ou dans l'URL GitHub Pages.** L'authentification repose sur la session Grist et l'API du widget.

## 4. Créer les huit tables automatiquement

1. Lire la liste des 8 tables affichée lors de l'initialisation.
2. Vérifier que tu es dans le document de développement.
3. Cliquer sur `Créer les tables et démarrer`.
4. La création suit cet ordre : `Projets`, `Personnes`, `Organisations`, `Participations`, `OrganisationsProjets`, `Jalons`, `Livrables`, `Interactions`.
5. Ouvrir la vue `Paramètres` : chaque table doit apparaître, avec zéro ligne initialement.
6. Dans `Données brutes` de Grist, vérifier qu'elles existent et que les champs `Projet`, `Personne`, `Organisation` et `Responsable` sont bien de type **Référence** (`Ref`) vers les tables attendues.

Une installation partielle peut être relancée : seules les tables absentes sont créées. **Une table existante dont les colonnes attendues manquent bloque l'installation**. Pour éviter les collisions, utiliser un document neuf et ne pas renommer les colonnes des tables `OP3p_*` sans migration.

La vérification automatique actuelle contrôle les **noms des colonnes**, pas tous les types et propriétés de colonnes existantes. Avant une reprise de document déjà modifié, vérifier manuellement les types.

## 5. Faire un premier test complet

1. Onglet `Projets` > `+ Nouveau projet` : saisir `TEST-001`, un titre, un statut et des dates. Enregistrer.
2. Onglet `Référentiels` > créer `Personne fictive` et `Laboratoire fictif`.
3. Ouvrir la fiche `TEST-001`, ajouter une **participation** (personne + rôle).
4. Ajouter une **organisation liée**.
5. Ajouter un **jalon** avec date cible et statut `À faire` ; puis un **livrable**.
6. Dans `Kanban`, glisser le jalon vers `En cours`, puis `Terminé`.
7. Dans `Gantt`, vérifier la barre du projet et changer le zoom.
8. Vérifier sur les tables de données brutes Grist que les liens correspondent aux bons identifiants de ligne.
9. Recharger le document : les données doivent être toujours présentes.
10. Tester avec un utilisateur éditeur puis avec un utilisateur en lecture seule ; les opérations non autorisées doivent être refusées par Grist.

Voir `docs/RECETTE.md` pour les scénarios détaillés.

## 6. Importer ensuite les données réelles

Seulement après validation du modèle et des droits. Pour chaque source : identifier son propriétaire, nettoyer les noms, dédoublonner, définir les codes projet uniques, faire correspondre les laboratoires/chercheurs à des lignes de référence, vérifier les dates et la confidentialité, puis importer dans les **tables existantes** via les options d'import Grist. Éviter de créer de nouvelles tables en doublon lors de l'import. Tester sur un échantillon avant un chargement complet.

## 7. Modifier le code et publier des évolutions

```bash
git checkout -b feature/fiche-projet-v2
# modifier src/app.js, src/schema.js, styles.css, etc.
npm test
git add .
git commit -m "Amélioration fiche projet"
git push -u origin feature/fiche-projet-v2
```

Sur GitHub, ouvrir une pull request vers `main`, effectuer une revue du code et les essais sur `OP3p_DEV`. Fusionner seulement si les tests passent. GitHub Pages publiera la branche `main`.

**Ne pas ajouter/modifier une colonne en production au hasard :** documenter les migrations. Faire une sauvegarde du document avant les modifications de structure ou de droits.

## 8. Si cela ne fonctionne pas

| Symptôme | Vérification |
|---|---|
| Page blanche ou `404` | Pages activé ? `index.html` à la racine ? nom du dépôt exact ? |
| Mode autonome au lieu de la connexion | L'URL a-t-elle été ouverte *dans* un widget Grist, sans `?demo=1` ? |
| `SDK Grist indisponible` | Le domaine du SDK externe est-il autorisé par le navigateur et la politique réseau ? |
| `Access denied` | Accès complet confirmé ? Droits Grist suffisants ? Règles ACL ? |
| `Conflit de schéma` | Une table `OP3p_*` existe mais sans toutes les colonnes requises. Ne pas la supprimer si elle contient des données. |
| Aucune donnée après création | Ouvrir les tables brutes ; contrôler l'erreur de sauvegarde / les ACL / le réseau. |
| Actualisation d'un autre utilisateur non visible | Cliquer `Synchroniser`. Le prototype n'écoute pas en temps réel toutes les tables. |
| Widget refusé par l'instance DINUM | Demander l'autorisation ou l'hébergement validé par la DSI / l'équipe Grist Gouv. |

## Documentation officielle

- https://support.getgrist.com/fr/widget-custom/
- https://support.getgrist.com/code/interfaces/grist_plugin_api.GristDocAPI/
- https://support.getgrist.com/api/
- https://forum.grist.libre.sh/t/publier-et-heberger-une-vue-personnalisee-custom-widget/554
