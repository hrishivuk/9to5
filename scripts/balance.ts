import {initialBattle,resolveRound,type CardId,type BattleState} from '../lib/battle';
export function seeded(seed:number){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const strategies:Record<string,(s:BattleState,r:()=>number)=>CardId>={
 'ship only':()=> 'ship',
 'aggressive':s=>s.caffeine>=2?'force':'ship',
 'mixed (20% defence)':(s,r)=>{const choice=r();return choice<.2?'defend':choice<.45&&s.caffeine>=2?'force':choice<.6&&s.previousDamage&&s.caffeine>=2?'summon':'ship';},
 'defensive (50% defence)':(s,r)=>r()<.5?'defend':s.caffeine>=2?'force':'ship',
 'defence only':()=> 'defend',
};
const summaries=Object.entries(strategies).map(([strategy,choose])=>{const lengths:number[]=[];let wins=0;for(let seed=1;seed<=2000;seed++){const rng=seeded(seed),decision=seeded(seed+9000);let s=initialBattle();while(!s.result&&s.round<100)s=resolveRound(s,choose(s,decision),rng).at(-1)!.state;lengths.push(s.round);if(s.result==='win')wins++;}lengths.sort((a,b)=>a-b);return {strategy,battles:lengths.length,average:+(lengths.reduce((a,b)=>a+b,0)/lengths.length).toFixed(2),median:lengths[1000],p90:lengths[1800],fourToSixPercent:+(lengths.filter(n=>n>=4&&n<=6).length/20).toFixed(1),winsPercent:wins/20};});
console.log(JSON.stringify(summaries,null,2));
