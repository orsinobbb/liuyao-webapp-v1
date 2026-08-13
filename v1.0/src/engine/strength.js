import { ELEMENT_OF_BRANCH } from './constants.js';
import { contextRelation } from './relations.js';

export function assessStrength(line,{monthBranch,dayBranch,voidBranches,relationsData,weightsData}){
  const w=weightsData.weights; let score=0; const reasons=[]; const tags=[];
  const month=contextRelation(monthBranch,line.branch,relationsData);
  const day=contextRelation(dayBranch,line.branch,relationsData);
  const add=(n,why)=>{score+=n;if(n) reasons.push(`${n>0?'+':''}${n} ${why}`)};

  if(month.branchTags.includes('同支')) add(w.monthSameBranch,'臨月建');
  else if(ELEMENT_OF_BRANCH[monthBranch]===line.element) add(w.monthSameElement,'得月同五行');
  if(month.elementRelation==='generates') add(w.monthGeneratesLine,'月建生爻');
  if(month.elementRelation==='controls') add(w.monthControlsLine,'月建剋爻');
  if(month.branchTags.includes('沖')){add(w.monthClash,'月破');tags.push('月破');}
  if(month.branchTags.includes('合')){add(w.monthCombine,'月合');tags.push('月合');}

  if(day.branchTags.includes('同支')) add(w.daySameBranch,'臨日辰');
  else if(ELEMENT_OF_BRANCH[dayBranch]===line.element) add(w.daySameElement,'得日同五行');
  if(day.elementRelation==='generates') add(w.dayGeneratesLine,'日辰生爻');
  if(day.elementRelation==='controls') add(w.dayControlsLine,'日辰剋爻');
  if(day.branchTags.includes('沖')){add(w.dayClash,'日沖');tags.push('日沖');}
  if(day.branchTags.includes('合')){add(w.dayCombine,'日合');tags.push('日合');}
  if(line.moving){add(w.moving,'動爻');tags.push('動');}
  if(voidBranches.includes(line.branch)){add(w.void,'旬空');tags.push('空亡');}

  const band=weightsData.bands.find(x=>score>=x.min)?.label||'平';
  if(!line.moving && day.branchTags.includes('沖') && !tags.includes('月破') && score>=0) tags.push('暗動候選');
  return {score:Number(score.toFixed(1)),band,tags:[...new Set(tags)],reasons,month,day};
}
