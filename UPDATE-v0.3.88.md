# Miniopoly v0.3.88 — Advisors in the normal game and named developments

The normal game now includes the avatar advisor. In v0.3.87, the helper existed
only on the separate High Ground prototype page; the normal board still used
stars. This update connects a personal helper to each normal-game viewer and
implements the development names and building illustrations.

## Where to find the changes

After creating or joining a normal game room, look for **your name’s advisor**.
It appears above the player panel on desktop, in the compact game area on
smaller screens, and inside the landing popup when that popup is open. Its
portrait uses your selected avatar or uploaded photo. If Hints is off, a visible
**Show my advisor** button enables it; the minus button minimizes the bubble.
No prototype-only launcher is required for the normal-game helper.

Advice uses your own portfolio, cash, Building Permits, complete sets, turn and
Tsunami forecast. It flags threatened properties and spent protection, offers
relevant review buttons, and waits for piece movement to finish. It never buys,
develops, accepts a trade or spends a permit without your explicit action.

Stars have been replaced with distinct building illustrations and the names:
**Houses → Chalets → Condos → Estates**. These appear on owned board squares,
landing details, the development controls and rent table, Building Permit
comparisons, the live portfolio and Trading Center. New server activity and
Building Permit receipts use the development names. Neighborhood names remain.
Existing saves retain their numeric internal levels; costs, rent multipliers,
full-set requirements, free permit exceptions and one-use seawalls are unchanged.
The previously discussed three-for-one Standard construction system is not
introduced by this presentation update.

The separate High Ground prototype uses the same building names and artwork:
height 1 Houses, 2 Chalets, 3–4 Condos, 5–6 Estates. Its height/support rules and
existing avatar helper remain. Both the full-game Update ZIP and a refreshed
small standalone prototype are available, with clear separate instructions.

[Downloads](DOWNLOAD-v0.3.88.md)

Validation: 307 Node tests passed, zero failures, three optional HTTPS skips.
Five new checks cover named development artwork and personal advisor decisions,
including complete sets, funds, turn limitations, incoming offers and spent
seawalls. A normal server with two live browsers verified separate avatar
advisors, enabling Hints, the development guide, a real free permit to Chalets
with unchanged cash, a nonzero board illustration, portfolio labels and twelve
viewport/font combinations (320–1530px, Nunito/American Captain). Reduced Motion
and minimizing work without browser errors. High Ground's two-client checks,
fourteen layouts and complete five-wave bot game passed. The existing Tsunami
water regression passed two live clients and sixteen property layouts. The
original font, stomp, ship bell and pinned Caddy bytes remain in full packages.
