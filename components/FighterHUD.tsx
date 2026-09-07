import {fighters} from '@/lib/battle';
export default function FighterHUD({boss=false,health,buff=0}:{boss?:boolean;health:number;buff?:number}){
 const f=boss?fighters.enemy:fighters.player;
 return <section className={`fighter-hud ${boss?'boss-hud':''} ${health>0&&health<25?'low-health':''}`} aria-label={`${f.name} status`}>
  <div className="hud-title"><span className="player-tag">{boss?'CPU':'P1'}</span><div><h2>{f.name}</h2><p>{f.title} <span> / {f.className}</span></p></div></div>
  <div className="health-caption"><span>MENTAL CAPACITY {health>0&&health<25&&<b className="burnout-label">⚠ BURNOUT RISK</b>}</span><strong>{health}<small> / 100</small></strong></div>
  <div className="health-track" role="progressbar" aria-label={`${f.name} Mental Capacity`} aria-valuenow={health} aria-valuemin={0} aria-valuemax={100}><div className="health-chip" style={{width:`${health}%`}}/><div className="health-value" style={{width:`${health}%`}}/></div>
  {buff>0&&<span className="buff">↑ SCOPE CREEP · NEXT ATTACK +8</span>}
 </section>;
}
