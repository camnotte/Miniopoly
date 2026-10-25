# Game Menu — v0.3.70

Open Game Menu (Menu on phones). Six categories replace the long list of expanded groups. On desktop, a selected category opens a flyout to its left. Phones, narrow layouts and short windows expand the selected category inline, with scrolling when needed. One main category opens at a time.

| Category | Options |
| --- | --- |
| Play & explore | Explore worlds, Chat, Game rules grouped by topic |
| Properties & trading | My properties, all players' properties, Trading Center, Foreclosures |
| Cards & perks | Community & Chance card review, saved perks, applicable Setback actions |
| Results & activity | Hall of Fame, completed Results, match activity |
| Preferences | Sound, Hints, Volume, Game font, Board & panels |
| Room & hosting | Current match, match options, invitations, saved seat tools, connection recovery, Game Launcher, host controls, Forget seat |

Sound and Hints show a checked box when enabled, an empty box when disabled. Their labels remain simply Sound and Hints. Click anywhere on a toggle row; the menu stays open. Both reuse existing browser preferences, so updating the menu does not reset them. Volume, fonts and motion use the same preferences as the existing Game Options dialog. Apple Chancery remains available only when accessible to that browser.

Match status, rule paragraphs, invitation details, host actions and connection recovery stay inside their relevant submenus. The main footer has a compact real connection status and version. Inactive trading/match-setting actions are hidden after a match finishes. Host-only controls remain hidden from other players, with the existing server permission checks and confirmation prompts intact.

Desktop quick actions remain available and invoke the same underlying menu actions. Their counts and availability update with the match. Chat can be opened from Play & explore; the floating Chat launcher/panel temporarily stays hidden while Menu is open so it cannot cover the menu footer. Drafts and messages are retained.

Keyboard: Tab follows the visible controls. Escape closes the deepest disclosure first, then its category, then Menu and returns focus to its trigger. On desktop, Left Arrow from a category enters its left flyout; Right Arrow returns to the category. Up/Down and Home/End move among category headings. Opening properties or match options from Menu and closing the dialog returns focus to a visible Menu trigger.

Menu changes do not alter turns, cash, property ownership, Countdown, World Collapse, evade tokens, upgrades, trading settlement, or saved matches. The proposed World Collapse revision is still a design proposal, as in v0.3.69.

In v0.3.75, Results & activity → Match activity restores and focuses the
compact movable activity window on the left. See [activity controls](MATCH-ACTIVITY.md).
