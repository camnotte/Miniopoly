# v0.3.47 — Compact room setup

Create/Join now has a wider setup panel and matching horizontal carousels for
Game piece, Men and Women. Wide screens show the three selectors beside one
another, each with three complete tiles, arrow controls and a visible count.
Medium screens give game pieces their own wide row; phones stack the selectors.
Browsing previews does not change or confirm a selection.

Names share a row where space permits. Photo-upload help sits beside the photo
frame, confirmation previews are larger, and picker-only sizing brings the Cat
and Dog illustrations closer together. Nunito remains the font throughout.
Original board-piece artwork, animations and saved player choices are unchanged.

Game Options now has a compact, expandable summary showing player capacity,
rounds, world-shift mode and starting cash. Click **Edit** to change them. Ranked
eligibility and remembered settings work as before. Extra introductory text can
be expanded separately. No fields or settings have been removed.

The Create button fits without scrolling in tested 1366×768, 1280×800 and
1470×900 desktop viewports with Game Options collapsed and normal browser zoom.
Shorter windows, larger zoom, expanded options and phones may still need scrolling;
all controls remain reachable. No fixed-height form clips the setup.

## Install the small update

This small ZIP requires an installed **v0.3.46** game.

1. Stop hosting. Extract **Miniopoly-v0.3.47-Update.zip** into that same game
   folder and replace matching files.
2. Restart **Start-Miniopoly.bat**. Refresh all players' browsers; the title bar
   should say **v0.3.47**. Keep your existing address and browser data.
3. Open Create/Join to review the new layout. Select an avatar and game piece,
   then click **Confirm selection**. Use the arrows to browse more choices.
4. Click **Game Options → Edit** to inspect or adjust the match settings.

For an older or incomplete installation, use the complete Windows ZIP or extract
all four numbered complete ZIPs into one folder instead. They include the board,
artwork, fonts and verified Windows HTTPS tool. Node.js LTS is required as before.

Existing rooms, saved seats, photos, balances, game rules and Local/Online hosting
settings remain intact. No match reset is required.

## Verification

All 173 automated checks passed, including the actual HTTPS proxy/live-update
suite. Browser checks covered complete tiles and counts at eight widths from
320 to 1920 pixels, keyboard selection, preview/confirmation behavior, expandable
settings, concurrent claims and taken-piece labels, actual multiplayer Dog
movement, room-code changes, saved-seat recovery, Reduced Motion, and custom
photo defaults across Local/Online and the password screen. Windows and a public
Internet connection were not exercised in this Linux environment.
