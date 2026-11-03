# Miniopoly v0.3.118 — property condition and priority house calls

Standard properties now age after purchase or cleaning. Two full following rounds pass before the first drop; another tier is lost every three rounds without service.

| Tier | Condition | Rent rate |
| --- | --- | --- |
| 1 | Well maintained | 100% |
| 2 | Showing wear | 90% |
| 3 | Neglected | 75% |
| 4 | Run-down | 50% |

The board fades worn property artwork and labels affected properties. Property details show condition, current rent and the next decline round. Improvements do not reset age; trading preserves it. Houses, Estates, railroad and utility stages remain intact. Condition does not reduce permanent deed value, resale or improvement valuation. Final bills use existing whole-dollar upward rounding. Existing bills retain the condition and amount recorded at landing, even if the property is subsequently cleaned.

Existing properties receive a fresh maintenance clock on upgrade; older purchases are not suddenly treated as neglected. New bank purchases also start a fresh clock. Saved timestamps survive refresh and restart.

## Helper and service

At Tier 3 the helper offers Review house call, View property and Remind next round. Reading dismisses that tier's warning; further deterioration produces a new warning. Snoozing lasts for the current round. Helper mute and minimize preferences remain available. The bot button highlights properties needing cleaning.

Regular Maintain and Renovate now restore 100% condition and reset the clock. Renovate retains the temporary +25% rent bonus. Free closure does not repair condition or stop aging. Recently cleaned properties pass a subsequent inspection while still fully maintained, avoiding duplicate cleaning charges.

## Priority house calls

Use the helper, the bot button under Game Mode, or Arrange cleaning house call in an owned property's details. The quote is **normal maintenance + 10% of permanent property value**, with the surcharge rounded upward to $5 and a $20 surcharge minimum. Permanent value is deed price plus the existing valued-improvement ledger; temporary rent bonuses and condition discounts do not alter it. The full breakdown appears before confirmation.

One shared bot accepts one booking at a time. If free, it visits immediately, restores condition and charges once. If finishing a current inspection, it reserves the quoted cash, completes that inspection and then makes the house call. The regular tour's neighborhood, position and next stop are preserved and resume afterward. If an interruption delays a five-round tour, that scheduled tour queues behind the current work instead of overlapping or disappearing. Service payments leave the game, not the Festival.

A completed special visit creates a global one-full-round cooldown: service in round 8 permits another house call in round 10. Regular tours continue during that cooldown. Other players can choose Notify me when available; the helper delivers one availability notice. Completion and cancellation also have helper messages.

Only the owner can book or cancel. Cancel a waiting booking to release its reservation; no cash has been charged yet. Selling, mortgaging, bankruptcy or another cleaning cancels an invalid waiting request. If a required bill needs the reserved funds, the booking is cancelled and the bill takes priority. A drawn mandatory card fee is protected too. Stale quotes and duplicate requests are rejected. Property-condition changes expire stale trade offers, and trade lists/estimates reflect the current condition.

Tsunami and World Collapse retain their existing condition-free rules. Ordinary rent retains the 90% owner / 10% Festival division. Round limits and Overtime's proposal status are unchanged.

## Validation

412 automated tests passed, with three optional HTTPS checks skipped. Added tests cover every condition boundary, trade/upgrade age preservation, permanent valuation, quoting, global cooldown, ownership, cash reservations, restart persistence, cancellation, bill priority, reminders, saved tour resumption and duplicate-charge protection. Host/guest browser checks verify Tier 3 advice, snoozing, full quote, property-detail refresh to 100%, phone cooldown/reminders, availability notifications and the second player's service. The regular bot-tour browser regression also passes.
