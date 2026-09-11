"use client"

import { MotionConfig } from "framer-motion"
import React from "react"

// Honors the OS-level "reduce motion" preference for all framer-motion
// animations: transform and layout animations are skipped, opacity still
// runs. CSS-driven animation is covered by the matching media query in
// styles/globals.css.
const MotionProvider = ({ children }: { children: React.ReactNode }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
)

export default MotionProvider
