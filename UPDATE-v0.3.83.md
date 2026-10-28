# Miniopoly v0.3.83 — Mode display, radio variety and host testing

The upper-left panel names the current mode **Standard**, **World Collapse** or
**Tsunami**, including Standard games that previously hid the panel. Round/wave
progress stays beside the board, with hover/tap rules and a developer-test notice
when applicable. Phones keep the mode above the board.

Police car and school bus movements randomly choose one of **five fictional
radio calls** per piece, avoiding an immediate repeat. Calls play once per move
over the existing siren/engine or bus/pupil ambience. Mute, volume, hidden tabs
and cancellation remain respected. The other pieces and their sounds are
unchanged. [Radio calls](RADIO-CALLS.md) lists all ten lines.

**Game Menu → Room & hosting → Developer tools** is visible only to the room
host. The server also rejects non-host calls. The host can start a fresh test at
round 1–200, jump forward between resolved turns, and select Random or die 1–12,
once or on every roll. The setting applies to whoever rolls next, including
Setback rolls. Guests cannot see the selected value before the roll.

Using controls makes the match a **developer test**, excluded from Hall of Fame
and completed-match records. Settings persist with the saved room. A normal
practice restart or ranked rematch clears them. A configured lobby's normal
Start button honors its saved test round/die. Fresh tests reset cash, deeds and
turns while keeping seats; the UI confirms before restarting an existing match.
Forward jumps apply real round effects, midpoint permits, waves and eliminations
without simulating movement, purchases or GO rewards. A disaster or normal round
limit can end the test before the target round. Move backward by starting fresh.
Pending purchases, cards, payments and bonus rolls must be resolved before a jump.

Existing Tsunami 2x upgrade prices, unread trade controls and normal rent remain.
The separate broader ocean mockup is not applied by this update.

[Downloads](DOWNLOAD-v0.3.83.md) · [Developer guide](DEVELOPER-TOOLS.md)

Validation: 285 automated tests passed, zero failures, three optional HTTPS
skips. Tests cover host-only access, strict input validation before mutation,
private/persistent once-or-repeat die overrides, real disaster advancement,
partial-round turn counts, pending liabilities, excluded test records and clean
ranked rematches. Radio tests cover five choices per vehicle, no immediate repeat,
no duplicate speech on preference updates and cancellation behavior. Live browser
checks used the normal server (no test flags) for a selected starting round, an
actual forced 6, actual police radio playback, a Tsunami wave jump, all three
mode names, hidden guest controls, four viewport sizes and a portable review
that decoded all 23 clips without external requests. No browser errors/failed
assets were observed. All audio manifest hashes were verified.
