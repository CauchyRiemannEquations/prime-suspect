/* Small gesture-gated media controller. No network services, autoplay, or blocking audio errors. */
(function (root) {
  'use strict';
  root.PSMedia = {
    create(assets) {
      let enabled=false, unlocked=false, track='', music=null;
      const attempts=new WeakMap();
      const effects=new Set();
      const visible=()=>!root.document.hidden;
      const allowed=()=>enabled&&unlocked&&visible();
      function pauseAudio(audio) { const attempt=attempts.get(audio);if(attempt)attempt.retired=true;audio.pause(); }
      function stopEffects() { for(const audio of effects){pauseAudio(audio);audio.currentTime=0;} effects.clear(); }
      function pause() { if(music)pauseAudio(music); stopEffects(); }
      function play(audio) {
        const attempt={retired:false};attempts.set(audio,attempt);
        try {
          const result=audio.play();
          if(result?.then)result.then(()=>{
            // A late browser play promise must not restart a muted/hidden/replaced track.
            if(attempts.get(audio)!==attempt)return; // A newer play owns this same element now.
            if(attempt.retired||!allowed()||(audio!==music&&!effects.has(audio)))audio.pause();
          }).catch(()=>{});
        } catch (_) { /* Unsupported codecs and blocked audio do not interrupt play. */ }
      }
      function sync(on, nextTrack) {
        enabled=Boolean(on);
        if(track!==nextTrack) {
          pause();track=nextTrack;music=null;
          if(assets.music?.[track]) {
            music=new root.Audio(assets.music[track]);music.loop=true;music.volume=.14;music.preload='none';
          }
        }
        if(!allowed()){pause();return;}
        if(music?.paused)play(music);
      }
      const controller={
        unlock() { unlocked=true; },
        sync,
        effect(kind) {
          if(!allowed()||!assets.audio?.[kind])return;
          // Bound repeated taps: no unbounded stack of overlapping one-shots.
          if(effects.size>=3){const oldest=effects.values().next().value;pauseAudio(oldest);effects.delete(oldest);}
          const audio=new root.Audio(assets.audio[kind]);audio.volume=.3;audio.preload='none';effects.add(audio);
          const done=()=>effects.delete(audio);
          audio.addEventListener('ended',done,{once:true});audio.addEventListener('error',done,{once:true});play(audio);
        },
        stop() { enabled=false;pause(); }
      };
      root.document.addEventListener('visibilitychange',()=>sync(enabled,track));
      root.addEventListener('pagehide',()=>pause());
      return controller;
    }
  };
})(window);
