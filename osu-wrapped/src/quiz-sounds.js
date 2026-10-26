// Decode ahead of a quiz tap; retain preloaded HTML audio as a compatibility fallback.
export function createQuizSounds(urls){
 const players=urls.map(url=>{const audio=new Audio(url);audio.preload='auto';audio.volume=.65;audio.load();return audio;});
 let context=null,gain=null,source=null,disposed=false,generation=0;
 const buffers=[];
 try{const Context=window.AudioContext||window.webkitAudioContext;if(Context){context=new Context({latencyHint:'interactive'});gain=context.createGain();gain.gain.value=.65;gain.connect(context.destination);
  urls.forEach((url,index)=>{fetch(url).then(response=>{if(!response.ok)throw Error('Sound unavailable');return response.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).then(buffer=>{if(!disposed)buffers[index]=buffer;}).catch(()=>{});});
 }}catch{context?.close().catch(()=>{});context=null;}
 const unlock=()=>{if(context?.state==='suspended')context.resume().catch(()=>{});};
 const stop=()=>{generation++;if(source){try{source.stop();}catch{}source.disconnect();source=null;}for(const audio of players){audio.pause();audio.currentTime=0;}};
 const setMuted=muted=>{if(gain)gain.gain.value=muted?0:.65;for(const audio of players)audio.muted=muted;};
 function play(correct,muted=false){
  if(disposed)return;stop();setMuted(muted);if(muted)return;
  const index=correct?0:1,buffer=buffers[index],token=generation;
  if(context&&buffer){const start=()=>{if(disposed||generation!==token)return;source=context.createBufferSource();source.buffer=buffer;source.connect(gain);source.start();};if(context.state==='running')start();else context.resume().then(start).catch(()=>{});}
  else{unlock();players[index].play().catch(()=>{});}
 }
 unlock();
 return {play,stop,setMuted,unlock,dispose(){if(disposed)return;disposed=true;stop();for(const audio of players){audio.removeAttribute('src');audio.load();}context?.close().catch(()=>{});}};
}
