'use strict';
const net=require('node:net');
function publicIPv4(value){
  const ip=String(value||'').trim();if(net.isIP(ip)!==4)throw Error('Enter your router’s public IPv4 address, without http:// or a port.');
  const [a,b,c]=ip.split('.').map(Number);
  if(a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&(b===168||b===0))||(a===198&&(b===18||b===19||(b===51&&c===100)))||(a===203&&b===0&&c===113))throw Error('That address is private or reserved. Use the Internet IPv4 address that matched your router.');
  return ip;
}
function caddyConfig({ip,storage,gamePort=3000,httpsPort=443,httpPort=80}){
  publicIPv4(ip);
  return {
    admin:{disabled:true},storage:{module:'file_system',root:storage},logging:{logs:{default:{level:'WARN'}}},
    apps:{
      http:{http_port:httpPort,https_port:httpsPort,servers:{miniopoly:{listen:[':'+httpsPort],protocols:['h1','h2'],tls_connection_policies:[{default_sni:ip}],routes:[
        {match:[{host:[ip]}],handle:[{handler:'subroute',routes:[
          {match:[{path:['/__host/*']}],handle:[{handler:'static_response',status_code:404}]},
          {handle:[{handler:'headers',response:{set:{'X-Content-Type-Options':['nosniff'],'Referrer-Policy':['same-origin'],'X-Frame-Options':['SAMEORIGIN']}}},{handler:'encode',encodings:{gzip:{},zstd:{}},match:{headers:{'Content-Type':['text/html*','text/css*','application/javascript*','application/json*','image/svg+xml*']}}},{handler:'reverse_proxy',upstreams:[{dial:'127.0.0.1:'+gamePort}],flush_interval:-1}]}]
        }],terminal:true}
      ]}}},
      tls:{automation:{policies:[{subjects:[ip],issuers:[{module:'acme',ca:'https://acme-v02.api.letsencrypt.org/directory',profile:'shortlived'}]}]}}
    }
  };
}
function redact(text){return String(text).replace(/("(?:Cookie|Set-Cookie|Authorization|Proxy-Authorization)"\s*:\s*)(\[[^\]]*\]|"[^"]*")/gi,'$1"[redacted]"').replace(/([?&](?:token|ticket|password)=)[^&\s"\\]+/gi,'$1[redacted]').slice(-16000);}
function firewallScript(exe){const quoted="'"+String(exe).replaceAll("'","''")+"'";return "$ErrorActionPreference='Stop'; Remove-NetFirewallRule -DisplayName 'Miniopoly Online HTTPS' -ErrorAction SilentlyContinue; New-NetFirewallRule -DisplayName 'Miniopoly Online HTTPS' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80,443 -Profile Private -Program "+quoted+" | Out-Null";}
function localFirewallScript(exe,port=3000){const quoted="'"+String(exe).replaceAll("'","''")+"'";if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid game port.');return "$ErrorActionPreference='Stop'; Remove-NetFirewallRule -DisplayName 'Miniopoly Local Multiplayer' -ErrorAction SilentlyContinue; New-NetFirewallRule -DisplayName 'Miniopoly Local Multiplayer' -Direction Inbound -Action Allow -Protocol TCP -LocalPort "+port+" -Profile Private -Program "+quoted+" | Out-Null";}
module.exports={publicIPv4,caddyConfig,redact,firewallScript,localFirewallScript};
