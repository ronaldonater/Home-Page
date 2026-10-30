import manifest from './data/demo-audio.json' with {type:'json'};
// Called only for frozen demo slides; live audio URLs are never substituted.
export function demoAudio(value){return typeof value==='string'&&Object.hasOwn(manifest.assets,value)?manifest.assets[value]:null;}
