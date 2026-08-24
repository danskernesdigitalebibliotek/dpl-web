# Service messages

Reference: [KB-43](https://reload.atlassian.net/browse/KB-43).

## Context

A *service message* (`servicemeddelelse` / `servicebesked`) is a short,
time-limited notice about something affecting the library's operation —
an outage, a temporary closure, a degraded service.

The platform has no system for this. Editors improvise with articles,
which force an image and a teaser and drown the message among ordinary
articles, or with link/accordion paragraphs on the front page. The
paragraph route has the decisive flaw: a paragraph is edited inside the
host node's `field_paragraphs`, so posting one requires edit access to
that page. Local editors who may not edit the front page cannot post a
service message at all. Neither workaround can be scheduled to disappear.

### What the design specifies

Casper Hach's frontend design and editor wireframes settle on two
variants of one kind of content.

**Global.** A bar above the header, on every page, always in the critical
rendering. Optional heading, optional body, optional link; with a link
the whole bar is clickable.

**In-page.** A container between header and hero, on the front page and
branch pages, always in the info rendering. Several active messages stack
inside one container, which carries a single icon for the whole group.

Three points drive the data model:

- **Severity is not an editor choice.** *"Niveauet følger typen: global =
  altid kritisk/rød. Ingen valgmulighed."* and *"In-page beskeder er
  altid info/grå."* Type *is* criticality.
- **Heading and body are each optional, but not both.** *"Titel (valgfri
  hvis brødtekst udfyldt)"* / *"Brødtekst (valgfri hvis titel udfyldt)"*.
- **The icon is not an editor choice either.** It is fixed in both
  variants and drawn once per container, not once per message.

Placement is chosen on the message, not the page: *"Placeringen vælges på
beskeden — branch-redaktøren skal ikke selv opsætte containeren."* The
control is a "Forsiden" checkbox plus a searchable branch multi-select.

The wireframes also specify an editorial surface: an overview under
Indhold › Servicebeskeder (columns Titel, Type, Niveau, Placering,
Planlagt, inline Aktiv toggle; type and status filters; Dupliker), a live
preview in the form, "Gem som inaktiv" / "Gem og aktivér", and an
*"Erstat og aktivér"* dialog when activating a global message while
another is active — the replaced one becomes inactive, not deleted.

### Platform constraints

- `cms/` ships to 100+ sites from one codebase; anything added here
  appears in every library's editorial interface.
- `scheduler` is installed and already wired to node types
  (`node.type.campaign`); `editor` holds `schedule publishing of nodes`.
- `field.storage.node.field_branch` is `cardinality: 1`, shared by
  `article` and `page`. `dpl_breadcrumb`'s `BreadcrumbHelper` keys off it.
- Editorial roles are `mediator`, `editor`, `local_administrator`,
  `administrator` ([permissions-and-roles.md](../permissions-and-roles.md)).
  **None is scoped to a branch** — there is no per-branch access control.
- The only custom content entity in `web/modules/custom` is `bnf_client`'s
  `Subscription`; events are contrib `recurring_events`.
- `dpl_campaign` is the precedent for a node type that is never browsed
  as a page but selected at request time.
- `entity_clone` is installed.

## Decision

### 1. A single node bundle, `service_message`

Stored as nodes of a new bundle, supported by a new module
`dpl_service_message`.

A node bundle gives us by configuration: scheduled publish/unpublish,
revisions, per-bundle permissions, a content overview to build the
listing on, cloning, and a per-bundle GraphQL toggle.

One bundle, not one per variant: the two carry identical content and
differ only in placement. A second bundle would duplicate the field set,
both displays, the breadcrumb, search-index and API surfaces, to buy one
permission split we can express directly (§7).

### 2. Fields

Prefix is `field_svcmsg_*`. The bundle name would give
`field_service_message_*`, but field machine names cap at 32 characters
and that leaves no room to grow. Plain `field_service_*` reads as
"service" in general; the contraction stays short while naming the
bundle it belongs to.

| Field | Type | Notes |
|---|---|---|
| `field_svcmsg_placement` | `list_string` | `global` / `in_page`. Required. Determines rendering and severity. |
| `field_svcmsg_heading` | `string` | "Titel". Optional. |
| `field_svcmsg_body` | `text_long` | "Brødtekst". Optional, restricted format. |
| `field_svcmsg_link` | `link` | Optional. Makes the whole message clickable. |
| `field_svcmsg_frontpage` | `boolean` | "Forsiden". Only for `in_page`. |
| `field_svcmsg_branches` | `entity_reference` | Unlimited, target bundle `branch`. Only for `in_page`. |

