import {difficultyMappers} from './mapper-credits.js';
export function selectedUniqueCounts(scores){
 const mappers=new Set(),artists=new Set(),beatmaps=new Set(),mapsets=new Set();
 for(const score of scores){
  for(const mapper of difficultyMappers(score))mappers.add(mapper.userId===null?'name:'+mapper.name:'id:'+mapper.userId);
  const artist=score.beatmapset?.artist;if(typeof artist==='string'&&artist.trim())artists.add(artist);
  const map=score.beatmap?.id??score.beatmap_id,set=score.beatmapset?.id??score.beatmap?.beatmapset_id;
  if(Number.isSafeInteger(map)&&map>0)beatmaps.add(map);if(Number.isSafeInteger(set)&&set>0)mapsets.add(set);
 }
 return {mappers:mappers.size,artists:artists.size,beatmaps:beatmaps.size,mapsets:mapsets.size};
}
export function uniqueCountText(data,kind){
 const counts=data?.uniqueCounts;const valid=value=>Number.isInteger(value)&&value>=0;
 if(kind==='plays')return valid(counts?.mapsets)?counts.mapsets+' unique '+(counts.mapsets===1?'mapset':'mapsets'):'';
 return ['mappers','artists'].includes(kind)&&valid(counts?.[kind])?counts[kind]+' unique '+(counts[kind]===1?kind.slice(0,-1):kind):'';
}
