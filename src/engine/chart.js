import { LINE_LABELS, VALUE_META, ELEMENT_OF_BRANCH } from './constants.js';
import { lineValuesToCodes, findHexagram } from './hexagram.js';
import { buildNajiaLines } from './najia.js';
import { relativeFromPalace } from './elements.js';
import { buildSixSpirits } from './sixSpirits.js';
import { assessStrength } from './strength.js';
import { returnRelation } from './relations.js';
import { resolveUseGod } from './useGod.js';
import { judge } from './judgement.js';
import { buildTiming } from './timing.js';
import { ganzhiDayFromGregorian, monthBranchFromDateTime, xunVoidFromGanzhi } from './calendar.js';
import { validateChartInput } from './validation.js';

export function createChart(input,data){
  input=validateChartInput(input,data);
  const codes=lineValuesToCodes(input.lines);
  const original=findHexagram(codes.originalCode,data.hexagrams);
  const changed=findHexagram(codes.changedCode,data.hexagrams);
  const originalNajia=buildNajiaLines(original,data.najia);
  const changedNajia=buildNajiaLines(changed,data.najia);

  const autoDay=ganzhiDayFromGregorian(input.date);
  const dayGanzhi=input.dayGanzhi||autoDay.ganzhi;
  const dayStem=dayGanzhi[0], dayBranch=dayGanzhi[1];
  const autoMonth=monthBranchFromDateTime(input.date,input.time);
  const monthBranch=input.monthBranch||autoMonth.branch;
  const xun=xunVoidFromGanzhi(dayGanzhi,data.xunkong);
  const spirits=buildSixSpirits(dayStem,data.sixSpirits);

  const lines=originalNajia.map((n,i)=>{
    const value=input.lines[i]; const moving=VALUE_META[value].moving;
    const changedN=changedNajia[i];
    const relative=relativeFromPalace(original.palaceElement,n.element);
    // 《增刪卜易》法：變爻六親仍以前卦卦宮五行為準。
    const changedRelative=relativeFromPalace(original.palaceElement,changedN.element);
    const base={
      line:i+1,lineLabel:LINE_LABELS[i],value,valueName:VALUE_META[value].name,moving,
      glyph:VALUE_META[value].glyph,changedGlyph:VALUE_META[value].changedGlyph,
      stem:n.stem,branch:n.branch,element:n.element,relative,spirit:spirits[i],
      isShi:original.shiLine===i+1,isYing:original.yingLine===i+1,
      changed:{stem:changedN.stem,branch:changedN.branch,element:changedN.element,relative:changedRelative}
    };
    const strength=assessStrength(base,{monthBranch,dayBranch,voidBranches:xun.voidBranches,relationsData:data.branchRelations,weightsData:data.strengthWeights});
    return {...base,strength,returnRelation:moving?returnRelation(n.element,changedN.element):''};
  });
  const useGod=resolveUseGod(lines,{categoryId:input.categoryId,manualRelative:input.manualRelative,questionCategories:data.questionCategories});
  const chart={
    id:globalThis.crypto?.randomUUID?globalThis.crypto.randomUUID():`${Date.now()}`,
    createdAt:new Date().toISOString(), question:input.question||'', categoryId:input.categoryId||'', manualRelative:input.manualRelative||'',
    context:{date:input.date,time:input.time,timezone:'Asia/Taipei',dayGanzhi,dayStem,dayBranch,monthBranch,xunStart:xun.xunStart,voidBranches:xun.voidBranches,autoDayGanzhi:autoDay.ganzhi,autoMonthBranch:autoMonth.branch,monthBoundaryHint:autoMonth.boundary,monthBoundaryUtc:autoMonth.boundaryUtc},
    inputLines:[...input.lines],codes,original,changed,lines,useGod,
    rules:{pipelineVersion:data.enginePipeline?.version||'unversioned',questionCategoriesVersion:data.questionCategories?.version||'unversioned',strengthWeightsVersion:data.strengthWeights?.version||'unversioned',judgementVersion:data.judgementRules?.version||'unversioned'}
  };
  chart.judgement=judge(chart,data.branchRelations,data.judgementRules);
  chart.timing=buildTiming(chart,data.branchRelations);
  return chart;
}
