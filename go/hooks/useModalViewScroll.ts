"use client"

import { useRef } from "react"

import { VIEW_EXIT_MS } from "@/components/shared/modalViewTransition/ModalViewTransition"

// Scroll after the outgoing view has faded, so the jump is never visible.
const VIEW_TRANSITION_MS = VIEW_EXIT_MS

// Remembers scroll positions per modal view: forward saves the outgoing
// view's offset and opens the next at the top; back restores the offset of
// the view returned to. Attach `anchorRef` inside the modal body.
export const useModalViewScroll = () => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const savedScrollTops = useRef<Record<string, number>>({})

  const getScroller = () => anchorRef.current?.closest(".overflow-y-auto") ?? null

  const scrollToTop = () => {
    setTimeout(() => getScroller()?.scrollTo({ top: 0 }), VIEW_TRANSITION_MS)
  }

  // Save the outgoing view's offset and open the next view at the top.
  const rememberScroll = (view: string) => {
    savedScrollTops.current[view] = getScroller()?.scrollTop ?? 0
    scrollToTop()
  }

  // Restore the returned-to view's offset. The height still animates while
  // the view re-mounts, so keep nudging until the offset is reachable.
  const restoreScroll = (view: string) => {
    const target = savedScrollTops.current[view] ?? 0
    const scroller = getScroller()
    if (!scroller) return
    if (!target) {
      scrollToTop()
      return
    }
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

  return { anchorRef, scrollToTop, rememberScroll, restoreScroll }
}
