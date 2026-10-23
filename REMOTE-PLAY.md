# No-cost remote play: verified limits

Checked October 17, 2026 against the providers' official documentation source
repositories. The hosted documentation sites were blocked by the workspace
network proxy; the official GitHub repositories were accessible.

## Cloudflare Quick Tunnels

- No Cloudflare account or domain is required.
- The host installs `cloudflared`; visitors use their browsers.
- At most **200 simultaneous in-flight requests** per Quick Tunnel. Requests
  above that limit return HTTP 429. This is a request limit, not a player count.
- **Server-Sent Events (SSE) are not supported.** Miniopoly currently uses SSE
  through `EventSource` and `/api/events`, so its update transport must change
  before this option can be used.
- No uptime guarantee; intended for testing and development.
- The temporary hostname changes whenever a new Quick Tunnel is created. The
  link stops working when the tunnel process stops.
- The page does not specify a monthly bandwidth/request allowance. This is not
  evidence of unlimited usage or a guarantee of permanent free availability.
- Email access restrictions are supported with `--allowed-mail`: visitors
  receive a one-time PIN, and do not need a Cloudflare account. This feature was
  announced October 2, 2026.

Sources:

- [Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)
- [Verified source snapshot](https://github.com/cloudflare/cloudflare-docs/blob/fa7ef15f09115ed564550a340487ef8904224594/src/content/docs/tunnel/get-started/quick-tunnels/index.mdx)
- [Protected Quick Tunnels announcement](https://github.com/cloudflare/cloudflare-docs/blob/fa7ef15f09115ed564550a340487ef8904224594/src/content/changelog/tunnel/2026-10-02-protected-quick-tunnels.mdx)

## ngrok free plan

- **1 GB outbound data transfer per month.**
- **20,000 HTTP requests per month.**
- **4,000 HTTP requests per minute** sustained rate limit.
- Up to **3 online endpoints**, **3 concurrent agents**, and **1 account user**.
  The account-user limit refers to people managing ngrok, not visiting players.
- One automatically assigned development domain, tied to the account.
- Free endpoints have **no forced session timeout**.
- HTTPS and automatic certificates are included.
- Browser visitors see a warning/interstitial; clicking Visit suppresses it for
  that domain for seven days.
- Raw TCP has additional conditions, including credit-card verification in the
  plan comparison. Do not confuse those requirements with HTTPS game hosting.
- Do not claim automatic paid upgrades, overage behavior, or a payment-card
  requirement for the HTTPS free plan without verifying the account's terms.

Sources:

- [Free Plan Limits](https://ngrok.com/docs/pricing-limits/free-plan-limits/)
- [Verified limits table](https://github.com/ngrok/ngrok-docs/blob/fca567c64f6e4fc0940807d0a4240c31802dda6a/snippets/shared/limits/free-resources.mdx)
- [Verified free-plan guide](https://github.com/ngrok/ngrok-docs/blob/fca567c64f6e4fc0940807d0a4240c31802dda6a/pricing-limits/free-plan-limits.mdx)

## Current implementation: direct Windows hosting

The user reached the home Windows PC from a phone on mobile data using the
TCP 53179 diagnostic. The router has a matching public IPv4. Version 0.3.14 uses
**direct hosting**, with no tunnel or paid domain: Caddy v2.11.7 requests a free
public IP certificate from Let's Encrypt using the `shortlived` ACME profile.
These certificates last 160 hours and need automatic renewal. SSE is retained.

See [HOST-ONLINE-WINDOWS.md](HOST-ONLINE-WINDOWS.md) for TCP 80/443, Windows
Firewall, password sessions, changing IPs, and the phone test. There is no relay
traffic quota, but ISP terms and home bandwidth apply. The 53179 test does not
establish 80/443 reachability. Actual public certificate issuance and Windows
operation still need validation on the user's PC.

Source: [Let's Encrypt public IP availability](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability/).

## Earlier tunnel alternatives (not used by this release)

Earlier analysis considered Quick Tunnels with request-based updates instead
of SSE. This alternative was not implemented; v0.3.14 uses direct hosting and
retains SSE, so the Windows host runs the game and Caddy without a tunnel.

ngrok's 1 GB monthly transfer allowance is a concern for the current artwork.
The main board file plus the three property atlases and three center scenes
total about 54.6 MB uncompressed on disk. This is a source-file total, not a
measured per-player download or a prediction of how many sessions fit the quota.

No paid hosting, paid domain, subscription, or payment method should be required
by the proposed no-cost setup. Do not equate a free testing service with a
production uptime guarantee.
