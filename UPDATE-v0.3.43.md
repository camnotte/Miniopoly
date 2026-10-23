# v0.3.43 — Your cash in landing popups

Every property, special-place, card and escape popup now has one clearly labeled
**Your cash · [player name]** badge. Its name and balance come together from your
current authenticated player record, independently of the temporary financial
snapshot used during piece movement. Missing player identity never falls back to
the host or active player. Obsolete movement balances are cleared when playback
is idle; actual movement still delays financial presentation until arrival.

When watching another player, the popup identifies the current player and their
payment separately from your cash. Post-landing headings also distinguish
watching from your own turn. No account balances, scoring or room saves change.

## Install

For an installed v0.3.40, v0.3.41 or v0.3.42 game:

1. Stop hosting and extract Miniopoly-v0.3.43-Update.zip into the existing game
   folder. Replace matching files.
2. Run Start-Miniopoly.bat and restart hosting with the existing settings.
3. Refresh BOTH players' browsers. Windows: Ctrl+F5. Mac Safari:
   Command+Option+R. Mac Chrome: Command+Shift+R.
4. Confirm v0.3.43 beside Room on each device and resume the same room/seat.
   No match reset or browser-data clearing is required.

For a fresh/incomplete installation, use the complete Windows ZIP or ALL FOUR
v0343 numbered ZIPs, extracting every part into the same folder. Node.js LTS is
required. The complete package requires no older game ZIP.

## Review

Use different cash balances on the two players. When either player lands on a
property, railroad, utility, Chance, Community Chest or tax space, check that each
device's Your cash badge matches that device's player in Players & Standings.
Repeat after a purchase or payment, a world shift and refreshing the guest page.
The active player's amount due is a separate line, not the viewer's cash.

Automated checks cover authenticated identity selection, unavailable/ambiguous
identity, stale movement balances and two-browser payment/purchase flows. The
reported host-$420 example is included in browser fixtures. Normal fresh-session
checks did not reproduce the original spontaneous mismatch; the update removes
the popup's dependency on the temporary financial projection and guards against
its lingering after movement.
