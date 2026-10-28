# Miniopoly — Corrected Tsunami mockup, revision 6

This revision restores the game's original tile appearance and puts the
battleship back on the route across the squares. It is a visual review; the
playable game remains v0.3.84.

- [Corrected animation](Tsunami-Ocean-Motion.mp4?raw=true)
- [Interactive mockup](Miniopoly-Tsunami-Ocean-Mockup.html?raw=true) — save the HTML and open it in a browser; all assets are embedded.
- [Corrected board](Corrected-Board.png?raw=true) · [Northbound ship](Across-Squares-North.png?raw=true)
- [Full overview](Tsunami-Ocean-Overview.png?raw=true) · [Phone layout](Tsunami-Ocean-Phone.png?raw=true)
- [Animated GIF](Tsunami-Ocean-Motion.gif?raw=true)

## Corrections

**Original squares:** All 48 tiles are captured from the current v0.3.84 game
renderer, without tokens, owners or overlays. GO retains its actual world sign;
tax, chest, Chance, Setback, railroad, utility and property tiles retain their
existing artwork and printed layout. Railroad and utility rent displays are
also the game's actual displays. The old mockup placeholders are removed.

**Across the squares:** The battleship follows the same continuous perimeter
route as the other sample pieces. The inner water lane has been removed. It
visits all 16 squares, faces all four directions, and retains the earlier 20%
faster travel timing. Surface bow foam streams backward along the hull without
an upward spray.

**Readable labels:** Exact title and price/rent portions of the tile artwork
are drawn above moving pieces. GO's sign lettering is similarly protected.
Submerged squares replace their prices with SUBMERGED · NO RENT. Foreground
labels dip and settle with their square when a piece passes, instead of being
left behind during the weight effect.

The calmer ocean swells, partial shoreline flooding, dotted submerged boundaries,
stone seawalls, floating card decks, larger wave heading, selectors, size/water
controls, Pause/Replay/Next square and Reduced Motion remain in the review.
This uses sample Wave 2 positions; rules, saves and ownership are unchanged.

## Validation

Chromium checked eight viewport widths (320–1440px), all three worlds and sample
pieces, all four headings, continuous motion and corners, the 1.2 speed
multiplier, visible bow-to-stern wake, moving water and Reduced Motion.
A separate check sampled 256 route points in each world: the ship crossed every
one of the 16 squares; 247 samples were inside tile bounds and nine were in the
small gaps between tiles. All tile images matched their captured originals and
label layers stayed above the ship. The portable HTML made only its document
request, with no external assets or game API requests. No browser errors or
failed assets were observed. The video is a deterministic full circuit.

Source and captured original tiles are retained in `source/` for reproducibility.
These snapshots are for the mockup; implementing the approved design will keep
the real game's existing tile rendering. Only review files are published on
`codex/tsunami-ocean-design-review-v6`; the working game branch and HEAD remain
unchanged. [Checksums](SHA256SUMS.txt)
