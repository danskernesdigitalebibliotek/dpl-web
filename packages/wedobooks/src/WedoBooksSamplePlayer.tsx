import * as React from "react"

import type { WedoBooksSdk } from "./sdk"
import { useSdkMount } from "./useSdkMount"

export interface WedoBooksSamplePlayerProps {
  sdk: WedoBooksSdk
  /** The material to sample, by the id the catalogue knows it under. */
  materialId: string
  /** The player's own close control was used. */
  onClose: () => void
}

/**
 * The WeDoBooks audiobook player bar in sample mode: a taste of the
 * audiobook with no loan behind it, so it opens from a material id rather
 * than an entitlement.
 *
 * Sampling still requires a signed-in SDK - WeDoBooks answers the sample URL
 * only for an authenticated session. Same mounting contract as
 * `WedoBooksPlayer`: the SDK owns everything inside the element once it has
 * been handed over.
 */
export function WedoBooksSamplePlayer({
  sdk,
  materialId,
  onClose,
}: WedoBooksSamplePlayerProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openSamplePlayerBar({
        element,
        materialId,
        callbacks: { onClose },
      }),
    [sdk, materialId]
  )

  return <div ref={elementRef} className="wedobooks-player" />
}
