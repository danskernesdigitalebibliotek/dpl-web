"use client"

import { useRef } from "react"

// Matches ModalViewTransition's duration: scrolling is deferred until the
// outgoing view has faded, so the jump never happens in front of the user.
const VIEW_TRANSITION_MS = 200

// Scroll coordination for modals with internal list → detail views. The list
// unmounts while a detail view is shown, so the browser cannot preserve its
// scroll position by itself: navigating forward saves the list offset and
// starts the detail at the top; navigating back restores the saved offset.
// Attach `anchorRef` to any element inside the modal body.
export const useModalViewScroll = () => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const savedListScrollTop = useRef(0)

  const getScroller = () => anchorRef.current?.closest(".overflow-y-auto") ?? null

  // Forward navigation between non-list views (e.g. detail → player).
  const scrollToTop = () => {
    setTimeout(() => getScroller()?.scrollTo({ top: 0 }), VIEW_TRANSITION_MS)
  }

  // Forward navigation away from the list.
  const rememberListAndScrollTop = () => {
    savedListScrollTop.current = getScroller()?.scrollTop ?? 0
    scrollToTop()
  }

  // Back navigation to the list. The body height animates while the list
  // re-mounts, so keep nudging until the target offset is reachable.
  const restoreListScroll = () => {
    const target = savedListScrollTop.current
    const scroller = getScroller()
    if (!target || !scroller) return
    setTimeout(() => {
      const start = performance.now()
      const tick = () => {
        scroller.scrollTo({ top: target })
        if (scroller.scrollTop + 1 < target && performance.now() - start < 600) {
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)
    }, VIEW_TRANSITION_MS)
  }

  return { anchorRef, scrollToTop, rememberListAndScrollTop, restoreListScroll }
}
