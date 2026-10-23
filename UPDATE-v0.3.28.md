# Miniopoly v0.3.28 — Match flow, movable chat and Host Game Setup

## Install into the existing Windows game folder

This cumulative update supports existing v0.3.14 through v0.3.27 installations.

1. Stop the old server with **Ctrl+C**, or choose **Stop hosting** in its setup page.
2. **Extract All** from **Miniopoly-v0.3.28-Update.zip**. Copy **all** files and
   folders into your **existing Miniopoly installation**, replacing matching files.
3. Double-click the new **Start-Miniopoly.bat**. Node.js LTS must be installed.
4. Choose **Local Multiplayer** or **Online Players** in **Host Game Setup**.
   Enter your player name, player count, match length and optional ranked setting.
5. Click **Start Local Multiplayer** or **Start Online Players**. With **Open the
   game automatically** checked, a game tab opens when ready. Its Create Room
   form is filled with your saved defaults; create a room or resume a saved seat.
6. Refresh every player's game page and check **v0.3.28 beside Room**.

Both existing launchers remain included: **start-windows.bat** for the original
local terminal workflow and **Start-Online-Hosting.bat** for Online setup.
Your artwork, room saves, password hash and certificates remain in place.

## Host Game Setup

- The setup page remembers mode, host name, player count, round limit, ranked
  preference, automatic-opening preference and the online connection settings.
- **Local Multiplayer:** starts the game on your home network without a public
  IP, online password or HTTPS tool. Players use the Wi-Fi player link. The
  **Allow Windows firewall** button offers a Private-network rule for Node and
  the game port. Do not forward the local game port through the router.
- **Online Players:** uses the existing Windows HTTPS setup, password and public
  IPv4 link. Existing TCP 80/443 forwarding is still required. Leave password
  blank to retain the saved password. Public certificates remain free; allow
  time for preparation/renewal and test from phone cellular data before inviting.
- **Stop hosting** before switching modes. Only one game server runs at a time.
  Mode changes retain the online password hash and certificate directory.
- Keep the starter terminal open and the PC awake. If the browser blocks the
  automatic game tab, use **Open game** once hosting is ready.

The browser controls the local helper started by Start-Miniopoly.bat. It does
not directly execute Windows batch files. Friends only need the player link,
the online password when applicable, and the room invitation/code.

## Game changes

- **Match end:** the winner screen stays until each player clicks **Return to
  Create / Join**. Each browser clears its ended seat, board, chat draft/history
  display and open panels, then returns to Create/Join. One player returning
  does not dismiss the other player's winner screen. Final records remain saved;
  a new room starts with fresh cash, positions and holdings.
- **Chat placement:** chat and its launcher default beside the desktop Turn
  panel, rather than over it. Drag the chat header, or focus it and use arrow
  keys (Shift for larger steps). Placement is saved separately for desktop and
  phone. Use ↺ to reset it. Resize/zoom/keyboard changes keep it within the
  visible viewport. It stays above transaction windows and preserves drafts
  while moved. A deliberately chosen position can overlap other content.
- **Shared ranks:** removed the visible Tied #1 badges. Equal-worth players keep
  the same rank number. Accessible rank descriptions still identify ties.
- **Payment identity:** every landing/payment cash row now names the viewer,
  e.g. **Your cash · Chris**. Spectator dialogs separately identify the current
  player. Each client uses its own seat's cash, rather than an ambiguous label.
- **Final rounds:** fixed-length matches announce **5, 4, 3, 2, 1 rounds remaining**,
  including the current round. For 20 rounds, the first notice appears in round
  16. Notices dismiss automatically after 3.5 seconds or with ×, show once per
  round/browser session, and do not block play. Unlimited matches have no countdown.
- **Cat:** painted size is 30% larger, parked and moving. The nose tilts 45° down
  on southbound movement and 45° up on northbound movement. Horizontal facing,
  walking legs, game coordinates and Reduced Motion behavior are retained.

Original special graphics, free Building Permit upgrades, board recovery,
financial timing, world transitions and Nunito are retained. Earlier activity,
trading, ownership redesign and scoring proposals remain in NEXT-UPDATE-DESIGN.md.

## Review with two players

1. Open Host Game Setup, save Local defaults, start and create a room. Join from
   another device on Wi-Fi. Stop and reopen setup to check remembered settings.
2. Open chat beside the Turn panel. Drag it, move it with arrow keys, resize,
   reopen and reset it. Send a message while the other player has a transaction.
3. Give players different cash balances. On a Community fee or other payment,
   check that each viewer's named cash row matches their own balance.
4. Watch the cat move down and up a side of the board. Its angle should be
   diagonal, with a larger full body; parked pieces should remain visible.
5. In a fixed-length match, watch the last five round notices. At the end, leave
   the winner screen open, then return separately on each device. Create a fresh
   room and confirm the new board and starting cash.
6. Switch to Online Players, retaining the existing password/certificates. After
   HTTPS is ready, test the player link over cellular data and invite your friend.

## Validation

116 automated tests passed, including real local hosting, protected online
hosting/proxy checks, saved defaults, mode switching with preserved password hash
and certificates, online sign-in preserving match defaults, countdown semantics and chat placement constraints. Chromium
checks cover payment identities on two devices, chat dragging/keyboard movement,
saved placement and drafts, actual cat movement/scale, all five remaining-round
notices, manual independent winner return, a fresh room, and the setup page's
automatic opening/prefill/room creation and saved Local/Online settings.
Browser tests run on Linux Chromium. Windows batch launch/UAC and your router's
public HTTPS connectivity still require the usual check on your PC/phone.
