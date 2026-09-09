import { WdbLibrarySdk } from "@wedobooks/sdk"
import type { Checkout, ReaderMaterialData } from "@wedobooks/sdk"

/**
 * The reader and the player, wrapped so the rest of the platform never imports
 * the SDK directly: `build.mjs` pre-bundles around Colibrio's UMD modules (see
 * there), and the SDK touches `window` on construction, so the browser guard
 * lives here once instead of in every caller.
 */

/** The SDK client the reader and the player are opened through. */
export type WedoBooksSdk = WdbLibrarySdk

/**
 * An entitlement as the SDK understands it - the record that says this user may
 * open this material. `openPlayerBar` needs all of it; `openReader` takes the
 * narrower `WedoBooksReaderMaterial`.
 */
export type WedoBooksCheckout = Checkout

/** The subset of a checkout the reader needs: no dates, only identity. */
export type WedoBooksReaderMaterial = ReaderMaterialData

/** What the SDK needs to start. Provisioned by WeDoBooks, served by the CMS. */
export interface WedoBooksSdkConfig {
  applicationId: string
  firebaseApiKey: string
  firebaseProjectId: string
  firebaseAppId: string
  readerApiKey: string
  styling?: { mode: "light" | "dark" }
}

export type WedoBooksSignInResult = { success: boolean }

const DEFAULT_STYLING_MODE = "light" as const

let cachedSdk: WdbLibrarySdk | null = null

/**
 * The SDK client, created once per page.
 *
 * Constructing it initialises Firebase, and a second instance would mean a
 * second auth session. The cache ignores `config` on purpose: the CMS serves
 * one value for the whole page.
 */
export function createWedoBooksSdk(config: WedoBooksSdkConfig): WedoBooksSdk {
  if (typeof window === "undefined") {
    throw new Error("createWedoBooksSdk() must be called in the browser.")
  }

  if (cachedSdk) {
    return cachedSdk
  }

  cachedSdk = new WdbLibrarySdk({
    applicationId: config.applicationId,
    firebaseApiKey: config.firebaseApiKey,
    firebaseProjectId: config.firebaseProjectId,
    firebaseAppId: config.firebaseAppId,
    readerApiKey: config.readerApiKey,
    styling: config.styling ?? { mode: DEFAULT_STYLING_MODE },
  })
  return cachedSdk
}

/**
 * Open the SDK's session for the patron the token was minted for.
 *
 * The token comes from the Biblio adapter, which vouches for a patron we have
 * already authenticated - so this is where our session becomes WeDoBooks'.
 *
 * Note that the SDK reports a refused sign-in as a resolved result rather than
 * a rejection, so callers must read `success` instead of relying on a throw.
 */
export async function signInWedoBooksUser(
  sdk: WedoBooksSdk,
  customToken: string
): Promise<WedoBooksSignInResult> {
  const result = await sdk.users.signIn(customToken)
  return { success: Boolean(result?.success) }
}
