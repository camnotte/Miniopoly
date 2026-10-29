# Miniopoly v0.3.93 — Game Menu above the board

The Game Menu and its desktop flyout submenus now open above the live board,
permanent die, turn notice and floating player panel. This also works with the
Tsunami ocean background and in Full Board View.

The ocean page and blurred header created nested rendering layers. Raising the
dropdown alone could not place it above the floating panel attached outside the
page. The header now has an explicit layer, and opening the menu temporarily
raises its page shell above the floating player panel. Closing the menu restores
the normal page layer. Existing dialogs keep their higher layer.

The Game Menu stylesheet now has a versioned URL so updating and refreshing
loads the fixed CSS. Menu actions, game rules, saved matches, rent and the
permanent last-roll reference are otherwise unchanged. This updates the normal
game for local Wi-Fi and online multiplayer.

## Install

Fully **Exit Game** from the old launcher. Extract the cumulative Update over
your **complete normal game folder**, replace files, relaunch and refresh every
player browser. Confirm **v0.3.93**. Alternatively extract the Complete ZIP into a
new folder. No npm install, build or pull request is needed. Do not apply the
Update to the small standalone High Ground prototype folder.

## Verification

The covered menu was reproduced in a live Tsunami match before the fix: the
Results, Preferences and Room menu hit targets were intercepted by the floating
player panel. After the fix, browser hit tests and real Sound-toggle clicks
passed at widths 1530, 850, 390 and 320, each in normal and Full Board View.
Sixteen menu/submenu checks passed with no browser errors. The automated suite
also passed 315 tests, with three optional HTTPS checks skipped. Screenshots
are captured from the running game.
