# Miniopoly v0.3.55 — Game Launcher and fresh room setup

Game Central is now **Game Launcher**. The full screen puts Local Multiplayer,
Online Players, Return to Game and invitations first. Saved Games, Rules / Boards /
Properties, and Rankings / Records remain available. Existing `/central` links work.
Nunito, saved portraits, all nine illustrated pieces and Community Festival remain.

## Install on your Windows host

1. Stop the existing game. If the new launcher is already running, right-click its
   system tray icon and choose **Exit Launcher** before replacing files. An older
   hosting terminal can be stopped with Ctrl+C.
2. Extract **Miniopoly-v0.3.55-Update.zip** into the existing game folder; replace
   matching files. This cumulative update supports installed v0.3.46–v0.3.54.
   Keep your existing `public`, `hosting/tools` and artwork folders. For an older
   or incomplete install, use the complete package or all four numbered parts.
   If you already have v0.3.54, **Miniopoly-v0.3.55-Launcher-Update.zip** is an
   alternative smaller download containing the same changes since that release.
3. Open **Start-Miniopoly.bat**. Node.js LTS is still required. No extra app,
   browser extension, subscription or administrator permission is required for
   the launcher. Existing firewall setup still applies to hosting.
4. Choose **Local Multiplayer** or **Online Players**, then **Start hosting**.
   Your saved settings are used. **Host Settings** opens the full connection and
   match-default controls, including the existing password / IP / firewall tools.
5. The game opens automatically if that remembered option is enabled. Otherwise
   click **Return to Game**. Refresh existing player pages; check v0.3.55 beside Room.

## Floating Windows window

- Drag its title bar to move it. Position, compact view and Always on top are
  remembered in a separate `launcher-window.json` in the private hosting folder.
- **Always on top** is initially on and can be switched off.
- **Compact view** keeps status, Return to Game and Copy player link available.
- Minimize or close the window to put it in the system tray. Hosting continues.
  Double-click the tray icon or run Start-Miniopoly again to bring it back.
- Repeated starts reuse one desktop launcher per Windows user. They do not start
  another host controller. Stop hosting before changing Local / Online modes.
- **Stop hosting** disconnects players after a confirmation. **Exit Launcher**
  also stops its hosted game and asks first when hosting is active.
- Rules, saved games and rankings open the full browser launcher. A private
  bridge lets its navigation follow the desktop buttons without additional
  windows while that full launcher is visible. Return to Game focuses an existing
  visible game window when possible. Edge / Chrome use separate app windows when
  they are the Windows default browser; other browsers use their normal windows.
- Keep the same browser profile and game address for saved seats. If the Windows
  default browser differs from the browser you previously played in, open that
  original browser/address or restore your private seat backup.
- The host PC must remain awake. Browser pages themselves cannot stay above other
  applications; Always on top applies to the native Windows launcher.

`Start-Online-Hosting.bat` also opens the desktop launcher. On its first start it
selects Online; an already running launcher is simply shown. `start-windows.bat`
remains available for the traditional local server terminal. The browser-only
owner console is available with `node scripts/host-online.js --setup`.
Do not run a second server on an occupied game port.

## Host “Forget seat” now resets everyone

In Game Menu the host sees **Forget seat · Reset everyone**. After confirmation:

- This room and its unfinished progress are removed, and every seat is revoked.
- Every connected tab returns to Create / Join with a reset notice. Board frames,
  transaction windows and the old seat credentials are cleared in those tabs.
- Players who were offline or had closed their browser also lose the old seat;
  the persisted reset marker clears it when they reconnect or reload.
- The host can create a fresh room with different rounds, cash and shift options.
  It gets a new code. Players choose / confirm their avatar and piece and rejoin.
- Portrait / piece preferences, hosting settings, certificates, other saved rooms
  and completed-match records are retained. The reset does not award a win or
  record an unfinished match as a result.

A guest's **Forget seat** still affects only that browser. Guests cannot reset
other players. Existing private backups cannot restore a host-revoked seat.
Restart practice match remains a separate control that keeps the same seats.

## Validation and Windows check

Automated checks cover live seat revocation, duplicate live tabs, offline/reloaded
seats, restart persistence, host authorization, unaffected rooms / records and
fresh settings. Real browser checks cover desktop and phone layouts, full-launcher
navigation, local startup and creating a new game after reset. HTTPS / live-update
regressions run against the pinned Caddy tool.

PowerShell syntax is checked with the real PowerShell parser. This build
environment is Linux: native Windows Forms rendering, system tray interaction,
multiple-monitor DPI scaling and foreground-window behavior still require a
Windows 11 check. On your PC, try compact / full view, drag / minimize / reopen,
run the BAT twice, and confirm hosting stays active while minimized.
