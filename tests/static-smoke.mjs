import {spawn} from 'node:child_process';
const port=18080+Math.floor(Math.random()*1000);
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,LIUYAO_PORT:String(port)},stdio:'ignore'});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
  let response;
  for(let i=0;i<30;i++){try{response=await fetch(`http://127.0.0.1:${port}/`);break}catch{await wait(50)}}
  if(!response?.ok)throw Error('首頁無法載入');
  const html=await response.text();
  if(!html.includes('六爻玄機引擎')||!html.includes('事後回測')||!html.includes('v1.2'))throw Error('首頁 v1.2 內容不正確');
  for(const path of ['/v1.2.css','/rules/source-catalog.json','/rules/rule-pack.json']){const asset=await fetch(`http://127.0.0.1:${port}${path}`);if(!asset.ok)throw Error(`${path} 無法載入`)}
  const archive=await fetch(`http://127.0.0.1:${port}/v1.0/`);if(!archive.ok)throw Error('v1.0 備份路徑無法載入');
  const missing=await fetch(`http://127.0.0.1:${port}/not-found`);if(missing.status!==404)throw Error('不存在路徑應回傳 404');
  console.log('OK static-smoke.mjs');
}finally{child.kill()}
