# Host-only developer tools

Open Game Menu → Room & hosting → Developer tools. Only the authenticated room
host sees the item or can use its actions. Other players see a Developer test
notice, but never the host's private future die selection. It works in local or
online games and does not require launching Node with test environment flags.

- **Round:** integer 1–200. **Start fresh test at round** resets cash, ownership,
  positions, turns, trades and disasters, while keeping the room and player seats.
  Restarting an existing match asks for confirmation. The saved lobby settings
  also apply when the host presses the regular Start button.
- **Jump forward to round:** keeps the current match and applies each skipped
  full-round effect. Cash is not awarded for imaginary movement. Midpoint permits,
  target selection, portal relocation, tsunami damage and eliminations follow
  normal rules. A terminal wave or round limit stops advancement at the actual
  end. It does not revive eliminated players or restore consumed properties.
- **Die result:** Random or 1–12; **Once** or **Every roll until cleared**. The
  next actual die draw consumes the override, even when another player rolls or
  a Setback roll is requested. It does not bypass normal world shifts, landing
  effects or third-consecutive-bonus restrictions.
- **Save test controls:** enables testing and stores the round/die settings.
  Setting Random removes the override but the current match remains a test.

These controls mark the match unranked and exclude it from all result records.
They persist across a host restart. A normal practice restart or ranked rematch
clears developer settings. No developer command can erase a pending purchase,
card, rent/payment liability or bonus roll through a round jump; resolve it first.
Start a fresh test to return to an earlier round.
