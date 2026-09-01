"use client"

import React, { useState } from "react"

import { ModalFlowBody } from "@/components/shared/modalFlow/ModalFlowBody"
import { ModalViewTransition } from "@/components/shared/modalViewTransition/ModalViewTransition"
import { useModalViewScroll } from "@/hooks/useModalViewScroll"

type UseModalFlowOptions<V extends string> = {
  initial: V
}

// Navigation for a multi-view modal: history of views, direction, animated
// title/body transitions and scroll memory. goTo() moves forward, back()
// retraces the path taken. The modal owns its data and footers; this hook
// owns the mechanics. See ADR-011.
export const useModalFlow = <V extends string>({ initial }: UseModalFlowOptions<V>) => {
  const [history, setHistory] = useState<V[]>([initial])
  const [direction, setDirection] = useState(1)
  const view = history[history.length - 1]

  const { anchorRef, rememberScroll, restoreScroll } = useModalViewScroll()

  // Go forward to any view.
  const goTo = (next: V) => {
    rememberScroll(view)
    setDirection(1)
    setHistory(previous => [...previous, next])
  }

  // Go back one step. Returns the view gone back to (undefined at the
  // root) so callers can release view-specific state.
  const back = (): V | undefined => {
    if (history.length < 2) return undefined
    const target = history[history.length - 2]
    setDirection(-1)
    restoreScroll(target)
    setHistory(previous => previous.slice(0, -1))
    return target
  }

  const canGoBack = history.length > 1

  // Start over at a view, e.g. when the modal reopens.
  const reset = (next: V) => {
    setDirection(1)
    setHistory([next])
  }

  // Title with the same directional transition as the body.
  const animatedTitle = (title: React.ReactNode) => (
    <ModalViewTransition as="span" viewKey={view} direction={direction} className="block">
      {title}
    </ModalViewTransition>
  )

  // The standard body wrapper plus the scroll anchor.
  const renderBody = (children: React.ReactNode) => (
    <>
      <div ref={anchorRef} />
      <ModalFlowBody viewKey={view} direction={direction}>
        {children}
      </ModalFlowBody>
    </>
  )

  return { view, direction, canGoBack, goTo, back, reset, animatedTitle, renderBody }
}
