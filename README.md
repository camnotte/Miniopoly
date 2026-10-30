# Latest update: v0.3.94

Stable dice through tsunami waves, dialogs above the die, shorter larger advisor hints, one webpage ocean background and visible prompts for usable actions. See [download links](DOWNLOAD-v0.3.94.md) and [release notes](UPDATE-v0.3.94.md).

# Miniopoly v0.3.93 — Game Menu above the board

The Game Menu and its submenus now open above the board and floating player
panel, including Tsunami and Full Board View.

[Download v0.3.93](DOWNLOAD-v0.3.93.md) · [Update notes](UPDATE-v0.3.93.md)

Fully Exit Game, apply the cumulative Update over your complete game folder,
replace files, relaunch and refresh all players. Confirm v0.3.93.

---

# Miniopoly v0.3.92 — Readable cards and permanent board die

The die stays between **Community and Chance**, with a persistent **Last roll**
number. The turn notice is smaller. Property faces, building slots and owner
badges have clearer spacing, including protected Tsunami cards on stilts.

[Download v0.3.92](DOWNLOAD-v0.3.92.md) · [Update notes](UPDATE-v0.3.92.md)

Fully Exit Game, apply the cumulative Update over your complete game folder,
replace files, relaunch and refresh all players. Confirm v0.3.92.

---

# Miniopoly v0.3.91 — Raised flood protection

Protected Tsunami property cards now stand on **four timber stilts**, with water
moving beneath them. Each card keeps its own artwork, building slots, price and
rent. This replaces the fortress and large PROTECTED banner.

[Download v0.3.91](DOWNLOAD-v0.3.91.md) · [Update notes](UPDATE-v0.3.91.md)

Fully Exit Game, apply the cumulative Update over your complete game folder,
replace files, relaunch and refresh all players. Confirm v0.3.91.

---

# Miniopoly v0.3.90 — Three Estates and flood fortresses

Properties now support up to **three Estates**, charging **20× / 30× / 40×** base rent. Copper Lane charges **$120 / $180 / $240**. Tsunami protection uses a prominent gold Flood Fortress with corner towers and a PROTECTED crest.

[Download v0.3.90](DOWNLOAD-v0.3.90.md) · [Rules, full rent table and update notes](UPDATE-v0.3.90.md)

Fully Exit Game, apply the cumulative Update over your complete game folder, replace files, relaunch and refresh all players. Confirm v0.3.90.

---

# Miniopoly v0.3.89 — Three building slots and revised game controls

The normal game now uses two development paths: **three green Houses → one red
Estate**, or **three yellow Chalets → one red Estate**. The Communities uses
Chalets by default; Richmond Hill and Coastal Georgia use Houses. A deed may
also override its housing style. Condos are removed from the current progression.

Every residential square has three bordered spaces along the left of the
property picture, above price and rent. Each small building fills one space.
Estate conversion removes all three and displays a single red Estate; the
remaining spaces stay empty and the property is fully developed. The markers
are plain colored silhouettes. Neighborhood names and scenery remain intact.

Paid development still requires the complete unmortgaged color set. Each House,
Chalet and the Estate conversion costs one displayed construction step; Tsunami
keeps its existing doubled paid construction cost. A Building Permit pays for
one building or the Estate conversion, without requiring a complete set.

| Development | Rent multiplier |
| --- | --- |
| No added buildings | 1× base rent |
| 1 House or Chalet | 2× |
| 2 Houses or Chalets | 3× |
| 3 Houses or Chalets | 4× |
| Estate | 7× |

An older saved Estate remains an Estate. Older developments are translated to
preserve their existing rent, cash and net worth. Their original resale basis
is retained; migration does not grant extra bank-refund money. Pending trades
from the old development profile expire so players can review new terms.
New development remains compatible with one-use Tsunami seawalls: a flood hit
removes one development step and spends that deed's protection permanently.

The single live 12-sided die has moved from Players & Standings into the
player-turn popup at the board's center. The popup is larger, accepts the real
Roll action and keeps the die visible while spinning, then clears for movement.
Spectators can watch but cannot roll for another player. Standings are shorter.

Moving pieces now render above square text and graphics, including GO. The
former duplicate foreground-label/GO-art layer has been removed. Parked pieces
also sit above square artwork. Existing paths, facing, speed and sounds remain.

Starting with the first Tsunami wave, the animated ocean now fills the entire
web-page background beneath the controls, not just the board frame and center.
The canvas does not intercept input. Reduced Motion displays static ocean and
stops its draw loop. Other modes and returning to Create/Join remove it.

The advisor portrait is larger on desktop and phones, including landing popups.
The separate High Ground prototype retains its own height/support experiment;
it receives the larger portrait and simple housing art, but does not replace
the normal game's development or survival rules.

[Downloads](DOWNLOAD-v0.3.89.md)

Validation: 311 Node tests passed, zero failures, three optional HTTPS skips.
New rules checks cover three buildings/Estate conversion, maximum development,
House and Chalet paths, complete sets, migration, preserved values and resale
limits. Two live browsers verified the real die in the turn popup, spectator
permissions, visibility during spin, an authoritative roll across GO, foreground
piece and parked-token layering, six mobile/desktop widths, a full-viewport
noninteractive ocean, larger portraits, colored slots and Reduced Motion.
The screenshots use a saved-room test scenario to demonstrate all three colors
and a GO crossing. Additional personal-advisor checks passed twelve font/width
combinations; existing Tsunami water checks passed sixteen layouts and two
clients. High Ground passed fourteen layouts and a complete five-wave bot game.
Packages preserve the original font, stomp, ship bell and pinned Caddy binary.

---

# Miniopoly v0.3.88 — Advisors in the normal game and named developments

The normal game now includes the avatar advisor. In v0.3.87, the helper existed
only on the separate High Ground prototype page; the normal board still used
stars. This update connects a personal helper to each normal-game viewer and
implements the development names and building illustrations.

## Where to find the changes

After creating or joining a normal game room, look for **your name’s advisor**.
It appears above the player panel on desktop, in the compact game area on
smaller screens, and inside the landing popup when that popup is open. Its
portrait uses your selected avatar or uploaded photo. If Hints is off, a visible
**Show my advisor** button enables it; the minus button minimizes the bubble.
No prototype-only launcher is required for the normal-game helper.

Advice uses your own portfolio, cash, Building Permits, complete sets, turn and
Tsunami forecast. It flags threatened properties and spent protection, offers
relevant review buttons, and waits for piece movement to finish. It never buys,
develops, accepts a trade or spends a permit without your explicit action.

Stars have been replaced with distinct building illustrations and the names:
**Houses → Chalets → Condos → Estates**. These appear on owned board squares,
landing details, the development controls and rent table, Building Permit
comparisons, the live portfolio and Trading Center. New server activity and
Building Permit receipts use the development names. Neighborhood names remain.
Existing saves retain their numeric internal levels; costs, rent multipliers,
full-set requirements, free permit exceptions and one-use seawalls are unchanged.
The previously discussed three-for-one Standard construction system is not
introduced by this presentation update.

The separate High Ground prototype uses the same building names and artwork:
height 1 Houses, 2 Chalets, 3–4 Condos, 5–6 Estates. Its height/support rules and
existing avatar helper remain. Both the full-game Update ZIP and a refreshed
small standalone prototype are available, with clear separate instructions.

[Downloads](DOWNLOAD-v0.3.88.md)

Validation: 307 Node tests passed, zero failures, three optional HTTPS skips.
Five new checks cover named development artwork and personal advisor decisions,
including complete sets, funds, turn limitations, incoming offers and spent
seawalls. A normal server with two live browsers verified separate avatar
advisors, enabling Hints, the development guide, a real free permit to Chalets
with unchanged cash, a nonzero board illustration, portfolio labels and twelve
viewport/font combinations (320–1530px, Nunito/American Captain). Reduced Motion
and minimizing work without browser errors. High Ground's two-client checks,
fourteen layouts and complete five-wave bot game passed. The existing Tsunami
water regression passed two live clients and sixteen property layouts. The
original font, stomp, ship bell and pinned Caddy bytes remain in full packages.

---

# Miniopoly v0.3.87 — High Ground playable prototype

A separate **Tsunami: High Ground** prototype is available from the Game Launcher
footer and Create/Join's Game Options link. Pick a refuge, build it upward,
reinforce its supports and repair storm damage. Supporting properties fund
construction and can provide one evacuation destination. Five announced waves
challenge height and strength; the last refuge wins, or final survivors compare
height and remaining supports with shared exact ties.

Each player's selected cartoon avatar becomes their personal advisor. Its advice
uses that seat's forecast risk, cash, permits, construction allowance, support
damage, turn and evacuation state. Buttons open relevant controls for review.
Hints can be turned off; the helper can be minimized. Fonts and Reduced Motion
preferences are respected.

Create/join supports 2–4 people on the same game server. **Quick demo** provides
a practice bot. Private, recipient-approved cash/property offers, construction,
rolls, income, rent and wave outcomes are authoritative on the server. Rooms and
seat tokens persist independently of the existing games. Only the host can
advance a test round or force the next die; testing is marked for everyone.

This is a focused refuge scene and simplified economy for playtesting. It does
not replace existing Tsunami or apply the proposed three-for-one development
system to Standard. Full original-board movement, card rules and piece audio
are outside this prototype. See [the complete prototype rules](HIGH-GROUND-PROTOTYPE.md).

[Downloads](DOWNLOAD-v0.3.87.md) include a small standalone prototype: extract
into a new folder and run **Start-High-Ground.bat**, using the Node.js already
installed for the game. It starts on port 3010 and can be stopped by closing its
console. The normal full-game Update and Complete packages also include the
prototype page on their existing server.

Validation: 302 Node tests passed, zero failures, three optional HTTPS skips.
Fourteen new tests cover authorization, duplicate/stale commands, construction,
wave timing, evacuation, final ties, private atomic trades, persistence, four
seats, bot play, personal advice and one-use forced dice. Two independent browser
clients verified avatar-specific helpers, permit construction, accepted trades,
the first actual wave, private host controls and seat reload. Fourteen width/font
combinations (320–1530px, Nunito/American Captain), helper toggles/minimization
and Reduced Motion passed without browser errors. A solo practice game completed
all five waves in nine turns. The same checks passed against the standalone
server. Existing Tsunami property-water checks passed in two live clients and
16 desktop/phone deed layouts. Packages preserve the original font, stomp,
ship bell and pinned Caddy binary.

---

# Miniopoly v0.3.86 — Visible property waves and stronger ocean

Submerged properties now show foaming waves washing over the scenery, then
receding. A native tile style had overridden the water layer's positioning,
leaving it at zero width and height. The corrected layer stays above the
property artwork, with a stronger run-up and a lingering translucent wash.
Property names, dotted boundaries and SUBMERGED · NO RENT labels remain readable.

