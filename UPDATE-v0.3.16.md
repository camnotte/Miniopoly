# Miniopoly v0.3.16 — Turn notices, chat, movement and zoom fixes

This cumulative update works with an installed **v0.3.14 or v0.3.15** game.
It includes the compact phone header from v0.3.15.

## Install on the Windows hosting PC

1. Choose **Stop hosting** in the console, then close its terminal.
2. Use **Extract All** on **Miniopoly-v0.3.16-Game-Update.zip**. Choose your
   **existing game folder** as the destination: the folder containing
   `Start-Online-Hosting.bat`, `server.js`, `public`, and `hosting`.
   Replace matching files. The ZIP has files directly at its root.
3. Open the existing **Start-Online-Hosting.bat**, then start hosting normally.
   Leave the password blank to keep your saved password. Keep your current
   public IP, router forwarding and firewall configuration.
4. Refresh the game in the PC and phone browsers. Friends use the same game link.
   Sign in again if asked; the saved room and player seats remain at that address.

The folder may still be named `Miniopoly-v0.3.14`; it does not need renaming.
The game and hosting console identify the updated release as v0.3.16. This ZIP
is an update, not a standalone installation. It does not replace Caddy or touch
your passwords, certificates or saved room files.

## Review the changes

### Player-turn announcement

Start or resume a match. A notice in the board center shows the active player's
name and says when they are ready to roll. A gentle three-pulse glow draws
attention without flashing the text. It lasts about four seconds and disappears
when the player rolls; it never intercepts a click or touch. Reduced Motion
turns the animation off. A 7/11 bonus gets a separate Bonus Roll notice. Chat
messages, cash updates and reconnecting opponents do not repeatedly announce
the same ready turn.

### Chat during transactions

Use the always-available **Chat** button at the lower right, or the existing
header/menu Chat option. The chat window stays above property purchases,
payments, portfolio and card windows. Both players can send messages while a
transaction waits. A draft stays in the composer through game updates; a failed
send keeps the text. File sharing retains the existing permitted formats and
2 MB upload limit. Close chat with its X or Escape. It stays closed until you
open it again, and does not change who may buy, pay, or roll.

### Piece movement

Roll the cube. The piece should remain at its starting square throughout the
die spin, then travel along the path once. It must not appear at the destination
first or draw two pieces during the replay. The server's actual position and
money remain authoritative; the correction is in the visual replay. Other
live-state updates do not restart the same replay.

### Zoom and board size

On the PC, use the browser's zoom controls to zoom out, then return to 100%.
The board should remain a large board with a bounded leaderboard column,
instead of collapsing into the old hidden control-rail column. Its desktop
width respects the available iframe height. Narrow embedded boards follow
content height so they do not acquire an extra internal scroll/crop. Phones
retain the cube in the top header and the available board width.

The property and special-place artwork, landing GIFs, gameplay rules and
working online connection remain unchanged.

## Validation

The update was checked with the Node regression suite and Chromium across phone,
landscape, short keyboard-sized windows, laptop and wide desktop viewports.
End-to-end checks cover two-player rolling and buying, chat above an opponent's
purchase, safe message text, attachment sharing, retained drafts, bonus notices,
reduced motion, and frame-by-frame prevention of the destination flash.

The original uploaded screenshot was a photo of a zoomed-out Windows browser.
Wider CSS viewports reproduce its layout breakpoint problem; the automated
checks do not simulate every Windows display scaling or Safari combination.
Review the update on your working PC and phone link as well.
