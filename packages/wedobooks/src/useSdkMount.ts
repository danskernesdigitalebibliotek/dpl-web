import * as React from "react"

import { stopReasonOf, type WedoBooksStopReason } from "./sdk"

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
 * A refused open mounts nothing and shows nothing, so `onOpenError` gets the
 * reason for the caller to put something on the page. Classified here, inside
 * the SDK chunk, so no page reads the SDK's error codes itself. A run the
 * caller has already left reports to nobody: its refusal is about a mount
 * that is gone.
 *
 * Returns the ref to attach to the container.
 */
export function useSdkMount(
  open: (element: HTMLElement) => Promise<unknown>,
  deps: readonly unknown[],
  onOpenError?: (reason: WedoBooksStopReason) => void
): React.RefObject<HTMLDivElement | null> {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Held in refs so that a caller passing new closures on every render - the
  // normal case - does not tear the reader down and build it again.
  const openRef = React.useRef(open)
  openRef.current = open
  const onOpenErrorRef = React.useRef(onOpenError)
  onOpenErrorRef.current = onOpenError

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const mountPoint = container.ownerDocument.createElement("div")
    mountPoint.style.height = "100%"
    container.appendChild(mountPoint)
    let tornDown = false

    openRef.current(mountPoint).catch((error: unknown) => {
      // The page shows only a classified reason; the SDK's own error is what
      // support needs to see.
      console.warn("WeDoBooks did not open the content", error)
      if (!tornDown) onOpenErrorRef.current?.(stopReasonOf(error))
    })

    return () => {
      tornDown = true
      mountPoint.remove()
    }
    // The caller states what identifies this mount; `open` is deliberately not
    // part of it, for the reason given above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return containerRef
}
