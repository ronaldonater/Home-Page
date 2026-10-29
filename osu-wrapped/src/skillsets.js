const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const skillsetLabel=name=>({alt:'Alt',speedjack:'Speedjacks',wristjack:'Wristjacks'}[name]||name.replace(/[_-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()));
export function skillsetSummary(scores,mode='osu'){
 let checked=0,tagged=0;const counts=new Map();
 for(const score of scores){const value=score.wrappedSkillsets;if(value?.status!=='ready'||value.mode!==mode)continue;checked++;
  const names=[...new Set((value.names||[]).filter(name=>typeof name==='string'&&/^skillset\/[a-z][a-z0-9_-]{0,50}$/.test(name)))];
  if(names.length)tagged++;for(const name of names)counts.set(name,(counts.get(name)||0)+1);
 }
 const total=scores.length;return {status:checked===total&&total?'ready':checked?'partial':'unavailable',total,checked,tagged,rows:[...counts].map(([tag,count])=>({tag,name:skillsetLabel(tag.slice(9)),count,percentage:total?count/total*100:0})).sort((a,b)=>b.count-a.count||a.tag.localeCompare(b.tag))};
}
export function skillsetCoverage(stats){return stats.tagged+' of '+stats.total+' selected scores have community skillset tags · '+stats.checked+' checked';}
export function skillsetsMarkup(data,{story=false}={}){
 const stats=data?.skillsets;if(!stats?.total)return '';
 const rows=story?(stats.rows||[]).slice(0,5):(stats.rows||[]);
 const scroll=!story&&rows.length>5;
 return '<section class="panel skillsets-panel"><div class="panel-heading"><div><span class="eyebrow">YOUR SIGNATURE PATTERNS</span><h3>Your main skillsets.</h3></div><span class="pill">Community tags</span></div>'+(rows.length?'<ol class="skillset-list'+(scroll?' skillset-list-scroll':'')+'"'+(scroll?' tabindex="0" aria-label="Skillset rankings"':'')+'>'+rows.map((row,i)=>'<li><span class="position">'+String(i+1).padStart(2,'0')+'</span><strong>'+escape(row.name)+'</strong><span class="skillset-numbers"><b>'+row.percentage.toFixed(1)+'%</b><small>'+row.count+' '+(row.count===1?'score':'scores')+'</small></span></li>').join('')+'</ol>':'<p class="muted">'+(stats.checked?'No community skillset tags were found for the checked scores.':'Community skillset tags are currently unavailable.')+'</p>')+'<p class="skillset-coverage">'+escape(skillsetCoverage(stats))+'</p>'+(story?'':'<p class="muted skillset-explanation">Based on community tags for the exact difficulties in your selected scores. Multiple skillsets can apply to one score, so percentages may total over 100%. These describe map patterns, not measured skill proficiency.</p>')+'</section>';
}
