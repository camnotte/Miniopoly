# Miniopoly v0.3.37 — Live world-shift changes and shared announcements

The host can now switch **Individual ↔ Gravity Pull** in **Game Menu → Game Options** during an existing match. The new mode applies from the next roll. A roll already underway finishes under its original mode, including any Gravity Pull already triggered. Opening Game Options from a transaction window also offers this control. Starting cash still locks when the match starts; round-limit changes retain their existing rules.

Each actual shared options change generates a saved announcement for everyone. The announcement names the host, lists before/after values and explains when the change applies. It also shows the current rules. It stays visible for about ten seconds and has a dismiss button, without pausing play or taking keyboard focus. Chat remains above the notification.

Notifications include lobby rule edits, live world-shift changes, round-limit edits and the existing Unlimited/continue-match action. Personal sound/motion/volume changes, no-op saves and rejected edits do not notify other players. A backgrounded browser displays an unseen update when it becomes visible. A reconnecting browser can receive the latest missed announcement; already-seen announcements do not replay on refresh in that browser. Match activity retains the changes as history.

Only the host can change shared rules. Changing them retains the existing practice-game behavior. World-shift changes do not immediately relocate players or alter the current landing; they select the rule used by the next roll. Existing Gravity Pull, Setback, card, rent and GO rules remain in force. Nunito, moving pieces, avatars, property overviews, Building Permit comparisons and hosting settings are retained.

## Install

1. Stop hosting.
2. Extract **Miniopoly-v0.3.37-Update.zip** and copy all contents into your existing game folder, replacing matching files.
3. Run **Start-Miniopoly.bat** and refresh every player's browser. Confirm **v0.3.37** beside Room.

Existing saved matches can use the new control; creating a new room is unnecessary. The cumulative update includes all local and online launchers and helpers. Keep your installed artwork, verified HTTPS executable, certificates, password configuration and saves.

## Review

During a match, have the host open Game Options, change World shift and save. Both players should see the named announcement and its before/after values. Trigger a world shift on a later roll to check the selected mode. Switching while an earlier roll is still being shown must leave that earlier roll's movement and landing intact. Change the round limit and verify both browsers receive the notice. Dismiss it and refresh: it should not replay. A player who missed a newer change while disconnected should see that latest change on reconnect.

## Verification

139 automated tests pass. Desktop/phone multiplayer browser checks cover switches in both directions during playback, unchanged current-roll snapshots and movement, next-roll behavior, shared announcements, background/reconnect delivery, dismiss/refresh deduplication, personal/no-op suppression, guest read-only controls, the starting-cash restriction and layouts down to 320px.
