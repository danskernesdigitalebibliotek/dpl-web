"use client"

import type {
  WedoBooksSessionInterruption,
  WedoBooksStopReason,
} from "@danskernesdigitalebibliotek/dpl-wedobooks"
import React, { useEffect, useState } from "react"

import DigitalSessionModal from "@/components/shared/digitalSessionModal/DigitalSessionModal"
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
 *
 * The SDK may also not show the loan at all: it closes the reader when the
 * session moves elsewhere, and refuses to open when the patron has no room for
 * this device. Either way nothing is on the page, so the reason goes in a
 * dialog over it - with a way to free a device, after which the reader is
 * mounted again. `onClose` is only called for a close the patron chose,
 * including closing that dialog.
 */
function DigitalReaderPlayer({ loanId, onClose }: DigitalReaderPlayerProps) {
  const { sdk, checkout } = useReaderCheckout(loanId)
  // Why the SDK is not showing the loan, while it is not.
  const [stop, setStop] = useState<WedoBooksStopReason | null>(null)
  // Counts the attempts to open, so a retry mounts the reader anew.
  const [attempt, setAttempt] = useState(0)

  const handleClose = (interruption?: WedoBooksSessionInterruption) => {
    if (interruption) {
      setStop(interruption)
      return
    }
    onClose()
  }

  const retry = () => {
    setStop(null)
    setAttempt(count => count + 1)
  }

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

  if (stop) {
    return <DigitalSessionModal open onClose={onClose} reason={stop} onRetry={retry} />
  }

  return (
    <DigitalReader
      key={attempt}
      sdk={sdk}
      checkout={checkout}
      onClose={handleClose}
      onOpenError={setStop}
    />
  )
}

export default DigitalReaderPlayer
