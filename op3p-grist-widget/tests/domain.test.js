import test from 'node:test';import assert from 'node:assert/strict';
import {TABLES,S} from '../src/schema.js';
import {esc,toEpoch,isoDate,rowsOf,normalizeInput,findDuplicates,countStats} from '../src/domain.js';
test('schéma = huit tables, les références pointent vers des tables déjà déclarées',()=>{
 assert.equal(TABLES.length,8);const seen=new Set();for(const t of TABLES){assert.ok(!seen.has(t.id));for(const c of t.columns){assert.match(c.id,/^[A-Za-z][A-Za-z0-9_]*$/);if(c.type.startsWith('Ref:'))assert.ok(seen.has(c.type.slice(4)),`${t.id}.${c.id}`);}seen.add(t.id);}
});
test('conversion dates : horodatage Grist sans décalage de jour',()=>{assert.equal(isoDate(toEpoch('2026-11-24')),'2026-11-24');assert.throws(()=>toEpoch('2026-02-30'));assert.equal(isoDate(null),'');});
test('HTML échappé : XSS dans les champs projet',()=>{assert.equal(esc('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');});
test('conversion colonne Grist en enregistrements',()=>{assert.deepEqual(rowsOf({id:[1,2],Nom:['A','B'],Projet:[1,2]}),[{id:1,Nom:'A',Projet:1},{id:2,Nom:'B',Projet:2}]);});
test('projet : code unique, dates et TRL contrôlés',()=>{
 const current=[{id:1,Code:'A',Titre:'Test'}];
 assert.throws(()=>normalizeInput(S.projects,{Code:'a',Titre:'Copie'},current),/existe déjà/);
 assert.throws(()=>normalizeInput(S.projects,{Code:'B',Titre:'Test',Date_Debut:'2026-12-01',Date_Fin:'2026-01-01'},current),/précède/);
 assert.throws(()=>normalizeInput(S.projects,{Code:'B',Titre:'Test',TRL:'11'},current),/TRL/);
 const r=normalizeInput(S.projects,{Code:'C',Titre:'Test',Date_Debut:'2026-11-24',TRL:'4'},current);
 assert.equal(r.TRL,4);assert.equal(isoDate(r.Date_Debut),'2026-11-24');
});
test('références : ID entier positif ou nul',()=>{
 assert.deepEqual(normalizeInput(S.participations,{Projet:'1',Personne:'2',Role:'Chercheur'}),{Projet:1,Personne:2,Role:'Chercheur'});
 assert.throws(()=>normalizeInput(S.participations,{Projet:'-2',Personne:'4',Role:'Chercheur'}),/invalide/);
});
test('dédoublonnage des participations',()=>{assert.throws(()=>findDuplicates(S.participations,{Projet:1,Personne:4,Role:'Chercheur'},[{id:2,Projet:1,Personne:4,Role:'Chercheur'}]),/existe déjà/);});
test('comptage des retards : ne compte pas les jalons terminés',()=>{
 const db={[S.projects]:[{Statut:'En cours'},{Statut:'Terminé'}],[S.milestones]:[{Statut:'À faire',Date_Cible:toEpoch('2026-01-01')},{Statut:'Terminé',Date_Cible:toEpoch('2026-01-01')},{Statut:'En cours',Date_Cible:toEpoch('2026-12-01')}],[S.deliverables]:[]};
 const s=countStats(db,'2026-11-24');assert.equal(s.active,1);assert.equal(s.late,1);assert.equal(s.upcoming,1);
});
