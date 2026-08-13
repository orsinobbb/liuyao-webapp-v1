import fs from 'node:fs';
import {createChart} from '../src/engine/chart.js';

const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const data={hexagrams:read('data/hexagrams.json'),najia:read('data/najia.json'),sixSpirits:read('data/six-spirits.json'),xunkong:read('data/xunkong.json'),branchRelations:read('data/branch-relations.json'),strengthWeights:read('rules/strength-weights.json'),questionCategories:read('rules/question-categories.json'),judgementRules:read('rules/judgement-rules.json'),enginePipeline:read('rules/engine-pipeline.json'),sourceCatalog:read('rules/source-catalog.json'),rulePack:read('rules/rule-pack.json')};
const chart=createChart({question:'測試乾卦',categoryId:'wealth',manualRelative:'',date:'2026-08-11',dayGanzhi:'丁巳',monthBranch:'申',lines:[7,7,7,7,7,7]},data);
if(chart.original.name!=='乾')throw Error('本卦不是乾');
if(chart.original.palace!=='乾'||chart.original.shiLine!==6||chart.original.yingLine!==3)throw Error('乾卦世應錯誤');
if(chart.lines[0].branch!=='子'||chart.lines[0].relative!=='子孫')throw Error('乾卦初爻納甲或六親錯誤');
if(chart.context.voidBranches.join('')!=='子丑')throw Error('旬空錯誤');
if(chart.useGod.ruleVersion!==data.questionCategories.version||chart.judgement.ruleVersion!==data.judgementRules.version)throw Error('規則版本未記錄');
if(chart.rules.pipelineVersion!==data.enginePipeline.version||chart.rules.rulePackVersion!==data.rulePack.version)throw Error('流程或規則包版本未記錄');
if(!chart.sourceRefs.includes('zengshan-buyi-3'))throw Error('公開來源索引未寫入排盤');
for(const input of [{date:'2026-02-30',lines:[7,7,7,7,7,7]},{date:'2026-08-11',dayGanzhi:'甲甲',lines:[7,7,7,7,7,7]},{date:'2026-08-11',lines:[7,7,7]}]){
  let rejected=false;try{createChart(input,data)}catch{rejected=true}
  if(!rejected)throw Error('無效輸入未被拒絕');
}
console.log('OK integration.test.mjs');
