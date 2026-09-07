'use client';
import {useEffect,useRef,useState} from 'react';
import {ArcadeSound,type SoundName} from '@/lib/sound';
export default function useArcadeSound(){
 const engine=useRef<ArcadeSound|null>(null);const [muted,setMuted]=useState(false);
 useEffect(()=>{const audio=new ArcadeSound();engine.current=audio;try{const saved=localStorage.getItem('9to5-muted')==='true';audio.setMuted(saved);setMuted(saved);}catch{}return()=>{audio.dispose();engine.current=null;};},[]);
 const unlock=()=>engine.current?.unlock();
 const play=(sound:SoundName)=>engine.current?.play(sound);
 const toggle=()=>{const next=!muted;setMuted(next);engine.current?.setMuted(next);if(!next){unlock();play('select');}try{localStorage.setItem('9to5-muted',String(next));}catch{}};
 return {muted,toggle,unlock,play};
}
