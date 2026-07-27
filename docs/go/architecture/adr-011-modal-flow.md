# Modal flow module

## Context

Our multi-view modals (digital/physical loans, reservations, loan
confirmation) each copied the same ~60 lines: view state, direction,
animated title, body wrapper and scroll handling. Every bug had to be fixed
once per modal.

## Decision

One shared module in `components/shared/modalFlow/`:

- `useModalFlow<View>({ initial })` keeps a history of view keys:
  `goTo(view)` goes forward, `back()` retraces the path taken, `reset(view)`
  starts over, `canGoBack` reports history. It renders the animated title
  and body (`animatedTitle(text)`, `renderBody(children)`) and remembers
  scroll per view — forward saves the outgoing view's position, back
  restores it.
- `ModalFlowBody` is the shared body wrapper. Simple forward-only modals
  (details → receipt) use it directly.

The hook owns the mechanics. Each modal owns its data, footers and when a
back button is shown (receipts are terminal).

## Rejected

- Passing a views/config object to the hook — conditional rendering on
  `flow.view` keeps data guards and data-driven titles in the modal.
- Putting the flow in the modal store — the store only knows which modal is
  open; steps are component state.

## Trade-off

View state and data state are separate, so views that need data are guarded
at render time.
