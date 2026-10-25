# World Collapse revision — implemented parts and remaining proposal

As of v0.3.74, the user has authorized and shipped the 3-active-portals-per-world
cap and full-round relocation. The ramp remains 1, then 2, then 3 active portals
per world. Returned properties retain their ownership/upgrades, recover ordinary
value/rent, and have two rounds of ember damage fees ($75–$150, then $25–$60), as
subsequently requested by the user. Repeat evade restrictions apply only within
one round; spent tokens do not refill. Active old saves are migrated to the cap.
See [current rules](EXPRESS-WORLD-COLLAPSE.md).

The fixed half-length ending, highest-surviving-net-worth finale, one guaranteed
evade token, Community Chest token and unchanged value during active portals are
still proposals. Current shipped World Collapse continues until one player remains,
uses construction-point token awards, and temporarily values active-portal deeds
at zero. Countdown and Trading Center remain separately implemented.

The original recommendations below are retained for review; they are not a list
of all currently implemented rules.

## Recommended round sequence

Keep 10/15/20 building rounds, followed by a fixed final phase of ceil(buildingRounds / 2): 5/8/10 additional complete rounds. Everyone gets the same number of normal turns in each full round. Warn before the transition; activate dangerous voids when the final phase starts. Earlier cracks and warning previews can create tension without early eliminations during building.

For a stronger first playtest, use 1 active void per world in final round 1, 2 per world in round 2, then 3 per world from round 3 onward. This respects the requested cap of 3 active voids per board (9 across three worlds). A single new void globally each round is a gentler alternative and may produce very little danger during a five-round ending. The cap should describe simultaneous active voids, not the lifetime number of spaces visited.

Relocate active voids once at each full-round boundary, using one host-selected, persisted map for all devices. No movement while someone is choosing or traveling. Reveal the entire map before the next turn. Exclude special spaces and duplicate destinations. A void appearing underneath a parked piece does not eliminate that player; fatality happens only on a later landing. Crossing a void remains safe.

## Property treatment

Treat moving voids as temporary hazards. Ownership, upgrades and property net worth remain; rent is suspended while that square is blocked and resumes when the void moves away. This gives World Collapse a different identity from Countdown's permanent property consumption and prevents the final score being dominated by random destruction. Freeze survivor scores before the finale animation; the exploding worlds do not erase their portfolios for scoring.

## Evade tokens

Replace the construction-point earning formula with one guaranteed token per active player at the start of the final phase. Add a rare Community Chest token reward. Suggested inventory cap: two held tokens, so a lucky card helps without making a player immune. Evade tokens should be separate from the two-card perk inventory.

The old permanent 'second landing on the same rescued property is fatal' ledger needs changing when voids move. Recommended first test: each eligible landing consumes one available token; revisiting a property after the void has moved away is safe. An old rescue should never make an ordinary property permanently fatal. If duplicate-landing restrictions are retained, tie them to the current void placement/wave rather than the lifetime property ID.

## Ending and ties

If one player remains, they win early. Otherwise, after the final complete survival round, lock cash + owned deed value + existing upgrade value among surviving players and award the highest net worth. Eliminated players cannot win through stored wealth. Equal survivor net worth produces co-champions. Run the earthquake/explosion after locking results, then the championship ceremony. Show an unambiguous '5 survival rounds remaining' counter, rather than a real-time timer that disadvantages slower devices or decision-making.

These defaults need user review because the proposed start timing, global-versus-per-world spawn rate, moving-property valuation and extra-token capacity admit different interpretations.
