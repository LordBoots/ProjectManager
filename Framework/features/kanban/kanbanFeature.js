import { BusEvents } from '../../core/EventBus.js';
import { showContextMenu } from '../../core/contextMenu.js';
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
export function createKanbanFeature(ctx){
  const root=document.createElement('div');
  const bar=document.createElement('div'); bar.className='pm-toolbar';
  const add=document.createElement('button'); add.type='button'; add.className='pm-btn'; add.textContent='Add card';
  add.hidden=!ctx.permissions.canEditKanban(); bar.appendChild(add);
  const board=document.createElement('div'); board.className='pm-kanban'; root.append(bar,board);
  let drag=null;
  function nid(){return 'k-'+Math.random().toString(36).slice(2,8);}
  function blank(){return{id:nid(),title:'Card',icon:String.fromCodePoint(0x2699),description:'',subtasks:[{id:'s1',label:'Task',done:false}]};}
  function node(col,card,ix){
    const el=document.createElement('article'); el.className='pm-k-card'; el.draggable=ctx.permissions.canEditKanban(); el.dataset.kid=card.id;
    const subs=card.subtasks||[];const d=subs.filter(x=>x.done).length,t=subs.length;
    el.innerHTML=`<div><strong>${esc(card.title||'')}</strong></div><div class="pm-muted" style="font-size:0.82rem">${esc((card.description||'').slice(0,120))}</div>`;
    const p=document.createElement('div');p.className='pm-progress';const f=document.createElement('div');f.className='pm-progress-fill';
    f.style.width=t?`${Math.round(100*d/t)}%`:'0%';p.appendChild(f);el.appendChild(p);
    el.addEventListener('mouseenter',()=>ctx.bus.emit(BusEvents.ENTITY_HOVER,{type:'kanbanCard',id:card.id}));
    el.addEventListener('mouseleave',()=>ctx.bus.emit(BusEvents.ENTITY_HOVER_END,{}));
    el.addEventListener('contextmenu',e=>{e.preventDefault();showContextMenu({x:e.clientX,y:e.clientY,items:[{label:'Add suggestion',onClick:()=>ctx.bus.emit(BusEvents.OPEN_SUGGESTION_FORM,{type:'kanbanCard',id:card.id})}]});});
    el.addEventListener('dragstart',ev=>{if(!ctx.permissions.canEditKanban()){ev.preventDefault();return;}drag={colId:col.id,id:card.id};try{ev.dataTransfer.setData('text/plain',card.id);}catch(_){ }el.style.opacity='0.5';});
    el.addEventListener('dragend',()=>{el.style.opacity='';drag=null;});
    return el;
  }
  function findPos(st,colId,id){const ci=st.kanban.columns.findIndex(x=>x.id===colId);if(ci<0)return null;const cards=st.kanban.columns[ci].cards||[];const ix=cards.findIndex(c=>c.id===id);if(ix<0)return null;return{ci,ix};}
  function render(){board.replaceChildren();(ctx.store.getState().kanban.columns||[]).forEach(col=>{
    const el=document.createElement('div');el.className='pm-column';
    const h=document.createElement('div');h.className='pm-column-head';h.textContent=col.title;el.appendChild(h);
    (col.cards||[]).forEach((c,ix)=>el.appendChild(node(col,c,ix)));
    el.addEventListener('dragover',e=>ctx.permissions.canEditKanban()&&e.preventDefault());
    el.addEventListener('drop',e=>{
      e.preventDefault(); if(!drag||!ctx.permissions.canEditKanban())return;
      const from=drag; const st=ctx.store.getState(); const p=findPos(st,from.colId,from.id);
      if(!p)return; ctx.store.updateKanban(k=>{
        const dj=k.columns.findIndex(x=>x.id===col.id); if(dj<0)return;
        const fromCards=[...(k.columns[p.ci].cards||[])];
        const mv=fromCards.splice(p.ix,1)[0]; if(!mv)return;
        k.columns[p.ci].cards=fromCards;
        k.columns[dj].cards=[...(k.columns[dj].cards||[]),mv];
      }); drag=null; render();
    }); board.appendChild(el);});}
  add.addEventListener('click',()=>{if(!ctx.permissions.canEditKanban())return;ctx.store.updateKanban(k=>{if(k.columns[0]) k.columns[0].cards=[...(k.columns[0].cards||[]),blank()];});render();});
  const unsub=ctx.store.subscribe(render);render();
  return{root,
    highlightCard(id){board.querySelectorAll('.pm-k-card').forEach(n=>n.classList.remove('pm-highlight'));const w=board.querySelector(`[data-kid="${CSS.escape(id)}"]`);if(w) w.classList.add('pm-highlight');},
    unmount(){unsub();}};
}
