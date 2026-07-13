"use client"

import { AnimatePresence, motion } from "framer-motion"
import React from "react"

// Directional fade-and-slide between views inside a modal: forward navigation
// (direction 1) slides the new view in from the right, backward (-1) from the
// left. Step flows (form → receipt) are forward-only and can omit direction.
export const modalViewVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -48 }),
}

type ModalViewTransitionProps = {
  // Identifies the current view; changing it triggers the transition.
  viewKey: string
  direction?: number
  children: React.ReactNode
  className?: string
}

export const ModalViewTransition = ({
  viewKey,
  direction = 1,
  children,
  className,
}: ModalViewTransitionProps) => (
  <AnimatePresence mode="wait" initial={false} custom={direction}>
    <motion.div
      key={viewKey}
      className={className}
      custom={direction}
      variants={modalViewVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}>
      {children}
    </motion.div>
  </AnimatePresence>
)
