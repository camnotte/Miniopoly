# Miniopoly v0.3.67 — Evade tokens

New Express / World Collapse matches reward property acquisition and upgrades with limited protection. The graphic is a mint shield, a gold arrow leaping over a purple void, and a gold token rim.

## Earn and use

- Each owned deed earns 1 construction point. Homes, railroads and utilities count.
- Each owned home with upgrades adds 1 bonus point, regardless of upgrade level.
- At least 3 properties are required. Every 3 points qualifies for 1 token, capped at 3 tokens.
- The count shown during building follows the current portfolio. Selling a property or its last upgrade can lower the qualifying count before collapse.
- Tokens lock immediately before the first collapse wave, including properties about to disappear. Subsequent losses, acquisitions and upgrades do not change the award.
- On an eligible void landing, the host automatically spends one token and the piece floats safely above the void. A mint support ring remains while it stands there.
- Returning to the same previously evaded void is fatal, even with tokens left. Rescued squares are tracked separately per player.
- A void destination cancels Gravity Pull even when the roller survives with a token. The other players stay where they were.
- Surviving a GO crossing keeps normal cash/property rewards. Those later properties do not award more tokens. Legitimate bonus rolls remain available.

Tokens have no cash or net-worth value. Lost deeds still have zero value and no rent. Express remains last-player-standing; Classic is unchanged.

## Visible counters

The graphic and counts appear above the board, including when the phone player list is collapsed, and beside each player's standings. The active player's badge also appears in purchase and landing panels. Click a badge for the point calculation, frozen award, used/remaining tokens and previously evaded properties.

Counts reveal when the moving piece arrives. A quiet visual pulse marks an increased qualifying count. Reduced Motion keeps the graphics and status but suppresses pulsing and floating. Protection is saved by the host; refreshes and restarts cannot replenish it.

## Install

1. Stop hosting and fully **Exit Launcher from the Windows system tray**.
2. Back up the game folder. Extract the cumulative Update ZIP into the folder containing `server.js`, replacing its included files, or extract the Complete ZIP into a new folder. The update supports complete v0.3.59–v0.3.66 installations.
3. Launch from the updated folder, refresh every browser, and confirm **v0.3.67**.
4. Start a **new Express match** for evade tokens. Existing saved Express matches keep their original rules. Their counter area explains this. A stale host process is also identified when it lacks evade support.

No npm install or build is needed; Node.js 18+ is required. The font choices, current pieces and sounds, championship and collapse effects are retained.

## Validation

The full Node suite passed 237 tests, with zero failures and three optional HTTPS checks skipped. Host tests cover point thresholds, distinct upgrade bonuses, the minimum/cap, purchases and sales, locking before devaluation, saved awards, automatic rescue, repeat fatal landings with tokens left, independent player ledgers, Gravity Pull, GO rewards, bonus rolls, reset and legacy saves. Chromium checks cover the graphic, desktop/phone counters and dialogs, an actual rescue with arrival-timed count change, a parked support ring, Reduced Motion, a host restart and a repeated fatal landing. Native Windows/Mac visual confirmation and protection/wave pacing remain human playtests.
