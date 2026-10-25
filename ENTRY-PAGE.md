# Create / Join page — v0.3.72

The entry page is left-aligned with a compact welcome column, the Create / Join identity window, and a separate Game Options window beside it. On medium screens, the two setup windows remain side by side with the welcome information below. Phones stack Create / Join, Game Options, then the welcome information. The live board layout is unaffected.

Create / Join contains the name, room name or code, avatar, piece, confirmation and submission. The Review Game Options link jumps to the separate panel, useful when it is stacked below the form on a phone.

## Game Options

One Game mode dropdown lists the three modes, with a single Rounds dropdown beside it:

- **Standard:** the existing Classic mode (`gameMode=classic`). Fresh entry defaults to 10 rounds; existing saved/launcher choices, including Unlimited, are respected. All existing Standard round choices are retained.
- **World Collapse:** 10, 15 or 20 building rounds, followed by the currently shipped fatal-void survival rules.
- **Countdown:** 10, 15 or 20 building rounds, followed by property consumption and upgrade-shield survival.

Selecting a mode updates the Rounds dropdown to its valid choices and restores that mode’s previous selection. Each mode remembers its own last round count in this browser. The dropdown changes presentation and defaults, not the rules of the modes. The proposed moving-void/fixed-ending World Collapse revision is still not applied.

Additional options have their own section: room size, starting cash, world shift, conditional World Collapse Final Showdown, and Ranked eligibility. The personal font selector is separate from shared rules; font availability information expands when needed. Standard is only a display name on this entry page; existing room records and backend identifiers remain Classic.

The shared controls remain associated with the Create form using HTML form ownership, even though they are displayed in the sibling window. Native submission still sends the chosen rules to the host. Existing saved create defaults and Game Launcher hostSetup links remain supported.

On Join, shared rule controls are disabled and explicitly identified as create-room defaults. They do not pretend to show the target room's settings before joining. The host owns the joined room's rules. Personal font remains editable; the join request contains no match-option changes. Returning to Create restores the draft.
