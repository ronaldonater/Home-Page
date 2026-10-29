import {savedBeatmapCover} from './beatmap-cover.js';
import {demoAsset} from './demo-images.js';
import {comboInfo,comboLabel} from './score-combo.js';
import {createLandscapeRecap} from './recap-landscape.js';
import {beatmapAverageRows} from './beatmap-averages.js';
import {mappingOnly} from './eligibility.js';
import {assignMappingClub,mappingClubArtwork} from './mapping-clubs.js';
import {CLUBS,CLUB_COLORS} from './clubs.js';
import {modIconUrl} from './mod-icons.js';
import {favoriteModLabel,favoriteModNote} from './mods.js';
import {medalImageUrl,rarityText} from './medals.js';
import {accuracyRank,formatScoreAccuracy} from './accuracy.js';
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const number=value=>value==null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const pink='#fa82b5',muted='#b6a9c2',white='#f6f0fa';
function avatarImage(userId,demo=false){
 return new Promise(resolve=>{
  if(!Number.isSafeInteger(userId)||userId<=0)return resolve(null);
  const img=new Image();
  const timer=setTimeout(()=>{img.src='';resolve(null);},12000);
  img.onload=()=>{clearTimeout(timer);resolve(img);};
  img.onerror=()=>{clearTimeout(timer);resolve(null);};
  const source='/api/osu-wrapped/avatar?id='+encodeURIComponent(userId);img.src=demo?demoAsset(source):source;
 });
}
export async function createRecap(data,{layout='portrait'}={}){
 if(layout==='landscape')return createLandscapeRecap(data,{avatarImage:id=>avatarImage(id,data.demo),coverImage:url=>coverImage(url,data.demo),artistImage:data.demo?name=>coverImage(data.artists.find(artist=>artist.name===name)?.demoImage,true):artistImage,recapMedalImage:medal=>recapMedalImage(medal,data.demo),recapModImage});
 if(mappingOnly(data))return createMappingRecap(data);
 const topPlays=data.top.slice(0,5);
 const [avatar,covers,mapperAvatars,artistAvatars,medalArt,modArt]=await Promise.all([avatarImage(data.user.id,data.demo),Promise.all(topPlays.map(score=>coverImage(score.cover,data.demo))),Promise.all(data.mappers.slice(0,5).map(mapper=>avatarImage(mapper.userId,data.demo))),Promise.all(data.artists.slice(0,5).map(async artist=>(data.demo?null:await artistImage(artist.name))||await coverImage(artist.demoImage||artist.cover,data.demo))),recapMedalImage(data.rarestMedal,data.demo),Promise.all((data.favoriteMod?.mods||[]).slice(0,3).map(mod=>recapModImage(mod)))]);
 const hasMapping=data.mapping?.status==='ready'&&Number.isSafeInteger(data.mapping.created)&&data.mapping.created>0;
 const mappingCover=hasMapping?await coverImage(data.mapping?.mostPopular?.cover,data.demo):null;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=2434+(hasMapping?290:0)+(data.beatmapAverages?.total?270:0)+(data.skillsets?.rows?.length?210:0);
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 const text=(value,x,y,size=24,color=white,weight=400,maxWidth=1000)=>{
  ctx.font=weight+' '+size+'px "Segoe UI", sans-serif';ctx.fillStyle=color;
  let label=String(value??'');while(label.length>1 && ctx.measureText(label).width>maxWidth)label=label.slice(0,-2)+'…';
  ctx.fillText(label,x,y);
 };
 const box=(x,y,w,h,fill='#241d2d')=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();};
 const line=(x,y,w)=>{ctx.strokeStyle='#ffffff15';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();};
 ctx.fillStyle='#15131b';ctx.fillRect(0,0,canvas.width,canvas.height);
 const glow=ctx.createRadialGradient(1100,0,0,1100,0,900);glow.addColorStop(0,'#71334d70');glow.addColorStop(1,'#15131b00');ctx.fillStyle=glow;ctx.fillRect(0,0,1200,900);
 text('osu! wrapped / 2026',64,78,27,pink,700);
 ctx.save();ctx.textAlign='right';text('ronaldonater.com/osu-wrapped',1136,78,20,muted,500,650);ctx.restore();
 text(data.demo?'DEMO · FICTIONAL EXAMPLE':'YOUR YEAR IN RHYTHM',64,117,15,muted,600);
 ctx.save();ctx.beginPath();ctx.arc(120,213,56,0,Math.PI*2);ctx.clip();ctx.fillStyle='#68445f';ctx.fillRect(64,157,112,112);
 if(avatar){const edge=Math.min(avatar.naturalWidth,avatar.naturalHeight);ctx.drawImage(avatar,(avatar.naturalWidth-edge)/2,(avatar.naturalHeight-edge)/2,edge,edge,64,157,112,112);}
 else{text([...data.user.username][0]?.toUpperCase()||'?',99,232,53,white,700,90);}ctx.restore();
 text(data.user.username+'’s 2026',200,213,48,white,700,936);
 const modeNames={osu:'osu!',taiko:'osu!taiko',fruits:'osu!catch',mania:'osu!mania'};
 text((modeNames[data.mode]||data.mode)+' · January 1 - December 31, 2026 (UTC)',200,251,20,muted,400,930);
 const stats=[['PLAYS IN 2026',number(data.playcount),'Monthly profile history · all modes'],['AVERAGE ACCURACY',data.accuracy==null?'—':data.accuracy.toFixed(2)+'%','2026 scores in current top 200'],['HIGHEST COMBO',data.combo==null?'—':number(data.combo)+'×','2026 scores in current top 200'],['MEDALS UNLOCKED',number(data.medals),'Dated achievements · all modes'],['REPLAYS WATCHED',number(data.replayViews),'Monthly profile history · all modes'],['HIGHEST PP',data.top[0]?Math.round(data.top[0].pp)+' pp':'—','2026 score in current top 200']];
 stats.forEach(([label,value,note],i)=>{const x=64+(i%3)*365,y=310+Math.floor(i/3)*157;box(x,y,342,137,i===0?'#fa82b5':'#241d2d');text(label,x+20,y+30,14,i===0?'#563045':muted,700,302);text(value,x+20,y+83,43,i===0?'#281820':white,700,i===1?225:302);if(i===1){const rank=accuracyRank(data.accuracy);if(rank){const color=({SS:'#ffd46b',S:'#ffd46b',A:'#b8eb9d',B:'#84caff',C:'#c292f2',D:'#ff7b86'})[rank];box(x+270,y+49,52,44,'#15131b');ctx.save();ctx.textAlign='center';text(rank,x+296,y+80,28,color,800,46);ctx.restore();}}text(note,x+20,y+115,13,i===0?'#633b50':muted,400,302);});
 const available=data.months.filter(m=>m.available);const peak=available.reduce((best,m)=>!best||m.count>best.count?m:best,null);
 box(64,640,1072,135,'#282231');
 ctx.save();ctx.beginPath();ctx.roundRect(64,640,1072,135,18);ctx.clip();ctx.fillStyle=pink;ctx.fillRect(64,640,5,135);ctx.restore();
 text('MOST ACTIVE MONTH',92,671,14,pink,700,620);
 text(peak?months[peak.month]:'Unavailable',92,715,36,white,700,620);
 text('Monthly profile history · all modes',92,748,15,muted,400,620);
 ctx.strokeStyle='#ffffff18';ctx.beginPath();ctx.moveTo(790,666);ctx.lineTo(790,749);ctx.stroke();
 ctx.save();ctx.textAlign='right';
 text(peak?number(peak.count):'—',1108,711,40,'#c5eda7',700,280);
 text(peak?'plays in '+months[peak.month]:'No history returned',1108,743,15,muted,400,280);
 ctx.restore();
 box(64,790,1072,96,'#282231');text('FAVORITE MOD',88,818,14,pink,700,300);let modX=88;for(const icon of modArt){if(!icon)continue;ctx.drawImage(icon,modX,830,60,42);modX+=66;}ctx.save();ctx.textBaseline='middle';text(favoriteModLabel(data.favoriteMod),modX,851,32,white,700,Math.max(100,580-modX));ctx.restore();text(favoriteModNote(data.favoriteMod)+' · Individual mods in your 2026 selection',600,846,16,muted,400,510);
 const club=CLUBS[data.club?.id];
 const secondaryResult=data.club?.secondary,secondary=CLUBS[secondaryResult?.id];
 const secondaryColor=CLUB_COLORS[secondaryResult?.id]||pink;
 const clubColor=CLUB_COLORS[data.club?.id]||pink;
 box(64,906,1072,150,'#282231');
 if(club){
  ctx.save();ctx.translate(88,936);ctx.scale(.92,.92);ctx.strokeStyle=clubColor;ctx.lineWidth=1;ctx.beginPath();ctx.arc(50,50,43,0,Math.PI*2);ctx.stroke();ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(club.icon));ctx.restore();
  const clubWidth=secondary?376:900;
  text('YOUR PLAYSTYLE CLUB',200,936,14,clubColor,700,clubWidth);
  text(club.name,200,973,secondary?28:30,clubColor,700,clubWidth);
  text(club.motto,200,1004,secondary?17:20,white,500,clubWidth);
  text(data.club.reason,200,1033,secondary?13:15,muted,400,clubWidth);
  if(secondary){
   ctx.save();ctx.strokeStyle='#ffffff20';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(600,926);ctx.lineTo(600,1036);ctx.stroke();
   ctx.translate(1020,936);ctx.scale(.92,.92);ctx.strokeStyle=secondaryColor;ctx.beginPath();ctx.arc(50,50,43,0,Math.PI*2);ctx.stroke();ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(secondary.icon));ctx.restore();
   ctx.save();ctx.textAlign='right';
   text('SECONDARY ARCHETYPE',1000,936,14,secondaryColor,700,376);
   text(secondary.name,1000,973,28,secondaryColor,700,376);
   text(secondary.motto,1000,1004,17,white,500,376);
   text(secondaryResult.reason,1000,1033,13,muted,400,376);
   ctx.restore();
  }
 }else{
  text('YOUR PLAYSTYLE CLUB',88,942,14,pink,700,1000);
  text('Your club is taking shape.',88,981,28,white,700,1000);
  text('One available 2026 score is needed to assign a playstyle club.',88,1015,17,muted,400,1000);
 }
 ctx.save();ctx.translate(0,290);
 text('YOUR TOP 5 PLAYS',64,831,23,pink,700);text('2026 scores found in your current top 200 · '+(modeNames[data.mode]||data.mode),64,863,17,muted);
 box(64,884,1072,437);
 if(!data.top.length)text('No 2026 PP scores found in your current top 200.',88,946,22,muted);
 topPlays.forEach((score,i)=>{
  const y=892+i*87;
  text(String(i+1).padStart(2,'0'),88,y+43,18,muted,600,34);
  ctx.save();ctx.beginPath();ctx.roundRect(130,y+6,96,64,9);ctx.clip();
  ctx.fillStyle='#68445f';ctx.fillRect(130,y+6,96,64);
  const image=covers[i];
  if(image){const scale=Math.max(96/image.naturalWidth,64/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,130+(96-w)/2,y+6+(64-h)/2,w,h);}
  ctx.fillStyle='#15131b66';ctx.fillRect(130,y+6,96,64);
  const grade=({X:'SS',XH:'SS',SSH:'SS',SH:'S'})[score.rank]||score.rank||'—';
  const color=({X:'#ffd46b',SS:'#ffd46b',S:'#ffd46b',XH:'#dce2e8',SSH:'#dce2e8',SH:'#dce2e8',A:'#b8eb9d',B:'#84caff',C:'#c292f2',D:'#ff7b86'})[score.rank]||white;
  ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.shadowOffsetY=2;
  text(grade,178,y+49,32,color,800,86);ctx.restore();
  text(score.title,246,y+24,24,white,600,662);
  text(score.artist+' · '+(score.version||'Unknown difficulty'),246,y+47,15,muted,400,662);
  text('Mapped by '+score.creator+' · '+score.mods,246,y+68,15,muted,400,662);
  const date=new Date(score.date);
  const dateLabel=score.date && !Number.isNaN(date.getTime())?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date)+' · UTC':'Date unavailable';
  ctx.save();ctx.textAlign='right';text(Math.round(score.pp)+' pp',1112,y+24,26,pink,700,174);text(comboLabel(score),1112,y+47,15,comboInfo(score).fullCombo?'#b7e58b':white,500,174);const comboWidth=ctx.measureText(comboLabel(score)).width;text(formatScoreAccuracy(score.accuracy)+' ·',1112-comboWidth-8,y+47,15,white,500,174-comboWidth-8);text(dateLabel,1112,y+68,13,muted,400,174);ctx.restore();
  if(i<4)line(88,y+82,1024);
 });
 ctx.translate(0,-24);
 const rankings=(title,rows,x,avatars=null)=>{
  text(title,x,1416,22,pink,700,510);box(x,1440,524,344);
  if(!rows.length)text('No 2026 scores to rank.',x+24,1500,20,muted,400,476);
  rows.slice(0,5).forEach((row,i)=>{
   const y=1490+i*64;
   text(String(i+1).padStart(2,'0'),x+24,y,17,muted,600,35);
   if(avatars){
    ctx.save();ctx.beginPath();ctx.arc(x+85,y-8,21,0,Math.PI*2);ctx.clip();ctx.fillStyle='#68445f';ctx.fillRect(x+64,y-29,42,42);
    const avatar=avatars[i];
    if(avatar){const edge=Math.min(avatar.naturalWidth,avatar.naturalHeight);ctx.drawImage(avatar,(avatar.naturalWidth-edge)/2,(avatar.naturalHeight-edge)/2,edge,edge,x+64,y-29,42,42);}
    else{ctx.textAlign='center';text([...row.name][0]?.toUpperCase()||'?',x+85,y,21,white,600,36);}
    ctx.restore();
   }
   text(row.name,x+(avatars?120:65),y,23,white,600,avatars?292:347);
   ctx.save();ctx.textAlign='right';text(number(row.count),x+500,y,23,pink,700,56);ctx.restore();
   if(i<4)line(x+24,y+23,476);
  });
 };
 rankings('TOP 5 MAPPERS',data.mappers,64,mapperAvatars);rankings('TOP 5 ARTISTS',data.artists,612,artistAvatars);
 text('Ranked by selected score count, not yearly attempts. Artist images: TheAudioDB.com.',64,1820,17,muted,400,1072);
 box(64,1845,1072,128,'#282231');
 const medal=data.rarestMedal;if(medalArt){const scale=Math.min(96/medalArt.naturalWidth,96/medalArt.naturalHeight),width=medalArt.naturalWidth*scale,height=medalArt.naturalHeight*scale;ctx.drawImage(medalArt,84+(96-width)/2,1860+(96-height)/2,width,height);}
 const medalX=medalArt?200:88;
 text(data.demo?'EXAMPLE MEDAL / DEMO':data.rarestMedalStatus==='partial'?'RAREST MATCHED MEDAL · 2026':'RAREST MEDAL EARNED · 2026',medalX,1875,14,pink,700,900);
 text(medal?medal.name:data.rarestMedalStatus==='none'?'No medals earned in 2026':'Medal rarity unavailable',medalX,1910,28,white,700,900);
 if(medal){text(data.demo?rarityText(medal.rarityPercent)+' of Osekai-tracked users / snapshot '+medal.raritySnapshot:rarityText(medal.rarityPercent)+' of Osekai-tracked users · current estimate',medalX,1936,16,muted,400,900);text('Earned '+new Date(medal.earnedAt).toISOString().slice(0,10)+' UTC · Source: osekai.net',medalX,1958,15,muted,400,900);}
 ctx.save();ctx.translate(0,150);
 if(data.beatmapAverages?.total){
  box(64,1848,1072,250,'#202934');
  text('YOUR AVERAGE BEATMAP',88,1878,16,'#8edcff',700,760);
  ctx.save();ctx.textAlign='right';text(data.beatmapAverages.total+' selected scores',1112,1878,15,muted,400,280);ctx.restore();
  beatmapAverageRows(data).forEach((row,i)=>{const x=88+(i%4)*258,y=1910+Math.floor(i/4)*95;
   text(row.label,x,y,14,muted,500,240);
   text(row.adjusted,x,y+30,26,'#8edcff',700,240);
   text('Base: '+row.base,x,y+51,13,muted,400,240);
   text(row.count+' scores',x,y+69,12,muted,400,240);
  });
  const averageRows=beatmapAverageRows(data),noteColumn=averageRows.length%4;
  if(noteColumn){
   const noteX=88+noteColumn*258,noteY=1910+Math.floor(averageRows.length/4)*95;
   text('Mod-adjusted values',noteX,noteY+10,13,muted,500,240);
   text('Unweighted means',noteX,noteY+32,13,muted,400,240);
   text('Coverage varies',noteX,noteY+54,13,muted,400,240);
   text('by metric',noteX,noteY+72,13,muted,400,240);
  }else{text('Mod-adjusted values / unweighted means / coverage varies by metric',88,2080,13,muted,400,1024);}
  ctx.translate(0,270);
 }
 if(data.skillsets?.rows?.length){
  box(64,1848,1072,190,'#282231');text('YOUR MAIN SKILLSETS',88,1879,16,'#bd9aff',700,1000);
  const skills=data.skillsets.rows.slice(0,5),width=1024/skills.length;
  skills.forEach((row,i)=>{const x=88+i*width;text(row.name,x,1916,18,white,700,width-16);text(row.percentage.toFixed(1)+'%',x,1954,27,'#bd9aff',700,width-16);text(row.count+' scores',x,1979,13,muted,400,width-16);});
  text(data.skillsets.tagged+' of '+data.skillsets.total+' selected scores tagged · '+data.skillsets.checked+' checked · Community map patterns',88,2011,12,muted,400,1024);ctx.translate(0,210);
 }
 if(hasMapping){
  box(64,1848,1072,270,'#202934');
  text(data.demo?'DEMO MAPPING STATS / FICTIONAL':'YOUR MAPPING YEAR / ALL MODES',88,1876,14,'#8edcff',700,1000);
  text(number(data.mapping.created),88,1932,42,'#8edcff',700,300);
  text('mapsets submitted in 2026',88,1960,15,white,400,300);
  ctx.save();ctx.strokeStyle='#ffffff20';ctx.beginPath();ctx.moveTo(420,1900);ctx.lineTo(420,1967);ctx.moveTo(776,1900);ctx.lineTo(776,1967);ctx.stroke();ctx.restore();
  text(number(data.mapping.ranked),448,1932,42,'#b7e58b',700,300);
  text('of those currently ranked',448,1960,15,white,400,300);
  text(number(data.mapping.totalPlays),804,1932,38,'#ffd46b',700,304);
  text('all-time plays on these mapsets',804,1960,15,white,400,304);
  text('Hosted mapsets only. First submission date (UTC); current ranked status.',88,1984,13,muted,400,1000);
  const mappingClub=assignMappingClub(data.mapping);
  line(88,2000,1024);
  if(mappingClub){
   const art=mappingClubArtwork(mappingClub.id);
   ctx.save();ctx.strokeStyle=mappingClub.color;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(88,2026,72,72,17);ctx.stroke();
   ctx.translate(102,2040);ctx.scale(44/24,44/24);ctx.translate(art.x,art.y);ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(art.path));ctx.restore();
   text('YOUR MAPPING CLUB',180,2024,12,mappingClub.color,700,410);
   text(mappingClub.name,180,2053,24,mappingClub.color,700,410);
   text(mappingClub.motto,180,2078,15,white,400,410);
   text(mappingClub.rule.split('. ')[0]+'.',180,2100,13,muted,400,410);
  }else{
   text('YOUR MAPPING CLUB',88,2023,12,'#8edcff',700,1000);
   text('Your mapping identity is taking shape.',88,2054,24,white,700,1000);
  }
  const popular=data.mapping.mostPopular;
  if(popular){
   ctx.save();ctx.strokeStyle='#ffffff15';ctx.beginPath();ctx.moveTo(618,2018);ctx.lineTo(618,2102);ctx.stroke();ctx.restore();
   text(data.demo?'EXAMPLE UPLOADED MAPSET':'MOST-PLAYED 2026 UPLOAD',642,2024,12,'#8edcff',700,470);
   if(mappingCover){
    ctx.save();ctx.beginPath();ctx.roundRect(642,2038,94,64,8);ctx.clip();
    const scale=Math.max(94/mappingCover.naturalWidth,64/mappingCover.naturalHeight),w=mappingCover.naturalWidth*scale,h=mappingCover.naturalHeight*scale;
    ctx.drawImage(mappingCover,642+(94-w)/2,2038+(64-h)/2,w,h);ctx.restore();
   }
   const mapX=mappingCover?752:642,mapWidth=1112-mapX;
   text(popular.title,mapX,2057,20,white,700,mapWidth);
   text(popular.artist,mapX,2079,14,muted,400,mapWidth);
   text(number(popular.plays)+' all-time plays',mapX,2100,14,'#8edcff',600,mapWidth);
  }
  ctx.translate(0,290);
 }
 line(64,1848,1072);
 text('SCORE COVERAGE',64,1883,14,pink,700);
 text(number(data.sampleCount)+' scores dated in 2026 from your current top 200; not a full annual archive.',64,1912,17,muted,400,1072);
 text('Mapper credits use mapset creators. Profile history may be incomplete. Year to date until 2027.',64,1940,16,muted,400,1072);
 text('Independent fan project · Not affiliated with ppy / osu!',64,1980,15,muted,400,1072);
 ctx.restore();ctx.restore();
 return new Promise((resolve,reject)=>{try{canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed')),'image/png');}catch(error){reject(error);}});
}

function coverImage(value,demo=false){
 if(!value)return Promise.resolve(null);
 return new Promise(resolve=>{
  const img=new Image();const timer=setTimeout(()=>{img.src='';resolve(null);},12000);
  img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);resolve(null);};
  const saved=savedBeatmapCover(value),source=saved!==value?saved:'/api/osu-wrapped/cover?url='+encodeURIComponent(value);img.src=demo?demoAsset(source):source;
 });
}

