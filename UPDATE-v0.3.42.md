# v0.3.42 — Host once, then create the room

Choosing Host an online game or Host a local game now continues from setup
straight to Create Room after the server is ready. The earlier flow returned to
Game Central and made the host choose Host again.

Your settings are filled in. Name the game, confirm an avatar, then click Create
Room. A room is only created by that explicit action. With automatic opening off,
the setup button reads Continue to Create Room and follows the same direct path.

Saved Games continues to resume the selected room and seat. General Host Game
Setup, when opened without choosing a new game, still opens Game Central. The
existing Online password page preserves the new-game route and settings. Hosting
credentials, certificates, firewall/router rules, saves and ranking are unchanged.

## Install

For an installed v0.3.40 or v0.3.41 game, stop hosting and extract
Miniopoly-v0.3.42-Update.zip into the existing game folder, replacing files.
Restart Start-Miniopoly.bat and refresh both browsers. Confirm v0.3.42 beside Room.

For a fresh/incomplete installation, use the complete v0.3.42 Windows ZIP or ALL
FOUR numbered v0342 ZIPs. Extract every part into the same folder. Node.js LTS is
required; no older game ZIP is required by the complete package.

## Review

1. Run Start-Miniopoly.bat and choose Host an online game (or Host a local game).
2. Keep the remembered settings in Host Game Setup and click Start.
3. When ready, Create Room should open directly. Name the game, confirm the
   avatar and create it. You should not need a second Host click.
4. If automatic opening is disabled, click Continue to Create Room once ready.
5. Verify Saved Games still resumes the right match and seat after a restart.

Targeted checks cover Local/Online launch URLs, saved-resume priority, general
setup, manual and automatic opening, ranked settings and the Online password
handoff. Browser tests exercise real hosting, two-player play and saved-game
recovery. Native Windows/public HTTPS checks still require the host PC.
