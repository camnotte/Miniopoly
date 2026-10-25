# Miniopoly v0.3.74 — Moving portals and ember damage

World Collapse now has a maximum of **3 simultaneous portals per world** (9 across
all three worlds), rather than adding permanent voids every wave. The original
ramp remains: 1 per world in the first collapse round, 2 in the second, then 3.
At each complete-round boundary, all current portals close and a different,
host-selected random set opens. The next map is announced for the preceding
full round. Bonus rolls and individual player turns do not move the portals.
Special spaces remain excluded, crossing is safe, and a portal appearing under
a parked player does not eliminate them.

When a property returns, its owner, upgrades and mortgage state remain. Its
ordinary value and rent return. It shows bright burning ember spots in its first
recovered round and dimmer cooling embers in its second. Landing on it causes a
host-drawn bank fee: **$75–$150 first round**, **$25–$60 second round**, then no
ember fee from its third recovered round onward. Another portal visit starts a
fresh cooldown after that portal closes.

Damage messages match the game piece: tires/engine and other vehicle repairs,
shoe damage, or medical/veterinary treatment. All pieces use the same fee ranges.
The fee is locked on landing and survives reloads and host restarts. Normal rent
or a normal purchase decision follows the fee. Passing-GO rewards happen once
before payment, and the fee is separate from normal rent and the Festival fund.
Owners also pay damage fees. Crossings, parked pieces and Gravity Pull passengers
are not charged. Existing cash-raising and bankruptcy options remain.

The old permanent rescued-property ledger is now limited to the current round.
A second landing on the same portal in that round remains fatal; a later returning
portal can use a remaining token. Spent tokens do not refill. The existing
construction-point award formula and last-player-standing victory remain.
Evade tokens do not pay repair/medical fees.

Active old saves are capped immediately when loaded, without reviving eliminated
players or refunding spent tokens. Closed deeds recover, foreclosures remain
bank-held while temporarily blocked, and trades involving an active portal expire
permanently. Trading lists show the fee range on recovered properties. Completed
results and Countdown's permanent consumption rules are retained.

Validation: 270 Node tests total, 267 passed, zero failures and 3 optional HTTPS
skips. New tests cover 1,000 randomly drawn collapse rounds, per-world caps,
property/upgrade restoration, legacy migration and persistence, per-round evade
rules, offer invalidation, fee ranges and two-round cooling, fee-then-rent payment,
GO rewards, purchases, host restart, owner fees, Gravity Pull and bankruptcy.
Actual two-browser Chromium checks cover all three worlds, migration, map sync,
round-boundary relocation, hot/cooling/cleared visuals, piece-specific messages,
fee persistence, real payment followed by rent, trading fee labels, Reduced Motion,
and 18 screen/font combinations from 320–1920px. No page errors or failed assets.

Fully Exit Launcher from the Windows tray, apply the update, relaunch and refresh
all browsers. Confirm v0.3.74. Active saved World Collapse matches receive these
portal/recovery rules; completed results remain historical.
