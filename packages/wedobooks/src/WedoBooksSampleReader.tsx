import * as React from "react"

import type { WedoBooksSdk } from "./sdk"
import { useSdkMount } from "./useSdkMount"

export interface WedoBooksSampleReaderProps {
  sdk: WedoBooksSdk
  /** The material to sample, by the id the catalogue knows it under. */
  materialId: string
  /** The reader's own close control was used. */
  onClose: () => void
}

/**
 * The WeDoBooks reader in sample mode: a taste of the e-book with no loan
 * behind it, so it opens from a material id rather than an entitlement.
 *
 * Sampling still requires a signed-in SDK - WeDoBooks answers the sample URL
 * only for an authenticated session. Same mounting contract as
 * `WedoBooksReader`: the SDK owns everything inside the element once it has
 * been handed over.
 */
export function WedoBooksSampleReader({
  sdk,
  materialId,
  onClose,
}: WedoBooksSampleReaderProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openSampleReader({
        element,
        materialId,
        callbacks: { onClose },
      }),
    [sdk, materialId]
  )

  return <div ref={elementRef} className="wedobooks-reader" />
}
