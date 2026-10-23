'use strict';
// Explicit local launch: never inherit the online backend's HTTPS-only mode.
const net=require('node:net');
const remoteKeys=new Set(['MINIOPOLY_PUBLIC_URL','MINIOPOLY_ACCESS_HASH','MINIOPOLY_HOST_TOKEN']);

function localEnvironment(source){
  const env=Object.fromEntries(Object.entries(source).filter(([key])=>!remoteKeys.has(key.toUpperCase())));
  const port=Number(source.PORT||3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('Set PORT to a number from 1 to 65535, or leave it unset to use 3000.');
  env.HOST='0.0.0.0';env.PORT=String(port);
  return env;
}

function checkPort(port){
  return new Promise((resolve,reject)=>{
    const probe=net.createServer();
    probe.once('error',error=>{
      if(error.code==='EADDRINUSE')reject(Error('Port '+port+' is already in use.\nIn Host Game Setup, click Stop hosting, or press Ctrl+C in the old game terminal.\nThen run start-windows.bat again. Do not open localhost until the local server starts.'));
      else reject(Error('Could not open local game port '+port+': '+error.message));
    });
    probe.listen(port,'0.0.0.0',()=>probe.close(resolve));
  });
}

async function main(){
  if(Number(process.versions.node.split('.')[0])<18)throw Error('Install Node.js LTS (version 18 or newer), then run start-windows.bat again.');
  const env=localEnvironment(process.env);
  await checkPort(Number(env.PORT));
  for(const key of Object.keys(process.env))if(remoteKeys.has(key.toUpperCase()))delete process.env[key];
  process.env.HOST=env.HOST;process.env.PORT=env.PORT;
  // Same process/terminal as the original launcher, so Ctrl+C stops the game.
  // Saved hosting settings, passwords, certificates and room files are untouched.
  require('../server');
}

if(require.main===module)main().catch(error=>{console.error('\nLocal game did not start.\n'+error.message+'\n');process.exitCode=1;});
module.exports={localEnvironment,checkPort};
