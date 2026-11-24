"use client"

import { RefObject, useEffect } from "react"

// Radix marks every open dialog, and its focus trap owns the focus for as long
// as one is in the DOM.
const isDialogOpen = () => !!document.querySelector("[role='dialog']")

// Moves focus to `target` once no dialog is left in the DOM, since a dialog's
// focus trap holds the focus until it unmounts. `shouldRestore` is a ref so
// the debt survives the target unmounting and remounting.
export const useRestoreFocusAfterDialog = (
  shouldRestore: RefObject<boolean>,
  target: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const payDebt = () => {
      if (!shouldRestore.current || isDialogOpen()) return

      // Cleared even with no target mounted, since a type switch can land on
      // one that renders no trigger.
      shouldRestore.current = false
      target.current?.focus()
    }

    payDebt()

    // The dialog's removal is the signal, so focus lands on the frame the
    // trap releases it.
    const observer = new MutationObserver(payDebt)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [shouldRestore, target])
}
