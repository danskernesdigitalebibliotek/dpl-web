"use client"

import * as SheetPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as React from "react"

import { cyKeys } from "@/cypress/support/constants"
import { cn } from "@/lib/helpers/helper.cn"

const Sheet = SheetPrimitive.Root

const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Trigger
    ref={ref}
    className={cn("focus-visible rounded-full outline-hidden", className)}
    {...props}
  />
))
SheetTrigger.displayName = SheetPrimitive.Trigger.displayName

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      `z-sheet data-[state=open]:animate-in data-[state=closed]:animate-out
      data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-black/80
      dark:bg-black/50`,
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <div>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      // TODO: This is added to ensure slide animation works properly. "slide-in-from-right" and "slide-out-to-right" are Tailwind animate classes and only set a translate-x value of 4px. Seems to be a problem caused by the tailwind 4 update.
      style={
        {
          "--tw-enter-translate-x": "100%",
          "--tw-exit-translate-x": "100%",
        } as React.CSSProperties
      }
      className={cn(
        `z-sheet bg-background data-[state=open]:animate-in data-[state=closed]:animate-out
        max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom
        sm:data-[state=closed]:slide-out-to-right sm:data-[state=open]:slide-in-from-right
        p-grid-edge fixed inset-y-0 bottom-0 h-full w-full max-w-[560px] overflow-scroll pb-24
        shadow-lg transition ease-in-out data-[state=closed]:duration-300
        data-[state=open]:duration-500 sm:right-0 lg:p-8`,
        className
      )}
      {...props}
      data-cy={cyKeys["global-sheet"]}>
      <SheetPrimitive.Close
        className="focus-visible right-grid-edge top-grid-edge ring-offset-background
          data-[state=open]:bg-secondary absolute rounded-sm transition-opacity hover:cursor-pointer
          hover:opacity-100 disabled:pointer-events-none lg:top-8 lg:right-8"
        data-cy={cyKeys["global-sheet-close-button"]}>
        <Cross2Icon className="h-8 w-8" />
        <span className="sr-only">Luk</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </div>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-foreground", className)} {...props} />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={className} {...props} />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