A constraint requires at least one of heading/body, and for `in_page` at
least one of frontpage/branches.

**No severity field.** Tone follows placement. A field the editor cannot
set is a field that gets set wrongly by imports and APIs. Decoupling tone
from type later is an added field, not a remodelling.

**No icon field.** The wireframes toggled the icon per message; the
design draws one per container. KB-43 settles it in favour of the design
— the icon is a fixed part of the component *"fordi det er med til at
identificere beskedtypen"* — so there is nothing for the editor to set.

**No dismiss button.** Unresolved in the design — an earlier artboard has
the little x, the final one does not — and left out. Additive later.

**`field_svcmsg_branches` gets its own storage.** Instances cannot cap
cardinality below their storage, so reusing `field_branch` would either
limit a message to one branch or force `article` and `page` to become
multi-branch.

**The node title is hidden and generated.** The design wants body-only
messages, but node titles are mandatory and every core UI needs a label.
`title` is removed from the form and populated on presave from the
heading, falling back to a truncated body.

### 3. Placement model

Explicit, rather than "empty branch field means global" — which is
ambiguous and cannot express "front page *and* two named branches".

- `global` — bar above the header on every page; frontpage and branch
  fields hidden.
- `in_page` — shown on the front page if `field_svcmsg_frontpage` is
  set, and on each branch page in `field_svcmsg_branches`.

"Front page" resolves from `is_front` at render time; `system.site`
`page.front` differs per site.

This is the extension point for the phase-2 wish of arbitrary pages (a
printer notice on the print page, a broken lift on events at that
branch): another targeting field, no change to the global variant.

### 4. Scheduling

`scheduler` third-party settings on the bundle, `publish_enable` and
`unpublish_enable` on, mirroring `node.type.campaign`.

Scheduling is optional, as the wireframes have it — *"Uden datoer:
styres kun af Aktiv-togglen. Slutdato deaktiverer automatisk."* — and as
KB-43's *"skal kunne sættes til automatisk publicering/afpublicering"*
implies.

### 5. One active global message

Implemented as an **invariant on the publish transition**, not a
save-time constraint: when a `global` message becomes published, any
other published `global` message is unpublished.

The editor-facing half is a warning on the form naming the message that
will be replaced, rather than the wireframes' *"Erstat og aktivér"*
modal. The modal can only speak for saves that pass through the form,
and the rule holds for the ones that do not.

Save-time validation would not be enough, because scheduler transitions
happen later on cron: nothing at save time can see that two messages with
overlapping windows will both publish tomorrow morning. Rendering also
picks a single global message defensively, newest first.

In-page messages have no such limit; several stack, newest first.

### 6. Rendering

`dpl_service_message` implements `hook_preprocess_page()` and sets two
variables, following `dpl_related_content`'s pattern for injecting
`related_content`:

- `service_message_global` — printed in `novel`'s `page.html.twig`
  immediately before the header include.
- `service_messages` — printed between the header include and
  `page.content`, where the design puts the container on both page types.

Markup and CSS both live in `novel`, rather than making the round trip
through the design system: a component used only by the CMS has no reason
to, and the design system is on its way out — its own `AGENTS.md` says
styling is being absorbed into `/cms` and `/react`. The CSS still builds
on what the design system already ships to the theme: its custom
properties, icon assets and page-fold classes. GO is out of scope — it
has its own visual identity.

### 7. Permissions

Per-bundle node permissions go to `mediator`, `editor` and
`local_administrator`. That alone settles one of the problems KB-43
describes: posting a service message no longer rides on edit access to
the front page.

A global message appears on every page in the most urgent rendering the
site has, so `dpl_service_message.permissions.yml` adds `administer
global service messages` — `editor` and `local_administrator`, not
`mediator`. It gates the `global` option through a form alter, backed by
a validation constraint so it also holds for programmatic saves.

What this does not give: no role is branch-scoped, so any editor who can
create a service message can target any branch. Restricting local editors
to their own branch needs per-branch access control the platform does not
have. Out of scope, left as a follow-up.

### 8. Editorial surface

A view on the bundle, exposed under Indhold › Servicebeskeder:

