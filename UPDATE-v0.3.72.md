# Miniopoly v0.3.72 — Compact Game Mode dropdown

The three separate mode rows are replaced by one Game mode dropdown containing Standard, World Collapse and Countdown. A single Rounds dropdown sits beside it and updates to the allowed choices for the selected mode. Each mode still remembers its own last rounds choice. Existing saved defaults and Game Launcher prefills are retained.

The complete Game Options card is shorter: reduced section gaps, a concise mode explanation, compact headings, and shorter world-shift labels keep all existing settings available. Room size, cash, world shift, Ranked, World Collapse Final Showdown, personal font and font-availability checks remain. The default desktop Nunito panel measured about 657px high compared with 955px in v0.3.71, approximately 31% shorter. This measurement is for the default mode/font/layout; content height varies by settings.

The separate panel, left alignment and responsive arrangement remain. On Join, shared rules stay disabled while personal font remains editable. Standard continues to be the existing Classic mode; no gameplay, scoring, saved-match or host-permission rules changed.

Validation: 256 Node tests total, 253 passed, zero failures, three optional HTTPS skips. Actual Chromium checks covered 60 viewport/font/mode combinations (320–1920px, Nunito/American Captain, all three modes), remembered rounds after refresh, host prefills, Ranked eligibility, disabled Join rules, no overflow/identity-text overlap, and real creation of Standard Unlimited, Standard Ranked, World Collapse and Countdown rooms. A separate browser joined and started the configured Countdown game. No page errors or failed assets. Native Windows/Mac appearance remains a user platform check.

Fully Exit Launcher from the Windows tray, apply the update, relaunch and refresh all browsers. Confirm v0.3.72. Existing rooms and seats can resume.
