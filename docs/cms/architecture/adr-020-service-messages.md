# Service messages

Reference: [KB-43](https://reload.atlassian.net/browse/KB-43).

## Context

A *service message* (`servicemeddelelse` / `servicebesked`) is a short,
time-limited notice about something affecting the library's operation —
an outage, a temporary closure, a degraded service.

The platform has no system for this. Editors improvise with articles,
which require an image and a teaser and get lost among other articles,
or with paragraphs on the front page, which require edit access to the
front page. Neither can be scheduled to disappear.

### What the design specifies

Casper Hach's design and editor wireframes define two variants:

- **Global.** A bar at the top of the header on every page, always in
  the critical (red) style. With a link, the whole bar is clickable.
- **In-page.** A container between header and hero on the front page and
  branch pages, always in the info (grey) style. Several messages stack
  in one container, with one icon for the group.

In both, heading, body and link are optional, but heading or body must be
set. Severity and icon follow the variant and are not editor choices.
Placement is chosen on the message — a "Forsiden" checkbox and a branch
multi-select — so branch editors never set up a container.

The wireframes also specify an overview under Indhold › Servicebeskeder
with an inline Aktiv toggle, filters and Dupliker, a live preview, and an
*"Erstat og aktivér"* dialog for replacing the active global message.

### Platform constraints

- `cms/` ships to 100+ sites; anything added appears in every library's
  editorial interface.
- `scheduler` is installed and used by `node.type.campaign`.
- `field.storage.node.field_branch` is `cardinality: 1`, shared by
  `article` and `page`, and `dpl_breadcrumb` depends on that.
- No editorial role is scoped to a branch
  ([permissions-and-roles.md](../permissions-and-roles.md)).
- `dpl_campaign` is the precedent for a node type that is never browsed
  as a page but selected at request time.

## Decision

### 1. A single node bundle, `service_message`

Service messages are nodes of a new bundle, in a new module
`dpl_service_message`. A node bundle gives scheduling, revisions,
per-bundle permissions, a content overview, cloning and a GraphQL toggle
through configuration.

One bundle rather than one per variant: the variants have the same
content and differ only in placement.

### 2. Fields

Prefixed `field_svcmsg_*`, as `field_service_message_*` leaves little
room under the 32-character limit. In form order:

| Field | Type | Notes |
|---|---|---|
| `field_svcmsg_heading` | `string` | "Titel". Optional. |
| `field_svcmsg_body` | `string` | "Brødtekst". Optional, plain text, max 255, text area. |
| `field_svcmsg_link` | `link` | Optional. Makes the whole message clickable. |
| `field_svcmsg_placement` | `list_string` | `global` / `in_page`. Required. Determines rendering and severity. |
| `field_svcmsg_frontpage` | `boolean` | "Forsiden". Only for `in_page`. |
| `field_svcmsg_branches` | `entity_reference` | Unlimited, target bundle `branch`. Only for `in_page`. |

A constraint requires heading or body, and for `in_page` the front page
or at least one branch.

- **No severity or icon field.** Both follow placement, as the design
  specifies. Decoupling severity later is an added field.
- **No dismiss button.** The design is undecided; it can be added later.
- **`field_svcmsg_branches` has its own storage**, as `field_branch` is
  single-valued and shared with other bundles.
- **The body is plain text, max 255 characters** (KB-63). The component
  holds a line or two of text; formatting and long text break the layout.
  `PlainTextareaWidget` offers core's text area widget for `string`
  fields, so the editor can see the whole message. Line breaks are not
  rendered.
- **The title is hidden and generated** on presave from the heading, or
  the truncated body, as nodes require a title.

### 3. Placement

Placement is an explicit field rather than "no branches means global",
which is ambiguous and can't express "front page and two branches".

- `global` — the bar on every page.
- `in_page` — on the front page if `field_svcmsg_frontpage` is set, and
  on each branch page in `field_svcmsg_branches`.

The front page is determined with `is_front` at render time. Targeting
other pages later (phase 2) means adding a targeting field.

### 4. Scheduling

`scheduler` publish and unpublish are enabled on the bundle, as on
`campaign`. Scheduling is optional.

### 5. One published global message

When a global message is published, any other published global message
is unpublished. This is done on save rather than in validation, because
scheduler publishes on cron without validation. The form warns which
message will be replaced, in place of the wireframes' modal. Rendering
also picks only the most recently saved global message.

In-page messages stack, most recently saved first, so re-saving a message
moves it to the top (KB-67).

### 6. Rendering

`hook_preprocess_page()` sets two variables, like `dpl_related_content`:

- `service_message_global` — printed as the first row of `novel`'s
  sticky header, so it moves with the header (DDF-592).
- `service_messages` — printed between the header and `page.content`.

Markup and CSS live in `novel`, not the design system, as the component
is CMS-only and the design system's styling is being moved into `/cms`
and `/react`. The CSS uses the design system's custom properties and
icons. GO is out of scope.

### 7. Permissions

`mediator`, `editor` and `local_administrator` get the bundle's node
permissions, so posting a message no longer requires edit access to the
front page.

Global placement requires `administer global service messages`, granted
to `editor` and `local_administrator`. The node form removes the `global`
option for others. The form is the only check, as service messages can
only be written through it: the bundle is not in GraphQL, REST, BNF or
any migration. If that changes, the check must be added there too.

Any editor can target any branch, as there is no per-branch access
control. Restricting that is left as a follow-up.

### 8. Editorial surface

A view under Indhold › Servicebeskeder with columns Titel, Type, Niveau,
Placering, Planlagt, Udgivet and actions; type and status filters; and a
title search. Each row has a publish/unpublish link on a CSRF-protected
route. Dupliker uses `entity_clone`.

The wireframes' Aktiv toggle is the published state, using the usual
published checkbox rather than separate "Gem som inaktiv" / "Gem og
aktivér" buttons. New messages are published by default (KB-62).

The live preview is left out of the first release.

### 9. URLs, search and sharing

- **No page of its own.** The canonical URL redirects to the first page
  the message appears on. KB-43 mentions linking to a full view of the
  message, but the design has none.
- **No pathauto pattern**, and not in the breadcrumb pattern, which
  needs a single branch.
- Excluded from the search indexes, the sitemap, BNF sharing and Linkit
  suggestions (KB-59).

### 10. Caching

Output carries a `handy_cache_tags` bundle tag, like `dpl_campaign`.
Publishing a global message therefore purges every page from Varnish.
This is acceptable, as it is rare.

### 11. App sharing (phase 2, not built)

Service messages will be shared over REST, like events
(`EventsResource`), at `/api/v1/service-messages`. GraphQL stays
disabled for the bundle.

## Consequences

- Every site gets a new content type, used or not.
- One message can appear on several branch pages.
- Severity follows placement: an urgent notice on one branch page has to
  use the global bar.
- Consumers reading the data directly, such as the future app API, must
  apply the one-global rule themselves.
- Publishing a global message purges the whole Varnish cache.
- Messages created in code get their title from the presave hook.
- `novel`'s `page.html.twig` gains two more injected variables.

## Alternatives considered

**A custom content entity.** Would have to reimplement what a node
bundle gets from configuration: scheduling, permissions, revisions, the
overview, cloning.

**A paragraph type.** A paragraph lives inside one node, can't be
scheduled on its own, and needs edit access to that node — the problem
KB-43 describes.

**A block content type.** Block visibility handles "these three branch
pages" badly, blocks aren't schedulable here, and block layout isn't a
UI for mediators.

**Two bundles, one per variant.** Would give the global permission for
free, but duplicates the fields, displays, overview and API.

**Reusing `field_branch`, with no branch meaning global.** It is
single-valued and shared, and can't express "front page and two
branches".

## Open questions

- **Position on branch pages.** The design shows the container both above
  and below the hero. It is placed above, as in the design's default.
