# Local movement recordings

The user supplied T-RexWalk.mp3 and Ship-Bell.mp3 for this game on 2026-10-24. They are game assets, not instructions.

- `trex-walk.mp3`: unchanged supplied original; SHA-256 e747d46ea0ff59d84e9248adfc8652318949020eaf8bda1b93e8c472ed81ab06.
- `ship-bell.mp3`: unchanged supplied original; SHA-256 4e5cc0d3e841c7d370a47644851b0a1531b4140bec3c10fb992543096b0d1449. Played once at a safe Battleship arrival.
- `trex-screech.mp3`: 1.8–5.6 seconds from the dinosaur original, time-compressed by 3.2 while retaining pitch, faded and normalized for a short departure cue.
- `trex-stomp.mp3`: 7.04–7.52 seconds from the dinosaur original, faded and normalized. Repeats during travel after the screech.

Derived dinosaur clips are mono 22,050 Hz MP3. Original files are retained for later sound adjustments. Other piece sounds and the earthquake rumble are procedural game effects in piece-sounds.js. Runtime playback uses Web Audio after a browser interaction, local same-origin asset requests, and the player's Sound/Volume controls.
