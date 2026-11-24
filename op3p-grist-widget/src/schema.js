/** OP3p V0.1 — Schéma contractuel de la base de données.
 * Les identifiants des tables et des colonnes ne doivent pas être renommés sans migration.
 * Chaque table est créée dans l'ordre (les cibles des références précèdent les liens).
 */
export const SCHEMA_VERSION = '0.1.0';
const col = (id, type='Text', extra={}) => ({ id, type, ...extra });
const choice = (id, values) => col(id, 'Choice', {widgetOptions:JSON.stringify({choices:values})});
const ref = (id, target) => col(id, `Ref:${target}`);

export const TABLES = [
 {id:'OP3p_Projets', label:'Projets', columns:[
   col('Code'), col('Titre'), col('Description'), choice('Statut',['En préparation','En cours','Prolongé','Terminé','Suspendu','Annulé']),
   col('Date_Debut','Date'), col('Date_Fin','Date'), col('Axe'), col('Domaine_Innovation'), col('TRL','Int'), col('Notes')
 ]},
 {id:'OP3p_Personnes', label:'Personnes', columns:[
   col('Nom'),col('Prenom'),col('Email'),col('Fonction'),col('Notes')
 ]},
 {id:'OP3p_Organisations', label:'Organisations', columns:[
   col('Nom'),col('Sigle'),choice('Type',['Laboratoire','Établissement','CIEDS','AID','Entreprise','Autre']),col('Site_Web'),col('Notes')
 ]},
 {id:'OP3p_Participations', label:'Participations', columns:[
   ref('Projet','OP3p_Projets'),ref('Personne','OP3p_Personnes'),choice('Role',['Chercheur','Responsable scientifique','Référent CIEDS','Contact AID','Autre']),
   col('Date_Debut','Date'),col('Date_Fin','Date')
 ]},
 {id:'OP3p_OrganisationsProjets', label:'Organisations des projets', columns:[
   ref('Projet','OP3p_Projets'),ref('Organisation','OP3p_Organisations'),choice('Role',['Porteur','Partenaire','Financeur','Autre'])
 ]},
 {id:'OP3p_Jalons', label:'Jalons', columns:[
   ref('Projet','OP3p_Projets'),col('Titre'),col('Date_Cible','Date'),col('Date_Realisation','Date'),
   choice('Statut',['À faire','En cours','Terminé','Bloqué']),ref('Responsable','OP3p_Personnes'),col('Notes')
 ]},
 {id:'OP3p_Livrables', label:'Livrables', columns:[
   ref('Projet','OP3p_Projets'),col('Titre'),col('Date_Prevue','Date'),col('Date_Remise','Date'),
   choice('Statut',['Attendu','En préparation','Remis','Validé']),col('Notes')
 ]},
 {id:'OP3p_Interactions', label:'Interactions', columns:[
   ref('Projet','OP3p_Projets'),col('Date_Action','Date'),choice('Type',['Réunion','Décision','Échange','Note']),col('Resume'),ref('Auteur','OP3p_Personnes')
 ]}
];
export const TABLE_BY_ID = Object.fromEntries(TABLES.map(t=>[t.id,t]));
export const S = Object.freeze({
  projects:'OP3p_Projets', people:'OP3p_Personnes', orgs:'OP3p_Organisations',
  participations:'OP3p_Participations', orgLinks:'OP3p_OrganisationsProjets',
  milestones:'OP3p_Jalons', deliverables:'OP3p_Livrables', interactions:'OP3p_Interactions'
});
