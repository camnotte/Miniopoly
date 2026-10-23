# Miniopoly v0.3.25 — Faster turn transitions and clear shared ranks

## Install on the Windows host

This cumulative update supports an existing v0.3.14 through v0.3.24 installation.

1. Stop the local server with **Ctrl+C**. For online hosting, choose **Stop
   hosting** before closing its terminal.
2. **Extract All** from **Miniopoly-v0.3.25-Update.zip**. Copy **everything** into
   your **existing Miniopoly game folder**, replacing matching files.
3. Run **start-windows.bat** for local testing, or **Start-Online-Hosting.bat**
   with your working online settings.
4. Refresh **both browsers**, including phones. Check **v0.3.25 beside Room**
   on every device. Resume your saved room; no match reset is needed.

Both launchers are included. Your existing artwork, saved rooms, seats, hosting
settings, passwords and HTTPS installation remain in place.

## What changed

- **Faster between-player transitions:** showing the next player's world takes
  about one second: 0.4 seconds fading out, 0.6 seconds fading in. The matching
  sound finishes within that second. Game controls and the ready-turn notice
  wait for it; chat stays available. Same-world handoffs have no added delay.
- **Dramatic roll-triggered shifts retained:** when a roll actually shifts a
  player's world, it still uses the existing three-second defocus/refocus and
  full sound. Quick handoffs do not shorten subsequent roll-triggered shifts.
- **Explicit shared financial ranks:** equal net worth shares the same rank,
  with a small **Tied #1** label. Four players might rank **1, 1, 3, 4**. Different
  cash balances or deed counts do not break a net-worth tie. The tied rows stay
  in seat order for a steady display, which does not award a different rank.
  Comparisons normalize numerical worth, including older numerical strings.
  Bankrupt players remain last and show OUT.

The existing shared-rank code already treated equal numeric net worth as tied;
the reported 1/2 display for identical values was not reproduced in the current
build. This update makes ties explicit and verifies the behavior. No additional
cash, completed-set or property-count tiebreaker has been introduced.

Ranks and money still update together on piece arrival. Actual turn order,
game rules, original special artwork/GIFs, Nunito, visible waiting pieces,
walking/spinning pieces and fading tire tracks are retained.

## Review with two devices

1. Check v0.3.25 beside Room on both devices.
2. At the start, equal $1,500 net worth should show rank 1 for both players,
   with **Tied #1** labels. Buying a property at its full price can preserve a
   tie, because cash is exchanged for a property of the same net-worth value.
3. Once players occupy different worlds, end a turn. Switching to the next
   world should take roughly one second. Repeat in the other direction.
4. A normal world-shifting roll, such as 6 or 12, should still have the longer
   dramatic effect before the piece moves.
5. When a reward or payment changes net worth, watch the standings update after
   arrival. A tie label disappears once the displayed net worth differs.

Sound respects the existing mute control. Reduced Motion skips the transition.
Reconnecting goes directly to current state rather than replaying old turns.

## Validation

105 automated tests passed, including shared ranks, changing ties, bankruptcy,
arrival-held finances, short sound timing and both transition lengths. Live
Chromium checks with desktop and phone clients measured handoffs at about 1.05
seconds and roll-triggered shifts at about 3.1 seconds. They also covered four
players, different cash/deed counts, action blocking, both handoff directions,
Reduced Motion, world occupancy and 320–1470px layouts with no browser errors.
The cumulative ZIP is checked against source and applied to the original Windows
release while retaining both launchers, embedded artwork and the HTTPS tool.
Browser validation runs on Linux Chromium; review on your usual devices too.
