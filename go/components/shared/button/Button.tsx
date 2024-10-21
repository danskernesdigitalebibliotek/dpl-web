import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `inline-flex border shadow-button border-foreground text-foreground rounded-full items-center justify-center
  whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
  disabled:pointer-events-none disabled:opacity-50 hover:translate-x-[1px] hover:translate-y-[1px] transition
  hover:shadow-buttonHover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,
  {
    variants: {
      variant: {
        default: "",
        icon: "",
      },
      size: {
        default: "h-[40px]",
        xs: "h-[24px]",
        sm: "h-[32px]",
        lg: "h-[48px]",
      },
      fill: {
        default: "",
        background: "bg-background",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "default",
        class: "px-10",
      },
      {
        variant: "default",
        size: "sm",
        class: "px-8",
      },
      {
        variant: "default",
        size: "lg",
        class: "px-12",
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
      fill: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fill, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fill, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
