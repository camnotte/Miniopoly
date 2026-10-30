# Miniopoly v0.3.99 — Clearer neighborhood board

The seven reviewed presentation refinements are applied:

1. More room for the board through narrower desktop side columns, with property title and price/rent type sized to the actual card. Long names retain measured fitting and reserved avatar space.
2. Match activity docks within the left rail instead of overlapping properties. On phone and Full Board View it follows the board. It starts minimized on a fresh browser, counts new history messages while minimized, and clears the count when opened. Dragging or arrow keys explicitly undock it; Reset returns it to the dock. Old automatically placed positions are retired through a new position preference key; collapse preferences remain.
3. Circular owner portraits stay upright and consistent on every board edge, using the player's actual built-in or uploaded picture. Hover gives ownership information; tapping opens the property card.
4. Empty building slots have an opaque neutral fill and dashed border. Colored House, Chalet and Estate icons are unchanged and stand apart from empty slots.
5. An outlined green shield with a checkmark is visible at the lower-right artwork edge on protected properties. It avoids the title, footer, building slots and reserved visitor lane, and disappears when protection is spent.
6. The repeated visible Players & Standings heading is removed from the player-list area. The panel keeps its title, player count and accessible list heading. Neighborhood labels use a full line in player cards.
7. Main navigation, rules and shift descriptions use neighborhoods. The current Countdown/Tsunami mode is presented as Disaster Season · Tsunami; setup explicitly identifies the current scenario and notes that additional disasters and insurance are planned.

The graphic die is larger at desktop and phone widths. Community and Chance cards are larger and anchored near the bottom edge of the center board. Their placement remains separate from the die, ready-turn notice, persistent last-roll number and status/fund area. On narrow screens the status header moves higher to preserve those separate regions. Native arrival cards and dialogs still suppress the die and disable rolling.

These are presentation changes. Existing disaster timing, property development, one-use protection, rents, insurance availability (none), GO payments, saves and local/online synchronization are unchanged. Proposed floods, fires, hurricanes, tornadoes, insurance purchases and recovery/redevelopment mechanics are not introduced here. The standalone High Ground prototype remains separate.

Validation: **317 Node tests passed**, with three optional HTTPS checks skipped. Real two-client browser checks cover movement, die frames, paid development, reconnects and ownership portraits. Eighteen screen/font layouts verify larger die/decks, bottom placement and clear information areas; twenty-seven mode/neighborhood/width snapshots and sixteen normal/full-board menu cases pass. Activity unread messages, opening, keyboard dragging and Reset are exercised. No browser errors were reported.

Fully **Exit Game**, replace files in the complete normal game folder, relaunch and refresh every player. Confirm **v0.3.99**.
