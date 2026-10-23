'use strict';
// Temporary inbound-connectivity check. Serves fixed text, never game files.
const http=require('node:http');
const os=require('node:os');
const PORT=53179;
const MAX_DURATION=10*60*1000;
const MESSAGE='MINIOPOLY CONNECTION TEST SUCCESSFUL\n\nThis request reached your host computer.\nThe game and its saved files are not served by this test.\n';

function startConnectionTest({port=PORT,host='0.0.0.0',durationMs=MAX_DURATION}={}){
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid test port.');
  if(!Number.isInteger(durationMs)||durationMs<1||durationMs>MAX_DURATION)throw Error('The connection test must stop within ten minutes.');
  const server=http.createServer((req,res)=>{
    const path=(req.url||'').split('?')[0];
    const allowed=req.method==='GET'||req.method==='HEAD';
    const status=!allowed?405:path==='/'?200:404;
    const body=status===200?MESSAGE:status===405?'GET or HEAD only.\n':'Not found.\n';
    const headers={'Content-Type':'text/plain; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Connection':'close'};
    if(!allowed)headers.Allow='GET, HEAD';
    res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:body);
  });
  server.maxConnections=12;server.headersTimeout=5000;server.requestTimeout=5000;server.keepAliveTimeout=1000;server.maxRequestsPerSocket=1;
  const sockets=new Set();
  server.on('connection',socket=>{sockets.add(socket);socket.once('close',()=>sockets.delete(socket));});
  let timer;
  const stop=()=>{clearTimeout(timer);server.close();for(const socket of sockets)socket.destroy();};
  server.once('listening',()=>{timer=setTimeout(stop,durationMs);});
  server.once('close',()=>clearTimeout(timer));
  server.stopConnectionTest=stop;
  server.listen(port,host);
  return server;
}

if(require.main===module){
  console.log('\nMiniopoly - temporary internet connection test');
  console.log('TCP port: '+PORT+' | Stops automatically after 10 minutes.');
  const server=startConnectionTest();
  const stop=()=>server.stopConnectionTest();
  process.once('SIGINT',stop);process.once('SIGTERM',stop);
  server.once('listening',()=>{
    console.log('\nFirst, check the test over your home network:');
    for(const entries of Object.values(os.networkInterfaces()))for(const item of entries||[]){
      if(item.family==='IPv4'&&!item.internal)console.log('  http://'+item.address+':'+PORT);
    }
    console.log('\nForward TCP '+PORT+' on the router to this computer and the same port.');
    console.log('Then test your router\'s public IP from a phone with Wi-Fi OFF.');
    console.log('Keep this window open. Ctrl+C stops the test early.');
  });
  server.once('error',error=>{
    console.error(error.code==='EADDRINUSE'?'Port '+PORT+' is already in use. Stop the previous test and try again.':'The test could not start: '+error.message);
    process.exitCode=1;
  });
  server.once('close',()=>{
    console.log('\nTest stopped. Delete the Miniopoly-Test forwarding rule from your router.');
    process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);
  });
}
module.exports={startConnectionTest,PORT,MAX_DURATION,MESSAGE};
