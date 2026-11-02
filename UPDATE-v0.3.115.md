# Miniopoly v0.3.115 — utility upgrades and visible rent rolls

Ogeechee Water and Coastal Power can now be improved independently. A complete set is not required. Choose Turn Actions → Develop property, then the utility’s Improve button.

| Stage | One rent-collecting utility | Both utilities | Standard step cost |
| --- | --- | --- | --- |
| No improvements | 4× die | 10× die | — |
| Service Upgrade | 6× die | 15× die | $100 |
| Reinforced Network | 8× die | 20× die | $100 |
| Regional Hub | 12× die | 30× die | $100 |

The landed utility’s own stage determines the rate. Tsunami doubles each paid step to $200. Building Permits can provide one free step. Utilities cap at three improvements and show three infrastructure slots on the board. Inspection and development tables show utility rates, stage names and costs. Permit rent comparisons explicitly use an estimated 6.5 die roll; actual bills always use the real roll.

Utility improvements can be sold for $50 each and contribute $50 each to net worth, following the existing half-standard-cost valuation rule. In Tsunami, an improved utility has the same built-in protection as other improvements: the first hit consumes one stage and permanently spends its built-in shield. More development does not renew it. Wave Shield cards remain separate.

## Rent calculation

Both players see a prominent recorded die result and the multiplication on the rent bill. For example, a Regional Hub with both utilities and a roll of 5 shows **5 × 30 = $150**. It uses the landing roll; no second roll is required. The host records the roll, rate and stage with the bill. Refreshing, restarting or negotiating does not reroll it. Disaster bonuses and negotiated reductions appear separately from the base calculation.

Rent keeps the 90% owner / 10% Community Festival split. Bank fees, residential development and railroad rules are unchanged. Existing utility levels remain zero until developed; existing matches continue. Older saved bills show their matching recorded landing when available, without inventing a missing roll.

## Validation

388 automated tests passed, with three optional HTTPS checks skipped. Utility checks cover all 12 roll values, one/two-utility rates, ownership, cash, mortgages, caps, permits, resale, valuation, saved bills, rent negotiations and Tsunami protection. Host/guest browser checks verify both upgrade controls, both clients seeing the same roll, refresh persistence, a phone layout and payment of the 90/10 split. Swap and rent-negotiation browser regressions also pass.
