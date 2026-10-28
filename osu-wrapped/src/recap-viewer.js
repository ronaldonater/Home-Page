export function openRecapViewer(source,{alt='Recap card',trigger,onClose}={}){
  const viewer=document.createElement('dialog');viewer.className='recap-image-viewer';viewer.setAttribute('aria-label','Expanded recap card');
  const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.setAttribute('aria-label','Close expanded recap card');close.onclick=()=>viewer.close();
  const image=document.createElement('img');image.src=source;image.alt=alt;image.draggable=false;
  const toolbar=document.createElement('div');toolbar.className='recap-zoom-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Recap zoom controls');
  const viewport=document.createElement('div');viewport.className='recap-zoom-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Recap card. Use plus and minus to zoom, or drag to move.');
  const canvas=document.createElement('div');canvas.className='recap-zoom-canvas';canvas.append(image);viewport.append(canvas);
  let zoom=1,baseWidth=0,baseHeight=0;
  const zoomOut=document.createElement('button'),zoomIn=document.createElement('button'),reset=document.createElement('button');
  for(const button of [zoomOut,zoomIn,reset])button.type='button';
  zoomOut.textContent='−';zoomOut.setAttribute('aria-label','Zoom out');zoomIn.textContent='+';zoomIn.setAttribute('aria-label','Zoom in');reset.setAttribute('aria-label','Reset zoom to fit');
  function drawZoom(){const w=baseWidth*zoom,h=baseHeight*zoom;image.style.width=w+'px';image.style.height=h+'px';canvas.style.width=Math.max(viewport.clientWidth,w)+'px';canvas.style.height=Math.max(viewport.clientHeight,h)+'px';reset.textContent=Math.round(zoom*100)+'% · Fit';zoomOut.disabled=zoom<=1;zoomIn.disabled=zoom>=5;viewport.classList.toggle('is-zoomed',zoom>1);}
  function setZoom(value,x=viewport.clientWidth/2,y=viewport.clientHeight/2){const old=zoom;zoom=Math.max(1,Math.min(5,value));if(!baseWidth)return;const px=(viewport.scrollLeft+x-Math.max(0,(viewport.clientWidth-baseWidth*old)/2))/(baseWidth*old),py=(viewport.scrollTop+y-Math.max(0,(viewport.clientHeight-baseHeight*old)/2))/(baseHeight*old);drawZoom();viewport.scrollLeft=px*baseWidth*zoom+Math.max(0,(viewport.clientWidth-baseWidth*zoom)/2)-x;viewport.scrollTop=py*baseHeight*zoom+Math.max(0,(viewport.clientHeight-baseHeight*zoom)/2)-y;}
  function fit(){if(!image.naturalWidth)return;const scale=Math.min(viewport.clientWidth/image.naturalWidth,viewport.clientHeight/image.naturalHeight);baseWidth=image.naturalWidth*scale;baseHeight=image.naturalHeight*scale;drawZoom();}
  zoomOut.onclick=()=>setZoom(zoom/1.25);zoomIn.onclick=()=>setZoom(zoom*1.25);reset.onclick=()=>setZoom(1);
  toolbar.append(zoomOut,reset,zoomIn,close);viewer.append(toolbar,viewport);
  image.addEventListener('load',fit);const resize=new ResizeObserver(fit);resize.observe(viewport);
  viewport.addEventListener('wheel',event=>{event.preventDefault();const rect=viewport.getBoundingClientRect();setZoom(zoom*Math.exp(-event.deltaY*.002),event.clientX-rect.left,event.clientY-rect.top);},{passive:false});
  viewport.addEventListener('dblclick',event=>{const rect=viewport.getBoundingClientRect();setZoom(zoom>1?1:2,event.clientX-rect.left,event.clientY-rect.top);});
  viewer.addEventListener('keydown',event=>{if(['+','=','-','0'].includes(event.key)){event.preventDefault();event.stopPropagation();setZoom(event.key==='0'?1:event.key==='-'?zoom/1.25:zoom*1.25);}else if(event.key!=='Escape')event.stopPropagation();});
  const pointers=new Map();let previous=null;
  function gesture(){const points=[...pointers.values()];return points.length>1?{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2,d:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)}:points.length?{...points[0],d:0}:null;}
  viewport.addEventListener('pointerdown',event=>{if(event.button!==0)return;viewport.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});previous=gesture();});
  viewport.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const current=gesture();if(previous){if(current.d&&previous.d){const rect=viewport.getBoundingClientRect();setZoom(zoom*current.d/previous.d,current.x-rect.left,current.y-rect.top);}viewport.scrollLeft-=current.x-previous.x;viewport.scrollTop-=current.y-previous.y;}previous=current;});
  const release=event=>{pointers.delete(event.pointerId);previous=gesture();};viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);viewport.addEventListener('lostpointercapture',release);
  viewer.addEventListener('close',()=>resize.disconnect(),{once:true});

  viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
  viewer.addEventListener('close',()=>{viewer.remove();if(trigger?.isConnected)trigger.focus();onClose?.();},{once:true});
  document.body.append(viewer);viewer.showModal();close.focus();
  return viewer;
}
