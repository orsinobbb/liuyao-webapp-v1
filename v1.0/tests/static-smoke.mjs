import { spawn } from 'node:child_process';

const port=18080+Math.floor(Math.random()*1000);
const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,LIUYAO_PORT:String(port)},stdio:'ignore'});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
  let response;
  for(let i=0;i<30;i++){
    try{response=await fetch(`http://127.0.0.1:${port}/`);break}catch{await wait(50)}
  }
  if(!response?.ok)throw Error('靜態伺服器未成功啟動');
  const html=await response.text();
  if(!html.includes('六爻玄機引擎'))throw Error('首頁內容錯誤');
  const missing=await fetch(`http://127.0.0.1:${port}/not-found`);
  if(missing.status!==404)throw Error('不存在路徑應回傳 404');
  console.log('OK static-smoke.mjs');
}finally{
  child.kill();
}
