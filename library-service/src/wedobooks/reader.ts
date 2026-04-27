import { unwrap, type SdkCheckout } from "./client"
import type { Checkout, LibraryServiceSdk, ReaderCallbacks } from "./types"

export interface OpenReaderOptions {
  sdk: LibraryServiceSdk
  checkout: Checkout
  element: HTMLElement
  callbacks: ReaderCallbacks
}

/** Open the e-book reader into the given element. */
export function openReader({
  sdk,
  checkout,
  element,
  callbacks,
}: OpenReaderOptions): Promise<HTMLElement> {
  return unwrap(sdk).books.openReader({
    checkout: checkout as unknown as SdkCheckout,
    element,
    callbacks,
  })
}
