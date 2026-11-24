# Plan de recette — OP3p prototype V0.1

| Test | Étapes | Résultat attendu |
|---|---|---|
| T01 Démo | Charger `?demo=1` hors Grist | Quatre projets fictifs visibles, aucune connexion Grist |
| T02 Initialisation | Ajouter widget dans doc Grist vide, accorder `full`, cliquer création | Huit tables `OP3p_*` créées |
| T03 Réinitialisation | Recharger, ouvrir paramétrage | Aucune table recréée ni donnée perdue |
| T04 Projet | Ajouter code unique, titre, statut et dates | Projet visible dans tableau et fiche, persistant après rechargement |
| T05 Code doublon | Recréer le même code, en variant la casse | Message d'erreur, aucune ligne supplémentaire |
| T06 Dates invalides | Fin du projet antérieure au début | Enregistrement refusé |
| T07 Personne | Créer une personne puis l'associer au projet avec un rôle | Référence ID réelle et liaison visible dans la fiche |
| T08 Laboratoire | Créer organisation et lier au projet | Relation N–N enregistrée dans la table `OP3p_OrganisationsProjets` |
| T09 Jalon | Ajouter jalon avec date passée et statut non terminé | Compteur des retards incrémenté |
| T10 Kanban | Glisser jalon vers `Terminé` | Statut modifié dans Grist et compteur mis à jour |
| T11 Livrable | Ajouter puis modifier un livrable | Information visible dans la fiche et en base |
| T12 Historique | Ajouter une interaction datée | Interaction visible dans la fiche projet |
| T13 Recherche | Saisir code, titre, axe, domaine | Filtres pertinents et sans doublons |
| T14 Gantt | Projets avec dates valides, tester zoom 6/12/24 mois | Barre cohérente, défilement fluide |
| T15 Droit lecture | Ouvrir widget en utilisateur sans droits d'édition | Écriture refusée par Grist, pas de modification |
| T16 Sécurité | Nom projet avec `& < > "` | Affichage échappé, pas d'exécution de code |
| T17 Conflit de nom | Tester dans doc avec table `OP3p_Projets` incompatible | Installation bloquée, pas de remplacement silencieux |
| T18 Import | Import de données nettoyées dans tables existantes | Références vérifiées et absence de doublons |

**Ne pas déclarer la recette Grist réussie tant que les tests T02–T18 n'ont pas été exécutés dans l'instance cible avec les profils autorisés.** Les tests unitaires (`npm test`) simulent l'API mais ne remplacent pas une recette d'intégration dans Grist DINUM.
