import type {Beat} from '@/lib/battle';
export default function CaffeineMeter({value,beat,denial}:{value:number;beat:Beat|null;denial:{id:number;text:string}|null}){
 return <div className={`caffeine ${denial?'caffeine-denied':''}`} key={denial?.id??0}>
  <span>CAFFEINE</span><strong aria-label={`${value} of 3 caffeine`}>{[0,1,2].map(i=><span key={`${i}-${i<value}`} className={`${i<value?'filled':''} ${beat?.kind==='select'&&i>=value&&i<value+(beat.card==='force'||beat.card==='summon'?2:beat.card==='ship'?1:0)?'cup-spent':''} ${beat?.kind==='refill'&&beat.detail==='+1 CAFFEINE'&&i===value-1?'cup-refilled':''}`}>☕</span>)}</strong>
  <small>{value}/3 <span>+1 / ROUND</span></small>
  {denial&&<span className="resource-hint" role="status">{denial.text}</span>}
 </div>;
}
