"use client"

import React, { useEffect } from "react"

import { useReaderCheckout } from "@/hooks/useReaderCheckout"
import { playLoan } from "@/store/player.store"

import DigitalReader from "./DigitalReader"

type DigitalReaderPlayerProps = {
  /** The loan to open, which is also the SDK's checkout id. */
  loanId: string
  onClose: () => void
}

/**
 * Opens a digital loan in the reader, decided from the loan itself: the SDK's
 * checkout carries the material type, so a pasted url opens the right thing
 * no matter which page it names.
 *
 * Audiobooks never render here - they live in the global player bar, which
 * survives navigation. The read page hands them over instead of mounting a
 * player of its own.
 */
function DigitalReaderPlayer({ loanId, onClose }: DigitalReaderPlayerProps) {
  const { sdk, checkout } = useReaderCheckout(loanId)

  // String() rather than importing the SDK's MaterialType enum: a value
  // import would statically link the multi-megabyte SDK chunk into the page
  // bundle that this component exists to keep it out of.
  const isAudiobook = Boolean(checkout) && String(checkout?.material_type) === "audiobook"

  // A pasted audiobook url still opens the right thing: hand the loan to the
  // global player bar and leave the read page to it.
  useEffect(() => {
    if (isAudiobook) {
      playLoan(loanId)
      onClose()
    }
  }, [isAudiobook, loanId, onClose])

  // No spinner: the reader renders nothing during its own load anyway, so
  // returning null here adds no visible wait.
  if (!sdk || !checkout || isAudiobook) return null

  return <DigitalReader sdk={sdk} checkout={checkout} onClose={onClose} />
}

export default DigitalReaderPlayer
