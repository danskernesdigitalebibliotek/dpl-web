import { unwrap, type SdkCheckout } from "./client"
import type { Checkout, LibraryServiceSdk, PlayerCallbacks } from "./types"

export interface OpenPlayerBarOptions {
  sdk: LibraryServiceSdk
  checkout: Checkout
  element: HTMLElement
  callbacks: PlayerCallbacks
}

/** Open the audiobook player bar into the given element. */
export function openPlayerBar({
  sdk,
  checkout,
  element,
  callbacks,
}: OpenPlayerBarOptions): Promise<HTMLElement> {
  return unwrap(sdk).books.openPlayerBar({
    checkout: checkout as unknown as SdkCheckout,
    element,
    callbacks,
  })
}

export interface GetAudioPlayerOptions {
  sdk: LibraryServiceSdk
  audioElement: HTMLAudioElement
  checkout: Checkout
}

/** Return a configured audio player bound to the given `<audio>` element. */
export function getAudioPlayer({
  sdk,
  audioElement,
  checkout,
}: GetAudioPlayerOptions): Promise<unknown> {
  return unwrap(sdk).books.getAudioPlayer(audioElement, checkout as unknown as SdkCheckout)
}
