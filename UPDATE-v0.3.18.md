# Miniopoly v0.3.18 — Desktop Quick Actions

The desktop now reads **Quick Actions | Board | Roll + Players & Standings**.
The left rail contains My Properties, Explore worlds, Foreclosures, Cards and
Chat. Settings, rules, invitations, results and host controls remain in Game Menu.

## Update the game you already use

This cumulative update supports an existing v0.3.14 through v0.3.17 installation.
It includes both Windows launchers and all earlier phone, chat and movement fixes.

1. Stop the running game. For local testing, press **Ctrl+C** in its terminal
   and close it. For online hosting, choose **Stop hosting**, then close its terminal.
2. Right-click `Miniopoly-v0.3.18-Update.zip` in Downloads. Choose **Extract All**,
   then **Extract**. Open the extracted folder until you see `server.js`, `public`,
   `start-windows.bat` and `Start-Online-Hosting.bat`.
3. Select everything in that extracted folder (**Ctrl+A**) and copy (**Ctrl+C**).
4. Open your **existing Miniopoly game folder**: the folder you previously ran
   the game from, containing `server.js`, `public`, `hosting` and `scripts`.
   Paste (**Ctrl+V**) and choose **Replace the files in the destination**.
5. For local testing, double-click **start-windows.bat** in that existing folder.
   Open `http://localhost:3000` in your browser. A second browser or private window
   can join your room as another player. Keep the terminal open while playing.
6. Refresh your game browsers. **Game Menu** should show **v0.3.18**.

The existing folder may still be named Miniopoly-v0.3.14. That name can stay.
This update uses the artwork and HTTPS tool in your existing installation; it
is not a standalone game. Saved rooms and seats remain in place.

When ready for online play, stop the local server with Ctrl+C and close its
terminal, then run **Start-Online-Hosting.bat** from the same folder. Keep your
working router, firewall, IP, password and certificate configuration.

## Review

- Start or resume a match on desktop. Try each of the five left-side actions.
  My Properties opens the live portfolio; worlds opens the explorer; Cards
  opens the Community & Chance review; Foreclosures opens the market; Chat
  opens the same room conversation as the always-available Chat launcher.
- Available foreclosures show their count on the shortcut. Unread messages
  show a dot on Chat. Empty notification badges stay hidden.
- The roll cube and combined player/standings panel start on the right. Its
  drag, collapse and idle fade remain available. Saved placement is preserved;
  **Game Menu → Settings & connection → Reset Turn Panel** restores the start.
- Settings, rules, Hall of Fame, activity, saved perks, invitations, seat backup
  and host controls remain in Game Menu. To reset local play, the host chooses
  **Game Menu → Host controls → Restart practice match**, then confirms.
- On phones the rail is hidden and its same action buttons are in Menu. The
  compact cube header and full available board width remain. Full Board View
  also returns the shortcuts to Menu, with desktop My Properties in the header.
- Open Chat while an opponent buys a property. It remains above the transaction.
  Test a normal roll, a purchase, End Turn, and a 7/11 bonus roll.

Nunito, original special-place artwork/GIFs, scenic properties, game rules,
private room access and the working hosting configuration are retained.

## Validation

The existing Node suite passes 79 tests without failures or skips when the
verified Caddy fixture is enabled. Chromium checks cover all five actions,
notification badges, seven desktop sizes (851–3440 pixels wide), seven phone
sizes (including landscape), full-board view, moving buttons across resize,
multiplayer buy/end, bonus turns, chat over purchases, host practice reset,
and full names in a four-player panel. The cumulative ZIP is checked after
applying it over the original Windows installation; the HTTPS tool is retained.
Actual Windows display scaling and phone Safari should also be reviewed locally.
