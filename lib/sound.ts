/** Original oscillator-only miniatures. No samples, requests, or third-party audio. */
export type SoundName='hover'|'select'|'attack'|'heavy'|'block'|'heal'|'refill'|'chaos'|'win'|'loss'|'denied'|'recoil';
type Note={frequency:number;time:number;duration:number;type?:OscillatorType;end?:number};
const tones:Record<SoundName,Note[]>={
 hover:[{frequency:520,time:0,duration:.025}],
 select:[{frequency:260,time:0,duration:.045},{frequency:520,time:.04,duration:.055}],
 attack:[{frequency:700,end:90,time:0,duration:.11,type:'sawtooth'}],
 heavy:[{frequency:130,end:35,time:0,duration:.19,type:'sawtooth'},{frequency:62,time:.035,duration:.17,type:'triangle'}],
 block:[{frequency:860,end:380,time:0,duration:.13,type:'triangle'}],
 heal:[{frequency:440,time:0,duration:.1},{frequency:660,time:.07,duration:.14}],
 refill:[{frequency:740,time:0,duration:.055},{frequency:990,time:.045,duration:.08}],
 chaos:[{frequency:390,time:0,duration:.1},{frequency:310,time:.12,duration:.1},{frequency:470,time:.24,duration:.13}],
 win:[{frequency:392,time:0,duration:.12},{frequency:494,time:.1,duration:.12},{frequency:587,time:.2,duration:.12},{frequency:784,time:.3,duration:.25}],
 loss:[{frequency:294,time:0,duration:.14},{frequency:233,time:.13,duration:.14},{frequency:147,time:.26,duration:.28}],
 denied:[{frequency:150,time:0,duration:.07,type:'triangle'},{frequency:125,time:.07,duration:.07,type:'triangle'}],
 recoil:[{frequency:420,end:80,time:0,duration:.18,type:'square'}],
};
export class ArcadeSound {
 private context:AudioContext|null=null;
 private master:GainNode|null=null;
 private muted=false;
 private hoverAt=0;
 /** Called only by click/keyboard handlers. Unsupported or blocked audio stays silent. */
 unlock(){
  if(this.muted)return;
  try{
   if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=.075;this.master.connect(this.context.destination);}
   if(this.context.state==='suspended')void this.context.resume().catch(()=>{});
  }catch{/* Audio is optional; gameplay never depends on it. */}
 }
 setMuted(value:boolean){this.muted=value;if(this.master&&this.context)this.master.gain.setTargetAtTime(value?0:.075,this.context.currentTime,.01);}
 play(name:SoundName){
  const ctx=this.context;if(this.muted||!ctx||ctx.state!=='running'||!this.master)return;
  if(name==='hover'){if(ctx.currentTime-this.hoverAt<.09)return;this.hoverAt=ctx.currentTime;}
  for(const note of tones[name]){
   const oscillator=ctx.createOscillator(),envelope=ctx.createGain();const start=ctx.currentTime+note.time;
   oscillator.type=note.type??'sine';oscillator.frequency.setValueAtTime(note.frequency,start);
   if(note.end)oscillator.frequency.exponentialRampToValueAtTime(note.end,start+note.duration);
   envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(name==='hover'?.2:.65,start+.005);envelope.gain.exponentialRampToValueAtTime(.001,start+note.duration);
   oscillator.connect(envelope);envelope.connect(this.master);oscillator.start(start);oscillator.stop(start+note.duration+.01);
   oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
  }
 }
 dispose(){const context=this.context;this.context=null;this.master=null;if(context)void context.close().catch(()=>{});}
}
