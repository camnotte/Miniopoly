# Miniopoly v0.3.75 — Compact, movable Match Activity

Match Activity moves from the full-width row beneath the board into a small
floating window at the left. It keeps the same live recent history in a compact
scrolling body. Its header supports mouse/touch dragging and arrow-key movement.
A −/+ button minimizes/restores it, and ↺ resets its position. Position is saved
separately for desktop and phone layouts; minimized state is remembered locally.
New events do not reopen it. Game Menu → Results & activity → Match activity
restores the window and focuses the log. Chat retains independent behavior and
position preferences. Lobby activity stays in the menu.

The window is clamped to the visible viewport, including narrow/short screens
and zoom, and hidden while Game Menu is open. It defaults below Quick Actions
where space allows; on a short desktop it starts beside that rail to leave the
buttons reachable. The old activity row and its obsolete styles are removed.
The championship preview builder now extracts the complete awards element
without depending on that removed row, preserving live and portable previews.

Validation: 270 Node tests total, 267 passed, zero failures and three optional
HTTPS skips. Actual two-browser Chromium checks covered 18 viewport/font cases
from 320–1920px (Nunito/American Captain), real mouse drag across the board,
touch drag, pinch zoom, keyboard movement, refresh persistence, minimize/restore,
menu focus, Escape, independent phone/desktop positions, reset, short-screen
clamping, live updates while minimized, reading position, and real Chat messaging.
Live and standalone championship previews were also checked, with no extra
application markup or external portable requests. No page errors or failed assets.

Fully Exit Launcher from the Windows tray, apply the update, relaunch and refresh
all browsers. Confirm v0.3.75. Existing rooms can resume. This is a presentation
change; v0.3.74's moving portals and ember recovery rules remain.
