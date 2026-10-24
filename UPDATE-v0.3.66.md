# Miniopoly v0.3.66 — Champion celebration and piece sounds

The trophy's large **1** now has a metallic gold gradient, bronze edge and embossed shadow. The podium title reads **CHAMPION**. Other podium pieces move from beside the portraits to the base, immediately to the right of their final net-worth amounts.

The winning piece circles around the trophy with its movement animation. Its own sound repeats every four seconds. Co-champions receive equal celebration, with their sounds played one at a time. The existing slow podium rise, Skip and Replay controls remain. Reduced Motion keeps a still winning piece; Sound and Volume control the audio separately.

During actual board travel, each piece uses its own sound. Sounds start with movement, stop at arrival/cancellation, and pause when the tab is hidden. Muting or setting volume to zero stops active piece sounds immediately; re-enabling resumes only an active movement or visible ceremony. Browsers can require one click or key press before allowing sound. The existing Create / Join interactions unlock the shared audio context when the browser permits it.

| Piece | Sound |
| --- | --- |
| Battleship | Deep ship horn and water |
| School bus | Diesel engine and two-note horn |
| Dog | Two playful barks |
| Cat | Meow |
| Tennis shoes | Thudding footsteps, timed to the walking stride |
| Police car | Engine and a brief siren chirp |
| Blimp | Gentle propeller, with an air horn during celebration |
| Airplane | Propeller engine |
| T-Rex | Growl and stomps |
| Top Hat | Springy boing and sparkle |

These are original synthesized game effects, bundled as code and playable without network access. Only the winning piece sounds during the ceremony; the runners-up stay beside their amounts.

The Battleship has a broader water wake with extra foam and bubbles, plus a fading water trail following the actual board path, including turns. The wake stops when the ship parks; trails clear after a short fade. Reduced Motion suppresses the animated wake and trail.

Express / World Collapse, existing Classic rules, rankings, fonts, saved piece identifiers, Police car and School bus remain. Monster truck is still excluded.

## Install

1. Stop hosting and fully **Exit Launcher from the Windows system tray**. Closing its window alone can reopen the old version.
2. Back up the existing game folder. Extract the cumulative Update ZIP into the folder containing `server.js`, replacing its included files. It supports complete v0.3.59–v0.3.65 installations. Alternatively extract the Complete ZIP into a new folder.
3. Start the launcher from the updated folder. Refresh every connected browser and confirm **v0.3.66**. Mac guests continue to use the host's game link.
4. Enable Sound and set the desired Volume in Game Options. Test the winning piece in the standalone championship preview, or finish a test match and use Replay ceremony.

Node.js 18+ is required. No npm install or build is needed.

## Validation

The full Node suite passed 228 tests, with zero failures and three optional HTTPS checks skipped. Sound tests exercise all ten sound assets, gesture-unlocked playback, mute/zero volume, per-piece cadence, cached buffers, visibility, loop cancellation and stale timers. Chromium checks cover the podium in 60 combinations of player count/ties, viewport width and Nunito/American Captain, plus live repeating sound, mute, Reduced Motion and closing the ceremony. A real two-browser game verifies ship and bus sounds, path-following water, tire tracks, volume, mute/resume and sound cleanup at arrival without changing game state. Express collapse and the survivor ceremony are also checked. Native Windows/Mac sound and visual confirmation remain platform playtests.
