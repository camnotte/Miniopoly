# Miniopoly v0.3.114 — Swap Favor and rent negotiations

The saved Swap Favor card is now usable, and the rent-payment dialog has a working Negotiate rent action. Both use the Trading Center inbox, with existing unread badges, sound preferences, read/unread controls, withdrawals and history. The helper distinguishes swaps and rent offers from property trades.

## Player swap token

On your turn, open Trading Center → Swap Favor, or Turn Actions → Perks → Offer position swap. Choose a player at a different location. The recipient receives an offer and can accept or decline.

Acceptance exchanges both players’ neighborhood and square, consuming exactly one of the sender’s saved Swap Favor tokens. Deeds, cash, turn and bonus rolls remain with their players. Swapping triggers no GO reward, rent, card or other landing effect. The next roll starts at the new location.

Neither player may be in Setback. Resolve the current landing or payment first; active World Collapse void destinations are blocked. Offers expire when the turn, roll or either location changes. Declining, withdrawing or expiration never spends a token. Existing saved Swap Favor cards work after upgrading.

## Negotiations

When owing rent, choose Negotiate rent and propose a whole-dollar payment from $0 to the bill’s current amount. The property owner can accept, decline or counter; the debtor can also accept, decline or counter a returned offer. Counteroffers cannot raise the bill above the current original amount.

Agreement updates the payment due. **Close Trading Center and choose Pay on the bill to finish.** Negotiating and accepting do not themselves transfer cash. Paid rent retains the 90% owner / 10% Community Festival split and existing whole-dollar rounding. A zero-dollar agreement waives this bill with the owner’s consent. Bank fees, taxes and Setback payments cannot be negotiated.

Until agreement, the current bill remains due. The debtor can still pay it, sell assets or declare bankruptcy; this expires any outstanding rent offer. Offers survive restart while the same bill or swap context remains valid. Only the two involved players receive proposal terms in their inbox. Accepted agreements are recorded in match activity.

Existing matches continue. All current server-hosted game modes support these features in both local Wi-Fi and private online play. The standalone High Ground prototype is separate.

## Validation

382 automated tests passed; three optional HTTPS checks were skipped. Checks cover consent, authorization, privacy, counteroffers, restart persistence, zero-dollar agreements, stale requests and duplicate submissions. Real host/guest browser checks verify swap positions on both board renderers, token consumption, recipient badges, rent counteroffers, guest payment, the 90/10 split and a 390px phone layout. The asset-sale/payment browser regression also passes at four sizes.
