# Miniopoly v0.3.80 — Tsunami seawalls

Low stone seawalls replace the blue shield bubbles on properties with unused
flood protection. Masonry follows the plot edges, leaving the building visible;
a small gold shield badge identifies protection. The first protected tsunami hit
briefly crumbles the wall and removes it. Refreshing or changing worlds does not
replay a past impact. Reduced Motion uses a static damaged-wall indication.

Protection rules, saved rooms, trades and other game modes keep their existing
behavior. Re-upgrading cannot renew spent protection. The earlier ocean/movement
mockup and host testing controls remain separate pending review.

[Download and preview](DOWNLOAD-v0.3.80.md) · [Tsunami rules](TSUNAMI.md)

Validation: 275 automated tests passed, zero failures, three optional HTTPS
skips. Browser checks covered real Building Permit use and a host-confirmed wave
in two clients, all three worlds, first-hit crumbling, refresh without replay,
Reduced Motion, five viewport widths (320–1440px), and unchanged Standard/World
Collapse indicators. The standalone preview makes no external requests. No browser
errors or failed assets were observed. Native Windows/Mac appearance remains a
platform review step.
