const VALID_RELATIVES=new Set(['父母','官鬼','妻財','兄弟','子孫']);
export function resolveUseGod(lines,{categoryId,manualRelative,questionCategories}){
  const category=questionCategories?.categories?.find(x=>x.id===categoryId);
  const configured=(category?.primary||[]).filter(x=>VALID_RELATIVES.has(x));
  const relatives=manualRelative?[manualRelative]:configured;
  const candidates=lines.filter(l=>relatives.includes(l.relative));
  const ranked=[...candidates].sort((a,b)=>{
    const va=(a.moving?2:0)+(a.isShi?1.2:0)+a.strength.score;
    const vb=(b.moving?2:0)+(b.isShi?1.2:0)+b.strength.score;
    return vb-va;
  });
  return {requestedRelatives:relatives,candidates:ranked,primary:ranked[0]||null,needsManual:!manualRelative&&relatives.length===0,ruleVersion:questionCategories?.version||'unversioned'};
}
