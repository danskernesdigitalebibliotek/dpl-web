import * as React from "react"

import { ensureWedoBooksStyles } from "./readerStyles"

/**
 * Mount an SDK web component into an element React owns but does not manage.
 *
 * The reader and the player differ only in which SDK call opens them, but the
 * mounting itself is subtle enough that it should exist once.
 *
 * Opening writes `last_opened_at` back onto the entitlement, so the effect
 * keys on the entitlement id rather than the entitlement. Depending on the
 * object would make each write trigger the next mount.
 *
 * ## Why each run gets its own element
 *
 * Opening is asynchronous, so a run can still be opening when the deps change
 * and the next run starts. If both mounted into the same container, the first
 * one's late callback could no longer tell whether what it found there was its
 * own work or its successor's - and clearing the container blindly would wipe
 * a reader that had just been built.
 *
 * Giving each run a child of its own removes the question. Teardown removes
 * that child, which is also the SDK's own signal to stop: its custom elements
 * unmount on `disconnectedCallback`, so an audiobook stops playing rather than
 * being left orphaned. A mount that lands after teardown lands in a detached
 * node, never connects, and therefore never starts.
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
