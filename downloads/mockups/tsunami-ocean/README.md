# Miniopoly — Tsunami ocean design review

This standalone mockup demonstrates items 1–6 from the ocean-motion request.
The playable game remains v0.3.79. User explicitly chose to wait until after this
visual review before implementing the host-only testing controls in item 7.

- [Interactive mockup](Miniopoly-Tsunami-Ocean-Mockup.html?raw=true) — save the HTML and open it in a browser; all artwork/fonts are embedded.
- [Whole-board motion video](Tsunami-Ocean-Motion.mp4?raw=true) — 18.4 seconds, a full circuit through all four directions.
- [Whole-board animated GIF](Tsunami-Ocean-Motion.gif?raw=true)
- [Board overview](Tsunami-Ocean-Overview.png?raw=true) · [Phone layout](Tsunami-Ocean-Phone.png?raw=true)
- [Battleship close-up video](Battleship-Bow-Motion.mp4?raw=true) · [Animated GIF](Battleship-Bow-Motion.gif?raw=true)
- [Interactive bow study](Battleship-Bow-Study.html?raw=true) · [Right-facing screenshot](Battleship-Bow-Study.png?raw=true) · [Left-facing screenshot](Battleship-Bow-Left.png?raw=true)
- [Battleship bow concept SVG](Battleship-Bow-Concept.svg?raw=true)

## What to review

1. A larger version of the current battleship artwork, with water splitting ahead
   of its bow, white foam and spray across its front deck. No stern trail.
2. The bow follows travel direction on every edge. On the bottom edge it faces
   left while remaining upright; vertical edges point the bow up/down.
3. Submerged properties have translucent water washing back and forth. Their
   buildings remain visible, with dotted boundaries and SUBMERGED · NO RENT.
4. The center is substantially flooded. Community and Chance decks float with
   separate bobbing motions, shadows and surface ripples.
5. Ocean water surrounds all four sides. The board floats gently with edge foam
   and a soft shadow; the surroundings also move.
6. Squares dip and wiggle under arriving pieces, then settle with ripples. The
   ship, school bus and T-Rex have different landing weights in this sample.

Controls: Pause/Resume, Next square, Replay, game piece, world, ship-size slider,
water slider and Reduced Motion. Next square pauses the route at a landing.
The ship-size default is a proposed 140% scale for review.

The sample uses Tsunami Wave 2, three submerged homes and two protected homes.
Existing flood-shield domes remain visible. Submerged spaces remain safe and
have no rent or value; no scoring, ownership or protection rules change here.
Clicking the floating cards shows a design-preview notice only.

## Validation and scope

Eight viewport widths (320–1440px), all four directions, three worlds, three
pieces, size adjustment, pause/step/replay and Reduced Motion were checked in
Chromium. There were no page errors, failed assets or game API requests. A
portable HTML check loaded all assets without external requests. The videos
contain 184 whole-board frames and 72 close-up frames. Native-device appearance
still belongs in the visual review.

Only design artifacts are published on this review branch. The main game source,
current working branch, saves and runtime rules remain unchanged. This review
adds no developer controls; those remain pending the user's mockup review.
