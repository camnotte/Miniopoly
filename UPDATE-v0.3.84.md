# Miniopoly v0.3.84 — Protected deeds beside each player

Quick Actions keeps the game mode and its rules hint. The round-progress line
and per-player deed/protection summary cards have been removed from that panel.
Round/wave progress remains in the center of the board.

In Tsunami, each player's turn-panel Properties button now shows a green shield
immediately left of the deed-count badge. Its number counts owned deeds with
unused flood protection across all three worlds, not upgrade levels. Zero stays
visible when no deeds are protected. The count follows upgrades, Building
Permits, transfers, spent protection and submersion; spent shields are excluded
even if the property still has upgrades. Hover text and accessible labels explain
both numbers. Standard and World Collapse retain their normal deed count.

This is a display change; protection, rent and upgrade rules remain unchanged.

[Downloads](DOWNLOAD-v0.3.84.md)

Validation: 285 automated tests passed, zero failures, three optional HTTPS
skips. Two live browsers verified the all-world protected-deed count, counting
deed protection once rather than upgrade levels, zero/spent protection, an actual
Building Permit and wave, and reloading. Eight viewport/font combinations
(320–1440px, Nunito and American Captain) verified badge placement and no page
overflow. Standard and World Collapse retain their mode and deed count without
Tsunami shields. No browser errors or failed assets were observed.
