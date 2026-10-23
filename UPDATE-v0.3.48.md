# v0.3.48 — Avatar and game-piece choosers

Create/Join is now about 650px wide on desktop. Instead of visible carousels,
the form shows two clickable tiles: the selected Avatar and selected Game piece.
Both have a clear Change label. There is one combined Confirm selection action.

- Avatar opens an in-page chooser with Men, Women and Your Photo tabs. Pick a
  portrait to close the chooser and update the tile.
- Your Photo contains upload/replace, use saved photo and remove controls.
  Normal PNG/JPG/WebP validation, cropping and saved Local/Online preferences
  are preserved. The form no longer repeats the photo at the heading or in a
  second preview strip.
- Game piece opens all eight choices. Taken pieces remain greyed out with the
  owner's name, and the server still rejects concurrent claims without choosing
  a replacement. Selecting a piece closes the chooser.
- Opening, browsing, closing or pressing Escape keeps confirmation. Changing
  the avatar, piece, selected availability or room code requires confirmation
  again. Keyboard arrows, tabs, Enter/Space and Escape are supported.
- Menus stay within the screen and scroll when needed. Background form controls
  are inactive while a chooser is open. Closing returns focus to its tile.
  Choosers close when leaving setup, switching entry forms or submitting a room.

Nunito, remembered match settings and expandable Game Options remain. Existing
matches, avatars, game-piece artwork/movement, finances, rules, saved seats and
working Local/Online hosting settings are unchanged. No match reset is needed.

## Install the small update

Requires an installed **v0.3.46 or v0.3.47** game.

1. Stop hosting. Extract **Miniopoly-v0.3.48-Update.zip** into the existing game
   folder and replace matching files.
2. Restart **Start-Miniopoly.bat**. Refresh all players' browsers and check for
   **v0.3.48** beside Room. Keep the existing address and browser data.
3. Open Create/Join. Click the Avatar or Game piece tile, choose, then use
   **Confirm selection** before creating or joining the room.
4. To upload or change a photo, open Avatar and choose **Your Photo**.

For an older or incomplete installation, use the complete Windows ZIP or all
four numbered complete ZIPs in the same folder. Node.js LTS is required as before.

## Verification

All 173 automated checks passed, including the actual HTTPS proxy/live-update
suite. Browser checks covered eight widths from 320 to 1920 pixels, both chooser
menus, keyboard/category navigation, focus and Escape/backdrop dismissal, photo
rejection/replacement/removal, one-step confirmation, settings, stale availability,
full rooms, concurrent piece claims, actual chosen-piece movement on three clients,
saved-seat reload and Reduced Motion. Custom-avatar checks covered Local/Online
launches, the HTTPS password screen, shared defaults and independent guest photos.
Windows/public Internet hosting was not exercised in this Linux environment.
