# Miniopoly v0.3.112 — Make asset selling visible during a payment shortfall

The Sell Upgrades / Property button could appear to do nothing on shorter laptop and phone screens. It selected the sale view, but property artwork and the full payment summary remained above the asset list inside a clipped, scrolling popup. A real guest-client reproduction showed sale controls out of view at 1366×640, 390×700 and 320×700, while the larger desktop view worked.

Selling now opens a focused Sell assets to raise cash view. It hides the preceding artwork and long property/payment details, shows current cash, the amount owed and the remaining shortfall, and places the sale options near the top. Entering the view resets its scroll position and focuses an available action. Buttons wrap on narrow screens, and one outer scrolling region handles longer lists. Back to Payment and Pay remain available in the footer; Pay enables once enough cash has been raised. A player with no available assets sees an explanation instead of an apparently empty or unchanged window. Submerged/void properties are excluded from sale choices consistently with the host rules. The shared layout also applies to the Setback sale entry points.

This is a client presentation/navigation fix shared by online and local multiplayer. Bank buyback amounts, ownership checks, bankruptcy, rent calculations, the current turn and the 90% owner / 10% Festival split are unchanged. Existing saved games and pending payments can continue.

Validation: 372 Node tests passed; three optional HTTPS checks skipped. A two-client browser regression reproduces the former problem, verifies visible compact sale controls at four viewport sizes, keeps the guest's sale view through a live chat refresh, sells one upgrade and one deed exactly once, checks the changing shortfall and Pay eligibility, then pays $120 rent as $108 to the host and $12 to the Festival without changing the turn. It also verifies the no-assets explanation. No browser errors were reported.

Fully Exit Game, install into the complete normal game folder, restart the host and refresh every player. Confirm v0.3.112. No match reset is required.
