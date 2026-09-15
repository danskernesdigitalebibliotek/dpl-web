import * as React from "react"

import type { WedoBooksCheckout, WedoBooksSdk } from "./sdk"
import { useSdkMount } from "./useSdkMount"

export interface WedoBooksPlayerProps {
  sdk: WedoBooksSdk
  /**
   * The entitlement to play. The player needs the whole record, not just its
   * identity the way the reader does.
   */
  checkout: WedoBooksCheckout
  /** The player's own close control was used. */
  onClose: () => void
}

/**
 * The WeDoBooks audiobook player bar, mounted into a plain element.
 *
 * Same mounting contract as `WedoBooksReader`: the SDK owns everything inside
 * the element once it has been handed over.
 *
 * No finish-book callback is passed on. The SDK only prompts the listener to
 * finish when one is given, and there is nothing to answer with while a loan
 * cannot be handed back early - so the player closes without asking.
 */
export function WedoBooksPlayer({
  sdk,
  checkout,
  onClose,
}: WedoBooksPlayerProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openPlayerBar({ element, checkout, callbacks: { onClose } }),
    [sdk, checkout.id]
  )

  return <div ref={elementRef} className="wedobooks-player" />
}
