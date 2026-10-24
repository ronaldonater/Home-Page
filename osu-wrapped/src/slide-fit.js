// Scale the content only; playback/navigation controls retain their normal size.
export function slideFitScale(contentWidth,contentHeight,viewportWidth,viewportHeight,gutter=8){
 if(![contentWidth,contentHeight,viewportWidth,viewportHeight].every(value=>Number.isFinite(value)&&value>0))return 1;
 const width=Math.max(1,viewportWidth-gutter*2),height=Math.max(1,viewportHeight-gutter*2);
 return Math.min(1,width/contentWidth,height/contentHeight);
}
