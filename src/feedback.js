const OUTCOMES=new Set(['pending','matched','partial','unmatched']);
function score(value){
  if(value===''||value===null||value===undefined)return null;
  const number=Number(value);
  if(!Number.isInteger(number)||number<1||number>5)throw new Error('評分必須介於 1 到 5');
  return number;
}
function validDate(value){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed=match?new Date(`${value}T00:00:00Z`):null;
  return Boolean(parsed&&!Number.isNaN(parsed.getTime())&&parsed.getUTCFullYear()===Number(match[1])&&parsed.getUTCMonth()+1===Number(match[2])&&parsed.getUTCDate()===Number(match[3]));
}
export function normalizeFeedback(input={},now=new Date().toISOString()){
  const outcome=OUTCOMES.has(input.outcome)?input.outcome:'pending';
  const outcomeDate=String(input.outcomeDate||'').trim();
  if(outcomeDate&&!validDate(outcomeDate))throw new Error('實際日期格式不正確');
  const comment=String(input.comment||'').trim();
  if(comment.length>1000)throw new Error('評語不可超過 1000 字');
  return {outcome,accuracyScore:score(input.accuracyScore),usefulnessScore:score(input.usefulnessScore),outcomeDate,comment,updatedAt:now};
}
export function buildCaseRecord(chart,feedback=null){
  if(!chart?.id)throw new Error('缺少案例 chart id');
  return {schemaVersion:'liuyao-case-v1',chart,review:feedback||null};
}
function csvCell(value){
  const text=Array.isArray(value)?value.join('|'):String(value===null||value===undefined?'':value);
  return `"${text.replaceAll('"','""')}"`;
}
export function casesToCsv(records){
  const headers=['schemaVersion','chartId','createdAt','question','categoryId','original','changed','movingLines','castDate','dayGanzhi','monthBranch','tendency','rulePackId','rulePackVersion','outcome','accuracyScore','usefulnessScore','outcomeDate','comment','feedbackUpdatedAt'];
  const rows=records.map(({schemaVersion,chart,review})=>[schemaVersion,chart.id,chart.createdAt,chart.question,chart.categoryId,chart.original?.displayName,chart.changed?.displayName,chart.codes?.movingLines,chart.context?.date,chart.context?.dayGanzhi,chart.context?.monthBranch,chart.judgement?.tendency,chart.rules?.rulePackId,chart.rules?.rulePackVersion,review?.outcome,review?.accuracyScore,review?.usefulnessScore,review?.outcomeDate,review?.comment,review?.updatedAt]);
  return [headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
