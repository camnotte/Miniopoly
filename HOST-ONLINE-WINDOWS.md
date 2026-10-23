# Miniopoly — Windows hosting

Host on your Windows 11 PC. Friends need only a browser, your HTTPS link, the
private game password, and a room invitation. No tunnel, domain purchase,
hosting subscription, or payment method is needed. Your existing internet and
PC electricity costs still apply. There is no relay provider's monthly game
traffic allowance; your home upload speed and ISP terms apply.

## Saved Local / Online setup (v0.3.28)

In your existing updated installation, double-click **Start-Miniopoly.bat**.
Choose **Local Multiplayer** for home Wi-Fi or **Online Players** for remote
friends. Mode, host name, player count, round limit and automatic-opening choices
are remembered. The game opens when ready, with its Create Room form filled in.
Existing saved seats still resume. Use **Stop hosting** before changing modes.

Local mode starts Node on the LAN and does not use the HTTPS tool or public IP.
The firewall button can add a Private-network Node rule for the game port.
Online mode retains the verified HTTPS tool, saved password hash, certificates
and port-forwarding setup below. Never forward the local game port through the
router. The existing **Start-Online-Hosting.bat** still opens Online setup.

## First setup

1. Download **Miniopoly-v0.3.14-Windows-Online-Hosting.zip** and choose
   **Extract All**. Keep the folder together, including `hosting/tools/caddy.exe`.
   Use the Node.js LTS installation you already use for Miniopoly, or install
   Node.js LTS from <https://nodejs.org>. No `npm install` is needed.
2. Stop the previous Miniopoly server with **Ctrl+C**. Do not run the LAN server
   and online launcher together: they use the same game saves.
3. On your TP-Link Archer router, reserve the PC's current LAN address
   (previously `192.168.0.87`) under DHCP/Address Reservation. Check `ipconfig`
   first if the PC has moved. Router labels vary by firmware.
4. Under **Advanced → NAT Forwarding → Port Forwarding** (sometimes called
   **Virtual Servers**), add and enable these two rules:

   | Name | External port | Internal port | Protocol | Target |
   | --- | --- | --- | --- | --- |
   | Miniopoly HTTP validation | 80 | 80 | TCP | Hosting PC's reserved IP |
   | Miniopoly HTTPS | 443 | 443 | TCP | Hosting PC's reserved IP |

   Remove the temporary **53179** test rule. Do **not** forward 3000 or the owner
   console's port. Port 80 handles certificate validation and HTTPS redirects;
   gameplay and passwords travel over HTTPS on 443.
5. In Windows Settings, set your trusted home connection's **Network profile**
   to **Private**. Double-click **Start-Online-Hosting.bat**. A terminal and a local
   owner console open. Keep the terminal open.
6. Click **Allow Windows firewall** and accept the Windows administrator prompt.
   This adds one inbound rule for the bundled Caddy executable, TCP ports 80/443,
   on Private networks only. Use this button again if you move the game folder.
7. Click **Check my public IP**. Compare it with your router's Internet IPv4
   address, as in your successful connection test. Enter a private game password
   of **at least 12 characters**, confirm the forwarding checkbox, then click
   **Start online hosting**.
8. Wait for **HTTPS ready on this PC**. The first certificate may take a few
   minutes. Open the HTTPS link on your phone with **Wi-Fi off**. It should show
   the private password page with a valid certificate and no browser warning.
   This phone test confirms the new 80/443 setup; the earlier 53179 test alone
   does not establish that these ports are reachable.
9. Share the link and password privately. Open the game, enter the password,
   create a room, and select **Invite players → Copy link**. Your friend enters
   the password and their name to join. Start when both players are at the table.

Use the HTTPS game link on the hosting PC too. Most home routers support routing
back to their own public IP (NAT loopback). If mobile data works but your home
Wi-Fi/PC cannot open the same link, check NAT loopback support on the router;
that is separate from whether your friend can connect externally.

## Each game night

Open **Start-Online-Hosting.bat**, check the public IP, then start hosting. Leave
password blank to keep the saved password. Keep the PC awake and the terminal
open. Select **Stop hosting** before closing the terminal. Progress is saved
automatically, so the same room can resume after a restart.

