const finite=value=>typeof value==='number'&&Number.isFinite(value);
const valid=value=>finite(value)&&value>=0?value:null;
const clamp=value=>Math.min(10,value);
export function scoreBeatmapValues(score,mode='osu'){
 const map=score.beatmap||{},mods=(score.mods||[]).map(mod=>typeof mod==='string'?{acronym:mod}:mod).filter(Boolean),names=new Set(mods.map(m=>m.acronym));
 const base={stars:valid(map.difficulty_rating),ar:valid(map.ar),hp:valid(map.drain),bpm:map.bpm>0?valid(map.bpm):null,od:valid(map.accuracy),length:valid(map.total_length),cs:valid(map.cs)};
 const adjusted={...base},attributes=score.wrappedAttributes;
 let rate=1;
 const speed=mods.find(m=>['DT','NC','HT','DC'].includes(m.acronym));
 if(speed){const configured=speed.settings?.speed_change??speed.settings?.speedChange;rate=finite(configured)&&configured>0?configured:['DT','NC'].includes(speed.acronym)?1.5:.75;}
 const variable=['WU','WD','AS'].some(mod=>names.has(mod));
 const supported=new Set(['NM','CL','HD','HR','EZ','DT','NC','HT','DC','FL','NF','SD','PF','SO','RX','AP','AT','CN','TD','MR','RD','DA','FI','1K','2K','3K','4K','5K','6K','7K','8K','9K','10K']);
 const unknown=mods.some(m=>!supported.has(m.acronym));
 for(const [field,multiplier] of [['ar',1.4],['od',1.4],['hp',1.4],['cs',1.3]]){
  if(adjusted[field]===null)continue;
  if(names.has('EZ'))adjusted[field]/=2;
  if(names.has('HR'))adjusted[field]=clamp(adjusted[field]*multiplier);
 }
 const da=mods.find(m=>m.acronym==='DA')?.settings;
 if(da)for(const [field,key] of [['ar','approach_rate'],['od','overall_difficulty'],['hp','drain_rate'],['cs','circle_size']])if(finite(da[key]))adjusted[field]=da[key];
 if(mode==='mania'){
  adjusted.cs=base.cs;const keys=mods.find(m=>/^([1-9]|10)K$/.test(m.acronym));if(keys)adjusted.cs=Number(keys.acronym.slice(0,-1));
 }
 if(rate!==1){
  if(adjusted.bpm!==null)adjusted.bpm*=rate;if(adjusted.length!==null)adjusted.length/=rate;
  if(adjusted.ar!==null&&['osu','fruits'].includes(mode)){
   const ms=(adjusted.ar<5?1800-120*adjusted.ar:1200-150*(adjusted.ar-5))/rate;
   adjusted.ar=ms>1200?(1800-ms)/120:5+(1200-ms)/150;
  }
  if(adjusted.od!==null&&mode==='osu')adjusted.od=(80-(80-6*adjusted.od)/rate)/6;
 }
 const converted=typeof map.mode==='string'&&map.mode!==mode;
 if(converted)base.stars=null;
 const difficultyMods=converted||mods.some(m=>!['NM','CL'].includes(m.acronym));
 if(difficultyMods)adjusted.stars=null;
 if(mode!=='osu'&&difficultyMods)adjusted.od=null;
 if(variable||unknown)for(const field of Object.keys(adjusted))adjusted[field]=null;
 if(attributes&&typeof attributes==='object'){
  if(valid(attributes.star_rating)!==null)adjusted.stars=attributes.star_rating;
  if(finite(attributes.approach_rate))adjusted.ar=attributes.approach_rate;
  if(finite(attributes.overall_difficulty))adjusted.od=attributes.overall_difficulty;
 }
 // AR/CS/OD do not describe the same mechanics in every ruleset.
 if(!['osu','fruits'].includes(mode))base.ar=adjusted.ar=null;
 if(mode==='taiko')base.cs=adjusted.cs=null;
 if(mode==='fruits')base.od=adjusted.od=null;
 return {base,adjusted};
}
export function beatmapAverages(scores,mode){
 const fields=['stars','ar','hp','bpm','od','length','cs'],values=scores.map(score=>scoreBeatmapValues(score,mode));
 const metrics=Object.fromEntries(fields.map(field=>{const result={};for(const kind of ['base','adjusted']){const numbers=values.map(row=>row[kind][field]).filter(finite);result[kind]={value:numbers.length?numbers.reduce((a,b)=>a+b,0)/numbers.length:null,count:numbers.length};}return [field,result];}));
 return {total:scores.length,mode,metrics};
}
export function beatmapAveragesMarkup(data){
 const stats=data?.beatmapAverages;if(!stats?.total)return '';
 const labels={stars:'Star rating',length:'Map length',bpm:'BPM',ar:'Approach rate',od:'Overall difficulty',cs:data.mode==='mania'?'Key count':'Circle size',hp:'HP drain'};
 const fields=Object.keys(labels).filter(field=>!(field==='ar'&&!['osu','fruits'].includes(data.mode))&&!(field==='cs'&&data.mode==='taiko')&&!(field==='od'&&data.mode==='fruits'));
 const format=(value,field)=>value===null?'Unavailable':field==='length'?Math.floor(Math.round(value)/60)+':'+String(Math.round(value)%60).padStart(2,'0'):value.toLocaleString('en-US',{minimumFractionDigits:field==='bpm'?1:2,maximumFractionDigits:field==='bpm'?1:2})+(field==='stars'?' ★':'');
 return '<section class="panel beatmap-averages"><div class="panel-heading"><div><span class="eyebrow">THE PATTERNS YOU PLAYED</span><h3>Your average beatmap.</h3></div><span class="pill">'+stats.total+' selected scores</span></div><div class="beatmap-average-grid">'+fields.map(field=>{const metric=stats.metrics[field];return '<article><span>'+labels[field]+'</span><strong>'+format(metric.adjusted.value,field)+'</strong><small>Mod-adjusted · '+metric.adjusted.count+' scores</small><p>Base: <b>'+format(metric.base.value,field)+'</b> <span>('+metric.base.count+' scores)</span></p></article>';}).join('')+'</div><p class="muted">Unweighted averages across eligible 2026 scores in your current top 200. Length includes breaks and is adjusted for playback speed. Star ratings use current difficulty attributes, not historical ratings at score time.</p></section>';
}

export function beatmapAverageRows(data){
 const stats=data?.beatmapAverages;if(!stats?.total)return [];
 const labels={stars:'Star rating',length:'Map length',bpm:'BPM',ar:'Approach rate',od:'Overall difficulty',cs:data.mode==='mania'?'Key count':'Circle size',hp:'HP drain'};
 const format=(value,field)=>value==null?'Unavailable':field==='length'?Math.floor(Math.round(value)/60)+':'+String(Math.round(value)%60).padStart(2,'0'):value.toLocaleString('en-US',{minimumFractionDigits:field==='bpm'?1:2,maximumFractionDigits:field==='bpm'?1:2})+(field==='stars'?' ★':'');
 return Object.keys(labels).filter(field=>!(field==='ar'&&!['osu','fruits'].includes(data.mode))&&!(field==='cs'&&data.mode==='taiko')&&!(field==='od'&&data.mode==='fruits')).map(field=>({label:labels[field],adjusted:format(stats.metrics[field].adjusted.value,field),base:format(stats.metrics[field].base.value,field),count:stats.metrics[field].adjusted.count}));
}
