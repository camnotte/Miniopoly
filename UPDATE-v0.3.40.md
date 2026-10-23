# v0.3.40 — Game Central

Game Central is now a working home for hosting, saved games, learning and results.
The approved layout uses Nunito and the game's existing scenery and portraits.

- **Saved Games:** resume the exact saved room and your existing seat. The browser
  remembers multiple rooms; use a private seat backup when changing browsers or
  addresses. The owner console lists local saved rooms without exposing tokens.
- **Host & Join:** Local and Online open the existing host setup; its remembered
  connection, password and HTTPS settings remain. Once hosting is ready, choose
  room rules/name and confirm the avatar using the existing Create/Join forms.
- **Learn the Game:** rules, three interactive 16-space board maps and all 28 deeds,
  with prices, sets, rent and upgrade comparisons available before joining.
- **Hall of Fame:** preserved Legendary 10/15/20-round records, plus actual completed
  matches for every round preset and Unlimited. Filter starting cash and shift
  mode separately. Equal net worth shares a rank. Practice games are labeled;
  Unlimited shows final places within a match, without comparing uncapped wealth.
  The existing cash + unmortgaged deeds + half-upgrade-cost formula is unchanged.
- Completed summaries survive room reset and restart; older finished rooms without final results import
  once as practice results. History retains up to 2,000 matches on this host.
  It is host-local history, not an account service or global online leaderboard.

## Install the complete package

1. Stop the running game/hosting process. Keep the old folder and browser data.
2. Extract **Miniopoly-v0.3.40-Complete-Windows.zip** into the existing game folder;
   replace matching files. The flat ZIP includes all runtime files, artwork,
   fonts, launchers and the verified Windows Caddy tool. No older ZIP is needed.
3. Run **Start-Miniopoly.bat**. In Game Central choose Local or Online hosting,
   keep your remembered setup, then Start. The public game hub opens when ready.
4. Keep the same game address to retain your player seat. Reload both devices
   (Windows Ctrl+F5; Safari Command+Option+R). Confirm **v0.3.40** beside Room.

Room saves, passwords and certificates stay in `%USERPROFILE%\.miniopoly-wifi`.
Game Central itself cannot launch a batch file from a remote browser; the local
launcher provides the authenticated setup controller. Keep its URL private.
`start-windows.bat` and existing invitation links retain their original behavior;
for the hub with that launcher, visit `http://localhost:3000/central`.

## Review

- Before hosting, explore Learn the Game and check all three boards.
- Start Local Multiplayer. Create a named room, confirm the avatar and join from
  a second device. Roll and end a turn; both players should agree on the state.
- Use Game Menu → Game Central → Saved Games → Continue to resume unchanged.
  Create another room and verify both appear in Saved Games for this browser.
- Stop/restart hosting, select the saved room and resume with the same seat.
- Finish a practice or ranked match; check the appropriate mode/cash filters.
  Ranked requires 10, 15 or 20 rounds, Individual shifts, $1,500 starting cash,
  and no rule changes. Unlimited has its own within-game places.
- Keep the working Online settings and test the existing HTTPS player link from
  the phone with Wi-Fi off. Native Windows firewall/public certificate checks
  still require the host PC; automated Linux/browser tests cannot establish that.
