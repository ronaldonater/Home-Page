const MODES=['osu','taiko','fruits','mania'];
export function rankMapperSets(rows){
 const sets=new Map();for(const row of rows){if(Number.isSafeInteger(row.id)&&row.id>0&&row.status==='ranked'&&new Date(row.ranked_date).getUTCFullYear()===2026&&Number.isSafeInteger(row.user_id)&&row.user_id>0)sets.set(row.id,row);}
 const modes={};
 for(const mode of MODES){const counts=new Map();let totalSets=0;
  for(const row of sets.values()){if(!(row.beatmaps||[]).some(map=>map.mode===mode&&map.convert!==true))continue;totalSets++;const host=counts.get(row.user_id)||{userId:row.user_id,username:row.creator||'Mapper #'+row.user_id,count:0};host.count++;counts.set(row.user_id,host);}
  const sorted=[...counts.values()].sort((a,b)=>b.count-a.count||a.username.localeCompare(b.username,'en')||a.userId-b.userId);let rank=0,lastCount=null;
  modes[mode]={totalSets,totalMappers:sorted.length,top:sorted.slice(0,10).map((host,i)=>{if(host.count!==lastCount)rank=i+1;lastCount=host.count;return {...host,rank};})};
 }
 return {year:2026,totalSets:sets.size,modes};
}
