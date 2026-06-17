"use client"

import { useMediaQuery } from "@uidotdev/usehooks"
import React, { Children, isValidElement } from "react"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/dialog/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/shared/drawer/drawer"

// Marker subcomponent. ResponsiveDialog finds children whose type is Actions and
// renders their children into a sticky footer slot; everything else flows into
// the scrollable body.
const Actions = ({ children }: { children: React.ReactNode }) => <>{children}</>
Actions.displayName = "ResponsiveDialog.Actions"

type ResponsiveDialogProps = {
  title: string
  description?: string
  children: React.ReactNode
  open: boolean
  onClose: () => void
}

function ResponsiveDialog({ title, description, children, open, onClose }: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  let actions: React.ReactNode = null
  const bodyChildren: React.ReactNode[] = []
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === Actions) {
      actions = (child.props as { children?: React.ReactNode }).children ?? null
    } else {
      bodyChildren.push(child)
    }
  })

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex max-h-[95vh] flex-col gap-0 overflow-hidden p-0 lg:min-h-0">
          <div
            className="bg-background mx-grid-edge pt-grid-edge border-foreground/10 shrink-0
              border-b lg:mx-10 lg:pt-10 lg:pb-6">
            <DialogHeader>
              <DialogTitle className="px-10">{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          </div>
          <div className="px-grid-edge min-h-0 flex-1 overflow-y-auto py-6 lg:px-10 lg:py-10">
            <DialogBody>{bodyChildren}</DialogBody>
          </div>
          {actions && (
            <div
              className="bg-background border-foreground/10 mx-grid-edge shrink-0 border-t py-4
                lg:mx-10 lg:py-6">
              <div
                className="flex flex-row-reverse flex-wrap items-center justify-center gap-4">
                {actions}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="flex max-h-[95vh] min-h-0 flex-col overflow-hidden">
        <DrawerHeader className="shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-grid-edge shrink-0">
          <hr />
        </div>
        <div className="px-grid-edge min-h-0 flex-1 overflow-y-auto py-6">{bodyChildren}</div>
        {actions && (
          <div className="border-foreground/10 px-grid-edge shrink-0 border-t py-4">
            <div className="flex flex-col items-stretch gap-3">{actions}</div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

ResponsiveDialog.Actions = Actions

export default ResponsiveDialog
