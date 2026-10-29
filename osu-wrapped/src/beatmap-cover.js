import manifest from './data/demo-images.json' with {type:'json'};
// Reuse only exact, successfully saved beatmap cover URLs. Never avatars or medals.
export function savedBeatmapCover(value){
 if(typeof value!=='string')return value;
 try{const url=new URL(value);
  if(url.origin!=='https://assets.ppy.sh'||url.username||url.password||!/^\/beatmaps\/[1-9]\d*\/covers\/[^/]+\.(?:jpg|jpeg|png|webp)$/i.test(url.pathname))return value;
  const saved=manifest.assets[value];return saved&&!saved.endsWith('/unavailable.svg')?saved:value;
 }catch{return value;}
}
