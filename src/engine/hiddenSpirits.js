import { buildNajiaLines } from './najia.js';
import { relativeFromPalace, elementRelation } from './elements.js';
import { assessStrength } from './strength.js';

const FLYING_RELATION_LABELS={
  generates:'飛神生伏神',
  controls:'飛神剋伏神',
  generatedBy:'伏神生飛神',
  controlledBy:'伏神剋飛神',
  same:'飛伏比和',
  none:'飛伏無直接生剋'
};

export function flyingHiddenRelation(flyingElement,hiddenElement){
  const code=elementRelation(flyingElement,hiddenElement);
  return {code,label:FLYING_RELATION_LABELS[code]};
}

export function buildHiddenSpirits(original,visibleLines,{hexagrams,najia,strengthContext}){
  const palaceHexagram=hexagrams.hexagrams.find(item=>item.palace===original.palace&&item.palaceStage==='本宮');
  if(!palaceHexagram) throw new Error(`找不到${original.palace}宮本宮卦`);
  const palaceLines=buildNajiaLines(palaceHexagram,najia);
  const visibleRelatives=new Set(visibleLines.map(line=>line.relative));
  const hiddenSpirits=[];

  palaceLines.forEach((palaceLine,index)=>{
    const relative=relativeFromPalace(original.palaceElement,palaceLine.element);
    if(visibleRelatives.has(relative)) return;
    const flying=visibleLines[index];
    const base={
      line:index+1,lineLabel:flying.lineLabel,
      stem:palaceLine.stem,branch:palaceLine.branch,element:palaceLine.element,relative,
      spirit:flying.spirit,moving:false,isShi:flying.isShi,isYing:flying.isYing,isHidden:true,
      palaceHexagram:palaceHexagram.name,
      flying:{relative:flying.relative,stem:flying.stem,branch:flying.branch,element:flying.element},
      flyingRelation:flyingHiddenRelation(flying.element,palaceLine.element)
    };
    hiddenSpirits.push({...base,strength:assessStrength(base,strengthContext)});
  });
  return {palaceHexagram,hiddenSpirits};
}
