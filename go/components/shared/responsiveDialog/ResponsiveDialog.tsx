"use client"

import { useMediaQuery } from "@uidotdev/usehooks"
import React from "react"

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

function ResponsiveDialog({
  title,
  description,
  children,
  open,
  onClose,
}: {
  title: string
  description?: string
  children: React.ReactNode
  open: boolean
  onClose: () => void
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div>
      {isDesktop && (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="flex flex-col gap-0 overflow-hidden p-0">
            <div
              className="bg-background mx-grid-edge pt-grid-edge border-foreground/10 sticky top-0
                z-10 shrink-0 border-b lg:mx-10 lg:pt-10 lg:pb-6">
              <DialogHeader>
                <DialogTitle className="px-10">{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
            </div>
            <div className="px-grid-edge pb-grid-edge flex-1 overflow-y-auto lg:p-10">
              <DialogBody>{children}</DialogBody>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {!isDesktop && (
        <Drawer open={open} onOpenChange={onClose}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            <div className="px-grid-edge shrink-0">
              <hr />
            </div>
            <div className="px-grid-edge flex-1 overflow-y-auto py-6">{children}</div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export default ResponsiveDialog
