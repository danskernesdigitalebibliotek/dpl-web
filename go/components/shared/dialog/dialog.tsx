"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as React from "react"

import { cn } from "@/lib/shadcn/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      `z-dialog data-[state=open]:animate-in data-[state=closed]:animate-out
      data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-foreground/50 fixed inset-0`,
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        `z-dialog gap-grid-edge bg-background p-grid-edge data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-30 data-[state=open]:animate-in
        data-[state=open]:fade-in-0 data-[state=open]:zoom-in-0 fixed top-[50%] left-[50%] m-auto
        grid max-h-[95vh] w-[calc(100%-var(--grid-edge)*2)] max-w-[1000px] translate-x-[-50%]
        translate-y-[-50%] overflow-y-scroll rounded-md shadow-lg duration-200 lg:gap-6 lg:px-6
        lg:py-10`,
        className
      )}
      {...props}>
      {children}
      <DialogPrimitive.Close
        className="right-grid-edge top-grid-edge ring-offset-background data-[state=open]:bg-accent
          data-[state=open]:text-muted-foreground focus-visible absolute rounded-full
          transition-opacity hover:cursor-pointer disabled:pointer-events-none lg:top-6 lg:right-6">
        <Cross2Icon className="h-8 w-8" />
        <span className="sr-only">Luk</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const [display, setDisplay] = React.useState(false)
  setTimeout(() => {
    setDisplay(true)
  }, 300)
  if (display) {
    return <div className={cn("animate-content-grow space-y-4", className)} {...props} />
  }
}
DialogBody.displayName = "DialogBody"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse lg:flex-row lg:justify-end lg:space-x-2", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-typo-heading-3", className)} {...props} />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-typo-body-lg text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
