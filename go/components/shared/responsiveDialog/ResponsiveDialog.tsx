"use client"

import { useMediaQuery } from "@uidotdev/usehooks"
import { AnimatePresence, motion } from "framer-motion"
import React, { Children, isValidElement } from "react"

import { Button } from "@/components/shared/button/Button"
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
import Icon from "@/components/shared/icon/Icon"
import { modalViewVariants } from "@/components/shared/modalViewTransition/ModalViewTransition"
import { cyKeys } from "@/cypress/support/constants"

// Marker subcomponent. ResponsiveDialog finds children whose type is Actions and
// renders their children into a sticky footer slot; everything else flows into
// the scrollable body.
const Actions = ({ children }: { children: React.ReactNode }) => <>{children}</>
Actions.displayName = "ResponsiveDialog.Actions"

// Matched by displayName rather than function identity: fast-refresh (and any
// duplicated module instance) recreates the Actions function, which would make
// a reference comparison silently drop the footer into the body.
const isActionsElement = (child: React.ReactNode): child is React.ReactElement =>
  isValidElement(child) &&
  typeof child.type === "function" &&
  (child.type as { displayName?: string }).displayName === Actions.displayName

type ResponsiveDialogProps = {
  title: React.ReactNode
  // Names the dialog when the visible title isn't available yet (e.g. while
  // its data loads) — the accessible name is announced once, at open. Leave
  // undefined whenever the title is rendered, so the two can't drift apart.
  ariaLabel?: string
  description?: string
  children: React.ReactNode
  open: boolean
  onClose: () => void
  // Renders a back button in the header for modals with internal views.
  onBack?: () => void
  // Direction of the current view navigation (1 forward, -1 back); the
  // actions footer enters and exits with the same fade-and-slide.
  viewDirection?: number
}

function ResponsiveDialog({
  title,
  ariaLabel,
  description,
  children,
  open,
  onClose,
  onBack,
  viewDirection = 1,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Navigating away through a link inside the modal should also leave it
  // closed for when the page is revisited or restored. New-tab links keep
  // the user on the page, so the modal stays open.
  const closeOnLinkClick = (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return
    const target = event.target as HTMLElement
    const link = target.closest?.("a[href]")
    if (link && link.getAttribute("target") !== "_blank") {
      onClose()
    }
  }

  let actions: React.ReactNode = null
  const bodyChildren: React.ReactNode[] = []
  Children.forEach(children, child => {
    if (isActionsElement(child)) {
      actions = (child.props as { children?: React.ReactNode }).children ?? null
    } else {
      bodyChildren.push(child)
    }
  })

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          aria-label={ariaLabel}
          onClickCapture={closeOnLinkClick}
          className="flex max-h-[95dvh] flex-col gap-0 overflow-hidden p-0 lg:min-h-0">
          <div
            className="bg-background mx-grid-edge pt-grid-edge border-foreground/10 shrink-0
              border-b lg:mx-10 lg:pt-10 lg:pb-6">
            <DialogHeader>
              {/* The title text changes with the modal's internal view; the
                  live region announces those otherwise silent view changes.
                  Receipt views announce via their own role="status". */}
              <DialogTitle aria-live="polite" className="px-10" onBack={onBack}>
                {title}
              </DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          </div>
          <div className="px-grid-edge min-h-0 flex-1 overflow-y-auto py-6 lg:px-10 lg:py-10">
            <DialogBody>{bodyChildren}</DialogBody>
          </div>
          <AnimatePresence initial={false} custom={viewDirection}>
            {actions && (
              <motion.div
                key="actions"
                className="shrink-0 overflow-x-clip"
                custom={viewDirection}
                variants={modalViewVariants}
                initial="enter"
                animate="center"
                exit="exit">
                <div
                  className="bg-background border-foreground/10 mx-grid-edge border-t py-4 lg:mx-10
                    lg:py-6">
                  <div className="flex flex-row-reverse flex-wrap items-center justify-center gap-4">
                    {actions}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        aria-label={ariaLabel}
        onClickCapture={closeOnLinkClick}
        className="flex max-h-[95dvh] min-h-0 flex-col overflow-hidden">
        <DrawerHeader className="shrink-0">
          <div className="relative flex items-center justify-center">
            <AnimatePresence initial={false}>
              {onBack && (
                <motion.div
                  className="absolute left-0"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}>
                  <Button
                    variant="icon"
                    theme="secondary"
                    ariaLabel="Tilbage"
                    data-cy={cyKeys["modal-back-button"]}
                    onClick={onBack}>
                    <Icon name="arrow-left" className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Mirrors the dialog title: announces internal view changes. */}
            <DrawerTitle aria-live="polite">{title}</DrawerTitle>
          </div>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-grid-edge shrink-0">
          <hr />
        </div>
        <div className="px-grid-edge min-h-0 flex-1 overflow-y-auto py-6">{bodyChildren}</div>
        <AnimatePresence initial={false} custom={viewDirection}>
          {actions && (
            <motion.div
              key="actions"
              className="shrink-0 overflow-x-clip"
              custom={viewDirection}
              variants={modalViewVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <div className="border-foreground/10 px-grid-edge border-t py-4">
                <div className="flex flex-col items-stretch gap-3">{actions}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  )
}

ResponsiveDialog.Actions = Actions

export default ResponsiveDialog
