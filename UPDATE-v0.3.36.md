# Miniopoly v0.3.36 — Game Options and Gravity Pull

**Game Options** is available in Create Room, the waiting room and Game Menu. Transaction windows also have a Game Options link. The host sets shared match rules; every player can review them before starting. A concise waiting-room summary shows the selected rules.

## Shared match rules

- **Match length:** Unlimited, 10, 12, 15, 20, 30 or 50 rounds. Unlimited continues until one player remains. The host can change the limit during play, with a notice and activity message for everyone. A new fixed limit must include the current round; that round finishes normally.
- **Starting cash:** $1,000, $1,500 or $2,000 for every player. Changes apply in the lobby and are used on start/restart. This setting locks after the match starts.
- **World shift:** Individual or Gravity Pull. This setting locks after the match starts. Individual retains the existing rules and is the default for existing and new rooms.

Both modes retain the 6/12 shift and the ten-roll fallback. Escape rolls never shift worlds. Bonus-roll and Setback rules are unchanged.

## Gravity Pull

The roller shifts worlds and moves normally. Eligible players are then pulled to the roller's **exact destination world and square**, with a brief swirling effect. Their original pieces gather in the existing token area, with no replacement artwork.

Only the roller resolves the landing. Pulled players receive no GO payment, purchase decision, rent obligation or card draw from the pull. Players held in Setback stay put, and bankrupt players are excluded. Pulled players' no-shift counters reset. A card that subsequently moves the roller is resolved for that roller; it does not start another pull. Switching the displayed world between turns is a camera transition and does not trigger Gravity Pull.

The host saves the new positions and publishes the same result to all clients. Old positions stay visible until movement reaches the pull animation. Reconnecting restores the result without replaying an old pull. Financial changes and landing decisions retain their arrival timing.

## Personal preferences

Each player can set **sound on/off**, **volume** and **motion** for their own browser. Preferences are remembered independently of the room's rules. Reduced motion skips the dice tumble, world fades and pull animation while preserving all game results. The device's accessibility preference is also respected. Chat remains above the options and transaction windows.

Host Game Setup remembers world shift and starting cash alongside the existing match defaults. Existing rooms acquire Individual shifts and $1,500 starting cash without altering current cash, positions or property holdings. Custom rules and games whose shared rules are edited remain practice games. Ranked records require the existing 10/15/20-round brackets, Individual shifts and $1,500 starting cash.

## Install

1. Stop the game server.
2. Extract **Miniopoly-v0.3.36-Update.zip** and copy all contents into your existing game folder, replacing matching files.
3. Run **Start-Miniopoly.bat**, select your usual hosting mode and refresh each player's browser. Confirm **v0.3.36** beside Room.

The cumulative ZIP includes all local/online launchers and helpers. Keep your existing artwork, verified HTTPS executable, certificates, passwords and saved rooms.

## Review

Create a room with **World shift → Gravity Pull**, choose a round limit and starting cash, then have another player join. Confirm both see the same rules and only the host can edit them. Start and roll a 6 or 12: eligible pieces should gather on the roller's destination, while only the roller receives the landing action. A player held in Setback should stay there. Try a browser refresh, changing the live limit to Unlimited and choosing different sound/motion preferences on each device.

137 automated tests pass. Browser checks cover actual Create/Join, synchronized shared options, independent personal preferences, pre-arrival piece positions, one landing decision, three pieces sharing the target, Setback exclusion, chat during playback, reload without replay, live Unlimited changes, reduced-motion results and phone layouts down to 320px. Original embedded artwork, avatar sheet, car/cat artwork and HTTPS tool are retained.
