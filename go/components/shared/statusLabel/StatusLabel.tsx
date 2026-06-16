import { type VariantProps, cva } from "class-variance-authority"
import type { ReactNode } from "react"

import { cn } from "@/lib/helpers/helper.cn"

const statusLabelVariants = cva(
  "text-typo-caption inline-flex w-fit items-center rounded-full px-3 py-1.5",
  {
    variants: {
      variant: {
        error: "",
        warning: "",
        success: "",
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
      { variant: "success", inverted: true, class: "bg-success-green-300 text-white" },
    ],
    defaultVariants: {
      variant: "error",
      inverted: false,
    },
  }
)

type Props = VariantProps<typeof statusLabelVariants> & {
  children: ReactNode
  className?: string
}

export default function StatusLabel({ children, variant, inverted, className }: Props) {
  return (
    <div className={cn(statusLabelVariants({ variant, inverted }), className)}>
      <span>{children}</span>
    </div>
  )
}
