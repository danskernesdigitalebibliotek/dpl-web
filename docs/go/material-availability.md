# Material availability

How GO answers "can this kommune supply this edition?" — the data behind the
edition picker, the reserve button and the reservation modal's copy counts.

## Two providers, one question

A work's editions are split across two systems that know nothing about each
other:

- **Physical editions** (`BOOK`, `PICTURE_BOOK`, `COMIC`, `GRAPHIC_NOVEL`)
  live in **FBS**. Every one has a *record*, addressed by its FAUST id,
  derived from the manifestation pid.
- **Digital editions** (e-books, audiobooks, podcasts) live in **Publizon**
  and have **no FBS record at all**. Asking FBS about one returns nothing,
  which must never be read as "out of stock".

Everything below is about physical editions. Digital availability is a
separate mechanism — see [Digital availability](#digital-availability).

## What FBS answers

`holdingsLogistics/v1` takes a list of record ids and returns one entry per
record:

```jsonc
[
  {
    "recordId": "12345678",
    "reservations": 3,          // patrons queuing for this record
    "reservable": true,         // FBS's own verdict: can it be reserved?
    "holdings": [               // one entry per branch
      { "materials": [ { "available": true }, { "available": false } ] }
    ]
  }
]
```

`holdings[].materials[]` is one entry **per physical copy**. `available` is
`true` when that copy is on the shelf and `false` when it is lent out.

Copies are summed across the kommune's branches, minus any the library has
listed in `blacklistedAvailabilityBranches`. The totals therefore answer
"can this kommune supply it", not "is it on this shelf".

### `reservable` is independent of the copy counts

This is the part that surprises people. Owning a copy and being able to
reserve are separate facts:

| Situation | `totalCopies` | `availableCopies` | `reservable` |
|---|---|---|---|
| On the shelf | 2 | 1 | `true` |
| Owned, all lent out | 2 | 0 | `true` |
| Not held, obtainable elsewhere | 0 | 0 | `true` |
| Not held, not obtainable | 0 | 0 | `false` |

A lent-out book stays reservable — that is how a patron joins the queue. And
a record the kommune holds no copies of can still be reservable when it is
obtainable from another library, which FBS decides from the kommune's OVE
catalogue codes.

> **Open question:** GO does not offer interlibrary loans as a user-facing
> action, so it is not confirmed what a patron actually experiences when they
> reserve a record the kommune holds no copies of. Worth confirming with
> whoever owns the FBS integration.

## The three states GO derives

`lib/helpers/helper.availability.ts` turns the raw answer into two
questions, and the picker branches on them:

| State | Condition | UI |
|---|---|---|
| **Obtainable, on the shelf** | copies > 0, some available | Listed normally |
| **Obtainable, lent out** | copies > 0, none available | Listed, caption says "Udlånt lige nu, men du kan stadig reservere bogen" |
| **Not obtainable** | no copies and not reservable | Filtered out of the picker |

A record missing from the response counts as **not obtainable**. FBS states
explicitly when the kommune holds nothing (the record comes back with no
holdings), so silence means the edition cannot be vouched for.

An edition that is only lent out keeps its position in the list and stays
selectable, undimmed. The caption carries the status.

What survives this filter is also what decides whether the picker is offered
at all: `useShownEditions` is read by both the modal and the work page's
"Udgave" button, and a material type left with fewer than two obtainable
editions presents no choice, so the button is not rendered for it. That
covers the empty case too — a type the kommune holds nothing of gets no
button, and the reserve button carries the dead end on its own.

The modal's own "no editions" copy therefore covers one case: availability
resolving after the dialog has opened and taking the last edition away.

## No login gate

Availability is **agency-scoped, not patron-scoped**: whether the kommune
holds a record is the same fact for every visitor. Per the platform's token
rule, a service needing no user context is called with the library token,
which every session carries — anonymous ones included.

A logged-out visitor therefore sees exactly the same editions as a logged-in
one. Only the reserve and loan *actions* depend on the session.

## When the request fails

A failed query knows nothing about any record, which is different from a
successful answer that left one out. The two must not be conflated: treating
a failure as "nothing is obtainable" would hide every edition and disable
every reserve button at once.

On failure the picker shows all editions unmarked, with a notice that
availability could not be read. FBS is the authority at reservation time and
rejects what it cannot supply, so the fallback is safe.

## Where the code lives

| File | Responsibility |
|---|---|
| `packages/service-layer/fbs/src/mappers/availability.mapper.ts` | Parses the FBS response into `MaterialAvailability` |
| `packages/service-layer/src/types.ts` | `MaterialAvailability`, `RecordAvailability` |
| `go/lib/helpers/helper.availability.ts` | The obtainable / on-loan rules |
| `go/hooks/useEditionAvailability.ts` | React hook; also exports `useWorkRecordIds` |
| `go/hooks/useShownEditions.ts` | The editions of one material type that survive the filter |
| `go/lib/helpers/helper.digitalAvailability.ts` | The Publizon status rule |
| `go/hooks/useDigitalEditionAvailability.ts` | React hook for digital editions |
| `go/hooks/useBlacklistedAvailabilityBranches.ts` | Branches the library excludes |

`useWorkRecordIds` derives the full set of physical record ids for a work.
Record ids are part of the react-query key, so every caller must ask about
the same set or they open separate cache entries and fire duplicate
requests.

## Digital availability

Digital editions are answered by **Publizon**, through the batch endpoint
`POST /v1/loanstatus`. One request covers every digital identifier of a
work, keyed by the identifier the manifestation carries (`PUBLIZON`, or its
ISBN as a fallback).

### Only 3 and 4 can be borrowed

`loanStatus` is documented as 0–5 but the generated type allows 0–7, and
`react` carries two tables for it that **disagree about what 5 means**:

| Table | Used for | Says about 5 |
|---|---|---|
| `getLoanStatus` | loan and reserve buttons | `reservable` — the material *can* be obtained |
| `publizonProductStatuses` | availability labels | `isAvailable: false` |

The button table is the one to mirror here, since this drives a button.
`usePublizonReaderPlayerState` reads it as an **allowlist**: only 3
(redeemable) and 4 (loanable) can be borrowed, and 5 is what opens the
reserve flow.

GO uses the same allowlist. Status 5 still ends as a dead end here, but for
its own reason — GO cannot reserve digital material — and statuses 1
(already loaned) and 2 (reserved, not redeemable) are caught with it, which
a "everything but 5" rule would have let through to a loan that fails.

An identifier Publizon did not answer for, or answered for without a status,
stays borrowable: silence is not a verdict.

### The loan button carries it, not the picker

Digital editions cannot be reserved in GO — the work page offers "Lån" and
"Prøv", never "Reserver". An edition in a queue is a dead end, so the loan
button is disabled and reads "Udlånt lige nu", logged in or out. Trying a
sample stays available, and an edition already on loan to the reader still
opens.

The edition stays selectable in the picker, captioned "Udlånt lige nu"
against the physical wording "Udlånt lige nu, men du kan stadig reservere
bogen". Disabling it there would not be enough on its own — a reader also
arrives through a shared link, through "nyeste", or because it is the only
edition of its type — and filtering it out would leave an empty picker for a
type with one edition.

### Two providers, and a migration

`react` asks the **Biblio adapter** (via the service layer's
`useDigitalLoanDecision`) for libraries that have switched, and Publizon for
those that have not — never both, since falling back would offer a loan the
library has decided not to make.

GO has no Biblio adapter yet, so only the Publizon path applies. The switch
is expected around late October 2026. `useDigitalEditionAvailability` is the
single place that will need to change.

### Not covered

The kommune having no licence, having turned availability off, or having hit
its own availability limit are **not** distinguishable in `loanstatus`.
Those are Biblio-adapter answers, and are out of reach until GO talks to it.

## Related

- [ADR-012: Edition availability filtering](./architecture/adr-012-edition-availability.md)
- [ADR-010: Service layer](./architecture/adr-010-service-layer.md)
- [ADR-008: Third-party service caching](./architecture/adr-008-third-party-service-caching.md)
