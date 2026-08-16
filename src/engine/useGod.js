const VALID_RELATIVES=new Set(['父母','官鬼','妻財','兄弟','子孫']);
const VALID_SELECTORS=new Set([...VALID_RELATIVES,'世爻','應爻']);
const candidatesFor=(lines,selector)=>{
  if(VALID_RELATIVES.has(selector)) return lines.filter(line=>line.relative===selector);
  if(selector==='世爻') return lines.filter(line=>line.isShi&&!line.isHidden);
  if(selector==='應爻') return lines.filter(line=>line.isYing&&!line.isHidden);
  return [];
};
const rankCandidates=lines=>[...lines].sort((a,b)=>{
  const va=(a.moving?2:0)+(a.isShi?1.2:0)+(a.isHidden?-1:0)+a.strength.score;
  const vb=(b.moving?2:0)+(b.isShi?1.2:0)+(b.isHidden?-1:0)+b.strength.score;
  return vb-va;
});
export function resolveUseGod(lines,{categoryId,manualRelative,questionCategories}){
  const category=questionCategories?.categories?.find(x=>x.id===categoryId);
  const legacySelector=Array.isArray(category?.primary)?category.primary.find(item=>VALID_SELECTORS.has(item)):'';
  const configured=category?.primary&&!Array.isArray(category.primary)?category.primary:null;
  const primaryRule=manualRelative?{selector:manualRelative,meaning:'使用者手動指定'}:configured|| (legacySelector?{selector:legacySelector,meaning:'分類預設'}:null);
  const selector=primaryRule?.selector||'';
  const ranked=rankCandidates(candidatesFor(lines,selector));
  const observations=(category?.observe||[]).filter(rule=>VALID_SELECTORS.has(rule.selector)).map(rule=>({
    ...rule,
    candidates:rankCandidates(candidatesFor(lines,rule.selector)).map(line=>({line:line.line,lineLabel:line.lineLabel,relative:line.relative,branch:line.branch,element:line.element,strength:line.strength.band}))
  }));
  return {
    categoryId:category?.id||categoryId||'',categoryLabel:category?.label||'',primaryRule,
    requestedRelatives:VALID_RELATIVES.has(selector)?[selector]:[],requestedSelector:selector,
    candidates:ranked,primary:ranked[0]||null,observations,
    questions:[...(category?.questions||[])],caution:category?.caution||'',
    needsManual:!manualRelative&&!primaryRule,ruleVersion:questionCategories?.version||'unversioned'
  };
}
