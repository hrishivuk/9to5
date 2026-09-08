export type ItemId='headphones'|'double-espresso'|'second-monitor'|'ergonomic-chair'|'company-macbook'|'linkedin-premium';
export type ItemCategory='DEFENCE'|'RESOURCE'|'OFFENCE'|'WEIRD';
export type ItemRarity='COMMON'|'UNCOMMON'|'RARE';
export type ItemEffectType='first-enemy-reduction'|'max-caffeine'|'attack-bonus'|'incoming-reduction'|'first-attack-bonus'|'none';
export type OfficeItem={id:ItemId;name:string;category:ItemCategory;rarity:ItemRarity;description:string;shortDescription:string;flavour:string;effect:{type:ItemEffectType;value:number};icon:string;assetTag:string};

export const officeItems:OfficeItem[]=[
 {id:'headphones',name:'NOISE CANCELLING HEADPHONES',category:'DEFENCE',rarity:'UNCOMMON',description:'The first enemy damaging attack in each battle deals 40% less damage.',shortDescription:'First enemy attack: −40% damage',flavour:'You can still see them talking.',effect:{type:'first-enemy-reduction',value:40},icon:'◖◗',assetTag:'AUDIO / NC-40'},
 {id:'double-espresso',name:'DOUBLE ESPRESSO',category:'RESOURCE',rarity:'UNCOMMON',description:'Maximum Caffeine +1. Start battle at the increased maximum.',shortDescription:'Maximum Caffeine +1 · Start full',flavour:'Legally considered breakfast.',effect:{type:'max-caffeine',value:1},icon:'☕☕',assetTag:'CATERING / DBL-01'},
 {id:'second-monitor',name:'SECOND MONITOR',category:'OFFENCE',rarity:'COMMON',description:'All damaging player attacks deal +3 damage.',shortDescription:'Damaging attacks: +3 damage',flavour:'One for work. One for avoiding work.',effect:{type:'attack-bonus',value:3},icon:'▣▣',assetTag:'IT / DISP-02'},
 {id:'ergonomic-chair',name:'ERGONOMIC CHAIR',category:'DEFENCE',rarity:'COMMON',description:'Reduce incoming damaging attacks by 2.',shortDescription:'Incoming attacks: −2 damage',flavour:'Back pain is now a Q4 problem.',effect:{type:'incoming-reduction',value:2},icon:'♿',assetTag:'FACILITIES / ERGO-4'},
 {id:'company-macbook',name:'COMPANY MACBOOK',category:'OFFENCE',rarity:'RARE',description:'The first damaging card played in each battle deals +8 damage.',shortDescription:'First damaging card: +8 damage',flavour:'Property of IT. Emotionally yours.',effect:{type:'first-attack-bonus',value:8},icon:'⌘',assetTag:'IT / MBP-RARE'},
 {id:'linkedin-premium',name:'LINKEDIN PREMIUM',category:'WEIRD',rarity:'RARE',description:'NO OBSERVABLE EFFECT',shortDescription:'NO OBSERVABLE EFFECT',flavour:"We don't know either.",effect:{type:'none',value:0},icon:'in',assetTag:'BENEFITS / ???'}
];

export const itemById=(id:ItemId)=>officeItems.find(item=>item.id===id)!;

/** Fisher–Yates gives three distinct choices and accepts an injected RNG for tests. */
export function generateRewardChoices(rng:()=>number=Math.random,count=3):ItemId[]{
 const pool=officeItems.map(item=>item.id);
 for(let index=pool.length-1;index>0;index--){const target=Math.floor(rng()*(index+1));[pool[index],pool[target]]=[pool[target],pool[index]];}
 return pool.slice(0,Math.min(count,pool.length));
}

export function seededRandom(seed:number){let value=seed>>>0;return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}}
