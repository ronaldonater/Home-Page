import {createHmac} from 'node:crypto';
import {CLUBS} from '../../../osu-wrapped/src/clubs.js';
export const CLUB_RULES_VERSION='2026-v29';
export const COMMUNITY_MINIMUM=1;
const modes=['osu','taiko','fruits','mania'];
const upsert=`INSERT INTO wrapped_club_assignments (participant_key, year, mode, club_id, rules_version)
 VALUES ($1, $2, $3, $4, $5)
 ON CONFLICT (participant_key, year, mode) DO UPDATE SET club_id=EXCLUDED.club_id, rules_version=EXCLUDED.rules_version, updated_at=now()
 WHERE wrapped_club_assignments.club_id IS DISTINCT FROM EXCLUDED.club_id
 OR wrapped_club_assignments.rules_version IS DISTINCT FROM EXCLUDED.rules_version
 OR wrapped_club_assignments.updated_at < now() - interval '1 day'`;
const counts=`SELECT club_id, count(*)::int AS count FROM wrapped_club_assignments
 WHERE year=$1 AND mode=$2 AND rules_version=$3 GROUP BY club_id`;
async function neonQuery(url,text,params){
 const {neon}=await import('@neondatabase/serverless');
 return neon(url).query(text,params,{fetchOptions:{signal:AbortSignal.timeout(2500)}});
}
export function createClubCommunity({query=neonQuery,now=()=>Date.now()}={}){
 const cache=new Map();let retryAfter=0;
 return async function recordClub(summary,{databaseUrl,trackingSecret}={}){
  if(!databaseUrl||typeof trackingSecret!=='string'||trackingSecret.length<32)return null;
  if(!Number.isSafeInteger(summary?.user?.id)||summary.user.id<=0||summary.demo||!modes.includes(summary.mode)||summary.year!==2026||!Object.hasOwn(CLUBS,summary.club?.id||''))return null;
  if(now()<retryAfter)return {status:'unavailable'};
  try{
   const participantKey=createHmac('sha256',trackingSecret).update('osu-wrapped:'+summary.user.id).digest('hex');
   await query(databaseUrl,upsert,[participantKey,summary.year,summary.mode,summary.club.id,CLUB_RULES_VERSION]);
   const key=summary.year+':'+summary.mode+':'+CLUB_RULES_VERSION,stored=cache.get(key);
   if(stored&&stored.expires>now())return stored.data;
   const rows=await query(databaseUrl,counts,[summary.year,summary.mode,CLUB_RULES_VERSION]);
   const valid=rows.filter(row=>Object.hasOwn(CLUBS,row.club_id)&&Number.isSafeInteger(Number(row.count))&&Number(row.count)>=0);
   const total=valid.reduce((sum,row)=>sum+Number(row.count),0);
   const data=total<COMMUNITY_MINIMUM?{status:'collecting',minimum:COMMUNITY_MINIMUM}:{status:'ready',total,year:summary.year,mode:summary.mode,rulesVersion:CLUB_RULES_VERSION,updatedAt:new Date(now()).toISOString(),clubs:Object.keys(CLUBS).map(id=>{const count=Number(valid.find(row=>row.club_id===id)?.count||0);return {id,count,percentage:count/total*100};})};
   cache.set(key,{expires:now()+60000,data});return data;
  }catch{retryAfter=now()+60000;return {status:'unavailable'};}
 };
}
export const recordClubCommunity=createClubCommunity();
