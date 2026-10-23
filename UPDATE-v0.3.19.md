# Miniopoly v0.3.19 — Readable turn panel and persistent turn notice

The turn panel is wider on desktop, with a larger cube, larger net-worth badges
and plain financial-rank numbers outside the player cards. The board's outer
rectangular border and dark blue surround are removed; its decorative edge stays.

## Update your existing game folder

This cumulative update supports an existing v0.3.14 through v0.3.18 installation.
Both Windows launchers are included at the ZIP root.

1. Stop your running game. For local testing, press **Ctrl+C** in its terminal
   and close it. For online hosting, choose **Stop hosting**, then close its terminal.
2. Right-click `Miniopoly-v0.3.19-Update.zip` in Downloads and choose
   **Extract All**, then **Extract**.
3. Open the extracted folder until you see `server.js`, `public`,
   `start-windows.bat` and `Start-Online-Hosting.bat`. Select everything
   (**Ctrl+A**) and copy (**Ctrl+C**).
4. Open the **existing Miniopoly folder you previously ran the game from**.
   It contains `server.js`, `public`, `hosting` and `scripts`. Paste (**Ctrl+V**)
   and choose **Replace the files in the destination**.
5. For local testing, run **start-windows.bat** from that existing folder.
   Open `http://localhost:3000`, keep the terminal open and refresh the game.
   **Game Menu** should show **v0.3.19**.

Your existing folder may still be named Miniopoly-v0.3.14; its name can stay.
This is an update using the artwork and HTTPS tool already in your installation.
Saved rooms and seats remain in place. To return to online play later, stop the
local terminal with Ctrl+C, close it, and run **Start-Online-Hosting.bat** from
that same folder. Keep your working router, firewall, password and certificate
configuration. Run one game server at a time.

## Review the nine refinements

1. The visible “12-sided die” line is removed. Roll results remain available
   to assistive technology and in the cube/turn playback.
2. The repeated turn/watching paragraph below the cube is removed visually;
   its status remains available to screen readers. Spectator cube captions no
   longer repeat “Watching together.”
3. The “Turn order · badges show net-worth rank” paragraph is removed.
4. The desktop die grows from 103 to 132 pixels, about 28% larger. The compact
   phone die stays at 51 pixels so its header does not grow over the board.
5. The center turn notice stays visible until the player rolls. Its gentle
   attention pulse runs briefly and stops while the notice remains. It never
   blocks clicks on the board or controls. Chat and presence updates do not
   replay its pulse. It hides immediately for the local roll request and on
   other screens when the server accepts the roll. If a roll request fails,
   it returns so the player knows to retry. Bonus rolls get the same treatment.
6. Each player's **Net worth** label and dollar amount share one badge; the
   amount is 24 pixels on desktop and 22 on phones. Cash and Deeds remain
   separately labeled and readable. Large dollar amounts wrap without clipping.
7. Colored seat-number circles are removed. A large plain **financial rank**
   sits outside each player card. The small color accent by the name identifies
   the board piece. Rows stay in turn order, and tied net worths share a rank;
   two players can both display 1 at the start. Bankrupt players display OUT.
8. The desktop panel and its reserved right column are 360 pixels wide,
   previously 320. The panel still moves, collapses and fades as before.
   For saved positions, **Game Menu → Settings & connection → Reset Turn Panel**
   returns it to the right. Four-player panels can scroll on shorter screens.
9. The outer blue rectangle, extended background, border and shadow are gone
   around the live board. The world heading and the board's own decorative edge
   remain. Standalone artwork review keeps its existing presentation.

Quick Actions stay on the left. Phones retain Menu and the compact cube header,
with Players expanding the new financial cards. Chat remains accessible above
transactions. Reset is still **Game Menu → Host controls → Restart practice match**.
Nunito, property scenery, original special-place graphics/GIFs and game rules remain.

## Validation

Node regression checks include persistent-notice behavior, pulse deduplication,
failed-roll recovery and bonus/rematch readiness. Chromium checks cover prolonged
ready turns on two screens, a rejected roll, normal rolling, purchases, End Turn,
bonus rolls, reconnecting, reduced motion, ranking and large money values, the
transparent board surround, desktop and phone sizing, Quick Actions, chat over
transactions, reset and a four-player panel. The cumulative ZIP is checked over
an original Windows installation with its HTTPS executable retained.

Browser checks run on Linux Chromium; review actual Windows scaling and your
phone browser locally as well.
