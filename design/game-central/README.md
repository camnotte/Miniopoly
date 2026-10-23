# Game Central design preview

A standalone, clickable proposal for the Miniopoly entry page. This is a mockup;
it does not modify the live application or read actual saved games or scores.

- **Game Central:** recent games, local/online hosting, three-world introductions and a ranking preview.
- **Saved Games:** connection/status filters, room details and a sample resume confirmation.
- **Host & Join:** local/online setup, preserved form values when switching connection modes, a waiting-room preview and a sample joining flow.
- **Learn the Game:** newcomer steps, current-rule accordions, all three accurate 16-space board layouts, searchable deeds and existing rent/upgrade values.
- **Hall of Fame:** Legendary and mode standings, round filters for 10/12/15/20/30/50/Unlimited and separate Individual/Gravity Pull views. Added brackets are explicitly proposed; Unlimited illustrates wins/win rate rather than uncapped net worth.

Uses the user's saved Nunito preference, current scenery, actual property artwork,
and original portrait collection. Illustrative games/scores are labeled. No live
API calls, hosting commands, external requests, browser-storage writes or production
scoring changes are made.

Build from the repository root:

```sh
python scripts/build-game-central-preview.py
```

The builder uses the existing Pillow installation to prepare thumbnails and embeds
all artwork, the bundled Nunito font/license, CSS and JavaScript in:
`/workspace/Miniopoly-Game-Central-Mockup.html`. The file opens on its own in a
browser; no game installation is required.

Browser review covers desktop and 320px/390px/768px layouts, navigation, hosting
and resume previews, search/filter controls, all round modes, board/deed details,
rule accordions, keyboard tabs, the embedded font and absence of external requests.
The production game and its saved rooms remain untouched.
