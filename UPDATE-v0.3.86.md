# Miniopoly v0.3.86 — Visible property waves and stronger ocean

Submerged properties now show foaming waves washing over the scenery, then
receding. A native tile style had overridden the water layer's positioning,
leaving it at zero width and height. The corrected layer stays above the
property artwork, with a stronger run-up and a lingering translucent wash.
Property names, dotted boundaries and SUBMERGED · NO RENT labels remain readable.

The ocean surrounding the board has a wider visible margin, deeper swells,
stronger surface shading and broken foam crests. The same moving water fills
the center. Community and Chance retain their existing staggered card waves.
Reduced Motion displays static water and stops the ocean animation loop.
This update changes presentation; Tsunami's protection, rent and elimination
rules remain the same.

[Downloads](DOWNLOAD-v0.3.86.md)

Validation: 288 automated tests passed, zero failures, three optional HTTPS
skips. Two independent live clients received a real first wave and displayed
nonzero, absolutely positioned property-water layers. An optional browser
regression, tests/tsunami-water-layout.cjs, also renders read-only fixtures for
all available home, rail and utility types across all three worlds at desktop
and phone widths: 16 layouts. Each compares rendered pixels at different wave
positions and with water hidden, preventing a repeat of the invisible-layer
bug. Both ocean surfaces change over time; Reduced Motion, mode cleanup and
page overflow checks passed without browser errors or failed assets.

Tsunami-Water-Motion.mp4 and Tsunami-Live-Water.png show the native board from
a real host-created game advanced to the first wave with the host developer
tool. The additional desktop/phone images show the deed-kind test fixtures.
The original font, user-provided stomp and ship bell, and pinned Windows Caddy
binary are preserved in the packages.
