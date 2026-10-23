# Miniopoly v0.3.39 — Clear Game Options save states

One reproducible cause of the temporary green, unclickable Options fields was reopening the window while a previous save was still awaiting a response. The fields remained disabled while the window erased the Saving message. This release keeps **Saving match options…** visible in that situation, labels the Save button **Saving…**, and retains the pending choices until the request finishes.

Shared controls unlock after success or failure. Requests have a ten-second deadline; a timeout restores editing, reports the lack of confirmation and checks the host's saved rules without automatically resubmitting. A timed-out request may already have reached the host, so check the current setting before trying again. Leaving a room clears and aborts its pending save; a late completion cannot lock or overwrite the save status in another room.

Editable fields have a cream background. Disabled fields use neutral grey rather than green. Host help says **You are the host**, and guest help names the room's host. The host may change World shift during an existing match for the next roll; starting cash stays locked after starting, and guests retain read-only shared rules. Personal device controls remain available.

## Install and review

1. Stop hosting, extract **Miniopoly-v0.3.39-Update.zip** and copy all contents into the existing game folder, replacing matching files.
2. Run **Start-Miniopoly.bat**, refresh both browsers and confirm **v0.3.39** beside Room. Existing saved rooms work; a new room is unnecessary.
3. As the player who created the room, open **Game Menu → Game Options**. World shift should be editable. Change it and save; both players should receive the existing named announcement.
4. If the connection is slow, close and reopen Options during the save. The pending choice and Saving message should remain visible; the controls become available when it completes or times out.

This is a cumulative update with all local/online launchers and helpers. Retain installed artwork, the verified HTTPS executable, certificates, passwords and saves. The landing-artwork fix, player world badges, Nunito, avatars, pieces/effects, rankings, property previews and announcements remain included.

## Verification

148 automated tests cover gameplay and request recovery, including timeouts and late completions. Two-client Chromium checks cover a restored match's first opening, closing/reopening a delayed save, pending-choice preservation during catch-up, shared announcements, rejected saves, the ten-second timeout without automatic retry, room departure during a save, guest permissions and 320px/390px layouts. The silent disabled state was reproduced against v0.3.38. Native macOS Safari still needs the review on the user's device.
