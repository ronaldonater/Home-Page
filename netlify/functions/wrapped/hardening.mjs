const MAX_IMAGE_BYTES=2*1024*1024;
export async function imageBytes(response,maxBytes=MAX_IMAGE_BYTES){
 const declared=response.headers.get('content-length');
 if(declared && (!/^\d+$/.test(declared) || Number(declared)>maxBytes)){
  await response.body?.cancel();throw Error('Image exceeds size limit');
 }
 if(!response.body)throw Error('Missing image body');
 const reader=response.body.getReader();const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
  if(size>maxBytes){await reader.cancel();throw Error('Image exceeds size limit');}chunks.push(Buffer.from(value));
 }}finally{reader.releaseLock();}
 return Buffer.concat(chunks,size);
}
export function callbackUrl(value){
 const url=new URL(value);
 if(url.username||url.password||url.search||url.hash)throw Error('Invalid OAuth callback configuration');
 if(url.protocol!=='https:' && !(url.protocol==='http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw Error('OAuth requires HTTPS outside localhost');
 if(process.env.CONTEXT && process.env.CONTEXT!=='dev' && url.protocol!=='https:')throw Error('Deployed OAuth requires HTTPS');
 return url;
}
export function sessionValid(session){return session?.kind==='session' && typeof session.token==='string' && /^[\x21-\x7e]{1,2048}$/.test(session.token);}
export function stateValid(saved,state){return saved?.kind==='oauth-state' && typeof saved.state==='string' && /^[a-f0-9]{48}$/.test(saved.state) && typeof state==='string' && /^[a-f0-9]{48}$/.test(state);}
