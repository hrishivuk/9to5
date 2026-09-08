import {cards,enemyMoves,type BattleState,type Beat,type CardId} from '@/lib/battle';
import type {FighterProfile} from '@/lib/fighter';
import FighterPortrait from './FighterPortrait';
import MoveEffects from './MoveEffects';
export default function BattleArena({state,beat,active,busy,time,fighter}:{state:BattleState;beat:Beat|null;active:CardId|null;busy:boolean;time:string;fighter:FighterProfile}){
 const heavy=(beat?.kind==='player'&&active==='force')||(beat?.kind==='enemy'&&beat.move==='ceremony');
 const impact=!!beat&&(beat.playerDamage>0||beat.enemyDamage>0);
 const shield=active==='defend'&&!!beat&&['player-intro','player','enemy-turn','enemy-intro'].includes(beat.kind);
 const defeated=beat?.kind==='defeat';
 const headline=!busy?'YOUR MOVE':beat?.kind==='enemy-turn'?"SCRUM LORD'S TURN":beat?.text??'RESOLVING ROUND';
 return <div className={`arena ${impact?(heavy?'impact-heavy':'impact-light'):''}`} data-beat={beat?.kind??'idle'} data-heavy={heavy} key={`arena-${state.round}-${beat?.kind}`}>
  <div className="office-window"><span/><span/><span/><span/></div><div className="office-clock">{time}</div>
  <div className="office-poster">HANG<br/>IN THERE.<small>Attendance is mandatory.</small></div>
  <div className="office-desk desk-left"><div className="monitor">npm run survive<span>▊</span></div><div className="mug">☕</div></div>
  <div className="office-desk desk-right"><div className="paper-stack">Q4 ALIGNMENT</div><div className="plant">♠</div></div>
  <div className={`arena-fighter player-figure ${beat?.playerDamage?'hit':''} ${state.player>0&&state.player<25?'burnout-idle':''} ${defeated&&state.player===0?'knocked-out':''} ${shield?'shielded':''}`}>
   <FighterPortrait/>{!!beat?.playerDamage&&<span className={`damage-number ${beat.blocked?'blocked-number':''} ${heavy?'big-number':''}`}>−{beat.playerDamage}</span>}
   {shield&&<span className="shield-label">70% BLOCK READY</span>}
  </div>
  <div className="arena-center" aria-live="assertive" aria-atomic="true"><ActionReadout beat={beat} busy={busy} headline={headline}/></div>
  <MoveEffects beat={beat}/>
  {beat?.kind==='player'&&active==='ship'&&<div className="attack-streak"/>}
  {beat?.kind==='player'&&(active==='force'||active==='summon')&&<div className={`impact-burst ${active}`}>✳</div>}
  <div className={`arena-fighter boss-figure ${beat?.enemyDamage?'hit':''} ${state.enemy>0&&state.enemy<25?'burnout-idle':''} ${defeated&&state.enemy===0?'knocked-out':''} ${beat?.kind==='heal'?'healing':''}`}>
   <FighterPortrait boss/>{!!beat?.enemyDamage&&<span className={`damage-number ${heavy?'big-number':''}`}>−{beat.enemyDamage}</span>}
   {!!beat?.heal&&<span className="heal-number">+{beat.heal} <small>CAPACITY</small></span>}
  </div>
  <div className="arena-floor"/><div className="arena-bottom"><span>◉ {fighter.name.toUpperCase()}</span><span>“LET’S TAKE THIS OFFLINE.”</span></div>
 </div>;
}

function ActionReadout({beat,busy,headline}:{beat:Beat|null;busy:boolean;headline:string}){
 if(!busy||!beat)return <><span className="arena-level">PLAYER CONTROL</span><strong>{headline}</strong><small>Pick one card. Then the Scrum Lord acts.</small></>;
 if(beat.kind==='select')return <><span className="arena-level">CARD LOCKED IN</span><strong>{headline}</strong><small>{beat.detail}</small></>;
 if(beat.kind==='player-intro'){const card=cards.find(item=>item.id===beat.card);return <><span className="arena-level move-nameplate">YOUR ACTION</span><strong>{beat.text}</strong><small>{card?.type.toUpperCase()} · {beat.detail}</small></>}
 if(beat.kind==='player')return beat.enemyDamage?<><span className="arena-level">{beat.text}</span><strong>−{beat.enemyDamage}</strong><small>SCRUM LORD&nbsp;&nbsp; {beat.beforeEnemy} → {beat.state.enemy}</small></>:<><span className="arena-level">STATUS ADDED</span><strong>CANNOT REPRODUCE</strong><small>NEXT ATTACK · 70% BLOCKED</small></>;
 if(beat.kind==='recoil')return <><span className="arena-level">RISK TRIGGERED</span><strong>−{beat.playerDamage}</strong><small>YOU&nbsp;&nbsp; {beat.beforePlayer} → {beat.state.player}</small></>;
 if(beat.kind==='enemy-turn')return <><span className="arena-level">PLAYER ACTION COMPLETE</span><strong>{headline}</strong><small>Enemy action incoming.</small></>;
 if(beat.kind==='enemy-intro'){const move=beat.move&&enemyMoves[beat.move];return <><span className="arena-level move-nameplate">SCRUM LORD'S TURN</span><strong>{beat.text}</strong><small>{beat.detail}<br/>“{move?.flavor}”</small></>}
 if(beat.kind==='enemy')return <><span className="arena-level">{beat.text}</span><strong>−{beat.playerDamage}</strong>{beat.statusBonus?<small className="damage-math">BASE DAMAGE&nbsp; {beat.baseDamage}<br/>SCOPE CREEP&nbsp; +{beat.statusBonus}<br/><b>TOTAL&nbsp; {beat.incoming}</b><br/>YOU&nbsp; {beat.beforePlayer} → {beat.state.player}</small>:beat.blocked?<small className="damage-math">INCOMING&nbsp; {beat.incoming}<br/>BLOCKED&nbsp; −{beat.blocked}<br/><b>DAMAGE&nbsp; {beat.playerDamage}</b><br/>YOU&nbsp; {beat.beforePlayer} → {beat.state.player}</small>:<small>YOU&nbsp;&nbsp; {beat.beforePlayer} → {beat.state.player}</small>}</>;
 if(beat.kind==='status')return <><span className="arena-level">STATUS ADDED</span><strong>JUST ONE SMALL CHANGE</strong><small>NEXT SCRUM LORD ATTACK · +8 DAMAGE</small></>;
 if(beat.kind==='heal')return <><span className="arena-level">SCRUM LORD STATUS</span><strong>{beat.text}</strong><small>{beat.detail}</small></>;
 if(beat.kind==='refill')return <><span className="arena-level">ROUND COMPLETE</span><strong>{beat.text}</strong><small>{beat.detail}<br/>Your move is next.</small></>;
 if(beat.kind==='defeat')return <><span className="arena-level">MENTAL CAPACITY · 0</span><strong>{beat.text}</strong><small>Performance review complete.</small></>;
 return <><span className="arena-level">EVENT IN PROGRESS</span><strong>{headline}</strong><small>{beat.detail}</small></>;
}
