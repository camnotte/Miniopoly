# Miniopoly v0.3.56 — Clear reset and connection notices

Guests now get a prominent, persistent **The host reset the game** card when the
host releases all seats. It names the old room, explains that a new code is
needed, and offers **Join a new game**. That button opens Join and focuses the
empty room-code field. The host sees **You reset the game / Create a new game**.

The notice stays until acknowledged or another room is entered. It survives a
page reload in that tab. Guest setup opens Join automatically. The old board,
transactions and revoked seats are cleared; avatar / piece preferences remain.

| What happened | What an already-open game tab shows |
| --- | --- |
| Host resets this room | The host reset the game; join with the new room code |
| Host stops hosting or exits the launcher | Host stopped hosting; saved seat retained; automatic reconnect |
| Connection fails without a confirmed reason | Connection lost—reconnecting; no claim that a reset happened |
| An old running server rejects Reset | Restart the Windows host; explicit explanation that reset did not complete |

Connection notices disappear after the host is reachable and the current seat
is verified. The normal five-second read-only check remains; recovery checks run
every two seconds with bounded requests. There is also a Try reconnecting now
button. The existing live stream normally delivers reset and stop notices at once.
No fixed delivery time can be guaranteed over a disconnected network.

For a normal launcher stop, the controller sends a private parent/child message
to its game process before shutting down the game and HTTPS proxy. There is no
new public shutdown endpoint. Terminal Ctrl+C also announces stopping where
supported. Forced process kills, power failures and network loss use the honest
connection-lost notice. Stopping hosting does not revoke seats or delete a match.
The existing online password may be requested again after an online-host restart.

## Install on Windows

1. Stop hosting. Right-click the launcher's system tray icon and choose
   **Exit Launcher**. Stop any older hosting terminal with Ctrl+C as well.
   Replacing files while an old server remains running can display a new page
   version while retaining old server behavior.
2. Extract **Miniopoly-v0.3.56-Update.zip** into the existing game folder and replace
   matching files. This small update supports installed **v0.3.54 or v0.3.55**.
   For v0.3.46–v0.3.53 use the Cumulative Update instead. The complete Windows
   package and all four numbered parts also need no previous installation.
3. Run **Start-Miniopoly.bat**, then start Local Multiplayer or Online Players.
4. Reload both player browsers once: Ctrl+F5 on Windows, Command+Shift+R in Mac
   Chrome, or Command+Option+R in Safari. Confirm v0.3.56 beside Room.
5. Keep the game tabs open for reset / stop messages and automatic reconnect.

No files need to be installed on the guest MacBook. Keep the same browser profile
and game address. Existing passwords, certificates, saved rooms, completed records,
Nunito, all nine pieces, special-place media and Community Festival rules remain.

## The Chrome error screen

This update controls messages inside an already-loaded game tab. If a player
refreshes while the Windows host is off, or opens the address for the first time
while it is unavailable, Chrome owns the “This site can’t be reached” page.
The game cannot replace that browser page. Start hosting again, then reopen or
reload the game. An unreachable host is not proof that a room was reset.

## Checks

Tests cover persistent reset notices and host/guest wording, connection-message
priority, private stop announcements, and seat preservation across restart.
Real browser checks use separate localhost / LAN origins, desktop and phone
screens: immediate notices, stop / restart without navigation, unknown network
loss, a rejected reset, a held old tab restored after reset, notice persistence
past nine seconds and reload, and joining a fresh room. HTTPS / live-update
regression checks use the pinned Caddy build. Windows native window / tray / DPI
interaction still requires a Windows check, as documented in v0.3.55.
