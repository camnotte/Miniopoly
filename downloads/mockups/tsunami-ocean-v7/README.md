# Miniopoly — Card-wave effects, mockup revision 7

Small waves now wash onto the Community and Chance decks. This is an updated
visual review; the playable game remains v0.3.84.

- [Enlarged card-wave video](Deck-Waves-Motion.mp4?raw=true)
- [Interactive close-up](Deck-Waves-Study.html?raw=true) — save/open the HTML locally.
- [Card-wave image](Deck-Waves-Preview.png?raw=true)
- [Whole-board video](Tsunami-Ocean-Motion.mp4?raw=true) · [Board image](Card-Waves-Board.png?raw=true)
- [Interactive board](Miniopoly-Tsunami-Ocean-Mockup.html?raw=true)
- [Phone layout](Tsunami-Ocean-Phone.png?raw=true) · [Whole-board GIF](Tsunami-Ocean-Motion.gif?raw=true) · [Close-up GIF](Deck-Waves-Motion.gif?raw=true)

## Wave treatment

A small swell approaches each card from the surrounding water, curls against
its edge, and sends a shallow sheet of turquoise water over the lower part of
the face. A broken white foam line and small bubbles travel with the run-up.
The water recedes and leaves a short-lived wet edge before disappearing.

Each deck lifts and tilts with the arriving wave, then settles. Community and
Chance use different timings and staggered phases, so the motion does not look
synchronized. Card lettering remains above the water layer and readable.

Pause stops the water, foam and card motion. Reduced Motion replaces the wash
with a quiet wet edge and hides the approaching swell. System motion preferences
are respected. The close-up uses the board's exact deck markup, effects and
animation timings, enlarged for review. Both HTML files embed all assets.

## Preserved corrections

The 48 original game tiles remain byte-identical to revision 6. GO and all
special-square artwork retain their existing appearance. The battleship still
travels continuously across all 16 squares and faces the direction of travel.
Tile lettering remains above the moving piece. The calmer ocean, partial
property wash, seawalls and larger wave heading remain. No match rules, saves,
ownership, sound or game files change in this mockup.

## Validation

Chromium checked wave approach, run-up and recession, visible foam, staggered
phases, lettering above water, Pause, the Reduced Motion control and system
motion preferences. The close-up passed six widths (320–1440px) and used only
its document request, with no external assets or browser errors. Existing board
checks passed eight widths, three worlds, three sample pieces, all four
headings, continuous movement, all 16 squares visited per world, authentic
original tile images and no game API calls. Videos use deterministic captures.

Source, checks and original tile captures are under `source/`. Only review
artifacts are published on `codex/tsunami-ocean-design-review-v7`. The working
game branch and HEAD remain unchanged. [Checksums](SHA256SUMS.txt)
