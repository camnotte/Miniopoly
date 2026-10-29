# Miniopoly v0.3.92 — Readable cards and a permanent board die

The live 12-sided die now stays **between Community and Chance**. It is clickable
when it is your turn and the game is ready for a roll; other players can watch
but cannot roll on your behalf. The die still uses the host's actual random or
host-testing result and the same tumble animation. A separate **Last roll**
number remains visible after the move and into the next player's turn.

The host stores a small last-roll reference when a turn ends, so the number and
settled die face survive browser reconnects and server restarts. It does not
replay the previous movement, grant another roll or change turn ownership. The
next actual roll replaces it; a fresh match clears it. Older saves with no
available result show a dash until the next roll. During the tumble the numeric
reference shows an ellipsis rather than revealing the result early.

The turn notice is smaller and sits above the floating decks. On phones it uses
a compact player-name strip. The die is no longer inside the popup or standings.
Existing landing/payment dialogs still take priority while an action needs
attention.

Tsunami residential cards now use equal face dimensions for protected and
unprotected properties. Protected cards sit higher in their square, with a
separate water/support area underneath, rather than compressing their face to
make room for stilts. Submerged square boundaries retain their original layout.
The timber supports and one-use protection rules remain in effect.

The three building slots are positioned from each card's actual artwork,
wrapped title and footer bounds. They remain above PRICE/RENT. Titles are fitted
when needed; the layout updates on resize and font changes. Ownership badges
are anchored inside the center border, constrained away from outer property
names and corner squares. Long player names retain their full accessible label
and tooltip while their visible badge can shorten.

The normal game supports these changes for both local Wi-Fi and online
multiplayer. Standard and World Collapse also receive the permanent die,
compact notice, property-marker fitting and ownership-badge placement. Three
Estates and their 20× / 30× / 40× rents remain in effect. No economic, movement,
trading, flood-survival or evade-token rule is changed by this release. The
separate High Ground prototype retains its own interface and rules.

## Install

Fully **Exit Game** from the old launcher, extract the cumulative Update over
your existing **complete normal game folder**, replace files, relaunch and
refresh every player's browser. Confirm **v0.3.92**. Alternatively, extract the
Complete ZIP into a new folder. No npm install, build or pull request is needed.
The Update includes changes since v0.3.59; use a complete installation, not the
small standalone High Ground prototype folder.

## Validation

315 automated tests pass; three optional HTTPS checks are skipped. Regression
coverage includes real host rolls across turns, server restarts, replacement by
the next result and clearing on a fresh match. Two actual browser clients verify
roll permissions, spinning, movement, Estate development and correct rent,
last-roll persistence after both reconnect, twelve viewport/font combinations,
card-marker clearance, equal card-face heights, elevated protected cards,
owner-badge containment, reduced motion and support lifecycle cleanup. No browser
errors or missing assets were reported. Screenshots show the running game.
