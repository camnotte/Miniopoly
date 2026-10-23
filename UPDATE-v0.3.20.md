# Miniopoly v0.3.20 — Keep turns synchronized across browsers

Fixes a browser remaining on the previous player's turn after the other device
ends its turn. An older action reply could overwrite a newer live update; a
paused or silently interrupted live stream could also leave a browser behind.

## Install without resetting the match

This cumulative update supports an existing v0.3.14 through v0.3.19 game.
Both `start-windows.bat` and `Start-Online-Hosting.bat` are included.

1. Stop the host game. Local testing: **Ctrl+C** in its terminal, then close it.
   Online hosting: **Stop hosting**, then close the hosting terminal.
2. Right-click `Miniopoly-v0.3.20-Update.zip` in Downloads. Choose **Extract All**,
   then **Extract**. Open the extracted folder until you see `server.js` and
   the `public`, `hosting` and `scripts` folders.
3. Select everything (**Ctrl+A**) and copy (**Ctrl+C**). Open your **existing
   Miniopoly game folder**, paste (**Ctrl+V**), and choose **Replace the files
   in the destination**. Your folder can keep its old version name.
4. For local testing, run **start-windows.bat** from that existing folder.
   For online play, run **Start-Online-Hosting.bat** with your working settings.
5. Refresh **both** game browsers, including the MacBook. **Game Menu** should
   show **v0.3.20** on each device. Resume the same saved room and player seats.
   Sign in again if the private online game asks.

This is an update using the artwork and HTTPS tool in your existing installation.
Room progress, player seats, cash, properties and turns remain saved. Router,
firewall, password and certificate settings remain as configured.

## What changed

- Every saved game change now has a revision number. Both live events and action
  replies use one state check, so an older reply cannot put a browser back on
  Dell PC's previous turn after the next turn has arrived.
- Requests and streams remain bound to the player/room that opened them. A
  previous connection cannot replace the active room or seat.
- A visible game browser reads the current room about every five seconds as a
  backup to immediate live updates. Hidden tabs skip that polling. Requests
  have a timeout and do not overlap.
- Returning to a tab/page, restoring a page from browser history or coming back
  online reconnects and requests the current room immediately.
- Catch-up goes directly to current positions and turn state instead of replaying
  an already completed roll from the prior player. Normal live rolls and their
  landing graphics still play. An unrelated refresh does not stop a current replay.
- Seat forgetting, page departure and private-game logout stop background reads.

The larger cube, wider panel, net-worth badges, exterior financial ranks,
persistent turn notice, Quick Actions, transparent board surround and compact
phone header are retained. Nunito, artwork/GIFs and game rules remain unchanged.

## Test with the PC and MacBook

1. Use the same room on both devices. Confirm Game Menu says v0.3.20 on both.
2. Have Dell PC roll, resolve its landing, and choose End Turn. A 7/11 bonus
   remains Dell PC's turn until the bonus chain ends, as before.
3. After a normal handoff, both the MacBook turn panel and center popup should
   identify the next player. Only that player should be able to roll.
4. Switch away from the MacBook tab, complete a turn on the other device, then
   return. It should catch up without reloading. If a live stream silently stops,
   the backup read normally repairs it within about five seconds once visible
   and connected to the host.
5. Repeat in the opposite direction. Keep using the same saved game.

## Validation

The original delayed-reply problem was reproduced on v0.3.19: the server and a
newer live update said MacBook, then a delayed End Turn reply returned the browser
to Dell PC. The corrected build retains MacBook's newer turn.

The Node suite covers revision ordering, room/seat isolation, persistence across
server restart and practice reset, chat/attachment revisions and existing game
rules. Two Chromium clients exercise delayed replies, closed and silently open
stalled streams, visibility/page lifecycle recovery, current iframe positions,
turn panel/popup agreement and roll permission. The layout/gameplay browser checks
also cover phone sizes, purchase/chat, bonus rolls, reset and four-player panels.
The cumulative ZIP is checked over the original Windows installation.

These are Linux Chromium checks with simulated tab/stream interruptions, not a
claim of testing your physical MacBook or Safari. Please repeat the two-device
steps on your PC and MacBook after installing.
