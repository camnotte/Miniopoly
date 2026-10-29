# Miniopoly v0.3.90 — Three Estates and flood fortresses

Each residential property can now hold **up to three red Estates**. Build three
green Houses or yellow Chalets, replace them with one Estate, then add a second
and third Estate. The three existing bordered slots show the actual buildings.
The Communities uses Chalets; the other worlds use Houses.

| Development | Rent multiplier | Copper Lane rent |
| --- | --- | --- |
| Undeveloped | 1× | $6 |
| 1 House / Chalet | 2× | $12 |
| 2 Houses / Chalets | 3× | $18 |
| 3 Houses / Chalets | 4× | $24 |
| 1 Estate | 20× | $120 |
| 2 Estates | 30× | $180 |
| 3 Estates | 40× | $240 |

The new Estate multipliers apply to **all residential properties in Standard,
World Collapse and Tsunami**, over Wi-Fi or online. House and Chalet rents stay
unchanged. Railroads and utilities retain their existing rent rules. Mortgages,
Setback rent suspension, submerged properties and active void portals still
suppress rent. The optional World Collapse Final Showdown +50% bonus remains
separate and applies only when enabled and the collapse has begun.

Paid development still needs a complete unmortgaged color set. Conversion and
each additional Estate cost one normal construction step; Tsunami retains its
2× paid construction costs. A Building Permit grants one free step, including
an additional Estate, without requiring a full set. Three Estates is the maximum.
Bank refunds and net worth use the actual funded construction steps. Selling
one Estate from three leaves two; from two leaves one; selling the last Estate
returns the property to three Houses or Chalets.

Tsunami protection now appears as a **Flood Fortress**: a broad gold perimeter,
four raised corner towers with turquoise lanterns, a large protection crest and
a visible PROTECTED banner. Its center remains open for the property image.
Construction slots, prices, rent and game pieces stay readable. It appears only
on properties with usable flood protection. The fortress breaks when its one
protection is spent, and does not return after rebuilding or trading. A first
wave hit removes one development stage: three Estates become two, two become
one, and one Estate becomes three Houses/Chalets. The next hit submerges the
property. Extra Estates do not grant extra flood saves.

Saved games from v0.3.89 keep their levels, owners, cash, construction value and
refund ledger. Earlier saved developments retain the previous migration to
Houses/Chalets and one Estate. Existing Estates receive the new rent for future
landings. Pending trades expire on the rules upgrade so both parties can review
new terms. Already-quoted payments and completed results are not recalculated.

The main board, property cards, portfolio, development controls, Building
Permit comparisons and advisor all support the three-Estate progression. Board
rent footers and inspection cards now handle the second and third Estate rather
than capping the displayed rent at one Estate.

Install into the **complete normal game folder**, not a standalone High Ground
prototype folder. Fully Exit Game from the old launcher, extract the cumulative
Update over the complete game folder, replace files, relaunch, and refresh every
player browser. Confirm **v0.3.90**. No npm install or build is needed. The
separate High Ground prototype keeps its own refuge-height rules.

## Estate rents across all three worlds

These are standard rents before the optional World Collapse bonus.

| Property | 1 Estate | 2 Estates | 3 Estates |
| --- | ---: | ---: | ---: |
| Copper Lane | $120 | $180 | $240 |
| Richmond Place | $200 | $300 | $400 |
| Cherokee Village | $280 | $420 | $560 |
| Sterling Creek | $360 | $540 | $720 |
| Turtle Landing | $440 | $660 | $880 |
| Buckhead | $520 | $780 | $1040 |
| Richmond Hill Plantation | $600 | $900 | $1200 |
| Ford Plantation | $700 | $1050 | $1400 |
| Richmond Heights | $160 | $240 | $320 |
| Creekside | $200 | $300 | $400 |
| Buckhead East | $280 | $420 | $560 |
| Heartwood | $360 | $540 | $720 |
| Dunham Marsh | $440 | $660 | $880 |
| Wexford | $520 | $780 | $1040 |
| Magnolia Hill | $600 | $900 | $1200 |
| Watergrass | $240 | $360 | $480 |
| Belfast Oaks | $320 | $480 | $640 |
| Kilkenny Point | $400 | $600 | $800 |
| Cape Hardwicke | $480 | $720 | $960 |
| Waterford Landing | $560 | $840 | $1120 |
| The Bluffs | $640 | $960 | $1280 |
| Waterways | $800 | $1200 | $1600 |

## Validation

Node tests cover all property rent previews, actual multiplayer rent settlement
in all three modes and worlds, paid building, permits, maximum capacity, sales,
save migration and one-use flood damage. Browser checks use two actual clients,
verify board rent and Estate slots on both, build the second and third Estate
through the real controls, and check six viewport widths plus reduced motion.
The advisor/portfolio checks cover twelve viewport/font combinations.
