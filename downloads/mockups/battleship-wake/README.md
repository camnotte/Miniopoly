# Battleship wake — visual review

A focused animated mockup of water splitting at the bow, streaming backward
along the hull, then fading at the stern. White foam and small surface bubbles
travel from the front toward the rear; no upward spray or airborne droplets.
The same water geometry turns and mirrors with the ship.

- [Watch the motion video](Battleship-Wake-Motion.mp4?raw=true)
- [Animated GIF](Battleship-Wake-Motion.gif?raw=true)
- [Interactive standalone mockup](Battleship-Wake-Mockup.html?raw=true) — save and open the HTML locally.
- [Overview](Battleship-Wake-Overview.png?raw=true) · [Left-facing detail](Battleship-Wake-Left.png?raw=true) · [Phone layout](Battleship-Wake-Phone.png?raw=true)

The enlarged detail makes the foam direction visible. The smaller strip below
shows continuous travel past square markers; it retains the smaller piece size
from the earlier visual review. Auto mode demonstrates rightward and leftward
travel. Direction controls also show up/down, and Pause, Replay and Reduced
Motion are available. No audio or external assets are requested.

This is review material only. The playable game remains v0.3.80 on
codex/tsunami-seawalls-v0.3.80 at a168d73888d66308e6d31c7e5aa0612a623b3f24.
No game rules, saves, art or controls are changed. This demonstrates the wake
fix requested after the seawall update; it does not integrate the earlier ocean
mockup or enable host testing controls.

Validation: all foam paths end astern of their bow start; actual foam particles
advance toward the stern. Right/left/up/down headings, a portable HTML with one
initial request and no external requests, six viewport widths (320–1440px),
Pause/Replay/Reduced Motion and absence of airborne spray were checked in
Chromium. The video shows 12 seconds at 16 fps, with both horizontal headings.
Proposed art, renderer, source and builder are retained under source/.
