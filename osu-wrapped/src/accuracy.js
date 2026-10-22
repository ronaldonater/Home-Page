export function accuracyRank(value){return !Number.isFinite(value)?null:value>=100?'SS':value>=95?'S':value>=90?'A':value>=85?'B':value>=70?'C':'D';}