The ocean surrounding the board has a wider visible margin, deeper swells,
stronger surface shading and broken foam crests. The same moving water fills
the center. Community and Chance retain their existing staggered card waves.
Reduced Motion displays static water and stops the ocean animation loop.
This update changes presentation; Tsunami's protection, rent and elimination
rules remain the same.

[Downloads](DOWNLOAD-v0.3.86.md)

Validation: 288 automated tests passed, zero failures, three optional HTTPS
skips. Two independent live clients received a real first wave and displayed
nonzero, absolutely positioned property-water layers. An optional browser
regression, tests/tsunami-water-layout.cjs, also renders read-only fixtures for
all available home, rail and utility types across all three worlds at desktop
and phone widths: 16 layouts. Each compares rendered pixels at different wave
positions and with water hidden, preventing a repeat of the invisible-layer
bug. Both ocean surfaces change over time; Reduced Motion, mode cleanup and
page overflow checks passed without browser errors or failed assets.

Tsunami-Water-Motion.mp4 and Tsunami-Live-Water.png show the native board from
a real host-created game advanced to the first wave with the host developer
tool. The additional desktop/phone images show the deed-kind test fixtures.
The original font, user-provided stomp and ship bell, and pinned Windows Caddy
binary are preserved in the packages.

---

# Miniopoly v0.3.85 — Tsunami ocean and card waves

The reviewed Tsunami design is now in the playable game. Starting with the first
actual wave, moving ocean swells surround all four sides of the board and fill
its center. Submerged properties retain their original scenery beneath a
shoreline wash, with dotted boundaries and a SUBMERGED · NO RENT label. Existing
one-use stone seawalls and protected-deed badges remain.

Community and Chance float and rock on the water. Staggered swells curl against
their edges, wash a foaming sheet onto the lower faces, then drain away. Their
lettering stays above the water and the buttons still open card review. A larger
wave heading sits above the world name; submerged counts identify the current
world. The previous duplicate round badge is hidden during this phase. The
Festival fund remains visible and keeps its existing tooltip and behavior.

The battleship continues across the actual squares, with bow foam streaming
backward along the hull and a narrower surface wake during Tsunami. GO and all
other square artwork use the real game's renderer. No mockup tile snapshots or
placeholder special-square icons are installed in the game.

All moving pieces now travel continuously across their route, without a brief
stop at every square, at 20% faster travel speed. Their traveling artwork is 25%
smaller than v0.3.84; parked and selection sizes remain unchanged. During the
Tsunami phase, passed squares dip and wiggle with a ripple from the piece's
weight. Tile lettering is drawn above the moving piece and follows the dip.

Rendering respects personal and system Reduced Motion settings and tab
visibility. Ocean drawing is capped at 20 frames per second with bounded canvas
resolution; inactive/hidden scenes stop their draw loop. Existing audio,
server-authoritative landings, payments, rent, double-cost Tsunami upgrades,
protection rules and saved games remain compatible. Standard and World Collapse
keep their existing board appearance.

[Downloads](DOWNLOAD-v0.3.85.md)

Validation: 288 automated tests passed, zero failures, three optional HTTPS
skips. New checks cover continuous square boundaries, exact endpoints, the speed
multiplier, immutable routes and disaster-only ocean activation. Two live
browsers verified a real Building Permit and wave, all three worlds' original
GO art, submerged-water layers, animated ocean surfaces, an actual forced 4
with continuous travel, and card review using both keyboard and pointer controls.
Twelve viewport/font combinations (320–1440px, Nunito and American Captain)
passed without page overflow or browser errors. Additional native-board checks
verified visible ocean canvases, motion cancellation during a tile bounce,
renderer cleanup when leaving Tsunami and re-entry. Original font, user stomp,
ship bell and pinned Caddy bytes are preserved in the packages.

---

# Miniopoly v0.3.84 — Protected deeds beside each player

Quick Actions keeps the game mode and its rules hint. The round-progress line
and per-player deed/protection summary cards have been removed from that panel.
Round/wave progress remains in the center of the board.

In Tsunami, each player's turn-panel Properties button now shows a green shield
immediately left of the deed-count badge. Its number counts owned deeds with
unused flood protection across all three worlds, not upgrade levels. Zero stays
visible when no deeds are protected. The count follows upgrades, Building
Permits, transfers, spent protection and submersion; spent shields are excluded
even if the property still has upgrades. Hover text and accessible labels explain
both numbers. Standard and World Collapse retain their normal deed count.

This is a display change; protection, rent and upgrade rules remain unchanged.

[Downloads](DOWNLOAD-v0.3.84.md)

Validation: 285 automated tests passed, zero failures, three optional HTTPS
skips. Two live browsers verified the all-world protected-deed count, counting
deed protection once rather than upgrade levels, zero/spent protection, an actual
Building Permit and wave, and reloading. Eight viewport/font combinations
(320–1440px, Nunito and American Captain) verified badge placement and no page
overflow. Standard and World Collapse retain their mode and deed count without
Tsunami shields. No browser errors or failed assets were observed.

---

# Miniopoly v0.3.83 — Mode display, radio variety and host testing

The upper-left panel names the current mode **Standard**, **World Collapse** or
**Tsunami**, including Standard games that previously hid the panel. Round/wave
progress stays beside the board, with hover/tap rules and a developer-test notice
when applicable. Phones keep the mode above the board.

Police car and school bus movements randomly choose one of **five fictional
radio calls** per piece, avoiding an immediate repeat. Calls play once per move
over the existing siren/engine or bus/pupil ambience. Mute, volume, hidden tabs
and cancellation remain respected. The other pieces and their sounds are
unchanged. [Radio calls](RADIO-CALLS.md) lists all ten lines.

**Game Menu → Room & hosting → Developer tools** is visible only to the room
host. The server also rejects non-host calls. The host can start a fresh test at
round 1–200, jump forward between resolved turns, and select Random or die 1–12,
once or on every roll. The setting applies to whoever rolls next, including
Setback rolls. Guests cannot see the selected value before the roll.

Using controls makes the match a **developer test**, excluded from Hall of Fame
and completed-match records. Settings persist with the saved room. A normal
practice restart or ranked rematch clears them. A configured lobby's normal
Start button honors its saved test round/die. Fresh tests reset cash, deeds and
turns while keeping seats; the UI confirms before restarting an existing match.
Forward jumps apply real round effects, midpoint permits, waves and eliminations
without simulating movement, purchases or GO rewards. A disaster or normal round
limit can end the test before the target round. Move backward by starting fresh.
Pending purchases, cards, payments and bonus rolls must be resolved before a jump.

Existing Tsunami 2x upgrade prices, unread trade controls and normal rent remain.
The separate broader ocean mockup is not applied by this update.

[Downloads](DOWNLOAD-v0.3.83.md) · [Developer guide](DEVELOPER-TOOLS.md)

---

# Miniopoly v0.3.82 — Unread trades, Tsunami costs and upgrade overview

Incoming pending trade offers have **Read / Unread** labels, **Mark as read**,
**Mark as unread** and **Mark all as read**. The Trading Center pulses and briefly
shakes while it has unread offers. Badges count unread offers; already read offers
remain pending and can still be accepted, countered or declined. Opening or
closing Trading Center does not mark offers read. The notification's Mark as read
button can acknowledge its offers directly. Read preferences persist per player,
match and browser, survive refresh and sync between tabs of that browser. They
are private preferences and do not change trades or consent. Marking unread does
not replay a new-offer sound. Reduced Motion uses a static gold highlight.

Paid upgrades cost **twice the standard price throughout Tsunami mode**, during
building and waves. The host validates and charges the price; buttons, permit
comparisons and deed/portfolio details show it. Building Permits remain free,
with the existing no-set exception. Standard and World Collapse costs remain the
same. Bank resale and upgrade value in net worth keep their standard basis; the
Tsunami construction surcharge is spent cash, not additional property value.
Existing Tsunami matches use the new paid price when resumed in this version.

Use any player's **Properties** button (or All Properties in a landing window),
then **Upgraded properties**. It lists upgraded properties from all players,
grouped into all three worlds, with owner, level, mortgage/rent-paused state and
Tsunami protection status. Changes refresh live. Set progress and the detailed
portfolio remain available.

Round/building/wave progress is larger in the left Game Mode panel, the board
center and above Next Player. Responsive sizes keep it readable on phones.

Rent remains unchanged while the proposal is discussed. See
[Rent options](RENT-BALANCE-PROPOSAL.md).

[Downloads](DOWNLOAD-v0.3.82.md) · [Tsunami rules](TSUNAMI.md)

---

# Miniopoly v0.3.81 — Exit Game and battleship wake

The Windows launcher now has an **Exit Game** button beside Return to Game,
including Compact view, and the tray menu uses the same action. Exit Game closes
its Miniopoly app windows, removes the running launcher and tray icon, and stops
hosting while preserving saved matches. When hosting is active, it asks before
disconnecting players. X and Minimize continue to keep hosting in the tray.
The full browser launcher also offers Exit Game when controlled by the Windows
launcher. Browser-only and guest launchers cannot shut down the host PC's launcher.

Dedicated Edge/Chrome app windows are individually tagged by the native launcher;
only these tagged windows receive a normal close message. Shared browser
processes and other browser windows are not terminated. Edge/Chrome keep their
existing profiles and player seats. Windows can retain an icon you explicitly
pinned to the taskbar, even after the application exits.

Battleship water now matches the approved mockup: surface foam splits at the bow,
flows backward along the hull and fades at the stern. Animated bubbles travel
in the same direction. The upward spray is removed. Water turns with the ship,
appears during travel and selection previews, and disappears when parked.
Reduced Motion keeps the foam static and hides moving bubbles. Existing ship
horn, water and arrival bells are unchanged.

This applies the focused boat-water mockup. The broader ocean/shoreline mockup
and host testing controls remain pending review. Match rules, saves, protection
and other pieces are unchanged.

[Downloads](DOWNLOAD-v0.3.81.md) · [Tsunami rules](TSUNAMI.md)

---

# Miniopoly v0.3.80 — Tsunami seawalls

Low stone seawalls replace the blue shield bubbles on properties with unused
flood protection. Masonry follows the plot edges, leaving the building visible;
a small gold shield badge identifies protection. The first protected tsunami hit
briefly crumbles the wall and removes it. Refreshing or changing worlds does not
replay a past impact. Reduced Motion uses a static damaged-wall indication.

Protection rules, saved rooms, trades and other game modes keep their existing
behavior. Re-upgrading cannot renew spent protection. The earlier ocean/movement
mockup and host testing controls remain separate pending review.

[Download and preview](DOWNLOAD-v0.3.80.md) · [Tsunami rules](TSUNAMI.md)

---

# Miniopoly v0.3.79 — Tsunami shield domes

Upgraded properties with unused flood protection now show glowing blue hexagon
domes. A dome disappears when its protection is spent. Existing rules and saves
are unchanged.

[Downloads and preview](DOWNLOAD-v0.3.79.md) · [Update notes](UPDATE-v0.3.79.md) ·
[Tsunami rules](TSUNAMI.md).

