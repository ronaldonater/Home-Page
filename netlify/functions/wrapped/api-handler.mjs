import {globalStats} from './global-stats.mjs';
import {rarestMedal} from './medals.mjs';
import {artistImage} from './artist-images.mjs';
import {imageBytes,callbackUrl,sessionValid,stateValid} from './hardening.mjs';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {seal,unseal,cookie,cookies} from './security.mjs';
import {summarize} from '../../../osu-wrapped/src/summary.js';
const json=(statusCode,body,extra={})=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra},body:JSON.stringify(body)});
const redirect=(to,setCookies=[])=>({statusCode:302,headers:{Location:to,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'},multiValueHeaders:{'Set-Cookie':setCookies},body:''});
async function osu(path,token){const res=await fetch(`https://osu.ppy.sh/api/v2${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json','x-api-version':'20220705'},signal:AbortSignal.timeout(12000)});if(!res.ok){const error=new Error(res.status===429?'osu! is busy. Please wait a minute and try again.':'Unable to retrieve osu! data. Please try signing in again.');error.status=res.status===401?401:502;throw error;}return res.json();}
export async function handler(event){
 try{
 const path=event.path.replace(/^\/.netlify\/functions\/wrapped-api(?=\/|$)/,'/api').replace(/^\/api\/osu-wrapped(?=\/|$)/,'/api');const jar=cookies(event);
 if(event.httpMethod!==(path==='/api/auth/logout'?'POST':'GET'))return json(405,{error:'Method not allowed'},{Allow:path==='/api/auth/logout'?'POST':'GET'});
 if(path!=='/api/auth/callback' && event.headers['sec-fetch-site']==='cross-site' && event.headers['sec-fetch-mode']!=='navigate')return json(403,{error:'Cross-site request denied'});
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
  const response=await fetch('https://osu.ppy.sh/api/v2/scores/'+id+'/download',{headers:{Authorization:'Bearer '+session.token},redirect:'error',signal:AbortSignal.timeout(15000)});
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
  const res=await fetch('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({client_id:process.env.WRAPPED_OSU_CLIENT_ID,client_secret:process.env.WRAPPED_OSU_CLIENT_SECRET,code:q.code,grant_type:'authorization_code',redirect_uri:process.env.WRAPPED_OSU_REDIRECT_URI}),signal:AbortSignal.timeout(12000)});
  if(!res.ok)return redirect('/osu-wrapped/?error=login',[cookie('wrapped_state','',0)]);
  const token=await res.json();
  if(!sessionValid({kind:'session',token:token.access_token})||!Number.isFinite(token.expires_in)||token.expires_in<=0)return redirect('/osu-wrapped/?error=login',[cookie('wrapped_state','',0)]);
  const age=Math.min(Math.floor(token.expires_in),86400);
  return redirect('/osu-wrapped/?connected=1',[cookie('wrapped_session',seal({kind:'session',token:token.access_token,exp:Date.now()+age*1000}),age),cookie('wrapped_state','',0)]);
 }
 if(path==='/api/auth/logout'){
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  const expected=callbackUrl(process.env.WRAPPED_OSU_REDIRECT_URI).origin;
  if(event.headers.origin!==expected)return json(403,{error:'Invalid origin'});
  return json(200,{ok:true},{'Set-Cookie':cookie('wrapped_session','',0)});
 }
 if(path==='/api/wrapped'){
  const session=unseal(jar.wrapped_session||'');if(!sessionValid(session))return json(401,{error:'Sign in with osu! to generate your Wrapped.'});
  const requestedMode=event.queryStringParameters?.mode;const validModes=['osu','taiko','fruits','mania'];if(requestedMode!==undefined&&!validModes.includes(requestedMode))return json(400,{error:'Invalid game mode'});
  const user=await osu(requestedMode?`/me/${requestedMode}`:'/me',session.token);
  const mode=requestedMode||(validModes.includes(user.playmode)?user.playmode:'osu');
  const pages=await Promise.all(Array.from({length:2},(_,page)=>osu(`/users/${user.id}/scores/best?mode=${mode}&limit=100&offset=${page*100}&legacy_only=0`,session.token)));
  const best=pages.flat();
  return json(200,{...summarize(user,best,mode),...await rarestMedal(user.user_achievements)});
 }
 return json(404,{error:'Not found'});
 }catch(error){console.error('Wrapped request failed:',error.name);return json(error.status||500,{error:error.status?error.message:'Could not generate your Wrapped. Check deployment configuration or try again shortly.'});}
}


