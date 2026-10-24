# Miniopoly v0.3.64 — Police car and School bus

The existing Car is now the approved black-and-ivory Police car. Its stored key
remains `car`, so existing rooms and browser selections automatically use the new
artwork without losing their player seat, cash, position or piece assignment.
The approved School bus is added under the new key `school-bus`. There are now
ten choices. The Monster truck is not included.

## Animations

- Police car: visible rotating spokes and rim marker, suspension bounce, a flexing
  antenna, gently alternating red/blue lights, subtle colored ground glows and
  fading tire tracks. On arrival, the headlights brighten and the small spotlight
  sweeps forward.
- School bus: rotating wheels, suspension bounce, bobbing passengers and fading
  tire tracks. The door is closed and STOP paddle retracted while moving. After
  stopping, the door folds open, the paddle swings out, a passenger waves and the
  roof lamps glow gently.

The shared artwork appears in Create / Join, the piece chooser, board tokens,
moving markers, Setback art, championship panels and piece previews. The
2-second selection preview includes the arrival poses and small preview tracks.
The v0.3.63 selection spacing fix is retained. Vehicle beams stay within their
SVG viewport so they cannot cover nearby selection labels. Browser font options
remain available. SVG IDs are unique for every rendered copy, so passengers,
lights and clips do not attach to another player's artwork.

System and personal Reduced Motion disable the animated previews and the live
board movement/tracks; parked vehicle artwork remains visible. These effects are
visual only: they do not add game actions, stops, waiting time, cash or rule changes.

## Install

Stop hosting and fully Exit Launcher from the Windows system tray. Extract the
cumulative Update ZIP into an existing complete v0.3.59 through v0.3.63 game folder
containing server.js and replace matching files. Alternatively, extract the
Complete ZIP into a new folder and run Start-Miniopoly.bat from there. Start
hosting and refresh every player's browser. Confirm v0.3.64 in launcher and game.
The host must restart so the server accepts the new School bus choice.
Node.js 18+ is required; no npm install is needed. A Mac guest receives the new
files from the host and needs no separate installation. Keep your previous
installation and private save backup while testing.

## Validation

Node.js 24.19.0 / Linux: 213 tests, 210 passed, 0 failed, 3 optional HTTPS tests
skipped. Added coverage verifies the bus is selectable, reserved exclusively,
restored after server restart alongside the old `car` key, and that rejected
claims leave game state unchanged. Artwork tests verify unique local SVG IDs,
self-contained references, both approved vehicles and no Monster truck option.

Chromium checks cover 56 selection layouts: both vehicles, Create and Join,
Nunito and American Captain, and seven widths from 320 to 1366 pixels. No text
overlap or horizontal page overflow occurred; moving/parked bus door states,
arrival previews, the phone chooser and Reduced Motion were checked.

A real two-browser local match verified police wheel/light/antenna animation,
bus wheel/passenger animation, tracks for both, closed bus doors during travel,
open door/paddle on arrival, SVG IDs, and reload. Passing the two unowned-property
landings left both players at the expected positions with their original $1,500
and no owned properties. Native Windows and Mac rendering still need local testing.

Main has not been changed. Earlier championship layout proposals and Express /
World Collapse remain separate work.
