# Miniopoly v0.3.79 — Tsunami flood-shield domes

Every property with unused Tsunami flood protection now displays a transparent
blue dome inspired by the supplied reference: cyan rim, glowing base rings and a
hexagon pattern. The house remains visible inside the dome. A Flood Shield label
appears on ordinary protected tiles; threatened tiles use their existing Flood
Protected warning to avoid overlapping labels.

Domes appear as soon as a normal upgrade or Building Permit earns protection,
during building and later waves, on all three worlds. The first tsunami hit
spends the protection and removes the dome. Further upgrades do not restore spent
protection. Unupgraded and submerged properties have no dome. World Collapse and
Standard do not show Tsunami shields. These are visual indicators of the existing
rules, not extra protection or a change to winner selection. New Tsunami match
activity entries also use the correct mode name.

Domes do not intercept clicks, change tile size or cover names/prices. Reduced
Motion keeps a static dome without the gentle glow pulse. Screen-reader tile
labels describe the available shield and its one-upgrade cost.

[Download and preview](DOWNLOAD-v0.3.79.md) · [Tsunami rules](TSUNAMI.md)

Validation: 273 tests passed, zero failures, three optional HTTPS skips. Actual
two-browser checks exercised Building Permit use, protected non-target tiles,
world switching, first-hit removal, a paid re-upgrade that did not renew the
shield, reload, Reduced Motion and unchanged Standard/World Collapse visuals.
Twelve viewport/font cases at 320–1440px had no overflow or shield hit targets.
The live and portable sample previews exercised three waves and shield removal;
the portable preview makes no external requests. No browser errors/failed assets.
