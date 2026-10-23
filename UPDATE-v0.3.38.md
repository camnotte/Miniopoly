# Miniopoly v0.3.38 — Landing artwork fix and player world badges

Landing popups now discard the previous landing's image and keep the new artwork hidden until it has loaded and decoded. This addresses the previous player's property artwork briefly showing when another player lands on a different property in the same world. Late image callbacks cannot replace the current landing or reopen artwork after departure. A neutral fallback is shown while an image is loading; image failures retain that fallback. Original property artwork and animated special-place GIFs are retained.

Each player in Players & Standings now has a small world badge beneath their name: **Richmond Hill**, **The Communities** or **Coastal Georgia**. Subtle green, blue and sand tints distinguish the worlds without expanding the panel into another property grid. Full world names wrap on narrow screens. During movement the badge keeps the departure world, then changes on arrival, including players moved by Gravity Pull. Reconnecting shows the saved current world immediately.

## Install

1. Stop hosting.
2. Extract **Miniopoly-v0.3.38-Update.zip** and copy all its contents into the existing game folder, replacing matching files.
3. Run **Start-Miniopoly.bat**, refresh every player's browser and confirm **v0.3.38** beside Room.

Existing saved rooms work; no new room is needed. The update includes the local and online launchers/helpers, while retaining installed artwork, the verified HTTPS executable, certificates, passwords and saves. Nunito, avatars, moving pieces/effects, property previews, rankings and live options announcements keep their existing behavior.

## Review

Have player 1 land on a property and finish their turn. On the MacBook, have player 2 land on a different property in the same world. No previous property image should flash: only a loading fallback or the correct artwork should appear. Repeat on a world shift and a special place to check the existing animations.

Check the badge under each player's name. An Individual shift updates only that player's world on arrival; Gravity Pull updates the participating players together on arrival. On a phone, expand Players to see the same full world labels and property shortcuts.

## Verification

142 automated tests pass, including delayed image/decode callbacks and held world badges. Two-client Chromium checks exercise the second player's same-world cat landing with deliberately delayed artwork, snapshot refreshes during loading, Individual and Gravity Pull arrival timing, all three world labels, a special-place payment, phone layouts at 320px/390px and saved-match resume. The previous release's stale image behavior was reproduced with the same delayed-artwork sequence. Native macOS Safari should be retested using the review steps above.
