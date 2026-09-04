import * as React from "react"

import type { WedoBooksReaderMaterial, WedoBooksSdk } from "./sdk"
import { useSdkMount } from "./useSdkMount"

export interface WedoBooksReaderProps {
  sdk: WedoBooksSdk
  /**
   * The entitlement to open. Only its identity is used, so a loan from the
   * adapter can be handed over without converting any dates.
   */
  checkout: WedoBooksReaderMaterial
  /** The reader's own close control was used. */
  onClose: () => void
  /**
   * The reader asked to finish the book.
   *
   * The SDK stopped ending the entitlement itself, so nothing happens unless
   * this does something. What that should be is still open: the Biblio adapter
   * exposes no endpoint for returning a loan, so a loan currently runs to its
   * expiry either way.
   */
  onFinishBook: () => void
}

/**
 * The WeDoBooks reader, mounted into a plain element.
 *
 * The SDK hangs a custom element inside the one we give it rather than
 * rendering through React, so the element is a mount point and React must not
 * touch its children afterwards. See `useSdkMount` for what that takes.
 */
export function WedoBooksReader({
  sdk,
  checkout,
  onClose,
  onFinishBook,
}: WedoBooksReaderProps): React.ReactElement {
  const elementRef = useSdkMount(
    element =>
      sdk.books.openReader({
        element,
        checkout,
        callbacks: { onClose, onFinishBookClick: onFinishBook },
      }),
    [sdk, checkout.id]
  )

  return <div ref={elementRef} className="wedobooks-reader" />
}
