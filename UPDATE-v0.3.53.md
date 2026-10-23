# v0.3.53 — Clearer, compact landing popups

All seven approved recommendations are implemented:

1. A prominent named waiting badge replaces the repeated current-player row.
2. World and labeled set-color badges appear beneath the property title.
3. Purchase price and base rent appear side by side in readable badges.
4. Original upgrade stars now have a Level 0 / Unimproved (or current level)
   label. Expand Upgrade costs & rents for all four levels, normal step costs,
   full-set/Building Permit rules, and paused rent notes when applicable.
5. A separate cash badge names the player resolving the landing, consistently
   on every screen. Your personal balance remains in Players & Standings.
6. My Properties and All Properties are real buttons. Technical footer text
   is removed; Game Options and Restore live board remain in Game Menu.
7. Waiting opponents may minimize the popup to a persistent View landing notice.
   Reopen with a click; Escape also minimizes while focus is in the waiting
   popup. Chat and payment/card phase updates keep it minimized for that roll.
   A new roll/turn/room/rematch clears it. The active player's required decision
   cannot be minimized. The minimized notice never submits a game action.

The popup is shorter, uses Nunito and retains original property/special-place
art and animations. Phone controls leave room for the chat launcher. Upgrade
comparisons are read-only; buying, passing, paying, Setback and upgrade rules
are unchanged. Financial changes and landing reveals still wait for arrival.

## Install

The cumulative Update ZIP supports installed v0.3.46 through v0.3.52 games.
Stop hosting, extract into your existing game folder and replace matching files.
Restart Start-Miniopoly.bat and refresh every player's browser. Confirm v0.3.53
beside Room. Keep your current address, saved seats and browser data.

## Verification

177 automated tests passed. Desktop and phone browser checks exercised the
new Ford Plantation layout, real upgrade rents, both property browsing buttons,
minimize/reopen/Escape, phase/chat persistence, active-player protection,
turn changes and refresh. Transaction checks verified named active-player cash
through purchases, rent, Community/Chance, tax, railroads/utilities, paid escapes,
Gravity Pull, GO/bonus rolls and old movement holds on both clients.
