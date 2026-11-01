# Miniopoly v0.3.113 — persistent player helper

The personal helper stays available to hosts and guests. Its expanded message fits the visible browser area; reading or minimizing leaves a small chat button at the lower left. Minimized state persists in this browser after refresh.

- Important unread advice gets a numbered badge and a gentle pulse. Reading the message clears its unread state. Reduced-motion preferences disable pulsing.
- Resize and visual-viewport changes reposition the helper. Short windows scroll the message internally while keeping the minimize control accessible.
- During dialogs or movement, automatic advice uses the compact chat button. Explicitly reopening the helper shows the message above dialogs; minimize it to return to the controls.
- Muting stops unread alerts but keeps the chat button available. Opening it enables the helper again. Game Menu → Preferences → Show player helper also reopens it.
- A fallback message keeps the helper present while waiting, in the lobby and after the match.

Existing matches, financial rules and game modes are unchanged.

Validation: 372 Node tests passed, with three optional HTTPS tests skipped. Browser checks passed for both host and guest at 1530×900, 1366×640, 390×700, 320×480 and 700×260. Checks cover viewport bounds, refresh persistence, unread badges, muting/reopening, and opening over dialogs. The asset-sale regression passed at four sizes, including guest sales, payment and the 90/10 rent split.
