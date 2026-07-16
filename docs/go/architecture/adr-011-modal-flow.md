# Modal flow module

## Context

The profile and work-page features grew a family of multi-view modals —
DigitalLoansModal, PhysicalLoansModal and ReservationsModal — that each move
through the same internal flow: a list view, a detail view for a selected
item, and (where a mutation exists) a receipt view. Modals are never stacked;
the views replace each other inside one dialog.

Each modal currently hand-rolls the identical orchestration:

- `selected` item state, a receipt flag, and a numeric `direction`
- a derived `viewKey` selecting which view renders
- a `goBack()` coordinating direction, state reset and scroll restoration
- an animated title (`AnimatePresence` + `motion.span` with the shared
  `modalViewVariants` and a 0.2s transition)
- the same wrapper stack: `AnimateChangeInHeight` with
  `-mx-6 overflow-x-clip px-6` around `ModalViewTransition`
- scroll choreography via `useModalViewScroll` (details open at the top,
  going back restores the list position)

The animation primitives underneath (`ModalViewTransition`,
`AnimateChangeInHeight`, `useModalViewScroll`) are deep and shared, but the
orchestration above them is a shallow pattern copied per modal. Bugs in the
transition/scroll choreography have had to be fixed once per modal, and every
new multi-view modal starts by copying ~60 lines of state machine.

## Decision

Introduce a single deep module — a `useModalFlow` hook (with an optional
`ModalFlow` wrapper component) — that owns the multi-view modal flow:

- view state (`list` / `detail` / `receipt`, or arbitrary declared views),
  including the direction of travel between them
- the animated title, derived from per-view titles
- scroll remember/restore/reset sequencing, delegated to `useModalViewScroll`
- the standard wrapper stack around the active view

Modals declare their views (key, title, render) and receive
`{ view, select, back, title, Wrapper }`. They keep full ownership of their
data, mutations and footers; the flow module owns everything kinetic.

DigitalLoansModal, PhysicalLoansModal and ReservationsModal migrate to the
module; new multi-view modals must use it rather than re-implementing the
pattern.

## Alternatives considered

- **Keep copying the pattern** — rejected: three co-evolving copies already
  drifted (back-button rules, scroll timing) and each fix has to be applied
  per modal.
- **A full modal state machine in the modal store** — rejected: the store
  deliberately only knows *which* modal is open and its data props; in-modal
  steps are internal component state by design (see the modal registry in
  `store/modal.store.ts`). The flow module keeps that boundary.
- **Documenting the pattern as a template** — rejected: documentation does
  not stop drift, and the pattern is stable enough to be code.

## Consequences

### Positive

- Transition, title and scroll bugs are fixed in one place.
- A new multi-view modal is a page of declarative code.
- The flow machine (view/direction/scroll sequencing) becomes testable
  headlessly, independent of any particular modal's data.

### Negative

- One more indirection between a modal and the animation primitives.
- The three existing modals must be migrated in step, or the pattern exists
  in two forms during the transition.
