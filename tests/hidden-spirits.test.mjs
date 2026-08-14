import fs from 'node:fs';
import {createChart} from '../src/engine/chart.js';
import {flyingHiddenRelation} from '../src/engine/hiddenSpirits.js';

const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const data={hexagrams:read('data/hexagrams.json'),najia:read('data/najia.json'),sixSpirits:read('data/six-spirits.json'),xunkong:read('data/xunkong.json'),branchRelations:read('data/branch-relations.json'),strengthWeights:read('rules/strength-weights.json'),questionCategories:read('rules/question-categories.json'),judgementRules:read('rules/judgement-rules.json'),enginePipeline:read('rules/engine-pipeline.json'),sourceCatalog:read('rules/source-catalog.json'),rulePack:read('rules/rule-pack.json')};
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const chart=createChart({question:'問財',categoryId:'wealth',date:'2026-08-11',time:'12:00',lines:[8,7,7,7,7,7]},data);
assert(chart.original.name==='姤','測試卦應為天風姤');
assert(!chart.lines.some(line=>line.relative==='妻財'),'明爻不應含妻財');
assert(chart.hiddenSourceHexagram==='乾','伏神應取乾宮本宮卦');
assert(chart.hiddenSpirits.length===1,'姤卦應裝一個伏神');
const hidden=chart.hiddenSpirits[0];
assert(hidden.line===2&&hidden.relative==='妻財'&&hidden.stem==='甲'&&hidden.branch==='寅'&&hidden.element==='木','伏神應為二爻妻財甲寅木');
assert(hidden.flying.relative==='子孫'&&hidden.flyingRelation.label==='飛神生伏神','飛伏關係應正確');
assert(chart.lines[1].hiddenSpirit===hidden,'伏神應附著於對應飛神爻位');
assert(chart.useGod.primary?.isHidden&&chart.useGod.primary.relative==='妻財','缺失的問財用神應採伏神');
assert(chart.judgement.reasons.some(reason=>reason.includes('用神為伏神')),'判斷理由應解釋伏神');
assert(flyingHiddenRelation('金','木').label==='飛神剋伏神','飛剋伏標籤錯誤');
assert(flyingHiddenRelation('木','水').label==='伏神生飛神','伏生飛標籤錯誤');
console.log('OK hidden-spirits.test.mjs');
