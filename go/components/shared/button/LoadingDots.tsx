import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

// Three staggered pulsing dots — the shared loading indicator for buttons.
const LoadingDots = ({ className }: { className?: string }) => (
  <span role="status" aria-label="Indlæser" className={cn("flex items-center gap-1.5", className)}>
    {[0, 150, 300].map(delay => (
      <span
        key={delay}
        className="animate-dot-pulse h-2 w-2 rounded-full bg-current"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </span>
)

export default LoadingDots
