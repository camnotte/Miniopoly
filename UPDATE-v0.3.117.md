# Miniopoly v0.3.117 — Neighborhood Service Bot

Standard mode now has the approved teal-and-gold cleanup robot. Tours begin at the start of rounds **5, 10, 15, ...**, following Richmond Hill → The Communities → Coastal Georgia. The bot starts at GO, travels to its next scheduled stop after each completed player turn, completes a full lap and reaches GO before teleporting to the next neighborhood. After the third lap, the tour ends. Tours do not overlap. Bonus rolls belong to the same player turn and do not advance the bot independently.

At each neighborhood entry, the bot selects up to two owned, unmortgaged properties at random and visits them in board order. Every eligible property, including those near GO, has a chance of selection. It then travels back to GO. The bot inspects those selected properties when it stops. Passing over a property has no effect. Unowned and special spaces are unaffected. Properties, utilities and railroads are eligible. The bot travels while play continues; inspections do not replace the active player's landing or pause turns.

## Owner choices

- **Maintain:** pay the quoted service fee and keep normal rent.
- **Renovate:** pay twice that fee for +25% rent for the remainder of the current round and two full following rounds. The inspection shows the expiry round.
- **Close temporarily:** pay nothing; no rent for the remainder of this round and one full following round. The inspection shows the reopening round.

Maintenance costs are rounded to $5, with a $30 minimum and $100 cap: 10% of original deed price plus $5 per improvement stage. Service payments leave the game and do not enter the Community Festival. Renovation does not add building stages or permanent deed value. Fractional final rent rounds upward to whole dollars. Paid rent retains the 90% owner / 10% Festival split.

Owners can respond off-turn. The bot button under Game Mode highlights waiting inspections, and an important helper message offers a shortcut. A visible route/status dialog lets players view the bot's current neighborhood. Closed and renovated properties have board labels and inspection details.

Respond before the indicated round starts. An unanswered inspection automatically closes the property for that next full round, without charging cash. Selling, trading, mortgaging or losing the property before responding expires the request. Paying for service reserves cash already owed on the active player's current bill. Existing rent bills remain payable at their original recorded amount; closures and bonuses affect future landings. Trading Center lists service effects; a changed closure or renovation status expires stale property offers. Choices and tours persist across restart, and repeated submissions cannot charge twice.

Existing Standard games receive the bot at their next scheduled five-round boundary. Existing round limits and bankruptcy endings remain in effect: when a match ends, an unfinished tour stops and unresolved inspections expire. Tsunami and World Collapse retain their own events. Overtime remains a separate, unimplemented proposal.

## Validation

399 automated tests passed, with three optional HTTPS tests skipped. Dedicated tests cover scheduling, all three complete laps, no overlapping tours, consent/ownership checks, cash reservations, single charges, permanent service expenses, deadlines, effect expiry, transferred properties, restart persistence, closed landings and renovation's 90/10 rent split. Host and guest browser checks verify personal inspection choices, a phone layout with the free closure button visible, the actual sprite, animated movement, teleport viewing and property labels without covering owner avatars. Standard/Tsunami content browser regressions also pass.
