import type {FighterProfile} from './fighter';
export const WORKDAY_STORAGE_KEY='9to5-workday-run';
export type EncounterId='scrum-lord';
export type RunStatus='active'|'prototype-complete'|'failed';
export type WorkdayRun={version:1;fighter:FighterProfile;currentTime:'09:00'|'09:30'|'09:42'|'09:47';currentEncounter:EncounterId;mentalCapacity:number;completedEncounters:EncounterId[];status:RunStatus};
export type ScheduleEntry={time:string;id:'clock-in'|EncounterId|'redacted-1'|'redacted-2'|'redacted-3'|'clock-out';title:string;detail:string};
export const workdaySchedule:ScheduleEntry[]=[
 {time:'09:00',id:'clock-in',title:'CLOCK IN',detail:'Status: regrettably online.'},
 {time:'09:30',id:'scrum-lord',title:'THE SCRUM LORD',detail:'First meeting'},
 {time:'11:15',id:'redacted-1',title:'???',detail:'Details hidden by management.'},
 {time:'14:00',id:'redacted-2',title:'???',detail:'Threat assessment pending.'},
 {time:'16:59',id:'redacted-3',title:'???',detail:'Private appointment.'},
 {time:'17:00',id:'clock-out',title:'CLOCK OUT',detail:'Protected by labour law.'}
];
export const createWorkdayRun=(fighter:FighterProfile):WorkdayRun=>({version:1,fighter,currentTime:'09:00',currentEncounter:'scrum-lord',mentalCapacity:100,completedEncounters:[],status:'active'});
export const completeScrumLord=(run:WorkdayRun,mentalCapacity:number):WorkdayRun=>({...run,currentTime:'09:47',mentalCapacity,completedEncounters:['scrum-lord'],status:'prototype-complete'});
export const failWorkday=(run:WorkdayRun):WorkdayRun=>({...run,currentTime:'09:42',mentalCapacity:0,status:'failed'});
export function loadWorkdayRun(raw:string|null):WorkdayRun|null{try{const run=JSON.parse(raw??'null') as WorkdayRun|null;if(!run||run.version!==1||!run.fighter||run.currentEncounter!=='scrum-lord'||!['active','prototype-complete','failed'].includes(run.status))return null;return run}catch{return null}}