- Columns Titel, Type, Niveau, Placering, Planlagt, Udgivet, actions.
  Niveau derives from Type; Placering is a rendered summary ("Hele
  sitet", "Østerbro, Nørrebro", "Forside + 12 branches"); Planlagt shows
  the scheduler range.
- Type and status filters plus a title search.
- A per-row publish/unpublish link — a small custom views field over a
  CSRF-protected route, not core's bulk-operations form. A link rather
  than a checkbox with a save button: publishing a message is the one
  thing an editor comes to this list to do.
- Dupliker is `entity_clone`.

**The wireframes' Aktiv toggle is core's published state, under its own
name.** Their "Gem som inaktiv" / "Gem og aktivér" buttons would sit next
to the published checkbox and mean the same thing twice. Editors already
know published/unpublished from every other content type here, so the
bundle keeps the ordinary checkbox, defaulted to unpublished so a
half-written notice cannot go site-wide the moment it is first saved.

The live preview is custom frontend work with no analogue in the CMS. It
is cut from the first release; the rest of the surface does not depend on
it.

### 9. URLs, search and sharing

- **A message has no page of its own.** There is nothing to show on one:
  a service message is a line of text meant to be read where it sits. The
  canonical URL redirects to the first page the message appears on — the
  front page, or the first branch it names.

  The ticket does ask for the link to be able to point at *"fuldnodevisning
  af servicemeddelelse"*. The wireframes never grew a control for it and
  the design has no full view drawn, so there is nothing to build against
  and it is left out. Adding it later is a targeting decision, not a
  remodelling: the redirect steps aside for whichever messages are marked
  as having a page.
- **No pathauto pattern**, since the URL is never a destination. It is
  also **not** added to `pathauto.pattern.breadcrumb_pattern`: that
  pattern derives an alias from the breadcrumb, which `BreadcrumbHelper`
  builds from a single-valued branch field, and an unlimited branch field
  has no single parent.
- Excluded from `search_api.index.content` and `content_events`, as
  `branch` and `campaign` already are.
- No `simple_sitemap` bundle settings.
- Not shareable through BNF — one library's printer notice means nothing
  at another library.

### 10. Caching

Output carries a `handy_cache_tags` bundle-list tag, following
`dpl_campaign`'s `MatchResource`.

The global bar renders on every page, so publishing one invalidates the
whole site in Varnish. Acceptable: it is rare, and scheduler transitions
run on cron, so purges are batched.

### 11. App sharing (phase 2, not built now)

Events are shared over REST — `dpl_event`'s `EventsResource`,
`rest.resource.events.yml` (GET, JSON, basic auth + cookie), described in
`cms/openapi.json`. Service messages follow the same path, a
`/api/v1/service-messages` resource in `dpl_service_message`, rather than
GraphQL. The bundle stays `enabled: false` in
`graphql_compose.settings.yml` for now.

## Consequences

- Every site gains a content type and an Indhold item, used or not.
- One place to write a notice, one place to schedule its removal, and a
  permission independent of who may edit the front page.
- Placement is data on the message, so one message can appear on several
  branch pages and moving it is an edit, not a copy.
- Tone is welded to placement. A library wanting an urgent notice on one
  branch page has to use the global bar, which shows everywhere.
- The one-global rule lives in the publish transition, so it holds for
  scheduled and programmatic activation too — but any consumer reading
  the data directly, including the future app API, must apply the same
  selection rule rather than assume the data holds only one.
- Publishing a global message purges the whole Varnish cache.
- Anything creating a service message programmatically must go through
  the presave logic to get a label.
- Phase-2 targeting is additive: new fields, new query conditions, no
  migration.
- `novel`'s `page.html.twig` gains two more injected variables. That
  template is becoming where cross-cutting page furniture is assembled;
  worth watching, not worth solving here.

## Alternatives considered

**A custom content entity.** Rejected: no precedent in the repo, and we
would reimplement scheduler support, per-bundle permissions, revisions,
the overview, cloning, breadcrumbs and the admin UI that a node bundle
provides as configuration.

**A paragraph type.** The obvious "component" shape. Rejected: a
paragraph lives inside one host node, cannot be reused across pages,
cannot be scheduled independently, and inherits the host's edit access —
precisely the problem KB-43 describes. The wireframes require the
opposite: placement is chosen on the message so a branch editor never
sets up a container.

**A block content type via block layout.** Cheap site-wide placement, but
visibility conditions fit "these three branch pages" badly, blocks are
not schedulable here, and block placement is not a UI for mediators.

**Two bundles, one per variant.** Would make the global-message
permission fall out of bundle permissions and avoid hiding irrelevant
fields. Rejected: identical content, so it duplicates the field set, both
displays, the overview and the API surface across 100+ sites.

**Reusing `field_branch`, "no branch" meaning global.** Rejected:
cardinality 1 on a storage shared with `article` and `page`, and an
implicit global cannot express "front page and two branches".

## Open questions

Not blocking the data model; needed before the frontend is finished.

- **Position on branch pages.** The design ships both above and below the
  hero; Casper's note argues against the top for low-urgency notices. The
  injection mechanism supports either. The build puts it above the hero,
  where the design's default artboard has it.
