# Miniopoly v0.3.71 — Left-aligned setup with separate Game Options

The entry page now starts at the left browser edge with a small gutter. A compact welcome column sits beside Create / Join and a separate Game Options card. On medium screens the two setup cards stay together with welcome information below; on phones they stack cleanly.

Game Options is removed from the identity form. Three mode rows show Standard, World Collapse and Countdown, each with a rounds selector. Standard is the existing Classic mode; no new backend mode is introduced. Fresh entry defaults to 10 rounds, while saved defaults and launcher links still override it. Round choices are remembered separately per mode.

Room size, cash, world shift, Ranked and World Collapse's existing Final Showdown option are grouped under Additional options. Font settings are personal to the browser and remain available on Join. Shared rules are disabled on Join, with an explanation that the host controls the room. Current mode gameplay, live board layout, menu redesign, saved seats and records are preserved.

Validation: 256 Node tests total, 253 passed, zero failures, three optional HTTPS skips. Actual Chromium checks covered 60 combinations of ten viewport widths (320–1920), Nunito/American Captain and all three modes: left alignment, separate/stacked cards, no horizontal overflow or avatar/piece text overlap. Real form submissions created Standard Unlimited, Standard Ranked, World Collapse and Countdown rooms; a second browser joined and started the selected Countdown match. Verified native form ownership, exact rounds/cash/room-size/world-shift payload, separate round persistence, personal font, disabled join rules, Ranked eligibility, launcher prefills and existing live menu. No page errors or failed assets. Native Windows/Mac appearance remains a user platform check.

Fully Exit Launcher from the Windows tray before applying the update, relaunch from the updated folder, refresh all browsers and confirm v0.3.71. Existing rooms can resume; no new match is required for the entry-page changes.
