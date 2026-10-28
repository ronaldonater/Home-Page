// Decode the counter sample once and play short voices on the audio clock.
export function createCounterSounds(url,{AudioClass=globalThis.Audio,Context=globalThis.AudioContext||globalThis.webkitAudioContext,fetchImpl=fetch,now=()=>performance.now()}={}){
 let context=null,gain=null,buffer=null,offset=0,volume=1,muted=false,disposed=false,lastTick=-Infinity;
 const voices=new Set(),players=Array.from({length:4},()=>{const audio=new AudioClass(url);audio.preload='auto';audio.volume=.3;audio.preservesPitch=false;audio.webkitPreservesPitch=false;audio.load();return audio;});
 function apply(){if(gain)gain.gain.value=muted?0:.3*volume;for(const audio of players){audio.volume=.3*volume;audio.muted=muted;}}
 try{if(Context){context=new Context({latencyHint:'interactive'});gain=context.createGain();gain.connect(context.destination);apply();fetchImpl(url).then(response=>{if(!response.ok)throw Error('Counter sound unavailable');return response.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).then(decoded=>{if(disposed)return;buffer=decoded;
  // Skip encoding/leading silence without changing the bundled audio file.
  let first=decoded.length;for(let channel=0;channel<decoded.numberOfChannels;channel++){const samples=decoded.getChannelData(channel);for(let i=0;i<Math.min(samples.length,decoded.sampleRate*.15);i++)if(Math.abs(samples[i])>.008){first=Math.min(first,i);break;}}
  offset=first<decoded.length?Math.max(0,first/decoded.sampleRate-.002):0;
 }).catch(()=>{});}}catch{context?.close().catch(()=>{});context=null;gain=null;}
 function unlock(){if(context?.state==='suspended')context.resume().catch(()=>{});}
 function stop(){lastTick=-Infinity;for(const voice of voices){try{voice.stop();}catch{}voice.disconnect();}voices.clear();for(const audio of players){audio.pause();audio.currentTime=0;}}
 function play(progress){
  const time=now();if(disposed||muted||volume===0||time-lastTick<40)return;lastTick=time;
  const rate=.5+Math.max(0,Math.min(1,Number(progress)||0))*1.1;
  if(context&&buffer){
   if(context.state!=='running'){unlock();return;} // Never queue stale ticks while mobile audio unlocks.
   if(voices.size>=6)return;
   const voice=context.createBufferSource(),envelope=context.createGain(),start=context.currentTime;
   const length=Math.min(.1,buffer.duration-offset),duration=length/rate;if(length<=0)return;
   voice.buffer=buffer;voice.playbackRate.value=rate;voice.connect(envelope);envelope.connect(gain);
   envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(1,start+.002);envelope.gain.setValueAtTime(1,start+Math.max(.002,duration-.008));envelope.gain.linearRampToValueAtTime(0,start+duration);
   voices.add(voice);voice.onended=()=>{voices.delete(voice);voice.disconnect();envelope.disconnect();};voice.start(start,offset,length);
  }else{
   const audio=players.find(player=>player.paused||player.ended);if(!audio)return;
   audio.playbackRate=rate;audio.currentTime=0;audio.play().catch(()=>{});
  }
 }
 unlock();
 return {play,stop,unlock,setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));apply();},setMuted(value){muted=Boolean(value);apply();},dispose(){if(disposed)return;disposed=true;stop();for(const audio of players){audio.removeAttribute('src');audio.load();}context?.close().catch(()=>{});}};
}
