# Miniopoly v0.3.65 — Express · World Collapse

Adds the separate Express mode from the saved discussion: two balanced random starting homes, starting and midpoint Building Permits, GO property rewards, five rounds of warnings, then announced property-collapse waves until one player survives.

Choose **Create room → Game Options → Game mode → Express · World Collapse**, then 10, 15 or 20 building rounds. The optional Final Showdown checkbox adds 50% rent during collapse; it starts off for initial testing. Express results appear under **Hall of Fame → Game mode → Express · World Collapse → Mode standings**. Existing Classic matches and Legendary records stay separate.

The full rule checklist, initial balance choices and outstanding human playtests are in [EXPRESS-WORLD-COLLAPSE.md](EXPRESS-WORLD-COLLAPSE.md). Police car, School bus, font options, large pieces and animated selection previews are retained.

## Install

1. On the Windows host, stop hosting and fully **Exit Launcher from the system tray**. Closing its window alone can leave the old launcher running.
2. Back up the existing game folder. Extract the Update ZIP into the folder containing `server.js`, replacing its included files. The update is cumulative for complete v0.3.59–v0.3.64 installations. Alternatively extract the Complete ZIP into a new folder.
3. Start the launcher from the updated folder. Refresh every connected browser and confirm **v0.3.65**. Mac guests use the host's game link; they need no separate install.
4. Create a new Express room to test the new rules. Existing games remain Classic. Saves and hosting settings remain in their existing locations.

Node.js 18+ is required. No npm install or build is needed.

## Validation

The Node suite passed 222 tests, with zero failures and three optional HTTPS checks skipped. Chromium checks cover both modes, all building lengths, restart persistence and complete matches. The real two-browser collapse check verifies shared waves, fatal movement, cancelled Gravity Pull, continued spectating and a final landing that finishes before the survivor's ceremony. The separate visual check covers 320–1440px setup, phone board, lost portfolio entries, Reduced Motion and separate Express standings. Native Windows/Mac rendering and public HTTPS hosting still require their own platform checks.
