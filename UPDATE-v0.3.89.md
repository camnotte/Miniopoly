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
