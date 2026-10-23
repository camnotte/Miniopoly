# Miniopoly v0.3.23 — Fading car tire tracks

Cars now leave a subtle pair of tire marks behind their movement. The marks
follow the visible piece around corners, gradually fading and disappearing
after about one second. They do not block property clicks or other controls.

Tracks appear only while a car actually moves. Waiting/rolling cars and other
pieces leave no tire marks. Reduced Motion skips this effect. Unrelated chat
updates do not restart it; catching up to another turn clears old tracks.
All v0.3.22 graphics, game rules and multiplayer behavior are retained.

## Install

This cumulative ZIP updates an existing v0.3.14 through v0.3.22 installation.

1. Stop the local server with **Ctrl+C**. For online play, choose **Stop hosting**
   before closing its terminal.
2. **Extract All** from **Miniopoly-v0.3.23-Update.zip**. Copy **everything** into
   your **existing game folder** and choose **Replace the files in the destination**.
3. Run **start-windows.bat** for local testing, or **Start-Online-Hosting.bat**
   with your working online settings.
4. Refresh both game browsers and confirm **Game Menu → v0.3.23**. Resume your
   saved room. Roll with the car and watch its short-lived trail.

Both Windows launchers are included. This update uses your existing artwork and
HTTPS installation. Saved progress, seats and connection settings are retained.

## Validation

98 automated tests passed. Desktop/phone Chromium checks verify that tracks
follow only the moving car, fade/remove within about one second, stay bounded
through chat updates, clear after landing, and respect Reduced Motion.
The update ZIP is checked against source and applied to the original Windows
release; original embedded artwork and the HTTPS executable are preserved.
