import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type HelpTextProps = {
  children: React.ReactNode
  // Centred in a modal, trailing beside the work page's buttons.
  align?: "center" | "end"
  className?: string
}

// A short line of help in the app's caption type, saying what the reader
// cannot do right now or what state something is already in.
const HelpText = ({ children, align = "center", className }: HelpTextProps) => (
  <p
    className={cn(
      "text-typo-caption text-foreground-muted w-full",
      align === "center" ? "text-center" : "text-center lg:text-right",
      className
    )}>
    {children}
  </p>
)

export default HelpText
