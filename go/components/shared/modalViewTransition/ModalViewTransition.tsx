"use client"

import { AnimatePresence, type Variants, motion } from "framer-motion"
import React from "react"

// Shared timing for all modal view changes. The old view exits fast, the
// new one enters slower; scroll jumps hide inside the exit window.
export const VIEW_ENTER_MS = 200
export const VIEW_EXIT_MS = 100

// Directional fade-and-slide: forward (1) slides in from the right,
// back (-1) from the left.
export const modalViewVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: VIEW_ENTER_MS / 1000, ease: "easeOut" },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -48,
    transition: { duration: VIEW_EXIT_MS / 1000, ease: "easeIn" },
  }),
}

type ModalViewTransitionProps = {
  // Identifies the current view; changing it triggers the transition.
  viewKey: string
  direction?: number
  // "span" for inline contexts such as the dialog title.
  as?: "div" | "span"
  children: React.ReactNode
  className?: string
}

export const ModalViewTransition = ({
  viewKey,
  direction = 1,
  as = "div",
  children,
  className,
}: ModalViewTransitionProps) => {
  const MotionTag = as === "span" ? motion.span : motion.div
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <MotionTag
        key={viewKey}
        className={className}
        custom={direction}
        variants={modalViewVariants}
        initial="enter"
        animate="center"
        exit="exit">
        {children}
      </MotionTag>
    </AnimatePresence>
  )
}
