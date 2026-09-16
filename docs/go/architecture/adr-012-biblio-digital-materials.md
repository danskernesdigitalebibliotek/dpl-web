# Biblio digital materials

## Context

The platform is switching its digital materials (e-books, audiobooks) from
Publizon to the Biblio adapter with WeDoBooks' reader and player. The CMS
web apps switched first, behind a library-level flag. GO needed the same
switch, independently toggleable, without breaking the loans patrons
already hold.

## Decision

**A separate GO flag.** `dpl_biblio.settings:enabled_go`, set next to the
web-app flag in the CMS and exposed to GO through
`goConfiguration.public.biblio` together with the adapter base url and the
WeDoBooks SDK client keys. All-or-nothing: `useBiblioAdapter()` is only
true when flag, url and keys are all present, and a CMS without the field
parses as "off" — GO can ship first.

**The loan decides the track.** With the flag on, new loans are made
through the Biblio adapter only, but existing Publizon loans stay visible
and open in pubhub's reader/player until they expire. `orderId` opens the
old track, `loanId` the new — `getReadUrlForLoan` is that rule as code.
The coexistence window closes by itself as the old loans run out.

**Sessions.** The adapter authenticates Adgangsplatformen patrons only.
Unilogin users see all buttons but get a child-friendly error on loan and
sample attempts; the adapter queries never fire for them (patron-gated in
the service layer). Anonymous preview is gone — WeDoBooks answers samples
for signed-in patrons only, and there is no Publizon fallback.

**The reader renders in flow on a chrome-less route.** The WeDoBooks SDK
sizes its UI against the viewport and measures its surroundings at mount,
so it needs the footing it has in the CMS: normal page flow, no chrome.
The read route lives in the `(reader)` route group without header/footer;
header and footer moved from the root layout into the page group layouts.
One collision is neutralized in `globals.css`: the SDK renders light-DOM
elements with `class="container"`, which Tailwind's `container` utility
would clamp to breakpoint widths.

**The player is the SDK's own bar, mounted globally.** A `player.store`
(`@xstate/store`) decides *whether and what* plays; `GlobalPlayer` in the
root layout — deliberately outside `DynamicModal`, which closes on route
changes — mounts `WedoBooksPlayer`, and the bar itself owns minimised,
expanded, chapters and speed. Playback survives navigation.

**Per-app reader hooks.** GO's `useReaderSdk`/`useReaderCheckout` live in
`go/hooks/`, siblings of the react apps' hooks rather than a shared
implementation: each app binds the SDK to its own config source (the CMS
GraphQL configuration here, data attributes there) and its own session
model. Both build on the service layer's existing exports
(`readerSignInTokenQuery`, `useServiceLayerConfig`, the digital hooks —
see ADR-010); the service-layer and wedobooks packages are unchanged.

## Rejected

- **A shared, parameterized reader hook in the service layer** — served
  both apps but shaped GO's code around react's needs; separation per app
  won.
- **Overlay rendering of the reader** (fixed wrapper, portal to body,
  scroll lock, remount on resize) — every variant fought the SDK's own
  viewport sizing; the chrome-less route removed the need.
- **`sizing: "container"`** — the SDK's container mode measures once and
  never again.
- **A custom (headless) player UI** — the SDK bar as delivered was chosen
  over rebuilding its features.
