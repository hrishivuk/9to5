export type CardId = 'defend'|'ship'|'force'|'summon';
export type Card = {id:CardId;name:string;cost:number;type:string;effect:string;flavor:string;icon:string;color:string};
export const cards:Card[]=[
{id:'defend',name:'WORKS ON MY MACHINE',cost:0,type:'Defence',effect:'Block 70% of the next incoming attack.',flavor:'Cannot reproduce.',icon:'⌘',color:'mint'},
{id:'ship',name:'SHIP IT',cost:1,type:'Attack',effect:'Deal 24–32 damage. Deploy first. Ask later.',flavor:'Requirements were more of a suggestion.',icon:'↗',color:'orange'},
{id:'force',name:'FORCE PUSH',cost:2,type:'Risk attack',effect:'Deal 35–45 damage. 25% risk of 10 self-damage.',flavor:'Confidence level: concerning.',icon:'>_',color:'purple'},
{id:'summon',name:'STACK OVERFLOW SUMMON',cost:2,type:'Utility',effect:'Repeat your last attack at 70% damage.',flavor:'Someone solved this in 2014.',icon:'≋',color:'yellow'}];
export const fighters={player:{name:'HRISHI',title:'Frontend Developer',className:'Builder class'},enemy:{name:'THE SCRUM LORD',title:'Corporate Boss',className:'Management class'}};
export type EnemyId='call'|'scope'|'standup'|'ceremony';
export const enemyMoves:Record<EnemyId,{name:string;min:number;max:number;flavor:string}>={call:{name:'QUICK CALL?',min:15,max:22,flavor:'This could have been a message.'},scope:{name:'SCOPE CREEP',min:8,max:14,flavor:'Just one tiny addition.'},standup:{name:'DAILY STANDUP',min:10,max:15,flavor:'Yesterday. Today. Blockers.'},ceremony:{name:'ANOTHER CEREMONY',min:25,max:32,flavor:'We need a meeting to discuss the meeting.'}};
export type BattleState = {
 player:number; enemy:number; caffeine:number; round:number;
 previousDamage:number; previousCard:CardId|null; buff:number;
 lastEnemy:EnemyId|null; repeat:number; finisher:string;
 result:'win'|'loss'|'draw'|null;
};
export type BeatKind = 'select'|'player-intro'|'player'|'recoil'|'enemy-intro'|'enemy'|'status'|'heal'|'chaos-intro'|'chaos'|'refill'|'defeat';
export type Beat = {
 kind:BeatKind; duration:number; state:BattleState; text:string; detail:string;
 playerDamage:number; enemyDamage:number; heal:number; blocked:number;
 card:CardId; move?:EnemyId; copiedCard?:CardId; log:boolean;
};
export const initialBattle=():BattleState=>({player:100,enemy:100,caffeine:3,round:0,previousDamage:0,previousCard:null,buff:0,lastEnemy:null,repeat:0,finisher:'',result:null});
export function disabledReason(s:BattleState,c:Card){return s.result?'Battle complete':s.caffeine<c.cost?'Not enough caffeine':c.id==='summon'&&!s.previousDamage?'Play an attack first':''}
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
function result(s:BattleState){s.result=s.player===0&&s.enemy===0?'draw':s.player===0?'loss':s.enemy===0?'win':null;}

