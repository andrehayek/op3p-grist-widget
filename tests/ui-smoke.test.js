import test from 'node:test';
import assert from 'node:assert/strict';

test('mode démo : navigation, fiche projet, Gantt et formulaire sans Grist',async()=>{
 const elements={
  '#app':{innerHTML:''}, '#editor':{open:false,showModal(){this.open=true;},close(){this.open=false;}},
  '#editor-content':{innerHTML:''},'#toast':{textContent:'',className:''}
 };
 const handlers={};
 globalThis.document={querySelector:sel=>elements[sel]||null,addEventListener:(name,cb)=>handlers[name]=cb,querySelectorAll:()=>[]};
 globalThis.location={search:'?demo=1',reload(){}};
 globalThis.window={parent:{},grist:undefined};
 await import('../src/app.js');
 await new Promise(r=>setTimeout(r,35));
 assert.match(elements['#app'].innerHTML,/Vue consolidée du portefeuille/);
 assert.match(elements['#app'].innerHTML,/Démo fictive/);
 const clickPage=page=>handlers.click({target:{closest:selector=>selector==='[data-page]'?{dataset:{page}}:null}});
 await clickPage('gantt'); assert.match(elements['#app'].innerHTML,/Gantt des projets/);
 await clickPage('kanban'); assert.match(elements['#app'].innerHTML,/Jalons — Kanban/);
 await clickPage('projets');assert.match(elements['#app'].innerHTML,/FICHE PROJET/);
 await handlers.click({preventDefault(){},target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'create',table:'OP3p_Projets'}}:null}});
 assert.equal(elements['#editor'].open,true);
 assert.match(elements['#editor-content'].innerHTML,/Code projet/);
 delete globalThis.document;delete globalThis.location;delete globalThis.window;
});
