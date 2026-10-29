const modes=['osu','taiko','fruits','mania'];
export function validReview(value){return value&&Number.isSafeInteger(value.user?.id)&&value.user.id>0&&typeof value.user.username==='string'&&modes.includes(value.mode)&&Number.isInteger(value.sampleCount)&&value.sampleCount>=0&&value.sampleCount<=200&&['top','months','mappers','artists'].every(key=>Array.isArray(value[key]));}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function loadReview({url,queueClient=null,fetchImpl=fetch,prepare=async()=>{},onProgress=()=>{},now=Date.now,sleep=pause}={}){
 async function retry(operation,phase){let attempts=0;for(;;){try{return await operation();}catch(error){if([400,401,403,409].includes(error.status))throw error;
  const delay=Math.max(Math.min(60000,5000*2**Math.min(attempts++,4)),Number.isFinite(error.retryAt)?error.retryAt-now():0);
  onProgress('waiting',{phase,message:error.message||'Waiting for services or API allowance.',until:now()+delay});await sleep(delay);onProgress(phase);
 }}}
 async function get(stage,selectedMode){const endpoint=new URL(url,'https://wrapped.invalid');endpoint.searchParams.set('stage',stage);if(queueClient)endpoint.searchParams.set('client',queueClient);if(selectedMode)endpoint.searchParams.set('mode',selectedMode);
  for(;;){
  const response=await fetchImpl(endpoint.pathname+endpoint.search,{cache:'no-store',signal:AbortSignal.timeout(30000)});let body;try{body=await response.json();}catch{throw Error('Incomplete server response.');}
  if(response.status===202&&['queued','processing'].includes(body.queue?.status)){
   const phase=stage==='full'?'details':stage,seconds=Math.max(3,Math.min(30,Number(body.queue.retryAfter)||10));
   const message=body.queue.status==='processing'?'Your profile is already being prepared.': 'You are number '+Math.max(1,Number(body.queue.position)||1)+' in the profile queue.';
   onProgress('waiting',{phase,message,queue:true,until:now()+seconds*1000});await sleep(seconds*1000);onProgress(phase);continue;
  }
  if(!response.ok){const error=Error(body.error||'Unable to load your review.');error.status=response.status;const header=response.headers?.get('retry-after'),seconds=Number(header),date=Date.parse(header);error.retryAt=header?(Number.isFinite(seconds)?now()+Math.max(0,seconds)*1000:date):[429,503].includes(response.status)?now()+60000:0;throw error;}
  if(!validReview(body)||(endpoint.searchParams.get('mode')&&body.mode!==endpoint.searchParams.get('mode')))throw Error('Incomplete profile or score data.');return body;}
 }
 const pending=message=>Object.assign(Error(message),{retryAt:now()+60000});
 onProgress('core');let core=await retry(async()=>{const value=await get('core');if(value.sampleCount===0&&value.mapping?.status!=='ready')throw pending('Mapping eligibility is not ready.');return value;},'core');
 const tagsComplete=value=>value.sampleCount===0||(value.skillsets?.total===value.sampleCount&&Number.isInteger(value.skillsets.checked)&&value.skillsets.checked===value.sampleCount);
 onProgress('tags',{checked:core.skillsets?.checked||0,total:core.sampleCount});
 while(!tagsComplete(core)){
  core=await retry(async()=>{const value=await get('tags',core.mode);if(value.user.id!==core.user.id||value.sampleCount!==core.sampleCount)throw Object.assign(Error('Your score selection changed. Please reload the page.'),{status:409});
   const checked=value.skillsets?.checked;if(!Number.isInteger(checked)||checked<=(core.skillsets?.checked||0)||checked>core.sampleCount||value.skillsets.total!==core.sampleCount)throw pending('User tags are still loading.');return value;},'tags');
  onProgress('tags',{checked:core.skillsets.checked,total:core.sampleCount});
 }
 onProgress('details');let value,previousProgress='',stalled=0;
 for(;;){
  value=await retry(()=>get('full',core.mode),'details');
  if(value.user.id!==core.user.id||value.sampleCount!==core.sampleCount)throw Object.assign(Error('Your score selection changed. Please reload the page.'),{status:409});
  const status=value.loadingStatus;
  if(status?.complete===true){value={...value,skillsets:tagsComplete(value)?value.skillsets:core.skillsets};break;}
  const checks=Array.isArray(status?.checks)?status.checks:[];
  onProgress('details',{checks});
  const progress=JSON.stringify(checks.map(check=>[check.name,check.complete,check.checked,check.total]));stalled=progress===previousProgress?stalled+1:0;previousProgress=progress;
  const serverDelay=Number.isFinite(status?.retryAfterMs)?Math.max(1100,Math.min(60000,status.retryAfterMs)):60000;
  const delay=Math.max(serverDelay,Math.min(15000,1100*2**Math.min(stalled,4)));
  const pendingNames=checks.filter(check=>!check.complete).map(check=>check.name).join(', ')||'Additional details';
  if(delay>1500)onProgress('waiting',{phase:'details',message:'Waiting for '+pendingNames+'.',until:now()+delay});
  await sleep(delay);onProgress('details',{checks});
 }
 onProgress('artwork');await retry(()=>prepare(value),'artwork');return {data:value};
}
