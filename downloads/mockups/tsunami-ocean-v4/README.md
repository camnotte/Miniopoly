# Miniopoly — Tsunami ocean mockup, revision 4

This revision makes travel continuous and reduces all sample game pieces by
25% compared with revision 3. The earlier ocean, bow-foam and shoreline changes
remain available for review. The playable game remains v0.3.79. Host-only
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
travels from the bow toward the rear. The airborne water spray and droplets are removed; the surface foam remains. The same water geometry turns with the ship; leftward
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

Checked continuous motion without late-square stalls, corner continuity, the
0.75 artwork scale on all three pieces, all four headings, absence of airborne
water spray, the retained 1.2 speed
multiplier, and that the bow-water paths still fan behind the bow.
The ocean canvas changes between times and six property-wash sheets are present.
Eight viewport widths (320–1440px), three worlds, three pieces, ship-size change,
pause/step/replay and Reduced Motion were checked in Chromium, with no browser
errors, failed assets or game API calls. The portable HTML needs no external
assets. The shoreline close-up was checked for moving wash and Pause.

Only mockup artifacts are published. The working game branch and HEAD remain
codex/tsunami-shields-v0.3.79 at ee064e6afb83be15d585e9466cd103c6fa0f27c4.

The proposed renderer, styles, logic and builder are retained under `source/`
for the later implementation after review.


## Revision 3 travel timing

All three sample pieces use 958.33ms per square, previously 1150ms. That is a
20% increase in travel speed (duration divided by 1.2). A complete circuit takes
15.33 seconds instead of 18.4 seconds. Ocean swells, property waves, floating
cards, piece size, heading and landing-weight effects retain their prior timing
and appearance. Ship chimney steam remains; airborne water spray is removed.


## Revision 4 — continuous travel and smaller pieces

Pieces move along one continuous route with rounded corners and steady travel
speed. Per-square acceleration, deceleration and the brief waiting period are
removed. Passing a square still triggers its dip/wiggle/ripple without stopping
the piece. Progress carries across square boundaries to avoid timing stutters.

All three sample pieces default to 75% of their revision-3 width and height.
The size control now applies to every piece and defaults to 105%, previously
140%. The enlarged bow-study artwork is also reduced by 25%. Player labels stay
readable. The previous 20% faster travel timing is retained: one automatic full
circuit remains 15.33 seconds. Next square remains an intentional manual step
and pause control; automatic playback has no per-square pauses.

The ocean renderer and shoreline effects are unchanged; airborne water spray
remains removed, and surface bow foam remains. Host testing controls and actual
game implementation are still pending visual-review approval.
