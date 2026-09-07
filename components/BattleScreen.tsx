'use client';
import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,MotionConfig} from 'motion/react';
import {cards,initialBattle,resolveRound,disabledReason,type BattleState,type Beat,type CardId} from '@/lib/battle';
import FighterPortrait from './FighterPortrait';
import FighterHUD from './FighterHUD';
import AbilityCard from './AbilityCard';
import BattleLog,{type LogEntry} from './BattleLog';
import ChaosEvent from './ChaosEvent';
import BattleArena from './BattleArena';
import CaffeineMeter from './CaffeineMeter';
import useArcadeSound from './useArcadeSound';
import ResultOverlay from './ResultOverlay';
export default function BattleScreen(){
 const [screen,setScreen]=useState<'title'|'vs'|'battle'>('title');
 const [state,setState]=useState<BattleState>(initialBattle);
 const [busy,setBusy]=useState(false);const [beat,setBeat]=useState<Beat|null>(null);
 const [active,setActive]=useState<CardId|null>(null);const [logs,setLogs]=useState<LogEntry[]>([]);
 const [showResult,setShowResult]=useState(false);const [late,setLate]=useState(false);
 const [denial,setDenial]=useState<{id:number;text:string}|null>(null);
 const lock=useRef(false);const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const denialTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const sound=useArcadeSound();const soundRef=useRef(sound);soundRef.current=sound;
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);if(denialTimer.current)clearTimeout(denialTimer.current);},[]);
 function later(fn:()=>void,ms:number){timers.current.push(setTimeout(fn,ms));}
 function start(){
  sound.unlock();sound.play('select');timers.current.forEach(clearTimeout);timers.current=[];
  setState(initialBattle());setLogs([{id:0,round:0,text:'You clocked in. He chose violence.',detail:'Select a card to begin.'}]);
  setBeat(null);setLate(false);setDenial(null);setShowResult(false);setActive(null);setBusy(false);lock.current=false;
  setScreen('vs');later(()=>setScreen('battle'),1800);
 }
 function unavailable(reason:string){
  if(lock.current||state.result)return;sound.unlock();sound.play('denied');
  if(denialTimer.current)clearTimeout(denialTimer.current);
  setDenial({id:Date.now(),text:reason==='Play an attack first'?'NO ANSWER YET. PLAY AN ATTACK.':'COFFEE FIRST. +1 EACH ROUND.'});
  denialTimer.current=setTimeout(()=>setDenial(null),1100);
 }
 function play(id:CardId){
  if(lock.current||state.result)return;
  const steps=resolveRound(state,id);if(!steps.length)return;
  sound.unlock();lock.current=true;setBusy(true);setActive(id);setDenial(null);
  timers.current.forEach(clearTimeout);timers.current=[];
  function present(step:Beat){
   setState(step.state);setBeat(step);
   if(step.log)setLogs(old=>[...old,{id:old.length,round:step.state.round,text:step.text,detail:step.detail}]);
   const audio=soundRef.current;
   if(step.kind==='select')audio.play('select');
   if(step.kind==='player')audio.play(id==='defend'?'block':id==='force'?'heavy':'attack');
   if(step.kind==='enemy')audio.play(step.blocked?'block':step.move==='ceremony'?'heavy':'attack');
   if(step.kind==='recoil')audio.play('recoil');
   if(step.kind==='heal'&&step.heal)audio.play('heal');
   if(step.kind==='chaos-intro'){setLate(true);audio.play('chaos');}
   if(step.kind==='chaos')audio.play('attack');
   if(step.kind==='refill'&&step.detail==='+1 CAFFEINE')audio.play('refill');
   if(step.kind==='defeat')audio.play(step.state.result==='win'?'win':'loss');
  }
  let delay=0;
  steps.forEach((step,index)=>{if(index===0)present(step);else later(()=>present(step),delay);delay+=step.duration;});
  later(()=>{setBusy(false);lock.current=false;setActive(null);if(steps.at(-1)!.state.result)setShowResult(true);else setBeat(null);},delay);
 }
 return <MotionConfig reducedMotion="user"><main className="game-shell"><header className="site-header"><button className="wordmark" aria-label="9TO5 title" disabled={screen!=='title'}>9<span>TO</span>5<span className="wordmark-dot">®</span></button><span className="header-label">BATTLE CARDS <i/> VOL. 001</span><span className="header-right">A CORPORATE FANTASY ARCADE</span><button className="mute-button" onClick={sound.toggle} aria-pressed={sound.muted} aria-label={sound.muted?'Unmute sound':'Mute sound'}>{sound.muted?'♪ OFF':'♪ ON'}</button></header><AnimatePresence mode="wait">
 {screen==='title'?<motion.section key="title" className="title-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="title-copy"><div className="eyebrow"><span className="live-dot"/> YOUR 9–5. NOW WITH COMBAT.</div><h1>CLOCK IN.<br/><span>THROW</span><br/><span className="outlined">DOWN.</span></h1><p className="title-description">Professional networking was<br/>getting too peaceful.</p><button className="primary-button" onClick={start}>START FIGHT <span>↗</span></button><div className="title-controls">ONE PLAYER <span>•</span> FOUR CARDS <span>•</span> ZERO HR APPROVAL</div></div><div className="title-art"><div className="arena-label">TODAY’S AGENDA: SURVIVE.</div><div className="hero-fighter hero-dev"><div className="fighter-card-top">EMPLOYEE OF THE <s>MONTH</s> MOMENT <span>001</span></div><FighterPortrait/><div className="fighter-card-bottom"><span>HRISHI</span><small>FRONTEND DEVELOPER</small></div></div><div className="hero-fighter hero-boss"><div className="fighter-card-top">THIS MEETING IS MANDATORY <span>B01</span></div><FighterPortrait boss/><div className="fighter-card-bottom"><span>THE SCRUM LORD</span><small>CORPORATE BOSS / LVL. UNNECESSARY</small></div></div><span className="hero-vs">VS</span><div className="sticky-note">No colleagues<br/>were harmed.<br/><b>Emotionally? TBD.</b></div><div className="art-caption">FRONTEND DEVELOPER vs THE SCRUM LORD<br/><span>THE OPEN-PLAN OFFICE · 4:58 PM</span></div></div></motion.section>:screen==='vs'?<motion.section key="vs" className="vs-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><span className="eyebrow">PREPARING YOUR PERFORMANCE REVIEW</span><div className="vs-match"><div><FighterPortrait/><h2>FRONTEND<br/>DEVELOPER</h2></div><strong>VS</strong><div><FighterPortrait boss/><h2>THE<br/>SCRUM LORD</h2></div></div><p>THE OPEN-PLAN OFFICE <span>·</span> ROUND 01</p></motion.section>:<motion.section key="battle" className="battle-screen" initial={{opacity:0}} animate={{opacity:1}}><div className="battle-topline"><span>THE OPEN-PLAN OFFICE <span className="muted">/ BOSS BATTLE 001</span></span><span className="round-pill">ROUND {String(Math.max(1,state.round)).padStart(2,'0')}</span><span>{late?'4:59':'4:58'} PM <span className="live-dot"/></span></div><div className="hud-row"><FighterHUD health={state.player}/><span className="hud-vs">VS</span><FighterHUD boss health={state.enemy} buff={state.buff}/></div><BattleArena state={state} beat={beat} active={active} busy={busy} late={late}/><div className="hand-heading"><div><span className="eyebrow">YOUR HAND</span><span className="hand-hint">One card. One round. Make it count.</span></div><CaffeineMeter value={state.caffeine} beat={beat} denial={denial}/></div><div className="card-hand">{cards.map((card,index)=><AbilityCard key={card.id} card={card} index={index} reason={busy?(active===card.id?'PLAYING…':'Resolving round…'):disabledReason(state,card)} active={active===card.id} locked={busy||!!state.result} onPlay={()=>play(card.id)} onUnavailable={()=>unavailable(disabledReason(state,card))} onHover={()=>{if(!busy)sound.play('hover');}}/>)}</div><BattleLog entries={logs}/>{beat?.kind==='chaos-intro'&&<ChaosEvent/>}{showResult&&<ResultOverlay state={state} onRematch={start} onTitle={()=>{setScreen('title');setShowResult(false);}}/>}</motion.section>}
 </AnimatePresence><footer className="site-footer"><span>© 9TO5 <span>·</span> BUILT DIFFERENT. BILLED HOURLY.</span><span>FICTIONAL FIGHTERS. REAL WORKPLACE TRAUMA. <span className="footer-version">DEMO v0.2</span></span></footer></main></MotionConfig>
}
