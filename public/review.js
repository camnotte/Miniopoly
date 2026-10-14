'use strict';
const reviewFrame=document.getElementById('reviewBoard');
const worldButtons=[...document.querySelectorAll('[data-review-world]')];
let reviewWorld=0;
let reviewLevel=0;
let reviewSizeObserver=null;
function fitReviewBoard(){
  if(reviewFrame.clientWidth>=900){reviewFrame.style.removeProperty('height');return;}
  const content=reviewFrame.contentDocument?.querySelector('.app');
  if(content)reviewFrame.style.height=Math.ceil(content.getBoundingClientRect().height+8)+'px';
}
function selectReviewWorld(index){
  reviewWorld=index;
  for(const button of worldButtons)button.setAttribute('aria-pressed',String(Number(button.dataset.reviewWorld)===index));
  reviewFrame.contentWindow?.postMessage({type:'MINI_REVIEW_WORLD',world:index},location.origin);
}
function selectReviewLevel(level){
  reviewLevel=level;
  reviewFrame.contentWindow?.postMessage({type:'MINI_REVIEW_LEVEL',level},location.origin);
}
document.getElementById('reviewLevel').addEventListener('change',event=>selectReviewLevel(Number(event.target.value)));
for(const button of worldButtons)button.addEventListener('click',()=>selectReviewWorld(Number(button.dataset.reviewWorld)));
reviewFrame.addEventListener('load',()=>{
  reviewSizeObserver?.disconnect();
  const content=reviewFrame.contentDocument?.querySelector('.app');
  if(content){reviewSizeObserver=new ResizeObserver(fitReviewBoard);reviewSizeObserver.observe(content);}
  selectReviewWorld(reviewWorld);
  selectReviewLevel(reviewLevel);
  fitReviewBoard();
});
window.addEventListener('resize',fitReviewBoard);
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==reviewFrame.contentWindow)return;
  if(event.data?.type==='MINI_REVIEW_READY'){selectReviewWorld(reviewWorld);selectReviewLevel(reviewLevel);}
});
