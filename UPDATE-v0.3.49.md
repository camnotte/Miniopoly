# v0.3.49 — Male / Female avatar toggle

Create and Join now show a Male / Female toggle above the current avatar.

1. Select Male or Female. Switching to that group shows its first portrait.
2. Click the portrait or More avatars to open that group's five choices.
3. Pick a portrait to close the chooser and update your tile.
4. Confirm your avatar and game piece together before creating/joining.

Clicking the already selected gender keeps your current portrait. Saved presets
and personal photos are not reset when setup loads. Your Photo stays available
inside the chooser. Selecting a preset keeps the saved photo for later reuse;
only Remove photo deletes it. Neither gender is highlighted while using a photo.
The main toggle reflects the actual current preset on both forms.

A gender switch that changes the avatar requires confirmation again. Opening,
browsing or dismissing the chooser does not. Keyboard arrows/Home/End work on
the main toggle and only the visible chooser tabs. Nunito, the compact width,
game pieces, shared Local/Online defaults, saved rooms, rules and hosting remain.

## Install

The small Update ZIP supports installed v0.3.46, v0.3.47 or v0.3.48 games.

Stop hosting. Extract Miniopoly-v0.3.49-Update.zip into the existing game folder
and replace matching files. Restart Start-Miniopoly.bat and refresh all player
browsers. Confirm v0.3.49 beside Room. Keep your address and browser data.
No match reset is required; review the change in Create/Join for a new room.

For an older/incomplete installation use the complete Windows ZIP or extract
all four numbered complete ZIPs into the same folder. Node.js LTS is required.

## Verification

All 173 automated tests passed, including the HTTPS/live-update suite. Browser
checks covered both forms at eight widths from 320 to 1920 pixels, first portraits,
filtered choices, unchanged selection, confirmation, keyboard/Escape, saved presets
and photo defaults across Local/Online. Existing piece checks covered simultaneous
claims, stale availability, full rooms, actual three-client movement and seat reload.
Packaging verifies complete files and updates against all supported baselines.
Windows/public Internet hosting was not exercised in this Linux environment.
