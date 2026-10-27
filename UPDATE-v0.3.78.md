# Miniopoly v0.3.78 — Tsunami

Countdown is now **Tsunami**, retaining its property-survival gameplay. Rising-water
warnings replace earthquake warnings. Each wave sweeps water over the board and
surroundings with a local water sound, then recedes. Randomly targeted properties
submerge beneath rippling water with dotted square outlines, readable names and
SUBMERGED · SAFE labels. Upgraded targets show FLOOD PROTECTED and retain the
existing one-hit protection at the cost of one upgrade.

Create room, host setup, Launcher, game rules, wave status, trades, results and
Hall of Fame use Tsunami wording. Existing Countdown rooms and records resume
without a reset. Fixed host-console hydration so saved Countdown/Tsunami defaults
remain selected instead of falling back to Standard.

Surges play once per new host-confirmed wave, including the final wave before
awards. Refreshes, repeated snapshots and chat do not replay an old wave. Mute,
volume, hidden tabs and Reduced Motion are supported. World Collapse retains
cracks/portals and its existing rules. Classic, trade consent, piece movement and
original T-Rex stomp/ship-bell files remain unchanged.

[Rules and technical compatibility](TSUNAMI.md) · [Downloads](DOWNLOAD-v0.3.78.md)

Fully Exit Launcher from the Windows system tray, apply the update, relaunch and
refresh all browsers. Confirm v0.3.78. Choose Tsunami in the Game mode dropdown.

Validation: 276 tests total, 273 passed, zero failures, three optional HTTPS skips.
Four new tests cover wave deduplication, save/resume behavior, protection labels,
mode-specific warnings and sound cleanup. Actual two-browser multiplayer checks
covered real consumption waves, loss of one upgrade, safe submerged landings,
muted/reduced motion, no replay on refresh/chat, final wave before awards and
shared victory. Twelve viewport/font cases at 320–1440px had no page overflow.
Live and standalone previews exercised three waves, flood protection, reset and
reduced motion; the standalone preview made no external requests. Browser checks
reported no page errors or failed assets. Original stomp, bell, American Captain
font and Caddy executable bytes, plus all 15 audio-manifest hashes, were verified.
