"use client"

import dynamic from "next/dynamic"
import React from "react"

import { useReaderSdk } from "@/hooks/useReaderSdk"

// Loaded on demand - see DigitalReader.
const SdkSampleReader = dynamic(
  () =>
    import("@danskernesdigitalebibliotek/dpl-wedobooks").then(
      module => module.WedoBooksSampleReader
    ),
  { ssr: false }
)

type DigitalSampleReaderProps = {
  /** The material to sample, by the identifier the catalogue knows it under. */
  identifier: string
  onClose: () => void
}

/**
 * Samples an e-book through WeDoBooks, for a signed-in patron - WeDoBooks
 * answers sample URLs for authenticated sessions only.
 *
 * A sample has no checkout to read a material type from, so the route decides:
 * e-book samples live on the read page, audiobook samples in the player bar.
 *
 * Rendered in normal page flow — see DigitalReader.
 */
function DigitalSampleReader({ identifier, onClose }: DigitalSampleReaderProps) {
  const { data: sdk } = useReaderSdk()

  // Nothing to render until the session is in hand. The SDK draws its own
  // loading state once mounted, so showing one here as well would only make
  // the wait look like two waits.
  if (!sdk) return null

  return <SdkSampleReader sdk={sdk} materialId={identifier} onClose={onClose} />
}

export default DigitalSampleReader
