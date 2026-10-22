import {handler} from './wrapped/api-handler.mjs';
// The default Fetch API wrapper lets Netlify extract and enforce traffic rules.
export default async function api(request){
 const url=new URL(request.url);
 const result=await handler({path:url.pathname,httpMethod:request.method,headers:Object.fromEntries(request.headers),queryStringParameters:Object.fromEntries(url.searchParams)});
 const headers=new Headers(result.headers);
 for(const [name,values] of Object.entries(result.multiValueHeaders||{}))for(const value of values)headers.append(name,value);
 return new Response(result.isBase64Encoded?Buffer.from(result.body,'base64'):result.body,{status:result.statusCode,headers});
}
export const config={rateLimit:{windowLimit:120,windowSize:60,aggregateBy:['ip','domain']}};
