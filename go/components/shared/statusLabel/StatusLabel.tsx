import { type VariantProps, cva } from "class-variance-authority"
import type { ReactNode } from "react"

import { cn } from "@/lib/helpers/helper.cn"

const statusLabelVariants = cva(
  "text-typo-body-sm font-medium inline-flex w-fit items-center rounded-full px-4 py-1 whitespace-nowrap",
  {
    variants: {
      variant: {
        error: "",
        warning: "",
        success: "",
        // Plain text without a pill background.
        neutral: "text-foreground px-0 py-0",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Soft (default)
      { variant: "error", inverted: false, class: "bg-error-red-100 text-error-red-400" },
      {
        variant: "warning",
        inverted: false,
        class: "bg-warning-orange-100 text-warning-orange-400",
      },
      { variant: "success", inverted: false, class: "bg-success-green-100 text-success-green-500" },
      // Inverted (filled)
      { variant: "error", inverted: true, class: "bg-error-red-400 text-white" },
      { variant: "warning", inverted: true, class: "bg-warning-orange-400 text-white" },
      { variant: "success", inverted: true, class: "bg-success-green-500 text-white" },
    ],
    defaultVariants: {
      variant: "error",
      inverted: false,
    },
  }
)

type Props = VariantProps<typeof statusLabelVariants> & {
  children: ReactNode
  // Expanded form: a bold second line (e.g. an absolute deadline) under the status.
  subline?: ReactNode
  className?: string
}

export default function StatusLabel({ children, subline, variant, inverted, className }: Props) {
  return (
    <div
      className={cn(
        statusLabelVariants({ variant, inverted }),
        subline && "flex-col items-start gap-0.5 rounded-sm px-4 py-2 whitespace-normal",
        className
      )}>
      {children}
      {subline && <span className="font-bold">{subline}</span>}
    </div>
  )
}
