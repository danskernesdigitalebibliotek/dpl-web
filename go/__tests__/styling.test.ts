import { expect, test, vi } from "vitest"

import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

test("That we can use cn in combination with cva variants", async () => {
  const resultClasses =
    "inline-flex h-[40px] bg-foreground text-background px-10 border-background text-typo-body-sm"

  const buttonVariants = cva(`inline-flex`, {
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
        foreground: "bg-foreground",
      },
      text: {
        default: "",
        background: "text-background",
        foreground: "text-foreground",
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
      text: "default",
    },
  })

  const buttonVariantClasses = buttonVariants({
    variant: undefined,
    size: undefined,
    fill: "foreground",
    text: "background",
    className: "border-background text-typo-body-sm",
  })

  // This passes.
  expect(buttonVariantClasses).toEqual(resultClasses)

  // But when run trough cn (which uses twMerge), it fails ("text-background" is missing):
  const classes = cn(buttonVariantClasses)
  expect(classes).toEqual(resultClasses)
})
