import snapshot from './data/demo-snapshot.json' with {type:'json'};
export const demoSnapshotAt=snapshot.snapshotAt;
export function demo(mode='osu'){const data=structuredClone(snapshot.modes[mode]||snapshot.modes.osu);delete data.user.avatar;return data;}
export function demoGlobal(mode='osu'){return structuredClone((snapshot.modes[mode]||snapshot.modes.osu).globalStats);}
