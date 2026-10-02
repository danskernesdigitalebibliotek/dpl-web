"use client"

import {
  useDigitalMaterial,
  useDigitalSample,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useSelector } from "@xstate/react"
import dynamic from "next/dynamic"
import React from "react"

import { useReaderCheckout } from "@/hooks/useReaderCheckout"
import { useReaderSdk } from "@/hooks/useReaderSdk"
import { closePlayer, playerStore } from "@/store/player.store"

// Loaded on demand - see DigitalReader.
const SdkPlayer = dynamic(
  () => import("@danskernesdigitalebibliotek/dpl-wedobooks").then(module => module.WedoBooksPlayer),
  { ssr: false }
)

const SdkSamplePlayer = dynamic(
  () =>
    import("@danskernesdigitalebibliotek/dpl-wedobooks").then(
      module => module.WedoBooksSamplePlayer
    ),
  { ssr: false }
)

function LoanPlayer({ loanId }: { loanId: string }) {
  const { sdk, checkout } = useReaderCheckout(loanId)

  // The player draws its own loading state once mounted.
  if (!sdk || !checkout) return null

  return <SdkPlayer sdk={sdk} checkout={checkout} onClose={closePlayer} />
}

// Samples open from a url rather than a material id, so the SDK needs no
// session and anyone can listen — see DigitalSampleReader.
function SamplePlayer({ materialId }: { materialId: string }) {
  const { data: sdk } = useReaderSdk()
  const { data: sample } = useDigitalSample(materialId, { throwOnError: true })
  // A url-opened sample bypasses WeDoBooks' catalogue entirely, so the fields
  // it shows have to come from ours.
  const { data: material } = useDigitalMaterial(materialId)

  if (!sdk || !sample || !material) return null

  return (
    <SdkSamplePlayer
      sdk={sdk}
      sampleUrl={sample.url}
      material={{
        material_id: material.isbn,
        title: material.title,
        author: material.authors,
      }}
      onClose={closePlayer}
    />
  )
}

/**
 * The audiobook player as WeDoBooks delivers it: a bar the SDK pins to the
 * bottom of the viewport itself, expandable to full screen, with chapters,
 * sleep timer and speed inside. GO only decides whether and what it plays,
 * through the player store.
 *
 * Mounted once in the root layout — deliberately not in DynamicModal, which
 * closes on route changes: playback must survive navigation. One playback at
 * a time; a new play replaces the current one via the store.
 */
function GlobalPlayer() {
  const { loanId, materialId } = useSelector(playerStore, state => state.context)

  if (!loanId && !materialId) return null

  return (
    // The SDK pins the bar to the viewport itself; the wrapper only supplies
    // the stacking context. z-player: above navigation and content, below
    // dialogs/drawers/sheets (see the z-index system in globals.css).
    <div className="z-player relative">
      {loanId && <LoanPlayer loanId={loanId} />}
      {materialId && <SamplePlayer materialId={materialId} />}
    </div>
  )
}

export default GlobalPlayer
