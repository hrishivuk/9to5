import {itemById,type ItemId} from './items';
export type CardId = 'defend'|'ship'|'force'|'summon';
export type Card = {id:CardId;name:string;cost:number;type:string;expected:string;description:string;flavor:string;icon:string;color:string};
export const cards:Card[]=[
{id:'defend',name:'WORKS ON MY MACHINE',cost:0,type:'Defence',expected:'BLOCK 70%',description:'Reduces the next incoming attack.',flavor:'Cannot reproduce.',icon:'⌘',color:'mint'},
{id:'ship',name:'SHIP IT',cost:1,type:'Attack',expected:'24–32 DAMAGE',description:'Reliable attack. Questionable QA.',flavor:'Requirements were more of a suggestion.',icon:'↗',color:'orange'},
{id:'force',name:'FORCE PUSH',cost:2,type:'Risk attack',expected:'35–45 DAMAGE',description:'25% chance: you take 10.',flavor:'Confidence level: concerning.',icon:'>_',color:'purple'},
{id:'summon',name:'STACK OVERFLOW SUMMON',cost:2,type:'Copy',expected:'70% OF PREVIOUS DAMAGE',description:'Repeats your previous damaging move.',flavor:'Someone solved this in 2014.',icon:'≋',color:'yellow'}];
export const fighters={player:{name:'HRISHI',title:'Frontend Developer',className:'Builder class'},enemy:{name:'THE SCRUM LORD',title:'Corporate Boss',className:'Management class'}};
export type EnemyId='call'|'scope'|'standup'|'ceremony';
export const enemyMoves:Record<EnemyId,{name:string;min:number;max:number;flavor:string}>={call:{name:'QUICK CALL?',min:15,max:22,flavor:'This could have been a message.'},scope:{name:'SCOPE CREEP',min:8,max:14,flavor:'Just one tiny addition.'},standup:{name:'DAILY STANDUP',min:10,max:15,flavor:'Yesterday. Today. Blockers.'},ceremony:{name:'ANOTHER CEREMONY',min:25,max:32,flavor:'We need a meeting to discuss the meeting.'}};
export type BattleState = {
 player:number; enemy:number; caffeine:number; round:number;
 previousDamage:number; previousCard:CardId|null; buff:number;
 lastEnemy:EnemyId|null; repeat:number; finisher:string;
 items:ItemId[];maxCaffeine:number;headphonesUsed:boolean;macbookUsed:boolean;
 result:'win'|'loss'|'draw'|null;
};
export type BeatKind = 'select'|'player-intro'|'player'|'recoil'|'enemy-turn'|'enemy-intro'|'enemy'|'status'|'heal'|'chaos-intro'|'chaos'|'refill'|'defeat';
export type Beat = {
 kind:BeatKind; duration:number; state:BattleState; text:string; detail:string;
 playerDamage:number; enemyDamage:number; heal:number; blocked:number;
 beforePlayer:number;beforeEnemy:number;caffeineBefore:number;caffeineAfter:number;
 baseDamage:number;statusBonus:number;incoming:number;equipmentBonus:number;equipmentReduction:number;equipmentLabel:string;
 card:CardId; move?:EnemyId; copiedCard?:CardId; log:boolean;
};
export const initialBattle=(player=100,items:ItemId[]=[]):BattleState=>{const maxCaffeine=3+(items.includes('double-espresso')?itemById('double-espresso').effect.value:0);return {player,enemy:100,caffeine:maxCaffeine,maxCaffeine,round:0,previousDamage:0,previousCard:null,buff:0,lastEnemy:null,repeat:0,finisher:'',items:[...items],headphonesUsed:false,macbookUsed:false,result:null}};
export function disabledReason(s:BattleState,c:Card){return s.result?'Battle complete':s.caffeine<c.cost?'Not enough caffeine':c.id==='summon'&&!s.previousDamage?'Play an attack first':''}
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
function result(s:BattleState){s.result=s.player===0&&s.enemy===0?'draw':s.player===0?'loss':s.enemy===0?'win':null;}

