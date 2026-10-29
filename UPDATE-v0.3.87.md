# Miniopoly v0.3.87 — High Ground playable prototype

A separate **Tsunami: High Ground** prototype is available from the Game Launcher
footer and Create/Join's Game Options link. Pick a refuge, build it upward,
reinforce its supports and repair storm damage. Supporting properties fund
construction and can provide one evacuation destination. Five announced waves
challenge height and strength; the last refuge wins, or final survivors compare
height and remaining supports with shared exact ties.

Each player's selected cartoon avatar becomes their personal advisor. Its advice
uses that seat's forecast risk, cash, permits, construction allowance, support
damage, turn and evacuation state. Buttons open relevant controls for review.
Hints can be turned off; the helper can be minimized. Fonts and Reduced Motion
preferences are respected.

Create/join supports 2–4 people on the same game server. **Quick demo** provides
a practice bot. Private, recipient-approved cash/property offers, construction,
rolls, income, rent and wave outcomes are authoritative on the server. Rooms and
seat tokens persist independently of the existing games. Only the host can
advance a test round or force the next die; testing is marked for everyone.

This is a focused refuge scene and simplified economy for playtesting. It does
not replace existing Tsunami or apply the proposed three-for-one development
system to Standard. Full original-board movement, card rules and piece audio
are outside this prototype. See [the complete prototype rules](HIGH-GROUND-PROTOTYPE.md).

[Downloads](DOWNLOAD-v0.3.87.md) include a small standalone prototype: extract
into a new folder and run **Start-High-Ground.bat**, using the Node.js already
installed for the game. It starts on port 3010 and can be stopped by closing its
console. The normal full-game Update and Complete packages also include the
prototype page on their existing server.

Validation: 302 Node tests passed, zero failures, three optional HTTPS skips.
Fourteen new tests cover authorization, duplicate/stale commands, construction,
wave timing, evacuation, final ties, private atomic trades, persistence, four
seats, bot play, personal advice and one-use forced dice. Two independent browser
clients verified avatar-specific helpers, permit construction, accepted trades,
the first actual wave, private host controls and seat reload. Fourteen width/font
combinations (320–1530px, Nunito/American Captain), helper toggles/minimization
and Reduced Motion passed without browser errors. A solo practice game completed
all five waves in nine turns. The same checks passed against the standalone
server. Existing Tsunami property-water checks passed in two live clients and
16 desktop/phone deed layouts. Packages preserve the original font, stomp,
ship bell and pinned Caddy binary.
