# Miniopoly v0.3.61 — Local font detection

The font selector introduced in v0.3.60 is available in both local and online
multiplayer. Choose Game Menu > Game Options > Your device > Game font, or use
the selector inside Create Room's expandable Game Options.

This release improves Apple Chancery detection when the browser can render a
native font but its Font Loading API does not return a FontFace object. It checks
additional native family names and provides a Check fonts again button. A font
that the browser cannot access is labeled Unavailable in this browser rather
than Not installed. Nunito and American Captain are bundled; Apple Chancery still
requires a locally installed, enabled font accessible to that browser.

## Visible version labels

The native Windows launcher shows its version below the heading in normal and
compact views, in the window title and in the system-tray tooltip. Browser pages
show a persistent Miniopoly version badge, including Create / Join, live games,
results, Game Launcher sections, Host Game Setup, graphics reviews and previews.
Native browser dialogs get their own badge so they cannot cover the page label.
An embedded board uses its parent page's label; opening that board alone shows
its own. Old Host Game Setup and graphics review labels were updated. Standalone
review builders retain a version label in their output.

The owner console now serves the shared font preference files and American
Captain font too, so its font preference code can load as it does in the game.

## Update the computer hosting the game

1. Stop hosting. On Windows, right-click the Miniopoly system-tray icon and
   choose Exit Launcher. Closing the browser or launcher window can leave the
   old launcher running. If you started the server in a terminal, stop that
   server with Ctrl+C instead.
2. Extract the Complete ZIP into a new folder, or extract the cumulative Update
   ZIP into an existing complete v0.3.59 or v0.3.60 folder containing server.js
   and replace matching files. Avoid an extra nested game folder.
3. On Windows, open Start-Miniopoly.bat from the updated folder, choose Local
   Multiplayer, and start hosting. For a Mac host, open start-mac.command from
   the updated folder. Node.js 18+ is required; no npm install is needed.
4. Refresh the host and every player's browser. Confirm v0.3.61 beside Room
   or in Game Menu. On the Mac, use Command+Shift+R if the old page remains.
   The Mac guest receives game files from the host; it needs no separate update.
5. Choose Game font on each device. If Apple Chancery remains unavailable,
   enable it in Font Book, restart the Mac browser and use Check fonts again.

The Windows launcher is a singleton: reopening a BAT while the old launcher is
running shows the existing instance, which may still serve an older game folder.
Local and online modes both launch server.js from that launcher's own game folder.
Keep your previous installation and save backup while testing. Saved games and
hosting preferences remain in the existing user data directory.

## Validation

Node.js 24.19.0 / Linux: 210 tests, 207 passed, 0 failed, 3 optional HTTPS
proxy/controller checks skipped. Regression tests cover native font detection
when FontFace loading returns an empty array, alternate native family names,
rejection of generic fallbacks, and rechecking without losing other preferences.

Chromium checked all nine public pages, all five launcher navigation sections,
Host Game Setup, a modal browser dialog and a 390px phone viewport: the current
version remains visible. An embedded board does not duplicate the parent label.
Owner-console font files return successfully. Native launcher labels were checked
in source; their Windows rendering remains unverified.

Chromium checks also verified an unavailable font stays disabled, rechecking works,
and bundled American Captain remains selectable. A separate probe using an
actually installed Linux font verified native-font rendering detection when
FontFace loading returns an empty array. Actual Apple Chancery appearance and
Mac browser access still require validation on the Mac. Native Windows launcher
interaction and public HTTPS hosting were not tested here.

The cumulative update includes the v0.3.60 font preference feature. Preferences
remain per browser; match rules, balances and other devices' choices are unchanged.
Earlier championship layout mockups and Express / World Collapse remain separate
work. Main has not been changed.
