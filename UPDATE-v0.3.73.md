# Miniopoly v0.3.73 — Left game panel

Express building-round progress is moved from a full-width banner into a compact
Game Mode card above desktop Quick Actions. “Building round 1 of 10” remains
visible. Hover, keyboard focus or tap reveals “Collapse starts after everyone
finishes round 10. Properties still work normally.” The explanation uses the
actual selected round limit and changes to the void survival rules during
collapse. Escape and outside clicks dismiss it. Existing last-five-round
warnings remain visible, and progress becomes “Collapse · Wave 1” at collapse.
Countdown uses its own mode label, progress, rules and property/shield counters.

The top all-player evade-token strip is removed. Player-card and turn/landing
badges remain, with their current award, counts and clickable rules. The standalone
evade-token design preview retains its demonstration strip.

Trading Center fits directly below Chat in desktop Quick Actions, with an icon
and an incoming-offer count. It opens the existing trading dialog; the menu link,
proposals, counteroffers, acceptance, turn permissions and settlement are retained.
On phones and Full Board View, mode progress and the trading shortcut move into
a compact row above the board. Short desktop screens can scroll the left panel.

Validation: 256 Node tests total, 253 passed, zero failures and three optional
HTTPS skips. Actual two-browser Chromium checks exercised 38 screen/font/mode
combinations (320–1920px, Nunito/American Captain, Express, Countdown and Standard),
hover/focus/tap and Escape, tooltip bounds, entry visibility, short-window scrolling,
final building-round warnings and transition into collapse, player evade details,
Trading Center under Chat, offer notifications and an accepted multiplayer trade.
No page errors or failed assets. Existing saved games and gameplay rules are retained.

Fully Exit Launcher from the Windows tray, apply the update, relaunch and refresh
browsers. Confirm v0.3.73. Existing rooms and seats can resume.
