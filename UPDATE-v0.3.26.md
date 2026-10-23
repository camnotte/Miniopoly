# Miniopoly v0.3.26 — Clearer turn panel

## Install on the Windows host

This cumulative update supports an existing v0.3.14 through v0.3.25 installation.

1. Stop the local server with **Ctrl+C**. For online hosting, choose **Stop
   hosting** before closing its terminal.
2. **Extract All** from **Miniopoly-v0.3.26-Update.zip**. Copy **everything** into
   your **existing Miniopoly game folder**, replacing matching files.
3. Run **start-windows.bat** locally, or **Start-Online-Hosting.bat** with your
   working online settings.
4. Refresh **both browsers**, including phones. Check **v0.3.26 beside Room**
   on every device. Resume your saved room; no reset is required.

Both launchers are included. Existing rooms, seats, artwork, passwords and
hosting/certificate settings stay in place.

## What changed

- **Readable idle panel:** after five seconds, only the background softens to
  80% opacity. Names, ranks, net-worth badges and amounts keep their full
  opacity. Hovering, keyboard interaction, a new turn and live playback still
  restore the normal panel. **Keep fully visible** retains its saved setting.
  Phones keep the fully visible header.
- **Clear spectator status:** the disabled bottom button reads **Waiting for
  Dell PC** during Dell PC's turn, using the active player's actual name. Its
  action arrow is hidden while waiting. The collapsed desktop control also
  names the player being awaited. Your own turn restores **End Turn** and the
  existing enable/disable rules. Long names wrap on narrow screens.
- **Clear bonus counter:** **Consecutive bonus rolls: 0 of 3** replaces the
  technical “7 / 11 chain: 0 / 3” caption. Its count follows the existing rules.

The financial layout, Nunito, shared ranks, one-second between-player world
transitions, dramatic roll-triggered shifts and existing game rules are retained.

## Review with two devices

1. Leave the desktop panel untouched for about five seconds. Its background
   should soften while names, rank numbers and money remain easy to read.
2. Hover or check **Keep fully visible** to restore the solid background.
3. On the other player's device, check the disabled **Waiting for [name]**
   button. End the active player's turn: both devices should update the name
   and the new active player should see **End Turn** again.
4. Check a phone with a long player name. The waiting text should wrap without
   covering the board or pushing the page sideways.
5. A qualifying 7/11 roll should show **Consecutive bonus rolls: 1 of 3**.
   A subsequent nonqualifying roll should reset the count to 0.

## Validation

105 automated tests passed. Live desktop and phone Chromium checks verified
opaque financial text during idle fading, the persisted Keep fully visible
setting, waiting labels through turn handoffs, disabled spectator controls,
collapsed desktop controls, long names across seven phone widths (320–850px),
no board overlap or horizontal overflow, and bonus-counter changes during real
rolls. No browser errors were reported. The cumulative ZIP is checked against
source and applied to the original Windows release, preserving embedded artwork
and the HTTPS tool. Browser checks run on Linux Chromium; review on your usual
devices too.
