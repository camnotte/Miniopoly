# Review Miniopoly v0.3.13

Extract the release ZIP into a new folder. Stop the older server with Ctrl+C.
Windows: run `start-windows.bat`. Mac: run `bash start-mac.command` in Terminal.
Node.js 18+ is required; no dependency installation is needed.

Refresh both devices and confirm **PROTOTYPE v0.3.13**. Use the host's network
address to join from the second device on the same Wi-Fi. Keep the same configured
`DATA_DIR` to retain existing rooms; the default save folder is shared across
release folders. Never publish or share a saved seat token.

1. Open **My Properties**. Try Set Progress, My Properties, and All Properties.
   Inspect a deed; check its world, owner, full name, rent, upgrade stars, and set.
   Your artwork says YOURS; opponents' artwork is greyed with their full name;
   unowned deeds stay in color and say Available. Mortgaged and bank-held deeds
   show their additional restrictions. Confirm each device sees its own holdings.
2. Keep the opponent's portfolio open with a search/filter while purchasing a
   property on the active device. Confirm the ownership updates and filters stay.
3. Choose **Until one player remains** for a new game. Confirm the floating round
   counter says **no limit**. Existing fixed matches have a host-only **Play until
   winner** control, which keeps progress and removes ranked eligibility.
4. On a 7 or 11, resolve the landing, then select **Bonus Roll**. The same player
   rolls again and the round stays the same. A third consecutive qualifying roll
   sends the player directly to Setback. Any other roll ends the bonus chain.
5. Landing on the Setback square is just visiting. The Go to Setback card or the
   three-roll rule holds a player there. While held, they collect no rent. On
   their turn, use **SetBack Escape Options** to pay $50, try 7 or 11, use an escape
   card, or forfeit an eligible deed. After three failed turns, the $50 fee is
   required and movement uses the already-settled third roll.
6. Select either card stack in the board center, or **Cards** in the header.
   Review all six decks. Community Chest and Chance each include Go to Setback.
   Escape cards remain. Swap Favor is clearly marked as a future feature.
7. On a 15-inch MacBook Air and the Windows monitor, check readable Nunito text,
   wrapping full names, accessible Close buttons, and the original special-space
   illustrations and GIFs. Resize the portfolio to a phone width as well.

Automated checks exercise the rules with deterministic rolls and cards. Normal
games continue to use server-generated random rolls and draws. Browser layout
checks in the cloud use Chromium; actual Safari and physical-device review is
the final user check.
