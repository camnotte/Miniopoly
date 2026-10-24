# Miniopoly v0.3.62 — Piece sizes and setup animation previews

The other eight pieces now match the shoes at the widest point in their walking
stride. Each has an individual scale adjustment to preserve its proportions.
The shoes keep their existing board scale and stepping animation.
The shared sizing applies to the board, moving markers, selection screens and
championship pieces. Player-list icons use the same container size for all pieces.

In Create Room and Join Room, the currently selected piece previews its movement
every two seconds. Selecting another piece starts its preview immediately and
restarts that interval. The selected option also previews while the piece chooser
is open; hover and keyboard-focus previews remain available for other choices.
Aircraft lift off and land between previews. Room availability polling preserves
the selected artwork instead of rebuilding it mid-animation.

Previews stop when the page is hidden, setup becomes unavailable, a selected
piece is taken, or Reduced Motion is enabled in device or game preferences.
They never move a piece on the board, reserve a room piece, confirm an identity,
or submit Create / Join. Confirming an identity is still required before entry.

## Installation

Stop hosting and fully Exit Launcher from the Windows system tray. Extract the
cumulative Update ZIP into an existing complete v0.3.59, v0.3.60 or v0.3.61 folder
containing server.js and replace matching files. Alternatively, extract the
Complete ZIP into a new folder. Open Start-Miniopoly.bat from the updated folder,
start hosting, and refresh every browser. Confirm v0.3.62 in the launcher and game.
Node.js 18+ is required; no npm install is needed. Mac guests receive files from
the host and need no separate installation. Preserve your previous installation
and private save backup while testing.

## Validation

npm test on Node.js 24.19.0 / Linux: 210 tests, 207 passed, 0 failed,
3 optional HTTPS checks skipped. Chromium checks cover the two-second interval,
all nine selections, aircraft landing, Create and Join previews, occupied-piece
protection, keeping the animation node through room polling, system and personal
Reduced Motion, hidden-page and setup-exit stopping, phone layout and artwork
sizing. Actual Windows launcher and Mac rendering still need local testing.

This release also includes the v0.3.61 version labels and font detection fixes.
Match rules, financial calculations and saved piece identifiers are unchanged.
Express / World Collapse and earlier championship layout proposals remain separate
work. Main has not been changed.
