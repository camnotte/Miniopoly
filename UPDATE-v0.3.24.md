# Miniopoly v0.3.24 — Visible pieces and correct world layouts

## Install on the Windows host

This cumulative ZIP updates an existing v0.3.14 through v0.3.23 installation.

1. Stop the local server with **Ctrl+C**. For online hosting, choose **Stop
   hosting** before closing that terminal.
2. **Extract All** from **Miniopoly-v0.3.24-Update.zip**. Copy **everything** into
   your **existing Miniopoly game folder**, replacing matching files.
3. Run **start-windows.bat** for local testing, or **Start-Online-Hosting.bat**
   with your working online settings.
4. Refresh both browsers, including phones. Check **v0.3.24 beside Room** in
   the title bar. Game Menu also shows the version. Resume your saved room.

Both launchers are included. The update uses your existing artwork and HTTPS
installation. Saved progress, seats, passwords and connection settings remain.

## What changed

- **Visible version:** shown beside Room on desktop and phones, with a compact
  header layout that also fits narrow screens.
- **Visible waiting pieces:** fixed zero-height parked image containers and
  stale movement hiding. Pieces remain visible when the match starts, after
  landing and between turns. Four sharing GO show their actual pieces rather
  than switching to initial-letter dots.
- **Cat scale:** cropped the full-body SVG's empty margins so its painted size
  matches the car, using the same moving-piece dimensions.
- **World-name bar:** approximately three text lines tall, full width, square
  corners and a 30% background. Text sits lower in the bar, retaining Nunito
  and its shadow for readability over the scenery.
- **Arrival timing:** a settled server destination no longer prematurely shifts
  a special-place illustration. The visual piece stays at its starting square
  while the cube rolls. The destination layout makes room only at arrival.
  Financial displays still refresh on arrival; the landing effect and decision
  follow normally. Game actions and property inspection are blocked during
  playback. Chat stays available.
- **World isolation:** parked layout comes from each player's own world and
  position. Moving/bankrupt pieces do not reserve destination artwork space.
  Switching worlds rebuilds its occupancy, and old special-art timers are
  cleared. An empty railroad in the next world stays centered even when a
  railroad in the previous world has a player on it.
- **Turn handoff:** moving to a player whose world differs from the previous
  player's world uses the same defocus/fade/refocus and sound. The next roll and
  ready-turn notice wait until that transition finishes. Reduced Motion skips
  it, and reconnect/catch-up goes directly to current state without replaying
  completed moves. A handoff never rolls or moves a piece by itself.

Original property/special artwork, Nunito, walking/spinning pieces, fading tire
tracks, game rules and multiplayer revision protection are retained.

## Review with two devices

1. Check the version beside Room on the PC and phone/MacBook. Look for both
   pieces on GO before rolling; a four-player test should show all four there.
2. Watch a roll onto Coastal Express or another special place. Its illustration
   should keep its normal position while the cube rolls and the piece moves.
   At arrival it makes room for the parked piece. Actions follow the landing.
3. End the turn when the next player is in a different world. Watch the fade,
   then check that player's piece and ready-turn notice. Empty special places
   should use their normal centered layout, without another world's offsets.
4. Return to the first player. Their world should show their saved position and
   the correct occupied layout. Repeat in the other direction.
5. Compare the moving cat and car, the taller translucent title bar and chat
   availability while the board transitions.

Normal dice/cards stay random. No test controls are exposed in the game.

## Validation

101 automated tests passed, including visual occupancy during dice/movement,
world identity and preserved authoritative destinations. Chromium checks cover
zero-height piece regression, destination artwork timing, blocked premature
mutations/inspection, different-world handoffs both ways, original player/world
positions, no ghost occupancy, matching cat/car scale, Reduced Motion, all four
waiting pieces and version/header fit from 320 to 1470 pixels. Existing desktop,
phone, tire-track and delayed/stalled-stream synchronization checks also pass.
The cumulative ZIP is checked against source and applied to the original Windows
release, preserving both launchers, original embedded artwork and HTTPS tool.
Browser checks run in Linux Chromium; review on your Windows/Mac/phone browsers.
