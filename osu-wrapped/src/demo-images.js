import manifest from './data/demo-images.json' with {type:'json'};
export function demoAsset(value){
 if(typeof value!=='string')return value;
 const direct=manifest.assets[value.replaceAll('&amp;','&')];if(direct)return direct;
 try{const url=new URL(value.replaceAll('&amp;','&'),'https://demo.invalid'),path=url.pathname.replace('/api/osu-wrapped/','/api/');
  if(url.origin==='https://demo.invalid'){
   const source=path==='/api/cover'?url.searchParams.get('url'):path==='/api/avatar'?'https://a.ppy.sh/'+url.searchParams.get('id'):path==='/api/medal-image'?'https://assets.ppy.sh/medals/web/'+url.searchParams.get('file'):null;
   if(source&&manifest.assets[source])return manifest.assets[source];
  }
 }catch{}
 return value;
}
export function demoMarkup(markup,enabled=true){return enabled?markup.replace(/(?:https:\/\/(?:assets\.ppy\.sh|a\.ppy\.sh)\/[^\s"'<>()[\]]+|\/api(?:\/osu-wrapped)?\/(?:cover|avatar|medal-image)\?[^\s"'<>()[\]]+)/g,value=>demoAsset(value)):markup;}
