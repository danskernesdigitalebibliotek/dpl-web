import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import LoadingDots from "@/components/shared/button/LoadingDots"
import Icon from "@/components/shared/icon/Icon"
import { cn } from "@/lib/helpers/helper.cn"

const buttonVariants = cva(
  `inline-flex border text-typo-button-lg shadow-button rounded-full items-center
  justify-center hover:cursor-pointer whitespace-nowrap focus-visible disabled:pointer-events-none
  disabled:opacity-50 hover:translate-x-[1px] hover:translate-y-[1px] transition
  hover:shadow-button-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none pointer-events-auto
  aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50
  aria-disabled:hover:translate-none aria-disabled:active:translate-none
  aria-disabled:hover:cursor-not-allowed aria-disabled:hover:shadow-button`,
  {
    variants: {
      variant: {
        default: "",
        icon: "",
        "icon-text": "",
      },
      size: {
        default: "h-[40px]",
        sm: "h-[32px]",
        md: "h-[40px]",
        lg: "h-[48px]",
      },
      theme: {
        primary: "border-background text-background bg-foreground",
        secondary: "border-foreground text-foreground",
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
        size: ["default", "lg"],
        class: "h-[40px] w-[40px]",
      },
      {
        variant: "icon",
        size: ["md", "sm"],
        class: "h-[32px] w-[32px]",
      },
      {
        variant: "icon-text",
        size: "sm",
        class: "gap-2 px-6 text-typo-button-sm",
      },
      {
        variant: "icon-text",
        size: ["default", "md"],
        class: "gap-2 px-8 text-typo-button-sm",
      },
      {
        variant: "icon-text",
        size: "lg",
        class: "gap-3 px-10 text-typo-button-lg",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      theme: "secondary",
    },
  }
)

interface ButtonBaseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  ariaLabel?: string
  dataCy?: string
  isLoading?: boolean
  // Name of the icon rendered before the label (variant "icon-text").
  icon?: string
  // Unavailable, but still reachable by keyboard: the button keeps its place
  // in the tab order and announces itself as unavailable, so the reason it
  // carries can be read.
  ariaDisabled?: boolean
}

// `ariaDisabled` and `asChild` are mutually exclusive. Making a button inert
// means dropping its onClick, but `asChild` renders a Radix Slot, which merges
// props onto the child instead of replacing them: the child keeps its own
// onClick, and an <a> keeps its href, so the control would still work while
// announcing itself as unavailable.
export type ButtonProps = ButtonBaseProps &
  (
    | {
        asChild: true
        ariaDisabled?: never
      }
    | {
        asChild?: false
        // Unavailable, but still reachable by keyboard: the button keeps its
        // place in the tab order and announces itself as unavailable, so the
        // reason it carries can be read.
        ariaDisabled?: boolean
      }
  )

// Enter and Space activate a focused button natively, which aria-disabled
// does not prevent.
const suppressActivationKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
  if (event.key === "Enter" || event.key === " ") event.preventDefault()
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      ariaLabel,
      "aria-label": ariaLabelProp,
      variant,
      theme,
      size,
      asChild = false,
      isLoading,
      icon,
      ariaDisabled,
      onClick,
      onKeyDown,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    // Slot requires a single child, so the icon shorthand is skipped for
    // asChild — put the icon inside the child element instead.
    const content =
      icon && !asChild ? (
        <>
          <Icon name={icon} className={size === "sm" ? "h-[20px] w-[20px]" : "h-[24px] w-[24px]"} />
          {children}
        </>
      ) : (
        children
      )
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, theme }), className)}
        ref={ref}
        {...props}
        aria-busy={isLoading || undefined}
        aria-disabled={ariaDisabled || undefined}
        // Pointer events stop at the CSS layer; Enter and Space reach the
        // button regardless, since it keeps its place in the tab order.
        onKeyDown={ariaDisabled ? suppressActivationKeys : onKeyDown}
        onClick={ariaDisabled ? undefined : onClick}
        aria-label={ariaLabel || ariaLabelProp || undefined}>
        {isLoading ? (
          <span className="grid items-center justify-items-center">
            <span className="col-start-1 row-start-1 opacity-0">{content}</span>
            <LoadingDots className="col-start-1 row-start-1" />
          </span>
        ) : (
          content
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

type ButtonSkeletonProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const ButtonSkeleton = ({ size, className }: ButtonSkeletonProps) => {
  return (
    <div
      className={cn(
        `mb-grid-gap-half bg-background-skeleton w-full animate-pulse rounded-full lg:max-w-80
        lg:min-w-72`,
        size === "sm" ? "h-[32px]" : "",
        size === "md" || !size ? "h-[40px]" : "",
        size === "lg" ? "h-[48px]" : "",
        className
      )}
    />
  )
}

export { Button, buttonVariants, ButtonSkeleton }
