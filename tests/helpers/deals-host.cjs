'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
module.exports=async function(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mini-deals-'));let child,base;
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=new Promise(r=>child.once('exit',r));child.kill();await done;}}
 async function start(){const port=await new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>r(port));});});base='http://127.0.0.1:'+port;child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dir,NODE_ENV:'test',TEST_ROLL_SEQUENCE:'1'},stdio:'ignore'});for(let i=0;i<200;i++){try{if((await fetch(base+'/api/network')).ok)return;}catch{}await new Promise(r=>setTimeout(r,25));}throw Error('Host failed to start');}
 async function call(route,body){const res=await fetch(base+'/api/'+route,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:res.status,...await res.json()};}
 await start();const a=await call('create',{name:'Host',capacity:3,rounds:10}),seats=[a];for(const name of ['Guest','Observer'])seats.push(await call('join',{code:a.code,name}));assert.equal((await call('action',{code:a.code,token:a.token,kind:'start'})).status,200);
 return {seats,call,get base(){return base;},act:(seat,kind,extra={})=>call('action',{code:a.code,token:seats[seat].token,kind,...extra}),resume:(seat=0)=>call('resume',{code:a.code,token:seats[seat].token}),async edit(fn){await stop();const p=path.join(dir,'rooms.json'),data=JSON.parse(fs.readFileSync(p));fn(data.rooms.find(r=>r.code===a.code));fs.writeFileSync(p,JSON.stringify(data));await start();},async close(){await stop();fs.rmSync(dir,{recursive:true,force:true});}};
};