Let's Encrypt public IP certificates are free and valid for **160 hours** (about
6.7 days). Caddy renews automatically while running. After a long break, allow
time for a new certificate before sharing the link. Starting accepts Let's
Encrypt's subscriber agreement. Certificate records include the public IP;
passwords and player credentials stay private. Certificate issuance and ISP
restrictions can still prevent startup. Do not repeatedly delete the certificate
folder to retry: this loses reusable certificates and can trigger issuance limits.

The console checks your public IP every 10 minutes while hosting. **Check my
public IP** also checks immediately, using api4.ipify.org. You can type the
matching router IP manually if lookup is unavailable. The address can change
between checks. If it changes, stop, update/check the address, restart, and share
the new HTTPS link. This is a changing address, not a permanent website.

## Keep your seat when the link changes

Browsers keep player identities separately for each address. Open **Keep your
player seat safe → Save my seat** before changing links. Each player saves their
own small JSON file. At the new link, sign in, select **Restore a saved player
seat → Restore seat**, then choose that file. It restores their seat from the
host's existing room saves. Keep seat files private: they grant control of that
seat. Do not upload `rooms.json`, which contains all players' credentials.

## Files and access

- Room saves: `%USERPROFILE%\.miniopoly-wifi\saves`, shared with recent releases.
- Hosting configuration, password hash and certificate keys:
  `%USERPROFILE%\.miniopoly-wifi\hosting`, outside the downloadable game folder.
- The owner console binds to loopback and requires a private random token.
  Do not share its address. Friends use only the HTTPS game link.
- The game backend binds to `127.0.0.1:3000`. Public game pages, APIs, files and
  live updates require an expiring private password session.
- Sessions last 12 hours. Sign-out closes that session's live streams. A hosting
  restart requires signing in again; your browser retains your player seat.
- Caddy v2.11.7 is verified against a pinned SHA-512 before execution. Original
  release checksums and license are included under `hosting/tools`. The bundled
  executable is for Windows x64.

To remove hosting, stop it and delete the router's 80/443 rules. Remove the
**Miniopoly Online HTTPS** Windows Firewall rule if no longer needed. Keep the
`.miniopoly-wifi` folder to retain rooms.

## Troubleshooting

- **Port already in use:** Stop the old game terminal or other web server first.
  The launcher avoids running two game servers over the same saves.
- **Waiting for a trusted certificate:** Check the reserved PC address, both
  TCP rules, Private network profile, firewall rule and public IP. An ISP may
  block 80/443 even when the test port worked. Expand **Connection details** for
  issuer errors. Never bypass certificate warnings; the launcher does not
  substitute a self-signed certificate.
- **Firewall change not completed:** Accept the administrator prompt or add an
  inbound rule manually for the exact `caddy.exe` path, TCP local ports 80/443,
  Private profile. Keep Windows Firewall enabled.
- **HTTPS ready here, phone cannot connect:** Check TCP 443 forwarding and the
  PC's current LAN address. The local check validates the certificate, but cannot
  prove your router or ISP permits an external visit.
- **Friend disconnected:** Keep the PC awake and hosting running. Check whether
  the public IP changed. Reopen the current link, sign in if asked, and restore
  your saved seat when changing addresses.

## Validation and sources

Automated Linux checks cover real Caddy with an explicitly trusted local test
CA, two-player live updates, protected routes, login/logout, launcher start/stop,
checksums and IP changes. Browser checks cover Nunito, invitations, saved seat
export/restore, the live board/portfolio and the owner console. Tests do not
request a public certificate for your home IP. Real Windows UAC, Windows Firewall,
public certificate issuance and the 80/443 router setup still require the first
phone test above. The earlier phone test established TCP 53179 reachability only.

Verified October 17, 2026:

- [Let's Encrypt public IP certificates and 160-hour lifetime](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability/)
- [Caddy v2.11.7 release and checksums](https://github.com/caddyserver/caddy/releases/tag/v2.11.7)
- [Caddy ACME profile configuration](https://github.com/caddyserver/caddy/blob/v2.11.7/modules/caddytls/acmeissuer.go)
- [Caddy default SNI policy](https://github.com/caddyserver/caddy/blob/v2.11.7/modules/caddytls/connpolicy.go)
