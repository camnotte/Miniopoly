'use strict';
const zlib=require('node:zlib');
function chunk(type,data){
  const name=Buffer.from(type),result=Buffer.alloc(data.length+12);
  result.writeUInt32BE(data.length);name.copy(result,4);data.copy(result,8);
  let crc=0xffffffff;
  for(const byte of Buffer.concat([name,data])){crc^=byte;for(let n=0;n<8;n++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}
  result.writeUInt32BE((crc^0xffffffff)>>>0,data.length+8);return result;
}
function avatarPNG(width=8,height=8,raw){
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  const pixels=raw||Buffer.alloc((width*4+1)*height);
  if(!raw)for(let y=0;y<height;y++)for(let x=0;x<width;x++){const at=y*(width*4+1)+1+x*4;pixels[at]=220;pixels[at+1]=100;pixels[at+2]=40;pixels[at+3]=255;}
  return 'data:image/png;base64,'+Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]).toString('base64');
}
module.exports={avatarPNG};
