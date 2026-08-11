import fs from 'node:fs';import {createChart} from '../src/engine/chart.js';
const r=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const data={hexagrams:r('data/hexagrams.json'),najia:r('data/najia.json'),sixSpirits:r('data/six-spirits.json'),xunkong:r('data/xunkong.json'),branchRelations:r('data/branch-relations.json'),strengthWeights:r('rules/strength-weights.json'),questionCategories:r('rules/question-categories.json'),judgementRules:r('rules/judgement-rules.json'),enginePipeline:r('rules/engine-pipeline.json')};
const c=createChart({question:'測試',categoryId:'wealth',manualRelative:'',date:'2026-08-11',dayGanzhi:'丁巳',monthBranch:'申',lines:[7,7,7,7,7,7]},data);
if(c.original.name!=='乾')throw Error('全陽本卦應乾');
if(c.original.palace!=='乾'||c.original.shiLine!==6||c.original.yingLine!==3)throw Error('乾世應錯誤');
if(c.lines[0].branch!=='子'||c.lines[0].relative!=='子孫')throw Error('乾初爻應子水子孫');
if(c.context.voidBranches.join('')!=='子丑')throw Error('旬空錯誤');
if(c.useGod.ruleVersion!==data.questionCategories.version||c.judgement.ruleVersion!==data.judgementRules.version)throw Error('規則版本未接入排盤');
if(c.rules.pipelineVersion!==data.enginePipeline.version)throw Error('引擎流程版本未寫入輸出');
for(const [input,message] of [
  [{date:'2026-02-30',lines:[7,7,7,7,7,7]},'無效日期'],
  [{date:'2026-08-11',dayGanzhi:'甲甲',lines:[7,7,7,7,7,7]},'無效日柱'],
  [{date:'2026-08-11',lines:[7,7,7]},'爻數不足']
]){
  let rejected=false;try{createChart(input,data)}catch{rejected=true}
  if(!rejected)throw Error(`${message}應被中央驗證拒絕`);
}
console.log('OK integration.test.mjs');
