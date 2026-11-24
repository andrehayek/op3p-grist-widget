/** Logique métier pure, sans accès réseau, DOM ou Grist. */
import { S, TABLE_BY_ID } from './schema.js';
export const STATUSES = ['En préparation','En cours','Prolongé','Terminé','Suspendu','Annulé'];
export const ACTIVE_STATUSES = new Set(['En cours','Prolongé']); // règle à valider avec CIEDS
export const MILESTONE_STATUSES = ['À faire','En cours','Terminé','Bloqué'];
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function rowsOf(columns){
  if (!columns || !Array.isArray(columns.id)) return [];
  return columns.id.map((id,i)=>Object.fromEntries([['id',id],...Object.keys(columns).filter(k=>k!=='id').map(k=>[k,columns[k]?.[i]??null]) ]));
}
export function toEpoch(dateInput){
  if (!dateInput) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) throw new Error('Date invalide (AAAA-MM-JJ).');
  const d=new Date(`${dateInput}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0,10)!==dateInput) throw new Error('Date invalide.');
  return Math.round(d.getTime()/1000);
}
export function isoDate(value){
  if(value===null || value===undefined || value==='') return '';
  if(typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d=new Date(Number(value)*1000); return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10);
}
export function frDate(value){const d=isoDate(value);if(!d)return '—';const [y,m,day]=d.split('-');return `${day}/${m}/${y}`;}
export const namePerson=p=>[p?.Prenom,p?.Nom].filter(Boolean).join(' ')||'Personne sans nom';
export const projectName=p=>p?.Titre||'(sans titre)';
export const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export function countStats(db,today=todayISO()){
  const ps=db[S.projects]||[], js=db[S.milestones]||[], ls=db[S.deliverables]||[];
  const pending=js.filter(j=>j.Statut!=='Terminé');
  return {total:ps.length,active:ps.filter(p=>ACTIVE_STATUSES.has(p.Statut)).length,
    late:pending.filter(j=>isoDate(j.Date_Cible)&&isoDate(j.Date_Cible)<today).length,
    upcoming:pending.filter(j=>isoDate(j.Date_Cible)>=today&&isoDate(j.Date_Cible)<=new Date(new Date(today+'T12:00:00Z').getTime()+30*86400000).toISOString().slice(0,10)).length,
    deliverables:ls.length};
}
export function normalizeInput(tableId,values,existing=[],currentId=null){
  const schema=TABLE_BY_ID[tableId]; if(!schema) throw new Error(`Table inconnue : ${tableId}`);
  const allowed=new Set(schema.columns.map(c=>c.id));
  const out={}; for(const [k,v] of Object.entries(values)){
    if(!allowed.has(k))throw new Error(`Colonne inconnue : ${k}`);
    const c=schema.columns.find(c=>c.id===k);
    if(c.type==='Date')out[k]=toEpoch(v);
    else if(c.type.startsWith('Ref:'))out[k]=v===''||v==null?null:Number(v);
    else if(c.type==='Int')out[k]=v===''||v==null?null:Number(v);
    else if(c.type==='Bool')out[k]=Boolean(v);
    else out[k]=String(v??'').trim();
    if(c.type.startsWith('Ref:') && out[k]!==null && (!Number.isInteger(out[k])||out[k]<=0))throw new Error(`Référence invalide : ${k}`);
    if(c.type==='Int' && out[k]!==null && !Number.isInteger(out[k]))throw new Error(`Nombre entier attendu pour ${k}`);
    if(c.type==='Choice' && out[k] && !JSON.parse(c.widgetOptions).choices.includes(out[k]))throw new Error(`Valeur non autorisée : ${k}`);
  }
  if(tableId===S.projects){
    if(!out.Code && currentId==null)throw new Error('Le code projet est obligatoire.');
    if(!out.Titre && currentId==null)throw new Error('Le titre projet est obligatoire.');
    if(out.Code && existing.some(p=>p.id!==currentId&&String(p.Code||'').toLowerCase()===out.Code.toLowerCase()))throw new Error('Ce code projet existe déjà.');
    if(out.TRL!==undefined && out.TRL!==null && (out.TRL<1||out.TRL>9))throw new Error('Le TRL doit être entre 1 et 9.');
    const old=existing.find(x=>x.id===currentId)||{};
    const start=isoDate(out.Date_Debut??old.Date_Debut),end=isoDate(out.Date_Fin??old.Date_Fin);
    if(start&&end&&start>end)throw new Error('La date de fin précède la date de début.');
  }
  if(tableId===S.people && !out.Nom && currentId==null)throw new Error('Le nom est obligatoire.');
  if(tableId===S.orgs && !out.Nom && currentId==null)throw new Error('Le nom de l’organisation est obligatoire.');
  if([S.milestones,S.deliverables,S.interactions,S.participations,S.orgLinks].includes(tableId)&&currentId==null && !out.Projet)throw new Error('Sélectionnez un projet.');
  if([S.milestones,S.deliverables].includes(tableId)&&currentId==null && !out.Titre)throw new Error('Le titre est obligatoire.');
  if(tableId===S.participations && currentId==null && !out.Personne)throw new Error('Sélectionnez une personne.');
  if(tableId===S.orgLinks && currentId==null && !out.Organisation)throw new Error('Sélectionnez une organisation.');
  return out;
}
export function findDuplicates(tableId,rec,existing,currentId){
  if(tableId===S.participations && existing.some(r=>r.id!==currentId && r.Projet===rec.Projet && r.Personne===rec.Personne && r.Role===rec.Role))throw new Error('Cette participation (même rôle) existe déjà.');
  if(tableId===S.orgLinks && existing.some(r=>r.id!==currentId && r.Projet===rec.Projet && r.Organisation===rec.Organisation && r.Role===rec.Role))throw new Error('Cette association (même rôle) existe déjà.');
}
