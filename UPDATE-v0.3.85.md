# Miniopoly v0.3.85 — Tsunami ocean and card waves

The reviewed Tsunami design is now in the playable game. Starting with the first
actual wave, moving ocean swells surround all four sides of the board and fill
its center. Submerged properties retain their original scenery beneath a
shoreline wash, with dotted boundaries and a SUBMERGED · NO RENT label. Existing
one-use stone seawalls and protected-deed badges remain.

Community and Chance float and rock on the water. Staggered swells curl against
their edges, wash a foaming sheet onto the lower faces, then drain away. Their
lettering stays above the water and the buttons still open card review. A larger
wave heading sits above the world name; submerged counts identify the current
world. The previous duplicate round badge is hidden during this phase. The
Festival fund remains visible and keeps its existing tooltip and behavior.

The battleship continues across the actual squares, with bow foam streaming
backward along the hull and a narrower surface wake during Tsunami. GO and all
other square artwork use the real game's renderer. No mockup tile snapshots or
placeholder special-square icons are installed in the game.

All moving pieces now travel continuously across their route, without a brief
stop at every square, at 20% faster travel speed. Their traveling artwork is 25%
smaller than v0.3.84; parked and selection sizes remain unchanged. During the
Tsunami phase, passed squares dip and wiggle with a ripple from the piece's
weight. Tile lettering is drawn above the moving piece and follows the dip.

Rendering respects personal and system Reduced Motion settings and tab
visibility. Ocean drawing is capped at 20 frames per second with bounded canvas
resolution; inactive/hidden scenes stop their draw loop. Existing audio,
server-authoritative landings, payments, rent, double-cost Tsunami upgrades,
protection rules and saved games remain compatible. Standard and World Collapse
keep their existing board appearance.

[Downloads](DOWNLOAD-v0.3.85.md)

Validation: 288 automated tests passed, zero failures, three optional HTTPS
skips. New checks cover continuous square boundaries, exact endpoints, the speed
multiplier, immutable routes and disaster-only ocean activation. Two live
browsers verified a real Building Permit and wave, all three worlds' original
GO art, submerged-water layers, animated ocean surfaces, an actual forced 4
with continuous travel, and card review using both keyboard and pointer controls.
Twelve viewport/font combinations (320–1440px, Nunito and American Captain)
passed without page overflow or browser errors. Additional native-board checks
verified visible ocean canvases, motion cancellation during a tile bounce,
renderer cleanup when leaving Tsunami and re-entry. Original font, user stomp,
ship bell and pinned Caddy bytes are preserved in the packages.
