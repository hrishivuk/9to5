import {cards,type Beat,type CardId} from '@/lib/battle';
export default function MoveEffects({beat}:{beat:Beat|null}){
 if(!beat)return null;
 const player=beat.kind==='player-intro'||beat.kind==='player';
 const enemy=beat.kind==='enemy-intro'||beat.kind==='enemy';
 if(beat.kind==='recoil')return <div className="move-effect incident"><b>! PRODUCTION INCIDENT</b><small>This seemed safer locally.</small></div>;
 if(player){
  if(beat.card==='defend')return <div className="move-effect debug-effect"><code>$ reproduce --issue<br/><b>CANNOT REPRODUCE</b><br/>✓ defensive environment ready</code></div>;
  if(beat.card==='ship')return <div className="move-effect deploy-effect"><b>DEPLOYED TO PROD</b><div className="deploy-progress"><i/></div><small>rollback plan: optimism</small></div>;
  if(beat.card==='force')return <div className="move-effect git-effect"><code>$ git push --force<br/><b>! SAFETY CHECKS SKIPPED</b></code></div>;
  const copied=cards.find(c=>c.id===(beat.copiedCard as CardId));
  return <div className="move-effect summon-effect"><div className="ghost-card"><span>{copied?.icon}</span><b>{copied?.name}</b><small>70% POWER · COPIED</small></div><strong>✓ ANSWER ACCEPTED</strong></div>;
 }
 if(enemy&&beat.move==='call')return <div className="move-effect calendar-effect"><span>▦ INCOMING INVITE</span><b>Quick call?</b><small>15 min · camera on, soul off</small></div>;
 if((enemy||beat.kind==='status')&&beat.move==='scope')return <div className="move-effect scope-effect"><b>+1 SMALL CHANGE</b><small>Should only take five minutes.</small></div>;
 if((enemy||beat.kind==='heal')&&beat.move==='standup')return <div className="move-effect standup-effect"><span>✓ YESTERDAY</span><span>✓ TODAY</span><span>☐ BLOCKERS</span>{beat.kind==='heal'&&<b>{beat.heal?`+${beat.heal} CAPACITY`:'CAPACITY FULL'}</b>}</div>;
 if(enemy&&beat.move==='ceremony')return <div className="move-effect ceremony-effect"><i/><i/><i/><b>MEETING CREATED</b><small>ATTENDEES: EVERYONE</small></div>;
 return null;
}
