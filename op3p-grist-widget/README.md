# OP3p — Prototype de pilotage du portefeuille de projets du CIEDS

**Version :** 0.1.0 · **Statut :** prototype fonctionnel à valider dans Grist DINUM · **Langue :** français

Le widget est une application statique HTML/CSS/JavaScript qui s'affiche dans une section **Widget personnalisé** de [Grist DINUM](https://grist.numerique.gouv.fr/). Il crée, après confirmation explicite, **8 tables relationnelles** dans le document Grist. Il ne possède **aucune base de données, API key, ni serveur métier sur GitHub**.

> **Sécurité :** widget externe demandant l'accès complet au document. Utiliser uniquement un document de test **sans données sensibles** jusqu'à validation par les responsables Grist/DSI/SSI du CIEDS. L'équipe Grist Gouv recommande des précautions spécifiques pour les widgets personnalisés externes. Voir `docs/SECURITE.md`.

## Fonctionnalités du prototype

- Vue portefeuille : projets totaux, actifs, jalons en retard, échéances à 30 jours et répartitions par statut.
- Recherche et filtres : code, titre, axe, domaine et statut.
- Fiches projets : création, mise à jour, description, dates, axe, domaine, TRL, statut et notes.
- CRM : fiches personnes et organisations, rôles et associations N–N aux projets.
- Jalons : création, modification, tableau Kanban avec glisser-déposer entre les statuts.
- Livrables et interactions : création et modification par fiche projet.
- Gantt synthétique : projets sur 6, 12 ou 24 mois avec navigation.
- Installation explicite et idempotente des huit tables ; aucune suppression des tables ou des projets par le widget.
- Démonstration autonome avec des données fictives : ajouter `?demo=1` à l'URL du site.
- Aucun framework ni dépendance npm de production. Tous les scripts métier sont des modules ES natifs.

**Hors périmètre V0.1 :** permissions fines configurées dans Grist, contrats/recrutements, finances, communication, système d'alertes e-mail, synchronisation temps réel de toutes les tables et migrations automatiques. Les codes projets uniques sont vérifiés dans l'interface mais non garantis transactionnellement si deux utilisateurs créent simultanément le même code.

## Démarrage — procédure courte

1. Décompresser le ZIP téléchargé.
2. Créer sur GitHub un dépôt `op3p-grist-widget` et y pousser **tous** les fichiers (voir `docs/INSTALLATION.md`).
3. Activer GitHub Pages : `Settings` > `Pages` > `Deploy from a branch` > `main` et `/ (root)`.
4. Ouvrir `https://VOTRE-COMPTE.github.io/op3p-grist-widget/?demo=1` pour vérifier l'interface avec des données fictives.
5. Créer un **nouveau document Grist de test vide** `OP3p_DEV`.
6. Ajouter une section `Widget personnalisé`, configurer l'URL `https://VOTRE-COMPTE.github.io/op3p-grist-widget/` (sans `?demo=1`).
7. Dans les options de la section, autoriser l'**accès complet au document**, sous réserve de l'accord DSI/SSI pour un widget hébergé sur GitHub Pages.
8. Cliquer sur **Créer les tables et démarrer**. L'installation crée les huit tables à la demande, sans en supprimer.
9. Tester avec des projets **fictifs** avant de charger des données CIEDS.

📘 Guide détaillé : [docs/INSTALLATION.md](docs/INSTALLATION.md) · Modèle : [docs/MODELE_DONNEES.md](docs/MODELE_DONNEES.md) · Audit du projet inspirateur : [docs/AUDIT_ISAYTOO.md](docs/AUDIT_ISAYTOO.md)

## Architecture technique

```
GitHub Pages (HTML + CSS + JS)
  └── Widget OP3p dans une iframe Grist
        └── SDK officiel grist-plugin-api.js
             ├── listTables / AddTable, sur action explicite
             ├── fetchTable, en lecture parallèle
             └── AddRecord / UpdateRecord / RemoveRecord (liaisons seules)
                  └── Document OP3p_DEV sur Grist DINUM
```

Le widget ne stocke aucun secret. Les données métier demeurent dans le document Grist ; le code public sur GitHub pourrait néanmoins **accéder au document** lorsqu'il est ouvert avec l'autorisation `full`. Un code déployé sur GitHub Pages est donc un élément de confiance à examiner avant chaque nouvelle version.

## Arborescence

```
op3p-grist-widget/
├── index.html                 # Point d'entrée du widget
├── styles.css                 # Interface responsive, bleu marine/turquoise
├── src/
│   ├── app.js                 # Navigation, vues, formulaires, interactions
│   ├── schema.js              # Huit tables, colonnes et références Grist
│   ├── grist-repo.js          # Interface avec l'API Grist
│   ├── domain.js              # Contrôles et règles métier testables
│   └── demo.js                # Données de démonstration fictives
├── tests/
│   ├── domain.test.js         # Règles métier
│   └── repo.test.js           # Tests de création et CRUD simulant Grist
├── docs/
│   ├── INSTALLATION.md
│   ├── MODELE_DONNEES.md
│   ├── AUDIT_ISAYTOO.md
│   ├── SECURITE.md
│   └── RECETTE.md
├── .github/workflows/ci.yml  # Tests automatisés (GitHub Actions)
├── package.json
├── .nojekyll
└── LICENSE
```

## Développement local

```bash
# Node >= 22 (utilisé pour les tests seulement)
npm test

# Site statique : Python >= 3.9
python3 -m http.server 8080
# Démonstration : http://localhost:8080/?demo=1
```

Pour le mode Grist, héberger sur HTTPS et placer l'URL dans une section Widget personnalisé. Une URL localhost intégrée dans Grist peut être bloquée selon le navigateur et la politique de contenus mixtes.

## Gestion des évolutions

- Toujours créer une branche `feature/...` puis une pull request relue avant fusion dans `main`.
- Avant de modifier les identifiants de tables/colonnes, rédiger une **migration** et la tester sur une copie du document.
- Les colonnes `Axe` et `Domaine_Innovation` sont du texte en V0.1. Prévoir les tables de nomenclature et les associations multi-axes en V0.2.
- Les données sensibles de personnels recrutés et de contrats ne font pas partie de cette version.
- Conserver une copie de la version testée, éviter les mises à jour non vérifiées sur un widget autorisé en accès complet.

## Références

- Widget de référence : https://github.com/isaytoo/grist-project-manager-widget — **inspiration ergonomique**, pas copie de ses sources.
- API Grist : https://support.getgrist.com/code/interfaces/grist_plugin_api.GristDocAPI/
- Widgets personnalisés : https://support.getgrist.com/fr/widget-custom/
- Guide de sécurité Grist Gouv : https://forum.grist.libre.sh/t/recommandations-pour-une-utilisation-des-custom-widgets-en-toute-securite/3179

**Licence du code OP3p contenu ici : MIT**. Aucun code propriétaire du dépôt de référence n'a été copié. Ce prototype n'est pas présenté comme un service officiellement homologué par la DINUM ou le CIEDS.
