# Miniopoly v0.3.96 — Restored rolling die and consistent board-center areas

The animated graphic die is restored. The center uses the same named areas in all three worlds and in Standard, World Collapse and Tsunami:

1. **Top: world and status.** The world name sits above three cells: game mode with round/wave, the shared Festival fund, and the current world's submerged count (active portals in World Collapse; owned deeds in Standard). Hover provides full phase and fund explanations. The fund and counts stay visible when a tsunami starts instead of competing with duplicate overlays.
2. **Middle: turn and last roll.** One short turn message occupies its own lane. The permanent last-roll number has a separate slot beside it, retaining its value between turns and reconnects.
3. **Bottom: play controls.** Community, the animated rollable die and Chance have consistent positions. The die mirrors the original synchronized roll animation. Its size follows the available board space, with no special shrinking when a wave begins.
4. **Inside edges: ownership.** Property-owner capsules remain next to their corresponding properties in reserved edge lanes, with compact sizing on small boards. Long names retain their full tooltip and accessible text.
5. **Above the board: dialogs.** Purchase/payment dialogs, native rules dialogs and native arrival-card animations suppress the die and roll reference until dismissed. Landing dialogs retain their rolled-number badge. The Game Menu remains above the board.

The main shared Festival fund, round/wave data and per-world counts come from the current room snapshot. Viewing another world updates that world's name and count. No game rules, rents, GO payments, flood protection or saved-game ownership are changed. The v0.3.95 GO correction is retained. Gameplay options in TSUNAMI-GAMEPLAY-OPTIONS.md remain proposals.

Fully **Exit Game** from the launcher, apply the update to the complete normal game folder, relaunch and refresh every player. Confirm **v0.3.96**. Local Wi-Fi and online multiplayer share this layout. This is not the small standalone High Ground prototype.

Validation: 317 Node tests passed, three optional HTTPS tests skipped. Real two-player browser checks exercise animated rolling, actual development, reconnects, popup suppression, water effects, fonts and eighteen screen/font layouts. Twenty-seven additional native-board cases cover all modes, all worlds and three widths, including nonzero festival funds, long owner names and up to nine submerged deeds. Geometry checks require visible metadata and no intersections with owner lanes, turn information, cards or the restored die.
