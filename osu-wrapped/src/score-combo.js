export function comboInfo(score){
 const raw=score?.combo??score?.max_combo;
 const combo=Number.isSafeInteger(raw)&&raw>=0?raw:null;
 const flag=[score?.fullCombo,score?.is_perfect_combo,score?.perfect].find(value=>typeof value==='boolean');
 return {combo,fullCombo:combo!==null&&combo>0&&score?.passed!==false&&flag===true};
}
export function comboLabel(score){const {combo,fullCombo}=comboInfo(score);return combo===null?'Combo unavailable':combo.toLocaleString('en-US')+'×';}
export function comboMarkup(score){const {fullCombo}=comboInfo(score);return '<span class="score-combo'+(fullCombo?' is-full-combo':'')+'"'+(fullCombo?' aria-label="Full combo: '+comboLabel(score)+'"':'')+'>'+comboLabel(score)+'</span>';}
