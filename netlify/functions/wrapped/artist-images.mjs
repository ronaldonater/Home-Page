import {imageBytes} from './hardening.mjs';
const normalize=value=>value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g,' ');
const missing=(statusCode=404)=>({statusCode,headers:{'Cache-Control':statusCode===404?'public, max-age=3600':'no-store','X-Content-Type-Options':'nosniff'},body:''});
export function createArtistImageService({fetchImpl=(...args)=>fetch(...args),now=()=>Date.now()}={}){
 const cache=new Map(),pending=new Map();let windowStart=now(),requests=0;
 return async function artistImage(name){
  if(typeof name!=='string'||!name.trim()||name.length>150||/[\x00-\x1f\x7f]/.test(name))return missing(400);
  const key=normalize(name),stored=cache.get(key);if(stored&&stored.expires>now())return stored.response;
  if(pending.has(key))return pending.get(key);
  if(now()-windowStart>=60000){windowStart=now();requests=0;}if(requests>=25)return missing(429);requests++;
  const task=(async()=>{try{
   const url=new URL('https://www.theaudiodb.com/api/v1/json/123/search.php');url.searchParams.set('s',name.trim());
   const response=await fetchImpl(url.href,{redirect:'error',signal:AbortSignal.timeout(5000)});if(!response.ok)return missing(502);
   const bytes=await imageBytes(response,512*1024);const data=JSON.parse(bytes.toString('utf8'));
   const match=Array.isArray(data.artists)?data.artists.find(row=>typeof row.strArtist==='string'&&normalize(row.strArtist)===key):null;
   let result=missing();
   if(match?.strArtistThumb){
    const image=new URL(match.strArtistThumb);
    if(image.protocol!=='https:'||!['r2.theaudiodb.com','www.theaudiodb.com'].includes(image.hostname)||image.username||image.password||image.port||!/^\/images\/media\/artist\/thumb\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(image.pathname))return missing();
    const picture=await fetchImpl(image.origin+image.pathname+'/small',{redirect:'error',signal:AbortSignal.timeout(5000)});
    const type=(picture.headers.get('content-type')||'').split(';')[0].toLowerCase();
    if(picture.ok&&['image/jpeg','image/png','image/webp'].includes(type)){
     const content=await imageBytes(picture,512*1024);
     result={statusCode:200,headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400','Netlify-CDN-Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'},body:content.toString('base64'),isBase64Encoded:true};
    }
   }
   if(cache.size>=64)cache.delete(cache.keys().next().value);cache.set(key,{response:result,expires:now()+(result.statusCode===200?86400000:3600000)});return result;
  }catch{return missing(502);}finally{pending.delete(key);}})();pending.set(key,task);return task;
 };
}
export const artistImage=createArtistImageService();
