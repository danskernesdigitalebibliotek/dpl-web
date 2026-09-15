import * as React from "react"

import { ensureWedoBooksStyles } from "./readerStyles"

/**
 * Mount an SDK web component into an element React owns but does not manage.
 *
 * Opening writes `last_opened_at` back onto the entitlement, so callers key
 * the effect on the entitlement id, not the object - otherwise each write
 * would trigger the next mount.
 *
 * Each run gets a child element of its own: opening is asynchronous, so a run
 * can still be opening when the deps change and the next starts, and with a
 * shared container the first run's late callback could not tell its own work
 * from its successor's. Teardown removes the child, which is also the SDK's
 * signal to stop (its custom elements unmount on `disconnectedCallback`); a
 * mount landing after teardown lands in a detached node and never starts.
 *
 * Returns the ref to attach to the container.
 */
export function useSdkMount(
  open: (element: HTMLElement) => Promise<unknown>,
  deps: readonly unknown[]
): React.RefObject<HTMLDivElement | null> {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Held in a ref so that a caller passing a new closure on every render - the
  // normal case - does not tear the reader down and build it again.
  const openRef = React.useRef(open)
  openRef.current = open

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    ensureWedoBooksStyles(container.ownerDocument)

    const mountPoint = container.ownerDocument.createElement("div")
    mountPoint.style.height = "100%"
    container.appendChild(mountPoint)

    openRef.current(mountPoint).catch(() => {
      // The SDK surfaces its own failures inside the mount point; there is
      // nothing useful to add and nothing for React to render instead.
    })

    return () => {
      mountPoint.remove()
    }
    // The caller states what identifies this mount; `open` is deliberately not
    // part of it, for the reason given above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return containerRef
}
