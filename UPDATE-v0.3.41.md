# v0.3.41 — Separate ranked Gravity Pull

Gravity Pull now supports Ranked with 10, 15 or 20 rounds and $1,500 starting
cash. Each mode has its own top-three Legendary table for every ranked round
limit. Individual and Gravity Pull scores are never pooled.

- The Ranked checkbox is enabled for qualifying Gravity Pull in Host Game Setup,
  Game Central's new-game form and the Create Room form. Unlimited, other round
  limits and nonstandard starting cash keep it disabled.
- The in-game Hall of Fame has an Individual / Gravity Pull selector. Opening it
  selects the current game's mode and, where applicable, its round bracket.
- Game Central's Hall of Fame retains Legendary view when switching modes.
  The home Legendary card also has a world-shift selector.
- Winners' record announcements identify the mode. The existing winner screen
  and each player's Return to Create / Join flow are retained.
- Records persist through room reset and host restart. Existing Individual scores
  retain their save file; Gravity Pull uses a separate legendary-gravity.json.
  Older practice results stay practice. Changing match rules still makes that
  match practice, including switching away and back. Scoring is unchanged.

## Update an installed v0.3.40 game

1. Stop hosting. Keep your game folder and browser data.
2. Extract Miniopoly-v0.3.41-Update-from-v0.3.40.zip into that existing folder,
   replacing matching files. This small ZIP requires the complete v0.3.40 assets.
3. Run Start-Miniopoly.bat and keep the existing Local / Online host setup.
4. Refresh both devices. Confirm v0.3.41 beside Room.
5. Create a new game with 10, 15 or 20 rounds, $1,500 starting cash, Gravity Pull
   and Ranked checked. Existing in-progress practice games keep their status.

For a fresh or incomplete installation, use Miniopoly-v0.3.41-Complete-Windows.zip
or ALL FOUR numbered v0341 ZIPs. Extract all four into the same folder. The
complete package includes artwork, board scripts, launchers and the pinned HTTPS
tool; it requires no older ZIP. Saves, passwords and certificates remain in
%USERPROFILE%\.miniopoly-wifi. Existing Online hosting settings are retained.

## Review

Select Gravity Pull with the qualifying round limit/cash and verify Ranked stays
available in all three hosting/creation forms. Finish a match, then check Hall of
Fame → Gravity Pull → the selected round count. Switch to Individual and confirm
its earlier records remain separate. Restart hosting during a ranked match and verify
it remains ranked. Other lengths/cash remain practice.

Automated server, persistence, eligibility, two-player and HTTPS-proxy checks
cover both modes. Browser checks cover the owner setup, Create/Join, live Hall,
Game Central rankings/home, phone layouts and rematches. Your native Windows
public HTTPS connection still needs the usual phone test with Wi-Fi off.
