import * as React from "react"

import {
  reportSdkError,
  type WedoBooksCheckout,
  type WedoBooksSdk,
  type WedoBooksStopReason,
} from "./sdk"
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
  /**
   * The SDK will not show the book: it closed the player because the session
   * moved, or refused to open it and mounted nothing. Either way the page is
   * empty, and only the caller can say why.
   */
  onStop: (reason: WedoBooksStopReason) => void
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
  onStop,
}: WedoBooksPlayerProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openPlayerBar({
        element,
        checkout,
        callbacks: {
          onClose: interruption => (interruption ? onStop(interruption) : onClose()),
          onError: reportSdkError,
        },
      }),
    [sdk, checkout.id],
    onStop
  )

  return <div ref={elementRef} className="wedobooks-player" />
}
