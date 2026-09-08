'use client';
import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,MotionConfig} from 'motion/react';
import {cards,initialBattle,resolveRound,disabledReason,type BattleState,type Beat,type CardId} from '@/lib/battle';
import {defaultFighter,type FighterProfile} from '@/lib/fighter';
import FighterPortrait from './FighterPortrait';
import FighterHUD from './FighterHUD';
import AbilityCard from './AbilityCard';
import BattleLog,{type LogEntry} from './BattleLog';
import BattleArena from './BattleArena';
import CaffeineMeter from './CaffeineMeter';
import useArcadeSound from './useArcadeSound';
import ResultOverlay from './ResultOverlay';
import FighterCreator from './FighterCreator';
import StatusPanel from './StatusPanel';
import BattleHelp,{type HelpStep} from './BattleHelp';
import WorkdayScreen from './WorkdayScreen';
import CalendarTransition from './CalendarTransition';
import OfficeLoot from './OfficeLoot';
import {WORKDAY_STORAGE_KEY,claimItem,completeScrumLord,createWorkdayRun,failWorkday,loadWorkdayRun,type WorkdayRun} from '@/lib/workday';
import type {ItemId} from '@/lib/items';
const TUTORIAL_KEY='9to5-battle-tutorial-seen';
const STATUS_TUTORIAL_KEY='9to5-status-tutorial-seen';
export default function BattleScreen(){
 const [screen,setScreen]=useState<'title'|'create'|'reveal'|'workday'|'loot'|'calendar'|'vs'|'battle'>('title');
 const [state,setState]=useState<BattleState>(initialBattle);
 const [fighter,setFighter]=useState<FighterProfile>(defaultFighter);
 const [workday,setWorkday]=useState<WorkdayRun|null>(null);
 const [busy,setBusy]=useState(false);const [beat,setBeat]=useState<Beat|null>(null);
 const [active,setActive]=useState<CardId|null>(null);const [logs,setLogs]=useState<LogEntry[]>([]);
 const [showResult,setShowResult]=useState(false);
 const [denial,setDenial]=useState<{id:number;text:string}|null>(null);
 const [helpStep,setHelpStep]=useState<HelpStep|null>(null);const [tutorialReady,setTutorialReady]=useState(false);
 const [firstGuidance,setFirstGuidance]=useState(false);
 const lock=useRef(false);const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const denialTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const sequence=useRef(0);const resumeTutorial=useRef<(()=>void)|null>(null);
 const sound=useArcadeSound();const soundRef=useRef(sound);soundRef.current=sound;
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);if(denialTimer.current)clearTimeout(denialTimer.current);},[]);
 useEffect(()=>{const saved=loadWorkdayRun(localStorage.getItem(WORKDAY_STORAGE_KEY));if(!saved)return;setWorkday(saved);setFighter(saved.fighter);setState(initialBattle(saved.mentalCapacity,saved.items));setScreen(saved.status==='reward-pending'?'loot':'workday');},[]);
 useEffect(()=>{if(screen!=='battle')return;const seen=localStorage.getItem(TUTORIAL_KEY)==='true';setFirstGuidance(!seen);setTutorialReady(true);if(!seen)setHelpStep('mental');},[screen]);
 function later(fn:()=>void,ms:number){timers.current.push(setTimeout(fn,ms));}
 function wait(ms:number){return new Promise<void>(resolve=>later(resolve,ms));}
 function saveRun(next:WorkdayRun){setWorkday(next);localStorage.setItem(WORKDAY_STORAGE_KEY,JSON.stringify(next));}
 function resetBattle(_next:FighterProfile,health=workday?.mentalCapacity??100,items=workday?.items??[]){
  sequence.current++;
  setState(initialBattle(health,items));setLogs([{id:0,round:0,text:'You joined the meeting. He chose violence.',detail:'Select a card to begin.'}]);
  setBeat(null);setDenial(null);setShowResult(false);setActive(null);setBusy(false);lock.current=false;
 }
 function start(){
  sound.unlock();sound.play('select');timers.current.forEach(clearTimeout);timers.current=[];
  setScreen('create');
 }
 function reveal(next:FighterProfile){
  sound.unlock();sound.play('select');timers.current.forEach(clearTimeout);timers.current=[];
  setFighter(next);setScreen('reveal');
 }
 function clockIn(){const next=createWorkdayRun(fighter);saveRun(next);resetBattle(fighter,100,[]);setScreen('workday');}
 function enterMeeting(){if(!workday||workday.status!=='active')return;sound.unlock();sound.play('select');timers.current.forEach(clearTimeout);timers.current=[];const next={...workday,currentTime:'09:30' as const};saveRun(next);resetBattle(fighter,next.mentalCapacity);setScreen('calendar');later(()=>setScreen('vs'),1000);later(()=>setScreen('battle'),2000);}
 function rematch(){
  sound.unlock();sound.play('select');timers.current.forEach(clearTimeout);timers.current=[];
  resetBattle(fighter,workday?.mentalCapacity??100);setScreen('vs');later(()=>setScreen('battle'),1200);
 }
 function continueWorkday(){if(!workday)return;const next=state.result==='win'?completeScrumLord(workday,state.player):failWorkday(workday);saveRun(next);setShowResult(false);setScreen(state.result==='win'?'loot':'workday');}
 function claimBenefit(id:ItemId){if(!workday)return;saveRun(claimItem(workday,id));}
 function resetRun(){const next=createWorkdayRun(fighter);saveRun(next);resetBattle(fighter,100,[]);setScreen('workday');}
 function newEmployee(){localStorage.removeItem(WORKDAY_STORAGE_KEY);setWorkday(null);resetBattle(defaultFighter,100);setScreen('create');}
 function unavailable(reason:string,cost=0){
  if(lock.current||state.result)return;sound.unlock();sound.play('denied');
  if(denialTimer.current)clearTimeout(denialTimer.current);
  setDenial({id:Date.now(),text:reason==='Play an attack first'?'NO ANSWER YET · PLAY AN ATTACK FIRST':`NEEDS ${cost} CAFFEINE · YOU HAVE ${state.caffeine}`});
  denialTimer.current=setTimeout(()=>setDenial(null),1800);
 }
 async function play(id:CardId){
  if(lock.current||state.result)return;
  const steps=resolveRound(state,id,Math.random,{allowChaos:false});if(!steps.length)return;
  localStorage.setItem(TUTORIAL_KEY,'true');setFirstGuidance(false);
  sound.unlock();lock.current=true;setBusy(true);setActive(id);setDenial(null);
  timers.current.forEach(clearTimeout);timers.current=[];
  function present(step:Beat){
   setState(step.state);setBeat(step);
   if(step.log)setLogs(old=>[...old,{id:old.length,round:step.state.round,text:step.text.replace('HRISHI',fighter.name),detail:step.detail}]);
   const audio=soundRef.current;
   if(step.kind==='select')audio.play('select');
   if(step.kind==='player')audio.play(id==='defend'?'block':id==='force'?'heavy':'attack');
   if(step.kind==='enemy')audio.play(step.blocked?'block':step.move==='ceremony'?'heavy':'attack');
   if(step.kind==='recoil')audio.play('recoil');
   if(step.kind==='heal'&&step.heal)audio.play('heal');
   if(step.kind==='chaos-intro')audio.play('chaos');
   if(step.kind==='chaos')audio.play('attack');
   if(step.kind==='refill'&&step.caffeineAfter>step.caffeineBefore)audio.play('refill');
   if(step.kind==='defeat')audio.play(step.state.result==='win'?'win':'loss');
  }
  const run=++sequence.current;
  for(const step of steps){if(run!==sequence.current)return;present(step);await wait(step.duration);
   if(step.kind==='status'&&step.move==='scope'&&localStorage.getItem(STATUS_TUTORIAL_KEY)!=='true'){
    setHelpStep('status');await new Promise<void>(resolve=>{resumeTutorial.current=resolve;});
   }
  }
  if(run!==sequence.current)return;setBusy(false);lock.current=false;setActive(null);if(steps.at(-1)!.state.result)setShowResult(true);else setBeat(null);
 }
 function closeHelp(){
  if(helpStep==='mental'){setHelpStep('caffeine');return}if(helpStep==='caffeine'){setHelpStep('cards');return}
  if(helpStep==='status'){localStorage.setItem(STATUS_TUTORIAL_KEY,'true');setHelpStep(null);resumeTutorial.current?.();resumeTutorial.current=null;return}
  setHelpStep(null);
 }
 return <MotionConfig reducedMotion="user"><main className="game-shell"><header className="site-header"><button className="wordmark" aria-label="9TO5 title" disabled={screen!=='title'}>9<span>TO</span>5<span className="wordmark-dot">®</span></button><span className="header-label">BATTLE CARDS <i/> VOL. 001</span><span className="header-right">A CORPORATE FANTASY ARCADE</span><button className="mute-button" onClick={sound.toggle} aria-pressed={sound.muted} aria-label={sound.muted?'Unmute sound':'Mute sound'}>{sound.muted?'♪ OFF':'♪ ON'}</button></header><AnimatePresence mode="wait">
 {screen==='title'?<motion.section key="title" className="title-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="title-copy"><div className="eyebrow"><span className="live-dot"/> YOUR 9–5. NOW WITH COMBAT.</div><h1>CLOCK IN.<br/><span>THROW</span><br/><span className="outlined">DOWN.</span></h1><p className="title-description">SURVIVE ONE COMPLETELY<br/>NORMAL WORKDAY.</p><button className="primary-button" onClick={start}>CLOCK IN <span>↗</span></button><div className="title-controls">ONE PLAYER <span>•</span> NO EXPERIENCE REQUIRED <span>•</span> ZERO HR APPROVAL</div></div><div className="title-art"><div className="arena-label">TODAY’S AGENDA: SURVIVE.</div><div className="hero-fighter hero-dev"><div className="fighter-card-top">EMPLOYEE OF THE <s>MONTH</s> MOMENT <span>001</span></div><FighterPortrait/><div className="fighter-card-bottom"><span>{fighter.name}</span><small>{fighter.profession.toUpperCase()} / {fighter.style}</small></div></div><div className="hero-fighter hero-boss"><div className="fighter-card-top">THIS MEETING IS MANDATORY <span>B01</span></div><FighterPortrait boss/><div className="fighter-card-bottom"><span>THE SCRUM LORD</span><small>CORPORATE BOSS / LVL. UNNECESSARY</small></div></div><span className="hero-vs">VS</span><div className="sticky-note">No colleagues<br/>were harmed.<br/><b>Emotionally? TBD.</b></div><div className="art-caption">SURVIVE THE WORKDAY<br/><span>CLOCK IN · ENDURE · CLOCK OUT</span></div></div></motion.section>:screen==='create'?<FighterCreator onReveal={reveal}/>:screen==='reveal'?<motion.section key="reveal" className="reveal-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><span className="eyebrow">FIGHTER CREATED</span><div className="reveal-card"><FighterPortrait/><h2>{fighter.name}</h2><p>{fighter.profession.toUpperCase()} / {fighter.style}</p><div className="stat-grid">{Object.entries(fighter.stats).map(([key,value])=><div key={key}><span>{key}</span><strong>{value}</strong><i style={{width:`${value}%`}}/></div>)}</div></div><button className="primary-button reveal-clock-in" onClick={clockIn}>CLOCK IN <span>↗</span></button></motion.section>:screen==='workday'&&workday?<WorkdayScreen run={workday} onEnter={enterMeeting} onReset={resetRun} onNewEmployee={newEmployee}/>:screen==='loot'&&workday?<OfficeLoot choices={workday.rewardChoices} onClaim={claimBenefit} onDone={()=>setScreen('workday')}/>:screen==='calendar'?<CalendarTransition/>:screen==='vs'?<motion.section key="vs" className="vs-screen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><span className="eyebrow">09:30 / PERFORMANCE REVIEW IN PROGRESS</span><div className="vs-match"><div><FighterPortrait/><h2>{fighter.name}</h2></div><strong>VS</strong><div><FighterPortrait boss/><h2>THE<br/>SCRUM LORD</h2></div></div><p>THE OPEN-PLAN OFFICE <span>·</span> FIRST MEETING</p></motion.section>:<motion.section key="battle" className="battle-screen" initial={{opacity:0}} animate={{opacity:1}}><div className="battle-topline"><span>THE OPEN-PLAN OFFICE <span className="muted">/ 09:30 CALENDAR EVENT</span></span><span className="round-pill">ROUND {String(Math.max(1,state.round)).padStart(2,'0')}</span><span>09:30 <span className="live-dot"/></span><button className="help-button" aria-label="Open battle help" onClick={()=>setHelpStep('help')} disabled={busy}>? HELP</button></div><div className="hud-row"><FighterHUD health={state.player} fighter={fighter}/><span className="hud-vs">VS</span><FighterHUD boss health={state.enemy}/></div><BattleArena state={state} beat={beat} active={active} busy={busy} time="09:30" fighter={fighter}/><StatusPanel state={state} beat={beat} active={active}/><div className="hand-heading"><div><span className="eyebrow">{busy?'RESOLVING ROUND…':'YOUR MOVE'}</span><span className="hand-hint">{busy?'Please hold. Consequences are being processed.':'Pick one card. Then the Scrum Lord acts.'}</span></div><CaffeineMeter value={state.caffeine} max={state.maxCaffeine} beat={beat} denial={denial}/></div><div className="card-hand">{cards.map((card,index)=>{const reason=busy?(active===card.id?'PLAYING…':'RESOLVING ROUND…'):disabledReason(state,card);return <AbilityCard key={card.id} card={card} index={index} reason={reason} guided={firstGuidance&&card.id==='ship'&&!busy&&!helpStep} active={active===card.id} locked={busy||!!state.result||!tutorialReady||!!helpStep} onPlay={()=>play(card.id)} onUnavailable={()=>unavailable(disabledReason(state,card),card.cost)} onHover={()=>{if(!busy)sound.play('hover');}}/>})}</div><BattleLog entries={logs}/>{helpStep&&<BattleHelp step={helpStep} onDone={closeHelp}/>} {showResult&&<ResultOverlay state={state} fighter={fighter} onRematch={rematch} onContinue={continueWorkday}/>}</motion.section>}
 </AnimatePresence><footer className="site-footer"><span>© 9TO5 <span>·</span> BUILT DIFFERENT. BILLED HOURLY.</span><span>FICTIONAL FIGHTERS. REAL WORKPLACE TRAUMA. <span className="footer-version">DEMO v0.4C</span></span></footer></main></MotionConfig>
}
