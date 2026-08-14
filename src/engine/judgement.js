import { elementRelation, roleToUseGod } from './elements.js';
import { branchRelation } from './relations.js';

const relText=(a,b)=>({same:'比和',generates:'生',controls:'剋',generatedBy:'受生',controlledBy:'受剋',none:'無直接生剋'})[elementRelation(a,b)];

const DEFAULT_WEIGHTS={strong:2,weak:-2,void:-1,monthBreak:-1.5,moving:0.5,useGeneratesShi:1.5,useControlsShi:-1.5,shiGeneratesUse:-0.5,shiControlsUse:0.3,same:0.5,movingSource:1,movingAvoid:-1,returnGenerate:0.6,returnControl:-0.8};
const DEFAULT_THRESHOLDS=[{gte:3,label:'偏吉／較易成'},{gte:1,label:'偏有利'},{gt:-1,label:'拉鋸／待條件'},{gt:-3,label:'偏不利'},{default:true,label:'阻力較大'}];
const tendencyLabel=(score,thresholds)=>thresholds.find(x=>x.default||(x.gte!==undefined&&score>=x.gte)||(x.gt!==undefined&&score>x.gt))?.label||'未判';

export function judge(chart, relationsData, rulesData={}){
  const weights={...DEFAULT_WEIGHTS,...rulesData.weights};
  const thresholds=rulesData.thresholds||DEFAULT_THRESHOLDS;
  const use=chart.useGod.primary; const shi=chart.lines.find(x=>x.isShi); const ying=chart.lines.find(x=>x.isYing);
  const reasons=[]; const warnings=[]; let tendency=0;
  if(!use){
    return {status:'需指定用神',tendency:'未判',confidence:'low',reasons:['目前問事類型無唯一預設用神，請手動指定六親。'],warnings,roles:[],ruleVersion:rulesData.version||'unversioned'};
  }
  if(use.strength.band==='旺'||use.strength.band==='偏旺'){tendency+=weights.strong;reasons.push(`用神 ${use.relative}${use.branch}${use.element} ${use.strength.band}，本身有力。`)}
  if(use.strength.band==='弱'||use.strength.band==='偏弱'){tendency+=weights.weak;reasons.push(`用神 ${use.relative}${use.branch}${use.element} ${use.strength.band}，承事力量不足。`)}
  if(use.strength.tags.includes('空亡')){tendency+=weights.void;reasons.push('用神逢旬空：偏向尚未落實、暫虛或需待出空；不是單獨判凶。')}
  if(use.strength.tags.includes('月破')){tendency+=weights.monthBreak;reasons.push('用神月破：當月環境對它不利，需看是否得日、動變或後續填實。')}
  if(use.moving){tendency+=weights.moving;reasons.push('用神發動：事情核心正在變化，需重看變爻。')}
  if(use.isHidden){
    reasons.push(`用神為伏神，藏於${use.lineLabel}${use.flying.relative}${use.flying.branch}${use.flying.element}之下；${use.flyingRelation.label}。伏藏表示未直接顯現，仍須合看日月旺衰與飛神制化。`);
  }

  if(shi){
    const r=elementRelation(use.element,shi.element);
    if(r==='generates'){tendency+=weights.useGeneratesShi;reasons.push(`用神生世：事情/資源對世爻有助。`)}
    else if(r==='controls'){tendency+=weights.useControlsShi;reasons.push('用神剋世：事情對本人形成壓力或負擔。')}
    else if(r==='generatedBy'){tendency+=weights.shiGeneratesUse;reasons.push('世生用神：本人需要投入、供給或付出。')}
    else if(r==='controlledBy'){tendency+=weights.shiControlsUse;reasons.push('世剋用神：本人有主動控制/追求之象，但仍看世爻是否有力。')}
    else if(r==='same'){tendency+=weights.same;reasons.push('世與用神比和：立場/氣勢較一致。')}
    const sy=branchRelation(shi.branch,ying?.branch||'',relationsData);
    if(sy.includes('合')) reasons.push('世應相合：雙方或內外條件有連結、靠攏之象。');
    if(sy.includes('沖')) reasons.push('世應相沖：雙方或內外條件存在變動、對立或分離因素。');
  }

  const roles=chart.lines.map(l=>({...l,useRole:roleToUseGod(use.element,l.element)}));
  for(const l of roles.filter(x=>x.moving)){
    if(l.useRole==='原神' && l.strength.score>=0){tendency+=weights.movingSource;reasons.push(`${l.lineLabel}${l.relative}${l.branch}為原神且發動，對用神有生扶來源。`)}
    if(l.useRole==='忌神' && l.strength.score>=0){tendency+=weights.movingAvoid;reasons.push(`${l.lineLabel}${l.relative}${l.branch}為忌神且發動，形成主要阻力。`)}
    if(l.returnRelation==='回頭生'){tendency+=weights.returnGenerate;reasons.push(`${l.lineLabel}動化回頭生，該爻後續獲得反向增援。`)}
    if(l.returnRelation==='回頭剋'){tendency+=weights.returnControl;reasons.push(`${l.lineLabel}動化回頭剋，該爻發動後反受變爻制約。`)}
  }

  const resultLabel=tendencyLabel(tendency,thresholds);
  const confidence=use.isHidden?'medium':chart.useGod.candidates.length===1?'high':chart.useGod.candidates.length>1?'medium':'low';
  warnings.push('此結果是可解釋規則引擎的傳統術數模擬，不是科學預測；工程分數只用於排序。');
  return {status:'已判',tendency:resultLabel,rawScore:Number(tendency.toFixed(1)),confidence,reasons,warnings,roles,shiSummary:shi?`${shi.relative}${shi.branch}${shi.element} ${shi.strength.band}`:'',yingSummary:ying?`${ying.relative}${ying.branch}${ying.element} ${ying.strength.band}`:'',ruleVersion:rulesData.version||'unversioned'};
}
