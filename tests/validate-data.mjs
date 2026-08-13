import fs from 'node:fs';
const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const hexagrams=read('data/hexagrams.json').hexagrams;
const palaces=read('data/eight-palaces.json').palaces;
const najia=read('data/najia.json').trigrams;
const spirits=read('data/six-spirits.json');
const sourceCatalog=read('rules/source-catalog.json');
const rulePack=read('rules/rule-pack.json');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
assert(hexagrams.length===64,'卦數應為 64');
assert(new Set(hexagrams.map(item=>item.code)).size===64,'64 卦 code 不可重複');
assert(new Set(hexagrams.map(item=>item.kingWen)).size===64,'文王卦序不可重複');
assert(palaces.length===8&&palaces.every(palace=>palace.hexagrams.length===8),'八宮資料不完整');
assert(Object.keys(najia).length===8,'納甲應涵蓋八卦');
assert(Object.values(najia).every(item=>item.inner.length===3&&item.outer.length===3),'納甲內外卦各需三爻');
assert(Object.keys(spirits.startByDayStem).length===10,'日干起六神應涵蓋十天干');
const sourceIds=sourceCatalog.sources.map(source=>source.id);
assert(new Set(sourceIds).size===sourceIds.length,'來源 ID 不可重複');
assert(sourceCatalog.sources.every(source=>source.url||source.path),'來源必須提供 URL 或專案路徑');
assert(rulePack.sourceIds.every(id=>sourceIds.includes(id)),'規則包引用不存在的來源 ID');
for(const [kingWen,name,palace,stage,shiLine] of [[1,'乾','乾','本宮',6],[44,'姤','乾','一世',1],[33,'遯','乾','二世',2],[35,'晉','乾','遊魂',4],[14,'大有','乾','歸魂',3]]){
  const item=hexagrams.find(entry=>entry.kingWen===kingWen);
  assert(item?.name===name&&item.palace===palace&&item.palaceStage===stage&&item.shiLine===shiLine,`${name} 宮位資料錯誤`);
}
console.log('OK validate-data.mjs');
