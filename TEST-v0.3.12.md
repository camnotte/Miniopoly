# Test Miniopoly v0.3.12

1. Stop the old server with Ctrl+C. Extract this ZIP into a new folder.
2. On Windows, run `start-windows.bat`. On Mac, open Terminal, type `bash `,
   drag `start-mac.command` into Terminal, then press Return.
3. Open the game at the address shown by the server. Refresh your browser and
   confirm **PROTOTYPE v0.3.12**. Other devices use the host's network address.
4. Create a room and join from the other computer. Start a match.

## Check the floating panel

- The board center should show only the landscape.
- The panel should show the round, both full player names, and a YOU badge.
- Only the current player's cube should be enabled. Click it and check that both
  computers show the same roll and movement.
- Move the panel by its top handle. Wait five seconds without interacting with
  it: it should fade, then become fully visible when you touch it or your turn
  begins. **Keep fully visible** should prevent fading.
- Click **−** to collapse it and **+** to expand it. **Reset Turn Panel** in the
  header should recover its starting position. Refreshing should retain placement.
- Buy or pass on a property, then end the turn. Dialogs should appear above the
  board, with the floating panel returning after the decision is complete.
- Use **View Worlds**, inspect another board, then **Return to live board**.
  Clicking a property should open its information card.
- On rolls of 6 or 12, check that the next illustrated world appears on both
  computers. End the turn and check that the next player's board is shown.
- Try **Full Board View**: the same floating controls should remain available.

On a phone, the panel starts as a compact Roll bar. Expand it, move it to the top
or bottom, and check that player names remain readable.

Saved rooms stay in the server's shared save directory. If you configured a
custom `DATA_DIR`, keep using that same directory when starting this release.
