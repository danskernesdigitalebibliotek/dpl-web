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
| `go/hooks/useBlacklistedAvailabilityBranches.ts` | Branches the library excludes |

`useWorkRecordIds` derives the full set of physical record ids for a work.
Record ids are part of the react-query key, so every caller must ask about
the same set or they open separate cache entries and fire duplicate
requests.

## Digital availability

Digital editions can be unavailable too — the kommune may hold no licence,
have turned availability off, or have hit its availability limit. FB CMS
surfaces this today.

The mechanism is Publizon's `loanStatus` (0–5, where 5 means a reservation
queue). GO has generated clients for `GET /v1/loanstatus/{identifier}` and
the batch `POST /v1/loanstatus`, but does not call them yet.

**Not implemented.** Until it is, digital editions are never marked
unavailable in the picker.

## Related

- [ADR-012: Edition availability filtering](./architecture/adr-012-edition-availability.md)
- [ADR-010: Service layer](./architecture/adr-010-service-layer.md)
- [ADR-008: Third-party service caching](./architecture/adr-008-third-party-service-caching.md)
