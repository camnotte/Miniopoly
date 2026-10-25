# Miniopoly v0.3.70 — Game Menu redesign

The approved menu mockup is implemented: six compact categories, left-opening desktop flyouts, inline phone expansion, and checked/empty boxes for Sound and Hints. Existing actions remain connected. Rule topics and saved perks expand within submenus. Long rules, match status, invitations, recovery tools and host controls no longer fill the main menu.

Preferences reuse the current browser settings. Changing Sound/Hints/Volume/Font keeps the menu open. Desktop quick actions remain functional through the same underlying controls, with live counts/availability. Chat does not cover the open menu. Results remain accessible after a match; host permissions and destructive-action confirmations remain. Keyboard disclosure navigation and visible focus return are included.

See GAME-MENU.md for where to find each option. Countdown and multiplayer trading from v0.3.69 are retained; World Collapse gameplay is unchanged.

Validation: the full Node suite passed 256 tests total (253 passed, zero failures, three optional HTTPS skips). Actual two-browser Chromium checks covered host/guest controls, six-category navigation, one category at a time, left flyout placement, inline phone/short-screen expansion, Sound/Hints visual state and persistence after refresh, volume/font preferences, nested Escape and arrow navigation, properties/trading/match options, desktop quick actions, and reopening finished Results. Fourteen layout/font cases covered widths 320, 390, 600, 850, 851, 1024 and 1440 with Nunito/American Captain; no horizontal menu/page overflow, no page errors or failed assets. Server snapshots confirmed menu actions do not change player money, board positions or ownership. Native Windows/Mac menu rendering remains a user platform check.

Stop hosting and fully Exit Launcher from the Windows tray before updating. Apply the update, relaunch from the updated folder, refresh all browsers and confirm v0.3.70. Existing rooms and seats can resume; no new match is required for the menu.
