# Miniopoly v0.3.76 — Incoming trade alerts

Incoming offers and counteroffers now show a sender-named notice with Review
and dismiss buttons and a short three-note chime. The pending-offer number is
visible on Trading Center in the left/phone controls, its menu item, the
Properties & trading category and Game Menu itself. Outgoing or unrelated offers
do not alert other players. Review opens and focuses an incoming offer for
inspection; it does not accept or interrupt play automatically.

Badges count unresolved incoming offers and update as proposals are accepted,
declined, withdrawn, countered or expire. The notice dismisses after twelve
visible seconds; badges remain until resolution. The menu remains unobstructed.
Offer IDs are remembered for this browser/room/match/player so repeated room
updates, refreshes and reconnects do not repeatedly chime for the same proposal.

The original synthesized alert follows Sound and Volume, including mute and
zero volume. It uses a separate sound engine, so it does not stop piece movement
audio. Muted arrivals do not chime retroactively after unmuting. Hidden-tab alerts
can play once on return, and resolved/withdrawn alerts cannot play later. Closely
arriving offers share a chime. Normal browser audio interaction requirements
apply; visual notices and badges are independent of audio. No OS permission is
requested. Trade consent, privacy, validation and settlement rules remain.

Validation: 270 Node tests total, 267 passed, zero failures and three optional
HTTPS skips. Three actual browser sessions tested a UI-submitted proposal,
recipient-only alerts, all badge locations, real Web Audio scheduling, Review
and acceptance, counteroffer notification, decline/withdrawal/expiry/reset,
repeated snapshots and refresh deduplication, mute, zero volume, volume gain,
hidden-tab handling and no delayed withdrawn-offer sound. Layout checks covered
18 viewport/font combinations at 320–1920px with Nunito/American Captain.
No page errors or failed assets. The 0.65-second alert waveform was checked for
finite, bounded samples and a faded ending.

Fully Exit Launcher from the Windows tray, apply the update, relaunch and refresh
all browsers. Confirm v0.3.76. Existing rooms and pending trades can resume.
