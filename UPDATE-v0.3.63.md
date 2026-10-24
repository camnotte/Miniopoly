# Miniopoly v0.3.63 — Keep selection artwork clear of its labels

The Create Room and Join Room game-piece cards now reserve a preview stage for
the full animated silhouette. The artwork rig retains its previous desktop size;
the larger stage provides room for shoes stepping and aircraft taking off. Paint
is contained inside that stage so it cannot cover the name, Change control or
adjacent avatar card. At narrower widths, labels sit below the artwork.

The large board pieces and two-second preview interval from v0.3.62 are retained.
Both bundled font choices were checked. Browser-tab version labels now follow the
shared visible version, including the standalone board page.

## Install

This small Update ZIP requires a complete v0.3.62 installation. Stop hosting and
fully Exit Launcher from the Windows system tray, then extract into the folder
containing server.js and replace matching files. Launch from that folder, start
hosting and refresh every player's browser. Confirm v0.3.63. No npm install is
needed. For an older installation or a fresh folder, use the Complete ZIP instead.
Keep your prior installation and private save backup while testing.

## Validation

Chromium: 252 combinations covering all nine pieces, Create and Join, Nunito and
American Captain, and viewport widths 1366, 768, 600, 561, 560, 390 and 320 pixels.
Each piece was sampled at four animation times. No artwork/text overlap,
horizontal page overflow, or cropped artwork bounds occurred in those checks.
Desktop/tablet and phone screenshots were reviewed. The full existing suite:
210 tests, 207 passed, 0 failed, 3 optional HTTPS tests skipped on Linux.
Actual Mac and Windows display behavior still needs local testing.

Game rules, finances, piece selection/confirmation and saved identifiers are
unchanged. Main has not been changed.
