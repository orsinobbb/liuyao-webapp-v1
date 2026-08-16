import fs from 'node:fs';
import {resolveUseGod} from '../src/engine/useGod.js';

const rules=JSON.parse(fs.readFileSync(new URL('../rules/question-categories.json',import.meta.url),'utf8'));
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const selectors=new Set(['父母','官鬼','妻財','兄弟','子孫','世爻','應爻']);
const ids=rules.categories.map(item=>item.id);
assert(rules.version==='1.0.0','問事取用表版本錯誤');
assert(rules.categories.length>=25,'問事情境覆蓋不足');
assert(new Set(ids).size===ids.length,'問事分類 ID 不可重複');
assert(rules.categories.every(item=>item.label&&item.questions?.length),'每個情境都要有標題與必要追問');
assert(rules.categories.every(item=>!item.primary||selectors.has(item.primary.selector)),'主用神含未知角色');
assert(rules.categories.every(item=>(item.observe||[]).every(rule=>selectors.has(rule.selector)&&rule.meaning)),'輔助觀察規則不完整');
for(const relative of ['父母','官鬼','妻財','兄弟','子孫'])assert(rules.categories.some(item=>item.primary?.selector===relative),`缺少 ${relative} 主用神情境`);

const strength={score:0,band:'平',tags:[]};
const lines=[
  {line:1,lineLabel:'初爻',relative:'父母',branch:'子',element:'水',strength,moving:false,isShi:false,isYing:false,isHidden:false},
  {line:2,lineLabel:'二爻',relative:'官鬼',branch:'丑',element:'土',strength,moving:true,isShi:false,isYing:true,isHidden:false},
  {line:3,lineLabel:'三爻',relative:'兄弟',branch:'寅',element:'木',strength,moving:false,isShi:true,isYing:false,isHidden:false}
];
const exam=resolveUseGod(lines,{categoryId:'exam',manualRelative:'',questionCategories:rules});
assert(exam.requestedSelector==='父母'&&exam.primary?.line===1,'考試應主取父母，不可與官鬼混排');
assert(exam.observations.some(item=>item.selector==='官鬼'),'考試應保留官鬼為輔助觀察');
const health=resolveUseGod(lines,{categoryId:'health_self',manualRelative:'',questionCategories:rules});
assert(health.requestedSelector==='世爻'&&health.primary?.line===3,'自己疾病應以世爻為主體');
const manual=resolveUseGod(lines,{categoryId:'exam',manualRelative:'官鬼',questionCategories:rules});
assert(manual.requestedSelector==='官鬼'&&manual.primary?.line===2,'手動用神必須覆寫分類預設');
const lost=resolveUseGod(lines,{categoryId:'lost_item',manualRelative:'',questionCategories:rules});
assert(lost.needsManual&&!lost.primary&&lost.questions.length,'失物未分類前應要求追問與手動指定');
console.log('OK use-god-rules.test.mjs');
