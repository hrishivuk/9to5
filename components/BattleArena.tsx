import type {BattleState,Beat,CardId} from '@/lib/battle';
import FighterPortrait from './FighterPortrait';
import MoveEffects from './MoveEffects';
export default function BattleArena({state,beat,active,busy,late}:{state:BattleState;beat:Beat|null;active:CardId|null;busy:boolean;late:boolean}){
 const heavy=(beat?.kind==='player'&&active==='force')||(beat?.kind==='enemy'&&beat.move==='ceremony');
 const impact=!!beat&&(beat.playerDamage>0||beat.enemyDamage>0);
 const shield=active==='defend'&&!!beat&&['player-intro','player','enemy-intro','enemy'].includes(beat.kind);
 const defeated=beat?.kind==='defeat';
 const headline=!busy?'YOUR MOVE.':beat?.kind==='select'?'LOCKED IN.':beat?.kind==='refill'?beat.text:beat?.kind==='defeat'?beat.text:beat?.kind==='recoil'?'UH-OH.':beat?.kind==='chaos'?'OVERTIME.':beat?.kind==='status'?'SCOPE ADDED.':beat?.kind==='heal'?'STATUS UPDATE.':beat?.kind==='player-intro'||beat?.kind==='player'?active==='defend'?'LOCALHOST SAFE.':active==='ship'?'SHIP IT!':active==='force'?'FORCE PUSH!':'SUMMON!':'INCOMING!';
 return <div className={`arena ${impact?(heavy?'impact-heavy':'impact-light'):''}`} data-beat={beat?.kind??'idle'} data-heavy={heavy} key={`arena-${state.round}-${beat?.kind}`}>
  <div className="office-window"><span/><span/><span/><span/></div><div className={`office-clock ${late?'clock-late':''}`}>{late?'4:59':'4:58'}</div>
  <div className="office-poster">HANG<br/>IN THERE.<small>Attendance is mandatory.</small></div>
  <div className="office-desk desk-left"><div className="monitor">npm run survive<span>▊</span></div><div className="mug">☕</div></div>
  <div className="office-desk desk-right"><div className="paper-stack">Q4 ALIGNMENT</div><div className="plant">♠</div></div>
  {state.buff>0&&<div className="pending-requirement">+1 SMALL CHANGE<small>NEXT ATTACK +8</small></div>}
  <div className={`arena-fighter player-figure ${beat?.playerDamage?'hit':''} ${state.player>0&&state.player<25?'burnout-idle':''} ${defeated&&state.player===0?'knocked-out':''} ${shield?'shielded':''}`}>
   <FighterPortrait/>{!!beat?.playerDamage&&<span className={`damage-number ${beat.blocked?'blocked-number':''} ${heavy?'big-number':''}`}>−{beat.playerDamage}</span>}
   {shield&&<span className="shield-label">{beat?.blocked?`${beat.blocked} BLOCKED`:'70% BLOCK'}</span>}
   {beat&&beat.blocked>0&&<span className="block-receipt">{beat.move==='call'?'DECLINED.':'70% REDUCED'}<small>{beat.playerDamage+beat.blocked} → {beat.playerDamage} DAMAGE</small></span>}
  </div>
  <div className="arena-center"><span className={`arena-level ${beat?.kind==='player-intro'||beat?.kind==='enemy-intro'?'move-nameplate':''}`}>{beat?.kind==='player-intro'||beat?.kind==='enemy-intro'?beat.text:'STAGE 01'}</span><strong>{headline}</strong><small>{!busy?'Choose your corporate weapon.':beat?.kind==='refill'?beat.detail:beat?.kind==='defeat'?'Performance review complete.':''}</small></div>
  <MoveEffects beat={beat}/>
  {beat?.kind==='player'&&active==='ship'&&<div className="attack-streak"/>}
  {beat?.kind==='player'&&(active==='force'||active==='summon')&&<div className={`impact-burst ${active}`}>✳</div>}
  <div className={`arena-fighter boss-figure ${beat?.enemyDamage?'hit':''} ${state.enemy>0&&state.enemy<25?'burnout-idle':''} ${defeated&&state.enemy===0?'knocked-out':''} ${beat?.kind==='heal'?'healing':''}`}>
   <FighterPortrait boss/>{!!beat?.enemyDamage&&<span className={`damage-number ${heavy?'big-number':''}`}>−{beat.enemyDamage}</span>}
   {!!beat?.heal&&<span className="heal-number">+{beat.heal} <small>CAPACITY</small></span>}
  </div>
  <div className="arena-floor"/><div className="arena-bottom"><span>◉ LOCALHOST HERO</span><span>“LET’S TAKE THIS OFFLINE.”</span></div>
 </div>;
}
