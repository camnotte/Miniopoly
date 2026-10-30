# Miniopoly v0.3.94 — Clearer actions and a stable board die

The board die keeps a fixed 96px size on large desktops, 64px on compact desktops/tablets and 56px on phones, including when the first tsunami arrives. Community and Chance cards leave the same clear center lane during building and tsunami phases.

- Open dialogs hide the board die and turn notice; the board roll controls are disabled until the dialog closes. The last roll is retained and returns with the die. Existing Setback roll choices inside their dialog still work.
- The advisor shows one short instruction in larger text, with one relevant action. Open **More info** for the full explanation. Personal avatars, hints settings and minimize remain available.
- The separate ocean canvas and padded water frame outside the board are removed. The webpage supplies the surrounding ocean; water inside the board, submerged-property waves and floating cards remain.
- Usable turn actions receive a gold outline. Affordable development and usable Building Permits also show **Available**. A newly available action can shake once; it does not shake repeatedly during live refreshes. Disabled actions, other players' turns and movement do not receive prompts. Reduced-motion settings suppress shaking.

These presentation changes apply to local Wi-Fi and online multiplayer. Property prices, rent, development requirements, flood protection, dice results and game rules are unchanged. The Game Menu remains above the board.

Fully **Exit Game** from the launcher, apply the update to your complete game folder, relaunch and refresh every player's browser. Confirm **v0.3.94**. Do not apply this update to the small standalone High Ground prototype.

Validation: 316 Node tests passed (three optional HTTPS checks skipped). Real two-client browser checks cover the first tsunami, die spacing, popup suppression, development affordability, actual paid developments, both clients' rent displays, reconnects, eighteen screen/font layouts, reduced motion and the Game Menu.
