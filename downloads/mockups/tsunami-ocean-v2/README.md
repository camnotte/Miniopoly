# Miniopoly — Tsunami ocean mockup, revision 2

This revised standalone design responds to the review of bow-water direction,
property waves and ocean movement. The playable game remains v0.3.79. Host-only
testing controls stay on hold until after the visual review, as requested.

- [Interactive revised mockup](Miniopoly-Tsunami-Ocean-Mockup.html?raw=true) — save/open the HTML; artwork, font and water rendering are local.
- [Whole-board motion video](Tsunami-Ocean-Motion.mp4?raw=true) · [Animated GIF](Tsunami-Ocean-Motion.gif?raw=true)
- [Revised board overview](Tsunami-Ocean-Overview.png?raw=true) · [Phone layout](Tsunami-Ocean-Phone.png?raw=true)
- [Bow-water close-up video](Battleship-Bow-Motion.mp4?raw=true) · [Animated GIF](Battleship-Bow-Motion.gif?raw=true)
- [Interactive bow study](Battleship-Bow-Study.html?raw=true) · [Bow screenshot](Battleship-Bow-Study.png?raw=true) · [Left-facing screenshot](Battleship-Bow-Left.png?raw=true)
- [Property-wave close-up video](Property-Shoreline-Motion.mp4?raw=true) · [Animated GIF](Property-Shoreline-Motion.gif?raw=true)
- [Interactive shoreline study](Property-Shoreline-Study.html?raw=true) · [Property screenshot](Property-Shoreline-Study.png?raw=true)

## Revised motion

**Battleship:** Water starts at the bow and peels backward along the hull. Foam
travels from the bow toward the rear. Spray rises, falls and drifts back rather
than being thrown forward. The same water geometry turns with the ship; leftward
travel mirrors the hull upright, and vertical travel points the bow up/down.

**Submerged properties:** Small waves wash onto the property like a beach. A
wavy white foam edge advances over the building's lower portion, pauses and
recedes. A following wave arrives on a separate phase. The photograph remains
partly visible; dotted boundaries, names and NO RENT labels stay readable.

**Center and surroundings:** A shaded ocean surface replaces the earlier line
texture. Broad swells rock back and forth, with smaller ripples and broken foam
highlights. Water fills the center and surrounds all four sides. The board and
floating Community/Chance decks retain their gentle independent motion.

The other proposed effects remain: larger ship, one-use flood-shield domes,
landing dips/wiggles/ripples, piece/world selectors, size/water sliders, Pause,
Replay, Next square and Reduced Motion. This is a sample Wave 2; no game rules,
saves, ownership, scoring or host controls are changed.

## Validation

Checked all four headings and that the bow-water paths fan behind the bow.
The ocean canvas changes between times and six property-wash sheets are present.
Eight viewport widths (320–1440px), three worlds, three pieces, ship-size change,
pause/step/replay and Reduced Motion were checked in Chromium, with no browser
errors, failed assets or game API calls. The portable HTML needs no external
assets. The shoreline close-up was checked for moving wash and Pause.

Only mockup artifacts are published. The working game branch and HEAD remain
codex/tsunami-shields-v0.3.79 at ee064e6afb83be15d585e9466cd103c6fa0f27c4.

The proposed renderer, styles, logic and builder are retained under `source/`
for the later implementation after review.
