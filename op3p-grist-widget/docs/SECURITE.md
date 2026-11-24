# Sécurité, conformité et hébergement

**Attention** : un widget personnalisé à accès complet peut lire et modifier le document Grist selon les permissions de son utilisateur. Le code hébergé sur GitHub Pages est exécuté dans le navigateur ; il peut théoriquement exfiltrer les données s'il devient malveillant. Le fait qu'aucune donnée ne soit stockée sur GitHub Pages **ne suffit pas** à rendre un widget externe approuvé.

### À vérifier avant intégration de données réelles

1. Autorisation explicite du propriétaire métier, de la DSI/SSI et, si nécessaire, de l'administrateur de l'instance Grist DINUM.
2. Hébergement autorisé. L'équipe Grist Gouv privilégie les widgets de sa bibliothèque et déconseille de donner les droits au code non maîtrisé. Référence : https://forum.grist.libre.sh/t/recommandations-pour-une-utilisation-des-custom-widgets-en-toute-securite/3179
3. Révision de chaque commit avant déploiement et possibilité de figer une version approuvée ; attention au code mutable sur la branche `main`.
4. Pas de données classifiées ou sensibles dans un espace de test. Les données RH, contracts, recrutements et contacts sont à qualifier avec les référents sécurité et protection des données.
5. ACL Grist à préparer et tester : visibilité des dossiers, rôles, données et opérations. Le widget **n'est pas** un système d'authentification autonome.
6. Partager uniquement le document Grist avec des utilisateurs autorisés. Une page GitHub publique montrant l'interface sans Grist ne divulgue pas les données, mais permet de consulter le code.
7. Examiner les risques de XSS, CORS, injections, dépendances, exposition réseau et les politiques du navigateur avant production.
8. Organiser sauvegardes, procédures de restauration, surveillance et politique de mise à jour.

### Protections mises en place dans V0.1

- Aucun token API, mot de passe ni identifiant de document codé en dur.
- Aucune requête HTTP métier depuis l'interface ; communications via SDK Grist.
- Aucune bibliothèque tierce de graphiques/PDF, aucune collecte analytique.
- Sorties dynamiques échappées avant rendu HTML.
- Listes d'identifiants de tables/colonnes fixées dans `schema.js`, pas de nom de table arbitraire accepté du formulaire.
- Validation des types, listes Choice, dates, identifiants de référence et règles d'unicité principales dans l'interface.
- Installation du schéma uniquement sur clic utilisateur ; création uniquement des tables absentes, sans suppression.
- Pas de suppression de projets, personnes ou laboratoires depuis le widget ; suppression uniquement des liaisons.

### Limites de ces protections

- Un rôle utilisateur affiché dans l'interface n'est pas une autorisation : l'ACL Grist fait foi.
- La validation JavaScript peut être contournée par un utilisateur disposant d'un accès direct aux tables. Le schéma V0.1 n'impose pas de contraintes SQL `UNIQUE` ou de clés étrangères au niveau de SQLite.
- Les données sont chargées en mémoire de l'iframe pour afficher les vues. Aucune promesse de confidentialité par rapport au navigateur ou à une extension malveillante.
- Le SDK `https://docs.getgrist.com/grist-plugin-api.js` est chargé depuis le domaine officiel dans la vue connectée. L'équipe informatique doit approuver cette dépendance externe ou proposer une solution locale compatible.
- L'accès complet est nécessaire pour les opérations structurelles et multitable. Le prototype ne garantit pas la conformité RGPD, RGAA ou une homologation de sécurité.
- Les imports directs dans Grist et les autres widgets peuvent modifier la base sans passer par les validations d'OP3p.

### Source de référence

https://support.getgrist.com/fr/widget-custom/
