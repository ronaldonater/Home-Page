// A small original two-tone notification, generated locally without an audio download.
export function createCompletionSound({contextFactory=()=>{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;return Audio?new Audio():null;}}={}){
 let context=null;
 function unlock(){
  try{context??=contextFactory();if(context?.state==='suspended')context.resume()?.catch(()=>{});}catch{}
 }
 function play({hidden=false,demo=false,muted=false,volume=1}={}){
  if((!hidden&&!demo)||muted||!context||context.state!=='running')return false;
  try{
   const start=context.currentTime+.02,level=Math.max(0,Math.min(1,Number(volume)||0));if(!level)return false;
   for(const [offset,frequency] of [[0,659.25],[.15,987.77]]){
    const tone=context.createOscillator(),gain=context.createGain();tone.type='sine';tone.frequency.value=frequency;
    gain.gain.setValueAtTime(0,start+offset);gain.gain.linearRampToValueAtTime(.13*level,start+offset+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+offset+.42);
    tone.connect(gain);gain.connect(context.destination);tone.onended=()=>{tone.disconnect();gain.disconnect();};tone.start(start+offset);tone.stop(start+offset+.45);
   }
   return true;
  }catch{return false;}
 }
 return {unlock,play};
}
