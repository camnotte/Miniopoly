'use strict';
const zlib=require('node:zlib');
const avatars=require('../public/avatars');
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(buffer){let crc=0xffffffff;for(const byte of buffer)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}

// Only bounded, decoded PNG pixels are saved, never filenames, URLs or SVG markup.
function personalAvatar(value){
  if(value===undefined||value===null||value==='')return null;
  const invalid=()=>Object.assign(Error('Choose a valid avatar image using Upload photo (maximum 64 KB after resizing).'),{status:400});
  if(!avatars.isPersonalImage(value))throw invalid();
  const encoded=value.slice(22),data=Buffer.from(encoded,'base64');
  if(data.length>avatars.maxImageBytes||data.toString('base64')!==encoded||data.length<57||data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw invalid();
  let at=8,width,height,bpp,ended=false;const pixels=[];
  while(at+12<=data.length){
    const length=data.readUInt32BE(at),end=at+12+length;
    if(end>data.length)throw invalid();
    const type=data.toString('ascii',at+4,at+8),chunk=data.subarray(at+8,at+8+length);
    if(crc32(data.subarray(at+4,at+8+length))!==data.readUInt32BE(at+8+length))throw invalid();
    if(at===8){
      if(type!=='IHDR'||length!==13)throw invalid();
      width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);
      if(!width||!height||width>256||height>256||chunk[8]!==8||![2,6].includes(chunk[9])||chunk[10]||chunk[11]||chunk[12])throw invalid();
      bpp=chunk[9]===6?4:3;
    }else if(type==='IHDR')throw invalid();
    if(type==='IDAT')pixels.push(chunk);
    if(type==='IEND'){if(length||end!==data.length)throw invalid();ended=true;break;}
    at=end;
  }
  if(!ended||!pixels.length)throw invalid();
  const stride=width*bpp+1,expected=stride*height;
  let decoded;try{decoded=zlib.inflateSync(Buffer.concat(pixels),{maxOutputLength:expected});}catch{throw invalid();}
  if(decoded.length!==expected)throw invalid();
  for(let row=0;row<height;row++)if(decoded[row*stride]>4)throw invalid();
  return value;
}
module.exports={personalAvatar};
