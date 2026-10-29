# Tsunami: High Ground — prototype 1

Open **High Ground prototype** from the Game Launcher footer or the link in
Create/Join's Game Options. Its direct address is `/high-ground.html` on your
existing game server. This is a separate playable prototype, rather than a
change to the existing Standard, World Collapse or Tsunami rules.

## Try it

For the small standalone download, extract into a new folder and run
**Start-High-Ground.bat** on Windows, or `node scripts/high-ground-server.js`
on Mac/Linux. Node.js 18 or newer is required; the existing game's Node.js is
sufficient. The host opens at `http://localhost:3010`. Friends use the Wi-Fi
address printed in its console. Keep that console open; closing it stops this
prototype only. This standalone package has no online HTTPS hosting launcher.


Choose a name and one of the existing cartoon avatars. **Quick demo** creates a
practice opponent and starts immediately. For people playing together, create
a room, share its invitation/page address and six-character code, and have
friends join. The host starts with 2–4 players. Use the host's LAN address, not
localhost, on another device. Seats can be restored in the same browser.

The default has five building rounds followed by five waves (nine complete
rounds of turns, since wave one follows the fifth building round). Choose ten
building rounds for more preparation. Test controls are visible only to the
host: advance one round or set the next die to 1–6. Skipping turns can cause an
unprepared refuge to fail. Everyone sees a testing marker. Prototype matches
never enter the Hall of Fame or existing match records.

## The experiment

Each player receives three neighborhoods, one in each world, $1,200 and one
Building Permit. Choose one neighborhood as a refuge; its location is then
committed until an evacuation. It begins at height 1 with support strength 2/2.
The same original cartoon avatar becomes that player's animated personal
advisor. Each browser sees advice for its own seat, including affordable
construction, available permits, support damage, upcoming danger, off-turn
limitations, trades and evacuation.

Every turn includes one roll and at most one construction action. Construct
before or after rolling. End your turn explicitly. The wave waits until every
remaining player completes the round. Buying a landed property, selling
supporting properties, or negotiating trades does not consume construction.

- **Raise:** height +1, maximum 6. Cost $200 at height 1, then $100 more for each
  higher starting height. Height must be strictly greater than the water level.
- **Reinforce:** support capacity +1 and current strength +1, maximum 4. Cost $180.
- **Repair:** restore all support strength to current capacity. Cost $100.
- **Building Permit:** pays for any one construction action. It still consumes
  that round's construction action; it is not a second build.

| Wave | Water level | Support impact |
| --- | --- | --- |
| 1 | 1 | 1 |
| 2 | 2 | 1 |
| 3 | 2 | 2 |
| 4 | 3 | 2 |
| 5 | 4 | 3 |

Water reaching the homes or supports reaching zero overwhelms a refuge. Wave
impact damages supports even when homes are above water. A dashed line shows
the forecast water level. The refuge artwork rises as height increases; support
appearance follows strength. Waves and the advisor's idle animation respect
Reduced Motion. The existing personal font preference and Hints setting apply.
The helper can also be minimized and its buttons open the relevant controls;
they do not spend money or submit trades automatically.

One forecast supporting property is submerged each wave when a target exists.
It loses ownership, income and rent and cannot be bought again. Refuges are
excluded from this supporting-property draw; their survival uses height and
strength. If another owned property remains, the first refuge failure offers
one evacuation. Pick the destination explicitly. Salvaged construction loses
one height level, minimum 1; supports restart at 2/2. A second failure eliminates
the player. Players pause for evacuation decisions before the next round. After
the final wave, evacuation destinations still at or below water are eliminated.

## Prototype economy and competition

- Each supporting property pays $60 between rounds; the refuge does not.
- A six-sided die travels across the original three worlds' 16 positions.
  Passing GO gives $100. Non-residential special squares give a $40 supply grant
  in this simplified prototype. Available residential landings can be purchased
  at the game's original prices. Full card/debt/Setback rules are not simulated.
- Rent uses original base rent. A refuge multiplies base rent by its height.
  Transfers are limited to the visitor's available cash; no bankruptcy debt.
- Selling a supporting property to the bank returns 60% of original price.
- Players may offer whole cash amounts for another player's supporting property.
  Only the owner can accept or decline. Funds and ownership are rechecked at
  acceptance. Refuges cannot be traded; evacuation pauses transactions.
  Private offers are visible only to their participants. Practice bots accept
  affordable offers at or above original price and decline lower offers.

Last surviving refuge wins. If several survive wave five, compare height, then
remaining support strength. Cash does not break ties; exact ties share victory.
If everyone is eliminated, compare the latest eliminated players by height and
remaining strength. The final result waits for evacuation decisions.

The housing art now uses Houses at height 1, Chalets at 2, Condos at 3–4 and
Estates at 5–6. Height and support strength still decide survival.

The focused refuge scene, simplified economy, costs and wave schedule are for
playtesting. Production-board integration, full game-piece travel/audio,
Standard's proposed three-for-one developments and the earlier repair/trading
window proposals are separate future work, not silently applied to other modes.

## Running and validation

Use the existing `node server.js`; there are no new runtime dependencies. All
prototype decisions and randomness are authoritative on the host. Prototype
rooms persist in `high-ground-rooms.json` under the server's normal DATA_DIR;
existing `rooms.json` and scores are untouched. The standalone server instead
stores its saves under `~/.miniopoly-wifi/high-ground-prototype` by default. Seat tokens are omitted from
other players' public state. Commands require the current revision to reject
stale/duplicate requests. Host controls are checked on the server.

Run normal Node tests with `node --test --test-concurrency=4 tests/*.test.js`.
The optional `tests/high-ground-browser.cjs` uses Playwright/Chromium specified
by MINIOPOLY_PLAYWRIGHT_PATH and MINIOPOLY_CHROMIUM_PATH; it is not an npm/runtime
dependency. It checks two real clients, avatar-specific advice, permit actions,
private trade acceptance, waves, host authorization, mobile layouts, preferences,
seat restoration, and a complete practice match.
