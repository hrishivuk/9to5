import type {Beat} from '@/lib/battle';
export default function CaffeineMeter({value,max=3,beat,denial}:{value:number;max?:number;beat:Beat|null;denial:{id:number;text:string}|null}){
 const changing=beat?.kind==='select'||beat?.kind==='refill';
 return <div className={`caffeine ${denial?'caffeine-denied':''}`} key={denial?.id??0}>
  <span className="caffeine-label">CAFFEINE<small>ACTION RESOURCE</small></span><strong aria-label={`${value} of ${max} caffeine`}>{Array.from({length:max},(_,i)=><span key={`${i}-${i<value}`} className={`${i<value?'filled':''} ${beat?.kind==='select'&&i>=value&&i<beat.caffeineBefore?'cup-spent':''} ${beat?.kind==='refill'&&i===value-1&&beat.caffeineAfter>beat.caffeineBefore?'cup-refilled':''}`}>☕</span>)}</strong>
  <small className="caffeine-count">{changing?<><b>{beat.caffeineBefore} / {max}</b><i>→</i><b>{beat.caffeineAfter} / {max}</b></>:<><b>{value} / {max}</b><span>+1 AFTER EACH ROUND</span></>}</small>
  {denial&&<span className="resource-hint" role="status">{denial.text}</span>}
 </div>;
}
