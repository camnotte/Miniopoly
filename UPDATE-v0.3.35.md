# Miniopoly v0.3.35 — Building Permit upgrade comparisons

When spending a saved Building Permit, click a property's underlined name to open its upgrade preview. Both **Turn Actions → Upgrade** and **Turn Actions → Perks** offer this view. The preview includes the property's original illustration, world and color set, current/next level, rent before/after, additional rent per landing, normal upgrade cost and the permit's **$0** payment.

The preview also shows every level's rent and the property's contribution to net worth before/after the free upgrade. That contribution follows the existing game formula: deed price plus half the normal cost of each upgrade. The game's scoring and rent formulas are unchanged. Rent collection paused by Setback is explained when applicable.

Properties start in **Highest deed price** order. Choose **Largest rent increase** to compare the immediate gain instead. For example, Waterways at Level 0 gains $40 rent, while The Bluffs at Level 2 gains $96. A higher price can be a strong choice, but the existing level and opponents' likely routes matter too.

Opening or closing details leaves the permit and property unchanged. Return to the list and choose **Use Building Permit · Free** to apply it. Existing rules still require an owned, unmortgaged house below Level 3; a complete set is not needed. Close details with ×, Escape, Back to properties or the surrounding backdrop. Chat stays available above the preview. The view updates during live refreshes and closes if it becomes stale through a turn/match/room change or lost eligibility. Nunito, the compact player/property overview and game pieces are retained.

## Install

1. Stop the running game server.
2. Extract **Miniopoly-v0.3.35-Update.zip** and copy all contents into your existing game folder, replacing matching files.
3. Run **Start-Miniopoly.bat**, choose your normal mode and refresh every player's browser. Confirm **v0.3.35** beside Room.

This cumulative update includes all existing launchers and helpers. Keep your installed artwork, HTTPS tool, certificates, hosting settings and saved rooms.

## Test in the game

Draw and keep a Building Permit from Community Chest or Chance. During Turn Actions, open Upgrade or Perks. Click a property's name, compare rent and value, and close the preview. Try both sort orders. Confirm the card remains until you choose **Use Building Permit · Free**. After using it, the property gains one level, the permit is consumed, and cash stays the same. Both players should see the updated level.

## Verification

127 automated tests pass, including comparisons against the actual server's free-upgrade valuation and rent charged after upgrading. Browser checks cover a real card draw, both entry routes, sorting, read-only inspection, live chat refreshes, focus/Escape behavior, layouts from 320 to 1470px, phone permit use and synchronized updates on two clients. The tested Level 2 → 3 example charged the previewed $224 rent on the opponent's subsequent landing.
