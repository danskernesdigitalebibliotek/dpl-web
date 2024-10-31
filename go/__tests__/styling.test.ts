import { cva } from "class-variance-authority"
import { expect, test } from "vitest"

import { cn } from "@/lib/helpers/helper.cn"

test("That we can use cn in combination with cva variants", async () => {
  const resultClasses = "text-typo-body-sm text-foreground inline-flex h-[40px] px-10"

  const buttonVariants = cva(`text-typo-body-sm text-foreground inline-flex`, {
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
    },
  })

  const buttonVariantClasses = buttonVariants({
    variant: "default",
    size: "default",
    className: "",
  })

  // This passes.
  expect(buttonVariantClasses).toEqual(resultClasses)

  // But when run trough cn (which uses twMerge), it fails ("text-background" is missing):
  const classes = cn(buttonVariantClasses)
  expect(classes).toEqual(resultClasses)
})
