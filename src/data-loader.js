const cache={};
async function getJson(path){
  if(cache[path]) return cache[path];
  const r=await fetch(path); if(!r.ok) throw new Error(`載入失敗 ${path}`);
  cache[path]=await r.json(); return cache[path];
}
export async function loadAllData(){
  const [hexagrams,najia,sixSpirits,xunkong,branchRelations,strengthWeights,questionCategories,judgementRules,enginePipeline]=await Promise.all([
    getJson('./data/hexagrams.json'),getJson('./data/najia.json'),getJson('./data/six-spirits.json'),getJson('./data/xunkong.json'),
    getJson('./data/branch-relations.json'),getJson('./rules/strength-weights.json'),getJson('./rules/question-categories.json'),getJson('./rules/judgement-rules.json'),getJson('./rules/engine-pipeline.json')
  ]);
  return {hexagrams,najia,sixSpirits,xunkong,branchRelations,strengthWeights,questionCategories,judgementRules,enginePipeline};
}
