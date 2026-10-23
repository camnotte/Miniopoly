# Miniopoly v0.3.22 — Readable cards and smoother movement

Cumulative update for an existing v0.3.14 through v0.3.21 game installation.

## Install on your Windows host

1. Stop the local server with **Ctrl+C**. If hosting online, choose **Stop
   hosting** first, then close that terminal.
2. Right-click **Miniopoly-v0.3.22-Update.zip**, choose **Extract All**, then
   **Extract**. Copy **all** extracted contents into your **existing Miniopoly
   game folder**. Choose **Replace the files in the destination**.
3. For local review, run **start-windows.bat** from that existing folder, then
   open **http://localhost:3000** on the host. For online play, run
   **Start-Online-Hosting.bat** with your working settings.
4. Refresh **both** browsers, including the MacBook and phones. Check **Game
   Menu → v0.3.22** on every device. Continue your saved room and player seats.

Both launchers are included. The ZIP updates your existing artwork and HTTPS
installation; it is not a standalone installation. Saved match progress,
router/firewall settings, passwords and certificates remain in place.

## Changes

1. **Lost Wallet and every special-card reveal:** solid cream card backgrounds,
   dark green titles/details without fuzzy shadows, and clear amount badges.
   Rewards use deep green; payments use deep red. All special families share
   the same readable palette, retaining their original illustrations and GIFs.
2. **Bonus announcement:** stays on the board while the piece moves. It closes
   when the piece arrives, then the normal landing reveal and decision continue.
   A third consecutive 7/11 still shows the separate Setback announcement.
3. **World shift:** about three seconds of defocusing/fading and refocusing,
   reaching a nearly invisible, deeply blurred image before the next world
   appears. Movement starts after the transition finishes. A soft sweeping
   whoosh resolves into three chimes. **Game Menu → Sound** mutes it.
4. **Financial timing:** cash, net worth, financial ranks, saved perk changes
   and the landing's activity messages appear when the piece lands. They stay
   steady during the die roll, world transition and movement, on each device.
   Payment and purchase confirmations continue to update immediately when made.
5. **Match activity:** one heading and one history window, four lines high,
   showing the most recent messages first. Scroll with the mouse wheel or
   trackpad. Click/tab into the history to use arrow keys, Page Up/Page Down,
   Home or End. New messages preserve your place when reading older entries.
6. **World name:** a full-width strip attached to the top, left and right edges
   of the board's center, consistently across all three worlds.
7. **Escape wording:** buttons, card descriptions, status captions and saved
   payment messages now use Escape / Escape Payment consistently.
8. **Moving car:** keeps the original red body, with rotating wheel spokes that
   follow its forward movement and direction around the board.
9. **Walking cat:** replaces the face-only piece with a complete orange tabby,
   including body, tail, four alternating walking legs, paws and facial details.
   Both pieces rest while waiting for the die and after arrival.

Nunito remains the font. Original property/special artwork, game rules,
multiplayer revision protection and chat above transactions are retained.
Reduced Motion skips travel/fade effects and disables wheel/leg motion.

## Review locally

- Roll onto Community Chest. Lost Wallet is a random draw, so it may take several
  visits. Its green +$50 badge and title should read clearly. Watch cash and
  standings: the reward should appear only after arrival.
- Roll 7/11: the bonus notice should remain visible throughout movement, then
  disappear at the landing. Bonus Roll still rolls immediately with one click.
- Roll 6/12: watch the board become deeply blurred/nearly invisible, then come
  back into focus. Click/tap the game once on each device so its browser can
  enable audio; check **Sound On** to hear the shift. Muting stops the effect.
- Watch a car and cat move, then stop. Review the included standalone
  **Miniopoly-v0.3.22-Pieces-Preview.html** separately for a larger view of both
  the parked and moving graphics; it needs no server or internet.
- Check the four-line activity region using a mouse wheel, keyboard arrows and
  Page Up/Page Down. Verify that Match activity appears only once below the board.
- Continue several turns on the PC and MacBook. Their turn highlights, balances
  after landing and saved progress should agree without refreshing the game.

Normal dice/cards stay random; no test controls are exposed in the game.

## Validation

98 automated tests passed. Additional Chromium checks cover all special-card
text/amount contrasts (at least 4.5:1), exact landing-time financial/rank updates
on desktop and phone, chat during movement, bonus lifetime, deep-blur timing,
Web Audio generation and mute, title alignment, mouse/keyboard history scrolling,
animated car wheels/full-body cat and Reduced Motion. Existing two-device turn
recovery checks pass for delayed replies, stalled streams and returning to tabs.
The cumulative ZIP is applied to the original Windows release and checked against
source; both launchers, original embedded artwork and HTTPS executable are retained.
Browser checks run in Linux Chromium; review on your own Windows/Mac/phone browsers.

For maintainers: presentation holds never change authoritative room revisions,
positions, balances or obligations. Each browser releases its financial view on
its matching piece-arrival event; catch-up goes directly to the current room.
