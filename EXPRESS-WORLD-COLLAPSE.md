Countdown is now a separate Express mode in v0.3.69: see [Countdown rules](COUNTDOWN.md).
The proposed moving-void World Collapse revision is [under review](WORLD-COLLAPSE-REVISION-PROPOSAL.md);
the World Collapse rules below remain the shipped behavior.

# Express · World Collapse — current rules (v0.3.67)

Express is a separate game mode. Choose **Create room → Game Options → Game mode → Express · World Collapse**. It is also available in Host Game Setup and the launcher's new-room dialog. Existing saved matches remain Classic.

## Building phase

- [x] Select 10, 15 or 20 building rounds. These determine when collapse starts, not when the match ends.
- [x] Every player receives two random, distinct homes and a Building Permit at the start. Each starter pair is worth exactly $400, with different colors; normal starting cash is untouched. Starter homes may be in different worlds.
- [x] A permit provides the existing free upgrade without needing its whole set (maximum Level 3; no mortgages).
- [x] Award a second permit after half the building rounds have completed: start of round 6, 9 or 11 for 10, 15 or 20 rounds respectively. This guaranteed award may exceed the usual two-card inventory limit; it is never silently replaced by cash.
- [x] Passing GO, including landing exactly on GO after a lap, gives the existing $200 and one random available home. Exclude bank-held foreclosures, owned homes and lost homes. If none remain, pay only normal GO cash.
- [x] Initial placement, card teleports and Gravity Pull passengers do not receive GO property rewards. Paid/free Setback escape movement that actually completes a lap follows the same passing-GO rule.
- [x] Warnings preserve property prices, values and rent throughout the building phase.

| Building rounds | Five-round warning starts | First endangered spaces marked | First collapse |
| --- | --- | --- | --- |
| 10 | Start of round 6 | Start of round 10 | After everyone finishes round 10 |
| 15 | Start of round 11 | Start of round 15 | After everyone finishes round 15 |
| 20 | Start of round 16 | Start of round 20 | After everyone finishes round 20 |

## Evade tokens — new Express matches from v0.3.67

- [x] Every owned deed earns 1 construction point. Homes, railroads and utilities count; bank-held foreclosures do not.
- [x] Each owned home with upgrades earns 1 additional point, regardless of its level.
- [x] At least 3 properties are required. Every 3 points earns 1 token, with a maximum of 3 tokens per player.
- [x] Show the qualifying count live while players acquire, upgrade or sell assets. This is a current-portfolio projection, not a permanent award during building.
- [x] Lock and award tokens immediately before the first collapse wave devalues any deeds. Later losses, acquisitions and upgrades do not change the award.
- [x] Automatically spend one token on the player's first landing on a particular collapsed square. The piece floats above the void, then remains visibly supported until it moves.
- [x] Returning to a previously evaded void is fatal, even with tokens left. Each player tracks their own rescued squares independently.
- [x] A void destination cancels Gravity Pull whether it is evaded or fatal; other players stay put.
- [x] A surviving GO crossing keeps the normal cash/property rewards. These later properties do not earn more locked tokens. Fatal landings still get no GO reward.
- [x] Tokens do not change net worth, rent, deed value or the victory condition. Last player standing wins.
- [x] Show the graphic and count above the board, in player cards and in the active player's purchase/landing panel. Click a badge for the rule, point breakdown and previously evaded voids. Zero-token icons are muted.
- [x] Save earned/remaining tokens, the frozen point breakdown and rescued-square history. Refreshing or restarting cannot replenish a spent token.
- [x] Existing saved Express matches retain their original rules. Start a new Express match to enable evade tokens; restarting a match begins a fresh ledger.

| Portfolio immediately before collapse | Points | Tokens |
| --- | ---: | ---: |
| 1 upgraded property | 2 | 0 |
| 3 properties, no upgrades | 3 | 1 |
| 3 properties, all upgraded | 6 | 2 |
| 6 properties, no upgrades | 6 | 2 |
| 6 properties, 3 upgraded | 9 | 3 |

## Warning and collapse presentation

- [x] Persistent warning text, increasingly strong brief tremors, spreading cracks and short dust effects during the final five building rounds.
- [x] Final-round message: “FINAL BUILDING ROUND — WORLD COLLAPSE APPROACHING.”
- [x] Mark the next wave on all three worlds for one full round. The board label reads **NEXT WAVE**; accessible labels explain the timing.
- [x] Collapse begins only when the final building round has fully completed. The board and turn panel change to **Collapse · Wave 1**.
- [x] Random waves affect all deed types: homes, railroads and utilities. Begin with one deed per world, then two, then three per world per subsequent wave, limited by surviving deeds. GO, Setback, taxes and card spaces remain intact.
- [x] Show voids inside the original square outlines. Mark them **VOID · FATAL**, with the evade-token rule visible above the board. The next endangered wave is announced immediately and collapses after another full round.
- [x] Bonus rolls are part of the same turn and do not advance the wave.
- [x] Reduced Motion keeps readable warnings and still voids while suppressing tremors, dust, rotation and movement effects.

## Survival and economy

- [x] Landing on a collapsed deed uses an eligible evade token, or eliminates the roller if there is no protection. Revisiting a previously evaded void is always fatal. Moving across a void is safe.
- [x] A player already on a space when it collapses survives until they next land on a void. There is no automatic elimination at the round boundary.
- [x] Resolve a void destination before Gravity Pull; cancel the pull on both protected and fatal void landings. No GO reward is paid for a fatal landing.
- [x] Lost deeds remain visible as **LOST**, count as $0 including upgrades, collect no rent and cannot be sold, upgraded, forfeited or purchased. Lost foreclosures leave the market. Lost railroads/utilities do not increase surviving rent multipliers.
- [x] On collapse elimination, return that player's surviving deeds to the bank, retain lost-deed history and their final cash, and clear held cards. No assets transfer to another player.
- [x] Optional **Final Showdown** increases rent by 50% once collapse starts, rounded up to whole dollars. Default is normal rent for initial testing. The choice locks at match start and is shown to everyone.
- [x] Continue until one player remains, then show the championship. Express places follow survival order, including bankruptcy eliminations; higher eliminated-player wealth never defeats a survivor.
- [x] Express completed-match standings are separate from Classic, with separate filters for world shift, building length, starting cash and Final Showdown. Classic Legendary tables are unchanged.
- [x] Save the mode, dealt properties, permits, warning queue, lost spaces, wave and elimination order. Reconnecting or restarting the host does not redraw or replay awards.
- [x] Mode, building rounds and Final Showdown lock when play starts. The existing host world-shift control remains available. No round-limit extension is offered for Express.

## Validation and further playtesting

Automated host tests cover all building lengths, balanced deals for 2–4 seats, permits, GO rewards, fatal and safe crossings, Gravity Pull, wave persistence, bonus rolls, Setback, scoring and complete matches in both shift modes. Chromium checks cover setup, two viewers, phone layout, warnings/voids, lost portfolios, Reduced Motion and a real final fatal roll before awards.

- [ ] Human playtest: time to first upgrade and completed set.
- [ ] Human playtest: one/two/three-deed wave pacing and total match duration.
- [ ] Compare normal collapse rent against optional +50% Final Showdown.
- [ ] Native Windows and Mac browser visual confirmation.

These are the initial balance values. Trading and movement-choice cards that were already inactive remain future features; collapse does not make them active.
