import snapshot from './data/demo-snapshot.json' with {type:'json'};
export const demoSnapshotAt=snapshot.snapshotAt;
export function demo(mode='osu'){return structuredClone(snapshot.modes[mode]||snapshot.modes.osu);}
export function demoGlobal(mode='osu'){return structuredClone((snapshot.modes[mode]||snapshot.modes.osu).globalStats);}
