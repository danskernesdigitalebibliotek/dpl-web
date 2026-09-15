import { MaterialType } from "@wedobooks/sdk"
import * as React from "react"

import type { WedoBooksSampleMaterial, WedoBooksSdk } from "./sdk"
import { useSdkMount } from "./useSdkMount"

export interface WedoBooksSamplePlayerProps {
  sdk: WedoBooksSdk
  /** Direct url of the sample MP3, from the adapter's sample endpoint. */
  sampleUrl: string
  /** What to show alongside the excerpt; the SDK looks nothing up itself. */
  material: WedoBooksSampleMaterial
  /** The player's own close control was used. */
  onClose: () => void
}

/**
 * The WeDoBooks audiobook player bar in sample mode: a taste of the audiobook
 * with no loan behind it.
 *
 * See `WedoBooksSampleReader` for why this opens from a url and therefore
 * needs no signed-in session.
 */
export function WedoBooksSamplePlayer({
  sdk,
  sampleUrl,
  material,
  onClose,
}: WedoBooksSamplePlayerProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openSamplePlayerBarFromUrl({
        element,
        sampleUrl,
        material: { ...material, material_type: MaterialType.Audiobook },
        callbacks: { onClose },
      }),
    [sdk, sampleUrl, material.material_id]
  )

  return <div ref={elementRef} className="wedobooks-player" />
}
