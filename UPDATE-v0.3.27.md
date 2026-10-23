# Miniopoly v0.3.27 — Board recovery and Building Permits

## Install on the Windows host

This cumulative update supports an existing v0.3.14 through v0.3.26 installation.

1. Stop the local server with **Ctrl+C**. For online hosting, choose **Stop hosting**.
2. **Extract All** from **Miniopoly-v0.3.27-Update.zip**. Copy **everything** into
   your **existing Miniopoly game folder**, replacing matching files.
3. Run **start-windows.bat** locally or **Start-Online-Hosting.bat** online.
4. Refresh both devices and confirm **v0.3.27 beside Room**. Resume the same room.

Both launchers are included. Saved games, seats, artwork and hosting settings stay.

## Recovery after Back/Forward or a display problem

- Use **Game Menu → Settings & connection → Restore live board**.
- If a landing/transaction popup covers the menu, use **Restore live board** at
  the bottom of that popup instead.
- Recovery reads the host's current saved state and rebuilds only the board.
  It does not roll, reset the match, pay, change ownership or forget your seat.
  Replacing the embedded document does not add a browser-history entry.
- Returning through the browser's Back/Forward cache also requests recovery.
  A failed host read preserves the existing board and seat and resumes reconnecting.

The exact reported mouse-Back corruption has not been reproduced. Normal
Back/refresh paths restored correctly in Chromium. Recovery was also tested
against an intentionally corrupted world/piece display and restored it correctly.
The user's browser and description will help isolate the original trigger.

## Use the free upgrade card

After drawing a Building Permit, first choose **Continue to Turn Actions**.
Select **Upgrade**, then look for **Use your Building Permit**. Each eligible
property shows its world, current/next level and **Use Building Permit · Free**.
The same choices remain available under **Perks**.

You need an owned, unmortgaged house below Level 3. A complete set is not needed.
Railroads and utilities cannot be upgraded. If nothing qualifies, the screen
explains why and keeps your card. Successful use shows **Building Permit Used**,
the property and its new stars, consumes one card, and charges no cash.

The reproduced issue was the regular Upgrade screen hiding the permit route and
showing only the full-set requirement. The host's free-upgrade rule already worked.

## Larger features for review

See **NEXT-UPDATE-DESIGN.md** for activity notices/timers, trading, three ownership
styles, the current net-worth formula, proposed tie-breakers and card valuation.
Those proposals are not implemented in this bug-fix release. Existing financial
scoring and shared ranks are retained.

## Validation

109 automated tests passed, including bounded read-only recovery, failed reads,
seat-change guards, Back/Forward cache handling, Building Permit eligibility and
successful-use confirmation. Chromium checks covered normal Back/refresh,
repair of a deliberately corrupted world and token position, menu and popup
recovery, unchanged gameplay/history length, free incomplete-set upgrades,
single-card consumption, confirmation stars and 320–1470px layouts. The exact
reported mouse/browser corruption remains unconfirmed. Browser checks run on
Linux Chromium; the cumulative update is applied to the original Windows package
and checked against source, including preserved artwork and the HTTPS tool.