---

# Miniopoly v0.3.78 — Tsunami

Countdown is now Tsunami, with the same property-survival rules. Waves sweep over
the board and surroundings; submerged properties retain water, dotted outlines
and readable names. Upgrades provide one use of flood protection.

[Downloads and preview](DOWNLOAD-v0.3.78.md) · [Tsunami rules](TSUNAMI.md) ·
[Update notes](UPDATE-v0.3.78.md).

---

# Miniopoly v0.3.77 — Piece effects, sound and trading lists

Travelling pieces are 30% larger while landed size stays unchanged. Bus/police
have spoken fictional radio ambience, T-Rex has tracks/teeth and its original
stomps, and ship spray is concentrated at the bow with recorded water. Trading
lists sort by color or price. Round status sits above the ready-turn popup.

[Downloads and sound review](DOWNLOAD-v0.3.77.md) · [Piece guide](PIECE-EFFECTS.md) ·
[Trading guide](TRADING-CENTER.md) · [Update validation](UPDATE-v0.3.77.md).

---

# Miniopoly v0.3.76 — Incoming trade alerts

New offers and counteroffers notify their recipient with a sender-named notice,
pending-offer badges on Trading Center and Game Menu, and a short sound alert.
Sound follows personal mute/volume preferences; repeated snapshots and refreshes
do not repeatedly chime for the same offer.

[Downloads and previews](DOWNLOAD-v0.3.76.md) · [Notification guide](TRADE-NOTIFICATIONS.md) ·
[Validation and update notes](UPDATE-v0.3.76.md).

---

# Miniopoly v0.3.75 — Compact, movable Match Activity

Match Activity is a small floating window on the left, with drag, minimize/restore
and reset controls. It remembers its position and minimized state while keeping
the full recent history available. Chat remains independent.

[Downloads and previews](DOWNLOAD-v0.3.75.md) · [Activity guide](MATCH-ACTIVITY.md) ·
[Validation and update notes](UPDATE-v0.3.75.md).

---

# Miniopoly v0.3.74 — Moving portals and ember damage

World Collapse is capped at 3 active portals per world. Portals relocate every
full round. Returned properties keep ownership/upgrades but have two rounds of
burning embers and random repair or medical fees: $75–$150, then $25–$60.

[Downloads and previews](DOWNLOAD-v0.3.74.md) · [World Collapse rules](EXPRESS-WORLD-COLLAPSE.md) ·
[Validation and update notes](UPDATE-v0.3.74.md).

---

# Miniopoly v0.3.73 — Left game panel

Express round progress now sits in the left panel, with a Game Mode hover/focus/
tap explanation. The top evade-token strip is removed; player and turn badges
remain. Trading Center fits below Chat with an incoming-offer badge.

[Downloads and previews](DOWNLOAD-v0.3.73.md) · [Panel guide](LEFT-GAME-PANEL.md) ·
[Validation](UPDATE-v0.3.73.md). Existing rooms can resume.

---

# Miniopoly v0.3.72 — Compact Game Options

One Game mode dropdown replaces the three separate mode rows, with Rounds
beside it. Each mode retains its own saved round choice. Tighter spacing keeps
the additional options while making the default desktop panel about 31% shorter.

[Downloads and previews](DOWNLOAD-v0.3.72.md) · [Entry guide](ENTRY-PAGE.md) ·
[Validation](UPDATE-v0.3.72.md). Existing rooms and preferences are retained.

---

# Miniopoly v0.3.71 — Separate Game Options window

The entry page is left-aligned. Create / Join now focuses on player identity,
avatar and game piece, with a separate Game Options card beside it. Standard,
World Collapse and Countdown each have a rounds selector; additional rules
and personal font settings have their own sections. Phones stack the cards.

[Downloads and previews](DOWNLOAD-v0.3.71.md) · [Entry page guide](ENTRY-PAGE.md) ·
[Validation](UPDATE-v0.3.71.md). Standard is the existing Classic mode; saved
rooms and gameplay are preserved.

---

# Miniopoly v0.3.70 — Compact Game Menu

Six clear categories open left-side flyouts on desktop and expandable sections
on phones. Sound and Hints use checked/empty boxes. Detailed rules, connection
recovery, invitations and host controls stay in their own submenus. Existing
personal preferences and quick actions remain connected.

[Download v0.3.70](DOWNLOAD-v0.3.70.md) · [Menu guide](GAME-MENU.md) ·
[Validation](UPDATE-v0.3.70.md). Existing rooms can resume after updating.

---

# Miniopoly v0.3.69 — Countdown and multiplayer trading

Choose **Express · Countdown** for property survival: build, trade and upgrade,
then protect your holdings from escalating consumption waves. An upgrade shields
its property once; losing your final property eliminates you. Building Permits
retain their free upgrade without a complete set.

The multiplayer Trading Center now exchanges properties and cash with offers,
counteroffers, acceptance and incoming notifications. The host validates every
exchange. [Rules](COUNTDOWN.md) · [Downloads](DOWNLOAD-v0.3.69.md) ·
[Validation](UPDATE-v0.3.69.md).

The proposed World Collapse moving-void/fixed-ending changes are
[documented for review](WORLD-COLLAPSE-REVISION-PROPOSAL.md). Existing World
Collapse gameplay remains intact in this release.

---

# Miniopoly v0.3.68 — Sounds, earthquake cracks and one victory lap

The T-Rex uses your dinosaur screech and footsteps. The Battleship gives one
horn, water during travel and your bell at arrival. Earthquake damage is more
visible and now has ground-rumble audio. The champion takes one victory lap,
then parks with a small idle gesture every two seconds.

[Download the update or review all ten sounds](DOWNLOAD-v0.3.68.md).
The other eight sounds remain available for review. The purple/crimson void is
an original interpretation of the inline reference; the exact GIF is still
needed as a file attachment. [Details and checks](UPDATE-v0.3.68.md).

---

# Miniopoly v0.3.67 — Evade tokens

New Express matches reward property ownership and upgrades with evade tokens.
Earn 1 point per property plus 1 per upgraded home; every 3 points qualifies for
1 token, with at least 3 properties required and a cap of 3 tokens. Counts update
while building and lock just before the first collapse wave. A token saves one
first landing on a void; returning to the same void is fatal.

The mint-and-gold token graphic appears above the board, on player cards and in
landing panels. Click a badge for details. Existing Express saves keep their
original rules; start a new Express match for tokens. See
[update notes](UPDATE-v0.3.67.md), [downloads and graphic preview](DOWNLOAD-v0.3.67.md),
and [the full Express rules](EXPRESS-WORLD-COLLAPSE.md).

---

# Miniopoly v0.3.66 — Champion celebration and piece sounds

A gold trophy numeral, **CHAMPION** title and runners-up pieces beside their
amounts. The winning piece circles the trophy and plays its own sound every four
seconds. All ten pieces also have movement sounds. The Battleship has a broader
foamy wake and leaves fading water along its actual route.

Sound, Volume and Reduced Motion remain available in Game Options. Express /
World Collapse and Classic are retained. See [update notes](UPDATE-v0.3.66.md)
and [downloads and sound preview](DOWNLOAD-v0.3.66.md).

---

# Miniopoly v0.3.65 — Express · World Collapse

Choose Classic or Express in Game Options. Express gives two balanced starting
homes, Building Permits and GO property rewards. After 10, 15 or 20 building
rounds, announced collapse waves continue until one player survives.
See [the full checklist](EXPRESS-WORLD-COLLAPSE.md),
[installation notes](UPDATE-v0.3.65.md) and [downloads](DOWNLOAD-v0.3.65.md).

---

# Miniopoly v0.3.64 — Police car and School bus

The Car now uses the approved animated Police car design, preserving its saved
identifier. School bus joins the chooser with movement and parked animations.
Both leave tracks. Monster truck is not included. The selection spacing fix and
font options remain. See [DOWNLOAD-v0.3.64.md](DOWNLOAD-v0.3.64.md) for packages
and [UPDATE-v0.3.64.md](UPDATE-v0.3.64.md) for installation and validation.

---

# Miniopoly v0.3.63 — Selection spacing fix

Create / Join game-piece artwork has a dedicated preview stage so larger pieces
and their animations stay clear of labels. The large board pieces and two-second
previews remain. See [DOWNLOAD-v0.3.63.md](DOWNLOAD-v0.3.63.md) for packages and
[UPDATE-v0.3.63.md](UPDATE-v0.3.63.md) for installation and checks.

---

# Miniopoly v0.3.62 — Piece sizes and animated setup previews

Pieces use the shoes as their size reference. The selected piece in Create / Join
previews its movement every two seconds, with Reduced Motion respected.
See [DOWNLOAD-v0.3.62.md](DOWNLOAD-v0.3.62.md) for packages and
[UPDATE-v0.3.62.md](UPDATE-v0.3.62.md) for installation and validation.

---

# Miniopoly v0.3.61 — Local font detection

Includes the Nunito, American Captain and Apple Chancery font selector in local
and online multiplayer. Improves native Apple Chancery detection and adds
Check fonts again. The native launcher and browser screens show the version.
Stop hosting and Exit Launcher from the Windows tray before
launching the updated folder; otherwise an older launcher may reopen.
See [DOWNLOAD-v0.3.61.md](DOWNLOAD-v0.3.61.md) and
[UPDATE-v0.3.61.md](UPDATE-v0.3.61.md).

---

# Miniopoly v0.3.60 — Font options

Choose Nunito, American Captain, or locally installed Apple Chancery under
Game Menu → Game Options → Your device → Game font. Choices are remembered
per browser and apply to menus, the board, property panels and results.
Apple Chancery is disabled on devices without that font.
See [UPDATE-v0.3.60.md](UPDATE-v0.3.60.md) for installation and checks.

---

# Miniopoly v0.3.59 - Test package

Repackaged v0.3.58 with updated version labels; gameplay is unchanged.
Express / World Collapse is not included yet.
See UPDATE-v0.3.59.md for installation and testing.

---

# Miniopoly v0.3.58 — Rising championship podium

The championship uses the approved gold column: the winner's portrait rides up
as the podium grows slowly into the scenic backdrop. A large ribboned trophy
has a bold, prominent 1 directly on its face. The selected piece rests beside
the cup without a border or background; name and final net worth anchor the base.
The bold gold title glows gently and stays on one line, shortening to Champion
when space is tight. Shared winners receive equal gold podiums.

Skip entrance settles immediately; Reduced Motion shows still results without
fanfare or glow. Final balances, standings, Hall of Fame, victory-image export,
chat, final-board viewing and independent Return to Create / Join remain.
See [UPDATE-v0.3.58.md](UPDATE-v0.3.58.md). Preview at `/championship-preview`.
Community Festival artwork, fireworks and its 60/40 payout rules are unchanged.

The launcher startup hotfix explicitly restores its window when the BAT starts
or reopens it, including from the tray. It preserves one hosting instance and
the saved Always on top preference. See [LAUNCHER-SHOW-FIX.txt](LAUNCHER-SHOW-FIX.txt).

