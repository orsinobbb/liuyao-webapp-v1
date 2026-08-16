import { loadAllData } from './data-loader.js';
import { createChart } from './engine/chart.js';
import { ganzhiDayFromGregorian, monthBranchFromDateTime } from './engine/calendar.js';
import { saveHistory, loadHistory, loadFeedbackMap, saveChartFeedback, clearHistory } from './storage.js';
import { normalizeFeedback } from './feedback.js';
import { downloadJson, downloadCasesJson, downloadCasesCsv, copySummary } from './export.js';

const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
let DATA, currentChart;
const defaultValues=[7,8,7,8,7,8];

function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function lineCell(v){const meta={6:['老陰','⚋','動'],7:['少陽','⚊','靜'],8:['少陰','⚋','靜'],9:['老陽','⚊','動']}[v];return `<span class="glyph">${meta[1]}</span><span>${meta[0]}</span><small>${meta[2]}</small>`}
function renderLineInputs(values=defaultValues){
  const box=$('#lineInputs'); box.innerHTML='';
  for(let i=5;i>=0;i--){
    const row=document.createElement('div'); row.className='line-input'; row.dataset.line=String(i+1);
    row.innerHTML=`<span class="line-no">${['初','二','三','四','五','上'][i]}爻</span><div class="seg">${[6,7,8,9].map(v=>`<button type="button" class="line-value ${values[i]===v?'active':''}" data-value="${v}">${lineCell(v)}</button>`).join('')}</div>`;
    box.appendChild(row);
  }
  $$('.line-value').forEach(b=>b.onclick=()=>{b.parentElement.querySelectorAll('.line-value').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});b.classList.add('active');b.setAttribute('aria-pressed','true')});
  $$('.line-value').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false'));
}
function readLines(){
  const vals=Array(6);
  $$('.line-input').forEach(r=>{const i=Number(r.dataset.line)-1; vals[i]=Number(r.querySelector('.line-value.active')?.dataset.value)});
  if(vals.some(v=>![6,7,8,9].includes(v))) throw new Error('六爻都必須選擇 6/7/8/9'); return vals;
}
function syncCalendarHints(){
  const date=$('#date').value; if(!date)return;
  const g=ganzhiDayFromGregorian(date),m=monthBranchFromDateTime(date,$('#time').value||'12:00');
  $('#dayHint').textContent=`自動：${g.ganzhi}`; $('#monthHint').textContent=`天文節氣：${m.branch}月（交界 ${m.boundary}）`;
  if(!$('#dayManual').dataset.touched) $('#dayManual').value='';
  if(!$('#monthManual').dataset.touched) $('#monthManual').value='';
}
function categoryOptions(){
  const select=$('#category'); select.replaceChildren();
  DATA.questionCategories.categories.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.label;select.appendChild(option)});
  renderUseGodGuide();
}
function selectorText(rule){return rule?.selector?`${rule.selector}・${rule.meaning}`:'需依情境手動指定'}
function renderUseGodGuide(){
  const categories=DATA.questionCategories.categories;
  const selected=categories.find(item=>item.id===$('#category').value)||categories[0];
  const observations=(selected.observe||[]).map(rule=>`${rule.selector}（${rule.meaning}）`).join('、')||'無';
  const questions=(selected.questions||[]).join('、')||'無';
  $('#categoryRule').innerHTML=`<b>主用神：${selectorText(selected.primary)}</b><span>輔助：${observations}</span><small>排卦前確認：${questions}${selected.caution?`｜${selected.caution}`:''}</small>`;
  $('#useGodRuleTable').innerHTML=categories.map(item=>`<tr><td data-label="問事情境"><b>${item.label}</b>${item.caution?`<small>${item.caution}</small>`:''}</td><td data-label="主用神">${selectorText(item.primary)}</td><td data-label="輔助觀察">${(item.observe||[]).map(rule=>`${rule.selector}・${rule.meaning}`).join('<br>')||'—'}</td><td data-label="必要追問">${(item.questions||[]).join('<br>')||'—'}</td></tr>`).join('');
}
function chip(t){return `<span class="chip">${t}</span>`}
function strengthClass(b){return b.includes('旺')?'good':b.includes('弱')?'bad':'neutral'}
function renderHiddenSpirits(c){
  const box=$('#hiddenSpirits');
  $('#hiddenSpiritCount').textContent=c.hiddenSpirits.length?`${c.hiddenSpirits.length} 個伏神・來源 ${c.hiddenSourceHexagram}卦`:'本卦六親齊備';
  if(!c.hiddenSpirits.length){
    box.innerHTML='<div class="flying-hidden-empty"><b>此卦不需裝伏神</b><span>本卦明爻已具備五類六親，因此沒有伏藏六親與飛伏關係。</span></div>';
    return;
  }
  box.innerHTML=c.hiddenSpirits.map(hidden=>{
    const flyingLine=c.lines[hidden.line-1];
    const flyingState=[flyingLine.strength.band,...flyingLine.strength.tags].join('・');
    const hiddenState=[hidden.strength.band,...hidden.strength.tags].join('・');
    return `<article class="flying-hidden-card"><div class="flying-hidden-head"><b>${hidden.lineLabel}</b><span>${hidden.flyingRelation.label}</span></div><div class="flying-hidden-pair"><div><small>飛神・明爻</small><strong>${hidden.flying.relative} ${hidden.flying.stem}${hidden.flying.branch}${hidden.flying.element}</strong><em>${flyingState}</em></div><i>→</i><div class="hidden-side"><small>伏神・藏爻</small><strong>${hidden.relative} ${hidden.stem}${hidden.branch}${hidden.element}</strong><em>${hiddenState}</em></div></div><p>伏於${hidden.lineLabel}${hidden.flying.relative}${hidden.flying.branch}${hidden.flying.element}之下，取自${hidden.palaceHexagram}卦同爻位。</p></article>`;
  }).join('');
}
function renderSources(c){
  const box=$('#sources'); box.replaceChildren();
  const sourceMap=new Map((DATA.sourceCatalog?.sources||[]).map(source=>[source.id,source]));
  (c.sourceRefs||[]).map(id=>sourceMap.get(id)).filter(Boolean).forEach(source=>{
    const row=document.createElement('article');row.className='source-row';
    const heading=document.createElement('div');const title=document.createElement('b');title.textContent=source.title;
    const badge=document.createElement('span');badge.className='source-badge';badge.textContent=source.authority;
    heading.append(title,badge);
    const detail=document.createElement('p');detail.textContent=`${source.supports.join('；')}。${source.notes}`;
    const link=document.createElement('a');link.textContent=source.url.startsWith('http')?'查看公開來源':'查看內部規則檔';link.href=source.url;
    if(source.url.startsWith('http')){link.target='_blank';link.rel='noopener noreferrer'}
    row.append(heading,detail,link);box.appendChild(row);
  });
  $('#sourceBoundary').textContent=DATA.rulePack?.claimBoundary||DATA.sourceCatalog?.disclaimer||'';
}
function renderFeedback(c){
  const feedback=loadFeedbackMap()[c.id]||{};
  $('#outcome').value=feedback.outcome||'pending';
  $('#accuracyScore').value=feedback.accuracyScore||'';
  $('#usefulnessScore').value=feedback.usefulnessScore||'';
  $('#outcomeDate').value=feedback.outcomeDate||'';
  $('#feedbackComment').value=feedback.comment||'';
  $('#feedbackStatus').textContent=feedback.updatedAt?`上次儲存：${new Date(feedback.updatedAt).toLocaleString('zh-TW')}`:'尚未填寫事後回饋';
}
function renderChart(c){
  currentChart=c; $('#empty').hidden=true; $('#result').hidden=false;
  $('#hexOriginal').innerHTML=`<small>本卦</small><strong>${c.original.displayName}</strong><span>${c.original.palace}宮・${c.original.palaceElement}・${c.original.palaceStage}</span>`;
  $('#hexChanged').innerHTML=`<small>變卦</small><strong>${c.changed.displayName}</strong><span>${c.codes.movingLines.length?`動爻 ${c.codes.movingLines.join('、')}`:'六爻安靜'}</span>`;
  $('#contextCards').innerHTML=[`月建 ${c.context.monthBranch}`,`日辰 ${c.context.dayGanzhi}`,`旬空 ${c.context.voidBranches.join('')}`,`世 ${c.original.shiLine}／應 ${c.original.yingLine}`].map(chip).join('');
  $('#lineTable tbody').innerHTML=[...c.lines].reverse().map(l=>{
    const role=[l.isShi?'世':'',l.isYing?'應':''].filter(Boolean).join(' ');
    const state=[l.strength.band,...l.strength.tags].map(x=>`<span class="state ${strengthClass(x)}">${x}</span>`).join('');
    const change=l.moving?`${l.changed.relative}${l.changed.branch}${l.changed.element}<br><small>${l.returnRelation}</small>`:'—';
    const hidden=l.hiddenSpirit?`<div class="hidden-spirit"><b>伏神 ${l.hiddenSpirit.relative}</b> ${l.hiddenSpirit.stem}${l.hiddenSpirit.branch}${l.hiddenSpirit.element}<small>${l.hiddenSpirit.flyingRelation.label}・${l.hiddenSpirit.strength.band}</small></div>`:'';
    return `<tr class="${l.moving?'moving':''}"><td>${l.lineLabel}<br><b>${role}</b></td><td>${l.spirit}</td><td><b>${l.relative}</b><br>${l.stem}${l.branch}${l.element}${hidden}</td><td class="yao">${l.glyph}${l.moving?'<i>→</i>'+l.changedGlyph:''}</td><td>${change}</td><td>${state}<small class="score">${l.strength.score>0?'+':''}${l.strength.score}</small></td></tr>`
  }).join('');
  renderHiddenSpirits(c);
  const u=c.useGod.primary;
  const rule=c.useGod.primaryRule;
  const observed=c.useGod.observations.map(item=>`${item.selector}：${item.meaning}`).join('；');
  $('#useGod').innerHTML=(u?`<strong>${u.lineLabel}・${u.isHidden?'伏神 ':''}${u.relative}${u.branch}${u.element}</strong><span>${u.strength.band} ${u.moving?'・動爻':''}${u.isHidden?`・${u.flyingRelation.label}`:''}</span><small>主取 ${rule.selector}：${rule.meaning}；候選 ${c.useGod.candidates.length} 爻。</small>`:`<strong>尚未指定</strong><span>此情境需先回答追問，再手動選擇用神六親。</span>`)+`<div class="use-god-context"><b>輔助觀察</b><span>${observed||'無'}</span><b>排卦前確認</b><span>${c.useGod.questions.join('、')||'無'}${c.useGod.caution?`｜${c.useGod.caution}`:''}</span></div>`;
  $('#judgement').innerHTML=`<div class="tendency">${c.judgement.tendency}</div><div class="confidence">信心：${c.judgement.confidence} ${c.judgement.rawScore!==undefined?`・趨勢分 ${c.judgement.rawScore}`:''}</div><ol>${c.judgement.reasons.map(x=>`<li>${x}</li>`).join('')}</ol>`;
  $('#timing').innerHTML=c.timing.length?c.timing.map(t=>`<div class="timing-row"><b>${t.branch}</b><span>${t.reason}</span><small>${t.nextDates.map(d=>`${d.date} ${d.ganzhi}`).join('　')}</small></div>`).join(''):'<p>用神未明，暫不產生應期候選。</p>';
  $('#trace').textContent=JSON.stringify(c,null,2);
  renderSources(c);renderFeedback(c);
  renderHistory();
}
function makeInput(){return {question:$('#question').value.trim(),categoryId:$('#category').value,manualRelative:$('#manualRelative').value,date:$('#date').value,time:$('#time').value,dayGanzhi:$('#dayManual').value.trim(),monthBranch:$('#monthManual').value,lines:readLines()}}
function cast(){try{const c=createChart(makeInput(),DATA);saveHistory(c);renderChart(c)}catch(e){alert(e.message)}}
function randomDemo(){renderLineInputs(Array.from({length:6},()=>[6,7,8,9][Math.floor(Math.random()*4)]));cast()}
function saveReview(){
  if(!currentChart)return;
  try{
    const feedback=normalizeFeedback({outcome:$('#outcome').value,accuracyScore:$('#accuracyScore').value,usefulnessScore:$('#usefulnessScore').value,outcomeDate:$('#outcomeDate').value,comment:$('#feedbackComment').value});
    saveChartFeedback(currentChart.id,feedback);renderFeedback(currentChart);renderHistory();
    $('#saveFeedback').textContent='已儲存';setTimeout(()=>$('#saveFeedback').textContent='儲存回饋',1200);
  }catch(error){alert(error.message)}
}
function exportDataset(format){
  const history=loadHistory();if(!history.length){alert('尚無案例可匯出');return}
  const feedbackMap=loadFeedbackMap();
  if(format==='csv')downloadCasesCsv(history,feedbackMap);else downloadCasesJson(history,feedbackMap);
}
function renderHistory(){
  const history=loadHistory().filter(item=>item?.original?.displayName&&item?.changed?.displayName&&item?.context?.date&&Array.isArray(item?.codes?.movingLines));
  const feedbackMap=loadFeedbackMap();
  const box=$('#historyList'); box.replaceChildren();
  if(!history.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='尚無紀錄';box.appendChild(empty);return}
  history.slice(0,8).forEach(item=>{
    const button=document.createElement('button');button.className='history-item';button.type='button';
    const title=document.createElement('b');title.textContent=`${item.original.displayName}${item.codes.movingLines.length?' → '+item.changed.displayName:''}`;
    const detail=document.createElement('span');detail.textContent=`${item.context.date}・${item.question||'未命名問事'}${feedbackMap[item.id]?'・已回饋':''}`;
    button.append(title,detail);button.onclick=()=>renderChart(item);box.appendChild(button);
  });
}

