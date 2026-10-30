import {releaseSettings} from './release-settings.mjs';
import {reviewQueue} from './review-queue.mjs';
import {reviewCore} from './review-core.mjs';
import {osuFetch} from './osu-api.mjs';
import {enrichSkillsetTags} from './skillset-tags.mjs';
import {adminAllowlist} from './admin-allowlist.mjs';
import {RELEASE_AT,releaseOpen,isReleaseAdmin} from './release-gate.mjs';
import {enrichBeatmapAttributes} from './beatmap-attributes.mjs';
import {recordMappingClubCommunity} from './mapping-community.mjs';
import {mappingStats} from './mapping-stats.mjs';
import {enrichMapDates} from './map-clubs.mjs';
import {recordClubCommunity} from './club-community.mjs';
import {globalStats} from './global-stats.mjs';
import {rarestMedal} from './medals.mjs';
import {artistImage} from './artist-images.mjs';
import {imageBytes,callbackUrl,sessionValid,stateValid} from './hardening.mjs';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {seal,unseal,cookie,cookies} from './security.mjs';
import {summarize} from '../../../osu-wrapped/src/summary.js';
const json=(statusCode,body,extra={})=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra},body:JSON.stringify(body)});
const redirect=(to,setCookies=[])=>({statusCode:302,headers:{Location:to,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'},multiValueHeaders:{'Set-Cookie':setCookies},body:''});
async function osu(path,token){const res=await osuFetch(`https://osu.ppy.sh/api/v2${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json','x-api-version':'20220705'},signal:AbortSignal.timeout(12000)});if(!res.ok){const error=new Error((res.status===429||res.status===503)?'osu! is busy. Please wait a minute and try again.':'Unable to retrieve osu! data. Please try signing in again.');error.status=res.status===401?401:res.status===429?429:res.status===503?503:502;throw error;}return res.json();}
export async function handler(event,{now=Date.now}={}){
 const result=await handleRequest(event,now);
 if(!releaseOpen(now()))result.headers={...result.headers,'Cache-Control':'no-store','Netlify-CDN-Cache-Control':'no-store'};
 return result;
}
async function handleRequest(event,now){
 try{
 const path=event.path.replace(/^\/.netlify\/functions\/wrapped-api(?=\/|$)/,'/api').replace(/^\/api\/osu-wrapped(?=\/|$)/,'/api');const jar=cookies(event);
 const allowedMethods=['/api/admin/users','/api/admin/release'].includes(path)?['GET','POST']:['/api/auth/logout','/api/wrapped/depart'].includes(path)?['POST']:['GET'];
 if(!allowedMethods.includes(event.httpMethod))return json(405,{error:'Method not allowed'},{Allow:allowedMethods.join(', ')});
 if(path!=='/api/auth/callback' && event.headers['sec-fetch-site']==='cross-site' && event.headers['sec-fetch-mode']!=='navigate')return json(403,{error:'Cross-site request denied'});
 const releaseStatus=await releaseSettings.status(process.env.WRAPPED_DATABASE_URL,now());
 const released=releaseStatus.publicAccess;
 const releaseSession=unseal(jar.wrapped_session||'');
 let admin=false,verifiedId=null;
 async function identity(){
  if(!sessionValid(releaseSession))return null;
  if(verifiedId!==null)return verifiedId;
  const user=Number.isSafeInteger(releaseSession.userId)?{id:releaseSession.userId}:await osu('/me',releaseSession.token);
  verifiedId=Number.isSafeInteger(user?.id)&&user.id>0?user.id:null;return verifiedId;
 }
 async function verifyAdmin(){return adminAllowlist.has(await identity(),process.env.WRAPPED_DATABASE_URL);}
 if(path==='/api/admin/release'){
  if(!sessionValid(releaseSession))return json(401,{error:'Sign in as ronaldonater to manage release access.'});
  if(!isReleaseAdmin({id:await identity()}))return json(403,{error:'Only ronaldonater can change release access.'});
  if(event.httpMethod==='POST'){
   if(event.headers.origin!==callbackUrl(process.env.WRAPPED_REDIRECT_URI).origin)return json(403,{error:'Invalid origin'});
   if(releaseOpen(now()))return json(409,{error:'The scheduled release has passed. Public access is now automatic.'});
   const action=event.queryStringParameters?.action;
   if(!['open','restore'].includes(action))return json(400,{error:'Invalid release action.'});
   await releaseSettings.set(process.env.WRAPPED_DATABASE_URL,action==='open');
  }
  return json(200,await releaseSettings.status(process.env.WRAPPED_DATABASE_URL,now()));
 }
 if(path==='/api/admin/users'){
  if(!sessionValid(releaseSession))return json(401,{error:'Sign in as ronaldonater to manage admins.'});
  if(!isReleaseAdmin({id:await identity()}))return json(403,{error:'Only ronaldonater can manage admins.'});
  if(event.httpMethod==='POST'){
   const expected=callbackUrl(process.env.WRAPPED_OSU_REDIRECT_URI).origin;
   if(event.headers.origin!==expected)return json(403,{error:'Invalid origin'});
   const query=event.queryStringParameters||{},value=typeof query.user==='string'?query.user.trim():'';
   if(!value||value.length>32)return json(400,{error:'Enter a valid osu! username or user ID.'});
   if(query.action==='add'){
    const user=await osu('/users/'+encodeURIComponent(value)+(/^[1-9]\d*$/.test(value)?'?key=id':'?key=username'),releaseSession.token);
    await adminAllowlist.add(user,process.env.WRAPPED_DATABASE_URL);
   }else if(query.action==='remove'){
    if(!/^[1-9]\d*$/.test(value))return json(400,{error:'Invalid user ID.'});
    await adminAllowlist.remove(Number(value),process.env.WRAPPED_DATABASE_URL);
   }else return json(400,{error:'Invalid admin action.'});
  }
  const rows=await adminAllowlist.list(process.env.WRAPPED_DATABASE_URL);
  return json(200,{users:[{id:7933825,username:'ronaldonater',owner:true},...rows.filter(row=>Number(row.user_id)!==7933825).map(row=>({id:Number(row.user_id),username:row.username,addedAt:row.added_at,owner:false}))]});
 }
 if(path==='/api/release'){
  try{admin=await verifyAdmin();}catch(error){if(!released)throw error;}
  const owner=admin&&isReleaseAdmin({id:verifiedId});
  const extra=admin&&!releaseSession.userId?{'Set-Cookie':cookie('wrapped_session',seal({...releaseSession,userId:verifiedId}),Math.max(1,Math.floor((releaseSession.exp-Date.now())/1000)))}:{};
  return json(200,{allowed:released||admin,admin,owner,...releaseStatus,releaseAt:RELEASE_AT,serverNow:now()},extra);
 }
 if(!released&&!['/api/auth/login','/api/auth/callback','/api/auth/logout'].includes(path)){
  admin=await verifyAdmin();
  if(!admin)return json(423,{error:'osu! Wrapped opens on November 29, 2026 at 00:00 UTC.',releaseAt:RELEASE_AT});
 }
 if(path==='/api/global'){const result=await globalStats(event.queryStringParameters?.mode||'osu',{clientId:process.env.WRAPPED_OSU_CLIENT_ID,clientSecret:process.env.WRAPPED_OSU_CLIENT_SECRET});return json(result.statusCode,result.body,result.statusCode===200?{'Cache-Control':'public, max-age=300','Netlify-CDN-Cache-Control':'public, max-age=900'}:{});}
 if(path==='/api/replay'||path==='/api/global-replay'){
  const session=unseal(jar.wrapped_session||'');if(!sessionValid(session))return json(401,{error:'Sign in again to watch this replay.'});
  const id=event.queryStringParameters?.id;if(!/^[1-9]\d{0,15}$/.test(id||'') || !Number.isSafeInteger(Number(id)))return json(400,{error:'Invalid score ID'});
  let score;
  if(path==='/api/global-replay'){
   const listing=await globalStats(event.queryStringParameters?.mode||'osu',{clientId:process.env.WRAPPED_OSU_CLIENT_ID,clientSecret:process.env.WRAPPED_OSU_CLIENT_SECRET});
   if(!listing.body.top?.some(row=>row.scoreId===Number(id)))return json(403,{error:'This score is not in the current global top 25 for this mode.'});
   score=await osu('/scores/'+id,session.token);
  }else{
   const [user,ownScore]=await Promise.all([osu('/me',session.token),osu('/scores/'+id,session.token)]);score=ownScore;
   if(score.user_id!==user.id)return json(403,{error:'Only your own replays can be loaded here.'});
  }
  if(score.has_replay===false)return json(404,{error:'osu! has no replay available for this score.'});
  const response=await osuFetch('https://osu.ppy.sh/api/v2/scores/'+id+'/download',{headers:{Authorization:'Bearer '+session.token},redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return json(response.status===429?429:404,{error:response.status===429?'osu! replay downloads are rate limited. Please try later.':'This replay cannot be downloaded from osu!.'});
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['application/octet-stream','application/x-osu-replay'].includes(type))return json(502,{error:'osu! returned an unexpected replay format.'});
  const bytes=await imageBytes(response,4*1024*1024);
  return {statusCode:200,headers:{'Content-Type':'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},body:bytes.toString('base64'),isBase64Encoded:true};
 }
 if(path==='/api/medal-image'){
  const file=event.queryStringParameters?.file;if(!/^[a-zA-Z0-9_-]+(?:@2x)?\.png$/.test(file||'')||file.length>150)return json(400,{error:'Invalid medal image'});
  const response=await fetch('https://assets.ppy.sh/medals/web/'+file,{redirect:'error',signal:AbortSignal.timeout(5000)});if(!response.ok)return json(404,{error:'Medal image unavailable'});
  if((response.headers.get('content-type')||'').split(';')[0]!=='image/png')return json(502,{error:'Unexpected medal image'});
  const bytes=await imageBytes(response,512*1024);return {statusCode:200,headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'},body:bytes.toString('base64'),isBase64Encoded:true};
 }
 if(path==='/api/artist-image')return artistImage(event.queryStringParameters?.name);
 if(path==='/api/cover'){
  if(event.httpMethod!=='GET')return json(405,{error:'Method not allowed'});
  let url;try{url=new URL(event.queryStringParameters?.url);}catch{return json(400,{error:'Invalid cover URL'});}
  if(url.origin!=='https://assets.ppy.sh' || url.username || url.password || !/^\/beatmaps\/\d+\/covers\/cover(?:@2x)?\.(?:jpg|jpeg|png)$/.test(url.pathname))return json(400,{error:'Invalid cover URL'});
  // Profile cover URLs can include cache-version query parameters. Fetch only the validated image path.
  url.search='';url.hash='';
  const response=await fetch(url.href,{redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!response.ok)return json(502,{error:'Cover unavailable'});
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['image/jpeg','image/png','image/webp'].includes(type))return json(502,{error:'Unsupported cover image'});
  const bytes=await imageBytes(response);
  if(bytes.length>2*1024*1024)return json(502,{error:'Cover too large'});
  return {statusCode:200,headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'},body:bytes.toString('base64'),isBase64Encoded:true};
 }
 if(path==='/api/avatar'){
  if(event.httpMethod!=='GET')return json(405,{error:'Method not allowed'});
  const id=event.queryStringParameters?.id;
  if(!/^[1-9]\d{0,14}$/.test(id||'') || !Number.isSafeInteger(Number(id)))return json(400,{error:'Invalid user ID'});
  const response=await fetch('https://a.ppy.sh/'+id,{redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!response.ok)return json(502,{error:'Avatar unavailable'});
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['image/png','image/jpeg','image/webp','image/gif','image/avif'].includes(type))return json(502,{error:'Unsupported avatar image'});
  const bytes=await imageBytes(response);
  if(bytes.length>2*1024*1024)return json(502,{error:'Avatar too large'});
  return {statusCode:200,headers:{'Content-Type':type,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'},body:bytes.toString('base64'),isBase64Encoded:true};
 }
 if(path==='/api/auth/login'){
  if(!process.env.WRAPPED_OSU_CLIENT_ID||!process.env.WRAPPED_OSU_CLIENT_SECRET||!process.env.WRAPPED_OSU_REDIRECT_URI)return json(503,{error:'Login is not configured yet. Add the osu! OAuth environment variables in Netlify. You can explore the demo now.'});
  callbackUrl(process.env.WRAPPED_OSU_REDIRECT_URI);
  const state=randomBytes(24).toString('hex');const url=new URL('https://osu.ppy.sh/oauth/authorize');url.search=new URLSearchParams({client_id:process.env.WRAPPED_OSU_CLIENT_ID,redirect_uri:process.env.WRAPPED_OSU_REDIRECT_URI,response_type:'code',scope:'identify public',state}).toString();
  return redirect(url.toString(),[cookie('wrapped_state',seal({kind:'oauth-state',state,exp:Date.now()+600000}),600)]);
 }
 if(path==='/api/auth/callback'){
  const q=event.queryStringParameters||{};const saved=unseal(jar.wrapped_state||'');
  if(!stateValid(saved,q.state)||!timingSafeEqual(Buffer.from(q.state),Buffer.from(saved.state))||typeof q.code!=='string'||q.code.length===0||q.code.length>4096)return redirect('/osu-wrapped/?error=login',[cookie('wrapped_state','',0)]);
  callbackUrl(process.env.WRAPPED_OSU_REDIRECT_URI);
  const res=await osuFetch('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({client_id:process.env.WRAPPED_OSU_CLIENT_ID,client_secret:process.env.WRAPPED_OSU_CLIENT_SECRET,code:q.code,grant_type:'authorization_code',redirect_uri:process.env.WRAPPED_OSU_REDIRECT_URI}),signal:AbortSignal.timeout(12000)});
  if(!res.ok)return redirect('/osu-wrapped/?error=login',[cookie('wrapped_state','',0)]);
  const token=await res.json();
  if(!sessionValid({kind:'session',token:token.access_token})||!Number.isFinite(token.expires_in)||token.expires_in<=0)return redirect('/osu-wrapped/?error=login',[cookie('wrapped_state','',0)]);
  let adminIdentity;
  {
   adminIdentity=await osu('/me',token.access_token);
   if(!released&&!await adminAllowlist.has(adminIdentity.id,process.env.WRAPPED_DATABASE_URL))return redirect('/osu-wrapped/?error=admin',[cookie('wrapped_session','',0),cookie('wrapped_state','',0)]);
  }
  const age=Math.min(Math.floor(token.expires_in),86400);
  return redirect('/osu-wrapped/?connected=1',[cookie('wrapped_session',seal({kind:'session',token:token.access_token,...(adminIdentity?{userId:adminIdentity.id,playmode:adminIdentity.playmode}:{}),exp:Date.now()+age*1000}),age),cookie('wrapped_state','',0)]);
 }
 if(path==='/api/auth/logout'){
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  const expected=callbackUrl(process.env.WRAPPED_OSU_REDIRECT_URI).origin;
  if(event.headers.origin!==expected)return json(403,{error:'Invalid origin'});
  return json(200,{ok:true},{'Set-Cookie':cookie('wrapped_session','',0)});
 }
 if(path==='/api/wrapped/depart'){
  const session=unseal(jar.wrapped_session||'');if(!sessionValid(session))return json(401,{error:'Sign in with osu! first.'});
  if(event.headers.origin!==callbackUrl(process.env.WRAPPED_OSU_REDIRECT_URI).origin)return json(403,{error:'Invalid origin'});
  const client=event.queryStringParameters?.client;
  if(typeof client!=='string'||!/^[a-f0-9-]{36}$/.test(client))return json(400,{error:'Invalid queue client'});
  // Legacy sessions without a cached identity simply retain the normal timeout fallback.
  if(Number.isSafeInteger(session.userId))await reviewQueue.depart(session.userId,client);
  return json(200,{ok:true});
 }
 if(path==='/api/wrapped'){
  const session=unseal(jar.wrapped_session||'');if(!sessionValid(session))return json(401,{error:'Sign in with osu! to generate your Wrapped.'});
  const requestedMode=event.queryStringParameters?.mode;const validModes=['osu','taiko','fruits','mania'];if(requestedMode!==undefined&&!validModes.includes(requestedMode))return json(400,{error:'Invalid game mode'});
  const stage=event.queryStringParameters?.stage;if(stage!==undefined&&!['core','tags','full'].includes(stage))return json(400,{error:'Invalid loading stage'});
  const queueClient=event.queryStringParameters?.client;
  if(queueClient!==undefined&&!/^[a-f0-9-]{36}$/.test(queueClient))return json(400,{error:'Invalid queue client'});
  let ticket={status:'disabled'};
  if(process.env.WRAPPED_DATABASE_URL){
   const identity=Number.isSafeInteger(session.userId)&&(requestedMode||session.playmode)?{id:session.userId,playmode:session.playmode}:await osu('/me',session.token);
   ticket=await reviewQueue.claim(identity.id,requestedMode||identity.playmode||'osu',queueClient||null);
   // An unavailable queue falls back to the existing paced, staged loader.
   if(ticket.status==='queued'||ticket.status==='processing')return json(202,{queue:{status:ticket.status,position:ticket.position,retryAfter:ticket.retryAfter}},{'Retry-After':String(ticket.retryAfter)});
   if(ticket.status==='complete')return json(200,ticket.data);
  }
  const generate=async()=>{
  const {user,mode,best}=await reviewCore(session.token,requestedMode,osu);
  if(stage==='core'||stage==='tags'){
   const selected=stage==='tags'?await enrichSkillsetTags(best,mode,session.token):best;
   const summary=summarize(user,selected,mode);
   const mapping=summary.sampleCount===0?await mappingStats(user.id,session.token):{status:'pending'};
   return json(200,{...summary,mapping,loadStage:stage});
  }
  const [enriched,popularBeatmapsets,taggedScores]=await Promise.all([enrichMapDates(best,session.token),globalStats.popularBeatmapsets(mode,{clientId:process.env.WRAPPED_OSU_CLIENT_ID,clientSecret:process.env.WRAPPED_OSU_CLIENT_SECRET}),enrichSkillsetTags(best,mode,session.token)]);
  const withAttributes=await enrichBeatmapAttributes(enriched.map((score,index)=>({...score,wrappedSkillsets:taggedScores[index]?.wrappedSkillsets})),mode,session.token);
  const summary=summarize(user,withAttributes,mode,{popularBeatmapsets});
  const [mapping,medal,clubCommunity]=await Promise.all([mappingStats(user.id,session.token),rarestMedal(user.user_achievements),recordClubCommunity(summary,{databaseUrl:process.env.WRAPPED_DATABASE_URL,trackingSecret:process.env.WRAPPED_CLUB_TRACKING_SECRET})]);
  const mappingCommunity=await recordMappingClubCommunity(summary,mapping,{databaseUrl:process.env.WRAPPED_DATABASE_URL,trackingSecret:process.env.WRAPPED_CLUB_TRACKING_SECRET});
  const medalComplete=!Array.isArray(user.user_achievements)||!user.user_achievements.some(row=>new Date(row.achieved_at).getUTCFullYear()===2026)||Boolean(medal.medalRarityUpdatedAt);
  const checks=[
   {name:'Ranked dates',complete:enriched.complete!==false,...enriched.progress},
   {name:'Mod-adjusted attributes',complete:withAttributes.complete!==false,...withAttributes.progress},
   {name:'Mapping catalogue',complete:mapping.status==='ready',checked:mapping.checkedPages,unit:'pages',retryAfterMs:1100},
   {name:'Medal rarity',complete:medalComplete,retryAfterMs:60000},
   {name:'Playstyle community',complete:true,unavailable:clubCommunity?.status==='unavailable'},
   {name:'Mapping community',complete:true,unavailable:mappingCommunity?.status==='unavailable'},
   {name:'Community user tags',complete:summary.skillsets.checked===summary.sampleCount,checked:summary.skillsets.checked,total:summary.sampleCount,retryAfterMs:1100}
  ];
  const unfinished=checks.filter(check=>!check.complete);
  const loadingStatus={complete:!unfinished.length,checks,retryAfterMs:unfinished.length?Math.min(...unfinished.map(check=>check.retryAfterMs||1100)):0};
  return json(200,{...summary,loadingStatus,mapping:{...mapping,...(mappingCommunity?{community:mappingCommunity}:{})},...medal,...(clubCommunity?{clubCommunity}:{})});
  };
  let response;
  try{response=await generate();return response;}
  finally{await reviewQueue.release(ticket,response?.statusCode===200?JSON.parse(response.body):null);}

 }
 return json(404,{error:'Not found'});
 }catch(error){console.error('Wrapped request failed:',error.name);return json(error.status||500,{error:error.status?error.message:'Could not generate your Wrapped. Check deployment configuration or try again shortly.'},[429,503].includes(error.status)?{'Retry-After':'60'}:{});}
}


