# v0.3.54 — Community Festival and the shared tax fund

Community Festival replaces Community Bonus in the top-right corner of
The Communities. The other boards' spaces and all properties stay in place.

- Paying Town Tax contributes $100; paying Storm Fund contributes $125.
  Only completed tax payments count. Rent, other card/bank fees, escape payments
  and unpaid debts do not contribute.
- One fund is shared across every world and shown inside the board.
- Landing on Community Festival pays 60% to the visitor. Other nonbankrupt
  players divide the remaining 40%, including players in Setback or other worlds.
- Payouts use whole dollars. The visitor's share is rounded down; remaining
  dollars are distributed in turn order after the visitor. Every dollar is paid.
- The fund resets to $0. An empty fund pays nothing. Gravity Pull triggers one
  festival for the roller; pulled players receive their ordinary shared portion.
- A synchronized celebration shows each player's portrait, name and payout.
  The visitor acknowledges it before normal Turn Actions. Refreshing, chat,
  minimizing or acknowledging never pays twice. Reduced Motion keeps the result
  while skipping the celebration effects.

For a $300 fund, the visitor gets $180. The other $120 goes to the one opponent,
$60 each with two opponents, or $40 each with three opponents.

The former Bonus deck's unique rewards and perks are available through Community
Chest, including Volunteer Crew, Helping Hand and Tow Voucher. Existing Chest
cards keep their identities; duplicate Escape is omitted. The card review now
lists five decks and 47 cards. Existing saved perks and a card already waiting
for acknowledgment are preserved.

## Install

The cumulative Update ZIP supports installed v0.3.46 through v0.3.53 games.
Stop hosting. Extract into your existing game folder and replace matching files.
Restart Start-Miniopoly.bat (Local or Online) and refresh every player's browser.
Confirm v0.3.54 beside Room. The local start-windows.bat fix is included too.
Use one hosting mode at a time; stop the old host before starting localhost.

Existing matches resume with an empty fund; earlier tax payments are not
backfilled. No game reset is required. Keep the current address/browser data,
room/seat saves, online password, certificates and router configuration.

For a complete installation, use the full Windows ZIP or extract all four
numbered complete ZIPs into one folder. Node.js LTS remains required.

## Test it

1. Start or resume a match with at least two players.
2. Land on Town Tax or Storm Fund and pay. Watch the shared Festival fund grow.
3. Visit The Communities and land on its top-right Festival corner.
4. Check each named payout, the visitor's 60%, the other players' combined 40%,
   and the fund returning to $0. Visiting an empty fund gives no payout.

The standalone board HTML remains an artwork/rules review; play using the
hosted game launched by the batch files to use the authoritative shared fund.

## Verification

190 automated tests passed, including local/online hosting, HTTPS/live updates,
all 2/3/4-player payout combinations, whole-dollar conservation, tax payment
funding, old-save migration, pending bonus preservation, perk draws, restart and
one-time payouts, empty funds and Gravity Pull. Desktop/phone browser checks
verify original artwork, the fund counter, arrival holds, portrait payouts,
minimize/acknowledgment/reconnect, rounding, Reduced Motion and the updated guide.
