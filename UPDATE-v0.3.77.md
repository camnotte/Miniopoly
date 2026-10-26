# Miniopoly v0.3.77 — Piece sounds/effects, trading lists and round status

Travelling pieces render 30% larger; landed/parked pieces retain their previous
size. School bus headlights flash, and recorded diesel ambience mixes with quiet
fictional pupil chatter and an original driver radio call. Police has a stronger
blue beacon flare plus a recorded siren/engine bed and fictional dispatch call.
Calls play once rather than repeating every movement pulse. Sound and Volume
remain personal; cancelling or arriving stops travel audio.

T-Rex uses a deeper, retimed cinematic roar adapted from the supplied clip, with
the original stomp file retained byte-for-byte. It leaves alternating three-toed
tracks and occasionally moves its head and shows teeth. Battleship has a front
bow wave and upward spray onto the deck, with no rear/side wake or path-stamped
water trail. Its water sound uses recordings, while its single departure horn
and the original supplied arrival bell remain. Cat, dog, aircraft, shoes and hat
also use softer recorded/cloth-style sounds. See SOUND-CREDITS.md for sources,
licenses and the original fictional radio/pupil dialogue. All finished audio is
bundled locally; no model, speech service or extra installation is needed to play.

Trading Center has Trade with and List properties by dropdowns, with By color /
By price choices. Both checkbox lists show original deed price, set/world and
upgrade details. Color groups, selected counts and complete-set preview remain
visible. Sorting preserves selections, cash and counteroffer terms. Incoming and
sent offers are separated; completed history is collapsed. Existing recipient
consent, privacy, trade notifications and host validation remain.

Current round/building/wave status now sits immediately above the Your Turn /
Next Player / Bonus Roll popup. The duplicate round display is hidden in the
player turn panel, while its bonus-roll counter remains. Standard, Express and
Countdown labels follow the current authoritative round/wave.

Validation: 272 Node tests total, 269 passed, zero failures and three optional
HTTPS skips. New sound tests cover simultaneous radio/bed decoding, one call per
movement, one continuous bed, mute/resume and cancellation of late audio.
Actual four-seat/two-browser checks exercised all ten artwork scales, real travel
and recorded playback for police/bus/T-Rex/ship, footprints, front-only spray,
round transitions, and a real sorted counteroffer/acceptance. Trading layout
checks covered 28 sort/font/viewport combinations at 320–1440px, with selections
and cash retained and no overflow. Live and standalone sound reviews decoded all
14 clips, played all ten controls and stopped cleanly without external portable
requests; championship preview remains functional. No page errors/failed assets.
Audio-manifest hashes and original stomp/bell bytes were verified.

Fully Exit Launcher from the Windows tray, apply the update, relaunch and refresh
all browsers. Confirm v0.3.77. Existing rooms, pieces and pending trades can resume.
This update changes presentation and trade organization, not gameplay/scoring.
