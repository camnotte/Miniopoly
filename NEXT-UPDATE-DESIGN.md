# Miniopoly — Review of the next gameplay features

These are design proposals for review, rather than features shipped in v0.3.27.
The recovery controls and Building Permit fix are documented in UPDATE-v0.3.27.md.

## Activity notices and time limits

Show one compact status strip at the top of the game, visible to opponents even
above transaction dialogs (the turn panel currently hides behind those dialogs):
“Dell PC is reviewing properties,” “Choosing an upgrade,” or “Preparing a trade.”
Use existing match history for completed actions such as purchases, upgrades and
accepted trades. Browsing notices should not flood that history or open popups.

- Publish activity on opening/changing a relevant view and clear it on closing.
- Refresh a visible activity every five seconds; expire it after 15 seconds
  without a refresh, on disconnect, or when the turn changes. This is a status
  expiry, separate from a player's turn allowance.
- Browsing is optional and does not stop opponents from reading their own
  portfolio. Show only broad activity, not private card selections or draft offers.
- For turn pacing, start with an optional 90-second advisory turn timer and a
  warning at 30 seconds remaining. The host can pause or extend it. Pause for
  playback and connection interruptions. Banking and debt decisions remain
  deliberate player choices; a hard timer needs explicit default-action rules.
- A sent trade offer has its own 60-second response deadline. Server time is
  authoritative; expired offers cannot be accepted from a stale browser.

## Trading: a useful first version

Open **Trade** from the left action rail or Turn Actions. Choose an opponent,
then see two columns: **You offer** and **You receive**. Select cash and deeds,
with each deed showing its world, set color and ownership. Show “Completes your
Blue set” / “Completes Dell PC's Pink set” where applicable.

The recipient gets a small offer notification and can **Accept**, **Decline** or
**Counter**. A counter is a new offer requiring the other player's acceptance.
Both sides see the exact cash and deed transfer before confirming.

Recommended first-version rules:

- One pending offer per room, initiated by the current player before rolling or
  after settling a landing. Resolve/cancel it before rolling or ending the turn.
- Begin with cash and unmortgaged, unimproved deeds across all worlds. Sell
  upgrades before trading an improved deed. Add held-card trading once their
  rules and values are agreed.
- Offers expire after 60 seconds; cancelling or countering invalidates the old
  acceptance button. Disconnects, bankruptcy and match changes invalidate them.
- The host validates funds, ownership, eligibility and offer identity again at
  acceptance. All transfers happen together, once, or nothing transfers.
- Completed trades appear in match history and update both portfolios together.
  Rent forgiveness, promises of future payment and debt negotiation are separate
  rules for a later version.

## Ownership: preserve the property illustration

| Direction | Appearance | Best use |
| --- | --- | --- |
| **Yard flags — recommended** | A small flag on a short post, in the owner's color with initials; owner name in a narrow footer | Board tiles and small screens |
| Deed seals | A small embossed deed seal in a corner, with owner initials and a light matching frame | A more collectible property-card style |
| Collection ribbons | A narrow owner ribbon below the picture; a linked-corner marker when a set is complete | Portfolio cards and set planning |

The recommended combination is yard flags on the board and collection ribbons
in the portfolio. Keep artwork unobscured. A newly purchased flag can unfold
once, with a still version for Reduced Motion. Use initials plus color, and show
the full owner name on tap/focus. Keep upgrade stars separate from ownership.

Unowned properties get a small **Available** footer. A mortgaged property keeps
its owner flag with a lock marker. A completed set can add a small linked-set
symbol. Avoid relying on color alone or covering the picture with a large badge.
This would replace the current board ownership labels and the large portfolio
picture badges only after reviewing an ownership mockup.

## Ranking and an understandable net worth

The current host calculates:

**Net worth = cash + original price of unmortgaged deeds + 50% of each upgrade's listed cost**, rounded to a whole dollar.

Mortgaged deeds currently contribute no deed-price value; upgrades still use
their half-cost value. Held cards have no net-worth value. Debt is reflected
when paid. Paid upgrades therefore reduce current net worth by half their cost.
The live panel currently shares a rank whenever net worth is equal.

Deed count and upgrade count are useful comparisons, but they are not dollar
amounts. Cash, deeds and upgrades already contribute to net worth; adding all
four totals together would count assets twice.

Recommended ranking order for a revised version:

1. Highest net worth.
2. If tied, highest cash.
3. If still tied, most deeds.
4. If still tied, most total upgrade levels/stars.
5. If all four match, share the same rank.

This would change the current net-worth-only tie rule. It does not change the
gameplay turn sequence.

For asset valuation, review **full listed deed value + full listed upgrade
value** as an alternative to the current half-value upgrade rule. Keep this
separate from liquidation proceeds, which remain their bank sale prices. Show
mortgage deductions explicitly if the valuation changes to deed equity.

Cards need an explicit, published dollar value before including them. A Building
Permit and an Escape card have different effects, so a single arbitrary value
for every card would distort the standings. The first breakdown can list held
cards separately at $0; an agreed valuation table can be added with card trading
and/or bank redemption rules. Inactive cards should contribute $0.

Make the **Net worth badge clickable**. The receipt should show each component,
each deed's world, current upgrade stars, mortgage effects and any counted card
values. Include the exact total and the ranking rule. An example display:

| Component | Example |
| --- | ---: |
| Cash | $1,500 |
| Unmortgaged deed prices | $400 |
| Upgrade value under the current half-cost rule | $100 |
| Held cards, currently unvalued | $0 |
| **Net worth** | **$2,000** |

Agree on the formula and card table before changing live scores. Record the
formula version on each match so older Hall of Fame results retain their meaning.

## Suggested delivery order

1. v0.3.27 recovery controls and the Building Permit fix.
2. Current-formula net-worth breakdown plus lightweight activity notices.
3. Review the three ownership styles in a board/portfolio mockup.
4. Cash/deed trading with mutual approval and expiry.
5. Apply the agreed scoring/tie rules and card valuation to new matches.