async function init(){
  DATA=await loadAllData(); categoryOptions(); $('#date').value=today(); $('#time').value='12:00'; renderLineInputs(); syncCalendarHints(); renderHistory();
  $('#category').onchange=renderUseGodGuide; $('#date').onchange=syncCalendarHints; $('#time').onchange=syncCalendarHints; $('#dayManual').oninput=e=>e.target.dataset.touched='1'; $('#monthManual').onchange=e=>e.target.dataset.touched='1';
  $('#cast').onclick=cast; $('#demo').onclick=randomDemo; $('#reset').onclick=()=>{currentChart=null;renderLineInputs();$('#question').value='';$('#manualRelative').value='';$('#result').hidden=true;$('#empty').hidden=false};
  $('#saveFeedback').onclick=saveReview; $('#export').onclick=()=>currentChart&&downloadJson(currentChart,loadFeedbackMap()[currentChart.id]||null); $('#exportCasesJson').onclick=()=>exportDataset('json'); $('#exportCasesCsv').onclick=()=>exportDataset('csv');
  $('#copy').onclick=async()=>{if(currentChart){await copySummary(currentChart);$('#copy').textContent='已複製';setTimeout(()=>$('#copy').textContent='複製摘要',1000)}};
  $('#clearHistory').onclick=()=>{clearHistory();renderHistory()};
}
init().catch(e=>{const pre=document.createElement('pre');pre.style.padding='24px';pre.textContent=`啟動失敗：${e.stack||e.message}`;document.body.replaceChildren(pre)});
