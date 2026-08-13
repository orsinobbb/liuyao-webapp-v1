import { ELEMENT_OF_BRANCH } from './constants.js';
export function buildNajiaLines(hexagram,najiaData){
  const lower=najiaData.trigrams[hexagram.lower].inner;
  const upper=najiaData.trigrams[hexagram.upper].outer;
  return [...lower,...upper].map((x,i)=>({...x,line:i+1,element:ELEMENT_OF_BRANCH[x.branch]}));
}
