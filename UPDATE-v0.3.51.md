# v0.3.51 — Shoes, battleship and a ninth Car

- Shoes take alternating forward strides. Each foot lifts past its partner,
  plants, then pushes back; idle shoes remain still.
- Battleship has a long tapered hull, bridge, masts, railings, portholes and
  deck guns. Calm water remains visible when parked. Moving foam streams astern
  with the ship's actual direction, alongside the existing rising steam.
- Car returns as a ninth choice, illustrated in coral and teal to match the
  other pieces. Its separate wheel spokes spin while moving. The original
  path-following twin tire marks still fade within about one second.

Cat and Dog are unchanged. Blimp and every other existing choice remain;
existing saves retain piece IDs, seats, worlds, positions, money and rules.
New Car uses its own ID, so it never replaces a saved Blimp.
Game and device Reduced Motion disables stepping, steam, waves and wheel effects.

## Review

Open `/pieces-preview` while hosting, or download and open
Miniopoly-v0.3.51-Pieces-Mockup.html. The HTML embeds Nunito, art and motion code
and needs no server. Idle and moving states appear side by side, with direction,
speed, pause and replay controls. Cat and Dog are omitted from this art review
because they were not redrawn.

## Install

The Update ZIP supports an installed v0.3.46, v0.3.47, v0.3.48, v0.3.49 or
v0.3.50 game. Stop hosting. Extract Miniopoly-v0.3.51-Update.zip into the existing
game folder and replace matching files. Restart Start-Miniopoly.bat and refresh
every player's browser. Confirm v0.3.51 beside Room. Keep your current game
address and browser data; no match reset or hosting reconfiguration is needed.

For an older/incomplete installation, use the complete Windows ZIP or all four
numbered complete ZIPs in one folder. Node.js LTS is required as before.

## Verification

176 automated tests passed, including HTTPS/live-update checks and saved-piece
persistence. Browser checks cover desktop/phone movement and facing, the shoes
alternating the leading foot, calm/animated water, Car wheels/tracks, reduced
motion and the unchanged original Cat/Dog SVG outputs. The same bundled vectors
are served to Windows and Mac browsers; physical Windows/Mac hardware and the
user's public Internet connection were not exercised here.
