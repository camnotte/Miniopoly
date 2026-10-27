# Miniopoly v0.3.81 — Exit Game and battleship wake

The Windows launcher now has an **Exit Game** button beside Return to Game,
including Compact view, and the tray menu uses the same action. Exit Game closes
its Miniopoly app windows, removes the running launcher and tray icon, and stops
hosting while preserving saved matches. When hosting is active, it asks before
disconnecting players. X and Minimize continue to keep hosting in the tray.
The full browser launcher also offers Exit Game when controlled by the Windows
launcher. Browser-only and guest launchers cannot shut down the host PC's launcher.

Dedicated Edge/Chrome app windows are individually tagged by the native launcher;
only these tagged windows receive a normal close message. Shared browser
processes and other browser windows are not terminated. Edge/Chrome keep their
existing profiles and player seats. Windows can retain an icon you explicitly
pinned to the taskbar, even after the application exits.

Battleship water now matches the approved mockup: surface foam splits at the bow,
flows backward along the hull and fades at the stern. Animated bubbles travel
in the same direction. The upward spray is removed. Water turns with the ship,
appears during travel and selection previews, and disappears when parked.
Reduced Motion keeps the foam static and hides moving bubbles. Existing ship
horn, water and arrival bells are unchanged.

This applies the focused boat-water mockup. The broader ocean/shoreline mockup
and host testing controls remain pending review. Match rules, saves, protection
and other pieces are unchanged.

[Downloads](DOWNLOAD-v0.3.81.md) · [Tsunami rules](TSUNAMI.md)

Validation: 278 automated tests passed, zero failures, three optional HTTPS
skips. Checks cover authenticated/local-only launcher exit, rejected guest and
cross-site calls, and shutdown during a pending start without leaving a host
running. Actual browser checks verified owner confirmation/cancellation, managed
host shutdown with saved rooms retained, guest controls, the native game-open
route, two-client battleship movement, front-to-back foam animation, all four
headings, parked and Reduced Motion states, title-marker behavior, and a portable
review with no external requests. No browser errors were observed. The native
PowerShell source parses and its C# Win32 helper compiles under PowerShell 7 on
Linux; actual Windows form/taskbar/window cleanup still requires local review.