An already-open game now shows a persistent **The host reset the game** card with
**Join a new game**, separate **Host stopped hosting** / **Connection lost** notices,
and automatic reconnect. Guests return directly to Join after a room reset;
reset notices survive reload until acknowledged. Failed reset requests explain
that the game did not reset, including when an older server needs restarting.
See [UPDATE-v0.3.56.md](UPDATE-v0.3.56.md). Stop hosting and Exit Launcher before
updating, then reload both clients once. Chrome's own unreachable-site page after
refreshing an offline host cannot be replaced by the game.


**Start-Miniopoly.bat** now opens a native floating Windows Game Launcher. It
remembers its position, offers compact view and Always on top, and minimizes to
the system tray while hosting continues. Reopening the BAT shows the same launcher.
Use Host Settings for remembered Local / Online setup; saved games, rules, board
and property guides, and rankings remain in the full browser launcher.

The host’s **Forget seat · Reset everyone** now closes that room and revokes all
its seats. Connected and returning players go back to Create / Join for new rules.
Other rooms, preferences, certificates and completed records are retained.
See [UPDATE-v0.3.55.md](UPDATE-v0.3.55.md) for installation and the Windows checklist.
Native Windows interaction still needs a Windows 11 check; browser/server behavior
and PowerShell syntax are verified here.

The Communities' top-right corner is now Community Festival. Paid Town Tax and
Storm Fund charges build one shared fund across all worlds. The visitor receives
60%; other nonbankrupt players share 40%, including those in Setback. A synchronized
celebration shows every payout and resets the fund to zero. Balances, rankings
and the fund wait for visual arrival; saves and reconnects never pay twice.

The former Bonus rewards/perks are available through Community Chest. Existing
matches start with a $0 fund and retain their seats, holdings, cash and pending
cards. The compact landing UI and local-launcher fix are included.
See [UPDATE-v0.3.54.md](UPDATE-v0.3.54.md) for installation and testing.

Tennis shoes now take full alternating strides: each shoe passes its partner,
plants and pushes back. The battleship has a long naval hull, bridge, masts and
deck guns, with calm water at rest and directional foam while moving. The new
coral-and-teal Car is a ninth choice, with spinning illustrated wheels and the
existing one-second tire tracks. The eight existing piece IDs and choices stay
available, including Blimp. Cat and Dog artwork remains unchanged.

Open `/pieces-preview` for the standalone animated review, with idle and moving
states, direction/speed controls, pause and replay. Nunito and all SVG artwork
are embedded in the downloadable HTML. See [UPDATE-v0.3.51.md](UPDATE-v0.3.51.md).

Create/Join retains the compact two-tile layout, Male/Female avatar toggle,
photo upload/defaults, one combined confirmation and taken-piece checks.
Nunito, board scenery, special-place media and hosting settings remain.

Launching through **Start-Miniopoly.bat** now carries a private avatar preference
between Local Multiplayer and Online Players on the host PC. Your uploaded photo
is selected by default on both Create and Join, including after the online
password screen and a hosting restart. Replacing/removing it or explicitly
choosing a preset updates that shared default. Confirm avatar is still required
for each new form. Friends keep their own choices, and existing room avatars and
moving pieces are unchanged. See [UPDATE-v0.3.44.md](UPDATE-v0.3.44.md).

The earlier viewer-cash landing badge from v0.3.43 is superseded by v0.3.52.
Money and rankings still wait for visual arrival during movement; open landing
popups use the active player’s current authoritative cash.

Choosing **Host a local game** or **Host an online game** now carries that choice
through Host Game Setup. After Start and the readiness check, the game opens
**Create Room** directly with the remembered rules and name. Confirm an avatar
and create the room; there is no second Host click on Game Launcher. With automatic
opening disabled, the setup button says **Continue to Create Room**. Saved-game
resume keeps its separate route; general setup still opens Game Launcher. Room
creation remains an explicit action. See [UPDATE-v0.3.42.md](UPDATE-v0.3.42.md).

**Gravity Pull can now be ranked.** Select 10, 15 or 20 rounds, $1,500 starting
cash and Ranked in Host Game Setup, Game Launcher or Create Room. Individual and
Gravity Pull keep separate top-three records for each round limit. Use the World
shift selector in either Hall of Fame, or on the Game Launcher home record card.
Rule changes make a match practice; existing
practice games and historical results are not promoted. Individual scores stay in
`legendary.json`; Gravity Pull scores use `legendary-gravity.json` in the shared
save folder. Net-worth scoring and gameplay are unchanged. See
[UPDATE-v0.3.41.md](UPDATE-v0.3.41.md).

Game Launcher connects **Saved Games**, **Local / Online hosting**, **Learn the Game**
and the **Hall of Fame** to the running game. The learning pages show the actual
three 16-space boards and all 28 deeds, including prices and upgrade rent.
Individual and Gravity Pull have separate Legendary records for 10, 15 and 20 rounds with $1,500 starting cash. Completed-match
standings now cover every round preset and Unlimited, separated by starting cash
and world-shift mode; practice finishes are labeled. Unlimited lists places within
each game. No sample scores are shipped and the net-worth formula is unchanged.

The private host console opens at its loopback address; `/setup` holds the existing
hosting controls. The game server exposes `/central` for the hub and preserves `/`
for existing invites and live-game resume. Browser seats are stored locally in a
small room registry alongside the original current-seat key. The game-side hub lists
only rooms authorized by that browser's seat credentials. The private host-PC view
can list local saved-room summaries, but playing still requires the correct saved
seat or a private seat backup. Do not share the owner console URL or seat files.
Completed-match summaries are retained in `match-records.json` in the normal shared
save directory (last 2,000 matches); older finished rooms are imported once without
promoting their results into Legendary records. Existing games keep their saves.

Game Options keeps a visible **Saving…** state when closed and reopened during a pending save. Pending choices remain visible, stalled requests time out after ten seconds, and failed or interrupted saves release the controls. A room departure clears the old request so it cannot lock the next room. Editable fields stay cream; disabled fields use neutral grey, and guest help identifies the host. See [UPDATE-v0.3.39.md](UPDATE-v0.3.39.md).

Property popups now use fresh artwork for each landing and wait for the correct image to load and decode before revealing it. This prevents a previous player's property image flashing during the next landing. Each player card also shows a compact full-name world badge beneath the name. Badges update on piece arrival, including Gravity Pull; money, rankings and authoritative positions keep their existing behavior. See [UPDATE-v0.3.38.md](UPDATE-v0.3.38.md).

**Game Options** now includes rounds/Unlimited, starting cash and **Individual / Gravity Pull** world shifts. In Gravity Pull, eligible pieces gather on the roller’s exact destination; only the roller resolves the landing, while players held in Setback stay put. Shared rules are visible before starting. The host can change world shift during play, effective from the next roll, as well as changing the round limit. Starting cash locks at start. Shared changes show a named before/after announcement to every player, with missed-update delivery and refresh deduplication. Each browser remembers its own sound, volume and reduced-motion preferences. See [UPDATE-v0.3.37.md](UPDATE-v0.3.37.md).

Building Permit property names now open an illustrated upgrade preview: rent before/after, added rent, normal upgrade cost versus $0, and the property's net-worth contribution before/after. The list starts with the highest deed price; switch to largest rent increase for comparison. Inspecting leaves the permit untouched until you choose Use Building Permit · Free. See [UPDATE-v0.3.35.md](UPDATE-v0.3.35.md).

A fanned-card Properties button beside each avatar opens a shared, movable overview of everyone’s holdings. It highlights the selected player, with eight cross-world set counters and details for owners, availability, worlds, mortgages and upgrades. Owned railroads/utilities appear too. Phones use a scrollable drawer. The turn panel keeps larger portraits, ranks, cash and net worth; the detailed My Properties window remains available. Ownership and money still update on arrival. Nunito, personal photos, game pieces, scoring and hosting settings are retained.

Double-click **Start-Miniopoly.bat** to open the floating **Game Launcher**. Choose
Local Multiplayer or Online Players and Start hosting; Host Settings opens the
remembered setup. Open the game, name the room and confirm your avatar and piece.
Saved Games resumes existing rooms; it never starts a fresh match over them.
Existing online passwords, certificates and saves are retained.

Chat is movable and defaults beside the Turn panel. Removed visible tie badges,
named the viewer in payment cash rows, added last-five-round notices, and enlarged
the cat by 30% with 45° vertical facing. The winner screen stays until each player
clicks **Return to Create / Join**, clearing that browser for a fresh room.
Board recovery and free Building Permit upgrades remain available.

See [NEXT-UPDATE-DESIGN.md](NEXT-UPDATE-DESIGN.md) for the proposed activity
notices/timers, trading, ownership styles and scoring changes. These larger
features remain proposals; this release retains existing scoring rules.

One-second between-player world transitions and dramatic three-second
roll-triggered shifts are retained. Equal net worth shares a financial rank,
with shared rank numbers. Money and ranks still update together on arrival.

See [UPDATE-v0.3.42.md](UPDATE-v0.3.42.md) and [INSTALL-COMPLETE.txt](INSTALL-COMPLETE.txt)
for the complete Windows package and review steps. It includes all artwork,
launchers and the verified HTTPS tool. Extract into your existing game folder,
restart the host and refresh both browsers. Saved rooms and HTTPS settings are preserved.

Phones now place the real roll cube, current turn, round, and End Turn control
in the top header. Players expand on demand, and Menu holds the existing game
options and seat backup. The board keeps the available phone width. Larger
screens retain the draggable floating panel. Full Board View keeps phone controls
in the header as well. Nunito remains the font throughout.

Use [HOST-ONLINE-WINDOWS.md](HOST-ONLINE-WINDOWS.md) for the new no-subscription,
no-domain Windows hosting setup. The complete Windows release includes the
verified HTTPS tool; double-click **Start-Online-Hosting.bat** after extracting.
Friends connect through a private HTTPS password page and the usual room invite.
The original `npm start` LAN workflow remains available. New **Save my seat** and
**Restore seat** controls carry your player identity to a changed game address.
The launcher and proxy have automated Linux/browser validation; Windows firewall
and actual public certificate issuance require the documented phone test.

**Saved design preference:** Nunito is the chosen font for all Miniopoly UI and
design previews, including ownership badges. See [AGENTS.md](AGENTS.md) for the
project preference to carry forward in future updates.

Use [TEST-v0.3.13.md](TEST-v0.3.13.md) for the two-device release review.

## v0.3.13 gameplay and portfolio update

**My Properties** now opens the approved Nunito Property Portfolio with live
ownership: Set Progress, My Properties, and All Properties. Artwork badges show
YOURS, the opponent's full name over greyed-out artwork, or Available. The world,
missing set members, mortgage, rent, upgrade stars, and bank holding restrictions
are visible. Search and filters work without changing your holdings.

