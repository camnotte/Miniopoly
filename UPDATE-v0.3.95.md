# Miniopoly v0.3.95 — Water below raised properties, numeric rolls and GO fix

- Protected properties have two counter-moving water layers and foam eddies around the timber supports. The moving water remains below the price/rent footer. System and personal reduced-motion settings keep the effect still.
- The floating 3D dice graphic is removed. Use the text **Tap to roll** button in the ready-turn notice or the existing compact Roll control. A larger **Last roll** number stays between Community and Chance; landing dialogs also show the rolled number. Popups suppress the board reference and roll controls until closed. The hidden board rendering canvas cannot appear above other board popups.
- Fixed a Tsunami salary bug: passing GO and landing on a submerged property previously returned from landing resolution before paying $200. That path now pays exactly once and retains the normal available-home GO reward. Landing on a flooded square without passing GO does not pay $200. Flooded properties still collect no rent, remain submerged and do not harm the player.

The strategic additions in [Tsunami gameplay options](TSUNAMI-GAMEPLAY-OPTIONS.md) are proposals for discussion. Salvage, rescues, protection transfers, emergency barriers, new wave types and market actions have not been added to the rules.

Fully **Exit Game**, replace files in the complete normal game folder, relaunch and refresh every player. Confirm **v0.3.95**. Local Wi-Fi and online multiplayer use the same fixes. This is not an update for the small standalone High Ground prototype.

Validation: **317 Node tests passed**, with three optional HTTPS tests skipped. A new real-host regression checks GO and submerged landings in all three worlds, exact-GO landings, no-crossing landings and no repeat payment on reconnect. Real two-client browser checks cover text rolling, numeric references in landing dialogs and after reconnect, water movement below the footer, eighteen screen/font layouts, reduced motion, existing property development/rents and menu layering.
