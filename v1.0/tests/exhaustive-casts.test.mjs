import fs from 'node:fs';
import { createChart } from '../src/engine/chart.js';

const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const data={hexagrams:read('data/hexagrams.json'),najia:read('data/najia.json'),sixSpirits:read('data/six-spirits.json'),xunkong:read('data/xunkong.json'),branchRelations:read('data/branch-relations.json'),strengthWeights:read('rules/strength-weights.json'),questionCategories:read('rules/question-categories.json'),judgementRules:read('rules/judgement-rules.json'),enginePipeline:read('rules/engine-pipeline.json')};
const values=[6,7,8,9],originals=new Set(),changed=new Set();

for(let cast=0;cast<4096;cast++){
  let number=cast;
  const lines=Array.from({length:6},()=>{const value=values[number%4];number=Math.floor(number/4);return value});
  const chart=createChart({question:'4096 組窮舉',categoryId:'wealth',date:'2026-08-11',time:'12:00',lines},data);
  originals.add(chart.codes.originalCode);changed.add(chart.codes.changedCode);
  const expectedMoving=lines.filter(value=>value===6||value===9).length;
  if(chart.codes.movingLines.length!==expectedMoving) throw new Error(`第 ${cast} 組動爻數錯誤`);
  if(chart.lines.length!==6||!chart.original?.name||!chart.changed?.name) throw new Error(`第 ${cast} 組排盤不完整`);
}
if(originals.size!==64||changed.size!==64) throw new Error(`卦象覆蓋不足：本卦 ${originals.size}／變卦 ${changed.size}`);
console.log('OK exhaustive-casts.test.mjs (4096 casts, 64×64 coverage)');