New rooms default to **Until one player remains**, with no round limit. Fixed
10, 15, 20, 30, and 50-round matches remain available. The host can select **Play
until winner** in a fixed match, including one that has just reached its round
limit, to continue with the same holdings and cash as an unranked match. A match
also ends when only one player remains after bankruptcy. That survivor wins.

Every game now awards another roll for **7 or 11**, after resolving the landing.
The first two consecutive qualifying rolls grant bonuses. A third sends the
player directly to Setback in the current world without a GO bonus for that move.
Any other roll ends the chain. Bonus rolls do not advance the round or give the
opponent a turn. Chain state survives reconnects and host restarts.

Landing on the Setback square is **just visiting**. Only the three-roll rule or
a Go to Setback card sends a player there. While held, the player collects no
rent from any property, railroad, or utility. On their turn they may try a free
**6 or 12** escape, choose a paid roll costing **20 × its result**, forfeit an
eligible undeveloped unmortgaged deed, or use an escape card. Successful escape
rolls move the piece in the same world, grant no bonus and do not advance the
world-shift counter. After three failed free turns, the third result locks a
20× payment; paying reuses that result. Sell assets, forfeit an eligible deed,
use an escape card, or declare bankruptcy if that fee cannot be paid.

Community and Chance card stacks occupy opposite corners of the board center.
Selecting a stack or **Cards** opens the review of **48 cards across six decks**:
Community Chest (10), Chance (10), Lucky Draw (9), Traffic Surprise (9), Community
Bonus (7), and Coastal Bonus (1). Go to Setback is new in Community Chest and
Chance; the existing Escape Setback cards remain. Swap Favor is labeled as a
future feature. All original special-place graphics and landing GIFs remain.
Build an offline HTML card review and Markdown inventory from a running host with
`node scripts/build-card-review.js http://127.0.0.1:3000 /path/to/Miniopoly-Cards-Review.html`.

Ranked records remain limited to 10, 15, and 20-round matches. Endless, extended,
and practice matches do not enter Legendary records. Resumed rooms retain their
selected length and adopt the updated bonus/Setback rules.

The approved floating Turn Panel now controls real multiplayer matches. Its cube
mirrors the existing server-driven 12-sided die animation on every connected
browser. The window shows the current round, player names, the YOU badge, and
active turn. Only the current player can roll or end their turn.

The board center shows its landscape, with Community and Chance deck stacks in
opposite corners. Turn controls remain in the floating panel.
World names appear above the board. Cash, My Properties, Sound, Hints, invitations,
activity, and standings remain available outside the center.

Drag the panel by its handle, or focus the handle and use arrow keys (Shift moves
farther). The browser remembers its position and collapsed state. After five idle
seconds it fades to 65% opacity. Interaction and a new turn restore full visibility;
rolling, movement, and keyboard focus keep it visible. **Keep fully visible** turns
fading off. **Reset Turn Panel** recovers its starting position. Phones start with
a compact Roll bar and snap between the top and bottom. The compact action becomes
End turn when that action is available.

Purchase/payment dialogs and property inspection take priority over the panel.
View Worlds supports a read-only board preview and **Return to live board** above
the board. A new roll or active-player change returns to the live board. Property
cards can be inspected by mouse or keyboard without changing ownership.

To test locally, stop the old server and extract this release into a new folder.
On Windows run `start-windows.bat`; on Mac run `bash start-mac.command`. Keep the
same configured `DATA_DIR` to retain saved rooms. Refresh each browser and confirm
**PROTOTYPE v0.3.13**. Join from a second device and check the host's network address.
Node.js 18+ is required. No dependencies were added. Run `npm test` for gameplay,
window interaction, and public-asset checks.

The original design sample remains under **Preview updated board → Try the floating
Turn Panel**. Its rolls are examples. To build a self-contained sample, run
`node scripts/build-turn-panel-preview.js /path/to/Miniopoly-Floating-Turn-Panel.html`.
The downloadable game release requires the local Node server for multiplayer.

## Property Portfolio mockup

Select **Preview updated board → Try the Property Portfolio mockup** for an
isolated design review. **Set Progress** prioritizes nearly completed color sets
and shows the owner and world of every member. **My Properties** collects your
deeds; **All Properties** adds search and filters for world, owner, and set/type.
Select a card for rent, upgrade stars, and set details. World filters preserve
the whole color set in Set Progress so cross-world collections stay understandable.
Large badges across the artwork say **YOURS**, the opponent's full name, or
**Available**. Opponent-owned artwork is greyed out; your deeds and unowned
available deeds stay in color. Bank-held deeds distinguish an open Foreclosure
Market from a deed that opens next turn.

Ownership is fictional: Christopher Notte is the sample player, with Alex Morgan
and Dell PC as opponents. The sample includes unowned, mortgaged, and bank-held
deeds. **Sample match → Fresh start** demonstrates the empty collection. This
preview does not connect to a room or replace the live My Properties window.
The original special-place graphics are unchanged.

Build the self-contained HTML, including all three property atlases and Nunito:
`node scripts/build-portfolio-preview.js /path/to/Miniopoly-Property-Portfolio-Preview.html`.
Extract and open that HTML to review without starting the game server.

## Special-space artwork review

For the three special-space artwork samples, select **Preview updated board →
Review special spaces & animations**. The comparison shows the current and proposed
railroad, Community Chest, and Setback beside the original property artwork.
**Play landing** replays the original railroad/chest GIFs with the new scenery;
Setback retains its static sign and existing landing-notice motion. **Show idle**
stops playback. Motion is off initially for browsers requesting reduced motion.
This review does not change the live board, rules, purchases, or animation files.
Build a downloadable single-file review with
`node scripts/build-special-spaces-preview.js /path/to/Miniopoly-Special-Spaces-Review.html`.

## Previous typography and graphics update

Nunito is now the shared typeface across the lobby, all three boards, property
cards, dialogs, player panels, and review page. Bold headings, lighter labels,
and normal letter spacing keep letters distinct. The font is bundled locally
under the SIL Open Font License in `public/fonts/Nunito-OFL.txt`.

The homepage welcome label uses a larger responsive font (16–20 pixels), with
room to wrap on narrow screens. It is easier to read on laptop displays.

The floating Players list gives each full name its own line. The YOU badge and
active-turn label sit below it, and long names wrap within the panel.

The approved storybook graphics now cover every world. Richmond Hill keeps its
live-oak gardens and sunset marsh. The Communities adds seven distinct garden
neighborhoods and a peaceful park center. Coastal Georgia adds seven waterfront
properties and a breezy estuary center. Each of the 22 houses has its own trees,
planting, paths, and surroundings. Rounded typography, cream deed cards, modern
buttons, and original Design Lab upgrade stars appear across all three boards.

World shifts on rolls of 6 or 12 continue to follow the existing game rules;
the destination board now keeps the illustrated style. The purchase dialog and
My Properties collection use the same artwork as the board.

To review, select **Preview updated board** on the homepage, choose a world and
an upgrade level, then open a property card. The review uses example players
and does not change rooms or saves.


---

# Richmond Hill graphics release (v0.3.7)

Richmond Hill now uses a coastal storybook style: eight distinct house illustrations,
salt-marsh scenery, warm cream deed cards, and coordinated teal-and-gold controls.
The purchase dialog, My Properties collection, and board share the same local SVG
artwork. The Communities and Coastal Georgia retain their board artwork.

Revision 2 adds rounded Fredoka headings and Nunito labels, with richer illustrated
gardens unique to each property: live oaks, palms, flowering crepe myrtle, willow,
cypress, pines, fern beds, and magnolias. The center keeps its compact layout with
more detailed marsh grass, foliage, water reflections, and sunset lighting.
Both fonts are bundled locally under the SIL Open Font License; their licenses
are included in `public/fonts`.

Select **Preview updated board** on the homepage to open the graphics review.
The review page lets you switch worlds and inspect property cards without creating
a room or changing a saved match. Its player panel uses example players.
Popup actions use flat, rounded buttons. Property cards and the deed collection
show upgrades using the original Design Lab star artwork, with three slots and
dimmed unearned stars. The review page's upgrade selector previews zero through
three stars without changing a saved game.

On phones, working turn controls appear above the board, with player and invitation
panels below it. The disabled solo-game control rail is hidden at every screen size.
Existing gameplay, room saves, and multiplayer rules are retained.

Run `npm start` as before; no new dependencies or Internet access are needed for the
graphics. Run `npm test` for gameplay regression and public-asset serving checks.

# Mini-opoly Wi-Fi Multiplayer v0.3.7 — Floating Champion Crown

A focused visual update to the v0.3.6 Championship Celebration: first place now wears an animated golden crown that floats up and down gently (7 pixels over a 3.2-second loop) and glows after the fireworks finish. The Legendary Hall of Fame crown also floats. **Reduce Motion** disables both animations, and the first-place announcement, fireworks, confetti, award scoring, and game logic remain unchanged.

The crown appears automatically on the final Match Results overlay. Click **View Final Board** to hide the overlay or **Results** in the header to bring it back. You can still use **Replay Celebration** to see the one-time confetti/fireworks again. The crown keeps floating as long as the results screen is shown.

Install: Stop the current Windows host with **Ctrl+C**, extract this new ZIP in its own folder, start `start-windows.bat`, then hard-refresh both browsers. Confirm **PROTOTYPE v0.3.7**. Your existing room code, saved seats, legendary records, chat, attachments and gameplay data remain in the host's shared save directory; do not click Restart Test Match unless you intend to reset the current match.

Run `npm test` to check the release. The CSS animation can be verified visually on Windows and Mac, including after the celebration particles finish.

---

# Mini-opoly Wi-Fi Multiplayer v0.3.6 — Championship, Legendary & My Properties

Build on v0.3.5, retaining all three world boards and their artwork, turn-order highlights, world-shift effects, room chat and attachments, foreclosure and SetBack rules, and persistent room saves.

## What is new

**My Properties — an on-demand deed collection.** Press **🏠 My Properties** in the left-hand Turn Controls panel. It works during other players' turns, and a View My Properties link also appears during purchase/turn-action/payment decisions. It shows deeds across Richmond Hill, The Communities and Coastal Georgia, grouped by property color. Completed sets are marked COMPLETE. Incomplete sets list the *exact* property names still needed. Each deed lists its original price, current owner or bank/foreclosure status, and owned upgrades where relevant. Railroads and utilities have separate sections. Unstarted color groups are collapsed to avoid clutter. You can close the window without altering the match.

**Championship Celebration.** After the final turn, every browser automatically displays the same Windows-host-calculated final rankings. First place has a large golden name and Net Worth, glowing trophy, confetti and three short fireworks. Other places appear in less prominent rows. A **View Final Board** button hides the awards while keeping the board and Chat available; **🥇 Results** in the header reopens them. **Replay Celebration** replays the local visual effects. The overlay is per-device and does *not* change gameplay. Motion respects the operating system's Reduce Motion setting, and the fanfare respects the sound switch where available. Ties for the top net worth display co-champions.

