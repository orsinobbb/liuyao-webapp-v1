import { VALUE_META } from './constants.js';
export function lineValuesToCodes(values){
  if(!Array.isArray(values)||values.length!==6) throw new Error('必須有 6 爻');
  const original=values.map(v=>VALUE_META[v]?.yang?'1':'0').join('');
  const changed=values.map(v=>{
    const m=VALUE_META[v]; if(!m) throw new Error(`非法爻值 ${v}`);
    const yang=m.moving?!m.yang:m.yang; return yang?'1':'0';
  }).join('');
  const movingLines=values.map((v,i)=>VALUE_META[v].moving?i+1:null).filter(Boolean);
  return {originalCode:original,changedCode:changed,movingLines};
}
export function findHexagram(code, data){
  const h=data.hexagrams.find(x=>x.code===code);
  if(!h) throw new Error(`64卦資料找不到 code=${code}`);
  return h;
}
