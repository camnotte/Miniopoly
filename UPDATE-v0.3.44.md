# v0.3.44 — Your avatar default in Local and Online

Your custom photo can now be the same saved default when the host switches
between Local Multiplayer and Online Players using Start-Miniopoly.bat.

- Create and Join both preselect the saved avatar. Confirm avatar is still
  required before entering a new room.
- The choice survives the online password screen and hosting restarts.
- Uploading a replacement updates both modes. Choosing a preset intentionally
  keeps that choice; removing the photo removes it from the shared default too.
- Existing players in saved rooms retain their room portraits. Car, cat and other
  moving pieces are unchanged. Friends keep their own avatar choices.

## Install and use

1. Stop hosting. Extract Miniopoly-v0.3.44-Update.zip into an installed v0.3.40,
   v0.3.41, v0.3.42 or v0.3.43 folder, replacing matching files.
2. Run Start-Miniopoly.bat, restart hosting and refresh browsers. Confirm v0.3.44
   beside Room. Existing matches and player seats do not need a reset.
3. Open a new Create/Join screen through Game Central or Host Game Setup. Select
   or upload your photo once. The launcher remembers it for Local and Online.
4. If your photo was already saved at the Local address, first open that same
   address using the updated launcher to adopt it. If it is not shown, select it
   once again. An older browser photo cannot be read from a different address
   until that address is visited or the photo is selected again.
5. Stop hosting before switching modes as before. Open the other mode through
   the launcher; after any password sign-in, your photo should already be chosen.
   Confirm it before creating or joining the room.

This is a host-PC preference, not a new account or cloud photo service. Other
players keep their own saved browser choices. A different device/browser without
this private host launch must select its own photo. Existing working hosting
addresses, passwords, certificates, router rules and scoring are retained.

For a fresh/incomplete installation, use the complete Windows ZIP or ALL FOUR
v0344 numbered ZIPs, extracted into the same folder. Node.js LTS is required; no
older game files are required by the complete package.

## Storage and verification

The portrait default is saved outside the installation in the host setup's
private avatar directory (or the configured DATA_DIR). Do not share its
avatar-default.json file or private host launch. Ordinary invitations contain
neither its key nor its default photo. The preference grants no room seat or
hosting-control access. Online reads/writes still require game sign-in.

Checks cover Local-to-Online and Online-to-Local transfer, existing browser photo
migration, password handoff, new-upload selection, preset/removal persistence,
new-room confirmation, guest separation, preserved saved-room portraits,
unauthorized access and unavailable/corrupted preference fallback. No production
HTTPS settings were changed; browser TLS fixtures use a local test certificate.