**Legendary Hall of Fame.** Press **🏆 Hall** to browse separate all-time Top 3 net worth performances for **10, 15 and 20 rounds**. Each completed *ranked* game's individual players may qualify, so a player can appear more than once. Scoreboards are host-wide and persist in `%USERPROFILE%\.miniopoly-wifi\saves\legendary.json` separately from individual game rooms. Records show name, final net worth, date and player count. The Windows host calculates worth as cash + unmortgaged purchase-price value + 50% of the cost of completed upgrades (the same formula used in the existing v5.42 leaderboard). Incomplete games and **Restart Test Match** practice resets don't enter records. Old 12/30-round saved matches still load but are not ranked in these categories.

**New game / rematches.** The Create Room form now offers **10, 15 or 20 rounds** with an optional Ranked checkbox, ON by default. Upon a completed game the host can choose **Play Again · Ranked** to start a fresh qualifying game *without losing the room code and player seats*. **Restart Test Match** remains an explicitly unranked practice reset, preserving the same room code. A ranked rematch resets game cash, properties and turns, but not previously earned Hall records, room messages or shared attachments.

**Finishing corrections.** The round counter now stops at 20/20 (or the selected round count), instead of showing 21/20. The active-player highlight and arrow disappear when the match ends. Saved finished games from older releases gain a display-only awards snapshot, but are **not** retroactively entered into Legendary records.

## Install without losing your rooms

1. Stop the old Windows game server (Ctrl+C).
2. Back up `%USERPROFILE%\.miniopoly-wifi\saves\rooms.json`. Keep the backup private: it includes secret reconnect tokens. After this upgrade, also back up `legendary.json` to preserve Hall records.
3. Extract **Mini-opoly-WiFi-Multiplayer-v0.3.6-Championship-Legendary-Properties.zip** to a new directory, then double-click `start-windows.bat` in *that directory*.
4. Refresh Windows using **Ctrl+Shift+R**, then the MacBook using **Cmd+Shift+R**. Both must show **PROTOTYPE v0.3.6**. Do not click Restart Test Match unless you actually want an unranked fresh game.
5. Open **My Properties** and **🏆 Hall** to check the new windows. Complete a qualifying match to test awards; use the host's ranked rematch button to keep the same room and seats.

**Tests:** 52 Node.js regression and integration checks passed, including independent 10/15/20 tables, top-three trimming, score persistence after restart, legacy finish migration, reset isolation, card/foreclosure logic, and multiplayer chat. An on-device Windows + Mac browser test remains necessary for visual appearance; navigation to locally hosted pages was blocked by the browser test environment.

---

## Prior release notes (historical)

# Mini-opoly Wi-Fi Multiplayer v0.3.5 — Minimalist Hints & World Shift Transition

This build keeps the original three boards, Preset 5 styling, custom GO cards, Town Tax art, room chat with photo/PDF sharing, persistent room code, synchronized purchases, rent, SetBack, foreclosures, and player seats.

## New in v0.3.5 — Players turn-order panel

- The board center now shows **all 2–4 players** left of the 3D die, in real match order.
- The current player has a world-colored highlighted row and arrow. The local browser player's seat is tagged **YOU**, independently of whose turn it is.
- The **Round** badge stays right of the die. Permanent World Shift rules remain in Helpful Hints.
- A small turn-status bar below the player / die / round row changes between **YOUR TURN**, **WAITING FOR [PLAYER] TO ROLL**, **DECIDING**, **PAYING RENT**, and other turn phases.
- Active highlight animates briefly only when the server turn changes (not on every state update).
- Wi-Fi World Shift rolls now show **WORLD SHIFT IN PROGRESS… STAND BY** briefly after the die settles, before the piece begins moving on the destination board.
- Styling is shared across Richmond Hill, The Communities, and Coastal Georgia. Original cards, banners, rooms, purchases, rent and chat stay intact.

## UI / UX additions retained from v0.3.4

1. **Helpful Hints toggle.** Added a **💡 Hints On / Off** control beside Sound. When hints are on, hovering key board objects shows a short help tooltip instead of permanently displaying more rule text on the board.
2. **Cleaner center board.** The always-visible **“6 or 12 = WORLD SHIFT”** line has been removed from the center panel to reduce clutter. That information now appears in hover help on the round indicator and die.
3. **World Shift transition message.** Before a board shift completes, players now see a brief animated message: **“World Shift in progress… stand by”** so the transition feels intentional and easier to follow.
4. **Persistent preference.** Helpful Hints remembers its last on/off state in the browser.

## Regression status

- **47 automated Node.js tests passed with this build** with this build.
- Multiplayer rules, room persistence, purchases, rent, cards, SetBack, foreclosures, chat, and file sharing remain intact.

---

## Earlier gameplay changes retained from v0.3.3

## Gameplay changes

1. **Car direction corrected.** On all worlds, the route advances east/right along the **top**, south/down on the **right**, west/left along the **bottom**, and north/up on the **left**. The sprite faces its actual direction during every 0.69-second movement step and after parking. Previous v0.2.8 orientation used the opposite route, causing the car to drive backward.
2. **SetBack escape menu.** When someone lands on SetBack, the usual card announces the restricted state. After acknowledging the card, the **SetBack Escape Options** sidebar button allows the player to surrender an eligible deed or use an Escape SetBack card immediately. Free and escape payment rolls become available when that player gets their **next turn**. Restriction lasts up to **two failed rolling turns**, as in the previous version.
3. **Free attempt:** Roll 6 or 12 to escape, then move that many squares. Other results leave the player in SetBack and consume a restricted rolling attempt; there is no movement. After two failed turns, the next turn is unrestricted.
4. **escape payment:** Choose **Roll & Pay escape payment** to roll once. The fee is **$20 × the 1–12 result** (from $20 to $240). Once paid, the same roll moves the player immediately. The fee is server-calculated, and neither player can change or reroll it. If cash is insufficient, the roll and fee remain **locked** in a escape payment Payment dialog: sell upgrades or deeds, then click **Pay escape payment**, or forfeit a qualifying deed to cancel escape payment and escape without moving. Forfeiting gives no cash. A player cannot start a new roll while escape payment is pending.
5. **Escape SetBack cards:** Added to **Community Chest**, **Chance ?**, **Lucky Draw**, and **Traffic Surprise** decks (plus the Community Bonus perk deck). Kept cards use one saved perk slot (max two); using the card removes it and clears the SetBack restriction. The older **Tow Voucher** continues to work. Cards are not a cash reward, and no dice roll is required to use one.
6. **Property forfeiture:** A SetBack player may surrender **one undeveloped, unmortgaged deed** to the bank, with **$0 immediate compensation**, and leave SetBack. Improvements must be sold normally before a deed is eligible. Surrendered deeds are **not** immediately available for normal purchase landing prompts; they enter the separate foreclosure market. Selling a deed normally to raise cash is **not foreclosure** and gives the usual 50% bank resale amount.
7. **Foreclosure Market:** The new **🏦 Foreclosures** button in the header shows all bank-held lots, seller, half-price amount and countdown. Its badge counts lots whose bank-holding period has ended. After **one complete subsequent player turn**, other players may purchase at **50% of the original purchase price**, rounded up to the nearest dollar. The **former owner must wait three round transitions** and can reclaim at that same price only if nobody else has bought it. A purchase requires the active player, sufficient cash, and a normal pre-roll or post-landing Turn Actions phase. The server applies cash and ownership changes for both screens; a deed cannot be bought twice. The original owner does not get priority over competing buyers.

**Important timing distinction:** A "round" here is Mini-opoly's numbered global round; it increments when play cycles back to Player 1. The three-round former-owner wait uses that existing counter; the bank holding period counts a completed player turn, *not real-world minutes*. We can change this to an exact number of individual player turns if you prefer. Foreclosure lots persist after a Windows-host restart, and the market is reset by **Restart Test Match**.

## Upgrade — keep room code, chat, and saves

1. On Windows, stop the current v0.3.2 server using **Ctrl+C**.
2. Back up `%USERPROFILE%\.miniopoly-wifi\saves\rooms.json` (this contains secret reconnect tokens; keep it private).
3. Extract the v0.3.4 ZIP into its own new folder. Run **`start-windows.bat`** from **that** folder.
4. Refresh Windows using **Ctrl+Shift+R** and Mac using **Cmd+Shift+R**. Check that both show **PROTOTYPE v0.3.4**. Both clients can return to the saved room (e.g. FT45QR) automatically.
5. For a clean rule test, the Windows host may click **Restart Test Match**, which preserves the room code and player seats but **does reset the board, holdings, foreclosures, and current turn**. Do not click this if you want to preserve an ongoing match.

## Two-computer acceptance checks

- Drive the car along the top and bottom edges; it should never appear to reverse. Confirm corner turns face the direction of travel on Windows and Mac.
- Reach SetBack and verify the normal landing animation/card. A restricted player sees **🚧 SetBack Escape Options**, where the correct available actions appear. Test a 6/12 free roll and a failed roll on subsequent turns.
- Test escape payment: **rolling 7 costs $140**, for example. Both screens should display the same payment and movement. If short of cash, the fixed escape payment remains until payment or surrender.
- Forfeit an undeveloped deed and check the **Foreclosures** button. It is held until at least one subsequent player finishes their turn; then other players get the buy option. The former owner can reclaim only beginning three round numbers later, if unsold. Price is always half the original deed purchase price, not net worth.
- Draw an **Escape SetBack** card from Chance / Chest or earn one through Community Bonus, then use it in SetBack. Card disappears from the saved inventory.
- Reload both browsers and restart the Windows server without resetting the match. Check the same room, foreclosure inventory, ownership, chats, and cash balances.

## Known limitations / design notes

- **Foreclosure is a deliberate new Mini-opoly house rule, not standard Monopoly foreclosure.** There is no auction yet and no negotiated debt resolution. The market is accessible across all worlds.
- The existing original game still has additional Chance and perk effects waiting for full multiplayer migration; these new escape cards are added to the currently active multiplayer decks.
- The escape payment roll is not reversible once selected. If players want the amount to be $20 per movement step rather than the die face itself, that would be a separate rule change.
- The game does not yet have a direct foreclosure alert in chat or an auction/bidding phase. Foreclosure purchases are first-come on authorized turns, using host-authoritative state.
- New card and market animations are basic; the existing SetBack effect, 3D die animation, player movement and UI art remain. A complete Mac/Windows visual verification is still needed.

**Previous-version tests:** 45 Node.js tests passed, including card/source and SetBack menu wiring, fixed escape payment payments, landlord/money preservation, half-price ownership transfer, three-round repurchase lock, car route mapping, room persistence and prior chat/attachments regressions. Run `npm test` in the extracted project folder for verification.

---

# Mini-opoly Wi-Fi Multiplayer v0.3.2 — Photo Sharing, Net Worth Capsules & View Worlds

This update builds on v0.3.1, preserving **the complete three-world board, original gameplay, server-controlled turns, existing chat, and persistent room FT45QR (or your own saved code)**.

