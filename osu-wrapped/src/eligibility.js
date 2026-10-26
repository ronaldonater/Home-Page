export const hasEligibleScores=data=>Number.isSafeInteger(data?.sampleCount)&&data.sampleCount>0;
export const hasEligibleMapping=data=>data?.mapping?.status==='ready'&&Number.isSafeInteger(data.mapping.created)&&data.mapping.created>0;
export const mappingOnly=data=>!hasEligibleScores(data)&&hasEligibleMapping(data);
export const canViewWrapped=data=>hasEligibleScores(data)||hasEligibleMapping(data);
