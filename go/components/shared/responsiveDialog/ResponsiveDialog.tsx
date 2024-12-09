import { useMediaQuery } from "@uidotdev/usehooks"
import React from "react"

import {
  Dialog,
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
  onOpenChange,
}: {
  title: string
  description: string
  children: React.ReactNode
  open: boolean
  onOpenChange: () => void
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <div>
      {isDesktop && (
        <Dialog open={open} onOpenChange={() => onOpenChange()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      )}

      {!isDesktop && (
        <Drawer open={open} onOpenChange={() => onOpenChange()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            {children}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export default ResponsiveDialog
