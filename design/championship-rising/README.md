# Rising championship podium — review mockup

Standalone concept requested after v0.3.57. It does not replace the live ceremony.
Run `node scripts/build-rising-podium-mockup.js` to generate
`/workspace/Miniopoly-Rising-Podium-Mockup.html` with bundled Nunito, portraits,
piece vectors and the existing three-world backdrop embedded.

The first-place podium starts at its ordinary height, pauses briefly, then grows
upward for 4.8 seconds. Its bottom stays fixed; its top reaches the vertical center
of the backdrop. The avatar and selected piece ride up. The trophy, champion name
and final worth appear after the rise. The revised layout puts bold gold
Miniopoly Champion text immediately above the trophy with a gentle 3.8-second
glow pulse. The title stays on one line and shortens to Champion (Co-Champion
for ties) when the full title does not fit. The selected game piece rests without
a frame or background beside the trophy at its base. The enlarged ribboned cup has
a prominent bold number 1 directly on its face, with no star behind it, and fills the
column; player name and worth remain along its bottom. Long names wrap; compact
screens stack the name and worth. Still preview and Reduced Motion disable the
glow pulse. The original arched title and large engraved numeral are removed.
Additional finite
confetti runs during the growth and settles afterward. The other podiums stay put.

The preview supports replay, pause/resume, a final-pose button, two/three/four
players and equal-height co-champions. It follows device Reduced Motion and has a
Still preview option. Sample standings never reach a game server or records.

Browser review verified the fixed podium base and final position mathematically,
the reveal timing, controls, shared winners and phone fit. The live v0.3.57
ceremony, gameplay, packaged releases and scoring remain unchanged.
