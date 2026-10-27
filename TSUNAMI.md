# Tsunami mode — v0.3.79

Choose **Tsunami** from the Game mode dropdown beside Create room. It replaces
Countdown's name and disaster presentation, with the same survival rules.
Host Game Setup, Game Launcher, in-game rules, round notices, results and
Hall of Fame use the new name. Existing Countdown rooms and records resume
as Tsunami; no reset or save conversion is necessary.

## Building and survival

- Choose 10, 15 or 20 building rounds. Each player starts with two distinct homes
  worth $400 total plus a Building Permit, without spending starting cash.
- Passing GO awards an available home with the normal cash reward. Another
  Building Permit arrives halfway through building.
- In the final building round, one randomly selected owned deed is marked.
  After everyone finishes the round, the first tsunami strikes it.
- The next full round warns about two targets, then three, four and so on.
  The target count is global across all three worlds, not per player or world.
  Only currently owned, available deeds are selected, without duplicates in a
  wave. If fewer remain than the wave target count, all eligible deeds are hit.
- An upgraded property has one use of **flood protection**. Its first hit removes
  one upgrade; you keep the deed and any remaining upgrades. A later hit
  submerges the property permanently. An unupgraded deed submerges immediately.
- Building Permit upgrades count for flood protection and keep their existing
  no-set exception. Further paid upgrades need a complete unmortgaged color set.
  Trading, selling or re-upgrading cannot restore spent flood protection.
- Submersion removes ownership, all remaining upgrades and property value.
  Submerged spaces collect no rent and cannot be purchased. Landing or passing
  over them is safe, including Gravity Pull. Movement evade tokens do not apply.
- Continue buying, trading and upgrading surviving properties normally. There
  is no cash shield shop. Cash helps fund property acquisition and upgrades;
  cash or net worth alone does not keep a player alive.
- After each wave, players with no properties are eliminated. The last player
  owning a property wins. If a wave eliminates everyone remaining, compare
  their property counts immediately before that wave; equal counts share victory.
  Earlier eliminations finish behind later ones.

## Water presentation

The last five building rounds warn of distant surf, rising tides and strong
currents. Targets have pulsing blue dotted outlines, including a FLOOD PROTECTED
label when applicable. Each new host-confirmed wave sweeps water across the board
and surroundings with one local rushing-water sound. The wave recedes so surviving
properties, controls and pieces remain readable.

Submerged squares keep blue water and gentle ripples, a dotted outline, their
property name and a SUBMERGED · SAFE label. The board center and surrounding edges
retain a subtle water tint. There are no cracks, earthquakes or void portals in
Tsunami. World Collapse keeps its current appearance and rules.

A wave plays once per authoritative wave transition, including the final wave
before awards. Repeated renders, chat, world previews and reconnects do not replay
it; loading an existing wave shows its current water state immediately. Mute,
volume, hidden-tab cleanup and Reduced Motion are respected. Reduced Motion keeps
static outlines and water without a sweeping wave or pulsing/rippling animation.

Open `/tsunami-preview` on your game host, or the standalone preview linked in
DOWNLOAD-v0.3.79.md. It uses sample properties and cannot change a real match.

## Save compatibility

The internal saved/API game-mode key remains `countdown`, including elimination
and result identifiers. This is deliberate compatibility, not a second visible
mode. Scoring, target selection, shields, existing trades and completed records
retain their existing behavior. Historical activity entries are not rewritten.


## Visible flood-shield domes (v0.3.79)

Every property with unused upgrade protection displays a transparent blue hexagon
dome and glowing base rings, whether or not it is the next wave target. The dome
appears immediately after a qualifying normal upgrade or Building Permit. Its
first hit removes one upgrade and the dome. A paid re-upgrade, trade or sale does
not replenish spent protection. Unupgraded or submerged spaces have no dome.

Names, prices and game pieces stay readable; the overlay does not intercept
clicks. Ordinary protected tiles say FLOOD SHIELD; next-wave protected tiles use
FLOOD PROTECTED. Reduced Motion keeps the dome static. This shows existing
protection and does not give every property a new shield.
