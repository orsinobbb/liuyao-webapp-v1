export function downloadJson(chart){
  const blob=new Blob([JSON.stringify(chart,null,2)],{type:'application/json'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=`liuyao-${chart.context.date}-${chart.original.name}.json`; a.click(); URL.revokeObjectURL(a.href);
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
