# Miniopoly v0.3.116 — Standard mode content cleanup

Standard matches now show their own gameplay information throughout the host and guest interface.

- Property inspection omits the flood-protection banner and mode-specific bonus references for Standard homes, utilities and railroads.
- Property Overview hides In Path of Wave outside Tsunami and restores Set progress if a previous wave-path view was retained.
- The card browser shows cards applicable to the current mode. Wave Shields appear only in Tsunami; tab counts and search results reflect that filter, including after mode changes with a cached catalog.
- Lobby advisor guidance, helper tips, Building Permit valuation notes and developer jump help match the active mode.
- In an active match, the locked Game Mode field contains the current mode. The lobby retains the mode chooser.
- The High Ground prototype link appears with Tsunami setup, rather than Standard setup.

Tsunami retains its Wave Shield cards, wave-path view and protection information. The standalone card-review page remains a general catalog. Utilities, rent, Festival payouts, neighborhood-shift rules and existing match endings are unchanged. Existing saved matches continue.

## Long-match discussion

[Standard Overtime proposal](STANDARD-OVERTIME-DRAFT.md) explains how cash circulation can prolong matches and proposes a warned financial-pressure phase ending through bankruptcy. This is a design proposal; no Overtime setting or new ending rules are implemented in this release.

## Validation

391 automated tests passed, with three optional HTTPS tests skipped. Host and guest browser checks at laptop and phone sizes cover Standard property inspection, Property Overview, every card tab, Game Options, Building Permit details and host-only developer help. Cached card-mode changes are checked in both directions. A Tsunami control verifies its Wave Shield cards, wave-path tab and protection banner remain available. No browser page errors were reported.
