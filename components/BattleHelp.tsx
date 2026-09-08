'use client';
import {useEffect,useRef} from 'react';

export type HelpStep='mental'|'caffeine'|'cards'|'status'|'help';
const copy:Record<HelpStep,{label:string;title:string;lines:string[];button:string}>={
 mental:{label:'EMPLOYEE ORIENTATION / 01',title:'MENTAL CAPACITY',lines:['This is your health.','Hit 0 and HR gets involved.'],button:'GOT IT'},
 caffeine:{label:'EMPLOYEE ORIENTATION / 02',title:'CAFFEINE ☕',lines:['Powers stronger moves.','You recover 1 after every completed round.'],button:'GOT IT'},
 cards:{label:'EMPLOYEE ORIENTATION / 03',title:'YOUR MOVE',lines:['Pick a card.','Try not to make this an incident.'],button:'LET’S CLOCK IN'},
 status:{label:'MANDATORY POLICY UPDATE',title:'UH OH: STATUS EFFECT',lines:["Scope Creep makes the Scrum Lord's NEXT ATTACK deal +8 damage.","Status effects stay in ACTIVE BULLSHIT until they're used."],button:'GOT IT'},
 help:{label:'LAMINATED DESK REFERENCE',title:'HOW THIS WORKS',lines:['MENTAL CAPACITY — health. Zero means defeat.','CAFFEINE — spend it on cards; recover 1 per round.','CARDS — your actions. You act, then the Scrum Lord acts.','ACTIVE BULLSHIT — temporary effects waiting to be used.'],button:'BACK TO WORK'}
};
export default function BattleHelp({step,onDone}:{step:HelpStep;onDone:()=>void}){
 const button=useRef<HTMLButtonElement>(null);const previous=useRef<HTMLElement|null>(null);const item=copy[step];
 useEffect(()=>{previous.current=document.activeElement as HTMLElement;button.current?.focus();const keepFocus=(event:KeyboardEvent)=>{if(event.key==='Tab'){event.preventDefault();button.current?.focus()}if(event.key==='Escape'&&step==='help')onDone()};document.addEventListener('keydown',keepFocus);return()=>{document.removeEventListener('keydown',keepFocus);previous.current?.focus()}},[step,onDone]);
 return <div className="teaching-backdrop"><section className={`teaching-card teaching-${step}`} role="dialog" aria-modal="true" aria-labelledby="teaching-title">
  <span className="teaching-label">{item.label}</span><h2 id="teaching-title">{item.title}</h2>
  <div className="teaching-copy">{item.lines.map(line=><p key={line}>{line}</p>)}</div>
  <button ref={button} className="primary-button" onClick={onDone}>{item.button}<span>↗</span></button>
  <small className="teaching-fineprint">Internal use only. Compliance is being monitored poorly.</small>
 </section></div>;
}
