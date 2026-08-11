import { BRANCHES, SIXTY, SIX_RELATIVES } from './constants.js';

const DATE_RE=/^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE=/^([01]\d|2[0-3]):([0-5]\d)$/;

function validDate(value){
  const match=DATE_RE.exec(value);
  if(!match) return false;
  const [,year,month,day]=match.map(Number);
  const date=new Date(Date.UTC(year,month-1,day));
  return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
}

export function validateChartInput(input,data){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new Error('排盤輸入格式錯誤');
  if(!Array.isArray(input.lines)||input.lines.length!==6||input.lines.some(value=>![6,7,8,9].includes(value))) {
    throw new Error('六爻必須由初爻到上爻填入六個 6／7／8／9');
  }
  if(typeof input.date!=='string'||!validDate(input.date)) throw new Error('日期格式需為有效的 YYYY-MM-DD');
  const time=input.time||'12:00';
  if(typeof time!=='string'||!TIME_RE.test(time)) throw new Error('時間格式需為 HH:mm');
  const question=typeof input.question==='string'?input.question.trim():'';
  if(question.length>500) throw new Error('所問之事最多 500 字');
  const categoryId=input.categoryId||'';
  const categoryIds=data?.questionCategories?.categories?.map(item=>item.id)||[];
  if(categoryId&&!categoryIds.includes(categoryId)) throw new Error(`未知問事分類：${categoryId}`);
  const manualRelative=input.manualRelative||'';
  if(manualRelative&&!SIX_RELATIVES.includes(manualRelative)) throw new Error(`未知用神六親：${manualRelative}`);
  const dayGanzhi=(input.dayGanzhi||'').trim();
  if(dayGanzhi&&!SIXTY.includes(dayGanzhi)) throw new Error(`日柱覆寫無效：${dayGanzhi}`);
  const monthBranch=input.monthBranch||'';
  if(monthBranch&&!BRANCHES.includes(monthBranch)) throw new Error(`月建覆寫無效：${monthBranch}`);
  return {question,categoryId,manualRelative,date:input.date,time,dayGanzhi,monthBranch,lines:[...input.lines]};
}
