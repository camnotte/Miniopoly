# v0.3.50 — Illustrated game pieces and animated mockup

The new lineup is Cat, Dog, Blimp, Airplane, T-Rex, Tennis shoes, Battleship and
Top Hat. Cat and Dog retain the exact existing vectors in every state. All six
other pieces now use shared vector illustrations, so they no longer depend on
Windows/macOS emoji fonts.

The six-piece interactive review shows idle and animated travel side by side,
with direction, speed, pause and replay controls. Open `/pieces-preview` while
hosting, or download the self-contained Miniopoly-v0.3.50-Pieces-Mockup.html and
open it in your browser. It needs no server, account or Internet connection.

Aircraft lift and hover, then touch down before the destination action appears.
T-Rex walks with a moving tail, the shoes alternate steps, the battleship emits
steam and a wake, and the hat hops and tips. Piece facing follows each rendered
segment, including corners; direction no longer depends on platform emoji.
Idle/parked pieces rest. Reduced Motion disables movement effects as before.

## Existing games

Stored piece IDs remain stable; graphics and names are replaced in place:

| Previous piece | Replacement |
| --- | --- |
| Car | Blimp |
| Tablet | Airplane |
| Rocket | Battleship |
| Scooter | Tennis shoes |
| Dinosaur | T-Rex |
| Controller | Top Hat |

Cat and Dog are unchanged. Existing players keep their saved seats, positions,
worlds, balances, property ownership and unique piece assignments. No room reset
or reselection is required. The Male/Female/photo setup, Nunito, game rules,
special-place media and working hosting settings remain.

## Install

The Update ZIP supports installed v0.3.46, v0.3.47, v0.3.48 or v0.3.49 games.
Stop hosting. Extract Miniopoly-v0.3.50-Update.zip into the existing folder and
replace matching files. Restart Start-Miniopoly.bat and refresh every player
browser. Confirm v0.3.50 beside Room. This update includes the changed board.

For an older/incomplete installation, use the complete Windows ZIP or all four
numbered complete downloads in one folder. Node.js LTS is required as before.

## Verification

176 automated checks passed, including the HTTPS/live-update suite. Browser
checks exercised every new piece through all four directions on desktop and
phone layouts, aircraft touchdown/arrival ordering, resting states, actual
server destinations, reduced-motion GO/balances and preserved Cat/Dog art.
The review HTML embeds its font/art/code and runs independently of saves.
Windows/macOS hardware and public Internet hosting were not exercised here;
the same bundled SVG shapes are supplied to every browser.