/** Immutable snapshots form a playable timeline. Only this resolver rolls randomness. */
export function resolveRound(current:BattleState,id:CardId,rng:()=>number=Math.random,{allowChaos=true}:{allowChaos?:boolean}={}):Beat[]{
 const card=cards.find(c=>c.id===id)!;
 if(disabledReason(current,card))return [];
 const s={...current,round:current.round+1};
 const beats:Beat[]=[];
 const emit=(kind:BeatKind,duration:number,text:string,detail='',extra:Partial<Beat>={})=>{
  beats.push({kind,duration,state:{...s,items:[...s.items]},text,detail,playerDamage:0,enemyDamage:0,heal:0,blocked:0,beforePlayer:s.player,beforeEnemy:s.enemy,caffeineBefore:s.caffeine,caffeineAfter:s.caffeine,baseDamage:0,statusBonus:0,incoming:0,equipmentBonus:0,equipmentReduction:0,equipmentLabel:'',card:id,log:false,...extra});
 };
 const roll=(a:number,b:number)=>a+Math.floor(rng()*(b-a+1));
 const copiedCard=s.previousCard??'ship';
 const caffeineBefore=s.caffeine;s.caffeine-=card.cost;
 emit('select',600,card.cost?'CAFFEINE SPENT':'FREE ACTION',card.cost?`${caffeineBefore} / ${s.maxCaffeine} → ${s.caffeine} / ${s.maxCaffeine}`:'No caffeine spent.',{caffeineBefore,caffeineAfter:s.caffeine});
 emit('player-intro',700,card.name,card.expected,{copiedCard});
 const baseDamage=id==='ship'?roll(24,32):id==='force'?roll(35,45):id==='summon'?Math.round(s.previousDamage*.7):0;
 let equipmentBonus=baseDamage&&s.items.includes('second-monitor')?itemById('second-monitor').effect.value:0;
 let equipmentLabel=equipmentBonus?'SECOND MONITOR':'';
 if(baseDamage&&s.items.includes('company-macbook')&&!s.macbookUsed){equipmentBonus+=itemById('company-macbook').effect.value;equipmentLabel='COMPANY MACBOOK';s.macbookUsed=true;}
 const damage=baseDamage+equipmentBonus;
 const recoil=id==='force'&&rng()<.25?10:0;
 if(damage){s.previousDamage=damage;s.previousCard=id;s.finisher=card.name;}
 const beforeEnemy=s.enemy;
 s.enemy=clamp(s.enemy-damage);
 // A lethal Force Push still pays its recoil before the final outcome is decided.
 if(!recoil)result(s);
 emit('player',750,`HRISHI used ${card.name}.`,card.flavor,{enemyDamage:damage,beforeEnemy,baseDamage,equipmentBonus,equipmentLabel,copiedCard,log:true});
 if(recoil){
  const beforePlayer=s.player;
  s.player=clamp(s.player-10);result(s);if(s.result==='loss')s.finisher='PRODUCTION INCIDENT';
  emit('recoil',750,'PRODUCTION INCIDENT','This seemed safer locally.',{playerDamage:10,beforePlayer,incoming:10,log:true});
 }
 if(!s.result){
  // 45/20/20/15. Never chain healing or Scope Creep; other moves repeat at most twice.
  const pool:EnemyId[]=[...Array<EnemyId>(9).fill('call'),...Array<EnemyId>(4).fill('standup'),...Array<EnemyId>(4).fill('scope'),...Array<EnemyId>(3).fill('ceremony')];
  const choices=pool.filter(m=>m!==s.lastEnemy||(s.repeat<2&&m!=='standup'&&m!=='scope'));
  const move=choices[Math.floor(rng()*choices.length)];const definition=enemyMoves[move];
  emit('enemy-turn',650,"SCRUM LORD'S TURN",'Stand by for an unnecessary escalation.',{move});
  emit('enemy-intro',700,definition.name,`${definition.min}–${definition.max} DAMAGE`,{move});
  const baseDamage=roll(definition.min,definition.max);const statusBonus=s.buff;const incoming=baseDamage+statusBonus;
  let equipmentReduction=0;let equipmentLabel='';
  if(s.items.includes('headphones')&&!s.headphonesUsed){equipmentReduction=Math.round(incoming*itemById('headphones').effect.value/100);equipmentLabel='HEADPHONES';s.headphonesUsed=true;}
  if(s.items.includes('ergonomic-chair')){equipmentReduction+=itemById('ergonomic-chair').effect.value;equipmentLabel=equipmentLabel?'HEADPHONES + CHAIR':'ERGONOMIC CHAIR';}
  const equippedIncoming=Math.max(0,incoming-equipmentReduction);
  const hit=id==='defend'?Math.round(equippedIncoming*.3):equippedIncoming;
  const blocked=incoming-hit;
  const beforePlayer=s.player;
  s.buff=0;s.repeat=s.lastEnemy===move?s.repeat+1:1;s.lastEnemy=move;
  s.player=clamp(s.player-hit);result(s);if(s.result)s.finisher=definition.name;
  emit('enemy',750,`The Scrum Lord used ${definition.name}.`,definition.flavor,{move,playerDamage:hit,blocked,beforePlayer,baseDamage,statusBonus,incoming,equipmentReduction,equipmentLabel,log:true});
  if(!s.result&&move==='scope'){
   s.buff=8;emit('status',700,'JUST ONE SMALL CHANGE','Next Scrum Lord attack: +8 damage.',{move,log:true});
  }
  if(!s.result&&move==='standup'){
   const healed=Math.min(4,100-s.enemy);s.enemy=clamp(s.enemy+healed);
   emit('heal',650,healed?`+${healed} MENTAL CAPACITY`:'ALREADY AT CAPACITY','Meeting successfully completed. Nothing was decided.',{move,heal:healed,log:true});
  }
 }
 if(!s.result&&allowChaos&&rng()<.2){
  emit('chaos-intro',1000,'4:59 PM','HEY — QUICK ONE BEFORE YOU LOG OFF?');
  const beforePlayer=s.player;const beforeEnemy=s.enemy;
  s.player=clamp(s.player-5);s.enemy=clamp(s.enemy-5);result(s);
  if(s.result)s.finisher='4:59 PM MESSAGE';
  emit('chaos',900,'4:59 PM MESSAGE','YOU −5 · SCRUM LORD −5',{playerDamage:5,enemyDamage:5,beforePlayer,beforeEnemy,log:true});
 }
 if(!s.result){const caffeineBefore=s.caffeine;const refill=Math.min(1,s.maxCaffeine-s.caffeine);s.caffeine+=refill;
 emit('refill',700,refill?'CAFFEINE +1':'CAFFEINE FULL',refill?`${caffeineBefore} / ${s.maxCaffeine} → ${s.caffeine} / ${s.maxCaffeine}`:'No refill needed.',{caffeineBefore,caffeineAfter:s.caffeine});}
 if(s.result)emit('defeat',1200,s.result==='win'?'BOSS MANAGED':s.result==='loss'?'EMPLOYEE NOT RESPONDING':'MUTUAL BURNOUT','Performance review complete.');
 return beats;
}
