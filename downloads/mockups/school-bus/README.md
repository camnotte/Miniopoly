# School bus — design mockup

A design review only. The Miniopoly game is unchanged.

- **School-Bus-Motion.gif**: looping preview of wheel spin, suspension bounce,
  twin tracks, riding passengers and a short school-bus stop.
- **School-Bus-Motion.mp4**: the same preview as a small video.
- **School-Bus-Design.png**: full design sheet with driving and stopped poses.
- **School-Bus-Stop.png**: stopped pose with the door open and STOP paddle out.
- **School-Bus-Mockup.html**: interactive standalone mockup. On GitHub, choose
  Download raw file, then open the downloaded HTML in a browser. Artwork and
  fonts are embedded; it does not connect to a game server.
- **School-Bus.svg**: parked vector concept.

The concept retains the monster truck's visible wheel rotation, suspension
bounce and fading twin tracks. Its own details are golden-yellow bodywork and
black rub rails, bobbing passengers, a waving passenger at the stop, a folding
entry door, a swing-out STOP paddle and gently glowing amber roof lights.

The loop stops the wheels at the curb, opens the door and extends the paddle,
then closes both before departure. The interactive version includes Play / Pause,
Replay, Show bus stop, direction, slow motion and a track toggle. Reduced Motion
starts it paused; Play explicitly starts motion.

Checked in Chromium: wheel/travel/body/passenger motion, tracks, the door and
paddle stop sequence, stopped wheels, the door closing before departure, direction
and track toggles, Reduced Motion and Play, mobile width, no script errors and no
external asset requests. This review adds no game piece or release version and
changes no game rules, saves or current working files.
