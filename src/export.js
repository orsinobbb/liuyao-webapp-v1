import {buildCaseRecord,casesToCsv} from './feedback.js';

function download(content,type,filename){
  const blob=new Blob([content],{type}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href);
}
export function downloadJson(chart,feedback=null){
  const blob=JSON.stringify(buildCaseRecord(chart,feedback),null,2); const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([blob],{type:'application/json'})); a.download=`liuyao-${chart.context.date}-${chart.original.name}.json`; a.click(); URL.revokeObjectURL(a.href);
}
export function downloadCasesJson(charts,feedbackMap){
  const records=charts.map(chart=>buildCaseRecord(chart,feedbackMap[chart.id]||null));
  download(JSON.stringify({schemaVersion:'liuyao-dataset-v1',exportedAt:new Date().toISOString(),records},null,2),'application/json','liuyao-cases.json');
}
export function downloadCasesCsv(charts,feedbackMap){
  const records=charts.map(chart=>buildCaseRecord(chart,feedbackMap[chart.id]||null));
  download('\ufeff'+casesToCsv(records),'text/csv;charset=utf-8','liuyao-cases.csv');
}
export async function copySummary(chart){
  const u=chart.useGod.primary;
  const lines=[`六爻：${chart.original.displayName}${chart.codes.movingLines.length?` → ${chart.changed.displayName}`:''}`,
    `月建：${chart.context.monthBranch}　日辰：${chart.context.dayGanzhi}　旬空：${chart.context.voidBranches.join('')}`,
    `世：${chart.judgement.shiSummary}　應：${chart.judgement.yingSummary}`,
    `用神：${u?`${u.lineLabel} ${u.relative}${u.branch}${u.element}`:'未指定'}`,
    `綜合：${chart.judgement.tendency}`,...chart.judgement.reasons.map(x=>`- ${x}`)];
  await navigator.clipboard.writeText(lines.join('\n'));
}
