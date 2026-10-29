import {createHmac,randomUUID,createHash} from 'node:crypto';
import {reviewStorage,encryptReview,decryptReview} from './review-storage.mjs';
export function createReviewQueue({query=(...args)=>reviewStorage.query(...args),config=()=>({databaseUrl:process.env.WRAPPED_DATABASE_URL,secret:process.env.WRAPPED_SESSION_SECRET,clientId:process.env.WRAPPED_OSU_CLIENT_ID})}={},now=Date.now){
 let retryAt=0;
 return {async claim(userId,mode){
  const cfg=config();if(!cfg.databaseUrl)return {status:'disabled'};if(now()<retryAt)return {status:'unavailable',retryAfter:30};
  try{
   if(!Number.isSafeInteger(userId)||userId<=0||!['osu','taiko','fruits','mania'].includes(mode))throw Error('Invalid queue identity');
   const budget=createHash('sha256').update('osu-api:'+String(cfg.clientId||'default')).digest('hex');
   const job=createHmac('sha256',cfg.secret).update('review:'+userId+':'+mode+':v1').digest('hex'),worker=randomUUID();
   const rows=await query(cfg.databaseUrl,'SELECT wrapped_review_claim($1,$2,$3) AS job',[budget,job,worker]);const value=rows[0]?.job;
   if(value?.status==='complete'){const data=decryptReview(value.result,cfg.secret);if(data)return {status:'complete',data};throw Error('Invalid saved review');}
   if(value?.status==='active')return {status:'active',budget,job,worker};
   if(value?.status==='queued'||value?.status==='processing')return {status:value.status,position:Number(value.position)||0,retryAfter: value.status==='processing'?3:Math.min(30,10+Math.floor(Math.max(0,(Number(value.position)||1)-1)/5)*2)};
   throw Error('Invalid queue response');
  }catch{retryAt=now()+30000;return {status:'unavailable',retryAfter:30};}
 },async release(ticket,data){
  if(ticket.status!=='active')return;
  const cfg=config(),complete=data?.loadingStatus?.complete===true;
  const result=complete?encryptReview(data,cfg.secret):null;
  let rows;try{rows=await query(cfg.databaseUrl,`UPDATE wrapped_review_jobs SET state=CASE WHEN $4::boolean THEN 'complete' ELSE state END, result=CASE WHEN $4::boolean THEN $5 ELSE result END, expires_at=CASE WHEN $4::boolean THEN now()+interval '15 minutes' ELSE expires_at END, work_until=NULL, worker_id=NULL, last_seen_at=now() WHERE budget_key=$1 AND job_key=$2 AND worker_id=$3 AND work_until>now() RETURNING job_key`,[ticket.budget,ticket.job,ticket.worker,complete,result]);}catch{retryAt=now()+30000;return {status:'unavailable'};}
  if(!rows.length)throw Object.assign(Error('Your profile job is being resumed. Please wait.'),{status:503});
 }};
}
export const reviewQueue=createReviewQueue();
