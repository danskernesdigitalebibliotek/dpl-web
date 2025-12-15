import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/helpers/helper.cn"

const badgeVariants = cva(
  `inline-flex items-center rounded-full px-2 py-1 text-typo-tag-sm font-semibold transition-colors
  text-background`,
  {
    variants: {
      variant: {
        default: "bg-foreground text-background",
        outline: "bg-secondary border-1 border border-foreground text-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        "blue-title": "bg-blue-title text-blue-title-dark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
