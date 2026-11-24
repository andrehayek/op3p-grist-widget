import { TABLES,TABLE_BY_ID } from './schema.js';
import { rowsOf, normalizeInput, findDuplicates } from './domain.js';
export class GristRepository {
 constructor(api){if(!api?.docApi)throw Error('API Grist indisponible');this.api=api;this.data={};this.missing=[];this.incompatible=[];}
 async inspect(){
  const ids=await this.api.docApi.listTables();
  this.missing=TABLES.filter(t=>!ids.includes(t.id)).map(t=>t.id);
  this.incompatible=[];
  const checks=await Promise.all(TABLES.filter(t=>ids.includes(t.id)).map(async t=>{
   try{const raw=await this.api.docApi.fetchTable(t.id);const absent=t.columns.filter(c=>!Object.hasOwn(raw,c.id)).map(c=>c.id);
    return absent.length?`${t.id} : colonnes manquantes (${absent.join(', ')})`:null;
   }catch(err){return `${t.id} : ${err.message}`;}
  }));
  this.incompatible=checks.filter(Boolean);
  return {missing:this.missing,incompatible:this.incompatible,ready:!this.missing.length&&!this.incompatible.length};
 }
 async initialize(onProgress=()=>{}){
  let state=await this.inspect();if(state.incompatible.length)throw Error(`Conflit de schéma : ${state.incompatible.join('; ')}`);
  for (const table of TABLES){
   if(!state.missing.includes(table.id))continue;
   onProgress(`Création de ${table.id}…`);
   // Une création par table, pour garantir que les cibles des Ref existent déjà.
   await this.api.docApi.applyUserActions([['AddTable',table.id,table.columns]]);
  }
  state=await this.inspect();if(!state.ready)throw Error('Initialisation incomplète. Contrôlez les droits et réessayez.');
  await this.refresh();return state;
 }
 async refresh(){
  const results=await Promise.all(TABLES.map(async t=>[t.id,rowsOf(await this.api.docApi.fetchTable(t.id))]));
  this.data=Object.fromEntries(results);return this.data;
 }
 rows(table){return this.data[table]||[];}
 validateReferences(table,values){
  for(const col of TABLE_BY_ID[table].columns.filter(c=>c.type.startsWith('Ref:'))){
   const v=values[col.id];if(v===undefined||v===null)continue;
   if(!this.rows(col.type.slice(4)).some(r=>r.id===v))throw Error(`Référence absente : ${col.id} (#${v})`);
  }
 }
 async create(table,values){
  const normalized=normalizeInput(table,values,this.rows(table));this.validateReferences(table,normalized);findDuplicates(table,normalized,this.rows(table));
  const r=await this.api.docApi.applyUserActions([['AddRecord',table,null,normalized]]);
  await this.refresh();return r?.retValues?.[0]??null;
 }
 async update(table,id,values){
  if(!TABLE_BY_ID[table])throw Error('Table inconnue');
  if(!this.rows(table).some(r=>r.id===Number(id)))throw Error('Enregistrement introuvable');
  const normalized=normalizeInput(table,values,this.rows(table),Number(id));this.validateReferences(table,normalized);findDuplicates(table,{...this.rows(table).find(r=>r.id===Number(id)),...normalized},this.rows(table),Number(id));
  await this.api.docApi.applyUserActions([['UpdateRecord',table,Number(id),normalized]]);await this.refresh();
 }
 async unlink(table,id){
  // Suppression autorisée uniquement pour les tables d'association. Pas de suppression en cascade.
  if(!['OP3p_Participations','OP3p_OrganisationsProjets'].includes(table))throw Error('Suppression interdite pour cette table');
  await this.api.docApi.applyUserActions([['RemoveRecord',table,Number(id)]]);await this.refresh();
 }
}
