# Miniopoly v0.3.59 — Test package

This release repackages your assembled v0.3.58 game for testing and updates the
application version labels and cache version strings to v0.3.59. Gameplay is
unchanged. Express / World Collapse is not included yet.

## Windows

1. Stop hosting and exit the Game Launcher from the system tray.
2. Extract this complete ZIP. It contains a Miniopoly-v0.3.59 folder;
   keep its server.js, public, lib, hosting and scripts together.
3. Open Start-Miniopoly.bat in that folder. Node.js 18 or newer is required;
   Node.js LTS is recommended. No npm install is needed.
4. Start Local Multiplayer or Online hosting, then refresh every player's
   browser. Confirm v0.3.59 beside Room.

Your existing game saves and hosting settings remain under your Windows user
profile in .miniopoly-wifi; none are included in this download. Keep the same
browser profile and game address to retain saved seats. For rollback, keep your
previous installation and privately back up your saves before testing.

Local fallback: double-click start-windows.bat, or run npm start in this folder.
The Windows launcher and public online HTTPS hosting require a Windows check;
this test package was prepared and validated on Linux.

## What to check

- Create a room, join with another browser/device, and start a match.
- Confirm portraits, pieces, fonts and all three world boards load.
- Exercise purchases, rent, Building Permits and Community Festival.
- Review the rising championship using /championship-preview while hosting.
- Reconnect after a normal host restart and confirm saved seats return.

The complete package includes the Windows HTTPS tool with its existing checksum
verification intact. The small version-label Update ZIP, if supplied separately,
requires your complete v0.3.58 installation; extract that update into the existing
game folder and replace matching files.
