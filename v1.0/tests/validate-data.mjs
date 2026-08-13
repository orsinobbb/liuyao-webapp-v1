import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const hex = read('data/hexagrams.json').hexagrams;
const palaces = read('data/eight-palaces.json').palaces;
const najia = read('data/najia.json').trigrams;
const spirits = read('data/six-spirits.json');

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

assert(hex.length === 64, `hexagrams count=${hex.length}, expected 64`);
assert(new Set(hex.map(x => x.code)).size === 64, '64卦 code 必須唯一');
assert(new Set(hex.map(x => x.kingWen)).size === 64, '文王卦序必須 1..64 唯一');
assert(palaces.length === 8, '八宮數量必須為 8');
assert(palaces.every(p => p.hexagrams.length === 8), '每宮必須 8 卦');
assert(Object.keys(najia).length === 8, '納甲必須有 8 卦');
assert(Object.values(najia).every(x => x.inner.length === 3 && x.outer.length === 3), '每卦納甲內外各 3 爻');
assert(Object.keys(spirits.startByDayStem).length === 10, '六神起法必須覆蓋十天干');

const qian = hex.find(x => x.kingWen === 1);
const gou = hex.find(x => x.name === '姤');
const dun = hex.find(x => x.name === '遯');
const jin = hex.find(x => x.name === '晉');
const dayou = hex.find(x => x.name === '大有');

assert(qian.palace === '乾' && qian.palaceStage === '本宮' && qian.shiLine === 6, '乾卦八宮資料錯誤');
assert(gou.palace === '乾' && gou.palaceStage === '一世' && gou.shiLine === 1, '姤卦應為乾宮一世');
assert(dun.palace === '乾' && dun.palaceStage === '二世' && dun.shiLine === 2, '遯卦應為乾宮二世');
assert(jin.palace === '乾' && jin.palaceStage === '遊魂' && jin.shiLine === 4, '晉卦應為乾宮遊魂');
assert(dayou.palace === '乾' && dayou.palaceStage === '歸魂' && dayou.shiLine === 3, '大有應為乾宮歸魂');

console.log('OK: 64卦、八宮世應、納甲結構、六神起法基礎驗證全部通過。');
