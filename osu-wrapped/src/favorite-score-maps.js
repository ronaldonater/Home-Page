import {difficultyMappers} from './mapper-credits.js';
export function favoriteScoreMaps(scores,mappers,artists){
 function mapsFor(matches){const maps=new Map();for(const score of matches){const id=score.beatmap?.id??score.beatmap_id;if(!Number.isSafeInteger(id)||id<=0)continue;const previous=maps.get(id);const pp=Number.isFinite(score.pp)?score.pp:-Infinity;if(previous&&previous.pp>=pp)continue;
  const set=score.beatmapset||{};maps.set(id,{id,setId:set.id??score.beatmap?.beatmapset_id,title:set.title||'Unknown beatmap',artist:set.artist||'Unknown artist',creator:difficultyMappers(score).map(mapper=>mapper.name).join(', ')||set.creator||'Unknown mapper',version:score.beatmap?.version||'Unknown difficulty',cover:set.covers?.['cover@2x']||set.covers?.cover||null,pp});}
  return [...maps.values()].sort((a,b)=>b.pp-a.pp).map(({pp,...map})=>map);
 }
 return {mappers:mappers.map(mapper=>mapsFor(scores.filter(score=>difficultyMappers(score).some(owner=>Number.isSafeInteger(mapper.userId)&&mapper.userId>0?owner.userId===mapper.userId:owner.name===mapper.name)))),artists:artists.map(artist=>mapsFor(scores.filter(score=>score.beatmapset?.artist===artist.name)))};
}
