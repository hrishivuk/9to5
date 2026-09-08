import {useState} from 'react';
import {motion} from 'motion/react';
import {itemById,type ItemId} from '@/lib/items';

export default function OfficeLoot({choices,onClaim,onDone}:{choices:ItemId[];onClaim:(item:ItemId)=>void;onDone:()=>void}){
 const [offers]=useState(choices);const [selected,setSelected]=useState<ItemId|null>(null);const item=selected?itemById(selected):null;
 function choose(id:ItemId){if(selected)return;setSelected(id);onClaim(id);setTimeout(onDone,1300)}
 return <motion.section key="office-loot" className={`office-loot ${selected?'loot-selected':''}`}>
  <header className="loot-heading"><div><span className="eyebrow">PERFORMANCE BONUS / FORM PB-01</span><h1>EMPLOYEE<br/>BENEFITS</h1><p>Management has approved one (1) workplace benefit.<br/><strong>Choose carefully. Budget does not allow changes later.</strong></p></div><div className="procurement-summary"><span>APPROVED ITEMS</span><strong>1</strong><span>AVAILABLE BUDGET</span><b>€0.00</b><small>PROCUREMENT STATUS: QUESTIONABLE</small></div></header>
  <div className="loot-cards" role="group" aria-label="Choose one office benefit">{offers.map((id,index)=>{const choice=itemById(id);const denied=!!selected&&selected!==id;return <article key={id} className={`loot-card rarity-${choice.rarity.toLowerCase()} ${selected===id?'is-selected':''} ${denied?'is-denied':''}`}>
   {denied&&<span className="budget-denied">BUDGET<br/>DENIED</span>}<div className="loot-card-meta"><span>{choice.rarity}</span><span>{choice.category}</span></div><div className="loot-icon" aria-hidden="true"><b>{choice.icon}</b><small>{choice.assetTag}</small></div><h2>{choice.name}</h2><div className="loot-effect"><span>MECHANICAL EFFECT</span><strong>{choice.description}</strong></div><p>“{choice.flavour}”</p><small>COMPANY PROPERTY · ASSET {String(index+1).padStart(3,'0')}</small><button onClick={()=>choose(id)} disabled={!!selected} aria-label={`Take ${choice.name}`}>TAKE IT <span>→</span></button>
  </article>})}</div>
  {item&&<motion.div className="benefit-approved" role="status" initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}}><span>✓ BENEFIT APPROVED</span><strong>{item.name}</strong><small>ADDED TO YOUR DESK</small></motion.div>}
  <p className="loot-fineprint">BENEFITS PROVIDED IN LIEU OF SALARY. COMPANY PROPERTY. PLEASE RETURN AFTER TERMINATION.</p>
 </motion.section>
}
