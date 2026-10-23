# Miniopoly v0.3.21 — Board layout, special animations and escape choices

This cumulative update supports an existing v0.3.14 through v0.3.20 installation.
Nunito and the original special-place illustrations/GIFs are retained.

## Install on the Windows host

1. Stop the running game: **Ctrl+C** in the local server terminal. If hosting
   online, choose **Stop hosting** first, then close its terminal.
2. Right-click **Miniopoly-v0.3.21-Update.zip**, choose **Extract All**, then
   **Extract**. Open the extracted folder until you see `server.js`, `public`,
   `scripts`, and both Windows launchers.
3. Copy **everything** from that extracted folder into your **existing Miniopoly
   game folder**. Choose **Replace the files in the destination**. The existing
   folder may keep its old version name. This ZIP is an update, not a standalone
   installation; it uses your existing property artwork and HTTPS executable.
4. For local testing, run **start-windows.bat** from the existing game folder.
   Open **http://localhost:3000** on the host. For online play, run
   **Start-Online-Hosting.bat** with your working settings.
5. Refresh **both** game browsers, including the MacBook and any phones. Open
   **Game Menu** and check that **v0.3.21** appears on every device.

Saved rooms, seats, cash and properties are retained. Resume your current room.
Your router, firewall, password, HTTPS executable and certificates stay in place.
An already pending old Setback payment converts to 20 times its locked die;
that result is preserved. Normal games continue without a reset.

## Changes to review

- **Special places:** the landing reveal and transaction popup use the matching
  original GIF, including Ogeechee Line's train. Railroads and utilities no longer
  fall back to a house. Other special places retain their illustrations, with
  matching GIFs where supplied and a gentle animated emblem otherwise.
- **Board layout:** the board begins alongside Quick Actions and the turn panel.
  Its world name runs horizontally at the top of the center scenery. Community
  cards sit at the lower left and Chance at the lower right. The latest three
  activity messages appear below the board; expand Match activity for history.
- **World shifts:** the current world stays visible while the cube rolls, fades
  out, then the next world fades in before the game piece moves.
- **Standings:** highest net worth appears first; ties share a rank and retain
  seat order. Bankrupt players appear last. The active player remains highlighted.
  Reordering the standings does not change whose turn comes next.
- **Drawn cards:** a Community or Chance card lifts from its matching board deck,
  turns toward the viewer, and reveals the drawn card before its decision popup.
  Browse the decks using Cards or either stack; browsing does not draw a card.
- **Building Permit:** Community Chest and Chance each include this new card.
  Keep it, then choose **Turn Actions → Perks** to select a property you own.
  It gives one free upgrade without a complete set, up to Level 3, on an
  unmortgaged property. It is consumed once. Future normal upgrades still need
  a full set. The card review now contains **48 cards across six decks**.
- **Bonus rolls:** a 7 or 11 briefly announces the player's earned extra roll,
  then normal movement and the landing continue. Resolve the landing and click
  **Bonus Roll** to roll immediately. Hover/focus the button or tap its info
  button to see why it was earned. A third consecutive 7/11 announces Setback
  instead of another bonus. Repeated clicks cannot spend a later bonus.
- **Accessibility and multiplayer:** Reduced Motion skips spins, fades and drawn
  card effects, and uses still artwork in transaction popups. Server revisions,
  live updates, catch-up reads and chat above transaction windows are retained.

## Revised Setback rules

Landing on the square is **just visiting**. Only a sending card or three
consecutive 7/11 rolls detains the player. Rent collection pauses while held.
At the start of a detained player's turn, the escape choices open automatically:

- **Free attempt:** roll **6 or 12** to leave and move by that value, in the same
  world. A failed attempt ends that roll without movement. There are up to three
  free attempts across turns; a third failure locks an escape payment of
  **20 × that settled roll**, after which payment moves the piece by that value.
- **Paid escape:** choose this before the free roll. Roll once, then pay
  **20 × the result**: for example, 6 costs $120 and 12 costs $240. The result
  locks before payment and cannot be rerolled. After payment, move by that result.
- **Forfeit an eligible deed:** send an undeveloped, unmortgaged deed you own
  to the Foreclosure Market to leave. You receive no cash for forfeiting it.
- **Escape card / Tow Voucher:** consume the card to leave without paying.

**Escape rolls never trigger a world shift or earn a bonus**, including 6/12
and the normal ten-roll shift threshold. They do not advance that shift counter.
If a locked payment cannot be paid, sell assets, forfeit an eligible deed, use
an escape card, or declare bankruptcy. Existing foreclosure waiting periods apply.

## Quick test with two devices

1. Confirm v0.3.21 on both screens. Check the board title, lower card stacks,
   activity history and standings. Open Cards and find Building Permit in both
   Community Chest and Chance.
2. Roll normally. A 6/12 should fade the board into the next world; a normal
   7/11 should announce a bonus, then move. Resolve the landing and click Bonus
   Roll once: the cube should roll immediately on both screens.
3. Land on Ogeechee Line or another railroad/utility. Its matching animation
   should appear before and inside the landing popup.
4. Draw Community/Chance and watch the card rise from the corresponding stack.
5. When sent to Setback, review the escape choices on your next turn. Check a
   free 6/12 escape stays in the same world, or choose paid escape and verify
   the fee equals 20 times the displayed die.
6. Hand off several turns between the PC and MacBook. Both the turn panel and
   persistent turn notice should name the same active player. Switch away from
   a tab and return to check catch-up. Chat remains usable during transactions.

Dice and cards are random in normal play; no test controls are exposed. You may
use **Game Menu → Restart practice match** for a fresh test, but this resets that
room's match progress. It is optional; it is not needed to install the update.

## Validation

92 Node tests passed, including free/paid escapes, fee locking and restart,
foreclosure/liquidation, rent suspension, Building Permit eligibility/consumption,
bonus replay protection, world-fade sequencing, revisions and HTTPS/SSE transport.
Chromium checks cover seven desktop and seven phone sizes, four players, chat,
transactions, keyboard/tap hints, original railroad media, world fades/card draws,
reduced motion, single-click bonus/third-roll Setback and two-device turn recovery.
The cumulative ZIP is checked against the source and applied to the original
Windows release to verify both launchers and the existing HTTPS tool/artwork.
Browser checks run in Linux Chromium; review the updated visuals on your Windows
PC, MacBook and phone using your working host connection.
