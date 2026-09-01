"use client"

import React from "react"

import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import { ModalViewTransition } from "@/components/shared/modalViewTransition/ModalViewTransition"

type ModalFlowBodyProps = {
  viewKey: string
  direction?: number
  children: React.ReactNode
}

// The standard modal body: animated height around the directional view
// transition. Clips x only; the negative margin + padding give cover
// shadows room at the edges.
export const ModalFlowBody = ({ viewKey, direction = 1, children }: ModalFlowBodyProps) => (
  <AnimateChangeInHeight className="-mx-6 overflow-x-clip px-6">
    <ModalViewTransition viewKey={viewKey} direction={direction}>
      {children}
    </ModalViewTransition>
  </AnimateChangeInHeight>
)
