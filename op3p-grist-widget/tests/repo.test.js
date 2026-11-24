import test from 'node:test';import assert from 'node:assert/strict';
import {TABLES,S} from '../src/schema.js';
import {GristRepository} from '../src/grist-repo.js';
function mockGrist(initial={}){
 const db=structuredClone(initial),journal=[];
 const api={docApi:{
  listTables:async()=>Object.keys(db),
  fetchTable:async t=>{if(!db[t])throw Error('Missing table '+t);const cols={id:db[t].rows.map(r=>r.id)};for(const c of db[t].columns){cols[c.id]=db[t].rows.map(r=>r[c.id]??null);}return cols;},
  applyUserActions:async actions=>{
   const retValues=[];for(const [op,t,a,b] of actions){journal.push([op,t,a,b]);if(op==='AddTable'){if(db[t])throw Error('Already exists');db[t]={columns:a,rows:[]};retValues.push({table_id:t});}
    else if(op==='AddRecord'){const id=Math.max(0,...db[t].rows.map(r=>r.id))+1;db[t].rows.push({id,...b});retValues.push(id);}
    else if(op==='UpdateRecord'){const row=db[t].rows.find(r=>r.id===a);if(!row)throw Error('Unknown row');Object.assign(row,b);retValues.push(null);}
    else if(op==='RemoveRecord'){db[t].rows=db[t].rows.filter(r=>r.id!==a);retValues.push(null);}
    else throw Error('Unknown operation '+op);
   }return {retValues};}
 }};return {api,db,journal};
}
test('initialisation explicite, ordonnée, idempotente et non destructive',async()=>{
 const mock=mockGrist(),repo=new GristRepository(mock.api);
 let state=await repo.inspect();assert.equal(state.missing.length,8);
 await repo.initialize();assert.equal(Object.keys(mock.db).length,8);assert.equal(mock.journal.filter(a=>a[0]==='AddTable').length,8);
 await repo.initialize();assert.equal(mock.journal.filter(a=>a[0]==='AddTable').length,8);
 assert.equal(repo.rows(S.projects).length,0);
});
test('schéma préexistant incompatible : erreur sans création',async()=>{
 const mock=mockGrist({[S.projects]:{columns:[{id:'Nom'}],rows:[]}}),repo=new GristRepository(mock.api);
 const s=await repo.inspect();assert.ok(s.incompatible.length>0);
 await assert.rejects(()=>repo.initialize(),/Conflit/);assert.equal(mock.journal.length,0);
});
test('CRUD : références numériques, blocage des codes projet doublons et suppression réservée aux liens',async()=>{
 const mock=mockGrist(),r=new GristRepository(mock.api);await r.initialize();
 const project=await r.create(S.projects,{Code:'T-001',Titre:'Projet fictif',Statut:'En cours'});
 const person=await r.create(S.people,{Nom:'Dupont',Prenom:'Jean'});
 await r.create(S.participations,{Projet:String(project),Personne:String(person),Role:'Chercheur'});
 assert.equal(r.rows(S.participations)[0].Projet,project);
 await assert.rejects(()=>r.create(S.projects,{Code:'T-001',Titre:'Autre projet'}),/existe déjà/);
 await r.update(S.projects,project,{Statut:'Terminé'});assert.equal(r.rows(S.projects)[0].Statut,'Terminé');
 await assert.rejects(()=>r.unlink(S.projects,project),/interdite/);
 await r.unlink(S.participations,1);assert.equal(r.rows(S.participations).length,0);
});
