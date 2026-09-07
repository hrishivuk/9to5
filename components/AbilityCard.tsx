import type {Card} from '@/lib/battle';
export default function AbilityCard({card,index,reason,onPlay,active,locked,onUnavailable,onHover}:{card:Card;index:number;reason:string;onPlay:()=>void;active:boolean;locked:boolean;onUnavailable:()=>void;onHover:()=>void}){
 return <button className={`ability-card ${card.color} ${active?'selected':''} ${reason?'unavailable':''}`} disabled={locked} aria-disabled={!!reason||locked} onClick={reason?onUnavailable:onPlay} onMouseEnter={onHover} onFocus={onHover} title={reason||card.effect} aria-label={`${card.name}, ${card.cost} caffeine${reason?`, ${reason}`:''}`}>
  <div className="card-meta"><span>{String(index+1).padStart(2,'0')} / {card.type}</span><span className="cost">{card.cost} ☕</span></div>
  <div className="card-art"><span>{card.icon}</span><i>{card.id==='defend'?'LOCALHOST:3000':card.id==='ship'?'PRODUCTION, PROBABLY':card.id==='force'?'git push --force':'ANSWER ACCEPTED ✓'}</i></div>
  <h3>{card.name}</h3><p className="effect">{card.effect}</p><div className="card-flavor">“{card.flavor}”</div>
  <div className="card-footer">{reason?<><span>⊘</span> {reason}</>:<><span>↗</span> PLAY CARD</>}</div>
 </button>;
}
