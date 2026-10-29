import {savedBeatmapCover} from './beatmap-cover.js';
export function artistCover(value){
 try{const url=new URL(value);return url.protocol==='https:'&&['assets.ppy.sh','osu.ppy.sh'].includes(url.hostname)&&!url.username&&!url.password?savedBeatmapCover(url.href):'';}catch{return '';}
}
export function bindArtistFallback(image){
 let tried=false;
 const failed=()=>{const fallback=artistCover(image.dataset.artistCover);if(!tried&&fallback){tried=true;image.src=fallback;}else image.remove();};
 image.addEventListener('error',failed);
 if(image.complete&&!image.naturalWidth&&image.getAttribute('loading')!=='lazy')failed();
}
