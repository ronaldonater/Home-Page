// Preserve the slideshow's pause state across a temporary foreground effect.
export function createSecretPlayback({isPaused,pause,resume,isOpen}){
 let active=false,shouldResume=false;
 return {get active(){return active;},start(){if(active||!isOpen())return;active=true;shouldResume=!isPaused();if(shouldResume)pause();},finish(){if(!active)return;active=false;const restore=shouldResume;shouldResume=false;if(restore&&isOpen()&&isPaused())resume();}};
}
