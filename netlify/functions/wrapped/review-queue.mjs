import {createHmac,randomUUID,createHash} from 'node:crypto';
import {reviewStorage,encryptReview,decryptReview} from './review-storage.mjs';
export function createReviewQueue({query=(...args)=>reviewStorage.query(...args),config=()=>({databaseUrl:process.env.WRAPPED_DATABASE_URL,secret:process.env.WRAPPED_SESSION_SECRET,clientId:process.env.WRAPPED_OSU_CLIENT_ID})}={},now=Date.now){
 let retryAt=0;
 return {async claim(userId,mode,client=null){
  const cfg=config();if(!cfg.databaseUrl)return {status:'disabled'};if(now()<retryAt)return {status:'unavailable',retryAfter:30};
  try{
   if(!Number.isSafeInteger(userId)||userId<=0||!['osu','taiko','fruits','mania'].includes(mode))throw Error('Invalid queue identity');
   const budget=createHash('sha256').update('osu-api:'+String(cfg.clientId||'default')).digest('hex');
   const job=createHmac('sha256',cfg.secret).update('review:'+userId+':'+mode+':v1').digest('hex'),worker=randomUUID();
   let value;
   for(let attempt=0;attempt<2;attempt++){
    const rows=await query(cfg.databaseUrl,'SELECT wrapped_review_claim_v2($1,$2,$3,$4) AS job',[budget,job,worker,client]);value=rows[0]?.job;
    if(value?.status!=='complete')break;
    const data=decryptReview(value.result,cfg.secret);if(!data)throw Error('Invalid saved review');
    if(!data.skillsets?.rows?.length||data.skillsets.rows.every(row=>Array.isArray(row.maps)))return {status:'complete',data};
    // Refresh only this obsolete completed result. Active/queued jobs and job keys are untouched.
    await query(cfg.databaseUrl,"UPDATE wrapped_review_jobs SET state='queued',result=NULL,expires_at=NULL,queued_at=clock_timestamp(),admitted_at=NULL,lease_until=NULL,work_until=NULL,worker_id=NULL,departed_until=NULL,resume_until=NULL WHERE budget_key=$1 AND job_key=$2 AND state='complete' AND result=$3 RETURNING job_key",[budget,job,value.result]);
   }
   if(value?.status==='active')return {status:'active',budget,job,worker};
   if(value?.status==='queued'||value?.status==='processing')return {status:value.status,position:Number(value.position)||0,retryAfter: value.status==='processing'?3:Math.min(30,10+Math.floor(Math.max(0,(Number(value.position)||1)-1)/5)*2)};
   throw Error('Invalid queue response');
  }catch{retryAt=now()+30000;return {status:'unavailable',retryAfter:30};}
 },async refresh(userId,mode){
  if(!Number.isSafeInteger(userId)||userId<=0||!['osu','taiko','fruits','mania'].includes(mode))throw Object.assign(Error('Invalid review identity.'),{status:400});
  const cfg=config();if(!cfg.databaseUrl)return {status:'disabled'};
  const budget=createHash('sha256').update('osu-api:'+String(cfg.clientId||'default')).digest('hex');
  const job=createHmac('sha256',cfg.secret).update('review:'+userId+':'+mode+':v1').digest('hex');
  try{
   const rows=await query(cfg.databaseUrl,"UPDATE wrapped_review_jobs SET state='queued',result=NULL,expires_at=NULL,queued_at=clock_timestamp(),last_seen_at=clock_timestamp(),admitted_at=NULL,lease_until=NULL,work_until=NULL,worker_id=NULL,departed_until=NULL,resume_until=NULL,client_id=NULL WHERE budget_key=$1 AND job_key=$2 AND state='complete' RETURNING job_key",[budget,job]);
   if(!rows.length){const existing=await query(cfg.databaseUrl,'SELECT state FROM wrapped_review_jobs WHERE budget_key=$1 AND job_key=$2',[budget,job]);if(existing.length)throw Object.assign(Error('Your Wrapped is already queued or generating. Please wait for it to finish.'),{status:409});}
   return {status:'queued'};
  }catch(error){if(error.status===409)throw error;throw Object.assign(Error('Unable to refresh your Wrapped right now. Your current results are still available. Please try again shortly.'),{status:503});}
 },async depart(userId,client){
  const cfg=config();if(!cfg.databaseUrl||now()<retryAt)return {status:'disabled'};
  if(!Number.isSafeInteger(userId)||userId<=0||typeof client!=='string'||!/^[a-f0-9-]{36}$/.test(client))throw Object.assign(Error('Invalid queue identity'),{status:400});
  const budget=createHash('sha256').update('osu-api:'+String(cfg.clientId||'default')).digest('hex');
  const jobs=['osu','taiko','fruits','mania'].map(mode=>createHmac('sha256',cfg.secret).update('review:'+userId+':'+mode+':v1').digest('hex'));
  try{await query(cfg.databaseUrl,'SELECT wrapped_review_depart($1,$2::text[],$3)',[budget,jobs,client]);return {status:'departed'};}
  catch{retryAt=now()+30000;return {status:'unavailable'};}
 },async release(ticket,data){
  if(ticket.status!=='active')return;
  const cfg=config(),complete=data?.loadingStatus?.complete===true;
  const result=complete?encryptReview(data,cfg.secret):null;
  let rows;try{rows=await query(cfg.databaseUrl,`UPDATE wrapped_review_jobs SET state=CASE WHEN $4::boolean THEN 'complete' WHEN departed_until IS NOT NULL THEN 'queued' ELSE state END, result=CASE WHEN $4::boolean THEN $5 ELSE result END, expires_at=CASE WHEN $4::boolean THEN now()+interval '15 minutes' ELSE expires_at END, work_until=NULL, worker_id=NULL, last_seen_at=now() WHERE budget_key=$1 AND job_key=$2 AND worker_id=$3 AND work_until>now() RETURNING job_key`,[ticket.budget,ticket.job,ticket.worker,complete,result]);}catch{retryAt=now()+30000;return {status:'unavailable'};}
  if(!rows.length)throw Object.assign(Error('Your profile job is being resumed. Please wait.'),{status:503});
 }};
}
export const reviewQueue=createReviewQueue();
