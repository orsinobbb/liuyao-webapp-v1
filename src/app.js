import { loadAllData } from './data-loader.js';
import { createChart } from './engine/chart.js';
import { ganzhiDayFromGregorian, approximateMonthBranch } from './engine/calendar.js';
import { saveHistory, loadHistory, clearHistory } from './storage.js';
import { downloadJson, copySummary } from './export.js';

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
  $$('.line-value').forEach(b=>b.onclick=()=>{b.parentElement.querySelectorAll('.line-value').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
}
function readLines(){
  const vals=Array(6);
  $$('.line-input').forEach(r=>{const i=Number(r.dataset.line)-1; vals[i]=Number(r.querySelector('.line-value.active')?.dataset.value)});
  if(vals.some(v=>![6,7,8,9].includes(v))) throw new Error('六爻都必須選擇 6/7/8/9'); return vals;
}
function syncCalendarHints(){
  const date=$('#date').value; if(!date)return;
  const g=ganzhiDayFromGregorian(date),m=approximateMonthBranch(date);
  $('#dayHint').textContent=`自動：${g.ganzhi}`; $('#monthHint').textContent=`節氣快速輔助：${m.branch}月（${m.boundary}）`;
  if(!$('#dayManual').dataset.touched) $('#dayManual').value='';
  if(!$('#monthManual').dataset.touched) $('#monthManual').value='';
}
function categoryOptions(){
  $('#category').innerHTML=DATA.questionCategories.categories.map(x=>`<option value="${x.id}">${x.label}</option>`).join('');
}
function chip(t){return `<span class="chip">${t}</span>`}
function strengthClass(b){return b.includes('旺')?'good':b.includes('弱')?'bad':'neutral'}
function renderChart(c){
  currentChart=c; $('#empty').hidden=true; $('#result').hidden=false;
  $('#hexOriginal').innerHTML=`<small>本卦</small><strong>${c.original.displayName}</strong><span>${c.original.palace}宮・${c.original.palaceElement}・${c.original.palaceStage}</span>`;
  $('#hexChanged').innerHTML=`<small>變卦</small><strong>${c.changed.displayName}</strong><span>${c.codes.movingLines.length?`動爻 ${c.codes.movingLines.join('、')}`:'六爻安靜'}</span>`;
  $('#contextCards').innerHTML=[`月建 ${c.context.monthBranch}`,`日辰 ${c.context.dayGanzhi}`,`旬空 ${c.context.voidBranches.join('')}`,`世 ${c.original.shiLine}／應 ${c.original.yingLine}`].map(chip).join('');
  $('#lineTable tbody').innerHTML=[...c.lines].reverse().map(l=>{
    const role=[l.isShi?'世':'',l.isYing?'應':''].filter(Boolean).join(' ');
    const state=[l.strength.band,...l.strength.tags].map(x=>`<span class="state ${strengthClass(x)}">${x}</span>`).join('');
    const change=l.moving?`${l.changed.relative}${l.changed.branch}${l.changed.element}<br><small>${l.returnRelation}</small>`:'—';
    return `<tr class="${l.moving?'moving':''}"><td>${l.lineLabel}<br><b>${role}</b></td><td>${l.spirit}</td><td><b>${l.relative}</b><br>${l.stem}${l.branch}${l.element}</td><td class="yao">${l.glyph}${l.moving?'<i>→</i>'+l.changedGlyph:''}</td><td>${change}</td><td>${state}<small class="score">${l.strength.score>0?'+':''}${l.strength.score}</small></td></tr>`
  }).join('');
  const u=c.useGod.primary;
  $('#useGod').innerHTML=u?`<strong>${u.lineLabel}・${u.relative}${u.branch}${u.element}</strong><span>${u.strength.band} ${u.moving?'・動爻':''}</span><small>候選 ${c.useGod.candidates.length} 爻；以動靜、世位與工程旺衰分數排序。</small>`:`<strong>尚未指定</strong><span>此問事類型需要手動選擇用神六親。</span>`;
  $('#judgement').innerHTML=`<div class="tendency">${c.judgement.tendency}</div><div class="confidence">信心：${c.judgement.confidence} ${c.judgement.rawScore!==undefined?`・趨勢分 ${c.judgement.rawScore}`:''}</div><ol>${c.judgement.reasons.map(x=>`<li>${x}</li>`).join('')}</ol>`;
  $('#timing').innerHTML=c.timing.length?c.timing.map(t=>`<div class="timing-row"><b>${t.branch}</b><span>${t.reason}</span><small>${t.nextDates.map(d=>`${d.date} ${d.ganzhi}`).join('　')}</small></div>`).join(''):'<p>用神未明，暫不產生應期候選。</p>';
  $('#trace').textContent=JSON.stringify(c,null,2);
  renderHistory();
}
function makeInput(){return {question:$('#question').value.trim(),categoryId:$('#category').value,manualRelative:$('#manualRelative').value,date:$('#date').value,dayGanzhi:$('#dayManual').value.trim(),monthBranch:$('#monthManual').value,lines:readLines()}}
function cast(){try{const c=createChart(makeInput(),DATA);saveHistory(c);renderChart(c)}catch(e){alert(e.message)}}
function randomDemo(){renderLineInputs(Array.from({length:6},()=>[6,7,8,9][Math.floor(Math.random()*4)]));cast()}
function renderHistory(){const h=loadHistory();$('#historyList').innerHTML=h.length?h.slice(0,8).map((x,i)=>`<button class="history-item" data-i="${i}"><b>${x.original.displayName}${x.codes.movingLines.length?' → '+x.changed.displayName:''}</b><span>${x.context.date}・${x.question||'未命名問事'}</span></button>`).join(''):'<p class="muted">尚無紀錄</p>';$$('.history-item').forEach(b=>b.onclick=()=>renderChart(h[Number(b.dataset.i)]))}

async function init(){
  DATA=await loadAllData(); categoryOptions(); $('#date').value=today(); renderLineInputs(); syncCalendarHints(); renderHistory();
  $('#date').onchange=syncCalendarHints; $('#dayManual').oninput=e=>e.target.dataset.touched='1'; $('#monthManual').onchange=e=>e.target.dataset.touched='1';
  $('#cast').onclick=cast; $('#demo').onclick=randomDemo; $('#reset').onclick=()=>{renderLineInputs();$('#question').value='';$('#manualRelative').value='';$('#result').hidden=true;$('#empty').hidden=false};
  $('#export').onclick=()=>currentChart&&downloadJson(currentChart); $('#copy').onclick=async()=>{if(currentChart){await copySummary(currentChart);$('#copy').textContent='已複製';setTimeout(()=>$('#copy').textContent='複製摘要',1000)}};
  $('#clearHistory').onclick=()=>{clearHistory();renderHistory()};
}
init().catch(e=>{document.body.innerHTML=`<pre style="padding:24px">啟動失敗：${e.stack}</pre>`});
