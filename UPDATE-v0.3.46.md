# v0.3.46 — Choose your game piece

The setup layout now follows the proposed design: a left game-piece rail beside
the desktop form, and a horizontal scrolling row above avatar choices on phones.

- All eight pieces: Car, Cat, Dog, Tablet, Rocket, Scooter, Dinosaur, Controller.
- Car/Cat/Dog show the same artwork as the board. Brief movement previews play
  on hover, keyboard focus or selection, and respect Reduced Motion.
- Scroll the rail using its arrows, mouse wheel or keyboard. Phones support
  horizontal scrolling/swiping. Selected pieces have a teal border and check.
- One confirmation card shows both portrait and piece. Click Confirm selection
  before Create/Join. Changing either choice clears that confirmation.
- Join's room code appears before the piece choices. Taken pieces are grey and
  labeled Chosen by [name]. Checks refresh while visible; a changed/invalid code,
  full room or unavailable selected piece blocks confirmation.
- A choice is claimed only when Create/Join succeeds. If two players claim the
  same piece, one joins and the other gets updated choices; no substitution occurs.
- The chosen piece is saved with the player's seat and shown on every device.
  It remains selected after refresh, hosting restart or a match reset. Existing
  room players are not asked to select again; older rooms keep their familiar
  Car/Cat/Dog/Tablet assignment. The last clicked piece is remembered per browser.

Nunito, custom-photo defaults across Local/Online, car/cat/dog artwork, special
place GIFs, movement/arrival timing, game rules, balances and hosting are retained.
New-game setup is where piece selection happens; existing live seats keep their
saved piece. This update does not add mid-match piece changes.

## Install

1. Stop hosting. Extract Miniopoly-v0.3.46-Update.zip into an installed v0.3.40,
   v0.3.41, v0.3.42, v0.3.43, v0.3.44 or v0.3.45 folder and replace matching files.
2. Restart Start-Miniopoly.bat and refresh each browser. Confirm v0.3.46 beside Room.
3. Create a new room to choose a different piece, or keep your existing saved
   room/seat to continue that game. No existing match reset is required.
4. Select an avatar/photo and game piece, click Confirm selection, then Create
   Room. A joining player enters the code first, chooses an available piece and
   confirms before clicking Join Room.

The update includes the board and new shared renderers/styles; extract every
file. For a fresh/incomplete installation, use the complete Windows ZIP or ALL
FOUR v0346 numbered ZIPs in one folder. Node.js LTS is required. The complete
package needs no older game files. Passwords, certificates and saves stay outside
this installation as before.

## Verification

Checks cover custom host/join choices, concurrent claims and safe retries,
read-only availability, saved/reset/legacy choices, keyboard navigation,
confirmation invalidation, late room replies, full rooms, phone/desktop resizing,
Reduced Motion, selected-piece rendering/movement and avatar migration across
Local/Online password sign-in. Original car/cat renderer outputs were compared
byte-for-byte in all four states. The real HTTPS proxy still protects availability
with the game password and preserves live two-player updates.
