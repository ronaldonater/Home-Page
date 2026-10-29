import {createHash} from 'node:crypto';
export function createReviewCore({now=Date.now}={}){
 const cache=new Map(),pending=new Map();
 return async function reviewCore(token,requestedMode,osu){
  const key=createHash('sha256').update(token+'\0'+(requestedMode||'preferred')).digest('hex'),saved=cache.get(key);
  if(saved?.until>now())return saved.value;if(pending.has(key))return pending.get(key);
  if(pending.size>=32)throw Object.assign(Error('Wrapped is busy. Please wait a minute and retry.'),{status:503});
  const task=(async()=>{const user=await osu(requestedMode?'/me/'+requestedMode:'/me',token);const modes=['osu','taiko','fruits','mania'];
   if(!Number.isSafeInteger(user?.id)||user.id<=0||typeof user.username!=='string')throw Object.assign(Error('Incomplete profile data. Please retry.'),{status:502});
   const mode=requestedMode||(modes.includes(user.playmode)?user.playmode:'osu');
   const pages=await Promise.all([0,1].map(page=>osu('/users/'+user.id+'/scores/best?mode='+mode+'&limit=100&offset='+page*100+'&legacy_only=0',token)));
   if(pages.some(page=>!Array.isArray(page)))throw Object.assign(Error('Incomplete score data. Please retry.'),{status:502});
   const value={user,mode,best:pages.flat()},entry={value,until:now()+300000};cache.set(key,entry);cache.set(createHash('sha256').update(token+'\0'+mode).digest('hex'),entry);while(cache.size>32)cache.delete(cache.keys().next().value);return value;
  })();pending.set(key,task);try{return await task;}finally{pending.delete(key);}
 };
}
export const reviewCore=createReviewCore();
