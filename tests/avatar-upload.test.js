'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {personalAvatar}=require('../lib/player-avatar');
const avatars=require('../public/avatars');
const {avatarPNG}=require('./helpers/avatar');

test('personal avatar accepts bounded valid PNG pixels and preserves an absent photo',()=>{
  const image=avatarPNG(192,192);
  assert.equal(personalAvatar(image),image);
  assert.equal(personalAvatar(undefined),null);
  assert.equal(personalAvatar(null),null);
  assert.match(avatars.html('man-1',0,image),/class="game-avatar is-personal"/);
});
test('personal avatar rejects URLs, SVG, malformed pixels, oversized dimensions and expansion bombs',()=>{
  for(const image of ['https://example.com/photo.png','data:image/svg+xml;base64,PHN2Zz4=',{},'data:image/png;base64,AAAA',avatarPNG(257,8),avatarPNG(0,8),avatarPNG(1,1,Buffer.from([5,0,0,0,0])),avatarPNG(1,1,Buffer.alloc(1024*1024)),'data:image/png;base64,'+'A'.repeat(90000)])assert.throws(()=>personalAvatar(image),{status:400});
  const bytes=Buffer.from(avatarPNG().slice(22),'base64');bytes[bytes.length-1]^=1;
  assert.throws(()=>personalAvatar('data:image/png;base64,'+bytes.toString('base64')),{status:400});
  assert.doesNotMatch(avatars.html('man-1',0,'https://example.com/photo.png'),/<img/);
});
