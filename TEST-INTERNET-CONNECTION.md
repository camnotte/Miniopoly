# Test incoming access to your Windows PC

This is a temporary connection check, not an online game release. It requires
Node.js, which the existing Miniopoly Windows host already uses. No tunnel,
account, subscription, or payment method is involved.

The test listens on TCP port **53179** for at most **10 minutes**, then stops.
It only returns a fixed success message. It cannot read or serve game files,
saved rooms, passwords, or other files on your PC. It does not change router or
Windows firewall settings automatically.

## 1. Start the temporary test

1. Extract the complete ZIP into a folder on your Windows PC.
2. Double-click **test-windows-connection.bat**. Keep its window open.
3. If Windows asks about Node.js network access, allow it on your trusted home
   **Private** network.
4. Open the home-network address printed in the window. Using the PC address
   you reported, this is `http://192.168.0.87:53179`.
5. Confirm **MINIOPOLY CONNECTION TEST SUCCESSFUL** appears. If the address has
   changed, use the current IPv4 address from `ipconfig` or the test window.

## 2. Add one temporary router rule

Open your TP-Link router's settings using its Default Gateway address. Menu
labels vary with firmware; look under **Advanced → NAT Forwarding → Port
Forwarding**. Some versions call the page **Virtual Servers**.

Add and enable this custom entry:

| Setting | Value |
| --- | --- |
| Name / Service name | Miniopoly-Test |
| Device / Internal IP | Your PC's current address (reported as `192.168.0.87`) |
| External port | 53179 |
| Internal port | 53179 |
| Protocol | TCP |

Do not enable DMZ, router remote administration, or forward the game's port 3000
for this diagnostic. Only the temporary test port is needed.

## 3. Test from outside the home network

1. On a phone, turn **Wi-Fi OFF** and use mobile data, or ask a friend at another
   location to test while the listener window is running.
2. Open `http://YOUR-ROUTERS-PUBLIC-IP:53179`, replacing the placeholder with the
   router's current Internet IPv4 address. Use the full `http://` address; this
   diagnostic serves a plain message, not an HTTPS login page.
3. If **MINIOPOLY CONNECTION TEST SUCCESSFUL** appears, incoming access works
   through that forwarded TCP port from that external connection.
4. A timeout or refused connection does not prove the ISP blocks hosting. Check
   that the ten-minute test is still running, the PC address is current, and
   the router entry is enabled. Router and Windows firewall settings can also
   explain a failed result.

If the home-network check works but the external check fails, report the phone
browser's error and your internet provider. Further diagnosis may require a
temporary Windows firewall rule for this specific port.

## 4. Clean up

Stop the test with Ctrl+C, or let its ten-minute timer expire. Delete the
**Miniopoly-Test** router forwarding entry. If you added a separate test-only
firewall rule, remove it as well.

Successful access to this port establishes an incoming path. Publishing the
actual game is a separate step with HTTPS, private access, and a stable local
address for the Windows host. This test does not establish that ports 80/443 are
available or that all external networks can reach the PC.