## New features

- **Photos and files in room chat:** Open **Chat**, choose **📎 Share photo / file**, and select a file. Images (PNG, JPG, GIF, WebP) appear inline for other room players; PDFs and plain-text files appear as downloadable links. Uploads are available throughout the match, including while waiting for another player. Text chat still works as before.
- **Attachment limits:** 2 MB per file; up to 20 MB total stored per room. Allowed types: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.pdf`, `.txt`. Unsupported file types and disguised content are rejected; no SVG, Office macros, executable programs, or HTML are accepted. Text files have a smaller 256 KB limit.
- **Room protection:** Files are stored on the host PC **outside the public website directory** and require a valid current player-room credential to view or download. Files and messages survive host restarts. Old attachments are deleted from disk when their messages expire from the 80-message chat history. This is a **trusted-LAN feature, not a secure internet file-sharing service**—there is no HTTPS or end-to-end encryption.
- **Leaderboard:** Net Worth appears in a dark teal rounded **capsule aligned to the far right of the player-name row**. Cash moves to a smaller supporting line underneath. The original player names, colors, artwork, and cash/net-worth calculations are unchanged.
- **🌍 View Worlds button:** A visible header control now opens the original World Explorer with previews of **Richmond Hill**, **The Communities**, and **Coastal Georgia**. Previewing does not alter the board the player occupies, dice, or turn state. The existing Worlds side tab is retained.
- **Version labels:** The host and both browsers display **PROTOTYPE v0.3.2**.

## Upgrade on Windows without losing your saved room

1. Stop the old host using **Ctrl+C**.
2. Extract this ZIP into a **new folder**. Keep v0.3.1 as a fallback.
3. Back up `%USERPROFILE%\.miniopoly-wifi\saves\rooms.json` if you want a rollback point. **Do not share the save file**—it contains seat credentials. Existing saves and new attachments live alongside this shared location, outside versioned game folders.
4. Start `start-windows.bat` from the **v0.3.2** extracted folder.
5. Hard-refresh Windows (**Ctrl+Shift+R**) and MacBook (**Cmd+Shift+R**), and confirm v0.3.2 on both. Rooms and seats should reconnect automatically.
6. You don't need to click **Restart Test Match**—doing so resets the game. Your current room and chat stay available automatically.

## Two-computer acceptance check

1. Open room Chat on Windows; send a small PNG or JPG. MacBook should see an inline picture without refreshing. Click to download it.
2. Upload a small PDF from Mac; Windows should see a file link it can download. Send regular text messages both ways.
3. Observe the **Net Worth capsule beside each name** on the leaderboard, aligned to the right, with Cash on the second line.
4. Click **🌍 View Worlds** in the header. Choose The Communities, return, then choose Coastal Georgia. Confirm your piece and turn did **not** change.
5. Restart only the Windows server (not the match); check that the same room and its recent shared attachments remain visible.

## Safety and known limitations

Sharing is room-wide, not a direct message, and not end-to-end encrypted. Other connected players can download shared content. Avoid sharing private or sensitive documents. Uploaded files count toward the host's storage usage, and this version does not provide a moderation/deletion panel; it is intended for trusted family/friends on the home network. Uploads larger than 2 MB will be rejected. Browsers may warn about downloading uncommon PDFs or files. The attachment size/storage limits are intentionally conservative for testing. Do **not** expose the local HTTP server publicly without additional authentication, TLS, and security review.

All existing gameplay limitations from v0.3.1 (trading negotiations, auctions and advanced cards) remain; no game-economy rules were changed here.

**Testing:** All 38 automated tests passed, including room-authenticated uploads, access restrictions, file-type validation, persistence, and feature wiring. A live screenshot check at laptop size remains to be completed on Windows and MacBook because the test browser environment blocked local navigation.

---

# Mini-opoly Wi-Fi Multiplayer v0.3.1 — Layout Optimization + Room Chat

**This build adds live text chat for 2–4 connected players and refines the 15-inch MacBook layout.** The three worlds, GO art, Town Tax images, dice and car animations, buy/rent windows, turn order, and financial rules are unchanged.

## New in v0.3.1

- **Room chat:** Open **Chat** in the right-hand panel (or **💬 Chat** in the room header). Type a message and press Enter or Send. All players in the same private room receive it automatically via the existing live connection; messages show the player's name and a local time.
- **Works while waiting:** All players can chat even when it isn't their turn, before and during matches. Chat is not a negotiation or transaction feature, and sending messages never affects the current turn.
- **Chat persistence:** The most recent **80 messages** are saved with the existing room in `~/.miniopoly-wifi/saves/rooms.json` on the Windows or Mac host and remain available after restarting the server or clicking **Restart Test Match**. Room code and seats are preserved.
- **Basic protections:** Chat requires an authenticated player seat, disallows empty/overlong messages (280 characters maximum), throttles rapid sending, and displays received messages as plain text rather than HTML.
- **Updated right panel:** More comfortable width on laptops, an active-turn status strip, and four tabs: **Perks / Activity / Worlds / Chat**. Activity is the initial tab so players can see match events at a glance. The full board continues to fit the viewport; the right chat panel scrolls independently.
- **Spectator instruction:** When another player is up, the center shows **Waiting for [player] to roll** instead of telling you to tap the die. The host server remains the authority for rolls and gameplay.
- **Full Board View:** Still available; clicking header Chat leaves Full Board View and opens the room chat panel. No match reset occurs.

## Install / upgrade on Windows (same room code)

1. Stop the existing Mini-opoly server with **Ctrl+C** in the Windows terminal.
2. Extract this ZIP into a **new folder**. Keep your v0.3.0 folder as backup.
3. Start `start-windows.bat` from the newly extracted v0.3.1 folder. Do **not** launch the batch file from the old folder.
4. Open `http://localhost:3000` on Windows and refresh the MacBook using your Windows LAN URL (for example, `http://192.168.0.87:3000`). Use **Ctrl+Shift+R** on Windows and **Cmd+Shift+R** on Mac.
5. Confirm both browsers display **PROTOTYPE v0.3.1**. The same private room code and seats should reconnect automatically.

**Back up** `%USERPROFILE%\.miniopoly-wifi\saves\rooms.json` before upgrading if you need to preserve the current test match. This file also contains reconnect tokens and chat history: do not share it publicly.

## Verify chat on two computers

1. Click the **Chat** tab on the Windows screen, write `Hello Mac`, and press Send.
2. Open **Chat** on the MacBook. Confirm that `Hello Mac` appears with the Windows player's name.
3. Reply `Hello Windows` from the MacBook, and confirm the message appears on Windows without refreshing.
4. Roll the die from the active player's computer and check that movement and turns work while chat stays available.
5. Restart the host server and reopen the room; previous chat messages should be present. **Restart Test Match** should reset gameplay but preserve room chat and the same code.

## Notes and limits

- Chat is **room-scoped**, not a public chat service. It is saved **on the host computer**, and other authenticated players in that same room can see the recent history. It is not end-to-end encrypted, and local HTTP traffic is not encrypted; use it only on trusted networks until HTTPS is configured.
- There is no direct message, file sharing, moderation panel, or per-message deletion feature yet. Do not share passwords or personal information in chat.
- The MacBook UI was checked with an isolated Chromium preview at 1288 × 755, including Chat tab visibility, panel height, and no page scrolling. Server synchronization and persistence were verified in tests. **A full live Windows–Mac screenshot test still needs your confirmation**, because this environment blocks browser navigation to local test servers.
- This is a UI/chat update, not a complete implementation of trading, auctions, or advanced cards.

---

# Mini-opoly Wi-Fi Multiplayer v0.3.0 — Laptop UI Refinement

This release refines the MacBook/Windows laptop experience without changing multiplayer gameplay rules, saved-room location, property data, or world artwork.

**Changes:** (1) one compact game header with room, round and Full Board View; (2) slightly narrower multiplayer sidebar while preserving server-authoritative Roll and End Turn; (3) hidden *inactive duplicated* board toolbar in laptop mode, with a working Sound toggle in the sidebar; (4) board and leaderboard centered as a single visual group; (5) a readable, stacked **Cash / Net Worth** leaderboard at laptop sizes; (6) spectators see a waiting-for-player prompt rather than being invited to roll. The world banners, GO art, Town Tax animation and car direction are unchanged.

**Update on Windows:** Stop the old host with Ctrl+C, extract the v0.3.0 ZIP to a new folder, and start `start-windows.bat`. Refresh Windows Ctrl+Shift+R and Mac Cmd+Shift+R. Confirm `PROTOTYPE v0.3.0`. Your private test room and seats still live under your Windows user profile (`.miniopoly-wifi/saves/rooms.json`). Back up the save file before updating; do not use **Restart Test Match** unless intentionally resetting the match.

**Visual test:** In a 15-inch Mac browser window, confirm all four board edges are visible, the leaderboard shows both Cash and Net Worth, and the left Roll/End Turn buttons work. Open the Sound toggle and Full Board View, then return to regular view. Test on both players: the inactive Mac should see waiting-for-player, and on its turn the roll instruction should become available.

**Limitations:** Some earlier native board tools (Save/New Game) are deliberately hidden in compact play because that standalone game's local controls do not authoritatively control the shared Wi-Fi match. Trading and advanced card actions remain incomplete, as before. At narrower widths the layout may scroll rather than make property names unreadably small.

---

# v0.2.9 — Compact Laptop Layout + Full Board View

**What's new:** On laptop-sized desktop browsers, the game page now uses a compact header, a narrower left player/turn sidebar (210px), collapsible Invite Players and Match Activity sections, and a board iframe sized to the available browser height. The board inside the iframe now scales to fit vertically, with an approximately square playing surface. The leaderboard remains visible; the original game's Perks, Game Log, and Worlds sections are accessed using tabs above them.

**Full Board View:** Click **⛶ Full Board View** near the room/round information to hide surrounding controls and focus on the board. This also hides the board's internal left controls and right sidebar. The room header keeps **Roll Die** and **End Turn** controls available during full-board view, and **Exit Full Board** restores the normal layout. This view does not reload the board or reset a game.

**To install:** On your Windows host, stop the old server with **Ctrl+C**, unzip v0.2.9 into a new folder, and start **start-windows.bat**. Refresh both browsers (Windows Ctrl+Shift+R; Mac Cmd+Shift+R). Verify **PROTOTYPE v0.2.9** in the top-right corner. **Persistent room codes and seats remain unchanged** on the same host account. Avoid **Restart Test Match** unless you intentionally want to reset the game.

**Still the same:** All three world designs and GO cards, Design Lab Preset 5, Town Tax animation, 3D 12-sided die, token direction and speed, landings, purchases, rent, cards, server-authoritative gameplay, and room persistence. This release is a **visual layout update**; multiplayer game rules have not been changed. If the browser content is shorter than ~780 pixels, the layout compacts further. Smaller phone/tablet widths retain their scrolling layout rather than squeezing the board to illegible sizes.

