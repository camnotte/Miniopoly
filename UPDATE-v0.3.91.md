# Miniopoly v0.3.91 — Raised flood protection

Protected Tsunami properties now use the approved **whole property card on four
timber stilts** design. This replaces the gold fortress and large PROTECTED
banner. Each card keeps its own neighborhood artwork, title, colored building
slots, price and current rent. A clear-center transparent support illustration
adds metal-capped timber pilings around the card, a slim foundation beam and
water moving beneath its raised base. The art follows the reviewed Waterford
Landing mockup without substituting that property's picture or prices elsewhere.

The protected card and its supports fit inside the original square's grid area.
Upgrade markers and rent remain readable, moving/parked pieces stay above the
card, and the normal property inspection and development controls remain usable.
The next-wave warning appears in the water gap below a protected card's footer.
Water motion respects reduced-motion settings.

When a tsunami spends protection, the stilts break once, then disappear and the
card returns to its normal size. Reloading or switching worlds does not replay
old damage. Previously spent protection does not return after another upgrade
or trade. Leaving Tsunami removes the decoration. Advisor and property status
wording now describe the raised foundation.

This is a presentation update to the normal game on all three worlds, for both
Wi-Fi and online multiplayer. Flood protection still saves a property once at
the cost of one development stage. More Estates do not grant more flood saves.
The three-Estate progression and 20× / 30× / 40× Estate rents from v0.3.90 remain
in effect. Saved ownership, cash, building value and quotes use the same rules;
this update does not require a new match or a save migration.

The independent High Ground prototype retains its own refuge-height rules.

## Install

1. Fully **Exit Game** from the old launcher (not just the window X).
2. Extract the cumulative Update into your existing **complete normal game**
   folder and replace files, or extract the Complete ZIP into a new folder.
3. Relaunch, refresh every player's browser and confirm **v0.3.91**.

No npm install, build or pull request is needed. The Update is cumulative over
complete v0.3.59–v0.3.90 installations; do not apply it to the small standalone
High Ground prototype folder.

## Verification

314 automated tests pass; three optional HTTPS checks are skipped when their
external TLS fixture is unavailable. Two live browser clients verify movement
above GO, second/third Estate construction and matching rent, raised support
layout in all three worlds, six viewport widths, reduced motion, timed removal
after protection is spent and cleanup when leaving Tsunami. No browser errors
or missing assets were found. Screenshots are captured from the running game.

Waterford Landing's sample screenshot shows one House and $56 rent (2× its $28
base rent). Copper Lane with three Estates shows $240 rent. These screenshots
use the live game values rather than the static mockup's undeveloped rent.
