"use client"

import {
  useDigitalMaterial,
  useDigitalSample,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
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
 * Samples an e-book through WeDoBooks - for anyone, signed in or not. The
 * adapter answers samples for a library token and hands back the file itself,
 * which the SDK opens without a session.
 *
 * A sample has no checkout to read a material type from, so the route decides:
 * e-book samples live on the read page, audiobook samples in the player bar.
 *
 * Rendered in normal page flow — see DigitalReader.
 */
function DigitalSampleReader({ identifier, onClose }: DigitalSampleReaderProps) {
  const { data: sdk } = useReaderSdk()
  // The excerpt is the page here, so a failure has to be seen: without
  // throwOnError it renders as nothing at all, indistinguishable from still
  // loading.
  const { data: sample } = useDigitalSample(identifier, { throwOnError: true })
  // A url-opened sample bypasses WeDoBooks' catalogue entirely, so the fields
  // it shows have to come from ours.
  const { data: material } = useDigitalMaterial(identifier)

  // Nothing to render until the client, the file and its catalogue record
  // are in hand. The SDK draws its own loading state once mounted, so showing
  // one here as well would only make the wait look like two waits.
  if (!sdk || !sample || !material) return null

  return (
    <SdkSampleReader
      sdk={sdk}
      sampleUrl={sample.url}
      material={{
        material_id: material.isbn,
        title: material.title,
        author: material.authors,
      }}
      onClose={onClose}
    />
  )
}

export default DigitalSampleReader
