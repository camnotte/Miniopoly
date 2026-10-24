/* Use the board's existing, gesture-unlocked audio context and personal volume. */
(()=>{
 'use strict';
 window.miniPieceAudio=new window.MiniopolyPieceSounds.Engine({getContext:()=>{try{return (window.parent!==window&&window.parent.MiniopolyPieceSounds?.unlockedContext())||audioCtx;}catch{return audioCtx;}},getPreferences:()=>({sound:soundEnabled,volume:miniWifiVolume*100})});
 void window.miniPieceAudio.unlock();
 document.addEventListener('pointerdown',()=>miniWifiUnlockAudio(),{capture:true,passive:true});
 document.addEventListener('keydown',()=>miniWifiUnlockAudio(),{capture:true});
 window.addEventListener('pagehide',()=>window.miniPieceAudio.stop());
})();