/** Immutable snapshots form a playable timeline. Only this resolver rolls randomness. */
export function resolveRound(current:BattleState,id:CardId,rng:()=>number=Math.random):Beat[]{
 const card=cards.find(c=>c.id===id)!;
 if(disabledReason(current,card))return [];
 const s={...current,round:current.round+1,caffeine:current.caffeine-card.cost};
 const beats:Beat[]=[];
 const emit=(kind:BeatKind,duration:number,text:string,detail='',extra:Partial<Beat>={})=>{
  beats.push({kind,duration,state:{...s},text,detail,playerDamage:0,enemyDamage:0,heal:0,blocked:0,card:id,log:false,...extra});
 };
 const roll=(a:number,b:number)=>a+Math.floor(rng()*(b-a+1));
 const copiedCard=s.previousCard??'ship';
 emit('select',130,'CARD LOCKED IN');
 emit('player-intro',360,card.name,card.flavor,{copiedCard});
 const damage=id==='ship'?roll(24,32):id==='force'?roll(35,45):id==='summon'?Math.round(s.previousDamage*.7):0;
 const recoil=id==='force'&&rng()<.25?10:0;
 if(damage){s.previousDamage=damage;s.previousCard=id;s.finisher=card.name;}
 s.enemy=clamp(s.enemy-damage);
 // A lethal Force Push still pays its recoil before the final outcome is decided.
 if(!recoil)result(s);
 emit('player',380,`HRISHI used ${card.name}.`,card.flavor,{enemyDamage:damage,copiedCard,log:true});
 if(recoil){
  s.player=clamp(s.player-10);result(s);if(s.result==='loss')s.finisher='PRODUCTION INCIDENT';
  emit('recoil',460,'PRODUCTION INCIDENT','This seemed safer locally.',{playerDamage:10,log:true});
 }
 if(!s.result){
  // 45/20/20/15. Never chain healing or Scope Creep; other moves repeat at most twice.
  const pool:EnemyId[]=[...Array<EnemyId>(9).fill('call'),...Array<EnemyId>(4).fill('standup'),...Array<EnemyId>(4).fill('scope'),...Array<EnemyId>(3).fill('ceremony')];
  const choices=pool.filter(m=>m!==s.lastEnemy||(s.repeat<2&&m!=='standup'&&m!=='scope'));
  const move=choices[Math.floor(rng()*choices.length)];const definition=enemyMoves[move];
  emit('enemy-intro',move==='ceremony'?550:420,definition.name,definition.flavor,{move});
  const incoming=roll(definition.min,definition.max)+s.buff;
  const hit=id==='defend'?Math.round(incoming*.3):incoming;
  const blocked=incoming-hit;
  s.buff=0;s.repeat=s.lastEnemy===move?s.repeat+1:1;s.lastEnemy=move;
  s.player=clamp(s.player-hit);result(s);if(s.result)s.finisher=definition.name;
  emit('enemy',380,`The Scrum Lord used ${definition.name}.`,blocked&&move==='call'?'Declined. '+`${blocked} damage blocked.`:definition.flavor+(blocked?` Blocked ${blocked} damage.`:''),{move,playerDamage:hit,blocked,log:true});
  if(!s.result&&move==='scope'){
   s.buff=8;emit('status',230,'+1 SMALL CHANGE','Next boss attack +8. Definitely the last request.',{move,log:true});
  }
  if(!s.result&&move==='standup'){
   const healed=Math.min(4,100-s.enemy);s.enemy=clamp(s.enemy+healed);
   emit('heal',320,healed?`+${healed} MENTAL CAPACITY`:'ALREADY AT CAPACITY','Meeting successfully completed. Nothing was decided.',{move,heal:healed,log:true});
  }
 }
 if(!s.result&&rng()<.2){
  emit('chaos-intro',850,'4:59 PM MESSAGE','Hey — quick one before you log off?');
  s.player=clamp(s.player-5);s.enemy=clamp(s.enemy-5);result(s);
  if(s.result)s.finisher='4:59 PM MESSAGE';
  emit('chaos',440,'4:59 PM MESSAGE','Both fighters lost 5 Mental Capacity.',{playerDamage:5,enemyDamage:5,log:true});
 }
 const refill=Math.min(1,3-s.caffeine);s.caffeine+=refill;
 emit('refill',260,refill?'COFFEE ACQUIRED':'CAFFEINE FULL',refill?'+1 CAFFEINE':'Dignity still pending.');
 if(s.result)emit('defeat',900,s.result==='win'?'BOSS MANAGED':s.result==='loss'?'EMPLOYEE NOT RESPONDING':'MUTUAL BURNOUT','Performance review complete.');
 return beats;
}