function artistImage(name){return new Promise(resolve=>{const img=new Image();const timer=setTimeout(()=>{img.src='';resolve(null);},10000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);resolve(null);};img.src='/api/osu-wrapped/artist-image?name='+encodeURIComponent(name);});}

function recapMedalImage(medal,demo=false){const source=medalImageUrl(medal),url=demo?demoAsset(source):source;if(!url)return Promise.resolve(null);return new Promise(resolve=>{const image=new Image();const timer=setTimeout(()=>{image.src='';resolve(null);},7000);image.onload=()=>{clearTimeout(timer);resolve(image);};image.onerror=()=>{clearTimeout(timer);resolve(null);};image.src=url;});}

function recapModImage(mod){const url=modIconUrl(mod);if(!url)return Promise.resolve(null);return new Promise(resolve=>{const image=new Image();const timer=setTimeout(()=>resolve(null),5000);image.onload=()=>{clearTimeout(timer);resolve(image);};image.onerror=()=>{clearTimeout(timer);resolve(null);};image.src=url;});}

async function createMappingRecap(data){
 const mapping=data.mapping,club=assignMappingClub(mapping),popular=mapping.mostPopular;
 const [avatar,cover]=await Promise.all([avatarImage(data.user.id,data.demo),coverImage(popular?.cover,data.demo)]);
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1022;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 const text=(value,x,y,size=20,color=white,weight=400,width=1000)=>{ctx.font=weight+' '+size+'px "Segoe UI",sans-serif';ctx.fillStyle=color;let label=String(value??'');while(label.length>1&&ctx.measureText(label).width>width)label=label.slice(0,-2)+'…';ctx.fillText(label,x,y);};
 const box=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();};
 const image=(img,x,y,w,h)=>{if(!img)return;ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.clip();const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);ctx.restore();};
 ctx.fillStyle='#15131b';ctx.fillRect(0,0,1200,1060);
 text('osu! wrapped / 2026',64,78,27,pink,700);
 text('YOUR YEAR BEHIND THE PATTERNS',64,117,14,'#8edcff',700);
 image(avatar,64,156,106,106);text(data.user.username+'’s 2026',avatar?196:64,211,46,white,700,940);
 text('Mapping recap - January 1 - December 31, 2026 (UTC)',avatar?196:64,249,18,muted,400,940);
 box(64,304,1072,170,'#202934');
 const metrics=[[mapping.created,'mapsets submitted in 2026','#8edcff'],[mapping.ranked,'of those currently ranked','#b7e58b'],[mapping.totalPlays,'all-time plays on these mapsets','#ffd46b']];
 metrics.forEach(([value,label,color],i)=>{const x=88+i*356;text(number(value),x,385,48,color,700,320);text(label,x,423,16,white,400,320);});
 text('Hosted mapsets across all modes. Ranked status is current.',88,454,13,muted,400);
 if(club){
  box(64,494,1072,146,'#202934');const art=mappingClubArtwork(club.id);
  ctx.save();ctx.strokeStyle=club.color;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(88,527,88,88,20);ctx.stroke();ctx.translate(108,547);ctx.scale(48/24,48/24);ctx.translate(art.x,art.y);ctx.strokeStyle=club.color;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(art.path));ctx.restore();
  text('YOUR MAPPING CLUB',196,528,12,club.color,700);text(club.name,196,565,29,club.color,700,910);text(club.motto,196,594,18,white,400,910);text(club.rule,196,624,14,muted,400,910);
 }
 box(64,660,1072,190,'#202934');text('YOUR MOST-PLAYED 2026 UPLOAD',88,694,13,'#8edcff',700);
 if(popular){image(cover,88,718,180,120);const x=cover?292:88;text(popular.title,x,755,27,white,700,1112-x);text(popular.artist,x,791,18,muted,400,1112-x);text(number(popular.plays)+' all-time plays',x,826,20,'#8edcff',700,1112-x);}else{text('Upload artwork and details unavailable',88,760,22,muted);}
 text('MAPPING COVERAGE',64,896,13,'#8edcff',700);
 text('Unique hosted mapsets first submitted in 2026 (UTC); guest, deleted and local-only maps excluded.',64,925,15,muted,400,1072);
 text('No eligible scores in the selected mode. Score-based statistics and playstyle clubs are omitted.',64,953,15,muted,400,1072);
 text('Independent fan project - Not affiliated with ppy / osu!',64,987,14,muted,400,1072);
 return new Promise((resolve,reject)=>{try{canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed')),'image/png');}catch(error){reject(error);}});
}
