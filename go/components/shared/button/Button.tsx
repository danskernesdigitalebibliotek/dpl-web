import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/helpers/helper.cn"

const buttonVariants = cva(
  `inline-flex border border-foreground uppercase text-typo-button-lg text-foreground shadow-button rounded-full items-center justify-center
  whitespace-nowrap focus-visible disabled:pointer-events-none disabled:opacity-50 hover:translate-x-[1px] hover:translate-y-[1px] transition
  hover:shadow-buttonHover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
  {
    variants: {
      variant: {
        default: "",
        icon: "",
      },
      size: {
        default: "h-[40px]",
        sm: "h-[32px]",
        md: "h-[40px]",
        lg: "h-[48px]",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "sm",
        class: "px-8 text-typo-button-sm",
      },
      {
        variant: "default",
        size: "md",
        class: "px-10 text-typo-button-sm",
      },
      {
        variant: "default",
        size: "default",
        class: "px-10 text-typo-button-sm",
      },
      {
        variant: "default",
        size: "lg",
        class: "px-12 text-typo-button-lg",
      },
      {
        variant: "icon",
        size: ["default", "sm", "lg"],
        class: "h-[40px] w-[40px]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ariaLabel?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ariaLabel, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
        aria-label={ariaLabel || ""}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
