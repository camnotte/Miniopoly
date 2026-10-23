# Miniopoly v0.3.17 — Game Menu and Players & Standings

This cumulative update works with an installed **v0.3.14, v0.3.15 or v0.3.16**
game. It includes the phone header, turn notices, chat and movement fixes.

## Install on the Windows hosting PC

1. Choose **Stop hosting**, then close the hosting terminal.
2. Use **Extract All** on `Miniopoly-v0.3.17-Game-Update.zip`. Choose your
   **existing game folder** containing `Start-Online-Hosting.bat`, `server.js`,
   `public` and `hosting`. Replace matching files. Files are directly at the
   ZIP root; this is an update, not a standalone installation.
3. Open your existing **Start-Online-Hosting.bat** and start hosting as usual.
   Leave the password blank to keep the saved password. Keep your current IP,
   router forwarding and firewall settings.
4. Refresh the game on the PC and phones. Friends use the same game link.
   The game menu and hosting console identify the update as **v0.3.17**.

The existing folder name may still contain v0.3.14; renaming is unnecessary.
Saved rooms and player seats remain in place. This update does not replace
Caddy, hosting configuration, passwords, certificates or saved room files.

## Review on the desktop

- The header now shows the room, **My Properties**, **Game Menu**, and a small
  connection indicator. Its tooltip and the menu show the connection status;
  the dot becomes amber while reconnecting.
- **Game Menu** groups Explore (worlds, cards, rules), Market & perks,
  Results & activity, Settings & connection, Host controls, and Invite friends.
  Scroll inside it for the lower groups. Host match controls appear only for
  the host. The menu opens from the top each time; Escape or a click outside
  closes it. Settings toggles and invitation copying keep it open.
- Foreclosures retain their count. A dot on Game Menu indicates currently
  available foreclosure properties. It disappears when none are available.
- The former left sidebar and embedded leaderboard/tools sidebar disappear
  during live play. These features are available in the menu and player panel.
- The movable roll panel starts beside the board on the right. Its
  **Players & Standings** rows show full names, YOU, turn status, Cash,
  Net worth, Deeds, and a rank badge. Rows stay in turn order. Tied net worths
  share a rank; bankrupt players show OUT. Net worth uses the same server
  valuation as the championship results, including mortgage and upgrade rules.
- Start a two-player match, buy a property and finish the turn. Confirm cash
  and deed count update, while buying at face value preserves net worth and
  the next player's turn is highlighted. The centered turn notice remains.
- Open My Properties directly from the header. Open worlds, cards, Hall of Fame,
  activity, sound, hints, seat backup and invitations from Game Menu.
- Drag, collapse or let the panel fade as before. To restore its starting
  position, use **Game Menu → Settings & connection → Reset Turn Panel**.
  Existing saved panel placement is retained until you reset or move it.

## Review on a phone

The real cube, round, turn and End Turn remain in the compact header. **Players**
expands the combined standings list, with full names and labeled financials.
**Menu → My Properties** opens the portfolio. The board keeps its available
width. Chat remains independently accessible above transactions on both devices.

Nunito, property scenery, original special-place graphics and landing GIFs are
retained. Game rules, online hosting and the private-room connection are unchanged.

## Validation

The Node regression suite includes valuation coverage for property ownership,
mortgages, upgrades and bankruptcy transfers. Chromium browser checks cover
stable ranking rows, ties, bankruptcy labels, purchase refresh, menu navigation,
world previews, cards, settings, invitations, nine phone/desktop sizes, full-board
view, multiplayer roll/buy/end, bonus rolls, chat above purchases with drafts and
attachments, turn notices, movement frames, and wide zoom-like viewports.

Browser automation runs on Linux Chromium. Review on your Windows browser and
phone as well, particularly browser zoom and operating-system display scaling.
