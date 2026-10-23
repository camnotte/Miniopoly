# Miniopoly v0.3.15 — Phone header update

This is a small update for your installed **v0.3.14** game. You do not need to
download the game artwork or HTTPS tool again.

## Install on the Windows hosting PC

1. In the hosting console, choose **Stop hosting**, then close its terminal.
2. Open **Miniopoly-v0.3.15-Phone-Header-Update.zip** and use **Extract All**.
   Set the destination to your **existing game folder**: the folder containing
   `Start-Online-Hosting.bat`, `server.js`, `public`, and `hosting`. Choose to
   **replace** matching files. The ZIP's files go directly into that folder.
   Its name may still be `Miniopoly-v0.3.14`; that is fine.
3. Open the existing **Start-Online-Hosting.bat** and start hosting as usual.
   Leave the password blank to keep the saved password. Keep your current
   public IP and working router/firewall configuration.
4. Refresh the game on your phone. Your friend refreshes the same game link too.
   If asked, sign into the private game again. Your saved player seat and room
   progress remain available at the same address.

This ZIP is an update, not a standalone game. It contains no certificate keys,
passwords, room saves, replacement artwork or replacement Caddy executable.

## What changes

- On phones and other windows up to 850px wide, the **same live cube** moves
  into the top header, along with turn and round information and End Turn.
- The control panel stays in the page layout instead of floating over the board.
  It does not fade or depend on an old saved panel position on phones.
- **Players** expands the full player names below the controls when needed.
  Tap again to close it and give that space back to the board.
- **Menu** holds the existing game options, including My Deeds, Cards, View
  Worlds, Chat, Full Board View and player-seat backup.
- The board uses the available phone width. Full Board View keeps the phone
  controls in the header and avoids shrinking the board as the iframe resizes.
- Larger screens retain the original movable, fading floating panel.
- The font remains **Nunito**. Game rules and the online connection are unchanged.

## Quick phone check

1. Create or resume a game with another player. The cube should sit above the
   board, with no floating window covering it.
2. On your turn, tap the cube. Both players should see the same roll and movement.
   Resolve the landing and end the turn. Your friend can roll when their turn starts.
3. Tap **Players** to check names, and **Menu → My Deeds** for the portfolio.
4. Try **Menu → Full Board View** and rotate the phone. The cube should stay in
   the header. Desktop windows wider than 850px still use the floating panel.

The update was checked in Chromium at phone, landscape, tablet and desktop
sizes, including live two-player rolling and turn handoff. Physical iPhone/Safari
and Android behavior remain part of your review on the working game link.
