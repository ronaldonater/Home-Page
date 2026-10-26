import demoBeatmaps from './data/demo-beatmaps.json' with {type:'json'};
import {summarize} from './summary.js';
export function demo(mode='osu'){
 const maps=demoBeatmaps[mode]||demoBeatmaps.osu;
 // Real map metadata; every score and profile statistic below is fictional.
 const scores=Array.from({length:75},(_,i)=>{const map=maps[i%maps.length];return {id:i+1,pp:Math.max(35,428-i*4.6),accuracy:.993-i*.0006,max_combo:Math.min(map.beatmap.max_combo||1842,1842-i*17),rank:i%3?'SH':'S',passed:true,ended_at:`2026-${String(i%10+1).padStart(2,'0')}-15T12:00:00Z`,mods:i%3?['HD','DT']:[],beatmap:{...map.beatmap},beatmapset:{...map}};});
 return {...summarize({id:0,username:'circle enjoyer',country_code:'US',statistics:{pp:7284,global_rank:12408},monthly_playcounts:[1240,1820,1540,2380,1950,2840,3210,2640,2120,1740].map((count,i)=>({start_date:`2026-${String(i+1).padStart(2,'0')}-01`,count})),replays_watched_counts:[{start_date:'2026-01-01',count:382}],user_achievements:Array.from({length:14},()=>({achieved_at:'2026-06-01'}))},scores,mode),demo:true,rarestMedalStatus:'available',rarestMedal:{id:1,name:'500 Combo',image:'https://assets.ppy.sh/medals/web/osu-combo-500.png',rarityPercent:79.2002,raritySnapshot:'2026-10-25',earnedAt:'2026-06-01T00:00:00Z'},mapping:{status:'ready',created:10,genreCount:5,ranked:3,totalPlays:187654,mostPopular:{id:maps[0].id,title:maps[0].title,artist:maps[0].artist,creator:maps[0].creator,cover:maps[0].covers['cover@2x'],plays:82640,previewUrl:maps[0].preview_url}}};
}
