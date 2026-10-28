import {comboInfo,comboLabel} from './score-combo.js';
import {beatmapAverageRows} from './beatmap-averages.js';
import {CLUBS,CLUB_COLORS} from './clubs.js';
import {assignMappingClub,mappingClubArtwork} from './mapping-clubs.js';
import {mappingOnly} from './eligibility.js';
import {rarityText} from './medals.js';
import {favoriteModLabel,favoriteModNote} from './mods.js';
import {accuracyRank,formatScoreAccuracy} from './accuracy.js';

const pink='#fa82b5',muted='#b6a9c2',white='#f6f0fa',blue='#8edcff';
const gradeColors={X:'#ffd46b',SS:'#ffd46b',S:'#ffd46b',XH:'#dce2e8',SSH:'#dce2e8',SH:'#dce2e8',A:'#b8eb9d',B:'#84caff',C:'#c292f2',D:'#ff7b86'};
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];

export async function createLandscapeRecap(data,assets){
 const onlyMapping=mappingOnly(data),mapping=data.mapping?.status==='ready'&&data.mapping.created>0?data.mapping:null;
 const top=onlyMapping?[]:(data.top||[]).slice(0,5),rows=onlyMapping?[]:beatmapAverageRows(data);
 const mappers=onlyMapping?[]:(data.mappers||[]).slice(0,5),artists=onlyMapping?[]:(data.artists||[]).slice(0,5);
 const [avatar,covers,medal,upload,mapperAvatars,artistAvatars,modArt]=await Promise.all([
  assets.avatarImage(data.user.id),Promise.all(top.map(score=>assets.coverImage(score.cover))),
  onlyMapping?null:assets.recapMedalImage(data.rarestMedal),assets.coverImage(mapping?.mostPopular?.cover),
  Promise.all(mappers.map(mapper=>assets.avatarImage(mapper.userId))),
  Promise.all(artists.map(async artist=>(await assets.artistImage(artist.name))||await assets.coverImage(artist.cover))),
  Promise.all((onlyMapping?[]:data.favoriteMod?.mods||[]).slice(0,3).map(mod=>assets.recapModImage(mod)))
 ]);
 const mappingY=1016+(rows.length?234:0);
 const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=onlyMapping?1000:mappingY+(mapping?328:0)+96;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 const num=value=>value==null?'Unavailable':Number(value).toLocaleString('en-US',{maximumFractionDigits:0});
 const text=(value,x,y,size=22,color=white,weight=400,width=680)=>{
  ctx.font=weight+' '+size+'px "Segoe UI",sans-serif';ctx.fillStyle=color;
  let label=String(value??'');while(label.length>1&&ctx.measureText(label).width>width)label=label.slice(0,-2)+'…';ctx.fillText(label,x,y);
 };
 const wrap=(value,x,y,width,size=16,color=muted,maxLines=2,lineHeight=size+6)=>{
  const words=String(value||'').split(/\s+/);let line='',row=0;
  for(let i=0;i<words.length;i++){
   ctx.font='400 '+size+'px "Segoe UI",sans-serif';
   if(line&&ctx.measureText(line+' '+words[i]).width>width){
    if(row===maxLines-1){line+=' '+words.slice(i).join(' ');break;}
    text(line,x,y+row*lineHeight,size,color,400,width);row++;line=words[i];
   }else line+=(line?' ':'')+words[i];
  }
  if(line)text(line,x,y+row*lineHeight,size,color,400,width);
 };
 const box=(x,y,w,h,color='#241d2d')=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();};
 const line=(x,y,w)=>{ctx.strokeStyle='#ffffff18';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();};
 const vertical=(x,y,h)=>{ctx.strokeStyle='#ffffff18';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+h);ctx.stroke();};
 const right=(value,x,y,size,color,weight,width)=>{ctx.save();ctx.textAlign='right';text(value,x,y,size,color,weight,width);ctx.restore();};
 const image=(img,x,y,w,h,{contain=false,circle=false}={})=>{
  if(!img)return;const scale=(contain?Math.min:Math.max)(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
  ctx.save();ctx.beginPath();if(circle)ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);else ctx.roundRect(x,y,w,h,10);ctx.clip();ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);ctx.restore();
 };
 const profile=(img,name,x,y,size)=>{
  ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#68445f';ctx.fillRect(x,y,size,size);
  if(img)image(img,x,y,size,size,{circle:true});else{ctx.textAlign='center';text([...String(name||'?')][0].toUpperCase(),x+size/2,y+size*.7,size*.5,white,600,size-4);}ctx.restore();
 };
 const clubIcon=(club,x,y,size,color)=>{
  ctx.save();ctx.translate(x,y);ctx.scale(size/100,size/100);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(50,50,43,0,Math.PI*2);ctx.stroke();ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(club.icon));ctx.restore();
 };
 const dateLabel=value=>{const date=new Date(value);return value&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date)+' - UTC':'Date unavailable';};
 ctx.fillStyle='#15131b';ctx.fillRect(0,0,canvas.width,canvas.height);
 const glow=ctx.createRadialGradient(2250,0,0,2250,0,1150);glow.addColorStop(0,'#71334d70');glow.addColorStop(1,'#15131b00');ctx.fillStyle=glow;ctx.fillRect(1100,0,1300,1000);
 text('osu! wrapped / 2026',64,66,28,pink,700);
 right('ronaldonater.com/osu-wrapped',2336,66,21,muted,500,650);
 text(data.demo?'DEMO - FICTIONAL EXAMPLE':'YOUR YEAR IN RHYTHM',64,103,14,muted,600);
 profile(avatar,data.user.username,64,126,100);
 text(data.user.username+'’s 2026',192,171,46,white,700,2040);
 const mode={osu:'osu!',taiko:'osu!taiko',fruits:'osu!catch',mania:'osu!mania'}[data.mode]||data.mode||'All modes';
 text(mode+' - January 1 - December 31, 2026 (UTC)',192,211,21,muted,400,2000);
 if(!onlyMapping){
  const stats=[
   ['PLAYS IN 2026',num(data.playcount),'Monthly profile history · all modes'],
   ['AVERAGE ACCURACY',data.accuracy==null?'Unavailable':data.accuracy.toFixed(2)+'%','2026 scores in current top 200'],
   ['HIGHEST COMBO',data.combo==null?'Unavailable':num(data.combo)+'×','2026 scores in current top 200'],
   ['MEDALS UNLOCKED',num(data.medals),'Dated achievements · all modes'],
   ['REPLAYS WATCHED',num(data.replayViews),'Monthly profile history · all modes'],
   ['HIGHEST PP',top[0]?num(top[0].pp)+' pp':'Unavailable','2026 score in current top 200']
  ];
  stats.forEach(([label,value,note],i)=>{
   const x=64+(i%3)*246,y=252+Math.floor(i/3)*137,w=228;
   box(x,y,w,121,i===0?pink:'#241d2d');text(label,x+16,y+28,13,i===0?'#563045':muted,700,w-32);
   if(i===1){ctx.save();ctx.textBaseline='alphabetic';ctx.font='700 30px "Segoe UI",sans-serif';const bounds=ctx.measureText(value),ascent=bounds.actualBoundingBoxAscent??23,descent=bounds.actualBoundingBoxDescent??0;text(value,x+16,y+64+(ascent-descent)/2,30,white,700,155);ctx.restore();}else{text(value,x+16,y+78,37,i===0?'#281820':white,700,w-32);}
   if(i===1){const rank=accuracyRank(data.accuracy);if(rank){ctx.fillStyle='#15131b';ctx.beginPath();ctx.roundRect(x+w-52,y+46,36,36,7);ctx.fill();ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='800 23px "Segoe UI",sans-serif';const bounds=ctx.measureText(rank),left=bounds.actualBoundingBoxLeft??0,right=bounds.actualBoundingBoxRight??bounds.width,ascent=bounds.actualBoundingBoxAscent??17,descent=bounds.actualBoundingBoxDescent??0;text(rank,x+w-34-(right-left)/2,y+64+(ascent-descent)/2,23,gradeColors[rank],800,32);ctx.restore();}}
   wrap(note,x+16,y+105,w-32,12,i===0?'#633b50':muted,2,16);
  });
  const peak=(data.months||[]).filter(month=>month.available).reduce((a,b)=>!a||b.count>a.count?b:a,null),month=peak?months[peak.month]:'Unavailable';
  box(64,526,720,110,'#282231');ctx.save();ctx.beginPath();ctx.roundRect(64,526,720,110,18);ctx.clip();ctx.fillStyle=pink;ctx.fillRect(64,526,5,110);ctx.restore();
  text('MOST ACTIVE MONTH',88,556,14,pink,700,430);text(month,88,595,32,white,700,430);text('Monthly profile history · all modes',88,624,14,muted,400,430);
  vertical(548,548,66);right(peak?num(peak.count):'Unavailable',760,593,33,'#c5eda7',700,190);right(peak?'plays in '+month:'No history returned',760,622,14,muted,400,190);
  box(64,652,720,94,'#282231');text('FAVORITE MOD',88,680,14,pink,700,660);
  let modX=88;for(const art of modArt){if(!art)continue;image(art,modX,696,52,36,{contain:true});modX+=58;}
  text(favoriteModLabel(data.favoriteMod),modX,725,28,white,700,Math.max(120,440-modX));
  wrap(favoriteModNote(data.favoriteMod)+' · Individual mods in your 2026 selection',460,705,300,13,muted,2,19);
  box(64,762,720,224,'#282231');
  const club=CLUBS[data.club?.id],secondary=CLUBS[data.club?.secondary?.id];
  const drawTrait=(trait,result,label,y)=>{const color=CLUB_COLORS[result.id]||pink;clubIcon(trait,80,y+2,88,color);text(label,184,y+13,12,color,700,576);text(trait.name,184,y+42,27,color,700,576);text(trait.motto,184,y+67,17,white,500,576);wrap(result.reason,184,y+88,576,12,muted,1,16);};
  if(club){drawTrait(club,data.club,'YOUR PLAYSTYLE CLUB',774);if(secondary){line(88,874,672);drawTrait(secondary,data.club.secondary,'SECONDARY ARCHETYPE',880);}}
  else{text('YOUR PLAYSTYLE CLUB',88,853,14,pink,700);text('Your club is taking shape.',88,899,29,white,700);}

  box(812,252,760,734);text('YOUR TOP 5 PLAYS',836,287,22,pink,700,700);text('2026 scores in your current top 200 · '+mode,836,312,14,muted,400,700);
  if(!top.length)text('No 2026 PP scores found in your current top 200.',836,385,22,muted,400,710);
  top.forEach((score,i)=>{
   const y=326+i*137;
   text(String(i+1).padStart(2,'0'),836,y+51,17,muted,600,34);
   ctx.save();ctx.beginPath();ctx.roundRect(880,y+10,104,76,9);ctx.clip();ctx.fillStyle='#68445f';ctx.fillRect(880,y+10,104,76);image(covers[i],880,y+10,104,76);ctx.fillStyle='#15131b66';ctx.fillRect(880,y+10,104,76);
   const grade=({X:'SS',XH:'SS',SSH:'SS',SH:'S'})[score.rank]||score.rank||'—';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.shadowOffsetY=2;text(grade,932,y+61,34,gradeColors[score.rank]||white,800,94);ctx.restore();
   text(score.title,1004,y+30,24,white,600,350);text(score.artist+' · '+(score.version||'Unknown difficulty'),1004,y+58,16,muted,400,350);text('Mapped by '+score.creator+' · '+score.mods,1004,y+84,15,muted,400,350);
   right(num(score.pp)+' pp',1548,y+30,26,pink,700,170);right(comboLabel(score),1548,y+58,15,comboInfo(score).fullCombo?'#b7e58b':white,500,170);ctx.font='500 15px "Segoe UI",sans-serif';const comboWidth=ctx.measureText(comboLabel(score)).width;right(formatScoreAccuracy(score.accuracy)+' ·',1548-comboWidth-8,y+58,15,white,500,170-comboWidth-8);right(dateLabel(score.date),1548,y+84,13,muted,400,170);
   if(i<4)line(836,y+117,712);
  });
  const rankings=(title,list,x,avatars)=>{
   box(x,252,354,454);text(title,x+20,286,19,pink,700,314);
   if(!list.length)text('No scores to rank.',x+20,365,19,muted,400,314);
   list.forEach((row,i)=>{const y=333+i*85;text(String(i+1).padStart(2,'0'),x+20,y+4,14,muted,600,27);profile(avatars[i],row.name,x+53,y-24,42);text(row.name,x+107,y+4,20,white,600,188);right(num(row.count),x+334,y+4,21,pink,700,30);if(i<4)line(x+20,y+39,314);});
  };
  rankings('TOP 5 MAPPERS',mappers,1600,mapperAvatars);rankings('TOP 5 ARTISTS',artists,1982,artistAvatars);
  text('Ranked by selected score count, not yearly attempts.',1600,740,14,muted,400,736);text('Artist images: TheAudioDB.com.',1600,764,14,muted,400,736);
  box(1600,808,736,178,'#282231');
  const medalData=data.rarestMedal;
  const medalLines=[
   [medalData?.name||(data.rarestMedalStatus==='none'?'No medals earned in 2026':'Medal rarity unavailable'),32,700],
   [medalData?rarityText(medalData.rarityPercent)+' of Osekai-tracked users · current estimate':'',16,400],
   [medalData?'Earned '+dateLabel(medalData.earnedAt)+' · Source: osekai.net':'',15,400],
   ['RAREST MEDAL EARNED - 2026',13,700]
  ];
  const medalWidth=Math.min(medal?536:688,Math.max(...medalLines.map(([label,size,weight])=>{ctx.font=weight+' '+size+'px "Segoe UI",sans-serif';return ctx.measureText(label).width;})));
  const medalStart=1624,medalX=medalStart+(medal?144:0);
  image(medal,medalStart,837,120,120,{contain:true});
  text(data.demo?'EXAMPLE MEDAL / DEMO':data.rarestMedalStatus==='partial'?'RAREST MATCHED MEDAL - 2026':'RAREST MEDAL EARNED - 2026',medalX,842,14,pink,700,medalWidth);
  text(medalData?.name||(data.rarestMedalStatus==='none'?'No medals earned in 2026':'Medal rarity unavailable'),medalX,886,32,white,700,medalWidth);
  if(medalData){text(rarityText(medalData.rarityPercent)+' of Osekai-tracked users · current estimate',medalX,923,16,muted,400,medalWidth);text('Earned '+dateLabel(medalData.earnedAt)+' · Source: osekai.net',medalX,957,15,muted,400,medalWidth);}
  if(rows.length){
   box(64,1016,2272,206,'#202934');text('YOUR AVERAGE BEATMAP',88,1049,17,blue,700,1600);right(data.beatmapAverages.total+' selected scores',2312,1049,16,muted,400,350);
   const width=2224/rows.length;rows.forEach((row,i)=>{const x=88+i*width;text(row.label,x,1084,15,muted,500,width-20);text(row.adjusted,x,1125,32,blue,700,width-20);text('Base: '+row.base,x,1156,16,muted,400,width-20);text(row.count+' scores',x,1182,14,muted,400,width-20);});
   text('Mod-adjusted values / unweighted means / coverage varies by metric',88,1206,12,muted,400,2200);
  }
 }
 if(mapping){
  const y=onlyMapping?252:mappingY,h=onlyMapping?640:300;
  box(64,y,2272,h,'#202934');text('YOUR MAPPING YEAR / ALL MODES',88,y+33,18,blue,700,2000);
  const mappingStats=[[mapping.created,'mapsets submitted in 2026',blue],[mapping.ranked,'of those currently ranked','#b7e58b'],[mapping.totalPlays,'all-time plays on these mapsets','#ffd46b']];
  mappingStats.forEach(([value,label,color],i)=>{if(i)vertical(60+i*760,y+58,66);ctx.save();ctx.textAlign=i===1?'center':i===2?'right':'left';const x=i===1?1200:i===2?2312:88;text(num(value),x,y+91,40,color,700,700);text(label,x,y+121,17,white,400,700);ctx.restore();});
  text('Hosted mapsets only. First submission date (UTC); current ranked status.',88,y+147,14,muted,400,2200);line(88,y+166,2224);
  const club=assignMappingClub(mapping),bodyY=y+190;
  if(club){
   ctx.save();ctx.strokeStyle=club.color;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(88,bodyY+8,80,80,18);ctx.stroke();const art=mappingClubArtwork(club.id);ctx.translate(104,bodyY+24);ctx.scale(2,2);ctx.translate(art.x,art.y);ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(art.path));ctx.restore();
   text('YOUR MAPPING CLUB',192,bodyY+9,12,club.color,700,940);text(club.name,192,bodyY+40,28,club.color,700,940);text(club.motto,192,bodyY+67,18,white,500,940);wrap(club.rule,192,bodyY+92,940,14,muted,onlyMapping?3:1,20);
  }
  if(mapping.mostPopular){
   vertical(1198,bodyY-6,onlyMapping?370:96);const popular=mapping.mostPopular,imgW=onlyMapping?320:120,imgH=onlyMapping?220:82,mapY=bodyY+4;
   const titleSize=onlyMapping?31:24,heading=data.demo?'EXAMPLE UPLOADED MAPSET':'MOST-PLAYED 2026 UPLOAD',plays=num(popular.plays)+' all-time plays';
   const available=1082-(upload?imgW+24:0);
   const w=Math.min(available,Math.max(...[[heading,12,700],[popular.title,titleSize,700],[popular.artist,16,400],[plays,17,600]].map(([label,size,weight])=>{ctx.font=weight+' '+size+'px "Segoe UI",sans-serif';return ctx.measureText(String(label||'')).width;})));
   const textRight=upload?2312-imgW-24:2312;
   if(upload)image(upload,2312-imgW,mapY,imgW,imgH);
   right(heading,textRight,mapY+10,12,blue,700,w);right(popular.title,textRight,mapY+41,titleSize,white,700,w);right(popular.artist,textRight,mapY+67,16,muted,400,w);right(plays,textRight,mapY+92,17,blue,600,w);
  }
 }
 const footer=canvas.height-48;line(64,footer-(onlyMapping?24:56),2272);if(!onlyMapping)text('SCORE COVERAGE',64,footer-22,14,pink,700,1450);
 text(onlyMapping?'Hosted mapsets first submitted in 2026 (UTC); ranked status and playcounts are current.':num(data.sampleCount)+' scores dated in 2026 from your current top 200; not a full annual archive.',64,footer,17,muted,400,1450);
 if(!onlyMapping)text('Mapper credits use mapset creators. Profile history may be incomplete. Year to date until 2027.',64,footer+25,15,muted,400,1450);
 right('Independent fan project - Not affiliated with ppy / osu!',2336,footer+(onlyMapping?0:4),16,muted,400,736);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed')),'image/png'));
}
