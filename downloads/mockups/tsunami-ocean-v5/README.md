# Miniopoly — Tsunami ocean mockup, revision 5

This review applies the seven refinements requested after analyzing the board
image. It updates the standalone mockup; the playable game remains v0.3.84.

- [Animated whole-board video](Tsunami-Ocean-Motion.mp4?raw=true)
- [Interactive mockup](Miniopoly-Tsunami-Ocean-Mockup.html?raw=true) — download and open the HTML; all artwork, font and rendering are embedded.
- [Board-only image](Refined-Board.png?raw=true) · [Full overview](Tsunami-Ocean-Overview.png?raw=true) · [Phone layout](Tsunami-Ocean-Phone.png?raw=true)
- [Bow-water video](Battleship-Bow-Motion.mp4?raw=true) · [Interactive bow study](Battleship-Bow-Study.html?raw=true)
- [Property-water video](Property-Shoreline-Motion.mp4?raw=true) · [Interactive shoreline study](Property-Shoreline-Study.html?raw=true)

## Seven refinements

1. **Calmer ocean:** Broad, irregularly phased swells rock back and forth with
   lower contrast and sparse foam. The short repeated diagonal streaks are gone.
2. **Readable submerged properties:** The moving shoreline wash stays inside
   the artwork. Buildings remain partly visible, while names, dotted boundaries
   and SUBMERGED · NO RENT remain outside the water layer.
3. **Ship placement and wake:** The hull waterline follows a clear water lane just inside the
   property ring, keeping GO and property names uncovered. Other sample pieces
   retain their tile route. The ship is fitted to the lane; surface bow
   water is narrowed and foam streams backward along the hull, without upward
   spray. Correct headings and smooth continuous travel remain.
4. **Stone seawalls:** Current low masonry artwork replaces the old bubble
   treatment. A small green protection marker identifies protected homes.
5. **Floating decks:** Community and Chance use slower, smaller rocking motions,
   softer shadows and occasional low-contrast ripples.
6. **Correct tile information:** Tile names and types come from the v0.3.84 game
   data for all three worlds. Town Tax and Storm Fund say PAY TAX. Community
   Festival and Coastal Bonus also receive their appropriate labels, rather than
   inheriting the old generic DRAW A CARD label.
7. **Wave status:** TSUNAMI · WAVE 2 is larger and more prominent above the world
   name. The number of submerged properties remains secondary.

The preview uses sample Wave 2 positions. Ownership, rent, protection, saves and
match rules are unchanged. Host developer controls already exist in v0.3.84;
this mockup does not change them. It retains the prior continuous route, 20%
faster travel timing, property weight effects, world/piece selectors, size/water
controls, Pause, Replay, Next square and Reduced Motion.

## Validation

Chromium checked all three worlds and pieces, all four headings, continuous
travel/corner continuity, the retained 1.2 speed multiplier, correct tax labels,
seawalls, moving water, Pause/Replay/Reduced Motion and eight widths (320–1440px).
The boat wake is visible and its paths run from bow to stern. A 128-position
check at default and maximum ship size found no hull overlap with GO, tile
names or footer labels. Tax labels were checked in every world. The portable HTML
uses one document request with no external assets or game API calls. No browser
errors or failed assets were observed. Deterministic frame captures produce the
whole-board and close-up videos/GIFs.

Renderer, styles, logic and builder are in `source/`. Only review artifacts are
published on `codex/tsunami-ocean-design-review-v5`; the working game branch and
HEAD remain unchanged. [Checksums](SHA256SUMS.txt)
