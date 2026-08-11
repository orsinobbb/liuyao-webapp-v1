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

// 六爻月建以十二個「節」為界。以下用太陽視黃經求交點，避免固定日期造成的節氣交界誤判。
const JIE = [
  {month:1,target:285,branch:'丑',name:'小寒'},{month:2,target:315,branch:'寅',name:'立春'},
  {month:3,target:345,branch:'卯',name:'驚蟄'},{month:4,target:15,branch:'辰',name:'清明'},
  {month:5,target:45,branch:'巳',name:'立夏'},{month:6,target:75,branch:'午',name:'芒種'},
  {month:7,target:105,branch:'未',name:'小暑'},{month:8,target:135,branch:'申',name:'立秋'},
  {month:9,target:165,branch:'酉',name:'白露'},{month:10,target:195,branch:'戌',name:'寒露'},
  {month:11,target:225,branch:'亥',name:'立冬'},{month:12,target:255,branch:'子',name:'大雪'}
];
const rad=degrees=>degrees*Math.PI/180;
const normalize=degrees=>(degrees%360+360)%360;
function signedAngle(degrees){return (degrees+540)%360-180}

// Meeus/NOAA 常用低階太陽位置式；1901–2099 年節氣交點可達分鐘級。
export function apparentSolarLongitude(utcMs){
  const jd=utcMs/86400000+2440587.5;
  const t=(jd-2451545)/36525;
  const l0=normalize(280.46646+36000.76983*t+0.0003032*t*t);
  const m=normalize(357.52911+35999.05029*t-0.0001537*t*t);
  const c=Math.sin(rad(m))*(1.914602-0.004817*t-0.000014*t*t)
    +Math.sin(rad(2*m))*(0.019993-0.000101*t)+Math.sin(rad(3*m))*0.000289;
  const omega=125.04-1934.136*t;
  return normalize(l0+c-0.00569-0.00478*Math.sin(rad(omega)));
}

export function solarTermBoundary(year,month,timezoneOffsetMinutes=480){
  if(!Number.isInteger(year)||year<1900||year>2099) throw new Error('精確節氣支援 1901–2099 年');
  const term=JIE[month-1];
  if(!term) throw new Error('月份需為 1–12');
  let left=Date.UTC(year,month-1,1), right=Date.UTC(year,month-1,12);
  let leftDiff=signedAngle(apparentSolarLongitude(left)-term.target);
  let rightDiff=signedAngle(apparentSolarLongitude(right)-term.target);
  if(!(leftDiff<=0&&rightDiff>=0)) throw new Error(`找不到 ${year} 年${term.name}交點`);
  while(right-left>1000){
    const middle=Math.floor((left+right)/2);
    const diff=signedAngle(apparentSolarLongitude(middle)-term.target);
    if(diff<0) left=middle; else right=middle;
  }
  const utcMs=right;
  const local=new Date(utcMs+timezoneOffsetMinutes*60000);
  const localDateTime=`${local.getUTCFullYear()}-${String(local.getUTCMonth()+1).padStart(2,'0')}-${String(local.getUTCDate()).padStart(2,'0')} ${String(local.getUTCHours()).padStart(2,'0')}:${String(local.getUTCMinutes()).padStart(2,'0')}`;
  return {...term,year,utcMs,localDateTime,timezoneOffsetMinutes};
}

export function monthBranchFromDateTime(dateString,timeString='12:00',timezoneOffsetMinutes=480){
  const [year,month,day]=dateString.split('-').map(Number);
  const [hour,minute]=timeString.split(':').map(Number);
  const instant=Date.UTC(year,month-1,day,hour,minute)-timezoneOffsetMinutes*60000;
  const current=solarTermBoundary(year,month,timezoneOffsetMinutes);
  let active=current;
  if(instant<current.utcMs){
    const previousMonth=month===1?12:month-1;
    active=solarTermBoundary(month===1?year-1:year,previousMonth,timezoneOffsetMinutes);
  }
  return {branch:active.branch,boundary:`${active.name} ${active.localDateTime}`,boundaryName:active.name,boundaryUtc:new Date(active.utcMs).toISOString(),timezoneOffsetMinutes,approximate:false};
}

// 保留舊 API；現在預設以當日中午與台北時區計算。
export function approximateMonthBranch(dateString){return monthBranchFromDateTime(dateString)}

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
