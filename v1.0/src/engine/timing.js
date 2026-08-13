import { BRANCHES } from './constants.js';
import { nextBranchDates } from './calendar.js';
import { branchRelation } from './relations.js';
const clashPartner={子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
const combinePartner={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
export function buildTiming(chart,relationsData){
  const use=chart.useGod.primary; if(!use) return [];
  const triggers=[]; const push=(branch,reason,priority=1)=>{if(branch&&!triggers.some(x=>x.branch===branch&&x.reason===reason))triggers.push({branch,reason,priority})};
  push(use.branch,'用神值日／值支',3);
  if(use.strength.tags.includes('空亡')) push(use.branch,'用神填空／值支',4);
  if(use.strength.tags.includes('月破')) push(use.branch,'月破後填實候選',3);
  if(use.strength.tags.includes('日合')||use.strength.tags.includes('月合')) push(clashPartner[use.branch],'合待沖開候選',2);
  if(use.strength.tags.includes('日沖')) push(combinePartner[use.branch],'沖待合住候選',2);
  if(use.moving) push(combinePartner[use.branch],'動爻逢合候選',2);
  return triggers.sort((a,b)=>b.priority-a.priority).map(t=>({...t,nextDates:nextBranchDates(chart.context.date,t.branch,3)}));
}
