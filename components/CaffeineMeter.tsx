import type {Beat} from '@/lib/battle';
export default function CaffeineMeter({value,beat,denial}:{value:number;beat:Beat|null;denial:{id:number;text:string}|null}){
 const changing=beat?.kind==='select'||beat?.kind==='refill';
 return <div className={`caffeine ${denial?'caffeine-denied':''}`} key={denial?.id??0}>
  <span className="caffeine-label">CAFFEINE<small>ACTION RESOURCE</small></span><strong aria-label={`${value} of 3 caffeine`}>{[0,1,2].map(i=><span key={`${i}-${i<value}`} className={`${i<value?'filled':''} ${beat?.kind==='select'&&i>=value&&i<beat.caffeineBefore?'cup-spent':''} ${beat?.kind==='refill'&&i===value-1&&beat.caffeineAfter>beat.caffeineBefore?'cup-refilled':''}`}>☕</span>)}</strong>
  <small className="caffeine-count">{changing?<><b>{beat.caffeineBefore} / 3</b><i>→</i><b>{beat.caffeineAfter} / 3</b></>:<><b>{value} / 3</b><span>+1 AFTER EACH ROUND</span></>}</small>
  {denial&&<span className="resource-hint" role="status">{denial.text}</span>}
 </div>;
}
