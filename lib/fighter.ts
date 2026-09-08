export type Profession='Developer'|'Designer'|'Product'|'Marketing'|'Sales'|'Management'|'Other';
export type Strength='Technical'|'Creative'|'Fast'|'Strategic'|'Social'|'Organized'|'Curious'|'Chaotic';
export type Weakness='Meetings'|'Deadlines'|'Documentation'|'Mornings'|'Scope Creep'|'People'|'Overthinking'|'Saying No';
export type FightingStyle='BUILDER'|'CREATIVE'|'OPERATOR'|'SELLER';
export type Stat='Craft'|'Shipping'|'Creativity'|'People'|'Chaos';
export type FighterProfile={name:string;profession:Profession;strengths:Strength[];weakness:Weakness;style:FightingStyle;stats:Record<Stat,number>};
export const professions:Profession[]=['Developer','Designer','Product','Marketing','Sales','Management','Other'];
export const strengths:Strength[]=['Technical','Creative','Fast','Strategic','Social','Organized','Curious','Chaotic'];
export const weaknesses:Weakness[]=['Meetings','Deadlines','Documentation','Mornings','Scope Creep','People','Overthinking','Saying No'];
export const styles:Record<FightingStyle,{description:string;tag:string}>={
 BUILDER:{description:'Ships first. Asks questions later.',tag:'Builds under pressure'},
 CREATIVE:{description:'Wins through weird ideas and visual violence.',tag:'Turns chaos into art'},
 OPERATOR:{description:'Controls the room, the calendar and unfortunately the process.',tag:'Owns the process'},
 SELLER:{description:'Weaponised confidence.',tag:'Closes the room'}
};
export const styleIds=Object.keys(styles) as FightingStyle[];
const baseStats=()=>({Craft:60,Shipping:60,Creativity:60,People:60,Chaos:60});
const modifier=(delta:Partial<Record<Stat,number>>)=>delta;
export const strengthModifiers:Record<Strength,Partial<Record<Stat,number>>>={
 Technical:modifier({Craft:18,People:-6,Chaos:-6,Creativity:-3,Shipping:-3}),
 Creative:modifier({Creativity:18,Craft:-4,Shipping:-5,People:-4,Chaos:-5}),
 Fast:modifier({Shipping:18,Craft:-4,Creativity:-4,People:-5,Chaos:-5}),
 Strategic:modifier({Craft:10,People:10,Shipping:-7,Creativity:-6,Chaos:-7}),
 Social:modifier({People:18,Craft:-6,Shipping:-4,Creativity:-3,Chaos:-5}),
 Organized:modifier({Shipping:10,People:10,Craft:-4,Creativity:-7,Chaos:-9}),
 Curious:modifier({Craft:10,Creativity:10,Shipping:-7,People:-4,Chaos:-9}),
 Chaotic:modifier({Chaos:18,Shipping:-5,Craft:-4,Creativity:-4,People:-5})
};
export const weaknessModifiers:Record<Weakness,Partial<Record<Stat,number>>>={
 Meetings:modifier({People:-14,Craft:8,Chaos:6}),
 Deadlines:modifier({Shipping:-14,Creativity:10,Chaos:4}),
 Documentation:modifier({Craft:-14,Shipping:8,Chaos:6}),
 Mornings:modifier({Shipping:-14,Chaos:10,Craft:4}),
 'Scope Creep':modifier({People:-12,Craft:10,Creativity:2}),
 People:modifier({People:-14,Craft:10,Chaos:4}),
 Overthinking:modifier({Shipping:-14,Craft:8,Creativity:6}),
 'Saying No':modifier({People:-8,Shipping:-6,Chaos:14})
};
export const styleModifiers:Record<FightingStyle,Partial<Record<Stat,number>>>={
 BUILDER:modifier({Craft:10,Shipping:12,Creativity:-7,People:-7,Chaos:-8}),
 CREATIVE:modifier({Creativity:14,Chaos:8,Craft:-6,Shipping:-8,People:-8}),
 OPERATOR:modifier({People:10,Shipping:10,Chaos:-10,Creativity:-5,Craft:-5}),
 SELLER:modifier({People:16,Chaos:6,Craft:-9,Shipping:-5,Creativity:-8})
};
const statKeys:Stat[]=['Craft','Shipping','Creativity','People','Chaos'];
function apply(stats:Record<Stat,number>,delta:Partial<Record<Stat,number>>){
 statKeys.forEach(key=>{stats[key]+=delta[key]??0});
}
function normalize(stats:Record<Stat,number>){
 statKeys.forEach(key=>{stats[key]=Math.max(25,Math.min(95,Math.round(stats[key])))});
 let total=statKeys.reduce((sum,key)=>sum+stats[key],0);
 while(total!==300){
  const direction=total>300?-1:1;
  const key=statKeys.find(item=>direction<0?stats[item]>25:stats[item]<95);
  if(!key)break;
  stats[key]+=direction;total+=direction;
 }
 return stats;
}
export function makeFighter(input:{name:string;profession:Profession;strengths:Strength[];weakness:Weakness;style:FightingStyle}):FighterProfile{
 const stats=baseStats();
 input.strengths.forEach(strength=>apply(stats,strengthModifiers[strength]));
 apply(stats,weaknessModifiers[input.weakness]);
 apply(stats,styleModifiers[input.style]);
 return {...input,name:input.name.trim().slice(0,18)||'CLOCKWATCHER',stats:normalize(stats)};
}
export const defaultFighter=makeFighter({name:'HRISHI',profession:'Developer',strengths:['Technical','Fast','Curious'],weakness:'Meetings',style:'BUILDER'});
