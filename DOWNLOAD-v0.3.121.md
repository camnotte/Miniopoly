# Miniopoly v0.3.121

[Update ZIP](https://github.com/camnotte/Miniopoly/blob/codex/economy-review-services-v0.3.121/downloads/v0.3.121/Miniopoly-v0.3.121-Update.zip?raw=true) · [Complete game](https://github.com/camnotte/Miniopoly/blob/codex/economy-review-services-v0.3.121/downloads/v0.3.121/Miniopoly-v0.3.121-Complete.zip?raw=true) · [Full economy review](design/economy-review/README.md)

## Bot operation

Clean Bot #1010 now travels autonomously on the host clock, rather than waiting for someone to end a turn. Scheduled tours still begin every five rounds. Owners approve paid maintenance or renovation; an inspection alone never charges them.

Any active Standard player can request service at any round, including before round five and outside their own turn. Select multiple owned, unmortgaged properties, review the combined quote, then confirm. Other players can add requests too. One bot handles approved visits in order, with no shared round cooldown. Priority work interrupts a scheduled tour and the tour resumes afterward.

Bookings reserve their combined price. The fee is charged once when that visit completes. Waiting visits can be cancelled. Required bills take priority and release enough reservations when needed. Sold, mortgaged or separately cleaned properties invalidate their pending visits. Existing waiting bookings migrate with their locked price; old cooldowns are removed.

Shared speech bubbles report the latest event instead of accumulating a delayed backlog. Existing follow controls, Sound settings and optional voice remain available.

## Complete economy review

See design/economy-review/README.md for all 28 deeds, every development stage, purchase prices, rent, construction, maintenance, net worth, railroads, utilities and mode-specific issues. Open design/economy-review/interactive.html for the offline comparison; CSV/JSON evidence and reproduction scripts are included.

The review includes 24,000 seeded Standard sensitivity-model matches, 600,000 non-eliminating player turns for traffic, and 5,400 production-engine Tsunami exposure trials. The model is not a human playtest or a complete disaster-mode simulation. It found that the earlier broad rent/fee cuts would worsen long-game persistence. Candidate B proposes paired construction/rent/valuation/maintenance changes for review, not a finished financial balance patch.

Financial rules are unchanged in this update: current deed prices, rents, development costs, maintenance quotes, salary, Festival split and score valuation remain in effect. No proposed report figures are silently installed.

## Installation

This is cumulative. Fully Exit Game, extract the Update ZIP into your existing complete game folder and replace files. Restart the host and refresh every player. Confirm v0.3.121. Existing games and seats continue.
