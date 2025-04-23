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
import { modalStore } from "@/store/modal.store"

function ResponsiveDialog({
  title,
  description,
  children,
  open,
  onOpenChange,
}: {
  title: string
  description?: string
  children: React.ReactNode
  open: boolean
  onOpenChange?: () => void
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const { closeModal } = modalStore.trigger
  const onOpenChangeCallback =
    onOpenChange ||
    (() => {
      closeModal()
    })

  return (
    <div>
      {isDesktop && (
        <Dialog open={open} onOpenChange={() => onOpenChangeCallback()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
              <hr className="go-divider mt-5 mb-10" />
            </DialogHeader>
            <DialogBody>{children}</DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {!isDesktop && (
        <Drawer open={open} onOpenChange={() => onOpenChangeCallback()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            {children}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export default ResponsiveDialog
