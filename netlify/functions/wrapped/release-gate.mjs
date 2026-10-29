export const RELEASE_AT='2026-11-29T00:00:00.000Z';
export const ADMIN_USER_ID=7933825;
export const releaseOpen=(now=Date.now())=>now>=Date.parse(RELEASE_AT);
export const isReleaseAdmin=user=>Number.isSafeInteger(user?.id)&&user.id===ADMIN_USER_ID;
