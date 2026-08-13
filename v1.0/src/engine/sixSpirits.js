export function buildSixSpirits(dayStem,data){
  const order=data.order;
  const start=data.startByDayStem[dayStem];
  const idx=order.indexOf(start);
  if(idx<0) throw new Error(`六神無日干 ${dayStem}`);
  return Array.from({length:6},(_,i)=>order[(idx+i)%6]);
}
