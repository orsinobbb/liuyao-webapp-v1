import { STEMS, BRANCHES, SIXTY } from './constants.js';

export function gregorianJdn(year, month, day){
  const a=Math.floor((14-month)/12);
  const y=year+4800-a;
  const m=month+12*a-3;
  return day + Math.floor((153*m+2)/5) + 365*y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;
}

// 2026-08-11 = 丁巳；以連續 JDN 循環回推。日界預設民用午夜。
export function ganzhiDayFromGregorian(dateString){
  const [y,m,d]=dateString.split('-').map(Number);
  if(!y||!m||!d) throw new Error('日期格式需為 YYYY-MM-DD');
  const index=(gregorianJdn(y,m,d)+49)%60;
  return { ganzhi:SIXTY[index], stem:STEMS[index%10], branch:BRANCHES[index%12], index };
}

export function xunVoidFromGanzhi(dayGanzhi, xunkongData){
  const idx=SIXTY.indexOf(dayGanzhi);
  if(idx<0) throw new Error(`未知日柱：${dayGanzhi}`);
  const xunStartIndex=Math.floor(idx/10)*10;
  const start=SIXTY[xunStartIndex];
  const row=xunkongData.xun.find(x=>x.start===start);
  if(!row) throw new Error(`找不到旬空：${start}`);
  return {xunStart:start, voidBranches:row.void};
}

// 六爻月建以節氣「節」為界。此函式只做離線快速輔助，界線附近請手動覆寫。
const APPROX_JIE = [
  {m:1,d:6,b:'丑',name:'小寒'},{m:2,d:4,b:'寅',name:'立春'},{m:3,d:6,b:'卯',name:'驚蟄'},
  {m:4,d:5,b:'辰',name:'清明'},{m:5,d:6,b:'巳',name:'立夏'},{m:6,d:6,b:'午',name:'芒種'},
  {m:7,d:7,b:'未',name:'小暑'},{m:8,d:8,b:'申',name:'立秋'},{m:9,d:8,b:'酉',name:'白露'},
  {m:10,d:8,b:'戌',name:'寒露'},{m:11,d:7,b:'亥',name:'立冬'},{m:12,d:7,b:'子',name:'大雪'}
];
export function approximateMonthBranch(dateString){
  const [,m,d]=dateString.split('-').map(Number);
  const current=APPROX_JIE.find(x=>x.m===m);
  if(!current) return {branch:'', boundary:'', approximate:true};
  if(d>=current.d) return {branch:current.b,boundary:current.name,approximate:true};
  const prev=m===1?APPROX_JIE[11]:APPROX_JIE[m-2];
  return {branch:prev.b,boundary:`${current.name}前`,approximate:true};
}

export function nextBranchDates(startDateString, branch, count=3){
  const target=BRANCHES.indexOf(branch);
  if(target<0) return [];
  const base=new Date(`${startDateString}T12:00:00`);
  const out=[];
  for(let offset=0;offset<80 && out.length<count;offset++){
    const dt=new Date(base); dt.setDate(base.getDate()+offset);
    const s=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    const g=ganzhiDayFromGregorian(s);
    if(BRANCHES.indexOf(g.branch)===target) out.push({date:s,ganzhi:g.ganzhi,branch:g.branch});
  }
  return out;
}
