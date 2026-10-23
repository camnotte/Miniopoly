# Championship typography review

Current review: the user supplied AmericanCaptain-MdEY.otf and requested that
font instead of the previous candidates. Its internal family is American Captain
Regular. The latest request also applies American Captain to dollar amounts, so
player names, CHAMPION and all three totals now use the uploaded font. Keep the title high contrast and second- and
third-place game pieces beside their totals.

The current screenshot is
downloads/v0.3.59/Championship-American-Captain-All-Text.png. Browser verification
confirmed that the supplied font loaded, all three names used American Captain,
all three dollar amounts used American Captain without overflowing and both
runner-up piece rows were present.
The uploaded font is retained in the local mockup assets; it is not added to the
live game or distributed as a font file by this preview commit.

This directory records the mockup direction only. Live game CSS, JavaScript,
version and installation packages have not been changed by this review.

The matching screenshot is downloads/v0.3.59/Championship-Typography-Mockup-3.png.
The three-player browser preview loaded both requested fonts successfully and
verified all three player names, all three amounts and both runner-up piece rows.

The trophy numeral still uses a labeled placeholder. Apple Chancery was requested
but is not installed or supplied; do not label a substitute as Apple Chancery.

Font files and their SIL Open Font Licenses are retained in fonts/. They were
obtained over verified HTTPS from Google's authoritative google/fonts repository:
- ofl/librebaskerville/LibreBaskerville[wght].ttf
- ofl/librebaskerville/OFL.txt
- ofl/inter/Inter[opsz,wght].ttf
- ofl/inter/OFL.txt

SHA-256:
Inter-OFL.txt  5b9321a4298cfeb6b34354164a1c3afc3db114569984c502b9b35d988fd58c57
Inter.ttf  29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031
LibreBaskerville-OFL.txt  3624eddd4c8f8a908130a417ae7cd089c9da69899c4e0ca1a5217d0a6fae16fd
LibreBaskerville.ttf  05a95421961341c5b2556285e8415df9db27dab4f4abe22b446b3c6a8b916c5d

Additional comparison fonts are from google/fonts under ofl/montserrat,
ofl/sourcesans3 and ofl/barlowcondensed, with their original OFL license files.
