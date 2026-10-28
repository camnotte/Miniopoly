# Miniopoly v0.3.82 — Unread trades, Tsunami costs and upgrade overview

Incoming pending trade offers have **Read / Unread** labels, **Mark as read**,
**Mark as unread** and **Mark all as read**. The Trading Center pulses and briefly
shakes while it has unread offers. Badges count unread offers; already read offers
remain pending and can still be accepted, countered or declined. Opening or
closing Trading Center does not mark offers read. The notification's Mark as read
button can acknowledge its offers directly. Read preferences persist per player,
match and browser, survive refresh and sync between tabs of that browser. They
are private preferences and do not change trades or consent. Marking unread does
not replay a new-offer sound. Reduced Motion uses a static gold highlight.

Paid upgrades cost **twice the standard price throughout Tsunami mode**, during
building and waves. The host validates and charges the price; buttons, permit
comparisons and deed/portfolio details show it. Building Permits remain free,
with the existing no-set exception. Standard and World Collapse costs remain the
same. Bank resale and upgrade value in net worth keep their standard basis; the
Tsunami construction surcharge is spent cash, not additional property value.
Existing Tsunami matches use the new paid price when resumed in this version.

Use any player's **Properties** button (or All Properties in a landing window),
then **Upgraded properties**. It lists upgraded properties from all players,
grouped into all three worlds, with owner, level, mortgage/rent-paused state and
Tsunami protection status. Changes refresh live. Set progress and the detailed
portfolio remain available.

Round/building/wave progress is larger in the left Game Mode panel, the board
center and above Next Player. Responsive sizes keep it readable on phones.

Rent remains unchanged while the proposal is discussed. See
[Rent options](RENT-BALANCE-PROPOSAL.md).

[Downloads](DOWNLOAD-v0.3.82.md) · [Tsunami rules](TSUNAMI.md)

Validation: 279 automated tests passed, zero failures, three optional HTTPS
skips. New server checks cover insufficient funds without mutation, doubled
prices in building and waves, unchanged permit/resale behavior and normal
Standard pricing. Actual two-player browser checks covered recipient-only
attention, explicit read/unread/all-read controls, unresolved read offers,
refresh persistence, cross-tab synchronization, Reduced Motion, all-world
upgrade listings, an actual doubled-price upgrade, matching landing/permit cost
quotes and 24 viewport/font/world round-display cases. No browser errors or
failed assets were observed. Bundled fonts were tested in Chromium; native
Apple Chancery rendering remains platform-dependent.
