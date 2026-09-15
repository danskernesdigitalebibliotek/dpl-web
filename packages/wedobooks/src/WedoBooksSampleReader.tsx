import { MaterialType } from "@wedobooks/sdk"
import * as React from "react"

import type { WedoBooksSampleMaterial, WedoBooksSdk } from "./sdk"
import { useSdkMount } from "./useSdkMount"

export interface WedoBooksSampleReaderProps {
  sdk: WedoBooksSdk
  /** Direct url of the sample EPUB, from the adapter's sample endpoint. */
  sampleUrl: string
  /** What to show alongside the excerpt; the SDK looks nothing up itself. */
  material: WedoBooksSampleMaterial
  /** The reader's own close control was used. */
  onClose: () => void
}

/**
 * The WeDoBooks reader in sample mode: a taste of the e-book with no loan
 * behind it.
 *
 * Opened from the file rather than from a material id, and that is what makes
 * it work for a visitor who is not signed in: the url-based sample functions
 * never call WeDoBooks' backend, so the SDK needs no session. Which is why the
 * caller supplies the material's own fields - there is no lookup to get them
 * from.
 *
 * Same mounting contract as `WedoBooksReader`: the SDK owns everything inside
 * the element once it has been handed over.
 */
export function WedoBooksSampleReader({
  sdk,
  sampleUrl,
  material,
  onClose,
}: WedoBooksSampleReaderProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openSampleReaderFromUrl({
        element,
        sampleUrl,
        // The SDK requires the type to match the mount target, so the
        // component that is the e-book target states it rather than trusting
        // a caller to pair them correctly.
        material: { ...material, material_type: MaterialType.EBook },
        callbacks: { onClose },
      }),
    [sdk, sampleUrl, material.material_id]
  )

  return <div ref={elementRef} className="wedobooks-reader" />
}
