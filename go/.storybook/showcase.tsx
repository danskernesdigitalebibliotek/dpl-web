import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

// Shared scaffolding for showcase stories. The story furniture (captions,
// section titles) is deliberately styled unlike any product typography —
// muted, caption-size — and the showcased components sit inside
// dashed boxes, so it is always clear what is the component and what is the
// story around it.

export const ShowcaseTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-typo-caption text-foreground-muted font-medium tracking-wide">
    {children}
  </h2>
)

export const ShowcaseCaption = ({ children }: { children: React.ReactNode }) => (
  <p className="text-typo-caption text-foreground-muted">{children}</p>
)

export const ShowcaseBox = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "border-foreground/30 flex flex-col items-start gap-3 rounded-sm border border-dashed p-6",
      className
    )}>
    {children}
  </div>
)

// A captioned, framed showcase entry with an optional description.
export const ShowcaseItem = ({
  title,
  description,
  boxClassName,
  children,
}: {
  title: string
  description?: string
  boxClassName?: string
  children: React.ReactNode
}) => (
  <div className="space-y-3">
    <div className="space-y-0.5">
      <ShowcaseCaption>{title}</ShowcaseCaption>
      {description && <p className="text-typo-caption text-foreground-muted">{description}</p>}
    </div>
    <ShowcaseBox className={boxClassName}>{children}</ShowcaseBox>
  </div>
)
