import {summarize} from './summary.js';
export function demo(mode='osu'){
 const artists=['Camellia','xi','Yorushika','t+pazolite','YOASOBI','Imperial Circus Dead Decadence','sakuzyo','TUYU','Foreground Eclipse','Sota Fujimori'];
 const mappers=['Sotarks','Monstrata','RLC','Akitoshi','fieryrage','A r M i N','Log Off Now','Nevo','Kroytz','Mir'];
 const titles=['Exit This Earth’s Atomosphere','Blue Zenith','Haru Hisagi','Goodbye Mr. Jack','Into The Night','Uta','Fracture Ray','Compared Child','Wandering, Never Wondering','polygon'];
 const scores=Array.from({length:75},(_,i)=>({id:i+1,pp:Math.max(35,428-i*4.6),accuracy:.993-i*.0006,max_combo:1842-i*17,rank:i%4?'S':'SH',passed:true,ended_at:`2026-${String(i%10+1).padStart(2,'0')}-15T12:00:00Z`,mods:i%3?['HD','DT']:[],beatmap:{version:['Extra','Insane','Another'][i%3]},beatmapset:{title:titles[i%10],artist:artists[i%10],creator:mappers[(i+i%3)%10]}}));
 return {...summarize({id:0,username:'circle enjoyer',country_code:'US',statistics:{pp:7284,global_rank:12408},monthly_playcounts:[1240,1820,1540,2380,1950,2840,3210,2640,2120,1740].map((count,i)=>({start_date:`2026-${String(i+1).padStart(2,'0')}-01`,count})),replays_watched_counts:[{start_date:'2026-01-01',count:382}],user_achievements:Array.from({length:14},()=>({achieved_at:'2026-06-01'}))},scores,mode),demo:true};
}
