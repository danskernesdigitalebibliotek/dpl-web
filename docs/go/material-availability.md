# Material availability

How GO answers "can this kommune supply this edition?" — the data behind the
edition picker, the reserve button and the reservation modal's copy counts.

## Two providers, one question

A work's editions are split across two systems that know nothing about each
other:

- **Physical editions** (`BOOK`, `PICTURE_BOOK`, `COMIC`, `GRAPHIC_NOVEL`)
  live in **FBS**. Every one has a _record_, addressed by its FAUST id,
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
        "reservations": 3, // patrons queuing for this record
        "reservable": true, // FBS's own verdict: can it be reserved?
        "holdings": [
            // one entry per branch
            { "materials": [{ "available": true }, { "available": false }] },
        ],
    },
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

| Situation                      | `totalCopies` | `availableCopies` | `reservable` |
| ------------------------------ | ------------- | ----------------- | ------------ |
| On the shelf                   | 2             | 1                 | `true`       |
| Owned, all lent out            | 2             | 0                 | `true`       |
| Not held, obtainable elsewhere | 0             | 0                 | `true`       |
| Not held, not obtainable       | 0             | 0                 | `false`      |

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

| State                        | Condition                    | UI                                                                   |
| ---------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| **Obtainable, on the shelf** | copies > 0, some available   | Listed normally                                                      |
| **Obtainable, lent out**     | copies > 0, none available   | Listed, caption says "Udlånt lige nu" (plus the queue count, if any) |
| **Not obtainable**           | no copies and not reservable | Filtered out of the picker                                           |

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

## No login gate — physical editions only

FBS (fysical materials) availability is **agency-scoped, not patron-scoped**: whether the
kommune holds a record is the same fact for every visitor. Per the
platform's token rule, a service needing no user context is called with the
library token, which every session carries — anonymous ones included.

A logged-out visitor therefore sees exactly the same physical editions as a
logged-in one. Only the reserve and loan _actions_ depend on the session.

Biblio (digital availability) does **not** share this property — see
[Digital availability](#digital-availability): Biblio's loan decision is
patron-scoped, so a logged-out visitor sees every digital edition as
borrowable regardless of its real status.

## When the request fails

A failed query knows nothing about any record, which is different from a
successful answer that left one out. The two must not be conflated: treating
a failure as "nothing is obtainable" would hide every edition and disable
every reserve button at once.

On failure the picker shows all editions unmarked, with a notice that
availability could not be read. FBS is the authority at reservation time and
rejects what it cannot supply, so the fallback is safe.

## Where the code lives

| File                                                            | Responsibility                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| `packages/service-layer/fbs/src/mappers/availability.mapper.ts` | Parses the FBS response into `MaterialAvailability`          |
| `packages/service-layer/src/types.ts`                           | `MaterialAvailability`, `RecordAvailability`                 |
| `go/lib/helpers/helper.availability.ts`                         | The obtainable / on-loan rules                               |
| `go/hooks/useEditionAvailability.ts`                            | React hook; also exports `useWorkRecordIds`                  |
| `go/hooks/useShownEditions.ts`                                  | The editions of one material type that survive the filter    |
| `go/hooks/useBlacklistedAvailabilityBranches.ts`                | Branches the library excludes                                |
| `packages/service-layer/src/digital-loan-decision.ts`           | `isMaterialAvailable` and friends                            |
| `packages/service-layer/src/hooks/useDigitalLoanDecision(s).ts` | The Biblio loan-decision hooks, single and batch             |
| `go/hooks/useDigitalEditionAvailabilityBiblio.ts`               | React hook for one digital edition                           |
| `go/hooks/useDigitalEditionsAvailabilityBiblio.ts`              | React hook for several digital editions at once (the picker) |

`useWorkRecordIds` derives the full set of physical record ids for a work.
Record ids are part of the react-query key, so every caller must ask about
the same set or they open separate cache entries and fire duplicate
requests.

## Digital availability

Digital editions are answered by the **Biblio adapter**'s loan decision
(`GET /v1/loans/can-loan`, wrapped by the service layer's
`useDigitalLoanDecision`/`useDigitalLoanDecisions`), keyed by the
manifestation's ISBN-13. `go/hooks/useDigitalEditionAvailabilityBiblio.ts`
asks it for one manifestation; the plural
`useDigitalEditionsAvailabilityBiblio.ts` asks it for several at once (the
picker), since the endpoint takes one material id per request — there is no
batch call the way FBS and the former Publizon path had.

### Patron-scoped, unlike FBS

This is the one place digital and physical availability behave differently
at the account level (see [No login gate](#no-login-gate--physical-editions-only)).
Biblio's loan decision requires a token for a specific end user — there is
no agency-level equivalent to FBS's library token. Without a borrowing
session (`ServiceLayerConfig.canUseDigitalLoans` — a patron, or a Unilogin
user per ADR-013), there is nothing to ask.

For that session, and for anything the decision has not resolved yet, the
edition is treated as borrowable. The alternative — marking the whole
digital catalogue unavailable for every anonymous reader — is a worse
answer than occasionally sending a signed-out reader toward a loan that
turns out to be unavailable only once they sign in; the loan attempt itself
is the fail-safe that catches and explains that case.

### `isMaterialAvailable` picks out the material from the decision

A loan decision's `status` (`LoanDecisionStatus`) answers a mixed question:
is the _material_ obtainable at all, and separately, can _this patron_
borrow it right now. `isMaterialAvailable` (`packages/service-layer`) keeps
only the first: `loanable` and the patron-scoped statuses
(`monthly_limit_exceeded`, `concurrent_limit_exceeded`, `no_valid_credentials`,
`lending_blocked`) count as available, since another, unaffected patron
could still borrow the same material right now. Only `unavailable`,
`reservable` and `wishable` mean the material itself cannot be lent.

`concurrent_limit_exceeded` reads like a per-material cap from its name, but
WeDoBooks has confirmed it is the patron's own cap on concurrent cost-free
loans — a user-scoped fact, grouped with the other three. Re-litigating that
grouping needs the same confirmation, not just a closer reading of the
Biblio adapter's generated model comments, which are more ambiguous than
they first look.

### The loan button carries it, not the picker

Digital editions cannot be reserved in GO — the work page offers "Lån" and
"Prøv", never "Reserver". An edition the patron cannot borrow is a dead
end, so the loan button is `aria-disabled` (not `disabled`, so it keeps its
place in the tab order) with a `HelpText` line reading "Udlånt lige nu"
above it, the button keeping its normal "Lån {label}" wording — the same
pattern `PhysicalReservationButton` uses for its own status lines. Trying a
sample stays available, and an edition already on loan to the reader still
opens.

The edition stays selectable in the picker, captioned "Udlånt lige nu" —
the same base wording the physical state uses, except the physical one can
also carry a queue count. Disabling it there would not be enough on its
own — a reader also arrives through a shared link, through "nyeste", or
because it is the only edition of its type — and filtering it out would
leave an empty picker for a type with one edition.

### Not covered

The kommune having no licence, having turned availability off, or having hit
its own availability limit are **not** distinguishable from an ordinary
`unavailable` decision — Biblio does not expose which of those applies.

## Related

- [ADR-012: Edition availability filtering](./architecture/adr-012-edition-availability.md)
- [ADR-010: Service layer](./architecture/adr-010-service-layer.md)
- [ADR-008: Third-party service caching](./architecture/adr-008-third-party-service-caching.md)
