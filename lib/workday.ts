import type {FighterProfile} from './fighter';
import {generateRewardChoices,officeItems,type ItemId} from './items';
export const WORKDAY_STORAGE_KEY='9to5-workday-run';
export type EncounterId='scrum-lord';
export type RunStatus='active'|'reward-pending'|'prototype-complete'|'failed';
export type WorkdayRun={version:2;fighter:FighterProfile;currentTime:'09:00'|'09:30'|'09:42'|'09:47';currentEncounter:EncounterId;mentalCapacity:number;completedEncounters:EncounterId[];items:ItemId[];rewardChoices:ItemId[];status:RunStatus};
export type ScheduleEntry={time:string;id:'clock-in'|EncounterId|'redacted-1'|'redacted-2'|'redacted-3'|'clock-out';title:string;detail:string};
export const workdaySchedule:ScheduleEntry[]=[
 {time:'09:00',id:'clock-in',title:'CLOCK IN',detail:'Status: regrettably online.'},
 {time:'09:30',id:'scrum-lord',title:'THE SCRUM LORD',detail:'First meeting'},
 {time:'11:15',id:'redacted-1',title:'???',detail:'Details hidden by management.'},
 {time:'14:00',id:'redacted-2',title:'???',detail:'Threat assessment pending.'},
 {time:'16:59',id:'redacted-3',title:'???',detail:'Private appointment.'},
 {time:'17:00',id:'clock-out',title:'CLOCK OUT',detail:'Protected by labour law.'}
];
export const createWorkdayRun=(fighter:FighterProfile):WorkdayRun=>({version:2,fighter,currentTime:'09:00',currentEncounter:'scrum-lord',mentalCapacity:100,completedEncounters:[],items:[],rewardChoices:[],status:'active'});
export const completeScrumLord=(run:WorkdayRun,mentalCapacity:number,rng:()=>number=Math.random):WorkdayRun=>({...run,currentTime:'09:47',mentalCapacity,completedEncounters:['scrum-lord'],rewardChoices:generateRewardChoices(rng),status:'reward-pending'});
export const claimItem=(run:WorkdayRun,item:ItemId):WorkdayRun=>run.status==='reward-pending'&&run.rewardChoices.includes(item)?{...run,items:[...run.items,item],rewardChoices:[],status:'prototype-complete'}:run;
export const failWorkday=(run:WorkdayRun):WorkdayRun=>({...run,currentTime:'09:42',mentalCapacity:0,status:'failed'});
export function loadWorkdayRun(raw:string|null):WorkdayRun|null{try{const parsed=JSON.parse(raw??'null') as (Partial<WorkdayRun>&{version?:number})|null;if(!parsed||!parsed.fighter||parsed.currentEncounter!=='scrum-lord'||!['active','reward-pending','prototype-complete','failed'].includes(parsed.status??''))return null;const valid=new Set(officeItems.map(item=>item.id));const items=Array.isArray(parsed.items)?parsed.items:[];const rewardChoices=Array.isArray(parsed.rewardChoices)?parsed.rewardChoices:[];if(!items.every(id=>valid.has(id))||!rewardChoices.every(id=>valid.has(id))||new Set(rewardChoices).size!==rewardChoices.length)return null;return {...parsed,version:2,items,rewardChoices} as WorkdayRun}catch{return null}}
