# Miniopoly v0.3.60 — Font options

Choose a game font under **Game Menu → Game Options → Your device → Game font**.
The Create Room page also has a Game font selector inside its expandable Game
Options section. The choice applies immediately and is remembered in that browser.
It does not change anyone else's device, match rules, rankings, cash or game state.

- **Nunito** is the default and is bundled.
- **American Captain** uses the original font supplied by the project owner and
  is bundled for offline use.
- **Apple Chancery** uses the font installed on the device. It is disabled and
  labeled Not installed when the browser cannot load that exact local font.
  An Apple Chancery font file was not supplied, so this release does not bundle it.

The chosen font applies to the game interface, embedded board, property panels,
Game Launcher, and championship text. Open tabs follow changes from the same
browser. Sound, volume and Reduced Motion preferences are preserved. Close
symbols keep a readable font. The championship preview has its own font selector,
and victory-image text uses the current font.

## Install the update on Windows

1. Stop hosting and choose Exit Launcher from the Windows system tray.
2. For an existing complete v0.3.59 installation, extract the v0.3.60 Update ZIP
   into the folder containing server.js and replace matching files. Do not put
   its contents inside an additional nested game folder.
3. Alternatively, extract the Complete ZIP into a new folder. Open
   Start-Miniopoly.bat inside its Miniopoly-v0.3.60 folder.
4. Start hosting and refresh every player's browser. Confirm v0.3.60 beside Room.
5. Open Game Options and choose the font on each device separately.

Node.js 18+ is required; Node.js LTS is recommended. No npm install is necessary.
Existing saves and hosting settings remain under your Windows user profile.
Do not remove your previous installation or private save backup while testing.

## Validation

npm test on Node.js 24.19.0 / Linux: 206 tests, 203 passed, 0 failed,
3 optional HTTPS proxy/controller checks skipped. New tests cover restoration,
unavailable-font handling, preference preservation, iframe/tab synchronization
and using an installed Apple Chancery face through the Font Loading API.

Real Chromium checks passed for Create Room selection and refresh persistence,
Game Options selection in a live two-player match, embedded-board and championship
fonts, keeping balances and shared rules unchanged, preserving the font after a
volume change, cross-tab updates, a phone guest choosing independently of the
host, phone-dialog width and reverting to Nunito. Both bundled fonts load locally.
Apple Chancery is unavailable on this Linux machine; its actual appearance still
requires a device with that font installed. Native Windows launcher interaction
and public online HTTPS hosting were not tested here.

This update implements font preferences. The earlier championship layout mockups
and Express / World Collapse remain separate work.
