"use client"

import type { WedoBooksCheckout, WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks"
import dynamic from "next/dynamic"
import React from "react"

// Loaded on demand: the SDK carries a reading framework, Firebase and a
// component library, and only someone opening a book needs any of it.
const SdkReader = dynamic(
  () => import("@danskernesdigitalebibliotek/dpl-wedobooks").then(module => module.WedoBooksReader),
  { ssr: false }
)

type DigitalReaderProps = {
  /** The signed-in SDK session the loan lives in. */
  sdk: WedoBooksSdk
  /** The entitlement to open - fetched once by DigitalReaderPlayer. */
  checkout: WedoBooksCheckout
  onClose: () => void
}

/**
 * The reader for a loan the service layer issued.
 *
 * The counterpart to PublizonReader, which opens Publizon loans in pubhub's
 * reader. The two are not interchangeable - neither service recognises the
 * other's loans - so which one to render is decided from the loan, not from
 * the library's current provider.
 *
 * Rendered in normal page flow on the chrome-less reader route — the same
 * footing the reader has in the CMS. The SDK's viewport sizing (100dvh tall,
 * capped at 1600px and centered) does the rest; no wrapper, no positioning.
 */
function DigitalReader({ sdk, checkout, onClose }: DigitalReaderProps) {
  return (
    <SdkReader
      sdk={sdk}
      checkout={checkout}
      onClose={onClose}
      // Finishing a book ends nothing yet: neither the adapter nor the SDK's
      // library flow exposes a way to hand a loan back early, so it runs to
      // its expiry. Closing is the honest response until one of them does.
      onFinishBook={onClose}
    />
  )
}

export default DigitalReader
