import type {BattleState,Beat,CardId} from '@/lib/battle';
import {itemById} from '@/lib/items';

export default function StatusPanel({state,beat,active}:{state:BattleState;beat:Beat|null;active:CardId|null}){
 const defending=active==='defend'&&!!beat&&['player','enemy-turn','enemy-intro'].includes(beat.kind);
 const defenseConsumed=active==='defend'&&beat?.kind==='enemy'&&beat.blocked>0;
 const scopeConsumed=beat?.kind==='enemy'&&beat.statusBonus>0;
 const hasStatus=state.buff>0||defending||defenseConsumed||scopeConsumed;
 return <><section className={`status-panel ${hasStatus?'has-status':''}`} aria-label="Active Bullshit">
  <div className="status-heading"><span>ACTIVE BULLSHIT</span><small>Temporary workplace conditions</small></div>
  <div className="status-list" aria-live="polite">
   {!hasStatus&&<p className="status-empty">Surprisingly, nothing.</p>}
   {(defending||defenseConsumed)&&<article className={`status-ticket defence-ticket ${defenseConsumed?'consumed':''}`}>
    <span>🛡 CANNOT REPRODUCE</span><strong>{defenseConsumed?'CONSUMED':'NEXT ATTACK: 70% BLOCKED'}</strong>
   </article>}
   {(state.buff>0||scopeConsumed)&&<article className={`status-ticket scope-ticket ${scopeConsumed?'consumed':''}`}>
    <span>📌 JUST ONE SMALL CHANGE</span><strong>{scopeConsumed?'CONSUMED':'NEXT SCRUM LORD ATTACK: +8 DAMAGE'}</strong>
   </article>}
  </div>
 </section>{state.items.length>0&&<section className="battle-desk" aria-label="Your desk"><span>YOUR DESK</span>{state.items.map(id=>{const item=itemById(id);return <div key={id}><b aria-hidden="true">{item.icon}</b><p><strong>{item.name}</strong><small>{item.shortDescription}</small></p></div>})}</section>}</>;
}
