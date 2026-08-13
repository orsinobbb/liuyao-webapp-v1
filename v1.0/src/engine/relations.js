import { ELEMENT_OF_BRANCH } from './constants.js';
import { elementRelation } from './elements.js';
function pairHas(list,a,b){return list.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));}
export function branchRelation(a,b,data){
  const tags=[];
  if(a===b) tags.push('同支');
  if(pairHas(data.clash,a,b)) tags.push('沖');
  if(pairHas(data.combine,a,b)) tags.push('合');
  if(pairHas(data.harm,a,b)) tags.push('害');
  if(pairHas(data.break,a,b)) tags.push('破');
  for(const g of data.punishment.groups){ if(g.branches.includes(a)&&g.branches.includes(b)&&a!==b) tags.push('刑'); }
  if(a===b && data.punishment.self.includes(a)) tags.push('自刑');
  return tags;
}
export function contextRelation(contextBranch,lineBranch,data){
  const branchTags=branchRelation(contextBranch,lineBranch,data);
  const cr=elementRelation(ELEMENT_OF_BRANCH[contextBranch],ELEMENT_OF_BRANCH[lineBranch]);
  return {branchTags,elementRelation:cr};
}
export function returnRelation(originalElement,changedElement){
  const r=elementRelation(changedElement,originalElement);
  if(r==='generates') return '回頭生';
  if(r==='controls') return '回頭剋';
  if(r==='same') return '回頭比和';
  if(r==='generatedBy') return '化洩';
  if(r==='controlledBy') return '化制';
  return '無';
}
