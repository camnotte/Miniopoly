# Miniopoly v0.3.68 — Movement sounds, earthquake damage and one victory lap

T-Rex now gives one dinosaur screech derived from the supplied `T-RexWalk.mp3`, then recorded footsteps repeat until arrival. The Battleship gives one departure horn, plays uninterrupted water while traveling and rings the supplied `Ship-Bell.mp3` once on arrival. Cancelling a move or falling into a fatal void does not ring the arrival bell. Mute, volume, hidden tabs and stale-callback cleanup remain supported. Clips are bundled locally; no streaming service or account is used.

The other eight pieces retain their existing sounds for review. Open `/sound-review` on your running host, or download the portable review linked in DOWNLOAD-v0.3.68.md. Each piece has a Listen button, five seconds of travel and an arrival. The review includes Sound/Volume controls and earthquake/void samples without connecting to a match.

Earthquake cracks now have jagged openings of varying width, chipped edges and branching hairlines. They become more prominent during the last building rounds and persist during collapse. A low ground rumble accompanies each new warning-round or collapse-wave shake; repeated state updates do not retrigger it. Reduced Motion removes shaking while preserving sound controls.

Collapsed spaces now show a purple-and-crimson vortex based on the inline reference. **This is an original SVG interpretation, not the exact uploaded animation:** the inline image was visible but its GIF file was not available in the workspace. Attach that GIF as a file to replace the interpretation with the exact animation.

The champion makes one complete lap around the trophy, parks beside its base and performs a small stationary gesture every two seconds. Travel sounds end with the lap (the ship rings its arrival bell once). Resizing, changing fonts or returning to a tab preserves progress and cannot add another lap. Replay ceremony starts a fresh lap. Reduced Motion removes lap/idle motion. Sound remains independently controlled. Co-champions each receive one lap; the first champion supplies the celebration sound sequence to avoid overlapping audio.

Express rules and the v0.3.67 evade system are retained. Existing match saves load normally; older saves without evade rules still require a new/reset Express match to receive those rules.

Validation: 245 Node tests, 242 passed, zero failures, three optional HTTPS checks skipped. Chromium checked all ten sounds, actual two-browser Express movement with recorded T-Rex audio and arrival bells, one ship horn per trip, water/wake cleanup, earthquake playback on both devices, crack/void assets and no page errors or failed game assets. Preview checks covered 320–1440px, Nunito/American Captain, one lap, resume/resize/font behavior, two-second idle and Reduced Motion. Both portable sound and championship reviews have embedded audio and no external asset requests. Native Windows/Mac listening and subjective sound quality remain user playtests.

Stop hosting and fully Exit Launcher from the Windows tray before applying the update. Relaunch from the updated folder, refresh all browsers and confirm v0.3.68.