**Quick check (MacBook):** Open the Wi-Fi address; confirm all four edges of the board are visible. Click **Full Board View** and **Exit Full Board** without losing your room or turn. Open **Invite Players** to copy the same room code, and test **Perks / Log / Worlds** tabs.

---

## v0.2.9 — car facing direction

The original red car token now faces the direction of each segment it drives:
left along the bottom, up along the left, right along the top, and down along
 the right. It turns at corners, and its parked orientation is updated too.
This is a visual-only change: the 12-sided die animation, ~0.69-second step
movement, purchases/rent/special spaces, saves and existing room codes are
unchanged. Other player tokens are not rotated.

To upgrade: stop the Windows host (Ctrl+C), extract this package to a new folder,
run `start-windows.bat`, and hard-refresh both browsers. The shared saved-room
location should preserve the room code; keep a backup of your existing saves.
Both clients should display **PROTOTYPE v0.2.9**.

# v0.2.9 — Design Lab Preset 5 applied

Includes the uploaded Preset 5. Town Tax in Richmond Hill uses the imported static PNG and activated GIF. Keeps custom GO tiles for all three worlds, persistent rooms, dice/movement, landing actions and live purchases/rent. **Gameplay prices and rules were not changed.** See `APPLY-PRESET-5.txt` for installation details. The tokenLane settings are kept in `design-lab-preset-5.json` but are not dynamically used by this game's board renderer.

# Mini-opoly Wi-Fi Multiplayer v0.2.9 — Three World GO Cards

**For the Windows-hosted / MacBook-joined local multiplayer game.** This build uses the existing Mini-opoly v5.42 boards and custom banners. The host runs Node.js 18+; other players open a browser. No `npm install` required.

## Installation (keep the SAME six-character room code)

1. On Windows, press **Ctrl+C** in the window running the older v0.2.4 server.
2. Extract this ZIP into a **new folder**. Keep your previous folder as a backup.
3. Double-click **`start-windows.bat`** in the **new** v0.2.9 folder.
4. Windows opens **http://localhost:3000**. The MacBook opens the **same Windows LAN address as before** (`http://192.168.x.x:3000`, using your actual IP). Refresh using Ctrl+Shift+R on Windows or Cmd+Shift+R on Mac.
5. Both should display **PROTOTYPE v0.2.9**. Your previous room code and player seats should load automatically; use **↻ Restart Test Match** to test from round 1 in the same room.

**You do not need to copy the `saves` folder if you are upgrading from v0.2.3 on the same Windows user account.** Both builds share `C:\Users\YOUR_NAME\.miniopoly-wifi\saves\rooms.json`. **Back up that file before upgrading** if you want a rollback point. Player reconnect tokens are in the file—do not share it. If you are upgrading directly from v0.2.2 or earlier, copy your old `saves/rooms.json` into the new v0.2.9 folder before starting, so it can be imported.

> New tests should start with **Restart Test Match**. An in-progress room from an older build may have a previous saved turn phase; the reset clears old positions/deeds while preserving the room code and seats. This is a *reset*, so avoid it if you want to preserve current match progress.

## Preserved from v0.2.5 — special-space landing animations

After the 12-sided die settles and the piece moves around the board, **both browsers now play the same ~2.1-second special-space reveal** before opening the existing purchase / card / bank-payment decision window. Animations cover **Community Chest, Lucky Draw, Traffic Surprise, Chance, Community Bonus, Coastal Bonus, Setback, Town Tax, Storm Fund, GO, utilities and railroads**. The current tile gets a highlight, and a readable themed animated reveal shows the server-selected card or landing outcome (where available). No money or card result is generated by the animation: all financial rules remain server-authoritative. Setback no-movement rolls also show the effect. With reduced-motion accessibility preferences the animations skip while the correct decisions still appear.

**Recommended test:** Run on Windows and Mac; roll until Chance, Chest, Setback or a utility. Confirm dice → piece movement → special reveal → landing decision on both machines. Reset Test Match if you need to repeat. The room code is unchanged. Clear your browser cache with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac).

## Updated gameplay

### 1. Property, railroad or utility — Buy or Pass

The server pauses when the active player lands on an unowned deed. Buy deducts the **actual v5.42 price**, assigns ownership on the host, and opens **Property Purchased!** with the **existing board property image** (where available). The next actions are **Trading, Upgrade, Perks, End Turn**. Pass opens the same Turn Action Center. An unowned deed is **not automatically auctioned yet**.

### 2. Landing on another player's deed — rent decision

A **Rent Due** window names the landlord and shows the rent. Nothing is deducted until **Pay Rent** is clicked. Only the current player may pay. Other players see the waiting state. Railroad rent scales with ownership ($25 / $50 / $100 / $200). Utility rent is 4× the roll with one utility, or 10× with two. Standard house deeds use the existing base rent and upgrade multipliers.

If cash is insufficient, select **Sell Upgrades / Property**. The server pays **50% of a deed's purchase price** for selling a deed to the bank, or **50% of the upgrade cost** per upgrade sold. Sell upgrades first; mortgaged deeds cannot be sold. You can then select **Pay Rent** once you have enough cash. There is also a **Declare Bankruptcy** option; this removes the player from further turns and distributes remaining cash/deeds to the creditor (or releases deeds back to the bank for bank fees). This is irreversible.

**Negotiations** is visibly labeled **Coming Soon** and is disabled. It does *not* forgive the rent or start a trade. Both players must eventually approve a negotiated agreement; that will require its own rules and interface.

### 3. Card draws and special spaces

- **Community Chest**, **Lucky Draw**, **Traffic Surprise**: A randomly selected card from the original v5.42 cash-reward/fee lists appears; positive cash applies immediately, fees present a separate Pay Bank window upon confirmation.
- **CHANCE ? / weather**: Uses the cash reward / penalty subset from the original Chance cards; the more complex world-travel and condition-change variants remain to be implemented.
- **Community Bonus**: A subset of the existing Community Perks reward deck grants cash or saved perks. **Volunteer Crew** gives $25 off the next eligible house purchase; **Helping Hand** blocks up to $100 of a bank penalty; **Tow Voucher** is usable from the turn sidebar during Setback; **Swap Favor** may be saved but swapping is not yet active.
- **Coastal Bonus**: Pays $75.
- **Setback**: Restricts up to two subsequent turns. Roll 6 or 12 to escape and move; other rolls use a turn but do not move. A saved Tow Voucher can remove the restriction before rolling.
- **Town Tax / Storm Fund**: Show a payment dialog for $100 / $125 respectively. Bank fees also allow liquidating assets if necessary.
- **GO**: Preserves $200 landing/passing collection.

### 4. Turn Action Center

After purchase, pass, rent settlement, or acknowledging a card, the player sees **End Turn, Trading, Upgrade, Perks**.

- **Upgrade:** Works for eligible properties with a *complete, unmortgaged color set across the three worlds* (as in the original game), maximum Level 3, and charges the original v5.42 upgrade price.
- **Perks:** Displays saved Community Perks. Automatic benefits and the Tow Voucher mentioned above work; negotiated Swap Favor use does not yet work.
- **Trading:** Opens an explanatory panel; actual player-to-player offers are not implemented in this release.

## What stays from v0.2.4

Original property and player artwork, 1.65-second 3D die animation, ~0.69 seconds per step of piece movement, two-way Windows/Mac synchronization, server-controlled cash and deeds, reconnecting saved seats, and persistent room codes across restarts.

## Suggested two-computer test

1. Have Windows start a new test match; join from Mac using the existing room.
2. Roll until an unowned property/utility is reached. **Buy** and verify the **Property Purchased!** window and picture. Try the four action buttons; **End Turn** to pass control.
3. Land on a Community Chest / Lucky Draw / Setback / tax space and check that the effect appears **on both computers**, with the active player approving it.
4. Have one player buy a deed and the opponent land on it. Confirm the **Rent Due** dialog names the correct landlord. Money should move only after **Pay**.
5. For a shortfall, use **Sell Upgrades / Property** and then pay. Confirm the remaining cash, ownership, and activity log match on both devices.
6. Click **↻ Restart Test Match** from Windows to reset the board *without changing the room code*.

## Still to build

Bank auctions when a purchase is passed, live negotiated rent settlements, full player-to-player trading, more advanced original Chance/Community Bonus actions (free travel, position swaps, extra turns, free upgrades), a complete mortgage/unmortgage UI, some original game balance mechanics, and full winner/net-worth scoring. **This is a playable multiplayer testing milestone, not yet the complete original game's economy.**

## Troubleshooting

- **Old version number:** Stop the old server; start the **new** extracted `start-windows.bat`. Hard refresh the Windows and Mac browsers.
- **Can't connect from Mac:** Both devices must be on the same Wi-Fi; Windows firewall must allow local private-network access to Node.js port 3000. Use the Windows LAN address shown in its console.
- **Code missing:** Check that you are running under the same Windows user account and that `C:\Users\...\.miniopoly-wifi\saves\rooms.json` exists. See backup guidance above.
- **A popup doesn't appear until the die finishes:** Correct behavior—die spins, then piece moves, then the landing window opens.
- **Special effects differ from the standalone game:** See the explicitly listed subset above. We are migrating the complete rules incrementally, with the Windows host authoritative.
- **Run tests:** From a terminal in the new folder use `npm test` (no additional dependencies are required).

## Files

`server.js` — server-authoritative rules, cards, payments, saving, turn phases. `game-data.json` — prices/space catalog from v5.42. `public/index.html`, `public/styles.css`, `public/app.js` — lobby and all landing/action dialogs. `public/board-v5-42.html` — original 3-world board with multiplayer display bridge. `tests/` — synchronized actions, dice rendering, rent settlement, card draw, utility purchasing, liquidation, and persistent room tests.


## GO artwork update in v0.2.9

- The GO square (square 0) in **all three worlds** now uses your **bottom-row square** GO card art: Richmond Hill teal, The Communities purple, and Coastal Georgia gold.
- This is the same artwork on desktop, Windows, Mac, and mobile browser sizes. The 420 × 420 source assets are included in `public/go-world-1.webp`, `go-world-2.webp`, and `go-world-3.webp`. The image is displayed in the game's square GO tile.
- **Design Lab does not have to be edited.** The GO cards are installed at the board-renderer level and take priority over older saved special-square designs. Other Design Lab styles remain unchanged.
- Rule logic is **unchanged**: this is an artwork-only GO update. Multiplayer room persistence, dice, animation, special spaces, cards, purchases, rent and turns are retained.
- Start the Windows host from this **v0.2.9** folder, refresh Mac and Windows browsers (Ctrl+Shift+R / Cmd+Shift+R). Both should show **PROTOTYPE v0.2.9**. Existing room codes are retained. Use the Worlds selector to preview each themed GO tile.

### Separate single-file build

`miniopoly-v5-43-three-worlds-go-cards.html` is supplied separately for testing the same artwork in standalone (non-Wi-Fi) Mini-opoly. No extra image files are required for the standalone build.
