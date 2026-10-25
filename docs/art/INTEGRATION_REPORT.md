# Runtime art integration verification

Base: `10cd652e06af7a59122f140983e13de283488158`.

## Connected
- All 11 suspects use their real portraits. First appearance remains neutral; validated deductions and resolution dialogs select reaction variants without introducing guilt cues before evidence is established.
- Title and all four case backgrounds replace the CSS-only room. Image errors retain fallback content.
- Discovered evidence uses all nine clue illustrations. Normal/Case 4 keycards appear in the decoder. Anonymous backup values, 1,009 and AED 0% are exact HTML overlays, not generated text.
- Interactive maps retain code-owned nodes/edges. Special-route line and label require collecting the corresponding clue. Room badges have visible HTML numeric fallback.
- Decoder chips, proof button border and one-shot scan slash use the generated UI kit; all essential text and values remain HTML. Reduced motion suppresses the slash.
- Eight event-specific effects and four phase-based background loops are connected. Sound defaults off; a saved on setting still requires a new page gesture. Mute, visibility changes and pagehide stop current audio. Repeated taps are bounded, and obsolete play promises cannot revive retired sounds or pause a newer playback.

## Passed
- `node tests/core.test.cjs`: 8 checks.
- `node tests/assets.test.cjs`: 11 checks, including neutral first appearance, clue gating, exact overlays, reaction lifecycle and fallback.
- `node tests/media.test.cjs`: 10 checks, including gesture gate, mute, visibility, overlap bound and delayed play races.
- Node syntax checks for edited JavaScript and `git diff --check`.
- `node scripts/build.cjs`: regenerated `PrimeSuspect.html`, including the new media module.
- Manifest and CSS relative asset paths resolve to files in the checkout.

## Not verified / intentionally deferred
- Actual browser screenshots, responsive-device interaction and listening tests were not run: Chromium launch failed with `socket() failed: Operation not permitted`. Automated tests use a small DOM/media test double; they are not a browser end-to-end pass.
- Original high-resolution PNGs remain unchanged. Initial title background is about 2.2 MB; each neutral portrait about 2 MB. Only active scene/visible evidence is referenced, but optimized image derivatives would improve slower mobile connections.
- Generated full static blueprints and every extra expression/UI variant are not forced into the game. Interactive maps are authoritative and do not expose undiscovered routes.
- This report does not establish GitHub publication or production deployment. Those require checking the published commit and deployed files separately.
- The bundled HTML embeds code/CSS, not external media: keep its `assets` folder alongside it.
