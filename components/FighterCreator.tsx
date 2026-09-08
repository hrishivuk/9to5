'use client';
import {useMemo,useState} from 'react';
import type {ReactNode} from 'react';
import {motion} from 'motion/react';
import {defaultFighter,makeFighter,professions,strengths,styleIds,styles,weaknesses,type FighterProfile,type FightingStyle,type Profession,type Strength,type Weakness} from '@/lib/fighter';
import FighterPortrait from './FighterPortrait';
type Draft={name:string;profession:Profession|null;strengths:Strength[];weakness:Weakness|null;style:FightingStyle|null};
const labels=['IDENTITY','DAY JOB','THREAT TYPE','WEAK POINT','STYLE'];
export default function FighterCreator({onReveal}:{onReveal:(fighter:FighterProfile)=>void}){
 const [step,setStep]=useState(0);
 const [draft,setDraft]=useState<Draft>({name:'',profession:null,strengths:[],weakness:null,style:null});
 const preview=useMemo(()=>makeFighter({name:draft.name||defaultFighter.name,profession:draft.profession??defaultFighter.profession,strengths:draft.strengths.length?draft.strengths:defaultFighter.strengths,weakness:draft.weakness??defaultFighter.weakness,style:draft.style??defaultFighter.style}),[draft]);
 const canContinue=step===0?draft.name.trim().length>0:step===1?!!draft.profession:step===2?draft.strengths.length===3:step===3?!!draft.weakness:!!draft.style;
 const next=()=>{if(!canContinue)return;if(step===4)onReveal(makeFighter({name:draft.name,profession:draft.profession!,strengths:draft.strengths,weakness:draft.weakness!,style:draft.style!}));else setStep(step+1)};
 const toggleStrength=(strength:Strength)=>setDraft(old=>({ ...old,strengths:old.strengths.includes(strength)?old.strengths.filter(item=>item!==strength):old.strengths.length<3?[...old.strengths,strength]:old.strengths}));
 return <motion.section key="create" className="creator-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
  <div className="creator-panel">
   <div className="creator-progress">{labels.map((label,index)=><span key={label} className={index===step?'current':index<step?'done':''}>{String(index+1).padStart(2,'0')} {label}</span>)}</div>
   {step===0&&<div className="creator-step"><span className="eyebrow">CREATE YOUR FIGHTER</span><h1>WHO ARE YOU CLOCKING IN AS?</h1><input autoFocus maxLength={18} value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value.slice(0,18)})} placeholder="DISPLAY NAME" aria-label="Display name"/><small>{draft.name.length}/18 CHARACTERS</small></div>}
   {step===1&&<Picker title="WHAT DO YOU DO FOR MONEY?">{professions.map(item=><button key={item} className={draft.profession===item?'picked':''} onClick={()=>setDraft({...draft,profession:item})}><b>{item}</b><small>{item==='Other'?'Still somehow billable':'Corporate damage class'}</small></button>)}</Picker>}
   {step===2&&<Picker title="WHAT ARE YOU DANGEROUS AT?" hint={`CHOOSE EXACTLY 3 · ${draft.strengths.length}/3 LOCKED`}>{strengths.map(item=><button key={item} className={draft.strengths.includes(item)?'picked':''} onClick={()=>toggleStrength(item)}><b>{item}</b><small>{draft.strengths.includes(item)?'Armed':'Available'}</small></button>)}</Picker>}
   {step===3&&<Picker title="CORPORATE KRYPTONITE?">{weaknesses.map(item=><button key={item} className={draft.weakness===item?'picked':''} onClick={()=>setDraft({...draft,weakness:item})}><b>{item}</b><small>Redistributes stats</small></button>)}</Picker>}
   {step===4&&<Picker title="CHOOSE YOUR FIGHTING STYLE">{styleIds.map(item=><button key={item} className={draft.style===item?'picked':''} onClick={()=>setDraft({...draft,style:item})}><b>{item}</b><small>{styles[item].description}</small></button>)}</Picker>}
   <div className="creator-actions"><button className="text-button" disabled={step===0} onClick={()=>setStep(Math.max(0,step-1))}>BACK</button><button className="primary-button" disabled={!canContinue} onClick={next}>{step===4?'REVEAL FIGHTER':'CONTINUE'} <span>↗</span></button></div>
  </div>
  <aside className="creator-preview"><div className="fighter-card-top">EMPLOYEE FILE <span>P1</span></div><FighterPortrait/><div className="fighter-card-bottom"><span>{preview.name}</span><small>{preview.profession.toUpperCase()} / {preview.style}</small></div><div className="stat-grid">{Object.entries(preview.stats).map(([key,value])=><div key={key}><span>{key}</span><strong>{value}</strong><i style={{width:`${value}%`}}/></div>)}</div></aside>
 </motion.section>;
}
function Picker({title,hint,children}:{title:string;hint?:string;children:ReactNode}){return <div className="creator-step"><span className="eyebrow">CREATE YOUR FIGHTER</span><h1>{title}</h1>{hint&&<p className="creator-hint">{hint}</p>}<div className="choice-grid">{children}</div></div>}
