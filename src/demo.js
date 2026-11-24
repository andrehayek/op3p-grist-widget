/** Démonstration sans connexion Grist : données fictives exclusivement en mémoire. */
import {TABLES,S} from './schema.js';
import {toEpoch,normalizeInput,findDuplicates} from './domain.js';
const D=s=>toEpoch(s);
export class DemoRepository{
 constructor(){this.missing=[];this.incompatible=[];this.data={};for(const t of TABLES)this.data[t.id]=[];this.seed();}
 seed(){
 const ps=[
  {id:1,Code:'DEMO-001',Titre:'Capteurs intelligents pour systèmes autonomes',Description:'Projet fictif de démonstration consacré aux capteurs et à l’analyse embarquée.',Statut:'En cours',Date_Debut:D('2026-01-15'),Date_Fin:D('2027-06-30'),Axe:'Autonomie',Domaine_Innovation:'IA embarquée',TRL:4},
  {id:2,Code:'DEMO-002',Titre:'Cybersécurité des réseaux distribués',Description:'Projet de démonstration relatif à la résilience des réseaux.',Statut:'Prolongé',Date_Debut:D('2025-09-01'),Date_Fin:D('2027-03-31'),Axe:'Cybersécurité',Domaine_Innovation:'Sécurité numérique',TRL:5},
  {id:3,Code:'DEMO-003',Titre:'Analyse multimodale des données',Description:'Prototype fictif pour tester les vues de portefeuille.',Statut:'En préparation',Date_Debut:D('2027-01-15'),Date_Fin:D('2028-02-15'),Axe:'Science des données',Domaine_Innovation:'Traitement du signal',TRL:2},
  {id:4,Code:'DEMO-004',Titre:'Étude exploratoire de matériaux',Description:'Données fictives exclusivement.',Statut:'Terminé',Date_Debut:D('2025-04-01'),Date_Fin:D('2026-10-01'),Axe:'Matériaux',Domaine_Innovation:'Ingénierie',TRL:6}
 ];
 this.data[S.projects]=ps;
 this.data[S.people]=[{id:1,Nom:'Martin',Prenom:'Alice',Email:'alice.martin@example.test',Fonction:'Responsable scientifique'},{id:2,Nom:'Bernard',Prenom:'Karim',Email:'karim.bernard@example.test',Fonction:'Référent CIEDS'},{id:3,Nom:'Moreau',Prenom:'Sophie',Email:'sophie.moreau@example.test',Fonction:'Chercheuse'}];
 this.data[S.orgs]=[{id:1,Nom:'Laboratoire Alpha (fictif)',Sigle:'LAB-A',Type:'Laboratoire'},{id:2,Nom:'Institut Beta (fictif)',Sigle:'INST-B',Type:'Établissement'}];
 this.data[S.participations]=[{id:1,Projet:1,Personne:1,Role:'Responsable scientifique'},{id:2,Projet:1,Personne:2,Role:'Référent CIEDS'},{id:3,Projet:2,Personne:3,Role:'Chercheur'}];
 this.data[S.orgLinks]=[{id:1,Projet:1,Organisation:1,Role:'Porteur'},{id:2,Projet:2,Organisation:2,Role:'Partenaire'}];
 const now=new Date();const plus=n=>D(new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()+n)).toISOString().slice(0,10));
 this.data[S.milestones]=[{id:1,Projet:1,Titre:'Revue intermédiaire',Date_Cible:plus(-12),Statut:'En cours',Responsable:1},{id:2,Projet:1,Titre:'Rapport scientifique',Date_Cible:plus(21),Statut:'À faire',Responsable:1},{id:3,Projet:2,Titre:'Réunion de clôture',Date_Cible:plus(60),Statut:'Bloqué',Responsable:3},{id:4,Projet:4,Titre:'Validation finale',Date_Cible:plus(-50),Date_Realisation:plus(-48),Statut:'Terminé'}];
 this.data[S.deliverables]=[{id:1,Projet:1,Titre:'Rapport de synthèse',Date_Prevue:plus(30),Statut:'En préparation'},{id:2,Projet:2,Titre:'Prototype technique',Date_Prevue:plus(56),Statut:'Attendu'}];
 this.data[S.interactions]=[{id:1,Projet:1,Type:'Réunion',Date_Action:plus(-15),Resume:'Réunion de suivi fictive.',Auteur:2}];
 }
 async inspect(){return {missing:[],incompatible:[],ready:true};}
 async initialize(){return this.inspect();}
 async refresh(){return this.data;}
 rows(table){return this.data[table]||[];}
 async create(table,values){const rec=normalizeInput(table,values,this.rows(table));findDuplicates(table,rec,this.rows(table));const id=Math.max(0,...this.rows(table).map(r=>r.id))+1;this.rows(table).push({id,...rec});return id;}
 async update(table,id,values){const row=this.rows(table).find(r=>r.id===id);if(!row)throw Error('Ligne inexistante');const rec=normalizeInput(table,values,this.rows(table),id);findDuplicates(table,{...row,...rec},this.rows(table),id);Object.assign(row,rec);}
 async unlink(table,id){if(![S.participations,S.orgLinks].includes(table))throw Error('Suppression interdite');this.data[table]=this.rows(table).filter(r=>r.id!==id);}
}
