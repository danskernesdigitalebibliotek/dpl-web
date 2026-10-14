# Edition availability filtering

## Context

The work page lets a reader pick a specific edition. The picker listed every
edition a work has, so a reader could choose one the visited kommune has
nothing of — and only find out when the reservation failed.

GO's audience is children. An edition they cannot get is not information
they can act on, and a reservation that fails after they commit to it is
hard for them to make sense of.

FBS answers per record with two independent signals: how many copies the
kommune holds (and how many are on the shelf), and whether the record is
reservable at all. See
[Material availability](../material-availability.md) for the data model.

## Decision

**Filter out what cannot be supplied; keep and mark what is merely lent
out.**

- No copies and not reservable → left out of the picker entirely.
- Copies, all lent out → listed in its original position, fully selectable,
  with a caption saying it can still be reserved.
- A record missing from the FBS response → treated as **not obtainable**.

"Nyeste" resolves to the newest edition that can actually be supplied, both
in the picker and on the work page, so the two never describe different
editions.

**No login gate.** Availability is agency-scoped, so it is fetched with the
library token for every visitor, logged in or not.

**A failed request is not an empty answer.** On error every edition is shown
unmarked, with a notice that availability could not be read.

**Physical editions only.** Digital editions have no FBS record and are
never marked unavailable by this mechanism.

## Trade-off

A reader with a shared link pinning an edition the kommune cannot supply
still sees that edition selected, because the pin wins over the default
pick. The reserve button then says "Vælg en anden udgave" rather than
silently swapping their choice — a dead end is shown, but it is explained
and it is the reader's own link that caused it.

Filtering also means a reader cannot see that an edition exists at all in
the wider catalogue. That is deliberate for this audience, and it is the
main way this decision would need revisiting if GO ever served adults.

## Open question

GO does not offer interlibrary loans as a user-facing action, yet FBS can
report a record as reservable when the kommune holds no copies of it. What a
patron actually experiences in that case is unconfirmed, so those editions
are currently kept. If it turns out they cannot in practice be supplied, the
rule becomes `totalCopies > 0` alone.

## Related

- [Material availability](../material-availability.md) — how the data works
- [ADR-010: Service layer](./adr-010-service-layer.md)
