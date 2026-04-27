import { WdbLibrarySdk } from "@wedobooks/sdk"
import type { LibraryServiceConfig, LibraryServiceSdk } from "./types"

const DEFAULT_STYLING_MODE = "light" as const

let sdkInstance: WdbLibrarySdk | null = null
let instanceConfigKey: string | null = null

function configKey(config: LibraryServiceConfig): string {
  return JSON.stringify([
    config.applicationId,
    config.firebaseApiKey,
    config.firebaseProjectId,
    config.firebaseAppId,
    config.readerApiKey,
    config.styling?.mode ?? DEFAULT_STYLING_MODE,
  ])
}

/**
 * Create (or return the cached) SDK instance for a given config.
 *
 * Must be called in the browser — the underlying SDK touches the DOM and
 * Firebase and will fail on the server.
 */
export function createLibraryService(config: LibraryServiceConfig): LibraryServiceSdk {
  if (typeof window === "undefined") {
    throw new Error(
      "library-service/wedobooks: createLibraryService() must be called in the browser."
    )
  }

  const key = configKey(config)
  if (sdkInstance && instanceConfigKey === key) {
    return sdkInstance as unknown as LibraryServiceSdk
  }

  sdkInstance = new WdbLibrarySdk({
    applicationId: config.applicationId,
    firebaseApiKey: config.firebaseApiKey,
    firebaseProjectId: config.firebaseProjectId,
    firebaseAppId: config.firebaseAppId,
    readerApiKey: config.readerApiKey,
    styling: config.styling ?? { mode: DEFAULT_STYLING_MODE },
  })
  instanceConfigKey = key
  return sdkInstance as unknown as LibraryServiceSdk
}

/**
 * Internal: reverse the opaque `LibraryServiceSdk` brand back into the real
 * `WdbLibrarySdk` instance. Kept non-exported from the package root so the
 * SDK class stays encapsulated behind our wrapper functions.
 */
export function unwrap(sdk: LibraryServiceSdk): WdbLibrarySdk {
  return sdk as unknown as WdbLibrarySdk
}

/** Internal SDK checkout shape, shared by the reader and player wrappers. */
export type SdkCheckout = Parameters<WdbLibrarySdk["books"]["openReader"]>[0]["checkout"]
