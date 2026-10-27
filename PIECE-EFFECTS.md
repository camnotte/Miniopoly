# Piece sound and travel effects — v0.3.77

Travelling game pieces are about 30% larger than the previous travel artwork.
Their parked/landed size is unchanged. Setup selection cards retain their
existing bounded layout. Movement effects follow the actual rendered path and
do not change dice, turns or landing positions.

| Piece | Movement sound and effects |
| --- | --- |
| School bus | Flashing headlight beam, rotating wheels/bounce, recorded diesel ambience, quiet fictional pupil chatter, and one original driver call to base |
| Police car | Larger blue beacon flare, rotating wheels/tracks, recorded siren/engine bed and one original fictional dispatch call |
| T-Rex | Deeper roar adapted from the supplied recording, original stomp file, alternating three-toed tracks, occasional head movement and an open-mouth teeth expression |
| Battleship | One departure horn, recorded water, a splitting bow wave and spray onto the front deck, then the original supplied arrival bell; no stern/side wake or trailing water stamps |
| Cat / dog | Recorded meow / bark with their existing walking animation |
| Airplane / blimp | Quieter recorded propeller textures and existing flight/propeller motion |
| Shoes | Recorded footfall and walking stride |
| Top Hat | Soft cloth flutter instead of the old spring-like sound |

Radio calls play once at departure; engine/siren/pupil beds loop smoothly while
moving and stop at arrival or cancellation. Calls do not repeat on every step or
when unmuting mid-move. The original T-Rex stomp and ship-bell files are unchanged.
Sound follows personal Sound/Volume settings. Reduced Motion suppresses movement,
tracks and flashing while preserving readable status and normal sound controls.
No voice service or model download is needed to run the game.

The local `/sound-review` page and the downloadable standalone sound review let
you listen to all ten pieces without joining a room. See [sound credits](SOUND-CREDITS.md)
for recording sources, licenses and fictional dialogue.

## Battleship wake (v0.3.81)

The approved focused mockup is now applied to the shared battleship artwork.
Surface foam starts at the bow, streams backward along the hull and fades at
the stern. Small foam bubbles follow the same paths; upward spray is removed.
The complete ship/water follows its movement heading. Parked pieces hide the
wake; Reduced Motion uses static foam without animated bubbles. The existing
ship horn, recorded water and original arrival bells remain unchanged.
