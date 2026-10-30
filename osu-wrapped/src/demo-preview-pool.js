// Demo previews are small bundled files: warm them once and reuse their media buffers.
export function createDemoPreviewPool(slides,makeAudio=source=>new Audio(source)){
 const players=new Map();
 for(const source of new Set(slides.map(slide=>slide.preview).filter(Boolean))){
  const audio=makeAudio(source);audio.preload='auto';audio.load();players.set(source,audio);
 }
 return {
  get(source){const audio=players.get(source);if(audio)audio.currentTime=0;return audio;},
  dispose(){for(const audio of players.values()){audio.pause();audio.removeAttribute('src');audio.load();}players.clear();}
 };
}
