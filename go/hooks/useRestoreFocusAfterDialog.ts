"use client"

import { RefObject, useEffect } from "react"

// Radix marks every open dialog, and its focus trap owns the focus for as long
// as one is in the DOM.
const isDialogOpen = () => !!document.querySelector("[role='dialog']")

// A Radix dialog keeps its focus trap until it unmounts, and the modal host
// holds it mounted for the length of its close animation. Focus moved to a
// trigger before that is pulled straight back into a dialog the reader can no
// longer see, so this waits for the dialog to leave the DOM.
//
// `shouldRestore` is a ref rather than state: the trigger can be unmounted and
// remounted (a material-type switch replaces it with a skeleton) while the
// debt is outstanding, and a ref survives that without re-rendering.
export const useRestoreFocusAfterDialog = (
  shouldRestore: RefObject<boolean>,
  target: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const payDebt = () => {
      if (!shouldRestore.current || isDialogOpen()) return

      // Cleared whether or not a target is mounted: a material-type switch
      // can land on a type that renders no trigger, and a trigger that does
      // return mounts as a mutation of its own.
      shouldRestore.current = false
      target.current?.focus()
    }

    // Covers a debt recorded while no dialog was ever open.
    payDebt()

    // Fires on the dialog's removal, so focus lands on the frame the trap
    // releases it rather than on a timer. Stays connected for the life of the
    // page, since the picker opens and closes any number of times; a mutation
    // with no debt outstanding costs a single ref read.
    const observer = new MutationObserver(payDebt)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [shouldRestore, target])
}
