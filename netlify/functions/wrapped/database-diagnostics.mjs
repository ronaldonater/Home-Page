// Log fixed feature labels and safe error codes only, never database URLs or query parameters.
export function createDatabaseDiagnostics({warn=(...args)=>console.warn(...args),now=Date.now}={}){
 const last=new Map();
 return (feature,error)=>{const time=now();if(last.has(feature)&&time-last.get(feature)<60000)return;last.set(feature,time);
  const code=typeof error?.code==='string'&&/^[0-9A-Z]{5}$/.test(error.code)?' PostgreSQL code: '+error.code+'.':'';
  warn('[osu! Wrapped] Neon/database feature unavailable: '+feature+'. Check database connectivity, environment configuration, and SQL setup.'+code);
 };
}
export const databaseWarning=createDatabaseDiagnostics();
