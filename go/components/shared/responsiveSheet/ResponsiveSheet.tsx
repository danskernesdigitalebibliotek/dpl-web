"use client"

import { useMediaQuery } from "@uidotdev/usehooks"
import React from "react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/shared/drawer/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/shared/sheet/Sheet"

function ResponsiveSheet({
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

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={isOpen => (isOpen ? null : onClose())}>
        <SheetContent className="rounded-l-xl">
          <div className="h-full overflow-scroll">
            <div
              className="mx-grid-edge py-grid-edge bg-background border-foreground/10 sticky top-0
                border-b lg:mx-10 lg:pt-8 lg:pb-6">
              <SheetHeader>
                <SheetTitle className="text-typo-heading-3">{title}</SheetTitle>
                {description && <SheetDescription>{description}</SheetDescription>}
              </SheetHeader>
            </div>
            <div className="p-grid-edge lg:px-10 lg:py-10">{children}</div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={isOpen => (isOpen ? null : onClose())}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="px-grid-edge">{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-grid-edge shrink-0">
          <hr />
        </div>
        <div className="px-grid-edge flex-1 overflow-y-auto py-8">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}

export default ResponsiveSheet
