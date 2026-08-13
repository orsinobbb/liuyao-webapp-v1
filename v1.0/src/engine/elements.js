import { GENERATES, CONTROLS } from './constants.js';
export function elementRelation(a,b){
  if(a===b) return 'same';
  if(GENERATES[a]===b) return 'generates';
  if(CONTROLS[a]===b) return 'controls';
  if(GENERATES[b]===a) return 'generatedBy';
  if(CONTROLS[b]===a) return 'controlledBy';
  return 'none';
}
export function relationLabel(a,b){
  const r=elementRelation(a,b);
  return {same:'比和',generates:'生',controls:'剋',generatedBy:'受生',controlledBy:'受剋',none:'無'}[r];
}
export function relativeFromPalace(palaceElement,lineElement){
  if(palaceElement===lineElement) return '兄弟';
  if(GENERATES[palaceElement]===lineElement) return '子孫';
  if(CONTROLS[palaceElement]===lineElement) return '妻財';
  if(CONTROLS[lineElement]===palaceElement) return '官鬼';
  if(GENERATES[lineElement]===palaceElement) return '父母';
  throw new Error('五行關係錯誤');
}
export function roleToUseGod(useElement,lineElement){
  if(lineElement===useElement) return '用神';
  if(GENERATES[lineElement]===useElement) return '原神';
  if(CONTROLS[lineElement]===useElement) return '忌神';
  const taboo=Object.keys(CONTROLS).find(e=>CONTROLS[e]===useElement);
  if(taboo && GENERATES[lineElement]===taboo) return '仇神';
  if(taboo && CONTROLS[lineElement]===Object.keys(GENERATES).find(e=>GENERATES[e]===useElement)) return '仇神';
  return '閒神';
}
