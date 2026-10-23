# Miniopoly v0.3.59 downloads

This branch hosts the validated test ZIPs. The application source at the branch
root remains the original v0.3.7 checkout; install the ZIP to test v0.3.59.

- [Small Update ZIP — about 90 KB](downloads/v0.3.59/Miniopoly-v0.3.59-Small-Update.zip?raw=true): requires your complete v0.3.58 installation.
- [Complete Game ZIP — about 73 MB](downloads/v0.3.59/Miniopoly-v0.3.59-Complete.zip?raw=true): no previous game installation required; Node.js 18+ must be installed.
- [SHA-256 checksums](downloads/v0.3.59/SHA256SUMS.txt).

If a ZIP opens as a GitHub file page, select its Download raw file button.

## Existing v0.3.58 installation

Stop hosting and exit the Game Launcher from the Windows system tray. Extract
the Small Update ZIP into the existing game folder containing server.js and
replace matching files. Reopen Start-Miniopoly.bat, start hosting, and refresh
every player's browser. Confirm v0.3.59 beside Room.

## Complete installation

Stop hosting and exit the Game Launcher. Extract the Complete Game ZIP, then
open Start-Miniopoly.bat inside its Miniopoly-v0.3.59 folder. Keep server.js,
public, lib, hosting and scripts together. Start hosting and refresh browsers.

## Scope and validation

This is the assembled v0.3.58 game with version labels and cache-version strings
updated to v0.3.59. Gameplay is unchanged; Express / World Collapse is not yet
included. Existing saves and private hosting settings are not bundled.

Linux validation: 197 tests passed, 0 failed, 3 optional HTTPS tests skipped.
Server startup, the v0.3.59 label, board, championship preview, avatar/piece
modules, font and artwork responses passed. The Windows HTTPS executable matches
the bundled SHA-512 manifest. Native Windows launcher interaction and public
online HTTPS hosting still require Windows testing.
