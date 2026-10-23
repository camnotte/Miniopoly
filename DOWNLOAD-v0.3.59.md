# Miniopoly v0.3.59 downloads

This branch now contains the current v0.3.59 game at its top level. Both GitHub's
Code > Download ZIP and the complete packaged ZIP below supply the current game.
The main branch is unchanged.

- [Complete Game ZIP — about 73 MB](downloads/v0.3.59/Miniopoly-v0.3.59-Complete.zip?raw=true): recommended; no older game installation required.
- [Small Update ZIP — about 90 KB](downloads/v0.3.59/Miniopoly-v0.3.59-Small-Update.zip?raw=true): use only with a complete v0.3.58 installation.
- [SHA-256 checksums](downloads/v0.3.59/SHA256SUMS.txt).

If a ZIP opens as a GitHub file page, select its Download raw file button.

## Install and verify the current game

1. Stop hosting and choose Exit Launcher from the Windows system tray. Replacing
   files while the old server is running does not switch that running server.
2. Extract the complete ZIP into a new folder. If using GitHub's Code > Download
   ZIP instead, the extracted branch folder itself contains the current game.
3. Open Start-Miniopoly.bat beside the current package.json and server.js. Keep
   public, lib, hosting and scripts beside them. Node.js 18+ must be installed.
4. Start Local Multiplayer or Online hosting, refresh every player's browser,
   and confirm v0.3.59 beside Room. For an unambiguous version check, inspect
   package.json in the folder you launched; it must say 0.3.59.

Existing saves and hosting settings remain under your Windows user profile;
none are bundled. Keep the same game address and browser profile for saved seats.

## What this version contains

This is the assembled user-supplied v0.3.58 game with application version labels
and cache-version strings updated to v0.3.59. It includes the rising championship
podium, portraits and pieces, Building Permits, Gravity Pull and Community
Festival. Gameplay is unchanged from v0.3.58. Express / World Collapse has not yet
been implemented.

Validation on Linux: 197 tests passed, 0 failed, 3 optional HTTPS tests skipped.
Server startup, the v0.3.59 label, board, championship preview, avatar/piece
modules, fonts and artwork responses passed. The Windows HTTPS executable
matches the bundled SHA-512 manifest. Native Windows launcher interaction and
public online HTTPS hosting still require Windows testing.
