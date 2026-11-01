# Miniopoly v0.3.108 — Player helper access for every player

An active player could see no bottom-left helper when none of the limited original tips applied, especially while waiting, during building rounds or when owning no properties in the wave path. Dismissed tips also had no direct menu shortcut to bring them back. This affected hosts and guests according to their own situation and browser preferences; the helper was never host-only. A screenshot alone cannot establish whether a missing tip was dismissed, muted or temporarily hidden by a dialog.

The helper now provides short personal guidance for building rounds, sheltered portfolios and ordinary waiting turns as well as the existing wave, trade, development, payment and rebuilding advice. Directional exposure uses the same physical path as Property Overview, so newly acquired properties count even before the next stored warning refresh.

Every active player can use Game Menu → Preferences → Show player helper. This closes the menu, turns helper hints on for that browser and reopens its current dismissed tip. It does not reset other read tips or affect another player's settings. The chosen player's own avatar appears in the bubble. Got it/Close dismisses a tip; Mute helper remains available, remembered across reloads. Helpers still hide during dialogs, movement and wave effects, then return if the current tip is unread. No permanent floating launcher is added.

Auction receipts, bids, wave targets, damage, development and scoring are unchanged. Fully Exit Game, replace files in the complete normal game folder, restart the host, refresh every client and confirm v0.3.108. Existing directional matches continue.

Validation: 356 Node tests passed; three optional HTTPS checks skipped. The two-client browser regression verifies guest building guidance, the guest avatar, reopening dismissed/muted hints through the real menu, persistence through reload, independent preferences and helper bounds at 1530/390/320 pixels. Existing wave, auction, receipt, rebuilding and no-replay checks pass. Menu hit targets and sound controls pass 16 desktop/phone and full-board cases. No browser errors were reported.
